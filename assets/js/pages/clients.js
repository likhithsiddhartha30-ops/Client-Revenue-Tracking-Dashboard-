WO.init({
  page: 'clients',
  title: 'Clients',
  subtitle: 'Every client account side by side. Open one to filter all dashboards to it',
  render(ctx) {
    const prevAll = ctx.records.filter(r => ctx.prevMonths.includes(r.month));
    const rows = WO.byClient(ctx.rangeAll, ctx.clients).map(r => {
      const own = ctx.rangeAll.filter(x => x.clientId === r.client.id);
      const prev = WO.sum(prevAll.filter(x => x.clientId === r.client.id));
      const hasPrev = ctx.prevMonths.length === ctx.months.length;
      return Object.assign(r, { series: WO.byMonth(own, ctx.months), revDelta: hasPrev ? WO.delta(r.revenue, prev.revenue) : null });
    }).sort((a, b) => b.revenue - a.revenue);

    const grid = document.getElementById('clientGrid');
    grid.innerHTML = rows.map((r, i) => `
      <div class="card client-card fade-in ${ctx.client && ctx.client.id === r.client.id ? 'selected' : ''}" style="animation-delay:${i * 50}ms">
        <div class="cc-head">
          ${WO.avatar(r.client.name, r.color)}
          <div><div class="cc-name">${WO.esc(r.client.name)}</div><div class="cc-ind">${WO.esc(r.client.industry || 'Client')}</div></div>
        </div>
        <div class="cc-rev">
          <div><div class="cc-rev-label">Revenue · ${ctx.months.length}M</div><div class="cc-rev-val">${WO.money(r.revenue)}</div></div>
          <div class="kpi-foot">${r.revDelta == null ? '' : WO.deltaHTML(r.revDelta).split('<span class="delta-note">')[0]}</div>
        </div>
        <div class="cc-spark"><canvas id="cc-${i}"></canvas></div>
        <div class="cc-stats">
          <div>Leads<b>${WO.num(r.leads)}</b></div>
          <div>Meetings<b>${WO.num(r.meetings)}</b></div>
          <div>Deals<b>${WO.num(r.deals)}</b></div>
          <div>Close<b>${WO.pct(WO.ratio(r.deals, r.showed), 0)}</b></div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary btn-sm" data-open="${WO.esc(r.client.id)}" style="flex:1">Open dashboard →</button>
        </div>
      </div>`).join('');
    rows.forEach((r, i) => WO.spark(`cc-${i}`, r.series.map(x => x.revenue), r.color));

    grid.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
      WO.setFilters({ client: b.dataset.open });
      location.href = 'index.html';
    }));

    WO.table('#table', [
      { label: 'Client', render: r => `<div class="client-cell">${WO.avatar(r.client.name, r.color)}<div>${WO.esc(r.client.name)}<small>${WO.esc(r.client.industry || '')}</small></div></div>` },
      { label: 'Leads', num: true, render: r => WO.num(r.leads) },
      { label: 'Meetings', num: true, render: r => WO.num(r.meetings) },
      { label: 'Show Rate', num: true, render: r => WO.pct(WO.ratio(r.showed, r.meetings)) },
      { label: 'Deals', num: true, render: r => WO.num(r.deals) },
      { label: 'Close Rate', num: true, render: r => WO.pct(WO.ratio(r.deals, r.showed)) },
      { label: 'Avg. Deal', num: true, render: r => WO.money(WO.ratio(r.revenue, r.deals)) },
      { label: 'Revenue', num: true, render: r => `<b>${WO.money(r.revenue)}</b>` }
    ], rows, { rowClass: r => (ctx.client && r.client.id === ctx.client.id ? 'hl' : '') });
  }
});
