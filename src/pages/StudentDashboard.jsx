// src/pages/StudentDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LottieComponent from "lottie-react";
const Lottie = LottieComponent.default ?? LottieComponent;
import {
  BookOpen, Award, Star, TrendingUp, Download, ThumbsUp,
  ChevronRight, Brain, Bookmark, FileText, Bell, Search,
  User, Beaker, BarChart3, Trophy, Medal, Zap, Sparkles, Target,
  Flame, Crown
} from 'lucide-react';
import Sidebar from '../components/student/Sidebar';
import trophyAnimation from '../assets/Trophy.json';

// Import all separate component files
import MyNotes from '../components/student/MyNotes';
import BestNotes from '../components/student/BestNotes';
import PYQs from '../components/student/PYQs';
import LabManual from '../components/student/LabManual';
import VivaResources from '../components/student/VivaResources';
import ExamMode from '../components/student/ExamMode';
import TopRated from '../components/student/TopRated';
import Saved from '../components/student/Saved';
import Settings from '../components/student/Setting';

// ─── Framer variants (defined once, outside all components) ──────────────────
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

// ─── TrophyLottie – plays once → freezes on last frame → replays after 15 s ──
const TrophyLottie = memo(() => {
  const lottieRef = useRef(null);
  const timerRef  = useRef(null);

  const scheduleReplay = useCallback(() => {
    timerRef.current = setTimeout(() => {
      lottieRef.current?.goToAndPlay(0, true);
    }, 15000);
  }, []);

  const handleComplete = useCallback(() => {
    lottieRef.current?.pause();
    scheduleReplay();
  }, [scheduleReplay]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={trophyAnimation}
      loop={false}
      autoplay={true}
      onComplete={handleComplete}
      style={{ width: 150, height: 150 }}
    />
  );
});

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = memo(({ children, className = '', onClick }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={`bg-white rounded-2xl shadow-lg border border-blue-100 ${className}`}
    onClick={onClick}
  >
    {children}
  </motion.div>
));

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = memo(({ icon: Icon, label, value, trend, color, delay = 0 }) => (
  <motion.div
    variants={fadeUp}
    transition={{ delay }}
    whileHover={{ scale: 1.03, y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 relative overflow-hidden group"
  >
    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${color} blur-xl pointer-events-none`} />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-gray-500 text-sm mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={13} className="text-emerald-500" />
            <span className="text-xs text-emerald-500 font-medium">+{trend}% this week</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </motion.div>
));

// ─── PointsBarGraph ───────────────────────────────────────────────────────────
const PointsBarGraph = memo(({ data }) => {
  const maxPoints = useMemo(() => Math.max(...data.map(d => d.points)), [data]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-800">Points Leaderboard</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">This Month</span>
          <Sparkles size={13} className="text-yellow-400" />
        </div>
      </div>

      <div className="space-y-3">
        {data.map((student, index) => {
          const barColor =
            index === 0 ? 'from-yellow-400 to-yellow-500' :
            index === 1 ? 'from-slate-400 to-slate-500' :
            index === 2 ? 'from-amber-500 to-amber-600' :
            'from-blue-500 to-blue-600';
          const rankBg =
            index === 0 ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
            index === 1 ? 'bg-slate-50 text-slate-600 border-slate-200' :
            index === 2 ? 'bg-amber-50 text-amber-600 border-amber-200' :
            'bg-blue-50 text-blue-600 border-blue-200';

          return (
            <motion.div
              key={student.name}
              variants={fadeUp}
              transition={{ delay: index * 0.06 }}
              className="flex items-center gap-3"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 ${rankBg}`}>
                {index === 0 ? <Crown size={11} /> : index === 1 ? <Medal size={11} /> : index === 2 ? <Medal size={11} /> : index + 1}
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <User size={13} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate">{student.name}</span>
                  <span className="text-sm font-bold text-blue-600 ml-2 flex-shrink-0">{student.points.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(student.points / maxPoints) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.9, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
});

// ─── AchievementCard (Lottie trophy lives here) ───────────────────────────────
const AchievementCard = memo(() => (
  <Card className="p-6">
    <div className="flex items-center gap-2 mb-4">
      <Target size={20} className="text-blue-600" />
      <h3 className="font-semibold text-gray-800">Your Achievement</h3>
    </div>

    <div className="text-center mb-5">
      <div className="flex justify-center mb-2 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-200 to-amber-200 blur-2xl opacity-60" />
        </div>
        <TrophyLottie />
      </div>
      <h4 className="text-3xl font-bold text-gray-800">2,450</h4>
      <p className="text-gray-400 text-sm mt-0.5">Total Points</p>
    </div>

    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-500">This Week</span>
          <span className="text-gray-800 font-bold">450 pts</span>
        </div>
        <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '65%' }}
            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-500">Monthly Goal</span>
          <span className="text-gray-800 font-bold">2,450 / 3,000</span>
        </div>
        <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '82%' }}
            transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
          />
        </div>
      </div>
    </div>

    <div className="mt-5">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Recent Badges</p>
      <div className="flex gap-2">
        {[
          { icon: <Award size={15} className="text-yellow-500" />, bg: 'bg-yellow-50 border-yellow-200' },
          { icon: <Star  size={15} className="text-blue-500"   />, bg: 'bg-blue-50 border-blue-200'     },
          { icon: <Zap   size={15} className="text-purple-500" />, bg: 'bg-purple-50 border-purple-200' },
        ].map((b, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.15, rotate: 8 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${b.bg} shadow-sm cursor-pointer`}
          >
            {b.icon}
          </motion.div>
        ))}
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-blue-200 flex items-center justify-center text-blue-300 text-xs font-bold">+5</div>
      </div>
    </div>
  </Card>
));

// ─── ResourceCard ─────────────────────────────────────────────────────────────
const ResourceCard = memo(({ title, type, author, upvotes, downloads, verified, gold, delay = 0 }) => {
  const cfg = useMemo(() => ({
    notes: { icon: <BookOpen size={14} className="text-blue-500" />,   bg: 'bg-blue-50   text-blue-600   border-blue-200'   },
    pyq:   { icon: <FileText size={14} className="text-amber-500" />,  bg: 'bg-amber-50  text-amber-600  border-amber-200'  },
    lab:   { icon: <Beaker   size={14} className="text-purple-500" />, bg: 'bg-purple-50 text-purple-600 border-purple-200' },
  })[type] ?? { icon: <BookOpen size={14} className="text-blue-500" />, bg: 'bg-blue-50 text-blue-600 border-blue-200' }, [type]);

  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className="bg-white rounded-xl p-4 shadow-md border border-blue-100 cursor-pointer group hover:border-blue-300 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold ${cfg.bg}`}>
          {cfg.icon}{type.toUpperCase()}
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          {verified && <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>}
          {gold     && <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium">🏅 Gold</span>}
        </div>
      </div>
      <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors text-sm leading-snug">{title}</h4>
      <p className="text-xs text-gray-400 mb-3">by {author}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors"><ThumbsUp size={11} /> {upvotes}</span>
          <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors"><Download size={11} /> {downloads}</span>
        </div>
        <motion.button whileHover={{ x: 4 }} className="text-blue-500 hover:text-blue-700 font-semibold">View →</motion.button>
      </div>
    </motion.div>
  );
});

// ─── NoteCard ─────────────────────────────────────────────────────────────────
const NoteCard = memo(({ title, subject, pages, saved }) => {
  const [isSaved, setIsSaved] = useState(saved);
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className="bg-white rounded-xl p-4 shadow-md border border-blue-100 group hover:border-blue-300 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <BookOpen size={17} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-blue-600 transition-colors leading-snug truncate">{title}</h4>
          <p className="text-xs text-gray-400 mb-2">{subject} · {pages} pages</p>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors font-medium">Read</motion.button>
            <motion.button whileHover={{ scale: 1.15 }} onClick={() => setIsSaved(v => !v)} className={`transition-colors ${isSaved ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}>
              <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// ─── LeaderBoard ──────────────────────────────────────────────────────────────
const LeaderBoard = memo(({ students }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <Trophy size={18} className="text-yellow-500" />
        <h3 className="font-semibold text-gray-800">Top Performers</h3>
      </div>
      <motion.button whileHover={{ x: 3 }} className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All →</motion.button>
    </div>
    <div className="space-y-2">
      {students.map((student, index) => (
        <motion.div
          key={student.name}
          variants={fadeUp}
          transition={{ delay: index * 0.07 }}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/60 hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs
            ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
              index === 1 ? 'bg-slate-100 text-slate-600'   :
              index === 2 ? 'bg-amber-100 text-amber-600'   : 'bg-blue-100 text-blue-600'}`}
          >{index + 1}</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <User size={13} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 font-medium text-sm truncate">{student.name}</p>
            <p className="text-gray-400 text-xs">{student.department} · Sem {student.semester}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-gray-800 font-bold text-sm">{student.points.toLocaleString()}</p>
            <p className="text-xs text-gray-400">pts</p>
          </div>
        </motion.div>
      ))}
    </div>
  </Card>
));

// ─── Static data ─────────────────────────────────────────────────────────────
const STATS = [
  { icon: BookOpen, label: 'My Notes',   value: '24',      trend: 12, color: 'from-blue-500 to-blue-600',    delay: 0    },
  { icon: Star,     label: 'Saved',      value: '18',      trend: 8,  color: 'from-amber-500 to-amber-600',  delay: 0.05 },
  { icon: Award,    label: 'Best Notes', value: '6',       trend: 15, color: 'from-purple-500 to-purple-600', delay: 0.1  },
  { icon: Flame,    label: 'Streak',     value: '15 days', trend: 5,  color: 'from-orange-500 to-orange-600', delay: 0.15 },
];
const LEADERBOARD = [
  { name: 'Alex Johnson',   points: 2450, department: 'CS',   semester: 6 },
  { name: 'Sarah Williams', points: 2320, department: 'IT',   semester: 6 },
  { name: 'Mike Chen',      points: 2180, department: 'CS',   semester: 8 },
  { name: 'Emma Davis',     points: 2050, department: 'EXTC', semester: 6 },
  { name: 'James Wilson',   points: 1980, department: 'CS',   semester: 4 },
];
const POINTS_GRAPH = [
  { name: 'Alex',  points: 2450 }, { name: 'Sarah', points: 2320 },
  { name: 'Mike',  points: 2180 }, { name: 'Emma',  points: 2050 },
  { name: 'James', points: 1980 }, { name: 'Lisa',  points: 1850 },
  { name: 'David', points: 1720 },
];
const RECENT_NOTES = [
  { title: 'DBMS - Normalization Notes',   subject: 'Database Systems',  pages: 24, saved: true  },
  { title: 'OS - Process Scheduling',      subject: 'Operating Systems', pages: 18, saved: false },
  { title: 'CN - Network Layer Protocols', subject: 'Computer Networks', pages: 32, saved: true  },
  { title: 'DSA - Graph Algorithms',       subject: 'Data Structures',   pages: 28, saved: false },
];
const BEST_NOTES = [
  { title: 'Complete DBMS Guide',   type: 'notes', author: 'Prof. Sharma',    upvotes: 234, downloads: 1245, verified: true,  gold: true  },
  { title: 'OS Previous Year 2024', type: 'pyq',   author: 'Student Council', upvotes: 189, downloads: 987,  verified: true,  gold: false },
  { title: 'DBMS Lab Manual',       type: 'lab',   author: 'CS Dept',         upvotes: 156, downloads: 876,  verified: true,  gold: false },
];
const SAVED_ITEMS = [
  { title: 'Algorithm Design Notes', type: 'notes', author: 'Alex',  upvotes: 98, downloads: 543, verified: false, gold: false },
  { title: 'CN Important Questions', type: 'pyq',   author: 'Sarah', upvotes: 76, downloads: 432, verified: false, gold: false },
];

// ─── DashboardContent ────────────────────────────────────────────────────────
const DashboardContent = memo(({ showWelcome }) => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

    {/* Welcome Banner */}
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
          className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-indigo-300/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={20} className="text-yellow-300" />
                <h2 className="text-xl font-bold">Welcome back, Alex! 👋</h2>
              </div>
              <p className="text-blue-100 text-sm">Continue your learning journey. You have 3 pending tasks.</p>
              <div className="flex gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                  <Zap size={12} className="text-yellow-300" />
                  <span className="text-xs font-medium">15-day streak</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                  <Target size={12} className="text-green-300" />
                  <span className="text-xs font-medium">80% monthly goal</span>
                </div>
              </div>
            </div>
            <div className="text-5xl select-none">🎯</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Stats Grid */}
    <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((s, i) => <StatCard key={i} {...s} />)}
    </motion.div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2"><PointsBarGraph data={POINTS_GRAPH} /></div>
      <AchievementCard />
    </div>

    {/* Notes + Actions */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen size={19} className="text-blue-600" />
              <h3 className="font-semibold text-gray-800">My Notes</h3>
            </div>
            <motion.button whileHover={{ x: 4 }} className="text-blue-600 text-sm hover:text-blue-700 font-medium">View All →</motion.button>
          </div>
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RECENT_NOTES.map((n, i) => <NoteCard key={i} {...n} />)}
          </motion.div>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Exam Mode CTA */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
          className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl cursor-pointer relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Brain size={26} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Exam Mode</h3>
                <p className="text-blue-200 text-xs">AI-powered preparation</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <p className="text-blue-200 text-xs mb-0.5">Predictions</p>
                <p className="text-white font-bold text-2xl">24</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <p className="text-blue-200 text-xs mb-0.5">Confidence</p>
                <p className="text-white font-bold text-2xl">92%</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-white text-blue-600 font-bold py-2.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg"
            >
              Launch Exam Mode <ChevronRight size={15} />
            </motion.button>
          </div>
        </motion.div>

        <LeaderBoard students={LEADERBOARD} />
      </div>
    </div>

    {/* Best Notes */}
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={19} className="text-yellow-500" />
          <h3 className="font-semibold text-gray-800">🏆 Best Notes This Week</h3>
        </div>
        <motion.button whileHover={{ x: 4 }} className="text-blue-600 text-sm hover:text-blue-700 font-medium">View All →</motion.button>
      </div>
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BEST_NOTES.map((n, i) => <ResourceCard key={i} {...n} />)}
      </motion.div>
    </Card>

    {/* Saved */}
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bookmark size={19} className="text-amber-500" />
          <h3 className="font-semibold text-gray-800">Saved Items</h3>
        </div>
        <motion.button whileHover={{ x: 4 }} className="text-blue-600 text-sm hover:text-blue-700 font-medium">Manage →</motion.button>
      </div>
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAVED_ITEMS.map((n, i) => <ResourceCard key={i} {...n} />)}
      </motion.div>
    </Card>
  </motion.div>
));

// ─── Page title map ───────────────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard:     'Dashboard',
  notes:         'My Notes',
  'best-notes':  'Best Notes',
  pyqs:          'PYQs',
  'lab-manuals': 'Lab Manual',
  viva:          'Viva Resources',
  'exam-mode':   'Exam Mode',
  'top-rated':   'Top Rated Students',
  saved:         'Saved Notes',
  settings:      'Settings',
};

// ─── Main component ───────────────────────────────────────────────────────────
const StudentDashboard = ({ onSignOut }) => {
  const [activeTab,        setActiveTab]        = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWelcome,      setShowWelcome]      = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowWelcome(false), 4500);
    return () => clearTimeout(t);
  }, []);

  const pageTitle = PAGE_TITLES[activeTab] ?? (activeTab.charAt(0).toUpperCase() + activeTab.slice(1));

  // Handle sign out — calls onSignOut prop if provided, otherwise falls back
  const handleSignOut = useCallback(() => {
    if (onSignOut) {
      onSignOut();
    }
  }, [onSignOut]);

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'dashboard':   return <DashboardContent showWelcome={showWelcome} />;
      case 'notes':       return <MyNotes />;
      case 'best-notes':  return <BestNotes />;
      case 'pyqs':        return <PYQs />;
      case 'lab-manuals': return <LabManual />;
      case 'viva':        return <VivaResources />;
      case 'exam-mode':   return <ExamMode />;
      case 'top-rated':   return <TopRated />;
      case 'saved':       return <Saved />;
      case 'settings':    return <Settings onSignOut={handleSignOut} />;
      default:
        return (
          <Card className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3">{pageTitle}</h2>
            <p className="text-gray-400">Content coming soon…</p>
          </Card>
        );
    }
  }, [activeTab, showWelcome, pageTitle, handleSignOut]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/60 to-slate-50 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">

          {/* Top Bar */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-7 bg-white rounded-2xl shadow-lg border border-blue-100 px-5 py-3.5 gap-4 flex-wrap"
          >
            <div>
              <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>
              <p className="text-gray-400 text-xs mt-0.5">Welcome back — keep the momentum going 🚀</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes, PYQs…"
                  className="bg-blue-50 border border-blue-100 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all w-56"
                />
              </div>
              <motion.button whileHover={{ scale: 1.08 }} className="relative p-2.5 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors">
                <Bell size={16} className="text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white" />
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.04 }}
                className="flex items-center gap-2.5 bg-blue-50 rounded-xl border border-blue-100 px-3 py-2 cursor-pointer hover:border-blue-300 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <User size={14} className="text-white" />
                </div>
                <div className="text-sm hidden sm:block">
                  <p className="font-semibold text-gray-800 leading-none">Alex</p>
                  <p className="text-xs text-blue-500 font-medium mt-0.5">2,450 pts</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Page content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;