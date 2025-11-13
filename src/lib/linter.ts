export function configureLinting(monaco: any) {
  // Configure TypeScript/JavaScript compiler options
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    checkJs: false,
    strict: false,
  });

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    checkJs: false,
  });

  // Configure diagnostics options
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  // Add extra libraries for common globals
  const globalLibs = `
    declare const console: {
      log(...args: any[]): void;
      error(...args: any[]): void;
      warn(...args: any[]): void;
      info(...args: any[]): void;
    };
    declare const process: any;
    declare const require: any;
    declare const module: any;
    declare const exports: any;
  `;

  monaco.languages.typescript.typescriptDefaults.addExtraLib(globalLibs, 'globals.d.ts');
  monaco.languages.typescript.javascriptDefaults.addExtraLib(globalLibs, 'globals.d.ts');
}

export function enableLinting(editor: any, monaco: any) {
  // Monaco automatically shows diagnostics for TypeScript/JavaScript
  // We can customize the markers appearance
  const model = editor.getModel();
  if (!model) return;

  // Listen to marker changes
  monaco.editor.onDidChangeMarkers((uris) => {
    const modelUri = model.uri;
    if (uris.some(uri => uri.toString() === modelUri.toString())) {
      const markers = monaco.editor.getModelMarkers({ resource: modelUri });
      
      // Optionally, you can process markers here for custom handling
      // For now, Monaco handles displaying them automatically
      console.log('Diagnostics updated:', markers.length, 'issues found');
    }
  });
}

export function configureImportIntellisense(monaco: any, files: any[]) {
  // Flatten the file tree to get all file paths
  const flattenFiles = (nodes: any[]): string[] => {
    const paths: string[] = [];
    for (const node of nodes) {
      if (node.type === 'file') {
        paths.push(node.path);
      }
      if (node.children) {
        paths.push(...flattenFiles(node.children));
      }
    }
    return paths;
  };

  const allPaths = flattenFiles(files);

  // Register completion item provider for import paths
  monaco.languages.registerCompletionItemProvider('typescript', {
    triggerCharacters: ['"', "'", '/'],
    provideCompletionItems: (model: any, position: any) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // Check if we're in an import statement
      const importMatch = textUntilPosition.match(/(?:import|from|require\()\s*['"](.*?)$/);
      if (!importMatch) return { suggestions: [] };

      const currentPath = model.uri.path;
      const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
      const typedPath = importMatch[1];

      const suggestions = allPaths
        .filter(path => path !== currentPath)
        .map(path => {
          let relativePath = path;
          if (typedPath.startsWith('.')) {
            // Calculate relative path from current file
            relativePath = getRelativePath(currentDir, path);
          } else {
            // Absolute path from workspace
            relativePath = path.replace('/workspace/', '');
          }

          return {
            label: relativePath,
            kind: monaco.languages.CompletionItemKind.File,
            insertText: relativePath,
            detail: path,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column - typedPath.length,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          };
        });

      return { suggestions };
    },
  });

  // Also register for JavaScript
  monaco.languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['"', "'", '/'],
    provideCompletionItems: (model: any, position: any) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const importMatch = textUntilPosition.match(/(?:import|from|require\()\s*['"](.*?)$/);
      if (!importMatch) return { suggestions: [] };

      const currentPath = model.uri.path;
      const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
      const typedPath = importMatch[1];

      const suggestions = allPaths
        .filter(path => path !== currentPath)
        .map(path => {
          let relativePath = path;
          if (typedPath.startsWith('.')) {
            relativePath = getRelativePath(currentDir, path);
          } else {
            relativePath = path.replace('/workspace/', '');
          }

          return {
            label: relativePath,
            kind: monaco.languages.CompletionItemKind.File,
            insertText: relativePath,
            detail: path,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column - typedPath.length,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          };
        });

      return { suggestions };
    },
  });
}

function getRelativePath(from: string, to: string): string {
  const fromParts = from.split('/').filter(Boolean);
  const toParts = to.split('/').filter(Boolean);

  // Find common base
  let commonLength = 0;
  while (commonLength < fromParts.length && 
         commonLength < toParts.length && 
         fromParts[commonLength] === toParts[commonLength]) {
    commonLength++;
  }

  // Go up from 'from' directory
  const upCount = fromParts.length - commonLength;
  const upPath = '../'.repeat(upCount);

  // Go down to 'to' file
  const downPath = toParts.slice(commonLength).join('/');

  const result = upPath + downPath;
  return result.startsWith('.') ? result : './' + result;
}
