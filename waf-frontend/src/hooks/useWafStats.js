import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

export function useWafStats() {
  const [stats, setStats] = useState({});

  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/waf/stats`);
      const data = await res.json();
      setStats(data);
    } catch {
      setStats({});
    }
  }, []);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      refreshStats();
    }, 0);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshStats();
      }
    }, 3000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(timer);
    };
  }, [refreshStats]);

  return { stats, refreshStats };
}
