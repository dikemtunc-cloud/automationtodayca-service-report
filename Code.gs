/**
 * AutomationTodayCA Service Report — Google Apps Script backend
 *
 * Deploy as Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * The frontend sends a PDF as base64 together with the Google ID token
 * obtained from the authorized Google Sign-In flow.
 *
 * SECURITY:
 * - No shared delivery secret is stored in the frontend.
 * - The backend verifies the Google ID token with Google's tokeninfo endpoint.
 * - The backend accepts delivery only for the configured Google OAuth client
 *   and the authorized AutomationTodayCA Google account.
 */

const GOOGLE_CLIENT_ID =
  '246009211153-kqkpn2d35ebrgu5osa1l12i8tt4rhd21.apps.googleusercontent.com';

const ALLOWED_GOOGLE_EMAIL =
  'automationtodayca@gmail.com';

const COMPANY_EMAIL =
  'automationtodayca@gmail.com';

const DRIVE_FOLDER_NAME =
  'AutomationTodayCA Service Reports';


function doGet() {
  return ContentService
    .createTextOutput(
      'AutomationTodayCA Service Report delivery endpoint is active.'
    )
    .setMimeType(ContentService.MimeType.TEXT);
}


function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Empty request.');
    }

    const data = JSON.parse(e.postData.contents);

    /*
     * Verify Google authentication on the server.
     * Never trust the email address or decoded JWT supplied by the browser.
     */
    verifyGoogleCredential_(data.googleCredential);

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

    const subject =
      'AutomationTodayCA Service Report ' +
      data.reportNo;

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

    const customerEmail =
      String(data.customerEmail || '').trim();

    const recipients =
      uniqueEmails_([
        customerEmail,
        COMPANY_EMAIL
      ]);

    if (recipients.length === 0) {
      throw new Error(
        'No valid email recipient was supplied.'
      );
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
      driveFileName: file.getName(),
      recipients: recipients
    });

  } catch (err) {
    console.error(err);

    return json_({
      ok: false,
      error: String(
        err && err.message
          ? err.message
          : err
      )
    });
  }
}


/**
 * Server-side Google ID-token verification.
 *
 * Google returns the token claims only after validating the token.
 * We then enforce:
 *   - audience == our OAuth client ID
 *   - email == authorized company account
 *   - email_verified == true
 *   - token is not expired
 */
function verifyGoogleCredential_(credential) {

  const idToken =
    String(credential || '').trim();

  if (!idToken) {
    throw new Error(
      'Google authentication is required.'
    );
  }

  const url =
    'https://oauth2.googleapis.com/tokeninfo?id_token=' +
    encodeURIComponent(idToken);

  const response =
    UrlFetchApp.fetch(
      url,
      {
        method: 'get',
        muteHttpExceptions: true
      }
    );

  const status =
    response.getResponseCode();

  if (status !== 200) {
    throw new Error(
      'Invalid or expired Google authentication.'
    );
  }

  let claims;

  try {
    claims =
      JSON.parse(
        response.getContentText()
      );
  } catch (err) {
    throw new Error(
      'Invalid Google authentication response.'
    );
  }

  if (
    String(claims.aud || '') !==
    GOOGLE_CLIENT_ID
  ) {
    throw new Error(
      'Google OAuth client mismatch.'
    );
  }

  if (
    String(claims.email || '')
      .trim()
      .toLowerCase() !==
    ALLOWED_GOOGLE_EMAIL.toLowerCase()
  ) {
    throw new Error(
      'Unauthorized Google account.'
    );
  }

  if (
    String(claims.email_verified || '')
      .toLowerCase() !== 'true'
  ) {
    throw new Error(
      'Google account email is not verified.'
    );
  }

  const expiresAt =
    Number(claims.exp || 0);

  if (
    !expiresAt ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    throw new Error(
      'Google authentication has expired.'
    );
  }

  return claims;
}


function getOrCreateFolder_(name) {

  const folders =
    DriveApp.getFoldersByName(name);

  if (folders.hasNext()) {
    return folders.next();
  }

  return DriveApp.createFolder(name);
}


function uniqueEmails_(values) {

  return [
    ...new Set(
      values
        .filter(Boolean)
        .map(function(value) {
          return String(value)
            .trim()
            .toLowerCase();
        })
        .filter(function(value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(value);
        })
    )
  ];
}


function json_(obj) {

  return ContentService
    .createTextOutput(
      JSON.stringify(obj)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}
