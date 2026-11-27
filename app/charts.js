// Nest Egg — charts.
// One clear job: turn numbers into inline SVG (donut + bars). No libraries,
// no canvas, no network. Pure functions of (label, value, colour) rows.

export function donutChart(rows, size) {
  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
  const radius = 62;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = rows.map((row) => {
    const frac = row.value / total;
    const len = frac * circumference;
    const seg = '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="none" stroke="' +
      row.color + '" stroke-width="26" stroke-dasharray="' + len.toFixed(1) + ' ' +
      (circumference - len).toFixed(1) + '" stroke-dashoffset="' + (-offset).toFixed(1) +
      '" transform="rotate(-90 ' + cx + ' ' + cy + ')" />';
    offset += len;
    return seg;
  }).join('');
  const hole = '<circle cx="' + cx + '" cy="' + cy + '" r="46" fill="#fffdf6" />' +
    '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-size="19" font-weight="800" fill="#1d2b26">$' +
    Math.round(total).toLocaleString('en-US') + '</text>' +
    '<text x="' + cx + '" y="' + (cy + 17) + '" text-anchor="middle" font-size="11" fill="#6b7a72">spent in Nov</text>';
  return '<svg viewBox="0 0 160 160" width="' + size + '" height="' + size +
    '" role="img" aria-label="Donut chart of spending by category">' + segments + hole + '</svg>';
}

export function barChart(rows, width, height) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  const gap = 10;
  const barW = Math.floor((width - gap * (rows.length - 1)) / rows.length);
  const base = height - 26;
  const scale = (height - 52) / max;
  let out = '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" role="img" aria-label="Bar chart of monthly spending">';
  rows.forEach((row, i) => {
    const h = Math.max(4, Math.round(row.value * scale));
    const x = i * (barW + gap);
    const y = base - h;
    const hot = i === rows.length - 1;
    out += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + h + '" rx="5" fill="' +
      (hot ? '#2f6f5e' : '#b9c9bd') + '" />';
    out += '<text x="' + (x + barW / 2) + '" y="' + (y - 6) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#1d2b26">$' +
      Math.round(row.value).toLocaleString('en-US') + '</text>';
    out += '<text x="' + (x + barW / 2) + '" y="' + (height - 8) + '" text-anchor="middle" font-size="11" fill="#6b7a72">' +
      row.label + '</text>';
  });
  out += '</svg>';
  return out;
}

export function progressBar(percent, color) {
  const safe = Math.max(0, Math.min(100, Math.round(percent)));
  return '<div class="bar-track" role="progressbar" aria-valuenow="' + safe +
    '" aria-valuemin="0" aria-valuemax="100"><div class="bar-fill" style="width:' + safe +
    '%;background:' + color + '"></div></div>';
}

export function legend(rows) {
  return '<ul class="legend">' + rows.map((row) =>
    '<li><span class="dot" style="background:' + row.color + '"></span>' + row.label +
    ' <b>' + row.valueText + '</b></li>'
  ).join('') + '</ul>';
}
