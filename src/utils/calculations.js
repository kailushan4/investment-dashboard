/**
 * Calculate Compound Annual Growth Rate (CAGR)
 * CAGR = (End Value / Start Value)^(1 / Years) - 1
 */
export function calculateCAGR(startValue, endValue, years) {
  if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

/**
 * Calculate XIRR (Internal Rate of Return)
 * Uses Newton-Raphson method to find the rate
 * flows: array of { date: Date, amount: number } (negative for investments, positive for current value)
 */
export function calculateXIRR(flows) {
  if (!flows || flows.length === 0) return 0;

  // Sort flows by date
  const sortedFlows = [...flows].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Ensure last flow is positive (current value)
  if (sortedFlows[sortedFlows.length - 1].amount < 0) {
    return 0;
  }

  const guess = 0.1; // Initial guess: 10% return
  const tolerance = 0.0001;
  const maxIterations = 100;

  let rate = guess;
  for (let i = 0; i < maxIterations; i++) {
    const { npv, derivativeNpv } = calculateNPVAndDerivative(sortedFlows, rate);

    if (Math.abs(npv) < tolerance) {
      return rate * 100;
    }

    if (derivativeNpv === 0) {
      break;
    }

    rate = rate - npv / derivativeNpv;
  }

  return rate * 100;
}

function calculateNPVAndDerivative(flows, rate) {
  const baseDate = new Date(flows[0].date);
  let npv = 0;
  let derivativeNpv = 0;

  for (const flow of flows) {
    const date = new Date(flow.date);
    const days = (date - baseDate) / (1000 * 60 * 60 * 24);
    const years = days / 365.25;

    const discountFactor = Math.pow(1 + rate, years);
    npv += flow.amount / discountFactor;
    derivativeNpv -= (flow.amount * years) / (Math.pow(1 + rate, years + 1));
  }

  return { npv, derivativeNpv };
}

/**
 * Calculate rolling 3-year CAGR for a time series
 * returns array of { date, cagr } where cagr is the 3-year CAGR ending on that date
 */
export function calculateRolling3YearCAGR(navHistory) {
  if (!navHistory || navHistory.length === 0) return [];

  const result = [];
  const threeYearsInDays = 365.25 * 3;

  for (let i = 0; i < navHistory.length; i++) {
    const endDate = new Date(navHistory[i].date);
    const endNav = navHistory[i].nav;

    // Find data point ~3 years ago
    const targetDate = new Date(endDate);
    targetDate.setFullYear(targetDate.getFullYear() - 3);

    let startIndex = -1;
    for (let j = i; j >= 0; j--) {
      const currentDate = new Date(navHistory[j].date);
      if (currentDate <= targetDate) {
        startIndex = j;
        break;
      }
    }

    if (startIndex !== -1 && startIndex !== i) {
      const startDate = new Date(navHistory[startIndex].date);
      const startNav = navHistory[startIndex].nav;
      const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);

      if (years >= 2.5) {
        // Only calculate if at least 2.5 years of data
        const cagr = calculateCAGR(startNav, endNav, years);
        result.push({
          date: navHistory[i].date,
          cagr: cagr
        });
      }
    }
  }

  return result;
}

/**
 * Calculate current gain/loss percentage
 */
export function calculateGainLossPercent(investedAmount, currentValue) {
  if (investedAmount <= 0) return 0;
  return ((currentValue - investedAmount) / investedAmount) * 100;
}
