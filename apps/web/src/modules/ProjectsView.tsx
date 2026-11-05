import React, { useState } from 'react';
import {
  HardHat,
  Plus,
  Search,
  Filter,
  TrendingUp,
  CheckCircle2,
  FileText,
  MapPin,
  ChevronRight,
  X,
  Sparkles,
  } from 'lucide-react';
import { ProjectItem, ProjectEstimation } from '../types';

interface ProjectsViewProps {
  projects: ProjectItem[];
  onSelectProject?: (p: ProjectItem) => void;
  onFocusMap: (coords: [number, number]) => void;
  onAddProject?: (p: ProjectItem) => void;
  onAddEstimation?: (projectId: string, est: ProjectEstimation) => void;
  onUpdateEstimationStatus?: (
    projectId: string,
    estimationNumber: number,
    status: ProjectEstimation['status']
  ) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onSelectProject,
  onFocusMap,
  onAddProject,
  onAddEstimation,
  onUpdateEstimationStatus,
}) => {
  const [filterFunding, setFilterFunding] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Selected project for detail/S-Curve/estimations
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(() => projects[0] || null);

  // Modals
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [isNewEstimationModalOpen, setIsNewEstimationModalOpen] = useState<boolean>(false);

  // New Estimation Form State
  const [newEstPeriodStart, setNewEstPeriodStart] = useState<string>('2026-05-01');
  const [newEstPeriodEnd, setNewEstPeriodEnd] = useState<string>('2026-05-31');
  const [newEstGrossAmount, setNewEstGrossAmount] = useState<number>(7500000);
  const [newEstAdvanceRate, setNewEstAdvanceRate] = useState<number>(30); // 30%
  const [newEstRetentionRate, setNewEstRetentionRate] = useState<number>(0.5); // 5 al millar (0.5%)
  const [newEstCfdi, setNewEstCfdi] = useState<string>('9F1A2B3C-4D5E-6F7A-8B9C-0D1E2F3A4B5C');

  // New Project Form State
  const [newCode, setNewCode] = useState<string>('OP-PUE-2026-005');
  const [newName, setNewName] = useState<string>('');
  const [newType, setNewType] = useState<string>('Vialidad');
  const [newBudget, setNewBudget] = useState<number>(15000000);
  const [newContractor, setNewContractor] = useState<string>('Constructora Altiplano S.A. de C.V.');
  const [newRfc, setNewRfc] = useState<string>('CAS120405MN1');
  const [newContract, setNewContract] = useState<string>('COP-PUE-2026-015');
  const [newFunding, setNewFunding] = useState<string>('FAISMUN 2026');
  const [newSupervisor, setNewSupervisor] = useState<string>('Ing. Roberto Garza');
  const [newStartDate, setNewStartDate] = useState<string>('2026-05-01');
  const [newEndDate, setNewEndDate] = useState<string>('2026-10-31');

  // Calculations for estimation modal in real-time
  const calcAdvanceAmortization = Number((newEstGrossAmount * (newEstAdvanceRate / 100)).toFixed(2));
  const calcGuaranteeRetention = Number((newEstGrossAmount * (newEstRetentionRate / 100)).toFixed(2));
  const calcNetPayable = Number((newEstGrossAmount - calcAdvanceAmortization - calcGuaranteeRetention).toFixed(2));

  // Filtered projects
  const filtered = projects.filter((p) => {
    const matchFunding = filterFunding === 'ALL' || (p.fundingSource && p.fundingSource.includes(filterFunding));
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchSearch =
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.contractor.toLowerCase().includes(search.toLowerCase()) ||
      (p.contractNumber && p.contractNumber.toLowerCase().includes(search.toLowerCase()));
    return matchFunding && matchStatus && matchSearch;
  });

  // Global KPIs
  const totalAllocated = projects.reduce((acc, p) => acc + p.budgetAllocated, 0);
  const totalExercised = projects.reduce((acc, p) => acc + p.budgetExercised, 0);
  const activeCount = projects.filter((p) => p.status === 'En Ejecución').length;
  const completedCount = projects.filter((p) => p.status === 'Concluida').length;
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.progressPercentage, 0) / projects.length)
      : 0;

  // Handlers
  const handleCreateEstimation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const currentEstimations = selectedProject.estimations || [];
    const nextNum = currentEstimations.length + 1;

    const created: ProjectEstimation = {
      id: `est-${selectedProject.id}-${nextNum}`,
      estimationNumber: nextNum,
      period: `${newEstPeriodStart} al ${newEstPeriodEnd}`,
      grossAmount: newEstGrossAmount,
      advanceAmortization: calcAdvanceAmortization,
      guaranteeRetention: calcGuaranteeRetention,
      netPayable: calcNetPayable,
      status: 'VALIDATED_SUPERVISOR',
      cfdiUuid: newEstCfdi,
    };

    if (onAddEstimation) {
      onAddEstimation(selectedProject.id, created);
    }

    // Update local state
    const updated = {
      ...selectedProject,
      estimations: [...currentEstimations, created],
    };
    setSelectedProject(updated);
    setIsNewEstimationModalOpen(false);
  };

  const handleUpdateStatus = (estimationNumber: number, status: ProjectEstimation['status']) => {
    if (!selectedProject) return;

    if (onUpdateEstimationStatus) {
      onUpdateEstimationStatus(selectedProject.id, estimationNumber, status);
    }

    let addExercised = 0;
    const updatedEstimations = (selectedProject.estimations || []).map((e) => {
      if (e.estimationNumber !== estimationNumber) return e;
      if (status === 'PAID') addExercised = e.grossAmount;
      return {
        ...e,
        status,
        paidAt: status === 'PAID' ? new Date().toISOString() : e.paidAt,
      };
    });

    const newExercised = selectedProject.budgetExercised + addExercised;
    const newFinProgress = Number(((newExercised / selectedProject.budgetAllocated) * 100).toFixed(1));

    setSelectedProject({
      ...selectedProject,
      budgetExercised: newExercised,
      financialProgress: newFinProgress,
      estimations: updatedEstimations,
    });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ProjectItem = {
      id: `prj-${Date.now()}`,
      code: newCode,
      name: newName || `Obra Pública ${newCode}`,
      type: newType,
      budgetAllocated: newBudget,
      budgetExercised: 0,
      progressPercentage: 0,
      physicalProgressPlanned: 10,
      physicalProgressReal: 0,
      financialProgress: 0,
      contractor: newContractor,
      contractorRfc: newRfc,
      contractNumber: newContract,
      fundingSource: newFunding,
      supervisorName: newSupervisor,
      status: 'En Ejecución',
      startDate: newStartDate,
      endDate: newEndDate,
      coordinates: [19.043 + (Math.random() - 0.5) * 0.04, -98.201 + (Math.random() - 0.5) * 0.04],
      sCurve: [
        { month: 'Mes 1', planned: 15, real: 0, financial: 0 },
        { month: 'Mes 2', planned: 35, real: 0, financial: 0 },
        { month: 'Mes 3', planned: 60, real: 0, financial: 0 },
        { month: 'Mes 4', planned: 85, real: 0, financial: 0 },
        { month: 'Mes 5', planned: 100, real: 0, financial: 0 },
      ],
      estimations: [],
    };

    if (onAddProject) {
      onAddProject(created);
    }
    setSelectedProject(created);
    setIsNewProjectModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 gis-grid-bg text-gray-200">
      {/* 1. Header & Live Executive Financial Metrics */}
      <div className="bg-terranova-900/90 border border-terranova-700/80 p-5 rounded-2xl shadow-panel-dark">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <HardHat className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                TERRANOVA PROJECTS — Control de Obras Públicas
              </h1>
              <p className="text-xs text-gray-400">
                Supervisión física-financiera de contratos de obra pública, Curva S, estimaciones y fondos federales (FAISMUN/FORTAMUN).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Contrato de Obra</span>
            </button>
          </div>
        </div>

        {/* Global Financial KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-terranova-950/70 p-3.5 rounded-xl border border-terranova-800">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider">Inversión Total</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              ${(totalAllocated / 1000000).toFixed(1)}M
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Presupuesto Asignado</span>
          </div>

          <div className="bg-terranova-950/70 p-3.5 rounded-xl border border-terranova-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider">Total Ejercido</span>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
              ${(totalExercised / 1000000).toFixed(1)}M
            </div>
            <span className="text-[10px] text-emerald-400/80 font-mono">
              {totalAllocated > 0 ? ((totalExercised / totalAllocated) * 100).toFixed(1) : 0}% financiero
            </span>
          </div>

          <div className="bg-terranova-950/70 p-3.5 rounded-xl border border-terranova-800">
            <span className="text-[10px] uppercase font-bold text-amber-400 font-mono tracking-wider">Por Ejercer</span>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1">
              ${((totalAllocated - totalExercised) / 1000000).toFixed(1)}M
            </div>
            <span className="text-[10px] text-amber-400/80 font-mono">Saldo en Tesorería</span>
          </div>

          <div className="bg-terranova-950/70 p-3.5 rounded-xl border border-terranova-800">
            <span className="text-[10px] uppercase font-bold text-purple-400 font-mono tracking-wider">En Ejecución</span>
            <div className="text-xl font-bold font-mono text-purple-300 mt-1">{activeCount}</div>
            <span className="text-[10px] text-purple-400/80 font-mono">Frentes de Obra</span>
          </div>

          <div className="bg-terranova-950/70 p-3.5 rounded-xl border border-terranova-800">
            <span className="text-[10px] uppercase font-bold text-sky-400 font-mono tracking-wider">Concluidas</span>
            <div className="text-xl font-bold font-mono text-sky-300 mt-1">{completedCount}</div>
            <span className="text-[10px] text-sky-400/80 font-mono">Entrega-Recepción</span>
          </div>

          <div className="bg-terranova-950/70 p-3.5 rounded-xl border border-terranova-800">
            <span className="text-[10px] uppercase font-bold text-terranova-400 font-mono tracking-wider">Avance Promedio</span>
            <div className="text-xl font-bold font-mono text-terranova-300 mt-1">{avgProgress}%</div>
            <span className="text-[10px] text-terranova-400/80 font-mono">Ponderado Físico</span>
          </div>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-terranova-950/70 p-3 rounded-xl border border-terranova-800">
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md bg-terranova-900/80 px-3 py-1.5 rounded-lg border border-terranova-700/60">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Clave, Contrato, Nombre o Contratista..."
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
            <span className="text-[11px] text-gray-400">Fondo:</span>
            {['ALL', 'FAISMUN', 'FORTAMUN', 'Recursos Propios'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterFunding(f)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                  filterFunding === f
                    ? 'bg-terranova-500 text-terranova-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f === 'ALL' ? 'Todos' : f}
              </button>
            ))}
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-terranova-900/90 border border-terranova-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="En Ejecución">En Ejecución</option>
            <option value="Planificada">Planificada</option>
            <option value="Concluida">Concluida</option>
          </select>
        </div>
      </div>

      {/* 3. Main Split Content: Project List (Left) + Detail & S-Curve (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Project Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono px-1">
            <span>Contratos Activos ({filtered.length})</span>
            <span>Seleccione para inspeccionar</span>
          </div>

          <div className="space-y-3 max-h-[780px] overflow-y-auto pr-1">
            {filtered.map((prj) => {
              const isSelected = selectedProject?.id === prj.id;
              const isDelayed = (prj.physicalProgressPlanned || 0) > prj.progressPercentage;

              return (
                <div
                  key={prj.id}
                  onClick={() => {
                    setSelectedProject(prj);
                    if (onSelectProject) onSelectProject(prj);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-terranova-900 border-terranova-400 shadow-panel-dark ring-1 ring-terranova-400/50'
                      : 'bg-terranova-900/70 border-terranova-800 hover:border-terranova-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-terranova-400">
                        {prj.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isDelayed && prj.status === 'En Ejecución' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                            Atraso Físico
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          prj.status === 'Concluida' ? 'bg-sky-500/20 text-sky-400' :
                          prj.status === 'En Ejecución' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {prj.status}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                      {prj.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      🏢 {prj.contractor}
                    </p>

                    <div className="mt-3 p-2.5 rounded-xl bg-terranova-950/80 border border-terranova-800/80 space-y-2 text-[11px] font-mono">
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Fondo Federal:</span>
                        <span className="text-white font-bold">{prj.fundingSource || 'FAISMUN'}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Contrato:</span>
                        <span className="text-terranova-300 font-bold">{prj.contractNumber || 'En trámite'}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Presupuesto Asignado:</span>
                        <span className="text-white font-bold">${(prj.budgetAllocated / 1000000).toFixed(2)}M MXN</span>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-gray-400">Avance Físico Real:</span>
                        <span className="font-bold text-white">{prj.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-terranova-950 rounded-full h-2 overflow-hidden border border-terranova-800">
                        <div
                          className="bg-gradient-to-r from-terranova-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${prj.progressPercentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] font-mono text-gray-500">
                        <span>Financiero Ejercido:</span>
                        <span>{((prj.budgetExercised / prj.budgetAllocated) * 100).toFixed(1)}% (${(prj.budgetExercised / 1000000).toFixed(1)}M)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-2.5 border-t border-terranova-800 text-xs">
                    {prj.coordinates && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusMap(prj.coordinates!);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-terranova-800 hover:bg-terranova-700 text-terranova-300 font-mono text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Traza en Mapa</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedProject(prj)}
                      className="flex-1 py-1.5 rounded-lg bg-terranova-500/20 hover:bg-terranova-500/30 text-terranova-300 font-mono text-[11px] flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Ver Curva S</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Project Deep Dive (Curva S & Estimations) (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {selectedProject ? (
            <>
              {/* Project Top Profile */}
              <div className="bg-terranova-900/90 border border-terranova-700/80 rounded-2xl p-6 shadow-panel-dark space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-terranova-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-terranova-400 bg-terranova-950 px-2.5 py-0.5 rounded border border-terranova-800">
                        {selectedProject.code}
                      </span>
                      <span className="font-mono text-xs text-gray-400">
                        Contrato: {selectedProject.contractNumber || 'S/N'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        {selectedProject.fundingSource || 'FAISMUN'}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-white">{selectedProject.name}</h2>
                    <p className="text-xs text-gray-400">Contratista: <strong>{selectedProject.contractor}</strong> (RFC: {selectedProject.contractorRfc || 'N/A'})</p>
                  </div>

                  <button
                    onClick={() => setIsNewEstimationModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech transition-all self-start"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Estimación</span>
                  </button>
                </div>

                {/* Supervisor & Contract Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-terranova-950/70 border border-terranova-800">
                    <span className="text-[10px] text-gray-500 block uppercase">Supervisión Técnica</span>
                    <strong className="text-white text-[11px] truncate block mt-0.5">{selectedProject.supervisorName || 'Supervisión Interna'}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-terranova-950/70 border border-terranova-800">
                    <span className="text-[10px] text-gray-500 block uppercase">Periodo Contractual</span>
                    <strong className="text-white text-[11px] block mt-0.5">{selectedProject.startDate} al {selectedProject.endDate}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-terranova-950/70 border border-terranova-800">
                    <span className="text-[10px] text-gray-500 block uppercase">Financiero Ejercido</span>
                    <strong className="text-emerald-400 text-[11px] block mt-0.5">
                      ${(selectedProject.budgetExercised / 1000000).toFixed(2)}M / ${(selectedProject.budgetAllocated / 1000000).toFixed(2)}M
                    </strong>
                  </div>
                </div>

                {/* CURVA S INTERACTIVA (SVG CHART) */}
                <div className="p-5 rounded-2xl bg-terranova-950 border border-terranova-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-terranova-400" />
                        Curva S — Supervisión de Avance Contractual
                      </h3>
                      <p className="text-[11px] text-gray-400">Comparativa de Avance Programado vs. Avance Físico Real vs. Avance Financiero</p>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-sky-400 inline-block" />
                        <span className="text-gray-300">Programado</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
                        <span className="text-gray-300">Físico Real</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-purple-400 inline-block" />
                        <span className="text-gray-300">Financiero</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  {selectedProject.sCurve && selectedProject.sCurve.length > 0 ? (
                    <div className="relative pt-4 pb-2">
                      <div className="h-44 w-full flex items-end">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                          {/* Grid Lines */}
                          <line x1="0" y1="0" x2="500" y2="0" stroke="#1f2937" strokeDasharray="3 3" />
                          <line x1="0" y1="50" x2="500" y2="50" stroke="#1f2937" strokeDasharray="3 3" />
                          <line x1="0" y1="100" x2="500" y2="100" stroke="#1f2937" strokeDasharray="3 3" />
                          <line x1="0" y1="150" x2="500" y2="150" stroke="#374151" />

                          {/* Planned Line (Sky Blue) */}
                          <polyline
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2.5"
                            strokeDasharray="4 2"
                            points={selectedProject.sCurve
                              .map((pt, idx) => {
                                const x = (idx / (selectedProject.sCurve!.length - 1)) * 480 + 10;
                                const y = 150 - (pt.planned / 100) * 140;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />

                          {/* Real Physical Line (Emerald) */}
                          <polyline
                            fill="none"
                            stroke="#34d399"
                            strokeWidth="3"
                            points={selectedProject.sCurve
                              .filter((pt) => pt.real > 0 || pt.month.includes('Ene') || pt.month.includes('Feb') || pt.month.includes('Oct'))
                              .map((pt) => {
                                const originalIdx = selectedProject.sCurve!.indexOf(pt);
                                const x = (originalIdx / (selectedProject.sCurve!.length - 1)) * 480 + 10;
                                const y = 150 - (pt.real / 100) * 140;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />

                          {/* Financial Progress Line (Purple) */}
                          <polyline
                            fill="none"
                            stroke="#c084fc"
                            strokeWidth="2.5"
                            points={selectedProject.sCurve
                              .filter((pt) => pt.financial > 0)
                              .map((pt) => {
                                const originalIdx = selectedProject.sCurve!.indexOf(pt);
                                const x = (originalIdx / (selectedProject.sCurve!.length - 1)) * 480 + 10;
                                const y = 150 - (pt.financial / 100) * 140;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />

                          {/* Data points (dots) */}
                          {selectedProject.sCurve.map((pt, idx) => {
                            const x = (idx / (selectedProject.sCurve!.length - 1)) * 480 + 10;
                            const yPlanned = 150 - (pt.planned / 100) * 140;
                            const yReal = 150 - (pt.real / 100) * 140;

                            return (
                              <g key={idx}>
                                <circle cx={x} cy={yPlanned} r="3" fill="#38bdf8" />
                                {pt.real > 0 && <circle cx={x} cy={yReal} r="4" fill="#34d399" />}
                              </g>
                            );
                          })}
                        </svg>
                      </div>

                      {/* X-Axis Month Labels */}
                      <div className="flex justify-between text-[10px] font-mono text-gray-500 pt-2 border-t border-terranova-800">
                        {selectedProject.sCurve.map((pt, idx) => (
                          <div key={idx} className="text-center">
                            <span>{pt.month}</span>
                            <span className="block text-[9px] text-emerald-400 font-bold">
                              {pt.real > 0 ? `${pt.real}%` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-terranova-800 rounded-xl">
                      Sin datos de Curva S cargados para esta obra
                    </div>
                  )}
                </div>
              </div>

              {/* ESTIMACIONES DE OBRA PÚBLICA */}
              <div className="bg-terranova-900/90 border border-terranova-700/80 rounded-2xl p-6 shadow-panel-dark space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-terranova-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-terranova-400" />
                      Estimaciones de Obra Pública ({selectedProject.estimations ? selectedProject.estimations.length : 0})
                    </h3>
                    <p className="text-xs text-gray-400">
                      Amortización de anticipo (30%), retención 5 al millar (0.5%) y comprobantes CFDI
                    </p>
                  </div>
                </div>

                {selectedProject.estimations && selectedProject.estimations.length > 0 ? (
                  <div className="space-y-3">
                    {selectedProject.estimations.map((est) => (
                      <div
                        key={est.id}
                        className="p-4 rounded-xl bg-terranova-950 border border-terranova-800 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white bg-terranova-900 px-2.5 py-1 rounded border border-terranova-800">
                              Estimación #{est.estimationNumber}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">Periodo: {est.period}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              est.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                              est.status === 'APPROVED_TREASURY' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}>
                              {est.status === 'PAID' ? 'PAGADA EN BANCO' :
                               est.status === 'APPROVED_TREASURY' ? 'APROBADA TESORERÍA' :
                               est.status === 'VALIDATED_SUPERVISOR' ? 'VALIDADA SUPERVISIÓN' : 'BORRADOR'}
                            </span>
                          </div>
                        </div>

                        {/* Financial Breakdown Table */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                          <div className="p-2 rounded bg-terranova-900/60 border border-terranova-800">
                            <span className="text-[10px] text-gray-500 block">Monto Bruto:</span>
                            <strong className="text-white">${est.grossAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                          </div>

                          <div className="p-2 rounded bg-terranova-900/60 border border-terranova-800">
                            <span className="text-[10px] text-gray-500 block">Amortiz. Anticipo (30%):</span>
                            <strong className="text-amber-400">-${est.advanceAmortization.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                          </div>

                          <div className="p-2 rounded bg-terranova-900/60 border border-terranova-800">
                            <span className="text-[10px] text-gray-500 block">Ret. 5 al millar (0.5%):</span>
                            <strong className="text-rose-400">-${est.guaranteeRetention.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                          </div>

                          <div className="p-2 rounded bg-terranova-900/60 border border-terranova-800">
                            <span className="text-[10px] text-gray-500 block">Neto a Liquidar:</span>
                            <strong className="text-emerald-400 text-sm">${est.netPayable.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                          </div>
                        </div>

                        {/* CFDI & Action Workflow */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-terranova-800/80 text-[11px] font-mono">
                          <span className="text-gray-400 truncate max-w-xs">
                            CFDI: <strong className="text-terranova-300">{est.cfdiUuid || 'Pendiente de timbrado'}</strong>
                          </span>

                          <div className="flex items-center gap-1.5 self-end">
                            {est.status === 'DRAFT' && (
                              <button
                                onClick={() => handleUpdateStatus(est.estimationNumber, 'VALIDATED_SUPERVISOR')}
                                className="px-2.5 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-bold"
                              >
                                Validar Supervisión
                              </button>
                            )}
                            {est.status === 'VALIDATED_SUPERVISOR' && (
                              <button
                                onClick={() => handleUpdateStatus(est.estimationNumber, 'APPROVED_TREASURY')}
                                className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold"
                              >
                                Aprobar en Tesorería
                              </button>
                            )}
                            {est.status === 'APPROVED_TREASURY' && (
                              <button
                                onClick={() => handleUpdateStatus(est.estimationNumber, 'PAID')}
                                className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-terranova-950 text-[10px] font-bold shadow-glow-tech flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Liquidar Pago Bancario</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-terranova-800 rounded-xl">
                    No se han registrado estimaciones de obra para este contrato.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500 bg-terranova-900/50 border border-terranova-800 rounded-2xl">
              Seleccione una obra para consultar su Curva S y desglose de estimaciones.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Registro de Nueva Estimación */}
      {isNewEstimationModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-terranova-900 border border-terranova-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b border-terranova-800 flex items-center justify-between bg-terranova-950">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-terranova-500/10 text-terranova-400 border border-terranova-500/30">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Generar Estimación de Obra Pública</h3>
                  <p className="text-xs text-gray-400">Contrato: {selectedProject.contractNumber || selectedProject.code}</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewEstimationModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-terranova-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEstimation} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Fecha Inicio del Periodo *</label>
                  <input
                    type="date"
                    required
                    value={newEstPeriodStart}
                    onChange={(e) => setNewEstPeriodStart(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Fecha Fin del Periodo *</label>
                  <input
                    type="date"
                    required
                    value={newEstPeriodEnd}
                    onChange={(e) => setNewEstPeriodEnd(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Monto Bruto de Trabajos Ejecutados ($ MXN) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newEstGrossAmount}
                  onChange={(e) => setNewEstGrossAmount(Number(e.target.value))}
                  className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono font-bold text-base focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">% Amortización de Anticipo (Norma 30%)</label>
                  <input
                    type="number"
                    value={newEstAdvanceRate}
                    onChange={(e) => setNewEstAdvanceRate(Number(e.target.value))}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">% Retención 5 al millar (0.5% supervisión)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newEstRetentionRate}
                    onChange={(e) => setNewEstRetentionRate(Number(e.target.value))}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Real-time Calculation Summary */}
              <div className="p-4 rounded-xl bg-terranova-950 border border-terranova-800 space-y-2 font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Monto Bruto:</span>
                  <span className="text-white">${newEstGrossAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Amortización de Anticipo ({newEstAdvanceRate}%):</span>
                  <span className="text-amber-400">-${calcAdvanceAmortization.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Retención Garantía 5 al millar ({newEstRetentionRate}%):</span>
                  <span className="text-rose-400">-${calcGuaranteeRetention.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-terranova-800 text-sm font-bold">
                  <span className="text-emerald-400">Neto a Pagar Contratista:</span>
                  <span className="text-emerald-400">${calcNetPayable.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">UUID de Factura CFDI 4.0</label>
                <input
                  type="text"
                  value={newEstCfdi}
                  onChange={(e) => setNewEstCfdi(e.target.value)}
                  placeholder="Ej. 9F1A2B3C-4D5E-6F7A-8B9C-0D1E2F3A4B5C"
                  className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-terranova-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewEstimationModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 text-gray-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech"
                >
                  Registrar Estimación Validada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Registro de Nuevo Contrato de Obra */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-terranova-900 border border-terranova-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b border-terranova-800 flex items-center justify-between bg-terranova-950">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <HardHat className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Registro de Contrato de Obra Pública</h3>
                  <p className="text-xs text-gray-400">Apego a la Ley de Obra Pública y Servicios Relacionados</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-terranova-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Clave de Cartera / Código *</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Número de Contrato Oficial *</label>
                  <input
                    type="text"
                    required
                    value={newContract}
                    onChange={(e) => setNewContract(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Nombre Completo de la Obra *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Pavimentación y alumbrado en Av. San Claudio"
                  className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tipo de Obra</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="Vialidad">Vialidad y Pavimentación</option>
                    <option value="Hidráulica">Agua y Drenaje Pluvial</option>
                    <option value="Equipamiento">Equipamiento y Parques</option>
                    <option value="Electrificación">Electrificación y Redes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Fuente de Fondos *</label>
                  <select
                    value={newFunding}
                    onChange={(e) => setNewFunding(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none font-mono"
                  >
                    <option value="FAISMUN 2026">FAISMUN 2026</option>
                    <option value="FORTAMUN 2026">FORTAMUN 2026</option>
                    <option value="Recursos Propios">Recursos Propios</option>
                    <option value="Participaciones Federales">Participaciones</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Monto Asignado ($ MXN) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Empresa Contratista Adjudicada *</label>
                  <input
                    type="text"
                    required
                    value={newContractor}
                    onChange={(e) => setNewContractor(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">RFC de Contratista *</label>
                  <input
                    type="text"
                    required
                    value={newRfc}
                    onChange={(e) => setNewRfc(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Supervisor de Obra</label>
                  <input
                    type="text"
                    value={newSupervisor}
                    onChange={(e) => setNewSupervisor(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Fecha Inicio Contractual</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Fecha Conclusión</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-terranova-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 text-gray-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dar de Alta Contrato</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
