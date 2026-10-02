import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Edit3, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  BookOpen, 
  History, 
  MapPin, 
  User, 
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ZoomIn,
  Clock,
  Layers,
  UserCheck,
  Lock,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { api, resolvePhotoUrl } from '../services/api';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function AssessmentWorkspace({ 
  observation, 
  userRole = 'reviewer', 
  onRoleChange, 
  onBack, 
  onUpdateObservation 
}) {
  const [decisionMode, setDecisionMode] = useState('approve'); // 'approve' | 'modify' | 'reject'
  const [reviewerName, setReviewerName] = useState("Dr. Claire Dubois");
  const [reviewerRole, setReviewerRole] = useState("Catchment Specialist (ID: rev-specialist-04)");
  const [finalCategory, setFinalCategory] = useState(observation.ai_assessment?.category || 'water_quality');
  const [finalSeverity, setFinalSeverity] = useState(observation.ai_assessment?.severity || 'moderate');
  const [decisionNotes, setDecisionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [zoomImage, setZoomImage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteObservation = async () => {
    setIsDeleting(true);
    try {
      await api.deleteObservation(observation.id);
      if (onBack) {
        onBack();
      }
    } catch (err) {
      console.error("Failed to delete observation:", err);
      alert("Failed to delete observation. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const ai = observation.ai_assessment;
  const val = observation.validation_result;
  const input = observation.citizen_input;
  const human = observation.human_review;
  const audit = observation.audit_trail || [];

  const handleCommitDecision = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if ((decisionMode === 'modify' || decisionMode === 'reject') && (!decisionNotes || decisionNotes.trim().length < 5)) {
      setErrorMsg("A detailed justification note is mandatory when modifying or rejecting an AI recommendation.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        reviewer_id: "rev-user-id",
        reviewer_name: `${reviewerName} (${reviewerRole})`,
        decision: decisionMode === 'approve' ? 'approved' : decisionMode === 'modify' ? 'modified' : 'rejected',
        final_category: decisionMode === 'approve' ? (ai?.category || 'water_quality') : finalCategory,
        final_severity: decisionMode === 'approve' ? (ai?.severity || 'moderate') : finalSeverity,
        decision_notes: decisionNotes || "Approved AI recommendation based on photographic evidence and OneAquaHealth protocols."
      };

      const updated = await api.submitReviewDecision(observation.id, payload);
      setSuccessMsg("Decision committed to immutable audit trail successfully!");
      if (onUpdateObservation) {
        onUpdateObservation(updated);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to commit decision. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'critical': return 'badge badge-critical';
      case 'high': return 'badge badge-high';
      case 'moderate': return 'badge badge-moderate';
      case 'low': return 'badge badge-low';
      default: return 'badge';
    }
  };

  return (
    <div style={{ maxWidth: '1540px', margin: '20px auto', padding: '0 24px' }} className="animate-fade-in">
      {/* Top Breadcrumb & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <button 
          onClick={onBack} 
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem', padding: '6px 14px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Observation Queue</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {observation.id}</span>
          <span className="badge badge-moderate">{observation.status.replace('_', ' ')}</span>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-secondary"
            style={{
              fontSize: '0.82rem',
              padding: '6px 12px',
              color: '#fb7185',
              borderColor: 'rgba(244, 63, 94, 0.35)',
              background: 'rgba(244, 63, 94, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Delete this observation"
          >
            <Trash2 size={14} />
            <span>Delete Observation</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Diagnostic Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(420px, 1.35fr) minmax(340px, 1.1fr)',
        gap: '24px',
        alignItems: 'start'
      }}>

        {/* ======================================================== */}
        {/* COLUMN 1: Citizen Submission & Grounding Data */}
        {/* ======================================================== */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--aqua-400)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              <User size={13} />
              <span>Citizen Observation Record</span>
            </div>
            <h2 style={{ fontSize: '1.4rem' }}>{input.location_name}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Submitted by <strong>{input.observer_name}</strong> • {new Date(observation.created_at).toLocaleString()}
            </p>
          </div>

          {/* Photo Display with Zoom capability */}
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#0a0f1d' }}>
            {input.photo_url ? (
              <>
                <img 
                  src={resolvePhotoUrl(input.photo_url)} 
                  alt="Observation photographic evidence"
                  style={{
                    width: '100%',
                    maxHeight: zoomImage ? '500px' : '260px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setZoomImage(!zoomImage)}
                />
                <button
                  onClick={() => setZoomImage(!zoomImage)}
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ZoomIn size={12} />
                  <span>{zoomImage ? 'Fit View' : 'Inspect Photo'}</span>
                </button>
              </>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No photograph attached to observation.</p>
              </div>
            )}
          </div>

          {/* Citizen Narrative Description */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Observer Description
            </span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{input.description}"
            </p>
          </div>

          {/* Guided Survey Parameters */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              Guided Physical Attributes
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Clarity</span>
                <span style={{ fontWeight: 600, color: 'var(--aqua-400)' }}>
                  {input.guided_answers.water_clarity.replace('_', ' ')}
                </span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Surface Appearance</span>
                <span style={{ fontWeight: 600, color: 'var(--aqua-400)' }}>
                  {input.guided_answers.surface_appearance.replace('_', ' ')}
                </span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Odor</span>
                <span style={{ fontWeight: 600, color: 'var(--aqua-400)' }}>
                  {input.guided_answers.water_odor.replace('_', ' ')}
                </span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Flow Velocity</span>
                <span style={{ fontWeight: 600, color: 'var(--aqua-400)' }}>
                  {input.guided_answers.water_flow.replace('_', ' ')}
                </span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Bank Integrity</span>
                <span style={{ fontWeight: 600, color: 'var(--aqua-400)' }}>
                  {input.guided_answers.bank_condition.replace('_', ' ')}
                </span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Land Use</span>
                <span style={{ fontWeight: 600, color: 'var(--aqua-400)' }}>
                  {input.guided_answers.surrounding_land_use.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={13} color="var(--aqua-400)" />
            <span>GPS: {input.coordinates.latitude.toFixed(4)}, {input.coordinates.longitude.toFixed(4)}</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 2: Multimodal AI Perception & Scientific Validation */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* AI Structured Recommendation Card */}
          <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid var(--aqua-500)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--aqua-400)" />
                <h3 style={{ fontSize: '1.2rem' }}>AI Structured Assessment</h3>
              </div>
              {ai && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={getSeverityBadgeClass(ai.severity)}>
                    {ai.severity}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.08)'
                  }}>
                    {Math.round(ai.confidence * 100)}% Conf
                  </span>
                </div>
              )}
            </div>

            {ai ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Category & Action Recommendation */}
                <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-accent)' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--aqua-400)' }}>
                    Diagnosed Ecological Category: {ai.category.toUpperCase().replace('_', ' ')}
                  </span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}>
                    {ai.recommendation}
                  </p>
                </div>

                {/* Visible Macroscopic Signals */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Extracted Visible Macroscopic Signals
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {ai.observed_signals.map((sig, i) => (
                      <span key={i} style={{
                        fontSize: '0.75rem',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--aqua-400)'
                      }}>
                        • {sig.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Supporting Evidence List */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Factual Supporting Evidence
                  </span>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {ai.evidence.map((ev, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{ev}</li>
                    ))}
                  </ul>
                </div>

                {/* Scientific Boundaries & Photographic Limits */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: 'var(--amber-500)', fontWeight: 600 }}>
                    <Info size={14} />
                    <span>Scientific Photographic Limitations</span>
                  </div>
                  {ai.uncertainty.map((un, i) => (
                    <p key={i} style={{ margin: '2px 0' }}>• {un}</p>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No AI assessment available.</p>
            )}
          </div>

          {/* Deterministic Validation Engine Results */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldCheck size={20} color={val?.passed ? '#34d399' : '#fb7185'} />
              <h3 style={{ fontSize: '1.2rem' }}>Deterministic Scientific Validation Engine</h3>
            </div>

            {val ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Status Alert Banner */}
                {val.contradiction_detected && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                    color: '#fb7185',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                      <AlertTriangle size={16} />
                      <span>CONTRADICTION INTERCEPTED BY RULE ENGINE</span>
                    </div>
                    {val.contradictions.map((c, i) => (
                      <p key={i}>• {c}</p>
                    ))}
                  </div>
                )}

                {val.unsupported_claims_detected && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#fbbf24',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                      <ShieldAlert size={16} />
                      <span>UNSUPPORTED LABORATORY CLAIM BLOCKED</span>
                    </div>
                    <p>
                      The model attempted to state invisible chemical/microbial metrics ({val.unsupported_claims.join(', ')}) without laboratory sensor telemetry. Blocked under OneAquaHealth Guideline 8.
                    </p>
                  </div>
                )}

                {val.passed && !val.contradiction_detected && !val.unsupported_claims_detected && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                      <CheckCircle2 size={16} />
                      <span>All Schema & Safety Rule Checks Passed</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', marginTop: '4px', opacity: 0.9 }}>
                      Evidence sufficiency validated. Categorical boundaries verified. No unsupported lab claims detected.
                    </p>
                  </div>
                )}

                {/* Score & Checks Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', marginTop: '4px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Evidence Integrity Score</span>
                    <span style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {Math.round(val.evidence_score * 100)}%
                    </span>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Human Review Trigger</span>
                    <span style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: val.escalation_required ? '#fbbf24' : '#34d399' }}>
                      {val.escalation_required ? 'MANDATORY' : 'OPTIONAL'}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* OneAquaHealth RAG Citations */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <BookOpen size={18} color="var(--aqua-400)" />
              <h3 style={{ fontSize: '1.15rem' }}>OneAquaHealth Grounding & Citations</h3>
            </div>
            {ai?.sources && ai.sources.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ai.sources.map((src, i) => (
                  <div key={i} style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(6, 182, 212, 0.05)',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    fontSize: '0.82rem',
                    color: 'var(--aqua-400)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <ChevronRight size={14} />
                    <span>{src}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No citations retrieved.</p>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 3: Human-in-the-Loop Decision Console & Audit */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             {userRole === 'citizen' ? (
            /* ======================================================== */
            /* CITIZEN OBSERVER VIEW: Public Transparency & Verification */
            /* ======================================================== */
            <div className="glass-panel" style={{ padding: '22px', borderTop: '4px solid var(--aqua-500)' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <User size={13} />
                    Citizen Community View
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--aqua-400)', fontWeight: 700, letterSpacing: '0.04em' }}>
                    READ-ONLY TRANSPARENCY
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem' }}>Specialist Verification Status</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Under the OneAquaHealth framework, AI provides preliminary guidance, but official regulatory actions are certified by catchment specialists.
                </p>
              </div>

              {/* Status Banner */}
              {observation.status === 'pending_review' ? (
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'rgba(245, 158, 11, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fbbf24',
                      flexShrink: 0
                    }}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: 0, fontWeight: 700 }}>
                        Pending Specialist Review
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Queued for municipal limnologist evaluation
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                    AquaSense AI recommended a preliminary severity assessment of <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{ai?.severity || 'moderate'}</strong>. The deterministic validation shield checked this report with an evidence score of <strong>{Math.round((val?.evidence_score || 0.8) * 100)}%</strong>.
                  </p>
                  {val?.escalation_required && (
                    <div style={{
                      marginTop: '10px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      fontSize: '0.75rem',
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <AlertTriangle size={14} />
                      <span>Flagged for mandatory specialist review by validation rules</span>
                    </div>
                  )}
                </div>
              ) : observation.status === 'approved' ? (
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#34d399',
                      flexShrink: 0
                    }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: '#34d399', margin: 0, fontWeight: 700 }}>
                        Certified by Specialist
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Approved by {human?.reviewer_name || 'Dr. Claire Dubois'}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px', marginTop: '8px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Specialist Finding Rationale:</div>
                    <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      "{human?.decision_notes || 'Approved AI recommendation based on photographic evidence and OneAquaHealth protocols.'}"
                    </div>
                  </div>
                </div>
              ) : observation.status === 'modified' ? (
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#818cf8',
                      flexShrink: 0
                    }}>
                      <Layers size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: '#818cf8', margin: 0, fontWeight: 700 }}>
                        Specialist Override Certified
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Certified by {human?.reviewer_name || 'Dr. Claire Dubois'}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span>Certified Severity: <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{human?.final_severity || ai?.severity}</strong></span>
                      <span>Category: <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{(human?.final_category || ai?.category || '').replace(/_/g, ' ')}</strong></span>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Specialist Justification:</div>
                    <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      "{human?.decision_notes || 'Overridden following expert limnological inspection.'}"
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'rgba(244, 63, 94, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fb7185',
                      flexShrink: 0
                    }}>
                      <XCircle size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: '#fb7185', margin: 0, fontWeight: 700 }}>
                        Report Rejected / False Positive
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Reviewed by {human?.reviewer_name || 'Catchment Specialist'}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    "{human?.decision_notes || 'Specialist determined this does not represent an actionable incident.'}"
                  </div>
                </div>
              )}

              {/* Informational Guidance */}
              <div style={{
                padding: '14px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.05)',
                border: '1px solid rgba(6, 182, 212, 0.15)',
                marginBottom: '18px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--aqua-400)', fontWeight: 600, marginBottom: '6px' }}>
                  <ShieldCheck size={15} />
                  <span>Why can't citizens commit review decisions?</span>
                </div>
                <p style={{ margin: 0, lineHeight: 1.45 }}>
                  The <strong>OneAquaHealth Track 3</strong> governance protocol enforces that AI-assisted decisions affecting catchment policy, water quality warnings, or municipal enforcement must be certified by an accredited environmental specialist.
                </p>
              </div>

              {/* Switch Role Fast-Action */}
              {onRoleChange && (
                <button
                  type="button"
                  onClick={() => onRoleChange('reviewer')}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '11px',
                    fontSize: '0.82rem',
                    justifyContent: 'center',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: '#c7d2fe',
                    background: 'rgba(99, 102, 241, 0.1)'
                  }}
                >
                  <UserCheck size={15} color="#818cf8" />
                  <span>Switch to Specialist Review Console</span>
                  <ArrowRight size={14} color="#818cf8" />
                </button>
              )}
            </div>
          ) : (
            /* ======================================================== */
            /* SPECIALIST REVIEW CONSOLE (Reviewer Mode)                 */
            /* ======================================================== */
            <div className="glass-panel" style={{ padding: '22px', borderTop: '4px solid #6366f1' }}>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    <UserCheck size={12} style={{ marginRight: '4px' }} />
                    Specialist Authority
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600 }}>
                    HUMAN-IN-THE-LOOP
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem' }}>Specialist Review Console</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  "AI recommends. Evidence supports. Validation checks. Humans decide."
                </p>
              </div>

              {successMsg && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  fontSize: '0.82rem',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  color: '#fb7185',
                  fontSize: '0.82rem',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCommitDecision} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Action Buttons Tabs */}
                <div>
                  <label className="form-label">Review Action</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setDecisionMode('approve')}
                      className={`btn ${decisionMode === 'approve' ? 'btn-success' : 'btn-secondary'}`}
                      style={{ fontSize: '0.8rem', padding: '8px' }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Approve</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionMode('modify')}
                      className={`btn ${decisionMode === 'modify' ? 'btn-warning' : 'btn-secondary'}`}
                      style={{ fontSize: '0.8rem', padding: '8px' }}
                    >
                      <Edit3 size={14} />
                      <span>Modify</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionMode('reject')}
                      className={`btn ${decisionMode === 'reject' ? 'btn-danger' : 'btn-secondary'}`}
                      style={{ fontSize: '0.8rem', padding: '8px' }}
                    >
                      <XCircle size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {/* Reviewer Identity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Reviewer Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={reviewerName}
                      onChange={e => setReviewerName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Specialist Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={reviewerRole}
                      onChange={e => setReviewerRole(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Modification Fields (Only visible when modifying) */}
                {decisionMode === 'modify' && (
                  <div style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber-500)', textTransform: 'uppercase' }}>
                      Human Override Parameters
                    </span>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Final Severity (Overriding AI)</label>
                      <select
                        className="form-select"
                        value={finalSeverity}
                        onChange={e => setFinalSeverity(e.target.value)}
                      >
                        <option value="low">Low (Baseline)</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                        <option value="critical">Critical (Emergency)</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Final Category</label>
                      <select
                        className="form-select"
                        value={finalCategory}
                        onChange={e => setFinalCategory(e.target.value)}
                      >
                        <option value="water_quality">Water Quality & Surfactants</option>
                        <option value="algal_bloom">Algal Bloom / Cyanobacteria</option>
                        <option value="plastic_debris">Macroplastic Solid Waste</option>
                        <option value="illegal_discharge">Illicit Outfall / Petroleum</option>
                        <option value="bank_erosion">Riparian Bank Erosion</option>
                        <option value="macroinvertebrate_habitat">Macroinvertebrate Habitat</option>
                        <option value="normal_baseline">Normal Ecological Baseline</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Justification Notes */}
                <div>
                  <label className="form-label">
                    Specialist Decision Rationale {decisionMode !== 'approve' && <span style={{ color: '#fb7185' }}>*</span>}
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={decisionNotes}
                    onChange={e => setDecisionNotes(e.target.value)}
                    placeholder={
                      decisionMode === 'approve'
                        ? "Optional confirmation notes..."
                        : "Required: Explain why the AI recommendation was modified or rejected (e.g. duckweed vs algae, glare interference)..."
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  {submitting ? "Committing..." : `Commit Human Decision (${decisionMode.toUpperCase()})`}
                </button>
              </form>
            </div>
          )}

          {/* Immutable Audit Trail Timeline */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <History size={18} color="var(--aqua-400)" />
              <h3 style={{ fontSize: '1.15rem' }}>Immutable Audit Trail</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '8px' }}>
              {audit.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.8rem' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 
                      ev.event_type === 'HUMAN_DECISION_COMMITTED' ? '#818cf8' :
                      ev.event_type === 'VALIDATION_ENGINE_EVALUATED' ? '#34d399' :
                      ev.event_type === 'AI_RECOMMENDATION_GENERATED' ? '#06b6d4' : '#64748b',
                    marginTop: '4px',
                    flexShrink: 0
                  }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ color: '#ffffff' }}>{ev.event_type.replace(/_/g, ' ')}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>
                      Actor: {ev.actor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Modal for Permanent Deletion (Rendered via Portal to active viewport center) */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title="Delete Observation?"
        observationId={observation?.id}
        locationName={observation?.citizen_input?.location_name}
        description={observation?.citizen_input?.description}
        isDeleting={isDeleting}
        onConfirm={handleDeleteObservation}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
