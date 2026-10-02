import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Users, 
  Activity, 
  AlertTriangle,
  Award,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function AnalyticsHub() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await api.getAnalyticsSummary();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <div style={{ maxWidth: '1440px', margin: '40px auto', padding: '0 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading validation analytics & impact metrics...</p>
      </div>
    );
  }

  const total = metrics.total_observations || 1;
  const severities = metrics.severity_breakdown || {};
  const categories = metrics.category_breakdown || {};

  return (
    <div style={{ maxWidth: '1440px', margin: '30px auto', padding: '0 24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-low">Track 3 Evaluation Metrics</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Scientific Verification & Human Agency Performance
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem' }}>Analytics & Scientific Validation Shield</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px' }}>
          Real-time measurement of deterministic schema adherence, unsupported claim interception, contradiction resolution, and human-expert agreement.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Card 1: Human-AI Agreement */}
        <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid #818cf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' }}>
              Human Specialist Agreement
            </span>
            <Users size={20} color="#818cf8" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit' }}>
            {metrics.human_agreement_rate}%
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Alignment between AI recommendation and final limnologist verdict
          </p>
        </div>

        {/* Card 2: Validation Shield Pass Rate */}
        <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
              Validation Shield Pass Rate
            </span>
            <ShieldCheck size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit' }}>
            {metrics.validation_pass_rate}%
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Pydantic schema validity & required evidence sufficiency
          </p>
        </div>

        {/* Card 3: Unsupported Lab Claims Blocked */}
        <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
              Unsupported Claims Intercepted
            </span>
            <ShieldAlert size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit' }}>
            {metrics.unsupported_claim_block_count}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Prohibited chemical/pathogen assertions prevented from misleading reviewer
          </p>
        </div>

        {/* Card 4: Contradictions Flagged */}
        <div className="glass-panel" style={{ padding: '22px', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase' }}>
              Contradictions Flagged
            </span>
            <AlertTriangle size={20} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit' }}>
            {metrics.contradiction_flag_count}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Citizen survey vs AI perception conflicts caught and escalated
          </p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        
        {/* Severity Distribution */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <BarChart3 size={18} color="var(--aqua-400)" />
            <h3 style={{ fontSize: '1.25rem' }}>Observations by Severity Level</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Critical Severity', key: 'critical', color: '#f43f5e' },
              { label: 'High Severity', key: 'high', color: '#f59e0b' },
              { label: 'Moderate Concern', key: 'moderate', color: '#06b6d4' },
              { label: 'Low Baseline', key: 'low', color: '#10b981' }
            ].map(item => {
              const count = severities[item.key] || 0;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={item.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} items ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnosed Ecological Categories */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Activity size={18} color="var(--aqua-400)" />
            <h3 style={{ fontSize: '1.25rem' }}>Diagnosed Ecological Categories</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(categories).map(([cat, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--aqua-400)', textTransform: 'capitalize' }}>
                      {cat.replace(/_/g, ' ')}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #6366f1)', borderRadius: '9999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
