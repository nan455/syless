import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export default function QueueVisualizer() {
  const [queue, setQueue] = useState(['A', 'B', 'C']);
  const [input, setInput] = useState('');
  const [lastOp, setLastOp] = useState(null);

  const enqueue = useCallback(() => {
    const val = input.trim();
    if (!val) return;
    setQueue(prev => [...prev, isNaN(val) ? val : Number(val)]);
    setLastOp({ type: 'enqueue', value: val });
    setInput('');
  }, [input]);

  const dequeue = useCallback(() => {
    if (queue.length === 0) return;
    const removed = queue[0];
    setQueue(prev => prev.slice(1));
    setLastOp({ type: 'dequeue', value: removed });
  }, [queue]);

  const reset = () => { setQueue(['A', 'B', 'C']); setLastOp(null); };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Controls */}
      <div className="flex gap-2 w-full max-w-md">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && enqueue()}
          placeholder="Value to enqueue..."
          className="input text-sm flex-1"
        />
        <button onClick={enqueue} className="btn-primary px-4 py-2 text-sm gap-1.5">
          <Plus size={14} /> Enqueue
        </button>
        <button onClick={dequeue} disabled={queue.length === 0} className="btn-secondary px-4 py-2 text-sm gap-1.5 disabled:opacity-40">
          <Minus size={14} /> Dequeue
        </button>
        <button onClick={reset} className="p-2 rounded-xl glass border border-white/10 text-gray-400 hover:text-white">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Operation feedback */}
      <AnimatePresence mode="wait">
        {lastOp && (
          <motion.div
            key={JSON.stringify(lastOp)}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-sm px-4 py-2 rounded-xl border ${
              lastOp.type === 'enqueue'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
            }`}
          >
            {lastOp.type === 'enqueue'
              ? `✓ Enqueued "${lastOp.value}" at the REAR`
              : `✓ Dequeued "${lastOp.value}" from the FRONT`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIFO label */}
      <div className="flex gap-8 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          FRONT (dequeue here)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          REAR (enqueue here)
        </span>
      </div>

      {/* Queue visualization — horizontal */}
      <div className="relative w-full max-w-lg">
        {/* Arrow in */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-green-400 text-xs text-center">
          <div>→</div>
          <div>IN</div>
        </div>
        {/* Arrow out */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-orange-400 text-xs text-center">
          <div>←</div>
          <div>OUT</div>
        </div>

        <div className="flex items-center gap-0 min-h-[72px] border-y-2 border-syless-500/30 relative">
          {/* Rail lines */}
          <div className="absolute inset-0 border-y border-white/5 pointer-events-none" />

          <AnimatePresence mode="popLayout">
            {queue.length === 0 ? (
              <div className="w-full text-center text-xs text-gray-600 py-4">
                Queue is empty — enqueue something!
              </div>
            ) : (
              queue.map((item, i) => {
                const isFront = i === 0;
                const isRear = i === queue.length - 1;
                return (
                  <motion.div
                    key={`${item}-${i}`}
                    layout
                    initial={{ scale: 0, opacity: 0, x: 40 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    exit={{ scale: 0, opacity: 0, x: -40 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className={`relative flex flex-col items-center justify-center min-w-[64px] h-16 border-x font-mono font-bold text-sm flex-1
                      ${isFront ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' :
                        isRear  ? 'bg-green-500/20 border-green-500/50 text-green-300' :
                                  'bg-dark-300/50 border-white/8 text-gray-300'}`}
                  >
                    {item}
                    {isFront && <span className="absolute -bottom-5 text-[9px] text-orange-400 font-normal">FRONT</span>}
                    {isRear  && <span className="absolute -bottom-5 text-[9px] text-green-400 font-normal">REAR</span>}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SYLESS code */}
      <div className="w-full max-w-md code-block text-xs mt-4">
        <div className="text-gray-500 mb-2"># SYLESS — Queue operations</div>
        <div className="text-syless-400">make taskQueue</div>
        {queue.map((item, i) => (
          <div key={i} className="text-green-400">
            insert {typeof item === 'string' ? `"${item}"` : item} into taskQueue
          </div>
        ))}
        <div className="text-gray-400 mt-1">remove from taskQueue  # removes FRONT</div>
        <div className="text-gray-300 mt-1">say -&gt; taskQueue</div>
      </div>

      {/* Concept box */}
      <div className="w-full max-w-md bg-dark-400/30 border border-white/5 rounded-xl p-4 text-xs text-gray-400 space-y-1">
        <div className="text-white font-semibold mb-2">📖 Queue — First In, First Out (FIFO)</div>
        <div>• Like a line at a ticket counter — first person in is first served</div>
        <div>• <span className="text-green-400">Enqueue</span> adds to the REAR &nbsp;|&nbsp; <span className="text-orange-400">Dequeue</span> removes from FRONT</div>
        <div>• Used in: BFS traversal, task scheduling, print queues</div>
        <div>• Time: O(1) enqueue &amp; dequeue</div>
      </div>
    </div>
  );
}
