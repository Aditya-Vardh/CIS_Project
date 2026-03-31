const { db } = require("./db");

const MAX_REQUESTS = 12;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const row = db.prepare("SELECT * FROM rate_limits WHERE ip = ?").get(ip);

  if (!row) {
    db.prepare("INSERT INTO rate_limits (ip, count, window_start) VALUES (?, ?, ?)").run(ip, 1, new Date(now).toISOString());
    return false;
  }

  const windowStart = new Date(row.window_start).getTime();
  if (now - windowStart > WINDOW_MS) {
    db.prepare("UPDATE rate_limits SET count = ?, window_start = ? WHERE ip = ?").run(1, new Date(now).toISOString(), ip);
    return false;
  }

  const next = row.count + 1;
  db.prepare("UPDATE rate_limits SET count = ? WHERE ip = ?").run(next, ip);
  return next > MAX_REQUESTS;
}

module.exports = { checkRateLimit };
