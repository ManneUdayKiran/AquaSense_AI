import React from 'react';
import { 
  Waves, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  ClipboardCheck, 
  PlusCircle, 
  FileSearch, 
  BrainCircuit, 
  CheckCircle2, 
  UserCheck, 
  History,
  Activity,
  Layers,
  MapPin,
  ExternalLink
} from 'lucide-react';

const EIGHT_STEPS = [
  { num: 1, title: "1. Observation", desc: "Citizen submits field photograph, GPS coordinates, and structured macroscopic indicators.", icon: PlusCircle },
  { num: 2, title: "2. AI Analysis", desc: "Multimodal vision engine extracts only verifiable visible surface signals.", icon: Sparkles },
  { num: 3, title: "3. Knowledge Retrieval", desc: "RAG engine searches authoritative OneAquaHealth indicator protocols and guidance.", icon: FileSearch },
  { num: 4, title: "4. Assessment", desc: "Synthesizes evidence into structured severity, category, and triage recommendations.", icon: BrainCircuit },
  { num: 5, title: "5. Validation", desc: "Deterministic rule engine detects contradictions and blocks unsupported laboratory claims.", icon: ShieldCheck },
  { num: 6, title: "6. Explanation", desc: "Evidence attribution, limits of visual analysis, and uncertainty bounds are prepared.", icon: Layers },
  { num: 7, title: "7. Human Review", desc: "Certified Limnologist audits recommendations and inspects validation flags.", icon: UserCheck },
  { num: 8, title: "8. Final Decision", desc: "Human specialist approves, modifies, or rejects; stamped into immutable audit trail.", icon: CheckCircle2 }
];

export default function LandingPage({ onNavigate }) {
  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '30px 24px' }} className="animate-fade-in">
      
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '50px 20px 40px 20px',
        position: 'relative'
      }}>
        {/* Track Badge */}
        {/* <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'var(--aqua-400)',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '20px'
        }}>
          
        </div> */}

        {/* Title & Subtitle */}
        <h1 style={{
          fontSize: '3.4rem',
          fontFamily: 'Outfit',
          fontWeight: 800,
          lineHeight: 1.15,
          color: '#ffffff',
          marginBottom: '16px',
          letterSpacing: '-0.03em'
        }}>
          AquaSense <span style={{ color: 'var(--aqua-400)' }}>AI</span>
        </h1>

        <p style={{
          fontSize: '1.4rem',
          color: 'var(--aqua-200)',
          fontWeight: 600,
          maxWidth: '780px',
          margin: '0 auto 12px auto'
        }}>
          Explainable AI-Assisted Freshwater Ecosystem Assessment
        </p>

        <p style={{
          fontSize: '1.05rem',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 28px auto',
          lineHeight: 1.55
        }}>
          Turn citizen observations into evidence-based assessment recommendations. Built on rigorous scientific grounding, deterministic validation guardrails, and human-in-the-loop governance.
        </p>

        {/* Core Principle Banner */}
        <div style={{
          maxWidth: '820px',
          margin: '0 auto 36px auto',
          padding: '16px 24px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          boxShadow: '0 0 30px rgba(6, 182, 212, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#ffffff'
        }}>
          <span>AI recommends</span>
          <span style={{ color: 'var(--aqua-400)' }}>•</span>
          <span style={{ color: '#34d399' }}>Evidence supports</span>
          <span style={{ color: '#34d399' }}>•</span>
          <span style={{ color: '#fbbf24' }}>Validation checks</span>
          <span style={{ color: '#fbbf24' }}>•</span>
          <span style={{ color: '#818cf8' }}>Humans decide</span>
        </div>

        {/* Primary & Secondary Call to Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('submit')}
            className="btn btn-primary"
            style={{
              padding: '14px 30px',
              fontSize: '1rem',
              borderRadius: '12px',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.45)'
            }}
          >
            <PlusCircle size={18} />
            <span>Report an Observation</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => onNavigate('queue')}
            className="btn btn-secondary"
            style={{
              padding: '14px 30px',
              fontSize: '1rem',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.12)',
              borderColor: 'rgba(99, 102, 241, 0.4)',
              color: '#c7d2fe'
            }}
          >
            <ClipboardCheck size={18} color="#818cf8" />
            <span>Reviewer Dashboard</span>
          </button>
        </div>
      </section>

      {/* Visual 8-Step Process Section */}
      <section style={{ marginTop: '30px', marginBottom: '50px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="badge badge-low" style={{ marginBottom: '8px' }}>Scientific Lifecycle</span>
          <h2 style={{ fontSize: '2rem', color: '#ffffff' }}>The 8-Step Assessment Pipeline</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
            From community field capture to certified regulatory sign-off, every stage is transparent, grounded, and audited.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px'
        }}>
          {EIGHT_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  borderTop: step.num >= 7 ? '3px solid #818cf8' : '3px solid var(--aqua-500)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: step.num >= 7 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(6, 182, 212, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: step.num >= 7 ? '#818cf8' : 'var(--aqua-400)'
                  }}>
                    <Icon size={20} />
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--text-muted)'
                  }}>
                    STAGE 0{step.num}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '6px' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--aqua-400)' }}>
            <Sparkles size={20} />
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Observable-Only Multimodal Vision</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Strictly prevents hallucinations. The vision model identifies visible films, foam, turbidity, and litter without ever fabricating invisible chemical concentrations or bacterial pathogens.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#34d399' }}>
            <ShieldCheck size={20} />
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Deterministic Rule Guardrails</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Automated validation cross-references citizen survey responses with AI interpretations to detect contradictions, enforce evidence thresholds, and flag mandatory specialist review.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#818cf8' }}>
            <UserCheck size={20} />
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Immutable Audit Trail</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            AI recommendations and certified human reviewer decisions are stored separately. Every approval, modification, and rationale note is cryptographically logged for municipal accountability.
          </p>
        </div>
      </section>

    </div>
  );
}
