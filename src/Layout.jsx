import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-amber-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap');
        
        .font-medieval {
          font-family: 'Cinzel', serif;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #fef3c7;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #d97706;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #b45309;
        }
        
        /* Leaflet custom styles */
        .leaflet-container {
          font-family: 'Cinzel', serif;
        }
        
        .zone-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-weight: bold;
          text-shadow: 
            -1px -1px 0 #fff,
            1px -1px 0 #fff,
            -1px 1px 0 #fff,
            1px 1px 0 #fff;
        }
        
        .rs-popup .leaflet-popup-content-wrapper {
          background: linear-gradient(to bottom, #fef3c7, #fde68a);
          border: 2px solid #b45309;
          border-radius: 8px;
        }
        
        .rs-popup .leaflet-popup-tip {
          background: #fde68a;
          border: 2px solid #b45309;
        }
        
        .player-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .pin-marker {
          background: transparent !important;
          border: none !important;
        }
        
        /* Safe area padding for PWA */
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        
        .safe-area-pt {
          padding-top: env(safe-area-inset-top, 0);
        }
        
        /* Animations */
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(217, 119, 6, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(217, 119, 6, 0.8);
          }
        }
        
        .pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
      {children}
    </div>
  );
}