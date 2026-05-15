import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '@store/useStore';
import { Terminal, Code2, Clock, AlertCircle, CheckCircle2, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'output', label: 'Output', icon: Terminal },
  { id: 'python', label: 'Python', icon: Code2 },
];

export default function OutputPanel() {
  const { output, runError, pythonCode, isRunning, executionTime, clearOutput, activeTab, setActiveTab } = useStore();
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, runError]);

  const copyOutput = () => {
    const text = activeTab === 'output' ? (output || runError || '') : pythonCode;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="flex flex-col h-full bg-dark-400/50">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === id
                ? 'bg-syless-500/20 text-syless-300 border border-syless-500/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}

        <div className="flex-1" />

        {/* Status indicators */}
        {executionTime !== null && !isRunning && (
          <div className="flex items-center gap-1.5 mr-2">
            {runError ? (
              <AlertCircle size={12} className="text-red-400" />
            ) : (
              <CheckCircle2 size={12} className="text-green-400" />
            )}
            <span className="text-xs text-gray-500">
              <Clock size={10} className="inline mr-1" />
              {executionTime}ms
            </span>
          </div>
        )}

        <button
          onClick={copyOutput}
          className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          title="Copy"
        >
          <Copy size={12} />
        </button>
        <button
          onClick={clearOutput}
          className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          title="Clear"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Content */}
      <div ref={outputRef} className="flex-1 overflow-auto p-4">
        {activeTab === 'output' ? (
          <OutputContent output={output} error={runError} isRunning={isRunning} />
        ) : (
          <PythonView code={pythonCode} />
        )}
      </div>
    </div>
  );
}

function OutputContent({ output, error, isRunning }) {
  if (isRunning) {
    return (
      <div className="flex items-center gap-3 text-gray-400">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-syless-500"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </div>
        <span className="text-sm font-mono">Running SYLESS code...</span>
      </div>
    );
  }

  if (!output && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
        <Terminal size={32} className="opacity-30" />
        <p className="text-sm">Run your code to see output</p>
        <p className="text-xs text-gray-700">Press Ctrl+Enter or click Run</p>
      </div>
    );
  }

  return (
    <div className="font-mono text-sm space-y-1">
      {output && output.split('\n').map((line, i) => (
        <div key={i} className="text-green-400 leading-relaxed">{line || ' '}</div>
      ))}
      {error && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20"
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-red-400 text-xs font-semibold mb-1">Error</div>
                <div className="text-red-300/80 text-xs leading-relaxed">{error}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function PythonView({ code }) {
  if (!code) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
        <Code2 size={32} className="opacity-30" />
        <p className="text-sm">Compiled Python will appear here</p>
      </div>
    );
  }

  return (
    <pre className="font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
      {code.split('\n').map((line, i) => (
        <div key={i} className="flex gap-3">
          <span className="text-gray-700 w-6 text-right shrink-0 select-none">{i + 1}</span>
          <span className="text-gray-300">{line}</span>
        </div>
      ))}
    </pre>
  );
}
