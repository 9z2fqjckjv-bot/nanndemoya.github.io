const PRICE_DATA = {
  free: {
    label: 'フリーサービス',
    basic: {
      day: {
        hour: {1: 1000, 3: 2750, 6: 5000, 12: 9000},
        day: {1: 7500, 3: 21000, 6: 40000, 12: 75000},
        week: {1: 45000, 3: 130000, 6: 255000, 12: 500000},
        month: {1: 215000, 3: 630000, 6: 1230000, 12: 2400000}
      },
      night: {
        hour: {1: 1500, 3: 4125, 6: 7500, 12: 13500},
        day: {1: 11250, 3: 31500, 6: 60000, 12: 112500},
        week: {1: 67500, 3: 195000, 6: 382500, 12: 750000},
        month: {1: 322500, 3: 945000, 6: 1845000, 12: 3600000}
      }
    }
  },
  assistant: { label: 'アシスタントサービス', multiplier: 2 },
  business: { label: 'ビジネスアシスタントサービス', multiplier: 1.5 },
  kids: { label: '子ども向けサービス', multiplier: 0.5 },
  senior: { label: 'シニアサービス', multiplier: 0.5 }
};

const UNIT_LABELS = { hour: '時間給', day: '日給', week: '週給', month: '月給' };
const PRICE_LABELS = { basic: '基本料金', premium: 'プレミアム料金' };
const TIME_LABELS = { day: '日中', night: '夜間' };

function calculateBasicPrice(input) {
  const service = input.service || 'free';
  const priceType = input.priceType || 'basic';
  const timeBand = input.timeBand || 'day';
  const unitType = input.unitType || 'hour';
  const unitCount = String(input.unitCount || '1');
  const quantity = Math.max(1, Number(input.quantity || 1));
  const unitPrice = deriveBasicPrice(service, priceType, timeBand, unitType, unitCount);
  const total = unitPrice * quantity;

  return {
    unitPrice,
    quantity,
    total,
    formattedTotal: yen(total),
    breakdown: [
      { label: 'サービス', value: PRICE_DATA[service].label },
      { label: '料金区分', value: PRICE_LABELS[priceType] + '（' + TIME_LABELS[timeBand] + '）' },
      { label: '給料単位', value: UNIT_LABELS[unitType] + ' / 区分 ' + unitCount },
      { label: '単価', value: yen(unitPrice) },
      { label: '数量', value: String(quantity) }
    ]
  };
}

function deriveBasicPrice(service, priceType, timeBand, unitType, unitCount) {
  if (!PRICE_DATA[service]) {
    throw new Error('未対応のサービスです。');
  }

  const base = PRICE_DATA.free.basic[timeBand][unitType][unitCount];
  if (!base) {
    throw new Error('未対応の料金条件です。');
  }

  const serviceMultiplier = PRICE_DATA[service].multiplier || 1;
  const premiumMultiplier = priceType === 'premium' ? 2 : 1;
  return Math.round(base * serviceMultiplier * premiumMultiplier);
}
