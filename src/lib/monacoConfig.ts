// Enhanced Monaco Editor configuration for multiple languages with intellisense
export function configureMonacoEditor(monacoInstance: any) {
  // JavaScript & TypeScript Configuration
  monacoInstance.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monacoInstance.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monacoInstance.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monacoInstance.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monacoInstance.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monacoInstance.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types'],
  });

  monacoInstance.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monacoInstance.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monacoInstance.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monacoInstance.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monacoInstance.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    typeRoots: ['node_modules/@types'],
  });

  // Add common libraries
  addCommonLibraries(monacoInstance);

  // Configure JSON schema validation
  monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [
      {
        uri: 'http://json-schema.org/draft-07/schema#',
        fileMatch: ['*.json'],
        schema: {
          type: 'object',
        },
      },
      {
        uri: 'http://json.schemastore.org/package',
        fileMatch: ['package.json'],
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            version: { type: 'string' },
            dependencies: { type: 'object' },
            devDependencies: { type: 'object' },
          },
        },
      },
    ],
  });

  // HTML configuration
  monacoInstance.languages.html.htmlDefaults.setOptions({
    format: {
      tabSize: 2,
      insertSpaces: true,
      wrapLineLength: 120,
      unformatted: 'wbr',
      contentUnformatted: 'pre,code,textarea',
      indentInnerHtml: false,
      preserveNewLines: true,
      maxPreserveNewLines: null,
      indentHandlebars: false,
      endWithNewline: false,
      extraLiners: 'head, body, /html',
      wrapAttributes: 'auto',
    },
    suggest: {
      html5: true,
    },
  });

  // CSS configuration
  monacoInstance.languages.css.cssDefaults.setOptions({
    validate: true,
    lint: {
      compatibleVendorPrefixes: 'warning',
      vendorPrefix: 'warning',
      duplicateProperties: 'warning',
      emptyRules: 'warning',
      importStatement: 'ignore',
      boxModel: 'ignore',
      universalSelector: 'ignore',
      zeroUnits: 'ignore',
      fontFaceProperties: 'warning',
      hexColorLength: 'error',
      argumentsInColorFunction: 'error',
      unknownProperties: 'warning',
      ieHack: 'ignore',
      unknownVendorSpecificProperties: 'ignore',
      propertyIgnoredDueToDisplay: 'warning',
      important: 'ignore',
      float: 'ignore',
      idSelector: 'ignore',
    },
  });

  // Python snippets and autocomplete
  monacoInstance.languages.registerCompletionItemProvider('python', {
    provideCompletionItems: () => {
      const suggestions = [
        {
          label: 'print',
          kind: monacoInstance.languages.CompletionItemKind.Function,
          insertText: 'print(${1:value})',
          insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Print to console',
        },
        {
          label: 'def',
          kind: monacoInstance.languages.CompletionItemKind.Keyword,
          insertText: 'def ${1:function_name}(${2:params}):\n    ${3:pass}',
          insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define a function',
        },
        {
          label: 'class',
          kind: monacoInstance.languages.CompletionItemKind.Keyword,
          insertText: 'class ${1:ClassName}:\n    def __init__(self${2:, params}):\n        ${3:pass}',
          insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define a class',
        },
        {
          label: 'if',
          kind: monacoInstance.languages.CompletionItemKind.Keyword,
          insertText: 'if ${1:condition}:\n    ${2:pass}',
          insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'If statement',
        },
        {
          label: 'for',
          kind: monacoInstance.languages.CompletionItemKind.Keyword,
          insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}',
          insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'For loop',
        },
        {
          label: 'while',
          kind: monacoInstance.languages.CompletionItemKind.Keyword,
          insertText: 'while ${1:condition}:\n    ${2:pass}',
          insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'While loop',
        },
        {
          label: 'try',
          kind: monacoInstance.languages.CompletionItemKind.Keyword,
          insertText: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}',
          insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Try-except block',
        },
      ];
      return { suggestions };
    },
  });

  // JavaScript/TypeScript snippets
  const jsSnippets = [
    {
      label: 'log',
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: 'console.log(${1:value});',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Console log',
    },
    {
      label: 'func',
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: 'function ${1:name}(${2:params}) {\n    ${3:// code}\n}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Function declaration',
    },
    {
      label: 'afunc',
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: 'async function ${1:name}(${2:params}) {\n    ${3:// code}\n}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Async function',
    },
    {
      label: 'arrow',
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: 'const ${1:name} = (${2:params}) => {\n    ${3:// code}\n};',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Arrow function',
    },
    {
      label: 'class',
      kind: monacoInstance.languages.CompletionItemKind.Snippet,
      insertText: 'class ${1:ClassName} {\n    constructor(${2:params}) {\n        ${3:// code}\n    }\n}',
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: 'Class declaration',
    },
  ];

  monacoInstance.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: () => ({ suggestions: jsSnippets }),
  });

  monacoInstance.languages.registerCompletionItemProvider('typescript', {
    provideCompletionItems: () => ({ suggestions: jsSnippets }),
  });
}

function addCommonLibraries(monacoInstance: any) {
  // Add React types
  monacoInstance.languages.typescript.javascriptDefaults.addExtraLib(
    `
    declare namespace React {
      function useState<T>(initialState: T | (() => T)): [T, (value: T) => void];
      function useEffect(effect: () => void | (() => void), deps?: any[]): void;
      function useCallback<T extends Function>(callback: T, deps: any[]): T;
      function useMemo<T>(factory: () => T, deps: any[]): T;
      function useRef<T>(initialValue: T): { current: T };
      function useContext<T>(context: Context<T>): T;
      interface Context<T> { Provider: any; Consumer: any; }
      function createContext<T>(defaultValue: T): Context<T>;
    }
    `,
    'ts:react.d.ts'
  );

  // Add Node.js types
  monacoInstance.languages.typescript.javascriptDefaults.addExtraLib(
    `
    declare const console: {
      log(...args: any[]): void;
      error(...args: any[]): void;
      warn(...args: any[]): void;
      info(...args: any[]): void;
      debug(...args: any[]): void;
    };
    declare const setTimeout: (handler: () => void, timeout: number) => number;
    declare const setInterval: (handler: () => void, timeout: number) => number;
    declare const clearTimeout: (id: number) => void;
    declare const clearInterval: (id: number) => void;
    declare const fetch: (url: string, options?: any) => Promise<Response>;
    interface Response {
      json(): Promise<any>;
      text(): Promise<string>;
      blob(): Promise<Blob>;
      ok: boolean;
      status: number;
    }
    `,
    'ts:globals.d.ts'
  );

  // Add DOM types
  monacoInstance.languages.typescript.javascriptDefaults.addExtraLib(
    `
    declare const document: Document;
    declare const window: Window;
    interface Document {
      querySelector(selector: string): Element | null;
      querySelectorAll(selector: string): NodeList;
      getElementById(id: string): HTMLElement | null;
      createElement(tag: string): HTMLElement;
    }
    interface Window {
      addEventListener(event: string, handler: Function): void;
      removeEventListener(event: string, handler: Function): void;
    }
    `,
    'ts:dom.d.ts'
  );
}

// Editor options configuration
export const editorOptions = {
  fontSize: 14,
  lineNumbers: 'on' as const,
  minimap: { enabled: true },
  automaticLayout: true,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  tabSize: 2,
  insertSpaces: true,
  formatOnPaste: true,
  formatOnType: true,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on' as const,
  quickSuggestions: {
    other: true,
    comments: false,
    strings: true,
  },
  parameterHints: {
    enabled: true,
  },
  suggest: {
    showMethods: true,
    showFunctions: true,
    showConstructors: true,
    showFields: true,
    showVariables: true,
    showClasses: true,
    showStructs: true,
    showInterfaces: true,
    showModules: true,
    showProperties: true,
    showEvents: true,
    showOperators: true,
    showUnits: true,
    showValues: true,
    showConstants: true,
    showEnums: true,
    showEnumMembers: true,
    showKeywords: true,
    showWords: true,
    showColors: true,
    showFiles: true,
    showReferences: true,
    showFolders: true,
    showTypeParameters: true,
    showSnippets: true,
  },
};
