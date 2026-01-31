import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Navigation, 
  Download, 
  Trash2,
  ChevronRight,
  Map
} from 'lucide-react';
import { format, formatDistanceToNow, startOfDay, isToday, isYesterday } from 'date-fns';
import BottomNav from '@/components/ui/BottomNav';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function History() {
  const [expandedSession, setExpandedSession] = useState(null);

  const { data: locationHistory = [], isLoading } = useQuery({
    queryKey: ['locationHistory'],
    queryFn: () => base44.entities.LocationHistory.list('-created_date', 1000)
  });

  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: () => base44.entities.Zone.list()
  });

  const { data: userStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.list();
      return stats[0] || null;
    }
  });

  // Group history by day
  const groupedHistory = locationHistory.reduce((groups, entry) => {
    const date = startOfDay(new Date(entry.created_date)).toISOString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone?.name || 'Unknown Area';
  };

  const formatDistance = (meters) => {
    if (!meters) return '0m';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const exportHistory = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalEntries: locationHistory.length,
      stats: userStats,
      locations: locationHistory.map(loc => ({
        timestamp: loc.created_date,
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        zone: getZoneName(loc.zone_id)
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gps-history-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-6 shadow-lg">
        <h1 className="text-2xl font-medieval font-bold text-amber-100 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Exploration History
        </h1>
        <p className="text-amber-200/80 text-sm mt-1">
          {locationHistory.length} locations recorded
        </p>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard 
            icon={Navigation} 
            label="Total Distance" 
            value={formatDistance(userStats?.total_distance_meters)} 
          />
          <StatCard 
            icon={Map} 
            label="Zones" 
            value={userStats?.zones_unlocked || 0} 
          />
          <StatCard 
            icon={MapPin} 
            label="Pins Found" 
            value={userStats?.pins_visited || 0} 
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 bg-white border-amber-300"
          onClick={exportHistory}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="bg-white border-red-300 text-red-600">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear History?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your location history. Your unlocked zones and achievements will remain.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600">Delete All</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* History List */}
      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-amber-700 mt-2">Loading history...</p>
          </div>
        ) : Object.keys(groupedHistory).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-amber-200">
            <MapPin className="w-12 h-12 text-amber-300 mx-auto" />
            <p className="text-amber-800 font-medieval mt-4">No exploration data yet</p>
            <p className="text-amber-600 text-sm mt-1">Start exploring to see your history!</p>
          </div>
        ) : (
          Object.entries(groupedHistory)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, entries]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedSession(expandedSession === date ? null : date)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-amber-700" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medieval font-bold text-amber-800">
                        {formatDateHeader(date)}
                      </h3>
                      <p className="text-xs text-amber-600">
                        {entries.length} locations • {entries.filter(e => e.unlocked_new_zone).length} new zones
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-amber-400 transition-transform ${expandedSession === date ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {expandedSession === date && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-amber-100"
                    >
                      <div className="max-h-60 overflow-y-auto">
                        {entries.slice(0, 50).map((entry, idx) => (
                          <div
                            key={entry.id}
                            className={`px-4 py-2 flex items-center gap-3 ${idx % 2 === 0 ? 'bg-amber-50/50' : ''}`}
                          >
                            <div className={`w-2 h-2 rounded-full ${entry.unlocked_new_zone ? 'bg-green-500' : 'bg-amber-400'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 truncate">
                                {entry.zone_id ? getZoneName(entry.zone_id) : 'Unknown Area'}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">
                                {entry.latitude?.toFixed(5)}, {entry.longitude?.toFixed(5)}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {format(new Date(entry.created_date), 'HH:mm')}
                            </span>
                          </div>
                        ))}
                        {entries.length > 50 && (
                          <p className="text-center text-xs text-amber-600 py-2">
                            +{entries.length - 50} more entries
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
        )}
      </div>

      <BottomNav currentPage="History" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-lg border border-amber-200 p-3 text-center">
      <Icon className="w-5 h-5 text-amber-600 mx-auto" />
      <p className="text-lg font-bold text-amber-800 mt-1">{value}</p>
      <p className="text-xs text-amber-600">{label}</p>
    </div>
  );
}