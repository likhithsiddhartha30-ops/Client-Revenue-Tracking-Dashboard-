/* Sample data used until you log your own numbers on the Data Entry page.
   12 months (Oct 2025 – Sep 2026) for 5 demo clients. */
window.WO_SEED = (function () {
  let s = 20261003;
  const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  const between = (a, b) => a + (b - a) * rnd();

  const clients = [
    { id: 'c1', name: 'Apex Fitness Co.',   industry: 'Fitness Coaching',  avgDeal: 1800, base: 120, growth: 0.06 },
    { id: 'c2', name: 'Northstar Coaching', industry: 'Business Coaching', avgDeal: 3500, base: 70,  growth: 0.05 },
    { id: 'c3', name: 'Lumen Wellness',     industry: 'Health & Wellness', avgDeal: 950,  base: 160, growth: 0.04 },
    { id: 'c4', name: 'Vertex Consulting',  industry: 'B2B Consulting',    avgDeal: 6200, base: 40,  growth: 0.07 },
    { id: 'c5', name: 'Orbit Academy',      industry: 'Online Education',  avgDeal: 1200, base: 140, growth: 0.03 }
  ];

  const months = [];
  let y = 2025, m = 10;
  for (let i = 0; i < 12; i++) {
    months.push(`${y}-${String(m).padStart(2, '0')}`);
    if (++m > 12) { m = 1; y++; }
  }

  const records = [];
  clients.forEach(c => {
    months.forEach((mo, i) => {
      const leads = Math.round(c.base * Math.pow(1 + c.growth, i) * between(0.85, 1.15));
      const inbound = Math.round(leads * between(0.5, 0.72));
      const outbound = leads - inbound;
      const meetings = Math.round(leads * between(0.22, 0.34));
      const showed = Math.round(meetings * between(0.72, 0.9));
      const deals = Math.max(1, Math.round(showed * between(0.24, 0.4)));
      const revenue = Math.round(deals * c.avgDeal * between(0.88, 1.12) / 10) * 10;
      records.push({ id: `${c.id}-${mo}`, clientId: c.id, month: mo, inbound, outbound, meetings, showed, deals, revenue });
    });
  });

  return { clients: clients.map(({ id, name, industry }) => ({ id, name, industry })), records };
})();
