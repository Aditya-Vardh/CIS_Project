import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
          <button 
            key={tab} 
            className={tab === activeTab ? "tab active" : "tab"} 
            onClick={() => setActiveTab(tab)}
          >
            <span style={{ position: "relative", zIndex: 1 }}>{tab}</span>
            {tab === activeTab && (
              <motion.div 
                layoutId="nav-pill" 
                className="tab-pill" 
                transition={{ type: "spring", stiffness: 450, damping: 35 }} 
              />
            )}
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
