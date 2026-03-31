import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";
import { API_BASE_URL } from "../config/api";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CATEGORY_COLORS = {
  injection: "#ff4757",
  xss: "#ff6b35",
  traversal: "#ffd32a",
  ssrf: "#a855f7",
  bot: "#2ed4ff",
  recon: "#00d4aa",
  clean: "#444466",
};

const SEVERITY_COLORS = {
  critical: "#ff4757",
  high: "#ff6b35",
  medium: "#ffd32a",
  low: "#00d4aa",
};

export default function AnalyticsDashboard() {
  const [timeline, setTimeline] = useState([]);
  const [topIps, setTopIps] = useState([]);
  const [heat, setHeat] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    async function load() {
      const [t, ip, h, s] = await Promise.all([
        fetch(`${API_BASE_URL}/waf/analytics/timeline`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/waf/analytics/topips`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/waf/analytics/heatmap`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/waf/stats`).then((r) => r.json()),
      ]);
      setTimeline(t);
      setTopIps(ip);
      setHeat(h);
      setStats(s);
    }
    load();
    const analyticsInterval = setInterval(load, 5000);
    return () => clearInterval(analyticsInterval);
  }, []);

  const categoryData = useMemo(
    () => Object.entries(stats.categoryCounts || {}).map(([name, value]) => ({ name, value })),
    [stats]
  );

  const severityData = useMemo(() => {
    const entries = stats.severityCounts || {};
    return ["critical", "high", "medium", "low"].map((name) => ({ name, value: entries[name] || 0 }));
  }, [stats]);

  const heatMap = useMemo(() => {
    const map = new Map();
    heat.forEach((h) => map.set(`${h.day}-${h.hour}`, h.count));
    return map;
  }, [heat]);

  const heatColor = (count) => {
    if (!count) return "#0d1117";
    if (count <= 2) return "#ff475730";
    if (count <= 5) return "#ff475760";
    return "#ff4757";
  };

  const timelineData = useMemo(() => {
    if (!timeline || timeline.length < 3) {
      const now = new Date();
      const baseHours = Array.from({ length: 12 }).map((_, idx) => {
        const d = new Date(now.getTime() - (11 - idx) * 60 * 60 * 1000);
        const hourLabel = d.getHours().toString().padStart(2, "0") + ":00";
        return { key: hourLabel, count: 0 };
      });
      const byHour = {};
      (timeline || []).forEach((t) => {
        const h = t.hour?.slice(11, 16);
        if (!h) return;
        byHour[h] = (byHour[h] || 0) + t.count;
      });
      return baseHours.map((h) => ({ hour: h.key, count: byHour[h.key] || 0 }));
    }
    return timeline.map((t) => ({ hour: t.hour.slice(11, 16), count: t.count }));
  }, [timeline]);

  return (
    <section className="analytics-grid">
      <article className="panel chart">
        <h3>Attacks by Category</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={categoryData}>
            <CartesianGrid stroke="#1e2d40" strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value">
              <LabelList dataKey="value" position="top" fill="#c7d2e0" fontSize={12} />
              {categoryData.map((entry) => (
                <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.clean} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </article>
      <article className="panel chart">
        <h3>Severity Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
              {severityData.map((entry) => (
                <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || "#444466"} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="severity-legend">
          {severityData.map((entry) => (
            <div key={entry.name} className="severity-legend-item">
              <span
                className="severity-dot"
                style={{ backgroundColor: SEVERITY_COLORS[entry.name] || "#444466" }}
              />
              <span className="severity-label">{entry.name}</span>
              <span className="severity-count">{entry.value}</span>
            </div>
          ))}
        </div>
      </article>
      <article className="panel chart">
        <h3>Timeline (24h)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={timelineData}>
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line dataKey="count" stroke="#ff3333" />
          </LineChart>
        </ResponsiveContainer>
      </article>
      <article className="panel heat">
        <h3>Attack Heatmap</h3>
        <div className="heat-wrapper">
          <div className="heat-header">
            <span />
            <div className="heat-hours">
              {Array.from({ length: 24 }, (_, h) => (
                <span key={h} className="heat-hour-label">
                  {[0, 6, 12, 18].includes(h) ? (h === 0 ? "12a" : h === 6 ? "6a" : h === 12 ? "12p" : "6p") : ""}
                </span>
              ))}
            </div>
          </div>
          <div className="heat-body">
            <div className="heat-days">
              {DAYS.map((d) => (
                <span key={d} className="heat-day-label">
                  {d}
                </span>
              ))}
            </div>
            <div className="heat-grid">
              {DAYS.map((d, idx) =>
                Array.from({ length: 24 }, (_, hour) => {
                  const dbDay = (idx + 1) % 7; // map Mon-Sun to 1-0..6 from sqlite
                  const count = heatMap.get(`${dbDay}-${hour}`) || 0;
                  return (
                    <div
                      key={`${idx}-${hour}`}
                      title={`${d} ${hour}:00 (${count})`}
                      style={{ background: heatColor(count) }}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </article>
      <article className="panel topips">
        <h3>Top IPs</h3>
        {topIps.map((row) => (
          <div key={row.ip} className="ip-row">
            <span>{row.ip}</span>
            <div className="ip-bar"><div style={{ width: `${row.count * 20}%` }} /></div>
            <span>{row.count}</span>
          </div>
        ))}
      </article>
    </section>
  );
}
