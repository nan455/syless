import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Shuffle } from 'lucide-react';

const SORT_ALGORITHMS = [
  { id: 'bubble', name: 'Bubble Sort', syless: 'sort nums ascending' },
  { id: 'selection', name: 'Selection Sort', syless: 'sort nums ascending' },
];

function generateArray(size = 12) {
  return Array.from({ length: size }, (_, i) => ({
    id: i,
    value: Math.floor(Math.random() * 90) + 10,
  }));
}

async function bubbleSortSteps(arr) {
  const steps = [];
  const a = arr.map(x => ({ ...x }));
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({ array: a.map(x => ({ ...x })), comparing: [j, j + 1], sorted: a.length - i });
      if (a[j].value > a[j + 1].value) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ array: a.map(x => ({ ...x })), comparing: [j, j + 1], swapped: true, sorted: a.length - i });
      }
    }
  }
  steps.push({ array: a.map(x => ({ ...x })), comparing: [], sorted: a.length });
  return steps;
}

export default function SortVisualizer() {
  const [array, setArray] = useState(generateArray);
  const [comparing, setComparing] = useState([]);
  const [sorted, setSorted] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [algo, setAlgo] = useState('bubble');
  const cancelRef = useRef(false);

  const maxVal = Math.max(...array.map(x => x.value));

  const shuffle = () => {
    cancelRef.current = true;
    setArray(generateArray());
    setComparing([]);
    setSorted(0);
    setIsRunning(false);
  };

  const runSort = useCallback(async () => {
    cancelRef.current = false;
    setIsRunning(true);
    const steps = await bubbleSortSteps(array);
    for (const step of steps) {
      if (cancelRef.current) break;
      setArray(step.array);
      setComparing(step.comparing || []);
      setSorted(step.sorted || 0);
      await new Promise(r => setTimeout(r, speed));
    }
    setComparing([]);
    setIsRunning(false);
  }, [array, speed]);

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {SORT_ALGORITHMS.map(a => (
            <button
              key={a.id}
              onClick={() => !isRunning && setAlgo(a.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                algo === a.id ? 'bg-syless-500/20 border border-syless-500/40 text-syless-300' : 'text-gray-500 hover:text-white glass border border-white/5'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Speed:</span>
          <input
            type="range" min="20" max="500" step="20"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24 accent-syless-500"
          />
          <span className="text-xs text-gray-500">{speed}ms</span>
        </div>

        <div className="flex gap-2 ml-auto">
          <button onClick={shuffle} disabled={isRunning} className="btn-secondary px-3 py-2 text-sm disabled:opacity-40">
            <Shuffle size={14} />
            Shuffle
          </button>
          <button onClick={runSort} disabled={isRunning} className="btn-primary px-4 py-2 text-sm disabled:opacity-40">
            <Play size={14} />
            {isRunning ? 'Sorting...' : 'Sort!'}
          </button>
        </div>
      </div>

      {/* Visualization */}
      <div className="flex items-end justify-center gap-1.5 h-48 bg-dark-400/30 rounded-xl p-4 border border-white/5">
        {array.map((item, i) => {
          const isComparing = comparing.includes(i);
          const isSorted = i >= array.length - sorted;
          const height = Math.max(8, (item.value / maxVal) * 160);

          return (
            <motion.div
              key={item.id}
              layout
              className="flex flex-col items-center gap-1"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <span className="text-[8px] text-gray-600">{item.value}</span>
              <motion.div
                className={`rounded-t-sm transition-colors ${
                  isComparing ? 'bg-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' :
                  isSorted ? 'bg-green-400' :
                  'bg-syless-500'
                }`}
                style={{ width: 24, height }}
                animate={{ height }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-syless-500" />Unsorted</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-400" />Comparing</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-400" />Sorted</span>
      </div>

      {/* SYLESS code */}
      <div className="code-block text-xs">
        <div className="text-gray-500 mb-1"># SYLESS</div>
        <div className="text-syless-400">make nums = {JSON.stringify(array.map(x => x.value).slice(0, 8))}...</div>
        <div className="text-cyber-400">sort nums ascending</div>
        <div className="text-gray-300">say -&gt; nums</div>
      </div>
    </div>
  );
}
