import React, { useState, useEffect } from 'react';

const Header = () => {
  const [glowIntensity, setGlowIntensity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const headerStyles = {
    textAlign: 'center',
    padding: '20px 0',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
    borderBottom: '2px solid #00ffff',
    boxShadow: '0 4px 20px rgba(0, 255, 255, 0.3)',
    position: 'relative',
    overflow: 'hidden'
  };

  const titleStyles = {
    fontSize: '2.5rem',
    fontFamily: 'Orbitron, monospace',
    fontWeight: '900',
    margin: 0,
    background: 'linear-gradient(45deg, #00ffff, #ff00ff, #ffff00, #00ffff)',
    backgroundSize: '400% 400%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'gradient 3s ease infinite, pulse 2s ease-in-out infinite',
    textShadow: `0 0 ${10 + glowIntensity * 0.3}px rgba(0, 255, 255, 0.8)`,
    letterSpacing: '2px'
  };

  const subtitleStyles = {
    fontSize: '1rem',
    fontWeight: '300',
    color: '#b0b0b0',
    marginTop: '10px',
    fontStyle: 'italic'
  };

  const backgroundEffectStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 70%)',
    animation: 'rotate 20s linear infinite'
  };

  return (
    <header style={headerStyles}>
      <div style={backgroundEffectStyles}></div>
      <h1 style={titleStyles}>🎯 Draw A Perfect Circle </h1>
      <p style={subtitleStyles}>Lightning-fast neon-powered precision challenge!</p>
    </header>
  );
};

export default Header;