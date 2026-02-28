// src/components/student/Saved.jsx
import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookOpen, FileText, Beaker, Trash2, Download, ThumbsUp } from 'lucide-react';

const stagger = { show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const INIT_SAVED = [
  { id:1, title:'Algorithm Design Notes',   type:'notes', subject:'DSA',  author:'Alex K.',    upvotes:98,  downloads:543, verified:false },
  { id:2, title:'CN Important Questions',   type:'pyq',   subject:'CN',   author:'Sarah W.',   upvotes:76,  downloads:432, verified:false },
  { id:3, title:'Complete DBMS Guide',      type:'notes', subject:'DBMS', author:'Prof. Sharma',upvotes:312,downloads:1245,verified:true  },
  { id:4, title:'OS Previous Year 2024',    type:'pyq',   subject:'OS',   author:'Student Council',upvotes:189,downloads:987,verified:true },
  { id:5, title:'Python Lab Manual 2024',   type:'lab',   subject:'Python',author:'CS Dept',   upvotes:121, downloads:598, verified:true  },
];

const typeConfig = {
  notes: { icon: <BookOpen size={16} className="text-blue-500"   />, bg:'bg-blue-50   text-blue-600   border-blue-200',   color:'from-blue-500 to-blue-600'    },
  pyq:   { icon: <FileText size={16} className="text-amber-500"  />, bg:'bg-amber-50  text-amber-600  border-amber-200',  color:'from-amber-500 to-orange-500'  },
  lab:   { icon: <Beaker   size={16} className="text-purple-500" />, bg:'bg-purple-50 text-purple-600 border-purple-200', color:'from-purple-500 to-violet-500' },
};

const SavedCard = memo(({ item, onRemove }) => {
  const cfg = typeConfig[item.type] ?? typeConfig.notes;
  const [liked, setLiked] = useState(false);

  return (
    <motion.div variants={fadeUp} layout
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(59,130,246,0.1)', transition: { type:'spring', stiffness:300, damping:20 } }}
      className="bg-white rounded-2xl border border-blue-100 overflow-hidden group">
      <div className={`h-1 bg-gradient-to-r ${cfg.color}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-blue-600 transition-colors truncate">{item.title}</h4>
            <p className="text-xs text-gray-400 mt-0.5">by {item.author} · {item.subject}</p>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} onClick={() => onRemove(item.id)}
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all">
            <Trash2 size={14}/>
          </motion.button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold ${cfg.bg}`}>
            {cfg.icon}{item.type.toUpperCase()}
          </div>
          {item.verified && <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">✓ Verified</span>}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setLiked(v=>!v)}
              className={`flex items-center gap-1 transition-colors ${liked?'text-blue-600':'hover:text-blue-500'}`}>
              <ThumbsUp size={11}/> {item.upvotes + (liked ? 1 : 0)}
            </motion.button>
            <span className="flex items-center gap-1"><Download size={11}/>{item.downloads.toLocaleString()}</span>
          </div>
          <motion.button whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            <Download size={11}/> Get
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

const Saved = () => {
  const [items, setItems] = useState(INIT_SAVED);
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1"><Bookmark size={20}/><h2 className="text-2xl font-bold">Saved Notes</h2></div>
            <p className="text-amber-100 text-sm">{items.length} items saved to your library</p>
          </div>
          <div className="text-5xl select-none">🔖</div>
        </div>
      </motion.div>

      {items.length > 0 ? (
        <motion.div layout variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(item => <SavedCard key={item.id} item={item} onRemove={remove} />)}
        </motion.div>
      ) : (
        <div className="text-center py-20">
          <Bookmark size={52} className="mx-auto mb-4 text-gray-200" />
          <h3 className="text-gray-500 font-semibold text-lg mb-2">No saved items</h3>
          <p className="text-gray-400 text-sm">Bookmark notes and PYQs to find them here</p>
        </div>
      )}
    </motion.div>
  );
};

export default Saved;