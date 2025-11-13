import { useState } from 'react';
import { X, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TerminalProps {
  onClose: () => void;
  onRun: () => void;
  isRunning: boolean;
}

export interface LogEntry {
  type: 'info' | 'error' | 'success' | 'output';
  message: string;
  timestamp: Date;
}

let logListeners: ((log: LogEntry) => void)[] = [];

export function addLog(type: LogEntry['type'], message: string) {
  const log: LogEntry = { type, message, timestamp: new Date() };
  logListeners.forEach(listener => listener(log));
}

export function Terminal({ onClose, onRun, isRunning }: TerminalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useState(() => {
    const listener = (log: LogEntry) => {
      setLogs(prev => [...prev, log]);
    };
    logListeners.push(listener);
    return () => {
      logListeners = logListeners.filter(l => l !== listener);
    };
  });

  const clearLogs = () => setLogs([]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full bg-terminal-background border-t border-border">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Terminal</span>
          {isRunning && (
            <span className="text-xs text-muted-foreground animate-pulse">Running...</span>
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
      
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-muted-foreground text-xs">
            No output yet. Click Run to execute your code.
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
      </div>
    </div>
  );
}
