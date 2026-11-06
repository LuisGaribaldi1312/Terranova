import React, { useState, useEffect } from 'react';
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
  Building 
} from 'lucide-react';
import { LayerItem, PropertyItem, IncidentItem, Organization } from '../types';
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
  currentOrg?: Organization;
  center?: [number, number];
  zoom?: number;
  defaultStateCve?: string;
}

export const GisExplorerView: React.FC<GisExplorerViewProps> = ({
  layers,
  onToggleLayer,
  properties,
  incidents,
  onSelectProperty,
  onSelectIncident,
  crs = 'EPSG:6362 (ITRF2008 / LCC)',
  isDarkMode = true,
  currentOrg,
  center,
  zoom,
  defaultStateCve,
}) => {
  const [activeBaseMap, setActiveBaseMap] = useState<BaseMapStyle>(isDarkMode ? 'dark' : 'voyager');
  const [activeTool, setActiveTool] = useState<GisToolMode>('pan');
  const [measurementInfo, setMeasurementInfo] = useState<{ type: 'distance' | 'area'; value: string } | null>(null);

  // Sincronizar basemap con modo día/noche
  useEffect(() => {
    setActiveBaseMap(isDarkMode ? 'dark' : 'voyager');
  }, [isDarkMode]);

  // Jerarquía Territorial INEGI (Marco Geoestadístico Nacional - MGN)
  const [selectedStateCve, setSelectedStateCve] = useState<string>(defaultStateCve || currentOrg?.cve_ent || '');
  const [selectedMunCve, setSelectedMunCve] = useState<string>('');
  const [selectedLocCve, setSelectedLocCve] = useState<string>('');

  // Sincronizar estado cuando cambie la organización activa
  useEffect(() => {
    if (currentOrg?.cve_ent) {
      setSelectedStateCve(currentOrg.cve_ent);
      setSelectedMunCve('');
      setSelectedLocCve('');
    }
  }, [currentOrg?.cve_ent]);

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
        platform: 'TERRANOVA Geographic Information System',
        crs: 'EPSG:6362 (ITRF2008 / LCC)',
        exportedAt: new Date().toISOString(),
        totalProperties: properties.length,
        totalIncidents: incidents.length,
        territorialLevel: selectedStateCve ? `Estado ${selectedStateCve} (${currentState?.name || ''})` : 'República Mexicana',
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
    a.download = `terranova-paquete-territorial-${selectedStateCve || 'mexico'}-${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex-1 flex overflow-hidden relative ${isDarkMode ? 'bg-[#07131B]' : 'bg-slate-100'}`}>
      {/* 1. Left Layer & Cartographic Control Panel */}
      <div className={`w-80 border-r flex flex-col justify-between z-10 select-none ${
        isDarkMode 
          ? 'bg-terranova-900/95 border-terranova-800 text-white shadow-panel-dark' 
          : 'bg-white border-slate-200 text-slate-800 shadow-md'
      }`}>
        
        {/* Cabecera del Gestor */}
        <div className={`p-3 border-b flex items-center justify-between ${
          isDarkMode ? 'border-terranova-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Navegador Territorial MGN</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
            isDarkMode ? 'bg-terranova-800 text-terranova-300' : 'bg-slate-100 text-slate-700'
          }`}>
            32 Estados
          </span>
        </div>

        {/* Controles de Jerarquía Territorial INEGI */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
          
          {/* Botón de República Mexicana Completa */}
          <div>
            <button
              onClick={handleResetToRepublic}
              className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all ${
                !selectedStateCve
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-md'
                  : isDarkMode
                  ? 'bg-terranova-950 border-terranova-800 text-gray-300 hover:text-white hover:border-emerald-500/50'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>🇲🇽 Ver República Mexicana Completa</span>
            </button>
          </div>

          {/* Selector de 32 Estados de México */}
          <div className={`p-2.5 rounded-xl border space-y-1.5 ${
            isDarkMode ? 'bg-terranova-950/70 border-terranova-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <label className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              1. Entidad Federativa (32 Estados)
            </label>
            <select
              value={selectedStateCve}
              onChange={(e) => handleStateChange(e.target.value)}
              className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-emerald-500 ${
                isDarkMode 
                  ? 'bg-terranova-900 border-terranova-700 text-white' 
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="">-- Toda la República Mexicana (32 Estados) --</option>
              {MEXICAN_STATES.map((st) => (
                <option key={st.cve_ent} value={st.cve_ent}>
                  [{st.cve_ent}] {st.name} ({st.municipalityCount} mun.)
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Municipios Dinámicos */}
          <div className={`p-2.5 rounded-xl border space-y-1.5 ${
            isDarkMode ? 'bg-terranova-950/70 border-terranova-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <label className={`text-[10px] font-mono uppercase tracking-wider block font-bold flex items-center gap-1 ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              <Building className="w-3 h-3" />
              2. Municipio (Marco Geoestadístico)
            </label>
            <select
              value={selectedMunCve}
              onChange={(e) => handleMunChange(e.target.value)}
              className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-emerald-500 ${
                isDarkMode 
                  ? 'bg-terranova-900 border-terranova-700 text-white' 
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="">
                {selectedStateCve
                  ? `-- Ver Municipios de ${currentState?.name || ''} --`
                  : '-- Selecciona o filtra un Municipio --'}
              </option>
              {filteredMunicipalities.map((mun) => (
                <option key={mun.cve_geo} value={mun.cve_geo}>
                  [{mun.cve_geo}] {mun.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Localidades Urbanas / Rurales */}
          <div className={`p-2.5 rounded-xl border space-y-1.5 ${
            isDarkMode ? 'bg-terranova-950/70 border-terranova-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <label className={`text-[10px] font-mono uppercase tracking-wider block font-bold flex items-center gap-1 ${
              isDarkMode ? 'text-sky-400' : 'text-sky-700'
            }`}>
              <MapPin className="w-3 h-3" />
              3. Localidad / Colonia (INEGI cve_loc)
            </label>
            <select
              value={selectedLocCve}
              onChange={(e) => setSelectedLocCve(e.target.value)}
              className={`w-full border rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-sky-500 ${
                isDarkMode 
                  ? 'bg-terranova-900 border-terranova-700 text-white' 
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
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
            <div className={`p-2.5 rounded-xl border text-[11px] font-mono space-y-1 ${
              isDarkMode ? 'bg-terranova-950 border-emerald-500/40 text-white' : 'bg-emerald-50/60 border-emerald-300 text-slate-800'
            }`}>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase tracking-wider">
                Territorio Enfocado
              </span>
              <p className="font-bold">
                {currentMunicipality ? currentMunicipality.name : currentState?.name}
              </p>
              <div className={`grid grid-cols-2 gap-1 text-[10px] pt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                <span>Clave INEGI:</span>
                <span className="font-bold text-right text-emerald-600 dark:text-emerald-400">
                  {currentMunicipality ? currentMunicipality.cve_geo : currentState?.cve_ent}
                </span>
                <span>Jurisdicción:</span>
                <span className="font-bold text-right">
                  {currentMunicipality ? `${currentMunicipality.localityCount} loc.` : `${currentState?.municipalityCount} mun.`}
                </span>
              </div>
            </div>
          )}

          {/* Gestor de Capas Vectoriales */}
          <div className={`pt-2 border-t space-y-1.5 ${isDarkMode ? 'border-terranova-800' : 'border-slate-200'}`}>
            <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${
              isDarkMode ? 'text-terranova-400' : 'text-slate-600'
            }`}>
              Capas del Sistema ({layers.filter((l) => l.active).length} activas)
            </span>

            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  onClick={() => onToggleLayer(layer.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all ${
                    layer.active
                      ? isDarkMode 
                        ? 'bg-terranova-800/80 border-terranova-600 text-white shadow-xs' 
                        : 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-xs'
                      : isDarkMode
                      ? 'bg-terranova-950/40 border-terranova-800/60 text-gray-400 hover:bg-terranova-800/40'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
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
                    <span className="text-[10px] font-mono font-bold">{layer.count}</span>
                    {layer.active ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selector de Cartografía Base */}
          <div className={`pt-2 border-t ${isDarkMode ? 'border-terranova-800' : 'border-slate-200'}`}>
            <span className={`text-[10px] font-mono uppercase tracking-wider block mb-2 font-bold flex items-center justify-between ${
              isDarkMode ? 'text-terranova-400' : 'text-slate-600'
            }`}>
              <span>Cartografía Base</span>
              <span className="text-[9px] text-emerald-500 font-normal">5 Motores</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              {[
                { id: 'voyager', label: '☀️ Día (Voyager)', desc: 'Calles & relieve' },
                { id: 'dark', label: '🌙 Noche (Dark)', desc: 'Alto contraste' },
                { id: 'topo', label: '🛣️ Topo (Esri)', desc: 'Carreteras & toponimia' },
                { id: 'osm', label: '🗺️ OpenStreet', desc: 'Comunidad OSM' },
              ].map((map) => (
                <button
                  key={map.id}
                  onClick={() => setActiveBaseMap(map.id as any)}
                  className={`p-1.5 rounded-lg text-[10px] font-mono text-left border transition-all ${
                    activeBaseMap === map.id
                      ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-xs'
                      : isDarkMode
                      ? 'bg-terranova-800/60 text-gray-300 border-terranova-700 hover:text-white hover:bg-terranova-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
                  ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-xs'
                  : isDarkMode
                  ? 'bg-terranova-800/60 text-gray-300 border-terranova-700 hover:text-white hover:bg-terranova-800'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🛰️ Satelital HD (Esri World Imagery)
            </button>
          </div>

          {/* Proyección Cartográfica Activa */}
          <div className={`p-2.5 rounded-lg border text-[10px] font-mono space-y-1 ${
            isDarkMode ? 'bg-terranova-950 border-terranova-800 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-1 text-emerald-500 font-bold">
              <Info className="w-3.5 h-3.5" />
              <span>Proyección Cartográfica</span>
            </div>
            <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{crs}</p>
            <p className="text-[9px] text-gray-500">INEGI MGN / EPSG:6362 ITRF2008 / WGS84</p>
          </div>
        </div>

        {/* Botón de Exportación GeoJSON Offline */}
        <div className={`p-3 border-t ${
          isDarkMode ? 'border-terranova-800 bg-terranova-950/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            onClick={handleDownloadOfflinePackage}
            className={`w-full py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-mono transition-colors ${
              isDarkMode 
                ? 'bg-terranova-800 hover:bg-terranova-700 text-terranova-200 border-terranova-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Descargar Paquete GeoJSON</span>
          </button>
        </div>
      </div>

      {/* 2. Main Map Viewport */}
      <div className="flex-1 relative h-full w-full">
        {/* Floating GIS Tools Bar */}
        <div className={`absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-xl border backdrop-blur-md shadow-lg ${
          isDarkMode ? 'bg-terranova-900/90 border-terranova-700' : 'bg-white/90 border-slate-300'
        }`}>
          <button
            onClick={() => handleToolSelect('pan')}
            className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              activeTool === 'pan'
                ? 'bg-emerald-500 text-black font-bold shadow-xs'
                : isDarkMode ? 'text-gray-300 hover:bg-terranova-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'
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
                ? 'bg-emerald-500 text-black font-bold shadow-xs'
                : isDarkMode ? 'text-gray-300 hover:bg-terranova-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'
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
                ? 'bg-emerald-500 text-black font-bold shadow-xs'
                : isDarkMode ? 'text-gray-300 hover:bg-terranova-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Hacer click en tres o más vértices para medir superficie"
          >
            <Square className="w-4 h-4" />
            <span className="hidden sm:inline">Medir Área</span>
          </button>

          {activeTool !== 'pan' && (
            <button
              onClick={() => handleToolSelect('pan')}
              className="p-2 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors"
              title="Reiniciar y salir de herramienta de medición"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Real-time Measurement Banner */}
        {measurementInfo && (
          <div className={`absolute top-16 left-4 rounded-xl px-4 py-2 text-xs font-mono border shadow-lg z-20 animate-in fade-in flex items-center gap-2 ${
            isDarkMode ? 'bg-terranova-950/95 border-emerald-500 text-emerald-300' : 'bg-white/95 border-emerald-500 text-slate-800'
          }`}>
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider block font-bold">
                {measurementInfo.type === 'distance' ? 'Distancia Geodésica Oficial (EPSG:6362)' : 'Superficie Calculada en UTM'}
              </span>
              <span className="font-bold">{measurementInfo.value}</span>
            </div>
          </div>
        )}

        {/* Active Tool Instructions Toast */}
        {activeTool !== 'pan' && !measurementInfo && (
          <div className={`absolute top-16 left-4 rounded-xl px-3 py-1.5 text-[11px] font-mono border z-20 shadow-md ${
            isDarkMode ? 'bg-terranova-900/90 border-terranova-700 text-gray-300' : 'bg-white/90 border-slate-300 text-slate-700'
          }`}>
            {activeTool === 'measure_distance' && 'Haz click sobre el mapa para fijar puntos de la distancia...'}
            {activeTool === 'measure_area' && 'Haz click en 3 o más vértices sobre el mapa para calcular el polígono...'}
          </div>
        )}

        {/* Banner Indicador de Vista Territorial Superior */}
        <div className={`absolute top-4 right-14 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-mono shadow-md ${
          isDarkMode ? 'bg-terranova-900/90 border-terranova-700 text-white' : 'bg-white/90 border-slate-300 text-slate-800'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-500 dark:text-gray-400">Escala:</span>
          <span className="font-bold">
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
          center={center}
          zoom={zoom}
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
