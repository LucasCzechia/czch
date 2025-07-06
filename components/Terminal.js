import { useState, useRef, useEffect } from 'react';
import { HelpCircle, Minus, X } from 'lucide-react';

export default function Terminal({ isOpen, onClose }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', content: 'Terminal v1.0.0 - Type "help" for available commands' }
  ]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [terminalColor, setTerminalColor] = useState('black');
  const [position, setPosition] = useState({ x: 20, y: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const inputRef = useRef(null);
  const historyRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

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
    const rect = terminalRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleTouchStart = (e) => {
    if (e.touches[0]) {
      const rect = terminalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const getColorClass = (color) => {
    const colors = {
      black: 'text-gray-400',
      white: 'text-gray-800',
      green: 'text-green-500',
      blue: 'text-blue-500',
      red: 'text-red-500',
      yellow: 'text-yellow-500',
      purple: 'text-purple-500',
      cyan: 'text-cyan-500',
      pink: 'text-pink-500'
    };
    return colors[color] || 'text-gray-400';
  };

  const getTerminalTheme = (color) => {
    const themes = {
      black: {
        bg: 'rgba(10, 10, 15, 0.8)',
        border: 'border-zinc-700/50',
        header: 'bg-zinc-900/70',
        text: 'text-white'
      },
      white: {
        bg: 'rgba(255, 255, 255, 0.9)',
        border: 'border-gray-300/50',
        header: 'bg-gray-100/70',
        text: 'text-black'
      },
      green: {
        bg: 'rgba(10, 15, 10, 0.8)',
        border: 'border-green-700/50',
        header: 'bg-green-900/70',
        text: 'text-white'
      },
      blue: {
        bg: 'rgba(10, 10, 15, 0.8)',
        border: 'border-blue-700/50',
        header: 'bg-blue-900/70',
        text: 'text-white'
      },
      red: {
        bg: 'rgba(15, 10, 10, 0.8)',
        border: 'border-red-700/50',
        header: 'bg-red-900/70',
        text: 'text-white'
      },
      yellow: {
        bg: 'rgba(15, 15, 10, 0.8)',
        border: 'border-yellow-700/50',
        header: 'bg-yellow-900/70',
        text: 'text-white'
      },
      purple: {
        bg: 'rgba(15, 10, 15, 0.8)',
        border: 'border-purple-700/50',
        header: 'bg-purple-900/70',
        text: 'text-white'
      },
      cyan: {
        bg: 'rgba(10, 15, 15, 0.8)',
        border: 'border-cyan-700/50',
        header: 'bg-cyan-900/70',
        text: 'text-white'
      },
      pink: {
        bg: 'rgba(15, 10, 13, 0.8)',
        border: 'border-pink-700/50',
        header: 'bg-pink-900/70',
        text: 'text-white'
      }
    };
    return themes[color] || themes.black;
  };

  const executeCommand = (cmd) => {
    const trimmedCmd = cmd.trim();
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    setHistory(prev => [...prev, { type: 'command', content: trimmedCmd }]);

    switch (command) {
      case 'help':
        setHistory(prev => [...prev, { 
          type: 'output', 
          content: `Available commands:
- ping: Test connectivity
- clear: Clear console
- color [hex/name]: Change terminal color
- close: Close the terminal
- minimize: Minimize the terminal
- echo [text]: Echo text back
- snake: Play snake game
- about: About this terminal` 
        }]);
        break;

      case 'ping':
        setHistory(prev => [...prev, { type: 'output', content: 'pong!' }]);
        break;

      case 'clear':
        setHistory([{ type: 'system', content: 'Terminal v1.0.0 - Type "help" for available commands' }]);
        break;

      case 'color':
        if (args.length > 0) {
          const color = args[0].toLowerCase();
          const validColors = ['black', 'white', 'green', 'blue', 'red', 'yellow', 'purple', 'cyan', 'pink'];
          if (validColors.includes(color)) {
            setTerminalColor(color);
            setHistory(prev => [...prev, { type: 'output', content: `Terminal theme changed to ${color}` }]);
          } else {
            setHistory(prev => [...prev, { type: 'error', content: `Error: Invalid color "${color}". Available: ${validColors.join(', ')}` }]);
          }
        } else {
          setHistory(prev => [...prev, { type: 'error', content: 'Error: Missing color parameter. Usage: color [black|white|green|blue|red|yellow|purple|cyan|pink]' }]);
        }
        break;

      case 'close':
        onClose();
        break;

      case 'minimize':
        setIsMinimized(true);
        break;

      case 'echo':
        const echoText = args.join(' ');
        if (echoText) {
          setHistory(prev => [...prev, { type: 'output', content: echoText }]);
        } else {
          setHistory(prev => [...prev, { type: 'error', content: 'Error: Missing text parameter. Usage: echo [text]' }]);
        }
        break;

      case 'snake':
        setHistory(prev => [...prev, { type: 'output', content: '🐍 Snake game coming soon! Use arrow keys when implemented.' }]);
        break;

      case 'about':
        setHistory(prev => [...prev, { 
          type: 'output', 
          content: `czch terminal v1.0.0
Built with React & Next.js
Created by @lucasczch
Type 'help' for commands` 
        }]);
        break;

      default:
        if (trimmedCmd) {
          setHistory(prev => [...prev, { type: 'error', content: `Error: Command not found "${command}". Type 'help' for available commands.` }]);
        }
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput('');
    }
  };

  if (!isOpen) return null;

  const theme = getTerminalTheme(terminalColor);

  return (
    <div 
      ref={terminalRef}
      className={`absolute overflow-hidden rounded-md border shadow-lg z-50 ${theme.border} ${theme.text}`}
      style={{
        width: '90%',
        maxWidth: '350px',
        top: `${position.y}px`,
        left: `${position.x}px`,
        backgroundColor: theme.bg,
        backdropFilter: 'blur(8px)',
        height: isMinimized ? 'auto' : '250px'
      }}
    >
      <div 
        className={`flex items-center justify-between px-2 py-1 cursor-move border-b ${theme.border} ${theme.header}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center">
          <HelpCircle className={`w-3.5 h-3.5 mr-1.5 ${terminalColor === 'white' ? 'text-gray-700' : 'text-gray-400'}`} />
          <span className={`text-xs font-mono ${terminalColor === 'white' ? 'text-black' : 'text-gray-300'}`}>terminal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className={`transition-colors p-0.5 ${terminalColor === 'white' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={`transition-colors p-0.5 ${terminalColor === 'white' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="flex flex-col" style={{ height: 'calc(250px - 32px)' }}>
          <div 
            ref={historyRef}
            className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1"
          >
            {history.map((entry, index) => (
              <div key={index}>
                {entry.type === 'command' && (
                  <div className="flex">
                    <span className={`mr-1 ${getColorClass(terminalColor)}`}>$</span>
                    <span>{entry.content}</span>
                  </div>
                )}
                {entry.type === 'output' && (
                  <div className={`whitespace-pre-wrap ml-3 ${terminalColor === 'white' ? 'text-gray-700' : 'text-gray-300'}`}>
                    {entry.content}
                  </div>
                )}
                {entry.type === 'system' && (
                  <div className={`whitespace-pre-wrap ${terminalColor === 'white' ? 'text-gray-700' : 'text-gray-300'}`}>
                    {entry.content}
                  </div>
                )}
                {entry.type === 'error' && (
                  <div className="whitespace-pre-wrap text-red-400 ml-3">
                    {entry.content}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className={`p-2 border-t ${terminalColor === 'white' ? 'border-gray-300/50' : 'border-zinc-700/30'}`}>
            <form onSubmit={handleSubmit} className="flex items-center">
              <span className={`mr-1 text-xs font-mono ${getColorClass(terminalColor)}`}>$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none font-mono text-xs ${terminalColor === 'white' ? 'text-black placeholder-gray-500' : 'text-white placeholder-gray-400'}`}
                placeholder="Type a command..."
                autoComplete="off"
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
