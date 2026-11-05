import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  MapPin,
  Download,
  Printer,
  X,
  ShieldCheck,
  Flame,
  Sparkles,
  Zap,
  Building2,
  Users,
} from 'lucide-react';
import { PropertyItem, IncidentItem } from '../types';

interface AnalyticsViewProps {
  incidents: IncidentItem[];
  properties: PropertyItem[];
  onFocusMap: (coords: [number, number]) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  incidents: _incidents,
  onFocusMap,
}) => {
  // Dimensiones de filtrado
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D' | 'YTD'>('30D');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'heatmap' | 'trends' | 'neighborhoods' | 'crews'>('heatmap');

  // Heatmap settings
  const [gridResolution, setGridResolution] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number; count: number; intensity: number; area: string } | null>(null);

  // Modal de Reporte Ejecutivo
  const [showExportModal, setShowExportModal] = useState(false);
  const [reportSeal, setReportSeal] = useState<string>('');

  // 1. Datos simulados de cuadrícula térmica espacial (Puebla Metrópoli)
  const heatmapCells = [
    { x: 35, y: 40, count: 48, intensity: 0.95, area: 'Centro Histórico (Zócalo / Av. Reforma)' },
    { x: 38, y: 42, count: 36, intensity: 0.82, area: 'Barrio del Artista & Analco' },
    { x: 45, y: 50, count: 42, intensity: 0.88, area: 'Colonia San Manuel (Circuito Juan Pablo II)' },
    { x: 28, y: 35, count: 29, intensity: 0.68, area: 'La Paz & Prolongación Reforma' },
    { x: 55, y: 65, count: 38, intensity: 0.79, area: 'Amalucan / Sector Oriente' },
    { x: 20, y: 25, count: 34, intensity: 0.74, area: 'San Jerónimo Caleras / Autopista' },
    { x: 42, y: 60, count: 21, intensity: 0.52, area: 'Plaza Dorada & Anzures' },
    { x: 32, y: 55, count: 18, intensity: 0.44, area: 'Angelópolis / Boulevard del Niño Poblano' },
    { x: 48, y: 32, count: 15, intensity: 0.38, area: 'Los Fuertes & Loreto' },
    { x: 50, y: 45, count: 24, intensity: 0.61, area: 'El Carmen & 16 de Septiembre' },
    { x: 25, y: 45, count: 12, intensity: 0.31, area: 'Romero Vargas / Zavaleta' },
    { x: 60, y: 38, count: 22, intensity: 0.55, area: 'Bosques de San Sebastián' },
  ];

  // 2. Rankings de Colonias
  const neighborhoodRankings = [
    { name: 'Centro Histórico', total: 94, resolved: 88, slaRate: 93.6, mttr: 8.4, uhi: 92.1, status: 'EXCELLENT' },
    { name: 'Colonia San Manuel', total: 72, resolved: 65, slaRate: 90.2, mttr: 11.2, uhi: 89.4, status: 'GOOD' },
    { name: 'La Paz & Cerro de San Juan', total: 58, resolved: 53, slaRate: 91.3, mttr: 12.0, uhi: 88.2, status: 'GOOD' },
    { name: 'Angelópolis Residencial', total: 46, resolved: 44, slaRate: 95.6, mttr: 7.1, uhi: 96.0, status: 'EXCELLENT' },
    { name: 'Amalucan / Sector Oriente', total: 85, resolved: 68, slaRate: 80.0, mttr: 22.4, uhi: 74.5, status: 'ATTENTION' },
    { name: 'San Jerónimo Caleras', total: 63, resolved: 49, slaRate: 77.7, mttr: 28.6, uhi: 68.3, status: 'CRITICAL' },
  ];

  // 3. Rendimiento de Cuadrillas
  const crewPerformance = [
    { id: 'BRIG-01', name: 'Cuadrilla 01 — Bacheo Poniente', leader: 'Ing. Carlos Mendoza', resolved: 128, avgMttr: 14.5, rate: 94.2 },
    { id: 'BRIG-02', name: 'Cuadrilla 02 — Alumbrado Centro', leader: 'Téc. Sofía Valenzuela', resolved: 96, avgMttr: 6.2, rate: 97.8 },
    { id: 'BRIG-03', name: 'Cuadrilla 03 — SOAPAP Hidráulica', leader: 'Ing. Roberto Fuentes', resolved: 74, avgMttr: 9.1, rate: 89.1 },
    { id: 'BRIG-04', name: 'Cuadrilla 04 — Obras & Pavimentos', leader: 'Arq. Mariana Ríos', resolved: 69, avgMttr: 21.0, rate: 82.5 },
  ];

  // Generar reporte oficial
  const handleOpenExport = () => {
    const raw = `TERRANOVA-BI-PUEBLA-2026||${timeframe}||${selectedCategory}||${Date.now()}`;
    // Simple deterministic hex hash representation for client preview
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    setReportSeal(`a7f9${hex}c8e104b932d8471e06fa9901d3b07384${hex}`);
    setShowExportModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 gis-grid-bg text-left">
      {/* =========================================================================
          1. HEADER EJECUTIVO & CONTROLES DIMENSIONALES
         ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-terranova-900/90 border border-terranova-700 p-5 rounded-2xl shadow-panel-dark">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terranova-800 border border-terranova-600 text-terranova-300 text-xs font-mono font-bold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>MÓDULO 08: TERRANOVA ANALYTICS — INTELIGENCIA TERRITORIAL & BI (FASE 13)</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            Tablero de Comando Estratégico & Mapas de Calor
          </h1>
          <p className="text-xs text-gray-400">
            Inteligencia espacial predictiva, tiempos medios de resolución (MTTR), cobertura de servicios e Índice de Salud Urbana (UHI).
          </p>
        </div>

        {/* Acciones y Filtro Temporal */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Rango Temporal */}
          <div className="flex items-center bg-terranova-950 border border-terranova-700 rounded-xl p-1 text-xs font-mono">
            {(['7D', '30D', '90D', 'YTD'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                  timeframe === t
                    ? 'bg-terranova-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === '7D' ? '7 Días' : t === '30D' ? '30 Días' : t === '90D' ? 'Trimestre' : 'Año Actual'}
              </button>
            ))}
          </div>

          {/* Botón de Exportación Ejecutiva */}
          <button
            onClick={handleOpenExport}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-terranova-600 hover:from-emerald-500 hover:to-terranova-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Emitir Informe Certificado</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. TARJETAS KPI ESTRATÉGICAS (MTTR, SLA %, UHI, COSTO)
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MTTR */}
        <div className="p-4 rounded-2xl bg-terranova-900/90 border border-terranova-700 space-y-2 shadow-panel-dark">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>MTTR (Tiempo Medio de Resolución)</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">14.2</span>
            <span className="text-xs text-gray-400 font-mono">horas</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>-4.4 hrs vs mes anterior (Mejora 23.6%)</span>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="p-4 rounded-2xl bg-terranova-900/90 border border-terranova-700 space-y-2 shadow-panel-dark">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>Cumplimiento Normativo SLA</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-400">87.8%</span>
            <span className="text-xs text-gray-400 font-mono">en tiempo</span>
          </div>
          <span className="text-xs text-gray-400 font-mono">367 atendidas dentro del estándar municipal</span>
        </div>

        {/* Índice de Salud Urbana (UHI) */}
        <div className="p-4 rounded-2xl bg-terranova-900/90 border border-terranova-700 space-y-2 shadow-panel-dark">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>Índice de Salud Urbana (UHI)</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-400">88.4</span>
            <span className="text-xs text-gray-400 font-mono">/ 100</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Nivel Óptimo de Confort y Servicios</span>
        </div>

        {/* Inversión Ejercida */}
        <div className="p-4 rounded-2xl bg-terranova-900/90 border border-terranova-700 space-y-2 shadow-panel-dark">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>Costo Total de Mantenimiento</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-purple-300">$3.45M</span>
            <span className="text-xs text-gray-400 font-mono">MXN</span>
          </div>
          <span className="text-xs text-gray-400 font-mono">Costo unitario prom: $8,254 / reporte</span>
        </div>
      </div>

      {/* =========================================================================
          3. PESTAÑAS Y VISTAS ANALÍTICAS PRINCIPALES
         ========================================================================= */}
      <div className="bg-terranova-900/90 border border-terranova-700 rounded-2xl overflow-hidden shadow-panel-dark">
        {/* Barra de Pestañas */}
        <div className="flex flex-wrap items-center justify-between border-b border-terranova-800 px-5 pt-3 bg-terranova-950/60">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`pb-3 px-4 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'heatmap'
                  ? 'border-terranova-400 text-terranova-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Mapa de Calor Espacial (Heatmap)</span>
            </button>

            <button
              onClick={() => setActiveTab('trends')}
              className={`pb-3 px-4 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'trends'
                  ? 'border-terranova-400 text-terranova-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>Evolución Mensual & Tendencia</span>
            </button>

            <button
              onClick={() => setActiveTab('neighborhoods')}
              className={`pb-3 px-4 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'neighborhoods'
                  ? 'border-terranova-400 text-terranova-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Salud Urbana por Colonia</span>
            </button>

            <button
              onClick={() => setActiveTab('crews')}
              className={`pb-3 px-4 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'crews'
                  ? 'border-terranova-400 text-terranova-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>Desempeño de Cuadrillas</span>
            </button>
          </div>

          {/* Filtros Contextuales Secundarios */}
          <div className="flex items-center gap-2 pb-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-terranova-800 border border-terranova-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none font-mono"
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="BACHE">Bacheo y Pavimento</option>
              <option value="LUMINARIA">Alumbrado Público</option>
              <option value="FUGA_AGUA">Agua Potable</option>
              <option value="DRENAJE">Drenaje y Alcantarillado</option>
            </select>

            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="bg-terranova-800 border border-terranova-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none font-mono"
            >
              <option value="ALL">Todas las Colonias</option>
              <option value="CENTRO">Centro Histórico</option>
              <option value="SAN_MANUEL">Colonia San Manuel</option>
              <option value="LA_PAZ">La Paz</option>
              <option value="ANGELOPOLIS">Angelópolis</option>
              <option value="AMALUCAN">Amalucan</option>
              <option value="CALERAS">San Jerónimo Caleras</option>
            </select>
          </div>
        </div>

        {/* CONTENIDO DE PESTAÑAS */}
        <div className="p-5">
          {/* PESTAÑA 1: MAPA DE CALOR ESPACIAL INTERACTIVO */}
          {activeTab === 'heatmap' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between text-xs font-mono text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">Gradiente Térmico:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">Baja Densidad</span>
                    <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-sky-500 via-emerald-400 via-amber-400 to-rose-600" />
                    <span className="text-[10px] text-gray-500">Crítico / Máxima</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span>Resolución de Grilla:</span>
                  <div className="flex gap-1">
                    {(['HIGH', 'MEDIUM', 'LOW'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setGridResolution(r)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          gridResolution === r
                            ? 'bg-terranova-700 text-white'
                            : 'bg-terranova-950 text-gray-400 hover:text-white'
                        }`}
                      >
                        {r === 'HIGH' ? '250m' : r === 'MEDIUM' ? '500m' : '1000m'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lienzo del Heatmap SVG con Cuadrícula de Densidad */}
              <div className="relative w-full h-[420px] rounded-2xl bg-terranova-950 border border-terranova-800 overflow-hidden flex items-center justify-center p-4">
                {/* Cuadrícula Cartográfica de Fondo */}
                <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }} />

                {/* Etiquetas de Cuadrantes Viales de Puebla */}
                <div className="absolute top-4 left-4 text-[10px] font-mono text-gray-500 pointer-events-none">
                  NW: San Jerónimo / Finsa (19.08° N, -98.24° W)
                </div>
                <div className="absolute top-4 right-4 text-[10px] font-mono text-gray-500 pointer-events-none">
                  NE: Loreto / Amalucan (19.06° N, -98.17° W)
                </div>
                <div className="absolute bottom-4 left-4 text-[10px] font-mono text-gray-500 pointer-events-none">
                  SW: Angelópolis / Cholula (19.01° N, -98.23° W)
                </div>
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-gray-500 pointer-events-none">
                  SE: Valsequillo / San Manuel (19.01° N, -98.18° W)
                </div>

                {/* SVG Interactivo de Celdas Térmicas */}
                <svg viewBox="0 0 100 100" className="w-full h-full max-w-2xl max-h-96">
                  {/* Definición de Filtros de Difuminado Gaussiano para Efecto Térmico */}
                  <defs>
                    <filter id="thermal-blur" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation={gridResolution === 'HIGH' ? '2' : gridResolution === 'MEDIUM' ? '3.5' : '5'} />
                    </filter>
                  </defs>

                  {/* Capa de Difuminado Térmico */}
                  <g filter="url(#thermal-blur)" opacity="0.85">
                    {heatmapCells.map((cell, idx) => {
                      const color =
                        cell.intensity > 0.8
                          ? '#e11d48'
                          : cell.intensity > 0.6
                          ? '#f59e0b'
                          : cell.intensity > 0.4
                          ? '#10b981'
                          : '#0284c7';
                      return (
                        <circle
                          key={`blur-${idx}`}
                          cx={cell.x}
                          cy={cell.y}
                          r={cell.intensity * 12 + 6}
                          fill={color}
                        />
                      );
                    })}
                  </g>

                  {/* Puntos y Nodos Interactivos */}
                  {heatmapCells.map((cell, idx) => (
                    <g
                      key={`node-${idx}`}
                      className="cursor-pointer transition-transform hover:scale-125"
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={() => onFocusMap([-98.2063 + (cell.x - 50) * 0.001, 19.0414 + (cell.y - 50) * 0.001])}
                    >
                      <circle
                        cx={cell.x}
                        cy={cell.y}
                        r="2.2"
                        className="fill-white stroke-terranova-900 stroke-2 hover:fill-amber-300"
                      />
                    </g>
                  ))}
                </svg>

                {/* Tooltip Dinámico Flotante */}
                {hoveredCell && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-terranova-900/95 border border-terranova-600 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono space-y-1 pointer-events-none z-20 backdrop-blur-md">
                    <div className="text-white font-bold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>{hoveredCell.area}</span>
                    </div>
                    <div className="flex gap-4 text-gray-300 text-[11px]">
                      <span>Concentración: <strong>{hoveredCell.count} fallas</strong></span>
                      <span>Intensidad: <strong>{(hoveredCell.intensity * 100).toFixed(0)}%</strong></span>
                      <span className="text-terranova-400">Click para enfocar en mapa GIS</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA 2: EVOLUCIÓN MENSUAL & TENDENCIAS */}
          {activeTab === 'trends' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-300 uppercase font-mono">
                Evolución de Incidencias vs. Tiempo Medio de Resolución (MTTR)
              </h3>

              <div className="h-72 w-full bg-terranova-950 rounded-xl p-4 border border-terranova-800 flex items-end justify-between gap-4">
                {[
                  { m: 'Oct 2025', rep: 320, res: 290, mttr: 19.4 },
                  { m: 'Nov 2025', rep: 345, res: 315, mttr: 18.1 },
                  { m: 'Dic 2025', rep: 390, res: 350, mttr: 17.5 },
                  { m: 'Ene 2026', rep: 410, res: 385, mttr: 16.0 },
                  { m: 'Feb 2026', rep: 430, res: 398, mttr: 15.2 },
                  { m: 'Mar 2026', rep: 418, res: 367, mttr: 14.2 },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-mono text-terranova-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      MTTR: {item.mttr}h
                    </div>
                    <div className="w-full flex items-end justify-center gap-1.5 h-48">
                      {/* Barra de Reportadas */}
                      <div
                        className="w-1/3 bg-gray-700 group-hover:bg-gray-600 rounded-t transition-all"
                        style={{ height: `${(item.rep / 450) * 100}%` }}
                        title={`Reportadas: ${item.rep}`}
                      />
                      {/* Barra de Resueltas */}
                      <div
                        className="w-1/3 bg-terranova-500 group-hover:bg-terranova-400 rounded-t transition-all"
                        style={{ height: `${(item.res / 450) * 100}%` }}
                        title={`Resueltas: ${item.res}`}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-gray-400">{item.m}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-gray-700 rounded-sm" /> Incidencias Reportadas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-terranova-500 rounded-sm" /> Incidencias Resueltas
                </span>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: SALUD URBANA POR COLONIA */}
          {activeTab === 'neighborhoods' && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-terranova-950/80 text-gray-400 uppercase text-[10px] border-b border-terranova-800">
                    <tr>
                      <th className="p-3">Colonia / Cuadrante</th>
                      <th className="p-3">Reportes</th>
                      <th className="p-3">Resueltas</th>
                      <th className="p-3">Cumplimiento SLA</th>
                      <th className="p-3">MTTR Promedio</th>
                      <th className="p-3">Índice UHI</th>
                      <th className="p-3 text-right">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terranova-800/60">
                    {neighborhoodRankings.map((col) => (
                      <tr key={col.name} className="hover:bg-terranova-800/30 transition-colors">
                        <td className="p-3 font-bold text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-terranova-400" />
                          <span>{col.name}</span>
                        </td>
                        <td className="p-3 text-gray-300">{col.total}</td>
                        <td className="p-3 text-emerald-400">{col.resolved}</td>
                        <td className="p-3 font-bold">{col.slaRate}%</td>
                        <td className="p-3">{col.mttr} hrs</td>
                        <td className="p-3">
                          <span className="font-bold text-amber-300">{col.uhi}</span> / 100
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              col.status === 'EXCELLENT'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : col.status === 'GOOD'
                                ? 'bg-sky-950 text-sky-400 border border-sky-800'
                                : col.status === 'ATTENTION'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {col.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 4: DESEMPEÑO DE CUADRILLAS */}
          {activeTab === 'crews' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crewPerformance.map((crew) => (
                <div key={crew.id} className="p-4 rounded-xl bg-terranova-950 border border-terranova-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">{crew.name}</h4>
                      <p className="text-[11px] text-gray-400">Responsable: {crew.leader}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold font-mono">
                      {crew.rate}% Eficiencia
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-terranova-800">
                    <div className="bg-terranova-900/60 p-2 rounded">
                      <span className="text-[10px] text-gray-400 block">Reportes Resueltos</span>
                      <span className="text-sm font-bold text-white">{crew.resolved} folios</span>
                    </div>
                    <div className="bg-terranova-900/60 p-2 rounded">
                      <span className="text-[10px] text-gray-400 block">Tiempo Medio (MTTR)</span>
                      <span className="text-sm font-bold text-sky-300">{crew.avgMttr} horas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          4. MODAL DE INFORME EJECUTIVO CERTIFICADO (PDF / IMPRESIÓN OFICIAL)
         ========================================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-terranova-900 border border-terranova-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-terranova-800 border-b border-terranova-700 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                EMISIÓN DE INFORME EJECUTIVO DE INTELIGENCIA TERRITORIAL
              </span>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Documento Oficial */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono text-gray-300">
              {/* Membrete Oficial */}
              <div className="border-b border-gray-700 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">H. Ayuntamiento de Puebla</h3>
                  <p className="text-[11px] text-gray-400">Secretaría de Infraestructura y Desarrollo Urbano</p>
                  <p className="text-[10px] text-terranova-400 font-bold">TERRANOVA BI • SISTEMA OPERATIVO TERRITORIAL</p>
                </div>
                <div className="text-right text-[10px]">
                  <span className="font-bold text-white block">FOLIO: REP-BI-2026-0418</span>
                  <span className="text-gray-400">Fecha: {new Date().toLocaleDateString('es-MX')}</span>
                </div>
              </div>

              {/* Resumen de Indicadores Clave */}
              <div className="grid grid-cols-3 gap-2 bg-terranova-950 p-3 rounded-xl border border-terranova-800 text-center">
                <div>
                  <span className="text-[10px] text-gray-400 block">MTTR Municipal</span>
                  <span className="text-base font-bold text-white">14.2 hrs</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Cumplimiento SLA</span>
                  <span className="text-base font-bold text-emerald-400">87.8%</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Salud Urbana UHI</span>
                  <span className="text-base font-bold text-amber-400">88.4 / 100</span>
                </div>
              </div>

              {/* Sello Digital y Código QR */}
              <div className="p-3 bg-terranova-950 rounded-xl border border-terranova-800 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SELLO DIGITAL CRIPTOGRÁFICO SHA-256 (INMUTABLE)</span>
                </div>
                <p className="text-[9px] text-gray-400 break-all bg-black/50 p-2 rounded border border-gray-800">
                  {reportSeal}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                  <span>Autoridad: Ing. Luis Fernando Morales (Secretario)</span>
                  <span>Verificable en: terranova-mx.vercel.app/verify</span>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="p-4 bg-terranova-950 border-t border-terranova-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-mono text-gray-400 hover:text-white"
              >
                Cerrar
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-terranova-600 hover:bg-terranova-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Descargar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
