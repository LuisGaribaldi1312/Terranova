import React, { useState } from 'react';
import { 
  Layers, 
  TrendingUp, 
  ChevronRight, 
  Clock, 
  Maximize2
} from 'lucide-react';
import { KPICardData, PropertyItem, IncidentItem, ProjectItem, LayerItem } from '../types';

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
}) => {
  const [activeTab, setActiveTab] = useState<'incidents' | 'properties' | 'projects'>('incidents');
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 gis-grid-bg">
      {/* Top Section: Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="p-3.5 rounded-xl bg-terranova-800/50 border border-terranova-700/80 backdrop-blur-md shadow-panel-dark hover:border-terranova-500/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-terranova-200/80 truncate">
                {kpi.label}
              </span>
              <span className="w-2 h-2 rounded-full bg-terranova-400 group-hover:animate-ping" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white tracking-tight">
                {kpi.value}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-terranova-800/80 text-[10px]">
              <span className="text-terranova-300 font-mono flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-terranova-400" />
                {kpi.change}
              </span>
              <span className="text-gray-400 truncate max-w-[90px]">{kpi.sublabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Row: Central Interactive GIS Map & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive Geospatial Console (2 Columns) */}
        <div className="lg:col-span-2 h-[420px] rounded-2xl bg-terranova-950 border border-terranova-700/90 shadow-panel-dark relative overflow-hidden flex flex-col">
          {/* Map Top Bar Controls */}
          <div className="h-11 px-3 border-b border-terranova-800 bg-terranova-900/90 backdrop-blur flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide">Visor Cartográfico Territorial Activo</span>
              <span className="text-[10px] font-mono text-terranova-300 px-1.5 py-0.5 rounded bg-terranova-800">
                MapLibre GL JS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToGIS}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-terranova-800 hover:bg-terranova-700 text-terranova-200 hover:text-white text-xs font-mono transition-colors border border-terranova-700"
                title="Abrir en pantalla completa de GIS Explorer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Modo Pantalla Completa</span>
              </button>
            </div>
          </div>

          {/* Interactive Vector GIS Simulation Canvas */}
          <div className="flex-1 relative bg-[#091824] overflow-hidden flex items-center justify-center">
            {/* Dynamic Simulated Cadastral Grid & Parcels SVG */}
            <svg className="w-full h-full absolute inset-0 opacity-80 cursor-crosshair">
              <defs>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(23, 169, 135, 0.12)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridPattern)" />

              {/* Simulated Municipal Boundary */}
              <polygon
                points="80,40 380,25 720,80 820,320 540,380 180,360 60,220"
                fill="rgba(18, 60, 80, 0.35)"
                stroke="#17A987"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Simulated Cadastral Parcels (Properties) */}
              {properties.map((prop, idx) => {
                const posX = 160 + (idx * 110) % 520;
                const posY = 90 + (idx * 65) % 260;
                return (
                  <g
                    key={prop.id}
                    onMouseEnter={() => setActiveMarker(prop.id)}
                    onMouseLeave={() => setActiveMarker(null)}
                    onClick={() => onSelectProperty(prop)}
                    className="cursor-pointer group"
                  >
                    <rect
                      x={posX}
                      y={posY}
                      width="85"
                      height="55"
                      fill={activeMarker === prop.id ? 'rgba(23, 169, 135, 0.6)' : 'rgba(23, 169, 135, 0.25)'}
                      stroke="#22C49F"
                      strokeWidth="1.5"
                      className="transition-all hover:fill-terranova-500/50"
                    />
                    <text
                      x={posX + 6}
                      y={posY + 18}
                      fill="#E9F0F2"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {prop.cadastralKey.split('-').slice(-2).join('-')}
                    </text>
                    <text
                      x={posX + 6}
                      y={posY + 32}
                      fill="#9DB4C0"
                      fontSize="8"
                    >
                      {prop.landArea} m²
                    </text>
                  </g>
                );
              })}

              {/* Simulated Active Incidents (Pins) */}
              {incidents.slice(0, 4).map((inc, idx) => {
                const pinX = 220 + (idx * 135) % 480;
                const pinY = 140 + (idx * 55) % 220;
                return (
                  <g
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="cursor-pointer group animate-bounce"
                    style={{ animationDuration: `${2 + idx * 0.5}s` }}
                  >
                    <circle cx={pinX} cy={pinY} r="7" fill="#EF4444" className="shadow-lg" />
                    <circle cx={pinX} cy={pinY} r="14" fill="rgba(239, 68, 68, 0.25)" />
                  </g>
                );
              })}
            </svg>

            {/* Floating Layers Pill on Map */}
            <div className="absolute bottom-3 left-3 bg-terranova-900/95 backdrop-blur border border-terranova-700/80 rounded-xl p-2 shadow-panel-dark flex items-center gap-1.5 text-xs z-10">
              <Layers className="w-3.5 h-3.5 text-terranova-400 mr-1" />
              <div className="flex gap-1 overflow-x-auto max-w-[460px]">
                {layers.slice(0, 5).map((l) => (
                  <button
                    key={l.id}
                    onClick={() => onToggleLayer(l.id)}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                      l.active
                        ? 'bg-terranova-500 text-terranova-950 font-bold shadow-glow-tech'
                        : 'bg-terranova-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {l.name.split(' ')[0]} ({l.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Map Legend */}
            <div className="absolute top-3 right-3 bg-terranova-900/90 backdrop-blur border border-terranova-800 rounded-lg p-2 text-[10px] font-mono text-gray-300 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500/80 border border-emerald-400" />
                <span>Predio Catastral Registrado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Incidencia Activa (Bache/Fuga)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 border-t-2 border-dashed border-amber-400" />
                <span>Polígono de Obra Pública</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Territorial Feed & Critical Alerts */}
        <div className="h-[420px] rounded-2xl bg-terranova-900/90 border border-terranova-700/90 p-4 shadow-panel-dark flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-terranova-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-terranova-400" />
              Actividad Territorial Reciente
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-terranova-800 text-terranova-300">
              En Vivo
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 py-3 divide-y divide-terranova-800/50">
            {incidents.slice(0, 3).map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="pt-2 text-left cursor-pointer hover:bg-terranova-800/40 p-2 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-terranova-400 font-semibold">{inc.folio}</span>
                  <span className="text-[9px] text-gray-400 font-mono">{inc.reportedAt}</span>
                </div>
                <p className="text-xs font-medium text-white group-hover:text-terranova-300 transition-colors">
                  {inc.title}
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                  <span>{inc.neighborhood}</span>
                  <span className="text-amber-400 font-bold">{inc.status}</span>
                </div>
              </div>
            ))}

            {projects.slice(0, 1).map((prj) => (
              <div
                key={prj.id}
                onClick={() => onSelectProject(prj)}
                className="pt-2 text-left cursor-pointer hover:bg-terranova-800/40 p-2 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-amber-400 font-semibold">{prj.code}</span>
                  <span className="text-[9px] text-emerald-400 font-mono">{prj.progressPercentage}% Avance</span>
                </div>
                <p className="text-xs font-medium text-white group-hover:text-terranova-300 transition-colors">
                  {prj.name}
                </p>
                <div className="w-full bg-terranova-950 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-emerald-400 h-1.5 rounded-full"
                    style={{ width: `${prj.progressPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => alert('Abriendo Bitácora Global de Operaciones y Auditoría...')}
            className="w-full py-2 rounded-lg bg-terranova-800/80 hover:bg-terranova-800 text-terranova-200 hover:text-white font-medium text-xs border border-terranova-700/80 flex items-center justify-center gap-1 transition-all"
          >
            <span>Ver Toda la Actividad del Municipio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Section: Multi-Domain Data Table */}
      <div className="rounded-2xl bg-terranova-900/90 border border-terranova-700/90 shadow-panel-dark overflow-hidden">
        {/* Table Tabs */}
        <div className="flex items-center justify-between px-4 border-b border-terranova-800 bg-terranova-950/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('incidents')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'incidents'
                  ? 'border-terranova-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Mesa de Control de Incidencias ({incidents.length})
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'properties'
                  ? 'border-terranova-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Catastro de Predios Urbanos ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'projects'
                  ? 'border-terranova-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Obras Públicas en Curso ({projects.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Incidents Table */}
        {activeTab === 'incidents' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-terranova-950/80 text-[10px] font-mono text-terranova-300 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Folio Oficial</th>
                  <th className="py-2.5 px-4">Incidencia / Problema</th>
                  <th className="py-2.5 px-4">Colonia / Ubicación</th>
                  <th className="py-2.5 px-4">Prioridad</th>
                  <th className="py-2.5 px-4">Estado</th>
                  <th className="py-2.5 px-4">Dependencia</th>
                  <th className="py-2.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terranova-800/60 font-sans">
                {incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="hover:bg-terranova-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-white">{inc.folio}</td>
                    <td className="py-2.5 px-4 font-medium text-white">{inc.title}</td>
                    <td className="py-2.5 px-4 text-gray-400">{inc.neighborhood}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.priority === 'Crítica' ? 'bg-rose-500/20 text-rose-400' :
                        inc.priority === 'Alta' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'
                      }`}>
                        {inc.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-terranova-400">{inc.status}</td>
                    <td className="py-2.5 px-4 text-gray-400">{inc.assignedDept}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button className="px-2 py-1 rounded bg-terranova-800 hover:bg-terranova-700 text-white text-[11px] font-mono">
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Properties Table */}
        {activeTab === 'properties' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-terranova-950/80 text-[10px] font-mono text-terranova-300 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Clave Catastral</th>
                  <th className="py-2.5 px-4">Colonia</th>
                  <th className="py-2.5 px-4">Uso de Suelo</th>
                  <th className="py-2.5 px-4">Área Terreno</th>
                  <th className="py-2.5 px-4">Área Constr.</th>
                  <th className="py-2.5 px-4">Valor Catastral</th>
                  <th className="py-2.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terranova-800/60 font-sans">
                {properties.map((prop) => (
                  <tr
                    key={prop.id}
                    onMouseEnter={() => setActiveMarker(prop.id)}
                    onMouseLeave={() => setActiveMarker(null)}
                    onClick={() => onSelectProperty(prop)}
                    className="hover:bg-terranova-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-white">{prop.cadastralKey}</td>
                    <td className="py-2.5 px-4 text-gray-400">{prop.neighborhood}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-terranova-800 text-terranova-300 text-[11px]">
                        {prop.landUse}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono">{prop.landArea} m²</td>
                    <td className="py-2.5 px-4 font-mono">{prop.builtArea} m²</td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-emerald-400">
                      ${prop.cadastralValue.toLocaleString()} MXN
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button className="px-2 py-1 rounded bg-terranova-800 hover:bg-terranova-700 text-white text-[11px] font-mono">
                        Cédula
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Projects Table */}
        {activeTab === 'projects' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-terranova-950/80 text-[10px] font-mono text-terranova-300 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Código Obra</th>
                  <th className="py-2.5 px-4">Descripción del Proyecto</th>
                  <th className="py-2.5 px-4">Contratista</th>
                  <th className="py-2.5 px-4">Presupuesto</th>
                  <th className="py-2.5 px-4">Avance Físico</th>
                  <th className="py-2.5 px-4">Vigencia</th>
                  <th className="py-2.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terranova-800/60 font-sans">
                {projects.map((prj) => (
                  <tr
                    key={prj.id}
                    onClick={() => onSelectProject(prj)}
                    className="hover:bg-terranova-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-white">{prj.code}</td>
                    <td className="py-2.5 px-4 font-medium text-white">{prj.name}</td>
                    <td className="py-2.5 px-4 text-gray-400">{prj.contractor}</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-400">
                      ${(prj.budgetAllocated / 1000000).toFixed(1)}M MXN
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{prj.progressPercentage}%</span>
                        <div className="w-16 bg-terranova-950 rounded-full h-1.5">
                          <div
                            className="bg-emerald-400 h-1.5 rounded-full"
                            style={{ width: `${prj.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-gray-400">{prj.startDate} - {prj.endDate}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button className="px-2 py-1 rounded bg-terranova-800 hover:bg-terranova-700 text-white text-[11px] font-mono">
                        Bitácora
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
