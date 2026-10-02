import os
import re
import json
import base64
import logging
from typing import Optional, Dict, Any, List
from pathlib import Path
from PIL import Image

from app.core.config import settings
from app.models.schemas import CitizenObservationCreate, AIAssessment
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)

class MultimodalAIService:
    """
    Multimodal AI Assessment Service.
    Integrates Groq LLMs (primary high-capacity model & fast secondary fallback)
    with a deterministic scientific validation engine grounded in OneAquaHealth protocols.
    """

    def _analyze_image_features(self, image_path: Optional[Path]) -> Dict[str, Any]:
        """Extract basic visual features from local image file."""
        if not image_path or not image_path.exists():
            return {"has_image": False}

        try:
            with Image.open(image_path) as img:
                width, height = img.size
                format_name = img.format
                rgb_img = img.convert("RGB")
                # Calculate mean RGB channels
                colors = rgb_img.resize((32, 32)).getdata()
                r_avg = sum(c[0] for c in colors) / len(colors)
                g_avg = sum(c[1] for c in colors) / len(colors)
                b_avg = sum(c[2] for c in colors) / len(colors)

                # Heuristics for visual cues
                green_dominance = g_avg > (r_avg + 15) and g_avg > (b_avg + 15)
                brown_turbid = r_avg > 90 and g_avg > 70 and b_avg < 60
                high_brightness = (r_avg + g_avg + b_avg) / 3 > 185
                dark_anoxic = (r_avg + g_avg + b_avg) / 3 < 60

                return {
                    "has_image": True,
                    "width": width,
                    "height": height,
                    "format": format_name,
                    "green_dominance": green_dominance,
                    "brown_turbid": brown_turbid,
                    "high_brightness": high_brightness,
                    "dark_anoxic": dark_anoxic,
                    "r": round(r_avg, 1),
                    "g": round(g_avg, 1),
                    "b": round(b_avg, 1)
                }
        except Exception as e:
            logger.warning(f"Error analyzing image {image_path}: {e}")
            return {"has_image": False, "error": str(e)}

    def assess_observation(self, observation: CitizenObservationCreate) -> AIAssessment:
        """
        Generate structured assessment from citizen description, guided fields, and photo.
        Grounded in OneAquaHealth documents retrieved via RAG.
        """
        # 1. Retrieve OneAquaHealth knowledge
        query = f"{observation.location_name} {observation.description} {observation.guided_answers.water_clarity} {observation.guided_answers.surface_appearance}"
        relevant_docs = rag_service.search(query, top_k=2)
        citations = [f"{d['title']} ({d['source_document']})" for d in relevant_docs]

        # 2. Check for local image file
        image_path = None
        if observation.photo_filename:
            candidate = settings.UPLOAD_DIR / observation.photo_filename
            if candidate.exists():
                image_path = candidate

        img_features = self._analyze_image_features(image_path)

        # 3. If external Groq API is available, try primary model then fast/secondary model
        if settings.GROQ_API_KEY:
            # Primary model attempt
            primary_model = settings.GROQ_MODEL
            try:
                assessment = self._call_groq_vision(observation, image_path, relevant_docs, citations, model=primary_model)
                if assessment:
                    return assessment
            except Exception as e:
                logger.error(f"Groq primary model ({primary_model}) failed: {e}. Trying secondary model.")

            # Secondary / fast model fallback
            secondary_model = getattr(settings, "GROQ_FAST_MODEL", None) or getattr(settings, "GEMINI_MODEL", None)
            if secondary_model and secondary_model != primary_model:
                try:
                    logger.info(f"Invoking secondary Groq model: {secondary_model}")
                    assessment = self._call_groq_vision(observation, image_path, relevant_docs, citations, model=secondary_model)
                    if assessment:
                        return assessment
                except Exception as e:
                    logger.error(f"Groq secondary model ({secondary_model}) failed: {e}.")

        # 4. Deterministic Grounded Perception Engine (Standard & Reliable Hackathon Mode)
        return self._generate_grounded_assessment(observation, img_features, relevant_docs, citations)

    def _call_groq_vision(
        self,
        obs: CitizenObservationCreate,
        image_path: Optional[Path],
        docs: List[Dict[str, Any]],
        citations: List[str],
        model: Optional[str] = None
    ) -> Optional[AIAssessment]:
        """Call Groq API with multimodal context and strict JSON schema."""
        import requests

        active_model = model or settings.GROQ_MODEL

        doc_summary = "\n".join([f"- {d['title']}: {d['content'][:250]}..." for d in docs])
        prompt = f"""
You are AquaSense AI, an expert aquatic ecosystem diagnostic assistant.
Analyze this citizen report of an urban water body according to OneAquaHealth protocols.

Citizen Description: "{obs.description}"
Location: {obs.location_name}
Guided Answers:
- Water Clarity: {obs.guided_answers.water_clarity}
- Surface Appearance: {obs.guided_answers.surface_appearance}
- Water Odor: {obs.guided_answers.water_odor}
- Water Flow: {obs.guided_answers.water_flow}
- Bank Condition: {obs.guided_answers.bank_condition}

Relevant OneAquaHealth Guidance:
{doc_summary}

RULES:
1. Extract VISIBLE macroscopic evidence only (foam, trash, color, scum, bank erosion).
2. NEVER claim laboratory chemistry (NO pH values, NO dissolved oxygen ppm, NO E. coli counts, NO heavy metals).
3. Return ONLY valid JSON matching this schema:
{{
  "category": "water_quality" | "macroinvertebrate_habitat" | "plastic_debris" | "algal_bloom" | "illegal_discharge" | "bank_erosion" | "normal_baseline",
  "severity": "low" | "moderate" | "high" | "critical",
  "confidence": float between 0.50 and 0.95,
  "observed_signals": ["string"],
  "evidence": ["string"],
  "missing_information": ["string"],
  "uncertainty": ["string"],
  "recommendation": "string"
}}
"""
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": active_model,
            "messages": [
                {"role": "system", "content": "You are a scientific water quality assistant adhering to OneAquaHealth protocols."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=20)
        if resp.status_code == 200:
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            parsed["sources"] = citations
            return AIAssessment(**parsed)
        logger.warning(f"Groq API ({active_model}) returned status {resp.status_code}: {resp.text}")
        return None

    def _generate_grounded_assessment(
        self,
        obs: CitizenObservationCreate,
        img: Dict[str, Any],
        docs: List[Dict[str, Any]],
        citations: List[str]
    ) -> AIAssessment:
        """
        Expert scientific logic engine strictly grounded in OneAquaHealth indicators.
        Analyzes multi-factor inputs (text, visual cues, structured fields).
        """
        desc = obs.description.lower()
        guided = obs.guided_answers

        observed_signals: List[str] = []
        evidence: List[str] = []
        missing_info: List[str] = [
            "Laboratory chemical assay (pH, dissolved oxygen, nutrients)",
            "Accredited microbial pathogen testing (E. coli / Enterococci)"
        ]
        uncertainties: List[str] = [
            "Photographic and visual observation cannot verify invisible chemical toxicity or dissolved contaminants.",
            "Water surface optical reflections may partially obscure benthic substrate condition."
        ]

        # 1. Evaluate surface appearance and debris
        category = "water_quality"
        severity = "moderate"
        confidence = 0.78

        # Foam & Surfactants
        if guided.surface_appearance == "dense_foam" or "foam" in desc or "froth" in desc or "soapy" in desc:
            category = "water_quality"
            observed_signals.append("dense_white_foam_accumulation")
            evidence.append(f"Citizen reported: {obs.description[:90]}...")
            evidence.append(f"Guided survey: Surface appearance set to '{guided.surface_appearance}'.")
            if guided.water_odor in ["chemical_petroleum", "sewage_foul"]:
                severity = "high"
                confidence = 0.88
                observed_signals.append("detergent_or_chemical_odor")
                evidence.append(f"Distinctive odor noted: '{guided.water_odor}'.")
            else:
                severity = "moderate"
                confidence = 0.82

        # Algal Bloom / Green Scum
        elif guided.surface_appearance == "green_algal_film" or "algae" in desc or "green scum" in desc or img.get("green_dominance"):
            category = "algal_bloom"
            observed_signals.append("green_surface_scum_or_filamentous_film")
            evidence.append("Visual evidence of extensive green microalgae/cyanobacterial surface covering.")
            evidence.append(f"Citizen description cites algal manifestation: '{obs.description[:80]}'.")
            if guided.water_flow == "stagnant":
                observed_signals.append("stagnant_warm_flow_conditions")
                evidence.append("Stagnant water velocity accelerating eutrophication risk.")
                severity = "high"
                confidence = 0.85
            else:
                severity = "moderate"
                confidence = 0.80

        # Plastic Debris
        elif guided.surface_appearance == "floating_trash" or "plastic" in desc or "bottles" in desc or "garbage" in desc:
            category = "plastic_debris"
            observed_signals.append("floating_macroplastic_and_solid_waste")
            evidence.append(f"Macroplastic debris reported in waterway: '{obs.description[:80]}'.")
            evidence.append(f"Surface appearance classified as '{guided.surface_appearance}'.")
            if "blocked" in desc or "culvert" in desc or "dam" in desc:
                severity = "high"
                observed_signals.append("culvert_hydraulic_choke_risk")
                confidence = 0.87
            else:
                severity = "moderate"
                confidence = 0.83

        # Oily Sheen / Petroleum / Illicit Outfall
        elif guided.surface_appearance == "oily_sheen" or "oil" in desc or "petroleum" in desc or "rainbow" in desc or "pipe" in desc:
            category = "illegal_discharge"
            observed_signals.append("surface_iridescence_or_rainbow_film")
            evidence.append(f"Hydrocarbon sheen reported by observer: '{obs.description[:80]}'.")
            if guided.water_odor in ["chemical_petroleum", "sewage_foul"]:
                observed_signals.append("petroleum_chemical_odor_profile")
                severity = "high"
                confidence = 0.89
            else:
                severity = "moderate"
                confidence = 0.80

        # Severe Turbidity or Construction Runoff
        elif guided.water_clarity in ["opaque_muddy", "discolored_black_green"] or img.get("brown_turbid") or img.get("dark_anoxic"):
            category = "water_quality"
            observed_signals.append("elevated_turbidity_suspended_sediments")
            evidence.append(f"Water clarity classified as '{guided.water_clarity}'.")
            if guided.water_clarity == "discolored_black_green" or guided.water_odor == "sewage_foul":
                observed_signals.append("anoxic_black_water_sulfide_signs")
                severity = "critical"
                confidence = 0.90
            else:
                severity = "high"
                confidence = 0.84

        # Bank Erosion & Habitat
        elif guided.bank_condition in ["severe_erosion", "partially_eroded"] or "erosion" in desc or "collapse" in desc:
            category = "bank_erosion"
            observed_signals.append("riparian_bank_undercutting_and_soil_scarring")
            evidence.append(f"Riparian bank condition reported as '{guided.bank_condition}'.")
            severity = "high" if guided.bank_condition == "severe_erosion" else "moderate"
            confidence = 0.81

        # Pristine / Baseline
        elif guided.water_clarity == "crystal_clear" and guided.water_odor == "none" and guided.surface_appearance == "clear":
            category = "normal_baseline"
            severity = "low"
            confidence = 0.92
            observed_signals.append("clear_water_column_and_healthy_riparian_baseline")
            evidence.append("Crystal clear water clarity with no observable surface scum or abnormal odor.")
            evidence.append(f"Observer reports stable natural conditions at {obs.location_name}.")

        # Image analysis signal additions
        if img.get("has_image"):
            evidence.append(f"Uploaded photograph analyzed ({img.get('width', 0)}x{img.get('height', 0)} {img.get('format', 'IMG')}).")
            if img.get("high_brightness"):
                observed_signals.append("high_surface_reflectance_or_froth")
            if img.get("green_dominance") and "green_surface_scum_or_filamentous_film" not in observed_signals:
                observed_signals.append("chlorophyll_green_chromatic_signal")
        else:
            uncertainties.append("Visual confirmation limited: Observation submitted without photograph.")
            confidence = max(0.50, round(confidence - 0.12, 2))

        # Build recommendation based on OneAquaHealth protocol
        if severity == "critical":
            recommendation = "URGENT MUNICIPAL ACTION REQUIRED: Dispatch rapid illicit discharge inspection team and notify catchment authorities immediately."
        elif severity == "high":
            recommendation = "HUMAN SPECIALIST VERIFICATION RECOMMENDED: Dispatch field technician within 24-48 hours for grab sampling and upstream source tracing."
        elif severity == "moderate":
            recommendation = "ROUTINE REVIEW RECOMMENDED: Validate citizen observation against municipal water quality baseline and schedule regular monitoring."
        else:
            recommendation = "LOGGED AS BASELINE: Observation meets healthy ecological criteria; no emergency intervention required."

        return AIAssessment(
            category=category,
            severity=severity,
            confidence=round(confidence, 2),
            observed_signals=observed_signals,
            evidence=evidence,
            missing_information=missing_info,
            uncertainty=uncertainties,
            recommendation=recommendation,
            sources=citations
        )

ai_service = MultimodalAIService()
