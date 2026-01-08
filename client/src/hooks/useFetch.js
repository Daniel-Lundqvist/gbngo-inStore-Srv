import { useState, useCallback } from 'react';

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 10000;

/**
 * Custom hook for fetching data with timeout and retry support
 *
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {object} { data, loading, error, isTimeout, retry, refetch }
 */
export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTimeout, setIsTimeout] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsTimeout(false);

    const timeout = options.timeout || DEFAULT_TIMEOUT;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        setIsTimeout(true);
        setError(new Error('Request timed out. Please check your connection.'));
      } else {
        setError(err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  const retry = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, isTimeout, retry, refetch: fetchData };
}

/**
 * Wrapper function for fetch with timeout
 * Use this for one-off fetches with timeout support
 *
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options including timeout
 * @returns {Promise} - Resolves with data or rejects with error
 */
export async function fetchWithTimeout(url, options = {}) {
  const timeout = options.timeout || DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      const timeoutError = new Error('Request timed out. Please check your connection.');
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    throw err;
  }
}

export default useFetch;
