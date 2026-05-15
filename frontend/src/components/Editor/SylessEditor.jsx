import React, { useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import useStore from '@store/useStore';
import { registerSylessLanguage, SYLESS_LANGUAGE_ID } from '@utils/sylessLanguage';

const EDITOR_OPTIONS = {
  fontSize: 14,
  fontFamily: '"JetBrains Mono", "Fira Code", Cascadia Code, monospace',
  fontLigatures: true,
  lineNumbers: 'on',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  automaticLayout: true,
  tabSize: 4,
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  renderLineHighlight: 'line',
  bracketPairColorization: { enabled: true },
  guides: {
    bracketPairs: true,
    indentation: true,
  },
  suggest: {
    showKeywords: true,
    showSnippets: true,
    insertMode: 'replace',
  },
  padding: { top: 16, bottom: 16 },
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
  glyphMargin: false,
  folding: true,
  lineDecorationsWidth: 10,
  overviewRulerBorder: false,
};

export default function SylessEditor({ onRun }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const { editorCode, setEditorCode, fontSize } = useStore();

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register SYLESS language
    registerSylessLanguage(monaco);
    monaco.editor.setTheme('syless-dark');
    editor.setModel(monaco.editor.createModel(editorCode, SYLESS_LANGUAGE_ID));

    // Keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun?.();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {
      editor.trigger('keyboard', 'editor.action.formatDocument', null);
    });

    // Auto-format on close brace
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      setEditorCode(value);
    });

    // Focus editor
    editor.focus();
  }, []);

  // Sync font size from store
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  return (
    <div className="h-full w-full relative">
      <Editor
        height="100%"
        language={SYLESS_LANGUAGE_ID}
        defaultValue={editorCode}
        theme="syless-dark"
        options={{ ...EDITOR_OPTIONS, fontSize }}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="animate-pulse">Loading editor...</div>
          </div>
        }
      />
    </div>
  );
}
