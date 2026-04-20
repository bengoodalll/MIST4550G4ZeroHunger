import { stuntingData as FALLBACK } from '../data/child-stunting.js';

export function initChart(container) {
  const data = FALLBACK;
  const d3 = window.d3;
  const HIGH_REGIONS = ['Sub-Saharan Africa', 'Southern Asia'];

  const margin = { top: 30, right: 30, bottom: 100, left: 50 };
  const totalW = Math.min(container.clientWidth || 700, 800);
  const totalH = 380;
  const w = totalW - margin.left - margin.right;
  const h = totalH - margin.top - margin.bottom;

  d3.select(container).selectAll('*').remove();

  const svg = d3.select(container)
    .append('svg')
    .attr('width', totalW).attr('height', totalH)
    .attr('aria-label', 'Grouped bar chart showing child stunting rates by region')
    .attr('role', 'img');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(data.map(d => d.region)).range([0, w]).padding(0.35);
  const y = d3.scaleLinear().domain([0, 40]).range([h, 0]);

  // Grid
  g.append('g').selectAll('line')
    .data(y.ticks(5)).enter().append('line')
    .attr('x1', 0).attr('x2', w)
    .attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', '#2E2820').attr('stroke-width', 1);

  // Axes
  const xAxis = g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).tickSize(0));
  xAxis.selectAll('text')
    .attr('fill', d => HIGH_REGIONS.includes(d) ? '#E8A33D' : '#7A7162')
    .attr('font-family', "'Inter', system-ui, sans-serif")
    .attr('font-size', '11px')
    .attr('transform', 'rotate(-40)')
    .style('text-anchor', 'end')
    .attr('dy', '0.3em').attr('dx', '-0.5em');
  xAxis.select('.domain').attr('stroke', '#2E2820');

  const yAxis = g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));
  yAxis.selectAll('text').attr('fill', '#7A7162').attr('font-family', "'JetBrains Mono', monospace").attr('font-size', '11px');
  yAxis.selectAll('line, path').attr('stroke', '#2E2820');

  // Bars
  const bars = g.selectAll('.bar')
    .data(data).enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.region))
    .attr('width', x.bandwidth())
    .attr('y', h)
    .attr('height', 0)
    .attr('fill', d => HIGH_REGIONS.includes(d.region) ? '#A64F2A' : '#C9A875')
    .attr('rx', 2);

  // Hover overlay for big number
  const overlay = g.append('text')
    .attr('class', 'hover-pct')
    .attr('text-anchor', 'middle')
    .attr('font-family', "'Fraunces', Georgia, serif")
    .attr('font-size', '48px')
    .attr('fill', '#E8A33D')
    .attr('opacity', 0)
    .attr('pointer-events', 'none');

  bars
    .on('mousemove', function(event, d) {
      const cx = x(d.region) + x.bandwidth() / 2;
      const cy = y(d.rate) - 12;
      overlay.attr('x', cx).attr('y', cy).attr('opacity', 1).text(`${d.rate}%`);
      d3.select(this).attr('opacity', 0.8);
    })
    .on('mouseleave', function() {
      overlay.attr('opacity', 0);
      d3.select(this).attr('opacity', 1);
    });

  container._stChart = { bars, y, h, data };
}

export function revealChart(container) {
  if (!container._stChart) return;
  const d3 = window.d3;
  const { bars, y, h } = container._stChart;

  bars.transition()
    .duration(800)
    .delay((d, i) => i * 80)
    .ease(d3.easeElasticOut.amplitude(1).period(0.5))
    .attr('y', d => y(d.rate))
    .attr('height', d => h - y(d.rate));
}
