// src/components/student/BestNotes.jsx
import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Award, ThumbsUp, Download, BookOpen, FileText, Beaker, Crown, Star, Filter } from 'lucide-react';

const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const NOTES = [
  { id:1, rank:1, title:'Complete DBMS Guide',         type:'notes', subject:'DBMS',      author:'Prof. Sharma',    upvotes:312, downloads:1450, verified:true,  gold:true  },
  { id:2, rank:2, title:'OS Previous Year 2024',       type:'pyq',   subject:'OS',        author:'Student Council', upvotes:289, downloads:1200, verified:true,  gold:true  },
  { id:3, rank:3, title:'CN Complete Notes',           type:'notes', subject:'CN',        author:'Dr. Mehta',       upvotes:256, downloads:1100, verified:true,  gold:false },
  { id:4, rank:4, title:'DSA Lab Manual 2024',         type:'lab',   subject:'DSA',       author:'CS Dept',         upvotes:234, downloads:987,  verified:true,  gold:false },
  { id:5, rank:5, title:'TOC Short Notes',             type:'notes', subject:'TOC',       author:'Rahul S.',        upvotes:198, downloads:876,  verified:false, gold:false },
  { id:6, rank:6, title:'SE Viva Q&A Pack',            type:'notes', subject:'SE',        author:'Emma D.',         upvotes:176, downloads:765,  verified:true,  gold:false },
];

const typeIcon = (t) => ({
  notes: <BookOpen size={14} className="text-blue-500"   />,
  pyq:   <FileText size={14} className="text-amber-500"  />,
  lab:   <Beaker   size={14} className="text-purple-500" />,
}[t] ?? <BookOpen size={14} className="text-blue-500" />);

const typeBg = (t) => ({
  notes: 'bg-blue-50   text-blue-600   border-blue-200',
  pyq:   'bg-amber-50  text-amber-600  border-amber-200',
  lab:   'bg-purple-50 text-purple-600 border-purple-200',
}[t] ?? 'bg-blue-50 text-blue-600 border-blue-200');

const rankStyle = (r) => r === 1
  ? { bg: 'bg-gradient-to-br from-yellow-400 to-yellow-500', text: 'text-white', icon: <Crown size={14}/> }
  : r === 2
  ? { bg: 'bg-gradient-to-br from-slate-400 to-slate-500',   text: 'text-white', icon: r }
  : r === 3
  ? { bg: 'bg-gradient-to-br from-amber-500 to-amber-600',   text: 'text-white', icon: r }
  : { bg: 'bg-blue-50', text: 'text-blue-600', icon: r };

const NoteCard = memo(({ note }) => {
  const [liked, setLiked] = useState(false);
  const rs = rankStyle(note.rank);
  return (
    <motion.div variants={fadeUp}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(59,130,246,0.12)', transition: { type:'spring', stiffness:300, damping:20 } }}
      className="bg-white rounded-2xl border border-blue-100 p-5 relative overflow-hidden group cursor-pointer">
      {note.gold && <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-500" />}

      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-full ${rs.bg} ${rs.text} flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0`}>
          {rs.icon}
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {note.verified && <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">✓ Verified</span>}
          {note.gold     && <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">🏅 Gold</span>}
        </div>
      </div>

      <h4 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-blue-600 transition-colors mb-1">{note.title}</h4>
      <p className="text-xs text-gray-400 mb-3">by {note.author} · {note.subject}</p>

      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold mb-4 ${typeBg(note.type)}`}>
        {typeIcon(note.type)}{note.type.toUpperCase()}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setLiked(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all ${
            liked ? 'bg-blue-50 text-blue-600 border-blue-300' : 'border-gray-200 hover:border-blue-200 hover:text-blue-500'
          }`}>
          <ThumbsUp size={12}/> {note.upvotes + (liked ? 1 : 0)}
        </motion.button>
        <span className="flex items-center gap-1"><Download size={11}/> {note.downloads.toLocaleString()}</span>
      </div>

      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        className="w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
        View Resource →
      </motion.button>
    </motion.div>
  );
});

const BestNotes = () => {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? NOTES : NOTES.filter(n => n.type === filter);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1"><Star size={20} className="text-white"/><h2 className="text-2xl font-bold">Best Notes</h2></div>
            <p className="text-amber-100 text-sm">Community's top-rated study materials this week</p>
          </div>
          <div className="text-5xl select-none">🏆</div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex gap-2 flex-wrap">
        {[['all','All'],['notes','Notes'],['pyq','PYQs'],['lab','Lab']].map(([val,label])=>(
          <button key={val} onClick={()=>setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter===val?'bg-amber-500 text-white shadow-md':'bg-white text-gray-500 border border-blue-100 hover:border-amber-300'}`}>
            {label}
          </button>
        ))}
      </motion.div>

      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(n => <NoteCard key={n.id} note={n} />)}
      </motion.div>
    </motion.div>
  );
};

export default BestNotes;