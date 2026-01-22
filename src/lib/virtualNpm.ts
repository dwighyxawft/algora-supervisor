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
      const pkg = JSON.parse(content);
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

// Fetch package info from npm registry
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
    
    const response = await fetch(`https://registry.npmjs.org/${name}/${requestedVersion}`);
    if (!response.ok) {
      // Try fetching latest if specific version fails
      const latestResponse = await fetch(`https://registry.npmjs.org/${name}/latest`);
      if (!latestResponse.ok) return null;
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
    console.error(`Failed to fetch package info for ${packageName}:`, error);
    return null;
  }
}

// Create stub files for a package
function createPackageStub(fs: any, packageInfo: NpmPackageInfo) {
  const basePath = `/workspace/node_modules/${packageInfo.name}`;
  
  // Ensure directory exists
  ensureDirRecursive(fs, basePath);
  
  // Create package.json
  const packageJson = {
    name: packageInfo.name,
    version: packageInfo.version,
    description: packageInfo.description || `Virtual stub for ${packageInfo.name}`,
    main: packageInfo.main || 'index.js',
    types: packageInfo.types || 'index.d.ts'
  };
  fs.writeFileSync(`${basePath}/package.json`, JSON.stringify(packageJson, null, 2), 'utf8');
  
  // Create main entry file
  const mainFile = packageInfo.main || 'index.js';
  const mainContent = `// Virtual stub for ${packageInfo.name}@${packageInfo.version}
// This is a placeholder for editor IntelliSense support
module.exports = {};
`;
  fs.writeFileSync(`${basePath}/${mainFile}`, mainContent, 'utf8');
  
  // Create TypeScript declaration file
  const dtsContent = `// Type definitions for ${packageInfo.name}@${packageInfo.version}
// This is a placeholder for TypeScript IntelliSense support

declare module '${packageInfo.name}' {
  const content: any;
  export default content;
  export = content;
}
`;
  fs.writeFileSync(`${basePath}/index.d.ts`, dtsContent, 'utf8');
}

// Ensure directory exists recursively
function ensureDirRecursive(fs: any, dirPath: string) {
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

// Read package.json
function readPackageJson(fs: any): any {
  try {
    const content = fs.readFileSync('/workspace/package.json', 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Write package.json
function writePackageJson(fs: any, pkg: any) {
  fs.writeFileSync('/workspace/package.json', JSON.stringify(pkg, null, 2), 'utf8');
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
  ensureDirRecursive(fs, '/workspace/node_modules');
  
  const installed: string[] = [];
  const failed: string[] = [];
  
  for (const dep of depNames) {
    const version = allDeps[dep];
    onProgress?.(`Installing ${dep}@${version}...`);
    
    try {
      const info = await fetchPackageInfo(`${dep}@${version.replace(/^[\^~]/, '')}`);
      if (info) {
        createPackageStub(fs, info);
        installed.push(`${info.name}@${info.version}`);
      } else {
        // Create a basic stub even if fetch fails
        createPackageStub(fs, {
          name: dep,
          version: version.replace(/^[\^~]/, '') || '1.0.0',
          main: 'index.js'
        });
        installed.push(`${dep}@${version}`);
      }
    } catch (error) {
      failed.push(dep);
      onProgress?.(`Failed to install ${dep}`);
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
  ensureDirRecursive(fs, '/workspace/node_modules');
  
  const installed: string[] = [];
  const failed: string[] = [];
  
  for (const packageName of packages) {
    onProgress?.(`Fetching ${packageName}...`);
    
    try {
      const info = await fetchPackageInfo(packageName);
      if (info) {
        createPackageStub(fs, info);
        installed.push(`${info.name}@${info.version}`);
        
        // Update package.json
        const depKey = isDev ? 'devDependencies' : 'dependencies';
        if (!pkg[depKey]) pkg[depKey] = {};
        pkg[depKey][info.name] = `^${info.version}`;
      } else {
        failed.push(packageName);
        onProgress?.(`Package not found: ${packageName}`);
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
        onProgress?.(`Package not found: ${packageName}`);
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
