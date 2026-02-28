// src/components/student/MyNotes.jsx
import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Bookmark, Upload, Search, Clock, Eye, Heart,
  X, FileText, DollarSign, Layers, Tag,
  AlertCircle, Loader2, CheckCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RefreshCw
} from 'lucide-react';
import {
  collection, query, where, onSnapshot, getDocs,
  addDoc, serverTimestamp, doc, updateDoc, getDoc, increment
} from 'firebase/firestore';
import { db } from '../../firebase';

// ─── Animation variants ───────────────────────────────────────────────────────
const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } }
};

// ─── Static data ──────────────────────────────────────────────────────────────
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

const resourceTypes = [
  { id: 'notes',      label: 'Notes',      icon: BookOpen },
  { id: 'pyq',        label: 'PYQs',       icon: FileText },
  { id: 'lab_manual', label: 'Lab Manual', icon: Layers   },
  { id: 'viva',       label: 'Viva',       icon: Tag      },
];

const colorMap = {
  notes:      'from-blue-500 to-blue-600',
  pyq:        'from-purple-500 to-purple-600',
  lab_manual: 'from-green-500 to-green-600',
  viva:       'from-amber-500 to-amber-600',
};

// Safely get user uid from localStorage — handles uid / id / userId field names
const getUserFromStorage = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    // Support different possible field names
    const uid = u.uid || u.id || u.userId || u.user_id || null;
    return uid ? { ...u, uid } : null;
  } catch {
    return null;
  }
};

// Convert a Firestore doc snapshot to a UI note object
const docToNote = (d) => {
  const data = d.data();
  const ts   = data.uploadedAt?.toDate?.();
  const days = ts ? Math.floor((Date.now() - ts) / 86400000) : null;
  return {
    id: d.id,
    ...data,
    updated: days === null ? 'Just now' : days === 0 ? 'Today' : `${days}d ago`,
    color:  colorMap[data.resourceType] || 'from-blue-500 to-blue-600',
    saved:  false,
    liked:  false,
  };
};

const sortByDate = (arr) =>
  [...arr].sort((a, b) => {
    const ta = a.uploadedAt?.toDate?.()?.getTime() || 0;
    const tb = b.uploadedAt?.toDate?.()?.getTime() || 0;
    return tb - ta;
  });

// ─── Fake PDF Viewer ──────────────────────────────────────────────────────────
const FakePDFViewer = ({ note, onClose }) => {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const totalPages = note.pages || 12;

  const generateLines = (pageNum) => {
    const topics = {
      notes:      ['Introduction', 'Key Concepts', 'Definitions', 'Examples', 'Summary'],
      pyq:        ['Q1. Explain the concept...', 'Q2. Derive the formula...', 'Q3. Write a program...', 'Q4. Compare and contrast...'],
      lab_manual: ['Aim', 'Theory', 'Procedure', 'Code', 'Output', 'Conclusion'],
      viva:       ['Q: What is...?', 'A: It is defined as...', 'Q: Explain the difference...', 'A: The main difference is...'],
    };
    const base = topics[note.resourceType] || topics.notes;
    return Array.from({ length: 16 }, (_, i) => {
      if (i === 0) return { kind: 'heading',    text: `${base[pageNum % base.length]}` };
      if (i === 1) return { kind: 'subtitle',   text: `${note.subject || ''} — Page ${pageNum}` };
      if (i === 4 || i === 10) return { kind: 'subheading', text: base[(pageNum + i) % base.length] };
      if (i % 6 === 0) return { kind: 'spacer' };
      return { kind: 'line', width: 55 + ((pageNum * i * 7) % 40) };
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between gap-4 flex-shrink-0 border-b border-gray-700">
        <div className="flex items-center gap-3 min-w-0">
          <FileText size={17} className="text-blue-400 flex-shrink-0" />
          <span className="font-semibold text-sm truncate">{note.title}</span>
          <span className="text-gray-500 text-xs hidden sm:block">· {note.fileName || 'document.pdf'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><ZoomOut size={14} /></button>
          <span className="text-xs w-10 text-center tabular-nums">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(160, z + 10))} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><ZoomIn size={14} /></button>
          <div className="w-px h-5 bg-gray-700 mx-1" />
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"><ChevronLeft size={14} /></button>
          <span className="text-xs w-14 text-center tabular-nums">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"><ChevronRight size={14} /></button>
          <div className="w-px h-5 bg-gray-700 mx-1" />
          <button onClick={onClose} className="p-1.5 hover:bg-red-500/30 rounded-lg transition-colors"><X size={14} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-800 flex items-start justify-center py-10 px-4">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white shadow-2xl"
          style={{ width: `${Math.min(zoom * 6.5, 720)}px`, minWidth: '280px', padding: '52px 56px', borderRadius: '2px' }}
        >
          {generateLines(page).map((line, i) => {
            if (line.kind === 'heading')    return <h2 key={i} className="text-xl font-bold text-gray-900 mb-1 pb-2 border-b-2 border-blue-500">{line.text}</h2>;
            if (line.kind === 'subtitle')   return <p  key={i} className="text-xs text-gray-400 mb-6">{line.text}</p>;
            if (line.kind === 'subheading') return <h3 key={i} className="text-sm font-semibold text-gray-700 mt-6 mb-3">{line.text}</h3>;
            if (line.kind === 'spacer')     return <div key={i} className="h-3" />;
            return <div key={i} className="h-2.5 bg-gray-100 rounded-full mb-2.5" style={{ width: `${line.width}%` }} />;
          })}
          <div className="mt-10 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
            <span>{note.subject}</span>
            <span>Page {page} of {totalPages}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Note Card ────────────────────────────────────────────────────────────────
const NoteCard = memo(({ note, onToggleSave, onToggleLike, onRead }) => {
  const [hovered, setHovered] = useState(false);
  const color = note.color || 'from-blue-500 to-blue-600';

  return (
    <motion.div
      variants={fadeUp}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        y: hovered ? -6 : 0,
        boxShadow: hovered
          ? '0 24px 48px rgba(59,130,246,0.18), 0 4px 12px rgba(59,130,246,0.08)'
          : '0 1px 4px rgba(0,0,0,0.06)',
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="bg-white rounded-2xl border border-blue-100"
    >
      <div className={`h-1.5 rounded-t-2xl bg-gradient-to-r ${color}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow`}>
            <BookOpen size={17} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className="font-semibold text-sm leading-snug truncate transition-colors duration-200"
              style={{ color: hovered ? '#2563eb' : '#111827' }}
            >
              {note.title}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{note.subject}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.25 }} whileTap={{ scale: 0.9 }}
            onClick={e => { e.stopPropagation(); onToggleSave(note.id); }}
            className={`flex-shrink-0 transition-colors duration-150 ${note.saved ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
          >
            <Bookmark size={16} fill={note.saved ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><BookOpen size={11} /> {note.pages || 12}p</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {note.views || 0}</span>
            <motion.button
              whileHover={{ scale: 1.25 }} whileTap={{ scale: 0.85 }}
              onClick={e => { e.stopPropagation(); onToggleLike(note.id); }}
              className={`flex items-center gap-1 transition-colors duration-150 ${note.liked ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
            >
              <Heart size={11} fill={note.liked ? 'currentColor' : 'none'} />
              <span>{note.likes || 0}</span>
            </motion.button>
          </div>
          <span className="flex items-center gap-1"><Clock size={11} /> {note.updated || 'Just now'}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {note.resourceType && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r ${color} text-white`}>
              {resourceTypes.find(r => r.id === note.resourceType)?.label || note.resourceType}
            </span>
          )}
          {note.branch && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
              {note.branch === 'computer_engineering' ? 'CMPN' : 'IT'} · Sem {note.semester}
            </span>
          )}
          {note.module && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
              Mod {note.module}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onRead(note)}
            className="flex-1 bg-blue-600 text-white text-xs font-semibold py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Read Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="px-3 py-2 border border-blue-200 text-blue-600 text-xs font-semibold rounded-xl hover:bg-blue-50 transition-colors"
          >
            Share
          </motion.button>
        </div>

        {note.pointsType === 'paid' && (
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
            <DollarSign size={11} /> {note.points} pts required
          </div>
        )}
      </div>
    </motion.div>
  );
});

// ─── Upload Form ──────────────────────────────────────────────────────────────
const UploadForm = ({ onClose, onUpload, userId }) => {
  const [step,          setStep]          = useState(1);
  const [loading,       setLoading]       = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formData,      setFormData]      = useState({
    title: '', description: '', fileName: '',
    pointsType: 'free', points: 0,
    branch: '', semester: '', subject: '', module: '', resourceType: '',
  });
  const [errors, setErrors] = useState({});

  const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleChange = e => {
    const { name, value } = e.target;
    set(name, value);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = e => {
    const f = e.target.files[0];
    if (f) { set('fileName', f.name); setErrors(prev => ({ ...prev, file: '' })); }
  };

  const validate1 = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (!formData.fileName)     e.file  = 'Please select a file';
    if (formData.pointsType === 'paid' && !(formData.points > 0)) e.points = 'Enter a valid point value';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validate2 = () => {
    const e = {};
    if (!formData.branch)       e.branch       = 'Select a branch';
    if (!formData.semester)     e.semester     = 'Select a semester';
    if (!formData.subject)      e.subject      = 'Select a subject';
    if (!formData.module)       e.module       = 'Select a module';
    if (!formData.resourceType) e.resourceType = 'Select a resource type';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate2()) return;
    setLoading(true);
    try {
      const user = getUserFromStorage();
      if (!user?.uid) throw new Error('Not authenticated — please log in again');

      // Get latest points from Firestore
      let currentPoints = 0;
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) currentPoints = userSnap.data().points || 0;
      } catch (_) { /* continue even if points fetch fails */ }

      const noteData = {
        title:          formData.title,
        description:    formData.description || '',
        fileName:       formData.fileName,
        fileUrl:        null,
        pointsType:     formData.pointsType,
        points:         formData.pointsType === 'paid' ? parseInt(formData.points) : 0,
        branch:         formData.branch,
        semester:       parseInt(formData.semester),
        subject:        formData.subject,
        module:         parseInt(formData.module),
        resourceType:   formData.resourceType,
        uploadedBy:     user.uid,
        uploadedByName: user.username || user.name || user.displayName || 'User',
        uploadedAt:     serverTimestamp(),
        views: 0, saves: 0, likes: 0,
        pages: Math.floor(Math.random() * 28) + 8,
      };

      const docRef = await addDoc(collection(db, 'notes'), noteData);

      // Update points — wrapped so upload doesn't fail if this does
      try {
        await updateDoc(doc(db, 'users', user.uid), { points: increment(10) });
      } catch (_) {}

      const newPoints = currentPoints + 10;
      localStorage.setItem('user', JSON.stringify({ ...user, points: newPoints }));

      const newNote = {
        id: docRef.id,
        ...noteData,
        uploadedAt: { toDate: () => new Date() },
        updated: 'Just now',
        color: colorMap[noteData.resourceType] || 'from-blue-500 to-blue-600',
        saved: false, liked: false,
      };

      setUploadSuccess(true);
      setTimeout(() => { onUpload(newNote, newPoints); onClose(); }, 1600);
    } catch (err) {
      console.error('Upload error:', err);
      setErrors({ submit: err.message || 'Upload failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = err =>
    `w-full px-4 py-2.5 border ${err ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-sm`;
  const toggleCls = active =>
    `flex-1 py-2.5 rounded-xl border font-semibold transition-all text-sm ${active ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`;
  const pillCls = active =>
    `px-4 py-2 rounded-lg border font-medium transition-all text-sm ${active ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`;
  const listCls = active =>
    `w-full text-left px-4 py-2.5 rounded-xl border font-medium transition-all text-sm ${active ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {uploadSuccess ? (
          <div className="p-14 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220 }}>
              <CheckCircle size={68} className="text-green-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Successful!</h3>
            <p className="text-gray-500 mb-2">Your note is now available.</p>
            <p className="text-green-600 font-bold text-lg">+10 points earned 🎉</p>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Upload New Note</h2>
                <p className="text-xs text-gray-400 mt-0.5">Step {step} of 2</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="px-6 pt-3 pb-1">
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div animate={{ width: step === 1 ? '50%' : '100%' }} transition={{ duration: 0.35 }}
                  className="h-full bg-blue-600 rounded-full" />
              </div>
            </div>
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-5">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="s1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                      <input name="title" value={formData.title} onChange={handleChange}
                        placeholder="e.g., DBMS Normalization Complete Notes" className={inputCls(errors.title)} />
                      {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                      <textarea name="description" value={formData.description} onChange={handleChange}
                        rows="3" placeholder="Brief overview…"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors resize-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        File <span className="text-red-500">*</span>
                        <span className="ml-2 text-xs text-gray-400 font-normal">— filename saved, no upload</span>
                      </label>
                      <label htmlFor="pdf-upload"
                        className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${errors.file ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/30'}`}>
                        <Upload size={28} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{formData.fileName || 'Click to select a file'}</span>
                        <span className="text-xs text-gray-400">PDF, DOC, DOCX</span>
                        <input id="pdf-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                      </label>
                      {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Access type</label>
                      <div className="flex gap-3">
                        {['free', 'paid'].map(t => (
                          <button key={t} type="button" onClick={() => set('pointsType', t)}
                            className={`flex-1 py-2.5 rounded-xl border font-semibold transition-all text-sm ${
                              formData.pointsType === t
                                ? t === 'free' ? 'bg-green-600 text-white border-green-600' : 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}>{t === 'free' ? 'Free' : 'Paid'}</button>
                        ))}
                      </div>
                    </div>
                    {formData.pointsType === 'paid' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Points required <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input name="points" type="number" min="1" value={formData.points} onChange={handleChange}
                            className={`${inputCls(errors.points)} pl-9`} />
                        </div>
                        {errors.points && <p className="text-xs text-red-500 mt-1">{errors.points}</p>}
                      </motion.div>
                    )}
                    <button type="button" onClick={() => validate1() && setStep(2)}
                      className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all mt-2">
                      Next: Tags & Category →
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Branch <span className="text-red-500">*</span></label>
                      <div className="flex gap-3">
                        {[{ id: 'computer_engineering', label: 'CMPN' }, { id: 'information_technology', label: 'IT' }].map(b => (
                          <button key={b.id} type="button"
                            onClick={() => setFormData(p => ({ ...p, branch: b.id, semester: '', subject: '' }))}
                            className={toggleCls(formData.branch === b.id)}>{b.label}</button>
                        ))}
                      </div>
                      {errors.branch && <p className="text-xs text-red-500 mt-1">{errors.branch}</p>}
                    </div>
                    {formData.branch && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Semester <span className="text-red-500">*</span></label>
                        <div className="flex gap-2 flex-wrap">
                          {[1,2,3,4].map(s => (
                            <button key={s} type="button"
                              onClick={() => setFormData(p => ({ ...p, semester: s, subject: '' }))}
                              className={pillCls(formData.semester === s)}>Sem {s}</button>
                          ))}
                        </div>
                        {errors.semester && <p className="text-xs text-red-500 mt-1">{errors.semester}</p>}
                      </motion.div>
                    )}
                    {formData.branch && formData.semester && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
                        <div className="space-y-2">
                          {(subjectsByBranchAndSem[formData.branch]?.[formData.semester] || []).map(sub => (
                            <button key={sub} type="button" onClick={() => set('subject', sub)} className={listCls(formData.subject === sub)}>{sub}</button>
                          ))}
                        </div>
                        {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                      </motion.div>
                    )}
                    {formData.subject && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Module / Chapter <span className="text-red-500">*</span></label>
                        <div className="flex gap-2 flex-wrap">
                          {[1,2,3,4,5,6].map(m => (
                            <button key={m} type="button" onClick={() => set('module', m)} className={pillCls(formData.module === m)}>Module {m}</button>
                          ))}
                        </div>
                        {errors.module && <p className="text-xs text-red-500 mt-1">{errors.module}</p>}
                      </motion.div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Resource type <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {resourceTypes.map(rt => {
                          const Icon = rt.icon;
                          return (
                            <button key={rt.id} type="button" onClick={() => set('resourceType', rt.id)}
                              className={`flex items-center gap-2 p-3 rounded-xl border font-medium text-sm transition-all ${formData.resourceType === rt.id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                              <Icon size={15} />{rt.label}
                            </button>
                          );
                        })}
                      </div>
                      {errors.resourceType && <p className="text-xs text-red-500 mt-1">{errors.resourceType}</p>}
                    </div>
                    <div className="bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl flex items-center gap-2">
                      <CheckCircle size={15} className="text-blue-500 flex-shrink-0" />
                      <p className="text-sm text-blue-800">You'll earn <strong>10 points</strong> for this upload!</p>
                    </div>
                    {errors.submit && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                        <AlertCircle size={15} />{errors.submit}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(1)}
                        className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                        ← Back
                      </button>
                      <button type="submit" disabled={loading}
                        className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {loading ? <><Loader2 size={15} className="animate-spin" />Saving…</> : <><Upload size={15} />Upload (+10 pts)</>}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MyNotes = () => {
  const [notes,          setNotes]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [loadError,      setLoadError]      = useState('');
  const [search,         setSearch]         = useState('');
  const [filter,         setFilter]         = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [userPoints,     setUserPoints]     = useState(0);
  const [viewingNote,    setViewingNote]    = useState(null);
  const [currentUser,    setCurrentUser]    = useState(null);

  const loadNotes = (uid) => {
    setLoading(true);
    setLoadError('');

    // Use getDocs first (one-shot fetch) — more reliable than onSnapshot for initial load
    // Then set up the live listener
    const q = query(collection(db, 'notes'), where('uploadedBy', '==', uid));

    // Initial one-shot fetch so notes show immediately even if listener is slow
    getDocs(q)
      .then(snap => {
        const list = sortByDate(snap.docs.map(docToNote));
        setNotes(list);
        setLoading(false);
      })
      .catch(err => {
        console.error('getDocs error:', err);
        setLoadError(err.message);
        setLoading(false);
      });

    // Live listener for real-time updates after initial load
    const unsub = onSnapshot(q,
      snap => {
        const list = sortByDate(snap.docs.map(docToNote));
        setNotes(list);
        setLoading(false);
      },
      err => {
        console.error('onSnapshot error:', err);
        // Don't overwrite notes if we already loaded them via getDocs
        setLoading(false);
        // Only show error if we have no notes at all
        setNotes(prev => {
          if (prev.length === 0) setLoadError(err.message);
          return prev;
        });
      }
    );

    return unsub;
  };

  useEffect(() => {
    const user = getUserFromStorage();
    setCurrentUser(user);

    if (!user) {
      setLoading(false);
      setLoadError('Not logged in — please log in to see your notes.');
      return;
    }

    setUserPoints(user.points || 0);

    const unsubNotes = loadNotes(user.uid);

    // Listen for points changes
    const unsubUser = onSnapshot(doc(db, 'users', user.uid),
      snap => {
        if (snap.exists()) {
          const pts = snap.data().points || 0;
          setUserPoints(pts);
          const cur = getUserFromStorage() || {};
          localStorage.setItem('user', JSON.stringify({ ...cur, points: pts }));
        }
      },
      err => console.warn('Points listener error:', err)
    );

    return () => { unsubNotes(); unsubUser(); };
  }, []);

  const toggleSave = id => setNotes(prev => prev.map(n => n.id === id ? { ...n, saved: !n.saved } : n));

  const toggleLike = id => setNotes(prev => prev.map(n => {
    if (n.id !== id) return n;
    const liked = !n.liked;
    return { ...n, liked, likes: (n.likes || 0) + (liked ? 1 : -1) };
  }));

  const handleUpload = (newNote, newPoints) => {
    setNotes(prev => [newNote, ...prev]);
    setUserPoints(newPoints);
  };

  const handleRetry = () => {
    const user = getUserFromStorage();
    if (user) loadNotes(user.uid);
  };

  const filtered = notes.filter(n => {
    const q = search.toLowerCase();
    const match = n.title?.toLowerCase().includes(q) || n.subject?.toLowerCase().includes(q);
    if (filter === 'saved') return match && n.saved;
    return match;
  });

  return (
    <>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">My Notes</h2>
              <p className="text-blue-100 text-sm">
                {notes.length} note{notes.length !== 1 ? 's' : ''} uploaded ·{' '}
                <span className="font-bold text-white">{userPoints}</span> total points
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              onClick={() => setShowUploadForm(true)}
              className="flex items-center gap-2 bg-white text-blue-600 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg hover:bg-blue-50 transition-colors">
              <Upload size={15} /> Upload Note (+10 pts)
            </motion.button>
          </div>
        </motion.div>

        {/* Search + filter */}
        <motion.div variants={fadeUp} className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notes or subjects…"
              className="w-full bg-white border border-blue-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-400 shadow-sm transition-all" />
          </div>
          <div className="flex gap-2">
            {[['all', 'All'], ['saved', 'Saved']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${filter === val ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-500 border border-blue-100 hover:border-blue-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 size={36} className="animate-spin text-blue-500" />
            <p className="text-sm">Loading your notes…</p>
          </div>
        ) : loadError ? (
          <motion.div variants={fadeUp} className="text-center py-20">
            <AlertCircle size={48} className="mx-auto mb-3 text-red-400 opacity-60" />
            <p className="font-semibold text-gray-600 text-base mb-1">Could not load notes</p>
            <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">{loadError}</p>
            <button onClick={handleRetry}
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
              <RefreshCw size={14} /> Retry
            </button>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div variants={fadeUp} className="text-center py-20 text-gray-400">
            <BookOpen size={52} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-gray-500 text-base">
              {notes.length === 0 ? 'No notes yet' : 'No notes match your search'}
            </p>
            {notes.length === 0 && (
              <button onClick={() => setShowUploadForm(true)}
                className="mt-4 text-blue-600 font-semibold text-sm hover:underline">
                Upload your first note and earn 10 points!
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-2">
            {filtered.map(note => (
              <NoteCard key={note.id} note={note}
                onToggleSave={toggleSave}
                onToggleLike={toggleLike}
                onRead={setViewingNote}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showUploadForm && (
          <UploadForm onClose={() => setShowUploadForm(false)} onUpload={handleUpload} userId={currentUser?.uid} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingNote && <FakePDFViewer note={viewingNote} onClose={() => setViewingNote(null)} />}
      </AnimatePresence>
    </>
  );
};

export default MyNotes;