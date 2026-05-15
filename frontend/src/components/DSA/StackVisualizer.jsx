import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export default function StackVisualizer() {
  const [stack, setStack] = useState([10, 20, 30]);
  const [input, setInput] = useState('');
  const [lastOp, setLastOp] = useState(null);

  const push = useCallback(() => {
    const val = input.trim();
    if (!val) return;
    setStack(prev => [...prev, isNaN(val) ? val : Number(val)]);
    setLastOp({ type: 'push', value: val });
    setInput('');
  }, [input]);

  const pop = useCallback(() => {
    if (stack.length === 0) return;
    const popped = stack[stack.length - 1];
    setStack(prev => prev.slice(0, -1));
    setLastOp({ type: 'pop', value: popped });
  }, [stack]);

  const reset = () => { setStack([10, 20, 30]); setLastOp(null); };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Controls */}
      <div className="flex gap-2 w-full max-w-sm">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && push()}
          placeholder="Value to push..."
          className="input text-sm flex-1"
        />
        <button onClick={push} className="btn-primary px-4 py-2 text-sm">
          <Plus size={14} />
          Push
        </button>
        <button onClick={pop} disabled={stack.length === 0} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
          <Minus size={14} />
          Pop
        </button>
        <button onClick={reset} className="p-2 rounded-xl glass border border-white/10 text-gray-400 hover:text-white">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Operation feedback */}
      {lastOp && (
        <motion.div
          key={JSON.stringify(lastOp)}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm px-4 py-2 rounded-xl border ${
            lastOp.type === 'push'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {lastOp.type === 'push' ? `Pushed ${lastOp.value}` : `Popped ${lastOp.value}`}
        </motion.div>
      )}

      {/* Stack visualization */}
      <div className="flex flex-col items-center gap-0 relative min-h-[300px] justify-end">
        {/* Base */}
        <div className="w-40 h-3 rounded-b-lg bg-syless-500/40 border border-syless-500/60" />

        {/* Stack items */}
        <AnimatePresence mode="popLayout">
          {stack.length === 0 && (
            <div className="absolute top-1/3 text-sm text-gray-600 text-center">
              Stack is empty
              <br />
              <span className="text-xs">Push something!</span>
            </div>
          )}
          {[...stack].reverse().map((item, i) => {
            const isTop = i === 0;
            return (
              <motion.div
                key={`${item}-${stack.length - 1 - i}`}
                layout
                initial={{ scale: 0.5, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, x: 50 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`relative w-40 h-12 border flex items-center justify-center font-mono font-bold text-sm
                  ${isTop
                    ? 'bg-syless-500/30 border-syless-500/80 text-syless-300 shadow-glow-sm'
                    : 'bg-dark-300/60 border-white/10 text-gray-300'
                  }`}
              >
                {item}
                {isTop && (
                  <span className="absolute -right-14 text-[10px] text-syless-400 font-normal">← TOP</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Code representation */}
      <div className="w-full max-w-sm code-block text-xs">
        <div className="text-gray-500 mb-2"># SYLESS</div>
        {stack.map((item, i) => (
          <div key={i} className="text-syless-400">push {item} into stack</div>
        ))}
        <div className="mt-2 text-gray-300">say -&gt; stack  # {JSON.stringify(stack)}</div>
      </div>
    </div>
  );
}
