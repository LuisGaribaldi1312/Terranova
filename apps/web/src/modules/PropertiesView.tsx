import React, { useState } from 'react';
import { Landmark, Search, Filter, Plus, FileText, MapPin } from 'lucide-react';
import { PropertyItem } from '../types';

interface PropertiesViewProps {
  properties: PropertyItem[];
  onSelectProperty: (p: PropertyItem) => void;
  onFocusMap: (coords: [number, number]) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  onSelectProperty,
  onFocusMap,
}) => {
  const [filterLandUse, setFilterLandUse] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filteredProperties = properties.filter((p) => {
    const matchUse = filterLandUse === 'ALL' || p.landUse === filterLandUse;
    const matchSearch = p.cadastralKey.toLowerCase().includes(search.toLowerCase()) ||
                        p.neighborhood.toLowerCase().includes(search.toLowerCase());
    return matchUse && matchSearch;
  });

  const totalLandArea = properties.reduce((acc, p) => acc + p.landArea, 0);
  const totalValue = properties.reduce((acc, p) => acc + p.cadastralValue, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 gis-grid-bg">
      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-terranova-900/90 border border-terranova-700/80 p-4 rounded-2xl shadow-panel-dark">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-terranova-400" />
            Catastro Municipal y Gestión de Predios
          </h2>
          <p className="text-xs text-gray-400">
            Registro oficial de predios, claves catastrales estandarizadas y expedientes inmobiliarios.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-terranova-800/80 border border-terranova-700">
            <span className="text-gray-400 block text-[10px]">Superficie Registrada</span>
            <span className="text-white font-bold">{totalLandArea.toLocaleString()} m²</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-terranova-800/80 border border-terranova-700">
            <span className="text-gray-400 block text-[10px]">Valor Catastral Total</span>
            <span className="text-emerald-400 font-bold">${(totalValue / 1000000).toFixed(1)}M MXN</span>
          </div>
          <button
            onClick={() => alert('Abriendo Formulario de Alta de Nuevo Predio Catastral...')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold shadow-glow-tech transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Predio</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-terranova-950/70 p-3 rounded-xl border border-terranova-800">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Clave Catastral o Colonia..."
            className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-terranova-400 mr-1" />
          {['ALL', 'Habitacional', 'Comercial', 'Mixto', 'Industrial'].map((u) => (
            <button
              key={u}
              onClick={() => setFilterLandUse(u)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                filterLandUse === u
                  ? 'bg-terranova-500 text-terranova-950 font-bold'
                  : 'bg-terranova-800/60 text-gray-400 hover:text-white'
              }`}
            >
              {u === 'ALL' ? 'Todos los Usos' : u}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProperties.map((prop) => (
          <div
            key={prop.id}
            onClick={() => onSelectProperty(prop)}
            className="p-4 rounded-xl bg-terranova-900/80 border border-terranova-700/70 hover:border-terranova-500 shadow-panel-dark transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-white group-hover:text-terranova-300 transition-colors">
                  {prop.cadastralKey}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  prop.status === 'Registrado' ? 'bg-emerald-500/20 text-emerald-400' :
                  prop.status === 'En Revisión' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {prop.status}
                </span>
              </div>

              <p className="text-xs text-gray-300 font-medium">{prop.neighborhood}</p>

              <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-terranova-950/70 text-[11px] font-mono border border-terranova-800">
                <div>
                  <span className="text-gray-500 block text-[9px]">ÁREA TERRENO</span>
                  <span className="text-white font-semibold">{prop.landArea} m²</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px]">CONSTRUIDO</span>
                  <span className="text-white font-semibold">{prop.builtArea} m²</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px]">USO DE SUELO</span>
                  <span className="text-terranova-400 font-semibold">{prop.landUse}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px]">VALOR CATASTRAL</span>
                  <span className="text-emerald-400 font-bold">${(prop.cadastralValue / 1000000).toFixed(2)}M</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-terranova-800/80">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFocusMap(prop.coordinates);
                }}
                className="flex-1 py-1.5 rounded bg-terranova-800 hover:bg-terranova-700 text-terranova-200 text-xs font-mono flex items-center justify-center gap-1 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Ver Mapa</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Generando Cédula Catastral de ${prop.cadastralKey}...`);
                }}
                className="flex-1 py-1.5 rounded bg-terranova-800 hover:bg-terranova-700 text-white text-xs font-mono flex items-center justify-center gap-1 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Cédula</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
