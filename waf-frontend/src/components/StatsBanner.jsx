import { memo } from "react";

function ago(ts) {
  if (!ts) return "No attacks";
  const secs = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  return `${Math.floor(secs / 60)}m ago`;
}

const StatCard = memo(function StatCard({ label, value, cls }) {
  return (
    <article className={`stat-card ${cls}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </article>
  );
});

export default function StatsBanner({ stats }) {
  const cards = [
    { label: "Total Blocked", value: stats.blocked || 0, cls: "danger" },
    { label: "Total Allowed", value: stats.allowed || 0, cls: "ok" },
    { label: "Block Rate %", value: `${stats.blockRate || 0}%`, cls: "warn" },
    { label: "Critical Threats", value: stats.criticalThreats || 0, cls: (stats.criticalThreats || 0) > 0 ? "pulse-danger" : "danger" },
    { label: "Last Attack", value: ago(stats.lastAttack), cls: "muted" },
  ];

  return (
    <section className="stats-banner">
      {cards.map((card) => (
        <StatCard key={card.label} label={card.label} value={card.value} cls={card.cls} />
      ))}
    </section>
  );
}
