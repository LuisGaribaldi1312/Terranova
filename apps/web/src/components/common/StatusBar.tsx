import React, { useState, useEffect } from 'react';
import { Compass, Database, RefreshCw } from 'lucide-react';

interface StatusBarProps {
  crs: string;
  isOnline: boolean;
  offlineCount: number;
  currentCenter?: [number, number];
  isDarkMode?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  crs, 
  isOnline, 
  offlineCount,
  currentCenter = [-99.1332, 19.4326],
  isDarkMode = true,
}) => {
  const [coords, setCoords] = useState({ 
    lat: currentCenter[1], 
    lng: currentCenter[0], 
    utmX: 584320, 
    utmY: 2105430 
  });

  useEffect(() => {
    setCoords({
      lat: currentCenter[1],
      lng: currentCenter[0],
      utmX: Math.round(500000 + (currentCenter[0] + 100) * 10000),
      utmY: Math.round(2000000 + (currentCenter[1] - 19) * 110000),
    });
  }, [currentCenter[0], currentCenter[1]]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const latOffset = ((window.innerHeight - e.clientY) / window.innerHeight - 0.5) * 0.02;
      const lngOffset = (e.clientX / window.innerWidth - 0.5) * 0.02;
      setCoords({
        lat: Number((currentCenter[1] + latOffset).toFixed(5)),
        lng: Number((currentCenter[0] + lngOffset).toFixed(5)),
        utmX: Math.round(500000 + (currentCenter[0] + 100 + lngOffset) * 10000),
        utmY: Math.round(2000000 + (currentCenter[1] - 19 + latOffset) * 110000),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [currentCenter]);

  return (
    <footer className={`h-7 border-t px-3 flex items-center justify-between text-[11px] font-mono z-30 select-none ${
      isDarkMode ? 'bg-[#07131B] border-terranova-800 text-terranova-300' : 'bg-slate-100 border-slate-200 text-slate-700'
    }`}>
      {/* Left: Spatial Coordinates and Projections */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>WGS84: {coords.lat.toFixed(5)}° N, {Math.abs(coords.lng).toFixed(5)}° W</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-gray-500">
          <span>UTM: X: {coords.utmX}m, Y: {coords.utmY}m</span>
        </div>
        <div className={`px-1.5 py-0.2 rounded border text-[10px] ${
          isDarkMode ? 'bg-terranova-900 border-terranova-800 text-terranova-300' : 'bg-white border-slate-300 text-slate-800'
        }`}>
          CRS: {crs}
        </div>
      </div>

      {/* Right: Engine Status, IndexedDB and Version */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Database className="w-3 h-3 text-emerald-500" />
          <span>Dexie.js IndexedDB: {isOnline ? 'Sincronizado' : `${offlineCount} mutaciones en cola`}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <RefreshCw className={`w-3 h-3 ${isOnline ? 'text-emerald-500' : 'text-amber-500 animate-spin'}`} />
          <span>{isOnline ? 'Sync OK' : 'Cola Activa'}</span>
        </div>
        <span className="text-[10px] text-gray-400">TERRANOVA v1.0.0</span>
      </div>
    </footer>
  );
};
