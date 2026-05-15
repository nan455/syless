import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, RotateCcw } from 'lucide-react';

class BSTNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function insertBST(root, val) {
  if (!root) return new BSTNode(val);
  if (val < root.val) root.left = insertBST(root.left, val);
  else root.right = insertBST(root.right, val);
  return root;
}

function searchBST(root, val, path = []) {
  if (!root) return { found: false, path };
  path.push(root.val);
  if (root.val === val) return { found: true, path };
  if (val < root.val) return searchBST(root.left, val, path);
  return searchBST(root.right, val, path);
}

function TreeNode({ node, x, y, parentX, parentY, searchPath, level = 0 }) {
  if (!node) return null;
  const inPath = searchPath?.includes(node.val);
  const isFound = searchPath?.[searchPath.length - 1] === node.val;

  const childY = y + 70;
  const spread = Math.max(40, 200 / Math.pow(2, level));
  const leftX = x - spread;
  const rightX = x + spread;

  return (
    <g>
      {parentX !== undefined && (
        <line x1={parentX} y1={parentY + 20} x2={x} y2={y - 20}
          stroke={inPath ? '#6366f1' : 'rgba(255,255,255,0.1)'} strokeWidth={inPath ? 2 : 1} />
      )}

      {node.left && (
        <TreeNode node={node.left} x={leftX} y={childY} parentX={x} parentY={y} searchPath={searchPath} level={level + 1} />
      )}
      {node.right && (
        <TreeNode node={node.right} x={rightX} y={childY} parentX={x} parentY={y} searchPath={searchPath} level={level + 1} />
      )}

      <circle
        cx={x} cy={y} r={22}
        fill={isFound ? 'rgba(57,255,20,0.2)' : inPath ? 'rgba(99,102,241,0.3)' : 'rgba(30,27,75,0.8)'}
        stroke={isFound ? '#39ff14' : inPath ? '#6366f1' : 'rgba(99,102,241,0.3)'}
        strokeWidth={inPath ? 2 : 1}
      />
      <text x={x} y={y + 5} textAnchor="middle"
        fill={isFound ? '#39ff14' : inPath ? '#a5b4fc' : '#9ca3af'}
        fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight={inPath ? '600' : '400'}
      >
        {node.val}
      </text>
    </g>
  );
}

export default function TreeVisualizer() {
  const [root, setRoot] = useState(() => {
    let r = null;
    for (const v of [50, 30, 70, 20, 40, 60, 80]) {
      r = insertBST(r, v);
    }
    return r;
  });
  const [input, setInput] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [searchPath, setSearchPath] = useState([]);
  const [searchResult, setSearchResult] = useState(null);

  const insert = () => {
    const val = parseInt(input);
    if (isNaN(val)) return;
    setRoot(prev => {
      const cloned = JSON.parse(JSON.stringify(prev));
      return insertBST(cloned, val);
    });
    setSearchPath([]);
    setSearchResult(null);
    setInput('');
  };

  const search = () => {
    const val = parseInt(searchVal);
    if (isNaN(val)) return;
    const result = searchBST(root, val);
    setSearchPath(result.path);
    setSearchResult(result.found);
  };

  const reset = () => {
    let r = null;
    for (const v of [50, 30, 70, 20, 40, 60, 80]) r = insertBST(r, v);
    setRoot(r);
    setSearchPath([]);
    setSearchResult(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && insert()}
            placeholder="Value to insert..." className="input text-sm w-36" />
          <button onClick={insert} className="btn-primary px-3 py-2 text-sm">
            <Plus size={14} /> Insert
          </button>
        </div>
        <div className="flex gap-2">
          <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Value to search..." className="input text-sm w-36" />
          <button onClick={search} className="btn-secondary px-3 py-2 text-sm">
            <Search size={14} /> Search
          </button>
        </div>
        <button onClick={reset} className="p-2 rounded-xl glass border border-white/10 text-gray-400 hover:text-white ml-auto">
          <RotateCcw size={14} />
        </button>
      </div>

      {searchResult !== null && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm px-4 py-2 rounded-xl border ${
            searchResult
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {searchResult ? `Found ${searchVal}! Path: ${searchPath.join(' → ')}` : `${searchVal} not found in tree`}
        </motion.div>
      )}

      {/* Tree SVG */}
      <div className="bg-dark-400/30 border border-white/5 rounded-xl overflow-hidden" style={{ height: 320 }}>
        <svg width="100%" height="320" viewBox="0 0 500 310">
          {root && <TreeNode node={root} x={250} y={40} searchPath={searchPath} />}
        </svg>
      </div>

      <div className="flex gap-4 justify-center text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-syless-500/50 border border-syless-500" />Search path</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400/50 border border-green-400" />Found</span>
      </div>
    </div>
  );
}
