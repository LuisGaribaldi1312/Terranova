import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Kanban,
  Table as TableIcon,
  ChevronRight,
  ShieldAlert,
  X,
  History,
  Sparkles,
} from 'lucide-react';
import { IncidentItem } from '../types';

interface IncidentsViewProps {
  incidents: IncidentItem[];
  onSelectIncident?: (i: IncidentItem) => void;
  onFocusMap: (coords: [number, number]) => void;
  onAddIncident?: (i: IncidentItem) => void;
  onUpdateStatus?: (
    id: string,
    status: IncidentItem['status'],
    crewName?: string,
    notes?: string
  ) => void;
}

const CREWS_CATALOG = [
  'Cuadrilla Hidráulica 01 (Oriente)',
  'Cuadrilla Hidráulica 02 (Poniente)',
  'Cuadrilla Bacheo y Asfalto 03 (Centro)',
  'Cuadrilla Bacheo y Pavimentación 04 (Sur)',
  'Brigada Alumbrado y Redes Eléctricas 01',
  'Brigada Drenaje y Desazolve 02',
  'Brigada Movilidad y Señalética 05',
];

const SLA_HOURS_MAP: Record<string, number> = {
  'Crítica': 4,
  'Alta': 24,
  'Media': 72,
  'Baja': 120,
};

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onSelectIncident,
  onFocusMap,
  onAddIncident,
  onUpdateStatus,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Modals state
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [selectedCrew, setSelectedCrew] = useState<string>('');

  // New Incident Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Bacheo');
  const [newPriority, setNewPriority] = useState<'Crítica' | 'Alta' | 'Media' | 'Baja'>('Alta');
  const [newNeighborhood, setNewNeighborhood] = useState('Colonia Centro');
  const [newAddress, setNewAddress] = useState('Av. Reforma esq. Calle 5 de Mayo');
  const [newCitizenName, setNewCitizenName] = useState('Lic. Roberto Méndez');
  const [newCitizenPhone, setNewCitizenPhone] = useState('222-412-8901');
  const [newChannel, setNewChannel] = useState<'Línea 072' | 'App Móvil' | 'Portal Web' | 'Ventanilla'>('Línea 072');
  const [newDescription, setNewDescription] = useState('Hundimiento de la carpeta asfáltica provocando riesgo a vehículos.');

  // Filtering
  const filtered = incidents.filter((inc) => {
    const matchPri = filterPriority === 'ALL' || inc.priority === filterPriority;
    const matchType = filterType === 'ALL' || inc.type === filterType;
    const matchSearch =
      inc.folio.toLowerCase().includes(search.toLowerCase()) ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
      (inc.citizenName && inc.citizenName.toLowerCase().includes(search.toLowerCase()));
    return matchPri && matchType && matchSearch;
  });

  // Real-time Metrics
  const totalCount = incidents.length;
  const inProgressCount = incidents.filter((i) => i.status === 'En Proceso' || i.status === 'Asignada').length;
  const resolvedCount = incidents.filter((i) => i.status === 'Resuelta').length;
  const criticalCount = incidents.filter((i) => i.priority === 'Crítica' && i.status !== 'Resuelta').length;

  const checkSlaExpired = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline).getTime() < Date.now();
  };

  const slaRiskCount = incidents.filter((i) => i.status !== 'Resuelta' && checkSlaExpired(i.slaDeadline)).length;
  const slaComplianceRate = totalCount > 0 ? Math.round(((totalCount - slaRiskCount) / totalCount) * 100) : 100;

  // Handle Dispatch / Status Updates
  const handleUpdateStatus = (status: IncidentItem['status']) => {
    if (!selectedIncident) return;
    if (onUpdateStatus) {
      onUpdateStatus(selectedIncident.id, status, selectedCrew || selectedIncident.assignedCrew, resolutionNote);
    }
    // Update local modal view
    const updatedHistory = selectedIncident.history ? [...selectedIncident.history] : [];
    if (resolutionNote) {
      updatedHistory.push({
        date: new Date().toISOString(),
        status,
        note: resolutionNote,
        author: 'Despacho Central de Guardia',
      });
    }
    setSelectedIncident({
      ...selectedIncident,
      status,
      assignedCrew: selectedCrew || selectedIncident.assignedCrew,
      history: updatedHistory,
    });
    setResolutionNote('');
  };

  // Handle New Incident Creation
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const consecutive = 415 + incidents.length + 1;
    const folio = `INC-2026-${String(consecutive).padStart(6, '0')}`;
    const hours = SLA_HOURS_MAP[newPriority] || 24;
    const deadline = new Date(Date.now() + hours * 3600 * 1000).toISOString();

    const created: IncidentItem = {
      id: `inc-${Date.now()}`,
      folio,
      title: newTitle || `${newType} en ${newNeighborhood}`,
      type: newType,
      priority: newPriority,
      status: 'Recibida',
      neighborhood: newNeighborhood,
      assignedDept:
        newType === 'Agua Potable' || newType === 'Drenaje'
          ? 'Dirección de Agua Potable y Alcantarillado'
          : newType === 'Alumbrado'
          ? 'Dirección de Alumbrado Público'
          : 'Secretaría de Infraestructura y Obras',
      assignedCrew: 'Sin Asignar (Pendiente de Despacho)',
      reportedAt: new Date().toISOString(),
      slaDeadline: deadline,
      citizenName: newCitizenName,
      citizenPhone: newCitizenPhone,
      originChannel: newChannel,
      coordinates: [19.043 + (Math.random() - 0.5) * 0.04, -98.201 + (Math.random() - 0.5) * 0.04],
      evidences: [
        {
          id: `ev-${Date.now()}-1`,
          url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
          caption: 'Reporte fotográfico inicial',
          stage: 'before',
          uploadedAt: new Date().toISOString(),
        },
      ],
      history: [
        {
          date: new Date().toISOString(),
          status: 'Recibida',
          note: newDescription,
          author: `Sistema Terranova (${newChannel})`,
        },
      ],
    };

    if (onAddIncident) {
      onAddIncident(created);
    }
    setIsNewModalOpen(false);
    setSelectedIncident(created);
  };

  const KANBAN_COLUMNS: Array<{ status: IncidentItem['status']; label: string; color: string; border: string }> = [
    { status: 'Recibida', label: 'Recibidas', color: 'bg-sky-500/10 text-sky-400', border: 'border-sky-500/30' },
    { status: 'Validada', label: 'Validadas', color: 'bg-indigo-500/10 text-indigo-400', border: 'border-indigo-500/30' },
    { status: 'Asignada', label: 'Asignadas', color: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/30' },
    { status: 'En Proceso', label: 'En Proceso', color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500/30' },
    { status: 'Resuelta', label: 'Resueltas', color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/30' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 gis-grid-bg text-gray-200">
      {/* Header & Live KPI Metrics */}
      <div className="bg-terranova-900/90 border border-terranova-700/80 p-5 rounded-2xl shadow-panel-dark">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">
                  Mesa de Control de Incidencias Urbanas
                </h1>
                <p className="text-xs text-gray-400">
                  Despacho operativo en tiempo real, gestión de cuadrillas técnicas y cumplimiento de SLA municipal.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-terranova-950/80 p-1 rounded-xl border border-terranova-800">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-terranova-500 text-terranova-950 font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Tablero Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-terranova-500 text-terranova-950 font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Vista Tabla</span>
              </button>
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Reportar Incidencia</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-terranova-950/60 p-3 rounded-xl border border-terranova-800/80">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Reportes</span>
            <div className="text-xl font-bold font-mono text-white mt-1">{totalCount}</div>
            <span className="text-[10px] text-gray-500">Histórico activo</span>
          </div>

          <div className="bg-terranova-950/60 p-3 rounded-xl border border-terranova-800/80">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">En Operación</span>
            <div className="text-xl font-bold font-mono text-purple-300 mt-1">{inProgressCount}</div>
            <span className="text-[10px] text-purple-400/80">Cuadrillas activas</span>
          </div>

          <div className="bg-terranova-950/60 p-3 rounded-xl border border-terranova-800/80">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Resueltas</span>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-1">{resolvedCount}</div>
            <span className="text-[10px] text-emerald-400/80">Cierre exitoso</span>
          </div>

          <div className="bg-terranova-950/60 p-3 rounded-xl border border-terranova-800/80">
            <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Críticas Pendientes</span>
            <div className="text-xl font-bold font-mono text-rose-300 mt-1">{criticalCount}</div>
            <span className="text-[10px] text-rose-400/80">SLA 4 horas</span>
          </div>

          <div className="bg-terranova-950/60 p-3 rounded-xl border border-terranova-800/80">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">SLA en Riesgo</span>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1">{slaRiskCount}</div>
            <span className="text-[10px] text-amber-400/80">Excediendo tiempo</span>
          </div>

          <div className="bg-terranova-950/60 p-3 rounded-xl border border-terranova-800/80">
            <span className="text-[10px] uppercase font-bold text-terranova-400 tracking-wider">Cumplimiento SLA</span>
            <div className="text-xl font-bold font-mono text-terranova-300 mt-1">{slaComplianceRate}%</div>
            <span className="text-[10px] text-terranova-400/80">Eficiencia global</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-terranova-950/70 p-3 rounded-xl border border-terranova-800">
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md bg-terranova-900/80 px-3 py-1.5 rounded-lg border border-terranova-700/60">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Folio, Reporte, Colonia o Ciudadano..."
            className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-terranova-900/60 px-2 py-1 rounded-lg border border-terranova-800">
            <Filter className="w-3.5 h-3.5 text-terranova-400 mr-1" />
            <span className="text-[11px] text-gray-400">Prioridad:</span>
            {['ALL', 'Crítica', 'Alta', 'Media', 'Baja'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                  filterPriority === p
                    ? 'bg-terranova-500 text-terranova-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {p === 'ALL' ? 'Todas' : p}
              </button>
            ))}
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-terranova-900/90 border border-terranova-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="Bacheo">Bacheo y Pavimento</option>
            <option value="Agua Potable">Agua Potable y Fugas</option>
            <option value="Alumbrado">Alumbrado Público</option>
            <option value="Drenaje">Drenaje y Desazolve</option>
            <option value="Señalización">Movilidad y Señalética</option>
          </select>
        </div>
      </div>

      {/* Main Content: Kanban or Table */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
          {KANBAN_COLUMNS.map((col) => {
            const colIncidents = filtered.filter((i) => i.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-terranova-950/60 border border-terranova-800 rounded-2xl p-3 flex flex-col min-h-[520px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-terranova-800">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${col.color} ${col.border}`}>
                      {col.label}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-gray-400 bg-terranova-900 px-2 py-0.5 rounded-md border border-terranova-800">
                    {colIncidents.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colIncidents.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-500 italic border border-dashed border-terranova-800/80 rounded-xl">
                      Sin reportes en esta fase
                    </div>
                  ) : (
                    colIncidents.map((inc) => {
                      const isExpired = checkSlaExpired(inc.slaDeadline);
                      return (
                        <div
                          key={inc.id}
                          onClick={() => {
                            setSelectedIncident(inc);
                            if (onSelectIncident) onSelectIncident(inc);
                          }}
                          className="bg-terranova-900/90 border border-terranova-700/80 hover:border-terranova-400 p-3.5 rounded-xl shadow-panel-dark transition-all cursor-pointer group flex flex-col justify-between hover:translate-y-[-2px]"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className="font-mono text-xs font-bold text-white group-hover:text-terranova-300 transition-colors">
                                {inc.folio}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  inc.priority === 'Crítica'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                    : inc.priority === 'Alta'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                    : 'bg-sky-500/20 text-sky-400'
                                }`}
                              >
                                {inc.priority}
                              </span>
                            </div>

                            <h4 className="text-xs font-semibold text-white leading-tight line-clamp-2">
                              {inc.title}
                            </h4>
                            <p className="text-[11px] text-gray-400 mt-1 truncate">
                              📍 {inc.neighborhood}
                            </p>

                            {/* Crew info */}
                            <div className="mt-2.5 pt-2 border-t border-terranova-800 text-[10px] flex items-center justify-between text-gray-400">
                              <span className="truncate max-w-[130px]">
                                👷 {inc.assignedCrew ? inc.assignedCrew.replace('Cuadrilla ', 'C. ') : 'Sin cuadrilla'}
                              </span>
                              <span className="font-mono text-terranova-300">{inc.originChannel || '072'}</span>
                            </div>

                            {/* SLA Badge */}
                            <div
                              className={`mt-2 px-2 py-1 rounded text-[10px] font-mono flex items-center justify-between ${
                                isExpired && inc.status !== 'Resuelta'
                                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                                  : 'bg-terranova-950/60 text-gray-400 border border-terranova-800'
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-terranova-400" />
                                SLA:
                              </span>
                              <span className="font-bold">
                                {isExpired && inc.status !== 'Resuelta' ? '⚠️ Vencido' : 'En tiempo'}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-terranova-800/80">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onFocusMap(inc.coordinates);
                              }}
                              className="flex-1 py-1 rounded bg-terranova-800 hover:bg-terranova-700 text-terranova-200 text-[10px] font-mono flex items-center justify-center gap-1 transition-colors"
                              title="Ver en Visor GIS"
                            >
                              <MapPin className="w-3 h-3" />
                              <span>Mapa</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIncident(inc);
                              }}
                              className="flex-1 py-1 rounded bg-terranova-500/20 hover:bg-terranova-500/30 text-terranova-300 text-[10px] font-mono flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>Despachar</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-terranova-900/90 border border-terranova-700/80 rounded-2xl overflow-hidden shadow-panel-dark">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-terranova-950 text-gray-400 font-mono uppercase text-[10px] border-b border-terranova-800">
                <tr>
                  <th className="p-3">Folio</th>
                  <th className="p-3">Tipo / Falla</th>
                  <th className="p-3">Ubicación</th>
                  <th className="p-3">Prioridad</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Cuadrilla Asignada</th>
                  <th className="p-3">SLA / Vencimiento</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terranova-800/60 font-mono">
                {filtered.map((inc) => {
                  const isExpired = checkSlaExpired(inc.slaDeadline);
                  return (
                    <tr
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className="hover:bg-terranova-800/40 cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-bold text-white group-hover:text-terranova-300">
                        {inc.folio}
                      </td>
                      <td className="p-3 font-sans text-gray-200">
                        <div className="font-semibold text-white">{inc.title}</div>
                        <span className="text-[10px] text-gray-400 font-mono">{inc.type}</span>
                      </td>
                      <td className="p-3 font-sans text-gray-300">
                        <div>{inc.neighborhood}</div>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {inc.coordinates[0].toFixed(4)}, {inc.coordinates[1].toFixed(4)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            inc.priority === 'Crítica'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : inc.priority === 'Alta'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-sky-500/20 text-sky-400'
                          }`}
                        >
                          {inc.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-white font-semibold">{inc.status}</span>
                      </td>
                      <td className="p-3 font-sans text-xs text-terranova-300">
                        {inc.assignedCrew || 'Sin Asignar'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            isExpired && inc.status !== 'Resuelta'
                              ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                              : 'text-gray-400'
                          }`}
                        >
                          {isExpired && inc.status !== 'Resuelta' ? '⚠️ Vencido' : 'En tiempo'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onFocusMap(inc.coordinates)}
                            className="p-1.5 rounded bg-terranova-800 hover:bg-terranova-700 text-terranova-300"
                            title="Ver en Mapa"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedIncident(inc)}
                            className="px-2.5 py-1 rounded bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-[10px]"
                          >
                            Despachar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Detalle y Despacho Operativo */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-terranova-900 border border-terranova-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-terranova-800 flex items-start justify-between bg-terranova-950/80 sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-terranova-400">
                    {selectedIncident.folio}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedIncident.priority === 'Crítica'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : selectedIncident.priority === 'Alta'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-sky-500/20 text-sky-400'
                    }`}
                  >
                    Prioridad {selectedIncident.priority}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {selectedIncident.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{selectedIncident.title}</h2>
                <p className="text-xs text-gray-400">📍 {selectedIncident.neighborhood}</p>
              </div>

              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-terranova-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* SLA & Time Banner */}
              <div className="p-3.5 rounded-xl bg-terranova-950/80 border border-terranova-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-terranova-400" />
                  <div>
                    <div className="text-[11px] text-gray-400">Vencimiento de SLA:</div>
                    <div className="text-xs font-mono font-bold text-white">
                      {selectedIncident.slaDeadline
                        ? new Date(selectedIncident.slaDeadline).toLocaleString('es-MX')
                        : 'Sin SLA establecido'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Canal de Recepción:</span>
                  <span className="font-mono text-xs font-bold text-terranova-300 bg-terranova-800/80 px-2.5 py-1 rounded-md">
                    {selectedIncident.originChannel || 'Línea 072'}
                  </span>
                </div>
              </div>

              {/* Citizen & Location Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-terranova-950/60 border border-terranova-800/80 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-terranova-400" />
                    Datos del Ciudadano Reportante
                  </h4>
                  <div className="text-xs space-y-1">
                    <p><span className="text-gray-500">Nombre:</span> <strong className="text-white">{selectedIncident.citizenName || 'Ciudadano Anónimo'}</strong></p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-gray-500">Contacto:</span>
                      <strong className="text-terranova-300 font-mono">{selectedIncident.citizenPhone || 'N/A'}</strong>
                    </p>
                    <p><span className="text-gray-500">Dependencia Responsable:</span> <span className="text-gray-300">{selectedIncident.assignedDept}</span></p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-terranova-950/60 border border-terranova-800/80 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-terranova-400" />
                    Georreferenciación Municipal
                  </h4>
                  <div className="text-xs space-y-1">
                    <p><span className="text-gray-500">Colonia:</span> <strong className="text-white">{selectedIncident.neighborhood}</strong></p>
                    <p><span className="text-gray-500">Coordenadas:</span> <span className="font-mono text-terranova-300">{selectedIncident.coordinates[0].toFixed(5)}, {selectedIncident.coordinates[1].toFixed(5)}</span></p>
                    <button
                      onClick={() => {
                        onFocusMap(selectedIncident.coordinates);
                        setSelectedIncident(null);
                      }}
                      className="mt-2 text-xs text-terranova-400 hover:text-terranova-300 flex items-center gap-1 font-mono font-bold"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Centrar en Visor GIS Terranova →
                    </button>
                  </div>
                </div>
              </div>

              {/* Photographic Evidences */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-terranova-400" />
                  Evidencia Fotográfica de Campo ({selectedIncident.evidences ? selectedIncident.evidences.length : 0})
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedIncident.evidences && selectedIncident.evidences.length > 0 ? (
                    selectedIncident.evidences.map((ev) => (
                      <div key={ev.id} className="rounded-xl overflow-hidden border border-terranova-800 bg-terranova-950">
                        <img src={ev.url} alt={ev.caption} className="w-full h-32 object-cover" />
                        <div className="p-2 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded uppercase font-bold text-[9px] ${
                            ev.stage === 'after' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'
                          }`}>
                            {ev.stage === 'after' ? 'Resolución' : 'Reporte Inicial'}
                          </span>
                          <p className="text-gray-300 mt-1 truncate">{ev.caption}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 p-4 rounded-xl border border-dashed border-terranova-800 text-center text-xs text-gray-500">
                      Sin fotografías adjuntas al reporte
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Dispatch Control */}
              <div className="p-5 rounded-xl bg-terranova-950/80 border border-terranova-700 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-terranova-400" />
                  Despacho Operativo y Cambio de Estatus
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Asignar Cuadrilla Técnica:</label>
                    <select
                      value={selectedCrew || selectedIncident.assignedCrew || ''}
                      onChange={(e) => setSelectedCrew(e.target.value)}
                      className="w-full bg-terranova-900 border border-terranova-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    >
                      <option value="">Seleccionar Cuadrilla de Guardia...</option>
                      {CREWS_CATALOG.map((crew) => (
                        <option key={crew} value={crew}>{crew}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nota Técnica de Bitácora / Cierre:</label>
                    <input
                      type="text"
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Ej. Cuadrilla en sitio con camión de asfalto y compactador..."
                      className="w-full bg-terranova-900 border border-terranova-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-terranova-800">
                  <span className="text-xs text-gray-400 mr-2">Transición de Estado:</span>
                  <button
                    onClick={() => handleUpdateStatus('Validada')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold"
                  >
                    Marcar como Validada
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Asignada')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold"
                  >
                    Asignar Cuadrilla
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('En Proceso')}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold"
                  >
                    Iniciar Trabajos (En Proceso)
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Resuelta')}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-terranova-950 font-bold text-xs shadow-glow-tech flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Concluir y Resolver</span>
                  </button>
                </div>
              </div>

              {/* Audit History Log */}
              {selectedIncident.history && selectedIncident.history.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-terranova-400" />
                    Bitácora Histórica de Intervenciones ({selectedIncident.history.length})
                  </h4>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedIncident.history.map((h, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-terranova-950/60 border border-terranova-800 text-xs flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{h.status}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{h.author}</span>
                          </div>
                          <p className="text-gray-300 mt-1 text-[11px]">{h.note}</p>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap">
                          {new Date(h.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Reportar Nueva Incidencia Urbana */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-terranova-900 border border-terranova-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b border-terranova-800 flex items-center justify-between bg-terranova-950/80">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-terranova-500/10 text-terranova-400 border border-terranova-500/30">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Registro de Incidencia Urbana</h3>
                  <p className="text-xs text-gray-400">Atención ciudadana y georreferenciación con SLA automático</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-terranova-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Falla / Problema *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="Bacheo">Bacheo y Asfalto</option>
                    <option value="Agua Potable">Fuga de Agua Potable</option>
                    <option value="Alumbrado">Luminaria Fundida / Alumbrado</option>
                    <option value="Drenaje">Drenaje Obstruido / Coladera</option>
                    <option value="Señalización">Falla Semafórica / Señalética</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Prioridad y SLA *</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none font-bold text-amber-400"
                  >
                    <option value="Crítica">Crítica (SLA: 4 Horas)</option>
                    <option value="Alta">Alta (SLA: 24 Horas)</option>
                    <option value="Media">Media (SLA: 72 Horas)</option>
                    <option value="Baja">Baja (SLA: 120 Horas)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Título Resumido del Reporte *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Fuga de agua con derrame sobre carpeta asfáltica"
                  className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Colonia / Sector *</label>
                  <input
                    type="text"
                    required
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Dirección / Cruces de Calle *</label>
                  <input
                    type="text"
                    required
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Nombre del Reportante</label>
                  <input
                    type="text"
                    value={newCitizenName}
                    onChange={(e) => setNewCitizenName(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Teléfono Móvil (072)</label>
                  <input
                    type="text"
                    value={newCitizenPhone}
                    onChange={(e) => setNewCitizenPhone(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Canal de Entrada</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="Línea 072">Línea 072</option>
                    <option value="App Móvil">App Terranova</option>
                    <option value="Portal Web">Portal Web</option>
                    <option value="Ventanilla">Ventanilla Única</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descripción Detallada *</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-terranova-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 text-gray-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generar Reporte y Folio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
