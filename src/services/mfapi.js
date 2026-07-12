import axios from 'axios';
import { getCachedData, setCachedData } from '../utils/cache';

const MFAPI_BASE = 'https://api.mfapi.in';

/**
 * Fetch NAV history for a mutual fund
 * Returns array of { date, nav }
 */
export async function fetchMFNavHistory(schemeCode) {
  // Check cache first
  const cached = getCachedData('mf', schemeCode);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${MFAPI_BASE}/mf/${schemeCode}`);
    const { meta, data } = response.data;

    if (!data || data.length === 0) {
      throw new Error(`No NAV data found for scheme ${schemeCode}`);
    }

    // Transform API response: { date, nav } array, sorted by date ascending
    const navHistory = data
      .map(item => ({
        date: item.date,
        nav: parseFloat(item.nav)
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Cache the result
    setCachedData('mf', schemeCode, navHistory);

    return navHistory;
  } catch (error) {
    console.error(`Error fetching MF NAV for scheme ${schemeCode}:`, error);
    throw error;
  }
}

/**
 * Search for mutual fund by name
 * Returns array of { schemeCode, schemeName, ... }
 */
export async function searchMutualFund(query) {
  try {
    const response = await axios.get(`${MFAPI_BASE}/mf/search`, {
      params: { q: query }
    });

    return response.data;
  } catch (error) {
    console.error(`Error searching for MF "${query}":`, error);
    throw error;
  }
}

/**
 * Get latest NAV for a scheme
 */
export async function getLatestNAV(schemeCode) {
  try {
    const navHistory = await fetchMFNavHistory(schemeCode);
    if (navHistory.length === 0) {
      throw new Error('No NAV data available');
    }
    return navHistory[navHistory.length - 1]; // Last entry is most recent
  } catch (error) {
    console.error(`Error getting latest NAV for scheme ${schemeCode}:`, error);
    throw error;
  }
}
