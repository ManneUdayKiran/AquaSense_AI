import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Layers, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink,
  Tag
} from 'lucide-react';
import { api } from '../services/api';

export default function KnowledgeExplorer() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const res = await api.getDocuments();
        setDocuments(res.documents || []);
      } catch (err) {
        console.error("Failed to load documents:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDocs();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      const res = await api.getDocuments();
      setDocuments(res.documents || []);
      return;
    }

    setLoading(true);
    try {
      const res = await api.searchKnowledge(searchQuery, 10);
      setDocuments(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '30px auto', padding: '0 24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-moderate">Authoritative RAG Knowledge Base</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            OneAquaHealth European Urban Catchments Guidelines
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem' }}>OneAquaHealth Knowledge Explorer</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '820px' }}>
          Official biomonitoring protocols, visual indicator thresholds, solid waste indices (SWAI), surfactant triage, and photographic validation rules.
        </p>
      </div>

      {/* Search & Filter Header */}
      <div className="glass-panel" style={{ padding: '18px 24px', marginBottom: '28px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Semantic search (e.g. 'detergent white foam', 'algae bloom', 'E. coli limits')..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ width: '220px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Indicator Domains</option>
              <option value="water_quality">Water Quality & Surfactants</option>
              <option value="algal_bloom">Harmful Algal Blooms</option>
              <option value="plastic_debris">Macroplastic Index (SWAI)</option>
              <option value="illegal_discharge">Illicit Outfalls & Hydrocarbons</option>
              <option value="macroinvertebrate_habitat">Benthic Habitat Integrity</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>
            <Search size={15} />
            <span>Search RAG</span>
          </button>
        </form>
      </div>

      {/* Document Catalog */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p>Searching OneAquaHealth semantic index...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '24px' }}>
          {filteredDocs.map(doc => (
            <div 
              key={doc.id} 
              className="glass-panel"
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--aqua-400)',
                    border: '1px solid rgba(6, 182, 212, 0.3)'
                  }}>
                    {doc.protocol_code}
                  </span>
                  {doc.relevance_score && (
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                      Match: {Math.round(doc.relevance_score * 100)}%
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', lineHeight: 1.35 }}>
                  {doc.title}
                </h3>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {doc.content}
              </p>

              {/* Key Indicators */}
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Key Diagnostic Markers
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {doc.key_indicators?.map((k, i) => (
                    <span key={i} style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--aqua-400)'
                    }}>
                      • {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Thresholds Table */}
              {doc.thresholds && (
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    Severity Threshold Criteria
                  </span>
                  {Object.entries(doc.thresholds).map(([lvl, desc]) => (
                    <div key={lvl} style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
                      <span style={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        color: lvl === 'critical' ? '#fb7185' : lvl === 'high' ? '#fbbf24' : '#38bdf8',
                        width: '65px',
                        flexShrink: 0
                      }}>
                        {lvl}:
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{desc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Source Document Citation */}
              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Official Source: <em>{doc.source_document}</em></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
