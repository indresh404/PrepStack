// src/components/student/Setting.jsx
// ─── ADD onSignOut prop and wire it to your Sign Out button ───────────────────
//
// Your existing Setting.jsx just needs this ONE change:
//
//   Before:  const Settings = () => { ... }
//   After:   const Settings = ({ onSignOut }) => { ... }
//
// Then wherever you have your sign-out button, call onSignOut():
//
//   <button onClick={onSignOut}>Sign Out</button>
//
// Example minimal structure (replace with your actual Settings UI):

import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Bell, Shield, Palette, HelpCircle } from 'lucide-react';

const Settings = ({ onSignOut }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Settings</h2>

        <div className="space-y-2">
          {[
            { icon: User,    label: 'Profile',       desc: 'Manage your account details' },
            { icon: Bell,    label: 'Notifications', desc: 'Configure alerts and reminders' },
            { icon: Shield,  label: 'Privacy',       desc: 'Control your data and visibility' },
            { icon: Palette, label: 'Appearance',    desc: 'Theme, fonts, and display' },
            { icon: HelpCircle, label: 'Help & Support', desc: 'FAQs and contact support' },
          ].map(({ icon: Icon, label, desc }) => (
            <motion.div
              key={label}
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Icon size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <span className="text-gray-300 text-sm">›</span>
            </motion.div>
          ))}
        </div>

        {/* Sign Out Button */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 px-6 rounded-xl border border-red-200 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Settings;