import { useState, useEffect, useCallback, useRef } from "react";

type WidgetType = "weather" | "crypto" | "health" | "news" | "tasks";

const POLL_INTERVALS: Record<WidgetType, number> = {
  crypto: 5 * 60 * 1000,
  weather: 60 * 60 * 1000,
  health: 30 * 60 * 1000,
  news: 15 * 60 * 1000,
  tasks: 0, // no polling, manual only
};

const CACHE_KEY_PREFIX = "lifeos_widget_";

function getCached<T>(type: WidgetType): { data: T; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + type);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const maxAge = POLL_INTERVALS[type] || 5 * 60 * 1000;
    if (Date.now() - parsed.timestamp > maxAge) return null;
    return parsed;
  } catch {
    return null;
  }
}

function setCache<T>(type: WidgetType, data: T) {
  try {
    localStorage.setItem(
      CACHE_KEY_PREFIX + type,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {}
}

interface UseWidgetDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useWidgetData<T>(
  type: WidgetType,
  fetcher: () => Promise<T>
): UseWidgetDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      setLastUpdated(new Date());
      setCache(type, result);
    } catch (e: any) {
      setError(e.message || "Data unavailable");
      // Try to use cached data as fallback
      const cached = getCached<T>(type);
      if (cached) {
        setData(cached.data);
        setLastUpdated(new Date(cached.timestamp));
      }
    } finally {
      setIsLoading(false);
    }
  }, [type, fetcher]);

  useEffect(() => {
    // Try cache first
    const cached = getCached<T>(type);
    if (cached) {
      setData(cached.data);
      setLastUpdated(new Date(cached.timestamp));
      setIsLoading(false);
    } else {
      fetchData();
    }

    // Set up polling
    const interval = POLL_INTERVALS[type];
    if (interval > 0) {
      intervalRef.current = setInterval(fetchData, interval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [type, fetchData]);

  return { data, isLoading, error, lastUpdated, refresh: fetchData };
}
