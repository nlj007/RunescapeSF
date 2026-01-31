import React, { useEffect, useRef, useState } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// San Francisco default center
const SF_CENTER = [37.7749, -122.4194];
const DEFAULT_ZOOM = 13;

function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function MapContainer({ 
  children, 
  center = SF_CENTER, 
  zoom = DEFAULT_ZOOM,
  mapStyle = 'classic',
  customTileUrl = null,
  onMapReady,
  className = ''
}) {
  const mapRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Different map tile styles
  const tileUrls = {
    classic: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    parchment: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
    custom: customTileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  const attribution = {
    classic: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    dark: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    parchment: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
    custom: 'Local tiles'
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <LeafletMapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        className="w-full h-full"
        ref={mapRef}
        whenReady={() => {
          setIsReady(true);
          if (onMapReady) onMapReady(mapRef.current);
        }}
      >
        <TileLayer
          url={tileUrls[mapStyle] || tileUrls.classic}
          attribution={attribution[mapStyle] || attribution.classic}
        />
        <ZoomControl position="topright" />
        <MapController center={center} zoom={zoom} />
        {isReady && children}
      </LeafletMapContainer>
    </div>
  );
}