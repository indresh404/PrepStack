// src/components/student/LabManual.jsx
import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Beaker, Download, ThumbsUp, Search, BookOpen, CheckCircle } from 'lucide-react';

const stagger = { show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const LABS = [
  { id:1, title:'DBMS Lab Manual 2024',     subject:'DBMS',    experiments:12, upvotes:234, downloads:987,  verified:true,  color:'from-purple-500 to-purple-600' },
  { id:2, title:'OS Lab Manual 2024',       subject:'OS',      experiments:10, upvotes:198, downloads:876,  verified:true,  color:'from-blue-500 to-blue-600'     },
  { id:3, title:'CN Lab Manual 2024',       subject:'CN',      experiments:8,  upvotes:176, downloads:765,  verified:false, color:'from-indigo-500 to-indigo-600'  },
  { id:4, title:'DSA Lab Manual 2024',      subject:'DSA',     experiments:14, upvotes:154, downloads:698,  verified:true,  color:'from-violet-500 to-violet-600'  },
  { id:5, title:'Web Tech Lab Manual',      subject:'WT',      experiments:10, upvotes:134, downloads:654,  verified:false, color:'from-cyan-500 to-cyan-600'      },
  { id:6, title:'Python Lab Manual 2024',   subject:'Python',  experiments:12, upvotes:121, downloads:598,  verified:true,  color:'from-teal-500 to-teal-600'      },
];

const LabCard = memo(({ lab }) => {
  const [liked, setLiked] = useState(false);
  return (
    <motion.div variants={fadeUp}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(139,92,246,0.15)', transition: { type:'spring', stiffness:300, damping:20 } }}
      className="bg-white rounded-2xl border border-purple-100 overflow-hidden group cursor-pointer">
      <div className={`h-1.5 bg-gradient-to-r ${lab.color}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${lab.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
            <Beaker size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 text-sm group-hover:text-purple-600 transition-colors truncate">{lab.title}</h4>
            <p className="text-xs text-gray-400 mt-0.5">{lab.subject}</p>
          </div>
          {lab.verified && <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1.5 bg-purple-50 text-purple-600 border border-purple-200 px-2.5 py-1 rounded-lg font-semibold">
            <BookOpen size={11}/> {lab.experiments} experiments
          </span>
        </div>

        <div className="flex items-center justify-between">
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setLiked(v=>!v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${liked?'bg-purple-50 text-purple-600 border-purple-300':'border-gray-200 text-gray-400 hover:border-purple-200'}`}>
            <ThumbsUp size={11}/> {lab.upvotes + (liked ? 1 : 0)}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }}
            className={`flex items-center gap-1.5 text-xs bg-gradient-to-r ${lab.color} text-white px-3 py-1.5 rounded-lg font-semibold shadow-sm`}>
            <Download size={12}/> Download
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

const LabManual = () => {
  const [search, setSearch] = useState('');
  const filtered = LABS.filter(l => l.title.toLowerCase().includes(search.toLowerCase()) || l.subject.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Lab Manuals</h2>
            <p className="text-purple-100 text-sm">{LABS.length} manuals · {LABS.reduce((a,l)=>a+l.experiments,0)} total experiments</p>
          </div>
          <div className="text-5xl select-none">🔬</div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search lab manuals…"
          className="w-full bg-white border border-purple-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-all shadow-sm" />
      </motion.div>

      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(l=><LabCard key={l.id} lab={l}/>)}
      </motion.div>
    </motion.div>
  );
};

export default LabManual;