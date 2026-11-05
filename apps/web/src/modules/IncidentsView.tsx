import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, Filter, Camera, MapPin } from 'lucide-react';
import { IncidentItem } from '../types';

interface IncidentsViewProps {
  incidents: IncidentItem[];
  onSelectIncident: (i: IncidentItem) => void;
  onFocusMap: (coords: [number, number]) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onSelectIncident,
  onFocusMap,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filtered = incidents.filter((inc) => {
    const matchPri = filterPriority === 'ALL' || inc.priority === filterPriority;
    const matchSearch = inc.folio.toLowerCase().includes(search.toLowerCase()) ||
                        inc.title.toLowerCase().includes(search.toLowerCase()) ||
                        inc.neighborhood.toLowerCase().includes(search.toLowerCase());
    return matchPri && matchSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 gis-grid-bg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-terranova-900/90 border border-terranova-700/80 p-4 rounded-2xl shadow-panel-dark">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Mesa de Control de Incidencias Urbanas
          </h2>
          <p className="text-xs text-gray-400">
            Recepción, asignación y resolución de reportes de bacheo, fugas de agua y alumbrado público.
          </p>
        </div>

        <button
          onClick={() => alert('Abriendo Formulario de Registro de Incidencia Urbana con Geocodificación GPS...')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold shadow-glow-tech transition-all text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Reportar Incidencia</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-terranova-950/70 p-3 rounded-xl border border-terranova-800">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Folio, Problema o Colonia..."
            className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-terranova-400 mr-1" />
          {['ALL', 'Crítica', 'Alta', 'Media', 'Baja'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                filterPriority === p
                  ? 'bg-terranova-500 text-terranova-950 font-bold'
                  : 'bg-terranova-800/60 text-gray-400 hover:text-white'
              }`}
            >
              {p === 'ALL' ? 'Todas las Prioridades' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            onClick={() => onSelectIncident(inc)}
            className="p-4 rounded-xl bg-terranova-900/80 border border-terranova-700/70 hover:border-terranova-500 shadow-panel-dark transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-white group-hover:text-terranova-300 transition-colors">
                  {inc.folio}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  inc.priority === 'Crítica' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  inc.priority === 'Alta' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-sky-500/20 text-sky-400'
                }`}>
                  {inc.priority}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-white leading-snug">{inc.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{inc.neighborhood}</p>

              <div className="my-3 p-2.5 rounded-lg bg-terranova-950/70 border border-terranova-800 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipo de Falla:</span>
                  <span className="text-white font-medium">{inc.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado:</span>
                  <span className="text-amber-400 font-bold">{inc.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dependencia:</span>
                  <span className="text-terranova-300 truncate max-w-[170px]">{inc.assignedDept}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-terranova-800/80">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFocusMap(inc.coordinates);
                }}
                className="flex-1 py-1.5 rounded bg-terranova-800 hover:bg-terranova-700 text-terranova-200 text-xs font-mono flex items-center justify-center gap-1 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Geolocalizar</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Abriendo captura de evidencia fotográfica de resolución para ${inc.folio}...`);
                }}
                className="flex-1 py-1.5 rounded bg-terranova-800 hover:bg-terranova-700 text-white text-xs font-mono flex items-center justify-center gap-1 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Evidencias</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
