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
- `supabase/schema.sql` creates the `clients` and `monthly_records` tables and the `client_monthly_summary` view. Run `supabase/roles.sql` after it to add roles and access rules. `supabase/seed.sql` loads optional demo data.
- Public sign-ups are disabled. Create logins in Supabase → Authentication → Users → **Add user**, then give each one a role in **Data Entry → Access**:
  - **Team member**: sees every client, gets the **Add data** button and the Manage pages.
  - **Client**: sees only their own company's numbers, read-only.
  - Logins without a role see an empty dashboard.
- For password-reset emails to link back correctly, set Supabase → Authentication → URL Configuration → **Site URL** to wherever the dashboard is hosted.
- Clear both values in `config.js` to run in local demo mode (no login, browser storage).

## Notes

- With no data logged, every dashboard shows zeros for the selected months. Team members use **Add data** (top right) to log a month for an existing or new client.
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
