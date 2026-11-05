# TERRANOVA: Modelo Inicial de Base de Datos
## Esquema Relacional & Geoespacial (PostgreSQL 16 + PostGIS)
**Estándar Geográfico:** WGS 84 (SRID 4326) con transformaciones a ITRF2008 (SRID 6362) para México

---

### 1. Convenciones Generales
- Llaves primarias: `UUIDv4` (`gen_random_uuid()`).
- Fechas y Horas: `timestamptz` en formato UTC.
- Llave foránea transversal: `organization_id` obligatoria en toda entidad de negocio.
- Borrado Lógico: columna `deleted_at timestamptz NULL` en entidades críticas para auditoría legal.
- Índices Espaciales: `GIST` en todas las columnas `geometry`.

---

### 2. Módulo de Organizaciones, Usuarios y Seguridad

```sql
-- 1. Organizaciones (Tenants: Municipios, Desarrolladoras, Gobiernos Estatales)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- Ej: 'MUN-PUE-001', 'DEV-GDL-URB'
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255) NOT NULL,
    tenant_type VARCHAR(50) NOT NULL, -- 'MUNICIPALITY', 'STATE_GOV', 'DEVELOPER', 'CONSTRUCTION', 'CONSULTING'
    cve_ent VARCHAR(2), -- Clave INEGI Estado (01..32)
    cve_mun VARCHAR(3), -- Clave INEGI Municipio (001..2477)
    subscription_plan VARCHAR(50) DEFAULT 'STARTER', -- 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'
    settings JSONB DEFAULT '{}'::jsonb, -- Configuración de marca, límites, logos, CRS local
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 2. Departamentos / Direcciones (Obras Públicas, Catastro, Servicios Públicos, etc.)
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- 3. Roles y Permisos Granulares
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL para roles globales
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL, -- 'superadmin', 'admin', 'director', 'gis_coordinator', 'inspector', etc.
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL, -- 'gis:layer:create', 'properties:read_owners', 'incidents:resolve', etc.
    module VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY(role_id, permission_id)
);

-- 4. Usuarios
CREATE TABLE users (
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

-- 5. Membresía y Asignación de Roles por Organización
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);
```

---

### 3. Módulo Territorial y Catastral (INEGI + Predios)

```sql
-- 6. Territorios Jerárquicos de México (Estados, Municipios, Colonias/Localidades)
CREATE TABLE territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES territories(id),
    name VARCHAR(150) NOT NULL,
    territory_type VARCHAR(50) NOT NULL, -- 'STATE', 'MUNICIPALITY', 'LOCALITY', 'SECTOR', 'COLONIA', 'AGEB'
    cve_geo VARCHAR(20), -- Clave INEGI compuesta (Ej. 2111400010123)
    cve_ent VARCHAR(2),
    cve_mun VARCHAR(3),
    cve_loc VARCHAR(4),
    cve_ageb VARCHAR(4),
    postal_code VARCHAR(10),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb, -- Habitantes, marginación, área en m2
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_territories_geom ON territories USING GIST(geom);
CREATE INDEX idx_territories_org ON territories(organization_id);

-- 7. Capas del Sistema GIS (Map Layers)
CREATE TABLE map_layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'URBAN', 'ENVIRONMENT', 'SERVICES', 'RISK', 'CADASTRE'
    layer_type VARCHAR(50) NOT NULL, -- 'POINT', 'LINESTRING', 'POLYGON', 'VECTOR_TILE', 'WMS'
    style_definition JSONB NOT NULL, -- Color, opacidad, grosor, iconos MapLibre
    is_public BOOLEAN DEFAULT FALSE,
    is_default_active BOOLEAN DEFAULT TRUE,
    z_index INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Elementos Geográficos Dinámicos (Features de Capas Personalizadas)
CREATE TABLE geographic_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    layer_id UUID NOT NULL REFERENCES map_layers(id) ON DELETE CASCADE,
    name VARCHAR(200),
    properties JSONB DEFAULT '{}'::jsonb,
    geom GEOMETRY(Geometry, 4326) NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_geo_features_geom ON geographic_features USING GIST(geom);

-- 9. Predios y Catastro (TERRANOVA PROPERTIES)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    territory_id UUID REFERENCES territories(id),
    cadastral_key VARCHAR(50) NOT NULL, -- Clave catastral oficial (Ej. 01-002-045-001-000)
    property_type VARCHAR(50) NOT NULL, -- 'URBANO', 'SUBURBANO', 'RUSTICO', 'COMERCIAL', 'INDUSTRIAL'
    land_use VARCHAR(50) NOT NULL, -- 'HABITACIONAL', 'MIXTO', 'COMERCIAL', 'EQUIPAMIENTO', 'RESERVA'
    status VARCHAR(50) DEFAULT 'REGISTERED', -- 'REGISTERED', 'UNDER_REVIEW', 'DISPUTED', 'ARCHIVED'
    land_area_sqm NUMERIC(12, 2) NOT NULL, -- Área de terreno en m2
    built_area_sqm NUMERIC(12, 2) DEFAULT 0.00, -- Área construida en m2
    levels_count INT DEFAULT 1,
    cadastral_value NUMERIC(15, 2), -- Valor catastral estimado
    address_street VARCHAR(200),
    address_exterior_num VARCHAR(50),
    address_interior_num VARCHAR(50),
    address_neighborhood VARCHAR(150),
    address_postal_code VARCHAR(10),
    owner_info JSONB, -- Encriptado / Con acceso restringido por roles
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, cadastral_key)
);
CREATE INDEX idx_properties_geom ON properties USING GIST(geom);
CREATE INDEX idx_properties_org_cad ON properties(organization_id, cadastral_key);
```

---

### 4. Módulo de Infraestructura, Incidencias y Obras Públicas

```sql
-- 10. Activos de Infraestructura Urbana (TERRANOVA INFRASTRUCTURE)
CREATE TABLE infrastructure_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    asset_code VARCHAR(50) NOT NULL, -- 'ALM-2026-00452', 'SEM-AV-012'
    asset_type VARCHAR(50) NOT NULL, -- 'LIGHTING', 'TRAFFIC_LIGHT', 'WATER_NETWORK', 'DRAINAGE', 'PARK', 'PAVEMENT'
    status VARCHAR(50) DEFAULT 'OPERATIONAL', -- 'OPERATIONAL', 'MAINTENANCE_REQUIRED', 'DAMAGED', 'DECOMMISSIONED'
    model_or_brand VARCHAR(150),
    installation_date DATE,
    estimated_lifespan_months INT,
    last_inspection_date TIMESTAMPTZ,
    geom GEOMETRY(Geometry, 4326) NOT NULL, -- Puede ser Point (luminaria), LineString (tubería/calle) o Polygon (parque)
    attributes JSONB DEFAULT '{}'::jsonb, -- Potencia en watts, diámetro de tubería, tipo de material, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_infra_assets_geom ON infrastructure_assets USING GIST(geom);

-- 11. Incidencias Urbanas (TERRANOVA INCIDENTS)
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    folio VARCHAR(30) UNIQUE NOT NULL, -- Ej. 'INC-2026-000847'
    incident_type VARCHAR(50) NOT NULL, -- 'POTHOLE', 'WATER_LEAK', 'LIGHTING_FAIL', 'TRASH_ACCUMULATION', etc.
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status VARCHAR(30) DEFAULT 'RECEIVED', -- 'RECEIVED', 'VALIDATED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'
    department_id UUID REFERENCES departments(id),
    assigned_to UUID REFERENCES users(id),
    reported_by_citizen BOOLEAN DEFAULT FALSE,
    citizen_report_id UUID,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    address_reference TEXT,
    geom GEOMETRY(Point, 4326) NOT NULL,
    evidence_photos JSONB DEFAULT '[]'::jsonb, -- URLs y metadatos de fotos antes
    resolution_photos JSONB DEFAULT '[]'::jsonb, -- URLs y metadatos de fotos después
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_incidents_geom ON incidents USING GIST(geom);
CREATE INDEX idx_incidents_status ON incidents(organization_id, status);

-- 12. Historial de Seguimiento de Incidencia
CREATE TABLE incident_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    comment TEXT,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Obras y Proyectos Urbanos (TERRANOVA PROJECTS)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- 'OBR-2026-004'
    name VARCHAR(255) NOT NULL,
    project_type VARCHAR(50) NOT NULL, -- 'VIALIDAD', 'HIDRAULICA', 'ELECTRIFICACION', 'EQUIPAMIENTO_URBANO'
    status VARCHAR(30) DEFAULT 'PLANNED', -- 'PLANNED', 'TENDERED', 'IN_EXECUTION', 'SUSPENDED', 'COMPLETED'
    budget_allocated NUMERIC(15, 2) NOT NULL,
    budget_exercised NUMERIC(15, 2) DEFAULT 0.00,
    contractor_name VARCHAR(200),
    contractor_rfc VARCHAR(20),
    supervisor_id UUID REFERENCES users(id),
    progress_percentage NUMERIC(5, 2) DEFAULT 0.00,
    start_date DATE,
    scheduled_end_date DATE,
    actual_end_date DATE,
    geom GEOMETRY(Geometry, 4326) NOT NULL, -- Línea de calle, polígono de parque o punto de instalación
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_projects_geom ON projects USING GIST(geom);
```

---

### 5. Sincronización Offline y Auditoría

```sql
-- 14. Cola y Registro de Sincronización Offline (TERRANOVA SYNC)
CREATE TABLE sync_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    client_operation_id UUID NOT NULL, -- UUID generado offline por la PWA
    entity_type VARCHAR(50) NOT NULL, -- 'incidents', 'inspections', 'infrastructure_assets'
    operation_type VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    payload JSONB NOT NULL,
    client_timestamp TIMESTAMPTZ NOT NULL,
    server_timestamp TIMESTAMPTZ DEFAULT NOW(),
    sync_status VARCHAR(30) DEFAULT 'APPLIED', -- 'APPLIED', 'CONFLICT_RESOLVED', 'REJECTED'
    conflict_notes TEXT,
    UNIQUE(organization_id, client_operation_id)
);

-- 15. Trazabilidad y Auditoría de Grado Gubernamental (Audit Logs)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'PROPERTY_OWNER_ACCESSED', 'INCIDENT_DELETED', 'USER_ROLE_CHANGED'
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_org_date ON audit_logs(organization_id, created_at DESC);
```
