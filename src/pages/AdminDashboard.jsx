// src/pages/AdminDashboard.jsx
import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, BookOpen, Search,
  LogOut, Bell, ChevronDown, Trash2, CheckCircle, XCircle,
  Filter, Star, Download, ThumbsUp, Award, BarChart2,
  Shield, Settings, Menu, X, AlertTriangle, Clock, GraduationCap,
  Layers, ChevronRight, RefreshCw, ArrowUpRight, Flame, Crown,
  Medal, BadgeCheck, Sparkles, BookMarked,
  FileCheck, FileClock, FileX, Eye
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const BRANCHES = ['All Branches', 'Computer Science', 'Information Technology', 'EXTC', 'Mechanical', 'Civil'];
const SEMESTERS = ['All Sems', 'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
const SUBJECTS_MAP = {
  'Computer Science': ['All Subjects', 'DBMS', 'Operating Systems', 'Data Structures', 'Computer Networks', 'Software Engineering'],
  'Information Technology': ['All Subjects', 'Web Technology', 'DBMS', 'Computer Networks', 'Cloud Computing'],
  'EXTC': ['All Subjects', 'Digital Electronics', 'Signal Processing', 'VLSI Design', 'Microprocessors'],
  'Mechanical': ['All Subjects', 'Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing'],
  'Civil': ['All Subjects', 'Structural Analysis', 'Geotechnical Engineering', 'Hydraulics'],
  'All Branches': ['All Subjects'],
};
const NOTE_TYPES = ['All Types', 'Notes', 'PYQ', 'Lab Manual', 'Viva'];

const INITIAL_NOTES = [
  { id: 1, title: 'Complete DBMS Guide – Normalization to Transactions', author: 'Rohan Mehta', avatar: 'RM', branch: 'Computer Science', sem: 'Sem 6', subject: 'DBMS', type: 'Notes', upvotes: 234, downloads: 1245, status: 'approved', adminUpvoted: true, adminVerified: true, date: '2025-01-10', size: '4.2 MB', preview: 'Covers 1NF through BCNF with solved examples, ER diagrams, and transaction management.' },
  { id: 2, title: 'OS Previous Year Papers 2019–2024', author: 'Priya Sharma', avatar: 'PS', branch: 'Computer Science', sem: 'Sem 6', subject: 'Operating Systems', type: 'PYQ', upvotes: 189, downloads: 987, status: 'approved', adminUpvoted: false, adminVerified: false, date: '2025-01-08', size: '2.8 MB', preview: 'Compiled question papers from 2019 to 2024 with solutions.' },
  { id: 3, title: 'DBMS Lab Manual with Queries', author: 'Amit Joshi', avatar: 'AJ', branch: 'Computer Science', sem: 'Sem 5', subject: 'DBMS', type: 'Lab Manual', upvotes: 156, downloads: 876, status: 'pending', adminUpvoted: false, adminVerified: false, date: '2025-01-14', size: '3.1 MB', preview: 'Complete lab manual with 20 experiments covering DDL, DML, DCL commands.' },
  { id: 4, title: 'DSA Graph Algorithms Detailed Notes', author: 'Sara Khan', avatar: 'SK', branch: 'Computer Science', sem: 'Sem 4', subject: 'Data Structures', type: 'Notes', upvotes: 98, downloads: 543, status: 'approved', adminUpvoted: false, adminVerified: false, date: '2025-01-05', size: '1.9 MB', preview: 'BFS, DFS, Dijkstra, Floyd-Warshall with complexity analysis.' },
  { id: 5, title: 'CN Important Questions Bank', author: 'Dev Patel', avatar: 'DP', branch: 'Computer Science', sem: 'Sem 6', subject: 'Computer Networks', type: 'PYQ', upvotes: 76, downloads: 432, status: 'rejected', adminUpvoted: false, adminVerified: false, date: '2025-01-12', size: '1.2 MB', preview: 'Question bank covering OSI model, TCP/IP stack, routing protocols.' },
  { id: 6, title: 'Web Tech Full Stack Notes', author: 'Neha Verma', avatar: 'NV', branch: 'Information Technology', sem: 'Sem 5', subject: 'Web Technology', type: 'Notes', upvotes: 201, downloads: 1102, status: 'approved', adminUpvoted: true, adminVerified: true, date: '2025-01-07', size: '5.4 MB', preview: 'HTML5, CSS3, JavaScript ES6+, React fundamentals, Node.js REST APIs.' },
  { id: 7, title: 'Cloud Computing Lab Experiments', author: 'Karan Gupta', avatar: 'KG', branch: 'Information Technology', sem: 'Sem 7', subject: 'Cloud Computing', type: 'Lab Manual', upvotes: 88, downloads: 321, status: 'pending', adminUpvoted: false, adminVerified: false, date: '2025-01-15', size: '2.3 MB', preview: 'AWS, Azure, GCP hands-on labs with deployment guides.' },
  { id: 8, title: 'Digital Electronics PYQs 2020–2024', author: 'Ananya Desai', avatar: 'AD', branch: 'EXTC', sem: 'Sem 4', subject: 'Digital Electronics', type: 'PYQ', upvotes: 143, downloads: 678, status: 'approved', adminUpvoted: false, adminVerified: false, date: '2025-01-06', size: '3.7 MB', preview: 'Previous year papers with solutions covering logic gates, flip-flops.' },
  { id: 9, title: 'Signal Processing Viva Questions', author: 'Vikas Rao', avatar: 'VR', branch: 'EXTC', sem: 'Sem 6', subject: 'Signal Processing', type: 'Viva', upvotes: 67, downloads: 289, status: 'pending', adminUpvoted: false, adminVerified: false, date: '2025-01-13', size: '0.9 MB', preview: 'Comprehensive viva questions on Fourier transforms, Laplace, Z-transform.' },
  { id: 10, title: 'Thermodynamics Formula Sheet', author: 'Ritu Singh', avatar: 'RS', branch: 'Mechanical', sem: 'Sem 3', subject: 'Thermodynamics', type: 'Notes', upvotes: 112, downloads: 567, status: 'approved', adminUpvoted: false, adminVerified: false, date: '2025-01-09', size: '1.4 MB', preview: 'All thermodynamic laws, Carnot cycle, entropy formulas.' },
  { id: 11, title: 'Software Engineering Case Studies', author: 'Mohit Tiwari', avatar: 'MT', branch: 'Computer Science', sem: 'Sem 7', subject: 'Software Engineering', type: 'Notes', upvotes: 55, downloads: 203, status: 'pending', adminUpvoted: false, adminVerified: false, date: '2025-01-16', size: '2.0 MB', preview: 'Real-world SE case studies covering SDLC models, Agile, Scrum.' },
  { id: 12, title: 'Computer Networks Lab Manual', author: 'Ishita Bose', avatar: 'IB', branch: 'Computer Science', sem: 'Sem 6', subject: 'Computer Networks', type: 'Lab Manual', upvotes: 134, downloads: 712, status: 'approved', adminUpvoted: true, adminVerified: true, date: '2025-01-04', size: '3.5 MB', preview: 'Socket programming, Wireshark analysis, subnetting exercises.' },
];

const TOP_CONTRIBUTORS = [
  { name: 'Rohan Mehta', notes: 48, downloads: 12450, icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200', avatar: 'RM' },
  { name: 'Neha Verma', notes: 36, downloads: 9870, icon: Medal, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', avatar: 'NV' },
  { name: 'Priya Sharma', notes: 29, downloads: 7430, icon: Medal, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', avatar: 'PS' },
  { name: 'Ishita Bose', notes: 24, downloads: 6210, icon: Star, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200', avatar: 'IB' },
  { name: 'Amit Joshi', notes: 19, downloads: 5430, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', avatar: 'AJ' },
];

// ─── Variants ─────────────────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const slideIn = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } } };

// ─── Atoms ────────────────────────────────────────────────────────────────────
const Avatar = memo(({ initials, size = 'sm' }) => {
  const colors = {
    RM: 'from-blue-500 to-indigo-500', PS: 'from-violet-500 to-purple-500',
    AJ: 'from-emerald-500 to-teal-500', SK: 'from-rose-500 to-pink-500',
    DP: 'from-amber-500 to-orange-500', NV: 'from-cyan-500 to-blue-500',
    KG: 'from-green-500 to-emerald-500', AD: 'from-fuchsia-500 to-violet-500',
    VR: 'from-orange-500 to-red-500', RS: 'from-teal-500 to-cyan-500',
    MT: 'from-indigo-500 to-blue-500', IB: 'from-pink-500 to-rose-500'
  };
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base';
  return (
    <div className={`${s} rounded-full bg-gradient-to-br ${colors[initials] ?? 'from-slate-500 to-slate-600'} flex items-center justify-center text-white font-black shrink-0 shadow-sm`}>
      {initials}
    </div>
  );
});

const StatusBadge = memo(({ status }) => {
  const cfg = {
    approved: { cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <FileCheck size={11} />, label: 'Approved' },
    pending: { cls: 'bg-amber-50 text-amber-600 border-amber-200', icon: <FileClock size={11} />, label: 'Pending' },
    rejected: { cls: 'bg-red-50 text-red-500 border-red-200', icon: <FileX size={11} />, label: 'Rejected' },
  }[status] ?? { cls: 'bg-slate-50 text-slate-500 border-slate-200', icon: null, label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
});

const TypeBadge = memo(({ type }) => {
  const cfg = {
    'Notes': 'bg-blue-50 text-blue-600 border-blue-200',
    'PYQ': 'bg-amber-50 text-amber-600 border-amber-200',
    'Lab Manual': 'bg-purple-50 text-purple-600 border-purple-200',
    'Viva': 'bg-teal-50 text-teal-600 border-teal-200'
  }[type] ?? 'bg-slate-50 text-slate-500 border-slate-200';
  return <span className={`inline-flex px-2 py-0.5 rounded-lg border text-xs font-bold ${cfg}`}>{type}</span>;
});

const VerifiedBadge = memo(() => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-sm"
  >
    <BadgeCheck size={11} /> Admin Verified
  </motion.span>
));

// ─── Note Modal ───────────────────────────────────────────────────────────────
const NoteModal = memo(({ note, onClose, onAdminUpvote, onApprove, onReject, onDelete }) => {
  if (!note) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 24 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <TypeBadge type={note.type} />
                <StatusBadge status={note.status} />
                {note.adminVerified && <VerifiedBadge />}
              </div>
              <h2 className="text-white font-bold text-base leading-snug mb-3">{note.title}</h2>
              <div className="flex items-center gap-2">
                <Avatar initials={note.avatar} size="sm" />
                <div>
                  <p className="text-slate-200 text-sm font-semibold">{note.author}</p>
                  <p className="text-slate-400 text-xs">{note.branch} · {note.sem} · {note.subject}</p>
                </div>
              </div>
            </div>
            <motion.button whileHover={{ rotate: 90, scale: 1.1 }} onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors mt-1 shrink-0">
              <X size={18} />
            </motion.button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Preview</p>
            <p className="text-slate-600 text-sm leading-relaxed">{note.preview}</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: ThumbsUp, label: 'Upvotes', value: note.upvotes, c: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Download, label: 'Downloads', value: note.downloads, c: 'text-emerald-500', bg: 'bg-emerald-50' },
              { icon: FileText, label: 'Size', value: note.size, c: 'text-violet-500', bg: 'bg-violet-50' },
            ].map(({ icon: Icon, label, value, c, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <Icon size={15} className={`${c} mx-auto mb-1`} />
                <p className="font-bold text-slate-800 text-sm">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAdminUpvote(note.id)}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg
              ${note.adminUpvoted
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200'
                : 'bg-white border-2 border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 shadow-slate-100'
              }`}
          >
            {note.adminUpvoted
              ? <><BadgeCheck size={17} /> Remove Verification</>
              : <><ThumbsUp size={17} /> Verify Note</>}
          </motion.button>

          <div className="flex gap-2 pt-1">
            {note.status === 'pending' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => { onApprove(note.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm"
                >
                  <CheckCircle size={14} /> Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => { onReject(note.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-sm"
                >
                  <XCircle size={14} /> Reject
                </motion.button>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => { onDelete(note.id); onClose(); }}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 font-semibold text-sm transition-colors"
            >
              <Trash2 size={14} /> Delete
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = memo(({ label, value, delta, icon: Icon, color }) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 relative overflow-hidden group cursor-default"
  >
    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.06] bg-gradient-to-br ${color} blur-2xl`} />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        <div className="flex items-center gap-1 mt-1.5">
          <ArrowUpRight size={12} className="text-emerald-500" />
          <span className="text-xs text-emerald-500 font-bold">{delta} this week</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </motion.div>
));

// ─── Filter Bar ───────────────────────────────────────────────────────────────
const FilterBar = memo(({ filters, setFilters, subjects, total, filtered }) => {
  const Select = ({ value, options, onChange, icon: Icon }) => (
    <div className="relative">
      <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white border border-slate-200 rounded-xl pl-8 pr-7 py-2 text-sm text-slate-700 font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 cursor-pointer hover:border-blue-300 transition-all shadow-sm"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-blue-500" />
          <span className="text-sm font-bold text-slate-700">Filter Notes</span>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Showing <span className="text-blue-600 font-black">{filtered}</span> of <span className="font-bold">{total}</span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all"
          />
        </div>
        <Select value={filters.branch} options={BRANCHES} onChange={v => setFilters(f => ({ ...f, branch: v, subject: 'All Subjects' }))} icon={GraduationCap} />
        <Select value={filters.sem} options={SEMESTERS} onChange={v => setFilters(f => ({ ...f, sem: v }))} icon={Layers} />
        <Select value={filters.subject} options={subjects} onChange={v => setFilters(f => ({ ...f, subject: v }))} icon={BookOpen} />
        <Select value={filters.type} options={NOTE_TYPES} onChange={v => setFilters(f => ({ ...f, type: v }))} icon={Filter} />
        <Select value={filters.status} options={['All Status', 'approved', 'pending', 'rejected']} onChange={v => setFilters(f => ({ ...f, status: v }))} icon={CheckCircle} />
        <motion.button
          whileHover={{ rotate: 180 }}
          onClick={() => setFilters({ search: '', branch: 'All Branches', sem: 'All Sems', subject: 'All Subjects', type: 'All Types', status: 'All Status', verified: 'All' })}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors"
          title="Reset filters"
        >
          <RefreshCw size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
});

// ─── Note Card ────────────────────────────────────────────────────────────────
const NoteCard = memo(({ note, onSelect, onAdminUpvote, onApprove, onReject, onDelete }) => (
  <motion.div
    variants={fadeUp}
    layout
    whileHover={{ y: -4 }}
    className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden group cursor-pointer relative"
    onClick={() => onSelect(note)}
  >
    {note.adminVerified && (
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        style={{ originX: 0 }}
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400"
      />
    )}
    <div className="p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <TypeBadge type={note.type} />
          <StatusBadge status={note.status} />
          {note.adminVerified && <VerifiedBadge />}
        </div>
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          onClick={e => { e.stopPropagation(); onAdminUpvote(note.id); }}
          title={note.adminUpvoted ? 'Remove verification' : 'Verify note'}
          className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm
            ${note.adminUpvoted
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
              : 'bg-slate-50 border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50'
            }`}
        >
          {note.adminUpvoted ? <><BadgeCheck size={12} /> Verified</> : <><ThumbsUp size={12} /> Verify</>}
        </motion.button>
      </div>

      <h4 className="font-bold text-slate-800 text-sm leading-snug mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-2">
        {note.title}
      </h4>
      <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{note.preview}</p>

      <div className="flex items-center gap-2 mb-3">
        <Avatar initials={note.avatar} size="sm" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-700 truncate">{note.author}</p>
          <p className="text-xs text-slate-400">{note.branch.split(' ').slice(0, 2).join(' ')} · {note.sem}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><ThumbsUp size={11} className="text-blue-400" />{note.upvotes}</span>
          <span className="flex items-center gap-1"><Download size={11} className="text-emerald-400" />{note.downloads}</span>
          <span>{note.size}</span>
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {note.status === 'pending' && (
            <>
              <motion.button whileHover={{ scale: 1.15 }} onClick={() => onApprove(note.id)}
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Approve">
                <CheckCircle size={13} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.15 }} onClick={() => onReject(note.id)}
                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Reject">
                <XCircle size={13} />
              </motion.button>
            </>
          )}
          <motion.button whileHover={{ scale: 1.15 }} onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 size={13} />
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
));

// ─── Pending Notes Section ────────────────────────────────────────────────────
const PendingNotesSection = memo(({ notes, onApprove, onReject, onAdminUpvote }) => {
  const pending = notes.filter(n => n.status === 'pending');

  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 rounded-lg">
            <AlertTriangle size={15} className="text-amber-600" />
          </div>
          <h3 className="font-bold text-slate-800">Pending Approvals</h3>
          <span className="bg-amber-100 text-amber-600 text-xs font-black px-2 py-0.5 rounded-full">{pending.length}</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        <AnimatePresence>
          {pending.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center">
              <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-bold">All caught up! No pending notes.</p>
            </motion.div>
          ) : pending.map((note, i) => (
            <motion.div
              key={note.id}
              variants={slideIn}
              transition={{ delay: i * 0.04 }}
              exit={{ opacity: 0, x: 30 }}
              className="flex items-center gap-3 p-3 bg-amber-50/70 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors"
            >
              <Avatar initials={note.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{note.title}</p>
                <p className="text-xs text-slate-400">{note.author} · {note.branch} · {note.sem}</p>
              </div>
              <TypeBadge type={note.type} />
              <div className="flex gap-1.5 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => onApprove(note.id)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-colors"
                >
                  ✓
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => onReject(note.id)}
                  className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-black transition-colors"
                >
                  ✕
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => { e.stopPropagation(); onAdminUpvote(note.id); }}
                  className={`px-2.5 py-1 rounded-lg transition-colors text-xs font-black ${
                    note.adminUpvoted
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 text-slate-600 hover:bg-blue-200'
                  }`}
                  title={note.adminUpvoted ? 'Remove verification' : 'Verify'}
                >
                  <BadgeCheck size={11} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = ({ onSignOut }) => {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [filters, setFilters] = useState({
    search: '', branch: 'All Branches', sem: 'All Sems',
    subject: 'All Subjects', type: 'All Types', status: 'All Status', verified: 'All',
  });
  const [selectedNote, setSelectedNote] = useState(null);

  const subjects = useMemo(() => SUBJECTS_MAP[filters.branch] ?? ['All Subjects'], [filters.branch]);

  const filteredNotes = useMemo(() => notes.filter(n => {
    const q = filters.search.toLowerCase();
    return (
      (filters.branch === 'All Branches' || n.branch === filters.branch) &&
      (filters.sem === 'All Sems' || n.sem === filters.sem) &&
      (filters.subject === 'All Subjects' || n.subject === filters.subject) &&
      (filters.type === 'All Types' || n.type === filters.type) &&
      (filters.status === 'All Status' || n.status === filters.status) &&
      (!q || n.title.toLowerCase().includes(q) || n.author.toLowerCase().includes(q))
    );
  }), [notes, filters]);

  const pendingNotes = useMemo(() => notes.filter(n => n.status === 'pending'), [notes]);
  const approvedNotes = useMemo(() => notes.filter(n => n.status === 'approved'), [notes]);
  const verifiedNotes = useMemo(() => notes.filter(n => n.adminVerified), [notes]);

  const handleApprove = useCallback(id => setNotes(ns => ns.map(n => n.id === id ? { ...n, status: 'approved' } : n)), []);
  const handleReject = useCallback(id => setNotes(ns => ns.map(n => n.id === id ? { ...n, status: 'rejected' } : n)), []);
  const handleDelete = useCallback(id => setNotes(ns => ns.filter(n => n.id !== id)), []);
  const handleAdminUpvote = useCallback(id => setNotes(ns => ns.map(n =>
    n.id === id ? { ...n, adminUpvoted: !n.adminUpvoted, adminVerified: !n.adminUpvoted } : n
  )), []);

  const STATS = [
    { label: 'Total Notes', value: String(notes.length), delta: '+12', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { label: 'Pending Review', value: String(pendingNotes.length), delta: '+3', icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Approved', value: String(approvedNotes.length), delta: '+8', icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Admin Verified', value: String(verifiedNotes.length), delta: '+4', icon: BadgeCheck, color: 'from-indigo-500 to-indigo-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800">PrepStack Admin</h1>
                <p className="text-xs text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors relative">
                <Bell size={18} className="text-slate-600" />
                {pendingNotes.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
                )}
              </button>
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div variants={stagger}  animate="show" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STATS.map(stat => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Pending Notes Section - Prominent */}
          <PendingNotesSection
            notes={notes}
            onApprove={handleApprove}
            onReject={handleReject}
            onAdminUpvote={handleAdminUpvote}
          />

          {/* All Notes with Filters */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">All Notes</h2>
            </div>

            <FilterBar
              filters={filters}
              setFilters={setFilters}
              subjects={subjects}
              total={notes.length}
              filtered={filteredNotes.length}
            />

            {filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <Search size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No notes found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
                <AnimatePresence>
                  {filteredNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onSelect={setSelectedNote}
                      onAdminUpvote={handleAdminUpvote}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crown size={18} className="text-yellow-500" />
              <h3 className="font-bold text-slate-800">Top Contributors</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {TOP_CONTRIBUTORS.map(({ name, notes: cnt, downloads, avatar }, i) => (
                <div key={name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                  <Avatar initials={avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{name}</p>
                    <p className="text-xs text-slate-400">{cnt} notes · {downloads.toLocaleString()} dl</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Note Modal */}
      <AnimatePresence>
        {selectedNote && (
          <NoteModal
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onAdminUpvote={handleAdminUpvote}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;