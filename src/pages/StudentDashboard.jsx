// src/pages/StudentDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LottieComponent from "lottie-react";
const Lottie = LottieComponent.default ?? LottieComponent;
import {
  BookOpen, Award, Star, TrendingUp, Download, ThumbsUp,
  ChevronRight, Brain, Bookmark, FileText, Bell, Search,
  User, Beaker, BarChart3, Trophy, Medal, Zap, Sparkles, Target,
  Flame, Crown, LogOut, Clock, Calendar, CheckCircle, Users
} from 'lucide-react';
import { auth, db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  orderBy, 
  limit,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
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

// ─── Framer variants ──────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

// ─── TrophyLottie Component ───────────────────────────
const TrophyLottie = memo(() => {
  const lottieRef = useRef(null);
  const timerRef = useRef(null);

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
      style={{ width: 200, height: 200 }}
    />
  );
});

// ─── Card Component ───────────────────────────────────
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

// ─── StatCard Component ───────────────────────────────
const StatCard = memo(({ icon: Icon, label, value, trend, color, delay = 0 }) => {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 relative overflow-hidden group"
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${color} blur-xl pointer-events-none`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-gray-500 text-sm mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-gray-800">
            {value}
          </h3>
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={13} className="text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium">
                +{trend}% this week
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
});


const PointsBarGraph = ({ data }) => {
  // Remove useMemo or add data as dependency properly
  const [maxPoints, setMaxPoints] = useState(0);
  
  // Track previous data for animation
  const prevDataRef = useRef(data);
  const [changedStudentIds, setChangedStudentIds] = useState(new Set());
  const [dataChanged, setDataChanged] = useState(false);

  // Update maxPoints whenever data changes
  useEffect(() => {
    if (data && data.length > 0) {
      const max = Math.max(...data.map(d => d.points || 0));
      setMaxPoints(max);
    } else {
      setMaxPoints(0);
    }
  }, [data]);

  // Detect changes in student points
  useEffect(() => {
    const prevData = prevDataRef.current;
    const newChangedIds = new Set();
    
    if (prevData && data && prevData !== data) {
      // Check for point changes by comparing each student
      data.forEach(student => {
        const prevStudent = prevData.find(s => s.id === student.id);
        if (prevStudent && prevStudent.points !== student.points) {
          newChangedIds.add(student.id);
        }
      });
      
      // Check for new students
      data.forEach(student => {
        const exists = prevData.some(s => s.id === student.id);
        if (!exists) {
          newChangedIds.add(student.id);
        }
      });
      
      // Check for removed students (optional)
      prevData.forEach(prevStudent => {
        const exists = data.some(s => s.id === prevStudent.id);
        if (!exists) {
          // Student removed, you might want to handle this
        }
      });
    }
    
    if (newChangedIds.size > 0) {
      console.log('Points changed for students:', Array.from(newChangedIds)); // Debug log
      setChangedStudentIds(newChangedIds);
      setDataChanged(true);
      
      // Clear animation flags after animation completes
      const timer = setTimeout(() => {
        setChangedStudentIds(new Set());
        setDataChanged(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    prevDataRef.current = data;
  }, [data]);

  // If no data, show empty state
  if (!data || data.length === 0) {
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
        <div className="text-center py-8 text-gray-400 text-sm">
          No student data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-800">Points Leaderboard</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator - pulses when data updates */}
          <motion.div
            key={dataChanged ? 'changed' : 'stable'}
            animate={dataChanged ? { 
              scale: [1, 1.3, 1],
              backgroundColor: ['#22c55e', '#3b82f6', '#22c55e']
            } : { scale: 1 }}
            transition={{ duration: 1.5 }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
          <span className="text-xs text-gray-400">This Month · {data.length} students</span>
          <Sparkles size={13} className="text-yellow-400" />
        </div>
      </div>

      {/* Scrollable container */}
      <div className="max-h-[900px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {data.map((student, index) => {
          const barColor = index === 0 ? 'from-yellow-400 to-yellow-500' :
                          index === 1 ? 'from-slate-400 to-slate-500' :
                          index === 2 ? 'from-amber-500 to-amber-600' :
                          'from-blue-500 to-blue-600';
          
          const rankBg = index === 0 ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                        index === 1 ? 'bg-slate-50 text-slate-600 border-slate-200' :
                        index === 2 ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-blue-50 text-blue-600 border-blue-200';

          const rankIcon = index === 0 ? <Crown size={11} /> :
                          index === 1 ? <Medal size={11} /> :
                          index === 2 ? <Medal size={11} /> : 
                          <span className="text-[10px] font-bold">{index + 1}</span>;

          const hasChanged = changedStudentIds.has(student.id);
          const widthPercentage = maxPoints > 0 ? (student.points / maxPoints) * 100 : 0;

          return (
            <motion.div
              key={student.id || student.name || index}
              variants={fadeUp}
              animate="show"
              transition={{ delay: Math.min(index * 0.03, 0.5) }}
              className="relative"
            >
              {/* Highlight animation for changed items */}
              <AnimatePresence>
                {hasChanged && (
                  <motion.div
                    initial={{ opacity: 0.5, scale: 0.95 }}
                    animate={{ opacity: 0, scale: 1.02 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0 bg-blue-100 rounded-lg pointer-events-none z-0"
                  />
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 ${rankBg}`}>
                  {rankIcon}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <User size={13} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900">
                      {student.name || student.username || 'Anonymous Student'}
                    </span>
                    <motion.span
                      key={`${student.id}-points-${student.points}`}
                      animate={hasChanged ? { 
                        scale: [1, 1.3, 1],
                        color: ['#3b82f6', '#2563eb', '#3b82f6']
                      } : { scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-sm font-bold text-blue-600 ml-2 flex-shrink-0 group-hover:text-blue-700"
                    >
                      {student.points?.toLocaleString() || 0} pts
                    </motion.span>
                  </div>
                  <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                    <motion.div
                      key={`${student.id}-bar-${student.points}`}
                      initial={false}
                      animate={{ width: `${widthPercentage}%` }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 100, 
                        damping: 20,
                        delay: hasChanged ? 0.1 : 0
                      }}
                      className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                    />
                  </div>
                </div>

                {/* Small indicator for point increase */}
                <AnimatePresence>
                  {hasChanged && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -right-1 -top-1"
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-1.5 h-1.5 bg-white rounded-full"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show total count with animation on change */}
      <motion.div 
        animate={dataChanged ? { 
          backgroundColor: ['#ffffff', '#f0f9ff', '#ffffff'],
          scale: [1, 1.02, 1]
        } : {}}
        transition={{ duration: 1 }}
        className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 p-2 rounded-lg"
      >
        <span>Total Students: {data.length}</span>
        <motion.span 
          key={`max-${maxPoints}`}
          animate={dataChanged ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.5 }}
          className="font-medium text-blue-600"
        >
          Top Score: {maxPoints.toLocaleString()}
        </motion.span>
      </motion.div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </Card>
  );
};

// ─── AchievementCard ──────────────────────────────────
// ─── Move staticBadges OUTSIDE component to prevent re-creation on every render
const STATIC_BADGES = [
  { name: 'Early Bird',       icon: Award,      bgColor: 'bg-orange-50 border-orange-200',  color: 'text-orange-500',  points: 200  },
  { name: 'Super Star',       icon: Star,       bgColor: 'bg-yellow-50 border-yellow-200',  color: 'text-yellow-500',  points: 400  },
  { name: 'Speed Demon',      icon: Zap,        bgColor: 'bg-purple-50 border-purple-200',  color: 'text-purple-500',  points: 600  },
  { name: 'Knowledge Seeker', icon: BookOpen,   bgColor: 'bg-blue-50 border-blue-200',      color: 'text-blue-500',    points: 800  },
  { name: 'Rising Star',      icon: TrendingUp, bgColor: 'bg-green-50 border-green-200',    color: 'text-green-500',   points: 1000 },
  { name: 'Mastermind',       icon: Brain,      bgColor: 'bg-indigo-50 border-indigo-200',  color: 'text-indigo-500',  points: 1200 },
  { name: 'Champion',         icon: Crown,      bgColor: 'bg-amber-50 border-amber-200',    color: 'text-amber-500',   points: 1350 },
  { name: 'Legend',           icon: Flame,      bgColor: 'bg-red-50 border-red-200',        color: 'text-red-500',     points: 1500 },
];

// ─── AchievementCard ──────────────────────────────────
const AchievementCard = memo(({ userData }) => {
  const currentPoints = userData?.points || 0;

  const achievedBadges = useMemo(() =>
    STATIC_BADGES.filter(b => b.points <= currentPoints),
    [currentPoints]
  );

  const nextBadge = useMemo(() =>
    STATIC_BADGES.find(b => b.points > currentPoints) || STATIC_BADGES[STATIC_BADGES.length - 1],
    [currentPoints]
  );

  const prevBadge = useMemo(() =>
    achievedBadges[achievedBadges.length - 1] || { points: 0 },
    [achievedBadges]
  );

  const progressPercentage = useMemo(() => {
    if (nextBadge.points === prevBadge.points) return 100;
    return Math.min(
      ((currentPoints - prevBadge.points) / (nextBadge.points - prevBadge.points)) * 100,
      100
    );
  }, [currentPoints, nextBadge.points, prevBadge.points]);

  const [hoveredBadge,    setHoveredBadge]    = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevPointsRef = useRef(currentPoints);

  // Fix: use ref to track previous points, avoid stale closure / dep loop
  useEffect(() => {
    const prev = prevPointsRef.current;
    if (currentPoints > prev) {
      const newlyAchieved = STATIC_BADGES.find(
        b => b.points > prev && b.points <= currentPoints
      );
      if (newlyAchieved) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
    prevPointsRef.current = currentPoints;
  }, [currentPoints]);

  return (
    // Use relative + overflow-visible so tooltip doesn't clip
    <Card className="p-6 relative overflow-visible">

      {/* ── Celebration overlay ── */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            // overflow-hidden + rounded so it clips inside card bounds
            className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-400 to-purple-500 z-50 flex items-center justify-center rounded-2xl overflow-hidden"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0,  opacity: 1 }}
              transition={{ type: 'spring', damping: 14 }}
              className="text-white text-center px-4"
            >
              <div className="w-24\ h-24 mx-auto">
                <TrophyLottie />
              </div>
              <h3 className="text-2xl font-bold mt-2">Badge Unlocked!</h3>
              <p className="text-lg font-semibold mt-1 opacity-90">{nextBadge.name}</p>
              <motion.p
                className="mt-2 text-sm opacity-80"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🎉 Keep going!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-4">
        <Target size={20} className="text-blue-600" />
        <h3 className="font-semibold text-gray-800 text-base">Your Achievement</h3>
      </div>

      {/* ── Trophy + Points ── */}
      {/* ── Trophy + Points ── */}
<div className="text-center mb-5">
  <div className="flex justify-center mb-2 relative">
    {/* Glow behind trophy */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 blur-2xl"
      />
    </div>
    
    {/* Trophy container - properly centered */}
    <div className="relative z-10 flex items-center justify-center" style={{ width: 100, height: 100 }}>
      <div className="w-[200px] h-[200px] flex items-center justify-center">
        <TrophyLottie />
      </div>
    </div>
  </div>

  <motion.h4
    key={currentPoints}
    initial={{ scale: 1.3, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 200 }}
    className="text-4xl font-bold text-gray-800 leading-none"
  >
    {currentPoints.toLocaleString()}
  </motion.h4>
  <p className="text-gray-400 text-xs mt-1">Total Points</p>
</div>

      {/* ── Progress bar section ── */}
      <div className="mb-4">
        {/* Label row */}
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500">
            Next: <span className="font-semibold text-gray-700">{nextBadge.name}</span>
          </span>
          <span className="font-bold text-gray-700">
            {currentPoints} / {nextBadge.points}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative group">
          <div className="h-3.5 bg-blue-50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ delay: 0.3, duration: 1.1, type: 'spring', stiffness: 45 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative overflow-hidden"
            >
              {/* shimmer */}
              <motion.div
                className="absolute inset-0 bg-white opacity-20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>

          {/* Tooltip — sits above bar, no overflow clip needed (parent is overflow-visible) */}
          <div
            className="absolute -top-8 bg-gray-800 text-white text-xs rounded-md px-2 py-1
                       opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                       whitespace-nowrap z-10 -translate-x-1/2"
            style={{ left: `${Math.max(Math.min(progressPercentage, 92), 8)}%` }}
          >
            {Math.round(progressPercentage)}% complete
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 block" />
          </div>
        </div>

        {/* Milestone dots — fixed height container prevents layout shift */}
        <div className="relative h-8 mt-2">
          <div className="absolute inset-x-0 top-0 flex justify-between px-0">
            {STATIC_BADGES.map((badge, i) => {
              const isUnlocked = badge.points <= currentPoints;
              const isNext     = badge.points === nextBadge.points;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center"
                  onMouseEnter={() => setHoveredBadge(badge)}
                  onMouseLeave={() => setHoveredBadge(null)}
                >
                  <motion.div
                    whileHover={{ scale: 1.4 }}
                    animate={isNext ? { scale: [1, 1.35, 1] } : {}}
                    transition={isNext ? { duration: 1.1, repeat: Infinity } : {}}
                    className={`w-2.5 h-2.5 rounded-full cursor-pointer flex-shrink-0 ${
                      isUnlocked ? 'bg-green-500' :
                      isNext     ? 'bg-blue-500'  :
                      'bg-gray-300'
                    }`}
                  />
                  {/* Point label below dot */}
                  <span className="text-gray-400 leading-none mt-0.5" style={{ fontSize: 8 }}>
                    {badge.points}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Hover Badge Detail Tooltip ──
           Fixed position inside card — uses portal-like bottom offset.
           overflow-visible on Card lets this escape the card bounds cleanly. */}
      <AnimatePresence>
        {hoveredBadge && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.94 }}
            transition={{ duration: 0.15 }}
            className="absolute left-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 z-40"
            // Position it right below the progress section — roughly 220px from top
            style={{ top: '220px' }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${
                hoveredBadge.points <= currentPoints ? hoveredBadge.bgColor : 'bg-gray-50 border-gray-200'
              }`}>
                <hoveredBadge.icon
                  size={20}
                  className={hoveredBadge.points <= currentPoints ? hoveredBadge.color : 'text-gray-300'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-gray-800 text-sm truncate">{hoveredBadge.name}</p>
                  {hoveredBadge.points <= currentPoints ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                    </motion.div>
                  ) : (
                    <span className="text-xs text-gray-400 flex-shrink-0">{hoveredBadge.points} pts</span>
                  )}
                </div>

                {hoveredBadge.points > currentPoints ? (
                  <>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((currentPoints / hoveredBadge.points) * 100, 100)}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {hoveredBadge.points - currentPoints} pts needed
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Sparkles size={11} /> Unlocked!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Badge Collection Grid ── */}
      {/* mt-16 when tooltip visible would shift things; use fixed spacing instead */}
      <div className="mt-6 pt-4 border-t border-gray-50">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Medal size={13} /> Badges
          </p>
          <span className="text-xs text-blue-500 font-semibold">
            {achievedBadges.length}/{STATIC_BADGES.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {STATIC_BADGES.map((badge, index) => {
            const isUnlocked = badge.points <= currentPoints;
            const IconComponent = badge.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ scale: 1.08, y: -3 }}
                onHoverStart={() => setHoveredBadge(badge)}
                onHoverEnd={()  => setHoveredBadge(null)}
                className="relative cursor-pointer"
              >
                <motion.div
                  className={`
                    w-full aspect-square rounded-xl flex flex-col items-center justify-center
                    gap-1 border-2 p-1.5 transition-colors duration-200
                    ${isUnlocked ? `${badge.bgColor} shadow-sm` : 'bg-gray-50 border-gray-200'}
                  `}
                  animate={isUnlocked ? {
                    boxShadow: [
                      '0 2px 4px rgba(0,0,0,0.06)',
                      '0 6px 16px rgba(0,0,0,0.10)',
                      '0 2px 4px rgba(0,0,0,0.06)',
                    ]
                  } : {}}
                  transition={{ duration: 2.5, repeat: isUnlocked ? Infinity : 0 }}
                >
                  <IconComponent
                    size={20}
                    className={isUnlocked ? badge.color : 'text-gray-300'}
                  />

                  <span className={`text-center font-semibold leading-tight ${
                    isUnlocked ? 'text-gray-700' : 'text-gray-400'
                  }`} style={{ fontSize: 9 }}>
                    {badge.name}
                  </span>
                </motion.div>

                {/* Unlocked check badge */}
                {isUnlocked && (
                  <div className="absolute -top-1.5 -right-1.5 z-10">
                    <CheckCircle size={13} className="text-green-500 bg-white rounded-full" />
                    <motion.div
                      className="absolute inset-0 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                )}

                {/* Lock overlay */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl opacity-0 hover:opacity-100 transition-opacity bg-white/60 backdrop-blur-[1px]">
                    <span className="text-gray-500 font-bold" style={{ fontSize: 9 }}>
                      {badge.points}pts
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom motivational strip ── */}
      <motion.div
        className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl text-center"
        whileHover={{ scale: 1.01 }}
      >
        <p className="text-xs text-gray-600 flex items-center justify-center gap-1.5 flex-wrap">
          <Flame size={13} className="text-orange-500" />
          <span className="font-semibold text-gray-800">
            {Math.max(nextBadge.points - currentPoints, 0)} pts needed
          </span>
          <span className="text-gray-400">for</span>
          <span className="font-bold text-blue-600">{nextBadge.name}</span>
        </p>

        {/* 5-dot progress indicator */}
        <div className="flex justify-center gap-1.5 mt-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < Math.floor(progressPercentage / 20) ? 'bg-blue-500' : 'bg-gray-200'
              }`}
              animate={i === Math.floor(progressPercentage / 20) && progressPercentage < 100 ? {
                scale:   [1, 1.6, 1],
                opacity: [1, 0.5, 1],
              } : {}}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>

    </Card>
  );
});

// ─── QuickActionCard ──────────────────────────────────
const QuickActionCard = memo(({ icon: Icon, title, description, color, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    className="bg-white rounded-xl p-4 shadow-md border border-blue-100 cursor-pointer hover:border-blue-300 transition-all"
    onClick={onClick}
  >
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md`}>
      <Icon size={20} className="text-white" />
    </div>
    <h4 className="font-semibold text-gray-800 text-sm mb-1">{title}</h4>
    <p className="text-xs text-gray-400">{description}</p>
  </motion.div>
));

// ─── ActivityItem ─────────────────────────────────────
const ActivityItem = memo(({ icon: Icon, title, time, color }) => (
  <div className="flex items-start gap-3 py-2">
    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
      <Icon size={14} className={`text-${color.split(' ')[0].replace('from-', '')}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
      <p className="text-xs text-gray-400">{time}</p>
    </div>
  </div>
));

// ─── LeaderBoard ──────────────────────────────────────
const LeaderBoard = memo(({ students }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <Trophy size={18} className="text-yellow-500" />
        <h3 className="font-semibold text-gray-800">Top Performers</h3>
      </div>
      <motion.button 
        whileHover={{ x: 3 }} 
        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        onClick={() => setActiveTab('top-rated')}
      >
        View All →
      </motion.button>
    </div>
    <div className="space-y-2">
      {students.map((student, index) => (
        <motion.div
          key={student.id}
          variants={fadeUp}
          transition={{ delay: index * 0.07 }}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/60 hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs
            ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
              index === 1 ? 'bg-slate-100 text-slate-600' :
              index === 2 ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}
          >{index + 1}</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <User size={13} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 font-medium text-sm truncate">{student.name || student.username}</p>
            <p className="text-gray-400 text-xs">{student.branch || student.department} · Sem {student.semester}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-gray-800 font-bold text-sm">{student.points?.toLocaleString()}</p>
            <p className="text-xs text-gray-400">pts</p>
          </div>
        </motion.div>
      ))}
    </div>
  </Card>
));

// ─── DashboardContent ─────────────────────────────────
const DashboardContent = memo(({ 
  showWelcome, 
  userData, 
  stats,
  leaderboardData,
  pointsGraphData,
  onQuickAction,
  recentActivity
}) => (
  <motion.div variants={stagger} animate="show" className="space-y-6">

    {/* Welcome Banner */}
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-indigo-300/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={20} className="text-yellow-300" />
                <h2 className="text-xl font-bold">Welcome back, {userData?.username || 'Student'}! 👋</h2>
              </div>
              <p className="text-blue-100 text-sm">Continue your learning journey. You have {userData?.pendingTasks || 0} pending tasks.</p>
              <div className="flex gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                  <Zap size={12} className="text-yellow-300" />
                  <span className="text-xs font-medium">{userData?.streak || 0}-day streak</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                  <Target size={12} className="text-green-300" />
                  <span className="text-xs font-medium">{Math.round((userData?.points || 0) / 3000 * 100)}% monthly goal</span>
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
      {stats.map((stat, i) => (
        <StatCard 
          key={i}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          trend={stat.trend}
          color={stat.color}
          delay={stat.delay}
        />
      ))}
    </motion.div>

    {/* Main Content Grid - Reorganized */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Points Graph and Quick Actions */}
      <div className="lg:col-span-2 space-y-6">
        <PointsBarGraph data={pointsGraphData} />
        
        {/* Quick Actions Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickActionCard
              icon={Brain}
              title="Exam Mode"
              description="AI-powered prep"
              color="from-purple-500 to-purple-600"
              onClick={() => onQuickAction('exam-mode')}
            />
            <QuickActionCard
              icon={FileText}
              title="PYQs"
              description="Previous papers"
              color="from-amber-500 to-amber-600"
              onClick={() => onQuickAction('pyqs')}
            />
            <QuickActionCard
              icon={Beaker}
              title="Lab Manuals"
              description="Practical guides"
              color="from-green-500 to-green-600"
              onClick={() => onQuickAction('lab-manuals')}
            />
            <QuickActionCard
              icon={BookOpen}
              title="Viva Resources"
              description="Q&A preparation"
              color="from-red-500 to-red-600"
              onClick={() => onQuickAction('viva')}
            />
          </div>
        </Card>
      </div>

      {/* Right Column - Achievement and Leaderboard */}
      <div className="space-y-6">
        <AchievementCard userData={userData} />
        <LeaderBoard students={leaderboardData} />
      </div>
    </div>

    {/* Recent Activity Section */}
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={19} className="text-blue-600" />
          <h3 className="font-semibold text-gray-800">Recent Activity</h3>
        </div>
        <motion.button whileHover={{ x: 4 }} className="text-blue-600 text-sm hover:text-blue-700 font-medium">
          View All →
        </motion.button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentActivity.map((activity, i) => (
          <ActivityItem key={i} {...activity} />
        ))}
      </div>
    </Card>

    {/* Featured Resources Section */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <BookOpen size={16} className="text-white" />
          </div>
          <h4 className="font-semibold text-gray-800">Study Materials</h4>
        </div>
        <p className="text-sm text-gray-600 mb-3">Access comprehensive notes and resources</p>
        <motion.button 
          whileHover={{ x: 4 }}
          className="text-blue-600 text-sm font-medium flex items-center gap-1"
          onClick={() => onQuickAction('notes')}
        >
          Browse Notes <ChevronRight size={14} />
        </motion.button>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-500 rounded-lg">
            <Trophy size={16} className="text-white" />
          </div>
          <h4 className="font-semibold text-gray-800">Top Rated</h4>
        </div>
        <p className="text-sm text-gray-600 mb-3">See who's leading the leaderboard</p>
        <motion.button 
          whileHover={{ x: 4 }}
          className="text-amber-600 text-sm font-medium flex items-center gap-1"
          onClick={() => onQuickAction('top-rated')}
        >
          View Rankings <ChevronRight size={14} />
        </motion.button>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Target size={16} className="text-white" />
          </div>
          <h4 className="font-semibold text-gray-800">Settings</h4>
        </div>
        <p className="text-sm text-gray-600 mb-3">Customize your learning experience</p>
        <motion.button 
          whileHover={{ x: 4 }}
          className="text-purple-600 text-sm font-medium flex items-center gap-1"
          onClick={() => onQuickAction('settings')}
        >
          Configure <ChevronRight size={14} />
        </motion.button>
      </Card>
    </div>
  </motion.div>
));

// ─── Page title map ───────────────────────────────────
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  notes: 'My Notes',
  'best-notes': 'Best Notes',
  pyqs: 'PYQs',
  'lab-manuals': 'Lab Manual',
  viva: 'Viva Resources',
  'exam-mode': 'Exam Mode',
  'top-rated': 'Top Rated Students',
  saved: 'Saved Notes',
  settings: 'Settings',
};

// ─── Main StudentDashboard Component ──────────────────
const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [userData, setUserData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [pointsGraphData, setPointsGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Mock recent activity data
  const recentActivity = useMemo(() => [
    { icon: CheckCircle, title: 'Completed Python Quiz', time: '2 hours ago', color: 'from-green-500 to-green-600' },
    { icon: BookOpen, title: 'Viewed Data Structures', time: '5 hours ago', color: 'from-blue-500 to-blue-600' },
    { icon: Award, title: 'Earned "Quick Learner" Badge', time: 'Yesterday', color: 'from-yellow-500 to-yellow-600' },
    { icon: Users, title: 'Joined Study Group', time: '2 days ago', color: 'from-purple-500 to-purple-600' },
  ], []);

  // Fetch current user data
  useEffect(() => {
  let unsubscribeUser = null;

  const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
    if (user) {
      setCurrentUser(user);

      // ✅ Real-time listener instead of one-time getDoc
      unsubscribeUser = onSnapshot(
        doc(db, 'users', user.uid),
        (docSnap) => {
          if (docSnap.exists()) {
            setUserData({
              uid: user.uid,
              ...docSnap.data()
            });
          }
        },
        (error) => {
          console.error('Error listening to user data:', error);
        }
      );

      // Fetch leaderboard data once (or also make real-time if needed)
      await fetchDashboardData(user.uid);
    }
    setLoading(false);
  });

  const timer = setTimeout(() => setShowWelcome(false), 4500);

  return () => {
    unsubscribeAuth();
    unsubscribeUser?.();   // ✅ Clean up the user listener too
    clearTimeout(timer);
  };
}, []);

  // Fetch all dashboard data
// Fetch all dashboard data
useEffect(() => {
  let unsubscribeUser = null;
  let unsubscribeLeaderboard = null;

  const unsubscribeAuth = auth.onAuthStateChanged((user) => {
    if (user) {
      setCurrentUser(user);

      // ✅ Real-time user data
      unsubscribeUser = onSnapshot(
        doc(db, 'users', user.uid),
        (docSnap) => {
          if (docSnap.exists()) {
            setUserData({
              uid: user.uid,
              ...docSnap.data()
            });
          }
        },
        (error) => {
          console.error('Error listening to user data:', error);
        }
      );

      // ✅ REAL-TIME LEADERBOARD
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('points', 'desc'),
        limit(15)
      );

      unsubscribeLeaderboard = onSnapshot(
        usersQuery,
        (snapshot) => {
          const usersList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Top 5 for side leaderboard
          setLeaderboardData(usersList.slice(0, 5));

          // All 15 for graph
          setPointsGraphData(usersList);
        },
        (error) => {
          console.error('Error listening to leaderboard:', error);
        }
      );
    }

    setLoading(false);
  });

  const timer = setTimeout(() => setShowWelcome(false), 4500);

  return () => {
    unsubscribeAuth();
    unsubscribeUser?.();
    unsubscribeLeaderboard?.();   // 🔥 IMPORTANT
    clearTimeout(timer);
  };
}, []);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  // Handle quick action navigation
  const handleQuickAction = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Calculate stats
  const stats = useMemo(() => [
    { 
      icon: BookOpen, 
      label: 'Total Notes', 
      value: userData?.notesCount?.toString() || '24', 
      trend: 12, 
      color: 'from-blue-500 to-blue-600', 
      delay: 0 
    },
    { 
      icon: Star, 
      label: 'Resources Saved', 
      value: userData?.savedNotes?.length?.toString() || '18', 
      trend: 8, 
      color: 'from-amber-500 to-amber-600', 
      delay: 0.05 
    },
    { 
      icon: Award, 
      label: 'Badges Earned', 
      value: userData?.badges?.length?.toString() || '7', 
      trend: 15, 
      color: 'from-purple-500 to-purple-600', 
      delay: 0.1 
    },
    { 
      icon: Flame, 
      label: 'Current Streak', 
      value: `${userData?.streak || 12} days`, 
      trend: 5, 
      color: 'from-orange-500 to-orange-600', 
      delay: 0.15 
    },
  ], [userData]);

  const pageTitle = PAGE_TITLES[activeTab] || activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  // Render content based on active tab
  const renderContent = useCallback(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardContent
            showWelcome={showWelcome}
            userData={userData}
            stats={stats}
            leaderboardData={leaderboardData}
            pointsGraphData={pointsGraphData}
            onQuickAction={handleQuickAction}
            recentActivity={recentActivity}
          />
        );
      case 'notes':
        return <MyNotes userId={currentUser?.uid} />;
      case 'best-notes':
        return <BestNotes />;
      case 'pyqs':
        return <PYQs />;
      case 'lab-manuals':
        return <LabManual />;
      case 'viva':
        return <VivaResources />;
      case 'exam-mode':
        return <ExamMode userId={currentUser?.uid} />;
      case 'top-rated':
        return <TopRated leaderboardData={leaderboardData} />;
      case 'saved':
        return <Saved />;
      case 'settings':
        return <Settings userData={userData} onSignOut={handleSignOut} />;
      default:
        return (
          <Card className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3">{pageTitle}</h2>
            <p className="text-gray-400">Content coming soon…</p>
          </Card>
        );
    }
  }, [activeTab, loading, showWelcome, userData, stats, leaderboardData, pointsGraphData, 
      recentActivity, handleQuickAction, currentUser, pageTitle, handleSignOut]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/60 to-slate-50 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onSignOut={handleSignOut}
        userPoints={userData?.points}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">

          {/* Top Bar */}
          <motion.div
  initial={{ opacity: 0, y: -16 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex items-center justify-between mb-7 bg-gradient-to-r from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 px-6 py-4 gap-4 flex-wrap backdrop-blur-sm"
>
  <div className="flex items-center gap-3">
    {/* Animated icon based on active tab */}
    <motion.div 
      whileHover={{ rotate: 10, scale: 1.1 }}
      className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md"
    >
      {activeTab === 'dashboard' ? (
        <Sparkles size={18} className="text-white" />
      ) : activeTab === 'notes' ? (
        <BookOpen size={18} className="text-white" />
      ) : activeTab === 'pyqs' ? (
        <FileText size={18} className="text-white" />
      ) : (
        <Target size={18} className="text-white" />
      )}
    </motion.div>
    
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        {pageTitle}
      </h1>
      <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-blue-500" />
        {activeTab === 'dashboard' ? 'Welcome back — keep the momentum going 🚀' : `Manage your ${pageTitle.toLowerCase()}`}
      </p>
    </div>
  </div>
  
  <div className="flex items-center gap-3">
    {/* Enhanced search bar */}
    <div className="relative hidden md:block group">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
      <input
        type="text"
        placeholder="Search notes, PYQs…"
        className="bg-white border border-blue-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all w-64"
      />
      {/* Quick search hint */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 opacity-0 group-focus-within:opacity-100 transition-opacity">
        ⌘K
      </div>
    </div>

    {/* Notification button with real-time indicator */}
    <motion.button 
      whileHover={{ scale: 1.08 }} 
      whileTap={{ scale: 0.95 }}
      className="relative p-2.5 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-sm"
    >
      <Bell size={18} className="text-gray-600" />
      {userData?.notifications?.length > 0 && (
        <>
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-white"
          />
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full opacity-50"
          />
        </>
      )}
    </motion.button>

    {/* User profile with real-time points */}
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 bg-white rounded-xl border border-blue-100 pl-2 pr-4 py-1.5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
          <User size={16} className="text-white" />
        </div>
        {/* Online indicator */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"
        />
      </div>
      
      <div className="text-sm hidden sm:block">
  <p className="font-semibold text-gray-800 leading-none flex items-center gap-1">
    {userData?.username || 'Student'}
  </p>
  
  {/* Static points display - no animation */}
  <div className="flex items-center gap-1.5 mt-1">
    <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
      <Sparkles size={10} className="text-blue-500" />
      <span className="text-xs font-semibold text-blue-600">
        {userData?.points?.toLocaleString() || 0}
      </span>
    </div>
    <span className="text-[12px] text-gray-400">pts</span>
  </div>
</div>
      
      {/* Small indicator for mobile */}
      <div className="block sm:hidden">
        <div className="w-2 h-2 bg-blue-500 rounded-full" />
      </div>
    </motion.div>

    {/* Quick actions menu (optional) */}
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="p-2.5 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-sm md:hidden"
    >
      <Search size={18} className="text-gray-600" />
    </motion.button>
  </div>

  {/* Points update toast (appears when points increase) */}
  <AnimatePresence>
    {userData?.lastPointsGained > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20, x: '-50%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full px-4 py-2 shadow-lg flex items-center gap-2"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Sparkles size={12} />
        </motion.div>
        <span>+{userData.lastPointsGained} points earned!</span>
      </motion.div>
    )}
  </AnimatePresence>
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