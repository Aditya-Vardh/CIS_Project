import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config/api";

export function useThreatFeed() {
  const [logs, setLogs] = useState([]);
  const lastLogIdRef = useRef(null);

  const refreshLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/waf/logs?limit=50&page=1`);
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
    } catch {
      setLogs((prev) => prev);
    }
  }, []);

  const clearLogs = useCallback(async () => {
    await fetch(`${API_BASE_URL}/waf/logs`, { method: "DELETE" });
    lastLogIdRef.current = null;
    refreshLogs();
  }, [refreshLogs]);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      refreshLogs();
    }, 0);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshLogs();
      }
    }, 3000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(timer);
    };
  }, [refreshLogs]);

  return { logs, refreshLogs, clearLogs };
}
