import { memo, useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

const RuleCard = memo(function RuleCard({ rule, onToggle }) {
  return (
    <article className={rule.enabled ? "rule-card" : "rule-card disabled"}>
      <h4>{rule.name} <span className={`sev ${rule.severity}`}>{rule.severity}</span></h4>
      <p>{rule.description}</p>
      <div>{rule.category} | hits: {rule.hit_count}</div>
      <div className="rule-footer">
        <div className="toggle-label">Enabled</div>
        <label className="switch">
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={() => onToggle(rule)}
          />
          <span className="slider" />
        </label>
      </div>
    </article>
  );
});

export default function RulesManager({ onChanged }) {
  const [rules, setRules] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", severity: "medium", category: "custom", pattern: "", targets: ["body"] });
  const [sample, setSample] = useState("");
  const [testResult, setTestResult] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/waf/rules`);
    setRules(await res.json());
  }, []);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(initTimer);
  }, [load]);

  async function toggle(rule) {
    await fetch(`${API_BASE_URL}/waf/rules/${rule.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !rule.enabled }) });
    load();
    onChanged?.();
  }

  async function createRule() {
    await fetch(`${API_BASE_URL}/waf/rules`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setOpen(false);
    await load();
  }

  function testPattern() {
    try {
      const ok = new RegExp(form.pattern, "i").test(sample);
      setTestResult(ok ? "MATCH" : "NO MATCH");
    } catch {
      setTestResult("INVALID REGEX");
    }
  }

  return (
    <section className="panel rules">
      <div className="rules-head">
        <h3>Rules Manager</h3>
        <button onClick={() => setOpen(true)}>ADD CUSTOM RULE</button>
      </div>
      <div className="rules-grid">
        {rules.map((r) => (
          <RuleCard key={r.id} rule={r} onToggle={toggle} />
        ))}
      </div>
      {open && (
        <div className="modal">
          <div className="modal-card">
            <h4>Create Rule</h4>
            <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Description" onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input placeholder="Category" onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <select onChange={(e) => setForm({ ...form, severity: e.target.value })} value={form.severity}>
              <option>critical</option><option>high</option><option>medium</option><option>low</option>
            </select>
            <input placeholder="Regex pattern" onChange={(e) => setForm({ ...form, pattern: e.target.value })} />
            <div>
              {["body", "query", "headers", "path"].map((t) => (
                <label key={t}><input type="checkbox" checked={form.targets.includes(t)} onChange={() => setForm({ ...form, targets: form.targets.includes(t) ? form.targets.filter((x) => x !== t) : [...form.targets, t] })} />{t}</label>
              ))}
            </div>
            <textarea placeholder="Sample input" value={sample} onChange={(e) => setSample(e.target.value)} />
            <button onClick={testPattern}>Test Pattern</button> <span>{testResult}</span>
            <div className="modal-actions">
              <button onClick={createRule}>Save</button>
              <button onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
