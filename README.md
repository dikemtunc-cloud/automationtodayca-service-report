# AutomationTodayCA Service Report

## GitHub Pages files
Upload these files to the repository root:
- index.html
- app.js
- style.css
- atd-logo.png

## Google Apps Script
`Code.gs` is included as the matching backend.

Deployment:
- Execute as: **Me**
- Who has access: **Anyone**

Keep the existing `/exec` URL:
`https://script.google.com/macros/s/AKfycbwfczh-MvsK32iZKLIUlN56YyOC-gca5LGmLlIE8s8b-yTuVvwfDocXt74xaZUChyop/exec`

Script Properties must contain:
- `ATD_SECRET`

The actual secret is never stored in GitHub or frontend code.

Google authentication:
- Client ID: 246009211153-kqkpn2d35ebrgu5osa1l12i8tt4rhd21.apps.googleusercontent.com
- Authorized account: automationtodayca@gmail.com

The backend verifies the Google ID token server-side, saves the PDF to:
`AutomationTodayCA Service Reports`

and emails the customer plus `automationtodayca@gmail.com`.
