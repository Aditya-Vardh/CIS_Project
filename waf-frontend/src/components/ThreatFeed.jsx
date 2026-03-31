import { memo, useMemo, useState } from "react";

const ThreatFeedRow = memo(function ThreatFeedRow({ log }) {
  const rowClass = log.verdict === "BLOCK" ? "feed-row row-block slide-in" : "feed-row row-allow slide-in";
  const severity = log.verdict === "ALLOW" ? "clean" : (log.severity || "low");
  return (
    <div className={rowClass}>
      <span className="feed-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
      <span className="feed-method">{log.method}</span>
      <span className="feed-path">{log.path}</span>
      <span className={`feed-verdict ${log.verdict === "BLOCK" ? "danger" : "safe"}`}>{log.verdict}</span>
      <span className="feed-rule">{log.rule_name}</span>
      <span className={`feed-sev sev-${severity}`}>{severity.toUpperCase()}</span>
    </div>
  );
});

export default function ThreatFeed({ logs, clearLogs }) {
  const [filter, setFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filter === "BLOCKED" && l.verdict !== "BLOCK") return false;
      if (filter === "ALLOWED" && l.verdict !== "ALLOW") return false;
      if (filter === "CRITICAL" && l.severity !== "critical") return false;
      if (!q) return true;
      return l.path.toLowerCase().includes(q.toLowerCase()) || l.rule_name.toLowerCase().includes(q.toLowerCase());
    });
  }, [logs, filter, q]);

  return (
    <section className="panel feed">
      <div className="feed-head">
        <h3>● LIVE Threat Feed</h3>
        <div className="controls">
          {["ALL", "BLOCKED", "ALLOWED", "CRITICAL"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={filter === f ? "active-filter" : ""}>{f}</button>
          ))}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search path or rule" />
          <button onClick={clearLogs}>CLEAR</button>
        </div>
      </div>
      <div className="feed-list threat-feed-container">
        {filtered.map((l) => (
          <ThreatFeedRow key={l.id} log={l} />
        ))}
        {filtered.length === 0 && <div className="feed-empty">No matching events in current filter.</div>}
      </div>
    </section>
  );
}
