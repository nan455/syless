import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore, { API } from '@store/useStore';
import Sidebar from '@components/Sidebar/Sidebar';
import LevelPicker from '@components/Onboarding/LevelPicker';
import { CheckCircle2, Lock, ChevronRight, Star, Zap, BookOpen, RotateCcw } from 'lucide-react';

const LEVEL_COLORS = {
  beginner:     { badge: 'text-green-400 bg-green-400/10 border-green-400/30', bar: 'from-green-500 to-green-400' },
  intermediate: { badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', bar: 'from-yellow-500 to-yellow-400' },
};

const TRACK_META = {
  beginner: {
    icon: '🌱', label: 'Beginner Track', sub: 'From zero to SYLESS basics',
    desc: 'Variables · Conditions · Loops · Functions · Arrays · Input/Output',
  },
  intermediate: {
    icon: '⚡', label: 'Intermediate Track', sub: 'Data Structures & Algorithms',
    desc: 'Recursion · Stack · Queue · Linked List · Sorting · Searching · Graphs',
  },
};

export default function Learn() {
  const { user, setUser } = useStore();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});   // { moduleId: progressRow }
  const [loading, setLoading] = useState(true);

  const learningLevel = user?.preferences?.learning_level;
  const showPicker = !learningLevel;

  useEffect(() => {
    if (showPicker) return;
    (async () => {
      try {
        const level = learningLevel === 'all' ? undefined : learningLevel;
        const [modsRes, progRes] = await Promise.all([
          API.get('/learn/modules', { params: level ? { level } : {} }),
          API.get('/learn/progress'),
        ]);
        setModules(modsRes.data.modules || []);
        const progMap = {};
        (progRes.data.progress || []).forEach(p => { progMap[p.module_id] = p; });
        setProgress(progMap);
      } catch { /* offline */ }
      setLoading(false);
    })();
  }, [learningLevel, showPicker]);

  const resetLevel = async () => {
    try {
      const prefs = { ...(user?.preferences || {}), learning_level: null };
      const { data } = await API.put('/auth/profile', { preferences: prefs });
      if (data.success) setUser(data.user);
    } catch { /* ignore */ }
  };

  // Group by level
  const beginnerMods     = modules.filter(m => m.level === 'beginner');
  const intermediateMods = modules.filter(m => m.level === 'intermediate');
  const tracks = learningLevel === 'all'
    ? [{ key: 'beginner', mods: beginnerMods }, { key: 'intermediate', mods: intermediateMods }]
    : [{ key: learningLevel, mods: modules }];

  const totalCompleted = Object.values(progress).filter(p => p.completed).length;
  const totalXP = modules.reduce((sum, m) => {
    const p = progress[m.id];
    return sum + (p?.completed ? m.xp : 0);
  }, 0);

  if (showPicker) {
    return (
      <div className="flex h-screen bg-dark-500 overflow-hidden">
        <Sidebar />
        <LevelPicker onDone={(lvl) => {}} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-500 overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="p-8 pb-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-black font-display mb-1">
                  Learning Path <span className="gradient-text">✦</span>
                </h1>
                <p className="text-gray-400 text-sm">Master SYLESS one concept at a time</p>
              </div>
              <button onClick={resetLevel} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-all hover:border-white/20">
                <RotateCcw size={12} /> Change Level
              </button>
            </div>

            {/* Overall stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: CheckCircle2, label: 'Completed', value: totalCompleted, color: 'text-green-400' },
                { icon: Star, label: 'XP Earned', value: `${totalXP} XP`, color: 'text-yellow-400' },
                { icon: BookOpen, label: 'Total Modules', value: modules.length, color: 'text-syless-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="card flex items-center gap-4">
                  <Icon size={20} className={color} />
                  <div>
                    <div className="text-xl font-black">{value}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tracks */}
        <div className="px-8 pb-12">
          <div className="max-w-4xl mx-auto space-y-10">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
              </div>
            ) : (
              tracks.map(({ key, mods }) => {
                const meta = TRACK_META[key] || {};
                const done = mods.filter(m => progress[m.id]?.completed).length;
                const pct  = mods.length ? Math.round((done / mods.length) * 100) : 0;
                const colors = LEVEL_COLORS[key] || LEVEL_COLORS.beginner;

                return (
                  <div key={key}>
                    {/* Track header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-3xl">{meta.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-0.5">
                          <h2 className="font-bold text-lg">{meta.label}</h2>
                          <span className={`badge text-xs ${colors.badge}`}>
                            {done}/{mods.length} done
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{meta.desc}</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-dark-300 rounded-full mb-5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
                      />
                    </div>

                    {/* Module cards */}
                    <div className="space-y-3">
                      {mods.map((mod, idx) => {
                        const prog    = progress[mod.id];
                        const done    = prog?.completed;
                        const prevDone = idx === 0 || progress[mods[idx - 1]?.id]?.completed;
                        const locked  = false; // no lock — all open

                        return (
                          <motion.button
                            key={mod.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => navigate(`/learn/${mod.slug}`)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                              done
                                ? 'bg-green-500/5 border-green-500/25 hover:border-green-500/40'
                                : 'glass border-white/8 hover:border-syless-500/30 hover:bg-syless-500/5'
                            }`}
                          >
                            {/* Order / check */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                              done ? 'bg-green-500/20 text-green-400' : 'bg-dark-300/60 text-gray-500'
                            }`}>
                              {done ? <CheckCircle2 size={18} /> : mod.order}
                            </div>

                            {/* Icon + title */}
                            <div className="text-2xl shrink-0">{mod.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-semibold text-sm">{mod.title}</span>
                                {done && (
                                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Completed</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">{mod.exerciseTitle}</p>
                            </div>

                            {/* XP */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Zap size={12} className={done ? 'text-green-400' : 'text-yellow-400'} />
                              <span className={`text-xs font-bold ${done ? 'text-green-400' : 'text-yellow-400'}`}>
                                {mod.xp} XP
                              </span>
                            </div>

                            <ChevronRight size={16} className="text-gray-600 group-hover:text-syless-400 transition-colors shrink-0" />
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
