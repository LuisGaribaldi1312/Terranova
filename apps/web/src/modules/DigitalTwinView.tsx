import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Building2,
  Sun,
  CloudRain,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Layers,
  MapPin,
  Activity,
} from 'lucide-react';

interface DigitalTwinViewProps {
  onFocusMap: (coords: [number, number]) => void;
}

interface Building3d {
  id: string;
  name: string;
  cadastralKey: string;
  zoning: string;
  levels: number;
  heightM: number;
  elevationM: number;
  color: string;
  x: number; // Coordenada local en el plano 3D
  y: number;
  width: number;
  depth: number;
  coords: [number, number];
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({ onFocusMap }) => {
  // Controles de Cámara 3D Orbital
  const [pitch, setPitch] = useState<number>(45); // Inclinación en grados (15 a 75)
  const [yaw, setYaw] = useState<number>(35);     // Rotación en grados (0 a 360)
  const [zoom, setZoom] = useState<number>(1.1);  // Escala de zoom (0.6 a 2.2)

  // Modos de Simulación
  const [simMode, setSimMode] = useState<'BUILDINGS' | 'SHADOWS' | 'FLOOD' | 'WIREFRAME'>('BUILDINGS');
  const [timeOfDay, setTimeOfDay] = useState<number>(14.5); // 14:30 hrs
  const [rainfallMmH, setRainfallMmH] = useState<number>(50); // 50 mm/h de lluvia

  // Estado del motor de renderizado y FPS
  const [fps, setFps] = useState<number>(60.0);
  const [selectedBuilding, setSelectedBuilding] = useState<Building3d | null>(null);
  const [isRotatingAuto, setIsRotatingAuto] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  // Catálogo de Edificaciones 3D en el cuadrante de Puebla
  const buildings: Building3d[] = [
    {
      id: 'BLD-01',
      name: 'Torre Residencial Juárez 2104',
      cadastralKey: '21-114-01-0045-0012-000-00',
      zoning: 'H3-UNIFAMILIAR',
      levels: 4,
      heightM: 14.5,
      elevationM: 2154.2,
      color: '#38bdf8',
      x: -40,
      y: -30,
      width: 32,
      depth: 26,
      coords: [-98.2063, 19.0414],
    },
    {
      id: 'BLD-02',
      name: 'Corporativo Reforma Plaza',
      cadastralKey: '21-114-01-0045-0013-000-00',
      zoning: 'C2-COMERCIAL',
      levels: 8,
      heightM: 28.0,
      elevationM: 2153.8,
      color: '#10b981',
      x: 35,
      y: -25,
      width: 42,
      depth: 35,
      coords: [-98.2052, 19.042],
    },
    {
      id: 'BLD-03',
      name: 'Hospital San José IMSS (Ala Norte)',
      cadastralKey: '21-114-01-0046-0004-000-00',
      zoning: 'EQ-EQUIPAMIENTO',
      levels: 6,
      heightM: 22.5,
      elevationM: 2156.0,
      color: '#f59e0b',
      x: -25,
      y: 45,
      width: 55,
      depth: 40,
      coords: [-98.2078, 19.0435],
    },
    {
      id: 'BLD-04',
      name: 'Edificio Departamental La Paz',
      cadastralKey: '21-114-01-0047-0008-000-00',
      zoning: 'H4-PLURIFAMILIAR',
      levels: 5,
      heightM: 17.0,
      elevationM: 2162.4,
      color: '#8b5cf6',
      x: 60,
      y: 50,
      width: 30,
      depth: 28,
      coords: [-98.2088, 19.0402],
    },
    {
      id: 'BLD-05',
      name: 'Palacio Municipal / Portal Hidalgo',
      cadastralKey: '21-114-01-0048-0002-000-00',
      zoning: 'HIST-PATRIMONIAL',
      levels: 2,
      heightM: 9.8,
      elevationM: 2151.0,
      color: '#e11d48',
      x: -80,
      y: 20,
      width: 48,
      depth: 32,
      coords: [-98.2038, 19.0428],
    },
  ];

  // Cálculo solar en tiempo real (Puebla 19.04° N)
  const solarAngle = ((timeOfDay - 6) / 12) * Math.PI; // 0 en amanecer, PI en atardecer
  const sunElevation = Math.max(0.1, Math.sin(solarAngle) * 72); // grados de elevación solar
  const shadowRatio = Math.max(0.2, Number((1 / Math.tan((sunElevation * Math.PI) / 180)).toFixed(2)));
  const shadowDx = -Math.cos(solarAngle) * shadowRatio;
  const shadowDy = 0.5 * shadowRatio;

  // Ciclo de Renderizado 3D Acelerado con requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const render = (now: number) => {
      // Medición de FPS en tiempo real
      frameCountRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        setFps(Number((frameCountRef.current * 1000 / (now - lastTimeRef.current)).toFixed(1)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      // Rotación orbital automática suave si está activa
      if (isRotatingAuto) {
        setYaw((prev) => (prev + 0.3) % 360);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawScene(ctx, canvas.width, canvas.height);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [pitch, yaw, zoom, simMode, timeOfDay, rainfallMmH, isRotatingAuto, selectedBuilding]);

  // Función de Dibujo 3D Proyectado sobre Canvas 2D acelerado por GPU
  const drawScene = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2 + 30;

    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;
    const cosY = Math.cos(radYaw);
    const sinY = Math.sin(radYaw);
    const cosP = Math.cos(radPitch);
    const sinP = Math.sin(radPitch);

    // Función de proyección ortográfica 3D (x, y, z) -> (screenX, screenY)
    const project = (x: number, y: number, z: number): [number, number] => {
      // 1. Rotación en Yaw (plano horizontal X/Y)
      const rotX = x * cosY - y * sinY;
      const rotY = x * sinY + y * cosY;
      // 2. Inclinación en Pitch y escala de Zoom
      const screenX = centerX + rotX * zoom * 2.2;
      const screenY = centerY + (rotY * sinP - z * cosP) * zoom * 2.2;
      return [screenX, screenY];
    };

    // 1. Dibujar Malla Topográfica de Base (Ground Grid / DEM)
    ctx.strokeStyle = simMode === 'WIREFRAME' ? 'rgba(56, 189, 248, 0.45)' : 'rgba(30, 58, 80, 0.4)';
    ctx.lineWidth = 1;

    const gridSize = 160;
    const step = 20;

    for (let gx = -gridSize; gx <= gridSize; gx += step) {
      const p1 = project(gx, -gridSize, 0);
      const p2 = project(gx, gridSize, 0);
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    }

    for (let gy = -gridSize; gy <= gridSize; gy += step) {
      const p1 = project(-gridSize, gy, 0);
      const p2 = project(gridSize, gy, 0);
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
    }

    // 2. Simulación de Inundación / Escorrentía Pluvial (Plano de agua en cotas bajas)
    if (simMode === 'FLOOD') {
      const floodHeight = (rainfallMmH / 100) * 12; // Cota de agua pluvial acumulada
      ctx.fillStyle = 'rgba(14, 165, 233, 0.35)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;

      const f1 = project(-110, -110, floodHeight);
      const f2 = project(110, -110, floodHeight);
      const f3 = project(110, 110, floodHeight);
      const f4 = project(-110, 110, floodHeight);

      ctx.beginPath();
      ctx.moveTo(f1[0], f1[1]);
      ctx.lineTo(f2[0], f2[1]);
      ctx.lineTo(f3[0], f3[1]);
      ctx.lineTo(f4[0], f4[1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 3. Proyección de Conos de Sombra Solar (Shadows)
    if (simMode === 'SHADOWS' || simMode === 'BUILDINGS') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';

      buildings.forEach((b) => {
        const h = b.heightM * 1.8;
        const sX = shadowDx * h;
        const sY = shadowDy * h;

        const w2 = b.width / 2;
        const d2 = b.depth / 2;

        const p1 = project(b.x - w2 + sX, b.y - d2 + sY, 0);
        const p2 = project(b.x + w2 + sX, b.y - d2 + sY, 0);
        const p3 = project(b.x + w2, b.y + d2, 0);
        const p4 = project(b.x - w2, b.y + d2, 0);

        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.lineTo(p3[0], p3[1]);
        ctx.lineTo(p4[0], p4[1]);
        ctx.closePath();
        ctx.fill();
      });
    }

    // 4. Ordenamiento por profundidad (Painter's Algorithm en Y rotada)
    const sortedBuildings = [...buildings].sort((a, b) => {
      const rotYa = a.x * sinY + a.y * cosY;
      const rotYb = b.x * sinY + b.y * cosY;
      return rotYa - rotYb;
    });

    // 5. Renderizado de Poliedros Extruidos LoD1 (Cajas 3D)
    sortedBuildings.forEach((b) => {
      const h = b.heightM * 1.8;
      const w2 = b.width / 2;
      const d2 = b.depth / 2;

      // 8 Vértices del prisma rectangular
      // Base inferior (z = 0)
      const b1 = project(b.x + w2, b.y - d2, 0);
      const b2 = project(b.x + w2, b.y + d2, 0);
      const b3 = project(b.x - w2, b.y + d2, 0);

      // Cubierta superior (z = h)
      const t0 = project(b.x - w2, b.y - d2, h);
      const t1 = project(b.x + w2, b.y - d2, h);
      const t2 = project(b.x + w2, b.y + d2, h);
      const t3 = project(b.x - w2, b.y + d2, h);

      const isSelected = selectedBuilding?.id === b.id;

      // Fachada Frontal (Sur)
      ctx.fillStyle = isSelected ? '#fbbf24' : adjustColorBrightness(b.color, -25);
      ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(15, 23, 42, 0.8)';
      ctx.lineWidth = isSelected ? 2 : 1;

      ctx.beginPath();
      ctx.moveTo(b2[0], b2[1]);
      ctx.lineTo(b3[0], b3[1]);
      ctx.lineTo(t3[0], t3[1]);
      ctx.lineTo(t2[0], t2[1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fachada Lateral (Este)
      ctx.fillStyle = isSelected ? '#f59e0b' : adjustColorBrightness(b.color, -10);
      ctx.beginPath();
      ctx.moveTo(b1[0], b1[1]);
      ctx.lineTo(b2[0], b2[1]);
      ctx.lineTo(t2[0], t2[1]);
      ctx.lineTo(t1[0], t1[1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Techo / Cubierta Superior (Iluminación cenital)
      ctx.fillStyle = isSelected ? '#fef08a' : b.color;
      ctx.beginPath();
      ctx.moveTo(t0[0], t0[1]);
      ctx.lineTo(t1[0], t1[1]);
      ctx.lineTo(t2[0], t2[1]);
      ctx.lineTo(t3[0], t3[1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Etiqueta de altura y nombre si está seleccionado
      if (isSelected) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`${b.name} (${b.heightM}m)`, t2[0] + 8, t2[1] - 8);
      }
    });

    // 6. Indicador del Sol en el Cielo
    const sunScreenX = centerX + Math.cos(solarAngle) * (width * 0.42);
    const sunScreenY = 65 - Math.sin(solarAngle) * 35;

    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(sunScreenX, sunScreenY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset
  };

  // Helper para graduar sombras en fachadas
  const adjustColorBrightness = (hex: string, percent: number): string => {
    let num = parseInt(hex.replace('#', ''), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00ff) + percent;
    let b = (num & 0x0000ff) + percent;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // Click sobre el canvas para seleccionar edificio
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Detectar si el clic cayó cerca del centroide proyectado
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 30;
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;
    const cosY = Math.cos(radYaw);
    const sinY = Math.sin(radYaw);
    const sinP = Math.sin(radPitch);
    const cosP = Math.cos(radPitch);

    let clicked: Building3d | null = null;
    buildings.forEach((b) => {
      const rotX = b.x * cosY - b.y * sinY;
      const rotY = b.x * sinY + b.y * cosY;
      const sX = centerX + rotX * zoom * 2.2;
      const sY = centerY + (rotY * sinP - (b.heightM * 0.9) * cosP) * zoom * 2.2;

      const dist = Math.hypot(clickX - sX, clickY - sY);
      if (dist < 35) {
        clicked = b;
      }
    });

    setSelectedBuilding(clicked);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col gis-grid-bg text-left relative">
      {/* =========================================================================
          1. HEADER Y BARRA DE ESTADO DEL MOTOR 3D
         ========================================================================= */}
      <div className="p-4 bg-terranova-900/90 border-b border-terranova-700 flex flex-wrap items-center justify-between gap-3 shadow-panel-dark z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-terranova-600 flex items-center justify-center shadow-lg border border-purple-400/40">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white font-mono flex items-center gap-1.5">
                TERRANOVA 3D TWIN — Gemelo Digital Territorial
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                FASE 15
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Modelado urbano 3D fotorrealista (LoD1/LoD2), conos de sombra solar, simulación de escorrentías e insolación.
            </p>
          </div>
        </div>

        {/* Telemetría de Rendimiento en Tiempo Real (> 30 FPS Innegociable) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-terranova-950 border border-terranova-800 text-xs font-mono">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400">Render:</span>
            <span
              className={`font-bold ${
                fps >= 30.0 ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
              }`}
            >
              {fps.toFixed(1)} FPS
            </span>
            <span className="text-[10px] text-gray-500">(Criterio &gt;30 FPS OK)</span>
          </div>

          {/* Toggle de Rotación Automática */}
          <button
            onClick={() => setIsRotatingAuto(!isRotatingAuto)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              isRotatingAuto
                ? 'bg-purple-950 text-purple-300 border border-purple-600 shadow-md'
                : 'bg-terranova-950 text-gray-400 hover:text-white border border-terranova-800'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotatingAuto ? 'animate-spin' : ''}`} />
            <span>{isRotatingAuto ? 'Órbita Activa' : 'Girar Órbita'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. LIENZO 3D & CONTROLES ORBITALES FLOTANTES
         ========================================================================= */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-terranova-950">
        {/* Canvas de Renderizado 3D */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={680}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
        />

        {/* Controles Flotantes Superiores: Selector de Modos de Simulación */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 bg-terranova-900/90 border border-terranova-700 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setSimMode('BUILDINGS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              simMode === 'BUILDINGS'
                ? 'bg-terranova-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Volúmenes LoD1</span>
          </button>

          <button
            onClick={() => setSimMode('SHADOWS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              simMode === 'SHADOWS'
                ? 'bg-amber-600 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Sombras Solares</span>
          </button>

          <button
            onClick={() => setSimMode('FLOOD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              simMode === 'FLOOD'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Escorrentía Pluvial</span>
          </button>

          <button
            onClick={() => setSimMode('WIREFRAME')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              simMode === 'WIREFRAME'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Wireframe DEM</span>
          </button>
        </div>

        {/* Panel Flotante Inferior: Slider de Tiempo Solar / Lluvia */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-10 bg-terranova-900/90 border border-terranova-700 p-4 rounded-2xl shadow-2xl backdrop-blur-md space-y-3 font-mono text-xs">
          {simMode === 'SHADOWS' || simMode === 'BUILDINGS' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  Simulación de Luz Solar (Hora del Día)
                </span>
                <span className="text-amber-400 font-bold">
                  {Math.floor(timeOfDay).toString().padStart(2, '0')}:
                  {Math.round((timeOfDay % 1) * 60).toString().padStart(2, '0')} hrs
                </span>
              </div>
              <input
                type="range"
                min="7"
                max="19"
                step="0.25"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>07:00 (Amanecer)</span>
                <span>12:00 (Cénit)</span>
                <span>19:00 (Ocaso)</span>
              </div>
            </div>
          ) : simMode === 'FLOOD' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-sky-400" />
                  Precipitación Pluvial Simulada
                </span>
                <span className="text-sky-400 font-bold">{rainfallMmH} mm/h</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={rainfallMmH}
                onChange={(e) => setRainfallMmH(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Llovizna (10mm)</span>
                <span>Tormenta (50mm)</span>
                <span>Torrencial (120mm)</span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-gray-300">
              <span className="font-bold text-white block mb-0.5">Malla Alámbrica Topográfica</span>
              Cuadrícula digital del terreno calibrada a cota media de 2,154 msnm.
            </div>
          )}
        </div>

        {/* Controles Orbitales de Cámara (Zoom, Pitch, Yaw) en Esquina Derecha */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-terranova-900/90 border border-terranova-700 p-2 rounded-2xl shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))}
            title="Acercar (Zoom In)"
            className="p-2 rounded-xl bg-terranova-950 text-gray-300 hover:text-white hover:bg-terranova-800 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            title="Alejar (Zoom Out)"
            className="p-2 rounded-xl bg-terranova-950 text-gray-300 hover:text-white hover:bg-terranova-800 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-terranova-700 my-1" />
          <button
            onClick={() => setPitch((p) => Math.min(75, p + 5))}
            title="Aumentar Inclinación Cenital"
            className="p-2 rounded-xl bg-terranova-950 text-gray-300 hover:text-white hover:bg-terranova-800 transition-colors text-[10px] font-mono font-bold"
          >
            ▲
          </button>
          <button
            onClick={() => setPitch((p) => Math.max(15, p - 5))}
            title="Reducir Inclinación"
            className="p-2 rounded-xl bg-terranova-950 text-gray-300 hover:text-white hover:bg-terranova-800 transition-colors text-[10px] font-mono font-bold"
          >
            ▼
          </button>
          <div className="w-full h-px bg-terranova-700 my-1" />
          <button
            onClick={() => setYaw((y) => (y + 15) % 360)}
            title="Rotar Plano 15°"
            className="p-2 rounded-xl bg-terranova-950 text-gray-300 hover:text-white hover:bg-terranova-800 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Ficha Técnica Flotante del Edificio Seleccionado */}
        {selectedBuilding && (
          <div className="absolute top-20 right-4 z-20 w-80 bg-terranova-900/95 border border-terranova-600 p-4 rounded-2xl shadow-2xl backdrop-blur-md space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-terranova-700 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Box className="w-4 h-4 text-sky-400" />
                Ficha Técnica 3D LoD1
              </span>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="font-bold text-white text-sm">{selectedBuilding.name}</h3>
              <p className="text-[10px] text-terranova-300">{selectedBuilding.cadastralKey}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-terranova-950 p-2.5 rounded-xl border border-terranova-800">
              <div>
                <span className="text-[10px] text-gray-400 block">Altura Extruida</span>
                <span className="font-bold text-white">{selectedBuilding.heightM} metros</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Niveles</span>
                <span className="font-bold text-white">{selectedBuilding.levels} plantas</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Cota Terreno</span>
                <span className="font-bold text-white">{selectedBuilding.elevationM} msnm</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Zonificación</span>
                <span className="font-bold text-emerald-400">{selectedBuilding.zoning}</span>
              </div>
            </div>

            <button
              onClick={() => onFocusMap(selectedBuilding.coords)}
              className="w-full py-2 rounded-xl bg-terranova-600 hover:bg-terranova-500 text-white font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Centrar en Mapa 2D GIS</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
