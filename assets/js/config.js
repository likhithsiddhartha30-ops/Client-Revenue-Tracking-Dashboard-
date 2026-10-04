/* Supabase connection. Both values are in Supabase → Project Settings → API.
   The anon (publishable) key is safe to ship in the browser: Row Level Security
   in supabase/schema.sql only lets signed-in users read or write data.
   Leave both empty to run the dashboard in local demo mode (no login, browser storage). */
window.WO_CONFIG = {
  supabaseUrl: 'https://bfkdpjszfvzkviuujroc.supabase.co',
  supabaseAnonKey: 'sb_publishable_6dFKioaQ9i-xW7SR1n6Xtg_qgyfHugG'
};

// Hide the app until the login check finishes, so signed-out visitors never see a flash of the dashboard.
if (window.WO_CONFIG.supabaseUrl && window.WO_CONFIG.supabaseAnonKey) {
  document.documentElement.classList.add('auth-pending');
}
