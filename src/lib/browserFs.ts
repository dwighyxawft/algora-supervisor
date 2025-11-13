import BrowserFS from 'browserfs';

let fsInstance: any = null;

export async function initBrowserFs(): Promise<any> {
  if (fsInstance) return fsInstance;
  
  return new Promise((resolve, reject) => {
    BrowserFS.configure({
      fs: 'MountableFileSystem',
      options: {
        '/workspace': {
          fs: 'IndexedDB',
          options: {
            storeName: 'workspace-files'
          }
        }
      }
    }, function (err) {
      if (err) return reject(err);
      const fs = BrowserFS.BFSRequire('fs');
      
      // Ensure /workspace exists
      try {
        if (!fs.existsSync('/workspace')) {
          fs.mkdirSync('/workspace');
        }
        // Create a sample file if workspace is empty
        const files = fs.readdirSync('/workspace');
        if (files.length === 0) {
          fs.writeFileSync('/workspace/index.js', '// Welcome to your browser IDE!\n// Start coding here...\n\nconsole.log("Hello, World!");', 'utf8');
        }
      } catch (e) {
        console.error('Error initializing workspace:', e);
      }
      
      fsInstance = fs;
      resolve(fs);
    });
  });
}

export function getFs() {
  return fsInstance;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

export function readDirRecursive(fs: any, dirPath: string): FileNode[] {
  const nodes: FileNode[] = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const name of items) {
      const path = `${dirPath}/${name}`.replace('//', '/');
      const stat = fs.statSync(path);
      
      if (stat.isDirectory()) {
        nodes.push({
          name,
          path,
          type: 'folder',
          children: readDirRecursive(fs, path),
        });
      } else {
        nodes.push({
          name,
          path,
          type: 'file',
        });
      }
    }
  } catch (e) {
    console.error('Error reading directory:', dirPath, e);
  }
  
  return nodes;
}
