import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  MapPin, 
  Trophy, 
  Star, 
  Sparkles,
  AlertTriangle,
  X
} from 'lucide-react';

const notificationTypes = {
  zone_unlocked: {
    icon: Map,
    bgGradient: 'from-blue-500 to-blue-700',
    borderColor: 'border-blue-400',
    sound: 'level-up'
  },
  pin_reached: {
    icon: MapPin,
    bgGradient: 'from-purple-500 to-purple-700',
    borderColor: 'border-purple-400',
    sound: 'discovery'
  },
  achievement: {
    icon: Trophy,
    bgGradient: 'from-amber-500 to-amber-700',
    borderColor: 'border-amber-400',
    sound: 'achievement'
  },
  level_up: {
    icon: Star,
    bgGradient: 'from-green-500 to-green-700',
    borderColor: 'border-green-400',
    sound: 'level-up'
  },
  random_event: {
    icon: Sparkles,
    bgGradient: 'from-pink-500 to-pink-700',
    borderColor: 'border-pink-400',
    sound: 'event'
  },
  warning: {
    icon: AlertTriangle,
    bgGradient: 'from-red-500 to-red-700',
    borderColor: 'border-red-400',
    sound: 'warning'
  }
};

export default function NotificationToast({ 
  notification, 
  onDismiss,
  autoHideDuration = 5000 
}) {
  useEffect(() => {
    if (notification && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [notification, autoHideDuration, onDismiss]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[2000] w-[90%] max-w-sm"
        >
          <NotificationCard notification={notification} onDismiss={onDismiss} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NotificationCard({ notification, onDismiss }) {
  const config = notificationTypes[notification.type] || notificationTypes.zone_unlocked;
  const Icon = config.icon;

  return (
    <motion.div
      className={`relative bg-gradient-to-r ${config.bgGradient} rounded-xl shadow-2xl overflow-hidden border-2 ${config.borderColor}`}
      initial={{ rotateX: -15 }}
      animate={{ rotateX: 0 }}
    >
      {/* Sparkle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
              y: [0, -10, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative p-4 flex items-start gap-3">
        {/* Icon */}
        <motion.div
          className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medieval font-bold text-white text-lg">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-white/80 text-sm mt-0.5">
              {notification.message}
            </p>
          )}
          {notification.xp && (
            <motion.div
              className="inline-flex items-center gap-1 mt-2 bg-white/20 rounded-full px-2 py-0.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <Star className="w-3 h-3 text-yellow-300" />
              <span className="text-xs text-white font-bold">+{notification.xp} XP</span>
            </motion.div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Bottom decoration */}
      <div className="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </motion.div>
  );
}