import { useCallback, useEffect, useRef, useState } from "react";

const API = "http://192.168.1.17:4000";

export function useThreatFeed() {
  const [logs, setLogs] = useState([]);
  const lastLogIdRef = useRef(null);

  const refreshLogs = useCallback(async () => {
    const res = await fetch(`${API}/waf/logs?limit=50&page=1`);
    const data = await res.json();
    const incoming = data.rows || [];
    if (!incoming.length) return;

    setLogs((prev) => {
      if (!prev.length || !lastLogIdRef.current) {
        return incoming.slice(0, 50);
      }
      const lastSeenIndex = incoming.findIndex((row) => row.id === lastLogIdRef.current);
      if (lastSeenIndex === -1) {
        return incoming.slice(0, 50);
      }
      if (lastSeenIndex === 0) {
        return prev;
      }
      const newRows = incoming.slice(0, lastSeenIndex);
      const merged = [...newRows, ...prev];
      const deduped = merged.filter((row, idx, arr) => arr.findIndex((r) => r.id === row.id) === idx);
      return deduped.slice(0, 50);
    });
    lastLogIdRef.current = incoming[0]?.id || lastLogIdRef.current;
  }, []);

  const clearLogs = useCallback(async () => {
    await fetch(`${API}/waf/logs`, { method: "DELETE" });
    lastLogIdRef.current = null;
    refreshLogs();
  }, [refreshLogs]);

  useEffect(() => {
    refreshLogs();
    const timer = setInterval(refreshLogs, 1500);
    return () => clearInterval(timer);
  }, [refreshLogs]);

  return { logs, refreshLogs, clearLogs };
}
