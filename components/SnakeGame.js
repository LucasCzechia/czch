import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

export default function SnakeGame({ isOpen, onClose }) {
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('snake-high-score') || '0');
    }
    return 0;
  });
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [nextDirection, setNextDirection] = useState({ x: 0, y: 0 });
  const [gameClosing, setGameClosing] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [position, setPosition] = useState({ x: 80, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const gameRef = useRef(null);
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const GRID_SIZE = 12;
  const CANVAS_SIZE = 240;
  const GRID_COUNT = CANVAS_SIZE / GRID_SIZE;

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
          x: Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 360, e.clientY - dragOffset.y))
        });
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging && e.touches[0]) {
        e.preventDefault();
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 320, e.touches[0].clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 360, e.touches[0].clientY - dragOffset.y))
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

  const resetGame = useCallback(() => {
    const startX = Math.floor(GRID_COUNT / 2);
    const startY = Math.floor(GRID_COUNT / 2);
    setSnake([{ x: startX, y: startY }]);
    setFood({ x: startX + 5, y: startY });
    setDirection({ x: 0, y: 0 });
    setNextDirection({ x: 0, y: 0 });
    setScore(0);
    setGameState('idle');
  }, []);

  const startGame = useCallback(() => {
    if (gameState === 'idle') {
      resetGame();
      setDirection({ x: 1, y: 0 });
      setNextDirection({ x: 1, y: 0 });
    }
    setGameState('playing');
  }, [gameState, resetGame]);

  const playAgain = useCallback(() => {
    resetGame();
    setDirection({ x: 1, y: 0 });
    setNextDirection({ x: 1, y: 0 });
    setGameState('playing');
  }, [resetGame]);

  const pauseGame = useCallback(() => {
    setGameState('paused');
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    setDirection(nextDirection);
    
    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      head.x += nextDirection.x;
      head.y += nextDirection.y;

      if (head.x < 0 || head.x >= GRID_COUNT || 
          head.y < 0 || head.y >= GRID_COUNT ||
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
            if (typeof window !== 'undefined') {
              localStorage.setItem('snake-high-score', newScore.toString());
            }
          }
          return newScore;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameState, nextDirection, food, generateFood, highScore]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, 120);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, gameLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (let x = 0; x < GRID_COUNT; x++) {
      for (let y = 0; y < GRID_COUNT; y++) {
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      }
    }

    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#22c55e' : '#16a34a';
      ctx.fillRect(
        segment.x * GRID_SIZE + 1, 
        segment.y * GRID_SIZE + 1, 
        GRID_SIZE - 2, 
        GRID_SIZE - 2
      );
      
      if (isHead) {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(
          segment.x * GRID_SIZE + 4,
          segment.y * GRID_SIZE + 4,
          GRID_SIZE - 8,
          GRID_SIZE - 8
        );
      }
    });

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(food.x * GRID_SIZE + 1, food.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(food.x * GRID_SIZE + 3, food.y * GRID_SIZE + 3, GRID_SIZE - 6, GRID_SIZE - 6);
  }, [snake, food]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;

      const keyMap = {
        'ArrowUp': { x: 0, y: -1 },
        'ArrowDown': { x: 0, y: 1 },
        'ArrowLeft': { x: -1, y: 0 },
        'ArrowRight': { x: 1, y: 0 },
        'w': { x: 0, y: -1 },
        'W': { x: 0, y: -1 },
        's': { x: 0, y: 1 },
        'S': { x: 0, y: 1 },
        'a': { x: -1, y: 0 },
        'A': { x: -1, y: 0 },
        'd': { x: 1, y: 0 },
        'D': { x: 1, y: 0 }
      };

      const newDirection = keyMap[e.key];
      if (newDirection && 
          (newDirection.x !== -direction.x || newDirection.y !== -direction.y)) {
        setNextDirection(newDirection);
      }
    };

    if (showGame) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, direction, showGame]);

  const handleCanvasTouchStart = (e) => {
    if (gameState !== 'playing') return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    touchStartRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const handleCanvasTouchEnd = (e) => {
    if (gameState !== 'playing') return;
    e.preventDefault();
    
    const touch = e.changedTouches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const touchEnd = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        const newDirection = deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        if (newDirection.x !== -direction.x) {
          setNextDirection(newDirection);
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        const newDirection = deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        if (newDirection.y !== -direction.y) {
          setNextDirection(newDirection);
        }
      }
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
        width: '320px',
        top: `${position.y}px`,
        left: `${position.x}px`,
        backgroundColor: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div 
        className="flex items-center justify-between px-2 py-1 cursor-move border-b border-zinc-700/50 bg-zinc-900/70"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center">
          <span className="w-3.5 h-3.5 mr-1.5 text-gray-400 text-sm">🐍</span>
          <span className="text-xs font-mono text-gray-300">snake</span>
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
      
      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs">
            <span className="text-gray-400">Score:</span>
            <span className="text-white ml-1">{score}</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-400">Best:</span>
            <span className="text-green-400 ml-1">{highScore}</span>
          </div>
        </div>

        <div className="flex justify-center mb-3">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="border border-zinc-700/50 rounded"
            onTouchStart={handleCanvasTouchStart}
            onTouchEnd={handleCanvasTouchEnd}
            style={{ touchAction: 'none' }}
          />
        </div>

        <div className="flex justify-center gap-2 mb-3">
          {gameState === 'idle' ? (
            <button
              onClick={startGame}
              className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
            >
              <Play className="w-3 h-3" />
              Start
            </button>
          ) : gameState === 'gameOver' ? (
            <button
              onClick={playAgain}
              className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
            >
              <Play className="w-3 h-3" />
              Play Again
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
          <div className="text-center text-xs text-red-400 mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded">
            <div className="font-medium">Game Over!</div>
            <div className="text-gray-400 mt-0.5">Score: {score}</div>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="text-center text-xs text-yellow-400 mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
            <div className="font-medium">Paused</div>
          </div>
        )}

        <div className="text-xs text-gray-400 text-center">
          <div>Desktop: Arrow keys • Mobile: Swipe</div>
        </div>
      </div>
    </div>
  );
}
