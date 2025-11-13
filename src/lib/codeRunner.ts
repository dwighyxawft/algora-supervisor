import { getFs } from './browserFs';
import { addLog } from '@/components/Terminal';

export async function runCode(filePath: string): Promise<void> {
  const fs = getFs();
  if (!fs) {
    addLog('error', 'File system not initialized');
    return;
  }

  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = filePath.split('.').pop()?.toLowerCase();

    addLog('info', `Running ${filePath}...`);

    // Only support JavaScript for client-side execution
    if (ext === 'js' || ext === 'jsx') {
      await runJavaScript(content, filePath);
    } else {
      addLog('info', `⚠️  Client-side execution only supports JavaScript files (.js, .jsx)`);
      addLog('info', `For other languages (Python, PHP, etc.), backend infrastructure is needed.`);
    }
  } catch (error: any) {
    addLog('error', `Error: ${error.message}`);
  }
}

async function runJavaScript(code: string, filename: string): Promise<void> {
  // Create a sandboxed console that logs to terminal
  const sandboxConsole = {
    log: (...args: any[]) => {
      addLog('output', args.map(String).join(' '));
    },
    error: (...args: any[]) => {
      addLog('error', args.map(String).join(' '));
    },
    warn: (...args: any[]) => {
      addLog('info', '⚠️  ' + args.map(String).join(' '));
    },
    info: (...args: any[]) => {
      addLog('info', args.map(String).join(' '));
    },
  };

  try {
    // Create a function with sandboxed console
    const fn = new Function('console', code);
    fn(sandboxConsole);
    addLog('success', `✓ Execution completed`);
  } catch (error: any) {
    addLog('error', `Runtime error: ${error.message}`);
    if (error.stack) {
      addLog('error', error.stack.split('\n').slice(0, 3).join('\n'));
    }
  }
}
