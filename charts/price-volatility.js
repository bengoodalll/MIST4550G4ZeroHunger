import { foodPricesData } from '../data/food-prices.js';

export function initChart(container) {
  const d3 = window.d3;
  if (!d3) return;

  const data = foodPricesData;
  const margin = { top: 40, right: 50, bottom: 50, left: 55 };
  const totalW = Math.min(container.clientWidth || 700, 860);
  const totalH = 340;
  const W = totalW - margin.left - margin.right;
  const H = totalH - margin.top - margin.bottom;

  d3.select(container).selectAll('*').remove();

  const svg = d3.select(container)
    .append('svg')
    .attr('width', totalW).attr('height', totalH)
    .attr('aria-label', 'Area chart showing proportion of countries with high food prices, 2015 to 2021')
    .attr('role', 'img');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([2015, 2021]).range([0, W]);
  const y = d3.scaleLinear().domain([0, 56]).range([H, 0]);

  // Grid
  g.append('g').selectAll('line')
    .data(y.ticks(5)).enter().append('line')
    .attr('x1', 0).attr('x2', W)
    .attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', '#2E2820').attr('stroke-width', 1);

  // Axes
  const xAxis = g.append('g').attr('transform', `translate(0,${H})`).call(
    d3.axisBottom(x).tickFormat(d3.format('d')).ticks(7).tickSize(0)
  );
  xAxis.select('.domain').attr('stroke', '#2E2820');
  xAxis.selectAll('text').attr('fill', '#7A7162').attr('font-family', "'JetBrains Mono', monospace").attr('font-size', '11px').attr('dy', '1.4em').attr('dx', '-0.2em');

  const yAxis = g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));
  yAxis.selectAll('text').attr('fill', '#7A7162').attr('font-family', "'JetBrains Mono', monospace").attr('font-size', '11px');
  yAxis.selectAll('line, path').attr('stroke', '#2E2820');

  // COVID annotation band
  g.append('rect')
    .attr('x', x(2019.5)).attr('width', x(2020.5) - x(2019.5))
    .attr('y', 0).attr('height', H)
    .attr('fill', '#A64F2A').attr('opacity', 0.08);

  g.append('text')
    .attr('x', x(2020)).attr('y', -10)
    .attr('text-anchor', 'middle')
    .attr('fill', '#A64F2A').attr('font-size', '10px')
    .attr('font-family', "'JetBrains Mono', monospace")
    .text('COVID-19');

  // Area generator
  const area = d3.area()
    .x(d => x(d.year))
    .y0(H)
    .y1(d => y(d.pct))
    .curve(d3.curveMonotoneX);

  // Line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.pct))
    .curve(d3.curveMonotoneX);

  // Area fill (fade in via opacity)
  g.append('path')
    .datum(data)
    .attr('class', 'pv-area')
    .attr('fill', '#E8A33D')
    .attr('opacity', 0)
    .attr('d', area);

  // Line stroke (animated via stroke-dashoffset)
  const path = g.append('path')
    .datum(data)
    .attr('class', 'pv-line')
    .attr('fill', 'none')
    .attr('stroke', '#E8A33D')
    .attr('stroke-width', 2.5)
    .attr('d', line);

  const totalLength = path.node().getTotalLength();
  path
    .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
    .attr('stroke-dashoffset', totalLength);

  // Dots (start invisible)
  g.selectAll('.pv-dot')
    .data(data).enter().append('circle')
    .attr('class', 'pv-dot')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.pct))
    .attr('r', d => d.year === 2020 ? 6 : 4)
    .attr('fill', d => d.year === 2020 ? '#A64F2A' : '#E8A33D')
    .attr('stroke', '#1A1612').attr('stroke-width', 1.5)
    .attr('opacity', 0)
    .on('mousemove', function(event, d) {
      d3.select('.pv-tooltip')
        .style('opacity', 1)
        .style('left', `${event.pageX + 14}px`)
        .style('top',  `${event.pageY - 32}px`)
        .html(`<strong>${d.year}</strong>: <strong>${d.pct}%</strong> of countries`);
      d3.select(this).attr('r', d.year === 2020 ? 8 : 6);
    })
    .on('mouseleave', function(event, d) {
      d3.select('.pv-tooltip').style('opacity', 0);
      d3.select(this).attr('r', d.year === 2020 ? 6 : 4);
    });

  // 2020 label
  const peak = data.find(d => d.year === 2020);
  g.append('text')
    .attr('class', 'pv-peak-label')
    .attr('x', x(peak.year)).attr('y', y(peak.pct) - 14)
    .attr('text-anchor', 'middle')
    .attr('fill', '#A64F2A').attr('font-size', '13px').attr('font-weight', '600')
    .attr('font-family', "'JetBrains Mono', monospace")
    .attr('opacity', 0)
    .text(`${peak.pct}%`);

  // Tooltip
  let tip = d3.select('body').select('.pv-tooltip');
  if (tip.empty()) {
    tip = d3.select('body').append('div').attr('class', 'pv-tooltip chart-tooltip');
  }

  container._pvChart = { path, totalLength, dots: g.selectAll('.pv-dot'), area: g.select('.pv-area'), peakLabel: g.select('.pv-peak-label') };
}

export function revealChart(container) {
  if (!container._pvChart) return;
  const { path, totalLength, dots, area, peakLabel } = container._pvChart;
  const gsap = window.gsap;
  if (!gsap) return;

  // Draw the line
  gsap.to(path.node(), {
    strokeDashoffset: 0,
    duration: 1.4,
    ease: 'power2.inOut',
  });

  // Fade area fill
  gsap.to(area.node(), {
    opacity: 0.15,
    duration: 1.0,
    delay: 0.4,
    ease: 'power1.out',
  });

  // Pop dots
  dots.each(function(d, i) {
    gsap.to(this, {
      opacity: 1,
      duration: 0.3,
      delay: 0.3 + i * 0.12,
      ease: 'power2.out',
    });
  });

  // Peak label
  gsap.to(peakLabel.node(), {
    opacity: 1,
    duration: 0.4,
    delay: 1.1,
    ease: 'power1.out',
  });
}
