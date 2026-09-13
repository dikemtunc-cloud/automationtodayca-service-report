# AutomationTodayCA Service Report — Google Auth + Delivery Backend

This package restores the working Google Drive + Gmail delivery configuration while keeping the Google Sign-In lock.

## GitHub Pages
Replace the repository files with:
- index.html
- app.js
- style.css
- atd-logo.png

## Google Apps Script
Replace the Apps Script `Code.gs` with the included `Code.gs`.

Deployment settings:
- Execute as: **Me**
- Who has access: **Anyone**

After saving the script, use **Deploy → Manage deployments → Edit** and create a new version of the existing Web App deployment. Keep the same `/exec` URL if possible.

The frontend is already configured with the existing Apps Script `/exec` endpoint and the matching shared delivery secret.

## Important
Do not publish any OAuth client secret. The Google OAuth Client ID may be present in browser code. The Google OAuth Client ID is safe to be present in browser code; the backend now verifies the Google ID token server-side; no delivery secret is embedded in the frontend.

The backend saves each accepted Customer Copy into the Google Drive folder:
`AutomationTodayCA Service Reports`

and emails the customer plus `automationtodayca@gmail.com`.
