import JSZip from 'jszip';
import { getFs } from './browserFs';

const EXCLUDED_FOLDERS = ['node_modules', '.git', 'dist', '.cache', '.next', 'build'];

async function ensureDirRecursive(fs: any, dirPath: string) {
  if (!dirPath || dirPath === '/' || fs.existsSync(dirPath)) return;
  const parts = dirPath.split('/').filter(Boolean);
  let cur = '';
  for (const p of parts) {
    cur += '/' + p;
    if (!fs.existsSync(cur)) {
      fs.mkdirSync(cur);
    }
  }
}

export async function importZipFromUrl(zipUrl: string, targetRoot = '/workspace'): Promise<{ imported: number; skipped: number }> {
  const fs = getFs();
  if (!fs) throw new Error('Filesystem not initialized');

  // Use CORS proxy to fetch external URLs
  const corsProxy = 'https://corsproxy.io/?';
  const proxiedUrl = zipUrl.startsWith('http') ? `${corsProxy}${encodeURIComponent(zipUrl)}` : zipUrl;
  
  // Fetch zip file
  const response = await fetch(proxiedUrl);
  if (!response.ok) throw new Error(`Failed to fetch ZIP: ${response.statusText}`);
  
  const arrayBuffer = await response.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  let imported = 0;
  let skipped = 0;

  // Process all files
  const files = Object.keys(zip.files);
  for (const name of files) {
    const entry = zip.files[name];
    
    // Skip directories
    if (entry.dir) continue;
    
    // Skip excluded folders
    const pathParts = name.split('/');
    if (pathParts.some(p => EXCLUDED_FOLDERS.includes(p))) {
      skipped++;
      continue;
    }

    // Read content
    const content = await entry.async('uint8array');
    const fullPath = `${targetRoot}/${name}`.replace('//', '/');
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
    
    // Ensure directory exists
    await ensureDirRecursive(fs, dir);
    
    // Write file
    fs.writeFileSync(fullPath, content);
    imported++;
  }

  return { imported, skipped };
}

export async function exportWorkspaceAsZip(): Promise<Blob> {
  const fs = getFs();
  if (!fs) throw new Error('Filesystem not initialized');

  const zip = new JSZip();

  function addToZip(dirPath: string, zipFolder: JSZip) {
    const items = fs.readdirSync(dirPath);
    
    for (const name of items) {
      const fullPath = `${dirPath}/${name}`.replace('//', '/');
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const folder = zipFolder.folder(name);
        if (folder) {
          addToZip(fullPath, folder);
        }
      } else {
        const content = fs.readFileSync(fullPath);
        zipFolder.file(name, content);
      }
    }
  }

  addToZip('/workspace', zip);
  return await zip.generateAsync({ type: 'blob' });
}

export async function uploadFilesToWorkspace(files: FileList, targetPath = '/workspace'): Promise<{ uploaded: number; imported?: number; skipped?: number }> {
  const fs = getFs();
  if (!fs) throw new Error('Filesystem not initialized');

  let uploaded = 0;
  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Check if it's a ZIP file
    if (file.name.endsWith('.zip')) {
      // Import ZIP contents
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      const zipFiles = Object.keys(zip.files);
      for (const name of zipFiles) {
        const entry = zip.files[name];
        
        if (entry.dir) continue;
        
        const pathParts = name.split('/');
        if (pathParts.some(p => EXCLUDED_FOLDERS.includes(p))) {
          skipped++;
          continue;
        }

        const content = await entry.async('uint8array');
        const fullPath = `${targetPath}/${name}`.replace('//', '/');
        const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
        
        await ensureDirRecursive(fs, dir);
        fs.writeFileSync(fullPath, content);
        imported++;
      }
    } else {
      // Regular file upload
      const content = await file.arrayBuffer();
      const fullPath = `${targetPath}/${file.name}`.replace('//', '/');
      
      fs.writeFileSync(fullPath, new Uint8Array(content));
      uploaded++;
    }
  }

  return { uploaded, imported, skipped };
}
