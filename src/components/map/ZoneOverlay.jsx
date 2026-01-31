import React from 'react';
import { Polygon, Popup, Tooltip } from 'react-leaflet';

const themeColors = {
  varrock: { fill: '#8B4513', stroke: '#5C2D0E' },
  lumbridge: { fill: '#228B22', stroke: '#145214' },
  falador: { fill: '#4169E1', stroke: '#2B4AA0' },
  wilderness: { fill: '#2F2F2F', stroke: '#1a1a1a' },
  camelot: { fill: '#9932CC', stroke: '#6B238E' },
  ardougne: { fill: '#DC143C', stroke: '#9B0F2C' }
};

export default function ZoneOverlay({ zones, onZoneClick }) {
  if (!zones || zones.length === 0) return null;

  return (
    <>
      {zones.map(zone => {
        let coordinates;
        try {
          const boundary = typeof zone.boundary === 'string' 
            ? JSON.parse(zone.boundary) 
            : zone.boundary;
          
          if (boundary?.coordinates?.[0]) {
            coordinates = boundary.coordinates[0].map(coord => [coord[1], coord[0]]);
          } else {
            coordinates = boundary;
          }
        } catch {
          return null;
        }

        if (!coordinates) return null;

        const colors = themeColors[zone.theme] || { fill: zone.color || '#666666', stroke: '#444444' };
        const isUnlocked = zone.unlocked;

        return (
          <Polygon
            key={zone.id}
            positions={coordinates}
            pathOptions={{
              fillColor: isUnlocked ? colors.fill : '#333333',
              fillOpacity: isUnlocked ? 0.3 : 0,
              color: isUnlocked ? colors.stroke : 'transparent',
              weight: isUnlocked ? 2 : 0,
              dashArray: isUnlocked ? null : '5, 5'
            }}
            eventHandlers={{
              click: () => onZoneClick && onZoneClick(zone)
            }}
          >
            {isUnlocked && (
              <>
                <Tooltip permanent direction="center" className="zone-label">
                  <span className="font-medieval text-sm font-bold" style={{ color: colors.stroke }}>
                    {zone.name}
                  </span>
                </Tooltip>
                <Popup>
                  <div className="font-medieval">
                    <div className="font-bold text-lg text-amber-800">{zone.name}</div>
                    {zone.description && (
                      <p className="text-sm text-gray-600 mt-1">{zone.description}</p>
                    )}
                    {zone.unlock_timestamp && (
                      <p className="text-xs text-gray-500 mt-2">
                        Discovered: {new Date(zone.unlock_timestamp).toLocaleDateString()}
                      </p>
                    )}
                    {zone.points_reward && (
                      <p className="text-xs text-amber-600 mt-1">
                        +{zone.points_reward} XP earned
                      </p>
                    )}
                  </div>
                </Popup>
              </>
            )}
          </Polygon>
        );
      })}
    </>
  );
}