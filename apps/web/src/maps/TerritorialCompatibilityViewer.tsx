import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MexicanState,
  MexicanMunicipality,
  MexicanLocality,
  MEXICAN_STATES,
  MEXICAN_MUNICIPALITIES,
  MEXICAN_LOCALITIES,
} from './mexicoGeoData';
import { PropertyItem, IncidentItem, LayerItem } from '../types';
import { BaseMapStyle, GisToolMode } from './MapLibreMap';
import { calculateGeodesicDistance, calculatePolygonArea } from './spatialMath';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  Zap,
  MapPin,
  Building,
} from 'lucide-react';

interface TerritorialCompatibilityViewerProps {
  baseMap: BaseMapStyle;
  layers?: LayerItem[];
  properties?: PropertyItem[];
  incidents?: IncidentItem[];
  activeTool?: GisToolMode;
  onSelectProperty?: (p: PropertyItem) => void;
  onSelectIncident?: (i: IncidentItem) => void;
  onMeasurementUpdate?: (info: { type: 'distance' | 'area'; value: string } | null) => void;
  selectedStateCve?: string;
  selectedMunCve?: string;
  selectedLocCve?: string;
  onSelectState?: (state: MexicanState) => void;
  onSelectMunicipality?: (mun: MexicanMunicipality) => void;
  onSelectLocality?: (loc: MexicanLocality) => void;
  center?: [number, number];
  zoom?: number;
  onRetryWebGL?: () => void;
}

/**
 * Proyección Web Mercator exacta (WGS84 -> Canvas Pixels)
 */
function projectPoint(
  lng: number,
  lat: number,
  width: number,
  height: number,
  centerLng: number,
  centerLat: number,
  zoom: number
): [number, number] {
  const scale = (256 * Math.pow(2, zoom)) / 360;
  const x = width / 2 + (lng - centerLng) * scale;

  // Mercator Y
  const latClamped = Math.max(-85.0511, Math.min(85.0511, lat));
  const centerLatClamped = Math.max(-85.0511, Math.min(85.0511, centerLat));

  const latRad = (latClamped * Math.PI) / 180;
  const centerLatRad = (centerLatClamped * Math.PI) / 180;

  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const centerMercN = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2));

  const y = height / 2 - (mercN - centerMercN) * scale * (180 / Math.PI);
  return [x, y];
}

/**
 * Desproyección Web Mercator inversa (Canvas Pixels -> WGS84)
 */
function unprojectPoint(
  x: number,
  y: number,
  width: number,
  height: number,
  centerLng: number,
  centerLat: number,
  zoom: number
): [number, number] {
  const scale = (256 * Math.pow(2, zoom)) / 360;
  const lng = centerLng + (x - width / 2) / scale;

  const centerLatClamped = Math.max(-85.0511, Math.min(85.0511, centerLat));
  const centerLatRad = (centerLatClamped * Math.PI) / 180;
  const centerMercN = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2));

  const mercN = centerMercN - (y - height / 2) / (scale * (180 / Math.PI));
  const latRad = 2 * Math.atan(Math.exp(mercN)) - Math.PI / 2;
  const lat = (latRad * 180) / Math.PI;

  return [lng, lat];
}

export const TerritorialCompatibilityViewer: React.FC<TerritorialCompatibilityViewerProps> = ({
  baseMap = 'dark',
  layers: _layers = [],
  properties = [],
  incidents = [],
  activeTool = 'pan',
  onSelectProperty,
  onSelectIncident,
  onMeasurementUpdate,
  selectedStateCve,
  selectedMunCve,
  selectedLocCve,
  onSelectState,
  onSelectMunicipality,
  onSelectLocality: _onSelectLocality,
  center = [-102.5528, 23.6345],
  zoom = 5.0,
  onRetryWebGL,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Estado de navegación local (viewport)
  const [viewportCenter, setViewportCenter] = useState<[number, number]>(center);
  const [viewportZoom, setViewportZoom] = useState<number>(zoom);

  // Estados de interacción
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; center: [number, number] } | null>(null);
  const [hoveredState, setHoveredState] = useState<MexicanState | null>(null);
  const [hoveredMun, setHoveredMun] = useState<MexicanMunicipality | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Puntos de medición
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  // Sincronizar dimensiones del contenedor
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 800,
          height: containerRef.current.clientHeight || 600,
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Sincronizar foco cuando cambie selección externa de Estado o Municipio
  useEffect(() => {
    if (selectedLocCve) {
      const loc = MEXICAN_LOCALITIES.find((l) => l.cve_geo === selectedLocCve);
      if (loc) {
        setViewportCenter(loc.center);
        setViewportZoom(14.0);
        return;
      }
    }
    if (selectedMunCve) {
      const mun = MEXICAN_MUNICIPALITIES.find((m) => m.cve_geo === selectedMunCve);
      if (mun) {
        setViewportCenter(mun.center);
        setViewportZoom(11.5);
        return;
      }
    }
    if (selectedStateCve) {
      const st = MEXICAN_STATES.find((s) => s.cve_ent === selectedStateCve);
      if (st) {
        setViewportCenter(st.center);
        setViewportZoom(st.zoom);
        return;
      }
    }
    setViewportCenter(center);
    setViewportZoom(zoom);
  }, [selectedStateCve, selectedMunCve, selectedLocCve, center[0], center[1], zoom]);

  // Dibujar mapa base raster 2D en Canvas (Slippy Tiles sin WebGL)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Fondo según tema de cartografía
    const bgColors: Record<BaseMapStyle, string> = {
      dark: '#030712', // Obsidian Dark GIS
      voyager: '#f8fafc', // Crisp Day Slate
      topo: '#0c141f', // Deep Topo
      osm: '#0f172a', // Neutral Slate
      sat: '#020617', // Deep Space Satellite
    };
    ctx.fillStyle = bgColors[baseMap] || '#030712';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Rejilla cartográfica de referencia EPSG:6362
    ctx.strokeStyle = baseMap === 'voyager' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 64;
    for (let x = 0; x < dimensions.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dimensions.height);
      ctx.stroke();
    }
    for (let y = 0; y < dimensions.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dimensions.width, y);
      ctx.stroke();
    }

    // Dibujar Slippy Tiles raster de respaldo en 2D Canvas (OpenStreetMap / Esri)
    const zInt = Math.max(1, Math.min(18, Math.floor(viewportZoom)));
    const tileCount = Math.pow(2, zInt);

    // Calcular el rango de teselas visibles en el viewport
    const topLeftCoord = unprojectPoint(0, 0, dimensions.width, dimensions.height, viewportCenter[0], viewportCenter[1], viewportZoom);
    const bottomRightCoord = unprojectPoint(dimensions.width, dimensions.height, dimensions.width, dimensions.height, viewportCenter[0], viewportCenter[1], viewportZoom);

    const lngToTileX = (lng: number) => Math.floor(((lng + 180) / 360) * tileCount);
    const latToTileY = (lat: number) => {
      const latRad = (Math.max(-85, Math.min(85, lat)) * Math.PI) / 180;
      return Math.floor((1 - Math.log(Math.tan(Math.PI / 4 + latRad / 2)) / Math.PI) / 2 * tileCount);
    };

    const minX = Math.max(0, Math.min(tileCount - 1, lngToTileX(Math.min(topLeftCoord[0], bottomRightCoord[0]))));
    const maxX = Math.max(0, Math.min(tileCount - 1, lngToTileX(Math.max(topLeftCoord[0], bottomRightCoord[0]))));
    const minY = Math.max(0, Math.min(tileCount - 1, latToTileY(Math.max(topLeftCoord[1], bottomRightCoord[1]))));
    const maxY = Math.max(0, Math.min(tileCount - 1, latToTileY(Math.min(topLeftCoord[1], bottomRightCoord[1]))));

    // Si el rango es razonable (< 25 teselas simultáneas), precargar las teselas en 2D
    const totalTiles = (maxX - minX + 1) * (maxY - minY + 1);
    if (totalTiles > 0 && totalTiles <= 30) {
      for (let tx = minX; tx <= maxX; tx++) {
        for (let ty = minY; ty <= maxY; ty++) {
          const tileLng = (tx / tileCount) * 360 - 180;
          const n = Math.PI - (2 * Math.PI * ty) / tileCount;
          const tileLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

          const [px, py] = projectPoint(tileLng, tileLat, dimensions.width, dimensions.height, viewportCenter[0], viewportCenter[1], viewportZoom);
          const [px2, py2] = projectPoint(
            ((tx + 1) / tileCount) * 360 - 180,
            (180 / Math.PI) * Math.atan(0.5 * (Math.exp(Math.PI - (2 * Math.PI * (ty + 1)) / tileCount) - Math.exp(-(Math.PI - (2 * Math.PI * (ty + 1)) / tileCount)))),
            dimensions.width,
            dimensions.height,
            viewportCenter[0],
            viewportCenter[1],
            viewportZoom
          );

          const tileW = Math.abs(px2 - px);
          const tileH = Math.abs(py2 - py);

          // Determinar URL de tesela raster según el motor cartográfico seleccionado
          let tileUrl = `https://tile.openstreetmap.org/${zInt}/${tx}/${ty}.png`;
          if (baseMap === 'dark') {
            tileUrl = `https://a.basemaps.cartocdn.com/dark_all/${zInt}/${tx}/${ty}.png`;
          } else if (baseMap === 'voyager') {
            tileUrl = `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zInt}/${tx}/${ty}.png`;
          } else if (baseMap === 'sat') {
            tileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zInt}/${ty}/${tx}`;
          } else if (baseMap === 'topo') {
            tileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${zInt}/${ty}/${tx}`;
          }

          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = tileUrl;
          img.onload = () => {
            if (canvasRef.current) {
              const currentCtx = canvasRef.current.getContext('2d');
              if (currentCtx) {
                currentCtx.globalAlpha = baseMap === 'sat' ? 0.90 : 0.85;
                currentCtx.drawImage(img, px, py, tileW, tileH);
                currentCtx.globalAlpha = 1.0;
              }
            }
          };
        }
      }
    }
  }, [dimensions, viewportCenter, viewportZoom, baseMap]);

  // Manejadores de Pan / Drag con Ratón y Touch
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'pan') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, center: [...viewportCenter] as [number, number] });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setHoverPos({ x: e.clientX, y: e.clientY });

    if (isDragging && dragStart && activeTool === 'pan') {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      const scale = (256 * Math.pow(2, viewportZoom)) / 360;
      const dLng = -dx / scale;
      const dLat = (dy / scale) * (180 / Math.PI) * 0.015;

      setViewportCenter([dragStart.center[0] + dLng, Math.max(-60, Math.min(60, dragStart.center[1] + dLat))]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Manejador de Zoom con Rueda del Ratón
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setViewportZoom((prev) => Math.max(3.0, Math.min(18.0, prev + delta)));
  };

  // Zoom In / Zoom Out
  const zoomIn = () => setViewportZoom((z) => Math.min(18.0, z + 0.75));
  const zoomOut = () => setViewportZoom((z) => Math.max(3.0, z - 0.75));
  const resetRepublic = () => {
    setViewportCenter([-102.5528, 23.6345]);
    setViewportZoom(5.0);
  };

  // Click sobre mapa para herramientas de medición o selección
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const [clickLng, clickLat] = unprojectPoint(
      clickX,
      clickY,
      dimensions.width,
      dimensions.height,
      viewportCenter[0],
      viewportCenter[1],
      viewportZoom
    );

    if (activeTool === 'measure_distance' || activeTool === 'measure_area') {
      const newPoints = [...measurePoints, [clickLng, clickLat] as [number, number]];
      setMeasurePoints(newPoints);

      if (activeTool === 'measure_distance' && newPoints.length >= 2) {
        let totalDist = 0;
        for (let i = 0; i < newPoints.length - 1; i++) {
          totalDist += calculateGeodesicDistance(newPoints[i], newPoints[i + 1]);
        }
        onMeasurementUpdate?.({
          type: 'distance',
          value: totalDist > 1000 ? `${(totalDist / 1000).toFixed(2)} km` : `${Math.round(totalDist)} m`,
        });
      } else if (activeTool === 'measure_area' && newPoints.length >= 3) {
        const areaResult = calculatePolygonArea(newPoints);
        onMeasurementUpdate?.({
          type: 'area',
          value:
            areaResult.areaHectares >= 1
              ? `${areaResult.areaHectares.toFixed(2)} ha`
              : `${Math.round(areaResult.areaSqm)} m²`,
        });
      }
    }
  };

  // Lista de Municipios a renderizar (filtrados o del estado seleccionado)
  const visibleMunicipalities = useMemo(() => {
    if (selectedStateCve) {
      return MEXICAN_MUNICIPALITIES.filter((m) => m.cve_ent === selectedStateCve);
    }
    // Si el zoom es mayor a 8.5, mostrar municipios cercanos
    if (viewportZoom >= 8.5) {
      return MEXICAN_MUNICIPALITIES.slice(0, 60);
    }
    return [];
  }, [selectedStateCve, viewportZoom]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden select-none bg-slate-950 font-sans"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : activeTool === 'pan' ? 'grab' : 'crosshair' }}
    >
      {/* 1. Lienzo 2D de Aceleración Raster */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* 2. Capa SVG Vectorial de Alta Fidelidad para los 32 Estados y Geometrías */}
      <svg
        className="absolute inset-0 w-full h-full z-10"
        onClick={handleMapClick}
      >
        <defs>
          <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.8" />
          </filter>
          <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Polígonos de los 32 Estados de la República Mexicana */}
        <g id="states-layer">
          {MEXICAN_STATES.map((st) => {
            const isSelected = selectedStateCve === st.cve_ent;
            const isHovered = hoveredState?.cve_ent === st.cve_ent;

            const pathData = st.polygon
              .map((coord, idx) => {
                const [px, py] = projectPoint(
                  coord[0],
                  coord[1],
                  dimensions.width,
                  dimensions.height,
                  viewportCenter[0],
                  viewportCenter[1],
                  viewportZoom
                );
                return `${idx === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
              })
              .join(' ') + ' Z';

            // Centroide proyectado para la etiqueta del estado
            const [labelX, labelY] = projectPoint(
              st.center[0],
              st.center[1],
              dimensions.width,
              dimensions.height,
              viewportCenter[0],
              viewportCenter[1],
              viewportZoom
            );

            return (
              <g key={st.cve_ent} className="cursor-pointer">
                <path
                  d={pathData}
                  fill={
                    isSelected
                      ? 'rgba(16, 185, 129, 0.25)'
                      : isHovered
                      ? 'rgba(56, 189, 248, 0.22)'
                      : baseMap === 'voyager'
                      ? 'rgba(14, 165, 233, 0.06)'
                      : 'rgba(16, 185, 129, 0.08)'
                  }
                  stroke={
                    isSelected
                      ? '#10b981'
                      : isHovered
                      ? '#38bdf8'
                      : baseMap === 'voyager'
                      ? '#0284c7'
                      : '#0ea5e9'
                  }
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2.0 : 1.2}
                  strokeDasharray={isSelected ? 'none' : undefined}
                  onMouseEnter={() => setHoveredState(st)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectState?.(st);
                    setViewportCenter(st.center);
                    setViewportZoom(st.zoom);
                  }}
                  className="transition-colors duration-150"
                />

                {/* Etiqueta flotante del estado */}
                {viewportZoom <= 8.5 && (
                  <g
                    transform={`translate(${labelX}, ${labelY})`}
                    className="pointer-events-none"
                  >
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="18"
                      rx="4"
                      fill={baseMap === 'voyager' ? 'rgba(255,255,255,0.85)' : 'rgba(3, 7, 18, 0.85)'}
                      stroke={isSelected ? '#10b981' : '#0284c7'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      fill={baseMap === 'voyager' ? '#0f172a' : '#38bdf8'}
                    >
                      {st.shortName}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Polígonos de Municipios (Cuando hay un estado seleccionado o zoom alto) */}
        {visibleMunicipalities.length > 0 && (
          <g id="municipalities-layer">
            {visibleMunicipalities.map((mun) => {
              const isSelected = selectedMunCve === mun.cve_geo;
              const isHovered = hoveredMun?.cve_geo === mun.cve_geo;

              const pathData = mun.polygon
                .map((coord, idx) => {
                  const [px, py] = projectPoint(
                    coord[0],
                    coord[1],
                    dimensions.width,
                    dimensions.height,
                    viewportCenter[0],
                    viewportCenter[1],
                    viewportZoom
                  );
                  return `${idx === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
                })
                .join(' ') + ' Z';

              const [labelX, labelY] = projectPoint(
                mun.center[0],
                mun.center[1],
                dimensions.width,
                dimensions.height,
                viewportCenter[0],
                viewportCenter[1],
                viewportZoom
              );

              return (
                <g key={mun.cve_geo} className="cursor-pointer">
                  <path
                    d={pathData}
                    fill={
                      isSelected
                        ? 'rgba(245, 158, 11, 0.30)'
                        : isHovered
                        ? 'rgba(16, 185, 129, 0.20)'
                        : 'rgba(16, 185, 129, 0.05)'
                    }
                    stroke={isSelected ? '#f59e0b' : isHovered ? '#10b981' : '#059669'}
                    strokeWidth={isSelected ? 2 : 1}
                    onMouseEnter={() => setHoveredMun(mun)}
                    onMouseLeave={() => setHoveredMun(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMunicipality?.(mun);
                      setViewportCenter(mun.center);
                      setViewportZoom(12.0);
                    }}
                  />
                  {viewportZoom >= 9.0 && (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      fill={baseMap === 'voyager' ? '#0f172a' : '#a7f3d0'}
                      stroke={baseMap === 'voyager' ? '#ffffff' : '#022c22'}
                      strokeWidth="2"
                      paintOrder="stroke"
                    >
                      {mun.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Predios Catastrales (Polígonos y Marcadores) */}
        <g id="parcels-layer">
          {properties.map((prop, idx) => {
            const coords = prop.polygonVertices || [
              [prop.coordinates[0] - 0.001, prop.coordinates[1] - 0.001],
              [prop.coordinates[0] + 0.001, prop.coordinates[1] - 0.001],
              [prop.coordinates[0] + 0.001, prop.coordinates[1] + 0.001],
              [prop.coordinates[0] - 0.001, prop.coordinates[1] + 0.001],
            ];

            const pathData = coords
              .map((c, i) => {
                const [px, py] = projectPoint(
                  c[0],
                  c[1],
                  dimensions.width,
                  dimensions.height,
                  viewportCenter[0],
                  viewportCenter[1],
                  viewportZoom
                );
                return `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
              })
              .join(' ') + ' Z';

            const [centerPx, centerPy] = projectPoint(
              prop.coordinates[0],
              prop.coordinates[1],
              dimensions.width,
              dimensions.height,
              viewportCenter[0],
              viewportCenter[1],
              viewportZoom
            );

            return (
              <g
                key={prop.id || idx}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProperty?.(prop);
                }}
              >
                <path
                  d={pathData}
                  fill="rgba(16, 185, 129, 0.30)"
                  stroke="#10b981"
                  strokeWidth="2"
                  filter="url(#emeraldGlow)"
                />
                <circle cx={centerPx} cy={centerPy} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                {viewportZoom >= 12 && (
                  <text
                    x={centerPx}
                    y={centerPy - 8}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    fill="#34d399"
                    stroke="#022c22"
                    strokeWidth="2"
                    paintOrder="stroke"
                  >
                    {prop.cadastralKey}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Incidencias Ciudadanas 072 */}
        <g id="incidents-layer">
          {incidents.map((inc) => {
            const [px, py] = projectPoint(
              inc.coordinates[0],
              inc.coordinates[1],
              dimensions.width,
              dimensions.height,
              viewportCenter[0],
              viewportCenter[1],
              viewportZoom
            );

            const color =
              inc.priority === 'Alta' || inc.priority === 'Crítica'
                ? '#ef4444'
                : inc.priority === 'Media'
                ? '#f59e0b'
                : '#10b981';

            return (
              <g
                key={inc.id}
                transform={`translate(${px}, ${py})`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectIncident?.(inc);
                }}
              >
                <circle r="9" fill={color} opacity="0.3" className="animate-ping" />
                <circle r="6" fill={color} stroke="#ffffff" strokeWidth="1.5" />
                <text
                  x="0"
                  y="-10"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth="2"
                  paintOrder="stroke"
                >
                  {inc.folio}
                </text>
              </g>
            );
          })}
        </g>

        {/* Línea / Polígono de medición interactiva */}
        {measurePoints.length > 0 && (
          <g id="measurement-layer" className="pointer-events-none">
            {measurePoints.map((pt, idx) => {
              const [px, py] = projectPoint(
                pt[0],
                pt[1],
                dimensions.width,
                dimensions.height,
                viewportCenter[0],
                viewportCenter[1],
                viewportZoom
              );
              return <circle key={idx} cx={px} cy={py} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />;
            })}
            {measurePoints.length >= 2 && (
              <path
                d={
                  measurePoints
                    .map((pt, idx) => {
                      const [px, py] = projectPoint(
                        pt[0],
                        pt[1],
                        dimensions.width,
                        dimensions.height,
                        viewportCenter[0],
                        viewportCenter[1],
                        viewportZoom
                      );
                      return `${idx === 0 ? 'M' : 'L'} ${px} ${py}`;
                    })
                    .join(' ') + (activeTool === 'measure_area' && measurePoints.length >= 3 ? ' Z' : '')
                }
                fill={activeTool === 'measure_area' ? 'rgba(245, 158, 11, 0.25)' : 'none'}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            )}
          </g>
        )}
      </svg>

      {/* 3. Banner Superior Informativo de Alta Compatibilidad 2D */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-400 text-xs font-mono shadow-xl backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold">Visor Territorial Resiliente (Canvas 2D Activo)</span>
          <span className="text-[10px] text-gray-400 hidden sm:inline">| Cobertura Nacional 32 Estados</span>
        </div>

        {onRetryWebGL && (
          <button
            onClick={onRetryWebGL}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs font-mono shadow-lg transition-all border border-emerald-400"
            title="Intentar reanudar aceleración WebGL en tu navegador"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Reintentar WebGL</span>
          </button>
        )}
      </div>

      {/* 4. Barra Flotante de Navegación y Zoom (+, -, 🇲🇽 Reset) */}
      <div className="absolute bottom-6 right-4 z-30 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-xl shadow-2xl backdrop-blur-md">
        <button
          onClick={zoomIn}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          title="Acercar (+)"
        >
          <ZoomIn className="w-4 h-4 text-emerald-400" />
        </button>
        <button
          onClick={zoomOut}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          title="Alejar (-)"
        >
          <ZoomOut className="w-4 h-4 text-emerald-400" />
        </button>
        <div className="w-full h-px bg-slate-700 my-0.5" />
        <button
          onClick={resetRepublic}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          title="Centrar República Mexicana Completa"
        >
          <RotateCcw className="w-4 h-4 text-sky-400" />
        </button>
      </div>

      {/* 5. Tooltip HUD interactivo de Estado / Municipio hovered */}
      {hoveredState && (
        <div
          className="fixed pointer-events-none z-40 px-3 py-2 rounded-lg bg-slate-900/95 border border-emerald-500 text-white font-mono text-xs shadow-2xl backdrop-blur-md"
          style={{
            left: (hoverPos?.x || 100) + 15,
            top: (hoverPos?.y || 100) + 15,
          }}
        >
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold border-b border-slate-700 pb-1 mb-1">
            <Building className="w-3.5 h-3.5" />
            <span>[{hoveredState.cve_ent}] {hoveredState.name}</span>
          </div>
          <p className="text-[11px] text-gray-300">Capital: <span className="text-white font-bold">{hoveredState.capital}</span></p>
          <p className="text-[11px] text-gray-300">Municipios: <span className="text-white font-bold">{hoveredState.municipalityCount}</span></p>
          <p className="text-[9px] text-emerald-400 mt-1">Haz clic para enfocar este estado</p>
        </div>
      )}

      {hoveredMun && (
        <div
          className="fixed pointer-events-none z-40 px-3 py-2 rounded-lg bg-slate-900/95 border border-amber-500 text-white font-mono text-xs shadow-2xl backdrop-blur-md"
          style={{
            left: (hoverPos?.x || 100) + 15,
            top: (hoverPos?.y || 100) + 15,
          }}
        >
          <div className="flex items-center gap-1.5 text-amber-400 font-bold border-b border-slate-700 pb-1 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>[{hoveredMun.cve_geo}] {hoveredMun.name}</span>
          </div>
          <p className="text-[11px] text-gray-300">Cabecera: <span className="text-white font-bold">{hoveredMun.headquarters}</span></p>
          <p className="text-[11px] text-gray-300">Población: <span className="text-white font-bold">{hoveredMun.population.toLocaleString()} hab.</span></p>
        </div>
      )}

      {/* 6. Barra de Estado de Coordenadas y Escala Cartográfica */}
      <div className="absolute bottom-2 left-3 z-30 flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-gray-400 backdrop-blur-sm pointer-events-none">
        <span>EPSG:6362</span>
        <span>•</span>
        <span>Lat: {viewportCenter[1].toFixed(4)}°</span>
        <span>•</span>
        <span>Lng: {viewportCenter[0].toFixed(4)}°</span>
        <span>•</span>
        <span className="text-emerald-400 font-bold">Zoom: {viewportZoom.toFixed(1)}x</span>
      </div>
    </div>
  );
};
