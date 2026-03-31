import { useCallback, useEffect, useState } from "react";

const API = "http://192.168.1.17:4000";

export function useWafStats() {
  const [stats, setStats] = useState({});

  const refreshStats = useCallback(async () => {
    const res = await fetch(`${API}/waf/stats`);
    const data = await res.json();
    setStats(data);
  }, []);

  useEffect(() => {
    refreshStats();
    const timer = setInterval(refreshStats, 1000);
    return () => clearInterval(timer);
  }, [refreshStats]);

  return { stats, refreshStats };
}
