import React, { useRef, useEffect, useState, useCallback } from 'react';

const Home = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState([]);
  const [score, setScore] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  const canvasWidth = 600;
  const canvasHeight = 600;

  // Calculate circle perfection score
  const calculateCircleScore = useCallback((points) => {
    if (points.length < 10) return 0;

    // Find center point (average of all points)
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // Calculate distances from center
    const distances = points.map(p => 
      Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2)
    );

    // Find average radius
    const avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;

    // Calculate variance from average radius
    const variance = distances.reduce((sum, d) => sum + (d - avgRadius) ** 2, 0) / distances.length;
    const standardDeviation = Math.sqrt(variance);

    // Check if path is relatively closed (start and end points are close)
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    const closureDistance = Math.sqrt(
      (startPoint.x - endPoint.x) ** 2 + (startPoint.y - endPoint.y) ** 2
    );

    // Calculate scores
    const consistencyScore = Math.max(0, 100 - (standardDeviation / avgRadius) * 100);
    const closureScore = Math.max(0, 100 - (closureDistance / avgRadius) * 100);
    const sizeScore = avgRadius > 20 ? 100 : (avgRadius / 20) * 100;

    // Combine scores
    const finalScore = (consistencyScore * 0.6 + closureScore * 0.3 + sizeScore * 0.1);
    return Math.min(100, Math.max(0, finalScore));
  }, []);

  // Get emoji based on score
  const getScoreEmoji = (score) => {
    if (score >= 95) return '🎯';
    if (score >= 85) return '🔥';
    if (score >= 75) return '👌';
    if (score >= 60) return '👍';
    if (score >= 40) return '😊';
    if (score >= 20) return '😅';
    return '😵';
  };

  // Get score message
  const getScoreMessage = (score) => {
    if (score >= 95) return 'PERFECT CIRCLE!';
    if (score >= 85) return 'Nearly Perfect!';
    if (score >= 75) return 'Great Circle!';
    if (score >= 60) return 'Good Attempt!';
    if (score >= 40) return 'Not Bad!';
    if (score >= 20) return 'Keep Practicing!';
    return 'Circle? What Circle?';
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw grid background
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvasWidth; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasHeight);
      ctx.stroke();
    }
    for (let i = 0; i <= canvasHeight; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasWidth, i);
      ctx.stroke();
    }

    // Draw center guide
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, canvasHeight / 2, 100, 0, 2 * Math.PI);
    ctx.stroke();
  };

  // Initialize canvas
  useEffect(() => {
    clearCanvas();
  }, []);

  // Handle mouse events
  const handleMouseDown = (e) => {
    if (isAnimating) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setPath([{ x, y }]);
    setScore(null);
    setShowResult(false);
    clearCanvas();
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || isAnimating) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPath = [...path, { x, y }];
    setPath(newPath);
    
    // Draw current path
    const ctx = canvas.getContext('2d');
    clearCanvas();
    
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';
    
    ctx.beginPath();
    if (newPath.length > 1) {
      ctx.moveTo(newPath[0].x, newPath[0].y);
      for (let i = 1; i < newPath.length; i++) {
        ctx.lineTo(newPath[i].x, newPath[i].y);
      }
    }
    ctx.stroke();
  };

  const handleMouseUp = () => {
    if (!isDrawing || isAnimating) return;
    
    setIsDrawing(false);
    
    if (path.length > 5) {
      const circleScore = calculateCircleScore(path);
      setScore(Math.round(circleScore));
      
      // Animate the result
      setIsAnimating(true);
      setTimeout(() => {
        setShowResult(true);
        setIsAnimating(false);
      }, 1000);
    }
  };

  // Try again function
  const tryAgain = () => {
    setPath([]);
    setScore(null);
    setShowResult(false);
    setIsAnimating(false);
    setAnimationProgress(0);
    clearCanvas();
  };

  // Animate score reveal
  useEffect(() => {
    if (isAnimating && score !== null) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setAnimationProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isAnimating, score]);

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 120px)',
    padding: '20px',
    background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%)'
  };

  const canvasContainerStyles = {
    position: 'relative',
    border: '3px solid #00ffff',
    borderRadius: '10px',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
    background: '#111',
    marginBottom: '30px'
  };

  const canvasStyles = {
    display: 'block',
    cursor: isDrawing ? 'crosshair' : 'pointer',
    borderRadius: '7px'
  };

  const instructionStyles = {
    fontSize: '1.2rem',
    color: '#b0b0b0',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '300'
  };

  const resultContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    opacity: showResult ? 1 : 0,
    transform: showResult ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.5s ease'
  };

  const scoreStyles = {
    fontSize: '3rem',
    fontFamily: 'Orbitron, monospace',
    fontWeight: '900',
    color: score >= 75 ? '#00ff00' : score >= 50 ? '#ffff00' : '#ff4444',
    textShadow: `0 0 20px ${score >= 75 ? '#00ff00' : score >= 50 ? '#ffff00' : '#ff4444'}`,
    animation: showResult ? 'pulse 2s ease-in-out infinite' : 'none'
  };

  const emojiStyles = {
    fontSize: '4rem',
    animation: showResult ? 'bounce 1s ease infinite' : 'none'
  };

  const buttonStyles = {
    padding: '15px 30px',
    fontSize: '1.2rem',
    fontFamily: 'Orbitron, monospace',
    fontWeight: '700',
    background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
    border: 'none',
    borderRadius: '25px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 0, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  // Inject additional animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={containerStyles}>
      <p style={instructionStyles}>
        🎨 Click and drag to draw a perfect circle! 🎨
      </p>
      
      <div style={canvasContainerStyles}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={canvasStyles}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {score !== null && (
        <div style={resultContainerStyles}>
          <div style={emojiStyles}>
            {getScoreEmoji(score)}
          </div>
          <div style={scoreStyles}>
            {score}% Round!
          </div>
          <div style={{
            fontSize: '1.5rem',
            color: '#fff',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {getScoreMessage(score)}
          </div>
          <button
            style={buttonStyles}
            onClick={tryAgain}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 0, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 0, 255, 0.4)';
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;