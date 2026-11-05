-- ============================================================================
-- TERRANOVA — MIGRACIÓN 003: INFRAESTRUCTURA URBANA Y CICLO DE VIDA DE ACTIVOS
-- Fase 07: Redes de Servicios, Bitácora de Mantenimiento y Evaluación de Condición
-- ============================================================================

ALTER TABLE infrastructure_assets
    ADD COLUMN IF NOT EXISTS network_type VARCHAR(50) DEFAULT 'AGUA_POTABLE',
    ADD COLUMN IF NOT EXISTS asset_condition VARCHAR(30) DEFAULT 'GOOD',
    ADD COLUMN IF NOT EXISTS cost_installation NUMERIC(12, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS accumulated_maintenance_cost NUMERIC(12, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS expected_lifespan_years INT DEFAULT 15,
    ADD COLUMN IF NOT EXISTS last_inspection_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS next_maintenance_due DATE,
    ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(150),
    ADD COLUMN IF NOT EXISTS street VARCHAR(200);

-- Índices de consulta de activos urbanos
CREATE INDEX IF NOT EXISTS idx_infra_network ON infrastructure_assets(organization_id, network_type);
CREATE INDEX IF NOT EXISTS idx_infra_status ON infrastructure_assets(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_infra_condition ON infrastructure_assets(organization_id, asset_condition);

-- Tabla de Bitácora de Mantenimiento y Órdenes de Servicio
CREATE TABLE IF NOT EXISTS asset_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES infrastructure_assets(id) ON DELETE CASCADE,
    work_order_folio VARCHAR(50) NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    cost NUMERIC(12, 2) DEFAULT 0.00,
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    performed_by VARCHAR(150) NOT NULL,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maint_logs_org_asset ON asset_maintenance_logs(organization_id, asset_id);
CREATE INDEX IF NOT EXISTS idx_maint_logs_performed ON asset_maintenance_logs(performed_at DESC);

-- Habilitar Row Level Security (RLS) en la bitácora
ALTER TABLE asset_maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_asset_maintenance_logs ON asset_maintenance_logs
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

COMMENT ON TABLE infrastructure_assets IS 'Inventario Georreferenciado de Redes de Infraestructura Urbana Municipal';
COMMENT ON TABLE asset_maintenance_logs IS 'Bitácora Histórica Inmutable de Mantenimientos e Inspecciones de Activos';
