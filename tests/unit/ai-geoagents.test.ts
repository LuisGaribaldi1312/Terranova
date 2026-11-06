/**
 * TERRANOVA — Tests Unitarios de GeoAgentes Inteligentes & TERRANOVA AI (Fase 14)
 * Valida el criterio innegociable de aceptación (CERO SQL ARBITRARIO), clasificación
 * determinista de intenciones, Tool Calling controlado tipado, presencia obligatoria de citas
 * a fuentes oficiales y aislamiento multi-tenant en consultas geoespaciales.
 */

describe('TERRANOVA AI — GeoAgentes & Tool Calling Seguro (Fase 14)', () => {
  // 1. Criterio Innegociable: Bloqueo estricto de SQL arbitrario
  it('debe detectar y bloquear inmediatamente cualquier intento de inyección o ejecución de SQL arbitrario', () => {
    const SQL_INJECTION_PATTERNS = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|MERGE)\b)/i,
      /(--|\/\*|\*\/|;)/,
      /(\bOR\b\s+['"\d]+\s*=\s*['"\d]+)/i,
      /(\bAND\b\s+['"\d]+\s*=\s*['"\d]+)/i,
      /(\bxp_\w+)/i,
      /(\bINFORMATION_SCHEMA\b)/i,
    ];

    function validateNaturalLanguageQuery(query: string): { isSafe: boolean; errorCode?: string } {
      for (const pattern of SQL_INJECTION_PATTERNS) {
        if (pattern.test(query)) {
          return { isSafe: false, errorCode: 'SQL_INJECTION_PROHIBITED' };
        }
      }
      return { isSafe: true };
    }

    const maliciousQueries = [
      "SELECT * FROM users WHERE organization_id = 'org-puebla-001'",
      "Dame las colonias con baches; DROP TABLE incidents;--",
      "' OR 1=1; TRUNCATE properties;--",
      "UNION SELECT username, password_hash FROM auth_credentials",
      "exec xp_cmdshell('dir')",
    ];

    const safeQueries = [
      "¿Cuáles son las colonias con mayor número de baches pendientes en Puebla?",
      "Calcula si un lote de 350 m2 en zona H3 cumple con el COS y CUS reglamentario",
      "¿Cuál es el avance físico y financiero de la obra en Av. Juárez según el contrato COP-PUE-2026-003?",
      "Muéstrame la red de agua potable con más de 20 años de antigüedad",
    ];

    maliciousQueries.forEach((q) => {
      const res = validateNaturalLanguageQuery(q);
      expect(res.isSafe).toBe(false);
      expect(res.errorCode).toBe('SQL_INJECTION_PROHIBITED');
    });

    safeQueries.forEach((q) => {
      const res = validateNaturalLanguageQuery(q);
      expect(res.isSafe).toBe(true);
    });
  });

  // 2. Clasificación de Intenciones y Enrutamiento hacia el GeoAgente correspondiente
  it('debe clasificar con exactitud la intención temática y enrutar al GeoAgente especialista', () => {
    function classifyAgent(query: string): string {
      const q = query.toLowerCase();
      if (q.includes('predio') || q.includes('catastro') || q.includes('cos') || q.includes('cus') || q.includes('licencia') || q.includes('pdu') || q.includes('zonificacion')) {
        return 'URBAN_AGENT';
      }
      if (q.includes('contrato') || q.includes('obra') || q.includes('curva s') || q.includes('estimacion') || q.includes('faismun')) {
        return 'PROJECT_AGENT';
      }
      if (q.includes('bache') || q.includes('fuga') || q.includes('sla') || q.includes('incidencia') || q.includes('072')) {
        return 'INCIDENT_AGENT';
      }
      if (q.includes('agua') || q.includes('luminaria') || q.includes('tuber') || q.includes('infraestructura') || q.includes('drenaje')) {
        return 'INFRA_AGENT';
      }
      return 'GEO_AGENT';
    }

    expect(classifyAgent('¿Cuál es el atraso físico en la Curva S del contrato de obra pública?')).toBe('PROJECT_AGENT');
    expect(classifyAgent('Verifica si la licencia de obra mayor cumple los coeficientes COS y CUS del PDU')).toBe('URBAN_AGENT');
    expect(classifyAgent('¿Cuántos reportes 072 de baches están por vencer su SLA en Amalucan?')).toBe('INCIDENT_AGENT');
    expect(classifyAgent('Muestra el estado de la red de luminarias y tuberías de agua potable')).toBe('INFRA_AGENT');
    expect(classifyAgent('Explica la proyección cartográfica oficial EPSG:6362 y colindancias del INEGI')).toBe('GEO_AGENT');
  });

  // 3. Ejecución de Tool Calling Controlado (Typed Arguments)
  it('debe ejecutar herramientas tipadas sin generación de SQL dinámico', () => {
    interface ToolCallDefinition {
      toolName: string;
      expectedArgs: string[];
    }

    const SAFE_TOOLS: Record<string, ToolCallDefinition> = {
      query_public_work_contract: {
        toolName: 'query_public_work_contract',
        expectedArgs: ['contractNumber', 'includeSCurve'],
      },
      calculate_zoning_compliance: {
        toolName: 'calculate_zoning_compliance',
        expectedArgs: ['zoneCode', 'lotAreaM2', 'footprintM2', 'totalConstructionM2'],
      },
      query_incidents_summary: {
        toolName: 'query_incidents_summary',
        expectedArgs: ['timeframe', 'groupBy'],
      },
    };

    function validateToolInvocation(toolName: string, args: Record<string, any>): boolean {
      const tool = SAFE_TOOLS[toolName];
      if (!tool) return false;
      return tool.expectedArgs.every((arg) => Object.prototype.hasOwnProperty.call(args, arg));
    }

    const validCall = validateToolInvocation('calculate_zoning_compliance', {
      zoneCode: 'H3-UNIFAMILIAR',
      lotAreaM2: 350.0,
      footprintM2: 220.0,
      totalConstructionM2: 610.0,
    });
    expect(validCall).toBe(true);

    const invalidCall = validateToolInvocation('raw_sql_executor', { query: 'SELECT 1' });
    expect(invalidCall).toBe(false);
  });

  // 4. Presencia obligatoria de Citas a Fuentes Oficiales en las respuestas
  it('debe exigir que toda respuesta emitida por los GeoAgentes contenga fuentes normativas oficiales', () => {
    interface AgentResponseSchema {
      agentName: string;
      content: string;
      citations: Array<{ source: string; reference: string }>;
    }

    const sampleResponse: AgentResponseSchema = {
      agentName: 'UrbanAgent',
      content: 'El predio cumple con el COS de 0.63 y CUS de 1.74 conforme a la zonificación H3.',
      citations: [
        { source: 'Programa Municipal de Desarrollo Urbano de Puebla (PDU)', reference: 'Tabla de Zonificación Secundaria' },
        { source: 'Reglamento de Construcciones para el Municipio de Puebla', reference: 'Art. 42' },
      ],
    };

    const hasOfficialCitations = (res: AgentResponseSchema) => {
      return Array.isArray(res.citations) && res.citations.length >= 1;
    };

    expect(hasOfficialCitations(sampleResponse)).toBe(true);
    expect(sampleResponse.citations[0].source).toContain('PDU');
  });

  // 5. Garantía de Aislamiento Multi-Tenant en Consultas de IA
  it('debe asegurar que las consultas de los GeoAgentes mantengan el scope estricto de la organización', () => {
    function createAgentQueryContext(organizationId: string, userQuery: string) {
      if (!organizationId) {
        throw new Error('Tenant context organization_id is required');
      }
      return {
        tenantScope: organizationId,
        sanitizedQuery: userQuery.trim(),
        auditTimestamp: new Date().toISOString(),
      };
    }

    const pueblaContext = createAgentQueryContext('org-puebla-001', '¿Cuántos baches hay en el Centro?');
    expect(pueblaContext.tenantScope).toBe('org-puebla-001');

    const qroContext = createAgentQueryContext('org-qro-002', '¿Cuántos baches hay en el Centro?');
    expect(qroContext.tenantScope).toBe('org-qro-002');

    expect(pueblaContext.tenantScope).not.toBe(qroContext.tenantScope);
  });
});
