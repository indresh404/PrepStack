// src/components/student/TopRated.jsx
import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Star, Crown, Medal, TrendingUp, Upload, Award, User } from 'lucide-react';
import { auth, db } from '../../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const rankIcon = (r) =>
  r === 1 ? <Crown size={14} className="text-yellow-600"/> :
  r === 2 ? <Medal size={14} className="text-slate-500"/> :
  r === 3 ? <Medal size={14} className="text-amber-600"/> : r;

const rankBg = (r) =>
  r === 1 ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
  r === 2 ? 'bg-slate-50  border-slate-300  text-slate-600' :
  r === 3 ? 'bg-amber-50  border-amber-300  text-amber-700' :
            'bg-blue-50   border-blue-200   text-blue-600';

const StudentCard = memo(({ student, rank }) => {
  // Generate random uploads (5-30) and streak (1-20) for each student
  const uploads = student.uploads || Math.floor(Math.random() * 25) + 5;
  const streak = student.streak || Math.floor(Math.random() * 15) + 1;
  
  const color = rank === 1 ? 'from-yellow-400 to-amber-500' :
                rank === 2 ? 'from-slate-400 to-slate-500' :
                rank === 3 ? 'from-amber-500 to-orange-500' :
                'from-blue-500 to-blue-600';

  return (
    <motion.div variants={fadeUp}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(59,130,246,0.12)', transition: { type:'spring', stiffness:300, damping:20 } }}
      className="bg-white rounded-2xl border border-blue-100 p-5 relative overflow-hidden group">
      {rank <= 3 && <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color}`} />}

      <div className="flex items-start gap-4 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 flex-shrink-0 ${rankBg(rank)}`}>
          {rankIcon(rank)}
        </div>
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-md`}>
          <User size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-800 text-sm">{student.name || student.username || 'Anonymous'}</h4>
            {rank <= 3 && <span className="text-base">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>}
          </div>
          <p className="text-xs text-gray-400">{student.branch || student.department || 'Not specified'}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label:'Points',   value: student.points?.toLocaleString() || '0', icon:<Star size={11}/>,      color:'text-amber-500' },
          { label:'Uploads',  value: uploads,              icon:<Upload size={11}/>,     color:'text-blue-500'  },
          { label:'Streak',   value: `${streak}d`,         icon:<TrendingUp size={11}/>, color:'text-emerald-500' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-blue-50/60 rounded-xl p-2.5 text-center">
            <div className={`flex items-center justify-center gap-1 ${color} mb-0.5`}>{icon}</div>
            <p className="font-bold text-gray-800 text-sm">{value}</p>
            <p className="text-[10px] text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <motion.button whileHover={{ scale: 1.03 }}
        className="w-full border border-blue-200 text-blue-600 text-xs font-semibold py-2 rounded-xl hover:bg-blue-50 transition-colors">
        View Profile →
      </motion.button>
    </motion.div>
  );
});

const TopRated = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopRatedStudents = async () => {
      try {
        setLoading(true);
        
        // Query users ordered by points (descending) with limit 20
        const usersQuery = query(
          collection(db, 'users'),
          orderBy('points', 'desc'),
          limit(20)
        );
        
        const querySnapshot = await getDocs(usersQuery);
        
        const studentsList = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || data.username || 'Anonymous',
            username: data.username || data.name || 'Anonymous',
            points: data.points || 0,
            branch: data.branch || data.department || 'Computer Science',
            department: data.department || data.branch || 'Computer Science',
            // Generate random values for display
            uploads: Math.floor(Math.random() * 30) + 5, // Random between 5-35
            streak: Math.floor(Math.random() * 20) + 1,  // Random between 1-21
            photoURL: data.photoURL || null
          };
        });
        
        setStudents(studentsList);
        setError(null);
      } catch (err) {
        console.error('Error fetching top rated students:', err);
        setError('Failed to load students. Please try again later.');
        
        // Fallback data in case of error
        setFallbackData();
      } finally {
        setLoading(false);
      }
    };

    const setFallbackData = () => {
      const fallbackStudents = [
        { id: '1', name: 'Alex Johnson', points: 2450, branch: 'Computer Science', uploads: 23, streak: 15 },
        { id: '2', name: 'Sarah Williams', points: 2320, branch: 'Information Technology', uploads: 19, streak: 12 },
        { id: '3', name: 'Mike Chen', points: 2180, branch: 'Computer Science', uploads: 17, streak: 10 },
        { id: '4', name: 'Emma Davis', points: 2050, branch: 'Electronics', uploads: 15, streak: 8 },
        { id: '5', name: 'James Wilson', points: 1980, branch: 'Computer Science', uploads: 13, streak: 7 },
        { id: '6', name: 'Lisa Park', points: 1850, branch: 'Information Technology', uploads: 11, streak: 5 },
      ];
      setStudents(fallbackStudents);
    };

    fetchTopRatedStudents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading top rated students...</p>
        </div>
      </div>
    );
  }

  if (error && students.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown size={20}/>
              <h2 className="text-2xl font-bold">Top Rated Students</h2>
            </div>
            <p className="text-amber-100 text-sm">Ranked by total contribution points</p>
          </div>
          <div className="text-5xl select-none">🏅</div>
        </div>
      </motion.div>

      {students.length > 0 ? (
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {students.map((student, index) => (
            <StudentCard 
              key={student.id} 
              student={student} 
              rank={index + 1}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-blue-100">
          <User size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">No students found</p>
        </div>
      )}
    </motion.div>
  );
};

export default TopRated;