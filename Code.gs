/**
 * AutomationTodayCA Service Report — Google Apps Script backend
 *
 * Deploy as Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * The frontend sends a PDF as base64. This script saves the PDF to
 * Google Drive and emails the customer copy.
 */

const ATD_SECRET = 'patetesliborek340528';
const COMPANY_EMAIL = 'automationtodayca@gmail.com';
const DRIVE_FOLDER_NAME = 'AutomationTodayCA Service Reports';

function doGet() {
  return ContentService
    .createTextOutput('AutomationTodayCA Service Report delivery endpoint is active.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Empty request.');
    }

    const data = JSON.parse(e.postData.contents);

    if (String(data.token || '') !== ATD_SECRET) {
      throw new Error('Unauthorized request.');
    }

    if (!data.reportNo) {
      throw new Error('Missing report number.');
    }

    if (!data.pdfBase64) {
      throw new Error('Missing PDF data.');
    }

    const bytes = Utilities.base64Decode(data.pdfBase64);
    const filename = data.filename || (data.reportNo + '.pdf');
    const blob = Utilities.newBlob(bytes, MimeType.PDF, filename);

    const folder = getOrCreateFolder_(DRIVE_FOLDER_NAME);
    const file = folder.createFile(blob);

    const subject = 'AutomationTodayCA Service Report ' + data.reportNo;

    const body = [
      'Dear Customer,',
      '',
      'Please find attached your AutomationTodayCA Service Report.',
      '',
      'Service Report No.: ' + data.reportNo,
      'Customer: ' + (data.company || ''),
      '',
      'This Customer Copy was generated after customer acceptance.',
      '',
      'Thank you,',
      'AutomationTodayCA',
      'Reliable Solutions for a Smarter Tomorrow'
    ].join('\n');

    const customerEmail = String(data.customerEmail || '').trim();
    const recipients = uniqueEmails_([customerEmail, COMPANY_EMAIL]);

    if (recipients.length === 0) {
      throw new Error('No valid email recipient was supplied.');
    }

    GmailApp.sendEmail(
      recipients.join(','),
      subject,
      body,
      {
        attachments: [file.getBlob()],
        name: 'AutomationTodayCA'
      }
    );

    return json_({
      ok: true,
      reportNo: data.reportNo,
      driveFileId: file.getId(),
      recipients: recipients
    });

  } catch (err) {
    console.error(err);
    return json_({
      ok: false,
      error: String(err && err.message ? err.message : err)
    });
  }
}

function getOrCreateFolder_(name) {
  const folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(name);
}

function uniqueEmails_(values) {
  return [...new Set(
    values
      .filter(Boolean)
      .map(v => String(v).trim().toLowerCase())
      .filter(v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
  )];
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
