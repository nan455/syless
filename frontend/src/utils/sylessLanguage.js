/**
 * Monaco Editor language registration for SYLESS
 */

export const SYLESS_LANGUAGE_ID = 'syless';

export const SYLESS_TOKENS = {
  keywords: [
    'say', 'show', 'make', 'ask', 'check', 'otherwise', 'also', 'loop', 'times',
    'repeat', 'while', 'task', 'give', 'for', 'each', 'in',
    'push', 'into', 'pop', 'from', 'insert', 'remove', 'add',
    'sort', 'ascending', 'descending', 'binary', 'search',
    'connect', 'to', 'and', 'or', 'not', 'true', 'false', 'null', 'nothing',
    'length', 'upper', 'lower', 'round', 'absolute', 'of',
  ],
  operators: ['->', '=', '+', '-', '*', '/', '%', '**', '==', '!=', '<', '>', '<=', '>=', '+=', '-=', '*=', '/='],
};

export function registerSylessLanguage(monaco) {
  monaco.languages.register({ id: SYLESS_LANGUAGE_ID });

  monaco.languages.setMonarchTokensProvider(SYLESS_LANGUAGE_ID, {
    keywords: SYLESS_TOKENS.keywords,
    tokenizer: {
      root: [
        // Comments
        [/#.*$/, 'comment'],

        // Strings
        [/"([^"\\]|\\.)*"/, 'string'],
        [/'([^'\\]|\\.)*'/, 'string'],

        // Numbers
        [/\d+(\.\d+)?/, 'number'],

        // Operators
        [/->/, 'operator'],
        [/[+\-*\/]=/, 'operator'],  // +=, -=, *=, /=
        [/\*\*/, 'operator'],
        [/[=+\-*/%<>!]=?/, 'operator'],

        // Brackets
        [/[{}()\[\]]/, 'delimiter'],

        // Keywords and identifiers
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier',
          },
        }],

        // Whitespace
        [/\s+/, 'white'],
      ],
    },
  });

  monaco.languages.setLanguageConfiguration(SYLESS_LANGUAGE_ID, {
    comments: { lineComment: '#' },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
    indentationRules: {
      increaseIndentPattern: /\{[^}]*$/,
      decreaseIndentPattern: /^\s*\}/,
    },
  });

  monaco.editor.defineTheme('syless-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'bf5af2', fontStyle: 'bold' },
      { token: 'string', foreground: 'ff9f0a' },
      { token: 'number', foreground: '39ff14' },
      { token: 'identifier', foreground: '00d4ff' },
      { token: 'operator', foreground: 'ff2d78' },
      { token: 'comment', foreground: '636e7b', fontStyle: 'italic' },
      { token: 'delimiter', foreground: 'e6e6e6' },
    ],
    colors: {
      'editor.background': '#090c10',
      'editor.foreground': '#e6e6e6',
      'editor.lineHighlightBackground': '#ffffff08',
      'editor.selectionBackground': '#6366f130',
      'editor.inactiveSelectionBackground': '#6366f118',
      'editorLineNumber.foreground': '#3a4050',
      'editorLineNumber.activeForeground': '#6366f1',
      'editorCursor.foreground': '#6366f1',
      'editorGutter.background': '#090c10',
      'scrollbarSlider.background': '#6366f120',
      'scrollbarSlider.hoverBackground': '#6366f140',
    },
  });

  // Autocomplete provider
  monaco.languages.registerCompletionItemProvider(SYLESS_LANGUAGE_ID, {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        {
          label: 'say',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'say -> "${1:Hello World}"',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Print output to console',
          range,
        },
        {
          label: 'show',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'show "${1:Hello World}"',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Print output (no arrow needed)',
          range,
        },
        {
          label: 'make',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'make ${1:varName} = ${2:value}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Declare a variable',
          range,
        },
        {
          label: 'ask',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'ask ${1:name} -> "${2:Enter value: }"',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Get input from user',
          range,
        },
        {
          label: 'check',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'check ${1:condition} {\n    ${2:say -> "true"}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'If statement',
          range,
        },
        {
          label: 'also check',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'also check ${1:condition} {\n    ${2:say -> "branch"}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Else-if branch (chained after check)',
          range,
        },
        {
          label: 'loop',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'loop ${1:5} times {\n    ${2:say -> "Hello"}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Repeat N times',
          range,
        },
        {
          label: 'repeat N times',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'repeat ${1:5} times {\n    ${2:show "Hello"}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Repeat N times (alternate syntax)',
          range,
        },
        {
          label: 'loop i from X to Y',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'loop ${1:i} from ${2:1} to ${3:10} {\n    show ${1:i}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Range loop — counter goes from X to Y inclusive',
          range,
        },
        {
          label: 'repeat while',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'repeat while ${1:x < 10} {\n    ${2:say -> x}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'While loop',
          range,
        },
        {
          label: 'task',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'task ${1:myFunction}(${2:param}) {\n    ${3:give param}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define a function',
          range,
        },
        {
          label: 'task (with default param)',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'task ${1:myFunction}(${2:param}, ${3:optional} = ${4:"default"}) {\n    ${5:show param}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Function with a default parameter value',
          range,
        },
        {
          label: 'length of',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'length of ${1:myList}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Get length of string or array',
          range,
        },
        {
          label: 'upper of',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'upper of ${1:myString}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Convert string to uppercase',
          range,
        },
        {
          label: 'lower of',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'lower of ${1:myString}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Convert string to lowercase',
          range,
        },
        {
          label: 'round of',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'round of ${1:number}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Round a number to the nearest integer',
          range,
        },
        {
          label: 'absolute of',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'absolute of ${1:number}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Absolute value (removes negative sign)',
          range,
        },
        {
          label: 'for each',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'for each ${1:item} in ${2:items} {\n    ${3:say -> item}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'For-each loop',
          range,
        },
        {
          label: 'push into',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'push ${1:value} into ${2:stack}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Push to stack',
          range,
        },
        {
          label: 'sort ascending',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'sort ${1:arr} ascending',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Sort array in ascending order',
          range,
        },
        {
          label: 'binary search',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'binary search ${1:target} in ${2:arr}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Binary search in sorted array',
          range,
        },
      ];

      return { suggestions };
    },
  });
}
