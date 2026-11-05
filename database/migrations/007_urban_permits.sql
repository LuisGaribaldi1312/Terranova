-- ==============================================================================
-- TERRANOVA DATABASE MIGRATION 007: URBAN PERMITS & EXPEDIENTES DIGITALES
-- Licencias de Construcción, Uso de Suelo, Alineamiento, DRO y Compatibilidad PDU
-- ==============================================================================

CREATE TABLE IF NOT EXISTS urban_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    folio VARCHAR(64) UNIQUE NOT NULL, -- Folio oficial: LIC-USO-2026-00412, LIC-OBR-2026-00105
    permit_type VARCHAR(64) NOT NULL,
    cadastral_key VARCHAR(64) NOT NULL,
    property_address VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(128) NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_rfc VARCHAR(20),
    applicant_email VARCHAR(128),
    applicant_phone VARCHAR(32),
    dro_name VARCHAR(255), -- Director Responsable de Obra
    dro_license_number VARCHAR(64), -- Registro pericial oficial ante el municipio
    project_description TEXT NOT NULL,
    proposed_built_area_m2 NUMERIC(10,2) DEFAULT 0.00,
    levels_count INTEGER DEFAULT 1,
    pdu_zone_classification VARCHAR(64) NOT NULL DEFAULT 'H-2 (Habitacional Densidad Media)',
    zoning_compliance_status VARCHAR(32) NOT NULL DEFAULT 'COMPATIBLE' CHECK (zoning_compliance_status IN ('COMPATIBLE', 'CONDICIONADO', 'INCOMPATIBLE')),
    status VARCHAR(32) NOT NULL DEFAULT 'Ingresado' CHECK (status IN ('Ingresado', 'En Revisión Técnica', 'Prevención / Observaciones', 'Dictamen Favorable', 'Aprobado y Sellado', 'Rechazado')),
    official_digital_seal VARCHAR(128), -- Sello criptográfico SHA-256
    qr_verification_code VARCHAR(128),
    technical_notes TEXT,
    issued_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    geom GEOMETRY(Geometry, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requisitos y Checklist Documental Oficial
CREATE TABLE IF NOT EXISTS permit_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permit_id UUID NOT NULL REFERENCES urban_permits(id) ON DELETE CASCADE,
    document_name VARCHAR(128) NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    status VARCHAR(32) DEFAULT 'VALIDADO' CHECK (status IN ('PENDIENTE', 'VALIDADO', 'OBSERVADO')),
    file_url VARCHAR(255),
    validated_by VARCHAR(128),
    validated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices optimizados
CREATE INDEX IF NOT EXISTS idx_permits_folio ON urban_permits (folio);
CREATE INDEX IF NOT EXISTS idx_permits_cadastral_key ON urban_permits (cadastral_key);
CREATE INDEX IF NOT EXISTS idx_permits_org_status ON urban_permits (organization_id, status);
CREATE INDEX IF NOT EXISTS idx_permits_geom ON urban_permits USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_requirements_permit ON permit_requirements (permit_id);

-- Row Level Security (RLS)
ALTER TABLE urban_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE permit_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY permits_tenant_isolation ON urban_permits
    FOR ALL
    USING (organization_id = current_setting('app.current_tenant', true)::uuid)
    WITH CHECK (organization_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY requirements_tenant_isolation ON permit_requirements
    FOR ALL
    USING (permit_id IN (
        SELECT id FROM urban_permits WHERE organization_id = current_setting('app.current_tenant', true)::uuid
    ));
