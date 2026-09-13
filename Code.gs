/**
 * AutomationTodayCA Service Report
 * Google Apps Script Backend
 */
const COMPANY_EMAIL = 'automationtodayca@gmail.com';
const ALLOWED_GOOGLE_EMAIL = 'automationtodayca@gmail.com';
const GOOGLE_CLIENT_ID = '246009211153-kqkpn2d35ebrgu5osa1l12i8tt4rhd21.apps.googleusercontent.com';
const DRIVE_FOLDER_NAME = 'AutomationTodayCA Service Reports';
function doGet() { return json_({ok:true,service:'AutomationTodayCA Service Report',status:'active'}); }
function doPost(e) {
  try {
    log_('STEP 1: POST received');
    if (!e || !e.postData || !e.postData.contents) throw new Error('Empty request.');
    const data = JSON.parse(e.postData.contents);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid request data.');
    log_('STEP 2: JSON parsed');
    const serverSecret = PropertiesService.getScriptProperties().getProperty('ATD_SECRET');
    if (!serverSecret) throw new Error('ATD_SECRET is not configured.');
    log_('STEP 3: ATD_SECRET exists');
    const googleUser = verifyGoogleCredential_(data.googleCredential);
    if (!googleUser) throw new Error('Google authentication failed.');
    log_('STEP 4: Google authentication verified');
    const authenticatedEmail = String(googleUser.email || '').trim().toLowerCase();
    if (authenticatedEmail !== ALLOWED_GOOGLE_EMAIL) throw new Error('Unauthorized Google account.');
    log_('STEP 5: Authorized account confirmed');
    const reportNo = String(data.reportNo || '').trim();
    if (!reportNo) throw new Error('Missing report number.');
    const customerEmail = String(data.customerEmail || '').trim().toLowerCase();
    if (!isValidEmail_(customerEmail)) throw new Error('Invalid customer email.');
    let pdfBase64 = String(data.pdfBase64 || '').trim();
    if (!pdfBase64) throw new Error('Missing PDF data.');
    pdfBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/i, '');
    log_('STEP 6: PDF received, base64 length=' + pdfBase64.length);
    let bytes; try { bytes = Utilities.base64Decode(pdfBase64); } catch (err) { throw new Error('Invalid PDF data.'); }
    if (!bytes || !bytes.length) throw new Error('Empty PDF data.');
    let filename = sanitizeFilename_(data.filename || reportNo + '.pdf');
    if (!/\.pdf$/i.test(filename)) filename += '.pdf';
    const blob = Utilities.newBlob(bytes, MimeType.PDF, filename);
    log_('STEP 7: Creating/finding Drive folder');
    const folder = getOrCreateFolder_(DRIVE_FOLDER_NAME);
    log_('STEP 8: Creating Drive file');
    const file = folder.createFile(blob);
    log_('STEP 9: Drive file created: ' + file.getId());
    const customerName = String(data.customerName || '').trim();
    const company = String(data.company || '').trim();
    const subject = 'AutomationTodayCA Service Report ' + reportNo;
    const body = [customerName ? 'Dear ' + customerName + ',' : 'Dear Customer,','', 'Please find attached your AutomationTodayCA Service Report.','', 'Service Report No.: ' + reportNo, company ? 'Customer: ' + company : '', '', 'This Customer Copy was generated after customer acceptance.','', 'Thank you,','AutomationTodayCA','Reliable Solutions for a Smarter Tomorrow'].filter(function(line){return line !== '';}).join('\n');
    const recipients = uniqueEmails_([customerEmail, COMPANY_EMAIL]);
    if (!recipients.length) throw new Error('No valid email recipient.');
    log_('STEP 10: Sending Gmail to ' + recipients.join(','));
    GmailApp.sendEmail(recipients.join(','), subject, body, {attachments:[file.getBlob()],name:'AutomationTodayCA'});
    log_('STEP 11: Gmail sent');
    return json_({ok:true,reportNo:reportNo,driveFileId:file.getId(),driveFileName:file.getName(),recipients:recipients});
  } catch (err) {
    log_('ERROR: ' + (err && err.stack ? err.stack : err));
    return json_({ok:false,error:String(err && err.message ? err.message : 'Request could not be completed.')});
  }
}
function verifyGoogleCredential_(credential) {
  if (!credential) return null;
  try {
    const url='https://oauth2.googleapis.com/tokeninfo?id_token='+encodeURIComponent(String(credential));
    const response=UrlFetchApp.fetch(url,{method:'get',muteHttpExceptions:true});
    if (response.getResponseCode() !== 200) { log_('Google tokeninfo HTTP '+response.getResponseCode()); return null; }
    const user=JSON.parse(response.getContentText());
    if (String(user.aud || '') !== GOOGLE_CLIENT_ID) return null;
    const issuer=String(user.iss || '');
    if (issuer !== 'accounts.google.com' && issuer !== 'https://accounts.google.com') return null;
    if (String(user.email || '').trim() === '') return null;
    if (String(user.email_verified || '').toLowerCase() !== 'true') return null;
    const exp=Number(user.exp || 0); if (!exp || Date.now() >= exp*1000) return null;
    return user;
  } catch (err) { log_('Google verification error: '+(err && err.message ? err.message : err)); return null; }
}
function getOrCreateFolder_(name) { const folders=DriveApp.getFoldersByName(name); if (folders.hasNext()) return folders.next(); return DriveApp.createFolder(name); }
function isValidEmail_(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function uniqueEmails_(values) { return [...new Set(values.filter(Boolean).map(function(v){return String(v).trim().toLowerCase();}).filter(isValidEmail_))]; }
function sanitizeFilename_(filename) { const cleaned=String(filename).replace(/[\\\/:*?"<>|]/g,'_').trim().substring(0,180); return cleaned || 'service-report.pdf'; }
function log_(message) { console.log('AutomationTodayCA: '+message); }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
