import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '@store/useStore';
import Sidebar from '@components/Sidebar/Sidebar';
import StackVisualizer from '@components/DSA/StackVisualizer';
import SortVisualizer from '@components/DSA/SortVisualizer';
import TreeVisualizer from '@components/DSA/TreeVisualizer';
import {
  BookOpen, Play, CheckCircle2, XCircle, Clock, Filter,
  ChevronRight, Trophy, Zap, BarChart2, Search
} from 'lucide-react';

const VISUALIZERS = [
  { id: 'stack', label: 'Stack', icon: '📚', component: StackVisualizer },
  { id: 'sort', label: 'Sorting', icon: '📊', component: SortVisualizer },
  { id: 'tree', label: 'BST', icon: '🌳', component: TreeVisualizer },
];

const DIFFICULTY_COLORS = {
  beginner: 'text-green-400 bg-green-400/10 border-green-400/30',
  easy: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  hard: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  expert: 'text-red-400 bg-red-400/10 border-red-400/30',
};

// Demo problems
const DEMO_PROBLEMS = [
  {
    id: '1', title: 'Hello SYLESS', slug: 'hello-syless', difficulty: 'beginner', category: 'basics',
    description: 'Write a SYLESS program that prints "Hello, World!"',
    starterCode: { syless: '# Write your solution here\n' },
  },
  {
    id: '2', title: 'Sum of Numbers', slug: 'sum-numbers', difficulty: 'easy', category: 'basics',
    description: 'Create two variables x and y, then print their sum.',
    starterCode: { syless: 'make x = 10\nmake y = 20\n# Print their sum\n' },
  },
  {
    id: '3', title: 'FizzBuzz', slug: 'fizzbuzz', difficulty: 'easy', category: 'basics',
    description: 'Loop from 1 to 20. Print "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for both.',
    starterCode: { syless: 'loop 20 times {\n    # Your logic here\n}\n' },
  },
  {
    id: '4', title: 'Reverse Array', slug: 'reverse-array', difficulty: 'easy', category: 'arrays',
    description: 'Create an array and print it in reverse using a for-each loop.',
    starterCode: { syless: 'make nums = [1, 2, 3, 4, 5]\n# Your solution here\n' },
  },
  {
    id: '5', title: 'Factorial', slug: 'factorial', difficulty: 'medium', category: 'recursion',
    description: 'Write a recursive SYLESS function to compute factorial of n.',
    starterCode: { syless: 'task factorial(n) {\n    # Base case and recursive case\n}\n\nsay -> factorial(5)\n' },
  },
  {
    id: '6', title: 'Stack Operations', slug: 'stack-ops', difficulty: 'medium', category: 'stack',
    description: 'Create a stack, push 5 numbers, pop 2, and print the final stack.',
    starterCode: { syless: 'make stack\n# Push and pop operations\n' },
  },
  {
    id: '7', title: 'Binary Search', slug: 'binary-search', difficulty: 'hard', category: 'searching',
    description: 'Create a sorted array and use binary search to find a target.',
    starterCode: { syless: 'make sorted = [1, 5, 10, 15, 20, 25, 30]\n# Binary search for 15\n' },
  },
  {
    id: '8', title: 'Sort Descending', slug: 'sort-desc', difficulty: 'easy', category: 'sorting',
    description: 'Create an array of numbers and sort them in descending order.',
    starterCode: { syless: 'make data = [3, 1, 4, 1, 5, 9, 2, 6]\nsort data descending\nsay -> data\n' },
  },
];

export default function DSAPlayground() {
  const { submitProblem, editorCode, setEditorCode } = useStore();
  const [activeViz, setActiveViz] = useState('stack');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [filter, setFilter] = useState({ category: '', difficulty: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [submitResult, setSubmitResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('problems'); // problems | visualizers

  const problems = DEMO_PROBLEMS;

  const filteredProblems = problems.filter(p => {
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !filter.category || p.category === filter.category;
    const matchDiff = !filter.difficulty || p.difficulty === filter.difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setEditorCode(problem.starterCode?.syless || '');
    setSubmitResult(null);
  };

  const handleSubmit = async () => {
    if (!selectedProblem || !editorCode) return;
    setSubmitting(true);
    try {
      const result = await submitProblem(selectedProblem.slug, editorCode);
      setSubmitResult(result);
    } catch (err) {
      setSubmitResult({ success: false, verdict: 'Error', error: 'Could not submit — is backend running?' });
    }
    setSubmitting(false);
  };

  const ActiveViz = VISUALIZERS.find(v => v.id === activeViz)?.component;

  return (
    <div className="flex h-screen bg-dark-500 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex overflow-hidden">
        {/* Problem list / Visualizer switcher */}
        <div className="w-80 flex flex-col border-r border-white/5 overflow-hidden shrink-0">
          {/* Tab switch */}
          <div className="flex border-b border-white/5 shrink-0">
            {[
              { id: 'problems', label: 'Problems', icon: BookOpen },
              { id: 'visualizers', label: 'Visualize', icon: BarChart2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-all border-b-2 ${
                  activeTab === id
                    ? 'border-syless-500 text-syless-300'
                    : 'border-transparent text-gray-500 hover:text-white'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'problems' ? (
            <>
              {/* Search & filter */}
              <div className="p-3 space-y-2 border-b border-white/5 shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search problems..."
                    className="input text-xs pl-9 py-2"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filter.difficulty}
                    onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value }))}
                    className="input text-xs py-1.5 flex-1"
                  >
                    <option value="">All levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <select
                    value={filter.category}
                    onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
                    className="input text-xs py-1.5 flex-1"
                  >
                    <option value="">All topics</option>
                    <option value="basics">Basics</option>
                    <option value="arrays">Arrays</option>
                    <option value="stack">Stack</option>
                    <option value="sorting">Sorting</option>
                    <option value="searching">Searching</option>
                    <option value="recursion">Recursion</option>
                  </select>
                </div>
              </div>

              {/* Problem list */}
              <div className="flex-1 overflow-y-auto">
                {filteredProblems.map(problem => (
                  <button
                    key={problem.id}
                    onClick={() => handleProblemSelect(problem)}
                    className={`w-full text-left px-4 py-3.5 border-b border-white/5 hover:bg-white/3 transition-all ${
                      selectedProblem?.id === problem.id ? 'bg-syless-500/8 border-l-2 border-l-syless-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-200">{problem.title}</span>
                      <span className={`badge text-[10px] ${DIFFICULTY_COLORS[problem.difficulty] || ''}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-600 capitalize">{problem.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Visualizer selector */
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-3">Interactive DSA visualizations</p>
              {VISUALIZERS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveViz(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                    activeViz === id
                      ? 'bg-syless-500/15 border border-syless-500/30 text-syless-300'
                      : 'glass border border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                  <ChevronRight size={14} className="ml-auto" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'problems' && selectedProblem ? (
            <>
              {/* Problem description */}
              <div className="p-6 border-b border-white/5 shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{selectedProblem.title}</h2>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${DIFFICULTY_COLORS[selectedProblem.difficulty] || ''}`}>
                        {selectedProblem.difficulty}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{selectedProblem.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary px-5 py-2 text-sm disabled:opacity-40"
                  >
                    <Play size={14} />
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-4 leading-relaxed">{selectedProblem.description}</p>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-hidden">
                <textarea
                  value={editorCode}
                  onChange={e => setEditorCode(e.target.value)}
                  className="w-full h-full bg-dark-400/50 text-gray-200 font-mono text-sm p-6 resize-none focus:outline-none focus:ring-1 focus:ring-syless-500/30 border-none"
                  placeholder="Write your SYLESS solution here..."
                  spellCheck={false}
                />
              </div>

              {/* Submission result */}
              <AnimatePresence>
                {submitResult && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`border-t px-6 py-4 ${
                      submitResult.verdict === 'Accepted'
                        ? 'border-green-500/20 bg-green-500/5'
                        : 'border-red-500/20 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {submitResult.verdict === 'Accepted' ? (
                        <CheckCircle2 size={20} className="text-green-400" />
                      ) : (
                        <XCircle size={20} className="text-red-400" />
                      )}
                      <div>
                        <span className={`font-bold ${submitResult.verdict === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>
                          {submitResult.verdict}
                        </span>
                        <span className="text-gray-400 text-sm ml-3">
                          {submitResult.passed}/{submitResult.total} test cases passed
                        </span>
                      </div>
                    </div>
                    {submitResult.error && (
                      <p className="text-red-300 text-sm mt-2 font-mono">{submitResult.error}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : activeTab === 'visualizers' ? (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-2">
                  {VISUALIZERS.find(v => v.id === activeViz)?.icon}{' '}
                  {VISUALIZERS.find(v => v.id === activeViz)?.label} Visualizer
                </h2>
                <p className="text-gray-400 text-sm mb-8">Interact with the visualizer to understand how this data structure works.</p>
                {ActiveViz && <ActiveViz />}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a problem to start solving</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
