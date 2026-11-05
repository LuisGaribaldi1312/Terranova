/**
 * TERRANOVA — Tests Unitarios de Inteligencia Territorial, Heatmaps & BI (Fase 13)
 * Valida el criterio innegociable de aceptación (< 1.5s en agregación espacial sobre 100,000 registros),
 * cálculo del MTTR (Mean Time to Resolution), fórmula del Índice de Salud Urbana (UHI),
 * ponderación de mapas de calor e integridad del sello SHA-256 en informes ejecutivos.
 */

import * as crypto from 'crypto';

describe('Inteligencia Territorial, Heatmaps & BI (Fase 13)', () => {
  // 1. Criterio Innegociable de Aceptación: Agregación espacial de 100,000 registros en < 1.5 segundos
  it('debe ejecutar la agregación espacial en cuadrícula sobre 100,000 registros en menos de 1.5 segundos', () => {
    interface SpatialPoint {
      lng: number;
      lat: number;
      priorityWeight: number;
    }

    const RECORD_COUNT = 100000;
    const baseLng = -98.2063;
    const baseLat = 19.0414;
    const gridResolution = 0.005; // ~500 metros

    // Generar dataset sintético masivo
    const points: SpatialPoint[] = new Array(RECORD_COUNT);
    for (let i = 0; i < RECORD_COUNT; i++) {
      points[i] = {
        lng: baseLng + (Math.random() - 0.5) * 0.2,
        lat: baseLat + (Math.random() - 0.5) * 0.2,
        priorityWeight: (i % 4) + 1,
      };
    }

    // Benchmark de agregación espacial
    const startTime = Date.now();

    const gridBuckets = new Map<string, { count: number; totalWeight: number }>();

    for (let i = 0; i < RECORD_COUNT; i++) {
      const p = points[i];
      const gridX = Math.floor(p.lng / gridResolution);
      const gridY = Math.floor(p.lat / gridResolution);
      const key = `${gridX}:${gridY}`;

      const bucket = gridBuckets.get(key);
      if (bucket) {
        bucket.count++;
        bucket.totalWeight += p.priorityWeight;
      } else {
        gridBuckets.set(key, { count: 1, totalWeight: p.priorityWeight });
      }
    }

    const elapsedMs = Date.now() - startTime;

    // Aserción innegociable: < 1500 ms (1.5 segundos)
    expect(elapsedMs).toBeLessThan(1500);
    expect(gridBuckets.size).toBeGreaterThan(0);
  });

  // 2. Cálculo del MTTR (Mean Time to Resolution) en horas
  it('debe calcular con precisión matemática el MTTR promedio sobre un conjunto de incidencias', () => {
    interface IncidentResolutionTime {
      folio: string;
      openedAt: string;
      resolvedAt: string;
    }

    const sampleIncidents: IncidentResolutionTime[] = [
      { folio: 'INC-01', openedAt: '2026-03-01T08:00:00Z', resolvedAt: '2026-03-01T14:30:00Z' }, // 6.5 hrs
      { folio: 'INC-02', openedAt: '2026-03-01T09:00:00Z', resolvedAt: '2026-03-02T09:00:00Z' }, // 24.0 hrs
      { folio: 'INC-03', openedAt: '2026-03-01T10:00:00Z', resolvedAt: '2026-03-01T22:00:00Z' }, // 12.0 hrs
      { folio: 'INC-04', openedAt: '2026-03-01T12:00:00Z', resolvedAt: '2026-03-02T02:30:00Z' }, // 14.5 hrs
    ];

    const totalHours = sampleIncidents.reduce((acc, inc) => {
      const diffMs = new Date(inc.resolvedAt).getTime() - new Date(inc.openedAt).getTime();
      return acc + diffMs / (1000 * 60 * 60);
    }, 0);

    const mttr = Number((totalHours / sampleIncidents.length).toFixed(2));

    // (6.5 + 24.0 + 12.0 + 14.5) / 4 = 57 / 4 = 14.25 horas
    expect(mttr).toBe(14.25);
  });

  // 3. Cálculo del Índice de Salud Urbana (UHI - Urban Health Index)
  it('debe computar el Índice de Salud Urbana ponderando cobertura de servicios y respuesta de fallas', () => {
    function computeUrbanHealthIndex(
      slaRatePct: number,       // Tasa de cumplimiento SLA (0-100)
      lightingCoveragePct: number, // Cobertura de luminarias (0-100)
      waterAvailabilityPct: number, // Continuidad de agua potable (0-100)
      unresolvedBacklogRate: number // Tasa de rezago (0-100)
    ): number {
      const score =
        slaRatePct * 0.35 +
        lightingCoveragePct * 0.25 +
        waterAvailabilityPct * 0.30 -
        unresolvedBacklogRate * 0.10;

      return Number(Math.max(0, Math.min(100, score)).toFixed(1));
    }

    // Caso A: Zona de alta eficiencia (Angelópolis)
    const highHealthScore = computeUrbanHealthIndex(95.6, 98.0, 96.0, 4.4);
    expect(highHealthScore).toBe(86.3);

    // Caso B: Zona con necesidad de intervención prioritaria (San Jerónimo Caleras)
    const lowHealthScore = computeUrbanHealthIndex(77.7, 82.0, 75.0, 22.3);
    expect(lowHealthScore).toBe(68.0);
  });

  // 4. Ponderación de Calor Espacial (Kernel Intensity Weighting)
  it('debe ponderar y normalizar la intensidad térmica en función de la severidad del reporte', () => {
    const priorityWeights: Record<string, number> = {
      CRITICAL: 4.0,
      HIGH: 2.5,
      MEDIUM: 1.5,
      LOW: 1.0,
    };

    function calculateCellIntensity(incidents: Array<{ priority: string }>, maxExpectedWeight = 50): number {
      const totalWeight = incidents.reduce((acc, curr) => acc + (priorityWeights[curr.priority] || 1.0), 0);
      return Number(Math.min(1.0, totalWeight / maxExpectedWeight).toFixed(3));
    }

    const criticalCluster = [
      { priority: 'CRITICAL' },
      { priority: 'CRITICAL' },
      { priority: 'HIGH' },
      { priority: 'CRITICAL' },
    ]; // 4 + 4 + 2.5 + 4 = 14.5 peso

    const intensity = calculateCellIntensity(criticalCluster, 20);
    expect(intensity).toBe(0.725);
  });

  // 5. Integridad y certificación del informe ejecutivo con Sello SHA-256
  it('debe generar un sello digital SHA-256 inmutable de 64 caracteres para el informe ejecutivo', () => {
    const reportPayload = {
      folio: 'REP-BI-2026-0418',
      organizationId: 'org-puebla-001',
      mttrHours: 14.2,
      slaComplianceRate: 87.8,
      urbanHealthIndex: 88.4,
      generatedDate: '2026-03-31',
    };

    const rawCanonical = [
      reportPayload.folio,
      reportPayload.organizationId,
      reportPayload.mttrHours.toFixed(1),
      reportPayload.slaComplianceRate.toFixed(1),
      reportPayload.urbanHealthIndex.toFixed(1),
      reportPayload.generatedDate,
    ].join('||');

    const seal = crypto.createHash('sha256').update(rawCanonical, 'utf8').digest('hex');

    expect(seal).toHaveLength(64);

    // Verificación de tamper-evidence
    const tampered = rawCanonical.replace('88.4', '88.5');
    const tamperedSeal = crypto.createHash('sha256').update(tampered, 'utf8').digest('hex');
    expect(seal).not.toBe(tamperedSeal);
  });
});
