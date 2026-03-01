// src/pages/AdminDashboard.jsx
import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, BookOpen, Search,
  LogOut, Bell, ChevronDown, Trash2, CheckCircle, XCircle,
  Filter, Star, Download, ThumbsUp, Award, BarChart2,
  Shield, Settings, Menu, X, AlertTriangle, Clock, GraduationCap,
  Layers, ChevronRight, RefreshCw, ArrowUpRight, Flame, Crown,
  Medal, BadgeCheck, Sparkles, BookMarked,
  FileCheck, FileClock, FileX, Eye, TrendingUp
} from 'lucide-react';
import { db, auth } from '../firebase';
import {
  collection, query, onSnapshot, where, orderBy,
  updateDoc, doc, deleteDoc, increment, arrayUnion, arrayRemove,
  getDocs, limit, getDoc
} from 'firebase/firestore';


// ─── Constants ───────────────────────────────────────────────────────────────
const BRANCHES = ['All Branches', 'Computer Engineering', 'Information Technology', 'EXTC', 'Mechanical', 'Civil'];
const SEMESTERS = ['All Sems', 'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
const BRANCH_MAP = {
  'Computer Engineering': 'computer_engineering',
  'Information Technology': 'information_technology',
  'EXTC': 'extc',
  'Mechanical': 'mechanical',
  'Civil': 'civil',
  'Computer Science': 'computer_engineering',
};
const BRANCH_DISPLAY = {
  'computer_engineering': 'Computer Engineering',
  'information_technology': 'Information Technology',
  'extc': 'EXTC',
  'mechanical': 'Mechanical',
  'civil': 'Civil',
};
const RESOURCE_TYPES = ['All Types', 'Notes', 'PYQ', 'Lab Manual', 'Viva'];
const TYPE_MAP = {
  'notes': 'Notes', 'pyq': 'PYQ', 'lab_manual': 'Lab Manual', 'viva': 'Viva',
  'Notes': 'notes', 'PYQ': 'pyq', 'Lab Manual': 'lab_manual', 'Viva': 'viva',
};
const SUBJECTS_BY_BRANCH_SEM = {
  computer_engineering: {
    1: ['EM - Engineering Mathematics', 'Maths 1', 'DSA - Data Structures'],
    2: ['EG - Engineering Graphics', 'Maths 2', 'Python Programming'],
    3: ['AOA - Analysis of Algorithms', 'JAVA Programming', 'DBMS - Database Management'],
    4: ['STO - Statistical Techniques', 'SEPM - Software Engineering', 'DT - Digital Technologies'],
  },
  information_technology: {
    1: ['EM - Engineering Mathematics', 'Maths 1', 'DSA - Data Structures'],
    2: ['EG - Engineering Graphics', 'Maths 2', 'Python Programming'],
  },
};

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } }
};
const stagger = { show: { transition: { staggerChildren: 0.06 } } };
const slideIn = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } }
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = memo(({ initials, size = 'sm' }) => {
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-sm';
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-500',
    'from-indigo-500 to-blue-600',
  ];
  const idx = (initials?.charCodeAt(0) || 0) % gradients.length;
  return (
    <div className={`${s} rounded-xl bg-gradient-to-br ${gradients[idx]} flex items-center justify-center text-white font-black shrink-0 shadow-md ring-2 ring-white`}>
      {initials?.substring(0, 2) || '?'}
    </div>
  );
});

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = memo(({ status }) => {
  const map = {
    approved: { cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: <CheckCircle size={10} />, label: 'Approved' },
    pending: { cls: 'bg-amber-100 text-amber-700 border border-amber-200', icon: <Clock size={10} />, label: 'Pending' },
    rejected: { cls: 'bg-red-100 text-red-600 border border-red-200', icon: <XCircle size={10} />, label: 'Rejected' },
  };
  const c = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
});

// ─── Type Badge ───────────────────────────────────────────────────────────────
const TypeBadge = memo(({ type }) => {
  const display = TYPE_MAP[type] || type;
  const map = {
    Notes: 'bg-blue-100 text-blue-700 border-blue-200',
    PYQ: 'bg-amber-100 text-amber-700 border-amber-200',
    'Lab Manual': 'bg-violet-100 text-violet-700 border-violet-200',
    Viva: 'bg-teal-100 text-teal-700 border-teal-200',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md border text-xs font-bold ${map[display] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {display}
    </span>
  );
});

// ─── Verified Badge ───────────────────────────────────────────────────────────
const VerifiedBadge = memo(() => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-black shadow-sm">
    <BadgeCheck size={10} /> Verified
  </span>
));

// ─── Note Modal ───────────────────────────────────────────────────────────────
const NoteModal = memo(({ note, onClose, onAdminUpvote, onApprove, onReject, onDelete }) => {
  if (!note) return null;
  const displayType = TYPE_MAP[note.resourceType || note.type] || 'Notes';
  const displayStatus = note.status || (note.verified ? 'approved' : 'pending');
  const isVerified = note.verified || false;
  const displayBranch = BRANCH_DISPLAY[note.branch] || note.branch || 'Unknown';
  const displaySem = note.semester ? `Sem ${note.semester}` : note.sem || 'Unknown';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 30 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-3">
                <TypeBadge type={note.resourceType || note.type} />
                <StatusBadge status={displayStatus} />
                {isVerified && <VerifiedBadge />}
              </div>
              <h2 className="text-white font-bold text-lg leading-snug mb-4">{note.title || 'Untitled'}</h2>
              <div className="flex items-center gap-2.5">
                <Avatar initials={note.authorInitials || 'AN'} size="sm" />
                <div>
                  <p className="text-slate-200 text-sm font-semibold">{note.authorName || note.author || 'Anonymous'}</p>
                  <p className="text-slate-500 text-xs">{displayBranch} · {displaySem} · {note.subject || 'General'}</p>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </motion.button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Description */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Description</p>
            <p className="text-slate-600 text-sm leading-relaxed">{note.description || note.preview || 'No description available.'}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ThumbsUp, label: 'Upvotes', value: note.upvotes || 0, c: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
              { icon: Download, label: 'Downloads', value: note.downloads || 0, c: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
              { icon: BookOpen, label: 'Module', value: note.module ? `Mod ${note.module}` : 'N/A', c: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
            ].map(({ icon: Icon, label, value, c, bg }) => (
              <div key={label} className={`${bg} border rounded-2xl p-3 text-center`}>
                <Icon size={15} className={`${c} mx-auto mb-1.5`} />
                <p className="font-black text-slate-800 text-sm">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {/* View File */}
          {note.fileUrl && (
            <motion.a
              href={note.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold text-sm transition-colors"
            >
              <Eye size={15} /> View Resource File
            </motion.a>
          )}

          {/* Verify Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAdminUpvote(note.id)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all
              ${isVerified
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200'
                : 'bg-white border-2 border-indigo-200 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50'
              }`}
          >
            <BadgeCheck size={16} />
            {isVerified ? 'Remove Verification' : 'Verify Note'}
          </motion.button>

          {/* Approve / Reject / Delete */}
          <div className="flex gap-2">
            {displayStatus === 'pending' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { onApprove(note.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm shadow-emerald-200"
                >
                  <CheckCircle size={14} /> Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { onReject(note.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-sm shadow-red-200"
                >
                  <XCircle size={14} /> Reject
                </motion.button>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
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
const StatCard = memo(({ label, value, delta, icon: Icon, gradient, accent }) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
    className="relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 overflow-hidden cursor-default group"
  >
    {/* Decorative blobs */}
    <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-[0.08] ${accent} blur-xl`} />
    <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{value}</h3>
        <div className="flex items-center gap-1">
          <TrendingUp size={11} className="text-emerald-500" />
          <span className="text-xs text-emerald-600 font-bold">{delta} this week</span>
        </div>
      </div>
      <div className={`p-3 rounded-2xl ${gradient} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </motion.div>
));

// ─── Select Component ─────────────────────────────────────────────────────────
const FilterSelect = memo(({ value, options, onChange, icon: Icon }) => (
  <div className="relative">
    <Icon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="appearance-none bg-white border border-slate-200 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 cursor-pointer hover:border-slate-300 transition-all shadow-sm"
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
));

// ─── Filter Bar ───────────────────────────────────────────────────────────────
const FilterBar = memo(({ filters, setFilters, subjects, total, filtered }) => (
  <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-indigo-50 rounded-lg">
          <Filter size={13} className="text-indigo-600" />
        </div>
        <span className="text-sm font-bold text-slate-800">Filters</span>
      </div>
      <span className="text-xs text-slate-400">
        Showing <span className="text-indigo-600 font-black">{filtered}</span> / <span className="font-bold text-slate-600">{total}</span>
      </span>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-44">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search notes..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-50 transition-all"
        />
      </div>
      <FilterSelect value={filters.branch} options={BRANCHES} onChange={v => setFilters(f => ({ ...f, branch: v, subject: 'All Subjects' }))} icon={GraduationCap} />
      <FilterSelect value={filters.sem} options={SEMESTERS} onChange={v => setFilters(f => ({ ...f, sem: v }))} icon={Layers} />
      <FilterSelect value={filters.subject} options={subjects} onChange={v => setFilters(f => ({ ...f, subject: v }))} icon={BookOpen} />
      <FilterSelect value={filters.type} options={RESOURCE_TYPES} onChange={v => setFilters(f => ({ ...f, type: v }))} icon={FileText} />
      <FilterSelect value={filters.status} options={['All Status', 'approved', 'pending', 'rejected']} onChange={v => setFilters(f => ({ ...f, status: v }))} icon={CheckCircle} />
      <motion.button
        whileHover={{ rotate: 180, transition: { duration: 0.3 } }}
        onClick={() => setFilters({ search: '', branch: 'All Branches', sem: 'All Sems', subject: 'All Subjects', type: 'All Types', status: 'All Status' })}
        className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-xl text-slate-500 transition-colors"
        title="Reset filters"
      >
        <RefreshCw size={13} />
      </motion.button>
    </div>
  </motion.div>
));

// ─── Note Card ────────────────────────────────────────────────────────────────
const NoteCard = memo(({ note, onSelect, onAdminUpvote, onApprove, onReject, onDelete }) => {
  const displayType = TYPE_MAP[note.resourceType || note.type] || 'Notes';
  const displayStatus = note.status || (note.verified ? 'approved' : 'pending');
  const isVerified = note.verified || false;
  const displayBranch = BRANCH_DISPLAY[note.branch] || note.branch || 'Unknown';
  const displaySem = note.semester ? `Sem ${note.semester}` : note.sem || '';
  const authorInitials = (note.authorName || note.author || note.uploadedByName || 'AN')
    .split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <motion.div
      variants={fadeUp}
      layout
      whileHover={{ y: -3, boxShadow: '0 12px 40px -8px rgba(0,0,0,0.12)', transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group cursor-pointer relative"
      onClick={() => onSelect(note)}
    >
      {/* Top accent line for verified */}
      {isVerified && (
        <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400" />
      )}

      <div className="p-4">
        {/* Badges + Verify button */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5 min-w-0">
            <TypeBadge type={note.resourceType || note.type} />
            <StatusBadge status={displayStatus} />
            {isVerified && <VerifiedBadge />}
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={e => { e.stopPropagation(); onAdminUpvote(note.id); }}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all
              ${isVerified
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                : 'bg-slate-50 border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
          >
            <BadgeCheck size={11} />
            {isVerified ? 'Verified' : 'Verify'}
          </motion.button>
        </div>

        {/* Title */}
        <h4 className="font-bold text-slate-800 text-sm leading-snug mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {note.title || 'Untitled'}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {note.description || note.preview || 'No description available'}
        </p>

        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar initials={authorInitials} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate">
              {note.authorName || note.author || note.uploadedByName || 'Anonymous'}
            </p>
            <p className="text-[11px] text-slate-400">{displayBranch} · {displaySem}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ThumbsUp size={10} className="text-indigo-400" />
              <span className="font-semibold">{note.upvotes || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <Download size={10} className="text-emerald-400" />
              <span className="font-semibold">{note.downloads || 0}</span>
            </span>
            {note.module && <span className="text-[11px] text-slate-300 font-medium">Mod {note.module}</span>}
          </div>

          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            {displayStatus === 'pending' && (
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
  );
});

// ─── Pending Notes Section ────────────────────────────────────────────────────
const PendingNotesSection = memo(({ notes, onApprove, onReject, onAdminUpvote }) => {
  const pending = notes.filter(n => (n.status || (n.verified ? 'approved' : 'pending')) === 'pending');
  if (pending.length === 0) return null;

  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-amber-100 rounded-lg">
          <AlertTriangle size={15} className="text-amber-600" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">Pending Approvals</h3>
        <span className="ml-1 bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full leading-none">
          {pending.length}
        </span>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence>
          {pending.map((note, i) => {
            const initials = (note.authorName || note.author || 'AN')
              .split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const displayBranch = BRANCH_DISPLAY[note.branch] || note.branch || 'Unknown';
            const displaySem = note.semester ? `Sem ${note.semester}` : note.sem || '';

            return (
              <motion.div
                key={note.id}
                variants={slideIn}
                animate="show"
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3 bg-amber-50/60 hover:bg-amber-50 rounded-xl border border-amber-100 transition-colors"
              >
                <Avatar initials={initials} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{note.title || 'Untitled'}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {note.authorName || note.author || 'Anonymous'} · {displayBranch} · {displaySem}
                  </p>
                </div>
                <TypeBadge type={note.resourceType || note.type} />
                <div className="flex gap-1.5 shrink-0">
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => onApprove(note.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-colors shadow-sm">
                    ✓
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => onReject(note.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-black transition-colors shadow-sm">
                    ✕
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} onClick={e => { e.stopPropagation(); onAdminUpvote(note.id); }}
                    className={`px-2 py-1.5 rounded-lg text-xs font-black transition-colors ${note.verified ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600'}`}>
                    <BadgeCheck size={12} />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// ─── Top Contributors ─────────────────────────────────────────────────────────
const TopContributors = memo(({ contributors }) => {
  if (contributors.length === 0) return null;
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Crown size={16} className="text-amber-500" />
        <h3 className="font-bold text-slate-800 text-sm">Top Contributors</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {contributors.map(({ name, notes: count, downloads, avatar }, idx) => (
          <motion.div
            key={name}
            whileHover={{ y: -2 }}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 border border-transparent transition-all cursor-default"
          >
            <div className="relative">
              <Avatar initials={avatar} size="sm" />
              {idx < 3 && (
                <span className="absolute -top-1.5 -right-1.5 text-[11px]">{medals[idx]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">{name}</p>
              <p className="text-[10px] text-slate-400">
                {count} note{count !== 1 ? 's' : ''} · {(downloads || 0).toLocaleString()} dl
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = ({ onSignOut }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '', branch: 'All Branches', sem: 'All Sems',
    subject: 'All Subjects', type: 'All Types', status: 'All Status',
  });
  const [selectedNote, setSelectedNote] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── Real-time listener ─────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = query(collection(db, 'notes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const notesData = snapshot.docs.map(d => {
          const data = d.data();
          const authorName = data.authorName || data.author || data.uploadedByName || 'Anonymous';
          const authorInitials = authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AN';
          return {
            id: d.id,
            ...data,
            authorName,
            authorInitials,
            avatar: authorInitials,
            sem: data.semester ? `Sem ${data.semester}` : data.sem,
            resourceType: data.resourceType || data.type || 'notes',
            status: data.status || (data.verified ? 'approved' : 'pending'),
            verified: data.verified || false,
            uploadedAt: data.uploadedAt?.toDate?.() || new Date(),
          };
        });
        notesData.sort((a, b) => b.uploadedAt - a.uploadedAt);
        setNotes(notesData);
        setLoading(false);
      } catch (err) {
        setError('Error processing notes: ' + err.message);
        setLoading(false);
      }
    }, (err) => {
      setError('Failed to load notes: ' + err.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const subjects = useMemo(() => {
    if (filters.branch === 'All Branches' || filters.sem === 'All Sems') return ['All Subjects'];
    const branchKey = BRANCH_MAP[filters.branch] || filters.branch;
    const semNum = filters.sem.replace('Sem ', '');
    return ['All Subjects', ...(SUBJECTS_BY_BRANCH_SEM[branchKey]?.[semNum] || [])];
  }, [filters.branch, filters.sem]);

  const filteredNotes = useMemo(() => notes.filter(n => {
    const displayBranch = BRANCH_DISPLAY[n.branch] || n.branch || '';
    const displaySem = n.semester ? `Sem ${n.semester}` : n.sem || '';
    const displayType = TYPE_MAP[n.resourceType || n.type] || '';
    const displayStatus = n.status || (n.verified ? 'approved' : 'pending');
    if (filters.branch !== 'All Branches' && displayBranch !== filters.branch) return false;
    if (filters.sem !== 'All Sems' && displaySem !== filters.sem) return false;
    if (filters.subject !== 'All Subjects' && n.subject !== filters.subject) return false;
    if (filters.type !== 'All Types' && displayType !== filters.type) return false;
    if (filters.status !== 'All Status' && displayStatus !== filters.status) return false;
    if (filters.search.trim()) {
      const term = filters.search.toLowerCase();
      return [n.title, n.subject, n.authorName, n.description, displayBranch, displaySem]
        .filter(Boolean).some(f => f.toLowerCase().includes(term));
    }
    return true;
  }), [notes, filters]);

  const stats = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const getStatus = n => n.status || (n.verified ? 'approved' : 'pending');
    return {
      total: notes.length,
      pending: notes.filter(n => getStatus(n) === 'pending').length,
      approved: notes.filter(n => getStatus(n) === 'approved').length,
      verified: notes.filter(n => n.verified).length,
      delta: {
        total: `+${notes.filter(n => n.uploadedAt > weekAgo).length}`,
        pending: `+${notes.filter(n => getStatus(n) === 'pending' && n.uploadedAt > weekAgo).length}`,
        approved: `+${notes.filter(n => getStatus(n) === 'approved' && n.uploadedAt > weekAgo).length}`,
        verified: `+${notes.filter(n => n.verified && n.uploadedAt > weekAgo).length}`,
      }
    };
  }, [notes]);

  const topContributors = useMemo(() => {
    const map = new Map();
    notes.forEach(n => {
      const name = n.authorName || n.author || 'Anonymous';
      const initials = n.authorInitials || name.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase();
      if (!map.has(name)) map.set(name, { name, notes: 0, downloads: 0, avatar: initials });
      const c = map.get(name);
      c.notes++;
      c.downloads += n.downloads || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.notes - a.notes).slice(0, 5);
  }, [notes]);

  // ─── Action Handlers ─────────────────────────────────────────────────────
  const handleApprove = useCallback(async (id) => {
    try {
      await updateDoc(doc(db, 'notes', id), { status: 'approved', verified: true, approvedAt: new Date(), approvedBy: auth.currentUser?.uid || 'admin' });
    } catch (err) { alert('Failed to approve note.'); }
  }, []);

  const handleReject = useCallback(async (id) => {
    try {
      await updateDoc(doc(db, 'notes', id), { status: 'rejected', verified: false, rejectedAt: new Date(), rejectedBy: auth.currentUser?.uid || 'admin' });
    } catch (err) { alert('Failed to reject note.'); }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    try { await deleteDoc(doc(db, 'notes', id)); }
    catch (err) { alert('Failed to delete note.'); }
  }, []);

  const handleAdminUpvote = useCallback(async (id) => {
    const note = notes.find(n => n.id === id);
    const newVal = !note.verified;
    try {
      await updateDoc(doc(db, 'notes', id), { verified: newVal, ...(newVal ? { verifiedAt: new Date(), verifiedBy: auth.currentUser?.uid || 'admin' } : {}) });
    } catch (err) { alert('Failed to update verification.'); }
  }, [notes]);

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-600 animate-spin" />
          <Shield size={20} className="absolute inset-0 m-auto text-indigo-600" />
        </div>
        <p className="text-slate-600 font-semibold text-sm">Loading PrepStack Admin</p>
        <p className="text-xs text-slate-400 mt-1">Connecting to database…</p>
      </div>
    </div>
  );

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md border border-red-100 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={26} className="text-red-500" />
        </div>
        <h2 className="text-lg font-black text-slate-800 mb-2">Error Loading Notes</h2>
        <p className="text-slate-500 text-sm mb-5">{error}</p>
        <div className="flex gap-3">
          <button onClick={() => window.location.reload()} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
            Retry
          </button>
          <button onClick={onSignOut} className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Main ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
              <Shield size={17} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">PrepStack</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Date */}
            <span className="hidden sm:block text-xs text-slate-400 font-medium mr-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            {/* Bell */}
            <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell size={16} className="text-slate-500" />
              {stats.pending > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"
                />
              )}
            </button>
            {/* Sign out */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl text-xs font-bold transition-colors"
            >
              <LogOut size={13} /> Sign Out
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w mx-auto px-4 sm:px-6 py-7">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Notes" value={stats.total} delta={stats.delta.total} icon={FileText}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600" accent="bg-blue-400" />
            <StatCard label="Pending Review" value={stats.pending} delta={stats.delta.pending} icon={Clock}
              gradient="bg-gradient-to-br from-amber-500 to-orange-500" accent="bg-amber-400" />
            <StatCard label="Approved" value={stats.approved} delta={stats.delta.approved} icon={CheckCircle}
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600" accent="bg-emerald-400" />
            <StatCard label="Verified" value={stats.verified} delta={stats.delta.verified} icon={BadgeCheck}
              gradient="bg-gradient-to-br from-violet-500 to-purple-600" accent="bg-violet-400" />
          </div>

          {/* Pending */}
          <PendingNotesSection notes={notes} onApprove={handleApprove} onReject={handleReject} onAdminUpvote={handleAdminUpvote} />

          {/* Notes Grid */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-slate-800 text-sm tracking-tight">All Notes</h2>
            </div>

            <FilterBar filters={filters} setFilters={setFilters} subjects={subjects} total={notes.length} filtered={filteredNotes.length} />

            {filteredNotes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search size={22} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-bold text-sm">No notes found</p>
                <p className="text-xs text-slate-400 mt-1.5">Try adjusting your filters</p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4"
              >
                <AnimatePresence mode="popLayout">
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
              </motion.div>
            )}
          </motion.div>

          {/* Top Contributors */}
          <TopContributors contributors={topContributors} />

        </motion.div>
      </main>

      {/* Modal */}
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