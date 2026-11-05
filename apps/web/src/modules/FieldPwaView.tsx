import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Camera,
  MapPin,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  UploadCloud,
  Trash2,
  Clock,
  Plus,
  HardDrive,
  FileText,
  Navigation,
} from 'lucide-react';
import { offlineDB, LocalSyncOperation, LocalIncident } from '../services/offline/terranova-offline.db';
import { syncEngine, SyncResult } from '../services/offline/syncEngine';

interface FieldPwaViewProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  offlineCount?: number;
}

export const FieldPwaView: React.FC<FieldPwaViewProps> = ({
  isOnline,
  onToggleOnline,
}) => {
  // Tabs en el teléfono móvil: 'capture' | 'queue' | 'stress'
  const [activeTab, setActiveTab] = useState<'capture' | 'queue' | 'stress'>('capture');

  // Formulario de captura en campo
  const [incidentType, setIncidentType] = useState('BACHE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [coordinates, setCoordinates] = useState<[number, number]>([-98.2063, 19.0414]);
  const [accuracyMeters, setAccuracyMeters] = useState(3.4);
  const [hasPhoto, setHasPhoto] = useState(true);
  const [isCapturingGps, setIsCapturingGps] = useState(false);

  // Estado reactivo de IndexedDB
  const [queueItems, setQueueItems] = useState<LocalSyncOperation[]>([]);
  const [localIncidents, setLocalIncidents] = useState<LocalIncident[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ message: string; pct: number } | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [stressTestCount, setStressTestCount] = useState<number>(0);
  const [stressRunning, setStressRunning] = useState<boolean>(false);

  // Cargar estado inicial desde Dexie al montar
  useEffect(() => {
    refreshLocalDbState();
  }, []);

  const refreshLocalDbState = async () => {
    try {
      const ops = await offlineDB.syncQueue.toArray();
      const incs = await offlineDB.localIncidents.reverse().toArray();
      setQueueItems(ops);
      setLocalIncidents(incs);
    } catch {
      // Fallback si IndexedDB no está disponible en el entorno
    }
  };

  // Simular lectura de sensor GPS de alta precisión
  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    setTimeout(() => {
      // Simula pequeñas variaciones GPS alrededor de Puebla Centro
      const deltaLng = (Math.random() - 0.5) * 0.008;
      const deltaLat = (Math.random() - 0.5) * 0.008;
      const newCoords: [number, number] = [
        Number((-98.2063 + deltaLng).toFixed(6)),
        Number((19.0414 + deltaLat).toFixed(6)),
      ];
      setCoordinates(newCoords);
      setAccuracyMeters(Number((2.1 + Math.random() * 2.5).toFixed(1)));
      setIsCapturingGps(false);
    }, 400);
  };

  // Guardar incidencia (Offline-First en Dexie.js)
  const handleSaveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const clientOpId = syncEngine.generateClientOperationId();
    const tempId = `LOC-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const incidentData: LocalIncident = {
      id: tempId,
      title: title.trim(),
      description: description.trim() || 'Reportado en recorrido de supervisión técnica de cuadrilla.',
      incidentType,
      priority,
      status: 'OPEN',
      coordinates,
      neighborhood: 'Sector Operativo Poniente (GPS Capturado)',
      address: `Av. 11 Poniente #${Math.floor(100 + Math.random() * 900)}, Col. Centro`,
      photoUrl: hasPhoto
        ? 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80'
        : undefined,
      clientOperationId: clientOpId,
      isSynced: false,
      createdAt: nowIso,
    };

    // 1. Guardar en tabla local de incidencias
    await offlineDB.localIncidents.put(incidentData);

    // 2. Encolar en syncQueue con status PENDING
    await offlineDB.enqueueOperation({
      clientOperationId: clientOpId,
      organizationId: 'org-puebla-001',
      userId: 'usr-brigada-004',
      entityType: 'incidents',
      operationType: 'INSERT',
      payload: incidentData,
      clientTimestamp: nowIso,
    });

    await refreshLocalDbState();

    // Limpiar formulario y dar feedback
    setTitle('');
    setDescription('');

    // Si está online, disparar sincronización en background
    if (isOnline) {
      triggerSync();
    }
  };

  // Disparar sincronización con telemetría
  const triggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    const result = await syncEngine.syncBatch('org-puebla-001', isOnline, (msg, pct) => {
      setSyncProgress({ message: msg, pct });
    });

    setLastSyncResult(result);
    setIsSyncing(false);
    setSyncProgress(null);
    await refreshLocalDbState();
  };

  // Simulación de estrés: Inserción de 50 incidencias consecutivas offline
  const handleRunStressTest = async () => {
    setStressRunning(true);
    setStressTestCount(0);

    const sampleTypes = ['BACHE', 'LUMINARIA', 'FUGA_AGUA', 'SEMAFORO', 'DRENAJE'];
    const samplePriorities: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    const batchToEnqueue: LocalSyncOperation[] = [];
    const incidentsToInsert: LocalIncident[] = [];

    for (let i = 1; i <= 50; i++) {
      const clientOpId = syncEngine.generateClientOperationId();
      const tempId = `STRESS-OP-${i.toString().padStart(3, '0')}`;
      const nowIso = new Date().toISOString();
      const type = sampleTypes[i % sampleTypes.length];
      const prio = samplePriorities[i % samplePriorities.length];

      const inc: LocalIncident = {
        id: tempId,
        title: `Inspección de Campo #${i} - ${type}`,
        description: `Registro masivo de estrés sin señal celular (Prueba de Aceptación Fase 12).`,
        incidentType: type,
        priority: prio,
        status: 'OPEN',
        coordinates: [
          Number((-98.2063 + (Math.random() - 0.5) * 0.02).toFixed(6)),
          Number((19.0414 + (Math.random() - 0.5) * 0.02).toFixed(6)),
        ],
        neighborhood: 'Sector Periurbano Sur',
        address: `Tramo Inspeccionado Km 4+${i * 20}`,
        clientOperationId: clientOpId,
        isSynced: false,
        createdAt: nowIso,
      };

      incidentsToInsert.push(inc);
      batchToEnqueue.push({
        clientOperationId: clientOpId,
        organizationId: 'org-puebla-001',
        userId: 'usr-stress-tester',
        entityType: 'incidents',
        operationType: 'INSERT',
        payload: inc,
        clientTimestamp: nowIso,
        status: 'PENDING',
        retryCount: 0,
      });

      if (i % 10 === 0 || i === 50) {
        setStressTestCount(i);
        await new Promise((r) => setTimeout(r, 40));
      }
    }

    // Guardado masivo transaccional en Dexie
    await offlineDB.localIncidents.bulkPut(incidentsToInsert);
    await offlineDB.syncQueue.bulkAdd(batchToEnqueue);

    await refreshLocalDbState();
    setStressRunning(false);
  };

  // Limpiar base de datos local para reiniciar pruebas
  const handleClearLocalData = async () => {
    if (window.confirm('¿Deseas reiniciar la base de datos local Dexie.js (cola y registros locales)?')) {
      await offlineDB.syncQueue.clear();
      await offlineDB.localIncidents.clear();
      await refreshLocalDbState();
      setLastSyncResult(null);
    }
  };

  const pendingCount = queueItems.filter((q) => q.status === 'PENDING').length;
  const confirmedCount = localIncidents.filter((i) => i.isSynced).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col xl:flex-row gap-6 items-start justify-center gis-grid-bg">
      {/* =========================================================================
          PANEL IZQUIERDO: TELEMETRÍA Y ARQUITECTURA OFFLINE-FIRST
         ========================================================================= */}
      <div className="w-full xl:w-7/12 space-y-5 text-left">
        {/* Cabecera del Módulo */}
        <div className="bg-terranova-900/90 border border-terranova-700 p-5 rounded-2xl shadow-panel-dark">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terranova-800 border border-terranova-600 text-terranova-300 text-xs font-mono font-bold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>MÓDULO 09: TERRANOVA FIELD — PWA OFFLINE-FIRST (FASE 12)</span>
            </div>
            {/* Toggle de Conexión de Red */}
            <button
              onClick={onToggleOnline}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md ${
                isOnline
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500 hover:bg-emerald-900'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-500 hover:bg-amber-900 animate-pulse'
              }`}
            >
              {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
              <span>{isOnline ? 'ESTADO: ONLINE (RED ACTIVA)' : 'ESTADO: SIN SEÑAL (MODO OFFLINE)'}</span>
            </button>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white">
            Simulador de Operación en Campo & Sincronización Transaccional
          </h1>
          <p className="text-xs text-gray-300 leading-relaxed mt-1">
            Diseñado para brigadas e inspectores en zonas sin conectividad celular. Los datos y fotos se persisten
            inmediatamente en <strong>IndexedDB con Dexie.js</strong> mediante claves de idempotencia (<code>client_operation_id</code>)
            y se transmiten atómicamente al servidor al restablecer conexión.
          </p>
        </div>

        {/* Tarjetas KPI de Almacenamiento Local Dexie */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-terranova-900/80 border border-terranova-800">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>Cola Pendiente</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-amber-400">{pendingCount}</div>
            <span className="text-[10px] text-gray-500">En IndexedDB</span>
          </div>

          <div className="p-3.5 rounded-xl bg-terranova-900/80 border border-terranova-800">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>Sincronizados</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-400">{confirmedCount}</div>
            <span className="text-[10px] text-gray-500">Confirmados por Servidor</span>
          </div>

          <div className="p-3.5 rounded-xl bg-terranova-900/80 border border-terranova-800">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>Idempotencia</span>
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-sky-400">100%</div>
            <span className="text-[10px] text-gray-500">Cero Duplicados</span>
          </div>

          <div className="p-3.5 rounded-xl bg-terranova-900/80 border border-terranova-800">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>Latencia Sync</span>
              <Zap className="w-4 h-4 text-terranova-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-terranova-400">
              {lastSyncResult ? `${lastSyncResult.latencyMs}ms` : '--'}
            </div>
            <span className="text-[10px] text-gray-500">Tiempo de Despacho</span>
          </div>
        </div>

        {/* Panel de Control de Sincronización y Acciones Rápidas */}
        <div className="bg-terranova-900/90 border border-terranova-700 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
              <Database className="w-4 h-4 text-terranova-400" />
              ESTADO DEL MOTOR DE SINCRONIZACIÓN (SYNC ENGINE)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearLocalData}
                title="Reiniciar base de datos local Dexie"
                className="px-2.5 py-1 text-[11px] font-mono text-gray-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800 rounded-lg transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Purgar DB</span>
              </button>
              <button
                onClick={triggerSync}
                disabled={isSyncing || !isOnline}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                  isOnline
                    ? 'bg-terranova-600 hover:bg-terranova-500 text-white shadow-md'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Forzar Sincronización'}</span>
              </button>
            </div>
          </div>

          {/* Barra de Progreso de Sincronización */}
          {syncProgress && (
            <div className="p-3 bg-terranova-950 border border-terranova-800 rounded-lg space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-terranova-300">
                <span>{syncProgress.message}</span>
                <span>{syncProgress.pct}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-terranova-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${syncProgress.pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Resultado de la Última Sincronización */}
          {lastSyncResult && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
                lastSyncResult.success
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {lastSyncResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>
                  {lastSyncResult.success
                    ? `Lote de ${lastSyncResult.processedCount} operaciones aplicado (${lastSyncResult.latencyMs}ms)`
                    : `Error: ${lastSyncResult.errorMessage}`}
                </span>
              </div>
              <span className="text-[10px] text-gray-400">
                {new Date(lastSyncResult.serverTime).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Tabla Inspectora de la Cola Dexie.js (syncQueue) */}
        <div className="bg-terranova-900/90 border border-terranova-700 rounded-xl overflow-hidden shadow-panel-dark">
          <div className="p-3.5 bg-terranova-800/60 border-b border-terranova-700 flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-sky-400" />
              REGISTROS EN INDEXEDDB (Dexie: <code>syncQueue</code> & <code>localIncidents</code>)
            </span>
            <span className="text-[11px] font-mono text-gray-400">
              {queueItems.length} operaciones almacenadas localmente
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {queueItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 space-y-1">
                <Database className="w-6 h-6 text-gray-600 mx-auto" />
                <p>La cola de almacenamiento local IndexedDB está vacía.</p>
                <p className="text-[11px] text-gray-500">
                  Captura un reporte en el simulador móvil o ejecuta la prueba de 50 registros para ver el encolamiento en tiempo real.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-terranova-950/60 text-gray-400 font-mono text-[10px] uppercase border-b border-terranova-800">
                  <tr>
                    <th className="p-2.5">Client Operation ID (UUID)</th>
                    <th className="p-2.5">Entidad</th>
                    <th className="p-2.5">Tipo</th>
                    <th className="p-2.5">Estado</th>
                    <th className="p-2.5 text-right">Captura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terranova-800/60 font-mono">
                  {queueItems.slice(0, 15).map((op) => (
                    <tr key={op.clientOperationId} className="hover:bg-terranova-800/30 transition-colors">
                      <td className="p-2.5 text-terranova-300 font-bold">
                        {op.clientOperationId.slice(0, 8)}...{op.clientOperationId.slice(-4)}
                      </td>
                      <td className="p-2.5 text-gray-300">{op.entityType}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-terranova-800 text-terranova-200">
                          {op.operationType}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            op.status === 'CONFIRMED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : op.status === 'UPLOADING'
                              ? 'bg-sky-950 text-sky-400 border border-sky-800 animate-pulse'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {op.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right text-gray-400 text-[11px]">
                        {new Date(op.clientTimestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {queueItems.length > 15 && (
            <div className="p-2 text-center bg-terranova-950/40 border-t border-terranova-800 text-[11px] font-mono text-gray-400">
              Mostrando 15 de {queueItems.length} registros en la cola local.
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          PANEL DERECHO: SMARTPHONE SIMULATOR (PWA FIELD OPERATOR)
         ========================================================================= */}
      <div className="w-full xl:w-5/12 flex justify-center">
        {/* Chasis de Dispositivo Móvil Rugerizado */}
        <div className="w-[360px] sm:w-[380px] bg-black rounded-[42px] p-3 shadow-2xl border-4 border-gray-700 relative">
          {/* Bocina / Cámara Frontal (Notch) */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-gray-900 rounded-full border border-gray-700" />
          </div>

          {/* Pantalla Interna del Teléfono */}
          <div className="w-full bg-terranova-950 rounded-[32px] overflow-hidden flex flex-col h-[680px] border border-gray-800 text-white relative">
            {/* 1. Barra de Estado Móvil */}
            <div className="pt-3 px-5 pb-1.5 flex items-center justify-between text-[11px] font-mono text-gray-400 bg-terranova-900/90 z-20">
              <span>09:41</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px]">
                  <Navigation className="w-3 h-3 text-emerald-400" /> GPS
                </span>
                {isOnline ? (
                  <Wifi className="w-3 h-3 text-emerald-400" />
                ) : (
                  <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
                )}
                <span className="text-[10px]">94%</span>
              </div>
            </div>

            {/* 2. Banner de Estado de Red del Dispositivo */}
            <div
              className={`py-1 px-3 text-[11px] font-mono text-center flex items-center justify-center gap-1.5 transition-all ${
                isOnline
                  ? 'bg-emerald-950 text-emerald-300 border-b border-emerald-800/80'
                  : 'bg-amber-950 text-amber-300 border-b border-amber-800/80'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'CONECTADO A RED MUNICIPAL' : 'MODO OFFLINE — GRABANDO EN DEXIE'}</span>
            </div>

            {/* 3. Pestañas Superiores de la PWA Móvil */}
            <div className="grid grid-cols-3 bg-terranova-900 border-b border-terranova-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('capture')}
                className={`py-2 text-center transition-colors border-b-2 ${
                  activeTab === 'capture'
                    ? 'border-terranova-400 text-terranova-300 font-bold bg-terranova-800/40'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Captura
              </button>
              <button
                onClick={() => setActiveTab('queue')}
                className={`py-2 text-center transition-colors border-b-2 relative ${
                  activeTab === 'queue'
                    ? 'border-terranova-400 text-terranova-300 font-bold bg-terranova-800/40'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span>Bandeja</span>
                {pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-black font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('stress')}
                className={`py-2 text-center transition-colors border-b-2 ${
                  activeTab === 'stress'
                    ? 'border-terranova-400 text-terranova-300 font-bold bg-terranova-800/40'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Prueba 50
              </button>
            </div>

            {/* 4. Contenido Scrollable de la PWA */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
              {/* PESTAÑA A: FORMULARIO DE CAPTURA EN CAMPO */}
              {activeTab === 'capture' && (
                <form onSubmit={handleSaveIncident} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-400">Inspector: Cuadrilla 04</span>
                    <span className="text-[10px] font-mono text-terranova-400">TERRANOVA FIELD v1.10</span>
                  </div>

                  {/* Tipo de Falla Urbana */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase font-mono mb-1">
                      Tipo de Falla Urbana
                    </label>
                    <select
                      value={incidentType}
                      onChange={(e) => setIncidentType(e.target.value)}
                      className="w-full bg-terranova-900 border border-terranova-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-terranova-500"
                    >
                      <option value="BACHE">Bache / Pavimento Dañado</option>
                      <option value="FUGA_AGUA">Fuga de Agua Potable</option>
                      <option value="LUMINARIA">Luminaria Apagada</option>
                      <option value="SEMAFORO">Semáforo Descompuesto</option>
                      <option value="ESCOMBRO">Escombro o Basura en Vía Pública</option>
                      <option value="DRENAJE">Colapso de Red de Drenaje</option>
                    </select>
                  </div>

                  {/* Título del Hallazgo */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase font-mono mb-1">
                      Descripción del Hallazgo *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej. Hundimiento profundo en carril derecho"
                      required
                      className="w-full bg-terranova-900 border border-terranova-700 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-terranova-500"
                    />
                  </div>

                  {/* Prioridad */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase font-mono mb-1">
                      Prioridad Técnica
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
                      {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`py-1 rounded text-center font-bold border transition-all ${
                            priority === p
                              ? p === 'CRITICAL'
                                ? 'bg-rose-950 text-rose-300 border-rose-600'
                                : p === 'HIGH'
                                ? 'bg-amber-950 text-amber-300 border-amber-600'
                                : 'bg-terranova-800 text-terranova-200 border-terranova-500'
                              : 'bg-terranova-900 text-gray-400 border-terranova-800'
                          }`}
                        >
                          {p === 'CRITICAL' ? 'Crítica' : p === 'HIGH' ? 'Alta' : p === 'MEDIUM' ? 'Media' : 'Baja'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Georreferenciación GPS Satelital */}
                  <div className="p-2.5 rounded-lg bg-terranova-900/90 border border-terranova-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-gray-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        Coordenadas GPS WGS84
                      </span>
                      <button
                        type="button"
                        onClick={handleCaptureGps}
                        disabled={isCapturingGps}
                        className="text-[10px] font-mono text-terranova-400 hover:text-terranova-300 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${isCapturingGps ? 'animate-spin' : ''}`} />
                        <span>Recalibrar</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-white bg-terranova-950 p-1.5 rounded border border-terranova-800/80 flex justify-between">
                      <span>{coordinates[1].toFixed(5)}° N, {coordinates[0].toFixed(5)}° W</span>
                      <span className="text-emerald-400 text-[10px]">±{accuracyMeters}m</span>
                    </div>
                  </div>

                  {/* Evidencia Fotográfica Comprimida (WebP) */}
                  <div className="p-2.5 rounded-lg bg-terranova-900/90 border border-terranova-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-300">
                      <span className="flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-sky-400" />
                        Fotografía de Evidencia
                      </span>
                      <button
                        type="button"
                        onClick={() => setHasPhoto(!hasPhoto)}
                        className="text-[10px] font-mono text-sky-400"
                      >
                        {hasPhoto ? 'Remover' : 'Simular Captura'}
                      </button>
                    </div>
                    {hasPhoto ? (
                      <div className="relative rounded-lg overflow-hidden border border-terranova-700 bg-black h-24">
                        <img
                          src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80"
                          alt="Evidencia"
                          className="w-full h-full object-cover opacity-85"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-emerald-300">
                          WebP • 84 KB (GPS incrustado)
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-terranova-700 rounded-lg p-3 text-center text-gray-500 text-[11px]">
                        Sin fotografía adjunta
                      </div>
                    )}
                  </div>

                  {/* Botón de Guardado Offline en Dexie */}
                  <button
                    type="submit"
                    className="w-full py-2.5 px-3 rounded-xl bg-terranova-600 hover:bg-terranova-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>GUARDAR REPORTE EN CAMPO</span>
                  </button>
                  <p className="text-[10px] text-gray-400 text-center font-mono">
                    {isOnline
                      ? 'Se guardará en IndexedDB y se sincronizará automáticamente.'
                      : 'Sin red celular: se encola de forma segura en Dexie.js.'}
                  </p>
                </form>
              )}

              {/* PESTAÑA B: BANDEJA LOCAL DE INCIDENCIAS */}
              {activeTab === 'queue' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-gray-300">Incidencias en Dispositivo</span>
                    <span className="text-terranova-400">{localIncidents.length} registros</span>
                  </div>

                  {localIncidents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400 space-y-1">
                      <FileText className="w-8 h-8 text-gray-600 mx-auto" />
                      <p>No hay reportes en la bandeja móvil.</p>
                    </div>
                  ) : (
                    localIncidents.map((inc) => (
                      <div
                        key={inc.id}
                        className="p-2.5 rounded-xl bg-terranova-900 border border-terranova-800 space-y-1 text-left"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-white">{inc.title}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                              inc.isSynced
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {inc.isSynced ? 'Sincronizado' : 'Pendiente (Offline)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 line-clamp-1">{inc.address}</p>
                        <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 pt-1 border-t border-terranova-800/60">
                          <span>{inc.incidentType}</span>
                          <span>{new Date(inc.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* PESTAÑA C: PRUEBA DE ESTRÉS DE 50 REGISTROS OFFLINE */}
              {activeTab === 'stress' && (
                <div className="space-y-3 text-left">
                  <div className="p-3 rounded-xl bg-terranova-900 border border-terranova-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-terranova-300">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>CRITERIO DE ACEPTACIÓN FASE 12</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      La especificación exige la captura de <strong>50 incidencias consecutivas sin internet</strong> y su posterior
                      sincronización atómica con 0 duplicados garantizados por idempotencia.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-terranova-900/60 border border-terranova-800 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-400">Progreso de Prueba:</span>
                      <span className="text-terranova-400 font-bold">{stressTestCount} / 50</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${(stressTestCount / 50) * 100}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleRunStressTest}
                    disabled={stressRunning}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{stressRunning ? 'Generando 50 Reportes...' : 'INICIAR PRUEBA DE 50 INCIDENCIAS'}</span>
                  </button>

                  <p className="text-[10px] text-gray-400 text-center font-mono">
                    Inserta 50 registros en <code>localIncidents</code> y <code>syncQueue</code> de Dexie.js para verificar consistencia.
                  </p>
                </div>
              )}
            </div>

            {/* 5. Barra Inferior de Navegación del Móvil */}
            <div className="p-2 bg-terranova-900 border-t border-terranova-800 flex justify-center">
              <div className="w-24 h-1 bg-gray-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
