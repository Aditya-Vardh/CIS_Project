import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThreat } from '../context/ThreatContext';

const ThreatHUD = () => {
  const { activeThreat, dismissThreat } = useThreat();

  if (!activeThreat) return null;

  const { verdict, topThreat, message, threatId } = activeThreat;
  const severityColor = topThreat?.severity === 'critical' ? '#ff3333' : 
                       topThreat?.severity === 'high' ? '#ff6600' : '#ff9900';

  return (
    <AnimatePresence>
      {activeThreat && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none'
        }}>
          {/* Backdrop Blur/Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at center, ${severityColor}22 0%, transparent 70%)`,
              backdropFilter: 'blur(4px)',
            }}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              width: 'min(500px, 90vw)',
              background: 'rgba(10, 10, 15, 0.95)',
              border: `2px solid ${severityColor}`,
              borderRadius: '20px',
              padding: '32px',
              boxShadow: `0 0 50px ${severityColor}44, inset 0 0 20px ${severityColor}22`,
              pointerEvents: 'all',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Animated Scanline */}
            <motion.div 
              animate={{ y: [0, 400] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(90deg, transparent, ${severityColor}, transparent)`,
                opacity: 0.5,
                zIndex: 1
              }}
            />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <motion.h2 
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ 
                  color: severityColor, 
                  margin: 0, 
                  fontSize: '28px', 
                  fontWeight: 900,
                  letterSpacing: '4px',
                  textShadow: `0 0 10px ${severityColor}`
                }}
              >
                ACCESS DENIED
              </motion.h2>
              
              <div style={{ 
                marginTop: '16px', 
                fontSize: '14px', 
                color: '#aaa', 
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Security Incident Detected
              </div>

              <div style={{
                marginTop: '24px',
                padding: '20px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#888' }}>Threat:</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{topThreat?.ruleName || 'Unknown Injection'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#888' }}>Category:</span>
                  <span style={{ color: severityColor, fontWeight: 700 }}>{topThreat?.category?.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#888' }}>Severity:</span>
                  <span style={{ color: severityColor }}>{topThreat?.severity?.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>ID:</span>
                  <span style={{ color: '#555', fontSize: '10px' }}>{threatId}</span>
                </div>
              </div>

              <button 
                onClick={dismissThreat}
                style={{
                  marginTop: '32px',
                  background: 'transparent',
                  border: `1px solid ${severityColor}`,
                  color: severityColor,
                  padding: '10px 24px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '1px'
                }}
              >
                ACKNOWLEDGE & DISMISS
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ThreatHUD;
