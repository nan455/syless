import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useStore from '@store/useStore';
import Sidebar from '@components/Sidebar/Sidebar';
import { API } from '@store/useStore';
import {
  Code2, Zap, BarChart2, Star, TrendingUp, Clock,
  Award, Target, ArrowRight, Flame, BookOpen, Crown
} from 'lucide-react';

const LEVEL_TITLES = [
  '', 'Code Newbie', 'Syntax Learner', 'Loop Master', 'Function Wizard',
  'Algorithm Explorer', 'DSA Champion', 'Code Architect', 'SYLESS Expert', 'Code Legend'
];

function StatCard({ icon: Icon, label, value, sub, color = 'syless' }) {
  const colorMap = {
    syless: 'from-syless-500/20 to-syless-600/20 border-syless-500/30',
    cyber: 'from-cyber-400/20 to-cyber-500/20 border-cyber-400/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  return (
    <div className={`card bg-gradient-to-br ${colorMap[color]}`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
          <Icon size={22} className={color === 'cyber' ? 'text-cyber-400' : color === 'green' ? 'text-green-400' : color === 'yellow' ? 'text-yellow-400' : 'text-syless-400'} />
        </div>
        <div>
          <div className="text-2xl font-black">{value}</div>
          <div className="text-sm text-gray-400">{label}</div>
          {sub && <div className="text-xs text-gray-600">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, fetchMe } = useStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always load fresh stats when dashboard opens
    fetchMe();
    (async () => {
      try {
        const { data } = await API.get('/dsa/leaderboard');
        setLeaderboard(data.leaderboard || []);
      } catch {
        setLeaderboard([]);
      }
      setLoading(false);
    })();
  }, []);

  const level = user?.stats_level || 1;
  const xp = user?.stats_xp || 0;
  const xpToNext = level * level * 100;
  const progress = Math.min((xp / xpToNext) * 100, 100);
  const levelTitle = LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)];

  return (
    <div className="flex h-screen bg-dark-500 overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-black font-display">
                Welcome back, <span className="gradient-text">{user?.username}</span>! 👋
              </h1>
              <p className="text-gray-400 mt-1">Here's your coding journey so far</p>
            </div>
            <Link to="/ide" className="btn-primary">
              <Code2 size={16} />
              Open IDE
            </Link>
          </motion.div>

          {/* Level & XP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card mb-8 bg-gradient-to-r from-syless-500/10 to-cyber-400/10 border-syless-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-syless-500 to-cyber-400 flex items-center justify-center text-2xl font-black shadow-glow">
                    {level}
                  </div>
                  <Crown size={14} className="absolute -top-1.5 -right-1.5 text-yellow-400" />
                </div>
                <div>
                  <div className="font-bold text-lg">{levelTitle}</div>
                  <div className="text-sm text-gray-400">Level {level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black gradient-text">{xp} XP</div>
                <div className="text-xs text-gray-500">{xpToNext - xp} XP to Level {level + 1}</div>
              </div>
            </div>
            <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-syless-500 to-cyber-400"
              />
            </div>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Target, label: 'Problems Solved', value: user?.stats_problems_solved || 0, sub: 'Keep it up!', color: 'syless' },
              { icon: Code2, label: 'Total Runs', value: user?.stats_total_runs || 0, sub: 'Lines executed', color: 'cyber' },
              { icon: Flame, label: 'Day Streak', value: `${user?.stats_streak || 0}🔥`, sub: 'Days in a row', color: 'yellow' },
              { icon: TrendingUp, label: 'XP Earned', value: xp, sub: `Level ${level} coder`, color: 'green' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                <StatCard {...stat} />
              </motion.div>
            ))}
          </div>

          {/* Two columns: quick actions + leaderboard */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="card">
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { icon: Code2, label: 'Continue Coding', desc: 'Open the IDE and keep building', href: '/ide', color: 'text-syless-400' },
                    { icon: BarChart2, label: 'Solve DSA Problem', desc: 'Practice with interactive problems', href: '/dsa', color: 'text-cyber-400' },
                    { icon: Zap, label: 'Talk to ARIA', desc: 'Get AI guidance and explanations', href: '/ai-tutor', color: 'text-yellow-400' },
                    { icon: BookOpen, label: 'Learn Something New', desc: 'Follow the structured curriculum', href: '/ai-tutor', color: 'text-green-400' },
                  ].map(({ icon: Icon, label, desc, href, color }) => (
                    <Link
                      key={label}
                      to={href}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3 border border-transparent hover:border-white/5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center group-hover:border-syless-500/30">
                        <Icon size={18} className={color} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{label}</div>
                        <div className="text-xs text-gray-500">{desc}</div>
                      </div>
                      <ArrowRight size={14} className="text-gray-600 group-hover:text-syless-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="card">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Award size={16} className="text-yellow-400" />
                  Leaderboard
                </h3>
                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="skeleton h-12 rounded-xl" />
                    ))}
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <Award size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No rankings yet — be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.slice(0, 8).map((entry, i) => {
                      const isMe = entry.username === user?.username;
                      const medals = ['🥇', '🥈', '🥉'];
                      return (
                        <div
                          key={entry.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                            isMe ? 'bg-syless-500/10 border border-syless-500/25' : 'hover:bg-white/3'
                          }`}
                        >
                          <span className="w-6 text-center text-sm">
                            {i < 3 ? medals[i] : `${i + 1}.`}
                          </span>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-syless-500 to-cyber-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {entry.username?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {entry.username} {isMe && <span className="badge-purple text-[9px] ml-1">You</span>}
                            </div>
                            <div className="text-[10px] text-gray-600">Level {entry.stats_level || 1}</div>
                          </div>
                          <div className="text-sm font-bold gradient-text">{entry.stats_xp || 0} XP</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Support banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 card bg-gradient-to-r from-syless-500/10 via-cyber-400/5 to-syless-500/10 border-syless-500/20"
          >
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">❤️</span>
                  <span className="font-bold">SYLESS is free forever</span>
                </div>
                <p className="text-sm text-gray-400">Enjoying SYLESS? Consider supporting us to keep the servers running and new features coming.</p>
              </div>
              <a
                href="https://www.buymeacoffee.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary whitespace-nowrap px-5 py-2.5 text-sm shrink-0"
              >
                ☕ Support Us
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
