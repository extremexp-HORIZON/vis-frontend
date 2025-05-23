const DEFAULT_TTL = 10 * 60 * 1000; // 5 minutes

type CacheEntry<T> = {
  data: T;
  expires: number;
};

/**
 * Set data in localStorage with a TTL (default: 5 minutes)
 */
export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  const payload: CacheEntry<T> = {
    data,
    expires: Date.now() + ttl,
  };

  localStorage.setItem(key, JSON.stringify(payload));
}

/**
 * Get data from localStorage, returns null if expired or invalid
 */
export function getCache<T>(key: string): T | null {
  const raw = localStorage.getItem(key);

  if (!raw) return null;

  try {
    const parsed: CacheEntry<T> = JSON.parse(raw);

    if (Date.now() < parsed.expires) {
      return parsed.data;
    } else {
      localStorage.removeItem(key); // Clean up expired

      return null;
    }
  } catch (e) {
    localStorage.removeItem(key); // Clean up corrupted

    return null;
  }
}

/**
 * Manually remove cache entry
 */
export function removeCache(key: string): void {
  localStorage.removeItem(key);
}

export function clearExpiredLocalStorage(prefixes: string[] = []) {
  Object.keys(localStorage).forEach((key) => {
    // Filter by prefix if needed
    if (prefixes.length === 0 || prefixes.some(prefix => key.startsWith(prefix))) {
      try {
        const raw = localStorage.getItem(key);

        if (!raw) return;

        const parsed = JSON.parse(raw);

        if (parsed.expires && Date.now() > parsed.expires) {
          localStorage.removeItem(key);
        }
      } catch {
        // Invalid JSON or other errors — optionally remove
        localStorage.removeItem(key);
      }
    }
  });
}
