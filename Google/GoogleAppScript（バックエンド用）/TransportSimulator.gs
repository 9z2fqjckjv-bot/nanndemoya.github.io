const TRANSPORT_RATES = {
  mixed: { label: '複合交通', base: 0, perKm: 30, minimum: 300 },
  public: { label: '公共交通機関', base: 0, perKm: 30, minimum: 300 },
  car: { label: '自家用車・事業車', base: 0, perKm: 35, minimum: 300 },
  bike: { label: '自転車・徒歩', base: 0, perKm: 0, minimum: 0 },
  taxi: { label: 'タクシー', base: 500, perKm: 400, minimum: 1000 },
  airplane: { label: '飛行機', base: 8000, perKm: 22, minimum: 8000 },
  ferry: { label: 'フェリー', base: 2500, perKm: 60, minimum: 2500 },
  customerCar: { label: "Let's Go Car's!", base: 0, perKm: 0, minimum: 0 }
};

function calculateTransportCost(input) {
  const distance = positiveNumber(input.distanceKm);
  const minutes = positiveNumber(input.travelMinutes);
  const multiplier = Number(input.roundTrip || 2);
  const type = input.transportType || 'public';
  const parkingFee = positiveNumber(input.parkingFee);
  const extraFee = positiveNumber(input.extraFee);
  const useMinimum = input.useMinimum !== false;
  const rushSurcharge = input.rushSurcharge === true;
  const selectedRoute = input.route || null;
  const rate = TRANSPORT_RATES[type];
  if (!rate) {
    throw new Error('未対応の交通手段です。');
  }

  const usesSegmentRates = shouldUseTransportSegmentRates(type, selectedRoute);
  const apiTollFee = selectedRoute && selectedRoute.tollFee ? selectedRoute.tollFee * multiplier : 0;
  const distanceCost = usesSegmentRates
    ? calculateTransportSegmentDistanceCost(selectedRoute.segments, multiplier)
    : (rate.base + distance * rate.perKm) * multiplier;
  const minimumCost = useMinimum ? rate.minimum : 0;
  const subtotal = Math.max(distanceCost, minimumCost) + apiTollFee + parkingFee + extraFee;
  const surcharge = rushSurcharge ? Math.round(subtotal * 0.2) : 0;
  const total = subtotal + surcharge;
  const totalDistance = distance * multiplier;
  const totalMinutes = minutes * multiplier;
  const routeTitle = selectedRoute ? selectedRoute.title : '手動入力';

  return {
    transportLabel: rate.label,
    routeTitle,
    routeModes: selectedRoute ? selectedRoute.modes : rate.label,
    distanceKm: totalDistance,
    durationMinutes: totalMinutes,
    distanceCost,
    minimumCost,
    apiTollFee,
    parkingFee,
    extraFee,
    surcharge,
    total,
    formattedTotal: yen(total),
    usesSegmentRates,
    breakdown: [
      { label: '交通手段', value: rate.label },
      { label: '選択経路', value: routeTitle },
      { label: '計算距離', value: totalDistance.toLocaleString('ja-JP') + ' km' },
      { label: '移動時間の目安', value: totalMinutes.toLocaleString('ja-JP') + ' 分' },
      { label: usesSegmentRates ? '複合経路の区間別概算' : '距離・交通手段分', value: yen(distanceCost) },
      { label: '最低移動代金', value: useMinimum ? yen(minimumCost) : '適用なし' },
      { label: 'API取得 有料道路料金', value: apiTollFee ? yen(apiTollFee) : '取得なし' },
      { label: '駐車場・高速代など', value: yen(parkingFee) },
      { label: 'その他実費', value: yen(extraFee) },
      { label: '割増', value: rushSurcharge ? yen(surcharge) : 'なし' }
    ]
  };
}

function calculateTransportSegmentDistanceCost(segments, multiplier) {
  return (segments || []).reduce((total, segment) => {
    const rate = TRANSPORT_RATES[segment.rateKey] || TRANSPORT_RATES.public;
    return total + (rate.base + positiveNumber(segment.distanceKm) * rate.perKm);
  }, 0) * multiplier;
}

function shouldUseTransportSegmentRates(type, selectedRoute) {
  if (!selectedRoute || !selectedRoute.segments || selectedRoute.segments.length < 2) {
    return false;
  }

  if (['mixed', 'public', 'airplane', 'ferry'].indexOf(type) !== -1) {
    return true;
  }

  return ['car', 'customerCar'].indexOf(type) !== -1
    && selectedRoute.segments.some((segment) => segment.rateKey === 'ferry');
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function yen(value) {
  return '¥' + Math.round(Number(value) || 0).toLocaleString('ja-JP');
}
