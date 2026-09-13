# AutomationTodayCA Service Report — Final Secure Build

## Files
- index.html
- app.js
- style.css
- Code.gs

## GitHub
Replace the existing `index.html`, `app.js`, and `style.css`.
Keep your existing `atd-logo.png` in the repository.

The frontend does NOT contain ATD_SECRET or ATD_SECRET1.

## Apps Script
Replace Code.gs with the included version.

Script Properties MUST contain:
- ATD_SECRET
- ATD_SECRET1

Do not put their values in GitHub.

Deploy as Web App:
- Execute as: Me
- Who has access: Anyone

After saving Code.gs:
Deploy -> Manage deployments -> Edit -> New version -> Deploy

## Google authentication
The frontend sends the current Google ID token as `googleCredential`.
The backend verifies it server-side.

## Form changes
- Multiple customer emails with add/remove
- Multiple phone numbers with add/remove
- Required Start Time
- Required End Time
- Required-field yellow highlighting
- Section status: red = missing required, yellow = missing optional, green = complete
