(function () {
  const $ = id => document.getElementById(id);
  const FIELDS = ['inbound', 'outbound', 'meetings', 'showed', 'deals', 'revenue'];
  const input = k => $('f' + k[0].toUpperCase() + k.slice(1));
  let bound = false;
  let recFilter = 'all';

  function currentMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function fillForm(rec) {
    FIELDS.forEach(k => { input(k).value = rec ? rec[k] : ''; });
    $('formTitle').textContent = rec ? 'Edit Monthly Numbers' : 'Log Monthly Numbers';
    $('saveBtn').textContent = rec ? 'Update entry' : 'Save entry';
    validate();
  }

  function loadExisting() {
    const { records } = WO.getData();
    fillForm(records.find(r => r.clientId === $('fClient').value && r.month === $('fMonth').value) || null);
  }

  function validate() {
    const v = k => Number(input(k).value) || 0;
    const warns = [];
    if (v('showed') > v('meetings')) warns.push('Showed up is higher than meetings booked.');
    if (v('deals') > v('showed')) warns.push('Deals closed is higher than people who showed up.');
    if (v('meetings') > v('inbound') + v('outbound')) warns.push('Meetings booked is higher than total leads.');
    const note = $('formNote');
    note.className = 'form-note' + (warns.length ? ' warn' : '');
    note.textContent = warns.length ? '⚠ ' + warns.join(' ') : `Total leads = inbound + outbound = ${WO.num(v('inbound') + v('outbound'))}.`;
  }

  function render() {
    const { clients, records } = WO.getData();
    const settings = WO.getSettings();
    $('curSym').textContent = settings.currency.trim();
    $('sCurrency').value = settings.currency;

    const prevClient = $('fClient').value;
    $('fClient').innerHTML = clients.length
      ? clients.map(c => `<option value="${WO.esc(c.id)}">${WO.esc(c.name)}</option>`).join('')
      : '<option value="">Add a client first</option>';
    if (clients.some(c => c.id === prevClient)) $('fClient').value = prevClient;
    if (!$('fMonth').value) $('fMonth').value = currentMonth();

    if (recFilter !== 'all' && !clients.some(c => c.id === recFilter)) recFilter = 'all';
    $('recFilter').innerHTML = `<option value="all">All clients</option>` + clients.map(c => `<option value="${WO.esc(c.id)}">${WO.esc(c.name)}</option>`).join('');
    $('recFilter').value = recFilter;

    const name = id => (clients.find(c => c.id === id) || {}).name || 'Unknown';
    const rows = records.filter(r => recFilter === 'all' || r.clientId === recFilter)
      .slice().sort((a, b) => b.month.localeCompare(a.month) || name(a.clientId).localeCompare(name(b.clientId)));
    $('recCount').textContent = `${rows.length} record${rows.length === 1 ? '' : 's'}`;

    if (!rows.length) {
      $('records').innerHTML = '<p class="form-note" style="padding:20px 4px">No records yet. Use the form to log your first month.</p>';
    } else {
      WO.table('#records', [
        { label: 'Month', render: r => WO.monthLabel(r.month) },
        { label: 'Client', render: r => WO.esc(name(r.clientId)) },
        { label: 'Leads', num: true, render: r => WO.num(Number(r.inbound) + Number(r.outbound)) },
        { label: 'Meetings', num: true, render: r => WO.num(r.meetings) },
        { label: 'Showed', num: true, render: r => WO.num(r.showed) },
        { label: 'Deals', num: true, render: r => WO.num(r.deals) },
        { label: 'Revenue', num: true, render: r => WO.money(r.revenue) },
        { label: '', num: true, render: r => `<button class="btn btn-sm btn-icon" title="Edit" aria-label="Edit" data-edit="${WO.esc(r.id)}">${WO.icon('edit')}</button> <button class="btn btn-sm btn-icon btn-danger" title="Delete" aria-label="Delete" data-del="${WO.esc(r.id)}">${WO.icon('trash')}</button>` }
      ], rows);
    }

    $('clientList').innerHTML = clients.length ? `<div class="table-wrap"><table class="tbl"><tbody>${clients.map(c => `
      <tr><td><div class="client-cell">${WO.avatar(c.name, WO.clientColor(clients, c.id))}<div>${WO.esc(c.name)}<small>${WO.esc(c.industry || '')} · ${records.filter(r => r.clientId === c.id).length} records</small></div></div></td>
      <td class="num"><button class="btn btn-sm btn-danger" data-delclient="${WO.esc(c.id)}">Remove</button></td></tr>`).join('')}</tbody></table></div>`
      : '<p class="form-note">No clients yet.</p>';

    if (!bound) bind();
  }

  // Runs a change against Supabase (when connected) or browser storage, then re-renders.
  async function mutate(remoteFn, localFn, okMsg) {
    try {
      if (WO.backend.enabled) { await remoteFn(); await WO.refresh(); }
      else { const d = WO.getData(); localFn(d); WO.saveData(d); }
    } catch (err) {
      WO.toast('Could not save: ' + (err.message || err));
      return false;
    }
    if (okMsg) WO.toast(okMsg);
    render();
    return true;
  }

  function bind() {
    bound = true;

    $('entryForm').addEventListener('submit', async e => {
      e.preventDefault();
      const clientId = $('fClient').value, month = $('fMonth').value;
      if (!clientId) { WO.toast('Add a client first'); return; }
      const rec = { id: `${clientId}-${month}`, clientId, month };
      FIELDS.forEach(k => { rec[k] = Math.max(0, Number(input(k).value) || 0); });
      const exists = WO.getData().records.some(r => r.clientId === clientId && r.month === month);
      $('saveBtn').disabled = true;
      const ok = await mutate(
        () => WO.backend.upsertRecord(rec),
        d => {
          const i = d.records.findIndex(r => r.clientId === clientId && r.month === month);
          if (i >= 0) d.records[i] = rec; else d.records.push(rec);
        },
        exists ? 'Entry updated' : 'Entry saved');
      $('saveBtn').disabled = false;
      if (ok) fillForm(rec);
    });
    $('clearForm').addEventListener('click', () => fillForm(null));
    $('fClient').addEventListener('change', loadExisting);
    $('fMonth').addEventListener('change', loadExisting);
    FIELDS.forEach(k => input(k).addEventListener('input', validate));

    $('recFilter').addEventListener('change', e => { recFilter = e.target.value; render(); });
    $('records').addEventListener('click', async e => {
      const edit = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
      const { records } = WO.getData();
      if (edit) {
        const r = records.find(x => x.id === edit.dataset.edit);
        if (!r) return;
        $('fClient').value = r.clientId; $('fMonth').value = r.month;
        fillForm(r);
        $('entryForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (del && confirm('Delete this record?')) {
        const r = records.find(x => x.id === del.dataset.del);
        if (!r) return;
        await mutate(() => WO.backend.deleteRecord(r), d => { d.records = d.records.filter(x => x.id !== r.id); }, 'Record deleted');
        loadExisting();
      }
    });

    $('clientForm').addEventListener('submit', async e => {
      e.preventDefault();
      const name = $('cName').value.trim();
      if (!name) return;
      const industry = $('cIndustry').value.trim();
      let newId = 'c' + Date.now().toString(36);
      const ok = await mutate(
        async () => { newId = (await WO.backend.addClient({ name, industry })).id; },
        d => { d.clients.push({ id: newId, name, industry }); },
        `${name} added`);
      if (!ok) return;
      $('clientForm').reset();
      $('fClient').value = newId; loadExisting();
    });
    $('clientList').addEventListener('click', async e => {
      const b = e.target.closest('[data-delclient]');
      if (!b) return;
      const c = WO.getData().clients.find(x => x.id === b.dataset.delclient);
      if (!c || !confirm(`Remove ${c.name} and all of its records?`)) return;
      await mutate(
        () => WO.backend.deleteClient(c.id),
        d => { d.clients = d.clients.filter(x => x.id !== c.id); d.records = d.records.filter(x => x.clientId !== c.id); },
        `${c.name} removed`);
      loadExisting();
    });

    $('sCurrency').addEventListener('change', e => { WO.setSettings({ currency: e.target.value }); WO.toast('Currency updated'); render(); });

    $('exportBtn').addEventListener('click', () => {
      const { clients, records } = WO.getData();
      const name = id => (clients.find(c => c.id === id) || {}).name || '';
      const head = ['Month', 'Client', 'Inbound Leads', 'Outbound Leads', 'Total Leads', 'Meetings Booked', 'Showed Up', 'Deals Closed', 'Revenue'];
      const lines = records.slice().sort((a, b) => a.month.localeCompare(b.month)).map(r =>
        [r.month, name(r.clientId), r.inbound, r.outbound, Number(r.inbound) + Number(r.outbound), r.meetings, r.showed, r.deals, r.revenue]
          .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
      const blob = new Blob([[head.join(',')].concat(lines).join('\n')], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'worthyops-revenue-data.csv';
      a.click(); URL.revokeObjectURL(a.href);
    });
    $('sampleBtn').addEventListener('click', async () => {
      const msg = WO.backend.enabled ? 'Add the 5 demo clients and their sample records to the database?' : 'Replace all current data with the sample data?';
      if (!confirm(msg)) return;
      WO.setFilters({ client: 'all' });
      if (WO.backend.enabled) await mutate(() => WO.backend.loadSample(WO_SEED), () => {}, 'Sample data loaded');
      else { WO.resetData(); WO.toast('Sample data loaded'); render(); }
      loadExisting();
    });
    $('wipeBtn').addEventListener('click', async () => {
      const where = WO.backend.enabled ? 'from the database' : 'from this browser';
      if (!confirm(`Delete ALL clients and records ${where}? This cannot be undone.`)) return;
      WO.setFilters({ client: 'all' });
      await mutate(() => WO.backend.wipe(), d => { d.clients = []; d.records = []; }, 'All data cleared');
      fillForm(null);
    });
  }

  WO.init({
    page: 'data',
    title: 'Data Entry',
    subtitle: 'Log monthly numbers for each client. Every dashboard updates instantly',
    filters: false,
    render
  }).then(loadExisting);
})();
