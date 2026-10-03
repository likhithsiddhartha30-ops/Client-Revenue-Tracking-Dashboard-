/* Supabase auth + data access. Active only when assets/js/config.js has a URL and key. */
window.WO_BACKEND = (function () {
  const cfg = window.WO_CONFIG || {};
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  const sb = enabled ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

  const fromRow = r => ({
    id: `${r.client_id}-${r.month.slice(0, 7)}`,
    clientId: r.client_id,
    month: r.month.slice(0, 7),
    inbound: r.inbound_leads,
    outbound: r.outbound_leads,
    meetings: r.meetings_booked,
    showed: r.showed_up,
    deals: r.deals_closed,
    revenue: Number(r.revenue)
  });
  const toRow = r => ({
    client_id: r.clientId,
    month: r.month + '-01',
    inbound_leads: r.inbound,
    outbound_leads: r.outbound,
    meetings_booked: r.meetings,
    showed_up: r.showed,
    deals_closed: r.deals,
    revenue: r.revenue
  });
  const check = res => { if (res.error) throw res.error; return res.data; };

  async function getSession() {
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    return data.session;
  }

  // Resolves with the session, or redirects to the login page and never resolves.
  async function requireAuth() {
    if (!enabled) return null;
    const session = await getSession();
    if (session) return session;
    const here = location.pathname.split('/').pop() || 'index.html';
    location.replace('login.html?next=' + encodeURIComponent(here));
    return new Promise(() => {});
  }

  async function fetchAll() {
    const [c, r] = await Promise.all([
      sb.from('clients').select('id, name, industry').order('created_at'),
      sb.from('monthly_records').select('*').order('month')
    ]);
    return { clients: check(c), records: check(r).map(fromRow) };
  }

  return {
    enabled,
    client: sb,
    getSession,
    requireAuth,
    fetchAll,
    signIn: (email, password) => sb.auth.signInWithPassword({ email, password }),
    signOut: () => sb.auth.signOut(),
    sendReset: email => sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname.replace(/[^/]*$/, 'login.html') }),
    updatePassword: password => sb.auth.updateUser({ password }),
    upsertRecord: async rec => check(await sb.from('monthly_records').upsert(toRow(rec), { onConflict: 'client_id,month' })),
    deleteRecord: async rec => check(await sb.from('monthly_records').delete().eq('client_id', rec.clientId).eq('month', rec.month + '-01')),
    addClient: async c => check(await sb.from('clients').insert({ name: c.name, industry: c.industry || null }).select('id, name, industry').single()),
    deleteClient: async id => check(await sb.from('clients').delete().eq('id', id)),
    wipe: async () => check(await sb.from('clients').delete().not('id', 'is', null)),
    loadSample: async seed => {
      check(await sb.from('clients').upsert(seed.clients, { onConflict: 'id' }));
      check(await sb.from('monthly_records').upsert(seed.records.map(toRow), { onConflict: 'client_id,month' }));
    }
  };
})();
