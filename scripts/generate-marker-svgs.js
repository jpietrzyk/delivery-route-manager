// Usage: node scripts/generate-marker-svgs.js
// Generates SVG marker icons for each color in the config below
const fs = require('fs');
const path = require('path');

const markers = [
  // Priority
  { name: 'priority-low', color: '#fd5c63' },
  { name: 'priority-medium', color: '#BD3039' },
  { name: 'priority-high', color: '#C6011F' },
  // Status
  { name: 'status-pending', color: '#90EE90' },
  { name: 'status-in-progress', color: '#3CB371' },
  { name: 'status-completed', color: '#2E8B57' },
  { name: 'status-cancelled', color: '#444C38' },
  // Amount
  { name: 'amount-low', color: '#eec0c8' },
  { name: 'amount-medium', color: '#F9629F' },
  { name: 'amount-high', color: '#FF00FF' },
  // Complexity
  { name: 'complexity-simple', color: '#F0E68C' },
  { name: 'complexity-moderate', color: '#FFFF00' },
  { name: 'complexity-complex', color: '#FEBE10' },
];

const svgTemplate = (color) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="12.5" cy="12" rx="10" ry="10" fill="${color}" stroke="#222" stroke-width="2"/>
  <path d="M12.5 40C13.5 40 22.5 25 12.5 25C2.5 25 11.5 40 12.5 40Z" fill="${color}" stroke="#222" stroke-width="2"/>
</svg>
`;

const outDir = path.join(__dirname, '../public/markers');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

markers.forEach(({ name, color }) => {
  const svg = svgTemplate(color);
  const filePath = path.join(outDir, `marker-${name}.svg`);
  fs.writeFileSync(filePath, svg, 'utf8');
  console.log(`Generated: ${filePath}`);
});

console.log('All marker SVGs generated.');
