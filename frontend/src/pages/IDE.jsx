import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Split from 'react-split';
import useStore from '@store/useStore';
import toast from 'react-hot-toast';
import {
  Play, Square, Settings, Zap, ChevronDown, ChevronUp,
  Type, Bot, Share2, Download, RotateCcw, PanelRightOpen
} from 'lucide-react';

import SylessEditor from '@components/Editor/SylessEditor';
import OutputPanel from '@components/Terminal/OutputPanel';
import AIPanel from '@components/AIPanel/AIPanel';
import Sidebar from '@components/Sidebar/Sidebar';

const SAMPLE_PROGRAMS = [
  {
    label: 'Hello World',
    code: 'say -> "Hello, World!"',
  },
  {
    label: 'Variables',
    code: `make name = "SYLESS"
make version = 1
say -> name
say -> version`,
  },
  {
    label: 'If/Else',
    code: `make score = 85

check score >= 90 {
    say -> "Grade: A"
}
otherwise {
    say -> "Grade: B"
}`,
  },
  {
    label: 'Loop',
    code: `loop 5 times {
    say -> "SYLESS is awesome!"
}`,
  },
  {
    label: 'Function',
    code: `task greet(name) {
    say -> "Hello, " + name + "!"
}

greet("World")
greet("SYLESS")`,
  },
  {
    label: 'Stack DSA',
    code: `make stack

push 10 into stack
push 20 into stack
push 30 into stack

say -> stack

pop from stack
say -> stack`,
  },
  {
    label: 'Recursion',
    code: `task factorial(n) {
    check n == 0 {
        give 1
    }
    give n * factorial(n - 1)
}

say -> factorial(5)
say -> factorial(10)`,
  },
  {
    label: 'Sort & Search',
    code: `make nums = [64, 34, 25, 12, 22, 11, 90]

sort nums ascending
say -> nums

binary search 25 in nums`,
  },
];

export default function IDE() {
  const {
    isRunning, runCode, setEditorCode, editorCode,
    fontSize, setFontSize, aiPanelOpen, setAIPanelOpen,
    terminalVisible, setTerminalVisible,
  } = useStore();

  const [showSamples, setShowSamples] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [stdin, setStdin] = useState('');

  const handleRun = useCallback(async () => {
    try {
      const result = await runCode(stdin);
      if (result.success) {
        toast.success(`Ran in ${result.executionTime}ms`, { duration: 2000 });
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
    toast.success('Sample loaded!');
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

  return (
    <div className="flex h-screen bg-dark-500 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 glass-dark shrink-0">
          {/* File name */}
          <div className="flex items-center gap-2 mr-2">
            <div className="w-2 h-2 rounded-full bg-syless-500 animate-pulse" />
            <span className="text-sm font-mono text-gray-400">main.sy</span>
          </div>

          <div className="h-5 w-px bg-white/10 mx-1" />

          {/* Samples dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white glass hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all"
            >
              Examples
              <ChevronDown size={12} className={showSamples ? 'rotate-180' : ''} />
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
                      className="block w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-syless-500/10 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1" />

          {/* Right toolbar actions */}
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

          <button
            onClick={downloadCode}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Download code"
          >
            <Download size={14} />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Settings"
          >
            <Settings size={14} />
          </button>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              isRunning
                ? 'bg-syless-500/30 text-syless-300 cursor-wait'
                : 'bg-gradient-to-r from-syless-600 to-syless-500 hover:from-syless-500 hover:to-syless-400 text-white shadow-glow-sm hover:shadow-glow'
            }`}
          >
            {isRunning ? (
              <>
                <Square size={14} className="animate-pulse" />
                Running...
              </>
            ) : (
              <>
                <Play size={14} />
                Run
              </>
            )}
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
              <div className="flex items-center gap-6 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Type size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-400">Font Size:</span>
                  <div className="flex items-center gap-1">
                    {[12, 14, 16, 18, 20].map(size => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`px-2 py-0.5 rounded text-xs transition-all ${
                          fontSize === size ? 'bg-syless-500/30 text-syless-300' : 'text-gray-500 hover:text-white'
                        }`}
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
          {/* Editor + Output split */}
          <div className="flex-1 overflow-hidden">
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
          <span className="text-[10px] text-gray-600">SYLESS v1.0</span>
          <span className="text-[10px] text-syless-500/70">Language: SYLESS</span>
          <span className="text-[10px] text-gray-600">UTF-8</span>
          <div className="flex-1" />
          <span className="text-[10px] text-gray-600">Ctrl+Enter to Run</span>
        </div>
      </div>
    </div>
  );
}
