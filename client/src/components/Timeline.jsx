import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';

const PEAK_BANDS = [
  { x1: 8, x2: 11, label: 'Morning Rush' },
  { x1: 17, x2: 20, label: 'Evening Rush' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: '#fff',
        padding: '10px 14px',
        borderRadius: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.82rem',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.label || `${String(d.hour).padStart(2, '0')}:00`}</div>
      <div style={{ color: '#C0392B', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        {(d.violations || 0).toLocaleString()} violations
      </div>
      {d.isPeak && (
        <div style={{ fontSize: '0.75rem', color: '#F39C12', marginTop: 2, fontWeight: 500 }}>
          Peak Hour
        </div>
      )}
    </div>
  );
}

export default function Timeline({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="timeline-card" id="timeline-card">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="crimsonGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C0392B" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#C0392B" stopOpacity={0.03} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />

          {/* Peak hour background bands */}
          {PEAK_BANDS.map((band) => (
            <ReferenceArea
              key={band.x1}
              x1={band.x1}
              x2={band.x2}
              fill="#C0392B"
              fillOpacity={0.06}
              strokeOpacity={0}
            />
          ))}

          <XAxis
            dataKey="hour"
            tickFormatter={(h) => `${String(h).padStart(2, '0')}:00`}
            tick={{ fontSize: 11, fill: '#6B6B6B' }}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B6B6B' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="violations"
            stroke="#C0392B"
            strokeWidth={2.5}
            fill="url(#crimsonGradient)"
            activeDot={{ r: 5, fill: '#C0392B', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
