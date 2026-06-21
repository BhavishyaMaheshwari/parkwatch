import React, { useState } from 'react';

function getPriority(score, scores) {
  const sorted = [...new Set(scores)].sort((a, b) => b - a);
  const rank = sorted.indexOf(score);
  const pct = rank / sorted.length;
  if (pct < 0.3) return 'high';
  if (pct < 0.6) return 'medium';
  return 'low';
}

function formatScore(score) {
  if (score == null) return '—';
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
  if (score >= 1_000) return `${(score / 1_000).toFixed(1)}K`;
  return score.toFixed(1);
}

function classifyJunction(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('metro') || n.includes('station')) {
    return { type: 'Metro Spillover', class: 'metro' };
  }
  if (n.includes('market') || n.includes('plaza') || n.includes('street') || n.includes('commercial') || n.includes('bazaar') || n.includes('mall')) {
    return { type: 'Commercial Hub', class: 'commercial' };
  }
  if (n.includes('theatre') || n.includes('park') || n.includes('mantapa') || n.includes('stadium') || n.includes('temple')) {
    return { type: 'Event/Ent. Spillover', class: 'event' };
  }
  if (n.includes('junction') || n.includes('circle') || n.includes('bridge') || n.includes('cross') || n.includes('flyover') || n.includes('road')) {
    return { type: 'Intersection Blockage', class: 'intersection' };
  }
  return { type: 'Carriageway Choke', class: 'general' };
}

export default function EnforcementTable({ data, onRowClick }) {
  const [activeTab, setActiveTab] = useState('all');

  if (!data || data.length === 0) return null;

  const scores = data.map((d) => d.score);
  const hasDominantViolation = data.some((d) => d.dominant_violation);

  // Classify all zones first
  const classifiedData = data.map((item) => ({
    ...item,
    zone: classifyJunction(item.junction_name),
  }));

  // Filter based on active tab
  const filteredData = activeTab === 'all'
    ? classifiedData
    : classifiedData.filter((item) => item.zone.class === activeTab);

  const TABS = [
    { id: 'all', label: 'All Zones' },
    { id: 'intersection', label: 'Intersections' },
    { id: 'commercial', label: 'Commercial Hubs' },
    { id: 'metro', label: 'Metro Stations' },
    { id: 'event', label: 'Event Venues' },
  ];

  return (
    <div className="table-card" id="enforcement-table-card" style={{ padding: '1.5rem' }}>
      <div className="filter-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="enforcement-table" id="enforcement-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Junction</th>
              <th>Zone Type</th>
              <th>Violations</th>
              {hasDominantViolation && <th>Dominant Violation</th>}
              <th>Impact Score</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={hasDominantViolation ? 7 : 6} style={{ textAlign: 'center', padding: '2rem', color: '#6b6b6b' }}>
                  No hotspots found matching this classification filter.
                </td>
              </tr>
            ) : (
              filteredData.map((row, i) => {
                const priority = getPriority(row.score, scores);
                // Calculate the true sorted rank across the dataset (using original index)
                const trueRank = data.findIndex((d) => d.junction_name === row.junction_name) + 1;
                return (
                  <tr
                    key={row.cluster_id != null ? row.cluster_id : i}
                    onClick={() => onRowClick && onRowClick(row)}
                    title={`Click to locate ${row.junction_name || 'this cluster'} on map`}
                    id={`table-row-${i}`}
                  >
                    <td style={{ fontWeight: 700, color: '#C0392B' }}>#{trueRank}</td>
                    <td className="junction-name">{row.junction_name || '—'}</td>
                    <td>
                      <span className={`zone-badge zone-badge--${row.zone.class}`}>
                        {row.zone.type}
                      </span>
                    </td>
                    <td>{(row.violation_count || 0).toLocaleString('en-IN')}</td>
                    {hasDominantViolation && <td>{row.dominant_violation || '—'}</td>}
                    <td style={{ fontWeight: 600 }}>{formatScore(row.score)}</td>
                    <td>
                      <span className={`priority-badge priority-badge--${priority}`}>
                        {priority}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
