import React from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Gem, 
  User, 
  Landmark, 
  Store, 
  Building2, 
  AlertTriangle, 
  Eye, 
  Sparkles,
  ScrollText 
} from 'lucide-react';
import { renderToString } from 'react-dom/server';

const iconConfig = {
  quest: { icon: MapPin, color: '#FFD700', bg: '#FFF8DC' },
  treasure: { icon: Gem, color: '#9932CC', bg: '#E6E6FA' },
  npc: { icon: User, color: '#228B22', bg: '#90EE90' },
  landmark: { icon: Landmark, color: '#4169E1', bg: '#B0C4DE' },
  shop: { icon: Store, color: '#FF8C00', bg: '#FFEFD5' },
  bank: { icon: Building2, color: '#FFD700', bg: '#FFFACD' },
  danger: { icon: AlertTriangle, color: '#DC143C', bg: '#FFB6C1' },
  hidden: { icon: Eye, color: '#708090', bg: '#D3D3D3' },
  portal: { icon: Sparkles, color: '#9400D3', bg: '#DDA0DD' },
  clue_scroll: { icon: ScrollText, color: '#8B4513', bg: '#DEB887' }
};

const createPinIcon = (iconType, visited) => {
  const config = iconConfig[iconType] || iconConfig.quest;
  const IconComponent = config.icon;
  
  const iconHtml = `
    <div class="relative ${visited ? 'opacity-60' : ''}">
      <div class="w-10 h-10 rounded-full border-3 shadow-lg flex items-center justify-center transform transition-transform hover:scale-110"
           style="background: ${config.bg}; border-color: ${config.color}; border-width: 3px;">
        <span style="color: ${config.color}">
          ${renderToString(<IconComponent className="w-5 h-5" />)}
        </span>
      </div>
      ${visited ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"><span class="text-white text-xs">✓</span></div>' : ''}
    </div>
  `;

  return L.divIcon({
    className: 'pin-marker',
    html: iconHtml,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

export default function PinMarker({ 
  pin, 
  playerPosition, 
  onPinReached,
  showTriggerRadius = false 
}) {
  if (!pin) return null;
  
  const { latitude, longitude, icon_type, title, description, trigger_radius, visited, hidden_until_close, points_reward } = pin;
  
  // Check if pin should be hidden
  if (hidden_until_close && playerPosition) {
    const distance = calculateDistanceSimple(
      playerPosition.lat, playerPosition.lng,
      latitude, longitude
    );
    if (distance > (trigger_radius || 50)) {
      return null;
    }
  }

  return (
    <>
      {/* Trigger radius circle */}
      {showTriggerRadius && trigger_radius && (
        <Circle
          center={[latitude, longitude]}
          radius={trigger_radius}
          pathOptions={{
            color: visited ? '#22c55e' : '#d4a634',
            fillColor: visited ? '#22c55e' : '#d4a634',
            fillOpacity: 0.1,
            weight: 1,
            dashArray: '3, 3'
          }}
        />
      )}
      
      <Marker
        position={[latitude, longitude]}
        icon={createPinIcon(icon_type || 'quest', visited)}
      >
        <Popup className="rs-popup">
          <div className="font-medieval min-w-[180px]">
            <div className="font-bold text-lg text-amber-800 flex items-center gap-2">
              {React.createElement(iconConfig[icon_type]?.icon || MapPin, { 
                className: "w-5 h-5", 
                style: { color: iconConfig[icon_type]?.color || '#FFD700' }
              })}
              {title}
            </div>
            {description && (
              <p className="text-sm text-gray-600 mt-2 italic">"{description}"</p>
            )}
            {points_reward && !visited && (
              <div className="mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded inline-block">
                +{points_reward} XP reward
              </div>
            )}
            {visited && (
              <div className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded inline-block">
                ✓ Completed
              </div>
            )}
          </div>
        </Popup>
      </Marker>
    </>
  );
}

function calculateDistanceSimple(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}