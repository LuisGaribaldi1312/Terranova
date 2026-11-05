import React, { useState } from 'react';
import { 
  Layers, 
  Ruler, 
  Square, 
  Download, 
  Eye, 
  EyeOff, 
  MousePointer,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { LayerItem, PropertyItem, IncidentItem } from '../types';
import { MapLibreMap, BaseMapStyle, GisToolMode } from '../maps/MapLibreMap';

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
  crs = 'EPSG:32614 (UTM Zona 14N)',
}) => {
  const [activeBaseMap, setActiveBaseMap] = useState<BaseMapStyle>('dark');
  const [activeTool, setActiveTool] = useState<GisToolMode>('pan');
  const [measurementInfo, setMeasurementInfo] = useState<{ type: 'distance' | 'area'; value: string } | null>(null);

  const handleToolSelect = (tool: GisToolMode) => {
    setActiveTool(tool);
    setMeasurementInfo(null);
  };

  const handleDownloadOfflinePackage = () => {
    // Generar GeoJSON descargable con todas las capas activas para uso sin red
    const geojsonPackage = {
      type: 'FeatureCollection',
      metadata: {
        system: 'TERRANOVA GIS Platform',
        crs: 'EPSG:4326',
        officialMexicanProjection: 'EPSG:6362 (ITRF2008)',
        exportedAt: new Date().toISOString(),
        totalProperties: properties.length,
        totalIncidents: incidents.length,
      },
      features: [
        ...properties.map((p) => ({
          type: 'Feature',
          properties: { ...p, layer: 'Catastro' },
          geometry: {
            type: 'Point',
            coordinates: p.coordinates,
          },
        })),
        ...incidents.map((i) => ({
          type: 'Feature',
          properties: { ...i, layer: 'Incidencias' },
          geometry: {
            type: 'Point',
            coordinates: i.coordinates,
          },
        })),
      ],
    };

    const blob = new Blob([JSON.stringify(geojsonPackage, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terranova-paquete-offline-${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex overflow-hidden relative bg-[#07131B]">
      {/* 1. Left Layer & Cartographic Control Panel */}
      <div className="w-72 border-r border-terranova-800 bg-terranova-900/95 backdrop-blur-md flex flex-col justify-between z-10 shadow-panel-dark select-none">
        <div className="p-3 border-b border-terranova-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-terranova-400" />
              Gestor de Capas GIS
            </span>
            <span className="text-[10px] font-mono text-terranova-300 px-1.5 py-0.5 rounded bg-terranova-800">
              {layers.filter((l) => l.active).length} activas
            </span>
          </div>
        </div>

        {/* Layer Groups List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          <div>
            <span className="text-[10px] font-mono text-terranova-400 uppercase tracking-wider block mb-2">
              Capas Vectoriales del Territorio
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
              Cartografía Base (MapLibre GL JS)
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

          {/* Projection Indicator Card */}
          <div className="p-2.5 rounded-lg bg-terranova-950 border border-terranova-800 text-[10px] font-mono text-gray-400 space-y-1">
            <div className="flex items-center gap-1 text-terranova-400 font-bold">
              <Info className="w-3.5 h-3.5" />
              <span>Proyección Cartográfica Activa</span>
            </div>
            <p className="text-white">{crs}</p>
            <p className="text-[9px] text-gray-500">Cálculos proyectados conforme a estándares INEGI.</p>
          </div>
        </div>

        {/* Offline Package Export Button */}
        <div className="p-3 border-t border-terranova-800 bg-terranova-950/60">
          <button
            onClick={handleDownloadOfflinePackage}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-medium border border-emerald-700/60 text-xs transition-colors shadow-glow-tech"
            title="Exportar capas en GeoJSON para uso en campo sin conexión"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Paquete Offline (.geojson)</span>
          </button>
        </div>
      </div>

      {/* 2. Main GIS Viewport with Real MapLibre Engine */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Floating Spatial Toolbar */}
        <div className="absolute top-4 left-4 bg-terranova-900/90 backdrop-blur-md border border-terranova-700 rounded-xl p-1.5 shadow-panel-dark flex items-center gap-1 z-20 select-none">
          <button
            onClick={() => handleToolSelect('pan')}
            className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              activeTool === 'pan'
                ? 'bg-terranova-500 text-terranova-950 font-bold shadow-glow-tech'
                : 'text-gray-300 hover:bg-terranova-800 hover:text-white'
            }`}
            title="Modo Navegación / Selección"
          >
            <MousePointer className="w-4 h-4" />
            <span className="hidden sm:inline">Navegar</span>
          </button>

          <button
            onClick={() => handleToolSelect('measure_distance')}
            className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              activeTool === 'measure_distance'
                ? 'bg-terranova-500 text-terranova-950 font-bold shadow-glow-tech'
                : 'text-gray-300 hover:bg-terranova-800 hover:text-white'
            }`}
            title="Hacer click en dos o más puntos para medir distancia geodésica"
          >
            <Ruler className="w-4 h-4" />
            <span className="hidden sm:inline">Medir Distancia</span>
          </button>

          <button
            onClick={() => handleToolSelect('measure_area')}
            className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              activeTool === 'measure_area'
                ? 'bg-terranova-500 text-terranova-950 font-bold shadow-glow-tech'
                : 'text-gray-300 hover:bg-terranova-800 hover:text-white'
            }`}
            title="Hacer click en tres o más vértices para medir superficie en m² y ha"
          >
            <Square className="w-4 h-4" />
            <span className="hidden sm:inline">Medir Área</span>
          </button>

          {activeTool !== 'pan' && (
            <button
              onClick={() => handleToolSelect('pan')}
              className="p-2 rounded-lg text-rose-400 hover:bg-rose-950 hover:text-rose-300 transition-colors"
              title="Reiniciar y salir de herramienta de medición"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Real-time Measurement Banner */}
        {measurementInfo && (
          <div className="absolute top-16 left-4 bg-terranova-950/95 border border-terranova-500 rounded-xl px-4 py-2 text-xs font-mono text-terranova-300 shadow-glow-tech z-20 animate-in fade-in flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                {measurementInfo.type === 'distance' ? 'Distancia Geodésica Oficial (EPSG:6362)' : 'Superficie Calculada en UTM Zona 14N'}
              </span>
              <span className="text-white font-bold">{measurementInfo.value}</span>
            </div>
          </div>
        )}

        {/* Active Tool Instructions Toast */}
        {activeTool !== 'pan' && !measurementInfo && (
          <div className="absolute top-16 left-4 bg-terranova-900/90 border border-terranova-700 rounded-xl px-3 py-1.5 text-[11px] font-mono text-gray-300 z-20 shadow-panel-dark">
            {activeTool === 'measure_distance' && 'Haz click sobre el mapa para fijar puntos de la distancia...'}
            {activeTool === 'measure_area' && 'Haz click en 3 o más vértices sobre el mapa para calcular el polígono...'}
          </div>
        )}

        {/* Real WebGL MapLibre GL JS Map Instance */}
        <MapLibreMap
          baseMap={activeBaseMap}
          layers={layers}
          properties={properties}
          incidents={incidents}
          activeTool={activeTool}
          onSelectProperty={onSelectProperty}
          onSelectIncident={onSelectIncident}
          onMeasurementUpdate={setMeasurementInfo}
        />
      </div>
    </div>
  );
};
