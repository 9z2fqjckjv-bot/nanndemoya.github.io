const SHEET_NAME = 'inquiries';

function doGet() {
  return jsonResponse({
    ok: true,
    service: 'Nanndemoya Google Apps Script backend',
    timestamp: new Date().toISOString(),
    config: getPublicConfig()
  });
}

function doPost(event) {
  try {
    const payload = parsePayload(event);
    const action = payload.action || 'inquiry';

    if (action === 'basicPrice') {
      return jsonResponse({
        ok: true,
        result: calculateBasicPrice(payload)
      });
    }

    if (action === 'transportCost') {
      return jsonResponse({
        ok: true,
        result: calculateTransportCost(payload)
      });
    }

    if (action === 'routes') {
      return jsonResponse({
        ok: true,
        result: fetchRoutes(payload)
      });
    }

    if (action === 'tagConfig') {
      return jsonResponse({
        ok: true,
        result: getGoogleTagConfig()
      });
    }

    appendInquiry(payload);

    return jsonResponse({
      ok: true,
      message: '受付しました。'
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error.message
    });
  }
}

function parsePayload(event) {
  if (!event || !event.postData || !event.postData.contents) {
    throw new Error('送信データがありません。');
  }

  const type = event.postData.type || '';
  if (type.indexOf('application/json') !== -1) {
    return JSON.parse(event.postData.contents);
  }

  const contents = event.postData.contents.trim();
  if (contents.startsWith('{') || contents.startsWith('[')) {
    return JSON.parse(contents);
  }

  return event.parameter || {};
}

function appendInquiry(payload) {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID が設定されていません。');
  }

  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(SHEET_NAME)
    || SpreadsheetApp.openById(spreadsheetId).insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'receivedAt',
      'name',
      'email',
      'phone',
      'service',
      'message',
      'rawJson'
    ]);
  }

  sheet.appendRow([
    new Date(),
    payload.name || '',
    payload.email || '',
    payload.phone || '',
    payload.service || '',
    payload.message || '',
    JSON.stringify(payload)
  ]);
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
