import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ---------------------------------------------------------------------------
// Sub-component: fly to a location when flyTo prop changes
// ---------------------------------------------------------------------------
function FlyToHandler({ flyTo }) {
  const map = useMap();
  const prevTs = useRef(null);

  useEffect(() => {
    if (flyTo && flyTo.ts !== prevTs.current) {
      prevTs.current = flyTo.ts;
      map.flyTo([flyTo.lat, flyTo.lng], 15, { duration: 1.2 });
    }
  }, [flyTo, map]);

  return null;
}

// ---------------------------------------------------------------------------
// Sub-component: heatmap layer using Leaflet.heat
// ---------------------------------------------------------------------------
function HeatLayer({ points, heatWeight, maxScore, maxCount }) {
  const map = useMap();

  useEffect(() => {
    let heatLayer = null;

    async function addHeat() {
      try {
        await import('leaflet.heat');
        if (window.L && window.L.heatLayer) {
          // Normalize intensity to 0-1 range based on toggled weight
          const heatData = points.map((p) => {
            const intensity = heatWeight === 'score'
              ? Math.min(p.score / maxScore, 1)
              : Math.min(p.violation_count / maxCount, 1);
            return [p.lat, p.lng, intensity];
          });
          heatLayer = window.L.heatLayer(heatData, {
            radius: 30,
            blur: 25,
            maxZoom: 17,
            max: 1,
            gradient: {
              0.2: '#F39C12',
              0.4: '#E67E22',
              0.6: '#E74C3C',
              0.8: '#C0392B',
              1.0: '#922B21',
            },
          }).addTo(map);
        }
      } catch (err) {
        console.error('Could not load leaflet.heat:', err);
      }
    }

    addHeat();

    return () => {
      if (heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [points, heatWeight, maxScore, maxCount, map]);

  return null;
}

// ---------------------------------------------------------------------------
// Color scale for markers: score → color
// ---------------------------------------------------------------------------
function scoreColor(score, maxScore) {
  const ratio = Math.min(score / maxScore, 1);
  if (ratio > 0.66) return '#C0392B';   // crimson
  if (ratio > 0.33) return '#E67E22';   // orange
  return '#F39C12';                      // amber
}

function markerRadius(count, maxCount) {
  const min = 6;
  const max = 22;
  return min + (count / maxCount) * (max - min);
}

function formatScore(score) {
  if (score == null) return '—';
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
  if (score >= 1_000) return `${(score / 1_000).toFixed(1)}K`;
  return score.toFixed(1);
}

// ---------------------------------------------------------------------------
// Main MapView component
// ---------------------------------------------------------------------------
export default function MapView({ hotspots, flyTo }) {
  const [mode, setMode] = useState('markers'); // 'markers' | 'heatmap'
  const [heatWeight, setHeatWeight] = useState('score'); // 'count' | 'score'

  // Filter out hotspots with null lat/lng
  const validHotspots = useMemo(
    () => (hotspots || []).filter((h) => h.lat != null && h.lng != null),
    [hotspots]
  );

  // Compute map centre as mean of all valid hotspots
  const center = useMemo(() => {
    if (validHotspots.length === 0) return [28.61, 77.23]; // default Delhi
    const avgLat = validHotspots.reduce((s, h) => s + h.lat, 0) / validHotspots.length;
    const avgLng = validHotspots.reduce((s, h) => s + h.lng, 0) / validHotspots.length;
    return [avgLat, avgLng];
  }, [validHotspots]);

  const maxScore = useMemo(
    () => Math.max(...validHotspots.map((h) => h.score), 1),
    [validHotspots]
  );
  const maxCount = useMemo(
    () => Math.max(...validHotspots.map((h) => h.violation_count), 1),
    [validHotspots]
  );

  return (
    <div className="map-wrapper" id="map-wrapper">
      <div className="map-controls">
        <button
          className={`map-toggle-btn ${mode === 'markers' ? 'active' : ''}`}
          onClick={() => setMode('markers')}
          id="btn-markers"
        >
          Markers
        </button>
        <button
          className={`map-toggle-btn ${mode === 'heatmap' ? 'active' : ''}`}
          onClick={() => setMode('heatmap')}
          id="btn-heatmap"
        >
          Heatmap
        </button>
      </div>

      {mode === 'heatmap' && (
        <div className="map-sub-controls">
          <button
            className={`map-sub-toggle-btn ${heatWeight === 'count' ? 'active' : ''}`}
            onClick={() => setHeatWeight('count')}
            id="btn-heat-violations"
          >
            Violation Density
          </button>
          <button
            className={`map-sub-toggle-btn ${heatWeight === 'score' ? 'active' : ''}`}
            onClick={() => setHeatWeight('score')}
            id="btn-heat-congestion"
          >
            Congestion Impact
          </button>
        </div>
      )}

      <MapContainer center={center} zoom={12} className="map-container" id="leaflet-map" scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToHandler flyTo={flyTo} />

        {mode === 'heatmap' && (
          <HeatLayer
            points={validHotspots}
            heatWeight={heatWeight}
            maxScore={maxScore}
            maxCount={maxCount}
          />
        )}

        {mode === 'markers' &&
          validHotspots.map((h, i) => (
            <CircleMarker
              key={h.cluster_id != null ? h.cluster_id : i}
              center={[h.lat, h.lng]}
              radius={markerRadius(h.violation_count, maxCount)}
              pathOptions={{
                fillColor: scoreColor(h.score, maxScore),
                fillOpacity: 0.75,
                color: scoreColor(h.score, maxScore),
                weight: 2,
                opacity: 0.9,
              }}
            >
              <Popup>
                <div className="popup-title">{h.junction_name || 'Unknown Junction'}</div>
                {h.cluster_id != null && (
                  <div className="popup-row">
                    <span className="popup-label">Cluster ID</span>
                    <span className="popup-value">{h.cluster_id}</span>
                  </div>
                )}
                <div className="popup-row">
                  <span className="popup-label">Violations</span>
                  <span className="popup-value">{(h.violation_count || 0).toLocaleString('en-IN')}</span>
                </div>
                {h.dominant_violation && (
                  <div className="popup-row">
                    <span className="popup-label">Dominant Violation</span>
                    <span className="popup-value">{h.dominant_violation}</span>
                  </div>
                )}
                {h.dominant_vehicle && (
                  <div className="popup-row">
                    <span className="popup-label">Dominant Vehicle</span>
                    <span className="popup-value">{h.dominant_vehicle}</span>
                  </div>
                )}
                <div className="popup-row">
                  <span className="popup-label">Peak Hour</span>
                  <span className="popup-value">{h.peak_hour || '—'}</span>
                </div>
                <div className="popup-row">
                  <span className="popup-label">Impact Score</span>
                  <span className="popup-value popup-value--score">{formatScore(h.score)}</span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>
    </div>
  );
}
