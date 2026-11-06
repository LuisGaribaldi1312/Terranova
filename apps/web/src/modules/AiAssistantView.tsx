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

  // Lista de prompts rápidos de un clic
  const suggestionPrompts = [
    {
      agent: 'INCIDENT_AGENT',
      text: '¿Cuáles colonias presentan mayor concentración de baches críticos?',
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
      agent: 'INFRA_AGENT',
      text: '¿Qué tramos de agua potable en el Centro Histórico tienen vida útil menor al 20%?',
    },
    {
      agent: 'GEO_AGENT',
      text: 'Verifica los parámetros de proyección cartográfica EPSG:6362 y colindancias del MGN.',
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

  // Motor de respuesta simulada por GeoAgente
  const generateAgentResponse = (query: string, requestedAgent: string): ChatMessage => {
    const q = query.toLowerCase();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Enrutamiento si está en AUTO_ROUTER
    let agentToUse = requestedAgent;
    if (agentToUse === 'AUTO_ROUTER') {
      if (q.includes('contrato') || q.includes('obra') || q.includes('curva s') || q.includes('estimacion')) {
        agentToUse = 'PROJECT_AGENT';
      } else if (q.includes('predio') || q.includes('cos') || q.includes('cus') || q.includes('pdu') || q.includes('licencia') || q.includes('zonificacion')) {
        agentToUse = 'URBAN_AGENT';
      } else if (q.includes('bache') || q.includes('fuga') || q.includes('sla') || q.includes('incidencia') || q.includes('072')) {
        agentToUse = 'INCIDENT_AGENT';
      } else if (q.includes('agua') || q.includes('luminaria') || q.includes('poste') || q.includes('tuberia') || q.includes('infraestructura')) {
        agentToUse = 'INFRA_AGENT';
      } else {
        agentToUse = 'GEO_AGENT';
      }
    }

    if (agentToUse === 'PROJECT_AGENT') {
      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'ProjectAgent',
        agentRole: 'Especialista en Supervisión de Obra Pública & Finanzas Federales',
        content:
          'Se evaluó el contrato **COP-PUE-2026-003** (*"Rehabilitación Integral de Red Hidrosanitaria en Av. Juárez"*), financiado con fondos federales **FAISMUN 2026** ($48,500,000.00 MXN asignados).\n\n• **Avance Físico:** Real **74.0%** vs Programado **78.0%** (-4.0% de atraso físico en frentes de obra).\n• **Avance Financiero:** **$28,615,000.00 MXN liquidados** en 3 estimaciones con un 30% de amortización de anticipo ($8.58M amortizados) y retención 5 al millar ($143,075 MXN).\n• **Estimación #4:** En proceso de validación en Tesorería por un importe bruto de $7,275,000.00 MXN.',
        toolCall: {
          name: 'query_public_work_contract',
          args: { contractNumber: 'COP-PUE-2026-003', includeSCurve: true },
          executionTimeMs: 14,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Ley de Obras Públicas y Servicios Relacionados del Estado de Puebla', reference: 'Art. 54 (Estimaciones y Amortizaciones)' },
          { source: 'Lineamientos de Operación del FAISMUN 2026 (DOF)', reference: 'Capítulo IV: Verificación Física en Sitio' },
        ],
        actions: [
          { label: 'Ver Gráfica de Curva S', actionType: 'NAVIGATE_PROJECTS' },
          { label: 'Enfocar Tramo en Mapa GIS', actionType: 'FOCUS_MAP', payload: [-98.215, 19.048] },
        ],
        timestamp: nowTime,
      };
    }

    if (agentToUse === 'URBAN_AGENT') {
      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'UrbanAgent',
        agentRole: 'Especialista en Catastro, Normativa PDU & Licencias Urbanas',
        content:
          'Para el predio en zona **H3-UNIFAMILIAR** del Programa Municipal de Desarrollo Urbano:\n\n• **Lote Base:** 350.0 m².\n• **COS Calculado:** Con desplante de 220.0 m², el COS es **0.63** (máximo reglamentario: 0.70) 👉 **COMPATIBLE**.\n• **CUS Calculado:** Con 610.0 m² de construcción total en 3 niveles, el CUS es **1.74** (máximo: 2.10) 👉 **COMPATIBLE**.\n• **Cédula Oficial:** La solicitud se encuentra avalada con dictamen pericial del **DRO-PUE-2018-0441** y amparada bajo la licencia **LIC-OBR-2026-00412** con sello digital SHA-256.',
        toolCall: {
          name: 'calculate_zoning_compliance',
          args: { zoneCode: 'H3-UNIFAMILIAR', lotAreaM2: 350.0, footprintM2: 220.0, totalConstructionM2: 610.0 },
          executionTimeMs: 9,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Programa Municipal de Desarrollo Urbano de Puebla (PDU)', reference: 'Capítulo Zonificación Secundaria y Tabla de Coeficientes de Suelo' },
          { source: 'Reglamento de Construcciones para el Municipio de Puebla', reference: 'Art. 42 y 83 (Obligaciones del DRO)' },
        ],
        actions: [
          { label: 'Ver Módulo de Licencias Urbanas', actionType: 'NAVIGATE_PERMITS' },
          { label: 'Centrar Predio en Catastro', actionType: 'FOCUS_MAP', payload: [-98.2063, 19.0414] },
        ],
        timestamp: nowTime,
      };
    }

    if (agentToUse === 'INCIDENT_AGENT') {
      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'IncidentAgent',
        agentRole: 'Especialista en Mesa de Control 072, Despacho & Tiempos SLA',
        content:
          'En el último corte mensual se han registrado **418 reportes** ciudadanos:\n\n• **Tasa de Cumplimiento de SLA:** **87.8%** dentro del tiempo de respuesta contractual.\n• **MTTR Global:** **14.2 horas** de tiempo medio de resolución (mejora de 4.4h vs mes anterior).\n• **Colonias con Mayor Concentración:** **Amalucan / Oriente** (85 reportes, MTTR 22.4h) y **San Jerónimo Caleras** (63 reportes, MTTR 28.6h).\n• **Brigada Destacada:** Cuadrilla 02 (Alumbrado) con 97.8% de eficiencia y tiempo promedio de 6.2 horas.',
        toolCall: {
          name: 'query_incidents_summary',
          args: { timeframe: '30D', groupBy: 'neighborhood' },
          executionTimeMs: 11,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Matriz Municipal de Compromisos de Servicio SLA 072', reference: 'Acuerdo de Cabildo 14-01-2025' },
          { source: 'Protocolo de Despacho de Servicios Públicos y Obras', reference: 'Manual de Cuadrillas Municipales 2026' },
        ],
        actions: [
          { label: 'Ver Mapa de Calor en Analytics', actionType: 'NAVIGATE_ANALYTICS' },
          { label: 'Ir a Mesa de Control Kanban', actionType: 'NAVIGATE_INCIDENTS' },
        ],
        timestamp: nowTime,
      };
    }

    if (agentToUse === 'INFRA_AGENT') {
      return {
        id: `agent-${Date.now()}`,
        sender: 'AGENT',
        agentName: 'InfraAgent',
        agentRole: 'Especialista en Redes Municipales & Ciclo de Vida de Activos',
        content:
          'La base de datos de infraestructura registra **1,420 activos georreferenciados** en la zona:\n\n• **Red de Agua Potable (SOAPAP):** Tuberías de hierro fundido instaladas en 1994 en Centro Histórico con **18.0% de vida útil remanente** (sustitución prioritaria en 1.8 km lineales).\n• **Alumbrado Público:** 112 luminarias LED con **94.2% de cobertura activa** y depreciación acumulada de $142,000 MXN.\n• **Costo de Mantenimiento:** Inversión acumulada de $3,450,200.00 MXN en el ejercicio fiscal activo.',
        toolCall: {
          name: 'query_infrastructure_lifecycle',
          args: { networkType: 'AGUA_POTABLE', calculateDepreciation: true },
          executionTimeMs: 13,
          status: 'SUCCESS',
        },
        citations: [
          { source: 'Norma Oficial Mexicana NOM-001-CONAGUA-2011', reference: 'Sistemas de Agua Potable y Alcantarillado Hermético' },
          { source: 'Catálogo de Bienes Municipales de Dominio Público', reference: 'Capítulo 5000 (Activos de Infraestructura)' },
        ],
        actions: [
          { label: 'Ver Capas de Tuberías en GIS', actionType: 'FOCUS_MAP', payload: [-98.2063, 19.0414] },
          { label: 'Inspeccionar Activos de Red', actionType: 'NAVIGATE_INFRA' },
        ],
        timestamp: nowTime,
      };
    }

    // Default: GeoAgent
    return {
      id: `agent-${Date.now()}`,
      sender: 'AGENT',
      agentName: 'GeoAgent',
      agentRole: 'Especialista en Cartografía Oficial INEGI & Proyecciones EPSG:6362',
      content:
        'La cartografía del municipio de Puebla opera bajo el **Marco Geoestadístico Nacional (MGN) del INEGI Edición 2026**.\n\n• **Proyección Oficial:** **EPSG:6362 (ITRF2008 / LCC)** con transformación conforme para Centro y Sur de México, complementada con **EPSG:32614 (UTM Zona 14N)**.\n• **Validación Topológica:** Los 11 cuadrantes parcelarios cumplen estrictamente con la regla geodésica PostGIS `ST_IsValid` sin traslapes ni polígonos degenerados.',
      toolCall: {
        name: 'validate_geodesic_polygon',
        args: { srid: 6362, municipalityCode: '21114' },
        executionTimeMs: 8,
        status: 'SUCCESS',
      },
      citations: [
        { source: 'Instituto Nacional de Estadística y Geografía (INEGI)', reference: 'Marco Geoestadístico Nacional (MGN) 2026' },
        { source: 'Centro Nacional de Información Catastral', reference: 'Parámetros Geodésicos ITRF2008 Época 2010.0' },
      ],
      actions: [
        { label: 'Explorar en Visor MapLibre', actionType: 'FOCUS_MAP', payload: [-98.2063, 19.0414] },
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
