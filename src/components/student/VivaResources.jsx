// src/components/student/VivaResources.jsx
import React, { useState, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, ChevronDown, ChevronUp, ThumbsUp, Search, Mic, 
  BookOpen, Clock, TrendingUp, Star, Filter, X, Brain,
  Code, Database, Network, Cpu, Globe, Coffee
} from 'lucide-react';

const stagger = { 
  show: { 
    transition: { 
      staggerChildren: 0.05 
    } 
  } 
};

const fadeUp = { 
  hidden: { opacity: 0, y: 20 }, 
  show: { opacity: 1, y: 0 } 
};

const VIVA_DATA = [
  // JAVA Questions
  {
    id: 1, subject: 'JAVA', icon: Coffee,
    color: 'from-orange-500 to-red-500',
    stats: { totalQuestions: 6, avgFrequency: 89, mostAsked: 'OOP Concepts' },
    questions: [
      { q: 'Explain OOP concepts with real-world examples.', difficulty: 'High', freq: 96, likes: 234, timeToRead: '3 min' },
      { q: 'Difference between abstract class and interface.', difficulty: 'High', freq: 94, likes: 189, timeToRead: '2 min' },
      { q: 'How does garbage collection work in Java?', difficulty: 'Medium', freq: 82, likes: 156, timeToRead: '4 min' },
      { q: 'Explain multithreading and its lifecycle.', difficulty: 'High', freq: 91, likes: 178, timeToRead: '3 min' },
      { q: 'What is the difference between HashMap and HashTable?', difficulty: 'Medium', freq: 79, likes: 145, timeToRead: '2 min' },
      { q: 'Explain exception handling hierarchy.', difficulty: 'Medium', freq: 84, likes: 123, timeToRead: '3 min' },
    ],
  },
  
  // DSA Questions
  {
    id: 2, subject: 'DSA', icon: Code,
    color: 'from-blue-600 to-indigo-600',
    stats: { totalQuestions: 6, avgFrequency: 87, mostAsked: 'Arrays & Linked Lists' },
    questions: [
      { q: 'Explain time and space complexity with examples.', difficulty: 'High', freq: 98, likes: 312, timeToRead: '4 min' },
      { q: 'Difference between array and linked list.', difficulty: 'Medium', freq: 92, likes: 245, timeToRead: '2 min' },
      { q: 'How does quicksort algorithm work?', difficulty: 'High', freq: 88, likes: 167, timeToRead: '3 min' },
      { q: 'Explain binary search tree properties.', difficulty: 'Medium', freq: 85, likes: 134, timeToRead: '2 min' },
      { q: 'What is dynamic programming? Give examples.', difficulty: 'High', freq: 94, likes: 278, timeToRead: '5 min' },
      { q: 'Stack vs Queue: Real-world applications.', difficulty: 'Low', freq: 76, likes: 98, timeToRead: '2 min' },
    ],
  },
  
  // DBMS Questions
  {
    id: 3, subject: 'DBMS', icon: Database,
    color: 'from-purple-500 to-purple-600',
    stats: { totalQuestions: 6, avgFrequency: 86, mostAsked: 'Normalization' },
    questions: [
      { q: 'What is normalization? Explain 1NF, 2NF, 3NF with examples.', difficulty: 'High', freq: 94, likes: 267, timeToRead: '4 min' },
      { q: 'Difference between DDL, DML, DCL, and TCL commands.', difficulty: 'Medium', freq: 82, likes: 156, timeToRead: '3 min' },
      { q: 'What is a foreign key? Explain with example.', difficulty: 'Medium', freq: 78, likes: 134, timeToRead: '2 min' },
      { q: 'Explain ACID properties in DBMS.', difficulty: 'High', freq: 96, likes: 289, timeToRead: '3 min' },
      { q: 'Difference between SQL and NoSQL databases.', difficulty: 'Medium', freq: 81, likes: 167, timeToRead: '3 min' },
      { q: 'What are indexes? How do they improve performance?', difficulty: 'Medium', freq: 73, likes: 112, timeToRead: '2 min' },
    ],
  },
  
  // OS Questions
  {
    id: 4, subject: 'OS', icon: Cpu,
    color: 'from-cyan-500 to-blue-500',
    stats: { totalQuestions: 6, avgFrequency: 88, mostAsked: 'Process Management' },
    questions: [
      { q: 'Difference between process and thread with examples.', difficulty: 'High', freq: 96, likes: 278, timeToRead: '3 min' },
      { q: 'Explain deadlock — conditions and prevention.', difficulty: 'High', freq: 91, likes: 198, timeToRead: '4 min' },
      { q: 'What is paging? How does it differ from segmentation?', difficulty: 'Medium', freq: 85, likes: 145, timeToRead: '3 min' },
      { q: 'Explain different CPU scheduling algorithms.', difficulty: 'High', freq: 94, likes: 234, timeToRead: '5 min' },
      { q: 'What is virtual memory? How does it work?', difficulty: 'Medium', freq: 83, likes: 156, timeToRead: '3 min' },
      { q: 'Explain memory management techniques.', difficulty: 'Medium', freq: 78, likes: 123, timeToRead: '3 min' },
    ],
  },
  
  // CN Questions
  {
    id: 5, subject: 'CN', icon: Globe,
    color: 'from-teal-500 to-emerald-500',
    stats: { totalQuestions: 6, avgFrequency: 85, mostAsked: 'OSI vs TCP/IP' },
    questions: [
      { q: 'Compare OSI and TCP/IP model layer by layer.', difficulty: 'High', freq: 93, likes: 245, timeToRead: '4 min' },
      { q: 'What is ARP and how does it work?', difficulty: 'Medium', freq: 80, likes: 134, timeToRead: '2 min' },
      { q: 'Explain TCP 3-way handshake with diagram.', difficulty: 'High', freq: 88, likes: 198, timeToRead: '3 min' },
      { q: 'Difference between TCP and UDP protocols.', difficulty: 'Medium', freq: 91, likes: 167, timeToRead: '2 min' },
      { q: 'What is subnetting? Explain with example.', difficulty: 'High', freq: 84, likes: 156, timeToRead: '4 min' },
      { q: 'Explain DNS and its working.', difficulty: 'Medium', freq: 76, likes: 112, timeToRead: '3 min' },
    ],
  },
  
  // Python Questions
  {
    id: 6, subject: 'Python', icon: Code,
    color: 'from-yellow-500 to-amber-600',
    stats: { totalQuestions: 6, avgFrequency: 87, mostAsked: 'Data Structures' },
    questions: [
      { q: 'Difference between list and tuple in Python.', difficulty: 'Low', freq: 95, likes: 267, timeToRead: '2 min' },
      { q: 'Explain Python decorators with example.', difficulty: 'High', freq: 82, likes: 189, timeToRead: '4 min' },
      { q: 'What is GIL in Python?', difficulty: 'Medium', freq: 71, likes: 134, timeToRead: '3 min' },
      { q: 'How does memory management work in Python?', difficulty: 'High', freq: 88, likes: 167, timeToRead: '4 min' },
      { q: 'Explain list comprehension with examples.', difficulty: 'Medium', freq: 93, likes: 198, timeToRead: '2 min' },
      { q: 'Difference between deep and shallow copy.', difficulty: 'Medium', freq: 79, likes: 145, timeToRead: '3 min' },
    ],
  },
  
  // AOA Questions
  {
    id: 7, subject: 'AOA', icon: TrendingUp,
    color: 'from-red-500 to-pink-500',
    stats: { totalQuestions: 5, avgFrequency: 83, mostAsked: 'Algorithm Analysis' },
    questions: [
      { q: 'Explain asymptotic notations (Big O, Omega, Theta).', difficulty: 'High', freq: 97, likes: 234, timeToRead: '4 min' },
      { q: 'Compare divide and conquer vs dynamic programming.', difficulty: 'High', freq: 89, likes: 178, timeToRead: '4 min' },
      { q: 'What is the greedy algorithm? Give examples.', difficulty: 'Medium', freq: 82, likes: 145, timeToRead: '3 min' },
      { q: 'Explain backtracking with example.', difficulty: 'High', freq: 78, likes: 134, timeToRead: '4 min' },
      { q: 'Difference between P, NP, NP-Hard, and NP-Complete.', difficulty: 'High', freq: 71, likes: 156, timeToRead: '5 min' },
    ],
  },
  
  // C Programming
  {
    id: 8, subject: 'C Programming', icon: Code,
    color: 'from-blue-400 to-blue-600',
    stats: { totalQuestions: 5, avgFrequency: 84, mostAsked: 'Pointers' },
    questions: [
      { q: 'Explain pointers and their use cases.', difficulty: 'High', freq: 96, likes: 245, timeToRead: '4 min' },
      { q: 'Difference between malloc() and calloc().', difficulty: 'Medium', freq: 88, likes: 167, timeToRead: '2 min' },
      { q: 'What is static and dynamic memory allocation?', difficulty: 'Medium', freq: 82, likes: 134, timeToRead: '3 min' },
      { q: 'Explain structure vs union with examples.', difficulty: 'Medium', freq: 79, likes: 123, timeToRead: '2 min' },
      { q: 'What is function pointer? Give example.', difficulty: 'High', freq: 74, likes: 98, timeToRead: '3 min' },
    ],
  },
];

const diffColor = { 
  High: 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 border-red-200', 
  Medium: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-600 border-amber-200', 
  Low: 'bg-gradient-to-r from-green-50 to-green-100 text-green-600 border-green-200' 
};

const difficultyIcons = {
  High: '🔥',
  Medium: '📊',
  Low: '🌟'
};

const SubjectCard = memo(({ item }) => {
  const [open, setOpen] = useState(false);
  const [likedQuestions, setLikedQuestions] = useState({});
  const Icon = item.icon;

  const handleLike = (questionIndex, e) => {
    e.stopPropagation();
    setLikedQuestions(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  return (
    <motion.div 
      variants={fadeUp} 
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
      whileHover={{ y: -2 }}
    >
      <div className={`h-1.5 bg-gradient-to-r ${item.color}`} />
      
      <button 
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
            <Icon size={20} className="text-white" />
          </div>
          
          <div className="text-left">
            <h4 className="font-bold text-gray-800 text-lg">{item.subject}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                {item.stats.totalQuestions} questions
              </span>
              <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                {item.stats.avgFrequency}% avg. frequency
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-xs text-gray-400">
            Most asked: {item.stats.mostAsked}
          </div>
          <div className={`p-1.5 rounded-full transition-colors ${open ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {open ? <ChevronUp size={18} className="text-blue-600"/> : <ChevronDown size={18} className="text-gray-400"/>}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }} 
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              {item.questions.map((q, i) => (
                <motion.div 
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-gradient-to-r from-white to-gray-50/50 hover:from-blue-50/50 hover:to-white rounded-xl p-4 border border-gray-200 hover:border-blue-200 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-lg">{difficultyIcons[q.difficulty]}</span>
                      <p className="text-sm text-gray-700 font-medium leading-snug flex-1">{q.q}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full border font-semibold flex-shrink-0 shadow-sm ${diffColor[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
                      
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleLike(i, e)}
                        className={`p-1.5 rounded-full transition-all ${likedQuestions[i] ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400'}`}
                      >
                        <ThumbsUp size={14} fill={likedQuestions[i] ? 'currentColor' : 'none'} />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${q.freq}%` }} 
                          transition={{ delay: 0.1 + i * 0.02, duration: 0.7 }}
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full`} 
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-semibold min-w-[45px] text-right">
                        {q.freq}% asked
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock size={12} />
                        <span>{q.timeToRead}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={12} />
                        <span>{q.likes + (likedQuestions[i] ? 1 : 0)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <div className="flex items-center justify-end gap-2 pt-2 text-xs text-gray-400 border-t border-gray-100">
                <BookOpen size={12} />
                <span>Total {item.questions.length} questions • Updated weekly</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const VivaResources = () => {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return VIVA_DATA.filter(v => 
      v.subject.toLowerCase().includes(search.toLowerCase())
    ).map(subject => ({
      ...subject,
      questions: selectedDifficulty === 'All' 
        ? subject.questions 
        : subject.questions.filter(q => q.difficulty === selectedDifficulty)
    })).filter(subject => subject.questions.length > 0);
  }, [search, selectedDifficulty]);

  const totalQuestions = useMemo(() => {
    return filtered.reduce((acc, subj) => acc + subj.questions.length, 0);
  }, [filtered]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div 
        variants={fadeUp} 
        className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black opacity-10 pattern-dots pattern-white pattern-opacity-10 pattern-size-4" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-3xl font-bold">Viva Resources</h2>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                {VIVA_DATA.length} Subjects
              </span>
            </div>
            <p className="text-white/80 text-sm max-w-xl">
              Master your viva with frequently asked questions. Track popularity scores and practice smartly.
            </p>
            
            <div className="flex items-center gap-3 mt-4">
              <div className="flex -space-x-2">
                {['🔥', '📚', '💡', '⭐'].map((emoji, i) => (
                  <div key={i} className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-sm border-2 border-white/30">
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="text-white/60 text-xs">Used by 500+ students this week</span>
            </div>
          </div>
          
          <div className="text-6xl select-none bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            🎯
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by subject or topic…"
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-12 py-3 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all ${
            showFilters || selectedDifficulty !== 'All'
              ? 'bg-purple-50 border-purple-200 text-purple-600'
              : 'bg-white border-gray-200 text-gray-600 hover:border-purple-200 hover:bg-purple-50/50'
          }`}
        >
          <Filter size={16} />
          <span className="text-sm">Filters</span>
          {selectedDifficulty !== 'All' && (
            <span className="bg-purple-200 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              1
            </span>
          )}
        </button>
      </motion.div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-400 mb-2">Filter by difficulty</p>
              <div className="flex gap-2">
                {['All', 'High', 'Medium', 'Low'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDifficulty === diff
                        ? diff === 'All' 
                          ? 'bg-gray-800 text-white'
                          : diff === 'High'
                          ? 'bg-red-500 text-white'
                          : diff === 'Medium'
                          ? 'bg-amber-500 text-white'
                          : 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {diff} {diff !== 'All' && difficultyIcons[diff]}
                  </button>
                ))}
              </div>
              
              <div className="mt-3 text-xs text-gray-400">
                Showing {totalQuestions} questions
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <motion.div variants={stagger} className="space-y-4 max-w-4xl">
        {filtered.length > 0 ? (
          filtered.map(item => <SubjectCard key={item.id} item={item} />)
        ) : (
          <motion.div 
            variants={fadeUp}
            className="text-center py-12 bg-white rounded-2xl border border-gray-200"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No results found</h3>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            <button 
              onClick={() => { setSearch(''); setSelectedDifficulty('All'); }}
              className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        variants={fadeUp}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6"
      >
        {[
          { label: 'Total Questions', value: '45+', icon: BookOpen },
          { label: 'High Frequency', value: '68%', icon: TrendingUp },
          { label: 'Subjects Covered', value: '8', icon: Brain },
          { label: 'Avg. Rating', value: '4.8 ⭐', icon: Star },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
              <stat.icon size={14} />
              <span className="text-xs">{stat.label}</span>
            </div>
            <span className="text-lg font-bold text-gray-800">{stat.value}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default VivaResources;