import axios from 'axios';
import { mockStore } from './mockFallbackData';

const API_BASE = '/api';

// Live connection state tracker
let isUsingFallback = false;
const listeners = new Set();

function setFallbackMode(active, error = null) {
  if (isUsingFallback !== active) {
    isUsingFallback = active;
    if (active) {
      console.warn(`[AquaSense API] Backend unavailable (${error?.message || 'Network Error'}). Activated high-fidelity OneAquaHealth mock data fallback.`);
    } else {
      console.info('[AquaSense API] Live backend reconnected. Using real server data.');
    }
    listeners.forEach(cb => cb(isUsingFallback));
  }
}

export const api = {
  // Connection diagnostic helpers
  isUsingFallback: () => isUsingFallback,
  onConnectionChange: (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  // Observations
  getObservations: async (params = {}) => {
    try {
      const res = await axios.get(`${API_BASE}/observations`, { params, timeout: 5000 });
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
      const res = await axios.get(`${API_BASE}/observations/${id}`, { timeout: 5000 });
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
        timeout: 15000
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
      const res = await axios.delete(`${API_BASE}/observations/${id}`, { timeout: 5000 });
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
      const res = await axios.post(`${API_BASE}/review/${id}/decision`, decisionPayload, { timeout: 8000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.submitReviewDecision(id, decisionPayload);
    }
  },

  reopenObservation: async (id) => {
    try {
      const res = await axios.post(`${API_BASE}/review/${id}/reopen`, {}, { timeout: 5000 });
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
      const res = await axios.post(`${API_BASE}/assessment/re-evaluate/${id}`, {}, { timeout: 15000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.reevaluateObservation(id);
    }
  },

  getValidationRules: async () => {
    try {
      const res = await axios.get(`${API_BASE}/assessment/rules`, { timeout: 5000 });
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
      const res = await axios.get(`${API_BASE}/analytics/summary`, { timeout: 5000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.getAnalyticsSummary();
    }
  },

  getGeospatialPoints: async () => {
    try {
      const res = await axios.get(`${API_BASE}/analytics/geo`, { timeout: 5000 });
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
      const res = await axios.get(`${API_BASE}/rag/search`, { params: { q, top_k: topK }, timeout: 5000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.searchKnowledge(q);
    }
  },

  getDocuments: async () => {
    try {
      const res = await axios.get(`${API_BASE}/rag/documents`, { timeout: 5000 });
      setFallbackMode(false);
      return res.data;
    } catch (err) {
      setFallbackMode(true, err);
      return mockStore.getDocuments();
    }
  }
};
