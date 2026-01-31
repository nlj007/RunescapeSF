import React from 'react';
import { motion } from 'framer-motion';
import { Signal, SignalHigh, SignalLow, SignalZero, Crosshair, AlertCircle } from 'lucide-react';

export default function GPSIndicator({ 
  position, 
  accuracy, 
  isTracking, 
  error,
  onRecenter 
}) {
  const getSignalStrength = () => {
    if (!accuracy) return 'none';
    if (accuracy < 10) return 'excellent';
    if (accuracy < 30) return 'good';
    if (accuracy < 100) return 'fair';
    return 'poor';
  };

  const signalConfig = {
    none: { icon: SignalZero, color: 'text-gray-400', bg: 'bg-gray-100', label: 'No Signal' },
    poor: { icon: SignalLow, color: 'text-red-500', bg: 'bg-red-50', label: 'Poor' },
    fair: { icon: SignalLow, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Fair' },
    good: { icon: SignalHigh, color: 'text-green-500', bg: 'bg-green-50', label: 'Good' },
    excellent: { icon: Signal, color: 'text-green-600', bg: 'bg-green-100', label: 'Excellent' }
  };

  const strength = getSignalStrength();
  const config = signalConfig[strength];
  const SignalIcon = config.icon;

  return (
    <div className="absolute bottom-24 right-4 z-[1000] flex flex-col gap-2 items-end">
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-100 border border-red-300 rounded-lg px-3 py-2 flex items-center gap-2 max-w-[200px]"
        >
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-xs text-red-700">{error}</span>
        </motion.div>
      )}

      {/* GPS Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${config.bg} border border-amber-300 rounded-lg shadow-lg overflow-hidden`}
      >
        <div className="px-3 py-2 flex items-center gap-3">
          {/* Signal Icon */}
          <div className="relative">
            <SignalIcon className={`w-5 h-5 ${config.color}`} />
            {isTracking && (
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600">GPS {config.label}</span>
            {position && (
              <span className="text-xs text-gray-500 font-mono">
                {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
              </span>
            )}
            {accuracy && (
              <span className="text-xs text-gray-400">
                ±{Math.round(accuracy)}m accuracy
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recenter Button */}
      {position && (
        <motion.button
          onClick={onRecenter}
          className="bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-600 rounded-full p-3 shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Crosshair className="w-5 h-5 text-amber-800" />
        </motion.button>
      )}
    </div>
  );
}