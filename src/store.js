const { v4: uuidv4 } = require("uuid");
const { db } = require("./db");
const { defaultRules } = require("./rules");

function seedRules() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM rules").get().c;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO rules (id, name, description, severity, category, pattern, targets, enabled, hit_count, created_at)
    VALUES (@id, @name, @description, @severity, @category, @pattern, @targets, 1, 0, @created_at)
  `);

  const tx = db.transaction((rows) => {
    rows.forEach((r) =>
      insert.run({
        ...r,
        targets: JSON.stringify(r.targets || []),
        created_at: new Date().toISOString(),
      })
    );
  });
  tx(defaultRules);
}

function getRules() {
  return db
    .prepare("SELECT * FROM rules ORDER BY created_at ASC")
    .all()
    .map((r) => ({
      ...r,
      enabled: Boolean(r.enabled),
      targets: JSON.parse(r.targets || "[]"),
    }));
}

function getEnabledRulesForEngine() {
  return getRules().filter((r) => r.enabled);
}

function addRule(payload) {
  const id = `custom-${uuidv4()}`;
  const row = {
    id,
    name: payload.name,
    description: payload.description,
    severity: payload.severity,
    category: payload.category,
    pattern: payload.pattern,
    targets: JSON.stringify(payload.targets || []),
    created_at: new Date().toISOString(),
  };
  db.prepare(`
    INSERT INTO rules (id, name, description, severity, category, pattern, targets, enabled, hit_count, created_at)
    VALUES (@id, @name, @description, @severity, @category, @pattern, @targets, 1, 0, @created_at)
  `).run(row);
  return getRules().find((r) => r.id === id);
}

function toggleRule(id, enabled) {
  const result = db.prepare("UPDATE rules SET enabled = ? WHERE id = ?").run(enabled ? 1 : 0, id);
  return result.changes > 0;
}

function deleteRule(id) {
  const result = db.prepare("DELETE FROM rules WHERE id = ?").run(id);
  return result.changes > 0;
}

function incrementRuleHit(ruleName) {
  db.prepare("UPDATE rules SET hit_count = hit_count + 1 WHERE name = ?").run(ruleName);
}

function logThreat({ req, result, verdict, matchedIn = "-" }) {
  const top = result.topThreat || {};
  const payload = JSON.stringify({
    body: req.body || null,
    query: req.query || null,
    headers: req.headers || null,
  });
  const row = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip || req.socket?.remoteAddress || "127.0.0.1",
    verdict,
    category: top.category || "clean",
    severity: top.severity || "low",
    rule_name: top.ruleName || "-",
    matched_in: matchedIn,
    payload,
    country: "Unknown",
    user_agent: req.headers["user-agent"] || "Unknown",
  };
  db.prepare(`
    INSERT INTO threat_logs (id, timestamp, method, path, ip, verdict, category, severity, rule_name, matched_in, payload, country, user_agent)
    VALUES (@id, @timestamp, @method, @path, @ip, @verdict, @category, @severity, @rule_name, @matched_in, @payload, @country, @user_agent)
  `).run(row);

  if (top.ruleName) incrementRuleHit(top.ruleName);
  return row;
}

function clearLogs() {
  db.prepare("DELETE FROM threat_logs").run();
}

function getLogs({ limit = 20, page = 1, category, severity, verdict } = {}) {
  const filters = [];
  const params = [];

  if (category) {
    filters.push("category = ?");
    params.push(category);
  }
  if (severity) {
    filters.push("severity = ?");
    params.push(severity);
  }
  if (verdict) {
    filters.push("verdict = ?");
    params.push(verdict);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const total = db.prepare(`SELECT COUNT(*) AS c FROM threat_logs ${where}`).get(...params).c;
  const offset = (page - 1) * limit;
  const rows = db
    .prepare(`SELECT * FROM threat_logs ${where} ORDER BY timestamp DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset)
    .map((r) => ({ ...r, payload: JSON.parse(r.payload || "{}") }));

  return { page, limit, total, rows };
}

function getStats() {
  const total = db.prepare("SELECT COUNT(*) AS c FROM threat_logs").get().c;
  const blocked = db.prepare("SELECT COUNT(*) AS c FROM threat_logs WHERE verdict = 'BLOCK'").get().c;
  const allowed = total - blocked;
  const criticalThreats = db.prepare("SELECT COUNT(*) AS c FROM threat_logs WHERE severity = 'critical'").get().c;
  const lastAttack = db
    .prepare("SELECT timestamp FROM threat_logs WHERE verdict = 'BLOCK' ORDER BY timestamp DESC LIMIT 1")
    .get()?.timestamp;
  const rpm = db
    .prepare("SELECT COUNT(*) AS c FROM threat_logs WHERE timestamp >= datetime('now', '-1 minute')")
    .get().c;

  const byCategory = db.prepare("SELECT category, COUNT(*) AS count FROM threat_logs GROUP BY category").all();
  const bySeverity = db.prepare("SELECT severity, COUNT(*) AS count FROM threat_logs GROUP BY severity").all();

  return {
    total,
    blocked,
    allowed,
    blockRate: total ? Number(((blocked / total) * 100).toFixed(1)) : 0,
    criticalThreats,
    lastAttack,
    requestsPerMinute: rpm,
    categoryCounts: Object.fromEntries(byCategory.map((r) => [r.category, r.count])),
    severityCounts: Object.fromEntries(bySeverity.map((r) => [r.severity, r.count])),
  };
}

function getTimeline() {
  return db
    .prepare(`
      SELECT strftime('%Y-%m-%d %H:00:00', timestamp) AS hour, COUNT(*) AS count
      FROM threat_logs
      WHERE timestamp >= datetime('now', '-24 hours')
      GROUP BY hour
      ORDER BY hour ASC
    `)
    .all();
}

function getTopIps() {
  return db
    .prepare(`
      SELECT ip, COUNT(*) AS count
      FROM threat_logs
      WHERE verdict = 'BLOCK'
      GROUP BY ip
      ORDER BY count DESC
      LIMIT 5
    `)
    .all();
}

function getHeatmap() {
  return db
    .prepare(`
      SELECT CAST(strftime('%w', timestamp) AS INTEGER) AS day,
             CAST(strftime('%H', timestamp) AS INTEGER) AS hour,
             COUNT(*) AS count
      FROM threat_logs
      GROUP BY day, hour
    `)
    .all();
}

module.exports = {
  seedRules,
  getRules,
  addRule,
  toggleRule,
  deleteRule,
  getEnabledRulesForEngine,
  logThreat,
  clearLogs,
  getLogs,
  getStats,
  getTimeline,
  getTopIps,
  getHeatmap,
};