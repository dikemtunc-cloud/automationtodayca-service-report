AutomationTodayCA Service Report — FINAL frontend + backend update

FILES
- index.html
- app.js
- style.css
- Code.gs
- atd-logo.png

IMPORTANT SECURITY
- ATD_SECRET and ATD_SECRET1 are read only from Apps Script Script Properties.
- Their values are NOT in index.html, app.js, style.css, or GitHub.
- The backend requires both properties to exist before delivery.
- Google ID-token verification remains server-side.
- GOOGLE_CLIENT_ID is read from Script Properties when present, with the existing client ID retained as a compatibility fallback.

FORM FEATURES
- Dynamic customer email fields (+ Add Email / remove)
- Dynamic phone fields (+ Add Phone / remove)
- Required Start Time and End Time
- Required fields are highlighted yellow when missing/invalid
- Section indicators: red = required missing, yellow = optional information missing, green = complete
- Existing Drive + Gmail delivery flow retained
- Existing single customerEmail field remains supported for compatibility

DEPLOYMENT
1. Replace Code.gs in Apps Script with this Code.gs.
2. Confirm Script Properties contain:
   ATD_SECRET
   ATD_SECRET1
   GOOGLE_CLIENT_ID (recommended)
3. Deploy a new Web App version using the same deployment URL if possible.
4. Upload index.html, app.js, style.css and atd-logo.png to GitHub Pages.
5. Test Google login first.
6. Then submit a test report and verify both Drive and Gmail.

DO NOT put ATD_SECRET or ATD_SECRET1 into GitHub/frontend code.
