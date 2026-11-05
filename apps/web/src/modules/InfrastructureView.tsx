import React, { useState } from 'react';
import { 
  Zap, Search, Plus, MapPin, X,
  Droplets, Waves, Lightbulb, TrafficCone, Radio,
  Wrench, Activity, Clock, Layers
} from 'lucide-react';
import { InfrastructureAssetItem, MaintenanceLogItem } from '../types';

interface InfrastructureViewProps {
  assets: InfrastructureAssetItem[];
  onFocusMap: (coords: [number, number]) => void;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({
  assets: initialAssets,
  onFocusMap,
}) => {
  const [assetsList, setAssetsList] = useState<InfrastructureAssetItem[]>(initialAssets);
  const [filterNetwork, setFilterNetwork] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCondition, setFilterCondition] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modales
  const [selectedAsset, setSelectedAsset] = useState<InfrastructureAssetItem | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState<boolean>(false);

  // Formulario de Nueva Orden de Mantenimiento
  const [maintForm, setMaintForm] = useState({
    workOrderFolio: 'OT-2026-00915',
    maintenanceType: 'Preventivo' as MaintenanceLogItem['maintenanceType'],
    cost: 3500,
    performedBy: 'Cuadrilla 1 - Mantenimiento Urbano',
    notes: 'Inspección periódica, ajuste de conexiones y pruebas operativas.',
    newCondition: 'Excelente' as InfrastructureAssetItem['condition'],
  });

  // Formulario de Alta de Activo Urbano
  const [createForm, setCreateForm] = useState({
    assetCode: 'INF-ALU-LUM-00940',
    networkType: 'Alumbrado' as InfrastructureAssetItem['networkType'],
    assetType: 'Luminaria LED Vial 120W',
    status: 'Operativo' as InfrastructureAssetItem['status'],
    condition: 'Excelente' as InfrastructureAssetItem['condition'],
    modelOrBrand: 'Simon Lighting Maya 120',
    installationDate: '2026-03-01',
    costInstallation: 11500,
    expectedLifespanYears: 12,
    street: 'Av. Teziutlán Sur 45',
    neighborhood: 'Col. La Paz',
    lat: 19.0520,
    lng: -98.2270,
  });

  // Filtrado reactivo
  const filteredAssets = assetsList.filter((a) => {
    const matchNetwork = filterNetwork === 'ALL' || a.networkType === filterNetwork;
    const matchStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const matchCond = filterCondition === 'ALL' || a.condition === filterCondition;
    const q = search.toLowerCase();
    const matchSearch = 
      a.assetCode.toLowerCase().includes(q) ||
      a.assetType.toLowerCase().includes(q) ||
      a.neighborhood.toLowerCase().includes(q) ||
      a.street.toLowerCase().includes(q) ||
      a.modelOrBrand.toLowerCase().includes(q);
    return matchNetwork && matchStatus && matchCond && matchSearch;
  });

  // Métricas agregadas
  const totalAssets = assetsList.length;
  const operationalCount = assetsList.filter((a) => a.status === 'Operativo').length;
  const operationalPct = totalAssets > 0 ? ((operationalCount / totalAssets) * 100).toFixed(1) : '100';
  const criticalCount = assetsList.filter((a) => a.condition === 'Crítico' || a.status === 'Falla / Dañado').length;
  const totalCapitalValue = assetsList.reduce((acc, a) => acc + a.costInstallation, 0);
  const totalMaintSpent = assetsList.reduce((acc, a) => acc + a.accumulatedMaintenanceCost, 0);

  // Icono por red
  const getNetworkIcon = (net: InfrastructureAssetItem['networkType']) => {
    switch (net) {
      case 'Agua Potable': return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'Drenaje': return <Waves className="w-4 h-4 text-blue-400" />;
      case 'Alumbrado': return <Lightbulb className="w-4 h-4 text-amber-400" />;
      case 'Vialidad': return <TrafficCone className="w-4 h-4 text-orange-400" />;
      case 'Telecom': return <Radio className="w-4 h-4 text-purple-400" />;
      default: return <Zap className="w-4 h-4 text-terranova-400" />;
    }
  };

  // Manejo de Registro de Mantenimiento
  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const newLog: MaintenanceLogItem = {
      id: `ml-${Date.now()}`,
      workOrderFolio: maintForm.workOrderFolio,
      maintenanceType: maintForm.maintenanceType,
      cost: maintForm.cost,
      performedAt: new Date().toISOString(),
      performedBy: maintForm.performedBy,
      notes: maintForm.notes,
    };

    const updated = assetsList.map((a) => {
      if (a.id === selectedAsset.id) {
        return {
          ...a,
          accumulatedMaintenanceCost: a.accumulatedMaintenanceCost + maintForm.cost,
          condition: maintForm.newCondition,
          status: 'Operativo' as const,
          lastInspectionAt: new Date().toISOString(),
          maintenanceLogs: [newLog, ...(a.maintenanceLogs || [])],
        };
      }
      return a;
    });

    setAssetsList(updated);
    const updatedSelected = updated.find((a) => a.id === selectedAsset.id);
    if (updatedSelected) setSelectedAsset(updatedSelected);
    setIsMaintenanceModalOpen(false);
  };

  // Manejo de Creación de Nuevo Activo
  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();

    const newAsset: InfrastructureAssetItem = {
      id: `inf-${Date.now()}`,
      assetCode: createForm.assetCode,
      networkType: createForm.networkType,
      assetType: createForm.assetType,
      status: createForm.status,
      condition: createForm.condition,
      modelOrBrand: createForm.modelOrBrand,
      installationDate: createForm.installationDate,
      costInstallation: createForm.costInstallation,
      accumulatedMaintenanceCost: 0,
      expectedLifespanYears: createForm.expectedLifespanYears,
      remainingLifespanYears: createForm.expectedLifespanYears,
      lastInspectionAt: new Date().toISOString(),
      nextMaintenanceDue: '2026-09-01',
      street: createForm.street,
      neighborhood: createForm.neighborhood,
      coordinates: [createForm.lng, createForm.lat],
      technicalSpecs: {
        proveedorSuministro: 'Contrato Municipal 2026',
        garantiaVigenteMeses: 24,
      },
      maintenanceLogs: [],
    };

    setAssetsList([newAsset, ...assetsList]);
    setIsRegisterModalOpen(false);
    setSelectedAsset(newAsset);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 gis-grid-bg">
      {/* 1. Header Oficial de Infraestructura Urbana */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-terranova-900/90 border border-terranova-700/80 p-5 rounded-2xl shadow-panel-dark">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-terranova-500/10 border border-terranova-500/20 text-terranova-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Infraestructura Urbana y Redes de Servicios
                <span className="text-[10px] font-mono font-bold bg-terranova-500/20 text-terranova-400 border border-terranova-500/30 px-2 py-0.5 rounded-full">
                  Ciclo de Vida & Operatividad
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Inventario georreferenciado de redes de agua potable, drenaje pluvial, alumbrado, semaforización y telecomunicaciones.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            className="px-3 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 border border-terranova-700 text-xs text-gray-300 font-mono transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-terranova-400" />
            <span>{viewMode === 'cards' ? 'Vista Tabla' : 'Vista Tarjetas'}</span>
          </button>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Activo</span>
          </button>
        </div>
      </div>

      {/* 2. Tarjetas Métricas de Infraestructura */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-terranova-900/80 border border-terranova-800">
          <span className="text-gray-400 text-[10px] block uppercase">Inventario Total</span>
          <span className="text-lg font-bold text-white">{totalAssets} Activos</span>
          <span className="text-[10px] text-terranova-400 block mt-0.5">5 Redes Municipales</span>
        </div>
        <div className="p-3 rounded-xl bg-terranova-900/80 border border-terranova-800">
          <span className="text-gray-400 text-[10px] block uppercase">Tasa Operatividad</span>
          <span className="text-lg font-bold text-emerald-400">{operationalPct}% Operativo</span>
          <span className="text-[10px] text-emerald-500 block mt-0.5">{operationalCount} en servicio normal</span>
        </div>
        <div className="p-3 rounded-xl bg-terranova-900/80 border border-terranova-800">
          <span className="text-gray-400 text-[10px] block uppercase">Activos Críticos</span>
          <span className={`text-lg font-bold ${criticalCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {criticalCount} en Falla
          </span>
          <span className="text-[10px] text-rose-400 block mt-0.5">Requiere mantenimiento</span>
        </div>
        <div className="p-3 rounded-xl bg-terranova-900/80 border border-terranova-800">
          <span className="text-gray-400 text-[10px] block uppercase">Valor en Activos</span>
          <span className="text-lg font-bold text-terranova-300">${(totalCapitalValue / 1000).toFixed(1)}k MXN</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Costo de reposición</span>
        </div>
        <div className="p-3 rounded-xl bg-terranova-900/80 border border-terranova-800">
          <span className="text-gray-400 text-[10px] block uppercase">Mantenimiento</span>
          <span className="text-lg font-bold text-amber-400">${(totalMaintSpent / 1000).toFixed(1)}k MXN</span>
          <span className="text-[10px] text-amber-500 block mt-0.5">Acumulado histórico</span>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda de Activos */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-terranova-950/80 p-3.5 rounded-xl border border-terranova-800">
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md bg-terranova-900/80 px-3 py-1.5 rounded-lg border border-terranova-700/60">
          <Search className="w-4 h-4 text-terranova-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Código, Red, Tipo, Marca o Calle..."
            className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Filtro por Red */}
          <div className="flex items-center gap-1 bg-terranova-900/70 p-1 rounded-lg border border-terranova-800">
            <span className="text-gray-400 text-[10px] px-1">RED:</span>
            {['ALL', 'Agua Potable', 'Drenaje', 'Alumbrado', 'Vialidad', 'Telecom'].map((r) => (
              <button
                key={r}
                onClick={() => setFilterNetwork(r)}
                className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                  filterNetwork === r
                    ? 'bg-terranova-500 text-terranova-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {r === 'ALL' ? 'Todas' : r}
              </button>
            ))}
          </div>

          {/* Filtro por Estatus */}
          <div className="flex items-center gap-1 bg-terranova-900/70 p-1 rounded-lg border border-terranova-800">
            <span className="text-gray-400 text-[10px] px-1">ESTATUS:</span>
            {['ALL', 'Operativo', 'En Mantenimiento', 'Falla / Dañado'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                  filterStatus === s
                    ? 'bg-terranova-500 text-terranova-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {s === 'ALL' ? 'Todos' : s}
              </button>
            ))}
          </div>

          {/* Filtro por Condición */}
          <div className="flex items-center gap-1 bg-terranova-900/70 p-1 rounded-lg border border-terranova-800">
            <span className="text-gray-400 text-[10px] px-1">CONDICIÓN:</span>
            {['ALL', 'Excelente', 'Bueno', 'Regular', 'Crítico'].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCondition(c)}
                className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                  filterCondition === c
                    ? 'bg-terranova-500 text-terranova-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {c === 'ALL' ? 'Todas' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Lista de Activos (Cards o Tabla) */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="p-4 rounded-xl bg-terranova-900/85 border border-terranova-700/70 hover:border-terranova-500 shadow-panel-dark transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header de la Tarjeta */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-terranova-950 border border-terranova-800">
                      {getNetworkIcon(asset.networkType)}
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-white group-hover:text-terranova-300 transition-colors block">
                        {asset.assetCode}
                      </span>
                      <span className="text-[10px] text-terranova-400 font-mono">
                        {asset.networkType}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      asset.status === 'Operativo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      asset.status === 'En Mantenimiento' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {asset.status}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                      asset.condition === 'Excelente' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' :
                      asset.condition === 'Bueno' ? 'bg-cyan-950/60 text-cyan-400 border-cyan-800' :
                      asset.condition === 'Regular' ? 'bg-amber-950/60 text-amber-400 border-amber-800' :
                      'bg-rose-950/60 text-rose-400 border-rose-800'
                    }`}>
                      Cond: {asset.condition}
                    </span>
                  </div>
                </div>

                {/* Tipo de Activo y Ubicación */}
                <div className="my-2.5">
                  <h4 className="text-xs font-bold text-white mb-0.5">{asset.assetType}</h4>
                  <p className="text-[11px] text-gray-300 font-mono truncate">{asset.modelOrBrand}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    {asset.street}, {asset.neighborhood}
                  </p>
                </div>

                {/* Indicadores de Ciclo de Vida y Costo */}
                <div className="grid grid-cols-2 gap-2 my-2.5 p-2.5 rounded-lg bg-terranova-950/80 text-[11px] font-mono border border-terranova-800">
                  <div>
                    <span className="text-gray-500 block text-[9px]">COSTO INSTALACIÓN</span>
                    <span className="text-white font-semibold">${asset.costInstallation.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px]">GASTO MANT.</span>
                    <span className="text-amber-400 font-semibold">${asset.accumulatedMaintenanceCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px]">VIDA REMANENTE</span>
                    <span className="text-emerald-400 font-semibold">{asset.remainingLifespanYears} años</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px]">VIDA ÚTIL TOTAL</span>
                    <span className="text-gray-300 font-semibold">{asset.expectedLifespanYears} años</span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center gap-2 pt-2 border-t border-terranova-800/80">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFocusMap(asset.coordinates);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-terranova-800 hover:bg-terranova-700 text-terranova-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Enfocar GIS</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAsset(asset);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-terranova-500/20 hover:bg-terranova-500/30 border border-terranova-500/40 text-terranova-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors font-bold"
                >
                  <Activity className="w-3.5 h-3.5 text-terranova-400" />
                  <span>Ficha Técnica</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vista Tabular */
        <div className="bg-terranova-900/90 rounded-xl border border-terranova-800 overflow-x-auto shadow-panel-dark font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-terranova-950/80 border-b border-terranova-800 text-[11px] text-gray-400 uppercase">
                <th className="p-3">Código Activo</th>
                <th className="p-3">Red / Tipo</th>
                <th className="p-3">Modelo / Marca</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Estatus</th>
                <th className="p-3">Condición</th>
                <th className="p-3">Costo Original</th>
                <th className="p-3">Gasto Mantenimiento</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terranova-800/60">
              {filteredAssets.map((asset) => (
                <tr 
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className="hover:bg-terranova-800/40 transition-colors cursor-pointer"
                >
                  <td className="p-3 font-bold text-white whitespace-nowrap">
                    {asset.assetCode}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-white block">{asset.assetType}</span>
                    <span className="text-[10px] text-terranova-400">{asset.networkType}</span>
                  </td>
                  <td className="p-3 text-gray-300">
                    {asset.modelOrBrand}
                  </td>
                  <td className="p-3 text-gray-300">
                    <span className="block">{asset.street}</span>
                    <span className="text-[10px] text-gray-400">{asset.neighborhood}</span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      asset.status === 'Operativo' ? 'bg-emerald-500/20 text-emerald-400' :
                      asset.status === 'En Mantenimiento' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      asset.condition === 'Excelente' ? 'text-emerald-400' :
                      asset.condition === 'Bueno' ? 'text-cyan-400' :
                      asset.condition === 'Regular' ? 'text-amber-400' :
                      'text-rose-400 font-bold'
                    }`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="p-3 text-white font-semibold whitespace-nowrap">
                    ${asset.costInstallation.toLocaleString()} MXN
                  </td>
                  <td className="p-3 text-amber-400 font-semibold whitespace-nowrap">
                    ${asset.accumulatedMaintenanceCost.toLocaleString()} MXN
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onFocusMap(asset.coordinates)}
                        className="p-1.5 rounded bg-terranova-800 hover:bg-terranova-700 text-terranova-300 transition-colors"
                        title="Enfocar en Mapa"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedAsset(asset)}
                        className="px-2 py-1 rounded bg-terranova-500/20 hover:bg-terranova-500/30 border border-terranova-500/30 text-terranova-300 text-[10px] font-bold transition-colors flex items-center gap-1"
                      >
                        <Activity className="w-3 h-3" />
                        <span>Ficha</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. MODAL: FICHA TÉCNICA Y BITÁCORA DE MANTENIMIENTO DEL ACTIVO */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-terranova-900 border border-terranova-600 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 bg-terranova-950 border-b border-terranova-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-terranova-900 border border-terranova-800">
                  {getNetworkIcon(selectedAsset.networkType)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    {selectedAsset.assetCode} • {selectedAsset.assetType}
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    Red: {selectedAsset.networkType} • Instalado el: {selectedAsset.installationDate}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="p-1.5 rounded-lg hover:bg-terranova-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Ficha Técnica */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-white">
              {/* Estatus y Ciclo de Vida */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-xl bg-terranova-950 border border-terranova-800">
                <div>
                  <span className="text-[9px] text-gray-400 block">ESTATUS OPERATIVO</span>
                  <span className="text-xs font-bold text-emerald-400">{selectedAsset.status}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block">CONDICIÓN FÍSICA</span>
                  <span className="text-xs font-bold text-terranova-400">{selectedAsset.condition}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block">VIDA REMANENTE</span>
                  <span className="text-xs font-bold text-white">{selectedAsset.remainingLifespanYears} / {selectedAsset.expectedLifespanYears} años</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block">PRÓXIMA INSPECCIÓN</span>
                  <span className="text-xs font-bold text-amber-400">{selectedAsset.nextMaintenanceDue || 'Programada'}</span>
                </div>
              </div>

              {/* Especificaciones Técnicas JSONB */}
              <div className="p-3.5 rounded-xl bg-terranova-950/70 border border-terranova-800">
                <span className="text-[10px] text-terranova-400 font-bold uppercase block mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Especificaciones Técnicas de Ingeniería
                </span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px]">
                  {Object.entries(selectedAsset.technicalSpecs).map(([key, val]) => (
                    <div key={key} className="p-2 rounded bg-terranova-900 border border-terranova-800">
                      <span className="text-gray-400 text-[9px] uppercase block truncate">{key}</span>
                      <span className="text-white font-semibold">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ubicación y Coordenadas */}
              <div className="p-3.5 rounded-xl bg-terranova-950/70 border border-terranova-800 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-gray-400 block">UBICACIÓN EN RED</span>
                  <span className="text-xs font-bold text-white">{selectedAsset.street}, {selectedAsset.neighborhood}</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Coordenadas: {selectedAsset.coordinates[1].toFixed(5)}°N, {selectedAsset.coordinates[0].toFixed(5)}°W
                  </span>
                </div>
                <button
                  onClick={() => {
                    onFocusMap(selectedAsset.coordinates);
                    setSelectedAsset(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-terranova-800 hover:bg-terranova-700 text-terranova-300 text-xs font-mono flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Ver en Mapa</span>
                </button>
              </div>

              {/* Bitácora de Mantenimiento Histórico */}
              <div className="p-3.5 rounded-xl bg-terranova-950/70 border border-terranova-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-terranova-400 font-bold uppercase flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Bitácora Histórica de Mantenimientos e Inspecciones
                  </span>
                  <button
                    onClick={() => setIsMaintenanceModalOpen(true)}
                    className="px-2.5 py-1 rounded bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-[10px] flex items-center gap-1"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Registrar Intervención</span>
                  </button>
                </div>

                {selectedAsset.maintenanceLogs && selectedAsset.maintenanceLogs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAsset.maintenanceLogs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-lg bg-terranova-900 border border-terranova-800 flex justify-between items-start text-[11px]">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">{log.workOrderFolio}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              log.maintenanceType === 'Preventivo' ? 'bg-cyan-500/20 text-cyan-400' :
                              log.maintenanceType === 'Correctivo' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-rose-500/20 text-rose-400'
                            }`}>
                              {log.maintenanceType}
                            </span>
                            <span className="text-gray-400 text-[10px]">
                              {new Date(log.performedAt).toLocaleDateString('es-MX')}
                            </span>
                          </div>
                          <p className="text-gray-300 text-[10px]">{log.notes}</p>
                          <span className="text-gray-500 text-[9px] block mt-0.5">Ejecutó: {log.performedBy}</span>
                        </div>
                        <span className="text-amber-400 font-bold whitespace-nowrap ml-2">
                          ${log.cost.toLocaleString()} MXN
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-500 text-center py-3">
                    No se han registrado intervenciones previas en este activo.
                  </p>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-terranova-950 border-t border-terranova-800 flex justify-end">
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 text-gray-300 font-mono transition-colors"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: REGISTRAR ORDEN DE MANTENIMIENTO */}
      {isMaintenanceModalOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-terranova-900 border border-terranova-600 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between p-4 bg-terranova-950 border-b border-terranova-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-terranova-400" />
                <h3 className="font-bold text-white text-sm">REGISTRAR INTERVENCIÓN DE MANTENIMIENTO</h3>
              </div>
              <button 
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-terranova-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMaintenance} className="p-5 space-y-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">FOLIO DE ORDEN DE TRABAJO:</label>
                <input
                  type="text"
                  required
                  value={maintForm.workOrderFolio}
                  onChange={(e) => setMaintForm({ ...maintForm, workOrderFolio: e.target.value })}
                  className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">TIPO DE INTERVENCIÓN:</label>
                  <select
                    value={maintForm.maintenanceType}
                    onChange={(e) => setMaintForm({ ...maintForm, maintenanceType: e.target.value as any })}
                    className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white"
                  >
                    <option value="Preventivo">Preventivo</option>
                    <option value="Correctivo">Correctivo</option>
                    <option value="Emergencia">Emergencia</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">COSTO TOTAL ($ MXN):</label>
                  <input
                    type="number"
                    required
                    value={maintForm.cost}
                    onChange={(e) => setMaintForm({ ...maintForm, cost: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">CUADRILLA / RESPONSABLE TÉCNICO:</label>
                <input
                  type="text"
                  required
                  value={maintForm.performedBy}
                  onChange={(e) => setMaintForm({ ...maintForm, performedBy: e.target.value })}
                  className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">CONDICIÓN RESULTANTE DEL ACTIVO:</label>
                <select
                  value={maintForm.newCondition}
                  onChange={(e) => setMaintForm({ ...maintForm, newCondition: e.target.value as any })}
                  className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white"
                >
                  <option value="Excelente">Excelente (Como Nuevo)</option>
                  <option value="Bueno">Bueno (Operación Normal)</option>
                  <option value="Regular">Regular (Requiere Monitoreo)</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">NOTAS TÉCNICAS Y REFACCIONES:</label>
                <textarea
                  required
                  rows={3}
                  value={maintForm.notes}
                  onChange={(e) => setMaintForm({ ...maintForm, notes: e.target.value })}
                  className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-terranova-800 text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold"
                >
                  Guardar en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: REGISTRAR NUEVO ACTIVO URBANO */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-terranova-900 border border-terranova-600 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between p-4 bg-terranova-950 border-b border-terranova-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-terranova-400" />
                <h3 className="font-bold text-white text-sm">ALTA DE ACTIVO DE INFRAESTRUCTURA URBANA</h3>
              </div>
              <button 
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-terranova-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="p-5 space-y-3 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">CÓDIGO ÚNICO DE ACTIVO:</label>
                  <input
                    type="text"
                    required
                    value={createForm.assetCode}
                    onChange={(e) => setCreateForm({ ...createForm, assetCode: e.target.value })}
                    className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">RED MUNICIPAL:</label>
                  <select
                    value={createForm.networkType}
                    onChange={(e) => setCreateForm({ ...createForm, networkType: e.target.value as any })}
                    className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white"
                  >
                    <option value="Agua Potable">Agua Potable</option>
                    <option value="Drenaje">Drenaje</option>
                    <option value="Alumbrado">Alumbrado</option>
                    <option value="Vialidad">Vialidad</option>
                    <option value="Telecom">Telecom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">TIPO DE ACTIVO (NOMBRE ESPECÍFICO):</label>
                <input
                  type="text"
                  required
                  value={createForm.assetType}
                  onChange={(e) => setCreateForm({ ...createForm, assetType: e.target.value })}
                  className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">MODELO O MARCA:</label>
                  <input
                    type="text"
                    required
                    value={createForm.modelOrBrand}
                    onChange={(e) => setCreateForm({ ...createForm, modelOrBrand: e.target.value })}
                    className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">COSTO INSTALACIÓN ($ MXN):</label>
                  <input
                    type="number"
                    required
                    value={createForm.costInstallation}
                    onChange={(e) => setCreateForm({ ...createForm, costInstallation: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">CALLE Y CRUCES:</label>
                  <input
                    type="text"
                    required
                    value={createForm.street}
                    onChange={(e) => setCreateForm({ ...createForm, street: e.target.value })}
                    className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">COLONIA / SECTOR:</label>
                  <input
                    type="text"
                    required
                    value={createForm.neighborhood}
                    onChange={(e) => setCreateForm({ ...createForm, neighborhood: e.target.value })}
                    className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-terranova-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-terranova-800 text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold"
                >
                  Guardar en Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
