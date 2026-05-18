import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Heart, Play, Plus, X, Loader2, Clock,
  TrendingUp, Code2, Trash2, Terminal,
} from 'lucide-react';
import Navbar from '@components/Nav/Navbar';
import useStore, { API } from '@store/useStore';

// ─── Constants ────────────────────────────────────────────────────────────────
const TAGS = [
  'basics', 'loops', 'functions', 'arrays', 'sorting', 'searching',
  'recursion', 'DSA', 'stack', 'queue', 'tree', 'graph', 'math', 'strings', 'patterns',
];

const TAG_STYLE = {
  basics:    'bg-green-500/10 text-green-400 border-green-500/30',
  loops:     'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  functions: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  arrays:    'bg-purple-500/10 text-purple-400 border-purple-500/30',
  sorting:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  searching: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  recursion: 'bg-red-500/10 text-red-400 border-red-500/30',
  DSA:       'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  stack:     'bg-purple-500/10 text-purple-400 border-purple-500/30',
  queue:     'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  tree:      'bg-green-500/10 text-green-400 border-green-500/30',
  graph:     'bg-blue-500/10 text-blue-400 border-blue-500/30',
  math:      'bg-orange-500/10 text-orange-400 border-orange-500/30',
  strings:   'bg-pink-500/10 text-pink-400 border-pink-500/30',
  patterns:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, onLike, onDelete, onTry, currentUserId, index }) {
  const lines   = post.code.split('\n');
  const preview = lines.slice(0, 7).join('\n');
  const extra   = lines.length - 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="card flex flex-col gap-4 group hover:border-syless-500/20 transition-colors"
    >
      {/* Author row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-syless-500 to-cyber-400 flex items-center justify-center text-sm font-bold shrink-0">
            {(post.author?.username?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold">{post.author?.username || 'Unknown'}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={10} />
              {timeAgo(post.created_at)}
            </div>
          </div>
        </div>
        {currentUserId === post.user_id && (
          <button
            onClick={() => onDelete(post.id)}
            className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-all"
            title="Delete your post"
          >
            <Trash2 size={12} />
            Delete
          </button>
        )}
      </div>

      {/* Title + description */}
      <div>
        <h3 className="font-bold text-base leading-snug mb-1 line-clamp-2">{post.title}</h3>
        {post.description && (
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{post.description}</p>
        )}
      </div>

      {/* Code preview */}
      <div className="relative bg-[#0a0a16] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <span className="ml-2 text-[10px] text-gray-600 font-mono">code.sy</span>
        </div>
        <pre className="px-4 py-3 text-xs text-gray-300 font-mono leading-relaxed overflow-hidden">
          {preview}
        </pre>
        {extra > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0a0a16] to-transparent flex items-end justify-center pb-1.5">
            <span className="text-gray-600 text-[10px]">+{extra} more lines</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map(tag => (
            <span
              key={tag}
              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${TAG_STYLE[tag] || 'bg-white/5 text-gray-400 border-white/10'}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-auto">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all hover:scale-110 ${
            post.liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
          }`}
        >
          <Heart size={15} className={post.liked ? 'fill-red-400' : ''} />
          <span>{post.likes_count || 0}</span>
        </button>

        <button
          onClick={() => onTry(post.code)}
          className="flex items-center gap-1.5 text-xs text-syless-400 hover:text-syless-300 transition-colors font-semibold px-3 py-1.5 rounded-lg hover:bg-syless-500/10"
        >
          <Play size={12} />
          Try in IDE
        </button>
      </div>
    </motion.div>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreated }) {
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [code, setCode]         = useState('');
  const [tags, setTags]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const toggleTag = (tag) =>
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 5 ? [...prev, tag] : prev);

  const submit = async () => {
    setError('');
    if (!title.trim()) return setError('Please add a title for your post');
    if (!code.trim())  return setError('Please add some SYLESS code to share');
    setLoading(true);
    try {
      const { data } = await API.post('/community', {
        title: title.trim(),
        description: desc.trim(),
        code: code.trim(),
        tags,
      });
      onCreated(data.post);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.75)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="glass-dark border border-syless-500/30 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-lg font-bold">Share Your Code</h2>
            <p className="text-sm text-gray-500">Help the SYLESS community learn from you</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What does your code do? e.g. Fibonacci using recursion"
              maxLength={200}
              className="w-full bg-dark-400/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-syless-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Explain how it works or what concept it demonstrates..."
              rows={2}
              maxLength={500}
              className="w-full bg-dark-400/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm resize-none focus:border-syless-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              SYLESS Code <span className="text-red-400">*</span>
            </label>
            <div className="bg-[#0a0a16] border border-white/10 rounded-xl overflow-hidden focus-within:border-syless-500/40 transition-colors">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-dark-400/20">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <Terminal size={10} className="text-gray-600 ml-2" />
                <span className="text-[10px] text-gray-600 font-mono">your-code.sy</span>
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={'say -> "Hello, World!"\n\nmake nums = [5, 3, 8, 1]\nsort nums ascending\nsay -> nums'}
                rows={10}
                className="w-full bg-transparent px-4 py-3 text-sm font-mono text-gray-300 resize-none focus:outline-none placeholder-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags <span className="text-gray-600 font-normal">(up to 5)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    tags.includes(tag)
                      ? 'bg-syless-500/20 border-syless-500/60 text-syless-300'
                      : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                  } ${!tags.includes(tag) && tags.length >= 5 ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="btn-secondary px-6 py-2.5 text-sm">
            Cancel
          </button>
          <button onClick={submit} disabled={loading} className="btn-primary px-6 py-2.5 text-sm gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Sharing...' : 'Share Post'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Community() {
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort]           = useState('new');
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const { isAuthenticated, user, setEditorCode } = useStore();
  const navigate = useNavigate();

  const fetchPosts = useCallback(async (pageNum, sortBy, append = false) => {
    try {
      const { data } = await API.get('/community', { params: { page: pageNum, sort: sortBy } });
      setPosts(prev => append ? [...prev, ...data.posts] : data.posts);
      setHasMore(pageNum < data.pages);
      setPage(pageNum);
    } catch (err) {
      console.error('Community fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    fetchPosts(1, sort);
  }, [sort, fetchPosts]);

  const changeSort = (s) => { if (s !== sort) setSort(s); };

  const handleLike = async (postId) => {
    if (!isAuthenticated) return navigate('/auth');
    try {
      const { data } = await API.post(`/community/${postId}/like`);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, liked: data.liked, likes_count: data.likes_count } : p
      ));
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await API.delete(`/community/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleTry = (code) => {
    setEditorCode(code);
    navigate('/ide');
  };

  const handleCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreate(false);
  };

  const loadMore = () => {
    setLoadingMore(true);
    fetchPosts(page + 1, sort, true);
  };

  return (
    <div className="min-h-screen bg-dark-500 text-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 -left-40 w-80 h-80 bg-syless-500/8 rounded-full blur-3xl" />
          <div className="absolute top-20 -right-40 w-80 h-80 bg-cyber-400/6 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 badge-purple mb-4 px-4 py-1.5 text-sm">
                <Users size={14} className="text-syless-400" />
                SYLESS Community
              </div>
              <h1 className="text-4xl md:text-5xl font-black font-display leading-tight mb-3">
                Share Code.{' '}
                <span className="gradient-text">Learn Together.</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl">
                Post your SYLESS programs, explore others' work, and help each other grow into real programmers.
              </p>
            </div>
            <button
              onClick={() => isAuthenticated ? setShowCreate(true) : navigate('/auth')}
              className="btn-primary px-6 py-3 text-base shrink-0"
            >
              <Plus size={18} />
              Share Code
            </button>
          </div>
        </div>
      </section>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center gap-2">
          {[
            { key: 'new',     label: 'Newest',  icon: Clock },
            { key: 'popular', label: 'Popular', icon: TrendingUp },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => changeSort(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                sort === key
                  ? 'bg-syless-500/20 text-syless-300 border-syless-500/30'
                  : 'text-gray-500 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Post Grid ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 size={36} className="animate-spin text-syless-400" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="w-20 h-20 rounded-2xl bg-syless-500/10 border border-syless-500/20 flex items-center justify-center mx-auto mb-5">
              <Code2 size={36} className="text-syless-400/50" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              Be the first to share a SYLESS program with the community!
            </p>
            <button
              onClick={() => isAuthenticated ? setShowCreate(true) : navigate('/auth')}
              className="btn-primary px-8 py-3"
            >
              <Plus size={18} />
              Share First Post
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={i}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onTry={handleTry}
                  currentUserId={user?.id}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-secondary px-10 py-3 gap-2"
                >
                  {loadingMore && <Loader2 size={16} className="animate-spin" />}
                  {loadingMore ? 'Loading...' : 'Load More Posts'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Create Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <CreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
        )}
      </AnimatePresence>
    </div>
  );
}
