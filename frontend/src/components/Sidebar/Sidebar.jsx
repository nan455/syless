import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '@store/useStore';
import {
  Code2, BarChart2, Zap, Home, ChevronLeft, ChevronRight,
  LayoutDashboard, Settings, BookOpen, Users, Shield
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Code2, label: 'IDE', href: '/ide' },
  { icon: BookOpen, label: 'Learn', href: '/learn' },
  { icon: BarChart2, label: 'DSA', href: '/dsa' },
  { icon: Zap, label: 'AI Tutor', href: '/ai-tutor' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
];

const ADMIN_ITEMS = [
  { icon: Shield, label: 'Admin', href: '/admin' },
];

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, user } = useStore();
  const location = useLocation();

  const isActive = (href) => location.pathname === href;

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-full glass-dark border-r border-white/5 shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-syless-500 to-cyber-400 flex items-center justify-center text-sm font-bold shrink-0 shadow-glow-sm">
          S
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-sm font-bold gradient-text font-display whitespace-nowrap">SYLESS</span>
              <span className="text-[10px] text-gray-600 whitespace-nowrap">Code Like You Think</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              to={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                active
                  ? 'bg-syless-500/15 border border-syless-500/25 text-syless-300'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
              title={sidebarCollapsed ? label : undefined}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-syless-500" />
              )}
              <Icon size={17} className={active ? 'text-syless-400' : ''} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <>
            <div className="h-px bg-white/5 mx-2 my-2" />
            {ADMIN_ITEMS.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive(href) ? 'bg-syless-500/15 text-syless-300' : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon size={17} />
                {!sidebarCollapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User badge */}
      {user && !sidebarCollapsed && (
        <div className="px-3 py-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-syless-500 to-cyber-400 flex items-center justify-center text-xs font-bold shrink-0">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-medium truncate">{user.username}</div>
              <div className="text-[10px] text-gray-500 capitalize">{user.subscription?.plan || 'free'} plan</div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full glass-dark border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-syless-500/40 transition-all z-10 shadow-lg"
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
