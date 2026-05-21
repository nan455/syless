'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Split from 'react-split';
import useStore, { API } from '@store/useStore';
import toast from 'react-hot-toast';
import {
  Play, Square, Settings, ChevronDown,
  Type, Bot, Download, Code2, EyeOff, Plus, X,
} from 'lucide-react';

import SylessEditor from '@components/Editor/SylessEditor';
import OutputPanel from '@components/Terminal/OutputPanel';
import AIPanel from '@components/AIPanel/AIPanel';
import Sidebar from '@components/Sidebar/Sidebar';

const SAMPLE_PROGRAMS = [
  {
    label: 'Hello World',
    code: `show "Hello, World!"

make name = "SYLESS"
show "Welcome to {name}!"`,
  },
  {
    label: 'Variables',
    code: `make name = "SYLESS"
make age = 20
make score = 0

# compound assignment
score += 50
score += 25
show "Name: {name}, Age: {age}, Score: {score}"`,
  },
  {
    label: 'If / Else',
    code: `make score = 75

check score >= 90 {
    show "Grade: A"
} also check score >= 80 {
    show "Grade: B"
} also check score >= 70 {
    show "Grade: C"
} otherwise {
    show "Grade: F"
}`,
  },
  {
    label: 'Loop',
    code: `# repeat N times
repeat 5 times {
    show "SYLESS is awesome!"
}

# range loop with counter
loop i from 1 to 5 {
    show "Count: {i}"
}

# while loop with compound assignment
make total = 0
make i = 1
repeat while i <= 10 {
    total += i
    i += 1
}
show "Sum 1 to 10 = {total}"`,
  },
  {
    label: 'For Each',
    code: `make fruits = ["apple", "mango", "banana", "cherry"]

for each fruit in fruits {
    show "Fruit: {fruit} (length: {length of fruit})"
}`,
  },
  {
    label: 'Function',
    code: `task greet(name, msg = "Hello") {
    show "{msg}, {name}!"
}

task add(a, b) {
    give a + b
}

greet("World")
greet("SYLESS", "Welcome to")
show add(10, 20)`,
  },
  {
    label: 'Stack DSA',
    code: `make myStack

push 10 into myStack
push 20 into myStack
push 30 into myStack

say -> myStack

pop from myStack
say -> myStack`,
  },
  {
    label: 'Queue DSA',
    code: `make taskQueue

insert "first" into taskQueue
insert "second" into taskQueue
insert "third" into taskQueue

say -> taskQueue

remove from taskQueue
say -> taskQueue`,
  },
  {
    label: 'Recursion',
    code: `task factorial(n) {
    check n <= 1 {
        give 1
    }
    give n * factorial(n - 1)
}

task fib(n) {
    check n <= 1 { give n }
    give fib(n - 1) + fib(n - 2)
}

say -> factorial(5)
say -> fib(10)`,
  },
  {
    label: 'Sort & Search',
    code: `make nums = [64, 34, 25, 12, 22, 11, 90]

sort nums ascending
say -> nums

binary search 25 in nums`,
  },
  {
    label: 'Graph',
    code: `connect A to B
connect B to C
connect C to D
connect A to D

say -> "Graph connected!"`,
  },
];

// Simple Python syntax highlighter (no dependency)
function PythonLine({ line }) {
  const parts = [];
  // Tokenise naively — enough for display
  const str = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // keywords
  const highlighted = str
    .replace(/\b(def|return|if|else|elif|for|while|in|range|print|input|True|False|None|and|or|not|pass|from|import|class)\b/g,
      '<span class="py-kw">$1</span>')
    .replace(/(""".*?"""|"[^"]*"|'[^']*')/g, '<span class="py-str">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="py-num">$1</span>')
    .replace(/(#.*$)/gm, '<span class="py-cmt">$1</span>');

  return <div className="py-line" dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />;
}

export default function IDE() {
  const {
    isRunning, runCode, setEditorCode, editorCode,
    fontSize, setFontSize, aiPanelOpen, setAIPanelOpen,
    terminalVisible, setTerminalVisible,
    tabs, activeTabId, addTab, closeTab, switchTab, renameTab,
  } = useStore();

  const [showSamples, setShowSamples] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [renamingTab, setRenamingTab] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const samplesRef = useRef(null);
  const [stdin, setStdin] = useState('');
  const [pythonPreview, setPythonPreview] = useState(false);
  const [compiledPython, setCompiledPython] = useState('');
  const [compileError, setCompileError] = useState('');
  const [compiling, setCompiling] = useState(false);
  const debounceRef = useRef(null);
  const autoSaveRef = useRef(null);
  const didRestoreRef = useRef(false);

  // Restore auto-saved code on first mount
  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;
    const saved = localStorage.getItem('syless_autosave');
    if (saved) setEditorCode(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save code to localStorage (debounced 1.5 s)
  useEffect(() => {
    clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem('syless_autosave', editorCode);
    }, 1500);
    return () => clearTimeout(autoSaveRef.current);
  }, [editorCode]);

  // Close examples dropdown on outside click
  useEffect(() => {
    if (!showSamples) return;
    const handle = (e) => {
      if (samplesRef.current && !samplesRef.current.contains(e.target)) {
        setShowSamples(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showSamples]);

  // Real-time Python compilation with debounce
  useEffect(() => {
    if (!pythonPreview) return;
    clearTimeout(debounceRef.current);
    setCompiling(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await API.post('/compile', { code: editorCode });
        if (data.success) {
          setCompiledPython(data.pythonCode || '');
          setCompileError('');
        } else {
          setCompileError(data.error || 'Compile error');
          setCompiledPython('');
        }
      } catch {
        setCompileError('Server not responding');
      }
      setCompiling(false);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [editorCode, pythonPreview]);

  const handleRun = useCallback(async () => {
    try {
      const result = await runCode(stdin);
      if (result.success) {
        const xp = result.xpEarned;
        toast.success(xp ? `✓ Ran in ${result.executionTime}ms  +${xp} XP` : `Ran in ${result.executionTime}ms`, { duration: 2000 });
      } else {
        toast.error('Code has an error — check the output panel');
      }
    } catch {
      toast.error('Could not connect to server');
    }
  }, [runCode, stdin]);

  const loadSample = (code) => {
    setEditorCode(code);
    setShowSamples(false);
    toast.success('Example loaded!');
  };

  const downloadCode = () => {
    const blob = new Blob([editorCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mycode.sy';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pythonLines = compiledPython ? compiledPython.split('\n') : [];

  return (
    <div className="flex h-screen bg-dark-500 overflow-hidden">
      <style>{`
        .py-kw  { color: #a78bfa; font-weight: 600; }
        .py-str { color: #6ee7b7; }
        .py-num { color: #fbbf24; }
        .py-cmt { color: #4b5563; font-style: italic; }
        .py-line { font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.75; white-space: pre; }
      `}</style>

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 glass-dark shrink-0 flex-wrap">
          {/* Examples dropdown */}
          <div className="relative" ref={samplesRef}>
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white glass hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all"
            >
              Examples
              <ChevronDown size={12} className={`transition-transform ${showSamples ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showSamples && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute top-full mt-1 left-0 glass-dark border border-white/10 rounded-xl shadow-xl w-44 z-50 overflow-hidden"
                >
                  {SAMPLE_PROGRAMS.map(({ label, code }) => (
                    <button
                      key={label}
                      onClick={() => loadSample(code)}
                      className="block w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-syless-500/10 transition-colors border-b border-white/5 last:border-0"
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1" />

          {/* Python Preview toggle */}
          <button
            onClick={() => setPythonPreview(!pythonPreview)}
            title="Toggle real-time Python conversion"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border ${
              pythonPreview
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                : 'text-gray-400 hover:text-white glass border-white/5 hover:border-white/15'
            }`}
          >
            <Code2 size={13} />
            Python
          </button>

          <button
            onClick={() => setAIPanelOpen(!aiPanelOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border ${
              aiPanelOpen
                ? 'bg-cyber-400/10 border-cyber-400/30 text-cyber-400'
                : 'text-gray-400 hover:text-white glass border-white/5 hover:border-white/15'
            }`}
          >
            <Bot size={13} />
            ARIA
          </button>

          <button onClick={downloadCode} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors" title="Download">
            <Download size={14} />
          </button>

          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors" title="Settings">
            <Settings size={14} />
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              isRunning
                ? 'bg-syless-500/30 text-syless-300 cursor-wait'
                : 'bg-gradient-to-r from-syless-600 to-syless-500 hover:from-syless-500 hover:to-syless-400 text-white shadow-glow-sm hover:shadow-glow'
            }`}
          >
            {isRunning ? <><Square size={14} className="animate-pulse" /> Running...</> : <><Play size={14} /> Run</>}
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-end gap-0 pl-2 pr-2 border-b border-white/5 bg-dark-500/60 shrink-0 overflow-x-auto">
          {(tabs || [{ id: 'tab-1', name: 'main.sy', code: editorCode }]).map(tab => (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`group flex items-center gap-2 px-3 py-2 text-xs cursor-pointer border-b-2 transition-all shrink-0 select-none ${
                tab.id === activeTabId
                  ? 'border-syless-500 text-white bg-dark-400/60'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/3'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tab.id === activeTabId ? 'bg-syless-400 animate-pulse' : 'bg-gray-600'}`} />
              {renamingTab === tab.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => { renameTab(tab.id, renameValue.trim() || tab.name); setRenamingTab(null); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { renameTab(tab.id, renameValue.trim() || tab.name); setRenamingTab(null); }
                    if (e.key === 'Escape') setRenamingTab(null);
                  }}
                  onClick={e => e.stopPropagation()}
                  className="bg-transparent outline-none border-b border-syless-500 w-24 text-white font-mono"
                />
              ) : (
                <span
                  className="font-mono"
                  onDoubleClick={e => { e.stopPropagation(); setRenamingTab(tab.id); setRenameValue(tab.name); }}
                >
                  {tab.name}
                </span>
              )}
              {(tabs || []).length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addTab}
            title="New file"
            className="flex items-center justify-center w-6 h-6 mx-2 my-1.5 rounded text-gray-600 hover:text-syless-400 hover:bg-white/5 transition-all shrink-0"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-white/5 bg-dark-400/30"
            >
              <div className="flex items-center gap-6 px-4 py-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <Type size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-400">Font Size:</span>
                  <div className="flex items-center gap-1">
                    {[12, 14, 16, 18, 20].map(size => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`px-2 py-0.5 rounded text-xs transition-all ${fontSize === size ? 'bg-syless-500/30 text-syless-300' : 'text-gray-500 hover:text-white'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">Stdin:</span>
                  <input
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Input for your program..."
                    className="input text-xs py-1 px-2 w-48 h-7"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">Terminal:</span>
                  <button
                    onClick={() => setTerminalVisible(!terminalVisible)}
                    className={`px-2 py-0.5 rounded text-xs transition-all ${terminalVisible ? 'bg-syless-500/30 text-syless-300' : 'text-gray-500 hover:text-white'}`}
                  >
                    {terminalVisible ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor + Panels */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left: Editor + Output */}
          <div className="flex-1 overflow-hidden min-w-0">
            {terminalVisible ? (
              <Split
                sizes={[65, 35]}
                minSize={100}
                direction="vertical"
                gutterSize={4}
                className="h-full flex flex-col"
                style={{ height: '100%' }}
                gutter={() => {
                  const el = document.createElement('div');
                  el.className = 'h-1 bg-white/5 hover:bg-syless-500/30 cursor-row-resize transition-colors';
                  return el;
                }}
              >
                <div className="overflow-hidden">
                  <SylessEditor onRun={handleRun} />
                </div>
                <div className="overflow-hidden">
                  <OutputPanel />
                </div>
              </Split>
            ) : (
              <SylessEditor onRun={handleRun} />
            )}
          </div>

          {/* Python Preview Panel */}
          <AnimatePresence>
            {pythonPreview && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 border-l border-white/5 flex flex-col overflow-hidden"
                style={{ width: 360 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-dark-400/40 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-300">Python Output</span>
                    {compiling && (
                      <span className="text-[10px] text-gray-500 animate-pulse">compiling…</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600">live conversion</span>
                    <button onClick={() => setPythonPreview(false)} className="text-gray-600 hover:text-white transition-colors">
                      <EyeOff size={12} />
                    </button>
                  </div>
                </div>

                {/* Label row */}
                <div className="flex text-[10px] px-4 py-1.5 border-b border-white/5 bg-dark-500/60 shrink-0">
                  <span className="text-syless-400 font-semibold">SYLESS</span>
                  <span className="mx-2 text-gray-700">→</span>
                  <span className="text-yellow-400 font-semibold">Python 3</span>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto overflow-x-auto p-4">
                  {compileError ? (
                    <div className="text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <div className="font-semibold mb-1">⚠ Compile Error</div>
                      {compileError}
                    </div>
                  ) : pythonLines.length === 0 ? (
                    <div className="text-gray-600 text-xs text-center mt-8">
                      <Code2 size={28} className="mx-auto mb-3 opacity-30" />
                      Start typing SYLESS code<br />to see Python conversion here
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {pythonLines.map((line, i) => (
                        <div key={i} className="flex gap-3 group hover:bg-white/2 rounded px-1">
                          <span className="text-gray-700 text-[10px] font-mono select-none w-5 text-right shrink-0 mt-[3px]">
                            {i + 1}
                          </span>
                          <PythonLine line={line} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer info */}
                <div className="px-4 py-2 border-t border-white/5 bg-dark-400/20 shrink-0">
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>{pythonLines.filter(l => l.trim()).length} lines of Python</span>
                    <span>updates as you type</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Panel */}
          <AnimatePresence>
            {aiPanelOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 340, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden shrink-0"
              >
                <AIPanel onClose={() => setAIPanelOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 px-4 py-1.5 border-t border-white/5 bg-dark-400/50 shrink-0">
          <span className="text-[10px] text-gray-600">SYLESS v1.1</span>
          <span className="text-[10px] text-syless-500/70">Language: SYLESS</span>
          <span className="text-[10px] text-gray-600">UTF-8</span>
          <span className="text-[10px] text-green-600/70">● auto-save on</span>
          <div className="flex-1" />
          {pythonPreview && <span className="text-[10px] text-yellow-500/70">Python preview ON</span>}
          <span className="text-[10px] text-gray-600">Ctrl+Enter to Run</span>
        </div>
      </div>
    </div>
  );
}
