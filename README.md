# AutomationTodayCA Service Report

## GitHub Pages files

Upload these files to the repository root:
- `index.html`
- `app.js`
- `style.css`
- `atd-logo.png`

## Google Apps Script backend

The frontend uses the existing Google Apps Script Web App `/exec` endpoint.

The frontend sends the Google Identity Services ID token as `googleCredential`.
The backend verifies the token server-side and keeps `ATD_SECRET` only in Apps Script Script Properties.

Do not put `ATD_SECRET` in GitHub or frontend code.

Deployment settings:
- Execute as: **Me**
- Who has access: **Anyone**

Backend Web App:
`https://script.google.com/macros/s/AKfycbwfczh-MvsK32iZKLIUlN56YyOC-gca5LGmLlIE8s8b-yTuVvwfDocXt74xaZUChyop/exec`

The backend saves accepted Customer Copies to:
`AutomationTodayCA Service Reports`

and emails the customer plus:
`automationtodayca@gmail.com`
