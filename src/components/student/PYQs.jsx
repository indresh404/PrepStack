// src/components/student/PYQs.jsx
import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ThumbsUp, Search, Calendar, ChevronDown } from 'lucide-react';

const stagger = { show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const PYQS = [
  { id:1, title:'DBMS End-Sem 2024',    subject:'DBMS', year:2024, sem:'End-Sem', upvotes:312, downloads:1450, verified:true  },
  { id:2, title:'OS Mid-Sem 2024',      subject:'OS',   year:2024, sem:'Mid-Sem', upvotes:276, downloads:1200, verified:true  },
  { id:3, title:'CN End-Sem 2023',      subject:'CN',   year:2023, sem:'End-Sem', upvotes:254, downloads:1100, verified:true  },
  { id:4, title:'DSA Mid-Sem 2023',     subject:'DSA',  year:2023, sem:'Mid-Sem', upvotes:198, downloads:987,  verified:false },
  { id:5, title:'TOC End-Sem 2023',     subject:'TOC',  year:2023, sem:'End-Sem', upvotes:176, downloads:876,  verified:true  },
  { id:6, title:'SE Mid-Sem 2022',      subject:'SE',   year:2022, sem:'Mid-Sem', upvotes:154, downloads:765,  verified:false },
  { id:7, title:'DBMS End-Sem 2022',    subject:'DBMS', year:2022, sem:'End-Sem', upvotes:145, downloads:698,  verified:true  },
  { id:8, title:'OS End-Sem 2022',      subject:'OS',   year:2022, sem:'End-Sem', upvotes:134, downloads:654,  verified:false },
];

const SUBJECTS = ['All', 'DBMS', 'OS', 'CN', 'DSA', 'TOC', 'SE'];

const PYQCard = memo(({ pyq }) => {
  const [liked, setLiked] = useState(false);
  return (
    <motion.div variants={fadeUp}
      whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(59,130,246,0.12)', transition: { type:'spring', stiffness:300, damping:20 } }}
      className="bg-white rounded-2xl border border-blue-100 p-5 group cursor-pointer">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
          <FileText size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-blue-600 transition-colors">{pyq.title}</h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={10}/>{pyq.year}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${pyq.sem==='End-Sem'?'bg-red-50 text-red-600 border border-red-200':'bg-blue-50 text-blue-600 border border-blue-200'}`}>
              {pyq.sem}
            </span>
            {pyq.verified && <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">✓ Verified</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} onClick={()=>setLiked(v=>!v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${liked?'bg-blue-50 text-blue-600 border-blue-300':'border-gray-200 text-gray-400 hover:border-blue-200'}`}>
            <ThumbsUp size={11}/> {pyq.upvotes+(liked?1:0)}
          </motion.button>
          <span className="flex items-center gap-1 text-xs text-gray-400 px-2"><Download size={11}/> {pyq.downloads.toLocaleString()}</span>
        </div>
        <motion.button whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-600 transition-colors">
          <Download size={12}/> Download
        </motion.button>
      </div>
    </motion.div>
  );
});

const PYQs = () => {
  const [subject, setSubject] = useState('All');
  const [search,  setSearch]  = useState('');
  const filtered = PYQS.filter(p =>
    (subject === 'All' || p.subject === subject) &&
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Previous Year Questions</h2>
            <p className="text-amber-100 text-sm">{PYQS.length} papers across all subjects</p>
          </div>
          <div className="text-5xl select-none">📝</div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search PYQs…"
            className="w-full bg-white border border-blue-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-all shadow-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {SUBJECTS.map(s=>(
            <button key={s} onClick={()=>setSubject(s)}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${subject===s?'bg-amber-500 text-white shadow-md':'bg-white text-gray-500 border border-blue-100 hover:border-amber-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(p=><PYQCard key={p.id} pyq={p}/>)}
      </motion.div>
    </motion.div>
  );
};

export default PYQs;