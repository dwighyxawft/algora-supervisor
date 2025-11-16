import { getFs } from './browserFs';

export async function clearWorkspace(): Promise<number> {
  const fs = getFs();
  if (!fs) throw new Error('Filesystem not initialized');

  let deletedCount = 0;

  function deleteDirRecursive(dirPath: string) {
    const items = fs.readdirSync(dirPath);
    
    for (const name of items) {
      const fullPath = `${dirPath}/${name}`.replace('//', '/');
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        deleteDirRecursive(fullPath);
        fs.rmdirSync(fullPath);
      } else {
        fs.unlinkSync(fullPath);
        deletedCount++;
      }
    }
  }

  deleteDirRecursive('/workspace');
  return deletedCount;
}

export async function importFolder(files: FileList, targetPath = '/workspace'): Promise<{ imported: number }> {
  const fs = getFs();
  if (!fs) throw new Error('Filesystem not initialized');

  let imported = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // @ts-ignore - webkitRelativePath exists on File in browsers
    const relativePath = file.webkitRelativePath || file.name;
    
    const content = await file.arrayBuffer();
    const fullPath = `${targetPath}/${relativePath}`.replace('//', '/');
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
    
    // Ensure directory exists
    if (dir && !fs.existsSync(dir)) {
      const parts = dir.split('/').filter(Boolean);
      let currentPath = '';
      for (const part of parts) {
        currentPath += '/' + part;
        if (!fs.existsSync(currentPath)) {
          fs.mkdirSync(currentPath);
        }
      }
    }
    
    const uint8Array = new Uint8Array(content);
    fs.writeFileSync(fullPath, uint8Array);
    imported++;
  }

  return { imported };
}
