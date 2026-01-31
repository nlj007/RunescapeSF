import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, History, Settings, Trophy } from 'lucide-react';
import { createPageUrl } from '@/utils';

const navItems = [
  { icon: Map, label: 'Map', page: 'Explorer' },
  { icon: History, label: 'History', page: 'History' },
  { icon: Trophy, label: 'Achievements', page: 'Achievements' },
  { icon: Settings, label: 'Settings', page: 'Settings' }
];

export default function BottomNav({ currentPage }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1001] bg-gradient-to-b from-amber-100 to-amber-200 border-t-2 border-amber-600 shadow-lg safe-area-pb">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map(({ icon: Icon, label, page }) => {
          const isActive = currentPage === page;
          
          return (
            <Link
              key={page}
              to={createPageUrl(page)}
              className="flex flex-col items-center"
            >
              <motion.div
                className={`relative p-2 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-gradient-to-b from-amber-600 to-amber-700 shadow-md' 
                    : 'hover:bg-amber-300/50'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-amber-800'}`} />
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-amber-400 rounded-full"
                  />
                )}
              </motion.div>
              <span className={`text-xs mt-1 font-medieval ${
                isActive ? 'text-amber-800 font-bold' : 'text-amber-700'
              }`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}