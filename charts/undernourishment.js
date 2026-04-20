import { undernourishmentData as FALLBACK } from '../data/undernourishment-world.js';

async function loadData() {
  try {
    const url = 'https://ourworldindata.org/grapher/prevalence-of-undernourishment.csv?v=1&csvType=filtered&useColumnShortNames=true';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const rows = text.trim().split('\n').slice(1);
    const world = rows
      .map(r => r.split(','))
      .filter(cols => cols[1] === 'OWID_WRL' || cols[0] === 'World')
      .map(cols => ({ year: +cols[2], value: +cols[3] }))
      .filter(d => d.year >= 2000 && d.year <= 2024 && !isNaN(d.value));
    if (world.length > 5) {
      return world;
    }
  } catch (err) {
    console.warn('[undernourishment.js] Failed to fetch live data:', err.message);
  }
  return FALLBACK;
}

function renderChart(container, data) {
  const d3 = window.d3;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const totalW = container.clientWidth || 600;
  const totalH = isMobile ? 300 : Math.min(container.clientHeight * 0.7 || 420, 420);
  const w = totalW - margin.left - margin.right;
  const h = totalH - margin.top - margin.bottom;

  d3.select(container).selectAll('*').remove();

  const svg = d3.select(container)
    .append('svg')
    .attr('width', totalW)
    .attr('height', totalH)
    .attr('aria-label', 'Line chart showing global share of undernourished people from 2000 to 2024')
    .attr('role', 'img');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([2000, 2024]).range([0, w]);
  const y = d3.scaleLinear().domain([7, 14]).range([h, 0]);

  // Grid lines
  g.append('g')
    .attr('class', 'grid')
    .selectAll('line')
    .data(y.ticks(5))
    .enter().append('line')
    .attr('x1', 0).attr('x2', w)
    .attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', '#2E2820').attr('stroke-width', 1);

  // Axes
  const tickCount = w < 300 ? 5 : 8;
  const xAxis = g.append('g')
    .attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(tickCount));
  xAxis.selectAll('text')
    .attr('fill', '#7A7162')
    .attr('font-family', "'JetBrains Mono', monospace")
    .attr('font-size', '11px')
    .attr('transform', 'rotate(-40)')
    .style('text-anchor', 'end')
    .attr('dx', '-0.4em').attr('dy', '0.2em');
  xAxis.selectAll('line, path').attr('stroke', '#2E2820');

  const yAxis = g.append('g')
    .call(d3.axisLeft(y).tickFormat(d => `${d}%`).ticks(5));
  yAxis.selectAll('text').attr('fill', '#7A7162').attr('font-family', "'JetBrains Mono', monospace").attr('font-size', '11px');
  yAxis.selectAll('line, path').attr('stroke', '#2E2820');

  // Y label
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -h / 2).attr('y', -46)
    .attr('text-anchor', 'middle')
    .attr('fill', '#7A7162')
    .attr('font-family', "'JetBrains Mono', monospace")
    .attr('font-size', '11px')
    .text('% undernourished');

  // Post-2020 highlight band
  const band = g.append('rect')
    .attr('x', x(2020)).attr('y', 0)
    .attr('width', x(2024) - x(2020)).attr('height', h)
    .attr('fill', '#E8A33D').attr('opacity', 0);

  // Line path
  const line = d3.line().x(d => x(d.year)).y(d => y(d.value)).curve(d3.curveCatmullRom);
  const path = g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#C9A875')
    .attr('stroke-width', 2.5)
    .attr('d', line);

  const totalLength = path.node().getTotalLength();
  path
    .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
    .attr('stroke-dashoffset', totalLength);

  // Dots for special years
  const specialPoints = [
    { year: 2000, value: 12.7, color: '#C9A875' },
    { year: 2020, value: 8.8,  color: '#E8A33D' },
    { year: 2024, value: 8.2,  color: '#A64F2A' },
  ];

  specialPoints.forEach(pt => {
    const d = data.find(d => d.year === pt.year);
    if (!d) return;
    g.append('circle')
      .attr('cx', x(d.year)).attr('cy', y(d.value))
      .attr('r', 6).attr('fill', pt.color)
      .attr('opacity', 0)
      .attr('class', `dot-${pt.year}`);
  });

  // Zero Hunger 2030 target line
  g.append('line')
    .attr('x1', x(2000)).attr('x2', x(2030))
    .attr('y1', y(0)).attr('y2', y(0))
    .attr('stroke', '#A64F2A').attr('stroke-width', 1)
    .attr('stroke-dasharray', '4 4').attr('opacity', 0.4);

  g.append('text')
    .attr('x', x(2022)).attr('y', y(0.3))
    .attr('fill', '#A64F2A').attr('font-size', '10px')
    .attr('font-family', "'JetBrains Mono', monospace")
    .text('2030 target: 0%');

  // Expose animation handles for main.js scroll driver
  container._chart = { path, totalLength, band, x, y, data, g };
}

// Render with fallback immediately, then fetch live data and re-render if better.
// Returns a promise that resolves AFTER the final render (live or fallback).
export function initChart(container) {
  renderChart(container, FALLBACK);
  // Show the 2000 baseline dot immediately — chart is never fully blank
  const { driveChart } = { driveChart: (c, p) => {
    if (!c._chart) return;
    const { path, totalLength, band, g } = c._chart;
    const drawLength = totalLength * (p * 0.02);  // tiny initial draw
    path.attr('stroke-dashoffset', totalLength - drawLength);
    g.select('.dot-2000').attr('opacity', p > 0 ? 1 : 0);
    band.attr('opacity', 0);
  }};
  // Show the starting dot right away
  if (container._chart) {
    container._chart.g.select('.dot-2000').attr('opacity', 1);
  }

  return loadData().then(liveData => {
    if (liveData !== FALLBACK) {
      renderChart(container, liveData);
      // Restore starting dot after re-render
      if (container._chart) {
        container._chart.g.select('.dot-2000').attr('opacity', 1);
      }
    }
    // main.js .then() fires here — AFTER the final render
  });
}

export function driveChart(container, progress) {
  if (!container._chart) return;
  const { path, totalLength, band, x, y, data, g } = container._chart;
  const d3 = window.d3;

  // Three steps over progress 0→1:
  // 0.0–0.4: draw 2000–2019 segment
  // 0.4–0.7: continue to 2020 + dot
  // 0.7–1.0: complete to 2024 + band

  const dataLen = data.length; // 25 points
  const idx2019 = data.findIndex(d => d.year === 2019);
  const idx2020 = data.findIndex(d => d.year === 2020);
  const ratio2019 = idx2019 / (dataLen - 1);
  const ratio2020 = idx2020 / (dataLen - 1);

  let lineProgress;
  if (progress < 0.4) {
    lineProgress = (progress / 0.4) * ratio2019;
  } else if (progress < 0.7) {
    lineProgress = ratio2019 + ((progress - 0.4) / 0.3) * (ratio2020 - ratio2019);
  } else {
    lineProgress = ratio2020 + ((progress - 0.7) / 0.3) * (1 - ratio2020);
  }

  const drawLength = totalLength * lineProgress;
  path.attr('stroke-dashoffset', totalLength - drawLength);

  // Dots
  g.select('.dot-2000').attr('opacity', progress > 0.05 ? 1 : 0);
  g.select('.dot-2020').attr('opacity', progress > 0.45 ? Math.min((progress - 0.45) / 0.05, 1) : 0);
  g.select('.dot-2024').attr('opacity', progress > 0.75 ? Math.min((progress - 0.75) / 0.05, 1) : 0);

  // Band
  band.attr('opacity', progress > 0.75 ? Math.min((progress - 0.75) / 0.1, 1) * 0.12 : 0);
}
