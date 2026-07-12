import axios from 'axios';
import { getCachedData, setCachedData } from '../utils/cache';

/**
 * Fetch historical price data for a stock/ETF using yfinance
 * Since yfinance is Python-only, we'll use a public alternative or fallback to a free API
 * For now, using Yahoo Finance public API via rapidapi or direct Yahoo endpoint
 * 
 * Returns array of { date, close, open, high, low, volume }
 */

export async function fetchStockPriceHistory(ticker, period = '5y') {
  // Check cache first
  const cached = getCachedData('stock', ticker);
  if (cached) {
    return cached;
  }

  try {
    // Using yfinance alternative: we can use a serverless function or fallback
    // For now, we'll use a direct HTTP call to get historical data
    // Note: This requires a working backend or a CORS-enabled API

    // Fallback: Use a public stock API
    const response = await fetchFromYahooFinance(ticker, period);
    
    if (!response || response.length === 0) {
      throw new Error(`No price data found for ${ticker}`);
    }

    // Sort by date ascending
    const priceHistory = response.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Cache the result
    setCachedData('stock', ticker, priceHistory);

    return priceHistory;
  } catch (error) {
    console.error(`Error fetching price history for ${ticker}:`, error);
    throw error;
  }
}

/**
 * Fetch from Yahoo Finance using public endpoints (no auth required)
 * Note: This is a client-side call and may hit CORS issues
 * For production, consider setting up a proxy backend
 */
async function fetchFromYahooFinance(ticker, period = '5y') {
  try {
    // Use Yahoo Finance chart API to get historical data
    return fetchYahooFinanceChart(ticker, period);
  } catch (error) {
    console.error('Error fetching from Yahoo Finance:', error);
    throw error;
  }
}

/**
 * Use Yahoo Finance chart API to get historical data
 */
async function fetchYahooFinanceChart(ticker, period = '5y') {
  try {
    const now = Math.floor(Date.now() / 1000);
    let startTime;

    if (period === '5y') {
      startTime = now - 5 * 365.25 * 24 * 60 * 60;
    } else if (period === '3y') {
      startTime = now - 3 * 365.25 * 24 * 60 * 60;
    } else if (period === '1y') {
      startTime = now - 365.25 * 24 * 60 * 60;
    } else {
      startTime = now - 30 * 24 * 60 * 60;
    }

    const url = `https://query1.finance.yahoo.com/v7/finance/download/${ticker}`;
    
    const response = await axios.get(url, {
      params: {
        period1: Math.floor(startTime),
        period2: now,
        interval: '1d',
        events: 'history',
        includeAdjustedClose: true
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Parse CSV response
    const lines = response.data.split('\n');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',');
      if (parts.length < 6) continue;

      data.push({
        date: parts[0],
        open: parseFloat(parts[1]),
        high: parseFloat(parts[2]),
        low: parseFloat(parts[3]),
        close: parseFloat(parts[4]),
        adjClose: parseFloat(parts[5]),
        volume: parseInt(parts[6]) || 0
      });
    }

    return data;
  } catch (error) {
    console.error('Error fetching Yahoo Finance chart:', error);
    throw error;
  }
}

/**
 * Get latest price for a stock/ETF
 */
export async function getLatestPrice(ticker) {
  try {
    const priceHistory = await fetchStockPriceHistory(ticker);
    if (priceHistory.length === 0) {
      throw new Error('No price data available');
    }
    return priceHistory[priceHistory.length - 1]; // Last entry is most recent
  } catch (error) {
    console.error(`Error getting latest price for ${ticker}:`, error);
    throw error;
  }
}
