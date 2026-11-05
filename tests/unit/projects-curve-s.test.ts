/**
 * TERRANOVA — Tests Unitarios de Obras Públicas, Curva S y Estimaciones (Fase 10)
 * Valida el cálculo de estimaciones (amortización de anticipo 30% y retención 5 al millar),
 * serie de Curva S con detección de atraso contractual y claves de obra pública en México.
 */

describe('Obras Públicas, Curva S & Estimaciones (Fase 10)', () => {
  // 1. Cálculo de Estimaciones de Obra Pública (Ley de Obras Públicas y Servicios Relacionados)
  it('debe calcular con precisión la amortización de anticipo (30%) y la retención del 5 al millar (0.5%)', () => {
    const grossAmount = 7275000.00; // Monto bruto de la estimación #1
    const advanceRate = 0.30;       // 30% de amortización de anticipo
    const retentionRate = 0.005;    // 5 al millar (0.5%) para supervisión y garantía

    const advanceAmortization = Number((grossAmount * advanceRate).toFixed(2));
    const guaranteeRetention = Number((grossAmount * retentionRate).toFixed(2));
    const netPayable = Number((grossAmount - advanceAmortization - guaranteeRetention).toFixed(2));

    expect(advanceAmortization).toBe(2182500.00);
    expect(guaranteeRetention).toBe(36375.00);
    expect(netPayable).toBe(5056125.00);
  });

  // 2. Acumulación financiera y verificación de presupuesto ejercido
  it('debe acumular correctamente el importe de estimaciones liquidadas contra el presupuesto asignado', () => {
    const budgetAllocated = 48500000.00;
    const estimations = [
      { num: 1, gross: 7275000.00, status: 'PAID' },
      { num: 2, gross: 9700000.00, status: 'PAID' },
      { num: 3, gross: 11640000.00, status: 'PAID' },
      { num: 4, gross: 7275000.00, status: 'APPROVED_TREASURY' }, // Aún no pagada
    ];

    const exercisedTotal = estimations
      .filter((e) => e.status === 'PAID')
      .reduce((acc, e) => acc + e.gross, 0);

    const pendingTotal = budgetAllocated - exercisedTotal;
    const executionPercentage = Number(((exercisedTotal / budgetAllocated) * 100).toFixed(1));

    expect(exercisedTotal).toBe(28615000.00);
    expect(pendingTotal).toBe(19885000.00);
    expect(executionPercentage).toBe(59.0);
  });

  // 3. Evaluación matemática de Curva S y detección de atraso de obra
  it('debe detectar desviaciones y atrasos en la Curva S comparando avance programado vs avance real', () => {
    interface SCurvePoint {
      month: string;
      planned: number;
      real: number;
    }

    const sCurveSerie: SCurvePoint[] = [
      { month: 'Ene 2026', planned: 12.0, real: 14.0 }, // +2% adelantada
      { month: 'Feb 2026', planned: 28.0, real: 30.0 }, // +2% adelantada
      { month: 'Mar 2026', planned: 48.0, real: 50.0 }, // +2% adelantada
      { month: 'Abr 2026', planned: 65.0, real: 66.0 }, // +1% adelantada
      { month: 'May 2026', planned: 78.0, real: 74.0 }, // -4% con atraso
    ];

    const evaluateDelay = (pt: SCurvePoint): { isDelayed: boolean; deviation: number } => {
      const deviation = Number((pt.real - pt.planned).toFixed(1));
      return {
        isDelayed: deviation < 0,
        deviation,
      };
    };

    const statusEne = evaluateDelay(sCurveSerie[0]);
    expect(statusEne.isDelayed).toBe(false);
    expect(statusEne.deviation).toBe(2.0);

    const statusMay = evaluateDelay(sCurveSerie[4]);
    expect(statusMay.isDelayed).toBe(true);
    expect(statusMay.deviation).toBe(-4.0); // 4% de atraso respecto al programa de obra
  });

  // 4. Formato oficial mexicano de contratos de obra pública municipal
  it('debe validar claves oficiales de contrato conforme a la normatividad municipal', () => {
    // Formato oficial: COP-MUN-YYYY-XXX (Contrato de Obra Pública)
    const CONTRACT_NUMBER_REGEX = /^COP-[A-Z]{3,4}-[0-9]{4}-[0-9]{3,4}$/;

    const validContract1 = 'COP-PUE-2026-004';
    const validContract2 = 'COP-MTY-2026-015';
    const invalidContract = 'OBRA-2026-1';

    expect(CONTRACT_NUMBER_REGEX.test(validContract1)).toBe(true);
    expect(CONTRACT_NUMBER_REGEX.test(validContract2)).toBe(true);
    expect(CONTRACT_NUMBER_REGEX.test(invalidContract)).toBe(false);
  });

  // 5. Validación de fuentes de financiamiento federal y municipal
  it('debe catalogar correctamente las fuentes de financiamiento federales y locales autorizadas', () => {
    const validFunds = ['FAISMUN', 'FORTAMUN', 'Recursos Propios', 'Participaciones Federales'];

    const testProject = {
      code: 'OP-PUE-2026-001',
      fundingSource: 'FAISMUN',
      budget: 48500000,
    };

    expect(validFunds.includes(testProject.fundingSource)).toBe(true);
  });
});
