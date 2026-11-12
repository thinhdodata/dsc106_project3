/* DSC 106 Project 3 — D3 only (no high-level plotting libraries).
   The CSV contains 8 published decadal raw multi-model means from CMIP6.
   See README.md and DATA_SOURCES.md for provenance and limitations. */
(() => {
  'use strict';

  // The CDN is an external dependency; fail visibly if it is unavailable.
  if (!window.d3) {
    const svg = document.getElementById('main-chart');
    if (svg) svg.outerHTML = '<p role="alert" style="color:#8e4242;padding:25px">D3 did not load. Please check your internet connection and refresh the page.</p>';
    return;
  }

  const scenarios = [
    { id: 'SSP1-1.9', color: '#2c7378', models: 14 },
    { id: 'SSP1-2.6', color: '#477aa3', models: 41 },
    { id: 'SSP2-4.5', color: '#b48732', models: 42 },
    { id: 'SSP3-7.0', color: '#b86c45', models: 35 },
    { id: 'SSP5-8.5', color: '#a9434b', models: 44 }
  ];
  const scenarioIds = scenarios.map(d => d.id);
  const colorById = Object.fromEntries(scenarios.map(d => [d.id, d.color]));
  const referenceId = 'SSP1-1.9';
  const format2 = d3.format('.2f');
  const degree = n => `${format2(n)}°C`;
  const shortPeriod = p => `${p.slice(0, 4)}–${p.slice(7)}`;

  const state = {
    active: new Set(scenarioIds),
    periodIndex: 7,
    measure: 'warming',
    threshold: true
  };
  let data;
  let hovered = null;

  function value(row, id) {
    return state.measure === 'warming' ? row[id] : row[id] - row[referenceId];
  }
  function visibleIds() {
    return scenarioIds.filter(id => state.active.has(id));
  }
  function setPeriod(index) {
    state.periodIndex = Math.max(0, Math.min(data.length - 1, index));
    hovered = null;
    render();
  }
  function setActive(ids) {
    state.active = new Set(ids);
    updateScenarioCheckboxes();
    hovered = null;
    render();
  }
  function dataSpread(row, ids) {
    if (ids.length < 2) return null;
    const values = ids.map(id => row[id]);
    return d3.max(values) - d3.min(values);
  }

  function setupControls() {
    const list = d3.select('#scenario-list');
    const items = list.selectAll('label').data(scenarios).join('label').attr('class', 'scenario-item');
    items.append('input')
      .attr('type', 'checkbox')
      .attr('aria-label', d => `Show ${d.id}`)
      .property('checked', true)
      .on('change', (event, d) => {
        if (event.currentTarget.checked) state.active.add(d.id);
        else state.active.delete(d.id);
        hovered = null;
        render();
      });
    items.append('span').attr('class', 'scenario-swatch').style('background', d => d.color).attr('aria-hidden', 'true');
    items.append('span').attr('class', 'scenario-name').text(d => d.id);
    items.append('span').attr('class', 'scenario-models').text(d => `n=${d.models}`).attr('title', 'Number of models contributing to this raw mean');

    d3.select('#show-all').on('click', () => setActive(scenarioIds));
    d3.select('#show-extremes').on('click', () => setActive(['SSP1-1.9', 'SSP5-8.5']));
    d3.selectAll('input[name="measure"]').on('change', event => {
      state.measure = event.currentTarget.value;
      hovered = null;
      render();
    });
    d3.select('#threshold').on('change', event => {
      state.threshold = event.currentTarget.checked;
      render();
    });
    d3.select('#decade-range').on('input', event => setPeriod(+event.currentTarget.value));
    d3.select('#early-button').on('click', () => setPeriod(0));
    d3.select('#late-button').on('click', () => setPeriod(data.length - 1));
    d3.select('#reset-view').on('click', () => {
      state.active = new Set(scenarioIds);
      state.periodIndex = 7;
      state.measure = 'warming';
      state.threshold = true;
      hovered = null;
      d3.selectAll('input[name="measure"]').property('checked', function () { return this.value === 'warming'; });
      d3.select('#threshold').property('checked', true);
      updateScenarioCheckboxes();
      render();
    });
  }

  function updateScenarioCheckboxes() {
    d3.select('#scenario-list').selectAll('label').select('input')
      .property('checked', d => state.active.has(d.id));
  }

  function renderControls() {
    const current = data[state.periodIndex];
    d3.select('#decade-range').property('value', state.periodIndex);
    d3.select('#decade-label').text(current.period.replace('-', '–'));
    d3.select('#selected-heading-decade').text(current.period.replace('-', '–'));
    d3.select('#early-button').classed('is-current', state.periodIndex === 0);
    d3.select('#late-button').classed('is-current', state.periodIndex === data.length - 1);
    d3.select('#threshold').property('disabled', state.measure === 'difference');
    d3.select('#measure-help').text(state.measure === 'warming'
      ? 'Absolute temperature change relative to 1850–1900.'
      : 'Within each decade, subtract the SSP1-1.9 mean. That baseline is always 0°C.');
    d3.select('#main-chart-title').text(state.measure === 'warming'
      ? 'Projected global warming' : 'Additional warming relative to SSP1-1.9');
    d3.select('#main-chart-subtitle').text(state.measure === 'warming'
      ? 'Global mean surface-air temperature anomaly · °C above 1850–1900'
      : 'Difference between each pathway and SSP1-1.9 in the same decade · °C');
    d3.select('#rank-unit').text(state.measure === 'warming' ? 'Warming (°C)' : 'Difference (°C)');
    d3.select('#rank-desc').text(state.measure === 'warming'
      ? 'Pathways shown in order of projected warming for the selected decade.'
      : 'Each pathway minus SSP1-1.9 in the selected decade.');
  }

  function renderMainChart() {
    const W = 950, H = 444;
    const m = { top: 37, right: 122, bottom: 58, left: 74 };
    const svg = d3.select('#main-chart');
    svg.selectAll('*').remove();
    svg.append('desc').attr('id', 'main-chart-desc').text(
      'Projected CMIP6 global warming across eight decadal periods. Visible scenarios: ' +
      (visibleIds().join(', ') || 'none') + '. Selected decade: ' + data[state.periodIndex].period + '.'
    );
    const ids = visibleIds();
    const yMax = state.measure === 'warming' ? 6 : 4.2;
    const x = d3.scalePoint().domain(data.map(d => d.period)).range([m.left, W - m.right]);
    const y = d3.scaleLinear().domain([0, yMax]).range([H - m.bottom, m.top]);
    const yTicks = state.measure === 'warming' ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4];

    svg.append('g').selectAll('line').data(yTicks).join('line')
      .attr('class', 'grid-line').attr('x1', m.left).attr('x2', W - m.right)
      .attr('y1', d => y(d)).attr('y2', d => y(d));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.left},0)`)
      .call(d3.axisLeft(y).tickValues(yTicks).tickFormat(d => `${d}°`).tickSizeOuter(0).tickSize(4));
    svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.bottom})`)
      .call(d3.axisBottom(x).tickFormat(shortPeriod).tickSize(4).tickPadding(10).tickSizeOuter(0));
    svg.append('text').attr('class', 'axis-title').attr('x', m.left).attr('y', 17)
      .text(state.measure === 'warming' ? 'Warming above 1850–1900 (°C)' : 'Difference from SSP1-1.9 (°C)');

    if (state.measure === 'warming' && state.threshold) {
      svg.append('line').attr('x1', m.left).attr('x2', W - m.right)
        .attr('y1', y(2)).attr('y2', y(2)).attr('stroke', '#b97378')
        .attr('stroke-dasharray', '6 5').attr('stroke-width', 1.3);
      svg.append('text').attr('class', 'threshold-label').attr('x', m.left + 8).attr('y', y(2) - 8)
        .text('2°C reference');
    }
    if (state.measure === 'difference') {
      svg.append('line').attr('x1', m.left).attr('x2', W - m.right)
        .attr('y1', y(0)).attr('y2', y(0)).attr('stroke', '#93a1a4').attr('stroke-width', 1.3);
    }

    const currentPeriod = data[state.periodIndex].period;
    const highlight = svg.append('g').attr('aria-hidden', 'true');
    highlight.append('line').attr('x1', x(currentPeriod)).attr('x2', x(currentPeriod))
      .attr('y1', m.top).attr('y2', H - m.bottom)
      .attr('stroke', '#7a9194').attr('stroke-width', 1.1).attr('stroke-dasharray', '3 5');
    highlight.append('rect').attr('x', x(currentPeriod) - 6).attr('y', m.top)
      .attr('width', 12).attr('height', H - m.bottom - m.top).attr('fill', '#b4c6c5').attr('opacity', .1);

    const line = d3.line().x(d => x(d.period)).y(d => y(d.n)).defined(d => Number.isFinite(d.n));
    const plot = svg.append('g').attr('class', 'series-layer');
    ids.forEach(id => {
      plot.append('path').datum(data.map(row => ({period: row.period, n: value(row, id)})))
        .attr('class', 'scenario-path').attr('data-id', id)
        .attr('d', line).attr('fill', 'none').attr('stroke', colorById[id])
        .attr('stroke-width', 3).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
      plot.append('circle').attr('class', 'selected-dot').attr('data-id', id)
        .attr('cx', x(currentPeriod)).attr('cy', y(value(data[state.periodIndex], id)))
        .attr('r', 5.1).attr('fill', colorById[id]).attr('stroke', 'white').attr('stroke-width', 1.7);
      plot.append('text').attr('class', 'line-end-label').attr('data-id', id)
        .attr('x', x(data[data.length - 1].period) + 11)
        .attr('y', y(value(data[data.length - 1], id)) + 4)
        .attr('fill', colorById[id]).text(id);
    });
    if (ids.length === 0) {
      svg.append('text').attr('x', W / 2).attr('y', H / 2).attr('text-anchor', 'middle')
        .attr('font-size', 16).attr('fill', '#6a797d').text('Select a pathway to see its projections.');
    }

    // A wide transparent overlay supports inspection and selecting a decade
    // without requiring the pointer to land on a thin line or dot.
    svg.append('rect').attr('class', 'chart-overlay')
      .attr('x', m.left).attr('y', m.top).attr('width', W - m.left - m.right)
      .attr('height', H - m.top - m.bottom)
      .attr('role', 'button').attr('tabindex', 0)
      .attr('aria-label', 'Click or move across chart to inspect a decade. Use the decade slider for keyboard selection.')
      .on('pointermove', function (event) {
        if (ids.length === 0) return;
        const [px, py] = d3.pointer(event, svg.node());
        const idx = d3.leastIndex(data, row => Math.abs(x(row.period) - px));
        const row = data[idx];
        const nearest = d3.least(ids, id => Math.abs(y(value(row, id)) - py));
        hovered = { id: nearest, index: idx };
        plot.selectAll('.scenario-path').attr('stroke-opacity', function () {
          return this.getAttribute('data-id') === nearest ? 1 : 0.21;
        });
        plot.selectAll('.line-end-label').attr('opacity', function () {
          return this.getAttribute('data-id') === nearest ? 1 : 0.24;
        });
        plot.selectAll('.selected-dot').attr('opacity', function () {
          return this.getAttribute('data-id') === nearest ? 1 : 0.3;
        });
        const tip = d3.select('#tooltip');
        const lowerComparison = row[nearest] - row[referenceId];
        tip.html(`<div class="tip-top">${row.period.replace('-', '–')}</div>` +
          `<div class="tip-name">${nearest}</div>` +
          `<div class="tip-value">${degree(value(row, nearest))}</div>` +
          `<div>${state.measure === 'warming' ? `vs. SSP1-1.9: +${degree(lowerComparison)}` : 'Additional projected warming'}</div>`);
        tip.property('hidden', false);
        const shell = document.getElementById('main-plot-shell').getBoundingClientRect();
        const tipWidth = tip.node().offsetWidth;
        const left = Math.max(8, Math.min(shell.width - tipWidth - 8, event.clientX - shell.left + 14));
        const top = Math.max(12, event.clientY - shell.top - tip.node().offsetHeight - 14);
        tip.style('left', `${left}px`).style('top', `${top}px`);
      })
      .on('pointerleave', () => {
        hovered = null;
        d3.select('#tooltip').property('hidden', true);
        plot.selectAll('.scenario-path').attr('stroke-opacity', 1);
        plot.selectAll('.line-end-label').attr('opacity', 1);
        plot.selectAll('.selected-dot').attr('opacity', 1);
      })
      .on('click', event => {
        const [px] = d3.pointer(event, svg.node());
        const idx = d3.leastIndex(data, row => Math.abs(x(row.period) - px));
        d3.select('#tooltip').property('hidden', true);
        setPeriod(idx);
      })
      .on('keydown', event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); setPeriod(state.periodIndex - 1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); setPeriod(state.periodIndex + 1); }
      });
  }

  function renderRankChart() {
    const svg = d3.select('#rank-chart'), W = 520, H = 310;
    svg.selectAll('*').remove();
    const row = data[state.periodIndex];
    const ids = visibleIds().sort((a, b) => value(row, a) - value(row, b));
    const maxV = state.measure === 'warming' ? 6 : 4.2;
    const x = d3.scaleLinear().domain([0, maxV]).range([145, 408]);
    const ticks = state.measure === 'warming' ? [0, 2, 4, 6] : [0, 1, 2, 3, 4];
    svg.append('g').selectAll('line').data(ticks).join('line').attr('class', 'grid-line')
      .attr('x1', d => x(d)).attr('x2', d => x(d)).attr('y1', 25).attr('y2', 257);
    svg.append('g').attr('class', 'axis').attr('transform', 'translate(0,258)')
      .call(d3.axisBottom(x).tickValues(ticks).tickFormat(d => `${d}°`).tickSize(4).tickSizeOuter(0));
    if (!ids.length) {
      svg.append('text').attr('x', W / 2).attr('y', 142).attr('text-anchor', 'middle')
        .attr('font-size', 15).attr('fill', '#687579').text('No pathways selected.');
      return;
    }
    const lines = svg.append('g');
    ids.forEach((id, idx) => {
      const posY = 42 + idx * 46;
      const v = value(row, id);
      lines.append('text').attr('x', 10).attr('y', posY + 4)
        .attr('font-size', 14).attr('font-weight', 600).attr('fill', colorById[id]).text(id);
      lines.append('line').attr('x1', x(0)).attr('x2', x(v)).attr('y1', posY).attr('y2', posY)
        .attr('stroke', colorById[id]).attr('stroke-width', 2.3);
      lines.append('circle').attr('cx', x(v)).attr('cy', posY).attr('r', 5.4)
        .attr('fill', colorById[id]);
      lines.append('text').attr('x', 420).attr('y', posY + 4).attr('font-weight', 700)
        .attr('font-size', 13).attr('fill', '#334249').text(degree(v));
    });
  }

  function renderSpreadChart() {
    const svg = d3.select('#spread-chart'), W = 520, H = 190;
    svg.selectAll('*').remove();
    const ids = visibleIds();
    const x = d3.scalePoint().domain(data.map(d => d.period)).range([36, 497]);
    const y = d3.scaleLinear().domain([0, 4]).range([143, 16]);
    svg.append('g').selectAll('line').data([0, 2, 4]).join('line')
      .attr('class', 'grid-line').attr('x1', 36).attr('x2', 497)
      .attr('y1', d => y(d)).attr('y2', d => y(d));
    svg.append('g').attr('class', 'axis').attr('transform', 'translate(36,0)')
      .call(d3.axisLeft(y).tickValues([0, 2, 4]).tickFormat(d => `${d}°`).tickSize(3).tickSizeOuter(0));
    svg.append('g').attr('class', 'axis').attr('transform', 'translate(0,143)')
      .call(d3.axisBottom(x).tickValues(data.filter((_, i) => i % 2 === 0).map(d => d.period))
        .tickFormat(d => d.slice(0, 4)).tickSize(4).tickPadding(8).tickSizeOuter(0));
    const periodRow = data[state.periodIndex];
    const spread = dataSpread(periodRow, ids);
    d3.select('#spread-value').text(spread === null ? '—' : degree(spread));
    d3.select('#spread-description').text(`gap in ${periodRow.period.replace('-', '–')}`);
    d3.select('#spread-note').text(ids.length < 2
      ? 'Select at least two pathways to compare their projected spread.'
      : 'Spread uses only the currently selected pathways; changing the filters recalculates the curve.');
    if (ids.length < 2) return;
    const series = data.map(d => ({ period: d.period, val: dataSpread(d, ids) }));
    svg.append('path').datum(series).attr('fill', 'none').attr('stroke', '#44757b')
      .attr('stroke-width', 2.8).attr('stroke-linejoin', 'round')
      .attr('d', d3.line().x(d => x(d.period)).y(d => y(d.val)));
    svg.append('g').selectAll('circle').data(series).join('circle')
      .attr('cx', d => x(d.period)).attr('cy', d => y(d.val))
      .attr('r', d => d.period === periodRow.period ? 6.1 : 3.1)
      .attr('fill', d => d.period === periodRow.period ? '#2c7378' : '#ffffff')
      .attr('stroke', '#44757b').attr('stroke-width', 1.9);
    // An invisible, keyboard-focusable hit area per decade allows the spread
    // chart itself to select the period in the linked visualizations.
    const hitWidth = (x(data[1].period) - x(data[0].period));
    svg.append('g').selectAll('rect').data(series).join('rect')
      .attr('x', d => x(d.period) - hitWidth / 2).attr('y', 13)
      .attr('width', hitWidth).attr('height', 134).attr('fill', 'transparent')
      .attr('tabindex', 0).attr('role', 'button')
      .attr('aria-label', (d, i) => `Select ${d.period}; spread ${degree(d.val)}`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => setPeriod(data.findIndex(row => row.period === d.period)))
      .on('keydown', (event, d) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setPeriod(data.findIndex(row => row.period === d.period));
        }
      });
  }

  function render() {
    renderControls();
    renderMainChart();
    renderRankChart();
    renderSpreadChart();
  }

  function showError(message) {
    const svg = document.getElementById('main-chart');
    if (svg) svg.outerHTML = `<p class="loading-error" role="alert" style="color:#8e4242;padding:25px">${message}</p>`;
  }

  d3.csv('data/cmip6_decadal.csv', row => {
    const entry = { period: row.period };
    for (const id of scenarioIds) entry[id] = +row[id];
    return entry;
  }).then(rows => {
    if (rows.length !== 8 || rows.some(r => scenarioIds.some(id => !Number.isFinite(r[id])))) {
      throw new Error('Invalid or incomplete climate data');
    }
    data = rows;
    setupControls();
    render();
  }).catch(error => {
    console.error('Failed to initialize visualization:', error);
    showError('Could not load the data. On a computer, serve these files with a local web server (see README.md).');
  });
})();
