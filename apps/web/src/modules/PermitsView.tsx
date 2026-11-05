import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  MapPin,
  Building2,
  ChevronRight,
  X,
  Sparkles,
  Printer,
  ShieldCheck,
  FileCheck,
  Kanban,
  Table as TableIcon,
  FileSignature,
} from 'lucide-react';
import { PermitItem, PermitRequirement } from '../types';

interface PermitsViewProps {
  permits: PermitItem[];
  onSelectPermit?: (p: PermitItem) => void;
  onFocusMap: (coords: [number, number]) => void;
  onAddPermit?: (p: PermitItem) => void;
  onReviewPermit?: (
    permitId: string,
    status: PermitItem['status'],
    notes: string,
    zoning?: PermitItem['zoningComplianceStatus']
  ) => void;
  onUpdateRequirement?: (
    permitId: string,
    reqId: string,
    status: PermitRequirement['status']
  ) => void;
}

export const PermitsView: React.FC<PermitsViewProps> = ({
  permits,
  onSelectPermit,
  onFocusMap,
  onAddPermit,
  onReviewPermit,
  onUpdateRequirement,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterZoning, setFilterZoning] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Selected Permit for Inspection / Review Modal
  const [selectedPermit, setSelectedPermit] = useState<PermitItem | null>(null);
  const [isNewPermitModalOpen, setIsNewPermitModalOpen] = useState<boolean>(false);

  // Review Form in Modal
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [reviewZoning, setReviewZoning] = useState<PermitItem['zoningComplianceStatus']>('COMPATIBLE');

  // New Permit Form State
  const [newType, setNewType] = useState<PermitItem['permitType']>('Licencia de Construcción (Obra Mayor)');
  const [newCadastralKey, setNewCadastralKey] = useState<string>('21-114-001-045-0012-000');
  const [newAddress, setNewAddress] = useState<string>('Av. Juárez 2108');
  const [newNeighborhood, setNewNeighborhood] = useState<string>('Colonia La Paz');
  const [newApplicant, setNewApplicant] = useState<string>('Lic. Fernando Garza M.');
  const [newRfc, setNewRfc] = useState<string>('GAM850711PL9');
  const [newDro, setNewDro] = useState<string>('Ing. Fernando Valenzuela Ramos');
  const [newDroLicense, setNewDroLicense] = useState<string>('DRO-PUE-2018-048');
  const [newDesc, setNewDesc] = useState<string>('Construcción de complejo habitacional y comercial de 4 niveles.');
  const [newArea, setNewArea] = useState<number>(1280);
  const [newLevels, setNewLevels] = useState<number>(4);

  // Filter Logic
  const filtered = permits.filter((p) => {
    const matchType = filterType === 'ALL' || p.permitType.includes(filterType);
    const matchZoning = filterZoning === 'ALL' || p.zoningComplianceStatus === filterZoning;
    const matchSearch =
      p.folio.toLowerCase().includes(search.toLowerCase()) ||
      p.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      p.cadastralKey.toLowerCase().includes(search.toLowerCase()) ||
      p.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
      (p.droName && p.droName.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchZoning && matchSearch;
  });

  // KPIs
  const totalCount = permits.length;
  const approvedCount = permits.filter((p) => p.status === 'Aprobado y Sellado' || p.status === 'Dictamen Favorable').length;
  const inReviewCount = permits.filter((p) => p.status === 'En Revisión Técnica' || p.status === 'Ingresado').length;
  const observationsCount = permits.filter((p) => p.status === 'Prevención / Observaciones').length;
  const totalM2 = permits.reduce((acc, p) => acc + (p.proposedBuiltAreaM2 || 0), 0);
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 100;

  // Handlers
  const handleReviewStatus = (status: PermitItem['status']) => {
    if (!selectedPermit) return;

    if (onReviewPermit) {
      onReviewPermit(selectedPermit.id, status, reviewNotes || `Dictamen pericial: ${status}`, reviewZoning);
    }

    let issuedAt = selectedPermit.issuedAt;
    let expiresAt = selectedPermit.expiresAt;
    let seal = selectedPermit.officialDigitalSeal;
    let qr = selectedPermit.qrVerificationCode;

    if (status === 'Aprobado y Sellado' && !seal) {
      issuedAt = new Date().toISOString();
      const exp = new Date();
      exp.setMonth(exp.getMonth() + 24);
      expiresAt = exp.toISOString();
      seal = 'c4e7f9a2b1d3085694a1209384756abcdef8901234567fedcba98765432101234';
      qr = `VERIF-LIC-${selectedPermit.folio}`;
    }

    const updatedHistory = [...selectedPermit.history];
    updatedHistory.push({
      date: new Date().toISOString(),
      status,
      note: reviewNotes || `Cambio de estatus a ${status}`,
      author: 'Dirección de Desarrollo Urbano Municipal',
    });

    setSelectedPermit({
      ...selectedPermit,
      status,
      zoningComplianceStatus: reviewZoning,
      technicalNotes: reviewNotes || selectedPermit.technicalNotes,
      issuedAt,
      expiresAt,
      officialDigitalSeal: seal,
      qrVerificationCode: qr,
      history: updatedHistory,
    });
    setReviewNotes('');
  };

  const handleToggleRequirement = (reqId: string, currentStatus: PermitRequirement['status']) => {
    if (!selectedPermit) return;
    const nextStatus: PermitRequirement['status'] =
      currentStatus === 'VALIDADO' ? 'OBSERVADO' : currentStatus === 'OBSERVADO' ? 'PENDIENTE' : 'VALIDADO';

    if (onUpdateRequirement) {
      onUpdateRequirement(selectedPermit.id, reqId, nextStatus);
    }

    const updatedReqs = selectedPermit.requirements.map((r) =>
      r.id === reqId ? { ...r, status: nextStatus } : r
    );

    setSelectedPermit({
      ...selectedPermit,
      requirements: updatedReqs,
    });
  };

  const handleCreatePermit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextSeq = 412 + permits.length + 1;
    const year = new Date().getFullYear();
    const typePrefix =
      newType.includes('Uso de Suelo') ? 'USO' :
      newType.includes('Construcción') ? 'OBR' :
      newType.includes('Alineamiento') ? 'ALN' : 'URB';

    const folio = `LIC-${typePrefix}-${year}-${String(nextSeq).padStart(5, '0')}`;

    const created: PermitItem = {
      id: `per-${Date.now()}`,
      folio,
      permitType: newType,
      cadastralKey: newCadastralKey,
      propertyAddress: newAddress,
      neighborhood: newNeighborhood,
      applicantName: newApplicant,
      applicantRfc: newRfc,
      applicantPhone: '222-412-8901',
      applicantEmail: 'tramites@ventanilladigital.mx',
      droName: newDro,
      droLicenseNumber: newDroLicense,
      projectDescription: newDesc,
      proposedBuiltAreaM2: newArea,
      levelsCount: newLevels,
      pduZoneClassification: 'H-2 (Habitacional Densidad Media)',
      zoningComplianceStatus: 'COMPATIBLE',
      status: 'Ingresado',
      coordinates: [19.043 + (Math.random() - 0.5) * 0.03, -98.201 + (Math.random() - 0.5) * 0.03],
      requirements: [
        { id: `req-${Date.now()}-1`, documentName: 'Escritura Pública y Título de Propiedad', isMandatory: true, status: 'VALIDADO' },
        { id: `req-${Date.now()}-2`, documentName: 'Boleta de Impuesto Predial al Corriente', isMandatory: true, status: 'VALIDADO' },
        { id: `req-${Date.now()}-3`, documentName: 'Memoria de Cálculo y Planos Firmados por DRO', isMandatory: true, status: 'PENDIENTE' },
        { id: `req-${Date.now()}-4`, documentName: 'Dictamen de Compatibilidad PDU', isMandatory: true, status: 'PENDIENTE' },
      ],
      history: [
        {
          date: new Date().toISOString(),
          status: 'Ingresado',
          note: `Expediente ingresado por ${newApplicant}.`,
          author: 'Ventanilla Única Digital',
        },
      ],
    };

    if (onAddPermit) {
      onAddPermit(created);
    }
    setSelectedPermit(created);
    setIsNewPermitModalOpen(false);
  };

  const KANBAN_STAGES: Array<{ status: PermitItem['status']; label: string; color: string; border: string }> = [
    { status: 'Ingresado', label: 'Ingresados', color: 'bg-sky-500/10 text-sky-400', border: 'border-sky-500/30' },
    { status: 'En Revisión Técnica', label: 'Revisión Técnica', color: 'bg-indigo-500/10 text-indigo-400', border: 'border-indigo-500/30' },
    { status: 'Prevención / Observaciones', label: 'Observados', color: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/30' },
    { status: 'Dictamen Favorable', label: 'Dictamen Favorable', color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500/30' },
    { status: 'Aprobado y Sellado', label: 'Licencia Sellada', color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/30' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 gis-grid-bg text-gray-200">
      {/* 1. Header & Live Executive KPIs */}
      <div className="bg-terranova-900/90 border border-terranova-700/80 p-5 rounded-2xl shadow-panel-dark">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <FileSignature className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                TERRANOVA PERMITS — Ventanilla Única de Permisos Urbanos
              </h1>
              <p className="text-xs text-gray-400">
                Dictaminación técnica pericial, licencias de construcción, uso de suelo, directores responsables de obra (DRO) y compatibilidad PDU.
              </p>
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
                <span>Bandeja Kanban</span>
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
              onClick={() => setIsNewPermitModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ingresar Trámite</span>
            </button>
          </div>
        </div>

        {/* Global Urban Management KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-terranova-950/70 p-3.5 rounded-xl border border-terranova-800">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider">Total Expedientes</span>
            <div className="text-xl font-bold font-mono text-white mt-1">{totalCount}</div>
            <span className="text-[10px] text-gray-500 font-mono">En Ventanilla Única</span>
          </div>

          <div className="bg-terranova-950/70 p-3.5 rounded-xl border border-terranova-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider">Licencias Selladas</span>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-1">{approvedCount}</div>
            <span className="text-[10px] text-emerald-400/80 font-mono">Con Sello SHA-256</span>
          </div>

          <div className="bg-terranova-950/70 p-3.5 rounded-xl border border-terranova-800">
            <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono tracking-wider">En Revisión DRO</span>
            <div className="text-xl font-bold font-mono text-indigo-300 mt-1">{inReviewCount}</div>
            <span className="text-[10px] text-indigo-400/80 font-mono">Dictamen Pericial</span>
          </div>

          <div className="bg-terranova-950/70 p-3.5 rounded-xl border border-terranova-800">
            <span className="text-[10px] uppercase font-bold text-amber-400 font-mono tracking-wider">Con Prevención</span>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1">{observationsCount}</div>
            <span className="text-[10px] text-amber-400/80 font-mono">Subsanando Requisitos</span>
          </div>

          <div className="bg-terranova-950/70 p-3.5 rounded-xl border border-terranova-800">
            <span className="text-[10px] uppercase font-bold text-purple-400 font-mono tracking-wider">Superficie Total</span>
            <div className="text-xl font-bold font-mono text-purple-300 mt-1">
              {(totalM2 / 1000).toFixed(1)}k m²
            </div>
            <span className="text-[10px] text-purple-400/80 font-mono">Construcción Gestionada</span>
          </div>

          <div className="bg-terranova-950/70 p-3.5 rounded-xl border border-terranova-800">
            <span className="text-[10px] uppercase font-bold text-terranova-400 font-mono tracking-wider">Tasa Aprobación</span>
            <div className="text-xl font-bold font-mono text-terranova-300 mt-1">{approvalRate}%</div>
            <span className="text-[10px] text-terranova-400/80 font-mono">Eficiencia Municipal</span>
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
            placeholder="Buscar por Folio, Clave Catastral, DRO o Solicitante..."
            className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-terranova-900/90 border border-terranova-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
          >
            <option value="ALL">Todos los Tipos de Licencia</option>
            <option value="Construcción">Licencias de Construcción</option>
            <option value="Uso de Suelo">Licencias de Uso de Suelo</option>
            <option value="Alineamiento">Alineamiento y Número Oficial</option>
          </select>

          <div className="flex items-center gap-1 bg-terranova-900/60 px-2 py-1 rounded-lg border border-terranova-800 font-mono text-[11px]">
            <span className="text-gray-400">PDU:</span>
            {['ALL', 'COMPATIBLE', 'CONDICIONADO'].map((z) => (
              <button
                key={z}
                onClick={() => setFilterZoning(z)}
                className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                  filterZoning === z
                    ? 'bg-terranova-500 text-terranova-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {z === 'ALL' ? 'Todos' : z}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Views: Kanban or Table */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
          {KANBAN_STAGES.map((col) => {
            const colPermits = filtered.filter((p) => p.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-terranova-950/60 border border-terranova-800 rounded-2xl p-3 flex flex-col min-h-[520px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-terranova-800">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${col.color} ${col.border}`}>
                    {col.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-gray-400 bg-terranova-900 px-2 py-0.5 rounded-md border border-terranova-800">
                    {colPermits.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colPermits.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-500 italic border border-dashed border-terranova-800/80 rounded-xl">
                      Sin expedientes en esta fase
                    </div>
                  ) : (
                    colPermits.map((per) => (
                      <div
                        key={per.id}
                        onClick={() => {
                          setSelectedPermit(per);
                          if (onSelectPermit) onSelectPermit(per);
                        }}
                        className="bg-terranova-900/90 border border-terranova-700/80 hover:border-terranova-400 p-3.5 rounded-xl shadow-panel-dark transition-all cursor-pointer group flex flex-col justify-between hover:translate-y-[-2px]"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="font-mono text-xs font-bold text-terranova-400 group-hover:text-terranova-300 transition-colors">
                              {per.folio}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                                per.zoningComplianceStatus === 'COMPATIBLE'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              PDU: {per.zoningComplianceStatus}
                            </span>
                          </div>

                          <h4 className="text-xs font-semibold text-white leading-tight line-clamp-2">
                            {per.permitType}
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-1 truncate">
                            📍 {per.propertyAddress}
                          </p>

                          {/* Cadastral Key & Applicant */}
                          <div className="mt-2.5 pt-2 border-t border-terranova-800 text-[10px] font-mono space-y-1 text-gray-400">
                            <div className="truncate">Cve: <strong className="text-gray-300">{per.cadastralKey}</strong></div>
                            <div className="truncate">DRO: <strong className="text-terranova-300">{per.droName || 'Sin asignar'}</strong></div>
                          </div>

                          {/* Area & Requirements Badge */}
                          <div className="mt-2 px-2 py-1 rounded bg-terranova-950 border border-terranova-800 text-[10px] font-mono flex items-center justify-between text-gray-400">
                            <span>{per.proposedBuiltAreaM2} m² ({per.levelsCount} niv)</span>
                            <span className="text-emerald-400">
                              ✓ {per.requirements.filter((r) => r.status === 'VALIDADO').length}/{per.requirements.length} doctos
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-terranova-800/80">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onFocusMap(per.coordinates);
                            }}
                            className="flex-1 py-1 rounded bg-terranova-800 hover:bg-terranova-700 text-terranova-200 text-[10px] font-mono flex items-center justify-center gap-1 transition-colors"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Predio</span>
                          </button>
                          <button
                            onClick={() => setSelectedPermit(per)}
                            className="flex-1 py-1 rounded bg-terranova-500/20 hover:bg-terranova-500/30 text-terranova-300 text-[10px] font-mono flex items-center justify-center gap-1 transition-colors"
                          >
                            <span>Dictaminar</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
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
                  <th className="p-3">Folio Oficial</th>
                  <th className="p-3">Tipo de Trámite</th>
                  <th className="p-3">Clave Catastral</th>
                  <th className="p-3">Solicitante</th>
                  <th className="p-3">Perito / DRO</th>
                  <th className="p-3">Superficie (m²)</th>
                  <th className="p-3">Compatibilidad PDU</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terranova-800/60 font-mono">
                {filtered.map((per) => (
                  <tr
                    key={per.id}
                    onClick={() => setSelectedPermit(per)}
                    className="hover:bg-terranova-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-bold text-terranova-400">{per.folio}</td>
                    <td className="p-3 font-sans font-semibold text-white">{per.permitType}</td>
                    <td className="p-3 text-gray-300">{per.cadastralKey}</td>
                    <td className="p-3 font-sans text-gray-300">{per.applicantName}</td>
                    <td className="p-3 font-sans text-terranova-300">{per.droName}</td>
                    <td className="p-3">{per.proposedBuiltAreaM2} m²</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        per.zoningComplianceStatus === 'COMPATIBLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {per.zoningComplianceStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-white">{per.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPermit(per);
                        }}
                        className="px-2.5 py-1 rounded bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-[10px]"
                      >
                        Dictaminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Expediente Digital y Dictamen Pericial */}
      {selectedPermit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-terranova-900 border border-terranova-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-terranova-800 flex items-start justify-between bg-terranova-950/80 sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-terranova-400">
                    {selectedPermit.folio}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {selectedPermit.status}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Zonificación: {selectedPermit.pduZoneClassification}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{selectedPermit.permitType}</h2>
                <p className="text-xs text-gray-400">📍 {selectedPermit.propertyAddress}, {selectedPermit.neighborhood}</p>
              </div>

              <button
                onClick={() => setSelectedPermit(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-terranova-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* CÉDULA OFICIAL SI ESTÁ APROBADO Y SELLADO */}
              {selectedPermit.status === 'Aprobado y Sellado' && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-terranova-950 via-terranova-900 to-terranova-950 border-2 border-emerald-500/50 shadow-glow-tech space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-terranova-800">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                          Licencia Oficial Municipal Digitalizada
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          Documento Oficial Certificado • Vigencia Legal: 24 Meses
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-terranova-950 font-bold text-xs shadow-sm self-start"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir Licencia Oficial</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-terranova-950/80 border border-terranova-800">
                      <span className="text-[10px] text-gray-500 block">Folio Licencia:</span>
                      <strong className="text-white">{selectedPermit.folio}</strong>
                    </div>
                    <div className="p-2 rounded bg-terranova-950/80 border border-terranova-800">
                      <span className="text-[10px] text-gray-500 block">Fecha Emisión:</span>
                      <strong className="text-white">{new Date(selectedPermit.issuedAt || Date.now()).toLocaleDateString('es-MX')}</strong>
                    </div>
                    <div className="p-2 rounded bg-terranova-950/80 border border-terranova-800">
                      <span className="text-[10px] text-gray-500 block">Vencimiento Legal:</span>
                      <strong className="text-emerald-400">{new Date(selectedPermit.expiresAt || Date.now()).toLocaleDateString('es-MX')}</strong>
                    </div>
                    <div className="p-2 rounded bg-terranova-950/80 border border-terranova-800">
                      <span className="text-[10px] text-gray-500 block">Verificador QR:</span>
                      <strong className="text-terranova-300">{selectedPermit.qrVerificationCode}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-terranova-950 border border-terranova-800 text-[10px] font-mono break-all">
                    <span className="text-gray-500 block mb-0.5">Sello Digital SHA-256 de Validez Gubernamental:</span>
                    <span className="text-terranova-400">{selectedPermit.officialDigitalSeal}</span>
                  </div>
                </div>
              )}

              {/* Technical Property and DRO Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-terranova-950/70 border border-terranova-800 space-y-2">
                  <h4 className="font-bold text-white uppercase font-mono tracking-wider text-[11px] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-terranova-400" />
                    Datos del Predio y Proyecto
                  </h4>
                  <div className="space-y-1 text-gray-300 font-mono">
                    <p><span className="text-gray-500">Clave Catastral:</span> <strong className="text-white">{selectedPermit.cadastralKey}</strong></p>
                    <p><span className="text-gray-500">Superficie Propuesta:</span> <strong className="text-white">{selectedPermit.proposedBuiltAreaM2} m²</strong></p>
                    <p><span className="text-gray-500">Niveles / Altura:</span> <strong className="text-white">{selectedPermit.levelsCount} Niveles</strong></p>
                    <p><span className="text-gray-500">Zonificación PDU:</span> <span className="text-terranova-300">{selectedPermit.pduZoneClassification}</span></p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-terranova-950/70 border border-terranova-800 space-y-2">
                  <h4 className="font-bold text-white uppercase font-mono tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-terranova-400" />
                    Director Responsable de Obra (DRO) y Solicitante
                  </h4>
                  <div className="space-y-1 text-gray-300 font-mono">
                    <p><span className="text-gray-500">DRO / Perito:</span> <strong className="text-white">{selectedPermit.droName || 'No registrado'}</strong></p>
                    <p><span className="text-gray-500">Cédula DRO:</span> <span className="text-terranova-300 font-bold">{selectedPermit.droLicenseNumber || 'S/N'}</span></p>
                    <p><span className="text-gray-500">Solicitante:</span> <span className="text-white">{selectedPermit.applicantName}</span></p>
                    <p><span className="text-gray-500">Contacto:</span> <span className="text-gray-400">{selectedPermit.applicantPhone}</span></p>
                  </div>
                </div>
              </div>

              {/* CHECKLIST DOCUMENTAL */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-terranova-400" />
                    Checklist de Requisitos Documentales Oficiales ({selectedPermit.requirements.length})
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono">Haga clic en un estatus para alternar validación</span>
                </div>

                <div className="space-y-2">
                  {selectedPermit.requirements.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl bg-terranova-950/80 border border-terranova-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${
                          req.status === 'VALIDADO' ? 'bg-emerald-400' :
                          req.status === 'OBSERVADO' ? 'bg-amber-400' : 'bg-gray-500'
                        }`} />
                        <span className="font-medium text-white">{req.documentName}</span>
                        {req.isMandatory && (
                          <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Obligatorio</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleRequirement(req.id, req.status)}
                        className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold border transition-all ${
                          req.status === 'VALIDADO'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : req.status === 'OBSERVADO'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}
                      >
                        {req.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* TECHNICAL REVIEW & DICTAMEN PERICIAL CONTROL */}
              <div className="p-5 rounded-xl bg-terranova-950 border border-terranova-700 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-terranova-400" />
                  Dictaminación Técnica y Validación Urbanística
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1">Compatibilidad con PDU:</label>
                    <select
                      value={reviewZoning}
                      onChange={(e) => setReviewZoning(e.target.value as any)}
                      className="w-full bg-terranova-900 border border-terranova-700 rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                    >
                      <option value="COMPATIBLE">COMPATIBLE (Cumple COS, CUS y Usos)</option>
                      <option value="CONDICIONADO">CONDICIONADO (Requiere Vo.Bo. INAH o Protección Civil)</option>
                      <option value="INCOMPATIBLE">INCOMPATIBLE (Uso no autorizado en sector)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Notas Técnicas del Perito Dictaminador:</label>
                    <input
                      type="text"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Ej. Cumple cabalmente con coeficientes COS 0.7 y CUS 3.5..."
                      className="w-full bg-terranova-900 border border-terranova-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-terranova-800">
                  <span className="text-xs text-gray-400 mr-2">Acción de Dictamen:</span>
                  <button
                    onClick={() => handleReviewStatus('En Revisión Técnica')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold"
                  >
                    Marcar En Revisión
                  </button>
                  <button
                    onClick={() => handleReviewStatus('Prevención / Observaciones')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold"
                  >
                    Emitir Observaciones
                  </button>
                  <button
                    onClick={() => handleReviewStatus('Dictamen Favorable')}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold"
                  >
                    Dictamen Favorable
                  </button>
                  <button
                    onClick={() => handleReviewStatus('Aprobado y Sellado')}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-terranova-950 font-bold text-xs shadow-glow-tech flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprobar y Emitir Licencia Oficial</span>
                  </button>
                </div>
              </div>

              {/* AUDIT LOG */}
              {selectedPermit.history && selectedPermit.history.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Bitácora Histórica de Dictaminaciones
                  </h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {selectedPermit.history.map((h, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-terranova-950/70 border border-terranova-800 text-xs flex justify-between gap-3">
                        <div>
                          <span className="font-bold text-white">{h.status}</span>
                          <span className="text-[10px] text-gray-500 font-mono ml-2">{h.author}</span>
                          <p className="text-gray-300 mt-0.5 text-[11px]">{h.note}</p>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap">
                          {new Date(h.date).toLocaleDateString('es-MX')}
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

      {/* MODAL 2: Ingresar Nuevo Trámite */}
      {isNewPermitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-terranova-900 border border-terranova-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b border-terranova-800 flex items-center justify-between bg-terranova-950">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-terranova-500/10 text-terranova-400 border border-terranova-500/30">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Ingreso de Trámite / Licencia Urbana</h3>
                  <p className="text-xs text-gray-400">Ventanilla Única de Trámites y Dictámenes Catastrales</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewPermitModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-terranova-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePermit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Tipo de Licencia Solicitada *</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                >
                  <option value="Licencia de Construcción (Obra Mayor)">Licencia de Construcción (Obra Mayor)</option>
                  <option value="Licencia de Construcción (Obra Menor)">Licencia de Construcción (Obra Menor)</option>
                  <option value="Licencia de Uso de Suelo">Licencia de Uso de Suelo</option>
                  <option value="Alineamiento y Número Oficial">Alineamiento y Número Oficial</option>
                  <option value="Terminación de Obra y Ocupación">Terminación de Obra y Ocupación</option>
                  <option value="Factibilidad de Servicios Urbanos">Factibilidad de Servicios Urbanos</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Clave Catastral Oficial *</label>
                  <input
                    type="text"
                    required
                    value={newCadastralKey}
                    onChange={(e) => setNewCadastralKey(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>

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
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Dirección Oficial del Inmueble *</label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Nombre del Solicitante / Propietario *</label>
                  <input
                    type="text"
                    required
                    value={newApplicant}
                    onChange={(e) => setNewApplicant(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">RFC del Solicitante</label>
                  <input
                    type="text"
                    value={newRfc}
                    onChange={(e) => setNewRfc(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Director Responsable de Obra (DRO)</label>
                  <input
                    type="text"
                    value={newDro}
                    onChange={(e) => setNewDro(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Cédula / Registro DRO</label>
                  <input
                    type="text"
                    value={newDroLicense}
                    onChange={(e) => setNewDroLicense(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Superficie Propuesta (m²)</label>
                  <input
                    type="number"
                    min={0}
                    value={newArea}
                    onChange={(e) => setNewArea(Number(e.target.value))}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Número de Niveles</label>
                  <input
                    type="number"
                    min={1}
                    value={newLevels}
                    onChange={(e) => setNewLevels(Number(e.target.value))}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descripción del Proyecto *</label>
                <textarea
                  rows={2}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-terranova-950 border border-terranova-800 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-terranova-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewPermitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 text-gray-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ingresar Expediente Digital</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
