import { useMemo, useState } from "react";

export default function ThreatMap({ logs }) {
  const [sortKey, setSortKey] = useState("timestamp");
  const [descending, setDescending] = useState(true);
  const [selected, setSelected] = useState(null);

  const sorted = useMemo(() => {
    const copy = [...logs].sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])));
    return descending ? copy.reverse() : copy;
  }, [logs, sortKey, descending]);

  function onSort(next) {
    if (next === sortKey) {
      setDescending((d) => !d);
      return;
    }
    setSortKey(next);
    setDescending(true);
  }

  return (
    <section className="panel logs">
      <div className="logs-head">
        <h3>Logs Table</h3>
        <button onClick={() => {
          const rows = ["time,ip,method,path,verdict,rule,severity"];
          sorted.forEach((l) => rows.push(`${l.timestamp},${l.ip},${l.method},${l.path},${l.verdict},${l.rule_name},${l.severity}`));
          const blob = new Blob([rows.join("\n")], { type: "text/csv" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "waf-logs.csv";
          a.click();
        }}>Export CSV</button>
      </div>
      <table>
        <thead>
          <tr>{["timestamp", "ip", "method", "path", "verdict", "rule_name", "severity", "payload"].map((h) => <th key={h} onClick={() => onSort(h)}>{h}{sortKey === h ? (descending ? " ↓" : " ↑") : ""}</th>)}</tr>
        </thead>
        <tbody>
          {sorted.slice(0, 20).map((l) => (
            <tr key={l.id} onClick={() => setSelected(l)} className="log-row">
              <td>{new Date(l.timestamp).toLocaleTimeString()}</td>
              <td>{l.ip}</td>
              <td>{l.method}</td>
              <td>{l.path}</td>
              <td>{l.verdict}</td>
              <td>{l.rule_name}</td>
              <td>{l.verdict === "ALLOW" ? "-" : l.severity}</td>
              <td className="payload-cell" title={JSON.stringify(l.payload)}>
                {JSON.stringify(l.payload).slice(0, 40)}
                {JSON.stringify(l.payload).length > 40 ? "..." : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h4>Log Entry</h4>
            <pre>{JSON.stringify(selected, null, 2)}</pre>
          </div>
        </div>
      )}
    </section>
  );
}
