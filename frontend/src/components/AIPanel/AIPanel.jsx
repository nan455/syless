import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '@store/useStore';
import { Send, Bot, User, Trash2, Lightbulb, Bug, Zap, BookOpen, X, Minimize2 } from 'lucide-react';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  { icon: Lightbulb, label: 'Explain my code', msg: 'Can you explain what my current code does step by step?' },
  { icon: Bug, label: 'Find bugs', msg: 'Are there any bugs or issues in my code? How can I fix them?' },
  { icon: Zap, label: 'Improve code', msg: 'How can I make my code better or more efficient?' },
  { icon: BookOpen, label: 'Teach me', msg: 'What new SYLESS features or concepts should I learn next?' },
];

function MarkdownText({ text }) {
  // Simple markdown rendering for code blocks and bold
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <div className="space-y-1">
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).replace(/^[a-z]+\n/, '');
          return (
            <pre key={i} className="bg-dark-400/80 border border-white/5 rounded-lg p-3 text-xs font-mono text-green-400 overflow-x-auto my-2 whitespace-pre-wrap">
              {code.trim()}
            </pre>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="bg-dark-400/80 px-1.5 py-0.5 rounded text-syless-300 text-xs font-mono">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs
        ${isUser
          ? 'bg-syless-500/30 border border-syless-500/50'
          : 'bg-cyber-400/20 border border-cyber-400/40'
        }`}
      >
        {isUser ? <User size={12} /> : <Bot size={12} className="text-cyber-400" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-syless-500/20 border border-syless-500/30 text-syless-100 rounded-tr-sm'
            : 'glass border border-white/5 text-gray-200 rounded-tl-sm'
        }`}
      >
        {isUser ? msg.content : <MarkdownText text={msg.content} />}
      </div>
    </motion.div>
  );
}

export default function AIPanel({ onClose }) {
  const { aiMessages, aiLoading, sendAIMessage, clearAIChat, explainCode, debugCode, runError } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, aiLoading]);

  const handleSend = async (message) => {
    const text = message || input.trim();
    if (!text || aiLoading) return;
    setInput('');
    try {
      await sendAIMessage(text);
    } catch {
      toast.error('AI service unavailable — check your API key');
    }
  };

  const handleExplain = async () => {
    try {
      const explanation = await explainCode();
      // Add explanation to chat
      await sendAIMessage('Please explain my current code');
    } catch {
      toast.error('Could not get explanation');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full glass-dark border-l border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyber-400/30 to-syless-500/30 border border-cyber-400/40 flex items-center justify-center">
              <Bot size={16} className="text-cyber-400" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border border-dark-500 animate-pulse-slow" />
          </div>
          <div>
            <div className="text-sm font-bold">ARIA</div>
            <div className="text-[10px] text-gray-500">AI Coding Mentor</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {aiMessages.length > 0 && (
            <button
              onClick={clearAIChat}
              className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              title="Clear chat"
            >
              <Trash2 size={13} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Quick prompts */}
      {aiMessages.length === 0 && (
        <div className="px-3 py-3 border-b border-white/5 shrink-0">
          <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_PROMPTS.map(({ icon: Icon, label, msg }) => (
              <button
                key={label}
                onClick={() => handleSend(msg)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] text-gray-400 hover:text-white glass hover:bg-white/8 border border-white/5 hover:border-syless-500/30 transition-all text-left"
              >
                <Icon size={11} className="text-syless-400 shrink-0" />
                {label}
              </button>
            ))}
          </div>
          {runError && (
            <button
              onClick={() => handleSend(`I got this error: "${runError}". Can you help me fix it?`)}
              className="mt-1.5 w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] text-red-400 glass hover:bg-red-500/5 border border-red-500/20 transition-all"
            >
              <Bug size={11} />
              Debug: "{runError.slice(0, 40)}..."
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {aiMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">🤖</div>
            <p className="text-sm text-gray-400 font-medium">Hi! I'm ARIA, your AI coding mentor.</p>
            <p className="text-xs text-gray-600 mt-1">Ask me anything about your code!</p>
          </div>
        ) : (
          aiMessages.map((msg, i) => <Message key={i} msg={msg} />)
        )}

        {aiLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-cyber-400/20 border border-cyber-400/40 flex items-center justify-center">
              <Bot size={12} className="text-cyber-400" />
            </div>
            <div className="glass border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-cyber-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">ARIA is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/5 shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask ARIA anything..."
            rows={1}
            className="flex-1 input text-sm resize-none min-h-[40px] max-h-32 py-2.5"
            style={{ height: 'auto', overflowY: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || aiLoading}
            className="shrink-0 w-10 h-10 rounded-xl bg-syless-500 hover:bg-syless-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:shadow-glow-sm"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-gray-700 mt-1.5 text-center">Shift+Enter for new line • Enter to send</p>
      </div>
    </div>
  );
}
