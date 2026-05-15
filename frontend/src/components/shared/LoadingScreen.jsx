import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark-500 flex flex-col items-center justify-center z-50">
      <motion.div
        className="flex flex-col items-center gap-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-syless-500 to-cyber-400 flex items-center justify-center text-3xl font-bold font-display shadow-glow"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            S
          </motion.div>
          <motion.div
            className="absolute -inset-2 rounded-2xl border border-syless-500/30"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold gradient-text font-display">SYLESS</h1>
          <p className="text-gray-400 text-sm mt-1">Code Like You Think</p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-dark-300 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-syless-500 to-cyber-400 rounded-full"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
