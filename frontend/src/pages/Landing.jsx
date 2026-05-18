import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Code2, Zap, BookOpen, BarChart2, Shield, Star, ChevronRight,
  Play, ArrowRight, Users, Award, TrendingUp, Brain,
  Terminal, Cpu, Globe, Lock, Rocket, FileText, MessageSquare
} from 'lucide-react';
import Navbar from '@components/Nav/Navbar';

// ─── Hero Code Demo ────────────────────────────────────────────────────────────
const DEMO_LINES = [
  { syless: 'say -> "Hello, World!"',       python: 'print("Hello, World!")',         delay: 0 },
  { syless: 'make score = 95',              python: 'score = 95',                      delay: 0.3 },
  { syless: 'check score >= 90 {',         python: 'if score >= 90:',                 delay: 0.6 },
  { syless: '    say -> "A Grade!"',        python: '    print("A Grade!")',            delay: 0.9 },
  { syless: '}',                            python: '',                                delay: 1.1 },
  { syless: 'loop 3 times {',              python: 'for _i in range(3):',             delay: 1.3 },
  { syless: '    say -> "Keep coding!"',   python: '    print("Keep coding!")',        delay: 1.6 },
  { syless: '}',                            python: '',                                delay: 1.8 },
];

function CodeDemo() {
  const [showPython, setShowPython] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine(prev => (prev + 1) % DEMO_LINES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="glass-dark rounded-2xl overflow-hidden shadow-glow border border-syless-500/20">
        {/* Editor header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-dark-400/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">hello.sy</span>
          </div>
          <button
            onClick={() => setShowPython(!showPython)}
            className="text-xs text-syless-400 hover:text-syless-300 transition-colors flex items-center gap-1"
          >
            {showPython ? 'Show SYLESS' : 'Show Python'}
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Code content */}
        <div className="p-5 font-mono text-sm min-h-[280px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={showPython ? 'python' : 'syless'}
              initial={{ opacity: 0, x: showPython ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: showPython ? -20 : 20 }}
              transition={{ duration: 0.3 }}
            >
              {DEMO_LINES.map((line, i) => {
                const text = showPython ? line.python : line.syless;
                if (!text) return <div key={i} className="h-5" />;

                return (
                  <motion.div
                    key={i}
                    className={`flex items-start gap-4 mb-1.5 ${i === currentLine ? 'bg-syless-500/5 -mx-2 px-2 rounded' : ''}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: line.delay * 0.3 }}
                  >
                    <span className="text-gray-600 select-none w-4 text-right shrink-0">{i + 1}</span>
                    <code className={getTokenClass(text, showPython)}>{formatCode(text, showPython)}</code>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Cursor */}
          <motion.div
            className="inline-block w-0.5 h-4 bg-syless-400 ml-1 mt-1 align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity }}
          />
        </div>

        {/* Output */}
        <div className="border-t border-white/5 bg-dark-400/30 px-5 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={12} className="text-green-400" />
            <span className="text-xs text-gray-500">Output</span>
          </div>
          <motion.div
            className="font-mono text-xs text-green-400"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Hello, World!<br />
            A Grade!<br />
            Keep coding! (×3)
          </motion.div>
        </div>
      </div>

      {/* Glow decoration */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-syless-500/10 to-cyber-400/10 blur-xl -z-10" />
    </div>
  );
}

function formatCode(line, isPython) {
  return line;
}

function getTokenClass(line) {
  return 'text-gray-300';
}

// ─── Feature Cards ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Code2,
    color: 'from-syless-500 to-syless-600',
    glow: 'shadow-glow-sm',
    title: 'English-Like Syntax',
    desc: 'Write code in plain English sentences. No brackets memorization, no semicolon hunting.',
    code: 'say -> "Hello World"\nmake x = 10\ncheck x > 5 { say -> "Big!" }',
  },
  {
    icon: Brain,
    color: 'from-cyber-400 to-cyber-500',
    glow: 'shadow-glow-cyber',
    title: 'AI Coding Mentor',
    desc: 'ARIA — your personal AI tutor — explains code, fixes bugs, and guides you step by step.',
    code: 'task factorial(n) {\n  check n == 0 { give 1 }\n  give n * factorial(n - 1)\n}',
  },
  {
    icon: BarChart2,
    color: 'from-purple-500 to-pink-500',
    glow: '',
    title: 'DSA Playground',
    desc: 'Interactive visualizations for Stack, Queue, Trees, Graphs, Sorting and more.',
    code: 'make stack\npush 10 into stack\npush 20 into stack\npop from stack',
  },
  {
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    glow: '',
    title: 'Instant Execution',
    desc: 'Code runs in milliseconds with secure sandboxed Python execution. See results instantly.',
    code: 'make nums = [5, 2, 8, 1]\nsort nums ascending\nsay -> nums',
  },
  {
    icon: BookOpen,
    color: 'from-green-500 to-emerald-500',
    glow: '',
    title: 'Learn While Coding',
    desc: 'Interactive curriculum from variables to dynamic programming — all in SYLESS syntax.',
    code: 'loop 5 times {\n  say -> "I am a programmer!"\n}',
  },
  {
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
    glow: '',
    title: 'Share & Collaborate',
    desc: 'Real-time collaboration via WebSocket. Share snippets and work on code together.',
    code: 'for each name in ["Alice", "Bob"] {\n  say -> name\n}',
  },
];

// ─── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 'AI', label: 'Powered Learning', icon: Users },,
  { value: '200+', label: 'DSA Problems coming soon', icon: BarChart2 },
  { value: '99.9%', label: 'Uptime', icon: TrendingUp },
  { value: '4.9★', label: 'Rating', icon: Star },
];

// ─── Donate ────────────────────────────────────────────────────────────────────
const DONATE_PERKS = [
  { icon: '🚀', label: 'Faster new features' },
  { icon: '🤖', label: 'Better AI responses' },
  { icon: '📚', label: 'More DSA problems' },
  { icon: '🌍', label: 'Keep it free for everyone' },
  { icon: '🛠️', label: 'Bug fixes & improvements' },
  { icon: '💬', label: 'Community Discord access' },
];

// ─── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Priya S.',
    role: 'College Student',
    avatar: 'P',
    text: 'I was terrified of coding. SYLESS made it feel like writing English. I solved my first DSA problem in week 1!',
    rating: 5,
  },
  {
    name: 'Rahul M.',
    role: 'Software Engineer',
    avatar: 'R',
    text: 'The AI tutor is incredible. It explains concepts like a patient teacher. My teammates use it for onboarding.',
    rating: 5,
  },
  {
    name: 'Anjali K.',
    role: 'High School Teacher',
    avatar: 'A',
    text: 'I use SYLESS to teach programming in my class. Students finally understand loops and conditions!',
    rating: 5,
  },
];

// ─── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Do I need any prior programming experience?',
    a: 'Absolutely not! SYLESS is designed for complete beginners. If you can write English sentences, you can write SYLESS code.',
  },
  {
    q: 'How does the SYLESS language work?',
    a: 'SYLESS uses a custom compiler (Lexer → Parser → AST → Python Generator) to convert your English-like code into valid Python, then executes it securely.',
  },
  {
    q: 'Is my code safe? Can it access my files?',
    a: 'Yes, completely safe. Code runs in an isolated sandbox with no filesystem access, network access, or dangerous operations allowed.',
  },
  {
    q: 'Can I learn real programming from SYLESS?',
    a: 'Yes! SYLESS teaches the same concepts as Python: variables, loops, functions, recursion, and all major DSA topics. The syntax is friendlier, the concepts are real.',
  },
  {
    q: 'Is there a desktop app?',
    a: 'Yes, SYLESS has an Electron-based desktop app for Windows, Mac, and Linux — work offline with full functionality.',
  },
];

// ─── Section wrapper ────────────────────────────────────────────────────────────
function Section({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─── Main Landing ───────────────────────────────────────────────────────────────
export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);
  const [pageViews, setPageViews] = useState(0);

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5173'}/api/analytics/track-view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: 'landing' }),
        });
        if (response.ok) {
          const data = await response.json();
          setPageViews(data.totalViews);
        }
      } catch (err) {
        console.error('Failed to track page view:', err);
      }
    };
    trackPageView();
  }, []);

  return (
    <div className="min-h-screen bg-dark-500 text-white overflow-x-hidden">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-syless-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyber-400/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-full h-px bg-gradient-to-r from-transparent via-syless-500/20 to-transparent" />
          {/* Grid */}
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 badge-purple mb-6 px-4 py-2 text-sm"
              >
                <Zap size={14} className="text-syless-400" />
                AI-Powered Programming IDE
                <span className="ml-1 badge-cyan text-[10px] px-2 py-0.5">NEW</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black font-display leading-tight mb-6"
              >
                Code Like
                <br />
                <span className="gradient-text">You Think.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-xl text-gray-400 leading-relaxed mb-8 max-w-lg"
              >
                SYLESS is the world's first English-like programming language.
                Write code in simple sentences, learn real programming concepts,
                and master DSA — all with your AI mentor ARIA.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 mb-10"
              >
                <Link to="/ide" className="btn-primary text-base px-8 py-4 justify-center">
                  <Play size={18} />
                  Start Coding Free
                </Link>
                <Link to="/syntax" className="btn-secondary text-base px-8 py-4 justify-center">
                  <FileText size={18} />
                  Learn Syntax
                </Link>
                <Link to="/community" className="btn-secondary text-base px-8 py-4 justify-center">
                  <MessageSquare size={18} />
                  Community
                </Link>
                <Link to="/dsa" className="btn-secondary text-base px-8 py-4 justify-center">
                  <BarChart2 size={18} />
                  Explore DSA
                </Link>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-4"
              >
                {/* <div className="flex -space-x-2">
                  {['A', 'B', 'C', 'D', 'E'].map((l, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-dark-500 flex items-center justify-center text-xs font-bold"
                      style={{ background: `hsl(${i * 60 + 240}, 70%, 50%)` }}
                    >
                      {l}
                    </div>
                  ))}
                </div> */}
                {/* <p className="text-sm text-gray-400">
                  <span className="text-white font-semibold">50,000+</span> learners already coding
                </p> */}
              </motion.div>
            </div>

            {/* Right: Code Demo */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <CodeDemo />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs text-gray-600">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-gray-700 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-syless-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <Section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center group">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 rounded-xl bg-syless-500/10 border border-syless-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={18} className="text-syless-400" />
                  </div>
                </div>
                <div className="text-3xl font-black gradient-text mb-1">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <Section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="badge-purple mb-4 inline-block">Features</span>
            <h2 className="text-4xl md:text-5xl font-black font-display mb-4">
              Everything You Need to <span className="gradient-text">Learn & Build</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A complete ecosystem for programming education — from beginner basics to advanced DSA
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, glow, title, desc, code }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card group hover:border-syless-500/20"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 ${glow} group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{desc}</p>
                <div className="code-block text-xs text-gray-300">
                  <pre>{code}</pre>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── How it Works ───────────────────────────────────────────────────── */}
      <Section className="py-24 bg-dark-400/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-display mb-4">
              How <span className="gradient-text">SYLESS</span> Works
            </h2>
            <p className="text-gray-400">Three steps from idea to running program</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Write English Code',
                desc: 'Type your program using simple English words like say, make, check, loop',
                icon: Code2,
                color: 'from-syless-500 to-syless-600',
              },
              {
                step: '02',
                title: 'AI Compiles It',
                desc: 'Our compiler converts your SYLESS code into valid Python through Lexer → AST → Generator',
                icon: Cpu,
                color: 'from-cyber-400 to-cyber-500',
              },
              {
                step: '03',
                title: 'See Results Instantly',
                desc: 'Python runs in a secure sandbox. Output appears in milliseconds with AI explanation ready',
                icon: Zap,
                color: 'from-green-500 to-emerald-500',
              },
            ].map(({ step, title, desc, icon: Icon, color }, i) => (
              <div key={step} className="relative text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-syless-500/30 to-transparent -translate-y-1/2 z-0" />
                )}
                <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-6 shadow-glow-sm`}>
                  <Icon size={30} className="text-white" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-dark-500 border border-syless-500/40 flex items-center justify-center text-[10px] font-bold text-syless-400">
                    {step}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <Section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black font-display mb-4">
              Loved by <span className="gradient-text">Learners</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, avatar, text, rating }) => (
              <div key={name} className="card">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-syless-500 to-cyber-400 flex items-center justify-center font-bold text-sm">
                    {avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{name}</div>
                    <div className="text-xs text-gray-500">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Support / Donate ───────────────────────────────────────────────── */}
      <Section className="py-24 bg-dark-400/20" id="support">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="badge-purple mb-4 inline-block">100% Free</span>
          <h2 className="text-4xl font-black font-display mb-4">
            SYLESS is <span className="gradient-text">Free Forever</span>
          </h2>
          <p className="text-gray-400 mb-4 text-lg">
            Every feature — AI tutor, DSA problems, compiler, visualizations — is completely free for everyone.
          </p>
          <p className="text-gray-500 mb-12 text-sm">
            If SYLESS helped you learn or you just love what we're building, consider buying us a coffee ☕
          </p>

          {/* Perks grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
            {DONATE_PERKS.map(({ icon, label }) => (
              <div key={label} className="glass-dark border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-sm text-gray-300">{label}</span>
              </div>
            ))}
          </div>

          {/* Donate card */}
          <div className="glass-dark border border-syless-500/30 rounded-2xl p-8 border-glow">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="text-2xl font-bold mb-2">Support SYLESS</h3>
            <p className="text-gray-400 text-sm mb-8">
              Your support directly funds server costs, AI API usage, and keeps new features coming.
              No pressure — the platform is always free.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://www.buymeacoffee.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-8 py-3 text-base font-bold"
              >
                ☕ Buy Me a Coffee
              </a>
              <Link to="/auth?mode=register" className="btn-secondary px-8 py-3 text-base font-semibold">
                Start Coding Free →
              </Link>
            </div>
            <p className="text-gray-600 text-xs mt-6">
              No account needed to donate · One-time or monthly · Cancel anytime
            </p>
          </div>
        </div>
      </Section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <Section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black font-display mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="glass-dark rounded-xl border border-white/5 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium">{q}</span>
                  <ChevronRight
                    size={18}
                    className={`text-syless-400 transition-transform ${openFaq === i ? 'rotate-90' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <Section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative glass-dark rounded-3xl p-12 border border-syless-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-syless-500/5 to-cyber-400/5" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-black font-display mb-4">
                Ready to <span className="gradient-text">Code Like You Think?</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join learners who are mastering programming the SYLESS way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/ide" className="btn-primary text-lg px-10 py-4">
                  <Rocket size={20} />
                  Launch SYLESS IDE
                </Link>
                <Link to="/auth?mode=register" className="btn-secondary text-lg px-10 py-4">
                  Create Free Account
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-syless-500 to-cyber-400 flex items-center justify-center text-sm font-bold">S</div>
              <span className="font-bold gradient-text">SYLESS</span>
              <span className="text-gray-600 text-sm">— Code Like You Think</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">© 2026 SYLESS. All rights reserved.</p>
              {pageViews > 0 && (
                <div className="text-sm text-gray-500 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  👁️ {pageViews.toLocaleString()} views
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
