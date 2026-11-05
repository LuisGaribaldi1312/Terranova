-- ============================================================================
-- TERRANOVA — MIGRACIÓN 002: CATASTRO AVANZADO Y RÉGIMEN TERRITORIAL
-- Fase 06: Ampliación de Cédula Catastral, Linderos, Avalúo y Estatus Predial
-- ============================================================================

ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS property_regime VARCHAR(50) DEFAULT 'PRIVADA',
    ADD COLUMN IF NOT EXISTS land_value_unit_sqm NUMERIC(12, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS construction_value_unit_sqm NUMERIC(12, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS land_cadastral_value NUMERIC(15, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS construction_cadastral_value NUMERIC(15, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS tax_status VARCHAR(50) DEFAULT 'CURRENT',
    ADD COLUMN IF NOT EXISTS annual_property_tax NUMERIC(12, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS tax_debt_amount NUMERIC(12, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS boundary_north TEXT,
    ADD COLUMN IF NOT EXISTS boundary_south TEXT,
    ADD COLUMN IF NOT EXISTS boundary_east TEXT,
    ADD COLUMN IF NOT EXISTS boundary_west TEXT,
    ADD COLUMN IF NOT EXISTS cadastral_certificate_folio VARCHAR(50),
    ADD COLUMN IF NOT EXISTS cadastral_certificate_issued_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS digital_stamp VARCHAR(256);

-- Índices de consulta rápida para Catastro
CREATE INDEX IF NOT EXISTS idx_properties_tax_status ON properties(organization_id, tax_status);
CREATE INDEX IF NOT EXISTS idx_properties_regime ON properties(organization_id, property_regime);
CREATE INDEX IF NOT EXISTS idx_properties_land_use ON properties(organization_id, land_use);

-- Comentario descriptivo en el catálogo del sistema
COMMENT ON TABLE properties IS 'Padrón Catastral Oficial con linderos, avalúo, régimen jurídico y proyección EPSG:6362';
