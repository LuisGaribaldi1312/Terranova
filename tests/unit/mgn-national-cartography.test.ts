/**
 * TERRANOVA — Tests Unitarios de Cartografía Nacional INEGI MGN
 * Valida el seccionamiento territorial de los 32 Estados, Municipios y Localidades de México,
 * integridad de claves oficiales (cve_ent, cve_mun, cve_loc, cve_geo) y generación de GeoJSON.
 */

import {
  MEXICAN_STATES,
  MEXICAN_MUNICIPALITIES,
  MEXICAN_LOCALITIES,
  getMexicanStatesGeoJSON,
  getMexicanMunicipalitiesGeoJSON,
  getMexicanLocalitiesGeoJSON,
} from '../../apps/web/src/maps/mexicoGeoData';

describe('Cartografía Nacional INEGI MGN (32 Estados, Municipios y Localidades)', () => {
  // 1. Integridad de los 32 Estados de la República Mexicana
  it('debe contener exactamente las 32 entidades federativas oficiales de México con claves cve_ent del 01 al 32', () => {
    expect(MEXICAN_STATES.length).toBe(32);

    const cveSet = new Set<string>();
    for (let i = 1; i <= 32; i++) {
      const expectedCve = i < 10 ? `0${i}` : `${i}`;
      const state = MEXICAN_STATES.find((s) => s.cve_ent === expectedCve);

      expect(state).toBeDefined();
      expect(state?.cve_ent).toBe(expectedCve);
      expect(state?.polygon.length).toBeGreaterThan(4); // Polígono perimetral cerrado
      cveSet.add(expectedCve);
    }

    expect(cveSet.size).toBe(32);
  });

  // 2. Bounding Box Nacional de México
  it('debe certificar que las coordenadas de todos los estados pertenezcan al ámbito geográfico de los Estados Unidos Mexicanos', () => {
    // Límites de México: Longitud [-118.5, -86.5], Latitud [14.5, 32.8]
    for (const state of MEXICAN_STATES) {
      const [lng, lat] = state.center;
      expect(lng).toBeGreaterThan(-119.0);
      expect(lng).toBeLessThan(-85.0);
      expect(lat).toBeGreaterThan(14.0);
      expect(lat).toBeLessThan(33.0);
    }
  });

  // 3. Estructura Jerárquica de Municipios (MGN)
  it('debe validar la estructura de clave cve_geo de 5 dígitos (cve_ent + cve_mun) en los municipios', () => {
    expect(MEXICAN_MUNICIPALITIES.length).toBeGreaterThan(10);

    for (const mun of MEXICAN_MUNICIPALITIES) {
      expect(mun.cve_geo).toBe(`${mun.cve_ent}${mun.cve_mun}`);
      expect(mun.cve_ent.length).toBe(2);
      expect(mun.cve_mun.length).toBe(3);
      expect(mun.polygon.length).toBeGreaterThan(4);
      expect(mun.population).toBeGreaterThan(0);
    }
  });

  // 4. Estructura de Localidades Urbanas y Rurales (INEGI cve_loc)
  it('debe estructurar claves cve_geo de 9 dígitos (cve_ent + cve_mun + cve_loc) para localidades', () => {
    expect(MEXICAN_LOCALITIES.length).toBeGreaterThan(10);

    for (const loc of MEXICAN_LOCALITIES) {
      expect(loc.cve_geo).toBe(`${loc.cve_ent}${loc.cve_mun}${loc.cve_loc}`);
      expect(loc.cve_loc.length).toBe(4);
      expect(loc.type === 'URBANA' || loc.type === 'RURAL').toBe(true);
      expect(loc.population).toBeGreaterThan(0);
    }
  });

  // 5. Generadores GeoJSON para MapLibre GL JS
  it('debe generar FeatureCollections GeoJSON válidas para estados, municipios y localidades', () => {
    const statesGeoJSON = getMexicanStatesGeoJSON();
    expect(statesGeoJSON.type).toBe('FeatureCollection');
    expect(statesGeoJSON.features.length).toBe(32);
    expect(statesGeoJSON.features[0].geometry.type).toBe('Polygon');

    const munGeoJSON = getMexicanMunicipalitiesGeoJSON('21'); // Municipios de Puebla
    expect(munGeoJSON.type).toBe('FeatureCollection');
    expect(munGeoJSON.features.length).toBeGreaterThan(0);
    expect(munGeoJSON.features.every((f) => f.properties.cve_ent === '21')).toBe(true);

    const locGeoJSON = getMexicanLocalitiesGeoJSON('21', '114'); // Localidades de Puebla municipio
    expect(locGeoJSON.type).toBe('FeatureCollection');
    expect(locGeoJSON.features.length).toBeGreaterThan(0);
    expect(locGeoJSON.features[0].geometry.type).toBe('Point');
  });

  // 6. Cobertura Total de los 32 Estados en Municipios y Localidades
  it('debe certificar que absolutamente los 32 estados de la República cuenten con municipios y localidades oficiales', () => {
    for (let i = 1; i <= 32; i++) {
      const cveEnt = i < 10 ? `0${i}` : `${i}`;
      const stateMuns = MEXICAN_MUNICIPALITIES.filter((m) => m.cve_ent === cveEnt);
      expect(stateMuns.length).toBeGreaterThan(0);

      for (const mun of stateMuns) {
        const munLocs = MEXICAN_LOCALITIES.filter((l) => l.cve_ent === cveEnt && l.cve_mun === mun.cve_mun);
        expect(munLocs.length).toBeGreaterThan(0);
      }
    }
  });
});
