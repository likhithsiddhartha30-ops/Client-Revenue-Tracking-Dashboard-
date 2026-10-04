# Client-Revenue-Tracking-Dashboard-

WorthyOps Client Revenue Tracking: a multi-page dashboard for tracking each client's leads, meetings booked, deals closed and revenue.

## Pages

| Page | File |
|---|---|
| Overview | `index.html` |
| Leads | `leads.html` |
| Meetings | `meetings.html` |
| Deals Closed | `deals.html` |
| Revenue | `revenue.html` |
| Clients | `clients.html` |
| Data Entry | `data.html` |
| Sign in | `login.html` |

## Running it

Open `index.html` in a browser, or serve the folder locally:

```bash
npx http-server -p 5173
```

Then open http://localhost:5173.

## Login & database (Supabase)

The dashboard signs users in with Supabase Auth and stores data in the **Worthyops-Client-Revenue-Tracking** Supabase project.

- Connection settings live in `assets/js/config.js` (project URL + publishable key, which is safe to ship in the browser).
- `supabase/schema.sql` creates the `clients` and `monthly_records` tables, the `client_monthly_summary` view and Row Level Security so only signed-in users can read or write. `supabase/seed.sql` loads the demo data.
- Public sign-ups are disabled. Add users in Supabase → Authentication → Users → **Add user**.
- For password-reset emails to link back correctly, set Supabase → Authentication → URL Configuration → **Site URL** to wherever the dashboard is hosted.
- Clear both values in `config.js` to run in local demo mode (no login, browser storage).

## Notes

- It ships with sample data for 5 demo clients. Use **Data Entry → Clear all data** to start tracking real numbers.
- Chart.js and the Google Fonts load from CDNs, so the page needs an internet connection.

## Structure

```
assets/css/styles.css      shared design system
assets/js/config.js        Supabase connection settings
assets/js/backend.js       Supabase auth + data access
assets/js/seed.js          sample data (demo mode)
assets/js/common.js        layout, filters, storage, formatting, chart helpers
assets/js/pages/*.js       one script per page
supabase/*.sql             database schema and seed data
```
