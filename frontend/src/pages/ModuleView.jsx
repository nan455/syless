import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore, { API } from '@store/useStore';
import Sidebar from '@components/Sidebar/Sidebar';
import {
  ChevronLeft, ChevronRight, Play, CheckCircle2, XCircle,
  Lightbulb, BookOpen, Code2, Zap, RotateCcw,
} from 'lucide-react';

function CodeBlock({ code }) {
  return (
    <div className="bg-dark-400/60 border border-white/8 rounded-xl p-4 font-mono text-sm text-syless-300 whitespace-pre overflow-x-auto">
      {code}
    </div>
  );
}

function TheoryPanel({ mod }) {
  const [activeEx, setActiveEx] = useState(null);
  const [tab, setTab] = useState('learn');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/5 shrink-0">
        {[
          { id: 'learn', label: 'Learn', icon: BookOpen },
          { id: 'examples', label: 'Examples', icon: Code2 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === id
                ? 'border-syless-500 text-syless-300'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'learn' && (
          <div className="space-y-7">
            {/* Module intro */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{mod.icon}</span>
              <div>
                <h2 className="text-xl font-bold">{mod.title}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  mod.level === 'beginner'
                    ? 'bg-green-400/10 text-green-400'
                    : 'bg-yellow-400/10 text-yellow-400'
                }`}>{mod.level} • {mod.xp} XP</span>
              </div>
            </div>

            {mod.theory.sections.map((sec, i) => (
              <div key={i}>
                <h3 className="text-sm font-bold text-syless-300 mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-syless-500/20 text-syless-400 text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {sec.title}
                </h3>
                <div className="text-sm text-gray-400 leading-relaxed space-y-2">
                  {sec.content.split('\n').map((line, j) => {
                    // Render inline code with backticks
                    const parts = line.split('`');
                    return (
                      <p key={j}>
                        {parts.map((part, k) =>
                          k % 2 === 1
                            ? <code key={k} className="bg-syless-500/15 text-syless-300 px-1.5 py-0.5 rounded text-xs font-mono">{part}</code>
                            : <span key={k}>{part.replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'examples' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 mb-4">Click an example to load it into the editor.</p>
            {mod.theory.examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => setActiveEx(i)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  activeEx === i
                    ? 'border-syless-500/40 bg-syless-500/5'
                    : 'border-white/8 hover:border-white/15 bg-dark-400/30'
                }`}
              >
                <div className="text-xs font-semibold text-syless-300 mb-2">{ex.label}</div>
                <CodeBlock code={ex.code} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModuleView() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const { fetchMe } = useStore();

  const [mod, setMod]             = useState(null);
  const [allMods, setAllMods]     = useState([]);
  const [progress, setProgress]   = useState(null);
  const [code, setCode]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]       = useState(null);
  const [showHint, setShowHint]   = useState(false);
  const [hintIdx, setHintIdx]     = useState(0);
  const [activePanel, setActivePanel] = useState('theory'); // theory | exercise
  const textareaRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [modRes, modsRes, progRes] = await Promise.all([
          API.get(`/learn/modules/${slug}`),
          API.get('/learn/modules'),
          API.get('/learn/progress'),
        ]);
        const m = modRes.data.module;
        setMod(m);
        setCode(m.exercise.starterCode || '');
        setAllMods(modsRes.data.modules || []);

        const progMap = {};
        (progRes.data.progress || []).forEach(p => { progMap[p.module_id] = p; });
        setProgress(progMap[m.id] || null);
      } catch { /* not found */ }
    })();
  }, [slug]);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await API.post(`/learn/submit/${slug}`, { code });
      setResult(data);
      if (data.verdict === 'Accepted') {
        fetchMe();
        setProgress(prev => ({ ...prev, completed: true }));
      }
    } catch {
      setResult({ verdict: 'Error', error: 'Could not connect to server' });
    }
    setSubmitting(false);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit();
    // Tab key inserts 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 4; }, 0);
    }
  };

  // Navigation between modules
  const currentIdx = allMods.findIndex(m => m.slug === slug);
  const prevMod = allMods[currentIdx - 1];
  const nextMod = allMods[currentIdx + 1];

  if (!mod) {
    return (
      <div className="flex h-screen bg-dark-500 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="skeleton w-48 h-6 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-500 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 glass-dark shrink-0">
          <button onClick={() => navigate('/learn')} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={14} /> Back to Modules
          </button>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-sm font-semibold">{mod.icon} {mod.title}</span>
          <span className={`badge text-xs ${mod.level === 'beginner' ? 'text-green-400 bg-green-400/10 border-green-400/30' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'}`}>
            {mod.level}
          </span>
          {progress?.completed && (
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={12} /> Completed
            </span>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-xs text-yellow-400">
            <Zap size={12} /> {mod.xp} XP
          </div>
          <div className="flex gap-1">
            {prevMod && (
              <button onClick={() => navigate(`/learn/${prevMod.slug}`)} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                <ChevronLeft size={14} />
              </button>
            )}
            {nextMod && (
              <button onClick={() => navigate(`/learn/${nextMod.slug}`)} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Main split: theory | editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Theory */}
          <div className="w-[45%] border-r border-white/5 flex flex-col overflow-hidden shrink-0">
            <TheoryPanel mod={mod} />
          </div>

          {/* Right: Exercise + Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Exercise description */}
            <div className="px-6 py-4 border-b border-white/5 bg-dark-400/20 shrink-0">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                <Code2 size={14} className="text-syless-400" />
                {mod.exercise.title}
              </h3>
              <div className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                {mod.exercise.description}
              </div>

              {/* Hints */}
              {mod.exercise.hints?.length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => { setShowHint(!showHint); setHintIdx(0); }}
                    className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <Lightbulb size={12} />
                    {showHint ? 'Hide hints' : 'Show hint'}
                  </button>
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 flex items-start gap-2">
                          <div className="flex-1 bg-yellow-400/5 border border-yellow-400/20 rounded-lg px-3 py-2 text-xs text-yellow-300">
                            💡 {mod.exercise.hints[hintIdx]}
                          </div>
                          {mod.exercise.hints.length > 1 && (
                            <button
                              onClick={() => setHintIdx(i => (i + 1) % mod.exercise.hints.length)}
                              className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-all shrink-0"
                            >
                              Next hint ({hintIdx + 1}/{mod.exercise.hints.length})
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Code editor */}
            <div className="flex-1 relative overflow-hidden">
              <div className="absolute top-2 right-3 text-[10px] text-gray-600 z-10">
                Ctrl+Enter to submit
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-full bg-dark-400/30 text-gray-200 font-mono text-sm p-5 resize-none focus:outline-none leading-relaxed"
                placeholder="Write your SYLESS solution here..."
                spellCheck={false}
              />
            </div>

            {/* Footer: reset + submit */}
            <div className="flex items-center gap-3 px-5 py-3 border-t border-white/5 bg-dark-400/20 shrink-0">
              <button
                onClick={() => { setCode(mod.exercise.starterCode || ''); setResult(null); }}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-all hover:border-white/20"
              >
                <RotateCcw size={12} /> Reset
              </button>
              <div className="flex-1" />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary px-6 py-2 text-sm disabled:opacity-40"
              >
                <Play size={14} />
                {submitting ? 'Checking…' : 'Submit'}
              </button>
            </div>

            {/* Result panel */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={`border-t px-6 py-4 shrink-0 ${
                    result.verdict === 'Accepted'
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {result.verdict === 'Accepted'
                      ? <CheckCircle2 size={18} className="text-green-400" />
                      : <XCircle size={18} className="text-red-400" />
                    }
                    <span className={`font-bold text-sm ${result.verdict === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>
                      {result.verdict}
                    </span>
                    {result.total > 0 && (
                      <span className="text-gray-500 text-xs">{result.passed}/{result.total} test cases passed</span>
                    )}
                    {result.xpEarned > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full ml-2"
                      >
                        <Zap size={10} /> +{result.xpEarned} XP earned!
                      </motion.span>
                    )}
                    {result.alreadyCompleted && (
                      <span className="text-xs text-gray-500 ml-2">Already completed — no bonus XP</span>
                    )}
                  </div>

                  {result.error && (
                    <pre className="text-red-300 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-2 overflow-x-auto">
                      {result.error}
                    </pre>
                  )}

                  {result.verdict === 'Wrong Answer' && result.results?.[0] && (
                    <div className="text-xs mt-2 space-y-1">
                      <div className="text-gray-500">Expected: <code className="text-green-300">{result.results[0].expected}</code></div>
                      <div className="text-gray-500">Got: <code className="text-red-300">{result.results[0].actual}</code></div>
                    </div>
                  )}

                  {result.verdict === 'Accepted' && nextMod && (
                    <button
                      onClick={() => navigate(`/learn/${nextMod.slug}`)}
                      className="mt-3 flex items-center gap-2 text-xs text-green-400 hover:text-green-300 transition-colors"
                    >
                      Next module: {nextMod.icon} {nextMod.title} <ChevronRight size={12} />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
