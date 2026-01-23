import { getFs } from './browserFs';

// Supported project types for npm install
const SUPPORTED_PROJECT_TYPES = ['node', 'nestjs', 'react', 'vue', 'angular', 'next', 'nuxt', 'express', 'laravel'];

export interface NpmPackageInfo {
  name: string;
  version: string;
  description?: string;
  main?: string;
  types?: string;
  dependencies?: Record<string, string>;
}

export interface NpmInstallResult {
  success: boolean;
  installed: string[];
  failed: string[];
  message: string;
}

// Check if project type supports npm
export function isNpmProject(): boolean {
  const fs = getFs();
  if (!fs) return false;
  
  try {
    // Check for package.json (Node.js projects)
    if (fs.existsSync('/workspace/package.json')) {
      return true;
    }
    // Check for composer.json (Laravel)
    if (fs.existsSync('/workspace/composer.json')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Get project type
export function getProjectType(): string | null {
  const fs = getFs();
  if (!fs) return null;
  
  try {
    if (fs.existsSync('/workspace/package.json')) {
      const content = fs.readFileSync('/workspace/package.json', 'utf8');
      const pkg = JSON.parse(content.toString());
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['@nestjs/core']) return 'nestjs';
      if (deps['next']) return 'next';
      if (deps['nuxt']) return 'nuxt';
      if (deps['@angular/core']) return 'angular';
      if (deps['vue']) return 'vue';
      if (deps['react']) return 'react';
      if (deps['express']) return 'express';
      return 'node';
    }
    if (fs.existsSync('/workspace/composer.json')) {
      return 'laravel';
    }
    return null;
  } catch {
    return null;
  }
}

// Parse npm command
export function parseNpmCommand(command: string): { action: string; packages: string[]; isDev: boolean } | null {
  const parts = command.trim().split(/\s+/);
  
  if (parts[0] !== 'npm') return null;
  
  const action = parts[1];
  if (!['install', 'i', 'add', 'uninstall', 'remove', 'rm'].includes(action)) {
    return null;
  }
  
  const isDev = parts.includes('-D') || parts.includes('--save-dev');
  const packages = parts.slice(2).filter(p => !p.startsWith('-'));
  
  return {
    action: ['install', 'i', 'add'].includes(action) ? 'install' : 'uninstall',
    packages,
    isDev
  };
}

// Fetch package info from npm registry with better error handling
export async function fetchPackageInfo(packageName: string): Promise<NpmPackageInfo | null> {
  try {
    // Parse package name and version
    let name = packageName;
    let requestedVersion = 'latest';
    
    if (packageName.includes('@') && !packageName.startsWith('@')) {
      const parts = packageName.split('@');
      name = parts[0];
      requestedVersion = parts[1] || 'latest';
    } else if (packageName.startsWith('@')) {
      // Scoped package like @types/node or @types/node@1.0.0
      const match = packageName.match(/^(@[^@]+)(?:@(.+))?$/);
      if (match) {
        name = match[1];
        requestedVersion = match[2] || 'latest';
      }
    }
    
    // Encode the package name for URL (handles scoped packages)
    const encodedName = encodeURIComponent(name).replace('%40', '@');
    
    const response = await fetch(`https://registry.npmjs.org/${encodedName}/${requestedVersion}`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      // Try fetching latest if specific version fails
      const latestResponse = await fetch(`https://registry.npmjs.org/${encodedName}/latest`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!latestResponse.ok) {
        // Return a default stub info so we can still create a placeholder
        return {
          name,
          version: requestedVersion === 'latest' ? '1.0.0' : requestedVersion,
          main: 'index.js'
        };
      }
      const data = await latestResponse.json();
      return {
        name: data.name,
        version: data.version,
        description: data.description,
        main: data.main || 'index.js',
        types: data.types || data.typings,
        dependencies: data.dependencies
      };
    }
    
    const data = await response.json();
    return {
      name: data.name,
      version: data.version,
      description: data.description,
      main: data.main || 'index.js',
      types: data.types || data.typings,
      dependencies: data.dependencies
    };
  } catch (error) {
    console.warn(`Could not fetch registry info for ${packageName}, using stub`);
    // Return default stub info on network error
    const name = packageName.startsWith('@') 
      ? packageName.match(/^(@[^@]+)/)?.[1] || packageName 
      : packageName.split('@')[0];
    return {
      name,
      version: '1.0.0',
      main: 'index.js'
    };
  }
}

// Safely create a directory, handling BrowserFS quirks
function safeCreateDir(fs: any, path: string): boolean {
  try {
    if (fs.existsSync(path)) return true;
    fs.mkdirSync(path);
    return true;
  } catch (e: any) {
    if (e.code === 'EEXIST') return true;
    console.warn(`Could not create directory ${path}:`, e.message);
    return false;
  }
}

// Ensure directory exists recursively (handles scoped packages like @nestjs/swagger)
function ensureDirRecursive(fs: any, dirPath: string): boolean {
  if (!dirPath || dirPath === '/') return true;
  
  try {
    if (fs.existsSync(dirPath)) return true;
  } catch {
    // Path doesn't exist, continue to create
  }
  
  const parts = dirPath.split('/').filter(Boolean);
  let cur = '';
  for (const p of parts) {
    cur += '/' + p;
    if (!safeCreateDir(fs, cur)) {
      return false;
    }
  }
  return true;
}

// Safely write a file, handling BrowserFS quirks
function safeWriteFile(fs: any, path: string, content: string): boolean {
  try {
    // BrowserFS InMemory requires Uint8Array
    const data = new Uint8Array(Buffer.from(content, 'utf8'));
    fs.writeFileSync(path, data);
    return true;
  } catch (e: any) {
    console.warn(`Could not write file ${path}:`, e.message);
    return false;
  }
}

// Create stub files for a package
function createPackageStub(fs: any, packageInfo: NpmPackageInfo): boolean {
  const basePath = `/workspace/node_modules/${packageInfo.name}`;
  
  // Ensure directory exists (handles scoped packages like @nestjs/swagger)
  if (!ensureDirRecursive(fs, basePath)) {
    return false;
  }
  
  // Create package.json
  const packageJson = {
    name: packageInfo.name,
    version: packageInfo.version,
    description: packageInfo.description || `Virtual stub for ${packageInfo.name}`,
    main: packageInfo.main || 'index.js',
    types: packageInfo.types || 'index.d.ts'
  };
  
  if (!safeWriteFile(fs, `${basePath}/package.json`, JSON.stringify(packageJson, null, 2))) {
    return false;
  }
  
  // Create main entry file - handle nested paths like dist/index.js
  const mainFile = packageInfo.main || 'index.js';
  const mainFilePath = `${basePath}/${mainFile}`;
  const mainFileDir = mainFilePath.substring(0, mainFilePath.lastIndexOf('/'));
  if (mainFileDir !== basePath && mainFileDir.length > basePath.length) {
    ensureDirRecursive(fs, mainFileDir);
  }
  
  const mainContent = `// Virtual stub for ${packageInfo.name}@${packageInfo.version}
// This is a placeholder for editor IntelliSense support
module.exports = {};
exports.default = {};
`;
  safeWriteFile(fs, mainFilePath, mainContent);
  
  // Create TypeScript declaration file at root
  const dtsContent = `// Type definitions for ${packageInfo.name}@${packageInfo.version}
// This is a placeholder for TypeScript IntelliSense support

declare module '${packageInfo.name}' {
  const content: any;
  export default content;
  export = content;
}

declare module '${packageInfo.name}/*' {
  const content: any;
  export default content;
  export = content;
}
`;
  safeWriteFile(fs, `${basePath}/index.d.ts`, dtsContent);
  
  return true;
}

// Read package.json
function readPackageJson(fs: any): any {
  try {
    const content = fs.readFileSync('/workspace/package.json', 'utf8');
    return JSON.parse(content.toString());
  } catch {
    return null;
  }
}

// Write package.json
function writePackageJson(fs: any, pkg: any): boolean {
  return safeWriteFile(fs, '/workspace/package.json', JSON.stringify(pkg, null, 2));
}

// Install all dependencies from package.json
export async function installAllDependencies(
  onProgress?: (message: string) => void
): Promise<NpmInstallResult> {
  const fs = getFs();
  if (!fs) {
    return { success: false, installed: [], failed: [], message: 'Filesystem not initialized' };
  }
  
  const pkg = readPackageJson(fs);
  if (!pkg) {
    return { success: false, installed: [], failed: [], message: 'No package.json found' };
  }
  
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  };
  
  const depNames = Object.keys(allDeps);
  if (depNames.length === 0) {
    return { success: true, installed: [], failed: [], message: 'No dependencies to install' };
  }
  
  // Ensure node_modules exists
  if (!ensureDirRecursive(fs, '/workspace/node_modules')) {
    return { success: false, installed: [], failed: [], message: 'Failed to create node_modules directory' };
  }
  
  const installed: string[] = [];
  const failed: string[] = [];
  
  // Process in batches of 5 for better performance
  const batchSize = 5;
  for (let i = 0; i < depNames.length; i += batchSize) {
    const batch = depNames.slice(i, i + batchSize);
    
    const results = await Promise.all(
      batch.map(async (dep) => {
        const version = allDeps[dep];
        const cleanVersion = version.replace(/^[\^~>=<]/, '').split(' ')[0];
        onProgress?.(`Installing ${dep}@${version}...`);
        
        try {
          const info = await fetchPackageInfo(`${dep}@${cleanVersion}`);
          if (info && createPackageStub(fs, info)) {
            return { success: true, name: `${info.name}@${info.version}` };
          } else {
            // Try creating a basic stub
            const basicInfo: NpmPackageInfo = {
              name: dep,
              version: cleanVersion || '1.0.0',
              main: 'index.js'
            };
            if (createPackageStub(fs, basicInfo)) {
              return { success: true, name: `${dep}@${cleanVersion || '1.0.0'}` };
            }
            return { success: false, name: dep };
          }
        } catch (error) {
          // Last resort: create basic stub
          const basicInfo: NpmPackageInfo = {
            name: dep,
            version: cleanVersion || '1.0.0',
            main: 'index.js'
          };
          if (createPackageStub(fs, basicInfo)) {
            return { success: true, name: `${dep}@${cleanVersion || '1.0.0'}` };
          }
          return { success: false, name: dep };
        }
      })
    );
    
    for (const result of results) {
      if (result.success) {
        installed.push(result.name);
      } else {
        failed.push(result.name);
        onProgress?.(`Failed to install ${result.name}`);
      }
    }
  }
  
  return {
    success: failed.length === 0,
    installed,
    failed,
    message: `Installed ${installed.length} packages${failed.length > 0 ? `, ${failed.length} failed` : ''}`
  };
}

// Install specific packages
export async function installPackages(
  packages: string[],
  isDev: boolean = false,
  onProgress?: (message: string) => void
): Promise<NpmInstallResult> {
  const fs = getFs();
  if (!fs) {
    return { success: false, installed: [], failed: [], message: 'Filesystem not initialized' };
  }
  
  const pkg = readPackageJson(fs);
  if (!pkg) {
    return { success: false, installed: [], failed: [], message: 'No package.json found' };
  }
  
  // Ensure node_modules exists
  if (!ensureDirRecursive(fs, '/workspace/node_modules')) {
    return { success: false, installed: [], failed: [], message: 'Failed to create node_modules directory' };
  }
  
  const installed: string[] = [];
  const failed: string[] = [];
  
  for (const packageName of packages) {
    onProgress?.(`Fetching ${packageName}...`);
    
    try {
      const info = await fetchPackageInfo(packageName);
      if (info && createPackageStub(fs, info)) {
        installed.push(`${info.name}@${info.version}`);
        
        // Update package.json
        const depKey = isDev ? 'devDependencies' : 'dependencies';
        if (!pkg[depKey]) pkg[depKey] = {};
        pkg[depKey][info.name] = `^${info.version}`;
      } else {
        failed.push(packageName);
        onProgress?.(`Failed to create stub for: ${packageName}`);
      }
    } catch (error) {
      failed.push(packageName);
      onProgress?.(`Failed to install ${packageName}`);
    }
  }
  
  // Write updated package.json
  writePackageJson(fs, pkg);
  
  return {
    success: failed.length === 0,
    installed,
    failed,
    message: `Installed ${installed.length} packages${failed.length > 0 ? `, ${failed.length} failed` : ''}`
  };
}

// Uninstall packages
export async function uninstallPackages(
  packages: string[],
  onProgress?: (message: string) => void
): Promise<NpmInstallResult> {
  const fs = getFs();
  if (!fs) {
    return { success: false, installed: [], failed: [], message: 'Filesystem not initialized' };
  }
  
  const pkg = readPackageJson(fs);
  if (!pkg) {
    return { success: false, installed: [], failed: [], message: 'No package.json found' };
  }
  
  const removed: string[] = [];
  const failed: string[] = [];
  
  for (const packageName of packages) {
    onProgress?.(`Removing ${packageName}...`);
    
    try {
      // Remove from node_modules
      const modulePath = `/workspace/node_modules/${packageName}`;
      if (fs.existsSync(modulePath)) {
        removeDir(fs, modulePath);
      }
      
      // Remove from package.json
      if (pkg.dependencies?.[packageName]) {
        delete pkg.dependencies[packageName];
        removed.push(packageName);
      } else if (pkg.devDependencies?.[packageName]) {
        delete pkg.devDependencies[packageName];
        removed.push(packageName);
      } else {
        failed.push(packageName);
        onProgress?.(`Package not found in package.json: ${packageName}`);
      }
    } catch (error) {
      failed.push(packageName);
      onProgress?.(`Failed to remove ${packageName}`);
    }
  }
  
  // Write updated package.json
  writePackageJson(fs, pkg);
  
  return {
    success: failed.length === 0,
    installed: removed,
    failed,
    message: `Removed ${removed.length} packages${failed.length > 0 ? `, ${failed.length} failed` : ''}`
  };
}

// Remove directory recursively
function removeDir(fs: any, dirPath: string) {
  try {
    if (!fs.existsSync(dirPath)) return;
    
    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) {
      fs.unlinkSync(dirPath);
      return;
    }
    
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      removeDir(fs, `${dirPath}/${item}`);
    }
    fs.rmdirSync(dirPath);
  } catch (e) {
    console.warn(`Could not remove ${dirPath}:`, e);
  }
}

// Execute npm command
export async function executeNpmCommand(
  command: string,
  onProgress?: (message: string) => void
): Promise<NpmInstallResult> {
  const parsed = parseNpmCommand(command);
  
  if (!parsed) {
    return { success: false, installed: [], failed: [], message: 'Invalid npm command' };
  }
  
  if (!isNpmProject()) {
    return { success: false, installed: [], failed: [], message: 'Not a supported project type (Node.js or Laravel)' };
  }
  
  if (parsed.action === 'install') {
    if (parsed.packages.length === 0) {
      // npm install - install all from package.json
      return installAllDependencies(onProgress);
    } else {
      // npm install <packages>
      return installPackages(parsed.packages, parsed.isDev, onProgress);
    }
  } else {
    // npm uninstall
    return uninstallPackages(parsed.packages, onProgress);
  }
}
