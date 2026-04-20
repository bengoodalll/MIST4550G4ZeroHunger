import { foodWasteData } from '../data/food-waste-2022.js';

// ── Food Waste Horizontal Stacked Bar Chart ────────────────────

export function initChart(container) {
  const d3 = window.d3;
  if (!d3) return;

  const keys = ['household', 'outOfHome', 'retail'];
  const colors = {
    household: '#C9A875',
    outOfHome: '#E8A33D',
    retail:    '#7A7162',
  };
  const labels = {
    household: 'Household',
    outOfHome: 'Out-of-home',
    retail:    'Retail',
  };

  const data = foodWasteData.map(d => ({
    ...d,
    total: d.household + d.outOfHome + d.retail,
  })).sort((a, b) => b.total - a.total);

  // Sizing
  let availW = container.offsetWidth || container.parentElement?.offsetWidth
             || container.closest('.container')?.offsetWidth || 700;
  availW = Math.min(availW, 860);

  const margin = { top: 24, right: 40, bottom: 44, left: 190 };
  const rowH   = 44;
  const totalH = data.length * rowH + margin.top + margin.bottom;
  const W      = availW - margin.left - margin.right;
  const H      = totalH - margin.top  - margin.bottom;

  d3.select(container).selectAll('*').remove();

  const svg = d3.select(container)
    .append('svg')
    .attr('width', availW)
    .attr('height', totalH)
    .attr('aria-label', 'Food waste per capita by region, 2022')
    .attr('role', 'img');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales
  const xMax = d3.max(data, d => d.total);
  const x    = d3.scaleLinear().domain([0, xMax * 1.05]).range([0, W]);
  const y    = d3.scaleBand().domain(data.map(d => d.region)).range([0, H]).padding(0.3);

  // Grid lines
  const gridG = g.append('g').attr('class', 'grid')
    .attr('transform', `translate(0,${H})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(-H).tickFormat(''));
  gridG.selectAll('line').attr('stroke', '#2E2820').attr('stroke-dasharray', '2,4');
  gridG.select('path').attr('stroke', 'none');

  // X axis
  const xAxisG = g.append('g').attr('transform', `translate(0,${H})`);
  xAxisG.call(d3.axisBottom(x).ticks(5).tickFormat(d => `${Math.round(d)} kg`));
  xAxisG.selectAll('text')
    .attr('fill', '#7A7162')
    .attr('font-family', "'JetBrains Mono', monospace")
    .attr('font-size', '10px');
  xAxisG.selectAll('line, path').attr('stroke', '#3E3830');

  // Stacked bars — start at width 0, store target in data-target-width
  const stack = d3.stack().keys(keys)(data);
  g.selectAll('.bar-group')
    .data(stack)
    .enter().append('g')
    .attr('class', 'bar-group')
    .each(function(layer) {
      d3.select(this).selectAll('rect')
        .data(layer)
        .enter().append('rect')
        .attr('class', 'bar-rect')
        .attr('y',      d => y(d.data.region))
        .attr('height', y.bandwidth())
        .attr('x',      d => x(d[0]))
        .attr('width',  0)                          // start at 0 for animation
        .attr('data-target-width', d => Math.max(0, x(d[1]) - x(d[0])))
        .attr('fill', d => {
          if (d.data.region === 'Sub-Saharan Africa') return '#A64F2A';
          return colors[layer.key];
        })
        .attr('rx', 1);
    });

  // Region labels — start invisible
  g.selectAll('.region-label')
    .data(data)
    .enter().append('text')
    .attr('class', 'region-label')
    .attr('x', -8)
    .attr('y', d => y(d.region) + y.bandwidth() / 2 + 4)
    .attr('text-anchor', 'end')
    .attr('fill', d => d.region === 'Sub-Saharan Africa' ? '#E8A33D' : '#C9BFA8')
    .attr('font-family', "'Inter', system-ui, sans-serif")
    .attr('font-size', '12px')
    .style('opacity', 0)
    .text(d => d.region);

  // Total labels — start invisible
  g.selectAll('.total-label')
    .data(data)
    .enter().append('text')
    .attr('class', 'total-label')
    .attr('x', d => x(d.total) + 6)
    .attr('y', d => y(d.region) + y.bandwidth() / 2 + 4)
    .attr('fill', '#7A7162')
    .attr('font-family', "'JetBrains Mono', monospace")
    .attr('font-size', '11px')
    .style('opacity', 0)
    .text(d => `${d.total} kg`);

  // Legend
  const legend = g.append('g').attr('transform', `translate(0, -18)`);
  keys.forEach((k, i) => {
    const lg = legend.append('g').attr('transform', `translate(${i * 110}, 0)`);
    lg.append('rect').attr('width', 10).attr('height', 10).attr('fill', colors[k]).attr('rx', 2);
    lg.append('text')
      .attr('x', 14).attr('y', 9)
      .attr('fill', '#7A7162')
      .attr('font-size', '10px')
      .attr('font-family', "'JetBrains Mono', monospace")
      .text(labels[k]);
  });

  // Tooltip
  let tooltip = d3.select('body').select('.chart-tooltip');
  if (tooltip.empty()) tooltip = d3.select('body').append('div').attr('class', 'chart-tooltip');
  g.selectAll('.bar-rect')
    .on('mousemove', function(event, d) {
      const layerKey = d3.select(this.parentNode).datum().key;
      tooltip
        .style('opacity', 1)
        .style('left', `${event.pageX + 14}px`)
        .style('top',  `${event.pageY - 32}px`)
        .html(`<strong>${d.data.region}</strong><br>${labels[layerKey]}: <strong>${d.data[layerKey]} kg/capita</strong>`);
    })
    .on('mouseleave', () => tooltip.style('opacity', 0));

  container._fwReady = true;
}

// ── Reveal: called by ScrollTrigger in main.js ─────────────────
// Uses GSAP (already on page) for reliable SVG attr animation
export function revealChart(container) {
  if (!container._fwReady) return;
  const gsap = window.gsap;
  if (!gsap) return;

  const bars   = Array.from(container.querySelectorAll('.bar-rect'));
  const labels = Array.from(container.querySelectorAll('.region-label, .total-label'));

  // Animate bars: width 0 → data-target-width, staggered by row
  gsap.to(bars, {
    attr: { width: (i, el) => parseFloat(el.getAttribute('data-target-width')) || 0 },
    duration: 0.75,
    ease: 'power2.out',
    stagger: { each: 0.035, from: 'start' },
  });

  // Fade in labels slightly after bars start
  gsap.to(labels, {
    opacity: 1,
    duration: 0.4,
    ease: 'power1.out',
    stagger: 0.04,
    delay: 0.3,
  });
}
