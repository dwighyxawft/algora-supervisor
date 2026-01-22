import { useState, useRef, useEffect } from 'react';
import { X, Play, Trash2, Terminal as TerminalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { executeNpmCommand, parseNpmCommand, isNpmProject, getProjectType } from '@/lib/virtualNpm';

interface TerminalProps {
  onClose: () => void;
  onRun: () => void;
  isRunning: boolean;
  onRefreshFiles?: () => void;
}

export interface LogEntry {
  type: 'info' | 'error' | 'success' | 'output' | 'command';
  message: string;
  timestamp: Date;
}

let logListeners: ((log: LogEntry) => void)[] = [];

export function addLog(type: LogEntry['type'], message: string) {
  const log: LogEntry = { type, message, timestamp: new Date() };
  logListeners.forEach(listener => listener(log));
}

export function Terminal({ onClose, onRun, isRunning, onRefreshFiles }: TerminalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (log: LogEntry) => {
      setLogs(prev => [...prev, log]);
    };
    logListeners.push(listener);
    return () => {
      logListeners = logListeners.filter(l => l !== listener);
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const clearLogs = () => setLogs([]);

  const addLocalLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { type, message, timestamp: new Date() }]);
  };

  const handleCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    
    const trimmedCmd = cmd.trim();
    addLocalLog('command', `$ ${trimmedCmd}`);
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);
    setCommand('');
    
    // Handle npm commands
    if (trimmedCmd.startsWith('npm ')) {
      const parsed = parseNpmCommand(trimmedCmd);
      
      if (!parsed) {
        addLocalLog('error', 'Invalid npm command. Supported: npm install, npm install <package>, npm uninstall <package>');
        return;
      }
      
      if (!isNpmProject()) {
        addLocalLog('error', 'No package.json found. This command requires a Node.js or Laravel project.');
        return;
      }
      
      const projectType = getProjectType();
      addLocalLog('info', `Detected project type: ${projectType}`);
      
      setIsProcessing(true);
      try {
        const result = await executeNpmCommand(trimmedCmd, (msg) => {
          addLocalLog('info', msg);
        });
        
        if (result.success) {
          addLocalLog('success', result.message);
          if (result.installed.length > 0) {
            addLocalLog('info', `Packages: ${result.installed.join(', ')}`);
          }
          // Refresh file explorer to show node_modules
          onRefreshFiles?.();
        } else {
          addLocalLog('error', result.message);
          if (result.failed.length > 0) {
            addLocalLog('error', `Failed packages: ${result.failed.join(', ')}`);
          }
        }
      } catch (error: any) {
        addLocalLog('error', `Error: ${error.message}`);
      } finally {
        setIsProcessing(false);
      }
      return;
    }
    
    // Handle other common commands
    switch (trimmedCmd) {
      case 'clear':
      case 'cls':
        clearLogs();
        break;
      case 'help':
        addLocalLog('info', 'Available commands:');
        addLocalLog('info', '  npm install              - Install all dependencies from package.json');
        addLocalLog('info', '  npm install <pkg>        - Install a specific package');
        addLocalLog('info', '  npm install -D <pkg>     - Install a dev dependency');
        addLocalLog('info', '  npm uninstall <pkg>      - Remove a package');
        addLocalLog('info', '  clear / cls              - Clear terminal');
        addLocalLog('info', '  help                     - Show this help');
        addLocalLog('info', '  run                      - Run the project');
        break;
      case 'run':
        onRun();
        break;
      default:
        addLocalLog('error', `Command not found: ${trimmedCmd}. Type 'help' for available commands.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleCommand(command);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      case 'command': return 'text-yellow-400';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full bg-terminal-background border-t border-border">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Terminal</span>
          {(isRunning || isProcessing) && (
            <span className="text-xs text-muted-foreground animate-pulse">
              {isProcessing ? 'Processing...' : 'Running...'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRun}
            disabled={isRunning}
            className="h-7 px-2"
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            Run
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            className="h-7 px-2"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        className="flex-1 overflow-auto p-4 font-mono text-sm cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground text-xs">
            Welcome to the virtual terminal. Type 'help' for available commands.
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={`mb-1 ${getLogColor(log.type)}`}>
              <span className="text-muted-foreground text-xs mr-2">
                {log.timestamp.toLocaleTimeString()}
              </span>
              {log.message}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
      
      <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-background/50">
        <span className="text-green-400 font-mono text-sm">$</span>
        <Input
          ref={inputRef}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command (npm install, help, etc.)"
          className="flex-1 h-8 font-mono text-sm bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isProcessing}
        />
      </div>
    </div>
  );
}
