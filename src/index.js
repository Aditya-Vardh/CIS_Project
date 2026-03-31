const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { analyzeRequest } = require("./engine");
const { checkRateLimit } = require("./rateLimit");
const { initDb } = require("./db");
const {
  seedRules,
  getRules,
  addRule,
  toggleRule,
  deleteRule,
  logThreat,
  clearLogs,
  getLogs,
  getStats,
  getTimeline,
  getTopIps,
  getHeatmap,
} = require("./store");

initDb();
seedRules();

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.text({ type: ["text/*", "application/xml"] }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.path.startsWith("/waf/")) return next();

  const blockedByRateLimit = checkRateLimit(req.ip || req.socket?.remoteAddress || "127.0.0.1");
  if (blockedByRateLimit) {
    const result = {
      blocked: true,
      matches: [{ ruleName: "Rate Limit Exceeded", severity: "medium", category: "ratelimit", matchedIn: "ip" }],
      topThreat: { ruleName: "Rate Limit Exceeded", severity: "medium", category: "ratelimit" },
    };
    const entry = logThreat({ req, result, verdict: "BLOCK", matchedIn: "ip" });
    return res.status(429).json({ verdict: "BLOCK", message: "Rate limit exceeded", threatId: entry.id, topThreat: result.topThreat });
  }

  const result = analyzeRequest(req);
  const verdict = result.blocked ? "BLOCK" : "ALLOW";
  const entry = logThreat({ req, result, verdict, matchedIn: result.topThreat?.matchedIn || "-" });
  if (result.blocked) {
    return res.status(403).json({
      verdict: "BLOCK",
      message: "Request blocked by WAF",
      threatId: entry.id,
      topThreat: result.topThreat,
      allMatches: result.matches,
    });
  }
  return next();
});

app.get("/waf/stats", (_req, res) => res.json(getStats()));
app.get("/waf/logs", (req, res) =>
  res.json(
    getLogs({
      limit: Number(req.query.limit) || 20,
      page: Number(req.query.page) || 1,
      category: req.query.category,
      severity: req.query.severity,
      verdict: req.query.verdict,
    })
  )
);
app.delete("/waf/logs", (_req, res) => {
  clearLogs();
  res.json({ ok: true });
});
app.get("/waf/rules", (_req, res) => res.json(getRules()));
app.patch("/waf/rules/:id", (req, res) => {
  const ok = toggleRule(req.params.id, Boolean(req.body.enabled));
  if (!ok) return res.status(404).json({ error: "Rule not found" });
  return res.json({ ok: true });
});
app.post("/waf/rules", (req, res) => {
  const { name, description, severity, category, pattern, targets } = req.body || {};
  if (!name || !severity || !category || !pattern) return res.status(400).json({ error: "Missing required fields" });
  return res.status(201).json(addRule({ name, description, severity, category, pattern, targets: targets || ["body", "query"] }));
});
app.delete("/waf/rules/:id", (req, res) => {
  const ok = deleteRule(req.params.id);
  if (!ok) return res.status(404).json({ error: "Rule not found" });
  return res.json({ ok: true });
});
app.get("/waf/analytics/timeline", (_req, res) => res.json(getTimeline()));
app.get("/waf/analytics/topips", (_req, res) => res.json(getTopIps()));
app.get("/waf/analytics/heatmap", (_req, res) => res.json(getHeatmap()));

app.get("/search", (req, res) => res.json({ verdict: "ALLOW", message: "Search allowed", query: req.query.q || "" }));
app.post("/login", (_req, res) => res.json({ verdict: "ALLOW", message: "Login endpoint accepted" }));
app.post("/comment", (req, res) => res.json({ verdict: "ALLOW", message: "Comment accepted", body: req.body }));
app.get("/api/products", (_req, res) => res.json({ verdict: "ALLOW", products: [{ id: 1, name: "Firewall Console" }, { id: 2, name: "Threat Feed Pro" }] }));
app.post("/api/upload", (_req, res) => res.json({ verdict: "ALLOW", message: "Upload processed" }));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`WAF running on port ${PORT}`);
});