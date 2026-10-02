import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { MapPin, ExternalLink, ShieldCheck, Layers, RefreshCw } from 'lucide-react';
import { api, resolvePhotoUrl } from '../services/api';

// Helper component to auto-fit map bounds when points change
function MapAutoBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const validPoints = points.filter(p => typeof p.latitude === 'number' && typeof p.longitude === 'number');
      if (validPoints.length > 0) {
        const bounds = validPoints.map(p => [p.latitude, p.longitude]);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 11 });
      }
    }
  }, [points, map]);
  return null;
}

const MAP_STYLES = {
  dark: {
    name: 'Dark Canvas',
    layers: [
      {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, &copy; OpenStreetMap'
      },
      {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        attribution: ''
      }
    ]
  },
  satellite: {
    name: 'Satellite Aerial',
    layers: [
      {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
      }
    ]
  },
  topo: {
    name: 'Topographic',
    layers: [
      {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, DeLorme, NAVTEQ, TomTom'
      }
    ]
  }
};

export default function InteractiveMap({ onSelectObservation }) {
  const [geoPoints, setGeoPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState('dark');

  const loadGeo = async () => {
    setLoading(true);
    try {
      const res = await api.getGeospatialPoints();
      setGeoPoints(res.features || []);
    } catch (err) {
      console.error("Failed to load map points:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGeo();
  }, []);

  const getMarkerColor = (severity) => {
    switch (severity) {
      case 'critical': return '#f43f5e';
      case 'high': return '#f59e0b';
      case 'moderate': return '#06b6d4';
      case 'low': return '#10b981';
      default: return '#38bdf8';
    }
  };

  const activeProvider = MAP_STYLES[mapStyle] || MAP_STYLES.dark;

  return (
    <div style={{ maxWidth: '1440px', margin: '24px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-moderate">Geospatial Catchment Surveillance</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Live Stream Sensor & Citizen Observation Mapping
            </span>
          </div>
          <h1 style={{ fontSize: '2rem' }}>Catchment Basin Geographic Distribution</h1>
        </div>

        {/* Layer Switcher Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Layers size={15} /> Map View:
          </span>
          <div className="glass-panel" style={{ padding: '3px', display: 'flex', gap: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setMapStyle('dark')}
              className={`btn ${mapStyle === 'dark' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px' }}
            >
              🌙 Dark Canvas
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`btn ${mapStyle === 'satellite' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px' }}
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setMapStyle('topo')}
              className={`btn ${mapStyle === 'topo' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px' }}
            >
              🗺️ Topographic
            </button>
          </div>
          <button
            onClick={loadGeo}
            className="btn btn-ghost"
            title="Refresh map points"
            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="glass-panel" style={{ padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Severity Legend:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f43f5e' }}></span>
            <span>Critical Emergency</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
            <span>High Severity Triage</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#06b6d4' }}></span>
            <span>Moderate Concern</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            <span>Low Baseline</span>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {geoPoints.length} Geocoded Observations Mapped
        </div>
      </div>

      {/* Leaflet Map Container */}
      <div className="glass-panel" style={{ height: '620px', width: '100%', overflow: 'hidden', position: 'relative', borderRadius: '12px' }}>
        <MapContainer
          center={[50.0, 10.0]}
          zoom={4}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', backgroundColor: '#0f172a' }}
        >
          {activeProvider.layers.map((layer, idx) => (
            <TileLayer
              key={`${mapStyle}-${idx}`}
              attribution={layer.attribution}
              url={layer.url}
              maxZoom={18}
            />
          ))}

          <MapAutoBounds points={geoPoints} />

          {geoPoints.map(point => (
            <CircleMarker
              key={point.id}
              center={[point.latitude, point.longitude]}
              radius={10}
              pathOptions={{
                color: getMarkerColor(point.severity),
                fillColor: getMarkerColor(point.severity),
                fillOpacity: 0.85,
                weight: 2
              }}
            >
              <Popup>
                <div style={{ padding: '4px', maxWidth: '240px' }}>
                  {point.photo_url && (
                    <img 
                      src={resolvePhotoUrl(point.photo_url)} 
                      alt={point.title}
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                  )}
                  <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>{point.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0' }}>
                    Observer: {point.observer}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textTransform: 'capitalize' }}>
                    Severity: {point.severity} ({Math.round(point.confidence * 100)}% conf)
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '4px 0 8px', fontStyle: 'italic' }}>
                    "{point.recommendation ? point.recommendation.slice(0, 80) : 'Assessment logged'}..."
                  </p>
                  <button
                    onClick={async () => {
                      const fullObs = await api.getObservationById(point.id);
                      if (onSelectObservation) onSelectObservation(fullObs);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.75rem', padding: '6px' }}
                  >
                    Open Workspace
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
