# AutomationTodayCA Service Report — V34

GitHub Pages files:
- index.html
- app.js
- style.css
- atd-logo.png

Backend backup:
- Code.gs

Google Apps Script deployment:
- Execute as: Me
- Who has access: Anyone
- Existing Web App /exec endpoint is used by app.js.

Security:
- ATD_SECRET stays only in Apps Script Script Properties.
- ATD_SECRET1 is NOT used.
- Google OAuth Client ID is public client configuration and may appear in browser code.
- Google ID token is verified by the backend.

Drive folder: AutomationTodayCA Service Reports
Email: customer + automationtodayca@gmail.com
