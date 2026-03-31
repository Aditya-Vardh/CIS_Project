const { getEnabledRulesForEngine } = require("./store");

function extractTargets(req) {
  return {
    body: JSON.stringify(req.body || {}),
    query: JSON.stringify(req.query || {}),
    headers: JSON.stringify(req.headers || {}),
    path: req.path || "",
  };
}

function analyzeRequest(req) {
  const targets = extractTargets(req);
  const matches = [];
  const rules = getEnabledRulesForEngine().filter((r) => r.pattern);
  for (const rule of rules) {
    const regex = new RegExp(rule.pattern, "i");
    for (const target of rule.targets) {
      if (regex.test(targets[target] || "")) {
        matches.push({ ruleId: rule.id, ruleName: rule.name, severity: rule.severity, category: rule.category, matchedIn: target, description: rule.description });
        break;
      }
    }
  }
  const rank = { critical: 4, high: 3, medium: 2, low: 1 };
  const topMatch = [...matches].sort((a, b) => rank[b.severity] - rank[a.severity])[0];
  return { blocked: matches.length > 0, matches, topThreat: topMatch || null, analysedAt: new Date().toISOString() };
}

module.exports = { analyzeRequest };