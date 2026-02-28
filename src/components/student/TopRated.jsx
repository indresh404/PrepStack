// src/components/student/TopRated.jsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Star, Crown, Medal, TrendingUp, Upload, Award, User } from 'lucide-react';

const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const STUDENTS = [
  { rank:1,  name:'Alex Johnson',   dept:'CS',   sem:6, pts:2450, uploads:23, badge:'🥇', streak:15, color:'from-yellow-400 to-amber-500'  },
  { rank:2,  name:'Sarah Williams', dept:'IT',   sem:6, pts:2320, uploads:19, badge:'🥈', streak:12, color:'from-slate-400 to-slate-500'   },
  { rank:3,  name:'Mike Chen',      dept:'CS',   sem:8, pts:2180, uploads:17, badge:'🥉', streak:10, color:'from-amber-500 to-orange-500'  },
  { rank:4,  name:'Emma Davis',     dept:'EXTC', sem:6, pts:2050, uploads:15, badge:null,  streak:8,  color:'from-blue-500 to-blue-600'     },
  { rank:5,  name:'James Wilson',   dept:'CS',   sem:4, pts:1980, uploads:13, badge:null,  streak:7,  color:'from-indigo-500 to-indigo-600' },
  { rank:6,  name:'Lisa Park',      dept:'IT',   sem:5, pts:1850, uploads:11, badge:null,  streak:5,  color:'from-violet-500 to-violet-600' },
  { rank:7,  name:'David Kumar',    dept:'CS',   sem:6, pts:1720, uploads:10, badge:null,  streak:4,  color:'from-cyan-500 to-cyan-600'     },
];

const rankIcon = (r) =>
  r === 1 ? <Crown size={14} className="text-yellow-600"/> :
  r === 2 ? <Medal size={14} className="text-slate-500"/> :
  r === 3 ? <Medal size={14} className="text-amber-600"/> : r;

const rankBg = (r) =>
  r === 1 ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
  r === 2 ? 'bg-slate-50  border-slate-300  text-slate-600' :
  r === 3 ? 'bg-amber-50  border-amber-300  text-amber-700' :
            'bg-blue-50   border-blue-200   text-blue-600';

const StudentCard = memo(({ student }) => (
  <motion.div variants={fadeUp}
    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(59,130,246,0.12)', transition: { type:'spring', stiffness:300, damping:20 } }}
    className="bg-white rounded-2xl border border-blue-100 p-5 relative overflow-hidden group">
    {student.rank <= 3 && <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${student.color}`} />}

    <div className="flex items-start gap-4 mb-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 flex-shrink-0 ${rankBg(student.rank)}`}>
        {rankIcon(student.rank)}
      </div>
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${student.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
        <User size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-gray-800 text-sm">{student.name}</h4>
          {student.badge && <span className="text-base">{student.badge}</span>}
        </div>
        <p className="text-xs text-gray-400">{student.dept} · Sem {student.sem}</p>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 mb-4">
      {[
        { label:'Points',   value: student.pts.toLocaleString(), icon:<Star size={11}/>,      color:'text-amber-500' },
        { label:'Uploads',  value: student.uploads,              icon:<Upload size={11}/>,     color:'text-blue-500'  },
        { label:'Streak',   value: `${student.streak}d`,         icon:<TrendingUp size={11}/>, color:'text-emerald-500' },
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
));

const TopRated = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
    <motion.div variants={fadeUp} className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1"><Crown size={20}/><h2 className="text-2xl font-bold">Top Rated Students</h2></div>
          <p className="text-amber-100 text-sm">Ranked by total contribution points</p>
        </div>
        <div className="text-5xl select-none">🏅</div>
      </div>
    </motion.div>

    <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {STUDENTS.map(s => <StudentCard key={s.rank} student={s}/>)}
    </motion.div>
  </motion.div>
);

export default TopRated;