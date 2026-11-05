import React, { useState, useEffect } from 'react';
import { Compass, Database, RefreshCw } from 'lucide-react';

interface StatusBarProps {
  crs: string;
  isOnline: boolean;
  offlineCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ crs, isOnline, offlineCount }) => {
  const [coords, setCoords] = useState({ lat: 19.0438, lng: -98.1983, utmX: 584320, utmY: 2105430 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Sub-millimetric coordinate variation based on cursor
      const latOffset = ((window.innerHeight - e.clientY) / window.innerHeight - 0.5) * 0.05;
      const lngOffset = (e.clientX / window.innerWidth - 0.5) * 0.05;
      setCoords({
        lat: Number((19.0438 + latOffset).toFixed(5)),
        lng: Number((-98.1983 + lngOffset).toFixed(5)),
        utmX: Math.round(584320 + lngOffset * 100000),
        utmY: Math.round(2105430 + latOffset * 100000),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <footer className="h-7 border-t border-terranova-800 bg-terranova-950/95 px-3 flex items-center justify-between text-[11px] font-mono text-terranova-300 z-30 select-none">
      {/* Left: Spatial Coordinates and Projections */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-terranova-400">
          <Compass className="w-3.5 h-3.5" />
          <span>WGS84: {coords.lat.toFixed(5)}° N, {Math.abs(coords.lng).toFixed(5)}° W</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-gray-400">
          <span>UTM: X: {coords.utmX}m, Y: {coords.utmY}m</span>
        </div>
        <div className="px-1.5 py-0.2 rounded bg-terranova-900 border border-terranova-800 text-[10px] text-terranova-300">
          CRS: {crs}
        </div>
      </div>

      {/* Right: Engine Status, IndexedDB and Version */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Database className="w-3 h-3 text-terranova-400" />
          <span>Dexie.js IndexedDB: {isOnline ? 'Sincronizado' : `${offlineCount} mutaciones en cola`}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <RefreshCw className={`w-3 h-3 ${isOnline ? 'text-emerald-400' : 'text-amber-400 animate-spin'}`} />
          <span>{isOnline ? 'Sync OK' : 'Cola Activa'}</span>
        </div>
        <span className="text-[10px] text-gray-500">TERRANOVA v1.0.0</span>
      </div>
    </footer>
  );
};
