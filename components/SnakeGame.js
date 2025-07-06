import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

export default function SnakeGame({ isOpen, onClose }) {
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameClosing, setGameClosing] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [position, setPosition] = useState({ x: 60, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const gameRef = useRef(null);
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);

  const GRID_SIZE = 20;
  const CANVAS_SIZE = 300;

  useEffect(() => {
    if (isOpen && !showGame) {
      setShowGame(true);
      setGameClosing(false);
    }
  }, [isOpen, showGame]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging && e.touches[0]) {
        e.preventDefault();
        setPosition({
          x: e.touches[0].clientX - dragOffset.x,
          y: e.touches[0].clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

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

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
    };
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameState('idle');
  }, [generateFood]);

  const startGame = useCallback(() => {
    if (gameState === 'idle') {
      resetGame();
    }
    setGameState('playing');
  }, [gameState, resetGame]);

  const pauseGame = useCallback(() => {
    setGameState('paused');
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || 
          head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE ||
          newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameOver');
        return prevSnake;
      }

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => {
          const newScore = prevScore + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
          }
          return newScore;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameState, direction, food, generateFood, highScore]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, 150);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, gameLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.fillStyle = '#22c55e';
    snake.forEach(segment => {
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
    });

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
  }, [snake, food]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    if (showGame) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, direction, showGame]);

  const handleMobileControl = (newDirection) => {
    if (gameState !== 'playing') return;
    
    if ((newDirection.x === 1 && direction.x !== -1) ||
        (newDirection.x === -1 && direction.x !== 1) ||
        (newDirection.y === 1 && direction.y !== -1) ||
        (newDirection.y === -1 && direction.y !== 1)) {
      setDirection(newDirection);
    }
  };

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
      className={`absolute overflow-hidden rounded-md border border-zinc-700/50 shadow-lg z-50 text-white ${
        gameClosing ? 'animate-terminal-close' : 'animate-terminal-open'
      }`}
      style={{
        width: '350px',
        top: `${position.y}px`,
        left: `${position.x}px`,
        backgroundColor: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div 
        className="flex items-center justify-between px-3 py-2 cursor-move border-b border-zinc-700/50 bg-zinc-900/70"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center">
          <span className="text-xs font-mono text-gray-300">🐍 snake</span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            closeGame();
          }}
          className="text-gray-400 hover:text-gray-200 transition-colors p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs">
            <span className="text-gray-400">Score: </span>
            <span className="text-white">{score}</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-400">High: </span>
            <span className="text-white">{highScore}</span>
          </div>
        </div>

        <div className="flex justify-center mb-3">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="border border-zinc-700/50 rounded"
          />
        </div>

        <div className="flex justify-center gap-2 mb-3">
          {gameState === 'idle' || gameState === 'gameOver' ? (
            <button
              onClick={startGame}
              className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
            >
              <Play className="w-3 h-3" />
              {gameState === 'gameOver' ? 'Play Again' : 'Start'}
            </button>
          ) : gameState === 'playing' ? (
            <button
              onClick={pauseGame}
              className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
            >
              <Pause className="w-3 h-3" />
              Pause
            </button>
          ) : (
            <button
              onClick={startGame}
              className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
            >
              <Play className="w-3 h-3" />
              Resume
            </button>
          )}
          
          <button
            onClick={resetGame}
            className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {gameState === 'gameOver' && (
          <div className="text-center text-xs text-red-400 mb-3">
            Game Over! Final Score: {score}
          </div>
        )}

        <div className="grid grid-cols-3 gap-1 max-w-24 mx-auto">
          <div></div>
          <button
            onClick={() => handleMobileControl({ x: 0, y: -1 })}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
            disabled={gameState !== 'playing'}
          >
            ↑
          </button>
          <div></div>
          <button
            onClick={() => handleMobileControl({ x: -1, y: 0 })}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
            disabled={gameState !== 'playing'}
          >
            ←
          </button>
          <div></div>
          <button
            onClick={() => handleMobileControl({ x: 1, y: 0 })}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
            disabled={gameState !== 'playing'}
          >
            →
          </button>
          <div></div>
          <button
            onClick={() => handleMobileControl({ x: 0, y: 1 })}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
            disabled={gameState !== 'playing'}
          >
            ↓
          </button>
          <div></div>
        </div>

        <div className="text-xs text-gray-400 text-center mt-3">
          Use arrow keys or WASD to move
        </div>
      </div>
    </div>
  );
}
