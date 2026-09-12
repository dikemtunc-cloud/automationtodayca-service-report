/**
 * AutomationTodayCA Service Report delivery backend
 *
 * Deploy this Google Apps Script as a Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Then paste the /exec URL into app.js DELIVERY_CONFIG.webAppUrl
 * and use the same secret in DELIVERY_CONFIG.token and ATD_SECRET below.
 */
const ATD_SECRET = 'CHANGE_THIS_ATD_SECRET';
const COMPANY_EMAIL = 'YOUR_COMPANY_GMAIL_OR_DOMAIN_EMAIL';
const DRIVE_FOLDER_NAME = 'AutomationTodayCA Service Reports';

function doGet() {
  return ContentService
    .createTextOutput('AutomationTodayCA Service Report delivery endpoint is active.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (data.token !== ATD_SECRET) throw new Error('Unauthorized request.');
    if (!data.reportNo || !data.pdfBase64) throw new Error('Missing report number or PDF.');

    const bytes = Utilities.base64Decode(data.pdfBase64);
    const blob = Utilities.newBlob(bytes, MimeType.PDF, data.filename || (data.reportNo + '.pdf'));

    const folder = getOrCreateFolder_(DRIVE_FOLDER_NAME);
    const file = folder.createFile(blob);

    const subject = 'AutomationTodayCA Service Report ' + data.reportNo;
    const body = [
      'Please find attached the AutomationTodayCA Service Report.',
      '',
      'Service Report No.: ' + data.reportNo,
      'Customer: ' + (data.company || ''),
      '',
      'This is the Customer Copy generated after customer acceptance.'
    ].join('\n');

    const recipients = uniqueEmails_([data.customerEmail, COMPANY_EMAIL]);
    if (recipients.length) {
      GmailApp.sendEmail(recipients.join(','), subject, body, {attachments:[file.getBlob()]});
    }

    return json_({ok:true, reportNo:data.reportNo, driveFileId:file.getId()});
  } catch (err) {
    return json_({ok:false, error:String(err.message || err)});
  }
}

function getOrCreateFolder_(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function uniqueEmails_(values) {
  return [...new Set(values.filter(Boolean).map(v => String(v).trim().toLowerCase()).filter(v => v.includes('@')))];
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
