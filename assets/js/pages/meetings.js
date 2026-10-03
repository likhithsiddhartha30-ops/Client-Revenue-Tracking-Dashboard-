WO.init({
  page: 'meetings',
  title: 'Meetings Booked',
  subtitle: 'Sales calls booked, attended and missed',
  render(ctx) {
    const t = ctx.totals, p = ctx.prevTotals || {}, s = ctx.series;
    const labels = ctx.months.map(m => WO.monthLabel(m));
    const noShow = t.meetings - t.showed;
    const showRate = WO.ratio(t.showed, t.meetings);
    const prevShowRate = p.meetings ? WO.ratio(p.showed, p.meetings) : null;

    WO.kpis('#kpis', [
      { label: 'Meetings Booked', icon: 'calendar', value: WO.num(t.meetings), delta: WO.delta(t.meetings, p.meetings), spark: s.map(x => x.meetings), accent: true },
      { label: 'Showed Up', icon: 'usercheck', value: WO.num(t.showed), delta: WO.delta(t.showed, p.showed), spark: s.map(x => x.showed) },
      { label: 'Show-up Rate', icon: 'percent', value: WO.pct(showRate), delta: WO.delta(showRate, prevShowRate), spark: s.map(x => WO.ratio(x.showed, x.meetings)) },
      { label: 'No-shows', icon: 'userx', value: WO.num(noShow), delta: WO.delta(noShow, p.meetings != null ? p.meetings - p.showed : null), invert: true, spark: s.map(x => x.meetings - x.showed) }
    ]);

    WO.chart('meetChart', {
      data: {
        labels,
        datasets: [
          { type: 'line', label: 'Show rate', data: s.map(x => +(WO.ratio(x.showed, x.meetings) * 100).toFixed(1)), yAxisID: 'y1', borderColor: '#a5c8ff', pointBackgroundColor: '#a5c8ff', pointBorderColor: '#03050b', order: 0 },
          { type: 'bar', label: 'Booked', data: s.map(x => x.meetings), backgroundColor: '#1e40af', maxBarThickness: 22, order: 1 },
          { type: 'bar', label: 'Showed', data: s.map(x => x.showed), backgroundColor: WO.barFill(), maxBarThickness: 22, order: 1 }
        ]
      },
      options: {
        plugins: { tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.dataset.yAxisID === 'y1' ? c.raw + '%' : WO.num(c.raw)}` } } },
        scales: { x: WO.xAxis(), y: WO.yAxis(WO.num), y1: WO.yAxis(v => v + '%', { position: 'right', min: 0, max: 100, grid: { display: false } }) }
      }
    });

    document.getElementById('showRate').textContent = WO.pct(showRate);
    const att = [{ label: 'Showed up', value: t.showed, color: '#2f6bff' }, { label: 'No-show', value: noShow, color: '#1a2547' }];
    WO.donut('attChart', att.map(x => x.label), att.map(x => x.value), att.map(x => x.color));
    WO.donutLegend('#attLegend', att);

    const byClient = WO.byClient(ctx.rangeAll, ctx.clients).sort((a, b) => b.meetings - a.meetings);
    const dim = (r, c) => (!ctx.client || r.client.id === ctx.client.id ? c : WO.hexA(c, 0.25));
    WO.chart('clientChart', {
      type: 'bar',
      data: {
        labels: byClient.map(r => r.client.name),
        datasets: [
          { label: 'Booked', data: byClient.map(r => r.meetings), backgroundColor: byClient.map(r => dim(r, '#1e40af')), maxBarThickness: 30 },
          { label: 'Showed', data: byClient.map(r => r.showed), backgroundColor: byClient.map(r => dim(r, '#5aa9ff')), maxBarThickness: 30 }
        ]
      },
      options: { scales: { x: WO.xAxis(), y: WO.yAxis(WO.num) } }
    });

    WO.table('#table', [
      { label: 'Month', render: r => WO.monthLabel(r.month, true), foot: () => 'Total' },
      { label: 'Leads', num: true, render: r => WO.num(r.leads), foot: f => WO.num(f.leads) },
      { label: 'Booked', num: true, render: r => `<b>${WO.num(r.meetings)}</b>`, foot: f => WO.num(f.meetings) },
      { label: 'Showed', num: true, render: r => WO.num(r.showed), foot: f => WO.num(f.showed) },
      { label: 'No-shows', num: true, render: r => WO.num(r.meetings - r.showed), foot: f => WO.num(f.meetings - f.showed) },
      { label: 'Show Rate', num: true, render: r => WO.pct(WO.ratio(r.showed, r.meetings)), foot: f => WO.pct(WO.ratio(f.showed, f.meetings)) },
      { label: 'Booking Rate', num: true, render: r => WO.pct(WO.ratio(r.meetings, r.leads)), foot: f => WO.pct(WO.ratio(f.meetings, f.leads)) }
    ], s.slice().reverse(), { foot: t });
  }
});
