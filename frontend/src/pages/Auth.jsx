import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '@store/useStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Code2, ArrowLeft, Zap } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { login, register, isAuthenticated } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/ide');
  }, [isAuthenticated]);

  const setField = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        if (!form.username || form.username.length < 3) {
          toast.error('Username must be at least 3 characters');
          return;
        }
        await register(form.username, form.email, form.password);
        toast.success('Account created! Welcome to SYLESS!');
      }
      navigate('/ide');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-syless-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-cyber-400/6 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back link */}
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass-dark rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-syless-500 to-cyber-400 flex items-center justify-center text-lg font-bold shadow-glow-sm">
                S
              </div>
              <div>
                <div className="font-bold text-lg gradient-text font-display">SYLESS</div>
                <div className="text-xs text-gray-500">Code Like You Think</div>
              </div>
            </div>

            <h1 className="text-2xl font-black font-display">
              {mode === 'login' ? 'Welcome back' : 'Start your journey'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {mode === 'login'
                ? 'Sign in to continue coding'
                : 'Create your free account — no credit card needed'}
            </p>

            {/* Toggle */}
            <div className="flex p-1 mt-5 glass rounded-xl border border-white/5">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === m
                      ? 'bg-syless-500 text-white shadow-glow-sm'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <label className="text-sm text-gray-400 mb-1.5 block">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={setField('username')}
                    placeholder="your_username"
                    className="input w-full"
                    required
                    autoComplete="username"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={setField('email')}
                placeholder="you@example.com"
                className="input w-full"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={setField('password')}
                  placeholder={mode === 'register' ? 'Min. 6 characters' : 'Your password'}
                  className="input w-full pr-12"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base justify-center mt-2 disabled:opacity-50 disabled:cursor-wait"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={18} />
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>

            {/* Guest/Demo */}
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-3">— or —</div>
              <Link to="/ide" className="text-sm text-syless-400 hover:text-syless-300 transition-colors">
                Continue as Guest (no account needed)
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-gray-600">
              By continuing, you agree to our{' '}
              <a href="#" className="text-syless-400 hover:underline">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-syless-400 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </motion.div>

        {/* Features reminder */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {['Free Forever', 'AI Tutor Included', '200+ Problems'].map((f) => (
            <div key={f} className="text-center p-3 glass rounded-xl border border-white/5">
              <div className="text-xs text-gray-400">{f}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
