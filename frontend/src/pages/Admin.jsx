import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '@store/useStore';
import Sidebar from '@components/Sidebar/Sidebar';
import { API } from '@store/useStore';
import toast from 'react-hot-toast';
import {
  Users, BookOpen, TrendingUp, Shield, Plus, Edit2,
  Trash2, Search, ChevronRight, BarChart2, Check
} from 'lucide-react';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [newProblem, setNewProblem] = useState({
    title: '', description: '', difficulty: 'easy', category: 'basics',
    starter_code: { syless: '' },
    test_cases: [{ input: '', expectedOutput: '' }],
  });
  const [addingProblem, setAddingProblem] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      toast.error('Failed to load admin data');
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await API.put(`/admin/users/${userId}`, { is_active: !isActive });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !isActive } : u));
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update user');
    }
  };

  const upgradeUser = async (userId, plan) => {
    try {
      await API.put(`/admin/users/${userId}`, { subscription_plan: plan, role: plan === 'pro' ? 'pro' : 'user' });
      toast.success(`User upgraded to ${plan}`);
      loadData();
    } catch {
      toast.error('Failed to upgrade user');
    }
  };

  const createProblem = async () => {
    setAddingProblem(true);
    try {
      await API.post('/admin/problems', newProblem);
      toast.success('Problem created!');
      setNewProblem({ title: '', description: '', difficulty: 'easy', category: 'basics', starter_code: { syless: '' }, test_cases: [{ input: '', expectedOutput: '' }] });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create problem');
    }
    setAddingProblem(false);
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'problems', label: 'Add Problem', icon: Plus },
  ];

  return (
    <div className="flex h-screen bg-dark-500 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-white/5 glass-dark shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/30 to-pink-500/30 border border-red-500/40 flex items-center justify-center">
              <Shield size={18} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="text-xs text-gray-500">SYLESS platform management</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                  activeTab === id
                    ? 'bg-syless-500/20 text-syless-300 border border-syless-500/30'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Overview */}
          {activeTab === 'overview' && stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-syless-400' },
                  { label: 'Pro Users', value: stats.proUsers, icon: TrendingUp, color: 'text-green-400' },
                  { label: 'Free Users', value: stats.freeUsers, icon: Users, color: 'text-gray-400' },
                  { label: 'Total Problems', value: stats.totalProblems, icon: BookOpen, color: 'text-cyber-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="card">
                    <Icon size={20} className={`mb-3 ${color}`} />
                    <div className="text-2xl font-black">{value}</div>
                    <div className="text-sm text-gray-400">{label}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <h3 className="font-bold mb-4">Platform Health</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Compiler Engine', status: 'Operational' },
                    { label: 'AI Service (ARIA)', status: 'Operational' },
                    { label: 'Database', status: 'Operational' },
                    { label: 'WebSocket Collaboration', status: 'Operational' },
                  ].map(({ label, status }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-300">{label}</span>
                      <span className="badge-green text-xs flex items-center gap-1">
                        <Check size={10} />
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="input text-sm pl-9"
                  />
                </div>
              </div>

              <div className="card overflow-hidden p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 text-xs">
                      <th className="text-left px-5 py-3 font-medium">User</th>
                      <th className="text-left px-5 py-3 font-medium">Role</th>
                      <th className="text-left px-5 py-3 font-medium">Plan</th>
                      <th className="text-left px-5 py-3 font-medium">Stats</th>
                      <th className="text-left px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-syless-500 to-cyber-400 flex items-center justify-center text-xs font-bold shrink-0">
                              {user.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="badge badge-purple capitalize">{user.role}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`badge capitalize ${user.subscription_plan === 'pro' ? 'badge-cyan' : 'text-gray-400 bg-white/5 border-white/10'}`}>
                            {user.subscription_plan || 'free'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500">
                          {user.stats_problems_solved || 0} solved • {user.stats_xp || 0} XP
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleUserStatus(user.id, user.is_active)}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                                user.is_active
                                  ? 'text-red-400 border-red-500/30 hover:bg-red-500/10'
                                  : 'text-green-400 border-green-500/30 hover:bg-green-500/10'
                              }`}
                            >
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            {user.subscription_plan === 'free' && (
                              <button
                                onClick={() => upgradeUser(user.id, 'pro')}
                                className="text-xs px-2.5 py-1 rounded-lg border border-syless-500/30 text-syless-400 hover:bg-syless-500/10 transition-all"
                              >
                                → Pro
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-10 text-gray-600">No users found</div>
                )}
              </div>
            </motion.div>
          )}

          {/* Add Problem */}
          {activeTab === 'problems' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <h2 className="text-xl font-bold mb-6">Create New DSA Problem</h2>
              <div className="card space-y-5">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Title</label>
                  <input
                    value={newProblem.title}
                    onChange={e => setNewProblem(p => ({ ...p, title: e.target.value }))}
                    className="input w-full"
                    placeholder="Problem title..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Difficulty</label>
                    <select
                      value={newProblem.difficulty}
                      onChange={e => setNewProblem(p => ({ ...p, difficulty: e.target.value }))}
                      className="input w-full"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Category</label>
                    <select
                      value={newProblem.category}
                      onChange={e => setNewProblem(p => ({ ...p, category: e.target.value }))}
                      className="input w-full"
                    >
                      <option value="basics">Basics</option>
                      <option value="arrays">Arrays</option>
                      <option value="strings">Strings</option>
                      <option value="stack">Stack</option>
                      <option value="queue">Queue</option>
                      <option value="tree">Tree</option>
                      <option value="sorting">Sorting</option>
                      <option value="searching">Searching</option>
                      <option value="recursion">Recursion</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Description</label>
                  <textarea
                    value={newProblem.description}
                    onChange={e => setNewProblem(p => ({ ...p, description: e.target.value }))}
                    className="input w-full h-28 resize-none"
                    placeholder="Problem description..."
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Starter Code (SYLESS)</label>
                  <textarea
                    value={newProblem.starter_code.syless}
                    onChange={e => setNewProblem(p => ({ ...p, starter_code: { syless: e.target.value } }))}
                    className="input w-full h-28 resize-none font-mono text-sm"
                    placeholder="# Write starter code here..."
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Test Case</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={newProblem.test_cases[0]?.input}
                      onChange={e => setNewProblem(p => ({ ...p, test_cases: [{ ...p.test_cases[0], input: e.target.value }] }))}
                      className="input"
                      placeholder="Input (optional)"
                    />
                    <input
                      value={newProblem.test_cases[0]?.expectedOutput}
                      onChange={e => setNewProblem(p => ({ ...p, test_cases: [{ ...p.test_cases[0], expectedOutput: e.target.value }] }))}
                      className="input"
                      placeholder="Expected output"
                    />
                  </div>
                </div>
                <button
                  onClick={createProblem}
                  disabled={addingProblem || !newProblem.title || !newProblem.description}
                  className="btn-primary w-full py-3 disabled:opacity-40"
                >
                  <Plus size={16} />
                  {addingProblem ? 'Creating...' : 'Create Problem'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
