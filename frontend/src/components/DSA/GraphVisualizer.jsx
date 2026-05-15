import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, RotateCcw, Zap } from 'lucide-react';

const INITIAL_NODES = {
  A: { x: 200, y: 80 },
  B: { x: 80,  y: 200 },
  C: { x: 320, y: 200 },
  D: { x: 150, y: 320 },
  E: { x: 280, y: 320 },
};
const INITIAL_EDGES = [['A','B'],['A','C'],['B','D'],['C','E'],['D','E']];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function GraphVisualizer() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [edges, setEdges] = useState(INITIAL_EDGES);
  const [nodeInput, setNodeInput] = useState('');
  const [edgeA, setEdgeA] = useState('');
  const [edgeB, setEdgeB] = useState('');
  const [visited, setVisited] = useState([]);
  const [current, setCurrent] = useState(null);
  const [queue, setQueue] = useState([]);
  const [traversalLog, setTraversalLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState('bfs'); // bfs | dfs
  const cancelRef = useRef(false);

  const reset = () => {
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setVisited([]); setCurrent(null); setQueue([]); setTraversalLog([]);
    cancelRef.current = true;
    setTimeout(() => { cancelRef.current = false; }, 100);
    setRunning(false);
  };

  const addNode = () => {
    const name = nodeInput.trim().toUpperCase();
    if (!name || nodes[name]) return;
    const angle = (Object.keys(nodes).length / 8) * Math.PI * 2;
    setNodes(prev => ({ ...prev, [name]: { x: 200 + 120 * Math.cos(angle), y: 200 + 120 * Math.sin(angle) } }));
    setNodeInput('');
  };

  const addEdge = () => {
    const a = edgeA.trim().toUpperCase();
    const b = edgeB.trim().toUpperCase();
    if (!a || !b || a === b) return;
    if (!nodes[a] || !nodes[b]) return;
    if (edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return;
    setEdges(prev => [...prev, [a, b]]);
    setEdgeA(''); setEdgeB('');
  };

  const getNeighbors = useCallback((node) => {
    return edges
      .filter(([a, b]) => a === node || b === node)
      .map(([a, b]) => a === node ? b : a);
  }, [edges]);

  const runBFS = async (start) => {
    setRunning(true); cancelRef.current = false;
    setVisited([]); setCurrent(null); setTraversalLog([]);
    const vis = new Set();
    const q = [start];
    vis.add(start);
    const log = [];

    while (q.length > 0) {
      if (cancelRef.current) break;
      const node = q.shift();
      setCurrent(node);
      setQueue([...q]);
      setVisited([...vis]);
      log.push(`Visit ${node}`);
      setTraversalLog([...log]);
      await sleep(700);

      for (const nb of getNeighbors(node)) {
        if (!vis.has(nb)) {
          vis.add(nb);
          q.push(nb);
          log.push(`  Queue: ${nb}`);
          setTraversalLog([...log]);
          setQueue([...q]);
          await sleep(300);
        }
      }
    }
    setCurrent(null);
    setRunning(false);
  };

  const runDFS = async (start) => {
    setRunning(true); cancelRef.current = false;
    setVisited([]); setCurrent(null); setTraversalLog([]);
    const vis = new Set();
    const log = [];

    const dfs = async (node) => {
      if (cancelRef.current || vis.has(node)) return;
      vis.add(node);
      setCurrent(node);
      setVisited([...vis]);
      log.push(`Visit ${node}`);
      setTraversalLog([...log]);
      await sleep(700);

      for (const nb of getNeighbors(node)) {
        if (!vis.has(nb)) {
          log.push(`  → DFS into ${nb}`);
          setTraversalLog([...log]);
          await sleep(300);
          await dfs(nb);
        }
      }
    };

    await dfs(start);
    setCurrent(null);
    setRunning(false);
  };

  const startTraversal = () => {
    const start = Object.keys(nodes)[0];
    if (!start) return;
    if (mode === 'bfs') runBFS(start);
    else runDFS(start);
  };

  const stopTraversal = () => {
    cancelRef.current = true;
    setRunning(false);
    setCurrent(null);
  };

  const SVG_W = 400, SVG_H = 400;

  return (
    <div className="flex flex-col gap-5">
      {/* Controls row */}
      <div className="flex flex-wrap gap-2">
        <input
          value={nodeInput}
          onChange={e => setNodeInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNode()}
          placeholder="Node name (A-Z)"
          className="input text-sm w-32"
        />
        <button onClick={addNode} className="btn-primary px-3 py-2 text-xs gap-1">
          <Plus size={12} /> Node
        </button>
        <div className="h-6 w-px bg-white/10 self-center" />
        <input value={edgeA} onChange={e => setEdgeA(e.target.value)} placeholder="From" className="input text-sm w-20" />
        <input value={edgeB} onChange={e => setEdgeB(e.target.value)} placeholder="To" className="input text-sm w-20" />
        <button onClick={addEdge} className="btn-secondary px-3 py-2 text-xs gap-1">
          <Plus size={12} /> Edge
        </button>
        <div className="h-6 w-px bg-white/10 self-center" />
        {/* Mode toggle */}
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          {['bfs','dfs'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-xs font-semibold transition-all ${mode === m ? 'bg-syless-500/30 text-syless-300' : 'text-gray-500 hover:text-white'}`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        {running ? (
          <button onClick={stopTraversal} className="btn-secondary px-3 py-2 text-xs gap-1 text-red-400 border-red-500/30">
            Stop
          </button>
        ) : (
          <button onClick={startTraversal} disabled={Object.keys(nodes).length === 0} className="btn-primary px-3 py-2 text-xs gap-1">
            <Play size={12} /> Run {mode.toUpperCase()}
          </button>
        )}
        <button onClick={reset} className="p-2 rounded-xl glass border border-white/10 text-gray-400 hover:text-white">
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
        {/* SVG Graph */}
        <div className="flex-1 min-w-[300px]">
          <svg
            width="100%"
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="bg-dark-400/30 rounded-xl border border-white/5"
            style={{ maxHeight: 340 }}
          >
            {/* Edges */}
            {edges.map(([a, b], i) => {
              const na = nodes[a], nb = nodes[b];
              if (!na || !nb) return null;
              const isActive = (visited.includes(a) && visited.includes(b));
              return (
                <line
                  key={i}
                  x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke={isActive ? '#7c3aed' : '#2a2a4a'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
                />
              );
            })}

            {/* Nodes */}
            {Object.entries(nodes).map(([name, pos]) => {
              const isVisited = visited.includes(name);
              const isCurrent = current === name;
              const isQueued = queue.includes(name);
              return (
                <g key={name} transform={`translate(${pos.x},${pos.y})`}>
                  <circle
                    r={22}
                    fill={isCurrent ? '#7c3aed' : isVisited ? '#4c1d95' : isQueued ? '#1e3a5f' : '#1a1a2e'}
                    stroke={isCurrent ? '#a78bfa' : isVisited ? '#7c3aed' : isQueued ? '#3b82f6' : '#2a2a4a'}
                    strokeWidth={isCurrent ? 3 : 2}
                    style={{ transition: 'fill 0.3s, stroke 0.3s' }}
                  />
                  {isCurrent && (
                    <circle r={28} fill="none" stroke="#a78bfa" strokeWidth={1.5} opacity={0.4}>
                      <animate attributeName="r" values="22;32;22" dur="1s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isCurrent ? '#fff' : isVisited ? '#a78bfa' : '#94a3b8'}
                    fontSize={13}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right panel: log + legend */}
        <div className="flex flex-col gap-3 w-44">
          {/* Legend */}
          <div className="text-xs space-y-1.5">
            {[
              { color: 'bg-syless-500', label: 'Current node' },
              { color: 'bg-purple-800', label: 'Visited' },
              { color: 'bg-blue-900',   label: 'In queue' },
              { color: 'bg-dark-300',   label: 'Unvisited' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 text-gray-400">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>

          {/* BFS Queue / DFS Stack indicator */}
          {running && queue.length > 0 && (
            <div className="text-xs">
              <div className="text-gray-500 mb-1">{mode === 'bfs' ? 'Queue' : 'Stack'}:</div>
              <div className="flex flex-wrap gap-1">
                {queue.map((n, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-blue-900/40 border border-blue-500/30 text-blue-300 font-mono">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Traversal log */}
          {traversalLog.length > 0 && (
            <div className="text-xs bg-dark-400/40 border border-white/5 rounded-xl p-3 max-h-48 overflow-y-auto">
              <div className="text-gray-500 mb-1 font-semibold">{mode.toUpperCase()} log:</div>
              {traversalLog.map((entry, i) => (
                <div key={i} className={`font-mono ${entry.startsWith(' ') ? 'text-gray-600' : 'text-syless-400'}`}>
                  {entry}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SYLESS code */}
      <div className="code-block text-xs">
        <div className="text-gray-500 mb-2"># SYLESS — Graph (connect = bidirectional edge)</div>
        {edges.map(([a, b], i) => (
          <div key={i} className="text-syless-400">connect {a} to {b}</div>
        ))}
      </div>

      {/* Concept box */}
      <div className="bg-dark-400/30 border border-white/5 rounded-xl p-4 text-xs text-gray-400 space-y-1">
        <div className="text-white font-semibold mb-2">🕸️ Graph — Nodes &amp; Edges</div>
        <div>• A graph has <span className="text-syless-400">nodes</span> (vertices) connected by <span className="text-cyan-400">edges</span></div>
        <div>• <span className="text-green-400">BFS</span> explores level by level using a <span className="text-green-400">Queue</span> — finds shortest path</div>
        <div>• <span className="text-yellow-400">DFS</span> explores as deep as possible using a <span className="text-yellow-400">Stack</span> — finds all paths</div>
        <div>• Used in: maps, social networks, web crawlers, dependency graphs</div>
      </div>
    </div>
  );
}
