import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Layers,
  MapPin,
  RefreshCw,
  Eye,
  User,
  UserCheck,
  Trash2
} from 'lucide-react';
import { api, resolvePhotoUrl } from '../services/api';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function ReviewerDashboard({ 
  userRole = 'reviewer', 
  onRoleChange, 
  onSelectObservation, 
  onRefreshNeeded 
}) {
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [obsToDelete, setObsToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState(null);

  const handleDeleteObservation = async () => {
    if (!obsToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteObservation(obsToDelete.id);
      setDeleteNotification(`Observation "${obsToDelete.citizen_input?.location_name || obsToDelete.id}" deleted successfully.`);
      setObsToDelete(null);
      await loadObservations();
      setTimeout(() => setDeleteNotification(null), 4000);
    } catch (err) {
      console.error("Failed to delete observation:", err);
      alert("Failed to delete observation. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const loadObservations = async () => {
    setLoading(true);
    try {
      const data = await api.getObservations();
      setObservations(data);
    } catch (err) {
      console.error("Failed to load observations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObservations();
  }, [onRefreshNeeded]);

  const filteredObservations = observations.filter(obs => {
    // Status filter
    if (statusFilter !== 'all' && obs.status !== statusFilter) return false;
    
    // Severity filter
    if (severityFilter !== 'all') {
      const sev = obs.ai_assessment?.severity;
      if (sev !== severityFilter) return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const loc = obs.citizen_input?.location_name?.toLowerCase() || '';
      const obsName = obs.citizen_input?.observer_name?.toLowerCase() || '';
      const desc = obs.citizen_input?.description?.toLowerCase() || '';
      if (!loc.includes(q) && !obsName.includes(q) && !desc.includes(q)) return false;
    }

    return true;
  });

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'critical': return 'badge badge-critical';
      case 'high': return 'badge badge-high';
      case 'moderate': return 'badge badge-moderate';
      case 'low': return 'badge badge-low';
      default: return 'badge';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_review':
        return (
          <span style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Clock size={12} /> Pending Review
          </span>
        );
      case 'approved':
        return (
          <span style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'modified':
        return (
          <span style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Layers size={12} /> Human Modified
          </span>
        );
      case 'rejected':
        return (
          <span style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(244, 63, 94, 0.15)',
            color: '#fb7185',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <AlertTriangle size={12} /> Rejected
          </span>
        );
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '30px auto', padding: '0 24px' }} className="animate-fade-in">
      {/* Role Context Notification Banner */}
      {userRole === 'citizen' && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={18} color="var(--aqua-400)" />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#fff' }}>Citizen Community Feed:</strong> You are exploring public catchment reports in read-only transparency mode. Regulatory triage decisions and severity overrides require certified Limnologist credentials.
            </div>
          </div>
          {onRoleChange && (
            <button
              onClick={() => onRoleChange('reviewer')}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '5px 12px', background: 'rgba(99, 102, 241, 0.15)', color: '#c7d2fe', border: '1px solid rgba(99, 102, 241, 0.3)' }}
            >
              Switch to Specialist Mode
            </button>
          )}
        </div>
      )}

      {/* Deletion Success Banner */}
      {deleteNotification && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{deleteNotification}</span>
        </div>
      )}

      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            {userRole === 'citizen' ? (
              <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} /> Community Reports Feed
              </span>
            ) : (
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={12} /> Limnologist Triage Console
              </span>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filteredObservations.length} of {observations.length} Observations
            </span>
          </div>
          <h1 style={{ fontSize: '2rem' }}>
            {userRole === 'citizen' ? 'Catchment Community Reports' : 'Limnologist & Specialist Review Queue'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            {userRole === 'citizen'
              ? 'Public water body reports collected across urban river catchments. Inspect AI detections and verification statuses.'
              : 'Audit AI recommendations against photographic evidence, review deterministic rule flags, and commit authoritative decisions.'
            }
          </p>
        </div>

        <button 
          onClick={loadObservations} 
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search location, observer, text..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved Decisions</option>
              <option value="modified">Human Overridden (Modified)</option>
              <option value="rejected">Rejected Submissions</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              className="form-select"
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
            >
              <option value="all">All AI Severities</option>
              <option value="critical">Critical Severity</option>
              <option value="high">High Severity</option>
              <option value="moderate">Moderate Severity</option>
              <option value="low">Low / Baseline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Observation Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <RefreshCw className="animate-spin" size={32} color="var(--aqua-400)" style={{ margin: '0 auto 16px' }} />
          <p>Loading observation queue from repository...</p>
        </div>
      ) : filteredObservations.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Filter size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No observations match criteria</h3>
          <p>Try resetting filters or submit a new citizen observation from the portal.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredObservations.map(obs => {
            const ai = obs.ai_assessment;
            const val = obs.validation_result;
            const input = obs.citizen_input;

            return (
              <div 
                key={obs.id} 
                className="glass-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative',
                  borderTop: ai?.severity === 'critical' ? '3px solid #f43f5e' : 
                             ai?.severity === 'high' ? '3px solid #f59e0b' : 
                             '3px solid #06b6d4'
                }}
              >
                {/* Photo or Image Header */}
                <div style={{ height: '160px', width: '100%', position: 'relative', background: '#0a0f1d' }}>
                  {input.photo_url ? (
                    <img 
                      src={resolvePhotoUrl(input.photo_url)} 
                      alt={input.location_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <MapPin size={24} color="var(--aqua-500)" />
                      <span style={{ fontSize: '0.8rem' }}>No Photo Attached</span>
                    </div>
                  )}

                  {/* Badges on Image */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap'
                  }}>
                    {ai && (
                      <span className={getSeverityBadgeClass(ai.severity)}>
                        {ai.severity}
                      </span>
                    )}
                    {getStatusBadge(obs.status)}
                  </div>

                  {/* Confidence Gauge Pill */}
                  {ai && (
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '12px',
                      background: 'rgba(10, 16, 30, 0.85)',
                      backdropFilter: 'blur(8px)',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: ai.confidence >= 0.8 ? '#34d399' : '#fbbf24',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      AI Conf: {Math.round(ai.confidence * 100)}%
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <MapPin size={12} color="var(--aqua-400)" />
                      <span>{input.location_name}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', color: '#ffffff', lineHeight: 1.3 }}>
                      {input.location_name}
                    </h3>
                  </div>

                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    "{input.description}"
                  </p>

                  {/* Validation Alerts Indicator */}
                  {val && (
                    <div style={{ marginTop: 'auto' }}>
                      {val.contradiction_detected && (
                        <div style={{
                          fontSize: '0.75rem',
                          background: 'rgba(244, 63, 94, 0.12)',
                          color: '#fb7185',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '6px'
                        }}>
                          <AlertTriangle size={14} />
                          <span>Contradiction Flagged by Rule Engine</span>
                        </div>
                      )}

                      {val.unsupported_claims_detected && (
                        <div style={{
                          fontSize: '0.75rem',
                          background: 'rgba(245, 158, 11, 0.12)',
                          color: '#fbbf24',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '6px'
                        }}>
                          <ShieldAlert size={14} />
                          <span>Unsupported Lab Claim Blocked</span>
                        </div>
                      )}

                      {val.passed && !val.contradiction_detected && !val.unsupported_claims_detected && (
                        <div style={{
                          fontSize: '0.75rem',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#34d399',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <ShieldCheck size={14} />
                          <span>Passed Scientific Validation Shield</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons: Open & Delete */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      onClick={() => onSelectObservation(obs)}
                      className="btn btn-primary"
                      style={{ 
                        flex: 1, 
                        padding: '10px 12px', 
                        fontSize: '0.86rem',
                        background: userRole === 'citizen' ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                        borderColor: userRole === 'citizen' ? '#06b6d4' : '#6366f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {userRole === 'citizen' ? (
                        <>
                          <Eye size={15} />
                          <span>View Report</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          <span>Review Console</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setObsToDelete(obs);
                      }}
                      className="btn btn-secondary"
                      title="Delete Observation"
                      style={{
                        padding: '10px 12px',
                        color: '#fb7185',
                        borderColor: 'rgba(244, 63, 94, 0.35)',
                        background: 'rgba(244, 63, 94, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Permanent Deletion (Rendered via Portal to active viewport center) */}
      <ConfirmDeleteModal
        isOpen={Boolean(obsToDelete)}
        title="Delete Observation?"
        observationId={obsToDelete?.id}
        locationName={obsToDelete?.citizen_input?.location_name}
        description={obsToDelete?.citizen_input?.description}
        isDeleting={isDeleting}
        onConfirm={handleDeleteObservation}
        onCancel={() => setObsToDelete(null)}
      />
    </div>
  );
}
