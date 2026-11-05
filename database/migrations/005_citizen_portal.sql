-- ==============================================================================
-- TERRANOVA DATABASE MIGRATION 005: CITIZEN PORTAL & TAX BILLS
-- Soporte para Portal Ciudadano de Autoservicio, Estados de Cuenta y Líneas de Captura Bancarias
-- ==============================================================================

CREATE TABLE IF NOT EXISTS property_tax_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id VARCHAR(64) NOT NULL,
    property_id VARCHAR(64) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    fiscal_year INTEGER NOT NULL DEFAULT 2026,
    cadastral_key VARCHAR(64) NOT NULL,
    taxpayer_name VARCHAR(255) NOT NULL,
    cadastral_value NUMERIC(14,2) NOT NULL,
    base_tax_amount NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_due NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'EXPIRED')),
    payment_line VARCHAR(64) UNIQUE NOT NULL, -- Línea de captura bancaria oficial (20 dígitos con dígito verificador)
    paid_at TIMESTAMPTZ,
    payment_method VARCHAR(64), -- 'SPEI', 'VENTANILLA_BANCARIA', 'TARJETA_CREDITO'
    payment_reference VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

-- Índices de consulta rápida ciudadana
CREATE INDEX IF NOT EXISTS idx_tax_bills_cadastral_key ON property_tax_bills (cadastral_key);
CREATE INDEX IF NOT EXISTS idx_tax_bills_payment_line ON property_tax_bills (payment_line);
CREATE INDEX IF NOT EXISTS idx_tax_bills_org_status ON property_tax_bills (organization_id, payment_status);

-- Seguridad Row Level Security (RLS)
ALTER TABLE property_tax_bills ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública por línea de captura o clave catastral validada
CREATE POLICY tax_bills_public_lookup ON property_tax_bills
    FOR SELECT
    USING (true);

-- Política de mutación restringida a funcionarios del tenant
CREATE POLICY tax_bills_tenant_isolation ON property_tax_bills
    FOR ALL
    USING (organization_id = current_setting('app.current_tenant', true))
    WITH CHECK (organization_id = current_setting('app.current_tenant', true));

-- Vista de consulta pública para simplificar respuestas sin exponer IDs internos
CREATE OR REPLACE VIEW citizen_public_tax_statement AS
SELECT 
    b.payment_line,
    b.cadastral_key,
    b.taxpayer_name,
    b.fiscal_year,
    b.cadastral_value,
    b.base_tax_amount,
    b.discount_amount,
    b.total_due,
    b.payment_status,
    b.expires_at,
    p.address,
    p.neighborhood,
    p.land_area_m2,
    p.built_area_m2
FROM property_tax_bills b
JOIN properties p ON b.property_id = p.id;
