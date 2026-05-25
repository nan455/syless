'use strict';

const vscode = require('vscode');
const path   = require('path');
const { compile } = require('./cli/src/compiler/index');

// ---------------------------------------------------------------------------
// Hover documentation map
// ---------------------------------------------------------------------------
const HOVER_DOCS = {
  say:      { sig: 'say -> expression',                          desc: 'Print a value to output.',                                    ex: 'say -> "Hello World"\nsay -> myVariable\nsay -> x + y' },
  show:     { sig: 'show expression',                           desc: 'Print a value — no arrow needed.',                            ex: 'show "Hello"\nshow myVariable\nshow 42' },
  make:     { sig: 'make name = value',                         desc: 'Create a variable.',                                          ex: 'make x = 10\nmake name = "Alice"\nmake items = [1, 2, 3]' },
  ask:      { sig: 'ask name -> "prompt"',                      desc: 'Ask the user for input and store it in a variable.',          ex: 'ask name -> "Enter your name: "\nsay -> name' },
  check:    { sig: 'check condition { ... }',                   desc: 'If statement — runs the block when condition is true.',       ex: 'check x > 5 {\n    say -> "big"\n} otherwise {\n    say -> "small"\n}' },
  also:     { sig: '} also check condition { ... }',            desc: 'Else-if branch — checked when the previous check is false.',  ex: 'check x > 10 {\n    say -> "large"\n} also check x > 0 {\n    say -> "positive"\n} otherwise {\n    say -> "negative"\n}' },
  otherwise:{ sig: '} otherwise { ... }',                       desc: 'Else branch — runs when no check above was true.',            ex: 'check x > 5 {\n    say -> "big"\n} otherwise {\n    say -> "small"\n}' },
  loop:     { sig: 'loop N times { ... }',                      desc: 'Repeat a block exactly N times.',                            ex: 'loop 5 times {\n    say -> "hello"\n}' },
  repeat:   { sig: 'repeat while condition { ... }',            desc: 'While loop — keeps repeating while condition is true.',       ex: 'make i = 0\nrepeat while i < 10 {\n    i += 1\n}\nshow i' },
  for:      { sig: 'for each item in list { ... }',             desc: 'Loop over every item in a list.',                            ex: 'make fruits = ["apple", "banana", "cherry"]\nfor each fruit in fruits {\n    say -> fruit\n}' },
  task:     { sig: 'task name(param1, param2) { ... }',         desc: 'Define a reusable block of code (function).',                ex: 'task greet(name) {\n    say -> "Hello " + name\n}\ngreet("Alice")' },
  give:     { sig: 'give value',                                desc: 'Return a value from inside a task.',                         ex: 'task double(n) {\n    give n * 2\n}\nmake result = double(5)' },
  length:   { sig: 'length of value',                           desc: 'Get the number of items in a list or characters in a string.',ex: 'make n = length of "hello"   # 5\nmake size = length of myList' },
  upper:    { sig: 'upper of string',                           desc: 'Convert a string to ALL UPPERCASE.',                         ex: 'say -> upper of "hello"   # HELLO' },
  lower:    { sig: 'lower of string',                           desc: 'Convert a string to all lowercase.',                         ex: 'say -> lower of "HELLO"   # hello' },
  round:    { sig: 'round of number',                           desc: 'Round a number to the nearest whole number.',                ex: 'say -> round of 3.7   # 4\nsay -> round of 2.3   # 2' },
  absolute: { sig: 'absolute of number',                        desc: 'Get the absolute (positive) value of a number.',             ex: 'say -> absolute of -5   # 5\nsay -> absolute of 3    # 3' },
  push:     { sig: 'push value into stackName',                 desc: 'Push a value onto the top of a stack.',                      ex: 'make myStack\npush 42 into myStack\npush 99 into myStack' },
  pop:      { sig: 'pop from stackName',                        desc: 'Remove and discard the top value of a stack.',               ex: 'pop from myStack' },
  insert:   { sig: 'insert value into queueName',               desc: 'Add a value to the back of a queue.',                        ex: 'make myQueue\ninsert "Alice" into myQueue\ninsert "Bob" into myQueue' },
  remove:   { sig: 'remove from queueName',                     desc: 'Remove the front value from a queue.',                       ex: 'remove from myQueue' },
  sort:     { sig: 'sort arrayName ascending|descending',       desc: 'Sort an array in place.',                                    ex: 'make nums = [3, 1, 4, 1, 5]\nsort nums ascending\nsort nums descending' },
  connect:  { sig: 'connect nodeA to nodeB',                    desc: 'Add an edge between two nodes in a graph.',                  ex: 'connect A to B\nconnect B to C\nconnect A to C' },
  train:    { sig: 'train "model" on data with labels as name', desc: 'Train an ML model. Supported: knn, tree, forest, linear, logistic, bayes, svm.', ex: 'load "iris" as data\ntrain "knn" on data with data as myModel' },
  predict:  { sig: 'predict modelName -> input',                desc: 'Make a prediction using a trained ML model.',                ex: 'predict myModel -> [5.1, 3.5, 1.4, 0.2]' },
  evaluate: { sig: 'evaluate modelName on data with labels',    desc: 'Evaluate model accuracy and print it.',                      ex: 'evaluate myModel on testData with testLabels' },
  load:     { sig: 'load "dataset" as name',                    desc: 'Load a built-in dataset. Options: iris, digits, wine, cancer.', ex: 'load "iris" as dataset\nshow dataset' },
  'binary search': { sig: 'binary search value in arrayName',   desc: 'Search for a value in a sorted array and print the index.', ex: 'make nums = [1, 3, 5, 7, 9]\nbinary search 5 in nums' },
};

const ALL_KEYWORDS = [
  'say', 'show', 'make', 'ask', 'check', 'also', 'otherwise', 'loop', 'times',
  'repeat', 'while', 'for', 'each', 'in', 'task', 'give', 'length', 'upper',
  'lower', 'round', 'absolute', 'of', 'and', 'or', 'not', 'true', 'false', 'null',
  'push', 'pop', 'into', 'from', 'insert', 'remove', 'add', 'sort', 'ascending',
  'descending', 'binary', 'search', 'connect', 'to', 'train', 'predict',
  'evaluate', 'load', 'on', 'with', 'as',
];

// ---------------------------------------------------------------------------
// Activate
// ---------------------------------------------------------------------------
function activate(context) {
  const cliPath    = path.join(context.extensionPath, 'cli', 'bin', 'syless.js');
  const diagnostics = vscode.languages.createDiagnosticCollection('syless');
  context.subscriptions.push(diagnostics);

  // ── Run command ─────────────────────────────────────────────────────────
  const runCmd = vscode.commands.registerCommand('syless.runFile', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { vscode.window.showErrorMessage('Open a .sy file first.'); return; }
    const filePath = editor.document.fileName;
    if (!filePath.endsWith('.sy')) { vscode.window.showErrorMessage('This is not a .sy file.'); return; }
    editor.document.save().then(() => {
      let terminal = vscode.window.terminals.find(t => t.name === 'SYLESS');
      if (!terminal) terminal = vscode.window.createTerminal('SYLESS');
      terminal.show(true);
      terminal.sendText(`node "${cliPath}" run "${filePath}"`);
    });
  });

  // ── Inline diagnostics ──────────────────────────────────────────────────
  function validateDocument(doc) {
    if (doc.languageId !== 'syless') return;
    const source = doc.getText();
    if (!source.trim()) { diagnostics.set(doc.uri, []); return; }
    try {
      const result = compile(source);
      if (result.success) {
        diagnostics.set(doc.uri, []);
      } else {
        const lineNum = Math.max(0, (result.line || 1) - 1);
        const lineText = doc.lineAt(Math.min(lineNum, doc.lineCount - 1));
        const range = new vscode.Range(lineNum, 0, lineNum, lineText.text.length || 999);
        const diag = new vscode.Diagnostic(range, result.error, vscode.DiagnosticSeverity.Error);
        diag.source = 'SYLESS';
        diagnostics.set(doc.uri, [diag]);
      }
    } catch (_) {
      diagnostics.set(doc.uri, []);
    }
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(e => validateDocument(e.document)),
    vscode.workspace.onDidOpenTextDocument(validateDocument),
    vscode.workspace.onDidSaveTextDocument(validateDocument),
    vscode.window.onDidChangeActiveTextEditor(e => e && validateDocument(e.document)),
  );
  if (vscode.window.activeTextEditor) validateDocument(vscode.window.activeTextEditor.document);

  // ── Hover documentation ─────────────────────────────────────────────────
  const hoverProvider = vscode.languages.registerHoverProvider('syless', {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);
      if (!range) return null;
      const word = document.getText(range).toLowerCase();
      const doc  = HOVER_DOCS[word];
      if (!doc) return null;
      const md = new vscode.MarkdownString();
      md.appendCodeblock(doc.sig, 'syless');
      md.appendMarkdown(`\n${doc.desc}\n\n**Example:**\n`);
      md.appendCodeblock(doc.ex, 'syless');
      return new vscode.Hover(md);
    },
  });

  // ── IntelliSense completions ────────────────────────────────────────────
  const completionProvider = vscode.languages.registerCompletionItemProvider('syless', {
    provideCompletionItems(document, position) {
      const items = [];

      // Keyword completions
      for (const kw of ALL_KEYWORDS) {
        const item = new vscode.CompletionItem(kw, vscode.CompletionItemKind.Keyword);
        if (HOVER_DOCS[kw]) {
          item.detail        = HOVER_DOCS[kw].sig;
          item.documentation = new vscode.MarkdownString(HOVER_DOCS[kw].desc);
        }
        items.push(item);
      }

      // User-defined tasks (functions)
      const text      = document.getText();
      const taskRegex = /\btask\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/g;
      let m;
      while ((m = taskRegex.exec(text)) !== null) {
        const item         = new vscode.CompletionItem(m[1], vscode.CompletionItemKind.Function);
        item.detail        = `task ${m[1]}(${m[2]})`;
        item.documentation = new vscode.MarkdownString('User-defined task');
        item.insertText    = new vscode.SnippetString(`${m[1]}($1)`);
        items.push(item);
      }

      // User-defined variables
      const varRegex = /\bmake\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
      while ((m = varRegex.exec(text)) !== null) {
        const item  = new vscode.CompletionItem(m[1], vscode.CompletionItemKind.Variable);
        item.detail = 'variable';
        items.push(item);
      }

      // User-defined ask inputs
      const askRegex = /\bask\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
      while ((m = askRegex.exec(text)) !== null) {
        const item  = new vscode.CompletionItem(m[1], vscode.CompletionItemKind.Variable);
        item.detail = 'input variable';
        items.push(item);
      }

      return items;
    },
  });

  // ── Status bar shortcut ─────────────────────────────────────────────────
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.command = 'syless.runFile';
  statusBar.text    = '$(play) Run SYLESS';
  statusBar.tooltip = 'Run current .sy file (F5)';
  context.subscriptions.push(statusBar);

  function updateStatusBar() {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'syless') {
      statusBar.show();
    } else {
      statusBar.hide();
    }
  }
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBar));
  updateStatusBar();

  context.subscriptions.push(runCmd, hoverProvider, completionProvider);
}

function deactivate() {}

module.exports = { activate, deactivate };
