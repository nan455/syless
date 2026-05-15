import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '@store/useStore';
import Sidebar from '@components/Sidebar/Sidebar';
import AIPanel from '@components/AIPanel/AIPanel';
import { API } from '@store/useStore';
import toast from 'react-hot-toast';
import {
  Bot, BookOpen, Zap, Code2, Award, ChevronRight,
  Play, Mic, Target, Brain, Sparkles
} from 'lucide-react';

const COURSES = [
  {
    id: 'basics',
    title: 'SYLESS Basics',
    icon: '🌟',
    level: 'Beginner',
    lessons: [
      { title: 'Variables & Output', syless: 'say -> "Hello!"\nmake name = "SYLESS"\nsay -> name', done: true },
      { title: 'Getting Input', syless: 'ask name -> "What is your name? "\nsay -> "Hi " + name', done: true },
      { title: 'Conditions', syless: 'make x = 10\ncheck x > 5 {\n    say -> "Big!"\n}\notherwise {\n    say -> "Small!"\n}', done: false },
      { title: 'Loops', syless: 'loop 5 times {\n    say -> "Hello!"\n}', done: false },
    ],
  },
  {
    id: 'functions',
    title: 'Functions & Logic',
    icon: '⚡',
    level: 'Intermediate',
    lessons: [
      { title: 'Defining Functions', syless: 'task greet(name) {\n    say -> "Hi " + name\n}\ngreet("World")', done: false },
      { title: 'Recursion', syless: 'task factorial(n) {\n    check n == 0 { give 1 }\n    give n * factorial(n-1)\n}\nsay -> factorial(5)', done: false },
      { title: 'For-Each Loops', syless: 'make fruits = ["apple", "mango"]\nfor each fruit in fruits {\n    say -> fruit\n}', done: false },
    ],
  },
  {
    id: 'dsa',
    title: 'Data Structures',
    icon: '🏗️',
    level: 'Advanced',
    lessons: [
      { title: 'Stack', syless: 'make stack\npush 10 into stack\npush 20 into stack\npop from stack\nsay -> stack', done: false },
      { title: 'Queue', syless: 'make queue\ninsert 10 into queue\ninsert 20 into queue\nremove from queue\nsay -> queue', done: false },
      { title: 'Sorting', syless: 'make nums = [5, 2, 8, 1, 9]\nsort nums ascending\nsay -> nums', done: false },
    ],
  },
];

const DSA_TOPICS = [
  { id: 'stack', label: 'Stack', emoji: '📚' },
  { id: 'queue', label: 'Queue', emoji: '🚶' },
  { id: 'linked list', label: 'Linked List', emoji: '🔗' },
  { id: 'binary tree', label: 'Binary Tree', emoji: '🌳' },
  { id: 'graph', label: 'Graph', emoji: '🕸️' },
  { id: 'recursion', label: 'Recursion', emoji: '🔄' },
  { id: 'sorting', label: 'Sorting', emoji: '📊' },
  { id: 'binary search', label: 'Binary Search', emoji: '🔍' },
];

const INTERVIEW_TOPICS = ['arrays', 'strings', 'stack', 'tree', 'graph', 'sorting', 'recursion'];

export default function AITutor() {
  const { setEditorCode, sendAIMessage } = useStore();
  const [activeView, setActiveView] = useState('learn'); // learn | chat | interview
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [dsaExplanation, setDsaExplanation] = useState('');
  const [dsaLoading, setDsaLoading] = useState(false);
  const [interviewTopic, setInterviewTopic] = useState('arrays');
  const [interviewQuestion, setInterviewQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loadingInterview, setLoadingInterview] = useState(false);

  const loadLesson = (lesson) => {
    setEditorCode(lesson.syless);
    toast.success(`Loaded: ${lesson.title}`);
  };

  const explainTopic = async (topic) => {
    setDsaLoading(true);
    setDsaExplanation('');
    try {
      const { data } = await API.post('/ai/dsa-explain', { concept: topic });
      setDsaExplanation(data.explanation);
    } catch {
      setDsaExplanation('Could not load explanation — check your AI API key.');
    }
    setDsaLoading(false);
  };

  const getInterviewQuestion = async () => {
    setLoadingInterview(true);
    setInterviewQuestion('');
    setFeedback('');
    setUserAnswer('');
    try {
      const { data } = await API.post('/ai/interview', { topic: interviewTopic, difficulty: 'easy' });
      setInterviewQuestion(data.content);
    } catch {
      setInterviewQuestion('Could not load question — check your AI API key.');
    }
    setLoadingInterview(false);
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setLoadingInterview(true);
    try {
      const { data } = await API.post('/ai/interview', {
        topic: interviewTopic,
        userAnswer,
      });
      setFeedback(data.content);
    } catch {
      setFeedback('Could not get feedback.');
    }
    setLoadingInterview(false);
  };

  return (
    <div className="flex h-screen bg-dark-500 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left column — navigation */}
        <div className="w-64 flex flex-col border-r border-white/5 glass-dark shrink-0">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-400/30 to-syless-500/30 border border-cyber-400/40 flex items-center justify-center">
                <Bot size={18} className="text-cyber-400" />
              </div>
              <div>
                <div className="font-bold">ARIA Tutor</div>
                <div className="text-[10px] text-gray-500">Your AI Learning Partner</div>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {[
              { id: 'learn', label: 'Curriculum', icon: BookOpen },
              { id: 'dsa', label: 'DSA Concepts', icon: Brain },
              { id: 'chat', label: 'Free Chat', icon: Sparkles },
              { id: 'interview', label: 'Mock Interview', icon: Target },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                  activeView === id
                    ? 'bg-syless-500/15 border border-syless-500/25 text-syless-300'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeView === 'learn' && (
              <motion.div key="learn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-bold mb-2">SYLESS Curriculum</h1>
                <p className="text-gray-400 text-sm mb-8">Learn programming step by step — from basics to advanced DSA</p>

                <div className="space-y-6 max-w-2xl">
                  {COURSES.map(course => (
                    <div key={course.id} className="card">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{course.icon}</span>
                        <div>
                          <h3 className="font-bold">{course.title}</h3>
                          <span className={`badge text-[10px] ${
                            course.level === 'Beginner' ? 'badge-green' :
                            course.level === 'Intermediate' ? 'badge-cyan' :
                            'badge-purple'
                          }`}>
                            {course.level}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {course.lessons.map((lesson, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              lesson.done ? 'border-green-500/20 bg-green-500/5' : 'border-white/5 hover:border-syless-500/20 hover:bg-syless-500/5'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                                lesson.done ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-white/20 text-gray-600'
                              }`}>
                                {lesson.done ? '✓' : i + 1}
                              </div>
                              <span className={`text-sm ${lesson.done ? 'text-gray-400' : 'text-gray-200'}`}>
                                {lesson.title}
                              </span>
                            </div>
                            <button
                              onClick={() => loadLesson(lesson)}
                              className="flex items-center gap-1 text-xs text-syless-400 hover:text-syless-300 transition-colors"
                            >
                              <Code2 size={12} />
                              Load in IDE
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'dsa' && (
              <motion.div key="dsa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-bold mb-2">DSA Concepts</h1>
                <p className="text-gray-400 text-sm mb-8">Click any topic to get an AI explanation with SYLESS examples</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-2xl">
                  {DSA_TOPICS.map(({ id, label, emoji }) => (
                    <button
                      key={id}
                      onClick={() => explainTopic(id)}
                      className="card p-4 text-center hover:border-syless-500/30 hover:shadow-glow-sm transition-all"
                    >
                      <div className="text-2xl mb-2">{emoji}</div>
                      <div className="text-sm font-medium">{label}</div>
                    </button>
                  ))}
                </div>

                {dsaLoading && (
                  <div className="flex items-center gap-3 text-gray-400 p-6">
                    <div className="w-5 h-5 border-2 border-syless-500/30 border-t-syless-500 rounded-full animate-spin" />
                    ARIA is preparing your explanation...
                  </div>
                )}

                {dsaExplanation && !dsaLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card max-w-2xl"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Bot size={16} className="text-cyber-400" />
                      <span className="text-sm font-semibold text-cyber-400">ARIA's Explanation</span>
                    </div>
                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{dsaExplanation}</div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeView === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <div className="max-w-2xl h-[80vh]">
                  <AIPanel />
                </div>
              </motion.div>
            )}

            {activeView === 'interview' && (
              <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-bold mb-2">Mock Interview</h1>
                <p className="text-gray-400 text-sm mb-8">Practice coding interview questions with AI feedback</p>

                <div className="max-w-2xl space-y-6">
                  <div className="card">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Topic:</span>
                        <select
                          value={interviewTopic}
                          onChange={e => setInterviewTopic(e.target.value)}
                          className="input text-sm py-1.5 w-40"
                        >
                          {INTERVIEW_TOPICS.map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={getInterviewQuestion}
                        disabled={loadingInterview}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        <Zap size={14} />
                        {loadingInterview ? 'Loading...' : 'Get Question'}
                      </button>
                    </div>

                    {interviewQuestion && (
                      <div className="mt-5 p-4 rounded-xl bg-dark-400/60 border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                          <Target size={14} className="text-yellow-400" />
                          <span className="text-xs font-semibold text-yellow-400">Interview Question</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{interviewQuestion}</p>
                      </div>
                    )}

                    {interviewQuestion && !feedback && (
                      <div className="mt-4 space-y-3">
                        <textarea
                          value={userAnswer}
                          onChange={e => setUserAnswer(e.target.value)}
                          placeholder="Write your answer here (you can use SYLESS code)..."
                          className="input text-sm w-full h-32 resize-none"
                        />
                        <button
                          onClick={submitAnswer}
                          disabled={loadingInterview || !userAnswer.trim()}
                          className="btn-primary px-4 py-2 text-sm"
                        >
                          Submit Answer
                        </button>
                      </div>
                    )}

                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-xl bg-cyber-400/5 border border-cyber-400/20"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Bot size={14} className="text-cyber-400" />
                          <span className="text-xs font-semibold text-cyber-400">ARIA's Feedback</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{feedback}</p>
                        <button
                          onClick={getInterviewQuestion}
                          className="mt-4 btn-secondary text-sm px-4 py-2"
                        >
                          Next Question
                          <ChevronRight size={14} />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
