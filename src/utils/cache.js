/**
 * Simple localStorage-based cache for NAV and price data
 * Cache key format: cache_{type}_{id}
 * Cache includes timestamp to enable daily refresh logic
 */

const CACHE_PREFIX = 'cache_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedData(type, id) {
  try {
    const key = `${CACHE_PREFIX}${type}_${id}`;
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > CACHE_EXPIRY_MS) {
      // Cache expired
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

export function setCachedData(type, id, data) {
  try {
    const key = `${CACHE_PREFIX}${type}_${id}`;
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

export function clearCache(type, id) {
  try {
    const key = `${CACHE_PREFIX}${type}_${id}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

export function clearAllCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}
