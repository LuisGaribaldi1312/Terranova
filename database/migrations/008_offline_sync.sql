-- ==============================================================================
-- TERRANOVA — Migración 008: Operaciones de Sincronización Offline & Idempotencia
-- Soporta el protocolo transaccional offline-first (Fase 12: Field PWA & Dexie.js)
-- ==============================================================================

-- 1. Tabla de Operaciones de Cliente para Idempotencia Transaccional
CREATE TABLE IF NOT EXISTS sync_client_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_operation_id VARCHAR(64) NOT NULL UNIQUE, -- UUID v4 generado en dispositivo cliente
    entity_type VARCHAR(50) NOT NULL,                -- 'incidents', 'inspections', 'properties', 'assets'
    operation_type VARCHAR(20) NOT NULL,             -- 'INSERT', 'UPDATE', 'DELETE'
    payload JSONB NOT NULL,                          -- Contenido íntegro de la mutación local
    client_timestamp TIMESTAMPTZ NOT NULL,           -- Momento exacto de captura en campo (UTC)
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Momento de recepción en el servidor
    processed_at TIMESTAMPTZ,                        -- Momento de aplicación en base de datos
    status VARCHAR(30) NOT NULL DEFAULT 'PROCESSED', -- 'PROCESSED', 'REJECTED_DUPLICATE', 'CONFLICT'
    server_version INT NOT NULL DEFAULT 1,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sync_client_ops_org ON sync_client_operations(organization_id);
CREATE INDEX IF NOT EXISTS idx_sync_client_ops_client_id ON sync_client_operations(client_operation_id);
CREATE INDEX IF NOT EXISTS idx_sync_client_ops_entity ON sync_client_operations(entity_type, operation_type);
CREATE INDEX IF NOT EXISTS idx_sync_client_ops_timestamp ON sync_client_operations(client_timestamp);

-- 2. Tabla de Conflictos Concurrentes para Resolución Manual o Automática
CREATE TABLE IF NOT EXISTS sync_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_operation_id VARCHAR(64) NOT NULL REFERENCES sync_client_operations(client_operation_id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    conflict_type VARCHAR(50) NOT NULL,              -- 'CONCURRENT_UPDATE', 'DELETED_ON_SERVER', 'VERSION_MISMATCH'
    client_payload JSONB NOT NULL,
    server_payload JSONB NOT NULL,
    resolution_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'RESOLVED_CLIENT', 'RESOLVED_SERVER', 'MERGED'
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_org ON sync_conflicts(organization_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON sync_conflicts(resolution_status);

-- 3. Habilitar Row Level Security (RLS) para aislamiento Multi-Tenant
ALTER TABLE sync_client_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY sync_client_operations_tenant_isolation ON sync_client_operations
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

CREATE POLICY sync_conflicts_tenant_isolation ON sync_conflicts
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

COMMENT ON TABLE sync_client_operations IS 'Registro transaccional inmutable de operaciones offline para garantía de idempotencia (Fase 12)';
COMMENT ON TABLE sync_conflicts IS 'Registro de discrepancias concurrentes detectadas durante la sincronización para mediación pericial';
