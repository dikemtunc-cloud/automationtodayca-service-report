# AutomationTodayCA Service Report V8 — Google Sign-In

Responsive branded field service report prototype.

### V2 changes
- ATD.CA logo added
- Yellow branded section headers
- Yellow emphasis for customer/company, service date, customer name and service status
- Report number highlighted
- Service type and service result button controls
- Progress indicator
- Improved mobile layout
- Print styling for PDF testing
- Sequential `SR_ATD_22AD0005XXX` report numbering

### Next
1. Approve the form layout.
2. Build a professional PDF generator.
3. Connect the existing GitHub/Gmail mail workflow.
4. Add Google Drive PDF archiving.

### V3.1 status fix
The status area no longer uses a generic yellow active rule. Each status has its own ATD-inspired color.

### Customer PDF
The generated PDF is clearly identified as a **CUSTOMER COPY** and includes the signed service report, customer acceptance statement, service/equipment details, work performed, materials, status, and relevant notes.

### V1.1 fix
Fixed the Next button: repeatable equipment/material rows are collected without using FormData on non-form elements, and native required-field validation is shown before advancing.

### Review screen update
The final review no longer exposes raw JSON. It now presents a customer-friendly service report summary with status, equipment, work, materials, notes, signature confirmation, and PDF/print actions.

### PDF generation fix
Fixed the Customer PDF generator by making the asynchronous PDF function valid JavaScript and added a clear message if the PDF library has not loaded. Removed the duplicate legacy PDF buttons from the review screen.

### V4 live-cache/PDF fix
Fixed the live-repository `async async function` syntax error, removed the legacy footer action bar deterministically when entering Review, bound the PDF/print buttons explicitly, and cache-busted CSS/JS URLs to prevent stale GitHub Pages assets.

### V5 PDF engine fix
Removed the external jsPDF-AutoTable dependency and replaced it with a built-in table renderer. The customer PDF now requires only jsPDF, reducing CDN/plugin failures. Cache version bumped to V5.

### V6 review/edit/final confirmation
Review is now a non-final draft stage. EDIT REPORT returns to the form without losing entered data or signature. SUBMIT & CONFIRM records final acceptance and only then advances the unique service-report counter. PDF/Print actions appear after final confirmation.

## V7 — Gmail + Google Drive delivery
The GitHub Pages frontend remains static. Secure Gmail/Drive operations are handled by a Google Apps Script Web App because GitHub Pages cannot safely access GitHub Actions Secrets from browser JavaScript and browser-side SMTP credentials would be exposed.

### Setup
1. Open Google Apps Script and create a new project.
2. Paste `Code.gs`.
3. Set `ATD_SECRET` to a private value and set `COMPANY_EMAIL` to the AutomationTodayCA recipient address.
4. Deploy as **Web app**, execute as **Me**, access **Anyone**.
5. Copy the `/exec` Web App URL into `DELIVERY_CONFIG.webAppUrl` in `app.js` and use the same secret in `DELIVERY_CONFIG.token`.
6. Authorize Google Drive and Gmail permissions on first deployment/use.
7. Upload the V7 frontend files to GitHub Pages.

### What happens on SUBMIT & CONFIRM
The browser generates the final Customer Copy PDF, sends it to the Apps Script endpoint, and Apps Script saves the PDF in `AutomationTodayCA Service Reports` in Google Drive and emails the PDF attachment to the customer and AutomationTodayCA company email.


## V8 — Google Sign-In

The Service Report frontend is now gated by Google Sign-In. Only the authorized `automationtodayca@gmail.com` Google account is accepted.

### Google Cloud OAuth configuration
- OAuth client type: **Web application**
- Authorized JavaScript origin: `https://dikemtunc-cloud.github.io`
- Authorized account: `automationtodayca@gmail.com`
- Google Client ID is already embedded in `app.js`.
- No redirect URI is required for the Google Identity Services button flow used by this static GitHub Pages application.

### GitHub Pages
Upload/replace the V8 frontend files and allow GitHub Pages to redeploy. The page cache version is set to `app.js?v=8`.

### Important security note
The Google sign-in gate is a frontend access gate. The existing Google Apps Script endpoint and secret continue to handle Gmail/Drive delivery separately. For high-security/enterprise use, the Apps Script endpoint should also verify the Google ID token server-side before processing a delivery request.
