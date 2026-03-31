export default function Terminal({ logs, open, setOpen }) {
  return (
    <aside className={open ? "terminal open" : "terminal"}>
      <button className="terminal-toggle" onClick={() => setOpen(!open)}>{open ? "Hide Terminal" : "Show Terminal"}</button>
      {open && (
        <div className="terminal-body">
          {logs.slice(0, 8).map((l) => (
            <div key={l.id}>
              [{new Date(l.timestamp).toLocaleTimeString()}] {l.verdict} {l.method.padEnd(4, " ")} {l.path.padEnd(12, " ")} {l.rule_name} {String(l.severity || "").toUpperCase()}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
