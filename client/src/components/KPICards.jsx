import React from 'react';

export default function KPICards({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      id: 'kpi-violations',
      label: 'Total Violations',
      value: formatNumber(stats.total_violations),
      iconClass: 'kpi-icon--violations',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      id: 'kpi-clusters',
      label: 'Hotspot Clusters',
      value: stats.total_clusters != null ? stats.total_clusters : '—',
      iconClass: 'kpi-icon--clusters',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <circle cx="19" cy="5" r="2" />
          <circle cx="5" cy="5" r="2" />
          <circle cx="5" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
          <line x1="12" y1="9" x2="12" y2="3" />
          <line x1="14.5" y1="13.5" x2="19" y2="17" />
          <line x1="9.5" y1="13.5" x2="5" y2="17" />
        </svg>
      ),
    },
    {
      id: 'kpi-response',
      label: 'Avg Resolution Time',
      value: formatDuration(stats.avg_duration_minutes),
      iconClass: 'kpi-icon--time',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: 'kpi-violation-type',
      label: 'Top Violation Type',
      value: stats.top_violation_type || '—',
      iconClass: 'kpi-icon--type',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
    },
  ];

  return (
    <div className="kpi-row" id="kpi-section">
      {cards.map((card) => (
        <div className="kpi-card" key={card.id} id={card.id}>
          <div className={`kpi-icon ${card.iconClass}`}>{card.icon}</div>
          <div className="kpi-value">{card.value}</div>
          <div className="kpi-label">{card.label}</div>
        </div>
      ))}
    </div>
  );
}

function formatNumber(n) {
  if (n == null) return '—';
  return n.toLocaleString('en-IN');
}

function formatDuration(minutes) {
  if (minutes == null) return '—';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = minutes / 60;
  if (hrs < 24) return `${hrs.toFixed(1)} hrs`;
  const days = hrs / 24;
  return `${days.toFixed(1)} days`;
}
