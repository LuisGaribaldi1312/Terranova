import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PropertyItem, IncidentItem, LayerItem } from '../types';
import { calculateGeodesicDistance, calculatePolygonArea } from './spatialMath';

type MapLibreInstance = maplibregl.Map;
type GeoJSONSource = maplibregl.GeoJSONSource;

export type BaseMapStyle = 'dark' | 'sat' | 'osm';
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
  center = [-98.2062, 19.0438], // Centro histórico de Puebla
  zoom = 13.5,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreInstance | null>(null);
  const [measurementPoints, setMeasurementPoints] = useState<[number, number][]>([]);

  // Estilos base de MapLibre (Estándar OGC y Teselas de alto contraste)
  const getStyleUrl = (style: BaseMapStyle) => {
    switch (style) {
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
        return 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
    }
  };

  // 1. Inicializar el mapa MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getStyleUrl(baseMap) as any,
      center,
      zoom,
      pitch: 35,
      bearing: -10,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      mapInstanceRef.current = map;
      setupLayers(map);
    });

    // Cleanup al desmontar
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Cambiar mapa base dinámicamente
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setStyle(getStyleUrl(baseMap) as any);
    map.once('style.load', () => {
      setupLayers(map);
    });
  }, [baseMap]);

  // 3. Manejo de Herramientas de Medición y Dibujo por click
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

  // Limpiar mediciones al cambiar de herramienta
  useEffect(() => {
    setMeasurementPoints([]);
    onMeasurementUpdate?.(null);
    const map = mapInstanceRef.current;
    if (map) {
      updateMeasurementLayer(map, [], 'distance');
    }
  }, [activeTool]);

  // Actualizar capa de medición
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

    // Puntos/Vértices
    points.forEach((p, idx) => {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: p },
        properties: { index: idx + 1 },
      });
    });

    // Línea o Polígono
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

  // Configurar fuentes y capas temáticas del municipio
  const setupLayers = (map: MapLibreInstance) => {
    // A. Capa de Predios Catastrales (GeoJSON Polígonos)
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

      // Relleno de predios por uso de suelo
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

    // B. Capa de Incidencias Urbanas (GeoJSON Puntos)
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

    // C. Capa Dinámica de Mediciones
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
      if (targetId && map.getLayer(targetId)) {
        map.setLayoutProperty(targetId, 'visibility', layer.active ? 'visible' : 'none');
      }
    });
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
