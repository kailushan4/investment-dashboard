import { fetchMFNavHistory, getLatestNAV } from './mfapi';
import { fetchStockPriceHistory, getLatestPrice } from './yfinance';
import { calculateCAGR, calculateXIRR, calculateGainLossPercent, calculateRolling3YearCAGR } from '../utils/calculations';
import { getZoneForCAGR, getPEFlag, getCombinedSignal } from '../constants/zones';

/**
 * Fetch and calculate all data for a single holding
 */
export async function fetchHoldingData(holding) {
  try {
    let navHistory, latestNav, currentValue, cagr, rolling3YearCAGR;

    if (holding.type === 'mf') {
      // Fetch mutual fund data
      navHistory = await fetchMFNavHistory(holding.schemeCode);
      latestNav = navHistory[navHistory.length - 1];
      
      currentValue = latestNav.nav;

      // Calculate 3-year CAGR
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

      let startIndex = 0;
      for (let i = navHistory.length - 1; i >= 0; i--) {
        if (new Date(navHistory[i].date) <= threeYearsAgo) {
          startIndex = i;
          break;
        }
      }

      if (startIndex < navHistory.length - 1) {
        const startNav = navHistory[startIndex].nav;
        const endNav = navHistory[navHistory.length - 1].nav;
        const years = (new Date(navHistory[navHistory.length - 1].date) - new Date(navHistory[startIndex].date)) / (1000 * 60 * 60 * 24 * 365.25);
        cagr = calculateCAGR(startNav, endNav, years);
      } else {
        cagr = 0;
      }

      // Calculate rolling 3-year CAGR series
      rolling3YearCAGR = calculateRolling3YearCAGR(navHistory);

    } else if (holding.type === 'stock' || holding.type === 'etf') {
      // Fetch stock/ETF data
      navHistory = await fetchStockPriceHistory(holding.ticker);
      latestNav = navHistory[navHistory.length - 1];
      
      currentValue = latestNav.close || latestNav.adjClose;

      // Calculate 3-year CAGR
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

      let startIndex = 0;
      for (let i = navHistory.length - 1; i >= 0; i--) {
        if (new Date(navHistory[i].date) <= threeYearsAgo) {
          startIndex = i;
          break;
        }
      }

      if (startIndex < navHistory.length - 1) {
        const startNav = navHistory[startIndex].close || navHistory[startIndex].adjClose;
        const endNav = navHistory[navHistory.length - 1].close || navHistory[navHistory.length - 1].adjClose;
        const years = (new Date(navHistory[navHistory.length - 1].date) - new Date(navHistory[startIndex].date)) / (1000 * 60 * 60 * 24 * 365.25);
        cagr = calculateCAGR(startNav, endNav, years);
      } else {
        cagr = 0;
      }

      // Calculate rolling 3-year CAGR series
      const formattedHistory = navHistory.map(d => ({
        date: d.date,
        nav: d.close || d.adjClose
      }));
      rolling3YearCAGR = calculateRolling3YearCAGR(formattedHistory);
    }

    // Calculate current portfolio value and gain/loss
    const currentPortfolioValue = currentValue * (holding.investedAmount / navHistory[0].nav); // Rough estimate
    const gainLossPercent = calculateGainLossPercent(holding.investedAmount, currentPortfolioValue);

    // Calculate XIRR
    const flows = [
      { date: holding.investedDate, amount: -holding.investedAmount },
      { date: new Date().toISOString(), amount: currentPortfolioValue }
    ];
    const xirr = calculateXIRR(flows);

    // Get zone and signals
    const zone = getZoneForCAGR(cagr, holding.category);
    const peFlag = getPEFlag(holding.peRatio, holding.pe5YearMedian);
    const combinedSignal = getCombinedSignal(zone, peFlag);

    return {
      id: holding.id,
      name: holding.name,
      type: holding.type,
      category: holding.category,
      investedAmount: holding.investedAmount,
      currentValue: currentPortfolioValue,
      gainLossPercent,
      xirr,
      cagr,
      zone,
      peFlag,
      combinedSignal,
      navHistory,
      rolling3YearCAGR,
      latestNav: currentValue,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching data for holding ${holding.id}:`, error);
    return {
      id: holding.id,
      name: holding.name,
      type: holding.type,
      error: error.message,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Fetch data for all holdings
 */
export async function fetchAllHoldingsData(holdings) {
  const results = [];
  for (const holding of holdings) {
    const data = await fetchHoldingData(holding);
    results.push(data);
  }
  return results;
}
