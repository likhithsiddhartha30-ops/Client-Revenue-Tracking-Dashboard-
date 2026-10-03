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

## Running it

Open `index.html` in a browser, or serve the folder locally:

```bash
npx http-server -p 5173
```

Then open http://localhost:5173.

## Notes

- It ships with sample data for 5 demo clients. Use **Data Entry → Clear all data** to start tracking real numbers.
- Data is stored in the browser's localStorage, so it stays on the device and browser where it was entered.
- Chart.js and the Google Fonts load from CDNs, so the page needs an internet connection.

## Structure

```
assets/css/styles.css      shared design system
assets/js/seed.js          sample data
assets/js/common.js        layout, filters, storage, formatting, chart helpers
assets/js/pages/*.js       one script per page
```
