/**
 * TERRANOVA — Tests Unitarios de Cálculo Espacial Oficial (Fase 5)
 * Valida proyecciones geodésicas, distancia Vincenty/Haversine y cálculo Shoelace/Gauss.
 */

import { calculateGeodesicDistance, calculatePolygonArea, isValidPolygon } from '../../apps/web/src/maps/spatialMath';

describe('Spatial Math & Geodesics (EPSG:6362 / UTM 14N)', () => {
  it('debe calcular la distancia geodésica entre dos puntos de referencia en Puebla', () => {
    // Zócalo de Puebla a Parque Ecológico (~3.2 km)
    const zocalo: [number, number] = [-98.1979, 19.0433];
    const parque: [number, number] = [-98.1725, 19.0345];

    const dist = calculateGeodesicDistance(zocalo, parque);
    expect(dist).toBeGreaterThan(2500);
    expect(dist).toBeLessThan(3500);
  });

  it('debe calcular correctamente el área de un polígono cuadrangular', () => {
    // Polígono de 4 vértices
    const vertices: [number, number][] = [
      [-98.2000, 19.0400],
      [-98.1990, 19.0400],
      [-98.1990, 19.0410],
      [-98.2000, 19.0410],
    ];

    const result = calculatePolygonArea(vertices);
    expect(result.areaSqm).toBeGreaterThan(5000);
    expect(result.areaHectares).toBeGreaterThan(0.5);
    expect(result.perimeterMeters).toBeGreaterThan(200);
  });

  it('debe validar si un polígono es geométricamente válido', () => {
    const invalid: [number, number][] = [
      [-98.2000, 19.0400],
      [-98.2000, 19.0400],
    ];
    expect(isValidPolygon(invalid)).toBe(false);

    const valid: [number, number][] = [
      [-98.2000, 19.0400],
      [-98.1990, 19.0400],
      [-98.1990, 19.0410],
    ];
    expect(isValidPolygon(valid)).toBe(true);
  });
});
