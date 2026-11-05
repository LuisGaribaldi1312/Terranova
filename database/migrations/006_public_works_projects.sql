-- ==============================================================================
-- TERRANOVA DATABASE MIGRATION 006: PUBLIC WORKS & S-CURVE SUPERVISION
-- Gestión de Obras Públicas, Curva S, Estimaciones con Amortización y Fondos Federales
-- ==============================================================================

-- 1. Ampliación de la tabla de Obras y Proyectos (projects)
ALTER TABLE projects 
    ADD COLUMN IF NOT EXISTS funding_source VARCHAR(100) DEFAULT 'FAISMUN',
    ADD COLUMN IF NOT EXISTS contract_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS contractor_rfc VARCHAR(20),
    ADD COLUMN IF NOT EXISTS advance_payment_percentage NUMERIC(5,2) DEFAULT 30.00,
    ADD COLUMN IF NOT EXISTS physical_progress_planned NUMERIC(5,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS physical_progress_real NUMERIC(5,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS financial_progress NUMERIC(5,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS supervisor_name VARCHAR(200);

-- 2. Tabla de Estimaciones de Obra Pública (project_estimations)
CREATE TABLE IF NOT EXISTS project_estimations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    estimation_number INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_amount NUMERIC(14,2) NOT NULL,
    advance_amortization NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    guarantee_retention NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    net_payable NUMERIC(14,2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'VALIDATED_SUPERVISOR', 'APPROVED_TREASURY', 'PAID')),
    cfdi_uuid VARCHAR(64),
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_project_estimation_number UNIQUE (project_id, estimation_number)
);

-- 3. Tabla de Puntos de Curva S (project_s_curve_points)
CREATE TABLE IF NOT EXISTS project_s_curve_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    period_index INTEGER NOT NULL,
    period_label VARCHAR(32) NOT NULL,
    planned_progress NUMERIC(5,2) NOT NULL,
    real_physical_progress NUMERIC(5,2),
    financial_progress NUMERIC(5,2),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_project_scurve_period UNIQUE (project_id, period_index)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_estimations_project ON project_estimations(project_id, estimation_number);
CREATE INDEX IF NOT EXISTS idx_estimations_status ON project_estimations(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_scurve_project ON project_s_curve_points(project_id, period_index);

-- RLS
ALTER TABLE project_estimations ENABLE ROW LEVEL SECURITY;

CREATE POLICY estimations_tenant_isolation ON project_estimations
    FOR ALL
    USING (organization_id = current_setting('app.current_tenant', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_tenant', true)::uuid);
