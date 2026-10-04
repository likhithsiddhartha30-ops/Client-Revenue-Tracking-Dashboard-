WO.init({
  page: 'overview',
  title: 'Revenue Overview',
  subtitle: 'Leads, meetings, deals and revenue across every client',
  render(ctx) {
    const t = ctx.totals, p = ctx.prevTotals || {}, s = ctx.series;
    const labels = ctx.months.map(m => WO.monthLabel(m));

    // Hero
    document.getElementById('heroTitle').textContent = ctx.client ? ctx.client.name : 'All clients, one view';
    document.getElementById('heroSub').textContent = `${WO.periodLabel(ctx.months)} · ${WO.num(t.deals)} deals closed from ${WO.num(t.leads)} leads`;
    document.getElementById('heroRevenue').textContent = WO.money(t.revenue);
    document.getElementById('heroDelta').innerHTML = WO.deltaHTML(WO.delta(t.revenue, p.revenue));

    // KPIs
    WO.kpis('#kpis', [
      { label: 'Leads Generated', icon: 'users',    value: WO.num(t.leads),    delta: WO.delta(t.leads, p.leads),       spark: s.map(x => x.leads) },
      { label: 'Meetings Booked', icon: 'calendar', value: WO.num(t.meetings), delta: WO.delta(t.meetings, p.meetings), spark: s.map(x => x.meetings) },
      { label: 'Deals Closed',    icon: 'check',    value: WO.num(t.deals),    delta: WO.delta(t.deals, p.deals),       spark: s.map(x => x.deals) },
      { label: 'Revenue',         icon: 'dollar',   value: WO.money(t.revenue, { compact: true }), delta: WO.delta(t.revenue, p.revenue), spark: s.map(x => x.revenue), accent: true }
    ]);

    // Revenue + deals chart
    WO.chart('revChart', {
      data: {
        labels,
        datasets: [
          { type: 'line', label: 'Deals', data: s.map(x => x.deals), yAxisID: 'y1', borderColor: '#dbe5ff', pointBackgroundColor: '#dbe5ff', pointBorderColor: '#0e1014', order: 0 },
          { type: 'bar', label: 'Revenue', data: s.map(x => x.revenue), backgroundColor: WO.barFill(), maxBarThickness: 26, order: 1 }
        ]
      },
      options: {
        plugins: { tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.dataset.label === 'Revenue' ? WO.money(c.raw) : WO.num(c.raw)}` } } },
        scales: {
          x: WO.xAxis(),
          y: WO.yAxis(v => WO.money(v, { compact: true })),
          y1: WO.yAxis(null, { position: 'right', grid: { display: false } })
        }
      }
    });

    // Funnel
    const stages = [['Leads Generated', t.leads], ['Meetings Booked', t.meetings], ['Showed Up', t.showed], ['Deals Closed', t.deals]];
    document.getElementById('funnel').innerHTML = stages.map(([label, v], i) => `
      <div class="f-row">
        <div class="f-meta"><span>${label}</span><b>${WO.num(v)}</b></div>
        <div class="f-track"><div class="f-bar" style="width:${Math.max(3, WO.ratio(v, t.leads) * 100)}%"></div></div>
        ${i < stages.length - 1 ? `<div class="f-conv">↓ <b>${WO.pct(WO.ratio(stages[i + 1][1], v))}</b> move to next stage</div>` : ''}
      </div>`).join('') +
      `<div class="f-total"><span>Lead → Deal conversion</span><b>${WO.pct(WO.ratio(t.deals, t.leads))}</b></div>`;

    // Ratios
    const ratios = [
      ['Avg. Deal Size', WO.money(WO.ratio(t.revenue, t.deals)), null],
      ['Revenue per Lead', WO.money(WO.ratio(t.revenue, t.leads)), null],
      ['Lead → Meeting', WO.pct(WO.ratio(t.meetings, t.leads)), WO.ratio(t.meetings, t.leads)],
      ['Show-up Rate', WO.pct(WO.ratio(t.showed, t.meetings)), WO.ratio(t.showed, t.meetings)],
      ['Close Rate', WO.pct(WO.ratio(t.deals, t.showed)), WO.ratio(t.deals, t.showed)],
      ['Inbound Share', WO.pct(WO.ratio(t.inbound, t.leads)), WO.ratio(t.inbound, t.leads)]
    ];
    document.getElementById('ratios').innerHTML = ratios.map(([l, v, r]) => `
      <div class="ratio"><div class="ratio-label">${l}</div><div class="ratio-value">${v}</div>
      ${r != null ? `<div class="ratio-bar"><i style="width:${Math.min(100, r * 100)}%"></i></div>` : ''}</div>`).join('');

    // Leaderboard (all clients, current range)
    const rows = WO.byClient(ctx.rangeAll, ctx.clients).sort((a, b) => b.revenue - a.revenue);
    const total = rows.reduce((a, r) => a + r.revenue, 0);
    WO.table('#leaderboard', [
      { label: 'Client', render: (r, i) => `<div class="client-cell"><span class="rank">${i + 1}</span>${WO.avatar(r.client.name, r.color)}<div>${WO.esc(r.client.name)}<small>${WO.esc(r.client.industry || '')}</small></div></div>` },
      { label: 'Leads', num: true, render: r => WO.num(r.leads) },
      { label: 'Meetings', num: true, render: r => WO.num(r.meetings) },
      { label: 'Deals', num: true, render: r => WO.num(r.deals) },
      { label: 'Close Rate', num: true, render: r => WO.pct(WO.ratio(r.deals, r.showed)) },
      { label: 'Revenue', num: true, render: r => `<div class="share"><div class="share-bar"><i style="width:${WO.ratio(r.revenue, total) * 100}%"></i></div><b>${WO.money(r.revenue)}</b></div>` }
    ], rows, { rowClass: r => (ctx.client && r.client.id === ctx.client.id ? 'hl' : '') });
  }
});
