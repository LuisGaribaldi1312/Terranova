/**
 * TERRANOVA — Tests Unitarios de Infraestructura Urbana y Ciclo de Vida de Activos (Fase 07)
 * Valida inventario de redes, cálculo de depreciación, vida útil remanente y bitácora.
 */

describe('Infraestructura Urbana & Ciclo de Vida (Fase 07)', () => {
  const ASSET_CODE_REGEX = /^INF-[A-Z]{3}-[A-Z]{3}-[0-9]{5}$/;

  it('debe validar códigos de activo estandarizados para redes municipales', () => {
    expect(ASSET_CODE_REGEX.test('INF-AGU-VAL-00412')).toBe(true);
    expect(ASSET_CODE_REGEX.test('INF-ALU-LUM-00891')).toBe(true);
    expect(ASSET_CODE_REGEX.test('INF-DRE-POZ-00125')).toBe(true);
    expect(ASSET_CODE_REGEX.test('INF-VIA-SEM-00340')).toBe(true);
    expect(ASSET_CODE_REGEX.test('INF-TEL-FIB-00018')).toBe(true);

    expect(ASSET_CODE_REGEX.test('INVALID-CODE')).toBe(false);
  });

  it('debe calcular correctamente la depreciación y vida útil remanente del activo', () => {
    const installYear = 2020;
    const currentYear = 2026;
    const expectedLifespanYears = 20;

    const ageYears = currentYear - installYear; // 6 años
    const remainingYears = Math.max(0, expectedLifespanYears - ageYears); // 14 años
    const depreciationPct = Number(((ageYears / expectedLifespanYears) * 100).toFixed(1)); // 30%

    expect(ageYears).toBe(6);
    expect(remainingYears).toBe(14);
    expect(depreciationPct).toBe(30.0);
  });

  it('debe acumular correctamente los costos de mantenimiento preventivo y correctivo', () => {
    let accumulatedMaintCost = 12400;
    const newInterventionCost = 4850;

    accumulatedMaintCost += newInterventionCost;
    expect(accumulatedMaintCost).toBe(17250);

    const costInstallation = 68500;
    const maintenanceRatio = Number(((accumulatedMaintCost / costInstallation) * 100).toFixed(1));
    expect(maintenanceRatio).toBe(25.2); // 25.2% del costo original de instalación
  });
});
