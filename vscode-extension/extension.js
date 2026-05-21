'use strict';

const vscode = require('vscode');
const path   = require('path');

function activate(context) {
  const cliPath = path.join(context.extensionPath, 'cli', 'bin', 'syless.js');

  const runCmd = vscode.commands.registerCommand('syless.runFile', () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage('Open a .sy file first.');
      return;
    }

    const filePath = editor.document.fileName;
    if (!filePath.endsWith('.sy')) {
      vscode.window.showErrorMessage('This is not a .sy file.');
      return;
    }

    editor.document.save().then(() => {
      let terminal = vscode.window.terminals.find(t => t.name === 'SYLESS');
      if (!terminal) {
        terminal = vscode.window.createTerminal('SYLESS');
      }
      terminal.show(true);
      terminal.sendText(`node "${cliPath}" run "${filePath}"`);
    });
  });

  context.subscriptions.push(runCmd);
}

function deactivate() {}

module.exports = { activate, deactivate };
