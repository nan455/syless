import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API } from '@store/useStore';
import useStore from '@store/useStore';

const LEVELS = [
  {
    id: 'beginner',
    icon: '🌱',
    title: 'Beginner',
    subtitle: 'New to programming',
    desc: 'Start from zero. Learn variables, loops, functions step by step.',
    modules: '8 modules',
    color: 'border-green-500/40 hover:border-green-400/70 hover:bg-green-500/5',
    badge: 'text-green-400 bg-green-400/10',
  },
  {
    id: 'intermediate',
    icon: '⚡',
    title: 'Intermediate',
    subtitle: 'Know the basics',
    desc: 'Skip to DSA — recursion, stacks, queues, sorting, graphs.',
    modules: '8 modules',
    color: 'border-yellow-500/40 hover:border-yellow-400/70 hover:bg-yellow-500/5',
    badge: 'text-yellow-400 bg-yellow-400/10',
  },
  {
    id: 'all',
    icon: '🚀',
    title: 'Full Path',
    subtitle: 'Learn everything',
    desc: 'All 16 modules from Hello World to Graph Traversal.',
    modules: '16 modules',
    color: 'border-syless-500/40 hover:border-syless-400/70 hover:bg-syless-500/5',
    badge: 'text-syless-400 bg-syless-400/10',
  },
];

export default function LevelPicker() {
  const { setUser, user } = useStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const pick = async (levelId) => {
    setSaving(true);
    try {
      const { data } = await API.put('/learn/level', { level: levelId });
      if (data.success) setUser(data.user);
    } catch { /* save failed silently — still navigate */ }
    navigate('/learn');
  };

  return (
    <div className="fixed inset-0 bg-dark-500/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">👋</div>
          <h1 className="text-3xl font-black font-display mb-2">
            Welcome, <span className="gradient-text">{user?.username}</span>!
          </h1>
          <p className="text-gray-400">Choose your starting level to get a personalised learning path.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {LEVELS.map((level, i) => (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => pick(level.id)}
              disabled={saving}
              className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-all text-left disabled:opacity-50 ${level.color}`}
            >
              <div className="text-4xl shrink-0">{level.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg font-bold">{level.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${level.badge}`}>
                    {level.modules}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-1">{level.subtitle}</div>
                <div className="text-sm text-gray-400">{level.desc}</div>
              </div>
              <div className="text-gray-600 shrink-0">→</div>
            </motion.button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          You can change this any time from the Learn page settings.
        </p>
      </motion.div>
    </div>
  );
}
