import React, { useRef, useEffect, useState, useCallback } from 'react';

const App = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState([]);
  const [score, setScore] = useState(null);
  const [bestScore, setBestScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const canvasWidth = 400;
  const canvasHeight = 400;

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

  // Get feedback message based on score
  const getFeedbackMessage = (score) => {
    if (score >= 95) return 'Perfect! Almost a perfect circle! 🎯';
    if (score >= 90) return 'Excellent! Very close to perfect! 🔥';
    if (score >= 80) return 'Great job! Very circular! 👌';
    if (score >= 70) return 'Good! Pretty round! 👍';
    if (score >= 60) return 'Not bad! Keep practicing! 😊';
    if (score >= 50) return 'Getting there! Try again! 😅';
    return 'Keep trying! Practice makes perfect! 💪';
  };

  // Clear canvas and draw grid
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let i = 0; i <= canvasWidth; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasHeight);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let i = 0; i <= canvasHeight; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvasWidth, i);
        ctx.stroke();
      }
    }
  };

  // Initialize canvas
  useEffect(() => {
    clearCanvas();
  }, [showGrid]);

  // Handle mouse events
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setPath([{ x, y }]);
    setShowResult(false);
    clearCanvas();
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPath = [...path, { x, y }];
    setPath(newPath);
    
    // Draw current path
    const ctx = canvas.getContext('2d');
    clearCanvas();
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
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
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (path.length > 10) {
      const circleScore = calculateCircleScore(path);
      const roundedScore = Math.round(circleScore);
      
      setScore(roundedScore);
      setAttempts(prev => prev + 1);
      
      if (roundedScore > bestScore) {
        setBestScore(roundedScore);
      }
      
      setShowResult(true);
    }
  };

  // Try again function
  const tryAgain = () => {
    setPath([]);
    setScore(null);
    setShowResult(false);
    clearCanvas();
  };

  // Clear all data
  const clearAll = () => {
    setPath([]);
    setScore(null);
    setShowResult(false);
    setBestScore(0);
    setAttempts(0);
    clearCanvas();
  };

  const appStyles = {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const controlsStyles = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  };

  const buttonStyles = {
    padding: '8px 16px',
    backgroundColor: '#fff',
    border: '2px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
    transition: 'all 0.2s ease',
    fontWeight: '500'
  };

  const canvasContainerStyles = {
    position: 'relative',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    marginBottom: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const canvasStyles = {
    display: 'block',
    cursor: isDrawing ? 'crosshair' : 'pointer',
    borderRadius: '6px'
  };

  const resultStyles = {
    textAlign: 'center',
    maxWidth: '400px'
  };

  const scoreStyles = {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    lineHeight: '1'
  };

  const feedbackStyles = {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '15px',
    fontWeight: '500'
  };

  const statsStyles = {
    fontSize: '1rem',
    color: '#888',
    marginBottom: '20px'
  };

  const tryAgainButtonStyles = {
    padding: '12px 24px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={appStyles}>
      <div style={controlsStyles}>
        <button 
          style={buttonStyles}
          onClick={clearAll}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
        >
          Clear
        </button>
        <button 
          style={buttonStyles}
          onClick={() => setShowGrid(!showGrid)}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
        >
          {showGrid ? 'Hide grid' : 'Show grid'}
        </button>
      </div>

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

      {showResult && score !== null && (
        <div style={resultStyles}>
          <div style={scoreStyles}>
            {score}/100
          </div>
          <div style={feedbackStyles}>
            {getFeedbackMessage(score)}
          </div>
          <div style={statsStyles}>
            Best score: {bestScore} | Attempts: {attempts}
          </div>
          <button
            style={tryAgainButtonStyles}
            onClick={tryAgain}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#000'}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
};

export default App;