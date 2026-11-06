import React, { useState } from 'react';
import { 
  Layers, 
  TrendingUp, 
  Maximize2,
  Building,
  AlertTriangle,
  HardHat,
} from 'lucide-react';
import { MapLibreMap } from '../maps/MapLibreMap';
import { KPICardData, PropertyItem, IncidentItem, ProjectItem, LayerItem, Organization } from '../types';

interface DashboardViewProps {
  kpis: KPICardData[];
  properties: PropertyItem[];
  incidents: IncidentItem[];
  projects: ProjectItem[];
  layers: LayerItem[];
  onToggleLayer: (id: string) => void;
  onSelectProperty: (p: PropertyItem) => void;
  onSelectIncident: (i: IncidentItem) => void;
  onSelectProject: (p: ProjectItem) => void;
  onNavigateToGIS: () => void;
  center?: [number, number];
  zoom?: number;
  isDarkMode?: boolean;
  currentOrg?: Organization;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  properties,
  incidents,
  projects,
  layers,
  onToggleLayer,
  onSelectProperty,
  onSelectIncident,
  onSelectProject,
  onNavigateToGIS,
  center = [-99.1332, 19.4326],
  zoom = 11.5,
  isDarkMode = true,
  currentOrg,
}) => {
  const [activeTab, setActiveTab] = useState<'incidents' | 'properties' | 'projects'>('incidents');

  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-[#07131B] text-terranova-100' : 'bg-slate-100 text-slate-800'}`}>
      {/* Top Banner: Active Jurisdiction */}
      <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isDarkMode 
          ? 'bg-terranova-900/80 border-terranova-700/80' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold shadow-md">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {currentOrg?.name || 'Gobierno Autorizado'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {currentOrg?.badge || 'Acreditado'}
              </span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'} font-mono`}>
              Jurisdicción Oficial: {currentOrg?.municipality}, {currentOrg?.state} • {currentOrg?.crs || 'EPSG:6362 (ITRF2008)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className={`text-xs font-mono font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            Núcleo Territorial En Línea
          </span>
        </div>
      </div>

      {/* Top Section: Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className={`p-3.5 rounded-xl border transition-all ${
              isDarkMode 
                ? 'bg-terranova-900/60 border-terranova-800 hover:border-emerald-500/50 text-white' 
                : 'bg-white border-slate-200 hover:border-emerald-500/50 shadow-sm text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] font-semibold truncate ${isDarkMode ? 'text-terranova-300' : 'text-slate-600'}`}>
                {kpi.label}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black font-mono tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {kpi.value}
              </span>
            </div>
            <div className={`flex items-center justify-between mt-2 pt-2 border-t text-[10px] ${
              isDarkMode ? 'border-terranova-800/80' : 'border-slate-100'
            }`}>
              <span className="text-emerald-500 font-mono flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                {kpi.change}
              </span>
              <span className={`truncate max-w-[100px] ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                {kpi.sublabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Row: Central Interactive GIS Map & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive Geospatial Console (2 Columns) */}
        <div className={`lg:col-span-2 h-[440px] rounded-2xl border relative overflow-hidden flex flex-col ${
          isDarkMode 
            ? 'bg-terranova-950 border-terranova-800 shadow-panel-dark' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Map Top Bar Controls */}
          <div className={`h-11 px-3 border-b flex items-center justify-between z-10 ${
            isDarkMode 
              ? 'bg-terranova-900/90 border-terranova-800 text-white' 
              : 'bg-slate-50/90 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wide">
                Visor Cartográfico Territorial: {currentOrg?.municipality || 'Nacional'}
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                isDarkMode 
                  ? 'bg-terranova-800 text-terranova-300 border-terranova-700' 
                  : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}>
                MapLibre GL JS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToGIS}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border ${
                  isDarkMode 
                    ? 'bg-terranova-800 hover:bg-terranova-700 text-terranova-200 border-terranova-700' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                }`}
                title="Abrir en pantalla completa de GIS Explorer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Explorador Completo</span>
              </button>
            </div>
          </div>

          {/* Real WebGL / Raster MapLibre Map Container */}
          <div className="flex-1 relative overflow-hidden">
            <MapLibreMap
              baseMap={isDarkMode ? 'dark' : 'voyager'}
              layers={layers}
              properties={properties}
              incidents={incidents}
              activeTool="pan"
              onSelectProperty={onSelectProperty}
              onSelectIncident={onSelectIncident}
              center={center}
              zoom={zoom}
            />

            {/* Floating Layers Pill on Map */}
            <div className={`absolute bottom-3 left-3 backdrop-blur border rounded-xl p-2 flex items-center gap-1.5 text-xs z-10 ${
              isDarkMode 
                ? 'bg-terranova-900/95 border-terranova-700 text-white shadow-panel-dark' 
                : 'bg-white/95 border-slate-200 text-slate-800 shadow-md'
            }`}>
              <Layers className="w-3.5 h-3.5 text-emerald-400 mr-1" />
              <div className="flex gap-1 overflow-x-auto max-w-[420px]">
                {layers.slice(0, 5).map((l) => (
                  <button
                    key={l.id}
                    onClick={() => onToggleLayer(l.id)}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                      l.active
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                        : isDarkMode
                        ? 'bg-terranova-800 text-gray-400 hover:text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {l.name.split(' ')[0]} ({l.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Map Legend */}
            <div className={`absolute top-3 right-3 backdrop-blur border rounded-lg p-2 text-[10px] font-mono space-y-1 ${
              isDarkMode 
                ? 'bg-terranova-900/90 border-terranova-800 text-gray-300' 
                : 'bg-white/90 border-slate-200 text-slate-700 shadow-xs'
            }`}>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500/80 border border-emerald-400" />
                <span>Predio Catastral</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Incidencia 072</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Obra Pública Activa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Tabbed Panel: Incidencias, Predios, Obras */}
        <div className={`rounded-2xl border flex flex-col h-[440px] overflow-hidden ${
          isDarkMode 
            ? 'bg-terranova-950 border-terranova-800 shadow-panel-dark' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Tabs Header */}
          <div className={`h-11 border-b flex items-center px-2 gap-1 ${
            isDarkMode ? 'bg-terranova-900/70 border-terranova-800' : 'bg-slate-50 border-slate-200'
          }`}>
            {[
              { id: 'incidents', label: '072 Servicios', count: incidents.length, icon: AlertTriangle },
              { id: 'properties', label: 'Predios', count: properties.length, icon: Building },
              { id: 'projects', label: 'Obras', count: projects.length, icon: HardHat },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? isDarkMode
                        ? 'bg-terranova-800 text-white font-bold border border-terranova-700'
                        : 'bg-white text-slate-900 font-bold border border-slate-200 shadow-xs'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-terranova-800/40'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1 rounded-full ${
                    isActive 
                      ? 'bg-emerald-500 text-black font-bold' 
                      : isDarkMode ? 'bg-terranova-900 text-gray-400' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {activeTab === 'incidents' && (
              <div className="space-y-2">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-terranova-900/60 border-terranova-800 hover:border-emerald-500/60' 
                        : 'bg-slate-50 border-slate-200 hover:border-emerald-500/60 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-rose-400">
                        {inc.folio}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                        inc.priority === 'Crítica' || inc.priority === 'Alta' 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {inc.priority}
                      </span>
                    </div>
                    <p className={`text-xs font-semibold line-clamp-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {inc.title}
                    </p>
                    <div className={`flex items-center justify-between mt-1 text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      <span>{inc.neighborhood}</span>
                      <span className="text-emerald-400 font-mono">SLA {inc.slaHours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="space-y-2">
                {properties.map((prop) => (
                  <div
                    key={prop.id}
                    onClick={() => onSelectProperty(prop)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-terranova-900/60 border-terranova-800 hover:border-emerald-500/60' 
                        : 'bg-slate-50 border-slate-200 hover:border-emerald-500/60 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        {prop.cadastralKey}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-sky-500/20 text-sky-400">
                        {prop.landUse}
                      </span>
                    </div>
                    <p className={`text-xs font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {prop.street}
                    </p>
                    <div className={`flex items-center justify-between mt-1 text-[10px] font-mono ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      <span>{prop.neighborhood}</span>
                      <span className="text-white font-bold">${prop.cadastralValue.toLocaleString()} MXN</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-2">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => onSelectProject(proj)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-terranova-900/60 border-terranova-800 hover:border-emerald-500/60' 
                        : 'bg-slate-50 border-slate-200 hover:border-emerald-500/60 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-amber-400">
                        {proj.code}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-400 font-bold">
                        {proj.progressPercentage}% Avance
                      </span>
                    </div>
                    <p className={`text-xs font-semibold line-clamp-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {proj.name}
                    </p>
                    <div className={`flex items-center justify-between mt-1 text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      <span className="font-mono">{proj.fundingSource || 'FAISMUN'}</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ${(proj.budgetAllocated / 1000000).toFixed(1)}M MXN
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
