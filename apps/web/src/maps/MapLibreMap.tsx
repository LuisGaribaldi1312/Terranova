import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PropertyItem, IncidentItem, LayerItem } from '../types';
import { calculateGeodesicDistance, calculatePolygonArea } from './spatialMath';
import {
  MexicanState,
  MexicanMunicipality,
  MexicanLocality,
  MEXICAN_STATES,
  MEXICAN_MUNICIPALITIES,
  MEXICAN_LOCALITIES,
  getMexicanStatesGeoJSON,
  getMexicanMunicipalitiesGeoJSON,
  getMexicanLocalitiesGeoJSON,
} from './mexicoGeoData';

type MapLibreInstance = maplibregl.Map;
type GeoJSONSource = maplibregl.GeoJSONSource;

export type BaseMapStyle = 'dark' | 'voyager' | 'topo' | 'osm' | 'sat';
export type GisToolMode = 'pan' | 'measure_distance' | 'measure_area' | 'draw_polygon';

interface MapLibreMapProps {
  baseMap: BaseMapStyle;
  layers: LayerItem[];
  properties: PropertyItem[];
  incidents: IncidentItem[];
  activeTool: GisToolMode;
  onSelectProperty: (p: PropertyItem) => void;
  onSelectIncident: (i: IncidentItem) => void;
  onMeasurementUpdate?: (info: { type: 'distance' | 'area'; value: string } | null) => void;
  selectedStateCve?: string;
  selectedMunCve?: string;
  selectedLocCve?: string;
  onSelectState?: (state: MexicanState) => void;
  onSelectMunicipality?: (mun: MexicanMunicipality) => void;
  onSelectLocality?: (loc: MexicanLocality) => void;
  center?: [number, number];
  zoom?: number;
}

export const MapLibreMap: React.FC<MapLibreMapProps> = ({
  baseMap,
  layers,
  properties,
  incidents,
  activeTool,
  onSelectProperty,
  onSelectIncident,
  onMeasurementUpdate,
  selectedStateCve,
  selectedMunCve,
  selectedLocCve,
  onSelectState,
  onSelectMunicipality,
  onSelectLocality,
  center = [-102.5528, 23.6345], // Centro de la República Mexicana
  zoom = 5.0, // Zoom de vista nacional
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreInstance | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [measurementPoints, setMeasurementPoints] = useState<[number, number][]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Estilos de MapLibre: Raster de alta disponibilidad para garantizar visualización inmediata
  const getStyleUrl = (style: BaseMapStyle) => {
    switch (style) {
      case 'voyager':
        // CartoDB Voyager: La cartografía más nítida, detallada y legible para modo diurno
        return {
          version: 8,
          sources: {
            'carto-voyager': {
              type: 'raster',
              tiles: [
                'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
                'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
              ],
              tileSize: 256,
              attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
            },
          },
          layers: [{ id: 'carto-voyager-layer', type: 'raster', source: 'carto-voyager' }],
        };
      case 'topo':
        // Esri World Street Map: Red de carreteras federales, estatales y toponimia completa
        return {
          version: 8,
          sources: {
            'esri-topo': {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
              attribution: 'Esri, HERE, Garmin, USGS, NGA, EPA',
            },
          },
          layers: [{ id: 'esri-topo-layer', type: 'raster', source: 'esri-topo' }],
        };
      case 'sat':
        return {
          version: 8,
          sources: {
            'esri-satellite': {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
              attribution: 'Esri, Maxar, Earthstar Geographics',
            },
          },
          layers: [{ id: 'esri-satellite-layer', type: 'raster', source: 'esri-satellite' }],
        };
      case 'osm':
        return {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap Contributors',
            },
          },
          layers: [{ id: 'osm-layer', type: 'raster', source: 'osm-tiles' }],
        };
      case 'dark':
      default:
        // CartoDB Dark Matter Raster Tiles (Máxima resiliencia y contraste en modo noche)
        return {
          version: 8,
          sources: {
            'carto-dark-tiles': {
              type: 'raster',
              tiles: [
                'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              ],
              tileSize: 256,
              attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
            },
          },
          layers: [{ id: 'carto-dark-layer', type: 'raster', source: 'carto-dark-tiles' }],
        };
    }
  };

  // 1. Inicializar el mapa MapLibre GL JS
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getStyleUrl(baseMap) as any,
        center,
        zoom,
        pitch: 0,
        bearing: 0,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

      map.on('load', () => {
        mapInstanceRef.current = map;
        setMapLoaded(true);
        map.resize();
        setupTerritorialLayers(map);
        setupUserLayers(map);
        setupStateMarkers(map);

        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.resize();
          }
        }, 200);
      });

      map.on('error', (err) => {
        console.warn('MapLibre GL Notice:', err);
      });

      // ResizeObserver para garantizar que el lienzo WebGL se ajuste siempre al 100%
      const ro = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.resize();
        }
      });
      ro.observe(mapContainerRef.current);

      // Cleanup
      return () => {
        ro.disconnect();
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (err: any) {
      console.error('Error inicializando MapLibre:', err);
      setMapError('Error de contexto WebGL. Activando visor territorial de alta compatibilidad.');
    }
  }, []);

  const setupStateMarkers = (map: MapLibreInstance) => {
    // Limpiar marcadores previos
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Crear etiquetas flotantes elegantes para los 32 estados
    MEXICAN_STATES.forEach((st) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer group select-none transition-transform hover:scale-110';
      el.innerHTML = `
        <div class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-tight bg-slate-950/85 text-emerald-400 border border-emerald-500/50 shadow-md backdrop-blur-sm group-hover:bg-emerald-500 group-hover:text-black transition-all">
          ${st.shortName}
        </div>
      `;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectState?.(st);
        map.flyTo({ center: st.center, zoom: st.zoom, speed: 1.3 });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(st.center)
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  // 2. Cambio dinámico de Mapa Base
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;
    map.setStyle(getStyleUrl(baseMap) as any);
    map.once('style.load', () => {
      setupTerritorialLayers(map);
      setupUserLayers(map);
      setupStateMarkers(map);
    });
  }, [baseMap]);

  // 3. Volar a Estado, Municipio o Localidad cuando cambie la selección
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Actualizar datos filtrados en capas territoriales
    const munSource = map.getSource('mgn-municipalities-source') as GeoJSONSource;
    if (munSource) {
      munSource.setData(getMexicanMunicipalitiesGeoJSON(selectedStateCve || undefined) as any);
    }

    const locSource = map.getSource('mgn-localities-source') as GeoJSONSource;
    if (locSource) {
      locSource.setData(getMexicanLocalitiesGeoJSON(
        selectedStateCve || undefined,
        selectedMunCve ? selectedMunCve.slice(2) : undefined
      ) as any);
    }

    if (selectedLocCve) {
      const loc = MEXICAN_LOCALITIES.find((l) => l.cve_geo === selectedLocCve);
      if (loc) {
        map.flyTo({ center: loc.center, zoom: 14.5, speed: 1.5 });
        return;
      }
    }

    if (selectedMunCve) {
      const mun = MEXICAN_MUNICIPALITIES.find((m) => m.cve_geo === selectedMunCve);
      if (mun) {
        map.flyTo({ center: mun.center, zoom: 12.0, speed: 1.4 });
        return;
      }
    }

    if (selectedStateCve) {
      const state = MEXICAN_STATES.find((s) => s.cve_ent === selectedStateCve);
      if (state) {
        map.flyTo({ center: state.center, zoom: state.zoom, speed: 1.2 });
        return;
      }
    }

    // Si no hay filtro local, volar al centro territorial especificado
    map.flyTo({ center, zoom, speed: 1.2 });
  }, [selectedStateCve, selectedMunCve, selectedLocCve, center[0], center[1], zoom, mapLoaded]);

  // 3b. Actualizar dinámicamente predios e incidencias al cambiar la organización o datos
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const parcelsSource = map.getSource('terranova-parcels-source') as GeoJSONSource;
    if (parcelsSource) {
      const parcelFeatures = properties.map((prop, idx) => {
        const offset = idx * 0.002;
        return {
          type: 'Feature',
          properties: {
            id: prop.id,
            cadastralKey: prop.cadastralKey,
            landUse: prop.landUse,
            cadastralValue: prop.cadastralValue,
            owner: prop.owner,
            neighborhood: prop.neighborhood,
          },
          geometry: prop.polygonVertices ? {
            type: 'Polygon',
            coordinates: [[...prop.polygonVertices, prop.polygonVertices[0]]],
          } : {
            type: 'Polygon',
            coordinates: [[
              [prop.coordinates[0] - 0.001 - offset, prop.coordinates[1] - 0.001],
              [prop.coordinates[0] + 0.001 - offset, prop.coordinates[1] - 0.001],
              [prop.coordinates[0] + 0.001 - offset, prop.coordinates[1] + 0.001],
              [prop.coordinates[0] - 0.001 - offset, prop.coordinates[1] + 0.001],
              [prop.coordinates[0] - 0.001 - offset, prop.coordinates[1] - 0.001],
            ]],
          },
        };
      });
      parcelsSource.setData({ type: 'FeatureCollection', features: parcelFeatures as any });
    }

    const incidentsSource = map.getSource('terranova-incidents-source') as GeoJSONSource;
    if (incidentsSource) {
      const incidentFeatures = incidents.map((inc) => ({
        type: 'Feature',
        properties: {
          id: inc.id,
          folio: inc.folio,
          title: inc.title,
          priority: inc.priority,
          type: inc.type,
        },
        geometry: {
          type: 'Point',
          coordinates: inc.coordinates,
        },
      }));
      incidentsSource.setData({ type: 'FeatureCollection', features: incidentFeatures as any });
    }
  }, [properties, incidents, mapLoaded]);

  // 4. Configurar Capas del Marco Geoestadístico Nacional (MGN INEGI)
  const setupTerritorialLayers = (map: MapLibreInstance) => {
    // A. Capa de los 32 Estados de la República Mexicana
    if (!map.getSource('mgn-states-source')) {
      map.addSource('mgn-states-source', {
        type: 'geojson',
        data: getMexicanStatesGeoJSON() as any,
      });

      // Relleno sutil que no obstruye la visibilidad de calles, costas ni toponimia del mapa base
      map.addLayer({
        id: 'states-fill',
        type: 'fill',
        source: 'mgn-states-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'cve_ent'],
            '21', '#17A987', // Puebla en verde tecnológico
            '09', '#38BDF8', // CDMX en azul cielo
            '14', '#A855F7', // Jalisco en violeta
            '19', '#F59E0B', // Nuevo León en ámbar
            '22', '#EC4899', // Querétaro en rosa
            '31', '#10B981', // Yucatán en esmeralda
            /* default */ '#0EA5E9',
          ],
          'fill-opacity': 0.06,
        },
      });

      // Límites limpios y brillantes de los 32 estados
      map.addLayer({
        id: 'states-boundary',
        type: 'line',
        source: 'mgn-states-source',
        paint: {
          'line-color': '#0284C7',
          'line-width': 2.5,
          'line-opacity': 0.9,
        },
      });

      // Click sobre un estado para zoom interactivo
      map.on('click', 'states-fill', (e) => {
        if (activeTool !== 'pan') return;
        if (e.features && e.features[0]) {
          const cve = e.features[0].properties.cve_ent;
          const found = MEXICAN_STATES.find((s) => s.cve_ent === cve);
          if (found) {
            onSelectState?.(found);
            map.flyTo({ center: found.center, zoom: found.zoom, speed: 1.2 });
          }
        }
      });
    }

    // B. Capa de Municipios de México (MGN)
    if (!map.getSource('mgn-municipalities-source')) {
      map.addSource('mgn-municipalities-source', {
        type: 'geojson',
        data: getMexicanMunicipalitiesGeoJSON() as any,
      });

      map.addLayer({
        id: 'municipalities-fill',
        type: 'fill',
        source: 'mgn-municipalities-source',
        paint: {
          'fill-color': '#10B981',
          'fill-opacity': 0.10,
        },
      });

      map.addLayer({
        id: 'municipalities-boundary',
        type: 'line',
        source: 'mgn-municipalities-source',
        paint: {
          'line-color': '#17A987',
          'line-width': 1.5,
          'line-dasharray': [2, 1],
        },
      });

      map.on('click', 'municipalities-fill', (e) => {
        if (activeTool !== 'pan') return;
        if (e.features && e.features[0]) {
          const cveGeo = e.features[0].properties.cve_geo;
          const found = MEXICAN_MUNICIPALITIES.find((m) => m.cve_geo === cveGeo);
          if (found) {
            onSelectMunicipality?.(found);
            map.flyTo({ center: found.center, zoom: 12.0, speed: 1.4 });
          }
        }
      });
    }

    // C. Capa de Localidades Urbanas y Rurales (INEGI)
    if (!map.getSource('mgn-localities-source')) {
      map.addSource('mgn-localities-source', {
        type: 'geojson',
        data: getMexicanLocalitiesGeoJSON() as any,
      });

      map.addLayer({
        id: 'localities-circle',
        type: 'circle',
        source: 'mgn-localities-source',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 3,
            12, 7,
            16, 12,
          ],
          'circle-color': [
            'match',
            ['get', 'type'],
            'URBANA', '#38BDF8',
            'RURAL', '#F59E0B',
            '#10B981',
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#0B1D2A',
        },
      });

      map.on('click', 'localities-circle', (e) => {
        if (activeTool !== 'pan') return;
        if (e.features && e.features[0]) {
          const cveGeo = e.features[0].properties.cve_geo;
          const found = MEXICAN_LOCALITIES.find((l) => l.cve_geo === cveGeo);
          if (found) {
            onSelectLocality?.(found);
            map.flyTo({ center: found.center, zoom: 14.5, speed: 1.4 });
          }
        }
      });
    }
  };

  // 5. Configurar Capas del Usuario (Predios, Incidencias, Mediciones)
  const setupUserLayers = (map: MapLibreInstance) => {
    // Predios Catastrales
    if (!map.getSource('terranova-parcels-source')) {
      const parcelFeatures = properties.map((prop, idx) => {
        const offset = idx * 0.002;
        return {
          type: 'Feature',
          properties: {
            id: prop.id,
            cadastralKey: prop.cadastralKey,
            neighborhood: prop.neighborhood,
            landArea: prop.landArea,
            landUse: prop.landUse,
            value: prop.cadastralValue,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-98.2285 + offset, 19.0512 + offset],
              [-98.2265 + offset, 19.0512 + offset],
              [-98.2265 + offset, 19.0498 + offset],
              [-98.2285 + offset, 19.0498 + offset],
              [-98.2285 + offset, 19.0512 + offset],
            ]],
          },
        };
      });

      map.addSource('terranova-parcels-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: parcelFeatures as any },
      });

      map.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'terranova-parcels-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'landUse'],
            'Habitacional', '#17A987',
            'Comercial', '#38BDF8',
            'Industrial', '#A855F7',
            'Mixto', '#F59E0B',
            /* default */ '#22C49F',
          ],
          'fill-opacity': 0.45,
        },
      });

      map.addLayer({
        id: 'parcels-stroke',
        type: 'line',
        source: 'terranova-parcels-source',
        paint: {
          'line-color': '#17A987',
          'line-width': 2,
        },
      });

      map.on('click', 'parcels-fill', (e) => {
        if (activeTool !== 'pan') return;
        if (e.features && e.features[0]) {
          const pId = e.features[0].properties.id;
          const found = properties.find((p) => p.id === pId);
          if (found) onSelectProperty(found);
        }
      });
    }

    // Incidencias
    if (!map.getSource('terranova-incidents-source')) {
      const incidentFeatures = incidents.map((inc) => ({
        type: 'Feature',
        properties: {
          id: inc.id,
          folio: inc.folio,
          title: inc.title,
          priority: inc.priority,
          type: inc.type,
        },
        geometry: {
          type: 'Point',
          coordinates: inc.coordinates,
        },
      }));

      map.addSource('terranova-incidents-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: incidentFeatures as any },
      });

      map.addLayer({
        id: 'incidents-pulse',
        type: 'circle',
        source: 'terranova-incidents-source',
        paint: {
          'circle-radius': 14,
          'circle-color': '#EF4444',
          'circle-opacity': 0.3,
        },
      });

      map.addLayer({
        id: 'incidents-point',
        type: 'circle',
        source: 'terranova-incidents-source',
        paint: {
          'circle-radius': 7,
          'circle-color': '#EF4444',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      map.on('click', 'incidents-point', (e) => {
        if (activeTool !== 'pan') return;
        if (e.features && e.features[0]) {
          const incId = e.features[0].properties.id;
          const found = incidents.find((i) => i.id === incId);
          if (found) onSelectIncident(found);
        }
      });
    }

    // Mediciones
    if (!map.getSource('terranova-measure-source')) {
      map.addSource('terranova-measure-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'measure-fill',
        type: 'fill',
        source: 'terranova-measure-source',
        paint: {
          'fill-color': '#FACC15',
          'fill-opacity': 0.3,
        },
        filter: ['==', '$type', 'Polygon'],
      });

      map.addLayer({
        id: 'measure-lines',
        type: 'line',
        source: 'terranova-measure-source',
        paint: {
          'line-color': '#FACC15',
          'line-width': 3,
          'line-dasharray': [2, 1],
        },
      });

      map.addLayer({
        id: 'measure-points',
        type: 'circle',
        source: 'terranova-measure-source',
        paint: {
          'circle-radius': 6,
          'circle-color': '#FACC15',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#0B1D2A',
        },
        filter: ['==', '$type', 'Point'],
      });
    }

    // Sincronizar visibilidad de capas
    layers.forEach((layer) => {
      let targetId = '';
      if (layer.id === 'lay-predios') targetId = 'parcels-fill';
      if (layer.id === 'lay-incidencias') targetId = 'incidents-point';
      if (layer.id === 'lay-inegi-estados') targetId = 'states-fill';
      if (layer.id === 'lay-inegi-municipios') targetId = 'municipalities-fill';
      if (layer.id === 'lay-inegi-colonias') targetId = 'localities-circle';

      if (targetId && map.getLayer(targetId)) {
        map.setLayoutProperty(targetId, 'visibility', layer.active ? 'visible' : 'none');
      }
    });
  };

  // 6. Manejo de Herramientas de Medición
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (activeTool === 'measure_distance') {
        const next = [...measurementPoints, coords];
        setMeasurementPoints(next);

        if (next.length >= 2) {
          let totalDist = 0;
          for (let i = 0; i < next.length - 1; i++) {
            totalDist += calculateGeodesicDistance(next[i], next[i + 1]);
          }
          const text = totalDist >= 1000 
            ? `${(totalDist / 1000).toFixed(3)} km (${totalDist.toFixed(1)} m en EPSG:6362)`
            : `${totalDist.toFixed(2)} metros (Distancia Geodésica Oficial)`;
          onMeasurementUpdate?.({ type: 'distance', value: text });
        }
        updateMeasurementLayer(map, next, 'distance');
      } else if (activeTool === 'measure_area' || activeTool === 'draw_polygon') {
        const next = [...measurementPoints, coords];
        setMeasurementPoints(next);

        if (next.length >= 3) {
          const areaInfo = calculatePolygonArea(next);
          const text = `${areaInfo.areaSqm.toLocaleString()} m² (${areaInfo.areaHectares} ha) • Perímetro: ${areaInfo.perimeterMeters} m`;
          onMeasurementUpdate?.({ type: 'area', value: text });
        }
        updateMeasurementLayer(map, next, 'area');
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [activeTool, measurementPoints]);

  const updateMeasurementLayer = (
    map: MapLibreInstance,
    points: [number, number][],
    type: 'distance' | 'area'
  ) => {
    const source = map.getSource('terranova-measure-source') as GeoJSONSource;
    if (!source) return;

    if (points.length === 0) {
      source.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const features: any[] = [];
    points.forEach((p, idx) => {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: p },
        properties: { index: idx + 1 },
      });
    });

    if (type === 'distance' && points.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: points },
        properties: {},
      });
    } else if (type === 'area' && points.length >= 3) {
      features.push({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[...points, points[0]]] },
        properties: {},
      });
    }

    source.setData({ type: 'FeatureCollection', features });
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      {mapError && (
        <div className="absolute inset-0 bg-terranova-950/90 flex items-center justify-center p-6 text-center z-30">
          <div className="p-4 rounded-xl bg-terranova-900 border border-terranova-700 text-xs text-terranova-300 font-mono">
            {mapError}
          </div>
        </div>
      )}
    </div>
  );
};
