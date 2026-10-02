import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  FileSearch, 
  BrainCircuit, 
  Layers, 
  Camera, 
  HelpCircle 
} from 'lucide-react';

const TIMELINE_STEPS = [
  {
    id: 1,
    title: "1. Input Validation",
    description: "Checking observation completeness, coordinates, and structured questionnaire parameters.",
    icon: CheckCircle2,
    durationMs: 700
  },
  {
    id: 2,
    title: "2. Image Analysis",
    description: "Extracting visible macroscopic evidence (color channels, surface films, turbidity). Enforcing observable-only claims.",
    icon: Camera,
    durationMs: 900
  },
  {
    id: 3,
    title: "3. Knowledge Retrieval",
    description: "Querying OneAquaHealth vector index for relevant ecological indicator protocols and threshold guidance.",
    icon: FileSearch,
    durationMs: 800
  },
  {
    id: 4,
    title: "4. Assessment Generation",
    description: "Synthesizing citizen description, photo evidence, and OneAquaHealth guidance into structured recommendation.",
    icon: BrainCircuit,
    durationMs: 1000
  },
  {
    id: 5,
    title: "5. Scientific Validation Shield",
    description: "Executing deterministic rule engine to detect contradictions and block unsupported invisible lab assertions.",
    icon: ShieldCheck,
    durationMs: 800
  },
  {
    id: 6,
    title: "6. Explainability & Uncertainty",
    description: "Preparing evidence attribution, bounding limits of visual telemetry, and assembling audit trail.",
    icon: Layers,
    durationMs: 700
  }
];

export default function ProcessingTimeline({ onComplete, observationData }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    let timeoutId;
    
    if (currentStepIdx < TIMELINE_STEPS.length) {
      const step = TIMELINE_STEPS[currentStepIdx];
      timeoutId = setTimeout(() => {
        setCompletedSteps(prev => [...prev, step.id]);
        setCurrentStepIdx(prev => prev + 1);
      }, step.durationMs);
    } else {
      // All steps finished
      timeoutId = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 600);
    }

    return () => clearTimeout(timeoutId);
  }, [currentStepIdx, onComplete]);

  const progressPct = Math.round((completedSteps.length / TIMELINE_STEPS.length) * 100);

  return (
    <div style={{
      maxWidth: '780px',
      margin: '40px auto',
      padding: '32px',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: '1px solid rgba(6, 182, 212, 0.25)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
    }} className="animate-fade-in">
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'var(--aqua-400)',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <Sparkles size={15} />
          <span>ONEAQUAHEALTH TRACK 3 PIPELINE</span>
        </div>
        <h2 style={{ fontSize: '1.85rem', marginBottom: '8px', color: '#ffffff' }}>
          AI Multimodal Assessment in Progress
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
          Validating observation completeness, extracting visible signals, retrieving scientific guidance, and evaluating rule engine shields.
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Pipeline Execution Progress</span>
          <span style={{ color: 'var(--aqua-400)', fontWeight: 700 }}>{progressPct}% Completed</span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
            transition: 'width 0.4s ease',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.6)'
          }} />
        </div>
      </div>

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {TIMELINE_STEPS.map((step, idx) => {
          const isDone = completedSteps.includes(step.id);
          const isCurrent = currentStepIdx === idx;
          const isPending = currentStepIdx < idx;

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '14px 18px',
                borderRadius: '12px',
                background: isCurrent 
                  ? 'rgba(6, 182, 212, 0.08)' 
                  : isDone 
                  ? 'rgba(16, 185, 129, 0.04)' 
                  : 'rgba(255, 255, 255, 0.02)',
                border: isCurrent 
                  ? '1px solid rgba(6, 182, 212, 0.4)' 
                  : isDone 
                  ? '1px solid rgba(16, 185, 129, 0.25)' 
                  : '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Step Status Icon */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
                background: isDone 
                  ? 'rgba(16, 185, 129, 0.2)' 
                  : isCurrent 
                  ? 'rgba(6, 182, 212, 0.2)' 
                  : 'rgba(255, 255, 255, 0.05)',
                color: isDone 
                  ? '#34d399' 
                  : isCurrent 
                  ? 'var(--aqua-400)' 
                  : 'var(--text-muted)'
              }}>
                {isDone ? (
                  <CheckCircle2 size={18} />
                ) : isCurrent ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Clock size={16} />
                )}
              </div>

              {/* Step Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: isDone ? '#ffffff' : isCurrent ? 'var(--aqua-300)' : 'var(--text-secondary)'
                  }}>
                    {step.title}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: isDone 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : isCurrent 
                      ? 'rgba(6, 182, 212, 0.15)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isDone 
                      ? '#34d399' 
                      : isCurrent 
                      ? 'var(--aqua-400)' 
                      : 'var(--text-muted)'
                  }}>
                    {isDone ? 'VERIFIED' : isCurrent ? 'PROCESSING...' : 'PENDING'}
                  </span>
                </div>
                <p style={{
                  fontSize: '0.8rem',
                  color: isCurrent ? 'var(--text-secondary)' : 'var(--text-muted)',
                  margin: 0,
                  lineHeight: 1.4
                }}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsible AI Disclaimer Banner */}
      <div style={{
        marginTop: '24px',
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)'
      }}>
        <ShieldCheck size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
        <span>
          <strong>Responsible AI Principle:</strong> "AI recommends. Evidence supports. Validation checks. Humans decide." AI recommendations are provisional triage guidance and require specialist review.
        </span>
      </div>

    </div>
  );
}
