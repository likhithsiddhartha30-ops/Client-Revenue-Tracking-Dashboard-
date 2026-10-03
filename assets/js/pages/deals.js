WO.init({
  page: 'deals',
  title: 'Deals Closed',
  subtitle: 'Closed-won deals, close rate and deal value',
  render(ctx) {
    const t = ctx.totals, p = ctx.prevTotals || {}, s = ctx.series;
    const labels = ctx.months.map(m => WO.monthLabel(m));
    const closeRate = WO.ratio(t.deals, t.showed);
    const avgDeal = WO.ratio(t.revenue, t.deals);
    const prevAvgDeal = p.deals ? WO.ratio(p.revenue, p.deals) : null;
    const leadToDeal = WO.ratio(t.deals, t.leads);

    WO.kpis('#kpis', [
      { label: 'Deals Closed', icon: 'check', value: WO.num(t.deals), delta: WO.delta(t.deals, p.deals), spark: s.map(x => x.deals), accent: true },
      { label: 'Close Rate', icon: 'target', value: WO.pct(closeRate), delta: WO.delta(closeRate, p.showed ? WO.ratio(p.deals, p.showed) : null), spark: s.map(x => WO.ratio(x.deals, x.showed)) },
      { label: 'Avg. Deal Size', icon: 'dollar', value: WO.money(avgDeal), delta: WO.delta(avgDeal, prevAvgDeal), spark: s.map(x => WO.ratio(x.revenue, x.deals)) },
      { label: 'Lead → Deal', icon: 'percent', value: WO.pct(leadToDeal), delta: WO.delta(leadToDeal, p.leads ? WO.ratio(p.deals, p.leads) : null), spark: s.map(x => WO.ratio(x.deals, x.leads)) }
    ]);

    WO.chart('dealsChart', {
      data: {
        labels,
        datasets: [
          { type: 'line', label: 'Close rate', data: s.map(x => +(WO.ratio(x.deals, x.showed) * 100).toFixed(1)), yAxisID: 'y1', borderColor: '#a5c8ff', pointBackgroundColor: '#a5c8ff', pointBorderColor: '#03050b', order: 0 },
          { type: 'bar', label: 'Deals', data: s.map(x => x.deals), backgroundColor: WO.barFill(), maxBarThickness: 38, order: 1 }
        ]
      },
      options: {
        plugins: { tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.dataset.yAxisID === 'y1' ? c.raw + '%' : WO.num(c.raw)}` } } },
        scales: { x: WO.xAxis(), y: WO.yAxis(WO.num), y1: WO.yAxis(v => v + '%', { position: 'right', min: 0, grid: { display: false } }) }
      }
    });

    // Half-donut gauge
    document.getElementById('closeRate').textContent = WO.pct(closeRate);
    WO.chart('gauge', {
      type: 'doughnut',
      data: { labels: ['Closed', 'Not closed'], datasets: [{ data: [t.deals, Math.max(0, t.showed - t.deals)], backgroundColor: ['#2f6bff', '#1a2547'], borderRadius: 6, spacing: 3 }] },
      options: { cutout: '76%', rotation: -90, circumference: 180, interaction: { mode: 'nearest', intersect: true }, plugins: { tooltip: { callbacks: { label: c => ` ${c.label}: ${WO.num(c.raw)}` } } } }
    });
    WO.donutLegend('#gaugeLegend', [
      { label: 'Closed-won', value: t.deals, color: '#2f6bff' },
      { label: 'Attended, not closed', value: Math.max(0, t.showed - t.deals), color: '#1a2547' }
    ]);

    const byClient = WO.byClient(ctx.rangeAll, ctx.clients).sort((a, b) => b.deals - a.deals);
    WO.chart('clientChart', {
      type: 'bar',
      data: {
        labels: byClient.map(r => r.client.name),
        datasets: [{ label: 'Deals', data: byClient.map(r => r.deals), maxBarThickness: 22, backgroundColor: byClient.map(r => (!ctx.client || r.client.id === ctx.client.id ? '#2f6bff' : 'rgba(47,107,255,0.25)')) }]
      },
      options: { indexAxis: 'y', scales: { x: WO.yAxis(WO.num), y: WO.xAxis() } }
    });

    WO.chart('sizeChart', {
      type: 'line',
      data: {
        labels,
        datasets: [{ label: 'Avg. deal size', data: s.map(x => Math.round(WO.ratio(x.revenue, x.deals))), borderColor: '#5aa9ff', backgroundColor: WO.fade('#5aa9ff'), fill: true, pointBackgroundColor: '#5aa9ff', pointBorderColor: '#03050b' }]
      },
      options: {
        plugins: { tooltip: { callbacks: { label: c => ` Avg. deal size: ${WO.money(c.raw)}` } } },
        scales: { x: WO.xAxis(), y: WO.yAxis(v => WO.money(v, { compact: true }), { beginAtZero: false }) }
      }
    });

    WO.table('#table', [
      { label: 'Month', render: r => WO.monthLabel(r.month, true), foot: () => 'Total' },
      { label: 'Showed Up', num: true, render: r => WO.num(r.showed), foot: f => WO.num(f.showed) },
      { label: 'Deals Closed', num: true, render: r => `<b>${WO.num(r.deals)}</b>`, foot: f => WO.num(f.deals) },
      { label: 'Close Rate', num: true, render: r => WO.pct(WO.ratio(r.deals, r.showed)), foot: f => WO.pct(WO.ratio(f.deals, f.showed)) },
      { label: 'Lead → Deal', num: true, render: r => WO.pct(WO.ratio(r.deals, r.leads)), foot: f => WO.pct(WO.ratio(f.deals, f.leads)) },
      { label: 'Avg. Deal', num: true, render: r => WO.money(WO.ratio(r.revenue, r.deals)), foot: f => WO.money(WO.ratio(f.revenue, f.deals)) },
      { label: 'Revenue', num: true, render: r => WO.money(r.revenue), foot: f => WO.money(f.revenue) }
    ], s.slice().reverse(), { foot: t });
  }
});
