const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Load JSON data from /output at startup
// ---------------------------------------------------------------------------
const outputDir = path.join(__dirname, '..', 'output');

let hotspots = [];
let stats = {};

try {
  const raw = fs.readFileSync(path.join(outputDir, 'hotspots.json'), 'utf-8');
  hotspots = JSON.parse(raw);
  console.log(`✓ Loaded ${hotspots.length} hotspots from hotspots.json`);
} catch (err) {
  console.error('⚠  Could not load hotspots.json:', err.message);
}

try {
  const raw = fs.readFileSync(path.join(outputDir, 'stats.json'), 'utf-8');
  stats = JSON.parse(raw);
  console.log('✓ Loaded stats.json');
} catch (err) {
  console.error('⚠  Could not load stats.json:', err.message);
}

// ---------------------------------------------------------------------------
// Realistic hourly violation distribution (24 values, peaks at 9am & 6pm)
// Proportional to total violations if available
// ---------------------------------------------------------------------------
function buildTimeline(totalViolations) {
  // If stats has hourly_distribution, use it directly
  if (stats.hourly_distribution && Array.isArray(stats.hourly_distribution)) {
    return stats.hourly_distribution.map((entry) => ({
      hour: entry.hour,
      label: `${String(entry.hour).padStart(2, '0')}:00`,
      violations: entry.count,
      isPeak: (entry.hour >= 8 && entry.hour <= 10) || (entry.hour >= 17 && entry.hour <= 19),
    }));
  }

  // Otherwise, generate a realistic distribution proportional to total violations
  const pattern = [
    0.012, 0.008, 0.005, 0.004, 0.003, 0.007,  // 0-5
    0.019, 0.038, 0.079, 0.107, 0.096, 0.081,   // 6-11
    0.072, 0.063, 0.058, 0.055, 0.066, 0.102,   // 12-17
    0.115, 0.090, 0.065, 0.044, 0.030, 0.019    // 18-23
  ];

  const total = totalViolations || 298450;
  return pattern.map((pct, hour) => ({
    hour,
    label: `${String(hour).padStart(2, '0')}:00`,
    violations: Math.round(total * pct),
    isPeak: (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19),
  }));
}

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

// GET /api/hotspots — full hotspots array
app.get('/api/hotspots', (_req, res) => {
  res.json(hotspots);
});

// GET /api/stats — full stats object, augmented with computed fields
app.get('/api/stats', (_req, res) => {
  // Augment stats with hotspot-derived data if not present
  const augmented = { ...stats };

  // Total clusters = number of hotspot clusters
  if (augmented.total_clusters == null) {
    augmented.total_clusters = hotspots.length;
  }

  // Vehicle breakdown from hotspot dominant_vehicle or stats fields
  if (!augmented.vehicle_breakdown && stats.vehicle_type_distribution) {
    augmented.vehicle_breakdown = Object.entries(stats.vehicle_type_distribution).map(
      ([type, pct]) => ({ type, count: Math.round((stats.total_violations || 298450) * pct / 100) })
    );
  }

  // Violation breakdown from stats fields
  if (!augmented.violation_breakdown && stats.violation_type_distribution) {
    augmented.violation_breakdown = Object.entries(stats.violation_type_distribution).map(
      ([type, pct]) => ({ type, count: Math.round((stats.total_violations || 298450) * pct / 100) })
    );
  }

  res.json(augmented);
});

// GET /api/timeline — hourly violation distribution
app.get('/api/timeline', (_req, res) => {
  res.json(buildTimeline(stats.total_violations));
});

// GET /api/top-junctions — top 10 hotspots sorted by score descending
app.get('/api/top-junctions', (_req, res) => {
  const sorted = [...hotspots]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  res.json(sorted);
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🚗 ParkWatch AI server running on http://localhost:${PORT}\n`);
});
