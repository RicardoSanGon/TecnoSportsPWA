import { getFullUrl } from '../config/api';

const CACHE_PREFIX = 'api_cache_';

async function isOnline() {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true; // Assume online if navigator.onLine is not available
}

export async function cachedFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const fullUrl = getFullUrl(endpoint);
  const cacheKey = CACHE_PREFIX + btoa(fullUrl + JSON.stringify(options || {}));

  let online = await isOnline();

  if (online) {
    try {
      const response = await fetch(fullUrl, options);
      if (response.ok) {
        // Successfully fetched fresh data, update cache and return
        const data = await response.clone().json();
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return response;
      } else {
        // Fetch was not 'ok' (e.g., 404, 500), but we are online.
        // Do NOT serve from cache in this case, as the server explicitly returned an error.
        // Re-throw the error or return the non-ok response directly.
        console.warn(`Fetch returned non-OK status for ${fullUrl}: ${response.status}`);
        // Attempt to get JSON error body if available
        try {
          const errorData = await response.json();
          return new Response(JSON.stringify(errorData), { status: response.status, statusText: response.statusText, headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
          // If response is not JSON, return original response
          return response;
        }
      }
    } catch (error) {
      // Network error (e.g., no internet, CORS issue, DNS error)
      console.error(`Network error fetching ${fullUrl}:`, error);
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        console.warn(`Network error for ${fullUrl}, serving from cache.`);
        return new Response(cachedData, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      // If no cached data and network error, return a service unavailable response
      return new Response(null, { status: 503, statusText: 'Service Unavailable - Network error and no cached data' });
    }
  } else {
    // Offline: try to serve from cache
    console.warn('Offline: Attempting to serve from cache.');
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return new Response(cachedData, { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    // If no data found in cache and offline, return a network error response
    return new Response(null, { status: 503, statusText: 'Service Unavailable - Offline and no cached data' });
  }
}