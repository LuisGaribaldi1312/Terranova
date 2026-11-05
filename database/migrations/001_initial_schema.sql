-- ====================================================================
-- TERRANOVA — MIGRACIÓN INICIAL 001: ESQUEMA RELACIONAL Y POSTGIS
-- Estándar: Marco Geoestadístico Nacional (INEGI) y RLS Multi-Tenant
-- ====================================================================

-- 1. Habilitar extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Esquema de Tenancy, Organizaciones y Seguridad
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- Ej: 'MUN-PUE-001', 'DEV-NL-088'
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255) NOT NULL,
    tenant_type VARCHAR(50) NOT NULL, -- 'MUNICIPALITY', 'STATE_GOV', 'DEVELOPER', 'CONSTRUCTION'
    cve_ent VARCHAR(2), -- Clave INEGI Estado (01..32)
    cve_mun VARCHAR(3), -- Clave INEGI Municipio (001..2477)
    subscription_plan VARCHAR(50) DEFAULT 'STARTER',
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    job_title VARCHAR(100),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 3. Territorios INEGI MGN (Estados, Municipios, Colonias, AGEBs)
CREATE TABLE IF NOT EXISTS territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES territories(id),
    name VARCHAR(150) NOT NULL,
    territory_type VARCHAR(50) NOT NULL, -- 'STATE', 'MUNICIPALITY', 'LOCALITY', 'SECTOR', 'COLONIA', 'AGEB'
    cve_geo VARCHAR(20),
    cve_ent VARCHAR(2),
    cve_mun VARCHAR(3),
    cve_loc VARCHAR(4),
    cve_ageb VARCHAR(4),
    postal_code VARCHAR(10),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_territories_geom ON territories USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_territories_org ON territories(organization_id);

-- 4. Capas del Sistema GIS
CREATE TABLE IF NOT EXISTS map_layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    layer_type VARCHAR(50) NOT NULL,
    style_definition JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    is_default_active BOOLEAN DEFAULT TRUE,
    z_index INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geographic_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    layer_id UUID NOT NULL REFERENCES map_layers(id) ON DELETE CASCADE,
    name VARCHAR(200),
    properties JSONB DEFAULT '{}'::jsonb,
    geom GEOMETRY(Geometry, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_geo_features_geom ON geographic_features USING GIST(geom);

-- 5. Predios y Catastro (TERRANOVA PROPERTIES)
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    territory_id UUID REFERENCES territories(id),
    cadastral_key VARCHAR(50) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    land_use VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'REGISTERED',
    land_area_sqm NUMERIC(12, 2) NOT NULL,
    built_area_sqm NUMERIC(12, 2) DEFAULT 0.00,
    levels_count INT DEFAULT 1,
    cadastral_value NUMERIC(15, 2),
    address_street VARCHAR(200),
    address_neighborhood VARCHAR(150),
    address_postal_code VARCHAR(10),
    owner_info JSONB,
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, cadastral_key)
);
CREATE INDEX IF NOT EXISTS idx_properties_geom ON properties USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_properties_org_key ON properties(organization_id, cadastral_key);

-- 6. Activos de Infraestructura Urbana (TERRANOVA INFRASTRUCTURE)
CREATE TABLE IF NOT EXISTS infrastructure_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    asset_code VARCHAR(50) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'OPERATIONAL',
    model_or_brand VARCHAR(150),
    installation_date DATE,
    geom GEOMETRY(Geometry, 4326) NOT NULL,
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_infra_assets_geom ON infrastructure_assets USING GIST(geom);

-- 7. Incidencias Urbanas (TERRANOVA INCIDENTS)
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    folio VARCHAR(30) UNIQUE NOT NULL,
    incident_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(30) DEFAULT 'RECEIVED',
    department_id UUID REFERENCES departments(id),
    assigned_to UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    address_reference TEXT,
    geom GEOMETRY(Point, 4326) NOT NULL,
    evidence_photos JSONB DEFAULT '[]'::jsonb,
    resolution_photos JSONB DEFAULT '[]'::jsonb,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_incidents_geom ON incidents USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(organization_id, status);

CREATE TABLE IF NOT EXISTS incident_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Obras y Proyectos Urbanos (TERRANOVA PROJECTS)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    project_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'PLANNED',
    budget_allocated NUMERIC(15, 2) NOT NULL,
    budget_exercised NUMERIC(15, 2) DEFAULT 0.00,
    contractor_name VARCHAR(200),
    progress_percentage NUMERIC(5, 2) DEFAULT 0.00,
    start_date DATE,
    scheduled_end_date DATE,
    geom GEOMETRY(Geometry, 4326) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_geom ON projects USING GIST(geom);

-- 9. Sincronización Offline (Idempotencia y Transaccionalidad)
CREATE TABLE IF NOT EXISTS sync_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    client_operation_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    operation_type VARCHAR(20) NOT NULL,
    payload JSONB NOT NULL,
    client_timestamp TIMESTAMPTZ NOT NULL,
    server_timestamp TIMESTAMPTZ DEFAULT NOW(),
    sync_status VARCHAR(30) DEFAULT 'APPLIED',
    conflict_notes TEXT,
    UNIQUE(organization_id, client_operation_id)
);

-- 10. Bitácora de Auditoría Inmutable (Audit Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_date ON audit_logs(organization_id, created_at DESC);

-- ====================================================================
-- 11. Habilitación de PostgreSQL Row Level Security (RLS)
-- ====================================================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographic_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento multi-tenant
DROP POLICY IF EXISTS tenant_isolation_properties ON properties;
CREATE POLICY tenant_isolation_properties ON properties
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

DROP POLICY IF EXISTS tenant_isolation_incidents ON incidents;
CREATE POLICY tenant_isolation_incidents ON incidents
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

DROP POLICY IF EXISTS tenant_isolation_infrastructure ON infrastructure_assets;
CREATE POLICY tenant_isolation_infrastructure ON infrastructure_assets
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

DROP POLICY IF EXISTS tenant_isolation_projects ON projects;
CREATE POLICY tenant_isolation_projects ON projects
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
