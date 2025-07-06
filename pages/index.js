import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, Trophy } from 'lucide-react';

export default function SnakeGame({ isOpen, onClose }) {
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [nextDirection, setNextDirection] = useState({ x: 0, y: 0 });
  const [gameClosing, setGameClosing] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [position, setPosition] = useState({ x: 60, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [gameSpeed, setGameSpeed] = useState(150);
  
  const gameRef = useRef(null);
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const animationRef = useRef(null);

  const GRID_SIZE = 15;
  const CANVAS_SIZE = 360;
  const GRID_COUNT = CANVAS_SIZE / GRID_SIZE;

  useEffect(() => {
    if (isOpen && !showGame) {
      setShowGame(true);
      setGameClosing(false);
    }
  }, [isOpen, showGame]);

  // High score is maintained in memory during the session

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 500, e.clientY - dragOffset.y))
        });
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging && e.touches[0]) {
        e.preventDefault();
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 400, e.touches[0].clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 500, e.touches[0].clientY - dragOffset.y))
        });
      }
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e) => {
    const rect = gameRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleTouchStart = (e) => {
    if (e.touches[0]) {
      const rect = gameRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  // Generate food position
  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_COUNT),
        y: Math.floor(Math.random() * GRID_COUNT)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  // Reset game
  const resetGame = useCallback(() => {
    const startX = Math.floor(GRID_COUNT / 2);
    const startY = Math.floor(GRID_COUNT / 2);
    setSnake([{ x: startX, y: startY }]);
    setFood({ x: startX - 5, y: startY });
    setDirection({ x: 0, y: 0 });
    setNextDirection({ x: 0, y: 0 });
    setScore(0);
    setGameState('idle');
    setGameSpeed(150);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    if (gameState === 'idle') {
      resetGame();
    }
    setGameState('playing');
  }, [gameState, resetGame]);

  // Pause game
  const pauseGame = useCallback(() => {
    setGameState('paused');
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    setDirection(nextDirection);
    
    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      head.x += nextDirection.x;
      head.y += nextDirection.y;

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_COUNT || 
          head.y < 0 || head.y >= GRID_COUNT) {
        setGameState('gameOver');
        return prevSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameOver');
        return prevSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => {
          const newScore = prevScore + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
          }
          return newScore;
        });
        
        // Increase speed slightly
        setGameSpeed(prev => Math.max(80, prev - 2));
        
        // Generate new food
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameState, nextDirection, food, generateFood, highScore]);

  // Game loop interval
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, gameSpeed);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, gameLoop, gameSpeed]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (direction.y !== 1) setNextDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          if (direction.y !== -1) setNextDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          if (direction.x !== 1) setNextDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          if (direction.x !== -1) setNextDirection({ x: 1, y: 0 });
          break;
        case ' ':
          e.preventDefault();
          if (gameState === 'playing') {
            pauseGame();
          } else if (gameState === 'paused') {
            startGame();
          }
          break;
      }
    };

    if (showGame) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, direction, showGame, startGame, pauseGame]);

  // Handle touch swipes
  const handleTouchGameStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchGameEnd = (e) => {
    if (gameState !== 'playing') return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0 && direction.x !== -1) {
        setNextDirection({ x: 1, y: 0 }); // Right
      } else if (deltaX < 0 && direction.x !== 1) {
        setNextDirection({ x: -1, y: 0 }); // Left
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && direction.y !== -1) {
        setNextDirection({ x: 0, y: 1 }); // Down
      } else if (deltaY < 0 && direction.y !== 1) {
        setNextDirection({ x: 0, y: -1 }); // Up
      }
    }
  };

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    gradient.addColorStop(0, '#0f0f23');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
      ctx.stroke();
    }

    // Draw snake with gradient and glow
    snake.forEach((segment, index) => {
      const x = segment.x * GRID_SIZE;
      const y = segment.y * GRID_SIZE;
      
      if (index === 0) {
        // Snake head - bright green with glow
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        
        const headGradient = ctx.createRadialGradient(
          x + GRID_SIZE/2, y + GRID_SIZE/2, 0,
          x + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE/2
        );
        headGradient.addColorStop(0, '#00ff88');
        headGradient.addColorStop(1, '#00cc66');
        
        ctx.fillStyle = headGradient;
        ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        
        // Add eyes
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        const eyeSize = 3;
        const eyeOffset = 4;
        ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
        ctx.fillRect(x + GRID_SIZE - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
      } else {
        // Snake body - darker green with fade
        const opacity = Math.max(0.3, 1 - (index * 0.05));
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 5;
        
        const bodyGradient = ctx.createRadialGradient(
          x + GRID_SIZE/2, y + GRID_SIZE/2, 0,
          x + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE/2
        );
        bodyGradient.addColorStop(0, `rgba(0, 255, 136, ${opacity})`);
        bodyGradient.addColorStop(1, `rgba(0, 150, 80, ${opacity})`);
        
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
      }
    });

    // Draw food with pulsing animation
    const foodX = food.x * GRID_SIZE;
    const foodY = food.y * GRID_SIZE;
    const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
    
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 20 * pulse;
    
    const foodGradient = ctx.createRadialGradient(
      foodX + GRID_SIZE/2, foodY + GRID_SIZE/2, 0,
      foodX + GRID_SIZE/2, foodY + GRID_SIZE/2, GRID_SIZE/2
    );
    foodGradient.addColorStop(0, '#ff6666');
    foodGradient.addColorStop(1, '#ff2222');
    
    ctx.fillStyle = foodGradient;
    ctx.fillRect(foodX + 1, foodY + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    
    // Add sparkle effect to food
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
    ctx.fillRect(foodX + GRID_SIZE/2 - 1, foodY + 3, 2, 2);
    ctx.fillRect(foodX + 3, foodY + GRID_SIZE/2 - 1, 2, 2);

    ctx.shadowBlur = 0;
  }, [snake, food]);

  // Animation loop for smooth rendering
  useEffect(() => {
    const animate = () => {
      if (showGame) {
        // Canvas is redrawn in the dependency effect above
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    if (showGame) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showGame, snake, food]);

  const closeGame = () => {
    setGameClosing(true);
    setGameState('idle');
    setTimeout(() => {
      setShowGame(false);
      onClose();
    }, 300);
  };

  if (!showGame) return null;

  return (
    <div 
      ref={gameRef}
      className={`absolute overflow-hidden rounded-lg border border-gray-700/50 shadow-2xl z-50 text-white ${
        gameClosing ? 'animate-terminal-close' : 'animate-terminal-open'
      }`}
      style={{
        width: '400px',
        top: `${position.y}px`,
        left: `${position.x}px`,
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.95), rgba(26, 26, 46, 0.95))',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-move border-b border-gray-700/50 bg-gradient-to-r from-gray-900/70 to-gray-800/70"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-semibold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            🐍 Snake Game
          </span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            closeGame();
          }}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4">
        {/* Score Display */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Score</div>
            <div className="text-xl font-bold text-green-400">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1 flex items-center justify-center space-x-1">
              <Trophy className="w-3 h-3" />
              <span>Best</span>
            </div>
            <div className="text-xl font-bold text-yellow-400">{highScore}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Length</div>
            <div className="text-xl font-bold text-blue-400">{snake.length}</div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="border-2 border-gray-600/50 rounded-lg shadow-lg"
            onTouchStart={handleTouchGameStart}
            onTouchEnd={handleTouchGameEnd}
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Game Controls */}
        <div className="flex justify-center space-x-3 mb-4">
          {gameState === 'idle' || gameState === 'gameOver' ? (
            <button
              onClick={startGame}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
            >
              <Play className="w-4 h-4" />
              <span>{gameState === 'gameOver' ? 'Play Again' : 'Start Game'}</span>
            </button>
          ) : gameState === 'playing' ? (
            <button
              onClick={pauseGame}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-yellow-500/25"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={startGame}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              <Play className="w-4 h-4" />
              <span>Resume</span>
            </button>
          )}
          
          <button
            onClick={resetGame}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Game Over Message */}
        {gameState === 'gameOver' && (
          <div className="text-center mb-4 p-3 bg-gradient-to-r from-red-900/50 to-red-800/50 rounded-lg border border-red-500/30">
            <div className="text-lg font-bold text-red-400 mb-1">Game Over!</div>
            <div className="text-sm text-gray-300">
              Final Score: <span className="text-green-400 font-semibold">{score}</span>
            </div>
            {score === highScore && score > 0 && (
              <div className="text-xs text-yellow-400 mt-1 flex items-center justify-center space-x-1">
                <Trophy className="w-3 h-3" />
                <span>New High Score!</span>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-400 text-center space-y-1">
          <div className="font-medium text-gray-300">Controls</div>
          <div>🖱️ Desktop: Arrow keys, WASD, or Space to pause</div>
          <div>📱 Mobile: Swipe to move, tap to start</div>
        </div>
      </div>
    </div>
  );
}
