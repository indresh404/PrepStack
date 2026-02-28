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
      style={{ width: 150, height: 150 }}
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

// ─── PointsBarGraph ───────────────────────────────────
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
          const barColor = index === 0 ? 'from-yellow-400 to-yellow-500' :
                          index === 1 ? 'from-slate-400 to-slate-500' :
                          index === 2 ? 'from-amber-500 to-amber-600' :
                          'from-blue-500 to-blue-600';
          
          const rankBg = index === 0 ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                        index === 1 ? 'bg-slate-50 text-slate-600 border-slate-200' :
                        index === 2 ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-blue-50 text-blue-600 border-blue-200';

          return (
            <motion.div
              key={student.id || student.name}
              variants={fadeUp}
              transition={{ delay: index * 0.06 }}
              className="flex items-center gap-3"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 ${rankBg}`}>
                {index === 0 ? <Crown size={11} /> : 
                 index === 1 ? <Medal size={11} /> : 
                 index === 2 ? <Medal size={11} /> : index + 1}
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <User size={13} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {student.name || student.username || 'Anonymous'}
                  </span>
                  <span className="text-sm font-bold text-blue-600 ml-2 flex-shrink-0">
                    {student.points?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(student.points / maxPoints) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.9 }}
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

// ─── AchievementCard ──────────────────────────────────
const AchievementCard = memo(({ userData }) => (
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
      <h4 className="text-3xl font-bold text-gray-800">{userData?.points?.toLocaleString() || 0}</h4>
      <p className="text-gray-400 text-sm mt-0.5">Total Points</p>
    </div>

    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-500">This Week</span>
          <span className="text-gray-800 font-bold">{userData?.weeklyPoints || 0} pts</span>
        </div>
        <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((userData?.weeklyPoints || 0) / 1000) * 100}%` }}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-500">Monthly Goal</span>
          <span className="text-gray-800 font-bold">{userData?.points || 0} / 3,000</span>
        </div>
        <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((userData?.points || 0) / 3000) * 100}%` }}
            transition={{ delay: 0.7, duration: 1 }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
          />
        </div>
      </div>
    </div>

    <div className="mt-5">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Recent Badges</p>
      <div className="flex gap-2">
        {userData?.badges?.slice(0, 3).map((badge, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.15, rotate: 8 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${badge.bgColor || 'bg-yellow-50 border-yellow-200'} shadow-sm cursor-pointer`}
            title={badge.name}
          >
            {badge.icon === 'award' && <Award size={15} className={badge.color || 'text-yellow-500'} />}
            {badge.icon === 'star' && <Star size={15} className={badge.color || 'text-blue-500'} />}
            {badge.icon === 'zap' && <Zap size={15} className={badge.color || 'text-purple-500'} />}
          </motion.div>
        ))}
        {((userData?.badges?.length || 0) < 3) && (
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-blue-200 flex items-center justify-center text-blue-300 text-xs font-bold">
            +{3 - (userData?.badges?.length || 0)}
          </div>
        )}
      </div>
    </div>
  </Card>
));

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
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

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
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData({
            uid: user.uid,
            ...userDoc.data()
          });
        }
        
        // Fetch all dashboard data
        await fetchDashboardData(user.uid);
      }
      setLoading(false);
    });

    // Auto-hide welcome banner
    const timer = setTimeout(() => setShowWelcome(false), 4500);
    
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = async (uid) => {
    try {
      // Fetch leaderboard (top 10 users by points)
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('points', 'desc'),
        limit(10)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaderboardData(usersList.slice(0, 5));
      setPointsGraphData(usersList.slice(0, 7));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

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
            className="flex items-center justify-between mb-7 bg-white rounded-2xl shadow-lg border border-blue-100 px-5 py-3.5 gap-4 flex-wrap"
          >
            <div>
              <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>
              <p className="text-gray-400 text-xs mt-0.5">
                {activeTab === 'dashboard' ? 'Welcome back — keep the momentum going 🚀' : `Manage your ${pageTitle.toLowerCase()}`}
              </p>
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
                {userData?.notifications?.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white" />
                )}
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.04 }}
                className="flex items-center gap-2.5 bg-blue-50 rounded-xl border border-blue-100 px-3 py-2 cursor-pointer hover:border-blue-300 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <User size={14} className="text-white" />
                </div>
                <div className="text-sm hidden sm:block">
                  <p className="font-semibold text-gray-800 leading-none">{userData?.username || 'Student'}</p>
                  <p className="text-xs text-blue-500 font-medium mt-0.5">{userData?.points?.toLocaleString() || 0} pts</p>
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