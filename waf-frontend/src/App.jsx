import { Suspense, lazy, useMemo, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import Navbar from "./components/Navbar";
import StatsBanner from "./components/StatsBanner";
import AttackSimulator from "./components/AttackSimulator";
import ThreatFeed from "./components/ThreatFeed";
import RulesManager from "./components/RulesManager";
import ThreatMap from "./components/ThreatMap";
import Terminal from "./components/Terminal";
import { WaveBackground } from "./components/WaveBackground";
import LandingPage from "./components/LandingPage";
import { useWafStats } from "./hooks/useWafStats";
import { useThreatFeed } from "./hooks/useThreatFeed";
import { ThreatProvider } from "./context/ThreatContext";
import ThreatHUD from "./components/ThreatHUD";

const tabs = ["Dashboard", "Simulator", "Rules", "Analytics", "Logs", "Sandbox"];
const AnalyticsDashboard = lazy(() => import("./components/AnalyticsDashboard"));
const Sandbox = lazy(() => import("./components/Sandbox"));

function ConsoleView() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [terminalOpen, setTerminalOpen] = useState(true);
  const { stats, refreshStats } = useWafStats();
  const { logs, refreshLogs, clearLogs } = useThreatFeed();
  const dashboardLogs = useMemo(() => logs.slice(0, 20), [logs]);

  return (
    <>
      <Navbar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} rpm={stats.requestsPerMinute || 0} />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Motion.section
            key={activeTab}
            className="tab-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            {activeTab === "Dashboard" && (
              <>
                <StatsBanner stats={stats} />
                <div className="two-col">
                  <AttackSimulator onFired={() => { refreshLogs(); refreshStats(); }} />
                  <ThreatFeed logs={dashboardLogs} refreshLogs={refreshLogs} clearLogs={clearLogs} />
                </div>
              </>
            )}
            {activeTab === "Simulator" && <AttackSimulator onFired={() => { refreshLogs(); refreshStats(); }} fullWidth />}
            {activeTab === "Rules" && <RulesManager onChanged={refreshStats} />}
            {activeTab === "Analytics" && (
              <Suspense fallback={<section className="panel"><h3>Loading analytics...</h3></section>}>
                <AnalyticsDashboard />
              </Suspense>
            )}
            {activeTab === "Logs" && <ThreatMap logs={logs} refreshLogs={refreshLogs} />}
            {activeTab === "Sandbox" && (
              <Suspense fallback={<section className="panel"><h3>Loading sandbox...</h3></section>}>
                <Sandbox />
              </Suspense>
            )}
          </Motion.section>
        </AnimatePresence>
      </main>
      <Terminal logs={logs} open={terminalOpen} setOpen={setTerminalOpen} />
    </>
  );
}

export default function App() {
  const [view, setView] = useState("landing");

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#04050a" }}>
      <WaveBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="app-shell">
          <AnimatePresence mode="wait">
            <Motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {view === "landing" ? (
                <LandingPage onEnter={() => setView("dashboard")} />
              ) : (
                <ThreatProvider>
                  <ConsoleView />
                  <ThreatHUD />
                </ThreatProvider>
              )}
            </Motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}