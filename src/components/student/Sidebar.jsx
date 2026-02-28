import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';

// Import your logo from assets
import logoImg from '../../assets/logo.png'; 

import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Beaker,
  MessageSquare,
  Star,
  Award,
  Brain,
  LogOut,
  ChevronLeft,
  User,
  Bookmark,
  TrendingUp,
  Settings
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userData, setUserData] = useState(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user?.uid) return;

    // Real-time listener for user data from Firebase
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setUserData(data);
          setPoints(data.points || 0);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user?.uid]);

  const menuItems = [
    { id: 'dashboard',      label: 'Dashboard',           icon: LayoutDashboard },
    { id: 'notes',          label: 'My Notes',            icon: BookOpen        },
    { id: 'best-notes',     label: 'Best Notes',          icon: Award, special: true },
    { id: 'pyqs',           label: 'PYQs',                icon: FileText        },
    { id: 'lab-manuals',    label: 'Lab Manual',          icon: Beaker          },
    { id: 'viva',           label: 'Viva Resources',     icon: MessageSquare   },
    { id: 'exam-mode',      label: 'Exam Mode',           icon: Brain, highlight: true },
    { id: 'top-rated',      label: 'Top Rated Students', icon: Star             },
    { id: 'saved',          label: 'Saved Notes',         icon: Bookmark        },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Calculate next badge progress (example: next badge at 500 points)
  const nextBadgePoints = 500;
  const progress = Math.min((points % nextBadgePoints) / nextBadgePoints * 100, 100);
  const pointsToNextBadge = nextBadgePoints - (points % nextBadgePoints);

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <motion.div
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="h-screen bg-gradient-to-b from-gray-900 to-gray-950 shadow-2xl relative flex flex-col z-50 overflow-x-hidden border-r border-gray-800 flex-shrink-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />

        {/* Logo / toggle */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="h-20 flex items-center px-3 border-b border-gray-800 relative flex-shrink-0 cursor-pointer group"
        >
          <div className={`flex items-center gap-3 min-w-max ${collapsed ? 'w-full justify-center' : ''}`}>
            <motion.div
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-slate-950 rounded-xl shadow-lg border border-gray-800 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500/50 transition-all overflow-hidden"
            >
              <img 
                src={logoImg} 
                alt="PrepStack Logo" 
                className="w-8 h-8 object-contain"
              />
            </motion.div>

            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="whitespace-nowrap"
                >
                  <span className="text-white font-bold text-xl tracking-tight">PrepStack</span>
                  <span className="text-blue-400 text-[11px] block">Just The Best Notes.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-4 text-gray-500 group-hover:text-blue-400 transition-colors"
            >
              <ChevronLeft size={16} />
            </motion.div>
          )}
        </div>

        {/* User profile */}
        <div className="px-4 py-5 border-b border-gray-800 flex-shrink-0">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4'}`}>
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <User size={22} className="text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
            </div>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="overflow-hidden"
                >
                  <h3 className="text-white font-semibold text-sm truncate">
                    {userData?.username || user?.username || 'User'}
                  </h3>
                  <p className="text-blue-400 text-xs font-medium">
                    {userData?.branch ? userData.branch.replace('_', ' ') : 'Student'} 
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <TrendingUp size={11} className="text-green-400" />
                    <span className="text-xs text-gray-400">
                      {loading ? '...' : `${points} pts`}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/20"
              >
                <div className="flex items-center justify-between text-white mb-2">
                  <span className="text-xs opacity-80">Total Points</span>
                  <span className="font-bold text-sm">
                    {loading ? '...' : points}
                  </span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
                <p className="text-white/50 text-[10px] mt-1.5">
                  Next badge in {pointsToNextBadge} pts
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-0.5 scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive  = activeTab === item.id;
            const isHovered = hoveredItem === item.id;

            return (
              <button
                key={item.id}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => setActiveTab(item.id)}
                className={`w-full group relative flex items-center h-11 rounded-xl transition-all duration-200 ${
                  collapsed ? 'justify-center px-0' : 'px-4 gap-3'
                }`}
              >
                {(isActive || isHovered) && (
                  <motion.div
                    layoutId={isActive ? 'activeTab' : undefined}
                    className={`absolute inset-0 rounded-xl ${
                      isActive
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'bg-gray-800/50'
                    }`}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                )}
                <div className={`relative z-10 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                  isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  <Icon size={20} />
                </div>
                {!collapsed && (
                  <span className={`relative z-10 text-sm font-medium flex-1 text-left whitespace-nowrap truncate transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                  }`}>
                    {item.label}
                  </span>
                )}
                {!collapsed && (
                  <div className="relative z-10 flex gap-1 flex-shrink-0">
                    {item.highlight && (
                      <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold shadow-lg shadow-blue-500/30">
                        AI
                      </span>
                    )}
                    {item.special && (
                      <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold shadow-lg shadow-amber-500/30">
                        TOP
                      </span>
                    )}
                  </div>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-gray-700">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800 flex-shrink-0 space-y-0.5">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center' : 'px-4 gap-3'
            } h-11 text-gray-500 hover:text-blue-400 hover:bg-gray-800/60 rounded-xl transition-all overflow-hidden group`}
          >
            <Settings size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">Settings</span>}
          </button>
          <button 
            onClick={handleSignOut}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'px-4 gap-3'} h-11 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all overflow-hidden group`}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;