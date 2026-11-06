-- ==============================================================================
-- TERRANOVA — Migración 010: GeoAgentes Inteligentes y Auditoría de Tool Calling
-- Soporta el asistente conversacional geoespacial autónomo (Fase 14: TERRANOVA AI)
-- ==============================================================================

-- 1. Tabla de Sesiones de Conversación con GeoAgentes
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL DEFAULT 'Consulta Territorial',
    active_agent VARCHAR(50) NOT NULL DEFAULT 'AUTO_ROUTER', -- 'GEO_AGENT', 'URBAN_AGENT', 'INFRA_AGENT', 'PROJECT_AGENT'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conv_org ON ai_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_conv_user ON ai_conversations(user_id);

-- 2. Tabla de Mensajes y Consultas de Lenguaje Natural
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL,                        -- 'USER', 'AGENT', 'SYSTEM'
    agent_name VARCHAR(50),                                  -- 'GeoAgent', 'UrbanAgent', 'InfraAgent', 'ProjectAgent'
    content TEXT NOT NULL,
    official_citations JSONB DEFAULT '[]'::jsonb,            -- Lista de fuentes oficiales citadas
    suggested_actions JSONB DEFAULT '[]'::jsonb,             -- Botones de acción vinculante
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_org ON ai_messages(organization_id);

-- 3. Tabla de Auditoría Inmutable de Tool Calling Controlado
-- Garantiza Cero Ejecución de SQL Arbitrario registrando cada herramienta ejecutada
CREATE TABLE IF NOT EXISTS ai_tool_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES ai_messages(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tool_name VARCHAR(100) NOT NULL,                         -- ej. 'query_incidents_summary'
    tool_arguments JSONB NOT NULL,                           -- Parámetros estrictamente tipados
    execution_status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'BLOCKED_SQL_INJECTION', 'FAILED'
    execution_time_ms INT NOT NULL DEFAULT 0,
    result_preview JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tools_org ON ai_tool_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_tools_name ON ai_tool_executions(tool_name);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_conversations_tenant_isolation ON ai_conversations
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

CREATE POLICY ai_messages_tenant_isolation ON ai_messages
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

CREATE POLICY ai_tool_executions_tenant_isolation ON ai_tool_executions
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

COMMENT ON TABLE ai_conversations IS 'Sesiones conversacionales geoespaciales con agentes especializados (Fase 14)';
COMMENT ON TABLE ai_tool_executions IS 'Registro auditable de Tool Calling seguro sin ejecución de SQL arbitrario';
