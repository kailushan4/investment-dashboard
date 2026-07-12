// Zone classification thresholds based on category-specific CAGR ranges
export const ZONE_THRESHOLDS = {
  'large-cap-index': {
    zones: [
      { name: 'SIP+Extra', min: 0, max: 8, color: '#10b981', signal: 'Buy' },
      { name: 'Regular SIP', min: 8, max: 13, color: '#84cc16', signal: 'Buy' },
      { name: 'Slow Down', min: 13, max: 18, color: '#eab308', signal: 'Hold' },
      { name: 'Profit Book', min: 18, max: 25, color: '#f97316', signal: 'Sell' },
      { name: 'High Risk Exit', min: 25, max: Infinity, color: '#dc2626', signal: 'Exit' }
    ]
  },
  'flexi-cap': {
    zones: [
      { name: 'SIP+Extra', min: 0, max: 10, color: '#10b981', signal: 'Buy' },
      { name: 'Regular SIP', min: 10, max: 15, color: '#84cc16', signal: 'Buy' },
      { name: 'Slow Down', min: 15, max: 20, color: '#eab308', signal: 'Hold' },
      { name: 'Profit Book', min: 20, max: 28, color: '#f97316', signal: 'Sell' },
      { name: 'High Risk Exit', min: 28, max: Infinity, color: '#dc2626', signal: 'Exit' }
    ]
  },
  'mid-cap': {
    zones: [
      { name: 'SIP+Extra', min: 0, max: 12, color: '#10b981', signal: 'Buy' },
      { name: 'Regular SIP', min: 12, max: 18, color: '#84cc16', signal: 'Buy' },
      { name: 'Slow Down', min: 18, max: 25, color: '#eab308', signal: 'Hold' },
      { name: 'Profit Book', min: 25, max: 32, color: '#f97316', signal: 'Sell' },
      { name: 'High Risk Exit', min: 32, max: Infinity, color: '#dc2626', signal: 'Exit' }
    ]
  },
  'small-cap': {
    zones: [
      { name: 'SIP+Extra', min: 0, max: 12, color: '#10b981', signal: 'Buy' },
      { name: 'Regular SIP', min: 12, max: 18, color: '#84cc16', signal: 'Buy' },
      { name: 'Slow Down', min: 18, max: 25, color: '#eab308', signal: 'Hold' },
      { name: 'Profit Book', min: 25, max: 35, color: '#f97316', signal: 'Sell' },
      { name: 'High Risk Exit', min: 35, max: Infinity, color: '#dc2626', signal: 'Exit' }
    ]
  },
  'individual-stock': {
    zones: [
      { name: 'SIP+Extra', min: 0, max: 10, color: '#10b981', signal: 'Buy' },
      { name: 'Regular SIP', min: 10, max: 15, color: '#84cc16', signal: 'Buy' },
      { name: 'Slow Down', min: 15, max: 20, color: '#eab308', signal: 'Hold' },
      { name: 'Profit Book', min: 20, max: 28, color: '#f97316', signal: 'Sell' },
      { name: 'High Risk Exit', min: 28, max: Infinity, color: '#dc2626', signal: 'Exit' }
    ]
  }
};

export function getZoneForCAGR(cagr, category) {
  const thresholds = ZONE_THRESHOLDS[category] || ZONE_THRESHOLDS['individual-stock'];
  for (const zone of thresholds.zones) {
    if (cagr >= zone.min && cagr < zone.max) {
      return zone;
    }
  }
  return thresholds.zones[thresholds.zones.length - 1];
}

export function getPEFlag(peRatio, pe5YearMedian) {
  if (!peRatio || !pe5YearMedian) return null;
  const ratio = peRatio / pe5YearMedian;
  if (ratio < 0.9) return { flag: 'Cheap', color: '#10b981' };
  if (ratio <= 1.1) return { flag: 'Fair', color: '#eab308' };
  return { flag: 'Expensive', color: '#f97316' };
}

export function getCombinedSignal(cagrZone, peFlag) {
  if (!peFlag) return { signal: cagrZone.signal, confidence: 'Based on CAGR only' };

  const peSignal = peFlag.flag === 'Cheap' ? 'Buy' : peFlag.flag === 'Fair' ? 'Hold' : 'Sell';

  if (cagrZone.signal === peSignal || (cagrZone.signal === 'Buy' && peSignal === 'Hold')) {
    return { signal: `High Conviction ${cagrZone.signal}`, confidence: 'CAGR and PE agree' };
  }
  if (peSignal === 'Buy' && cagrZone.signal === 'Hold') {
    return { signal: 'Hold and Monitor', confidence: 'Mixed signal - PE attractive' };
  }
  return { signal: 'Mixed Signal — Hold and Monitor', confidence: 'CAGR and PE disagree' };
}
