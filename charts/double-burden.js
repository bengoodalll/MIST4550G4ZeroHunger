import { overweightData, TARGET_2030 } from '../data/overweight-children.js';

export function initChart(container) {
  const d3 = window.d3;
  if (!d3) return;

  const data = overweightData;
  const margin = { top: 40, right: 30, bottom: 80, left: 50 };
  const totalW = Math.min(container.clientWidth || 700, 860);
  const totalH = 380;
  const W = totalW - margin.left - margin.right;
  const H = totalH - margin.top - margin.bottom;

  d3.select(container).selectAll('*').remove();

  const svg = d3.select(container)
    .append('svg')
    .attr('width', totalW).attr('height', totalH)
    .attr('aria-label', 'Grouped bar chart comparing overweight children under 5 by region, 2012 vs 2022')
    .attr('role', 'img');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const regions = data.map(d => d.region);
  const x0 = d3.scaleBand().domain(regions).range([0, W]).paddingInner(0.28).paddingOuter(0.08);
  const x1 = d3.scaleBand().domain(['r2012', 'r2022']).range([0, x0.bandwidth()]).padding(0.08);
  const y = d3.scaleLinear().domain([0, 11]).range([H, 0]);

  const colors = { r2012: '#7A7162', r2022: '#E8A33D' };

  // Grid
  g.append('g').selectAll('line')
    .data(y.ticks(5)).enter().append('line')
    .attr('x1', 0).attr('x2', W)
    .attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', '#2E2820').attr('stroke-width', 1);

  // Axes
  const xAxis = g.append('g').attr('transform', `translate(0,${H})`).call(d3.axisBottom(x0).tickSize(0));
  xAxis.select('.domain').attr('stroke', '#2E2820');
  xAxis.selectAll('.tick text')
    .attr('fill', '#7A7162')
    .attr('font-family', "'Inter', system-ui, sans-serif")
    .attr('font-size', '10px')
    .each(function(d) {
      const el = d3.select(this);
      el.text('');
      const lines = d.split('\n');
      lines.forEach((line, i) => {
        el.append('tspan')
          .attr('x', 0).attr('dy', i === 0 ? '1.2em' : '1.1em')
          .text(line);
      });
    });

  const yAxis = g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));
  yAxis.selectAll('text').attr('fill', '#7A7162').attr('font-family', "'JetBrains Mono', monospace").attr('font-size', '11px');
  yAxis.selectAll('line, path').attr('stroke', '#2E2820');

  // Target line at 3%
  g.append('line')
    .attr('x1', 0).attr('x2', W)
    .attr('y1', y(TARGET_2030)).attr('y2', y(TARGET_2030))
    .attr('stroke', '#C9A875').attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4')
    .attr('opacity', 0.9);

  g.append('text')
    .attr('x', W + 4).attr('y', y(TARGET_2030) + 4)
    .attr('fill', '#C9A875').attr('font-size', '10px')
    .attr('font-family', "'JetBrains Mono', monospace")
    .text('2030 target 3%');

  // Bars (start at height 0)
  const barGroups = g.selectAll('.bar-group')
    .data(data).enter().append('g')
    .attr('class', 'bar-group')
    .attr('transform', d => `translate(${x0(d.region)},0)`);

  ['r2012', 'r2022'].forEach(key => {
    barGroups.append('rect')
      .attr('class', `bar bar-${key}`)
      .attr('x', x1(key))
      .attr('width', x1.bandwidth())
      .attr('y', H)
      .attr('height', 0)
      .attr('fill', colors[key])
      .attr('rx', 2)
      .attr('data-val', d => d[key])
      .on('mousemove', function(event, d) {
        const val = d[key];
        const year = key === 'r2012' ? '2012' : '2022';
        d3.select('.db-tooltip')
          .style('opacity', 1)
          .style('left', `${event.pageX + 14}px`)
          .style('top',  `${event.pageY - 32}px`)
          .html(`<strong>${d.region.replace('\n', ' ')}</strong><br>${year}: <strong>${val}%</strong>`);
        d3.select(this).attr('opacity', 0.75);
      })
      .on('mouseleave', function() {
        d3.select('.db-tooltip').style('opacity', 0);
        d3.select(this).attr('opacity', 1);
      });
  });

  // Legend
  const legend = g.append('g').attr('transform', `translate(0,-24)`);
  [['r2012', '2012'], ['r2022', '2022']].forEach(([key, label], i) => {
    const lg = legend.append('g').attr('transform', `translate(${i * 80}, 0)`);
    lg.append('rect').attr('width', 10).attr('height', 10).attr('fill', colors[key]).attr('rx', 2);
    lg.append('text').attr('x', 14).attr('y', 9)
      .attr('fill', '#7A7162').attr('font-size', '10px')
      .attr('font-family', "'JetBrains Mono', monospace")
      .text(label);
  });

  // Tooltip
  let tip = d3.select('body').select('.db-tooltip');
  if (tip.empty()) {
    tip = d3.select('body').append('div').attr('class', 'db-tooltip chart-tooltip');
  }

  container._dbChart = { barGroups, y, H };
}

  if (!gsap) return;

  barGroups.each(function(d, i) {
    const bars = this.querySelectorAll('rect');
    gsap.to(bars, {
      attr: {
        y: (j, el) => {
          const val = parseFloat(el.getAttribute('data-val'));
          return y(val);
        },
        height: (j, el) => {
          const val = parseFloat(el.getAttribute('data-val'));
          return H - y(val);
        },
      },
      duration: 0.75,
      ease: 'power2.out',
      delay: i * 0.06,
      stagger: 0.05,
    });
  });
}
