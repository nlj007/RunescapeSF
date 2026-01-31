import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  MapPin, 
  Navigation, 
  Trophy, 
  Star,
  Compass,
  Target
} from 'lucide-react';

export default function StatsPanel({ stats, isExpanded, onToggle }) {
  const formatDistance = (meters) => {
    if (!meters) return '0m';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const calculateLevel = (xp) => {
    // RuneScape-style leveling formula (simplified)
    if (!xp) return 1;
    return Math.min(99, Math.floor(Math.sqrt(xp / 100)) + 1);
  };

  const xpToNextLevel = (xp) => {
    const currentLevel = calculateLevel(xp);
    const nextLevelXp = Math.pow(currentLevel, 2) * 100;
    return nextLevelXp - (xp || 0);
  };

  const level = calculateLevel(stats?.experience_points);
  const progress = stats?.experience_points 
    ? ((stats.experience_points % (Math.pow(level, 2) * 100)) / (Math.pow(level, 2) * 100)) * 100
    : 0;

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      {/* Collapsed Mini Stats */}
      <motion.button
        onClick={onToggle}
        className="bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-700 rounded-lg shadow-lg p-2 flex items-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-10 h-10 rounded bg-gradient-to-b from-amber-600 to-amber-800 flex items-center justify-center border border-amber-900">
          <span className="text-white font-bold text-lg font-medieval">{level}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-amber-800 font-medieval">Explorer</span>
          <div className="w-20 h-2 bg-amber-900/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <Compass className={`w-4 h-4 text-amber-700 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Expanded Stats Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mt-2 bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-700 rounded-lg shadow-xl overflow-hidden"
            style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h40v40H0V0zm1 1h38v38H1V1z" fill="%23d4a634" fill-opacity="0.05"/%3E%3C/svg%3E")'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-2">
              <h3 className="text-amber-100 font-medieval font-bold flex items-center gap-2">
                <Star className="w-4 h-4" />
                Explorer Stats
              </h3>
            </div>

            {/* Stats Grid */}
            <div className="p-3 space-y-3">
              {/* XP Bar */}
              <div className="bg-amber-900/10 rounded p-2">
                <div className="flex justify-between text-xs text-amber-800 mb-1">
                  <span className="font-medieval">Level {level} Explorer</span>
                  <span>{stats?.experience_points || 0} XP</span>
                </div>
                <div className="w-full h-3 bg-amber-900/20 rounded-full overflow-hidden border border-amber-600">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-600 to-green-400 relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                  </motion.div>
                </div>
                <div className="text-xs text-amber-600 mt-1 text-right">
                  {xpToNextLevel(stats?.experience_points)} XP to level {level + 1}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <StatItem 
                  icon={Map} 
                  label="Zones" 
                  value={stats?.zones_unlocked || 0}
                  color="text-blue-600"
                />
                <StatItem 
                  icon={MapPin} 
                  label="Pins" 
                  value={stats?.pins_visited || 0}
                  color="text-purple-600"
                />
                <StatItem 
                  icon={Navigation} 
                  label="Distance" 
                  value={formatDistance(stats?.total_distance_meters)}
                  color="text-green-600"
                />
                <StatItem 
                  icon={Trophy} 
                  label="Achievements" 
                  value={stats?.achievements_earned || 0}
                  color="text-amber-600"
                />
              </div>

              {/* Total Points */}
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded p-2 text-center">
                <div className="text-amber-200 text-xs font-medieval">Total Points</div>
                <div className="text-white font-bold text-xl font-medieval">
                  {stats?.total_points?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/50 rounded p-2 flex items-center gap-2">
      <Icon className={`w-5 h-5 ${color}`} />
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-bold text-gray-800">{value}</div>
      </div>
    </div>
  );
}