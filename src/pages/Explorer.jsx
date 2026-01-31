import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MapContainer from '@/components/map/MapContainer';
import PlayerMarker from '@/components/map/PlayerMarker';
import FogOfWar from '@/components/map/FogOfWar';
import ZoneOverlay from '@/components/map/ZoneOverlay';
import PinMarker from '@/components/map/PinMarker';
import { useGPSTracker, calculateDistance, isPointInPolygon } from '@/components/map/GPSTracker';
import StatsPanel from '@/components/ui/StatsPanel';
import GPSIndicator from '@/components/ui/GPSIndicator';
import NotificationToast from '@/components/ui/NotificationToast';
import BottomNav from '@/components/ui/BottomNav';
import { Loader2 } from 'lucide-react';

const SF_CENTER = [37.7749, -122.4194];

export default function Explorer() {
  const queryClient = useQueryClient();
  const [mapCenter, setMapCenter] = useState(SF_CENTER);
  const [notification, setNotification] = useState(null);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const lastPositionRef = useRef(null);
  const sessionIdRef = useRef(`session_${Date.now()}`);

  // GPS tracking
  const { position, error: gpsError, isTracking, accuracy } = useGPSTracker(3000, true);

  // Fetch data
  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: () => base44.entities.Zone.list()
  });

  const { data: pins = [] } = useQuery({
    queryKey: ['pins'],
    queryFn: () => base44.entities.Pin.list()
  });

  const { data: locationHistory = [] } = useQuery({
    queryKey: ['locationHistory'],
    queryFn: () => base44.entities.LocationHistory.list('-created_date', 1000)
  });

  const { data: userStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.list();
      return stats[0] || null;
    }
  });

  const { data: appSettings } = useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const list = await base44.entities.AppSettings.list();
      return list[0] || {};
    }
  });

  // Mutations
  const saveLocationMutation = useMutation({
    mutationFn: (locationData) => base44.entities.LocationHistory.create(locationData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locationHistory'] })
  });

  const updateStatsMutation = useMutation({
    mutationFn: async (data) => {
      const stats = await base44.entities.UserStats.list();
      if (stats[0]) {
        return base44.entities.UserStats.update(stats[0].id, data);
      } else {
        return base44.entities.UserStats.create(data);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userStats'] })
  });

  const unlockZoneMutation = useMutation({
    mutationFn: (zone) => base44.entities.Zone.update(zone.id, {
      unlocked: true,
      unlock_timestamp: new Date().toISOString()
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] })
  });

  const visitPinMutation = useMutation({
    mutationFn: (pin) => base44.entities.Pin.update(pin.id, {
      visited: true,
      visit_timestamp: new Date().toISOString()
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pins'] })
  });

  // Process position changes
  const processPosition = useCallback(async (pos) => {
    if (!pos) return;

    let distanceTraveled = 0;
    let unlockedNewZone = false;
    let currentZoneId = null;

    // Calculate distance from last position
    if (lastPositionRef.current) {
      distanceTraveled = calculateDistance(
        lastPositionRef.current.lat,
        lastPositionRef.current.lng,
        pos.lat,
        pos.lng
      );
    }

    // Check if in any zone
    for (const zone of zones) {
      try {
        const boundary = typeof zone.boundary === 'string' 
          ? JSON.parse(zone.boundary) 
          : zone.boundary;
        const coords = boundary?.coordinates?.[0] || boundary;
        
        if (isPointInPolygon(pos, coords)) {
          currentZoneId = zone.id;
          
          // Unlock zone if not already unlocked
          if (!zone.unlocked) {
            await unlockZoneMutation.mutateAsync(zone);
            unlockedNewZone = true;
            
            setNotification({
              type: 'zone_unlocked',
              title: `${zone.name} Discovered!`,
              message: zone.description || 'You\'ve unlocked a new region!',
              xp: zone.points_reward || 100
            });
          }
          break;
        }
      } catch (e) {
        console.error('Error checking zone:', e);
      }
    }

    // Check pins proximity
    for (const pin of pins) {
      if (pin.visited) continue;
      
      const distance = calculateDistance(pos.lat, pos.lng, pin.latitude, pin.longitude);
      const triggerRadius = pin.trigger_radius || 30;
      
      if (distance <= triggerRadius) {
        await visitPinMutation.mutateAsync(pin);
        
        setNotification({
          type: 'pin_reached',
          title: `${pin.title} Found!`,
          message: pin.description || 'You\'ve discovered a point of interest!',
          xp: pin.points_reward || 25
        });
        break;
      }
    }

    // Save location to history (throttled - every 10 meters or new zone)
    if (!lastPositionRef.current || distanceTraveled > 10 || unlockedNewZone) {
      saveLocationMutation.mutate({
        latitude: pos.lat,
        longitude: pos.lng,
        accuracy: accuracy,
        zone_id: currentZoneId,
        unlocked_new_zone: unlockedNewZone,
        session_id: sessionIdRef.current
      });

      // Update stats
      const currentStats = userStats || {};
      const newDistance = (currentStats.total_distance_meters || 0) + distanceTraveled;
      const newXP = (currentStats.experience_points || 0) + 
        (unlockedNewZone ? 100 : 0) + 
        Math.floor(distanceTraveled / 10);

      updateStatsMutation.mutate({
        total_distance_meters: newDistance,
        last_known_lat: pos.lat,
        last_known_lng: pos.lng,
        experience_points: newXP,
        zones_unlocked: zones.filter(z => z.unlocked).length + (unlockedNewZone ? 1 : 0),
        pins_visited: pins.filter(p => p.visited).length
      });
    }

    lastPositionRef.current = pos;
  }, [zones, pins, accuracy, userStats, saveLocationMutation, updateStatsMutation, unlockZoneMutation, visitPinMutation]);

  // Watch position changes
  useEffect(() => {
    if (position) {
      processPosition(position);
    }
  }, [position, processPosition]);

  // Center map on position
  useEffect(() => {
    if (position && !lastPositionRef.current) {
      setMapCenter([position.lat, position.lng]);
    }
  }, [position]);

  const handleRecenter = () => {
    if (position) {
      setMapCenter([position.lat, position.lng]);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-amber-50 relative">
      {/* Notification */}
      <NotificationToast 
        notification={notification} 
        onDismiss={() => setNotification(null)} 
      />

      {/* Stats Panel */}
      <StatsPanel 
        stats={userStats} 
        isExpanded={statsExpanded}
        onToggle={() => setStatsExpanded(!statsExpanded)}
      />

      {/* GPS Indicator */}
      <GPSIndicator
        position={position}
        accuracy={accuracy}
        isTracking={isTracking}
        error={gpsError}
        onRecenter={handleRecenter}
      />

      {/* Map */}
      <div className="absolute inset-0 pb-16">
        <MapContainer 
          center={mapCenter}
          zoom={15}
          mapStyle="classic"
        >
          {/* Zone overlays */}
          <ZoneOverlay zones={zones} />
          
          {/* Fog of War */}
          <FogOfWar 
            zones={zones}
            locationHistory={locationHistory}
            fogOpacity={0.75}
          />
          
          {/* Pins */}
          {pins.map(pin => (
            <PinMarker 
              key={pin.id}
              pin={pin}
              playerPosition={position}
              showTriggerRadius={true}
              globalIconUrls={appSettings || {}}
            />
          ))}
          
          {/* Player marker */}
          <PlayerMarker 
            position={position} 
            accuracy={accuracy} 
            customIconUrl={appSettings?.player_icon_url}
          />
        </MapContainer>
      </div>

      {/* Loading overlay */}
      {!position && !gpsError && (
        <div className="absolute inset-0 bg-amber-900/50 flex items-center justify-center z-[1500]">
          <div className="bg-amber-50 rounded-xl p-6 text-center shadow-2xl border-2 border-amber-600">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto" />
            <p className="mt-4 font-medieval text-amber-800 text-lg">Acquiring GPS Signal...</p>
            <p className="text-sm text-amber-600 mt-2">Please enable location services</p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav currentPage="Explorer" />
    </div>
  );
}