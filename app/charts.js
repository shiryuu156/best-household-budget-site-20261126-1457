// Household Ledger — small inline-SVG charts (no libraries, no network).
// Every chart is drawn from the numbers passed in, so the pictures always
// match the figures on the page.

function polar(cx, cy, radius, angleDeg) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

// Donut chart: slices = [{ label, value, color }]. The centre shows the total.
export function donutChart(slices, totalLabel, totalValue) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 96;
  const inner = 58;
  let angle = 0;
  let paths = '';
  for (const slice of slices) {
    if (slice.value <= 0) continue;
    const sweep = (slice.value / total) * 360;
    const [x1, y1] = polar(cx, cy, radius, angle);
    const [x2, y2] = polar(cx, cy, radius, angle + sweep);
    const large = sweep > 180 ? 1 : 0;
    paths += `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${cx} ${cy} Z" fill="${slice.color}" stroke="#fff" stroke-width="2"><title>${slice.label}: ${slice.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</title></path>`;
    angle += sweep;
  }
  // Inner circle cut-out (drawn as a filled circle over the pie).
  const centre = totalValue != null
    ? `<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-total">${totalValue}</text>
       <text x="${cx}" y="${cy + 18}" text-anchor="middle" class="donut-label">${totalLabel}</text>`
    : '';
  return `<svg viewBox="0 0 ${size} ${size}" class="chart donut" role="img" aria-label="Spending breakdown chart">
    ${paths}
    <circle cx="${cx}" cy="${cy}" r="${inner}" fill="#fff"></circle>
    ${centre}
  </svg>`;
}

// Vertical bar chart: bars = [{ label, value, color? }], with a value axis.
export function barChart(bars, { height = 220, format = (v) => '$' + Math.round(v).toLocaleString('en-US') } = {}) {
  const width = 560;
  const max = Math.max(...bars.map((b) => b.value), 1);
  const padTop = 26;
  const padBottom = 30;
  const padLeft = 8;
  const chartHeight = height - padTop - padBottom;
  const slot = (width - padLeft * 2) / bars.length;
  const barWidth = Math.min(64, slot * 0.62);
  let svg = `<svg viewBox="0 0 ${width} ${height}" class="chart bars" role="img" aria-label="Bar chart">`;
  svg += `<line x1="${padLeft}" y1="${height - padBottom}" x2="${width - padLeft}" y2="${height - padBottom}" stroke="#e2e8f0" stroke-width="1"></line>`;
  bars.forEach((bar, i) => {
    const barHeight = Math.max(2, (bar.value / max) * chartHeight);
    const x = padLeft + i * slot + (slot - barWidth) / 2;
    const y = height - padBottom - barHeight;
    const color = bar.color || '#2563eb';
    svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth}" height="${barHeight.toFixed(1)}" rx="4" fill="${color}"><title>${bar.label}: ${format(bar.value)}</title></rect>`;
    svg += `<text x="${(x + barWidth / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle" class="bar-value">${format(bar.value)}</text>`;
    svg += `<text x="${(x + barWidth / 2).toFixed(1)}" y="${height - 10}" text-anchor="middle" class="bar-label">${bar.label}</text>`;
  });
  svg += '</svg>';
  return svg;
}

// Horizontal progress rows: rows = [{ label, value, max, color, right }].
export function progressRows(rows) {
  return rows.map((row) => {
    const pct = row.max > 0 ? Math.min(100, (row.value / row.max) * 100) : 0;
    const over = row.value > row.max;
    return `<div class="prog-row">
      <div class="prog-head"><span class="prog-label"><span class="dot" style="background:${row.color}"></span>${row.label}</span><span class="prog-right">${row.right}</span></div>
      <div class="prog-track"><div class="prog-fill${over ? ' over' : ''}" style="width:${pct.toFixed(1)}%;background:${row.color}"></div></div>
    </div>`;
  }).join('');
}

// Legend for a donut chart: rows = [{ label, value, color }].
export function legend(rows, format) {
  return `<ul class="legend">${rows.map((row) => `<li><span class="dot" style="background:${row.color}"></span><span class="legend-label">${row.label}</span><span class="legend-value">${format(row.value)}</span></li>`).join('')}</ul>`;
}
