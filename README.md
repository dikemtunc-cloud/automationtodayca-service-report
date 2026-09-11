# AutomationTodayCA Service Report V3.1

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
