import { useState, useEffect, useCallback, useRef } from 'react';

export function useGPSTracker(pollingInterval = 3000, enabled = true) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const watchIdRef = useRef(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const successHandler = (pos) => {
      const { latitude, longitude, accuracy: acc } = pos.coords;
      setPosition({ lat: latitude, lng: longitude });
      setAccuracy(acc);
      setError(null);
    };

    const errorHandler = (err) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError('Location permission denied. Please enable location access.');
          break;
        case err.POSITION_UNAVAILABLE:
          setError('Location information unavailable.');
          break;
        case err.TIMEOUT:
          setError('Location request timed out.');
          break;
        default:
          setError('An unknown error occurred.');
      }
    };

    // Use watchPosition for continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      options
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return false;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      if (result.state === 'granted') {
        startTracking();
        return true;
      } else if (result.state === 'prompt') {
        startTracking();
        return true;
      } else {
        setError('Location permission denied');
        return false;
      }
    } catch {
      // Fallback for browsers that don't support permissions API
      startTracking();
      return true;
    }
  }, [startTracking]);

  useEffect(() => {
    if (enabled) {
      requestPermission();
    }
    return () => stopTracking();
  }, [enabled, requestPermission, stopTracking]);

  return {
    position,
    error,
    isTracking,
    accuracy,
    startTracking,
    stopTracking,
    requestPermission
  };
}

// Calculate distance between two coordinates in meters (Haversine formula)
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Check if point is inside polygon
export function isPointInPolygon(point, polygon) {
  const { lat, lng } = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0];
    const xj = polygon[j][1], yj = polygon[j][0];
    
    if (((yi > lng) !== (yj > lng)) &&
        (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

export default useGPSTracker;