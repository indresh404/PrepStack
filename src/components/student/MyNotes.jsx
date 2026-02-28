// src/components/student/MyNotes.jsx
import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Bookmark, Upload, Search, Filter, Clock, Eye } from 'lucide-react';

const stagger = { show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const NOTES = [
  { id: 1, title: 'DBMS – Normalization Notes',      subject: 'Database Systems',  pages: 24, saved: true,  views: 312, updated: '2d ago',  color: 'from-blue-500 to-blue-600'    },
  { id: 2, title: 'OS – Process Scheduling',          subject: 'Operating Systems', pages: 18, saved: false, views: 198, updated: '5d ago',  color: 'from-purple-500 to-purple-600' },
  { id: 3, title: 'CN – Network Layer Protocols',     subject: 'Computer Networks', pages: 32, saved: true,  views: 276, updated: '1w ago',  color: 'from-indigo-500 to-indigo-600' },
  { id: 4, title: 'DSA – Graph Algorithms',           subject: 'Data Structures',   pages: 28, saved: false, views: 154, updated: '1w ago',  color: 'from-cyan-500 to-cyan-600'     },
  { id: 5, title: 'TOC – Finite Automata',            subject: 'Theory of Comp.',   pages: 20, saved: true,  views: 211, updated: '2w ago',  color: 'from-teal-500 to-teal-600'     },
  { id: 6, title: 'SE – SDLC Models',                 subject: 'Software Engg.',    pages: 16, saved: false, views: 134, updated: '3w ago',  color: 'from-sky-500 to-sky-600'       },
];

const NoteCard = memo(({ note, onToggleSave }) => {
  return (
    <motion.div variants={fadeUp}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(59,130,246,0.15)', transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className="bg-white rounded-2xl border border-blue-100 overflow-hidden cursor-pointer group"
    >
      {/* Colour accent bar */}
      <div className={`h-1.5 bg-gradient-to-r ${note.color}`} />
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${note.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
            <BookOpen size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-blue-600 transition-colors truncate">{note.title}</h4>
            <p className="text-xs text-gray-400 mt-0.5">{note.subject}</p>
          </div>
          <motion.button whileHover={{ scale: 1.2 }} onClick={() => onToggleSave(note.id)}
            className={`flex-shrink-0 transition-colors ${note.saved ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}>
            <Bookmark size={16} fill={note.saved ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><BookOpen size={11}/> {note.pages} pages</span>
            <span className="flex items-center gap-1"><Eye size={11}/> {note.views}</span>
          </div>
          <span className="flex items-center gap-1"><Clock size={11}/> {note.updated}</span>
        </div>

        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.04 }}
            className="flex-1 bg-blue-600 text-white text-xs font-semibold py-2 rounded-xl hover:bg-blue-700 transition-colors">
            Read Now
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }}
            className="px-3 py-2 border border-blue-200 text-blue-600 text-xs font-semibold rounded-xl hover:bg-blue-50 transition-colors">
            Share
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

const MyNotes = () => {
  const [notes, setNotes]     = useState(NOTES);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');

  const toggleSave = (id) => setNotes(ns => ns.map(n => n.id === id ? { ...n, saved: !n.saved } : n));

  const filtered = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase());
    if (filter === 'saved') return matchSearch && n.saved;
    return matchSearch;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">My Notes</h2>
            <p className="text-blue-100 text-sm">You have {notes.length} notes · {notes.filter(n=>n.saved).length} saved</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-white text-blue-600 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg hover:bg-blue-50 transition-colors">
            <Upload size={16}/> Upload Note
          </motion.button>
        </div>
      </motion.div>

      {/* Search + Filter */}
      <motion.div variants={fadeUp} className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full bg-white border border-blue-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:shadow-sm transition-all shadow-sm" />
        </div>
        <div className="flex gap-2">
          {[['all','All'],['saved','Saved']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${filter === val ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 border border-blue-100 hover:border-blue-300'}`}>
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(note => <NoteCard key={note.id} note={note} onToggleSave={toggleSave} />)}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No notes found</p>
        </div>
      )}
    </motion.div>
  );
};

export default MyNotes;