import { useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import StatsBanner from "./components/StatsBanner";
import AttackSimulator from "./components/AttackSimulator";
import ThreatFeed from "./components/ThreatFeed";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import RulesManager from "./components/RulesManager";
import ThreatMap from "./components/ThreatMap";
import Terminal from "./components/Terminal";
import { WaveBackground } from "./components/WaveBackground";
import { useWafStats } from "./hooks/useWafStats";
import { useThreatFeed } from "./hooks/useThreatFeed";

const tabs = ["Dashboard", "Simulator", "Rules", "Analytics", "Logs"];

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const { stats, refreshStats } = useWafStats();
  const { logs, refreshLogs, clearLogs } = useThreatFeed();
  const [terminalOpen, setTerminalOpen] = useState(true);

  const dashboardLogs = useMemo(() => logs.slice(0, 20), [logs]);

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#04050a" }}>
      <WaveBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="app-shell">
          <Navbar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} rpm={stats.requestsPerMinute || 0} />
          <main className="main-content">
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
            {activeTab === "Analytics" && <AnalyticsDashboard />}
            {activeTab === "Logs" && <ThreatMap logs={logs} refreshLogs={refreshLogs} />}
          </main>
          <Terminal logs={logs} open={terminalOpen} setOpen={setTerminalOpen} />
        </div>
      </div>
    </div>
  );
}