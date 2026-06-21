import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#C0392B', '#E74C3C', '#F39C12', '#E67E22', '#1C1C1E', '#8E8E93', '#3498DB', '#2ECC71'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div
      style={{
        background: '#fff',
        padding: '8px 12px',
        borderRadius: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.82rem',
      }}
    >
      <div style={{ fontWeight: 600 }}>{d.name}</div>
      <div style={{ color: d.payload.fill, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {(d.value || 0).toLocaleString('en-IN')}
      </div>
    </div>
  );
}

function DonutChart({ data, title, id }) {
  if (!data || data.length === 0) {
    return (
      <div className="breakdown-card" id={id}>
        <h3>{title}</h3>
        <div className="breakdown-chart-wrap" style={{ justifyContent: 'center', padding: '2rem', color: '#6B6B6B', fontSize: '0.9rem' }}>
          No breakdown data available
        </div>
      </div>
    );
  }

  return (
    <div className="breakdown-card" id={id}>
      <h3>{title}</h3>
      <div className="breakdown-chart-wrap">
        <ResponsiveContainer width={220} height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              stroke="none"
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <ul className="custom-legend">
          {data.map((entry, idx) => (
            <li key={entry.name}>
              <span className="legend-dot" style={{ background: COLORS[idx % COLORS.length] }} />
              <span>{entry.name}</span>
              <span className="legend-value">{(entry.value || 0).toLocaleString('en-IN')}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Breakdowns({ stats }) {
  if (!stats) return null;

  // Try multiple possible data shapes from stats.json
  let vehicleData = [];
  if (stats.vehicle_breakdown && Array.isArray(stats.vehicle_breakdown)) {
    vehicleData = stats.vehicle_breakdown.map((v) => ({
      name: v.type,
      value: v.count,
    }));
  } else if (stats.vehicle_type_distribution && typeof stats.vehicle_type_distribution === 'object') {
    vehicleData = Object.entries(stats.vehicle_type_distribution).map(([type, pct]) => ({
      name: type,
      value: Math.round((stats.total_violations || 298450) * pct / 100),
    }));
  }

  let violationData = [];
  if (stats.violation_breakdown && Array.isArray(stats.violation_breakdown)) {
    violationData = stats.violation_breakdown.map((v) => ({
      name: v.type,
      value: v.count,
    }));
  } else if (stats.violation_type_distribution && typeof stats.violation_type_distribution === 'object') {
    violationData = Object.entries(stats.violation_type_distribution).map(([type, pct]) => ({
      name: type,
      value: Math.round((stats.total_violations || 298450) * pct / 100),
    }));
  }

  return (
    <div className="breakdown-row" id="breakdown-row">
      <DonutChart data={violationData} title="Violation Type Breakdown" id="chart-violations" />
      <DonutChart data={vehicleData} title="Vehicle Type Breakdown" id="chart-vehicles" />
    </div>
  );
}
