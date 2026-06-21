import React from 'react';

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

export default function EnforcementTable({ data, onRowClick }) {
  if (!data || data.length === 0) return null;

  const scores = data.map((d) => d.score);
  const hasDominantViolation = data.some((d) => d.dominant_violation);

  return (
    <div className="table-card" id="enforcement-table-card">
      <table className="enforcement-table" id="enforcement-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Junction</th>
            <th>Violations</th>
            <th>Peak Hour</th>
            {hasDominantViolation && <th>Dominant Violation</th>}
            <th>Impact Score</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const priority = getPriority(row.score, scores);
            return (
              <tr
                key={row.cluster_id != null ? row.cluster_id : i}
                onClick={() => onRowClick && onRowClick(row)}
                title={`Click to locate ${row.junction_name || 'this cluster'} on map`}
                id={`table-row-${i}`}
              >
                <td style={{ fontWeight: 700, color: '#C0392B' }}>#{i + 1}</td>
                <td className="junction-name">{row.junction_name || '—'}</td>
                <td>{(row.violation_count || 0).toLocaleString('en-IN')}</td>
                <td>{row.peak_hour || '—'}</td>
                {hasDominantViolation && <td>{row.dominant_violation || '—'}</td>}
                <td style={{ fontWeight: 600 }}>{formatScore(row.score)}</td>
                <td>
                  <span className={`priority-badge priority-badge--${priority}`}>
                    {priority}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
