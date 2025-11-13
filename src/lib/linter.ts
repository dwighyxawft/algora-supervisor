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
