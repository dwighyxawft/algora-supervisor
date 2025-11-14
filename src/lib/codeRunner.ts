import { getFs } from './browserFs';
import { addLog } from '@/components/Terminal';
import { exportWorkspaceAsZip } from './zipHelpers';

// Configure your backend URL here
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/run';

export async function runCode(filePath: string): Promise<void> {
  const fs = getFs();
  if (!fs) {
    addLog('error', 'File system not initialized');
    return;
  }

  try {
    addLog('info', `Preparing workspace for execution...`);

    // Export the entire workspace as a zip
    const zipBlob = await exportWorkspaceAsZip();
    
    addLog('info', `Sending workspace to backend (${(zipBlob.size / 1024).toFixed(2)} KB)...`);

    // Create FormData to send the zip file
    const formData = new FormData();
    formData.append('workspace', zipBlob, 'workspace.zip');
    formData.append('entryFile', filePath);

    // Send to backend
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const result = await response.json();

    // Display stdout logs
    if (result.stdout) {
      const stdoutLines = result.stdout.split('\n').filter((line: string) => line.trim());
      stdoutLines.forEach((line: string) => {
        addLog('output', line);
      });
    }

    // Display stderr logs
    if (result.stderr) {
      const stderrLines = result.stderr.split('\n').filter((line: string) => line.trim());
      stderrLines.forEach((line: string) => {
        addLog('error', line);
      });
    }

    // Display proxy URL if available
    if (result.proxyurl) {
      addLog('success', `✓ Application running at: ${result.proxyurl}`);
    }

    if (!result.stderr || result.stderr.trim() === '') {
      addLog('success', `✓ Execution completed`);
    }

  } catch (error: any) {
    addLog('error', `Error: ${error.message}`);
  }
}
