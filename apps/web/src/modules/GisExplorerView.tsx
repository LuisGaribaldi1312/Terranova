import React, { useState } from 'react';
import { 
  Ruler, 
  Square, 
  Download, 
  Eye, 
  EyeOff, 
  MousePointer,
  RotateCcw,
  Sparkles,
  Info,
  Globe,
  MapPin,
  Building,
} from 'lucide-react';
import { LayerItem, PropertyItem, IncidentItem } from '../types';
import { MapLibreMap, BaseMapStyle, GisToolMode } from '../maps/MapLibreMap';
import {
  MEXICAN_STATES,
  MEXICAN_MUNICIPALITIES,
  MEXICAN_LOCALITIES,
} from '../maps/mexicoGeoData';

interface GisExplorerViewProps {
  layers: LayerItem[];
  onToggleLayer: (id: string) => void;
  properties: PropertyItem[];
  incidents: IncidentItem[];
  onSelectProperty: (p: PropertyItem) => void;
  onSelectIncident: (i: IncidentItem) => void;
  crs?: string;
  isDarkMode?: boolean;
}

export const GisExplorerView: React.FC<GisExplorerViewProps> = ({
  layers,
  onToggleLayer,
  properties,
  incidents,
  onSelectProperty,
  onSelectIncident,
  crs = 'EPSG:32614 (UTM Zona 14N)',
  isDarkMode = true,
}) => {
  const [activeBaseMap, setActiveBaseMap] = useState<BaseMapStyle>(isDarkMode ? 'dark' : 'voyager');
  const [activeTool, setActiveTool] = useState<GisToolMode>('pan');
  const [measurementInfo, setMeasurementInfo] = useState<{ type: 'distance' | 'area'; value: string } | null>(null);

  // Sincronizar basemap con modo día/noche
  React.useEffect(() => {
    setActiveBaseMap(isDarkMode ? 'dark' : 'voyager');
  }, [isDarkMode]);

  // Jerarquía Territorial INEGI (Marco Geoestadístico Nacional - MGN)
  const [selectedStateCve, setSelectedStateCve] = useState<string>(''); // Vacío = República Mexicana
  const [selectedMunCve, setSelectedMunCve] = useState<string>('');
  const [selectedLocCve, setSelectedLocCve] = useState<string>('');

  const currentState = MEXICAN_STATES.find((s) => s.cve_ent === selectedStateCve);
  const currentMunicipality = MEXICAN_MUNICIPALITIES.find((m) => m.cve_geo === selectedMunCve);
  const currentLocality = MEXICAN_LOCALITIES.find((l) => l.cve_geo === selectedLocCve);

  // Filtrado dinámico de municipios por estado
  const filteredMunicipalities = selectedStateCve
    ? MEXICAN_MUNICIPALITIES.filter((m) => m.cve_ent === selectedStateCve)
    : MEXICAN_MUNICIPALITIES;

  // Filtrado dinámico de localidades por estado y municipio
  const filteredLocalities = MEXICAN_LOCALITIES.filter((l) => {
    if (selectedStateCve && l.cve_ent !== selectedStateCve) return false;
    if (selectedMunCve && l.cve_mun !== currentMunicipality?.cve_mun) return false;
    return true;
  });

  const handleToolSelect = (tool: GisToolMode) => {
    setActiveTool(tool);
    setMeasurementInfo(null);
  };

  const handleResetToRepublic = () => {
    setSelectedStateCve('');
    setSelectedMunCve('');
    setSelectedLocCve('');
  };

  const handleStateChange = (cve: string) => {
    setSelectedStateCve(cve);
    setSelectedMunCve('');
    setSelectedLocCve('');
  };

  const handleMunChange = (cveGeo: string) => {
    setSelectedMunCve(cveGeo);
    setSelectedLocCve('');
    const mun = MEXICAN_MUNICIPALITIES.find((m) => m.cve_geo === cveGeo);
    if (mun && !selectedStateCve) {
      setSelectedStateCve(mun.cve_ent);
    }
  };

  const handleDownloadOfflinePackage = () => {
    const geojsonPackage = {
      type: 'FeatureCollection',
      metadata: {
        system: 'TERRANOVA GIS Platform',
        crs: 'EPSG:4326',
        officialMexicanProjection: 'EPSG:6362 (ITRF2008)',
        exportedAt: new Date().toISOString(),
        totalProperties: properties.length,
        totalIncidents: incidents.length,
        territorialLevel: selectedStateCve ? `Estado ${selectedStateCve}` : 'República Mexicana',
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
    a.download = `terranova-paquete-territorial-${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex overflow-hidden relative bg-[#07131B]">
      {/* 1. Left Layer & Cartographic Control Panel */}
      <div className="w-80 border-r border-terranova-800 bg-terranova-900/95 backdrop-blur-md flex flex-col justify-between z-10 shadow-panel-dark select-none">
        
        {/* Cabecera del Gestor */}
        <div className="p-3 border-b border-terranova-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-terranova-400" />
              Navegador Territorial MGN
            </span>
            <span className="text-[10px] font-mono text-terranova-300 px-1.5 py-0.5 rounded bg-terranova-800">
              32 Estados
            </span>
          </div>
        </div>

        {/* Controles de Jerarquía Territorial INEGI */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
          
          {/* Botón de República Mexicana Completa */}
          <div>
            <button
              onClick={handleResetToRepublic}
              className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all ${
                !selectedStateCve
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-black border-emerald-400 shadow-glow-tech'
                  : 'bg-terranova-950 border-terranova-800 text-gray-300 hover:text-white hover:border-terranova-600'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>🇲🇽 Ver República Mexicana Completa</span>
            </button>
          </div>

          {/* Selector de 32 Estados de México */}
          <div className="p-2.5 rounded-xl bg-terranova-950/70 border border-terranova-800 space-y-1.5">
            <label className="text-[10px] font-mono text-terranova-400 uppercase tracking-wider block font-bold">
              1. Entidad Federativa (32 Estados)
            </label>
            <select
              value={selectedStateCve}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-terranova-900 border border-terranova-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-terranova-400"
            >
              <option value="">-- Toda la República Mexicana (32 Estados) --</option>
              {MEXICAN_STATES.map((st) => (
                <option key={st.cve_ent} value={st.cve_ent}>
                  [{st.cve_ent}] {st.name} ({st.municipalityCount} mun.)
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Municipios de la Entidad */}
          <div className="p-2.5 rounded-xl bg-terranova-950/70 border border-terranova-800 space-y-1.5">
            <label className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold flex items-center gap-1">
              <Building className="w-3 h-3" />
              2. Municipio (Marco Geoestadístico)
            </label>
            <select
              value={selectedMunCve}
              onChange={(e) => handleMunChange(e.target.value)}
              className="w-full bg-terranova-900 border border-terranova-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
            >
              <option value="">
                {selectedStateCve
                  ? `-- Ver Todos los Municipios de ${currentState?.name || ''} --`
                  : '-- Selecciona o filtra un Municipio --'}
              </option>
              {filteredMunicipalities.map((mun) => (
                <option key={mun.cve_geo} value={mun.cve_geo}>
                  [{mun.cve_geo}] {mun.name} ({mun.localityCount} loc.)
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Localidades Urbanas / Rurales */}
          <div className="p-2.5 rounded-xl bg-terranova-950/70 border border-terranova-800 space-y-1.5">
            <label className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              3. Localidad / Colonia (INEGI cve_loc)
            </label>
            <select
              value={selectedLocCve}
              onChange={(e) => setSelectedLocCve(e.target.value)}
              className="w-full bg-terranova-900 border border-terranova-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-sky-400"
            >
              <option value="">-- Ver Todas las Localidades --</option>
              {filteredLocalities.map((loc) => (
                <option key={loc.cve_geo} value={loc.cve_geo}>
                  [{loc.type}] {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ficha Rápida del Territorio Activo */}
          {(currentState || currentMunicipality) && (
            <div className="p-2.5 rounded-xl bg-terranova-950 border border-emerald-500/40 text-[11px] font-mono space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">
                Información del Territorio Enfocado
              </span>
              <p className="text-white font-bold">
                {currentMunicipality ? currentMunicipality.name : currentState?.name}
              </p>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400 pt-1">
                <span>Población INEGI:</span>
                <span className="text-white font-bold text-right">
                  {currentMunicipality
                    ? currentMunicipality.population.toLocaleString()
                    : currentState
                    ? `${currentState.municipalityCount} Municipios`
                    : '-'}
                </span>
                <span>Clave MGN:</span>
                <span className="text-terranova-400 font-bold text-right">
                  {currentMunicipality ? currentMunicipality.cve_geo : currentState?.cve_ent}
                </span>
              </div>
            </div>
          )}

          {/* Gestor de Capas Vectoriales */}
          <div className="pt-2 border-t border-terranova-800 space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-terranova-400 uppercase tracking-wider block font-bold">
                Capas del Sistema ({layers.filter((l) => l.active).length} activas)
              </span>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
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

          {/* Selector de Cartografía Base */}
          <div className="pt-2 border-t border-terranova-800">
            <span className="text-[10px] font-mono text-terranova-400 uppercase tracking-wider block mb-2 font-bold flex items-center justify-between">
              <span>Cartografía Base Oficial</span>
              <span className="text-[9px] text-emerald-400 font-normal">5 Motores</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              {[
                { id: 'voyager', label: '☀️ Día (Voyager)', desc: 'Calles & relieve' },
                { id: 'dark', label: '🌙 Noche (Dark)', desc: 'Alto contraste' },
                { id: 'topo', label: '🛣️ Topo (Esri)', desc: 'Vialidades y toponimia' },
                { id: 'osm', label: '🗺️ OpenStreet', desc: 'Comunidad OSM' },
              ].map((map) => (
                <button
                  key={map.id}
                  onClick={() => setActiveBaseMap(map.id as any)}
                  className={`p-1.5 rounded-lg text-[10px] font-mono text-left border transition-all ${
                    activeBaseMap === map.id
                      ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-glow-tech'
                      : 'bg-terranova-800/60 text-gray-300 border-terranova-700 hover:text-white hover:bg-terranova-800'
                  }`}
                >
                  <p className="font-bold leading-tight">{map.label}</p>
                  <p className={`text-[8px] truncate ${activeBaseMap === map.id ? 'text-black/80' : 'text-gray-400'}`}>{map.desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setActiveBaseMap('sat')}
              className={`w-full py-1.5 rounded-lg text-[10px] font-mono text-center border transition-all ${
                activeBaseMap === 'sat'
                  ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-glow-tech'
                  : 'bg-terranova-800/60 text-gray-300 border-terranova-700 hover:text-white hover:bg-terranova-800'
              }`}
            >
              🛰️ Satelital HD (Esri World Imagery)
            </button>
          </div>

          {/* Proyección Cartográfica Activa */}
          <div className="p-2.5 rounded-lg bg-terranova-950 border border-terranova-800 text-[10px] font-mono text-gray-400 space-y-1">
            <div className="flex items-center gap-1 text-terranova-400 font-bold">
              <Info className="w-3.5 h-3.5" />
              <span>Proyección Cartográfica</span>
            </div>
            <p className="text-white font-bold">{crs}</p>
            <p className="text-[9px] text-gray-500">INEGI MGN / EPSG:6362 ITRF2008 / WGS84</p>
          </div>
        </div>

        {/* Botón de Exportación GeoJSON Offline */}
        <div className="p-3 border-t border-terranova-800 bg-terranova-950/60">
          <button
            onClick={handleDownloadOfflinePackage}
            className="w-full py-2 px-3 rounded-lg bg-terranova-800 hover:bg-terranova-700 text-terranova-200 border border-terranova-700 flex items-center justify-center gap-2 text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-terranova-400" />
            <span>Descargar Paquete GeoJSON</span>
          </button>
        </div>
      </div>

      {/* 2. Main Map Viewport */}
      <div className="flex-1 relative h-full w-full">
        {/* Floating GIS Tools Bar */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-terranova-900/90 border border-terranova-700 p-1.5 rounded-xl shadow-2xl backdrop-blur-md">
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

        {/* Banner Indicador de Vista Territorial Superior */}
        <div className="absolute top-4 right-14 z-20 hidden md:flex items-center gap-2 bg-terranova-900/90 border border-terranova-700 px-3 py-1.5 rounded-xl shadow-panel-dark backdrop-blur-md text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-400">Escala:</span>
          <span className="text-white font-bold">
            {currentLocality
              ? `Localidad: ${currentLocality.name}`
              : currentMunicipality
              ? `Municipio: ${currentMunicipality.name} (${currentMunicipality.cve_geo})`
              : currentState
              ? `Estado: ${currentState.name} (${currentState.cve_ent})`
              : '🇲🇽 República Mexicana (32 Estados)'}
          </span>
        </div>

        {/* Instancia Real de MapLibre GL JS */}
        <MapLibreMap
          baseMap={activeBaseMap}
          layers={layers}
          properties={properties}
          incidents={incidents}
          activeTool={activeTool}
          onSelectProperty={onSelectProperty}
          onSelectIncident={onSelectIncident}
          onMeasurementUpdate={setMeasurementInfo}
          selectedStateCve={selectedStateCve}
          selectedMunCve={selectedMunCve}
          selectedLocCve={selectedLocCve}
          onSelectState={(st) => setSelectedStateCve(st.cve_ent)}
          onSelectMunicipality={(mun) => {
            setSelectedMunCve(mun.cve_geo);
            setSelectedStateCve(mun.cve_ent);
          }}
          onSelectLocality={(loc) => {
            setSelectedLocCve(loc.cve_geo);
            setSelectedMunCve(`${loc.cve_ent}${loc.cve_mun}`);
            setSelectedStateCve(loc.cve_ent);
          }}
        />
      </div>
    </div>
  );
};
