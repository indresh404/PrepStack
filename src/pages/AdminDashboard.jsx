// src/pages/AdminDashboard.jsx
import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, BookOpen, Search,
  LogOut, Bell, ChevronDown, Trash2, CheckCircle, XCircle,
  Filter, Star, Download, ThumbsUp, Award, BarChart2,
  Shield, Settings, Menu, X, AlertTriangle, Clock, GraduationCap,
  Layers, ChevronRight, RefreshCw, ArrowUpRight, Flame, Crown,
  Medal, BadgeCheck, Sparkles, BookMarked,
  FileCheck, FileClock, FileX
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const BRANCHES  = ['All Branches', 'Computer Science', 'Information Technology', 'EXTC', 'Mechanical', 'Civil'];
const SEMESTERS = ['All Sems', 'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
const SUBJECTS_MAP = {
  'Computer Science':       ['All Subjects', 'DBMS', 'Operating Systems', 'Data Structures', 'Computer Networks', 'Software Engineering'],
  'Information Technology': ['All Subjects', 'Web Technology', 'DBMS', 'Computer Networks', 'Cloud Computing'],
  'EXTC':                   ['All Subjects', 'Digital Electronics', 'Signal Processing', 'VLSI Design', 'Microprocessors'],
  'Mechanical':             ['All Subjects', 'Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing'],
  'Civil':                  ['All Subjects', 'Structural Analysis', 'Geotechnical Engineering', 'Hydraulics'],
  'All Branches':           ['All Subjects'],
};
const NOTE_TYPES = ['All Types', 'Notes', 'PYQ', 'Lab Manual', 'Viva'];

const INITIAL_NOTES = [
  { id: 1,  title: 'Complete DBMS Guide – Normalization to Transactions', author: 'Rohan Mehta',   avatar: 'RM', branch: 'Computer Science',       sem: 'Sem 6', subject: 'DBMS',                 type: 'Notes',      upvotes: 234, downloads: 1245, status: 'approved', adminUpvoted: true,  adminVerified: true,  date: '2025-01-10', size: '4.2 MB', preview: 'Covers 1NF through BCNF with solved examples, ER diagrams, and transaction management with ACID properties and concurrency control.' },
  { id: 2,  title: 'OS Previous Year Papers 2019–2024',                  author: 'Priya Sharma',  avatar: 'PS', branch: 'Computer Science',       sem: 'Sem 6', subject: 'Operating Systems',    type: 'PYQ',        upvotes: 189, downloads: 987,  status: 'approved', adminUpvoted: false, adminVerified: false, date: '2025-01-08', size: '2.8 MB', preview: 'Compiled question papers from 2019 to 2024 with solutions for process scheduling, memory management, and file systems.' },
  { id: 3,  title: 'DBMS Lab Manual with Queries',                       author: 'Amit Joshi',    avatar: 'AJ', branch: 'Computer Science',       sem: 'Sem 5', subject: 'DBMS',                 type: 'Lab Manual', upvotes: 156, downloads: 876,  status: 'pending',  adminUpvoted: false, adminVerified: false, date: '2025-01-14', size: '3.1 MB', preview: 'Complete lab manual with 20 experiments covering DDL, DML, DCL commands with Oracle SQL queries and output screenshots.' },
  { id: 4,  title: 'DSA Graph Algorithms Detailed Notes',                author: 'Sara Khan',     avatar: 'SK', branch: 'Computer Science',       sem: 'Sem 4', subject: 'Data Structures',      type: 'Notes',      upvotes: 98,  downloads: 543,  status: 'approved', adminUpvoted: false, adminVerified: false, date: '2025-01-05', size: '1.9 MB', preview: 'BFS, DFS, Dijkstra, Floyd-Warshall, Bellman-Ford with complexity analysis, pseudocode, and animated walkthrough examples.' },
  { id: 5,  title: 'CN Important Questions Bank',                        author: 'Dev Patel',     avatar: 'DP', branch: 'Computer Science',       sem: 'Sem 6', subject: 'Computer Networks',    type: 'PYQ',        upvotes: 76,  downloads: 432,  status: 'rejected', adminUpvoted: false, adminVerified: false, date: '2025-01-12', size: '1.2 MB', preview: 'Question bank covering OSI model, TCP/IP stack, routing protocols, subnetting, and network security fundamentals.' },
  { id: 6,  title: 'Web Tech Full Stack Notes',                          author: 'Neha Verma',    avatar: 'NV', branch: 'Information Technology', sem: 'Sem 5', subject: 'Web Technology',       type: 'Notes',      upvotes: 201, downloads: 1102, status: 'approved', adminUpvoted: true,  adminVerified: true,  date: '2025-01-07', size: '5.4 MB', preview: 'HTML5, CSS3, JavaScript ES6+, React fundamentals, Node.js REST APIs, and MongoDB integration with deployment guide.' },
  { id: 7,  title: 'Cloud Computing Lab Experiments',                    author: 'Karan Gupta',   avatar: 'KG', branch: 'Information Technology', sem: 'Sem 7', subject: 'Cloud Computing',      type: 'Lab Manual', upvotes: 88,  downloads: 321,  status: 'pending',  adminUpvoted: false, adminVerified: false, date: '2025-01-15', size: '2.3 MB', preview: 'AWS, Azure, GCP hands-on labs with deployment guides for EC2, S3, Lambda functions, and containerization using Docker.' },
  { id: 8,  title: 'Digital Electronics PYQs 2020–2024',                 author: 'Ananya Desai',  avatar: 'AD', branch: 'EXTC',                   sem: 'Sem 4', subject: 'Digital Electronics',  type: 'PYQ',        upvotes: 143, downloads: 678,  status: 'approved', adminUpvoted: false, adminVerified: false, date: '2025-01-06', size: '3.7 MB', preview: 'Previous year papers with solutions covering logic gates, flip-flops, counters, registers, and ADC/DAC circuits.' },
  { id: 9,  title: 'Signal Processing Viva Questions',                   author: 'Vikas Rao',     avatar: 'VR', branch: 'EXTC',                   sem: 'Sem 6', subject: 'Signal Processing',    type: 'Viva',       upvotes: 67,  downloads: 289,  status: 'pending',  adminUpvoted: false, adminVerified: false, date: '2025-01-13', size: '0.9 MB', preview: 'Comprehensive viva questions on Fourier transforms, Laplace, Z-transform with expected answers and common mistakes to avoid.' },
  { id: 10, title: 'Thermodynamics Formula Sheet',                       author: 'Ritu Singh',    avatar: 'RS', branch: 'Mechanical',             sem: 'Sem 3', subject: 'Thermodynamics',       type: 'Notes',      upvotes: 112, downloads: 567,  status: 'approved', adminUpvoted: false, adminVerified: false, date: '2025-01-09', size: '1.4 MB', preview: 'All thermodynamic laws, Carnot cycle, entropy formulas, and psychrometric chart usage with solved numerical examples.' },
  { id: 11, title: 'Software Engineering Case Studies',                  author: 'Mohit Tiwari',  avatar: 'MT', branch: 'Computer Science',       sem: 'Sem 7', subject: 'Software Engineering', type: 'Notes',      upvotes: 55,  downloads: 203,  status: 'pending',  adminUpvoted: false, adminVerified: false, date: '2025-01-16', size: '2.0 MB', preview: 'Real-world SE case studies covering SDLC models, Agile, Scrum, and project management tools with industry examples.' },
  { id: 12, title: 'Computer Networks Lab Manual',                       author: 'Ishita Bose',   avatar: 'IB', branch: 'Computer Science',       sem: 'Sem 6', subject: 'Computer Networks',    type: 'Lab Manual', upvotes: 134, downloads: 712,  status: 'approved', adminUpvoted: true,  adminVerified: true,  date: '2025-01-04', size: '3.5 MB', preview: 'Socket programming, Wireshark analysis, subnetting exercises, and VLAN configuration with complete output screenshots.' },
];

const TOP_CONTRIBUTORS = [
  { name: 'Rohan Mehta',  notes: 48, downloads: 12450, icon: Crown,  color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200', avatar: 'RM' },
  { name: 'Neha Verma',   notes: 36, downloads: 9870,  icon: Medal,  color: 'text-slate-500',  bg: 'bg-slate-50 border-slate-200',   avatar: 'NV' },
  { name: 'Priya Sharma', notes: 29, downloads: 7430,  icon: Medal,  color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',   avatar: 'PS' },
  { name: 'Ishita Bose',  notes: 24, downloads: 6210,  icon: Star,   color: 'text-blue-500',   bg: 'bg-blue-50 border-blue-200',     avatar: 'IB' },
  { name: 'Amit Joshi',   notes: 19, downloads: 5430,  icon: Flame,  color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', avatar: 'AJ' },
];

// ─── Variants ─────────────────────────────────────────────────────────────────
const fadeUp  = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const slideIn = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } } };

// ─── Atoms ────────────────────────────────────────────────────────────────────
const Avatar = memo(({ initials, size = 'sm' }) => {
  const colors = { RM:'from-blue-500 to-indigo-500', PS:'from-violet-500 to-purple-500', AJ:'from-emerald-500 to-teal-500', SK:'from-rose-500 to-pink-500', DP:'from-amber-500 to-orange-500', NV:'from-cyan-500 to-blue-500', KG:'from-green-500 to-emerald-500', AD:'from-fuchsia-500 to-violet-500', VR:'from-orange-500 to-red-500', RS:'from-teal-500 to-cyan-500', MT:'from-indigo-500 to-blue-500', IB:'from-pink-500 to-rose-500' };
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base';
  return (
    <div className={`${s} rounded-full bg-gradient-to-br ${colors[initials] ?? 'from-slate-500 to-slate-600'} flex items-center justify-center text-white font-black shrink-0 shadow-sm`}>
      {initials}
    </div>
  );
});

const StatusBadge = memo(({ status }) => {
  const cfg = {
    approved: { cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <FileCheck size={11} />, label: 'Approved' },
    pending:  { cls: 'bg-amber-50  text-amber-600  border-amber-200',     icon: <FileClock  size={11} />, label: 'Pending'  },
    rejected: { cls: 'bg-red-50    text-red-500    border-red-200',       icon: <FileX      size={11} />, label: 'Rejected' },
  }[status] ?? { cls: 'bg-slate-50 text-slate-500 border-slate-200', icon: null, label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
});

const TypeBadge = memo(({ type }) => {
  const cfg = { 'Notes':'bg-blue-50 text-blue-600 border-blue-200', 'PYQ':'bg-amber-50 text-amber-600 border-amber-200', 'Lab Manual':'bg-purple-50 text-purple-600 border-purple-200', 'Viva':'bg-teal-50 text-teal-600 border-teal-200' }[type] ?? 'bg-slate-50 text-slate-500 border-slate-200';
  return <span className={`inline-flex px-2 py-0.5 rounded-lg border text-xs font-bold ${cfg}`}>{type}</span>;
});

const VerifiedBadge = memo(() => (
  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-sm">
    <BadgeCheck size={11} /> Admin Verified
  </motion.span>
));

// ─── Note Modal ───────────────────────────────────────────────────────────────
const NoteModal = memo(({ note, onClose, onAdminUpvote, onApprove, onReject, onDelete }) => {
  if (!note) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 24 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <TypeBadge type={note.type} />
                <StatusBadge status={note.status} />
                {note.adminVerified && <VerifiedBadge />}
              </div>
              <h2 className="text-white font-bold text-base leading-snug mb-3">{note.title}</h2>
              <div className="flex items-center gap-2">
                <Avatar initials={note.avatar} size="sm" />
                <div>
                  <p className="text-slate-200 text-sm font-semibold">{note.author}</p>
                  <p className="text-slate-400 text-xs">{note.branch} · {note.sem} · {note.subject}</p>
                </div>
              </div>
            </div>
            <motion.button whileHover={{ rotate: 90, scale: 1.1 }} onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors mt-1 shrink-0">
              <X size={18} />
            </motion.button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Preview */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Content Preview</p>
            <p className="text-slate-600 text-sm leading-relaxed">{note.preview}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: ThumbsUp, label: 'Upvotes',   value: note.upvotes,   c: 'text-blue-500',    bg: 'bg-blue-50'    },
              { icon: Download, label: 'Downloads', value: note.downloads, c: 'text-emerald-500', bg: 'bg-emerald-50' },
              { icon: FileText, label: 'Size',      value: note.size,      c: 'text-violet-500',  bg: 'bg-violet-50'  },
            ].map(({ icon: Icon, label, value, c, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <Icon size={15} className={`${c} mx-auto mb-1`} />
                <p className="font-bold text-slate-800 text-sm">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* THE HERO — Admin Upvote / Verify */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => onAdminUpvote(note.id)}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg
              ${note.adminUpvoted
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200'
                : 'bg-white border-2 border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 shadow-slate-100'
              }`}>
            {note.adminUpvoted
              ? <><BadgeCheck size={17} /> Currently Admin Verified — Click to Remove</>
              : <><ThumbsUp size={17} /> Admin Upvote &amp; Mark as Verified</>}
          </motion.button>

          {note.adminVerified && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="text-center text-xs text-blue-500 font-semibold -mt-1">
              ✦ Students can see the <strong>Admin Verified</strong> badge on this note
            </motion.p>
          )}

          {/* Approve / Reject / Delete */}
          <div className="flex gap-2 pt-1">
            {note.status === 'pending' && (
              <>
                <motion.button whileHover={{ scale: 1.03 }} onClick={() => { onApprove(note.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-sm">
                  <CheckCircle size={14} /> Approve
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} onClick={() => { onReject(note.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-sm">
                  <XCircle size={14} /> Reject
                </motion.button>
              </>
            )}
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => { onDelete(note.id); onClose(); }}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 font-semibold text-sm transition-colors">
              <Trash2 size={14} /> Delete
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'notes',     icon: FileText,        label: 'All Notes' },
  { id: 'students',  icon: Users,           label: 'Students'  },
  { id: 'settings',  icon: Settings,        label: 'Settings'  },
];

const AdminSidebar = memo(({ active, setActive, collapsed, setCollapsed, onSignOut, pendingCount }) => (
  <motion.aside animate={{ width: collapsed ? 72 : 240 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className="h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col shrink-0 overflow-hidden shadow-2xl z-20 relative">
    <div className="absolute top-0 left-0 right-0 h-40 bg-blue-500/5 pointer-events-none" />

    {/* Logo */}
    <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 relative">
      <motion.div whileHover={{ rotate: 12, scale: 1.05 }}
        className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
        <Shield size={17} className="text-white" />
      </motion.div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
            <p className="text-white font-black text-sm leading-none tracking-tight">PrepStack</p>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">Admin Panel</p>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCollapsed(c => !c)}
        className="ml-auto text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
        {collapsed ? <Menu size={15} /> : <X size={15} />}
      </motion.button>
    </div>

    {/* Nav */}
    <nav className="flex-1 py-4 px-2 space-y-1 relative">
      {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
        <motion.button key={id} whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }} onClick={() => setActive(id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left relative
            ${active === id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
          <Icon size={17} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-sm font-semibold whitespace-nowrap flex-1">{label}</motion.span>
            )}
          </AnimatePresence>
          {/* Pending badge */}
          {id === 'notes' && pendingCount > 0 && (
            <AnimatePresence>
              {!collapsed ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="ml-auto bg-amber-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                  {pendingCount}
                </motion.span>
              ) : (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </AnimatePresence>
          )}
          {active === id && (
            <motion.div layoutId="sidebarActive"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-400 rounded-r-full" />
          )}
        </motion.button>
      ))}
    </nav>

    {/* Sign Out */}
    <div className="p-3 border-t border-white/10">
      <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }} onClick={onSignOut}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-transparent hover:border-red-500/20">
        <LogOut size={17} className="shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-sm font-semibold">Sign Out</motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  </motion.aside>
));

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = memo(({ label, value, delta, icon: Icon, color }) => (
  <motion.div variants={fadeUp} whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 relative overflow-hidden group cursor-default">
    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.06] bg-gradient-to-br ${color} blur-2xl`} />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        <div className="flex items-center gap-1 mt-1.5">
          <ArrowUpRight size={12} className="text-emerald-500" />
          <span className="text-xs text-emerald-500 font-bold">{delta} this week</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </motion.div>
));

// ─── Filter Bar ───────────────────────────────────────────────────────────────
const FilterBar = memo(({ filters, setFilters, subjects, total, filtered }) => {
  const Sel = ({ value, options, onChange, icon: Icon }) => (
    <div className="relative">
      <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <select value={value} onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white border border-slate-200 rounded-xl pl-8 pr-7 py-2 text-sm text-slate-700 font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 cursor-pointer hover:border-blue-300 transition-all shadow-sm">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-blue-500" />
          <span className="text-sm font-bold text-slate-700">Filter Notes</span>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Showing <span className="text-blue-600 font-black">{filtered}</span> of <span className="font-bold">{total}</span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by title or author…"
            value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all" />
        </div>
        <div className="h-5 w-px bg-slate-200 hidden sm:block" />
        <Sel value={filters.branch}   options={BRANCHES}   onChange={v => setFilters(f => ({ ...f, branch: v, subject: 'All Subjects' }))} icon={GraduationCap} />
        <Sel value={filters.sem}      options={SEMESTERS}  onChange={v => setFilters(f => ({ ...f, sem: v }))}     icon={Layers}    />
        <Sel value={filters.subject}  options={subjects}   onChange={v => setFilters(f => ({ ...f, subject: v }))} icon={BookOpen}  />
        <Sel value={filters.type}     options={NOTE_TYPES} onChange={v => setFilters(f => ({ ...f, type: v }))}    icon={Filter}    />
        <Sel value={filters.status}   options={['All Status','approved','pending','rejected']} onChange={v => setFilters(f => ({ ...f, status: v }))} icon={CheckCircle} />
        <Sel value={filters.verified} options={['All','Verified','Unverified']} onChange={v => setFilters(f => ({ ...f, verified: v }))} icon={BadgeCheck} />
        <motion.button whileHover={{ rotate: 180 }} transition={{ duration: 0.35 }}
          onClick={() => setFilters({ search:'', branch:'All Branches', sem:'All Sems', subject:'All Subjects', type:'All Types', status:'All Status', verified:'All' })}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors" title="Reset filters">
          <RefreshCw size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
});

// ─── Note Grid Card ───────────────────────────────────────────────────────────
const NoteCard = memo(({ note, onSelect, onAdminUpvote, onApprove, onReject, onDelete }) => (
  <motion.div variants={fadeUp} layout
    whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
    className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden group cursor-pointer relative"
    onClick={() => onSelect(note)}>
    {/* Verified top strip */}
    {note.adminVerified && (
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ originX: 0 }}
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400" />
    )}
    <div className="p-4">
      {/* Badges + Admin verify btn */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <TypeBadge type={note.type} />
          <StatusBadge status={note.status} />
          {note.adminVerified && <VerifiedBadge />}
        </div>
        <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
          onClick={e => { e.stopPropagation(); onAdminUpvote(note.id); }}
          title={note.adminUpvoted ? 'Remove verification' : 'Admin verify this note'}
          className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm
            ${note.adminUpvoted
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
              : 'bg-slate-50 border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50'
            }`}>
          {note.adminUpvoted ? <><BadgeCheck size={12} /> Verified</> : <><ThumbsUp size={12} /> Verify</>}
        </motion.button>
      </div>

      <h4 className="font-bold text-slate-800 text-sm leading-snug mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-2">
        {note.title}
      </h4>
      <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{note.preview}</p>

      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar initials={note.avatar} size="sm" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-700 truncate">{note.author}</p>
          <p className="text-xs text-slate-400">{note.branch.split(' ').slice(0, 2).join(' ')} · {note.sem}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><ThumbsUp size={11} className="text-blue-400" />{note.upvotes}</span>
          <span className="flex items-center gap-1"><Download size={11} className="text-emerald-400" />{note.downloads}</span>
          <span>{note.size}</span>
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {note.status === 'pending' && (
            <>
              <motion.button whileHover={{ scale: 1.15 }} onClick={() => onApprove(note.id)}
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Approve">
                <CheckCircle size={13} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.15 }} onClick={() => onReject(note.id)}
                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Reject">
                <XCircle size={13} />
              </motion.button>
            </>
          )}
          <motion.button whileHover={{ scale: 1.15 }} onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 size={13} />
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
));

// ─── Notes View ───────────────────────────────────────────────────────────────
const NotesView = memo(({ notes, allNotes, onAdminUpvote, onApprove, onReject, onDelete, filters, setFilters, subjects }) => {
  const [selectedNote, setSelectedNote] = useState(null);
  const liveNote = selectedNote ? (notes.find(n => n.id === selectedNote.id) ?? allNotes.find(n => n.id === selectedNote.id)) : null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
      <FilterBar filters={filters} setFilters={setFilters} subjects={subjects} total={allNotes.length} filtered={notes.length} />
      {notes.length === 0 ? (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-md py-20 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Search size={26} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold">No notes match your filters</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting the search or filter criteria</p>
        </motion.div>
      ) : (
        <motion.div layout variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {notes.map(note => (
              <NoteCard key={note.id} note={note} onSelect={setSelectedNote}
                onAdminUpvote={onAdminUpvote} onApprove={onApprove} onReject={onReject} onDelete={onDelete} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      <AnimatePresence>
        {liveNote && (
          <NoteModal note={liveNote} onClose={() => setSelectedNote(null)}
            onAdminUpvote={onAdminUpvote} onApprove={onApprove} onReject={onReject} onDelete={onDelete} />
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ─── Dashboard Overview ───────────────────────────────────────────────────────
const DashboardOverview = memo(({ notes, onApprove, onReject, onAdminUpvote, setActiveTab }) => {
  const pending  = notes.filter(n => n.status === 'pending');
  const approved = notes.filter(n => n.status === 'approved');
  const verified = notes.filter(n => n.adminVerified);

  const STATS_CFG = [
    { label: 'Total Notes',    value: String(notes.length),    delta: '+48',  icon: FileText,   color: 'from-blue-500 to-blue-600'    },
    { label: 'Students',       value: '3,641',                 delta: '+126', icon: Users,      color: 'from-violet-500 to-violet-600' },
    { label: 'Admin Verified', value: String(verified.length), delta: '+3',   icon: BadgeCheck, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Pending Review', value: String(pending.length),  delta: '+5',   icon: Clock,      color: 'from-amber-500 to-amber-600'   },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_CFG.map(s => <StatCard key={s.label} {...s} />)}
      </motion.div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pending Approvals */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-lg"><AlertTriangle size={15} className="text-amber-600" /></div>
              <h3 className="font-bold text-slate-800">Pending Approvals</h3>
              <span className="bg-amber-100 text-amber-600 text-xs font-black px-2 py-0.5 rounded-full">{pending.length}</span>
            </div>
            <motion.button whileHover={{ x: 3 }} onClick={() => setActiveTab('notes')}
              className="text-xs text-blue-500 font-bold flex items-center gap-1 hover:text-blue-700">
              View All <ChevronRight size={13} />
            </motion.button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            <AnimatePresence>
              {pending.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center">
                  <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-bold">All caught up!</p>
                </motion.div>
              ) : pending.map((note, i) => (
                <motion.div key={note.id} variants={slideIn} transition={{ delay: i * 0.04 }}
                  exit={{ opacity: 0, x: 30, transition: { duration: 0.2 } }}
                  className="flex items-center gap-3 p-3 bg-amber-50/70 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors">
                  <Avatar initials={note.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{note.title}</p>
                    <p className="text-xs text-slate-400">{note.author} · {note.branch.split(' ')[0]} · {note.sem}</p>
                  </div>
                  <TypeBadge type={note.type} />
                  <div className="flex gap-1.5 shrink-0">
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => onApprove(note.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-colors">✓</motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => onReject(note.id)}
                      className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-black transition-colors">✕</motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Top Contributors */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-md p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-yellow-100 rounded-lg"><Crown size={15} className="text-yellow-600" /></div>
            <h3 className="font-bold text-slate-800">Top Contributors</h3>
          </div>
          <div className="space-y-2">
            {TOP_CONTRIBUTORS.map(({ name, notes: cnt, downloads, icon: Icon, color, bg, avatar }, i) => (
              <motion.div key={name} variants={fadeUp} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <Avatar initials={avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
                  <p className="text-xs text-slate-400">{cnt} notes · {downloads.toLocaleString()} dl</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${bg} shrink-0`}>
                  <Icon size={10} className={color} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Admin Verified highlight banner */}
      <motion.div variants={fadeUp}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-28 h-28 bg-indigo-400/20 rounded-full blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <BadgeCheck size={19} className="text-blue-200" />
            <h3 className="font-bold text-lg">Admin Verified Notes</h3>
            <span className="bg-white/20 text-white text-xs font-black px-2 py-0.5 rounded-full">{verified.length}</span>
          </div>
          <p className="text-blue-200 text-sm mb-4 max-w-lg">
            When you <strong>upvote</strong> a student's note, it receives the <strong>Admin Verified</strong> badge — visible to all students, helping them find the most trusted resources.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {verified.slice(0, 3).map(note => (
              <div key={note.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <TypeBadge type={note.type} />
                <p className="text-white text-xs font-bold mt-2 line-clamp-2 leading-snug">{note.title}</p>
                <p className="text-blue-200 text-xs mt-1">{note.author}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Branch chart */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-md p-5">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 size={17} className="text-blue-600" />
          <h3 className="font-bold text-slate-800">Notes Distribution by Branch</h3>
        </div>
        <div className="space-y-3">
          {BRANCHES.slice(1).map((branch, i) => {
            const count = notes.filter(n => n.branch === branch).length;
            const maxCount = Math.max(...BRANCHES.slice(1).map(b => notes.filter(n => n.branch === b).length), 1);
            const pct = (count / maxCount) * 100;
            const colors = ['from-blue-500 to-blue-400','from-violet-500 to-violet-400','from-emerald-500 to-emerald-400','from-amber-500 to-amber-400','from-rose-500 to-rose-400'];
            return (
              <div key={branch} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-semibold w-32 shrink-0 truncate">{branch}</span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.9, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]}`} />
                </div>
                <span className="text-xs font-black text-slate-600 w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
});

// ─── Students ─────────────────────────────────────────────────────────────────
const StudentsView = memo(() => (
  <motion.div variants={fadeUp} initial="hidden" animate="show"
    className="bg-white rounded-2xl border border-slate-100 shadow-md p-16 text-center">
    <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-violet-100">
      <Users size={36} className="text-violet-400" />
    </div>
    <h3 className="text-xl font-black text-slate-700 mb-2">Students Management</h3>
    <p className="text-slate-400 text-sm max-w-xs mx-auto">Student roster, analytics, and engagement metrics — coming soon.</p>
  </motion.div>
));

// ─── Settings ─────────────────────────────────────────────────────────────────
const SettingsView = memo(({ onSignOut }) => (
  <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-md space-y-4">
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h3 className="font-black text-slate-800 text-lg leading-none">Super Admin</h3>
          <p className="text-slate-400 text-sm mt-1">admin@prepstack.edu</p>
          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-bold mt-1.5">
            <BadgeCheck size={10} /> Verified Admin
          </span>
        </div>
      </div>
      <div className="space-y-1 mb-6">
        {['Profile Settings', 'Notification Preferences', 'Security & Password', 'Appearance'].map(item => (
          <motion.div key={item} whileHover={{ x: 4 }}
            className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <span className="text-sm font-semibold text-slate-700">{item}</span>
            <ChevronRight size={15} className="text-slate-300" />
          </motion.div>
        ))}
      </div>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onSignOut}
        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-black py-3.5 rounded-xl border border-red-200 transition-colors text-sm">
        <LogOut size={16} /> Sign Out
      </motion.button>
    </div>
  </motion.div>
));

// ─── Main ─────────────────────────────────────────────────────────────────────
const AdminDashboard = ({ onSignOut }) => {
  const [activeTab,        setActiveTab]        = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notes,            setNotes]            = useState(INITIAL_NOTES);
  const [filters, setFilters] = useState({
    search: '', branch: 'All Branches', sem: 'All Sems',
    subject: 'All Subjects', type: 'All Types', status: 'All Status', verified: 'All',
  });

  const subjects = useMemo(() => SUBJECTS_MAP[filters.branch] ?? ['All Subjects'], [filters.branch]);

  const filteredNotes = useMemo(() => notes.filter(n => {
    const q = filters.search.toLowerCase();
    return (
      (filters.branch   === 'All Branches' || n.branch  === filters.branch)  &&
      (filters.sem      === 'All Sems'     || n.sem     === filters.sem)      &&
      (filters.subject  === 'All Subjects' || n.subject === filters.subject)  &&
      (filters.type     === 'All Types'    || n.type    === filters.type)     &&
      (filters.status   === 'All Status'   || n.status  === filters.status)   &&
      (filters.verified === 'All'          || (filters.verified === 'Verified' ? n.adminVerified : !n.adminVerified)) &&
      (!q || n.title.toLowerCase().includes(q) || n.author.toLowerCase().includes(q))
    );
  }), [notes, filters]);

  const handleApprove     = useCallback(id => setNotes(ns => ns.map(n => n.id === id ? { ...n, status: 'approved' } : n)), []);
  const handleReject      = useCallback(id => setNotes(ns => ns.map(n => n.id === id ? { ...n, status: 'rejected' } : n)), []);
  const handleDelete      = useCallback(id => setNotes(ns => ns.filter(n => n.id !== id)), []);
  const handleAdminUpvote = useCallback(id => setNotes(ns => ns.map(n =>
    n.id === id ? { ...n, adminUpvoted: !n.adminUpvoted, adminVerified: !n.adminUpvoted } : n
  )), []);

  const pendingCount = useMemo(() => notes.filter(n => n.status === 'pending').length, [notes]);

  const PAGE_TITLES = { dashboard: 'Dashboard', notes: 'All Notes', students: 'Students', settings: 'Settings' };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
      <AdminSidebar active={activeTab} setActive={setActiveTab}
        collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed}
        onSignOut={onSignOut} pendingCount={pendingCount} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-5 lg:p-7 space-y-5 min-h-full">

          {/* Top Bar */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="flex items-center justify-between bg-white rounded-2xl shadow-md border border-slate-100 px-5 py-3.5 gap-4 flex-wrap">
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight">{PAGE_TITLES[activeTab]}</h1>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">
                PrepStack Admin &nbsp;·&nbsp;
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {pendingCount > 0 && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }}
                  onClick={() => setActiveTab('notes')}
                  className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold px-3 py-2 rounded-xl hover:bg-amber-100 transition-colors">
                  <Clock size={13} /> {pendingCount} Pending
                </motion.button>
              )}
              <motion.button whileHover={{ scale: 1.08 }}
                className="relative p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <Bell size={15} className="text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white" />
              </motion.button>
              <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center shadow">
                  <Shield size={13} className="text-white" />
                </div>
                <div className="text-sm hidden sm:block">
                  <p className="font-black text-slate-800 leading-none text-sm">Admin</p>
                  <p className="text-xs text-blue-500 font-bold mt-0.5">Super Admin</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Page content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.2 }}>
              {activeTab === 'dashboard' && (
                <DashboardOverview notes={notes} onApprove={handleApprove} onReject={handleReject}
                  onAdminUpvote={handleAdminUpvote} setActiveTab={setActiveTab} />
              )}
              {activeTab === 'notes' && (
                <NotesView notes={filteredNotes} allNotes={notes} onAdminUpvote={handleAdminUpvote}
                  onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete}
                  filters={filters} setFilters={setFilters} subjects={subjects} />
              )}
              {activeTab === 'students' && <StudentsView />}
              {activeTab === 'settings' && <SettingsView onSignOut={onSignOut} />}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;