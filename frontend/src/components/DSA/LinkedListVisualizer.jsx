import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RotateCcw } from 'lucide-react';

export default function LinkedListVisualizer() {
  const [list, setList] = useState([10, 20, 30, 40]);
  const [input, setInput] = useState('');
  const [lastOp, setLastOp] = useState(null);
  const [highlighted, setHighlighted] = useState(null);

  const addNode = useCallback(() => {
    const val = input.trim();
    if (!val) return;
    const v = isNaN(val) ? val : Number(val);
    setList(prev => [...prev, v]);
    setLastOp({ type: 'add', value: v });
    setHighlighted(list.length);
    setInput('');
    setTimeout(() => setHighlighted(null), 1200);
  }, [input, list.length]);

  const removeNode = useCallback((idx) => {
    const val = list[idx];
    setList(prev => prev.filter((_, i) => i !== idx));
    setLastOp({ type: 'remove', value: val });
  }, [list]);

  const reset = () => { setList([10, 20, 30, 40]); setLastOp(null); setHighlighted(null); };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Controls */}
      <div className="flex gap-2 w-full max-w-md">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNode()}
          placeholder="Value to add..."
          className="input text-sm flex-1"
        />
        <button onClick={addNode} className="btn-primary px-4 py-2 text-sm gap-1.5">
          <Plus size={14} /> Add Node
        </button>
        <button onClick={reset} className="p-2 rounded-xl glass border border-white/10 text-gray-400 hover:text-white">
          <RotateCcw size={14} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {lastOp && (
          <motion.div
            key={JSON.stringify(lastOp)}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-sm px-4 py-2 rounded-xl border ${
              lastOp.type === 'add'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {lastOp.type === 'add' ? `✓ Added node "${lastOp.value}" at TAIL` : `✓ Removed node "${lastOp.value}"`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Linked list visualization */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="flex items-center gap-0 min-w-max mx-auto px-4 py-6 justify-center">
          {/* NULL head pointer */}
          <div className="flex flex-col items-center mr-1">
            <div className="text-[10px] text-gray-500 mb-1">HEAD</div>
            <div className="text-xs text-syless-400">→</div>
          </div>

          <AnimatePresence mode="popLayout">
            {list.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-gray-600 px-6"
              >
                NULL (empty list)
              </motion.div>
            ) : (
              list.map((item, i) => {
                const isHead = i === 0;
                const isTail = i === list.length - 1;
                const isHigh = highlighted === i;
                return (
                  <motion.div
                    key={`node-${i}-${item}`}
                    layout
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0, x: -20 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="flex items-center"
                  >
                    {/* Node box */}
                    <div
                      className={`relative group flex flex-col border rounded-xl overflow-hidden cursor-pointer transition-all
                        ${isHigh  ? 'border-green-400/70 shadow-lg shadow-green-500/20' :
                          isHead  ? 'border-syless-500/70' :
                          isTail  ? 'border-cyber-400/50' :
                                    'border-white/15'}
                      `}
                    >
                      {/* Data cell */}
                      <div className={`px-4 py-2 text-center font-mono font-bold text-sm min-w-[52px]
                        ${isHigh ? 'bg-green-500/20 text-green-300' :
                          isHead ? 'bg-syless-500/20 text-syless-300' :
                          isTail ? 'bg-cyber-400/15 text-cyan-300' :
                                   'bg-dark-300/60 text-gray-200'}`}
                      >
                        {item}
                      </div>
                      {/* Next pointer cell */}
                      <div className="px-2 py-1 text-center text-[9px] text-gray-600 bg-dark-400/60 border-t border-white/5">
                        {isTail ? 'null' : 'next →'}
                      </div>
                      {/* Label */}
                      {(isHead || isTail) && (
                        <span className={`absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-semibold
                          ${isHead ? 'text-syless-400' : 'text-cyan-400'}`}
                        >
                          {isHead && isTail ? 'HEAD/TAIL' : isHead ? 'HEAD' : 'TAIL'}
                        </span>
                      )}
                      {/* Delete button */}
                      <button
                        onClick={() => removeNode(i)}
                        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-0.5"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>

                    {/* Arrow to next node */}
                    {!isTail && (
                      <div className="flex items-center text-gray-500 px-1">
                        <div className="w-6 h-px bg-gray-600" />
                        <div className="text-gray-500">›</div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>

          {/* NULL tail */}
          <div className="flex items-center ml-1">
            <div className="w-4 h-px bg-gray-600" />
            <div className="text-xs text-gray-500 font-mono ml-1">NULL</div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-600">Click a node to delete it</p>

      {/* SYLESS code */}
      <div className="w-full max-w-md code-block text-xs">
        <div className="text-gray-500 mb-2"># SYLESS — Linked List</div>
        <div className="text-syless-400">make linkedlist</div>
        {list.map((item, i) => (
          <div key={i} className="text-green-400">
            add {typeof item === 'string' ? `"${item}"` : item} into linkedlist
          </div>
        ))}
        <div className="text-gray-300 mt-1">say -&gt; linkedlist</div>
      </div>

      {/* Concept box */}
      <div className="w-full max-w-md bg-dark-400/30 border border-white/5 rounded-xl p-4 text-xs text-gray-400 space-y-1">
        <div className="text-white font-semibold mb-2">🔗 Linked List — Node Chain</div>
        <div>• Each <span className="text-syless-400">node</span> stores a value + a pointer to the next node</div>
        <div>• <span className="text-syless-400">HEAD</span> = first node &nbsp;|&nbsp; <span className="text-cyan-400">TAIL</span> = last node (points to NULL)</div>
        <div>• Insert at tail: O(n) &nbsp;|&nbsp; Insert at head: O(1)</div>
        <div>• Used in: undo lists, music playlists, memory allocation</div>
      </div>
    </div>
  );
}
