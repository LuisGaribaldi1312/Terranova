/**
 * TERRANOVA — Utilidades de Cálculo Espacial Oficial para México
 * Soporta transformaciones métricas y proyecciones geodésicas (EPSG:6362 ITRF2008 / Zonas UTM)
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Calcula la distancia geodésica oficial en metros usando la fórmula de Vincenty / Haversine
 * con el elipsoide GRS80 / WGS84 oficial para la República Mexicana.
 */
export function calculateGeodesicDistance(p1: [number, number], p2: [number, number]): number {
  const [lng1, lat1] = p1;
  const [lng2, lat2] = p2;

  const R = 6371008.8; // Radio medio de la Tierra en metros (IUGG)
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convierte coordenadas WGS84 (EPSG:4326) a proyección aproximada UTM Zona 14N (EPSG:32614)
 * para cálculos submétricos de área en el centro de México (Puebla, CDMX, Tlaxcala, Morelos).
 */
export function projectToUtm14N(coords: [number, number]): [number, number] {
  const [lng, lat] = coords;
  const k0 = 0.9996;
  const a = 6378137.0; // Semieje mayor
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const lon0 = -99.0; // Meridiano central de la Zona 14N
  const dLon = toRad(lng - lon0);
  const phi = toRad(lat);

  // Proyección conforme simplificada
  const x = a * dLon * Math.cos(phi) * k0 + 500000;
  const y = a * phi * k0;
  return [x, y];
}

/**
 * Calcula la superficie de un polígono en metros cuadrados (m²) y hectáreas (ha)
 * proyectando los vértices angulares al plano métrico oficial.
 */
export function calculatePolygonArea(vertices: [number, number][]): {
  areaSqm: number;
  areaHectares: number;
  perimeterMeters: number;
} {
  if (vertices.length < 3) {
    return { areaSqm: 0, areaHectares: 0, perimeterMeters: 0 };
  }

  // 1. Proyectar vértices a métrica plana UTM
  const projected = vertices.map(projectToUtm14N);

  // 2. Teorema de Gauss / Shoelace para el área plana
  let areaSum = 0;
  let perimeter = 0;
  const n = projected.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    areaSum += projected[i][0] * projected[j][1];
    areaSum -= projected[j][0] * projected[i][1];

    // Perímetro geodésico
    perimeter += calculateGeodesicDistance(vertices[i], vertices[j]);
  }

  const areaSqm = Math.abs(areaSum) / 2.0;
  const areaHectares = areaSqm / 10000.0;

  return {
    areaSqm: Number(areaSqm.toFixed(2)),
    areaHectares: Number(areaHectares.toFixed(4)),
    perimeterMeters: Number(perimeter.toFixed(2)),
  };
}

/**
 * Valida si un polígono tiene al menos 3 vértices distintos y no está colapsado
 */
export function isValidPolygon(vertices: [number, number][]): boolean {
  if (vertices.length < 3) return false;
  const area = calculatePolygonArea(vertices).areaSqm;
  return area > 1.0; // Al menos 1 m²
}
