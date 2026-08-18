const ROUTES_API_FIELD_MASK = [
  'routes.distanceMeters',
  'routes.duration',
  'routes.staticDuration',
  'routes.description',
  'routes.travelAdvisory.tollInfo',
  'routes.legs.distanceMeters',
  'routes.legs.duration',
  'routes.legs.staticDuration',
  'routes.legs.travelAdvisory.tollInfo'
].join(',');

function fetchRoutes(input) {
  const origin = String(input.origin || '').trim();
  const destination = String(input.destination || '').trim();
  const travelMode = String(input.travelMode || 'DRIVE').toUpperCase();
  if (!origin || !destination) {
    throw new Error('出発地住所と目的地住所を入力してください。');
  }

  const apiKey = getRequiredProperty(CONFIG_KEYS.googleMapsApiKey);
  const response = UrlFetchApp.fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': ROUTES_API_FIELD_MASK
    },
    payload: JSON.stringify({
      origin: { address: origin },
      destination: { address: destination },
      travelMode: normalizeRoutesTravelMode(travelMode),
      routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
      computeAlternativeRoutes: true,
      extraComputations: ['TOLLS'],
      languageCode: 'ja',
      regionCode: 'JP',
      units: 'METRIC'
    }),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Routes APIの取得に失敗しました: HTTP ' + code);
  }

  const data = JSON.parse(response.getContentText() || '{}');
  return (data.routes || []).map(summarizeRoutesApiRoute);
}

function normalizeRoutesTravelMode(value) {
  const modes = {
    DRIVING: 'DRIVE',
    DRIVE: 'DRIVE',
    WALKING: 'WALK',
    WALK: 'WALK',
    BICYCLING: 'BICYCLE',
    BICYCLE: 'BICYCLE',
    TRANSIT: 'TRANSIT'
  };
  return modes[value] || 'DRIVE';
}

function summarizeRoutesApiRoute(route, index) {
  const distanceMeters = Number(route.distanceMeters || 0);
  const durationSeconds = parseRoutesDurationSeconds(route.duration);
  const staticSeconds = parseRoutesDurationSeconds(route.staticDuration);
  const tollFee = getRoutesTollYenValue(route.travelAdvisory && route.travelAdvisory.tollInfo);
  const trafficDelayMinutes = durationSeconds && staticSeconds && durationSeconds > staticSeconds
    ? Math.ceil((durationSeconds - staticSeconds) / 60)
    : 0;
  const warnings = trafficDelayMinutes
    ? ['交通状況により通常時より約' + trafficDelayMinutes.toLocaleString('ja-JP') + '分長い見込みです。']
    : [];

  return {
    id: 'route-' + index,
    title: route.description || '経路候補 ' + (index + 1),
    modes: '車',
    distanceKm: distanceMeters / 1000,
    durationMinutes: Math.ceil(durationSeconds / 60),
    segments: buildRoutesApiSegments(route),
    tollText: tollFee ? yen(tollFee) : '',
    tollFee,
    warnings,
    source: 'google-routes-api'
  };
}

function buildRoutesApiSegments(route) {
  return (route.legs || []).map((leg, index) => ({
    modeLabel: '車',
    rateKey: 'car',
    distanceKm: Number(leg.distanceMeters || 0) / 1000,
    durationMinutes: Math.ceil(parseRoutesDurationSeconds(leg.duration) / 60),
    instruction: '経路区間 ' + (index + 1),
    extras: []
  }));
}

function parseRoutesDurationSeconds(value) {
  const match = String(value || '').match(/^(\d+(?:\.\d+)?)s$/);
  return match ? Number(match[1]) : 0;
}

function getRoutesTollYenValue(tollInfo) {
  if (!tollInfo || !Array.isArray(tollInfo.estimatedPrice)) {
    return 0;
  }

  return tollInfo.estimatedPrice.reduce((total, money) => {
    if (money.currencyCode && money.currencyCode !== 'JPY') {
      return total;
    }

    const units = Number(money.units || 0);
    const nanos = Number(money.nanos || 0);
    const amount = units + nanos / 1000000000;
    return Number.isFinite(amount) ? total + amount : total;
  }, 0);
}
