import React from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Create player icon - supports custom image or falls back to default
const createPlayerIcon = (customIconUrl) => {
  if (customIconUrl) {
    return L.divIcon({
      className: 'player-marker',
      html: `
        <div class="relative">
          <img src="${customIconUrl}" 
               class="w-10 h-10 object-contain drop-shadow-lg animate-pulse" 
               style="image-rendering: pixelated;"
               onerror="this.style.display='none'" />
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  }
  
  // Default RuneScape-style player icon
  return L.divIcon({
    className: 'player-marker',
    html: `
      <div class="relative">
        <div class="w-8 h-8 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 border-2 border-yellow-800 shadow-lg flex items-center justify-center animate-pulse">
          <svg class="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-yellow-600"></div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  });
};

export default function PlayerMarker({ position, accuracy, customIconUrl }) {
  if (!position) return null;

  return (
    <>
      {/* Accuracy circle */}
      {accuracy && accuracy < 100 && (
        <Circle
          center={[position.lat, position.lng]}
          radius={accuracy}
          pathOptions={{
            color: '#d4a634',
            fillColor: '#d4a634',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '5, 5'
          }}
        />
      )}
      
      {/* Player marker */}
      <Marker 
        position={[position.lat, position.lng]} 
        icon={createPlayerIcon(customIconUrl)}
      >
        <Popup className="rs-popup">
          <div className="text-center font-medieval">
            <div className="font-bold text-amber-800">Your Location</div>
            <div className="text-xs text-gray-600 mt-1">
              {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            </div>
            {accuracy && (
              <div className="text-xs text-gray-500 mt-1">
                Accuracy: ±{Math.round(accuracy)}m
              </div>
            )}
          </div>
        </Popup>
      </Marker>
    </>
  );
}