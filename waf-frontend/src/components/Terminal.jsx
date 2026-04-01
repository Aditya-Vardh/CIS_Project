import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Terminal({ logs, open, setOpen }) {
  return (
    <aside className={`terminal-wrapper ${open ? "open" : ""}`}>
      <button className="terminal-dock-btn" onClick={() => setOpen(!open)}>
        <span className="dot" style={{ animation: open ? 'none' : 'pulse 1.3s infinite', marginRight: '8px' }}></span>
        {open ? "Hide Terminal" : "Show Terminal"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            className="terminal-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="terminal-header">
              <div className="mac-buttons">
                <span className="mac-close" onClick={() => setOpen(false)}></span>
                <span className="mac-min"></span>
                <span className="mac-max"></span>
              </div>
              <div className="terminal-title">WAF_INTERCEPTOR_STREAM</div>
            </div>
            <div className="terminal-content">
              {logs.length === 0 && (
                <div className="term-line empty-line">
                  <span className="term-prompt">&gt;</span> WAITING FOR INCOMING TRAFFIC...
                </div>
              )}
              {logs.slice(0, 10).map((l, i) => (
                <div key={l.id} className="term-line" style={{ animationDelay: `${i * 0.05}s` }}>
                  <span className="term-time">[{new Date(l.timestamp).toLocaleTimeString()}]</span>
                  <span className={`term-verdict ${l.verdict?.toLowerCase()}`}>
                    {l.verdict === "BLOCK" ? "[BLOCKED]" : "[ALLOWED]"}
                  </span>
                  <span className="term-method">{l.method.padEnd(4, " ")}</span>
                  <span className="term-path">{l.path}</span>
                  {l.verdict === "BLOCK" && (
                    <span className="term-rule">➔ {l.rule_name}</span>
                  )}
                </div>
              ))}
              <div ref={(el) => el && el.scrollIntoView()} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
