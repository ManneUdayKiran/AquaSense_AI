import axios from 'axios';
import { mockStore } from './mockFallbackData';

const RAW_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : 'https://aquasense-ai-5rm7.onrender.com';

const BACKEND_URL = (RAW_URL || '').replace(/\/+$/, '');
const API_BASE = BACKEND_URL 
  ? (BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL}/api`)
  : '/api';

console.info(`[AquaSense AI] API endpoint configured: ${API_BASE}`);

// Live connection state tracker
let isUsingFallback = false;
const listeners = new Set();

function setFallbackMode(active, error = null) {
  if (isUsingFallback !== active) {
    isUsingFallback = active;
    if (active) {
      console.warn(`[AquaSense API] Live backend unavailable (${error?.message || 'Network Error'}). Activated high-fidelity OneAquaHealth local fallback.`);
    } else {
      console.info('[AquaSense API] Live backend connected. Using real server data.');
    }
    listeners.forEach(cb => cb(isUsingFallback));
  }
}

export const api = {
  // Connection diagnostic helpers
  isUsingFallback: () => isUsingFallback,
  getBaseUrl: () => API_BASE,
  onConnectionChange: (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  // Observations
  getObservations: async (params = {}) => {
    try {
      const res = await axios.get(`${API_BASE}/observations`, { params, timeout: 15000 });
      setFallbackMode(false);
      mockStore.syncFromBackend(res.data);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.getObservations(params);
    }
  },

  getObservationById: async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/observations/${id}`, { timeout: 15000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.getObservationById(id);
    }
  },

  submitObservation: async (formData) => {
    try {
      const res = await axios.post(`${API_BASE}/observations`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 35000
      });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.submitObservation(formData);
    }
  },

  deleteObservation: async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/observations/${id}`, { timeout: 15000 });
      setFallbackMode(false);
      mockStore.deleteObservation(id);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.deleteObservation(id);
    }
  },

  // Review
  submitReviewDecision: async (id, decisionPayload) => {
    try {
      const res = await axios.post(`${API_BASE}/review/${id}/decision`, decisionPayload, { timeout: 15000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.submitReviewDecision(id, decisionPayload);
    }
  },

  reopenObservation: async (id) => {
    try {
      const res = await axios.post(`${API_BASE}/review/${id}/reopen`, {}, { timeout: 15000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.reopenObservation(id);
    }
  },

  // Assessment
  reevaluateObservation: async (id) => {
    try {
      const res = await axios.post(`${API_BASE}/assessment/re-evaluate/${id}`, {}, { timeout: 35000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.reevaluateObservation(id);
    }
  },

  getValidationRules: async () => {
    try {
      const res = await axios.get(`${API_BASE}/assessment/rules`, { timeout: 15000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.getValidationRules();
    }
  },

  // Analytics & Geo
  getAnalyticsSummary: async () => {
    try {
      const res = await axios.get(`${API_BASE}/analytics/summary`, { timeout: 15000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.getAnalyticsSummary();
    }
  },

  getGeospatialPoints: async () => {
    try {
      const res = await axios.get(`${API_BASE}/analytics/geo`, { timeout: 15000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.getGeospatialPoints();
    }
  },

  // OneAquaHealth RAG
  searchKnowledge: async (q, topK = 3) => {
    try {
      const res = await axios.get(`${API_BASE}/rag/search`, { params: { q, top_k: topK }, timeout: 15000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.searchKnowledge(q);
    }
  },

  getDocuments: async () => {
    try {
      const res = await axios.get(`${API_BASE}/rag/documents`, { timeout: 15000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.getDocuments();
    }
  }
};
