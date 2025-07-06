import { useState, useRef, useEffect } from 'react';
import { HelpCircle, Minus, X } from 'lucide-react';

export default function Terminal({ isOpen, onClose }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', content: 'Terminal v1.0.0 - Type "help" for available commands' }
  ]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [terminalColor, setTerminalColor] = useState('green');
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

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
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

  const getColorClass = (color) => {
    const colors = {
      green: 'text-green-500',
      blue: 'text-blue-500',
      red: 'text-red-500',
      yellow: 'text-yellow-500',
      purple: 'text-purple-500',
      cyan: 'text-cyan-500',
      pink: 'text-pink-500'
    };
    return colors[color] || 'text-green-500';
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
          const validColors = ['green', 'blue', 'red', 'yellow', 'purple', 'cyan', 'pink'];
          if (validColors.includes(color)) {
            setTerminalColor(color);
            setHistory(prev => [...prev, { type: 'output', content: `Terminal color changed to ${color}` }]);
          } else {
            setHistory(prev => [...prev, { type: 'error', content: `Error: Invalid color "${color}". Available: ${validColors.join(', ')}` }]);
          }
        } else {
          setHistory(prev => [...prev, { type: 'error', content: 'Error: Missing color parameter. Usage: color [hex/name]' }]);
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

  return (
    <div 
      ref={terminalRef}
      className="absolute overflow-hidden text-white rounded-md border border-zinc-700/50 shadow-lg z-50"
      style={{
        width: '90%',
        maxWidth: '350px',
        top: `${position.y}px`,
        left: `${position.x}px`,
        backgroundColor: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(8px)',
        height: isMinimized ? 'auto' : '250px'
      }}
    >
      <div 
        className="flex items-center justify-between px-2 py-1 bg-zinc-900/70 cursor-move border-b border-zinc-700/50"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center">
          <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          <span className="text-xs text-gray-300 font-mono">terminal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="text-gray-400 hover:text-gray-200 transition-colors p-0.5"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-200 transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="p-2 h-[200px] flex flex-col">
          <div 
            ref={historyRef}
            className="flex-1 overflow-y-auto mb-1 font-mono text-xs space-y-1"
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
                  <div className="whitespace-pre-wrap text-gray-300 ml-3">
                    {entry.content}
                  </div>
                )}
                {entry.type === 'system' && (
                  <div className="whitespace-pre-wrap text-gray-300">
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
          
          <form onSubmit={handleSubmit} className="flex items-center">
            <span className={`mr-1 text-xs font-mono ${getColorClass(terminalColor)}`}>$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs"
              placeholder="Type a command..."
              autoComplete="off"
            />
          </form>
        </div>
      )}
    </div>
  );
}
