import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Code2, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-black gradient-text font-display mb-4">404</div>
        <div className="code-block text-sm mb-6 text-left">
          <div className="text-gray-500 mb-2"># Page not found</div>
          <div className="text-syless-400">check page == "valid" {'{'}</div>
          <div className="text-gray-300 ml-8">say -&gt; "Page found!"</div>
          <div className="text-syless-400">{'}'} otherwise {'{'}</div>
          <div className="text-red-400 ml-8">say -&gt; "Error 404: page not found"</div>
          <div className="text-syless-400">{'}'}</div>
        </div>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist in SYLESS universe.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            <Home size={16} />
            Go Home
          </Link>
          <Link to="/ide" className="btn-secondary">
            <Code2 size={16} />
            Open IDE
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
