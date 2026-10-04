WO.init({
  page: 'revenue',
  title: 'Revenue',
  subtitle: 'Revenue generated for clients, growth and contribution',
  render(ctx) {
    const t = ctx.totals, p = ctx.prevTotals || {}, s = ctx.series;
    const labels = ctx.months.map(m => WO.monthLabel(m));
    const n = ctx.months.length;
    const avgMonth = WO.ratio(t.revenue, n);
    const revPerLead = WO.ratio(t.revenue, t.leads);
    const first = s[0].revenue, last = s[n - 1].revenue;

    WO.kpis('#kpis', [
      { label: 'Total Revenue', icon: 'dollar', value: WO.money(t.revenue, { compact: true }), delta: WO.delta(t.revenue, p.revenue), spark: s.map(x => x.revenue), accent: true },
      { label: 'Avg. Monthly Revenue', icon: 'layers', value: WO.money(avgMonth, { compact: true }), delta: WO.delta(avgMonth, p.revenue ? p.revenue / n : null), spark: s.map(x => x.revenue) },
      { label: 'Revenue per Lead', icon: 'users', value: WO.money(revPerLead), delta: WO.delta(revPerLead, p.leads ? WO.ratio(p.revenue, p.leads) : null), spark: s.map(x => WO.ratio(x.revenue, x.leads)) },
      { label: 'Growth in Period', icon: 'trend', value: first ? (last >= first ? '+' : '') + WO.pct(WO.delta(last, first)) : '—', sub: first ? `${WO.monthLabel(ctx.months[0])} → ${WO.monthLabel(ctx.months[n - 1])}` : 'Needs revenue in the first month' }
    ]);

    let run = 0;
    const cumulative = s.map(x => (run += x.revenue));
    WO.chart('revChart', {
      data: {
        labels,
        datasets: [
          { type: 'line', label: 'Cumulative', data: cumulative, yAxisID: 'y1', borderColor: '#dbe5ff', backgroundColor: WO.fade('#8fb4ff', 0.12, 0), fill: true, pointBackgroundColor: '#dbe5ff', pointBorderColor: '#0e1014', order: 0 },
          { type: 'bar', label: 'Monthly revenue', data: s.map(x => x.revenue), backgroundColor: WO.barFill(), maxBarThickness: 30, order: 1 }
        ]
      },
      options: {
        plugins: { tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${WO.money(c.raw)}` } } },
        scales: {
          x: WO.xAxis(),
          y: WO.yAxis(v => WO.money(v, { compact: true })),
          y1: WO.yAxis(v => WO.money(v, { compact: true }), { position: 'right', grid: { display: false } })
        }
      }
    });

    const byClient = WO.byClient(ctx.rangeAll, ctx.clients).filter(r => r.revenue > 0).sort((a, b) => b.revenue - a.revenue);
    const share = byClient.map(r => ({ label: r.client.name, value: r.revenue, color: !ctx.client || r.client.id === ctx.client.id ? r.color : WO.hexA(r.color, 0.25) }));
    document.getElementById('shareTotal').textContent = WO.money(byClient.reduce((a, r) => a + r.revenue, 0), { compact: true });
    WO.donut('shareChart', share.map(x => x.label), share.map(x => x.value), share.map(x => x.color), WO.money);
    WO.donutLegend('#shareLegend', share, v => WO.money(v, { compact: true }));

    const rows = s.map((r, i) => Object.assign({ mom: i ? WO.delta(r.revenue, s[i - 1].revenue) : null, cum: cumulative[i] }, r)).reverse();
    WO.table('#table', [
      { label: 'Month', render: r => WO.monthLabel(r.month, true), foot: () => 'Total' },
      { label: 'Deals', num: true, render: r => WO.num(r.deals), foot: f => WO.num(f.deals) },
      { label: 'Revenue', num: true, render: r => `<b>${WO.money(r.revenue)}</b>`, foot: f => WO.money(f.revenue) },
      { label: 'MoM', num: true, render: r => (r.mom == null ? '<span class="muted">—</span>' : `<span class="delta ${r.mom >= 0 ? 'up' : 'down'}">${r.mom >= 0 ? '▲' : '▼'} ${Math.abs(r.mom * 100).toFixed(1)}%</span>`) },
      { label: 'Cumulative', num: true, render: r => `<span class="muted">${WO.money(r.cum)}</span>` }
    ], rows, { foot: t });
  }
});
