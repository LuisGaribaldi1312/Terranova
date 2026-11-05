import React, { useState } from 'react';
import { 
  Layers, 
  Ruler, 
  Square, 
  Download, 
  Plus, 
  Eye, 
  EyeOff, 
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { LayerItem, PropertyItem, IncidentItem } from '../types';

interface GisExplorerViewProps {
  layers: LayerItem[];
  onToggleLayer: (id: string) => void;
  properties: PropertyItem[];
  incidents: IncidentItem[];
  onSelectProperty: (p: PropertyItem) => void;
  onSelectIncident: (i: IncidentItem) => void;
  crs?: string;
}

export const GisExplorerView: React.FC<GisExplorerViewProps> = ({
  layers,
  onToggleLayer,
  properties,
  incidents,
  onSelectProperty,
  onSelectIncident,
}) => {
  const [activeBaseMap, setActiveBaseMap] = useState<'osm' | 'sat' | 'dark'>('dark');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [measureResult, setMeasureResult] = useState<string | null>(null);

  const handleToolClick = (tool: string) => {
    if (activeTool === tool) {
      setActiveTool(null);
      setMeasureResult(null);
    } else {
      setActiveTool(tool);
      if (tool === 'distance') {
        setMeasureResult('Longitud medida: 1,420.50 metros (EPSG:6362 ITRF2008)');
      } else if (tool === 'area') {
        setMeasureResult('Superficie medida: 12,850.00 m² (1.285 ha)');
      } else if (tool === 'download') {
        alert('Generando paquete cartográfico offline (Vector Tiles + GeoJSON) para uso en campo sin conexión.');
        setActiveTool(null);
      }
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden relative bg-[#07131B]">
      {/* Left Layer & Cartographic Control Panel */}
      <div className="w-72 border-r border-terranova-800 bg-terranova-900/95 backdrop-blur-md flex flex-col justify-between z-10 shadow-panel-dark">
        <div className="p-3 border-b border-terranova-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-terranova-400" />
              Gestor de Capas GIS
            </span>
            <span className="text-[10px] font-mono text-terranova-300 px-1.5 py-0.5 rounded bg-terranova-800">
              {layers.filter(l => l.active).length} activas
            </span>
          </div>
        </div>

        {/* Layer Groups List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
          <div>
            <span className="text-[10px] font-mono text-terranova-400 uppercase tracking-wider block mb-2">
              Capas Vectoriales del Municipio
            </span>
            <div className="space-y-1.5">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  onClick={() => onToggleLayer(layer.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all ${
                    layer.active
                      ? 'bg-terranova-800/80 border-terranova-600 text-white shadow-sm'
                      : 'bg-terranova-950/40 border-terranova-800/60 text-gray-400 hover:bg-terranova-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div>
                      <p className="text-xs font-medium leading-tight">{layer.name}</p>
                      <span className="text-[9px] font-mono text-gray-400">{layer.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-terranova-300 font-bold">{layer.count}</span>
                    {layer.active ? (
                      <Eye className="w-3.5 h-3.5 text-terranova-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Base Map Selector */}
          <div className="pt-2 border-t border-terranova-800">
            <span className="text-[10px] font-mono text-terranova-400 uppercase tracking-wider block mb-2">
              Cartografía Base (MapLibre Engine)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'dark', label: 'Dark GIS' },
                { id: 'sat', label: 'Satélite' },
                { id: 'osm', label: 'OpenStreet' },
              ].map((map) => (
                <button
                  key={map.id}
                  onClick={() => setActiveBaseMap(map.id as any)}
                  className={`py-1.5 rounded text-[10px] font-mono border transition-all ${
                    activeBaseMap === map.id
                      ? 'bg-terranova-500 text-terranova-950 font-bold border-terranova-400 shadow-glow-tech'
                      : 'bg-terranova-800/60 text-gray-400 border-terranova-700 hover:text-white'
                  }`}
                >
                  {map.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Add Layer Button */}
        <div className="p-3 border-t border-terranova-800 bg-terranova-950/60">
          <button
            onClick={() => alert('Abriendo Asistente de Carga de Capas OGC (WMS/WMTS/GeoJSON)...')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-terranova-800 hover:bg-terranova-700 text-white font-medium border border-terranova-700 text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-terranova-400" />
            <span>Importar Capa GeoJSON / WMS</span>
          </button>
        </div>
      </div>

      {/* Main Fullscreen GIS Map Canvas */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Floating Spatial Measurement & Drawing Toolbar */}
        <div className="absolute top-4 left-4 bg-terranova-900/90 backdrop-blur-md border border-terranova-700 rounded-xl p-1.5 shadow-panel-dark flex items-center gap-1 z-20">
          <button
            onClick={() => handleToolClick('distance')}
            className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              activeTool === 'distance'
                ? 'bg-terranova-500 text-terranova-950 font-bold shadow-glow-tech'
                : 'text-gray-300 hover:bg-terranova-800 hover:text-white'
            }`}
            title="Medir Distancia en metros"
          >
            <Ruler className="w-4 h-4" />
            <span className="hidden sm:inline">Medir Distancia</span>
          </button>

          <button
            onClick={() => handleToolClick('area')}
            className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              activeTool === 'area'
                ? 'bg-terranova-500 text-terranova-950 font-bold shadow-glow-tech'
                : 'text-gray-300 hover:bg-terranova-800 hover:text-white'
            }`}
            title="Medir Superficie en m² y Hectáreas"
          >
            <Square className="w-4 h-4" />
            <span className="hidden sm:inline">Medir Área</span>
          </button>

          <div className="h-5 w-px bg-terranova-800 mx-1" />

          <button
            onClick={() => handleToolClick('download')}
            className="p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 text-terranova-300 hover:bg-terranova-800 hover:text-white transition-all"
            title="Descargar BBOX para uso offline en PWA"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Paquete Offline</span>
          </button>
        </div>

        {/* Map Zoom Controls */}
        <div className="absolute top-4 right-4 bg-terranova-900/90 backdrop-blur-md border border-terranova-700 rounded-xl p-1 flex flex-col gap-1 z-20 shadow-panel-dark">
          <button className="p-2 rounded-lg text-gray-300 hover:bg-terranova-800 hover:text-white" title="Acercar">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-gray-300 hover:bg-terranova-800 hover:text-white" title="Alejar">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-gray-300 hover:bg-terranova-800 hover:text-white" title="Vista Global">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Measurement Result Badge */}
        {measureResult && (
          <div className="absolute top-18 left-4 bg-terranova-950/95 border border-terranova-500 rounded-xl px-4 py-2 text-xs font-mono text-terranova-300 shadow-glow-tech z-20 animate-in fade-in">
            {measureResult}
          </div>
        )}

        {/* Vector SVG Geospatial Rendering Simulation */}
        <div className="w-full h-full relative cursor-crosshair">
          <svg className="w-full h-full">
            <defs>
              <pattern id="gisPattern" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(23, 169, 135, 0.08)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gisPattern)" />

            {/* Municipal Sectors */}
            <polygon
              points="120,60 520,30 960,110 1100,480 720,580 240,540 90,320"
              fill="rgba(18, 60, 80, 0.25)"
              stroke="#17A987"
              strokeWidth="2"
            />

            {/* Simulated Water Network Line */}
            <path
              d="M 140 180 Q 420 220 740 160 T 1020 340"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeDasharray="6 3"
            />

            {/* Interactive Properties in GIS View */}
            {properties.map((prop, idx) => {
              const x = 240 + (idx * 140) % 680;
              const y = 140 + (idx * 90) % 360;
              return (
                <g key={prop.id} onClick={() => onSelectProperty(prop)} className="cursor-pointer group">
                  <rect
                    x={x}
                    y={y}
                    width="110"
                    height="70"
                    fill="rgba(23, 169, 135, 0.3)"
                    stroke="#22C49F"
                    strokeWidth="1.5"
                    className="hover:fill-terranova-500/60 transition-colors"
                  />
                  <text x={x + 8} y={y + 22} fill="#FFFFFF" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    {prop.cadastralKey}
                  </text>
                  <text x={x + 8} y={y + 38} fill="#C2E5DE" fontSize="9">
                    {prop.neighborhood}
                  </text>
                  <text x={x + 8} y={y + 54} fill="#5EE0C1" fontSize="9" fontWeight="bold">
                    ${(prop.cadastralValue / 1000000).toFixed(2)}M MXN
                  </text>
                </g>
              );
            })}

            {/* Active Incident Markers */}
            {incidents.map((inc, idx) => {
              const ix = 310 + (idx * 160) % 650;
              const iy = 210 + (idx * 75) % 320;
              return (
                <g key={inc.id} onClick={() => onSelectIncident(inc)} className="cursor-pointer animate-pulse">
                  <circle cx={ix} cy={iy} r="8" fill="#EF4444" />
                  <circle cx={ix} cy={iy} r="18" fill="rgba(239, 68, 68, 0.3)" />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
