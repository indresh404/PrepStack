// src/components/student/BestNotes.jsx
import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, ThumbsUp, Download, BookOpen, FileText, Beaker,
  Crown, Star, Filter, Search, X, Check,
  Calendar, Layers, RefreshCw, Flame, TrendingUp,
  ChevronDown, ZoomIn, Tag, Lock, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, ZoomOut
} from 'lucide-react';
import { auth, db } from '../../firebase';
import {
  collection, query, orderBy, onSnapshot,
  updateDoc, doc, increment, getDoc, arrayUnion, arrayRemove, runTransaction
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

// ── Paid Note Confirm Modal ───────────────────────────────────────────────────
const PaidNoteModal = ({ note, currentUser, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userPoints, setUserPoints] = useState(null);
  const cost = note.points || 15;

  useEffect(() => {
    if (!currentUser) return;
    getDoc(doc(db, 'users', currentUser.uid)).then(snap => {
      if (snap.exists()) setUserPoints(snap.data().points || 0);
    });
  }, [currentUser]);

  const handlePurchase = async () => {
    if (!currentUser) { setError('Please log in first.'); return; }
    if (userPoints === null) return;
    if (userPoints < cost) { setError(`You need ${cost} points but only have ${userPoints}.`); return; }

    setLoading(true);
    setError('');

    try {
      const viewerRef  = doc(db, 'users', currentUser.uid);
      const uploaderRef = doc(db, 'users', note.uploadedBy);
      const noteRef    = doc(db, 'notes', note.id);

      await runTransaction(db, async (tx) => {
        const viewerSnap = await tx.get(viewerRef);
        if (!viewerSnap.exists()) throw new Error('User not found');

        const currentPts = viewerSnap.data().points || 0;
        if (currentPts < cost) throw new Error(`Insufficient points. You have ${currentPts}, need ${cost}.`);

        const purchasedNotes = viewerSnap.data().purchasedNotes || [];
        if (purchasedNotes.includes(note.id)) {
          // already purchased — just open
          return;
        }

        // Deduct from viewer
        tx.update(viewerRef, {
          points: increment(-cost),
          purchasedNotes: arrayUnion(note.id),
        });

        // Add to uploader (if different user)
        if (note.uploadedBy && note.uploadedBy !== currentUser.uid) {
          tx.update(uploaderRef, {
            points: increment(cost),
          });
        }

        // Increment note downloads
        tx.update(noteRef, { downloads: increment(1) });
      });

      onSuccess();
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.message || 'Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canAfford = userPoints !== null && userPoints >= cost;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,30,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 24 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-extrabold">Paid Resource</h3>
          <p className="text-amber-100 text-sm mt-0.5">Points required to access</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Note info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="font-semibold text-slate-800 text-sm line-clamp-2">{note.title}</p>
            {note.subject && <p className="text-xs text-slate-400 mt-1">{note.subject}</p>}
          </div>

          {/* Cost breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Access cost</span>
              <span className="font-bold text-amber-600 flex items-center gap-1">
                <Star size={13} /> {cost} points
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Your balance</span>
              <span className={`font-bold flex items-center gap-1 ${canAfford ? 'text-green-600' : 'text-red-500'}`}>
                <Star size={13} /> {userPoints === null ? '…' : userPoints} points
              </span>
            </div>
            {canAfford && (
              <div className="flex items-center justify-between text-sm border-t pt-2">
                <span className="text-slate-500">After purchase</span>
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Star size={13} /> {userPoints - cost} points
                </span>
              </div>
            )}
          </div>

          {/* Uploader gets points notice */}
          {note.uploadedBy !== currentUser?.uid && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-blue-700">
              <Check size={13} className="flex-shrink-0 text-blue-500" />
              <span><strong>{cost} points</strong> will be transferred to the uploader</span>
            </div>
          )}

          {!canAfford && userPoints !== null && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-red-600">
              <AlertCircle size={13} className="flex-shrink-0" />
              <span>You need {cost - userPoints} more points. Upload notes to earn points!</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={loading || !canAfford || userPoints === null}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-2.5 rounded-xl text-sm hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Processing…</> : <><Star size={14} /> Unlock Now</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── PDF Viewer ─────────────────────────────────────────────────────────────────
const PDFViewer = ({ note, onClose }) => {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const totalPages = note.pages || 14;
  const resourceType = note.resourceType || note.type || 'notes';

  const generateContent = (pageNum) => {
    const contents = {
      notes: [
        { type: 'heading', text: `Chapter ${pageNum}: Core Concepts` },
        { type: 'subtitle', text: `${note.subject || 'Subject'} — Detailed Study Notes` },
        { type: 'paragraph', text: 'This section covers the fundamental principles and theories that form the backbone of this topic. Understanding these concepts is essential for mastering the subject.' },
        { type: 'subheading', text: 'Key Definitions' },
        { type: 'bullet', items: ['Algorithm: A step-by-step procedure for solving a problem', 'Data Structure: A way of organizing and storing data', 'Complexity: A measure of algorithm efficiency', 'Recursion: A function calling itself with smaller inputs'] },
        { type: 'subheading', text: 'Important Formulas' },
        { type: 'formula', text: 'T(n) = O(n log n)  —  for divide and conquer algorithms' },
        { type: 'paragraph', text: 'The time complexity analysis helps us understand how an algorithm performs as the input size grows. Big-O notation provides an upper bound on the growth rate.' },
        { type: 'subheading', text: 'Example Problem' },
        { type: 'code', lines: ['function binarySearch(arr, target) {', '  let left = 0, right = arr.length - 1;', '  while (left <= right) {', '    let mid = Math.floor((left + right) / 2);', '    if (arr[mid] === target) return mid;', '    if (arr[mid] < target) left = mid + 1;', '    else right = mid - 1;', '  }', '  return -1;', '}'] },
        { type: 'note', text: '📌 Remember: Binary search requires a sorted array and runs in O(log n) time.' },
      ],
      pyq: [
        { type: 'heading', text: `Previous Year Questions — Set ${pageNum}` },
        { type: 'subtitle', text: `${note.subject || 'Subject'} — University Examination` },
        { type: 'subheading', text: 'Section A — Short Answer (2 marks each)' },
        { type: 'question', num: 1, text: 'Define the term "normalization" in the context of database design. Explain its significance.' },
        { type: 'answer', text: 'Normalization is the process of organizing a database to reduce redundancy and improve data integrity by dividing large tables into smaller related tables.' },
        { type: 'question', num: 2, text: 'What is the difference between a primary key and a foreign key?' },
        { type: 'answer', text: 'A primary key uniquely identifies each record in a table. A foreign key is a field that links to the primary key of another table, establishing a relationship.' },
        { type: 'subheading', text: 'Section B — Long Answer (5 marks each)' },
        { type: 'question', num: 3, text: 'Explain the ACID properties of database transactions with suitable examples for each property.' },
        { type: 'note', text: '✏️ Tip: This question appears in almost every exam. Study all 4 properties thoroughly!' },
      ],
      lab_manual: [
        { type: 'heading', text: `Experiment No. ${pageNum}` },
        { type: 'subtitle', text: `${note.subject || 'Subject'} — Laboratory Manual` },
        { type: 'subheading', text: 'Aim' },
        { type: 'paragraph', text: 'To implement and demonstrate the working of sorting algorithms and analyze their time complexities through practical execution.' },
        { type: 'subheading', text: 'Theory' },
        { type: 'paragraph', text: 'Sorting is the process of arranging data in a specific order. Various sorting algorithms exist, each with different time and space complexities. Selection of an appropriate sorting algorithm depends on the nature and size of data.' },
        { type: 'subheading', text: 'Procedure' },
        { type: 'bullet', items: ['Step 1: Open the IDE and create a new project', 'Step 2: Write the sorting algorithm code', 'Step 3: Compile and run the program', 'Step 4: Test with different input arrays', 'Step 5: Record observations in the table below'] },
        { type: 'code', lines: ['// Bubble Sort Implementation', 'void bubbleSort(int arr[], int n) {', '  for(int i = 0; i < n-1; i++)', '    for(int j = 0; j < n-i-1; j++)', '      if(arr[j] > arr[j+1])', '        swap(arr[j], arr[j+1]);', '}'] },
        { type: 'subheading', text: 'Observations' },
        { type: 'table', headers: ['Input Size', 'Time (ms)', 'Comparisons'], rows: [['10', '0.02', '45'], ['100', '0.8', '4950'], ['1000', '70', '499500']] },
        { type: 'subheading', text: 'Conclusion' },
        { type: 'paragraph', text: 'The experiment successfully demonstrated bubble sort. The time complexity observed matches the theoretical O(n²) complexity.' },
      ],
      viva: [
        { type: 'heading', text: `Viva Questions — Module ${pageNum}` },
        { type: 'subtitle', text: `${note.subject || 'Subject'} — Viva Voce Preparation` },
        { type: 'subheading', text: 'Frequently Asked Questions' },
        { type: 'viva_qa', q: 'Q1. What is an operating system?', a: 'An operating system is system software that manages computer hardware and software resources and provides common services for computer programs. Examples: Windows, Linux, macOS.' },
        { type: 'viva_qa', q: 'Q2. What is the difference between process and thread?', a: 'A process is an independent program in execution with its own memory space. A thread is the smallest unit of execution within a process, sharing the process\'s memory.' },
        { type: 'viva_qa', q: 'Q3. Explain virtual memory.', a: 'Virtual memory is a memory management technique that creates an illusion of a larger main memory by using disk space. It allows programs larger than physical RAM to run.' },
        { type: 'viva_qa', q: 'Q4. What is deadlock? State its necessary conditions.', a: 'Deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another. Conditions: Mutual exclusion, Hold and wait, No preemption, Circular wait.' },
        { type: 'note', text: '⭐ Pro Tip: Always explain with real-world examples during viva!' },
      ],
    };
    return contents[resourceType] || contents.notes;
  };

  const content = generateContent(page);

  const renderBlock = (block, i) => {
    switch (block.type) {
      case 'heading':
        return <h2 key={i} className="text-xl font-bold text-gray-900 mb-1 pb-2 border-b-2 border-blue-500 mt-2">{block.text}</h2>;
      case 'subtitle':
        return <p key={i} className="text-xs text-gray-400 mb-5 italic">{block.text}</p>;
      case 'subheading':
        return <h3 key={i} className="text-sm font-bold text-gray-700 mt-6 mb-2 flex items-center gap-1.5"><span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />{block.text}</h3>;
      case 'paragraph':
        return <p key={i} className="text-xs text-gray-600 leading-relaxed mb-3">{block.text}</p>;
      case 'bullet':
        return (
          <ul key={i} className="mb-3 space-y-1.5">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        );
      case 'formula':
        return (
          <div key={i} className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-3 text-center">
            <code className="text-sm font-mono font-bold text-blue-700">{block.text}</code>
          </div>
        );
      case 'code':
        return (
          <div key={i} className="bg-gray-900 rounded-lg px-4 py-3 mb-3 overflow-x-auto">
            {block.lines.map((line, j) => (
              <div key={j} className="flex gap-3">
                <span className="text-gray-500 text-[10px] select-none w-4 text-right flex-shrink-0 font-mono">{j + 1}</span>
                <code className="text-[10px] font-mono text-green-300 whitespace-pre">{line}</code>
              </div>
            ))}
          </div>
        );
      case 'note':
        return (
          <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-3">
            <p className="text-xs text-amber-800 font-medium">{block.text}</p>
          </div>
        );
      case 'question':
        return (
          <div key={i} className="mb-2">
            <p className="text-xs font-bold text-gray-800 mb-1">Q{block.num}. {block.text}</p>
          </div>
        );
      case 'answer':
        return (
          <div key={i} className="bg-green-50 border-l-2 border-green-400 pl-3 py-2 mb-4 rounded-r-lg">
            <p className="text-[11px] text-gray-600 italic"><span className="font-bold text-green-700 not-italic">Ans: </span>{block.text}</p>
          </div>
        );
      case 'viva_qa':
        return (
          <div key={i} className="mb-4 border border-slate-100 rounded-xl overflow-hidden">
            <div className="bg-slate-700 px-4 py-2">
              <p className="text-xs font-bold text-white">{block.q}</p>
            </div>
            <div className="bg-slate-50 px-4 py-3">
              <p className="text-xs text-gray-600 leading-relaxed">{block.a}</p>
            </div>
          </div>
        );
      case 'table':
        return (
          <div key={i} className="mb-4 overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-600 text-white">
                  {block.headers.map((h, j) => <th key={j} className="px-3 py-2 text-left font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, j) => (
                  <tr key={j} className={j % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    {row.map((cell, k) => <td key={k} className="px-3 py-2 border-t border-gray-100">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: 'rgba(10,10,20,0.88)', backdropFilter: 'blur(10px)' }}
    >
      {/* Toolbar */}
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between gap-4 flex-shrink-0 border-b border-gray-700">
        <div className="flex items-center gap-3 min-w-0">
          <FileText size={17} className="text-blue-400 flex-shrink-0" />
          <span className="font-semibold text-sm truncate">{note.title}</span>
          <span className="text-gray-500 text-xs hidden sm:block">· Sample Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(60, z - 10))} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><ZoomOut size={14} /></button>
          <span className="text-xs w-10 text-center tabular-nums">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><ZoomIn size={14} /></button>
          <div className="w-px h-5 bg-gray-700 mx-1" />
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"><ChevronLeft size={14} /></button>
          <span className="text-xs w-14 text-center tabular-nums">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"><ChevronRight size={14} /></button>
          <div className="w-px h-5 bg-gray-700 mx-1" />
          <button onClick={onClose} className="p-1.5 hover:bg-red-500/30 rounded-lg transition-colors text-red-400"><X size={14} /></button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-800 flex items-start justify-center py-8 px-4">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="bg-white shadow-2xl rounded-sm"
          style={{ width: `${Math.min(zoom * 6.2, 700)}px`, minWidth: '300px', padding: '48px 52px' }}
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none rotate-[-30deg]">
            <span className="text-6xl font-black text-gray-900 tracking-wider">SAMPLE</span>
          </div>

          {content.map((block, i) => renderBlock(block, i))}

          {/* Footer */}
          <div className="mt-10 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
            <span>{note.subject || ''}</span>
            <span>Page {page} of {totalPages} · Sample Preview</span>
          </div>
        </motion.div>
      </div>

      {/* Page progress */}
      <div className="h-1 bg-gray-700">
        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(page / totalPages) * 100}%` }} />
      </div>
    </motion.div>
  );
};

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
        <div className="hidden md:flex items-center gap-1.5">
          <button onClick={() => onChange({ ...filters, type: 'all' })}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${filters.type === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-500'}`}>
            All Types
          </button>
          {RESOURCE_TYPES.map(rt => {
            const Icon = rt.icon;
            return (
              <button key={rt.id} onClick={() => onChange({ ...filters, type: rt.id })}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-1 ${filters.type === rt.id ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-500'}`}>
                <Icon size={12} /> {rt.label}
              </button>
            );
          })}
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => setOpen(!open)}
          className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${open || hasActiveFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-200'}`}>
          <Filter size={15} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />}
          <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>

      <div className="md:hidden flex items-center gap-1.5 px-3 pb-3 overflow-x-auto scrollbar-none">
        <button onClick={() => onChange({ ...filters, type: 'all' })}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filters.type === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500'}`}>
          All
        </button>
        {RESOURCE_TYPES.map(rt => {
          const Icon = rt.icon;
          return (
            <button key={rt.id} onClick={() => onChange({ ...filters, type: rt.id })}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${filters.type === rt.id ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500'}`}>
              <Icon size={12} /> {rt.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="border-t border-slate-100 bg-slate-50/60">
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Branch</label>
                <select value={filters.branch} onChange={e => onChange({ ...filters, branch: e.target.value, semester: 'All', subject: '' })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">All Branches</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{BRANCH_LABEL[b]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Semester</label>
                <select value={filters.semester} onChange={e => onChange({ ...filters, semester: e.target.value, subject: '' })}
                  disabled={!filters.branch}
                  className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${!filters.branch ? 'opacity-50 cursor-not-allowed' : 'text-slate-600'}`}>
                  <option value="All">All Semesters</option>
                  {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Subject</label>
                <select value={filters.subject} onChange={e => onChange({ ...filters, subject: e.target.value })}
                  disabled={!filters.branch || filters.semester === 'All'}
                  className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${!filters.branch || filters.semester === 'All' ? 'opacity-50 cursor-not-allowed' : 'text-slate-600'}`}>
                  <option value="">All Subjects</option>
                  {availableSubjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Module</label>
                <select value={filters.module} onChange={e => onChange({ ...filters, module: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="All">All Modules</option>
                  {MODULES.map(m => <option key={m} value={m}>Module {m}</option>)}
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Status</label>
                <div className="flex gap-2">
                  {[['all', 'All'], ['verified', '✓ Verified'], ['unverified', '⏳ Pending']].map(([val, label]) => (
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
              <span className="text-xs text-slate-500">{loading ? 'Loading…' : `${total} resource${total !== 1 ? 's' : ''} found`}</span>
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
const NoteCard = memo(({ note, onLike, currentUserId, onView }) => {
  const [liking, setLiking] = useState(false);
  const resourceType = note.resourceType || note.type || 'notes';
  const ts = getTypeStyle(resourceType);
  const rank = note.rank;
  const rs = getRankStyle(rank);
  const isLiked = note.likedBy?.includes(currentUserId);
  const isPaid = note.pointsType === 'paid';
  const cost = note.points || 15;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!currentUserId || liking) return;
    setLiking(true);
    try { await onLike(note.id, isLiked); }
    finally { setLiking(false); }
  };

  const typeLabel = { notes: 'Notes', pyq: 'PYQ', lab_manual: 'Lab Manual', viva: 'Viva' }[resourceType] || resourceType.toUpperCase();

  return (
    <motion.div variants={fadeUp}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(30,64,175,0.10)' }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden group relative ${rs.ring}`}
    >
      <div className={`h-1 bg-gradient-to-r ${ts.bar}`} />
      {note.gold && <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 animate-pulse" />}

      <div className="p-5">
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
            {isPaid && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">
                <Lock size={9} /> {cost} pts
              </span>
            )}
            {note.gold && (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                🏅 Gold
              </span>
            )}
          </div>
        </div>

        <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors mb-1.5 line-clamp-2">
          {note.title || 'Untitled'}
        </h4>
        {note.description && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{note.description}</p>}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 mb-3">
          <span className="font-medium text-slate-500">{note.authorName || note.uploadedByName || note.author || 'Anonymous'}</span>
          {note.subject && <><span>·</span><span className="text-slate-600">{note.subject}</span></>}
          {note.semester && <><span>·</span><span>Sem {note.semester}</span></>}
        </div>

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

        <div className="flex items-center justify-between mb-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
            onClick={handleLike} disabled={liking || !currentUserId}
            title={!currentUserId ? 'Login to like' : isLiked ? 'Unlike' : 'Like'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isLiked ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200' : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500'
            } ${liking || !currentUserId ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <ThumbsUp size={12} className={liking ? 'animate-bounce' : ''} />
            <span>{(note.upvotes || 0).toLocaleString()}</span>
          </motion.button>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Download size={11} />
            <span>{(note.downloads || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar size={11} />
            <span>{note.uploadedAt?.toDate ? new Date(note.uploadedAt.toDate()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}</span>
          </div>
        </div>

        {/* CTA Button — handles paid vs free */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => onView(note)}
          className={`w-full py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 ${
            isPaid
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          }`}>
          {isPaid ? <><Lock size={13} /> Unlock — {cost} pts</> : <><ZoomIn size={13} /> View Resource</>}
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
          <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>{stat.icon}</div>
          <div>
            <p className="font-bold text-slate-800 text-lg leading-none">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

// ── Success Toast ─────────────────────────────────────────────────────────────
const SuccessToast = ({ message, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div initial={{ opacity: 0, y: 60, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold">
      <Check size={16} className="text-green-400" />
      {message}
    </motion.div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const BestNotes = () => {
  const [allNotes, setAllNotes]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [currentUser, setCurrentUser]   = useState(null);
  const [paidModal, setPaidModal]       = useState(null); // note to unlock
  const [viewingNote, setViewingNote]   = useState(null); // note to view in PDF
  const [purchasedIds, setPurchasedIds] = useState([]);   // already-purchased note IDs
  const [toast, setToast]               = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const NOTES_PER_PAGE = 10;

  const [filters, setFilters] = useState({
    search: '', branch: '', semester: 'All', module: 'All',
    type: 'all', verified: 'all', subject: ''
  });

  // Reset to page 1 whenever filters change
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  // ── Auth ──
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async u => {
      setCurrentUser(u);
      if (u) {
        // Load purchased notes for this user
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          setPurchasedIds(snap.data().purchasedNotes || []);
        }
      }
    });
    return unsub;
  }, []);

  // ── Notes listener ──
  // Synchronous snapshot processing — no async awaits, no per-note Firestore reads.
  // Author name is read directly from the stored `uploadedByName` field on each doc.
  // This prevents the 20-30s blinking caused by sequential async author lookups
  // re-triggering the effect on every cache update.
  useEffect(() => {
    setLoading(true);
    setError(null);
    let unsubscribe;

    const processSnap = (snap) => {
      const notes = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          authorName: data.uploadedByName || data.authorName || data.author || 'Anonymous',
          upvotes:   data.upvotes   || 0,
          downloads: data.downloads || 0,
          likedBy:   data.likedBy   || [],
          verified:  data.verified  || false,
          gold:      data.gold      || false,
        };
      });
      setAllNotes(notes);
      setLoading(false);
    };

    // Try ordered query first; fall back to unordered if index missing
    const q = query(collection(db, 'notes'), orderBy('upvotes', 'desc'));
    unsubscribe = onSnapshot(q, processSnap, (err) => {
      if (err.code === 'failed-precondition' || err.message.includes('index')) {
        if (unsubscribe) unsubscribe();
        unsubscribe = onSnapshot(
          collection(db, 'notes'),
          (snap) => {
            const notes = snap.docs.map(d => {
              const data = d.data();
              return {
                id: d.id,
                ...data,
                authorName: data.uploadedByName || data.authorName || data.author || 'Anonymous',
                upvotes:   data.upvotes   || 0,
                downloads: data.downloads || 0,
                likedBy:   data.likedBy   || [],
                verified:  data.verified  || false,
                gold:      data.gold      || false,
              };
            });
            notes.sort((a, b) => b.upvotes - a.upvotes);
            setAllNotes(notes);
            setLoading(false);
          },
          (err2) => { setError('Could not load notes: ' + err2.message); setLoading(false); }
        );
      } else {
        setError('Could not load notes: ' + err.message);
        setLoading(false);
      }
    });

    return () => { if (unsubscribe) unsubscribe(); };
  }, []); // empty deps — subscribe once, never re-subscribe

  // ── Like handler ──
  const handleLike = useCallback(async (noteId, currentlyLiked) => {
    if (!currentUser) { alert('Please log in to like notes.'); return; }
    const ref = doc(db, 'notes', noteId);
    try {
      if (currentlyLiked) {
        await updateDoc(ref, { upvotes: increment(-1), likedBy: arrayRemove(currentUser.uid) });
      } else {
        await updateDoc(ref, { upvotes: increment(1), likedBy: arrayUnion(currentUser.uid) });
      }
    } catch (err) { console.error('Like error:', err); alert('Failed to update like.'); }
  }, [currentUser]);

  // ── View handler — checks if paid ──
  const handleView = useCallback((note) => {
    if (!currentUser) { alert('Please log in to view resources.'); return; }

    const isPaid = note.pointsType === 'paid';
    const isOwner = note.uploadedBy === currentUser.uid;
    const alreadyPurchased = purchasedIds.includes(note.id);

    if (!isPaid || isOwner || alreadyPurchased) {
      // Free, own note, or already purchased — open directly
      setViewingNote(note);
    } else {
      // Show payment modal
      setPaidModal(note);
    }
  }, [currentUser, purchasedIds]);

  // ── After successful purchase ──
  const handlePurchaseSuccess = useCallback(() => {
    if (!paidModal) return;
    const noteId = paidModal.id;
    setPurchasedIds(prev => [...prev, noteId]);
    setPaidModal(null);
    setToast(`Unlocked! ${paidModal.points || 15} points transferred to uploader ✓`);
    setViewingNote(paidModal);
  }, [paidModal]);

  // ── Filtered + ranked ──
  const filteredNotes = React.useMemo(() => {
    let list = [...allNotes];
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      if (q) list = list.filter(n => n.title?.toLowerCase().includes(q) || n.subject?.toLowerCase().includes(q) || n.authorName?.toLowerCase().includes(q) || n.uploadedByName?.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q));
    }
    if (filters.branch) list = list.filter(n => n.branch === filters.branch);
    if (filters.semester !== 'All') list = list.filter(n => String(n.semester) === filters.semester);
    if (filters.subject) list = list.filter(n => n.subject === filters.subject);
    if (filters.module !== 'All') list = list.filter(n => String(n.module) === filters.module);
    if (filters.type !== 'all') list = list.filter(n => (n.resourceType || n.type) === filters.type);
    if (filters.verified === 'verified') list = list.filter(n => n.verified === true);
    else if (filters.verified === 'unverified') list = list.filter(n => n.verified === false);
    return list.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).map((note, index) => ({ ...note, rank: index + 1 }));
  }, [allNotes, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / NOTES_PER_PAGE));
  const paginatedNotes = filteredNotes.slice((currentPage - 1) * NOTES_PER_PAGE, currentPage * NOTES_PER_PAGE);

  return (
    <>
      <motion.div variants={stagger} animate="show" className="space-y-5">
        {/* Hero */}
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

        {allNotes.length > 0 && <StatsBar notes={allNotes} />}

        <FilterBar filters={filters} onChange={handleFilterChange} total={filteredNotes.length} loading={loading} />

        {error && (
          <motion.div variants={fadeUp} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
            <X size={16} className="flex-shrink-0" /> {error}
            <button onClick={() => window.location.reload()} className="ml-auto text-xs underline font-semibold">Retry</button>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredNotes.length > 0 ? (
          <>
            <motion.div variants={fadeUp} className="flex items-center gap-2 text-xs text-slate-500">
              <TrendingUp size={13} />
              <span>Sorted by most likes · live updates enabled</span>
              <span className="ml-auto font-semibold text-slate-700">
                {(currentPage - 1) * NOTES_PER_PAGE + 1}–{Math.min(currentPage * NOTES_PER_PAGE, filteredNotes.length)} of {filteredNotes.length} results
              </span>
            </motion.div>
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {paginatedNotes.map(note => (
                  <NoteCard key={note.id} note={note} onLike={handleLike}
                    currentUserId={currentUser?.uid} onView={handleView} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* ── Pagination Bar ── */}
            {totalPages > 1 && (
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 pt-2 pb-1 flex-wrap">
                {/* Prev */}
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={13} /> Prev
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Show first, last, current ±1, and ellipsis in between
                  const show = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  const showEllipsisLeft  = page === currentPage - 2 && currentPage - 2 > 1;
                  const showEllipsisRight = page === currentPage + 2 && currentPage + 2 < totalPages;

                  if (showEllipsisLeft || showEllipsisRight) {
                    return <span key={`ellipsis-${page}`} className="text-slate-400 text-xs px-1">…</span>;
                  }
                  if (!show) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                          : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight size={13} />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-blue-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No resources found</h3>
            <p className="text-slate-400 text-sm mb-5">{allNotes.length === 0 ? 'No notes have been uploaded yet. Be the first!' : 'Try adjusting your search or filters.'}</p>
            {allNotes.length > 0 && (
              <button onClick={() => handleFilterChange({ search: '', branch: '', semester: 'All', module: 'All', type: 'all', verified: 'all', subject: '' })}                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                Clear All Filters
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Paid Modal */}
      <AnimatePresence>
        {paidModal && (
          <PaidNoteModal
            note={paidModal}
            currentUser={currentUser}
            onClose={() => setPaidModal(null)}
            onSuccess={handlePurchaseSuccess}
          />
        )}
      </AnimatePresence>

      {/* PDF Viewer */}
      <AnimatePresence>
        {viewingNote && <PDFViewer note={viewingNote} onClose={() => setViewingNote(null)} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <SuccessToast message={toast} onDone={() => setToast('')} />}
      </AnimatePresence>
    </>
  );
};

export default BestNotes;