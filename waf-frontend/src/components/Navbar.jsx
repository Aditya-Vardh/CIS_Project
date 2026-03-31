import { useEffect, useState } from "react";

export default function Navbar({ tabs, activeTab, setActiveTab, rpm }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="navbar">
      <div className="brand-wrap">
        <div className="brand">WAF // ENGINE</div>
        <div className="brand-sub">Enterprise Protection Console</div>
      </div>
      <div className="online">
        <span className="dot" /> SYSTEM ONLINE
      </div>
      <nav className="tabs">
        {tabs.map((tab) => (
          <button key={tab} className={tab === activeTab ? "tab active" : "tab"} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>
      <div className="top-meta">
        <span className="clock">{now.toLocaleTimeString()}</span>
        <span className="rpm">{rpm} req/min</span>
      </div>
    </header>
  );
}
