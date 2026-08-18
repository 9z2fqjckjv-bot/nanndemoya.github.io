const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();

const CONFIG_KEYS = {
  spreadsheetId: 'SPREADSHEET_ID',
  googleTagManagerId: 'GOOGLE_TAG_MANAGER_ID',
  googleMapsApiKey: 'GOOGLE_MAPS_API_KEY',
  estimateEmailTo: 'ESTIMATE_EMAIL_TO',
  googleClientId: 'GOOGLE_CLIENT_ID',
  leadFormUrl: 'LEAD_FORM_URL',
  googleNameEntryKey: 'GOOGLE_NAME_ENTRY_KEY',
  googleEmailEntryKey: 'GOOGLE_EMAIL_ENTRY_KEY'
};

function getRequiredProperty(key) {
  const value = SCRIPT_PROPERTIES.getProperty(key);
  if (!value) {
    throw new Error(key + ' が設定されていません。');
  }
  return value;
}

function getOptionalProperty(key, fallback) {
  return SCRIPT_PROPERTIES.getProperty(key) || fallback || '';
}

function getPublicConfig() {
  return {
    googleTagManagerId: getOptionalProperty(CONFIG_KEYS.googleTagManagerId, ''),
    estimateEmailTo: getOptionalProperty(CONFIG_KEYS.estimateEmailTo, ''),
    googleClientId: getOptionalProperty(CONFIG_KEYS.googleClientId, ''),
    leadFormUrl: getOptionalProperty(CONFIG_KEYS.leadFormUrl, ''),
    googleNameEntryKey: getOptionalProperty(CONFIG_KEYS.googleNameEntryKey, ''),
    googleEmailEntryKey: getOptionalProperty(CONFIG_KEYS.googleEmailEntryKey, '')
  };
}
