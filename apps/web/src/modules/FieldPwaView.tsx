import React, { useState } from 'react';
import { Smartphone, Wifi, WifiOff, Camera, MapPin, Database } from 'lucide-react';

interface FieldPwaViewProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  offlineCount?: number;
}

export const FieldPwaView: React.FC<FieldPwaViewProps> = ({
  isOnline,
  onToggleOnline,
}) => {
  const [localReports, setLocalReports] = useState<Array<{ id: string; type: string; neighborhood: string; status: string }>>([
    { id: 'LOC-OP-01', type: 'Bache en crucero', neighborhood: 'Col. San Manuel', status: 'PENDING' },
    { id: 'LOC-OP-02', type: 'Luminaria fundida', neighborhood: 'Av. Juárez', status: 'PENDING' },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [photoAttached, setPhotoAttached] = useState(false);

  const handleCaptureLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const item = {
      id: `LOC-OP-0${localReports.length + 1}`,
      type: newTitle,
      neighborhood: 'Sector Operativo Campo (GPS Capturado)',
      status: isOnline ? 'CONFIRMED' : 'PENDING',
    };
    setLocalReports([item, ...localReports]);
    setNewTitle('');
    setPhotoAttached(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col lg:flex-row gap-6 items-center justify-center gis-grid-bg">
      {/* Left Explanation Card */}
      <div className="max-w-md space-y-4 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terranova-800 border border-terranova-600 text-terranova-300 text-xs font-mono">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Módulo 09: TERRANOVA FIELD (PWA)</span>
        </div>
        <h2 className="text-2xl font-black text-white">
          Simulador de Operación en Campo Offline-First
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed">
          Las brigadas municipales e inspectores de obra utilizan TERRANOVA desde teléfonos celulares rugerizados o tabletas en zonas sin señal celular. Toda inspección, fotografía y coordenada GPS se almacena de inmediato en **IndexedDB con Dexie.js** mediante colas transaccionales con claves de idempotencia (`client_operation_id`).
        </p>

        <div className="p-3.5 rounded-xl bg-terranova-900/90 border border-terranova-700 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Estado de Conexión:</span>
            <button
              onClick={onToggleOnline}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                isOnline ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' : 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'CONECTADO (ONLINE)' : 'SIN SEÑAL (OFFLINE)'}</span>
            </button>
          </div>
          <div className="flex justify-between text-gray-400 pt-1 border-t border-terranova-800">
            <span>Operaciones en IndexedDB:</span>
            <span className="font-mono text-terranova-400 font-bold">{localReports.length} registros</span>
          </div>
        </div>
      </div>

      {/* Right: Smartphone Mobile Mockup */}
      <div className="w-[320px] h-[580px] bg-terranova-950 rounded-[38px] border-4 border-terranova-700 shadow-2xl p-3 flex flex-col justify-between relative overflow-hidden select-none">
        {/* Phone Notch & Status Bar */}
        <div className="flex justify-between items-center px-4 py-1 text-[10px] font-mono text-gray-400">
          <span>12:28</span>
          <div className="w-16 h-3 bg-terranova-800 rounded-full mx-auto" />
          <div className="flex items-center gap-1">
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
            <span className="text-[9px]">100%</span>
          </div>
        </div>

        {/* PWA Screen Content */}
        <div className="flex-1 bg-terranova-900 rounded-[24px] p-3 flex flex-col justify-between overflow-hidden border border-terranova-800">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-terranova-800">
              <span className="text-xs font-bold text-white">TERRANOVA Field</span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                isOnline ? 'bg-emerald-900/60 text-emerald-400' : 'bg-amber-900/60 text-amber-300'
              }`}>
                {isOnline ? 'ONLINE' : 'MODO SIN RED'}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleCaptureLocal} className="mt-3 space-y-2.5">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Tipo de Incidencia / Inspección</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Fuga de drenaje en banqueta"
                  className="w-full bg-terranova-950 border border-terranova-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-terranova-500 font-sans"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoAttached(!photoAttached)}
                  className={`flex-1 py-1.5 rounded-lg border text-[11px] font-mono flex items-center justify-center gap-1 transition-all ${
                    photoAttached
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-terranova-800 border-terranova-700 text-gray-300'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  <span>{photoAttached ? 'Foto Lista' : 'Tomar Foto'}</span>
                </button>

                <div className="flex-1 py-1.5 rounded-lg bg-terranova-950 border border-terranova-800 text-[10px] font-mono text-terranova-400 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>GPS 19.04° N</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech flex items-center justify-center gap-1.5 transition-all"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Guardar en IndexedDB</span>
              </button>
            </form>

            {/* Local Queue List in Phone */}
            <div className="mt-4 pt-2 border-t border-terranova-800">
              <span className="text-[10px] font-mono text-gray-400 block mb-1">Cola Local en Dispositivo</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {localReports.map((r) => (
                  <div key={r.id} className="p-1.5 rounded bg-terranova-950 border border-terranova-800 text-[10px] flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium truncate max-w-[150px]">{r.type}</p>
                      <span className="text-[9px] text-gray-500 font-mono">{r.id}</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
                      r.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-[9px] font-mono text-gray-500">
            PWA Service Worker Activo • CacheStorage v1.0
          </div>
        </div>

        {/* Home Indicator */}
        <div className="w-24 h-1 bg-terranova-600 rounded-full mx-auto my-1" />
      </div>
    </div>
  );
};
