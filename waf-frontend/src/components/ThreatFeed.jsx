import { memo, useMemo, useState } from "react";

const ThreatFeedRow = memo(function ThreatFeedRow({ log }) {
  const rowClass = log.verdict === "BLOCK" ? "feed-row row-block slide-in" : "feed-row row-allow slide-in";
  return (
    <div className={rowClass}>
      [{new Date(log.timestamp).toLocaleTimeString()}] {log.method} {log.path} - {log.verdict} - {log.rule_name} - {log.verdict === "ALLOW" ? "-" : log.severity}
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
      </div>
    </section>
  );
}
