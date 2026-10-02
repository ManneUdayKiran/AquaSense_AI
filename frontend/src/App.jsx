import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import CitizenPortal from './components/CitizenPortal';
import ReviewerDashboard from './components/ReviewerDashboard';
import AssessmentWorkspace from './components/AssessmentWorkspace';
import InteractiveMap from './components/InteractiveMap';
import AnalyticsHub from './components/AnalyticsHub';
import KnowledgeExplorer from './components/KnowledgeExplorer';

export default function App() {
  const getInitialTab = () => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/report') return 'submit';
    if (path === '/review') return 'queue';
    if (path === '/analytics') return 'analytics';
    if (path === '/map') return 'map';
    if (path === '/knowledge') return 'knowledge';
    return 'landing';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [userRole, setUserRole] = useState('reviewer'); // 'citizen' | 'reviewer'
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    let newPath = '/';
    if (tab === 'submit') newPath = '/report';
    else if (tab === 'queue') newPath = '/review';
    else if (tab === 'analytics') newPath = '/analytics';
    else if (tab === 'map') newPath = '/map';
    else if (tab === 'knowledge') newPath = '/knowledge';
    else if (tab === 'workspace' && selectedObservation) newPath = `/review/${selectedObservation.id}`;
    
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleObservationCreated = (obs) => {
    setSelectedObservation(obs);
    setActiveTab('workspace');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectObservation = (obs) => {
    setSelectedObservation(obs);
    setActiveTab('workspace');
  };

  const handleBackToQueue = () => {
    setSelectedObservation(null);
    setActiveTab('queue');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUpdateObservation = (updated) => {
    setSelectedObservation(updated);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={userRole} 
        setUserRole={setUserRole} 
      />

      {/* Main View Area */}
      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {activeTab === 'landing' && (
          <LandingPage onNavigate={setActiveTab} />
        )}

        {activeTab === 'submit' && (
          <CitizenPortal 
            userRole={userRole}
            onObservationCreated={handleObservationCreated} 
          />
        )}

        {activeTab === 'queue' && (
          <ReviewerDashboard 
            userRole={userRole}
            onRoleChange={setUserRole}
            onSelectObservation={handleSelectObservation} 
            onRefreshNeeded={refreshTrigger} 
          />
        )}

        {activeTab === 'workspace' && selectedObservation && (
          <AssessmentWorkspace 
            observation={selectedObservation} 
            userRole={userRole}
            onRoleChange={setUserRole}
            onBack={handleBackToQueue}
            onUpdateObservation={handleUpdateObservation}
          />
        )}

        {activeTab === 'map' && (
          <InteractiveMap onSelectObservation={handleSelectObservation} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsHub />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeExplorer />
        )}
      </main>

      {/* Persistent Bottom Hackathon Principle Banner */}
      <footer style={{
        backgroundColor: 'rgba(7, 11, 20, 0.95)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '12px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--aqua-400)', fontWeight: 700 }}>AquaSense AI</span>
          <span>• OneAquaHealth Hackathon Track 3: AI-Supported Assessment</span>
        </div>
        <div style={{ fontWeight: 600, color: '#f8fafc', letterSpacing: '0.02em' }}>
          AI recommends <span style={{ color: 'var(--aqua-400)' }}>•</span> Evidence supports <span style={{ color: '#10b981' }}>•</span> Validation checks <span style={{ color: '#f59e0b' }}>•</span> Humans decide
        </div>
        <div>
          <span>Deterministic Schema + RAG Grounding + Human-in-the-Loop</span>
        </div>
      </footer>
    </div>
  );
}
