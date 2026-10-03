(function () {
  const $ = id => document.getElementById(id);
  const BE = window.WO_BACKEND;
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  $('iMail').innerHTML = svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>');
  $('iLock').innerHTML = svg('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>');

  const forms = ['signinForm', 'resetForm', 'newPwForm', 'notConfigured'];
  const show = id => forms.forEach(f => { $(f).hidden = f !== id; });
  const msg = (id, text, ok) => { const m = $(id); m.textContent = text || ''; m.className = 'login-msg' + (text ? (ok ? ' ok' : ' err') : ''); };

  const params = new URLSearchParams(location.search);
  const next = (params.get('next') || 'index.html').replace(/[^\w.\-?=&]/g, '');
  const goNext = () => location.replace(/^[\w-]+\.html/.test(next) ? next : 'index.html');

  document.documentElement.classList.remove('auth-pending');

  if (!BE.enabled) { show('notConfigured'); return; }

  let recovering = /type=recovery/.test(location.hash);
  if (recovering) show('newPwForm');

  BE.client.auth.onAuthStateChange(evt => {
    if (evt === 'PASSWORD_RECOVERY') { recovering = true; show('newPwForm'); }
  });
  BE.getSession().then(s => { if (s && !recovering) goNext(); });

  $('pwToggle').addEventListener('click', () => {
    const pw = $('password'), hidden = pw.type === 'password';
    pw.type = hidden ? 'text' : 'password';
    $('pwToggle').textContent = hidden ? 'Hide' : 'Show';
    $('pwToggle').setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
  });

  $('signinForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('signinBtn');
    btn.disabled = true; btn.textContent = 'Signing in…'; msg('signinMsg');
    const { error } = await BE.signIn($('email').value.trim(), $('password').value);
    if (error) {
      msg('signinMsg', /invalid/i.test(error.message) ? 'Incorrect email or password.' : error.message);
      btn.disabled = false; btn.textContent = 'Sign in';
      return;
    }
    goNext();
  });

  $('forgotLink').addEventListener('click', e => { e.preventDefault(); $('resetEmail').value = $('email').value; msg('resetMsg'); show('resetForm'); });
  $('backLink').addEventListener('click', e => { e.preventDefault(); show('signinForm'); });

  $('resetForm').addEventListener('submit', async e => {
    e.preventDefault();
    const { error } = await BE.sendReset($('resetEmail').value.trim());
    msg('resetMsg', error ? error.message : 'If that email has an account, a reset link is on its way.', !error);
  });

  $('newPwForm').addEventListener('submit', async e => {
    e.preventDefault();
    const { error } = await BE.updatePassword($('newPw').value);
    if (error) { msg('newPwMsg', error.message); return; }
    msg('newPwMsg', 'Password updated. Taking you to the dashboard…', true);
    setTimeout(() => location.replace('index.html'), 1200);
  });
})();
