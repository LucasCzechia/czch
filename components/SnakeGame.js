import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

export default function SnakeGame({ isOpen, onClose }) {
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('snakeHighScore') || '0');
    }
    return 0;
  });
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameClosing, setGameClosing] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const gameRef = useRef(null);
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const GRID_SIZE = 15;
  const CANVAS_SIZE = 450;
  const GRID_COUNT = CANVAS_SIZE / GRID_SIZE;

  useEffect(() => {
    if (isOpen && !showGame) {
      setShowGame(true);
      setGameClosing(false);
    }
  }, [isOpen, showGame]);

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
    const startPos = { x: Math.floor(GRID_COUNT / 2), y: Math.floor(GRID_COUNT / 2) };
    setSnake([startPos]);
    setFood(generateFood());
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameState('idle');
  }, [generateFood]);

  const startGame = useCallback(() => {
    if (gameState === 'idle' || gameState === 'gameOver') {
      const startPos = { x: Math.floor(GRID_COUNT / 2), y: Math.floor(GRID_COUNT / 2) };
      setSnake([startPos]);
      setFood(generateFood());
      setDirection({ x: 1, y: 0 });
      setScore(0);
    }
    setGameState('playing');
  }, [gameState, generateFood]);

  const pauseGame = useCallback(() => {
    setGameState('paused');
  }, []);

  const moveSnake = useCallback(() => {
    if (gameState !== 'playing' || direction.x === 0 && direction.y === 0) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

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
              localStorage.setItem('snakeHighScore', newScore.toString());
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
  }, [gameState, direction, food, generateFood, highScore]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(moveSnake, 120);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, moveSnake]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const gridPattern = ctx.createPattern(createGridPattern(), 'repeat');
    ctx.fillStyle = gridPattern;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    snake.forEach((segment, index) => {
      const x = segment.x * GRID_SIZE;
      const y = segment.y * GRID_SIZE;
      
      if (index === 0) {
        const gradient = ctx.createRadialGradient(
          x + GRID_SIZE/2, y + GRID_SIZE/2, 0,
          x + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE/2
        );
        gradient.addColorStop(0, '#22c55e');
        gradient.addColorStop(1, '#16a34a');
        ctx.fillStyle = gradient;
      } else {
        const alpha = Math.max(0.6, 1 - (index * 0.05));
        ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
      }
      
      ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    });

    const foodX = food.x * GRID_SIZE;
    const foodY = food.y * GRID_SIZE;
    const foodGradient = ctx.createRadialGradient(
      foodX + GRID_SIZE/2, foodY + GRID_SIZE/2, 0,
      foodX + GRID_SIZE/2, foodY + GRID_SIZE/2, GRID_SIZE/2
    );
    foodGradient.addColorStop(0, '#ef4444');
    foodGradient.addColorStop(1, '#dc2626');
    ctx.fillStyle = foodGradient;
    ctx.fillRect(foodX + 2, foodY + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(foodX + GRID_SIZE/2 - 1, foodY + GRID_SIZE/2 - 1, 2, 2);
  }, [snake, food]);

  const createGridPattern = () => {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = GRID_SIZE;
    patternCanvas.height = GRID_SIZE;
    const patternCtx = patternCanvas.getContext('2d');
    
    patternCtx.fillStyle = '#0a0a0f';
    patternCtx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
    patternCtx.strokeStyle = '#1a1a1f';
    patternCtx.lineWidth = 0.5;
    patternCtx.strokeRect(0, 0, GRID_SIZE, GRID_SIZE);
    
    return patternCanvas;
  };

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

  const handleTouchStart = (e) => {
    if (e.touches[0]) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (!e.changedTouches[0] || gameState !== 'playing') return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0 && direction.x !== -1) {
        setDirection({ x: 1, y: 0 });
      } else if (deltaX < 0 && direction.x !== 1) {
        setDirection({ x: -1, y: 0 });
      }
    } else {
      if (deltaY > 0 && direction.y !== -1) {
        setDirection({ x: 0, y: 1 });
      } else if (deltaY < 0 && direction.y !== 1) {
        setDirection({ x: 0, y: -1 });
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
      className={`fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 ${
        gameClosing ? 'animate-modal-fade-out' : 'animate-modal-fade-in'
      }`}
      onClick={(e) => e.target === e.currentTarget && closeGame()}
    >
      <div className={`relative w-full max-w-lg mx-4 ${
        gameClosing ? 'animate-modal-scale-out' : 'animate-modal-scale-in'
      }`}>
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl border border-zinc-700/50 shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-lg">🐍</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Snake</h2>
                <p className="text-sm text-gray-400">Swipe or use arrow keys</p>
              </div>
            </div>
            <button 
              onClick={closeGame}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{score}</div>
              <div className="text-xs text-gray-400">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{highScore}</div>
              <div className="text-xs text-gray-400">Best</div>
            </div>
          </div>

          <div className="relative mb-6">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="w-full h-auto max-w-md mx-auto block rounded-xl border border-zinc-700/50 shadow-inner"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{ 
                aspectRatio: '1/1',
                background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a1f 100%)'
              }}
            />
            
            {gameState === 'gameOver' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400 mb-2">Game Over!</div>
                  <div className="text-gray-300">Final Score: {score}</div>
                </div>
              </div>
            )}

            {gameState === 'paused' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-2">Paused</div>
                  <div className="text-gray-300">Press play to continue</div>
                </div>
              </div>
            )}

            {gameState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">Ready to Play?</div>
                  <div className="text-gray-300">Press start to begin</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3">
            {gameState === 'idle' || gameState === 'gameOver' ? (
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                {gameState === 'gameOver' ? 'Play Again' : 'Start Game'}
              </button>
            ) : gameState === 'playing' ? (
              <button
                onClick={pauseGame}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            ) : (
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                Resume
              </button>
            )}
            
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
