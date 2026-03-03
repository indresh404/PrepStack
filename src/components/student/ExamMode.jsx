// src/components/student/ExamMode.jsx
// ✅ No backend needed — calls Groq API directly from the browser
// 
// 📌 SETUP INSTRUCTIONS:
// 1. Create a .env file in your project root
// 2. Add: VITE_GROQ_API_KEY=your_groq_api_key_here
// 3. Restart your dev server
// 4. Make sure PDFs exist in: /public/AOA.pdf, /public/DBMS.pdf, /public/JAVA.pdf

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from "pdfjs-dist";
import LottieComponent from "lottie-react";
const Lottie = LottieComponent.default ?? LottieComponent;

import {
  Brain, Zap, Target, BookOpen, Star, FileText, 
  AlertTriangle, Layers, BarChart3, PieChart, TrendingUp,
  Download, Heart, Share2, Users, Award, Clock, ChevronDown,
  Bookmark, ThumbsUp, MessageCircle, Eye
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart as RePieChart,
  Pie, Sector
} from 'recharts';
import aiAnimation from '../../assets/ai.json';

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

// ─── CONFIGURATION ──────────────────────────────────────────────────────────
// Get API key from .env file (VITE_GROQ_API_KEY=your_key_here)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SUBJECTS = [
  { 
    id: 'AOA', 
    label: 'AOA', 
    full: 'Analysis of Algorithms', 
    color: '#3b82f6', 
    bg: '#eff6ff',
    lightBg: 'bg-blue-50',
    pdf: '/AOA.pdf',
    icon: '🔷',
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'DBMS', 
    label: 'DBMS', 
    full: 'Database Management Systems', 
    color: '#10b981', 
    bg: '#f0fdf9',
    lightBg: 'bg-emerald-50',
    pdf: '/DBMS.pdf',
    icon: '💚',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  { 
    id: 'JAVA', 
    label: 'JAVA', 
    full: 'Java Programming', 
    color: '#f97316', 
    bg: '#fff7ed',
    lightBg: 'bg-orange-50',
    pdf: '/JAVA.pdf',
    icon: '🟠',
    gradient: 'from-orange-500 to-orange-600'
  },
];

// 📚 TOP NOTES DATA - Community contributed notes
const TOP_NOTES = {
  AOA: [
    {
      id: 1,
      title: 'Dynamic Programming Master Notes',
      author: 'Aryan Shah',
      authorAvatar: 'AS',
      authorRole: 'Top Contributor',
      rating: 4.9,
      downloads: 12453,
      views: 45231,
      saves: 3421,
      pages: 24,
      topics: ['Dynamic Programming', 'Memoization', 'Tabulation', 'Optimal Substructure'],
      difficulty: 'Advanced',
      likes: 342,
      comments: 89,
      timeEstimate: '2 hours',
      preview: 'Comprehensive guide covering all DP patterns with 50+ solved examples. Includes recursion trees, time complexity analysis, and common interview questions.',
      isPremium: false,
      tags: ['⭐ Top Rated', '🔥 Trending', '📌 Bestseller'],
      lastUpdated: '2 days ago'
    },
    {
      id: 2,
      title: 'Graph Algorithms Cheat Sheet',
      author: 'Priya Mehta',
      authorAvatar: 'PM',
      authorRole: 'Expert',
      rating: 4.8,
      downloads: 9876,
      views: 32456,
      saves: 2876,
      pages: 18,
      topics: ['BFS', 'DFS', 'Dijkstra', 'Bellman-Ford', 'Floyd Warshall'],
      difficulty: 'Intermediate',
      likes: 256,
      comments: 45,
      timeEstimate: '1.5 hours',
      preview: 'Quick reference with implementations in Python, Java, and C++. Includes complexity analysis and when to use each algorithm.',
      isPremium: false,
      tags: ['⭐ Top Rated', '📌 Pinned'],
      lastUpdated: '1 week ago'
    },
    {
      id: 3,
      title: 'Master Theorem & Recurrences',
      author: 'Rohan Patel',
      authorAvatar: 'RP',
      authorRole: 'Teaching Assistant',
      rating: 4.7,
      downloads: 7654,
      views: 21345,
      saves: 1654,
      pages: 12,
      topics: ['Master Theorem', 'Recurrence Relations', 'Complexity Analysis'],
      difficulty: 'Beginner',
      likes: 189,
      comments: 34,
      timeEstimate: '1 hour',
      preview: 'Simplified approach to solving recurrences with practice problems and step-by-step solutions for all cases.',
      isPremium: false,
      tags: ['⭐ Top Rated'],
      lastUpdated: '3 days ago'
    }
  ],
  DBMS: [
    {
      id: 1,
      title: 'Complete SQL Mastery',
      author: 'Sneha Iyer',
      authorAvatar: 'SI',
      authorRole: 'Database Expert',
      rating: 5.0,
      downloads: 18765,
      views: 56789,
      saves: 5678,
      pages: 36,
      topics: ['SQL Queries', 'Joins', 'Subqueries', 'Aggregation', 'Window Functions'],
      difficulty: 'Beginner to Advanced',
      likes: 567,
      comments: 123,
      timeEstimate: '3 hours',
      preview: 'From basic SELECT to complex queries with 100+ practice problems. Covers all types of JOINs, subqueries, and advanced SQL features.',
      isPremium: false,
      tags: ['⭐ Top Rated', '🔥 Trending', '📌 Bestseller'],
      lastUpdated: '5 days ago'
    },
    {
      id: 2,
      title: 'Normalization Made Easy',
      author: 'Mihir Joshi',
      authorAvatar: 'MJ',
      authorRole: 'Top Contributor',
      rating: 4.9,
      downloads: 12345,
      views: 34567,
      saves: 3456,
      pages: 22,
      topics: ['1NF', '2NF', '3NF', 'BCNF', '4NF', '5NF'],
      difficulty: 'Intermediate',
      likes: 345,
      comments: 67,
      timeEstimate: '2 hours',
      preview: 'Step-by-step guide with real-world examples and exercises. Learn to eliminate redundancy and design efficient databases.',
      isPremium: false,
      tags: ['⭐ Top Rated', '📌 Pinned'],
      lastUpdated: '1 week ago'
    }
  ],
  JAVA: [
    {
      id: 1,
      title: 'OOP Concepts Masterclass',
      author: 'Dev Sharma',
      authorAvatar: 'DS',
      authorRole: 'Java Expert',
      rating: 4.9,
      downloads: 21345,
      views: 67890,
      saves: 6789,
      pages: 42,
      topics: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction', 'Interfaces'],
      difficulty: 'Beginner',
      likes: 678,
      comments: 156,
      timeEstimate: '4 hours',
      preview: 'Object-oriented programming explained with real-world examples and code snippets. Covers all OOP principles with practical exercises.',
      isPremium: false,
      tags: ['⭐ Top Rated', '🔥 Trending', '📌 Bestseller'],
      lastUpdated: '2 days ago'
    },
    {
      id: 2,
      title: 'Collections Framework Deep Dive',
      author: 'Ananya Singh',
      authorAvatar: 'AS',
      authorRole: 'Senior Developer',
      rating: 4.9,
      downloads: 16543,
      views: 45678,
      saves: 4567,
      pages: 34,
      topics: ['List', 'Set', 'Map', 'Queue', 'Streams', 'Comparators'],
      difficulty: 'Intermediate',
      likes: 456,
      comments: 98,
      timeEstimate: '3 hours',
      preview: 'Complete guide to Java Collections with performance comparisons, use cases, and best practices for each collection type.',
      isPremium: false,
      tags: ['⭐ Top Rated', '📌 Pinned'],
      lastUpdated: '4 days ago'
    }
  ]
};

const TOPIC_COLORS = ['#ef4444', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

// ─── PDF EXTRACTION ─────────────────────────────────────────────────────────
async function extractTextFromPDF(pdfPath) {
  try {
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdf = await loadingTask.promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text;
  } catch (error) {
    console.error("Error extracting PDF:", error);
    throw new Error(`Failed to load ${pdfPath}. Make sure the file exists in the public folder.`);
  }
}

function extractQuestions(text) {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 20);
  const questions = [];
  const commandWords = [
    "define", "explain", "derive", "differentiate", "compare", "describe",
    "discuss", "evaluate", "analyze", "prove", "state", "list", "write",
    "find", "calculate", "solve", "show", "justify", "examine", "illustrate",
    "what", "why", "how"
  ];

  lines.forEach((line) => {
    const lower = line.toLowerCase();
    const hasCommand = commandWords.some(w => new RegExp(`\\b${w}\\b`).test(lower));
    const hasQuestionMark = line.includes("?");
    const hasNumbering = /^(\d+[\.\)]\s|[a-z][\.\)]\s|\([a-z]\)\s|Q\d)/i.test(line);

    if ((hasCommand || hasQuestionMark || hasNumbering) && line.length < 500) {
      const cleaned = line.replace(/\s+/g, " ").trim();
      questions.push(cleaned);
    }
  });

  return questions.slice(0, 30);
}

// ─── AI ANALYSIS ────────────────────────────────────────────────────────────
async function analyzeWithGroq(systemPrompt, userPrompt) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not found. Add VITE_GROQ_API_KEY to your .env file.');
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function getExamAnalysis(subjectName, pdfText, extractedQuestions) {
  const questionsSample = extractedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');

  const systemPrompt = `You are an expert in ${subjectName}. Analyze past exam papers and provide structured insights in JSON format.`;

  const userPrompt = `Here are questions extracted from ${subjectName} past papers:

${questionsSample}

Return a JSON object with this exact structure:
{
  "overview": {
    "totalQuestions": number,
    "uniqueTopics": number,
    "difficultyBreakdown": {
      "easy": number,
      "medium": number,
      "hard": number
    }
  },
  "topics": [
    {
      "name": "topic name",
      "frequency": number (0-100),
      "questionCount": number,
      "importance": "Critical" | "High" | "Medium",
      "commonWith": ["topic1", "topic2"]
    }
  ],
  "predictedQuestions": [
    {
      "question": "full question text",
      "probability": "Very High" | "High" | "Medium",
      "topic": "associated topic",
      "marks": number,
      "reason": "brief explanation"
    }
  ],
  "patterns": {
    "repeatedTopics": ["topic1", "topic2"],
    "questionTypes": {
      "definitions": number,
      "derivations": number,
      "numericals": number,
      "comparisons": number
    },
    "markDistribution": "description"
  },
  "keyInsights": ["insight1", "insight2", "insight3"],
  "studyPlan": [
    {
      "priority": "Week 1" | "Week 2" | "Week 3",
      "topics": ["topic1", "topic2"],
      "focus": "what to focus on",
      "estimatedHours": number
    }
  ]
}

Base everything strictly on the questions provided.`;

  const response = await analyzeWithGroq(systemPrompt, userPrompt);
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("No valid JSON found in response");
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, value, label, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all"
  >
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white mb-3`}>
      <Icon size={20} />
    </div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="text-xs text-gray-500 mt-1">{label}</div>
  </motion.div>
);

// Top Notes Component - Only shown after analysis
const TopNotes = ({ subjectId, subjectColor, subjectGradient }) => {
  const [expandedId, setExpandedId] = useState(null);
  const notes = TOP_NOTES[subjectId] || [];

  if (!notes.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${subjectGradient} bg-opacity-10`}>
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Recommended Study Notes</h3>
            <p className="text-sm text-gray-500 mt-1">Handcrafted by top students • Matched to your syllabus</p>
          </div>
        </div>
        <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg">
          View All <ChevronDown size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: note.id * 0.1 }}
            className="border border-gray-200 rounded-xl hover:shadow-lg transition-all cursor-pointer overflow-hidden"
            onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
          >
            {/* Header with gradient */}
            <div className={`h-2 bg-gradient-to-r ${subjectGradient}`} />
            
            <div className="p-5">
              <div className="flex gap-4">
                {/* Author Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                    style={{ background: `linear-gradient(135deg, ${subjectColor}, ${subjectColor}dd)` }}>
                    {note.authorAvatar}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{note.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">{note.author}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                          {note.authorRole}
                        </span>
                      </div>
                    </div>
                    {note.isPremium && (
                      <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full border border-yellow-200 font-medium">
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.topics.slice(0, 3).map((topic, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full" 
                        style={{ backgroundColor: `${subjectColor}15`, color: subjectColor }}>
                        {topic}
                      </span>
                    ))}
                    {note.topics.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                        +{note.topics.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-500">
                        <Star size={14} className="fill-current" />
                        <span className="text-sm font-bold">{note.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">Rating</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-500">
                        <Download size={14} />
                        <span className="text-sm font-bold">{(note.downloads/1000).toFixed(1)}k</span>
                      </div>
                      <span className="text-xs text-gray-400">Downloads</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-500">
                        <Eye size={14} />
                        <span className="text-sm font-bold">{(note.views/1000).toFixed(1)}k</span>
                      </div>
                      <span className="text-xs text-gray-400">Views</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-500">
                        <Clock size={14} />
                        <span className="text-sm font-bold">{note.timeEstimate}</span>
                      </div>
                      <span className="text-xs text-gray-400">Duration</span>
                    </div>
                  </div>

                  {/* Preview - shown when expanded */}
                  <AnimatePresence>
                    {expandedId === note.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-100"
                      >
                        <p className="text-sm text-gray-600 leading-relaxed">{note.preview}</p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <ThumbsUp size={14} /> {note.likes}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <MessageCircle size={14} /> {note.comments}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Bookmark size={14} /> {note.saves}
                            </span>
                            <span className="text-xs text-gray-400">Updated {note.lastUpdated}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button className="flex items-center gap-1 text-xs px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium">
                              <Download size={14} /> Download
                            </button>
                            <button className="flex items-center gap-1 text-xs px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors font-medium">
                              <Heart size={14} /> Save
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expand/Collapse Indicator */}
                  <div className="mt-3 text-center">
                    <span className="text-xs text-gray-400 hover:text-gray-600">
                      {expandedId === note.id ? 'Show less ↑' : 'Click to expand ↓'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Custom active shape for pie chart hover effect
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  
  return (
    <g>
      <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill={fill} className="text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#666" className="text-xs">
        {value} questions
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

const TopicBarChart = ({ topics, subjectColor }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <BarChart3 size={16} className="text-blue-600" />
      Topic Importance Analysis
    </h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topics} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
          <Tooltip 
            contentStyle={{ fontSize: '12px', padding: '8px', borderRadius: '8px' }}
            formatter={(v) => [`${v}% frequency`, 'Importance']}
          />
          <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
            {topics.map((_, i) => (
              <Cell key={i} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const QuestionTypePie = ({ types }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  
  const data = Object.entries(types).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })).filter(item => item.value > 0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <PieChart size={16} className="text-purple-600" />
        Question Type Distribution
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={{ stroke: '#666', strokeWidth: 1 }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={TOPIC_COLORS[index % TOPIC_COLORS.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value} questions`, name]}
              contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
            />
          </RePieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TOPIC_COLORS[i % TOPIC_COLORS.length] }} />
            <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PredictedQuestion = ({ q, index, color }) => {
  const probColors = {
    'Very High': 'bg-red-100 text-red-600 border-red-200',
    'High': 'bg-orange-100 text-orange-600 border-orange-200',
    'Medium': 'bg-green-100 text-green-600 border-green-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-sm"
          style={{ backgroundColor: color }}>
          {index + 1}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700 leading-relaxed">{q.question}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className={`text-xs px-3 py-1 rounded-full border ${probColors[q.probability]}`}>
              {q.probability} Probability
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Target size={12} />
              {q.topic}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
              {q.marks} marks
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">{q.reason}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const ExamMode = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const lottieRef = useRef();

  useEffect(() => {
    setAnalysis(null);
    setExtractedQuestions([]);
    setError('');
  }, [selectedSubject]);

  const runAnalysis = async () => {
    if (!selectedSubject) return;

    setAnalyzing(true);
    setProgress(0);
    setError('');

    if (!GROQ_API_KEY) {
      setError('❌ Groq API key missing. Create .env file with: VITE_GROQ_API_KEY=your_key');
      setAnalyzing(false);
      return;
    }

    const subject = SUBJECTS.find(s => s.id === selectedSubject);

    try {
      // Step 1: Extract PDF
      setProgressLabel('📖 Reading PDF...');
      setProgress(25);
      const pdfText = await extractTextFromPDF(subject.pdf);

      // Step 2: Extract questions
      setProgressLabel('🔍 Extracting questions...');
      setProgress(50);
      const questions = extractQuestions(pdfText);
      setExtractedQuestions(questions);

      if (questions.length === 0) {
        throw new Error('No questions found in the PDF');
      }

      // Step 3: AI Analysis
      setProgressLabel('🤖 AI analyzing patterns...');
      setProgress(75);
      const result = await getExamAnalysis(subject.full, pdfText, questions);
      setAnalysis(result);

      setProgressLabel('✅ Analysis complete!');
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setTimeout(() => setAnalyzing(false), 500);
    }
  };

  const subject = SUBJECTS.find(s => s.id === selectedSubject);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-3">
          <Brain size={28} />
          <div>
            <h1 className="text-2xl font-bold">Exam Mode</h1>
            <p className="text-white/80 text-sm mt-1">
              AI-powered analysis from your PYQ PDFs + Community Notes
            </p>
          </div>
        </div>
      </div>

      {/* API Key Warning */}
      {!GROQ_API_KEY && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-800 font-medium">⚠️ Groq API Key Required</p>
          <p className="text-xs text-yellow-600 mt-1">
            Create a .env file in your project root with: VITE_GROQ_API_KEY=your_groq_api_key_here
          </p>
        </div>
      )}

      {/* Subject Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {SUBJECTS.map(s => (
          <motion.button
            key={s.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedSubject(s.id)}
            className={`rounded-xl border-2 p-5 text-left transition-all ${
              selectedSubject === s.id 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            style={selectedSubject === s.id ? { borderColor: s.color } : {}}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                style={{ background: s.color }}>
                {s.icon}
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: s.color }}>{s.label}</div>
                <div className="text-xs text-gray-500 mt-1">{s.full}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Analyze Button - Only show when subject selected and no analysis yet */}
      {selectedSubject && !analyzing && !analysis && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runAnalysis}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Zap size={18} />
            Analyze {subject?.label} PYQs with AI
          </motion.button>
        </motion.div>
      )}

      {/* Loading State with Lottie */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-8 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-48 h-48">
                <Lottie 
                  lottieRef={lottieRef} 
                  animationData={aiAnimation} 
                  loop 
                  autoplay 
                  style={{ width: '100%', height: '100%' }} 
                />
              </div>
              <p className="text-lg font-medium text-gray-800 mt-4">{progressLabel}</p>
              <div className="w-64 h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{progress}% complete</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Analysis Failed</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results - Only shown after analysis is complete */}
      {analysis && subject && !analyzing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={FileText}
              value={analysis.overview.totalQuestions}
              label="Total Questions"
              color="bg-blue-600"
            />
            <StatCard
              icon={Layers}
              value={analysis.overview.uniqueTopics}
              label="Topics Identified"
              color="bg-emerald-600"
            />
            <StatCard
              icon={Target}
              value={analysis.predictedQuestions.length}
              label="Predictions"
              color="bg-orange-600"
            />
            <StatCard
              icon={TrendingUp}
              value={analysis.studyPlan.length}
              label="Study Weeks"
              color="bg-purple-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            <TopicBarChart topics={analysis.topics.slice(0, 6)} subjectColor={subject.color} />
            <QuestionTypePie types={analysis.patterns.questionTypes} />
          </div>

          {/* Predicted Questions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Target size={20} className="text-red-600" />
              Top Predicted Questions
            </h3>
            <div className="space-y-4">
              {analysis.predictedQuestions.slice(0, 8).map((q, i) => (
                <PredictedQuestion key={i} q={q} index={i} color={subject.color} />
              ))}
            </div>
          </div>

          {/* Key Insights and Study Plan */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Brain size={20} className="text-purple-600" />
                Key Insights
              </h3>
              <ul className="space-y-3">
                {analysis.keyInsights.map((insight, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span className="text-purple-600 mt-1">•</span>
                    {insight}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-green-600" />
                Recommended Study Plan
              </h3>
              <div className="space-y-4">
                {analysis.studyPlan.map((week, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border-l-4 border-green-500 pl-4 py-2"
                  >
                    <p className="text-sm font-semibold text-green-600">{week.priority}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {week.topics.map((topic, j) => (
                        <span key={j} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{week.focus}</p>
                    <p className="text-xs text-gray-400 mt-1">⏱️ {week.estimatedHours} hours recommended</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Notes Section - Only shown after analysis */}
          <TopNotes 
            subjectId={selectedSubject} 
            subjectColor={subject.color}
            subjectGradient={subject.gradient}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default ExamMode;