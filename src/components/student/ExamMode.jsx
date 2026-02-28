// src/components/student/ExamMode.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const AI_QUESTIONS = [
  { q:'Explain the difference between process and thread with scheduling algorithms.', topic:'OS',   prob:'Very High', score:96, color:'#ef4444' },
  { q:'What is normalization? Explain 1NF, 2NF, 3NF with examples.',                  topic:'DBMS', prob:'Very High', score:94, color:'#ef4444' },
  { q:'Derive the expression for TCP congestion control.',                              topic:'CN',   prob:'High',      score:87, color:'#f59e0b' },
  { q:'Compare OSI vs TCP/IP model in detail.',                                         topic:'CN',   prob:'High',      score:82, color:'#f59e0b' },
  { q:'Explain deadlock detection, prevention and avoidance.',                          topic:'OS',   prob:'Medium',    score:74, color:'#22c55e' },
  { q:'Describe B+ tree with insertion and deletion.',                                  topic:'DBMS', prob:'Medium',    score:71, color:'#22c55e' },
];

const SUBJECTS = ['All', 'OS', 'DBMS', 'CN', 'DSA', 'TOC'];

const ExamMode = () => {
  const [active,    setActive]   = useState(false);
  const [subject,   setSubject]  = useState('All');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress,  setProgress]  = useState(0);

  const startAnalysis = () => {
    setAnalyzing(true);
    setProgress(0);
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(t); setAnalyzing(false); setActive(true); return 100; }
        return p + 1.5;
      });
    }, 40);
  };

  const filtered = AI_QUESTIONS.filter(q => subject === 'All' || q.topic === subject);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp}
        className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1"><Zap size={20} className="text-yellow-300"/><h2 className="text-2xl font-bold">Exam Mode</h2></div>
            <p className="text-rose-100 text-sm">AI-powered strategic exam preparation</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={startAnalysis}
            disabled={analyzing}
            className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm shadow-xl transition-all ${
              active ? 'bg-white text-red-600 hover:bg-red-50' : 'bg-white text-red-600 hover:bg-red-50'
            }`}>
            <Brain size={16}/>{analyzing ? 'Analyzing…' : active ? '🔄 Re-run AI' : '🚀 Run AI Analysis'}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats when active */}
      {active && (
        <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon:'🔴', label:'Very High Prob.', value:'2',  bg:'bg-red-50    border-red-200    text-red-600'    },
            { icon:'🟡', label:'High Prob.',       value:'2',  bg:'bg-amber-50  border-amber-200  text-amber-600'  },
            { icon:'🟢', label:'Medium Prob.',     value:'2',  bg:'bg-green-50  border-green-200  text-green-600'  },
            { icon:'📊', label:'Avg Confidence',  value:'84%',bg:'bg-blue-50   border-blue-200   text-blue-600'   },
          ].map((s,i)=>(
            <motion.div key={i} variants={fadeUp}
              className={`rounded-2xl border p-4 text-center ${s.bg}`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs font-medium mt-0.5 opacity-80">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Analysis progress bar */}
      {analyzing && (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                {progress < 30 ? '📥 Extracting questions from PDFs…'
                  : progress < 60 ? '🧹 Cleaning and tokenizing data…'
                  : progress < 85 ? '🤖 Detecting patterns across years…'
                  : '📊 Generating confidence scores…'}
              </p>
              <p className="text-xs text-gray-400">AI is working…</p>
            </div>
          </div>
          <div className="h-3 bg-blue-50 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
          </div>
          <p className="text-right text-xs text-blue-500 font-bold mt-1">{Math.floor(progress)}%</p>
        </motion.div>
      )}

      {/* Questions */}
      {active && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><Target size={18} className="text-blue-600"/> Predicted Questions</h3>
            <div className="flex gap-2 flex-wrap">
              {SUBJECTS.map(s=>(
                <button key={s} onClick={()=>setSubject(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${subject===s?'bg-blue-600 text-white':'bg-white text-gray-500 border border-blue-100 hover:border-blue-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {filtered.map((q, i) => (
            <motion.div key={i} variants={fadeUp}
              whileHover={{ y: -3, transition: { type:'spring', stiffness:300, damping:20 } }}
              className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm"
              style={{ borderLeft: `3px solid ${q.color}` }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-sm text-gray-700 font-medium leading-snug flex-1">{q.q}</p>
                <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: q.color + '18', color: q.color }}>
                  {q.prob}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{q.topic}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${q.score}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg,${q.color},${q.color}99)` }} />
                </div>
                <span className="text-xs font-bold w-8 text-right" style={{ color: q.color }}>{q.score}%</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!active && !analyzing && (
        <motion.div variants={fadeUp} className="text-center py-16">
          <Brain size={56} className="mx-auto mb-4 text-blue-200" />
          <h3 className="text-gray-600 font-semibold text-lg mb-2">Ready to analyse?</h3>
          <p className="text-gray-400 text-sm mb-6">Run the AI engine to get ranked exam predictions from 5 years of PYQs</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={startAnalysis}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-blue-300 transition-all">
            🚀 Start AI Analysis
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ExamMode;