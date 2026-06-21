import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import KPICards from './components/KPICards';
import MapView from './components/MapView';
import Timeline from './components/Timeline';
import EnforcementTable from './components/EnforcementTable';
import DispatcherPanel from './components/DispatcherPanel';

const API_BASE = '/api';

export default function App() {
  const [hotspots, setHotspots] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [topJunctions, setTopJunctions] = useState([]);
  const [flyTo, setFlyTo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [hRes, sRes, tRes, jRes] = await Promise.all([
          fetch(`${API_BASE}/hotspots`),
          fetch(`${API_BASE}/stats`),
          fetch(`${API_BASE}/timeline`),
          fetch(`${API_BASE}/top-junctions`),
        ]);

        const [h, s, t, j] = await Promise.all([
          hRes.json(),
          sRes.json(),
          tRes.json(),
          jRes.json(),
        ]);

        setHotspots(h);
        setStats(s);
        setTimeline(t);
        setTopJunctions(j);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  const handleRowClick = useCallback((junction) => {
    if (junction.lat != null && junction.lng != null) {
      setFlyTo({ lat: junction.lat, lng: junction.lng, ts: Date.now() });
    }
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading ParkWatch AI…</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      <main className="dashboard">
        <KPICards stats={stats} />

        <DispatcherPanel topHotspots={topJunctions} />

        <section className="section" id="map-section">
          <h2 className="section-title">Violation Hotspot Map</h2>
          <MapView hotspots={hotspots} flyTo={flyTo} />
        </section>

        <section className="section" id="timeline-section">
          <h2 className="section-title">Hourly Violation Distribution</h2>
          <Timeline data={timeline} />
        </section>

        <section className="section" id="table-section">
          <h2 className="section-title">Top 10 Enforcement Zones</h2>
          <EnforcementTable data={topJunctions} onRowClick={handleRowClick} />
        </section>

      </main>

      <footer className="app-footer">
        <p>Data: Jan–May Police Violation Records</p>
      </footer>
    </div>
  );
}
