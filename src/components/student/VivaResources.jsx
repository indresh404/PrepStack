// src/components/student/VivaResources.jsx
import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown, ChevronUp, ThumbsUp, Search, Mic } from 'lucide-react';

const stagger = { show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const VIVA_DATA = [
  {
    id: 1, subject: 'DBMS', color: 'from-blue-500 to-blue-600',
    questions: [
      { q: 'What is normalization? Explain 1NF, 2NF, 3NF.', difficulty: 'High',   freq: 94 },
      { q: 'Difference between DDL and DML commands.',       difficulty: 'Medium', freq: 82 },
      { q: 'What is a foreign key? Explain with example.',   difficulty: 'Medium', freq: 78 },
    ],
  },
  {
    id: 2, subject: 'OS', color: 'from-purple-500 to-purple-600',
    questions: [
      { q: 'Difference between process and thread.',          difficulty: 'High',   freq: 96 },
      { q: 'Explain deadlock — conditions and prevention.',   difficulty: 'High',   freq: 91 },
      { q: 'What is paging? How does it differ from segmentation?', difficulty: 'Medium', freq: 85 },
    ],
  },
  {
    id: 3, subject: 'CN', color: 'from-teal-500 to-teal-600',
    questions: [
      { q: 'Compare OSI and TCP/IP model.',                   difficulty: 'High',   freq: 93 },
      { q: 'What is ARP and how does it work?',               difficulty: 'Medium', freq: 80 },
      { q: 'Explain TCP 3-way handshake.',                    difficulty: 'High',   freq: 88 },
    ],
  },
];

const diffColor = { High: 'bg-red-50 text-red-600 border-red-200', Medium: 'bg-amber-50 text-amber-600 border-amber-200', Low: 'bg-green-50 text-green-600 border-green-200' };

const SubjectCard = memo(({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-blue-100 overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${item.color}`} />
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-blue-50/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
            <Mic size={17} className="text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gray-800">{item.subject}</h4>
            <p className="text-xs text-gray-400">{item.questions.length} questions</p>
          </div>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-3">
              {item.questions.map((q, i) => (
                <div key={i} className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm text-gray-700 font-medium leading-snug">{q.q}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${diffColor[q.difficulty]}`}>{q.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${q.freq}%` }} transition={{ delay: 0.1, duration: 0.7 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
                    </div>
                    <span className="text-xs text-blue-600 font-bold w-8 text-right">{q.freq}%</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Frequency in exams</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const VivaResources = () => {
  const [search, setSearch] = useState('');
  const filtered = VIVA_DATA.filter(v => v.subject.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Viva Resources</h2>
            <p className="text-teal-100 text-sm">Frequently asked viva questions with frequency scores</p>
          </div>
          <div className="text-5xl select-none">🎙️</div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by subject…"
          className="w-full bg-white border border-blue-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-all shadow-sm" />
      </motion.div>

      <motion.div variants={stagger} className="space-y-4 max-w-3xl">
        {filtered.map(item => <SubjectCard key={item.id} item={item} />)}
      </motion.div>
    </motion.div>
  );
};

export default VivaResources;