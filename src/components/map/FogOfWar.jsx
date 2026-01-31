import React, { useMemo } from 'react';
import { Polygon, useMap } from 'react-leaflet';
import { isPointInPolygon } from './GPSTracker';

// Creates fog overlay for unexplored areas
export default function FogOfWar({ zones, locationHistory, fogOpacity = 0.7 }) {
  const map = useMap();
  
  // Get the visible bounds and create a large covering rectangle
  const fogPolygon = useMemo(() => {
    // Create a massive polygon covering the entire visible area
    const worldBounds = [
      [90, -180],
      [90, 180],
      [-90, 180],
      [-90, -180],
      [90, -180]
    ];
    
    return worldBounds;
  }, []);

  // Get holes for explored zones
  const exploredHoles = useMemo(() => {
    if (!zones || zones.length === 0) return [];
    
    return zones
      .filter(zone => zone.unlocked)
      .map(zone => {
        try {
          const boundary = typeof zone.boundary === 'string' 
            ? JSON.parse(zone.boundary) 
            : zone.boundary;
          
          if (boundary?.coordinates?.[0]) {
            // GeoJSON format: [lng, lat]
            return boundary.coordinates[0].map(coord => [coord[1], coord[0]]);
          }
          return boundary;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }, [zones]);

  // Also create small circles around visited locations not in zones
  const exploredPoints = useMemo(() => {
    if (!locationHistory || locationHistory.length === 0) return [];
    
    const revealRadius = 50; // meters
    const points = [];
    const processed = new Set();
    
    locationHistory.forEach(loc => {
      // Grid the locations to reduce overlapping circles
      const key = `${Math.floor(loc.latitude * 1000)},${Math.floor(loc.longitude * 1000)}`;
      if (processed.has(key)) return;
      processed.add(key);
      
      // Check if point is already in an unlocked zone
      const inUnlockedZone = zones?.some(zone => {
        if (!zone.unlocked) return false;
        try {
          const boundary = typeof zone.boundary === 'string' 
            ? JSON.parse(zone.boundary) 
            : zone.boundary;
          const coords = boundary?.coordinates?.[0] || boundary;
          return isPointInPolygon({ lat: loc.latitude, lng: loc.longitude }, coords);
        } catch {
          return false;
        }
      });
      
      if (!inUnlockedZone) {
        // Create a small circular polygon
        const circle = createCirclePolygon(loc.latitude, loc.longitude, revealRadius);
        points.push(circle);
      }
    });
    
    return points;
  }, [locationHistory, zones]);

  // Combine zone holes and explored points
  const allHoles = [...exploredHoles, ...exploredPoints];

  return (
    <Polygon
      positions={allHoles.length > 0 ? [fogPolygon, ...allHoles] : [fogPolygon]}
      pathOptions={{
        fillColor: '#1a1a2e',
        fillOpacity: fogOpacity,
        color: '#1a1a2e',
        weight: 0,
        interactive: false
      }}
    />
  );
}

// Helper to create circular polygon approximation
function createCirclePolygon(lat, lng, radiusMeters, points = 16) {
  const coords = [];
  const earthRadius = 6371000;
  
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dLat = (radiusMeters / earthRadius) * Math.cos(angle) * (180 / Math.PI);
    const dLng = (radiusMeters / earthRadius) * Math.sin(angle) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
    coords.push([lat + dLat, lng + dLng]);
  }
  
  return coords;
}