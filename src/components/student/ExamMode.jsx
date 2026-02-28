// src/components/student/ExamMode.jsx
// ✅ No backend needed — calls Groq API directly from the browser
// 1. Run: npm install groq-sdk recharts
// 2. Add to your .env file:  VITE_GROQ_API_KEY=your_groq_key_here
// 3. Put AOA.txt / DBMS.txt / JAVA.txt inside /public folder

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LottieComponent from "lottie-react";
const Lottie = LottieComponent.default ?? LottieComponent;
import {
  Brain, Zap, Target, BookOpen,
  Star, FileText, AlertTriangle, Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import aiAnimation from '../../assets/ai.json';

const stagger = { show: { transition: { staggerChildren: 0.05 } } };
const fadeUp  = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const SUBJECTS = [
  { id: 'AOA',  label: 'AOA',  full: 'Analysis of Algorithms', color: '#3b82f6', bg: '#eff6ff', file: '/AOA.txt'  },
  { id: 'DBMS', label: 'DBMS', full: 'Database Management',    color: '#10b981', bg: '#f0fdf9', file: '/DBMS.txt' },
  { id: 'JAVA', label: 'JAVA', full: 'Java Programming',       color: '#f97316', bg: '#fff7ed', file: '/JAVA.txt' },
];

const TOP_NOTES = {
  AOA: [
    { student: 'Aryan Shah',   topic: 'Dynamic Programming — Complete Notes', stars: 48, pages: 12, tag: '🔥 Trending'  },
    { student: 'Priya Mehta',  topic: 'Graph Algorithms Cheat Sheet',          stars: 41, pages: 6,  tag: '⭐ Top Rated' },
    { student: 'Rohan Patel',  topic: 'Master Theorem Quick Reference',        stars: 35, pages: 4,  tag: '📌 Pinned'    },
  ],
  DBMS: [
    { student: 'Sneha Iyer',  topic: 'Normalization 1NF–BCNF with Examples', stars: 52, pages: 14, tag: '🔥 Trending'  },
    { student: 'Mihir Joshi', topic: 'SQL Queries Practice Sheet',            stars: 44, pages: 8,  tag: '⭐ Top Rated' },
    { student: 'Kavya Nair',  topic: 'ACID & Transaction Management Notes',  stars: 37, pages: 7,  tag: '📌 Pinned'    },
  ],
  JAVA: [
    { student: 'Dev Sharma',   topic: 'OOP Concepts with Code Examples',     stars: 49, pages: 16, tag: '🔥 Trending'  },
    { student: 'Ananya Singh', topic: 'Java 8 Features — Streams & Lambdas', stars: 43, pages: 10, tag: '⭐ Top Rated' },
    { student: 'Vikram Rao',   topic: 'Multithreading & Sync Guide',          stars: 38, pages: 9,  tag: '📌 Pinned'    },
  ],
};

const probConfig = {
  'very high': { color: '#ef4444', bg: '#fef2f2', label: 'Very High' },
  'high':      { color: '#f97316', bg: '#fff7ed', label: 'High'      },
  'medium':    { color: '#10b981', bg: '#f0fdf4', label: 'Medium'    },
};

const TOPIC_IMPORTANCE = {
  AOA: [
    { topic: 'Dynamic Programming', weight: 92, questions: 3 },
    { topic: 'Graph Algorithms',    weight: 88, questions: 2 },
    { topic: 'Sorting & Searching', weight: 75, questions: 2 },
    { topic: 'Greedy Algorithms',   weight: 68, questions: 1 },
    { topic: 'Divide & Conquer',    weight: 65, questions: 1 },
  ],
  DBMS: [
    { topic: 'SQL Queries',         weight: 94, questions: 4 },
    { topic: 'Normalization',       weight: 89, questions: 2 },
    { topic: 'Transactions & ACID', weight: 82, questions: 2 },
    { topic: 'Indexing',            weight: 71, questions: 1 },
    { topic: 'ER Diagrams',         weight: 67, questions: 1 },
  ],
  JAVA: [
    { topic: 'OOP Concepts',          weight: 91, questions: 3 },
    { topic: 'Collections Framework', weight: 87, questions: 2 },
    { topic: 'Multithreading',        weight: 84, questions: 2 },
    { topic: 'Exception Handling',    weight: 76, questions: 2 },
    { topic: 'Java 8 Features',       weight: 72, questions: 1 },
  ],
};

const COLORS = ['#ef4444', '#f97316', '#10b981', '#3b82f6', '#8b5cf6'];

function parseAnalysis(raw, subjectId) {
  const questions = [];
  let score = 95;

  const lines = raw
    .split('\n')
    .map(l => l.replace(/^[\s\d.\-*•#]+/, '').trim())
    .filter(l => l.length > 30 && /\?|explain|describe|what|define|compare|derive/i.test(l));

  for (const line of lines) {
    const prob = score > 88 ? 'very high' : score > 76 ? 'high' : 'medium';
    questions.push({ q: line.substring(0, 200), topic: subjectId, prob, score });
    score = Math.max(52, score - Math.floor(Math.random() * 6 + 2));
    if (questions.length >= 8) break;
  }

  if (questions.length < 3) {
    raw.split(/\n\n+/).filter(p => p.trim().length > 40).slice(0, 7).forEach((p, i) => {
      const s = 90 - i * 6;
      questions.push({
        q:     p.replace(/^[\s\d.\-*•#]+/, '').substring(0, 200).trim(),
        topic: subjectId,
        prob:  s > 88 ? 'very high' : s > 76 ? 'high' : 'medium',
        score: s,
      });
    });
  }

  return questions;
}

const ExamMode = () => {
  const [selectedSubject,     setSelectedSubject]     = useState(null);
  const [analyzing,           setAnalyzing]           = useState(false);
  const [progress,            setProgress]            = useState(0);
  const [progressLabel,       setProgressLabel]       = useState('');
  const [questions,           setQuestions]           = useState([]);
  const [rawAnalysis,         setRawAnalysis]         = useState('');
  const [error,               setError]               = useState('');
  const [activeTab,           setActiveTab]           = useState('questions');
  const [showTopicImportance, setShowTopicImportance] = useState(true);
  const lottieRef = useRef();

  useEffect(() => {
    setQuestions([]);
    setRawAnalysis('');
    setError('');
    setActiveTab('questions');
  }, [selectedSubject]);

  const topicData = selectedSubject ? (TOPIC_IMPORTANCE[selectedSubject] || []) : [];

  const runAnalysis = async () => {
    if (!selectedSubject) return;

    setAnalyzing(true);
    setProgress(0);
    setError('');
    setQuestions([]);

    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      setError('Groq API key not found. Add VITE_GROQ_API_KEY to your .env file and restart the dev server.');
      setAnalyzing(false);
      return;
    }

    const steps = [
      [20, '📥 Loading exam papers…'],
      [45, '🧹 Analyzing question patterns…'],
      [70, '📊 Calculating topic weights…'],
      [90, '✨ Generating predictions…'],
    ];
    let si = 0;
    const ticker = setInterval(() => {
      if (si < steps.length) { setProgress(steps[si][0]); setProgressLabel(steps[si][1]); si++; }
    }, 600);

    try {
      const meta = SUBJECTS.find(s => s.id === selectedSubject);
      const txtRes = await fetch(meta.file);
      if (!txtRes.ok) throw new Error(`Could not load ${meta.file}`);
      const txtContent = await txtRes.text();
      const content = txtContent.length > 12000 ? txtContent.substring(0, 12000) + '\n[truncated]' : txtContent;

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 2000,
          messages: [
            { role: 'system', content: 'You are an expert exam analyst. Analyse past exam papers and predict the most likely questions.' },
            { role: 'user',   content: `Past papers for ${meta.full}:\n\n${content}\n\nPredict top 8 likely questions with probability.` },
          ],
        }),
      });

      const data = await groqRes.json();
      if (!groqRes.ok) throw new Error(data.error?.message || 'Groq API error');

      clearInterval(ticker);
      setProgress(100);
      setProgressLabel('✅ Analysis complete');
      const analysisText = data.choices[0].message.content;
      setRawAnalysis(analysisText);
      setQuestions(parseAnalysis(analysisText, selectedSubject));
    } catch (err) {
      clearInterval(ticker);
      setError(err.message);
    } finally {
      setTimeout(() => setAnalyzing(false), 300);
    }
  };

  const subject = SUBJECTS.find(s => s.id === selectedSubject);
  const shouldShowAnimation = !questions.length || analyzing;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5 pb-8 max-w mx-auto">

      {/* header */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={20} className="text-blue-200" />
          <h2 className="text-xl font-semibold">Exam Mode</h2>
        </div>
        <p className="text-blue-100 text-sm">AI-powered question prediction from past papers</p>
      </motion.div>

      {/* subject picker */}
      <motion.div variants={fadeUp}>
        <p className="text-xs font-medium text-gray-500 mb-2">Select Subject</p>
        <div className="grid grid-cols-3 gap-2">
          {SUBJECTS.map(s => (
            <button key={s.id} onClick={() => setSelectedSubject(s.id)}
              className={`rounded-lg border p-3 text-left transition-all ${
                selectedSubject === s.id ? 'ring-2 ring-offset-1' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              style={selectedSubject === s.id ? { background: s.bg } : {}}>
              <div className="text-base font-bold" style={{ color: s.color }}>{s.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.full}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* run / re-run buttons */}
      <AnimatePresence mode="wait">
        {selectedSubject && !analyzing && !questions.length && (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center">
            <button onClick={runAnalysis}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm">
              <Brain size={16} /> Start Analysis
            </button>
          </motion.div>
        )}
        {selectedSubject && !analyzing && questions.length > 0 && (
          <motion.div key="again" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center">
            <button onClick={runAnalysis}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm">
              <Zap size={16} /> Analyze Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lottie animation */}
      <AnimatePresence>
        {shouldShowAnimation && (
          <motion.div key="lottie"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-8">
            <div className="w-64 h-64">
              <Lottie lottieRef={lottieRef} animationData={aiAnimation} loop autoplay style={{ width: '100%', height: '100%' }} />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {analyzing ? progressLabel : selectedSubject ? 'Ready to analyze' : 'Select a subject to begin'}
            </p>
            {analyzing && (
              <div className="w-48 mt-4">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} className="h-full bg-blue-600 rounded-full" />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* error */}
      <AnimatePresence>
        {error && (
          <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-500 mt-0.5" />
            <p className="text-xs text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RESULTS — plain divs so nothing can hide content via broken variant propagation ── */}
      {questions.length > 0 && subject && !analyzing && (
        <div className="space-y-5">

          {/* Topic Importance Chart */}
          {showTopicImportance && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-800">Topic Importance Analysis</h3>
                </div>
                <button onClick={() => setShowTopicImportance(false)} className="text-xs text-gray-400 hover:text-gray-600">Hide</button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="topic" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip contentStyle={{ fontSize: '11px', padding: '4px 8px' }} formatter={v => [`${v}% probability`, 'Importance']} />
                    <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                      {topicData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} fillOpacity={0.9} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-gray-100">
                {topicData.map((topic, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-xs font-medium text-gray-500 truncate">{topic.topic.split(' ')[0]}</div>
                    <div className="text-sm font-bold" style={{ color: COLORS[idx % COLORS.length] }}>{topic.weight}%</div>
                    <div className="text-xs text-gray-400">{topic.questions} Qs</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-bold text-gray-800">{questions.length}</div>
            </div>
            {[
              { label: 'Very High', value: questions.filter(q => q.prob === 'very high').length, color: '#ef4444' },
              { label: 'High',      value: questions.filter(q => q.prob === 'high').length,      color: '#f97316' },
              { label: 'Medium',    value: questions.filter(q => q.prob === 'medium').length,    color: '#10b981' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* tab buttons */}
          <div className="flex gap-1 border-b border-gray-200">
            {[
              { id: 'questions', icon: Target,   label: 'Questions'     },
              { id: 'notes',     icon: BookOpen, label: 'Notes'         },
              { id: 'analysis',  icon: FileText, label: 'Full Analysis' },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === t.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}>
                <t.icon size={14} />{t.label}
              </button>
            ))}
          </div>

          {/* questions tab */}
          {activeTab === 'questions' && (
            <div className="space-y-2">
              {questions.map((q, i) => {
                const pc = probConfig[q.prob];
                return (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-medium text-white mt-0.5"
                        style={{ background: pc.color }}>{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 leading-snug">{q.q}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: pc.bg, color: pc.color }}>
                            {pc.label}
                          </span>
                          <span className="text-xs text-gray-400">{q.score}% probability</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* notes tab */}
          {activeTab === 'notes' && (
            <div className="space-y-2">
              {(TOP_NOTES[selectedSubject] || []).map((note, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                      style={{ background: subject.color }}>
                      {note.student.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{note.topic}</p>
                      <p className="text-xs text-gray-400 mt-0.5">by {note.student} · {note.pages} pages</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          <Star size={11} fill="#f59e0b" /> {note.stars} stars
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600">{note.tag}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* full analysis tab */}
          {activeTab === 'analysis' && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {rawAnalysis}
              </pre>
            </div>
          )}

        </div>
      )}

    </motion.div>
  );
};

export default ExamMode;