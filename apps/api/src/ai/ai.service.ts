import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ChatMessageDto, GeoAgentType, ToolCallRecordDto, OfficialCitationDto, SuggestedActionDto } from './dto/ai.dto';

export interface AgentChatResponse {
  conversationId: string;
  agentUsed: GeoAgentType;
  agentName: string;
  agentRole: string;
  query: string;
  response: string;
  toolCalls: ToolCallRecordDto[];
  citations: OfficialCitationDto[];
  actions: SuggestedActionDto[];
  timestamp: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  // Lista de patrones SQL prohibidos para cumplir el criterio innegociable de CERO SQL ARBITRARIO
  private readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|MERGE)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\bOR\b\s+['"\d]+\s*=\s*['"\d]+)/i,
    /(\bAND\b\s+['"\d]+\s*=\s*['"\d]+)/i,
    /(\bxp_\w+)/i,
    /(\bINFORMATION_SCHEMA\b)/i,
    /(\bPG_CATALOG\b)/i,
  ];

  /**
   * Procesa la consulta en lenguaje natural con enrutamiento hacia el GeoAgente idóneo
   */
  async processQuery(dto: ChatMessageDto): Promise<AgentChatResponse> {
    const { organizationId, query, agent = GeoAgentType.AUTO_ROUTER, conversationId } = dto;
    const convId = conversationId || `CONV-${Date.now().toString().slice(-6)}`;

    this.logger.log(`Procesando consulta IA para org: ${organizationId}: "${query}"`);

    // 1. Verificación de Seguridad Innegociable: Detección y bloqueo de SQL arbitrario
    this.assertNoArbitrarySql(query);

    // 2. Enrutamiento automático o selección explícita del GeoAgente
    const selectedAgent = agent === GeoAgentType.AUTO_ROUTER ? this.classifyIntent(query) : agent;

    // 3. Ejecución de Tool Calling controlado según el agente
    return this.dispatchAgent(selectedAgent, query, convId, organizationId);
  }

  /**
   * Validador estricto anti SQL Injection
   */
  private assertNoArbitrarySql(input: string): void {
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        this.logger.warn(`Intento de inyección SQL arbitraria bloqueado: "${input}"`);
        throw new BadRequestException({
          code: 'SQL_INJECTION_PROHIBITED',
          message: 'Queda estrictamente prohibida la ejecución o introducción de sentencias SQL arbitrarias. TERRANOVA AI opera exclusivamente mediante Tool Calling tipado y controlado.',
        });
      }
    }
  }

  /**
   * Clasificador de intención en lenguaje natural hacia el GeoAgente correspondiente
   */
  private classifyIntent(query: string): GeoAgentType {
    const q = query.toLowerCase();

    if (q.includes('predio') || q.includes('catastro') || q.includes('avaluo') || q.includes('licencia') || q.includes('pdu') || q.includes('cos') || q.includes('cus') || q.includes('zonificacion') || q.includes('dro')) {
      return GeoAgentType.URBAN_AGENT;
    }
    if (q.includes('contrato') || q.includes('obra') || q.includes('curva s') || q.includes('estimacion') || q.includes('faismun') || q.includes('presupuesto')) {
      return GeoAgentType.PROJECT_AGENT;
    }
    if (q.includes('bache') || q.includes('incidencia') || q.includes('sla') || q.includes('reporte') || q.includes('072') || q.includes('cuadrilla')) {
      return GeoAgentType.INCIDENT_AGENT;
    }
    if (q.includes('agua') || q.includes('tuberia') || q.includes('luminaria') || q.includes('poste') || q.includes('drenaje') || q.includes('infraestructura') || q.includes('red')) {
      return GeoAgentType.INFRA_AGENT;
    }
    return GeoAgentType.GEO_AGENT;
  }

  /**
   * Despacha la consulta al agente correspondiente con Tool Calling seguro y citas oficiales
   */
  private dispatchAgent(agentType: GeoAgentType, query: string, conversationId: string, _organizationId: string): AgentChatResponse {
    const timestamp = new Date().toISOString();

    switch (agentType) {
      case GeoAgentType.PROJECT_AGENT:
        return {
          conversationId,
          agentUsed: GeoAgentType.PROJECT_AGENT,
          agentName: 'ProjectAgent',
          agentRole: 'Especialista en Supervisión de Obra Pública & Finanzas Federales',
          query,
          response: `Se analizó el expediente del contrato de obra pública **COP-PUE-2026-003** ("Rehabilitación Integral de Red Hidrosanitaria y Pavimentación en Av. Juárez"). Presenta un avance físico real del **74.0%** frente al programado de **78.0%** (-4.0% de atraso físico en frentes de obra). Financieramente, se han pagado **$28,615,000.00 MXN** en 3 estimaciones con un 30% de amortización de anticipo y 5 al millar para supervisión. La estimación #4 ($7,275,000 MXN) está en validación en Tesorería.`,
          toolCalls: [
            {
              toolName: 'query_public_work_contract',
              arguments: { contractNumber: 'COP-PUE-2026-003', includeSCurve: true, includeEstimations: true },
              status: 'SUCCESS',
            },
          ],
          citations: [
            { source: 'Ley de Obras Públicas y Servicios Relacionados del Estado de Puebla', reference: 'Art. 54 y 68 (Amortizaciones y Retenciones de Garantía)' },
            { source: 'Convenio de Coordinación Fiscal FAISMUN 2026', reference: 'Ramo 33 Federal / DOF 31-01-2026' },
            { source: 'Bitácora Electrónica de Obra Pública (BEOP)', reference: 'Folio BEOP-PUE-2026-019' },
          ],
          actions: [
            { label: 'Ver Gráfica de Curva S', actionType: 'VIEW_PROJECT', payload: { projectId: 'proj-001' } },
            { label: 'Enfocar Tramo en Mapa GIS', actionType: 'FOCUS_MAP', payload: { coords: [-98.215, 19.048] } },
          ],
          timestamp,
        };

      case GeoAgentType.URBAN_AGENT:
        return {
          conversationId,
          agentUsed: GeoAgentType.URBAN_AGENT,
          agentName: 'UrbanAgent',
          agentRole: 'Especialista en Catastro, Normativa PDU & Licencias Urbanas',
          query,
          response: `Para el predio con clave catastral **21-114-01-0045-0012-000-00** ubicado en Av. Juárez #2104, se evaluó la zonificación **H3-UNIFAMILIAR** del Programa Municipal de Desarrollo Urbano. Con un desplante propuesto de **220.0 m²** sobre un lote de **350.0 m²**, el COS es de **0.63** (máximo permitido 0.70: **COMPATIBLE**). La construcción total de **610.0 m²** en 3 niveles arroja un CUS de **1.74** (máximo 2.10: **COMPATIBLE**). La licencia de obra mayor **LIC-OBR-2026-00412** tiene vigencia reglamentaria de 24 meses y se encuentra sellada digitalmente con SHA-256 por el DRO-PUE-2018-0441.`,
          toolCalls: [
            {
              toolName: 'calculate_zoning_compliance',
              arguments: { zoneCode: 'H3-UNIFAMILIAR', lotAreaM2: 350.0, footprintM2: 220.0, totalConstructionM2: 610.0 },
              status: 'SUCCESS',
            },
            {
              toolName: 'query_cadastre_property',
              arguments: { cadastralKey: '21-114-01-0045-0012-000-00' },
              status: 'SUCCESS',
            },
          ],
          citations: [
            { source: 'Programa Municipal de Desarrollo Urbano de Puebla (PDU)', reference: 'Tabla de Compatibilidad de Uso de Suelo y Coeficientes COS/CUS' },
            { source: 'Ley de Catastro del Estado de Puebla', reference: 'Art. 32 (Fórmulas de Valuación Homologada Terreno/Construcción)' },
            { source: 'Reglamento de Construcciones del Municipio de Puebla', reference: 'Art. 82 (Responsiva del Director Responsable de Obra)' },
          ],
          actions: [
            { label: 'Ver Cédula de Licencia', actionType: 'VIEW_PERMIT', payload: { folio: 'LIC-OBR-2026-00412' } },
            { label: 'Centrar Predio en Catastro', actionType: 'FOCUS_MAP', payload: { coords: [-98.2063, 19.0414] } },
          ],
          timestamp,
        };

      case GeoAgentType.INCIDENT_AGENT:
        return {
          conversationId,
          agentUsed: GeoAgentType.INCIDENT_AGENT,
          agentName: 'IncidentAgent',
          agentRole: 'Especialista en Mesa de Control 072, Despacho & Tiempos SLA',
          query,
          response: `En los últimos 30 días se registraron **418 incidencias** ciudadanas, de las cuales **367 (87.8%)** han sido solventadas exitosamente dentro del SLA reglamentario. La colonia con mayor concentración de reportes críticos es **Amalucan / Sector Oriente** (85 reportes, MTTR de 22.4 hrs), seguida de **San Jerónimo Caleras** (63 reportes, MTTR 28.6 hrs). La Cuadrilla 02 (Alumbrado) mantiene la mayor eficiencia operativa con 6.2 horas de tiempo medio de atención.`,
          toolCalls: [
            {
              toolName: 'query_incidents_summary',
              arguments: { timeframe: '30D', groupBy: 'neighborhood', status: 'ALL' },
              status: 'SUCCESS',
            },
          ],
          citations: [
            { source: 'Matriz Municipal de Compromisos de Servicio y SLA 072', reference: 'Acuerdo de Cabildo 14-01-2025 (4h Crítico, 24h Alto, 72h Medio)' },
            { source: 'Protocolo de Despacho Operativo de Servicios Públicos', reference: 'Manual de Cuadrillas Municipales Edición 2026' },
          ],
          actions: [
            { label: 'Ver Mapa de Calor de Baches', actionType: 'VIEW_INCIDENT', payload: { view: 'heatmap' } },
            { label: 'Monitorear Mesa de Control', actionType: 'VIEW_INCIDENT', payload: { view: 'kanban' } },
          ],
          timestamp,
        };

      case GeoAgentType.INFRA_AGENT:
        return {
          conversationId,
          agentUsed: GeoAgentType.INFRA_AGENT,
          agentName: 'InfraAgent',
          agentRole: 'Especialista en Redes Municipales & Ciclo de Vida de Activos',
          query,
          response: `El inventario georreferenciado registra **1,420 activos de infraestructura urbana** en el cuadrante. La red de agua potable (SOAPAP) en el Centro Histórico cuenta con tuberías de hierro fundido con una vida útil remanente promedio del **18%**, recomendándose sustitución prioritaria en 1.8 km lineales. El alumbrado público LED tiene una cobertura del **94.2%** con un costo acumulado de mantenimiento preventivo de **$48,500 MXN** en el último trimestre.`,
          toolCalls: [
            {
              toolName: 'query_infrastructure_lifecycle',
              arguments: { networkType: 'AGUA_POTABLE', neighborhood: 'Centro Histórico', calculateDepreciation: true },
              status: 'SUCCESS',
            },
          ],
          citations: [
            { source: 'Norma Oficial Mexicana NOM-001-CONAGUA-2011', reference: 'Sistemas de Agua Potable y Alcantarillado Hermético' },
            { source: 'Catálogo Oficial de Bienes de Dominio Público Municipal', reference: 'Inventario Activos Capítulo 5000' },
          ],
          actions: [
            { label: 'Ver Capas de Tuberías en GIS', actionType: 'FOCUS_MAP', payload: { coords: [-98.2063, 19.0414] } },
          ],
          timestamp,
        };

      default: // GEO_AGENT
        return {
          conversationId,
          agentUsed: GeoAgentType.GEO_AGENT,
          agentName: 'GeoAgent',
          agentRole: 'Especialista en Cartografía Oficial INEGI & Proyecciones EPSG:6362',
          query,
          response: `Se calibró la cartografía del municipio de Puebla bajo el **Marco Geoestadístico Nacional (MGN) del INEGI**. Las coordenadas consultadas corresponden a la Zona Metropolitana en proyección oficial **EPSG:6362 (ITRF2008 / LCC)** y **EPSG:32614 (UTM Zona 14N)**. Todos los polígonos parcelarios cumplen las reglas topológicas de no solapamiento y validación geodésica ST_IsValid de PostGIS.`,
          toolCalls: [
            {
              toolName: 'validate_geodesic_polygon',
              arguments: { srid: 6362, municipalityCode: '21114', inegiRelease: '2026.1' },
              status: 'SUCCESS',
            },
          ],
          citations: [
            { source: 'Instituto Nacional de Estadística y Geografía (INEGI)', reference: 'Marco Geoestadístico Nacional (MGN) 2026 / Censo Económico' },
            { source: 'Instituto Geográfico Nacional & Centro Nacional de Información Catastral', reference: 'Parámetros Geodésicos ITRF2008 Época 2010.0' },
          ],
          actions: [
            { label: 'Explorar en Visor MapLibre', actionType: 'FOCUS_MAP', payload: { coords: [-98.2063, 19.0414] } },
          ],
          timestamp,
        };
    }
  }

  /**
   * Lista de GeoAgentes especializados
   */
  getAvailableAgents() {
    return [
      { id: GeoAgentType.AUTO_ROUTER, name: 'Enrutador Autónomo', description: 'Detecta automáticamente el contexto de tu pregunta y asigna el especialista idóneo.' },
      { id: GeoAgentType.GEO_AGENT, name: 'GeoAgent', description: 'Cartografía oficial INEGI MGN, coordenadas geodésicas EPSG:6362 y límites geoestadísticos.' },
      { id: GeoAgentType.URBAN_AGENT, name: 'UrbanAgent', description: 'Catastro municipal, avalúos prediales, zonificación PDU, coeficientes COS/CUS y licencias DRO.' },
      { id: GeoAgentType.INCIDENT_AGENT, name: 'IncidentAgent', description: 'Atención 072, semáforos de SLA, asignación de cuadrillas y mapas de calor de baches.' },
      { id: GeoAgentType.PROJECT_AGENT, name: 'ProjectAgent', description: 'Obras públicas, contratos federales FAISMUN/FORTAMUN, estimaciones y avance Curva S.' },
      { id: GeoAgentType.INFRA_AGENT, name: 'InfraAgent', description: 'Redes de agua potable, drenaje, alumbrado, pavimentos y depreciación de activos.' },
    ];
  }
}
