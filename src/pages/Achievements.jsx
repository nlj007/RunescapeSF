import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Map, 
  MapPin, 
  Navigation, 
  Calendar,
  Star,
  Lock,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import BottomNav from '@/components/ui/BottomNav';
import { Progress } from '@/components/ui/progress';

const iconMap = {
  explorer: Map,
  treasure_hunter: MapPin,
  cartographer: Navigation,
  wanderer: Navigation,
  pioneer: Star,
  completionist: Trophy
};

export default function Achievements() {
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list()
  });

  const { data: userStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.list();
      return stats[0] || null;
    }
  });

  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: () => base44.entities.Zone.list()
  });

  const { data: pins = [] } = useQuery({
    queryKey: ['pins'],
    queryFn: () => base44.entities.Pin.list()
  });

  const getProgress = (achievement) => {
    const stats = userStats || {};
    const zonesUnlocked = zones.filter(z => z.unlocked).length;
    const pinsVisited = pins.filter(p => p.visited).length;

    switch (achievement.requirement_type) {
      case 'zones_unlocked':
        return Math.min(100, (zonesUnlocked / achievement.requirement_value) * 100);
      case 'pins_visited':
        return Math.min(100, (pinsVisited / achievement.requirement_value) * 100);
      case 'distance_traveled':
        return Math.min(100, ((stats.total_distance_meters || 0) / achievement.requirement_value) * 100);
      default:
        return 0;
    }
  };

  const getCurrentValue = (achievement) => {
    const stats = userStats || {};
    const zonesUnlocked = zones.filter(z => z.unlocked).length;
    const pinsVisited = pins.filter(p => p.visited).length;

    switch (achievement.requirement_type) {
      case 'zones_unlocked':
        return zonesUnlocked;
      case 'pins_visited':
        return pinsVisited;
      case 'distance_traveled':
        const meters = stats.total_distance_meters || 0;
        return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
      default:
        return 0;
    }
  };

  const getRequirementLabel = (achievement) => {
    switch (achievement.requirement_type) {
      case 'zones_unlocked':
        return `${achievement.requirement_value} zones`;
      case 'pins_visited':
        return `${achievement.requirement_value} pins`;
      case 'distance_traveled':
        return achievement.requirement_value >= 1000 
          ? `${achievement.requirement_value / 1000}km`
          : `${achievement.requirement_value}m`;
      default:
        return achievement.requirement_value;
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (a.points_reward || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-6 shadow-lg">
        <h1 className="text-2xl font-medieval font-bold text-amber-100 flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Achievements
        </h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-amber-200/80 text-sm">
            {unlockedCount} / {achievements.length} Unlocked
          </span>
          <span className="text-amber-300 text-sm font-bold">
            {totalPoints} XP Earned
          </span>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-xl border border-amber-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-amber-700 font-medieval">Overall Progress</span>
            <span className="text-sm text-amber-600">
              {Math.round((unlockedCount / Math.max(achievements.length, 1)) * 100)}%
            </span>
          </div>
          <Progress 
            value={(unlockedCount / Math.max(achievements.length, 1)) * 100}
            className="h-3 bg-amber-100"
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="px-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-amber-200">
            <Trophy className="w-12 h-12 text-amber-300 mx-auto" />
            <p className="text-amber-800 font-medieval mt-4">No achievements set up yet</p>
            <p className="text-amber-600 text-sm mt-1">Check the settings to add achievements!</p>
          </div>
        ) : (
          achievements.map((achievement, idx) => {
            const Icon = iconMap[achievement.icon] || Trophy;
            const progress = getProgress(achievement);
            const isUnlocked = achievement.unlocked || progress >= 100;

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative overflow-hidden rounded-xl border-2 ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-400' 
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Unlocked badge */}
                {isUnlocked && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}

                <div className="p-4 flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                      : 'bg-gray-100'
                  }`}>
                    {isUnlocked ? (
                      <Icon className="w-7 h-7 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medieval font-bold ${isUnlocked ? 'text-amber-800' : 'text-gray-600'}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {achievement.description}
                    </p>

                    {/* Progress bar */}
                    {!isUnlocked && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{getCurrentValue(achievement)} / {getRequirementLabel(achievement)}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-gray-100" />
                      </div>
                    )}

                    {/* Reward & Unlock date */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isUnlocked ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Star className="w-3 h-3 inline mr-1" />
                        +{achievement.points_reward || 0} XP
                      </span>
                      
                      {isUnlocked && achievement.unlock_timestamp && (
                        <span className="text-xs text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {format(new Date(achievement.unlock_timestamp), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <BottomNav currentPage="Achievements" />
    </div>
  );
}