WO.init({
  page: 'leads',
  title: 'Leads Generated',
  subtitle: 'Top-of-funnel volume, sources and conversion into meetings',
  render(ctx) {
    const t = ctx.totals, p = ctx.prevTotals || {}, s = ctx.series;
    const labels = ctx.months.map(m => WO.monthLabel(m));
    const best = s.reduce((a, b) => (b.leads > a.leads ? b : a), s[0]);

    WO.kpis('#kpis', [
      { label: 'Total Leads', icon: 'users', value: WO.num(t.leads), delta: WO.delta(t.leads, p.leads), spark: s.map(x => x.leads), accent: true },
      { label: 'Inbound Leads', icon: 'inbox', value: WO.num(t.inbound), delta: WO.delta(t.inbound, p.inbound), spark: s.map(x => x.inbound) },
      { label: 'Outbound Leads', icon: 'send', value: WO.num(t.outbound), delta: WO.delta(t.outbound, p.outbound), spark: s.map(x => x.outbound) },
      { label: 'Avg. Leads / Month', icon: 'layers', value: WO.num(WO.ratio(t.leads, ctx.months.length)), sub: `Best month: ${WO.monthLabel(best.month, true)} (${WO.num(best.leads)})` }
    ]);

    WO.chart('leadsChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Inbound', data: s.map(x => x.inbound), backgroundColor: WO.barFill('#8fb4ff', '#4f8cff'), maxBarThickness: 26 },
          { label: 'Outbound', data: s.map(x => x.outbound), backgroundColor: '#2a3550', maxBarThickness: 26 }
        ]
      },
      options: { scales: { x: WO.xAxis({ stacked: true }), y: WO.yAxis(WO.num, { stacked: true }) } }
    });

    document.getElementById('srcTotal').textContent = WO.num(t.leads);
    const src = [{ label: 'Inbound', value: t.inbound, color: '#4f8cff' }, { label: 'Outbound', value: t.outbound, color: '#2a3550' }];
    WO.donut('sourceChart', src.map(x => x.label), src.map(x => x.value), src.map(x => x.color));
    WO.donutLegend('#srcLegend', src);

    const byClient = WO.byClient(ctx.rangeAll, ctx.clients).sort((a, b) => b.leads - a.leads);
    WO.chart('clientChart', {
      type: 'bar',
      data: {
        labels: byClient.map(r => r.client.name),
        datasets: [{
          label: 'Leads', data: byClient.map(r => r.leads), maxBarThickness: 22,
          backgroundColor: byClient.map(r => (!ctx.client || r.client.id === ctx.client.id ? '#4f8cff' : 'rgba(79,140,255,0.22)'))
        }]
      },
      options: { indexAxis: 'y', scales: { x: WO.yAxis(WO.num), y: WO.xAxis() } }
    });

    WO.chart('rateChart', {
      type: 'line',
      data: {
        labels,
        datasets: [{ label: 'Lead → Meeting', data: s.map(x => +(WO.ratio(x.meetings, x.leads) * 100).toFixed(1)), borderColor: '#8fb4ff', backgroundColor: WO.fade('#8fb4ff'), fill: true, pointBackgroundColor: '#8fb4ff', pointBorderColor: '#0e1014' }]
      },
      options: {
        plugins: { tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.raw}%` } } },
        scales: { x: WO.xAxis(), y: WO.yAxis(v => v + '%', { beginAtZero: false }) }
      }
    });

    WO.table('#table', [
      { label: 'Month', render: r => WO.monthLabel(r.month, true), foot: () => 'Total' },
      { label: 'Inbound', num: true, render: r => WO.num(r.inbound), foot: f => WO.num(f.inbound) },
      { label: 'Outbound', num: true, render: r => WO.num(r.outbound), foot: f => WO.num(f.outbound) },
      { label: 'Total Leads', num: true, render: r => `<b>${WO.num(r.leads)}</b>`, foot: f => WO.num(f.leads) },
      { label: 'Inbound %', num: true, render: r => WO.pct(WO.ratio(r.inbound, r.leads)), foot: f => WO.pct(WO.ratio(f.inbound, f.leads)) },
      { label: 'Meetings', num: true, render: r => WO.num(r.meetings), foot: f => WO.num(f.meetings) },
      { label: 'Lead → Meeting', num: true, render: r => WO.pct(WO.ratio(r.meetings, r.leads)), foot: f => WO.pct(WO.ratio(f.meetings, f.leads)) }
    ], s.slice().reverse(), { foot: t });
  }
});
