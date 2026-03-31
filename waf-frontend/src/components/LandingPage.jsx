import { ShieldCheck, Radar, Activity, ArrowRight } from "lucide-react";
import { motion as Motion } from "framer-motion";

const features = [
  {
    icon: ShieldCheck,
    title: "Smart Request Shielding",
    text: "Detects SQLi, XSS, traversal, SSRF and bot signatures in real time with configurable rules.",
  },
  {
    icon: Activity,
    title: "Live Security Telemetry",
    text: "Watch verdict streams, attack heatmaps, severity trends and top IP behavior from one console.",
  },
  {
    icon: Radar,
    title: "Attack Simulation Lab",
    text: "Launch curated attack payloads and validate defenses before shipping production changes.",
  },
];

export default function LandingPage({ onEnter }) {
  return (
    <section className="landing">
      <div className="landing-glow" />
      <div className="landing-grid-lines" />
      <Motion.div
        className="landing-inner"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="landing-top">
          <Motion.p className="landing-chip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Cyber Intelligence Suite
          </Motion.p>
          <span className="landing-version">v2.4 Security Fabric</span>
        </div>
        <h1>WAF Engine Control Center</h1>
        <Motion.p className="landing-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          Enterprise-grade web application firewall visibility, simulation and response workflows in a single premium dashboard.
        </Motion.p>
        <Motion.div className="landing-cta-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Motion.button className="landing-primary" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={onEnter}>
            Launch Console <ArrowRight size={16} />
          </Motion.button>
          <div className="landing-trust">
            <span>24/7 Monitoring</span>
            <span>Zero Downtime Rollouts</span>
            <span>Threat AI Assisted</span>
          </div>
        </Motion.div>
        <div className="landing-kpis">
          <div><strong>99.98%</strong><span>Detection Uptime</span></div>
          <div><strong>10ms</strong><span>Median Rule Match</span></div>
          <div><strong>50M+</strong><span>Requests Profiled</span></div>
        </div>
        <div className="landing-strip">
          <span>Realtime Analytics</span>
          <span>Behavioral Threat Detection</span>
          <span>Precision Rule Engine</span>
          <span>One-click Attack Simulation</span>
        </div>
        <div className="landing-features">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Motion.article
                key={feature.title}
                className="landing-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + idx * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <Icon size={18} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </Motion.article>
            );
          })}
        </div>
      </Motion.div>
    </section>
  );
}
