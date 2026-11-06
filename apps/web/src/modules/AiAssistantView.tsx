import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  MapPin,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { PropertyItem, IncidentItem, ProjectItem } from '../types';
import {
  MEXICAN_STATES,
  MEXICAN_MUNICIPALITIES,
  MEXICAN_LOCALITIES,
} from '../maps/mexicoGeoData';
import {
  MOCK_INFRASTRUCTURE,
  MOCK_PERMITS,
  MOCK_ORGANIZATIONS,
} from '../stores/mockData';

interface AiAssistantViewProps {
  properties: PropertyItem[];
  incidents: IncidentItem[];
  projects: ProjectItem[];
  onFocusMap: (coords: [number, number]) => void;
  onNavigateModule?: (module: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AGENT';
  agentName?: string;
  agentRole?: string;
  content: string;
  toolCall?: {
    name: string;
    args: Record<string, any>;
    executionTimeMs: number;
    status: 'SUCCESS' | 'BLOCKED_SQL_INJECTION';
  };
  citations?: Array<{ source: string; reference: string }>;
  actions?: Array<{ label: string; actionType: string; payload?: any }>;
  timestamp: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  properties,
  incidents,
  projects,
  onFocusMap,
  onNavigateModule,
}) => {
  const [activeAgent, setActiveAgent] = useState<string>('AUTO_ROUTER');
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sqlWarning, setSqlWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Historial de mensajes inicial con bienvenida interactiva
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'AGENT',
      agentName: 'TERRANOVA AI Orchestrator',
      agentRole: 'Enrutador Autónomo de Inteligencia Territorial',
      content:
        '¡Hola! Soy **TERRANOVA AI**, tu asistente territorial para la gestión pública y planeación urbana. Opero mediante una arquitectura multi-agente (*GeoAgent, UrbanAgent, IncidentAgent, ProjectAgent, InfraAgent*) con **Tool Calling controlado y trazabilidad estricta a fuentes oficiales** (INEGI, PDU y Leyes Estatales), sin ejecución de SQL arbitrario.\n\n¿En qué puedo asistirte hoy?',
      citations: [
        { source: 'Marco Geoestadístico Nacional (MGN) INEGI 2026', reference: 'Estándar Oficial EPSG:6362' },
        { source: 'Programa Municipal de Desarrollo Urbano de Puebla (PDU)', reference: 'Zonificación y Parámetros Urbanos' },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

    // Lista de prompts rápidos de un clic enriquecida con cobertura nacional
  const suggestionPrompts = [
    {
      agent: 'GEO_AGENT',
      text: 'Información geoespacial y municipios del Estado de Jalisco.',
    },
    {
      agent: 'GEO_AGENT',
      text: 'Dime los datos catastrales y geográficos de Nuevo León y Monterrey.',
    },
    {
      agent: 'URBAN_AGENT',
      text: 'Verifica la compatibilidad de COS y CUS para un lote de 350 m² en zona H3.',
    },
    {
      agent: 'PROJECT_AGENT',
      text: 'Dame el estatus de amortización y avance de Curva S del contrato COP-PUE-2026-003.',
    },
    {
      agent: 'INCIDENT_AGENT',
      text: '¿Cuáles colonias presentan mayor concentración de baches críticos y qué SLA tienen?',
    },
    {
      agent: 'INFRA_AGENT',
      text: '¿Qué activos de agua potable e iluminación tienen vida útil menor al 25%?',
    },
    {
      agent: 'SEC_AGENT',
      text: '¿Cómo garantiza TERRANOVA el aislamiento Multi-Tenant y la seguridad OWASP?',
    },
  ];

  // Verificación de inyección SQL en cliente
  const detectArbitrarySql = (text: string): boolean => {
    const forbidden = /(\b(SELECT|DROP|INSERT|UPDATE|DELETE|ALTER|TRUNCATE|UNION)\b|--|;)/i;
    return forbidden.test(text);
  };

  const handleSendMessage = (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text) return;

    // Validación de seguridad innegociable
    if (detectArbitrarySql(text)) {
      setSqlWarning(
        '⚠️ Sentencia SQL arbitraria bloqueada por política de seguridad. TERRANOVA AI opera exclusivamente mediante Tool Calling tipado y trazable. Por favor formula tu duda en lenguaje natural.'
      );
      return;
    }
    setSqlWarning(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simular procesamiento del GeoAgente correspondiente
    setTimeout(() => {
      const responseData = generateAgentResponse(text, activeAgent);
      setMessages((prev) => [...prev, responseData]);
      setIsTyping(false);
    }, 600);
  };

// Motor de Inteligencia Territorial Profunda de TERRANOVA AI
  const generateAgentResponse = (query: string, _requestedAgent?: string): ChatMessage => {
    const q = query.toLowerCase();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. RECONOCIMIENTO TERRITORIAL DE LOS 32 ESTADOS DE MÉXICO
    const matchedState = MEXICAN_STATES.find(
      (s) => q.includes(s.name.toLowerCase()) || 
             q.includes(s.shortName.toLowerCase().replace('.', '')) ||
             (s.cve_ent === '09' && (q.includes('cdmx') || q.includes('ciudad de mexico') || q.includes('ciudad de méxico') || q.includes('distrito federal')))
    );

    if (matchedState) {
      const stateMuns = MEXICAN_MUNICIPALITIES.filter((m) => m.cve_ent === matchedState.cve_ent);
      const stateLocs = MEXICAN_LOCALITIES.filter((l) => l.cve_ent === matchedState.cve_ent);

      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'GeoAgent',
        agentRole: 'Especialista en Marco Geoestadístico Nacional (MGN) & Cartografía INEGI',
        content: `### 🇲🇽 Ficha Territorial Oficial: ${matchedState.name} (Clave INEGI: ${matchedState.cve_ent})\n\n` +
          `• **Capital / Sede del Ejecutivo:** ${matchedState.capital}\n` +
          `• **División Política:** **${matchedState.municipalityCount} Municipios** reconocidos por el INEGI.\n` +
          `• **Centro Geodésico:** Longitud \`${matchedState.center[0]}\`, Latitud \`${matchedState.center[1]}\` (Zoom oficial: ${matchedState.zoom}).\n` +
          `• **Bounding Box Geográfico:** [\`${matchedState.bbox.join(', ')}\`].\n` +
          `• **Municipios Clave Registrados en TERRANOVA:**\n` +
          stateMuns.map(m => `  - **${m.name}** (Clave: \`${m.cve_geo}\`, Población: ${m.population.toLocaleString()} hab., ${m.localityCount} localidades)`).join('\n') +
          `\n\n• **Toponimia & Localidades Principales:** ${stateLocs.slice(0, 3).map(l => `${l.name} (${l.type})`).join(', ')}.\n` +
          `• **Proyección Cartográfica:** Sistema Oficial **EPSG:6362 (ITRF2008 / LCC)** con transformación conforme para la República Mexicana.`,
        toolCall: {
          name: 'query_mgn_state_dossier',
          args: { cve_ent: matchedState.cve_ent, stateName: matchedState.name, includeMunicipalities: true },
          executionTimeMs: 12,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Instituto Nacional de Estadística y Geografía (INEGI)', reference: `Marco Geoestadístico Nacional (MGN) 2026 - Entidad ${matchedState.cve_ent}` },
          { source: 'Norma Técnica para el Sistema Geodésico Nacional', reference: 'Acuerdo DOF EPSG:6362 ITRF2008' },
        ],
        actions: [
          { label: `🇲🇽 Explorar ${matchedState.shortName} en Mapa GIS`, actionType: 'FOCUS_MAP', payload: matchedState.center },
          { label: 'Ir a Explorador GIS', actionType: 'NAVIGATE_GIS' },
        ],
        timestamp: nowTime,
      };
    }

    // 2. RECONOCIMIENTO DE MUNICIPIOS DE MÉXICO
    const matchedMun = MEXICAN_MUNICIPALITIES.find(
      (m) => q.includes(m.name.toLowerCase()) || q.includes(m.headquarters.toLowerCase())
    );

    if (matchedMun) {
      const parentState = MEXICAN_STATES.find((s) => s.cve_ent === matchedMun.cve_ent);
      const munLocs = MEXICAN_LOCALITIES.filter((l) => l.cve_ent === matchedMun.cve_ent && l.cve_mun === matchedMun.cve_mun);

      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'GeoAgent',
        agentRole: 'Especialista en Municipios & Marco Geoestadístico INEGI',
        content: `### 🏛️ Municipio: ${matchedMun.name} (${parentState?.name || ''})\n\n` +
          `• **Clave MGN Oficial:** \`${matchedMun.cve_geo}\` (Entidad: ${matchedMun.cve_ent}, Municipio: ${matchedMun.cve_mun}).\n` +
          `• **Cabecera Municipal:** ${matchedMun.headquarters}\n` +
          `• **Población Censal:** **${matchedMun.population.toLocaleString()} habitantes**.\n` +
          `• **Localidades Oficiales:** ${matchedMun.localityCount} localidades registradas.\n` +
          `• **Localidades Destacadas en TERRANOVA:**\n` +
          munLocs.map(l => `  - **${l.name}** (Clave: \`${l.cve_geo}\`, Tipo: ${l.type}, Población: ${l.population.toLocaleString()} hab.)`).join('\n') +
          `\n• **Coordenadas Centroide:** [\`${matchedMun.center[0]}, ${matchedMun.center[1]}\`].`,
        toolCall: {
          name: 'query_mgn_municipality_dossier',
          args: { cve_geo: matchedMun.cve_geo, municipalityName: matchedMun.name },
          executionTimeMs: 10,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Catálogo Único de Claves Geoestadísticas (INEGI)', reference: `Registro Oficial Clave ${matchedMun.cve_geo}` },
          { source: 'Ley Orgánica Municipal', reference: 'Gobierno y Administración Territorial' },
        ],
        actions: [
          { label: `📍 Centrar ${matchedMun.name} en Mapa`, actionType: 'FOCUS_MAP', payload: matchedMun.center },
          { label: 'Ver Capas Catastrales', actionType: 'NAVIGATE_GIS' },
        ],
        timestamp: nowTime,
      };
    }

    // 3. CONSULTAS CATASTRALES Y PREDIALES
    if (q.includes('predio') || q.includes('catastro') || q.includes('avaluo') || q.includes('avalúo') || q.includes('clave catastral') || q.includes('predial')) {
      const sampleProp = properties[0] || {
        cadastralKey: '21-114-001-042-0012',
        neighborhood: 'Col. La Paz',
        landArea: 420.5,
        builtArea: 280.0,
        cadastralValue: 3450000,
        landUse: 'Habitacional',
      };
      const annualTax = Math.round(sampleProp.cadastralValue * 0.0018);
      const prontoPago = Math.round(annualTax * 0.85);

      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'UrbanAgent',
        agentRole: 'Especialista en Catastro Multifinalitario & Valuación Predial',
        content: `### 📐 Padrón Catastral & Valuación de Inmuebles\n\n` +
          `Actualmente TERRANOVA administra **${properties.length} predios georreferenciados** con polígonos topológicos cerrados:\n\n` +
          `• **Predio de Referencia:** Clave \`${sampleProp.cadastralKey}\` (${sampleProp.neighborhood}).\n` +
          `• **Uso de Suelo:** **${sampleProp.landUse}** (Zonificación PDU compatible).\n` +
          `• **Superficie Terreno:** ${sampleProp.landArea} m² | **Construcción:** ${sampleProp.builtArea} m².\n` +
          `• **Avalúo Catastral Vigente:** **$${sampleProp.cadastralValue.toLocaleString()} MXN**.\n` +
          `• **Cálculo de Impuesto Predial Anual:** $${annualTax.toLocaleString()} MXN (Tasa alícuota: 1.8 al millar).\n` +
          `• **Pronto Pago con Descuento (15%):** **$${prontoPago.toLocaleString()} MXN** con Línea de Captura Módulo 10.\n` +
          `• **Sello Digital SHA-256:** Cédula certificada con firma inmutable de 64 caracteres.`,
        toolCall: {
          name: 'query_cadastral_registry',
          args: { sampleKey: sampleProp.cadastralKey, calculateTax: true },
          executionTimeMs: 11,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Ley de Catastro y Valuación del Estado', reference: 'Art. 28 (Valuación Arancelaria por Zonas Homogéneas)' },
          { source: 'Código Fiscal Municipal 2026', reference: 'Capítulo IV: Impuesto Sobre Bienes Inmuebles' },
        ],
        actions: [
          { label: 'Ver Padrón Catastral Completo', actionType: 'NAVIGATE_PROPERTIES' },
          { label: 'Centrar Predio en Mapa', actionType: 'FOCUS_MAP', payload: [-98.2285, 19.0512] },
        ],
        timestamp: nowTime,
      };
    }

    // 4. CONSULTAS DE OBRAS PÚBLICAS Y CONTRATOS (FAISMUN / FORTAMUN / CURVA S)
    if (q.includes('contrato') || q.includes('obra') || q.includes('curva s') || q.includes('estimacion') || q.includes('estimación') || q.includes('anticipo') || q.includes('faismun')) {
      const proj = projects[0];
      const contractNum = proj?.contractNumber || 'COP-PUE-2026-003';
      const projName = proj?.name || 'Rehabilitación Integral de Red Hidrosanitaria en Av. Juárez';
      const projBudget = proj?.budgetAllocated || 48500000;
      const physicalProgress = proj?.physicalProgressReal ?? proj?.progressPercentage ?? 74;
      const scheduledProgress = proj?.physicalProgressPlanned ?? 78;
      const contractorName = proj?.contractor || 'Infraestructuras y Pavimentos del Altiplano S.A. de C.V.';
      const fundingSource = proj?.fundingSource || 'FAISMUN 2026';

      const advanceAmortized = Math.round(projBudget * 0.30 * (physicalProgress / 100));
      const millarRetention = Math.round(projBudget * (physicalProgress / 100) * 0.005);

      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'ProjectAgent',
        agentRole: 'Especialista en Supervisión de Obra Pública & Finanzas Federales',
        content: `### 🏗️ Contrato de Obra Pública: ${contractNum}\n\n` +
          `• **Proyecto:** ${projName}\n` +
          `• **Contratista:** ${contractorName}\n` +
          `• **Fuente de Financiamiento:** **${fundingSource}**.\n` +
          `• **Presupuesto Asignado:** **$${projBudget.toLocaleString()} MXN**.\n` +
          `• **Curva S de Avance Físico:** Real **${physicalProgress}.0%** vs Programado **${scheduledProgress}.0%** (Desviación: -4.0%).\n` +
          `• **Avance Financiero:** Liquidadas estimaciones #1 a #3.\n` +
          `• **Amortización de Anticipo (30%):** $${advanceAmortized.toLocaleString()} MXN amortizados.\n` +
          `• **Retención 5 al Millar (0.5% Supervisión):** $${millarRetention.toLocaleString()} MXN retenidos en Tesorería.\n` +
          `• **Georreferenciación:** Trazo vectorial y frentes de obra verificados en campo.`,
        toolCall: {
          name: 'query_public_work_contract',
          args: { contractNumber: contractNum, includeSCurve: true },
          executionTimeMs: 14,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Ley de Obras Públicas y Servicios Relacionados del Estado', reference: 'Art. 54 y 68 (Estimaciones y Amortizaciones)' },
          { source: 'Lineamientos de Operación del FAISMUN 2026 (DOF)', reference: 'Capítulo IV: Verificación Física en Sitio' },
        ],
        actions: [
          { label: 'Ver Módulo de Obras y Curva S', actionType: 'NAVIGATE_PROJECTS' },
          { label: 'Localizar Frente de Obra', actionType: 'FOCUS_MAP', payload: [-98.215, 19.048] },
        ],
        timestamp: nowTime,
      };
    }

    // 5. INCIDENCIAS URBANAS 072 & MESA DE CONTROL
    if (q.includes('bache') || q.includes('fuga') || q.includes('sla') || q.includes('incidencia') || q.includes('072') || q.includes('mttr') || q.includes('reporte')) {
      const totalInc = incidents.length;
      const openInc = incidents.filter(i => i.status === 'Recibida' || i.status === 'Validada' || i.status === 'Asignada').length;
      const inProc = incidents.filter(i => i.status === 'En Proceso').length;

      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'IncidentAgent',
        agentRole: 'Especialista en Mesa de Control 072, Despacho & Tiempos SLA',
        content: `### 🚨 Mesa de Control y Despacho Ciudadano 072\n\n` +
          `• **Volumen Activo:** **${totalInc} incidencias registradas** (${openInc} Abiertas, ${inProc} En Proceso de atención).\n` +
          `• **Cumplimiento Global de SLA:** **87.8%** dentro del tiempo límite normativo.\n` +
          `• **Tiempo Medio de Resolución (MTTR):** **14.2 horas**.\n` +
          `• **Matriz de SLA por Tipología:**\n` +
          `  - **Bache Crítico en Vía Primaria:** SLA 24 horas (Prioridad ALTA).\n` +
          `  - **Fuga de Agua Potable / Drenaje:** SLA 12 horas (Prioridad CRÍTICA).\n` +
          `  - **Falla de Circuito de Alumbrado:** SLA 48 horas (Prioridad MEDIA).\n` +
          `• **Colonias con Mayor Concentración:** Amalucan, San Jerónimo Caleras y Centro Histórico.\n` +
          `• **Cuadrillas en Campo:** Despacho con geolocalización celular en tiempo real vía PWA.`,
        toolCall: {
          name: 'query_incidents_dispatch_kpi',
          args: { timeframe: '30D', groupBy: 'type_and_neighborhood' },
          executionTimeMs: 11,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Matriz Municipal de Compromisos de Servicio SLA 072', reference: 'Acuerdo de Cabildo 14-01-2025' },
          { source: 'Protocolo de Despacho de Servicios Públicos y Obras', reference: 'Manual Operativo de Cuadrillas 2026' },
        ],
        actions: [
          { label: 'Ir a Mesa de Control Kanban', actionType: 'NAVIGATE_INCIDENTS' },
          { label: 'Ver Mapa de Calor en Analytics', actionType: 'NAVIGATE_ANALYTICS' },
        ],
        timestamp: nowTime,
      };
    }

    // 6. INFRAESTRUCTURA URBANA Y REDES MUNICIPALES
    if (q.includes('agua') || q.includes('luminaria') || q.includes('poste') || q.includes('tuberia') || q.includes('tubería') || q.includes('infraestructura') || q.includes('activo')) {
      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'InfraAgent',
        agentRole: 'Especialista en Redes Municipales & Ciclo de Vida de Activos',
        content: `### ⚡ Catálogo e Inventario de Infraestructura Urbana\n\n` +
          `TERRANOVA monitorea el ciclo de vida de **${MOCK_INFRASTRUCTURE.length} familias de activos estratégicos**:\n\n` +
          `• **Red de Agua Potable & Alcantarillado:**\n` +
          `  - Tuberías de hierro fundido (1994): **18.0% de vida útil remanente** (prioridad alta de sustitución en Centro Histórico).\n` +
          `  - Válvulas reguladoras de presión y colectores pluviales con monitoreo hidrométrico.\n` +
          `• **Alumbrado Público:**\n` +
          `  - Circuitos LED de alta eficiencia con telemetría de consumo eléctrico y fotoceldas inteligentes.\n` +
          `• **Mantenimiento y Presupuesto:**\n` +
          `  - Costo acumulado de mantenimiento correctivo y preventivo: **$3,450,200.00 MXN** en el ejercicio fiscal activo.\n` +
          `• **Criterio de Depreciación:** Método lineal contable conforme a la Ley General de Contabilidad Gubernamental.`,
        toolCall: {
          name: 'query_infrastructure_lifecycle',
          args: { networkType: 'ALL', calculateDepreciation: true },
          executionTimeMs: 13,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Norma Oficial Mexicana NOM-001-CONAGUA-2011', reference: 'Sistemas de Agua Potable y Alcantarillado Hermético' },
          { source: 'Ley General de Contabilidad Gubernamental', reference: 'Reglas Específicas del Registro de Bienes Muebles e Inmuebles' },
        ],
        actions: [
          { label: 'Ver Inventario de Infraestructura', actionType: 'NAVIGATE_INFRA' },
          { label: 'Ver Capas de Tuberías en GIS', actionType: 'FOCUS_MAP', payload: [-98.2063, 19.0414] },
        ],
        timestamp: nowTime,
      };
    }

    // 7. PERMISOS, LICENCIAS Y COMPATIBILIDAD URBANA (COS / CUS / PDU)
    if (q.includes('licencia') || q.includes('permiso') || q.includes('cos') || q.includes('cus') || q.includes('pdu') || q.includes('dro') || q.includes('zonificacion') || q.includes('zonificación')) {
      const samplePermit = MOCK_PERMITS[0];
      const permitFolio = samplePermit?.folio || 'LIC-OBR-2026-00412';
      const dro = samplePermit?.droName || 'Ing. Salvador Morales (DRO-PUE-2018-0441)';
      const zoning = samplePermit?.pduZoneClassification || 'H3-UNIFAMILIAR';
      const cosVal = 0.63;
      const maxCosVal = 0.70;
      const cusVal = 1.74;
      const maxCusVal = 2.10;

      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'UrbanAgent',
        agentRole: 'Especialista en Catastro, Normativa PDU & Licencias Urbanas',
        content: `### 📜 Dictamen Urbano y Compatibilidad Normativa\n\n` +
          `• **Expediente de Licencia:** \`${permitFolio}\` (Estatus: **${samplePermit?.status || 'AUTORIZADO'}**).\n` +
          `• **Director Responsable de Obra:** ${dro}\n` +
          `• **Zonificación Asignada:** **${zoning}** según el Programa Municipal de Desarrollo Urbano.\n` +
          `• **Evaluación de Coeficientes de Suelo:**\n` +
          `  - **COS (Ocupación):** Proyecto: **${cosVal}** vs Límite PDU: **${maxCosVal}** 👉 **CUMPLE**.\n` +
          `  - **CUS (Utilización):** Proyecto: **${cusVal}** vs Límite PDU: **${maxCusVal}** 👉 **CUMPLE**.\n` +
          `• **Vigencia Normativa:** 24 meses naturales para obra mayor (renovables conforme a bitácora de obra).\n` +
          `• **Seguridad Criptográfica:** Expediente sellado con QR verificador y Hash SHA-256 inmutable.`,
        toolCall: {
          name: 'verify_construction_license',
          args: { licenseNumber: permitFolio, checkZoning: true },
          executionTimeMs: 9,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Programa Municipal de Desarrollo Urbano de Puebla (PDU)', reference: 'Capítulo Zonificación Secundaria y Tabla de Coeficientes' },
          { source: 'Reglamento de Construcciones Municipal', reference: 'Art. 42 y 83 (Derechos y Obligaciones del DRO)' },
        ],
        actions: [
          { label: 'Ver Expedientes de Licencias', actionType: 'NAVIGATE_PERMITS' },
          { label: 'Centrar en Mapa Urbano', actionType: 'FOCUS_MAP', payload: [-98.2063, 19.0414] },
        ],
        timestamp: nowTime,
      };
    }

    // 8. GEMELO DIGITAL 3D & SIMULACIONES
    if (q.includes('gemelo digital') || q.includes('3d') || q.includes('solar') || q.includes('sombra') || q.includes('lluvia') || q.includes('pluvial') || q.includes('escorrentia') || q.includes('escorrentía')) {
      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'GeoAgent',
        agentRole: 'Especialista en Gemelo Digital 3D & Modelado Físico Territorial',
        content: `### 🏙️ Gemelo Digital 3D de TERRANOVA (LoD1 & Física Ambiental)\n\n` +
          `• **Proyección Tridimensional:** Extrusión volumétrica de poliedros urbanos a partir de cotas catastrales y altura de entrepiso.\n` +
          `• **Simulación Solar Astronómica:**\n` +
          `  - Cálculo en tiempo real de Altitud y Azimut solar según coordenadas geográficas y fecha/hora.\n` +
          `  - Proyección de sombras cónicas proporcionales a la altura de cada inmueble.\n` +
          `• **Simulación Pluvial e Hidrometeorológica:**\n` +
          `  - Estimación de volumen de escorrentía acumulada (m³/hora) en función de intensidad pluviométrica.\n` +
          `  - Detección de cuellos de botella en colectores y puntos con riesgo de anegamiento.`,
        toolCall: {
          name: 'simulate_solar_runoff_twin',
          args: { solarHour: 13.5, rainIntensityMmH: 45 },
          executionTimeMs: 15,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Astronomical Algorithms (Jean Meeus)', reference: 'Solar Coordinates and Sun Position Calculation' },
          { source: 'Manual de Diseño de Obras Civiles (CFE / CONAGUA)', reference: 'Capítulo Hidrología y Drenaje Pluvial Urbano' },
        ],
        actions: [
          { label: 'Abrir Gemelo Digital 3D', actionType: 'NAVIGATE_DIGITAL_TWIN' },
        ],
        timestamp: nowTime,
      };
    }

    // 9. CIBERSEGURIDAD, RLS & AUDITORÍA OWASP
    if (q.includes('seguridad') || q.includes('owasp') || q.includes('rls') || q.includes('multi-tenant') || q.includes('auditoria') || q.includes('auditoría') || q.includes('seguro')) {
      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'SecurityAgent',
        agentRole: 'Especialista en Ciberseguridad, RLS Multi-Tenant & Hardening OWASP',
        content: `### 🛡️ Arquitectura de Ciberseguridad y Blindaje de TERRANOVA\n\n` +
          `• **Aislamiento Multi-Tenant Estricto:**\n` +
          `  - **PostgreSQL Row Level Security (RLS)** activo en las 12 tablas del esquema de base de datos.\n` +
          `  - Imposibilidad matemática de fuga de datos entre municipios o desarrolladoras privadas (Anti-IDOR).\n` +
          `• **Inmutabilidad WORM:**\n` +
          `  - Tabla \`audit_logs\` protegida con triggers que bloquean de forma absoluta cualquier \`UPDATE\` o \`DELETE\`.\n` +
          `  - Cada registro de auditoría cuenta con firma criptográfica HMAC-SHA256 encadenada.\n` +
          `• **Criptografía Robusta:**\n` +
          `  - Derivación de contraseñas con **BCrypt (factor de costo 12)**.\n` +
          `  - Autenticación multifactor **TOTP RFC 6238** con ventana temporal estricta.\n` +
          `• **Protección contra Inyecciones SQL:**\n` +
          `  - Consultas exclusivamente parametrizadas con Prisma ORM / Kysely tipado, con bloqueo proactivo de cadenas dinámicas.`,
        toolCall: {
          name: 'audit_system_security_matrix',
          args: { verifyRLS: true, checkAuditHMAC: true },
          executionTimeMs: 8,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'OWASP Top 10:2021', reference: 'A01: Broken Access Control & A03: Injection Mitigation' },
          { source: 'NIST SP 800-63B', reference: 'Digital Identity Guidelines: Authentication and Lifecycle Management' },
        ],
        actions: [
          { label: 'Ver Panel de Auditoría y Seguridad', actionType: 'NAVIGATE_ADMIN' },
        ],
        timestamp: nowTime,
      };
    }

    // 10. ORGANIZACIONES AUTORIZADAS Y COBERTURA NACIONAL
    if (q.includes('organizacion') || q.includes('organización') || q.includes('autorizadas') || q.includes('estados') || q.includes('gobiernos')) {
      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'GeoAgent',
        agentRole: 'Especialista en Gobernanza Territorial & Organizaciones Autorizadas',
        content: `### 🇲🇽 Red de Organizaciones Autorizadas en TERRANOVA\n\n` +
          `Actualmente la plataforma cuenta con **${MOCK_ORGANIZATIONS.length} organizaciones dadas de alta y autorizadas**:\n\n` +
          `• **32 Gobiernos Estatales:** Cobertura del 100% de las Entidades Federativas de México (Aguascalientes, Baja California, CDMX, Jalisco, Nuevo León, Puebla, Querétaro, Sonora, Yucatán, etc.).\n` +
          `• **Gobiernos Municipales Autorizados:** H. Ayuntamiento de Puebla, Municipio de Querétaro, Monterrey, Guadalajara, Mérida, Alcaldía Cuauhtémoc.\n` +
          `• **Desarrolladoras y Constructoras:** Grupo Desarrollador Norte, Constructora Metropolitana Jalisco.\n` +
          `• **Aislamiento Multi-Tenant:** Cada organización opera en su propio espacio lógico aislado mediante \`organization_id\` y RLS.`,
        toolCall: {
          name: 'query_authorized_organizations',
          args: { totalOrgs: MOCK_ORGANIZATIONS.length },
          executionTimeMs: 7,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Marco de Gobernanza Multi-Tenant TERRANOVA', reference: 'Directorio de Tenants Autorizados 2026' },
        ],
        actions: [
          { label: 'Ir a Administración y Gobernanza', actionType: 'NAVIGATE_ADMIN' },
          { label: 'Ver República Mexicana en GIS', actionType: 'NAVIGATE_GIS' },
        ],
        timestamp: nowTime,
      };
    }

    // 11. RESPUESTA INTELIGENTE GLOBAL POR DEFECTO
    return {
      id: `agent-${Date.now()}`,
      sender: 'AGENT',
      agentName: 'TERRANOVA AI Orchestrator',
      agentRole: 'Enrutador Autónomo de Inteligencia Territorial',
      content: `### 🌐 Panorama General de TERRANOVA OS\n\n` +
        `He procesado tu consulta: *"${query}"*. TERRANOVA cuenta con información viva en los siguientes módulos territoriales:\n\n` +
        `1. **Marco Geoestadístico Nacional (MGN):** Cobertura completa de los **32 Estados de México**, 108 municipios y 324 localidades con geometría oficial INEGI EPSG:6362.\n` +
        `2. **Catastro y Valuación:** Padrón de predios, cálculo predial con pronto pago (15%) y expedición de cédulas con sello SHA-256.\n` +
        `3. **Obras Públicas y Curva S:** Contratos FAISMUN/FORTAMUN, amortización de anticipos (30%) y avance físico vs programado.\n` +
        `4. **Mesa de Despacho 072:** Reportes de baches y fugas con semáforo SLA y cálculo automático de MTTR.\n` +
        `5. **Infraestructura Urbana:** Ciclo de vida y depreciación de redes de agua potable y alumbrado.\n` +
        `6. **Gemelo Digital 3D:** Simulación solar diurna/cenital y proyección de escorrentía pluvial.\n\n` +
        `*Puedes preguntarme sobre cualquier estado (ej. "Háblame de Jalisco o Sonora"), consultar contratos de obra, o pedir el avalúo de un predio.*`,
      toolCall: {
        name: 'comprehensive_territorial_scan',
        args: { userQuery: query },
        executionTimeMs: 9,
        status: 'SUCCESS',
      },
      citations: [
        { source: 'Marco Geoestadístico Nacional (MGN) INEGI 2026', reference: 'Catálogo de Cobertura República Mexicana' },
        { source: 'Arquitectura TERRANOVA Core 1.0', reference: 'Modelo Unificado de Gestión Municipal y Estatal' },
      ],
      actions: [
        { label: 'Explorar Mapa de la República', actionType: 'NAVIGATE_GIS' },
        { label: 'Ver Módulo de Catastro', actionType: 'NAVIGATE_PROPERTIES' },
        { label: 'Consultar Obras Públicas', actionType: 'NAVIGATE_PROJECTS' },
      ],
      timestamp: nowTime,
    };
  };

  const handleActionClick = (action: { actionType: string; payload?: any }) => {
    if (action.actionType === 'FOCUS_MAP' && action.payload) {
      onFocusMap(action.payload);
    } else if (action.actionType === 'NAVIGATE_PROJECTS' && onNavigateModule) {
      onNavigateModule('projects');
    } else if (action.actionType === 'NAVIGATE_PERMITS' && onNavigateModule) {
      onNavigateModule('permits');
    } else if (action.actionType === 'NAVIGATE_ANALYTICS' && onNavigateModule) {
      onNavigateModule('analytics');
    } else if (action.actionType === 'NAVIGATE_INCIDENTS' && onNavigateModule) {
      onNavigateModule('incidents');
    } else if (action.actionType === 'NAVIGATE_INFRA' && onNavigateModule) {
      onNavigateModule('infrastructure');
    } else if (action.actionType === 'NAVIGATE_GIS' && onNavigateModule) {
      onNavigateModule('gis');
    } else if (action.actionType === 'NAVIGATE_PROPERTIES' && onNavigateModule) {
      onNavigateModule('properties');
    } else if (action.actionType === 'NAVIGATE_DIGITAL_TWIN' && onNavigateModule) {
      onNavigateModule('digital-twin');
    } else if (action.actionType === 'NAVIGATE_ADMIN' && onNavigateModule) {
      onNavigateModule('admin');
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-cleared',
        sender: 'AGENT',
        agentName: 'TERRANOVA AI Orchestrator',
        agentRole: 'Enrutador Autónomo de Inteligencia Territorial',
        content: 'Historial reiniciado. Estoy listo para una nueva consulta territorial.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col gis-grid-bg text-left">
      {/* =========================================================================
          1. HEADER DEL ASISTENTE Y SELECTOR DE GEOAGENTE
         ========================================================================= */}
      <div className="p-4 bg-terranova-900/90 border-b border-terranova-700 flex flex-wrap items-center justify-between gap-3 shadow-panel-dark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-terranova-600 flex items-center justify-center shadow-lg border border-emerald-400/40">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white font-mono flex items-center gap-1.5">
                TERRANOVA AI — GeoAgentes Territoriales Autónomos
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                FASE 14
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Consultas en lenguaje natural con Tool Calling controlado y trazabilidad a fuentes oficiales • Cero SQL arbitrario.
            </p>
          </div>
        </div>

        {/* Selector de GeoAgente Especializado */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400 hidden sm:inline">Especialista:</span>
          <select
            value={activeAgent}
            onChange={(e) => setActiveAgent(e.target.value)}
            className="bg-terranova-950 border border-terranova-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-terranova-500 font-mono font-bold shadow-inner"
          >
            <option value="AUTO_ROUTER">🤖 Enrutador Autónomo (Auto-Router)</option>
            <option value="GEO_AGENT">🌐 GeoAgent (Cartografía INEGI MGN)</option>
            <option value="URBAN_AGENT">🏛️ UrbanAgent (Catastro, PDU & Licencias)</option>
            <option value="INCIDENT_AGENT">🚨 IncidentAgent (Atención 072 & SLA)</option>
            <option value="PROJECT_AGENT">🏗️ ProjectAgent (Obras & Curva S)</option>
            <option value="INFRA_AGENT">💧 InfraAgent (Redes de Agua & Servicios)</option>
          </select>

          <button
            onClick={handleClearChat}
            title="Reiniciar conversación"
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-terranova-800 border border-terranova-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. CANVAS PRINCIPAL DE MENSAJES (CHAT FLOW)
         ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
          >
            {/* Mensaje del Usuario */}
            {msg.sender === 'USER' ? (
              <div className="max-w-2xl bg-terranova-700 text-white p-3.5 rounded-2xl rounded-tr-sm shadow-md text-xs leading-relaxed space-y-1">
                <p>{msg.content}</p>
                <span className="text-[10px] text-terranova-300 font-mono block text-right">
                  {msg.timestamp}
                </span>
              </div>
            ) : (
              /* Respuesta del GeoAgente */
              <div className="max-w-3xl bg-terranova-900/95 border border-terranova-700 p-4 rounded-2xl rounded-tl-sm shadow-panel-dark text-xs text-gray-200 space-y-3">
                {/* Header del Agente */}
                <div className="flex items-center justify-between border-b border-terranova-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono font-bold text-white text-xs">{msg.agentName}</span>
                    <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">
                      ({msg.agentRole})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">{msg.timestamp}</span>
                </div>

                {/* Badge de Tool Calling Ejecutado (Cero SQL Arbitrario) */}
                {msg.toolCall && (
                  <div className="p-2.5 rounded-xl bg-terranova-950 border border-terranova-800 space-y-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-terranova-400">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Cpu className="w-3.5 h-3.5 text-sky-400" />
                        <span>Tool Invoked: <code>{msg.toolCall.name}</code></span>
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verificado ({msg.toolCall.executionTimeMs}ms)</span>
                      </span>
                    </div>
                    <div className="text-gray-400 text-[10px] truncate">
                      Parámetros: {JSON.stringify(msg.toolCall.args)}
                    </div>
                  </div>
                )}

                {/* Contenido Narrativo */}
                <div className="leading-relaxed whitespace-pre-line text-xs text-gray-200">
                  {msg.content}
                </div>

                {/* Fuentes Oficiales Citadas (Trazabilidad Gubernamental) */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-terranova-800/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 font-mono uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                      Fuentes Oficiales & Normatividad Vinculante
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {msg.citations.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-1.5 rounded-lg bg-terranova-950/80 border border-terranova-800/60 text-[10px] font-mono"
                        >
                          <span className="text-white font-bold block truncate">{c.source}</span>
                          <span className="text-gray-400 block truncate">{c.reference}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botones de Acción Rápida Vinculantes */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="pt-2 border-t border-terranova-800/80 flex flex-wrap gap-2">
                    {msg.actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(act)}
                        className="px-3 py-1.5 rounded-lg bg-terranova-800 hover:bg-terranova-700 text-terranova-200 hover:text-white font-mono font-bold text-[11px] flex items-center gap-1.5 border border-terranova-600 transition-all shadow-sm"
                      >
                        {act.actionType === 'FOCUS_MAP' ? (
                          <MapPin className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <ExternalLink className="w-3 h-3 text-sky-400" />
                        )}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Indicador de Escritura / Pensamiento del Agente */}
        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-terranova-900/80 border border-terranova-700 rounded-2xl w-fit text-xs font-mono text-terranova-300">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Consultando fuentes geoespaciales y ejecutando Tool Calling seguro...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* =========================================================================
          3. BARRA INFERIOR: PROMPTS RÁPIDOS & INPUT FORM
         ========================================================================= */}
      <div className="p-4 bg-terranova-900/90 border-t border-terranova-700 space-y-3 shadow-panel-dark">
        {/* Alerta si se detecta intento de SQL arbitrario */}
        {sqlWarning && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{sqlWarning}</span>
          </div>
        )}

        {/* Pills de Sugerencias de Preguntas Frecuentes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
          <span className="text-[11px] text-gray-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-terranova-400" />
            Sugerencias:
          </span>
          {suggestionPrompts.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug.text)}
              className="px-2.5 py-1 rounded-full bg-terranova-950 border border-terranova-700 text-gray-300 hover:text-white hover:border-terranova-500 text-[11px] shrink-0 transition-colors"
            >
              {sug.text}
            </button>
          ))}
        </div>

        {/* Formulario de Entrada */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Pregunta a TERRANOVA AI sobre catastro, baches, obras públicas o zonificación..."
            className="flex-1 bg-terranova-950 border border-terranova-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-terranova-500 font-mono shadow-inner"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className={`px-4 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
              inputQuery.trim() && !isTyping
                ? 'bg-terranova-600 hover:bg-terranova-500 text-white cursor-pointer'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Consultar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
