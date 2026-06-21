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

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(0, 54, 49, 0.15)',
        padding: '10px 14px',
        borderRadius: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        fontFamily: 'var(--font-body), serif',
        fontSize: '0.9rem',
        color: '#1C1C1E',
      }}
    >
      <div style={{ fontFamily: 'var(--font-heading), serif', fontWeight: 700, marginBottom: 4, color: '#003631' }}>
        {d.label || `${String(d.hour).padStart(2, '0')}:00`}
      </div>
      <div style={{ color: '#003631', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {(d.violations || 0).toLocaleString()} violations
      </div>
      {d.isPeak && (
        <div style={{ fontSize: '0.8rem', color: '#c0392b', marginTop: 2, fontWeight: 700 }}>
          Peak Congestion Hour
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
            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#003631" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#003631" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,54,49,0.06)" />

          {/* Peak hour background bands */}
          {PEAK_BANDS.map((band) => (
            <ReferenceArea
              key={band.x1}
              x1={band.x1}
              x2={band.x2}
              fill="#ffeda8"
              fillOpacity={0.35}
              strokeOpacity={0}
            />
          ))}

          <XAxis
            dataKey="hour"
            tickFormatter={(h) => `${String(h).padStart(2, '0')}:00`}
            tick={{ fontSize: 11, fill: '#555555' }}
            axisLine={{ stroke: 'rgba(0,54,49,0.15)' }}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#555555' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="violations"
            stroke="#003631"
            strokeWidth={2.5}
            fill="url(#greenGradient)"
            activeDot={{ r: 5, fill: '#003631', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
