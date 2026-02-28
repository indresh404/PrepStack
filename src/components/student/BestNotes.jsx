// src/components/student/BestNotes.jsx
import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, ThumbsUp, Download, BookOpen, FileText, Beaker,
  Crown, Star, Filter, Search, X, Check,
  Calendar, Layers, RefreshCw, Flame, TrendingUp,
  ChevronDown, ZoomIn, Tag
} from 'lucide-react';
import { auth, db } from '../../firebase';
import {
  collection, query, orderBy, onSnapshot,
  updateDoc, doc, increment, getDoc, arrayUnion, arrayRemove,
  getDocs
} from 'firebase/firestore';

// ── Animation ────────────────────────────────────────────────────────────────
const stagger = { show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } }
};

// ── Constants ────────────────────────────────────────────────────────────────
const BRANCHES = ['computer_engineering', 'information_technology'];
const BRANCH_LABEL = { 
  computer_engineering: 'Computer Engineering', 
  information_technology: 'Information Technology' 
};

const SEMESTERS = ['1', '2', '3', '4'];
const MODULES = ['1', '2', '3', '4', '5', '6'];

const RESOURCE_TYPES = [
  { id: 'notes',      label: 'Notes',      icon: BookOpen },
  { id: 'pyq',        label: 'PYQs',       icon: FileText },
  { id: 'lab_manual', label: 'Lab Manual', icon: Layers   },
  { id: 'viva',       label: 'Viva',       icon: Tag      },
];

const subjectsByBranchAndSem = {
  computer_engineering: {
    1: ['EM - Engineering Mathematics', 'Maths 1', 'DSA - Data Structures'],
    2: ['EG - Engineering Graphics', 'Maths 2', 'Python Programming'],
    3: ['AOA - Analysis of Algorithms', 'JAVA Programming', 'DBMS - Database Management'],
    4: ['STO - Statistical Techniques', 'SEPM - Software Engineering', 'DT - Digital Technologies'],
  },
  information_technology: {
    1: ['EM - Engineering Mathematics', 'Maths 1', 'DSA - Data Structures'],
    2: ['EG - Engineering Graphics', 'Maths 2', 'Python Programming'],
    3: ['AOA - Analysis of Algorithms', 'JAVA Programming', 'DBMS - Database Management'],
    4: ['STO - Statistical Techniques', 'SEPM - Software Engineering', 'DT - Digital Technologies'],
  },
};

const TYPE_STYLES = {
  notes:      { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   bar: 'from-blue-400 to-blue-600'   },
  pyq:        { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200',  bar: 'from-amber-400 to-amber-600'  },
  lab_manual: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', bar: 'from-purple-400 to-purple-600' },
  viva:       { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200',  bar: 'from-green-400 to-green-600'   },
};
const getTypeStyle = (t) => TYPE_STYLES[t] || TYPE_STYLES.notes;

const RANK_STYLES = [
  null,
  { ring: 'ring-2 ring-yellow-400',   badge: 'bg-gradient-to-br from-yellow-300 to-yellow-500', icon: <Crown size={12} className="text-yellow-900" /> },
  { ring: 'ring-2 ring-slate-400',    badge: 'bg-gradient-to-br from-slate-300 to-slate-500',   icon: <Crown size={12} className="text-slate-900 opacity-70" /> },
  { ring: 'ring-2 ring-amber-600',    badge: 'bg-gradient-to-br from-amber-400 to-amber-600',   icon: <Crown size={12} className="text-amber-100" /> },
];
const getRankStyle = (r) => RANK_STYLES[r] || { ring: '', badge: 'bg-blue-100', icon: <span className="text-blue-600 font-bold text-xs">#{r}</span> };

// ── Filter Bar ────────────────────────────────────────────────────────────────
const FilterBar = memo(({ filters, onChange, total, loading }) => {
  const [open, setOpen] = useState(false);

  const availableSubjects = filters.branch && filters.semester && filters.semester !== 'All'
    ? subjectsByBranchAndSem[filters.branch]?.[filters.semester] || []
    : [];

  const hasActiveFilters =
    filters.branch !== '' ||
    filters.semester !== 'All' ||
    filters.module !== 'All' ||
    filters.type !== 'all' ||
    filters.verified !== 'all' ||
    filters.search !== '' ||
    filters.subject !== '';

  const reset = () => onChange({
    search: '', branch: '', semester: 'All', module: 'All',
    type: 'all', verified: 'all', subject: ''
  });

  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search row */}
      <div className="flex items-center gap-2 p-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by title, subject, author, description…"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
          />
          {filters.search && (
            <button onClick={() => onChange({ ...filters, search: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Type pills */}
        <div className="hidden md:flex items-center gap-1.5">
          <button 
            onClick={() => onChange({ ...filters, type: 'all' })}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
              filters.type === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-500'
            }`}>
            All Types
          </button>
          {RESOURCE_TYPES.map(rt => {
            const Icon = rt.icon;
            return (
              <button key={rt.id} onClick={() => onChange({ ...filters, type: rt.id })}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-1 ${
                  filters.type === rt.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-500'
                }`}>
                <Icon size={12} />
                {rt.label}
              </button>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => setOpen(!open)}
          className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
            open || hasActiveFilters
              ? 'bg-blue-50 border-blue-300 text-blue-600'
              : 'border-slate-200 text-slate-500 hover:border-blue-200'
          }`}>
          <Filter size={15} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
          )}
          <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>

      {/* Mobile type pills */}
      <div className="md:hidden flex items-center gap-1.5 px-3 pb-3 overflow-x-auto scrollbar-none">
        <button 
          onClick={() => onChange({ ...filters, type: 'all' })}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            filters.type === 'all'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-slate-200 text-slate-500 hover:border-blue-200'
          }`}>
          All
        </button>
        {RESOURCE_TYPES.map(rt => {
          const Icon = rt.icon;
          return (
            <button key={rt.id} onClick={() => onChange({ ...filters, type: rt.id })}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                filters.type === rt.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 text-slate-500 hover:border-blue-200'
              }`}>
              <Icon size={12} />
              {rt.label}
            </button>
          );
        })}
      </div>

      {/* Advanced filters */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="border-t border-slate-100 bg-slate-50/60"
          >
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Branch */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Branch</label>
                <select value={filters.branch} onChange={e => onChange({ ...filters, branch: e.target.value, semester: 'All', subject: '' })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">All Branches</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{BRANCH_LABEL[b]}</option>)}
                </select>
              </div>
              
              {/* Semester */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Semester</label>
                <select 
                  value={filters.semester} 
                  onChange={e => onChange({ ...filters, semester: e.target.value, subject: '' })}
                  disabled={!filters.branch}
                  className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    !filters.branch ? 'opacity-50 cursor-not-allowed' : 'text-slate-600'
                  }`}>
                  <option value="All">All Semesters</option>
                  {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Subject</label>
                <select 
                  value={filters.subject} 
                  onChange={e => onChange({ ...filters, subject: e.target.value })}
                  disabled={!filters.branch || filters.semester === 'All'}
                  className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    !filters.branch || filters.semester === 'All' ? 'opacity-50 cursor-not-allowed' : 'text-slate-600'
                  }`}>
                  <option value="">All Subjects</option>
                  {availableSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Module */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Module</label>
                <select value={filters.module} onChange={e => onChange({ ...filters, module: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="All">All Modules</option>
                  {MODULES.map(m => <option key={m} value={m}>Module {m}</option>)}
                </select>
              </div>

              {/* Verified Status */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Status</label>
                <div className="flex gap-2">
                  {[
                    ['all', 'All'],
                    ['verified', '✓ Verified'], 
                    ['unverified', '⏳ Pending']
                  ].map(([val, label]) => (
                    <button key={val} onClick={() => onChange({ ...filters, verified: val })}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        filters.verified === val
                          ? val === 'verified' ? 'bg-green-600 text-white border-green-600'
                            : val === 'unverified' ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-blue-600 text-white border-blue-600'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-4 pb-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {loading ? 'Loading…' : `${total} resource${total !== 1 ? 's' : ''} found`}
              </span>
              {hasActiveFilters && (
                <button onClick={reset} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold">
                  <RefreshCw size={11} /> Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ── Note Card ─────────────────────────────────────────────────────────────────
const NoteCard = memo(({ note, onLike, currentUserId }) => {
  const [liking, setLiking] = useState(false);
  const ts = getTypeStyle(note.resourceType || note.type);
  const rank = note.rank;
  const rs = getRankStyle(rank);
  const isLiked = note.likedBy?.includes(currentUserId);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!currentUserId || liking) return;
    setLiking(true);
    try {
      await onLike(note.id, isLiked);
    } finally {
      setLiking(false);
    }
  };

  const displayType = note.resourceType || note.type || 'notes';
  const typeLabel = { notes: 'Notes', pyq: 'PYQ', lab_manual: 'Lab Manual', viva: 'Viva' }[displayType] || displayType.toUpperCase();

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(30,64,175,0.10)' }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden group relative ${rs.ring}`}
    >
      {/* Top accent bar */}
      <div className={`h-1 bg-gradient-to-r ${ts.bar}`} />

      {/* Gold shimmer */}
      {note.gold && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 animate-pulse" />
      )}

      <div className="p-5">
        {/* Rank + badges */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-8 h-8 rounded-full ${rs.badge} flex items-center justify-center shadow-sm flex-shrink-0`}>
            {rs.icon}
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {note.verified ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full">
                <Check size={9} /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                ⏳ Pending
              </span>
            )}
            {note.gold && (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                🏅 Gold
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors mb-1.5 line-clamp-2">
          {note.title}
        </h4>

        {/* Description if available */}
        {note.description && (
          <p className="text-xs text-slate-500 mb-2 line-clamp-2">{note.description}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 mb-3">
          <span className="font-medium text-slate-500">{note.authorName || note.uploadedByName || note.author || 'Anonymous'}</span>
          {note.subject && <><span>·</span><span className="text-slate-600">{note.subject}</span></>}
          {note.semester && <><span>·</span><span>Sem {note.semester}</span></>}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold ${ts.bg} ${ts.text} ${ts.border}`}>
            {typeLabel}
          </span>
          {note.branch && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium">
              <Layers size={10} /> {BRANCH_LABEL[note.branch] || note.branch}
            </span>
          )}
          {note.module && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium">
              Mod {note.module}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mb-4">
          {/* Like button - real-time */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
            onClick={handleLike}
            disabled={liking || !currentUserId}
            title={!currentUserId ? 'Login to like' : isLiked ? 'Unlike' : 'Like'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isLiked
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500'
            } ${liking || !currentUserId ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <ThumbsUp size={12} className={liking ? 'animate-bounce' : ''} />
            <span>{(note.upvotes || 0).toLocaleString()}</span>
          </motion.button>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Download size={11} />
            <span>{(note.downloads || 0).toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar size={11} />
            <span>
              {note.uploadedAt?.toDate
                ? new Date(note.uploadedAt.toDate()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : 'Recent'}
            </span>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => note.fileUrl && window.open(note.fileUrl, '_blank')}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm flex items-center justify-center gap-1.5"
        >
          <ZoomIn size={13} /> View Resource
        </motion.button>
      </div>
    </motion.div>
  );
});

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
    <div className="h-1 bg-slate-200" />
    <div className="p-5 space-y-3">
      <div className="flex justify-between"><div className="w-8 h-8 rounded-full bg-slate-100" /><div className="w-16 h-4 rounded-full bg-slate-100" /></div>
      <div className="h-4 bg-slate-100 rounded-lg w-4/5" />
      <div className="h-3 bg-slate-100 rounded-lg w-2/5" />
      <div className="flex gap-2"><div className="h-6 w-16 rounded-lg bg-slate-100" /><div className="h-6 w-20 rounded-lg bg-slate-100" /></div>
      <div className="h-9 bg-slate-100 rounded-xl" />
    </div>
  </div>
);

// ── Stats Bar ─────────────────────────────────────────────────────────────────
const StatsBar = ({ notes }) => {
  const total = notes.length;
  const verified = notes.filter(n => n.verified).length;
  const totalLikes = notes.reduce((sum, n) => sum + (n.upvotes || 0), 0);
  const totalDl = notes.reduce((sum, n) => sum + (n.downloads || 0), 0);

  return (
    <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: 'Total Resources', value: total, icon: <BookOpen size={16} />, color: 'text-blue-600 bg-blue-50' },
        { label: 'Verified', value: verified, icon: <Check size={16} />, color: 'text-green-600 bg-green-50' },
        { label: 'Total Likes', value: totalLikes.toLocaleString(), icon: <ThumbsUp size={16} />, color: 'text-purple-600 bg-purple-50' },
        { label: 'Downloads', value: totalDl.toLocaleString(), icon: <Download size={16} />, color: 'text-amber-600 bg-amber-50' },
      ].map(stat => (
        <div key={stat.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
            {stat.icon}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg leading-none">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const BestNotes = () => {
  const [allNotes, setAllNotes]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authorCache, setAuthorCache] = useState({});

  const [filters, setFilters] = useState({
    search: '', branch: '', semester: 'All', module: 'All',
    type: 'all', verified: 'all', subject: ''
  });

  // ── Auth listener ──
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setCurrentUser(u));
    return unsub;
  }, []);

  // ── Fetch author name (cached) ──
  const getAuthorName = useCallback(async (uid) => {
    if (!uid) return 'Unknown';
    if (authorCache[uid]) return authorCache[uid];
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      const name = snap.exists()
        ? snap.data().name || snap.data().username || snap.data().displayName || 'Unknown'
        : 'Unknown';
      setAuthorCache(prev => ({ ...prev, [uid]: name }));
      return name;
    } catch {
      return 'Unknown';
    }
  }, [authorCache]);

  // ── Real-time notes listener ──
  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'notes'),
      orderBy('upvotes', 'desc')
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
        if (snap.empty) {
          setAllNotes([]);
          setLoading(false);
          return;
        }

        const notePromises = snap.docs.map(async (d) => {
          const data = d.data();
          const authorName = await getAuthorName(data.uploadedBy);
          return {
            id: d.id,
            ...data,
            authorName,
            upvotes:   data.upvotes   || 0,
            downloads: data.downloads || 0,
            likedBy:   data.likedBy   || [],
            verified:  data.verified  || false,
            gold:      data.gold      || false,
          };
        });

        const resolved = await Promise.all(notePromises);
        setAllNotes(resolved);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        if (err.code === 'failed-precondition') {
          const q2 = query(collection(db, 'notes'));
          onSnapshot(q2, async (snap2) => {
            const notePromises = snap2.docs.map(async (d) => {
              const data = d.data();
              const authorName = await getAuthorName(data.uploadedBy);
              return { id: d.id, ...data, authorName, upvotes: data.upvotes || 0, downloads: data.downloads || 0, likedBy: data.likedBy || [], verified: data.verified || false, gold: data.gold || false };
            });
            const resolved = (await Promise.all(notePromises)).sort((a, b) => b.upvotes - a.upvotes);
            setAllNotes(resolved);
            setLoading(false);
          }, (err2) => {
            setError('Could not load notes: ' + err2.message);
            setLoading(false);
          });
        } else {
          setError('Could not load notes: ' + err.message);
          setLoading(false);
        }
      }
    );

    return unsub;
  }, []);

  // ── Like handler ──
  const handleLike = useCallback(async (noteId, currentlyLiked) => {
    if (!currentUser) { alert('Please log in to like notes.'); return; }
    const ref = doc(db, 'notes', noteId);
    try {
      if (currentlyLiked) {
        await updateDoc(ref, {
          upvotes: increment(-1),
          likedBy: arrayRemove(currentUser.uid),
        });
      } else {
        await updateDoc(ref, {
          upvotes: increment(1),
          likedBy: arrayUnion(currentUser.uid),
        });
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  }, [currentUser]);

  // ── Filtered + ranked notes ──
  const filteredNotes = React.useMemo(() => {
    let list = [...allNotes];

    // Search filter (title, subject, author, description)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.subject?.toLowerCase().includes(q) ||
        n.authorName?.toLowerCase().includes(q) ||
        n.uploadedByName?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q)
      );
    }

    // Branch filter
    if (filters.branch) {
      list = list.filter(n => n.branch === filters.branch);
    }

    // Semester filter
    if (filters.semester !== 'All') {
      list = list.filter(n => String(n.semester) === filters.semester);
    }

    // Subject filter
    if (filters.subject) {
      list = list.filter(n => n.subject === filters.subject);
    }

    // Module filter
    if (filters.module !== 'All') {
      list = list.filter(n => String(n.module) === filters.module);
    }

    // Type filter
    if (filters.type !== 'all') {
      list = list.filter(n => (n.resourceType || n.type) === filters.type);
    }

    // Verified filter
    if (filters.verified === 'verified')   list = list.filter(n => n.verified);
    if (filters.verified === 'unverified') list = list.filter(n => !n.verified);

    // Rank by upvotes
    return list.map((note, i) => ({ ...note, rank: i + 1 }));
  }, [allNotes, filters]);

  return (
    <motion.div variants={stagger} animate="show" className="space-y-5">
      {/* Hero Header */}
      <motion.div variants={fadeUp}
        className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame size={22} className="text-white" />
              <h2 className="text-2xl font-extrabold tracking-tight">Best Notes</h2>
            </div>
            <p className="text-amber-100 text-sm">Top-rated study resources from the whole community</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-white/30">
              <p className="text-2xl font-extrabold leading-none">{allNotes.length}</p>
              <p className="text-xs text-amber-100 mt-0.5">Resources</p>
            </div>
            <div className="text-5xl select-none">🏆</div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      {allNotes.length > 0 && <StatsBar notes={allNotes} />}

      {/* Filters */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        total={filteredNotes.length}
        loading={loading}
      />

      {/* Error */}
      {error && (
        <motion.div variants={fadeUp} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          <X size={16} className="flex-shrink-0" />
          {error}
          <button onClick={() => window.location.reload()} className="ml-auto text-xs underline font-semibold">Retry</button>
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredNotes.length > 0 ? (
        <>
          {/* Sort indicator */}
          <motion.div variants={fadeUp} className="flex items-center gap-2 text-xs text-slate-500">
            <TrendingUp size={13} />
            <span>Sorted by most likes · live updates enabled</span>
            <span className="ml-auto font-semibold text-slate-700">{filteredNotes.length} results</span>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onLike={handleLike}
                  currentUserId={currentUser?.uid}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      ) : (
        <motion.div variants={fadeUp}
          className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-blue-200" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No resources found</h3>
          <p className="text-slate-400 text-sm mb-5">
            {allNotes.length === 0
              ? 'No notes have been uploaded yet. Be the first!'
              : 'Try adjusting your search or filters.'}
          </p>
          {allNotes.length > 0 && (
            <button onClick={() => setFilters({ search: '', branch: '', semester: 'All', module: 'All', type: 'all', verified: 'all', subject: '' })}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
              Clear All Filters
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default BestNotes;