/* ============================================================
   WorthyOps — shared app shell, data store, formatting, charts
   Every page calls WO.init({ page, title, subtitle, render(ctx) })
   ============================================================ */
window.WO = (function () {
  const LS = { records: 'wo_records_v1', clients: 'wo_clients_v1', filters: 'wo_filters_v1', settings: 'wo_settings_v1' };
  const PALETTE = ['#4f8cff', '#8fb4ff', '#2f5fcc', '#c7d6f5', '#6b7fa8', '#7aa2ff', '#3a4a6b', '#a9bde6'];

  const NAV = [
    { id: 'overview', href: 'index.html',    label: 'Overview',     icon: 'grid' },
    { id: 'leads',    href: 'leads.html',    label: 'Leads',        icon: 'users' },
    { id: 'meetings', href: 'meetings.html', label: 'Meetings',     icon: 'calendar' },
    { id: 'deals',    href: 'deals.html',    label: 'Deals Closed', icon: 'check' },
    { id: 'revenue',  href: 'revenue.html',  label: 'Revenue',      icon: 'trend' },
    { id: 'clients',  href: 'clients.html',  label: 'Clients',      icon: 'briefcase', group: 'manage' },
    { id: 'data',     href: 'data.html',     label: 'Data Entry',   icon: 'edit',      group: 'manage' }
  ];

  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>',
    trend: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    menu: '<path d="M3 12h18M3 6h18M3 18h18"/>',
    dollar: '<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    userx: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m17 8 5 5M22 8l-5 5"/>',
    usercheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    refresh: '<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>'
  };
  const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ''}</svg>`;

  /* ---------- Storage ---------- */
  function load(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  function remove(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }

  const BE = window.WO_BACKEND || { enabled: false };
  let remote = null; // { clients, records } fetched from Supabase when the backend is enabled
  let session = null;
  // team: sees everything and can edit. client: read-only, own company only. none: no access yet.
  // Demo mode (no backend) behaves as team.
  let access = { role: 'team', clientId: null };
  const isTeam = () => access.role === 'team';

  function getData() {
    if (BE.enabled) return remote || { clients: [], records: [] };
    return { clients: load(LS.clients, null) || WO_SEED.clients, records: load(LS.records, null) || WO_SEED.records };
  }
  async function refresh() { if (BE.enabled) remote = await BE.fetchAll(); }
  function saveData(d) { save(LS.clients, d.clients); save(LS.records, d.records); }
  function resetData() { remove(LS.clients); remove(LS.records); }
  function getFilters() { return Object.assign({ client: 'all', range: '6' }, load(LS.filters, {})); }
  function setFilters(f) { save(LS.filters, Object.assign(getFilters(), f)); }
  function getSettings() { return Object.assign({ currency: '$' }, load(LS.settings, {})); }
  function setSettings(s) { save(LS.settings, Object.assign(getSettings(), s)); }

  /* ---------- Aggregation ---------- */
  const KEYS = ['inbound', 'outbound', 'meetings', 'showed', 'deals', 'revenue'];
  function sum(rs) {
    const t = { inbound: 0, outbound: 0, meetings: 0, showed: 0, deals: 0, revenue: 0 };
    rs.forEach(r => KEYS.forEach(k => { t[k] += Number(r[k]) || 0; }));
    t.leads = t.inbound + t.outbound;
    return t;
  }
  const byMonth = (rs, months) => months.map(m => Object.assign({ month: m }, sum(rs.filter(r => r.month === m))));
  const clientColor = (clients, id) => PALETTE[Math.max(0, clients.findIndex(c => c.id === id)) % PALETTE.length];
  const byClient = (rs, clients) => clients.map(c => Object.assign({ client: c, color: clientColor(clients, c.id) }, sum(rs.filter(r => r.clientId === c.id))));
  const ratio = (a, b) => (b ? a / b : 0);

  function thisMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  function addMonths(m, k) {
    const [y, mo] = m.split('-').map(Number);
    const d = new Date(y, mo - 1 + k, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  // n consecutive months ending at `end`, oldest first
  const monthRange = (end, n) => Array.from({ length: n }, (_, i) => addMonths(end, i - n + 1));

  function buildCtx() {
    const { clients, records } = getData();
    const filters = getFilters();
    if (access.role === 'client') filters.client = access.clientId;
    if (filters.client !== 'all' && !clients.some(c => c.id === filters.client)) filters.client = 'all';
    // The window ends at the latest logged month (or this month when nothing is logged yet) and is
    // always full length, so empty months show as zeros instead of disappearing.
    const latest = records.reduce((a, r) => (r.month > a ? r.month : a), '');
    const end = latest || thisMonth();
    const n = Number(filters.range) || 6;
    const months = monthRange(end, n);
    const prevMonths = monthRange(addMonths(end, -n), n);
    const inScope = r => filters.client === 'all' || r.clientId === filters.client;
    const cur = records.filter(r => inScope(r) && months.includes(r.month));
    const prev = records.filter(r => inScope(r) && prevMonths.includes(r.month));
    const rangeAll = records.filter(r => months.includes(r.month));
    return {
      clients, records, filters, months, prevMonths, cur, prev, rangeAll,
      client: clients.find(c => c.id === filters.client) || null,
      settings: getSettings(),
      totals: sum(cur),
      prevTotals: prev.length ? sum(prev) : null,
      series: byMonth(cur, months),
      prevSeries: byMonth(prev, prevMonths)
    };
  }

  /* ---------- Formatting ---------- */
  const nf = new Intl.NumberFormat('en-US');
  const num = n => nf.format(Math.round(n || 0));
  function compact(n) {
    const a = Math.abs(n);
    if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace(/\.?0+$/, '') + 'M';
    if (a >= 1e4) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return num(n);
  }
  const money = (n, opt) => getSettings().currency + ((opt && opt.compact) ? compact(n) : num(n));
  const pct = (x, d = 1) => (x * 100).toFixed(d) + '%';
  const delta = (c, p) => (p == null || !p ? null : (c - p) / p);
  function deltaHTML(d, opt) {
    if (d == null) return '<span class="delta flat">No prior period to compare</span>';
    const up = d >= 0, good = (opt && opt.invert) ? !up : up;
    return `<span class="delta ${good ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(d * 100).toFixed(1)}%</span><span class="delta-note">vs prev. period</span>`;
  }
  function monthLabel(m, long) {
    const [y, mo] = m.split('-').map(Number);
    return new Date(y, mo - 1, 1).toLocaleDateString('en-US', long ? { month: 'long', year: 'numeric' } : { month: 'short', year: '2-digit' });
  }
  const periodLabel = months => months.length ? `${monthLabel(months[0], true)} – ${monthLabel(months[months.length - 1], true)}` : 'No data yet';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = name => String(name).split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const avatar = (name, color) => `<span class="avatar" style="background:${hexA(color, 0.14)};color:${color}">${esc(initials(name))}</span>`;

  /* ---------- Charts ---------- */
  const charts = {};
  function hexA(hex, a) {
    const n = parseInt(hex.replace('#', ''), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }
  function fade(color, top = 0.35, bottom = 0) {
    return c => {
      const { ctx, chartArea } = c.chart;
      if (!chartArea) return hexA(color, top / 2);
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0, hexA(color, top)); g.addColorStop(1, hexA(color, bottom));
      return g;
    };
  }
  function barFill(from = '#4f8cff', to = '#4f8cff') {
    return c => {
      const { ctx, chartArea } = c.chart;
      if (!chartArea) return to;
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0, from); g.addColorStop(1, hexA(to, 0.35));
      return g;
    };
  }
  function xAxis(extra) { return Object.assign({ grid: { display: false }, border: { display: false }, ticks: { color: '#5c6270' } }, extra || {}); }
  function yAxis(fmt, extra) {
    const ticks = { color: '#5c6270', padding: 8, maxTicksLimit: 6, precision: 0 };
    if (fmt) ticks.callback = v => fmt(v);
    // suggestedMax keeps a clean 0–5 grid when every value is zero; real data overrides it
    return Object.assign({ beginAtZero: true, suggestedMax: 5, grid: { color: 'rgba(255,255,255,0.045)' }, border: { display: false }, ticks }, extra || {});
  }
  function setupChartDefaults() {
    if (typeof Chart === 'undefined') return;
    const d = Chart.defaults;
    d.color = '#8b919e';
    d.font.family = 'Inter, system-ui, sans-serif';
    d.font.size = 11.5;
    d.borderColor = 'rgba(255,255,255,0.06)';
    d.maintainAspectRatio = false;
    d.plugins.legend.display = false;
    Object.assign(d.plugins.tooltip, {
      backgroundColor: 'rgba(19,22,28,0.98)', borderColor: 'rgba(255,255,255,0.10)', borderWidth: 1,
      titleColor: '#f2f4f8', bodyColor: '#b4bac6', padding: 12, cornerRadius: 8, boxPadding: 5,
      usePointStyle: true, titleFont: { weight: '600' }
    });
    d.elements.bar.borderRadius = 4;
    d.elements.bar.borderSkipped = false;
    d.elements.line.tension = 0.38;
    d.elements.line.borderWidth = 2;
    d.elements.point.radius = 0;
    d.elements.point.hoverRadius = 5;
    d.elements.point.hoverBorderWidth = 2;
    d.elements.arc.borderWidth = 0;
    Object.assign(d.interaction, { mode: 'index', intersect: false });
  }
  function chart(id, cfg) {
    if (typeof Chart === 'undefined') return null;
    const el = document.getElementById(id);
    if (!el) return null;
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(el, cfg);
    return charts[id];
  }
  function spark(id, data, color = '#4f8cff') {
    return chart(id, {
      type: 'line',
      data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, borderWidth: 1.75, fill: true, backgroundColor: fade(color, 0.16, 0) }] },
      options: { events: [], animation: { duration: 700 }, plugins: { tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false, beginAtZero: false } }, layout: { padding: { top: 4 } } }
    });
  }
  const EMPTY_RING = 'rgba(255,255,255,0.06)';
  // All-zero data draws an empty grey ring instead of nothing.
  function donut(id, labels, data, colors, fmt, extra) {
    const empty = !data.some(v => v > 0);
    return chart(id, {
      type: 'doughnut',
      data: {
        labels: empty ? ['No data yet'] : labels,
        datasets: [{ data: empty ? [1] : data, backgroundColor: empty ? [EMPTY_RING] : colors, hoverOffset: empty ? 0 : 6, spacing: empty ? 0 : 3, borderRadius: 4 }]
      },
      options: Object.assign({
        cutout: '74%', interaction: { mode: 'nearest', intersect: true },
        plugins: { tooltip: { enabled: !empty, callbacks: { label: c => ` ${c.label}: ${fmt ? fmt(c.raw) : num(c.raw)}` } } }
      }, extra || {})
    });
  }

  /* ---------- UI helpers ---------- */
  function kpis(sel, items) {
    const el = document.querySelector(sel);
    const base = sel.replace(/[^a-z0-9]/gi, '');
    el.innerHTML = items.map((k, i) => `
      <div class="card kpi fade-in ${k.accent ? 'kpi-accent' : ''} ${k.spark ? '' : 'kpi-pad'}" style="animation-delay:${i * 60}ms">
        <div class="kpi-top"><span class="kpi-icon">${icon(k.icon || 'trend')}</span><span>${k.label}</span></div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-foot">${k.sub ? `<span class="kpi-sub">${k.sub}</span>` : deltaHTML(k.delta, { invert: k.invert })}</div>
        ${k.spark ? `<div class="kpi-spark"><canvas id="${base}-sp${i}"></canvas></div>` : ''}
      </div>`).join('');
    items.forEach((k, i) => { if (k.spark) spark(`${base}-sp${i}`, k.spark, '#4f8cff'); });
  }

  function table(sel, cols, rows, opt = {}) {
    const el = document.querySelector(sel);
    const cls = c => (c.num ? 'num' : '') + (c.cls ? ' ' + c.cls : '');
    el.innerHTML = `<div class="table-wrap"><table class="tbl">
      <thead><tr>${cols.map(c => `<th class="${cls(c)}">${c.label}</th>`).join('')}</tr></thead>
      <tbody>${rows.length
        ? rows.map((r, i) => `<tr class="${opt.rowClass ? opt.rowClass(r) : ''}">${cols.map(c => `<td class="${cls(c)}">${c.render(r, i)}</td>`).join('')}</tr>`).join('')
        : `<tr><td class="tbl-empty" colspan="${cols.length}">${opt.empty || 'Nothing here yet'}</td></tr>`}</tbody>
      ${opt.foot ? `<tfoot><tr>${cols.map(c => `<td class="${cls(c)}">${c.foot ? c.foot(opt.foot) : ''}</td>`).join('')}</tr></tfoot>` : ''}
    </table></div>`;
  }

  function donutLegend(sel, items, fmt) {
    const total = items.reduce((a, b) => a + b.value, 0);
    document.querySelector(sel).innerHTML = items.map(it =>
      `<div><i style="background:${it.color}"></i>${esc(it.label)}<b>${fmt ? fmt(it.value) : num(it.value)}</b><em>${pct(ratio(it.value, total))}</em></div>`).join('');
  }

  let toastTimer;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ---------- Shell ---------- */
  function navItem(n, active) {
    return `<a href="${n.href}" class="${n.id === active ? 'active' : ''}">${icon(n.icon)}<span>${n.label}</span></a>`;
  }

  function renderShell(opts) {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
      <a class="brand" href="index.html">
        <div class="brand-mark">W</div>
        <div><div class="brand-name">Worthy<span>Ops</span></div><div class="brand-sub">Client Revenue Tracking</div></div>
      </a>
      <div class="nav-label">Dashboards</div>
      <nav class="nav">${NAV.filter(n => !n.group).map(n => navItem(n, opts.page)).join('')}</nav>
      ${isTeam() ? `<div class="nav-label">Manage</div>
      <nav class="nav">${NAV.filter(n => n.group === 'manage').map(n => navItem(n, opts.page)).join('')}</nav>` : ''}
      <div class="side-foot"><div class="side-card">
        <div class="side-card-label">Reporting window</div>
        <div class="side-card-value" id="sidePeriod">—</div>
        <div class="side-card-meta" id="sideMeta"></div>
      </div>
      ${session ? `<div class="side-user">
        <span class="avatar" style="background:rgba(79,140,255,0.16);color:#8fb4ff">${esc((session.user.email || '?')[0].toUpperCase())}</span>
        <div class="side-user-email" title="${esc(session.user.email || '')}">${esc(session.user.email || '')}<small>${{ team: 'Team member', client: 'Client view', none: 'No access yet' }[access.role]}</small></div>
        <button class="btn btn-sm btn-icon" id="signOutBtn" title="Sign out" aria-label="Sign out">${icon('logout')}</button>
      </div>` : ''}</div>`;
    const so = document.getElementById('signOutBtn');
    if (so) so.addEventListener('click', async () => { await BE.signOut(); location.replace('login.html'); });

    const showFilters = opts.filters !== false;
    const showAdd = isTeam() && opts.addButton !== false;
    const top = document.getElementById('topbar');
    top.innerHTML = `
      <button class="icon-btn" id="menuBtn" aria-label="Open menu">${icon('menu')}</button>
      <div class="tb-title"><h1>${opts.title}</h1><p>${opts.subtitle || ''}</p></div>
      ${showFilters || showAdd ? `<div class="tb-controls">
        ${showFilters ? `<select class="select" id="clientSel" aria-label="Client"></select>
        <div class="seg" id="rangeSeg" role="group" aria-label="Date range">
          <button data-r="3">3M</button><button data-r="6">6M</button><button data-r="12">12M</button>
        </div>` : ''}
        ${showAdd ? `<button class="btn btn-primary" id="addDataBtn">${icon('plus')}<span>Add data</span></button>` : ''}
      </div>` : ''}`;

    if (!document.querySelector('.backdrop')) {
      const b = document.createElement('div');
      b.className = 'backdrop';
      b.addEventListener('click', () => document.body.classList.remove('nav-open'));
      document.body.appendChild(b);
    }
    document.getElementById('menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));

    if (showFilters) {
      document.getElementById('clientSel').addEventListener('change', e => { setFilters({ client: e.target.value }); run(opts); });
      document.getElementById('rangeSeg').addEventListener('click', e => {
        const b = e.target.closest('button');
        if (b) { setFilters({ range: b.dataset.r }); run(opts); }
      });
    }
    if (showAdd) document.getElementById('addDataBtn').addEventListener('click', () => openAddData(opts));
  }

  function syncControls(ctx) {
    const sel = document.getElementById('clientSel');
    if (sel) {
      if (access.role === 'client') {
        sel.innerHTML = ctx.clients.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
        sel.disabled = true;
      } else {
        sel.innerHTML = `<option value="all">All Clients</option>` + ctx.clients.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
      }
      sel.value = ctx.filters.client;
    }
    document.querySelectorAll('#rangeSeg button').forEach(b => b.classList.toggle('on', b.dataset.r === String(ctx.filters.range)));
    document.getElementById('sidePeriod').textContent = periodLabel(ctx.months);
    const who = ctx.client ? ctx.client.name : `${ctx.clients.length} client${ctx.clients.length === 1 ? '' : 's'}`;
    document.getElementById('sideMeta').textContent = `${who} · ${ctx.months.length} months`;
  }

  function accessNotice() {
    const content = document.getElementById('content');
    let n = document.getElementById('accessNotice');
    if (access.role !== 'none') { if (n) n.remove(); return; }
    if (!n) {
      n = document.createElement('div');
      n.id = 'accessNotice';
      n.className = 'notice';
      n.innerHTML = `${icon('lock')}<div><b>Your login doesn't have access to any data yet.</b> Ask a WorthyOps team member to give you access. The dashboard fills in once they do.</div>`;
      content.prepend(n);
    }
  }

  let currentOpts = null;
  function run(opts) {
    currentOpts = opts;
    const ctx = buildCtx();
    syncControls(ctx);
    accessNotice();
    opts.render(ctx);
  }

  /* ---------- Saving (Supabase when connected, browser storage in demo mode) ---------- */
  async function saveRecord(rec) {
    if (BE.enabled) { await BE.upsertRecord(rec); await refresh(); return; }
    const d = getData();
    const i = d.records.findIndex(r => r.clientId === rec.clientId && r.month === rec.month);
    if (i >= 0) d.records[i] = rec; else d.records.push(rec);
    saveData(d);
  }
  async function createClient(name, industry) {
    if (BE.enabled) { const c = await BE.addClient({ name, industry }); await refresh(); return c.id; }
    const d = getData();
    const id = 'c' + Date.now().toString(36);
    d.clients.push({ id, name, industry });
    saveData(d);
    return id;
  }

  /* ---------- "Add data" form (team members only) ---------- */
  const RECORD_FIELDS = [
    ['inbound', 'Inbound leads'], ['outbound', 'Outbound leads'],
    ['meetings', 'Meetings booked'], ['showed', 'Showed up'],
    ['deals', 'Deals closed'], ['revenue', 'Revenue']
  ];

  function openAddData(opts) {
    if (document.getElementById('addModal')) return;
    const { clients } = getData();
    const f = getFilters();
    const preset = f.client !== 'all' && clients.some(c => c.id === f.client) ? f.client : (clients[0] ? clients[0].id : '__new');
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.id = 'addModal';
    wrap.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdTitle">
        <div class="modal-head">
          <div><h3 id="mdTitle">Add data</h3><p>Log one month of numbers for a client. Saving a month that already exists updates it.</p></div>
          <button type="button" class="btn btn-sm btn-icon btn-ghost" id="mdClose" aria-label="Close">${icon('x')}</button>
        </div>
        <form id="mdForm" class="form-grid" autocomplete="off">
          <div class="field"><label for="mdClient">Client</label>
            <select class="select input" id="mdClient">
              ${clients.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}
              <option value="__new">+ New client…</option>
            </select></div>
          <div class="field"><label for="mdMonth">Month</label><input class="input" type="month" id="mdMonth" required></div>
          <div class="field md-new"><label for="mdName">New client name</label><input class="input" id="mdName" placeholder="e.g. Summit Coaching"></div>
          <div class="field md-new"><label for="mdIndustry">Industry / niche</label><input class="input" id="mdIndustry" placeholder="e.g. Fitness Coaching"></div>
          ${RECORD_FIELDS.map(([k, label]) => `<div class="field"><label for="md_${k}">${label}${k === 'revenue' ? ` (${esc(getSettings().currency.trim())})` : ''}</label>
            <input class="input" type="number" min="0" step="${k === 'revenue' ? '0.01' : '1'}" id="md_${k}" placeholder="0"></div>`).join('')}
          <div class="field full"><div class="form-note" id="mdNote"></div></div>
          <div class="field full btn-row modal-actions">
            <button type="button" class="btn btn-ghost" id="mdCancel">Cancel</button>
            <button type="submit" class="btn btn-primary" id="mdSave">Save</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(wrap);
    const $ = id => document.getElementById(id);
    const val = k => Math.max(0, Number($('md_' + k).value) || 0);

    function close() { wrap.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    function syncNew() {
      const isNew = $('mdClient').value === '__new';
      wrap.querySelectorAll('.md-new').forEach(el => { el.hidden = !isNew; });
      $('mdName').required = isNew;
    }
    function validate() {
      const warns = [];
      if (val('showed') > val('meetings')) warns.push('Showed up is higher than meetings booked.');
      if (val('deals') > val('showed')) warns.push('Deals closed is higher than people who showed up.');
      const note = $('mdNote');
      note.className = 'form-note' + (warns.length ? ' warn' : '');
      note.textContent = warns.length ? '⚠ ' + warns.join(' ') : `Total leads = ${num(val('inbound') + val('outbound'))}`;
    }
    function prefill() {
      const existing = getData().records.find(r => r.clientId === $('mdClient').value && r.month === $('mdMonth').value);
      RECORD_FIELDS.forEach(([k]) => { $('md_' + k).value = existing ? existing[k] : ''; });
      $('mdTitle').textContent = existing ? 'Update data' : 'Add data';
      $('mdSave').textContent = existing ? 'Update' : 'Save';
      validate();
    }

    $('mdClient').value = preset;
    $('mdMonth').value = thisMonth();
    syncNew(); prefill();
    $('mdClient').addEventListener('change', () => { syncNew(); prefill(); });
    $('mdMonth').addEventListener('change', prefill);
    RECORD_FIELDS.forEach(([k]) => $('md_' + k).addEventListener('input', validate));
    $('mdClose').addEventListener('click', close);
    $('mdCancel').addEventListener('click', close);
    wrap.addEventListener('mousedown', e => { if (e.target === wrap) close(); });
    document.addEventListener('keydown', onKey);
    ($('mdClient').value === '__new' ? $('mdName') : $('md_inbound')).focus();

    $('mdForm').addEventListener('submit', async e => {
      e.preventDefault();
      const btn = $('mdSave');
      btn.disabled = true;
      try {
        let clientId = $('mdClient').value;
        if (clientId === '__new') {
          const name = $('mdName').value.trim();
          if (!name) { $('mdName').focus(); btn.disabled = false; return; }
          clientId = await createClient(name, $('mdIndustry').value.trim());
        }
        const month = $('mdMonth').value;
        const rec = { id: `${clientId}-${month}`, clientId, month };
        RECORD_FIELDS.forEach(([k]) => { rec[k] = val(k); });
        await saveRecord(rec);
        close();
        toast('Data saved');
        run(opts);
      } catch (err) {
        toast('Could not save: ' + (err.message || err));
        btn.disabled = false;
      }
    });
  }

  async function init(opts) {
    setupChartDefaults();
    if (BE.enabled) {
      session = await BE.requireAuth();
      try {
        const r = await BE.getRole(session.user.id);
        access = r ? { role: r.role, clientId: r.client_id } : { role: 'none', clientId: null };
      } catch (e) {
        access = { role: 'none', clientId: null };
      }
      if (opts.teamOnly && !isTeam()) { location.replace('index.html'); return; }
      document.documentElement.classList.remove('auth-pending');
      renderShell(opts);
      try {
        await refresh();
      } catch (e) {
        document.getElementById('content').innerHTML = `<div class="card empty"><h2>Couldn't load data</h2><p>${esc(e.message || e)}</p><button class="btn btn-primary" onclick="location.reload()">Retry</button></div>`;
        return;
      }
      BE.client.auth.onAuthStateChange(evt => { if (evt === 'SIGNED_OUT') location.replace('login.html'); });
    } else {
      renderShell(opts);
      window.addEventListener('storage', () => run(opts));
    }
    run(opts);
  }

  return {
    init, rerender: run, refresh, icon, PALETTE, backend: BE,
    isTeam, getAccess: () => access, openAddData: () => openAddData(currentOpts), saveRecord, createClient,
    getData, saveData, resetData, getFilters, setFilters, getSettings, setSettings,
    sum, byMonth, byClient, ratio, clientColor, thisMonth,
    num, compact, money, pct, delta, deltaHTML, monthLabel, periodLabel, esc, avatar, initials,
    chart, spark, donut, fade, barFill, hexA, xAxis, yAxis, EMPTY_RING,
    kpis, table, donutLegend, toast
  };
})();
