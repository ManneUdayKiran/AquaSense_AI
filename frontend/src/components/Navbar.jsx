import React, { useState, useEffect } from 'react';
import { 
  Waves, 
  ClipboardCheck, 
  MapPin, 
  BarChart3, 
  BookOpen, 
  ShieldCheck, 
  UserCheck, 
  User,
  PlusCircle,
  Wifi,
  WifiOff,
  Home
} from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, userRole, setUserRole }) {
  const [isFallback, setIsFallback] = useState(api.isUsingFallback());

  useEffect(() => {
    return api.onConnectionChange(setIsFallback);
  }, []);
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(7, 11, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          title="Return to AquaSense AI Landing Overview"
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <Waves size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'Outfit',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em'
              }}>
                AquaSense<span style={{ color: 'var(--aqua-400)' }}> AI</span>
              </span>
              {/* <span style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--aqua-400)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                fontWeight: 700
              }}>
                TRACK 3 MVP
              </span> */}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              AI Recommends • Evidence Supports • Validation Checks • Humans Decide
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('landing')}
            className={`btn ${activeTab === 'landing' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <Home size={16} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('submit')}
            className={`btn ${activeTab === 'submit' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              fontSize: '0.85rem', 
              padding: '8px 14px',
              border: userRole === 'citizen' && activeTab === 'submit' ? '1px solid var(--aqua-400)' : undefined
            }}
          >
            <PlusCircle size={16} />
            <span>Submit Observation</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`btn ${activeTab === 'queue' ? (userRole === 'reviewer' ? 'btn-primary' : 'btn-primary') : 'btn-secondary'}`}
            style={{ 
              fontSize: '0.85rem', 
              padding: '8px 14px',
              background: userRole === 'reviewer' && activeTab === 'queue' ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : undefined,
              borderColor: userRole === 'reviewer' && activeTab === 'queue' ? '#6366f1' : undefined
            }}
          >
            <ClipboardCheck size={16} />
            <span>{userRole === 'citizen' ? 'Community Feed' : 'Review Queue'}</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`btn ${activeTab === 'map' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <MapPin size={16} />
            <span>Catchment Map</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <BarChart3 size={16} />
            <span>Analytics & Shield</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`btn ${activeTab === 'knowledge' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <BookOpen size={16} />
            <span>OneAquaHealth RAG</span>
          </button>
        </nav>

        {/* Role Switcher & Live Engine Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: isFallback ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.1)',
            border: isFallback ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.75rem',
            color: isFallback ? '#fbbf24' : '#34d399',
            transition: 'all 0.3s ease'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isFallback ? '#f59e0b' : '#10b981',
              boxShadow: isFallback ? '0 0 10px #f59e0b' : '0 0 10px #10b981'
            }}></span>
            {isFallback ? <WifiOff size={13} /> : <ShieldCheck size={14} />}
            <span style={{ fontWeight: 600 }}>
              {isFallback ? 'Offline Fallback (Mock Data)' : 'Live Backend (Real Data)'}
            </span>
          </div>

          {/* Role Switcher with Distinct Role Colors */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '3px'
          }}>
            <button
              onClick={() => {
                setUserRole('citizen');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                background: userRole === 'citizen' ? 'var(--aqua-500)' : 'transparent',
                color: userRole === 'citizen' ? '#ffffff' : 'var(--text-secondary)',
                padding: '6px 13px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: userRole === 'citizen' ? '0 0 14px rgba(6, 182, 212, 0.45)' : 'none'
              }}
              title="Citizen Observer: Field reporting and public transparency"
            >
              <User size={13} />
              <span>Citizen</span>
            </button>
            <button
              onClick={() => {
                setUserRole('reviewer');
                if (activeTab === 'submit') {
                  setActiveTab('queue');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                background: userRole === 'reviewer' ? '#6366f1' : 'transparent',
                color: userRole === 'reviewer' ? '#ffffff' : 'var(--text-secondary)',
                padding: '6px 13px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: userRole === 'reviewer' ? '0 0 14px rgba(99, 102, 241, 0.45)' : 'none'
              }}
              title="Limnologist / Specialist: Authoritative review console & audit trail"
            >
              <UserCheck size={13} />
              <span>Reviewer</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
