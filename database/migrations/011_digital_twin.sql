-- ==============================================================================
-- TERRANOVA — Migración 011: Modelado Urbano 3D, Terreno y Gemelo Digital
-- Soporta el gemelo digital territorial fotorrealista (Fase 15: TERRANOVA 3D TWIN)
-- ==============================================================================

-- 1. Tabla de Edificaciones y Volúmenes 3D (LoD1 / LoD2)
CREATE TABLE IF NOT EXISTS digital_twin_buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    cadastral_key VARCHAR(50) NOT NULL,
    building_name VARCHAR(150),
    zoning_code VARCHAR(50) NOT NULL,
    levels_count INT NOT NULL DEFAULT 1,
    height_meters NUMERIC(6, 2) NOT NULL DEFAULT 3.20,
    ground_elevation_meters NUMERIC(6, 2) NOT NULL DEFAULT 2150.00, -- Cota sobre nivel del mar (Valle de Puebla)
    footprint_area_m2 NUMERIC(10, 2) NOT NULL,
    total_construction_m2 NUMERIC(10, 2) NOT NULL,
    lod_level VARCHAR(10) NOT NULL DEFAULT 'LoD1',                 -- 'LoD1' (bloque), 'LoD2' (techos/cubiertas), 'LoD3'
    centroid_coordinates GEOMETRY(Point, 4326),
    footprint_geometry GEOMETRY(Polygon, 4326),
    bim_model_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dt_buildings_org ON digital_twin_buildings(organization_id);
CREATE INDEX IF NOT EXISTS idx_dt_buildings_cadastral ON digital_twin_buildings(cadastral_key);
CREATE INDEX IF NOT EXISTS idx_dt_buildings_geom ON digital_twin_buildings USING GIST(footprint_geometry);

-- 2. Tabla de Estudios de Sombra Solar y Escorrentías
CREATE TABLE IF NOT EXISTS digital_twin_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    simulation_type VARCHAR(50) NOT NULL, -- 'SOLAR_SHADOW', 'HYDROLOGICAL_RUNOFF', 'WIND_TUNNEL'
    title VARCHAR(200) NOT NULL,
    parameters JSONB NOT NULL,            -- Parámetros (hora del día, azimut solar, mm/h precipitación)
    results_summary JSONB NOT NULL,       -- Métricas de impacto (área de sombra m2, predios afectados)
    simulated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dt_simulations_org ON digital_twin_simulations(organization_id);
CREATE INDEX IF NOT EXISTS idx_dt_simulations_type ON digital_twin_simulations(simulation_type);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE digital_twin_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY dt_buildings_tenant_isolation ON digital_twin_buildings
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

CREATE POLICY dt_simulations_tenant_isolation ON digital_twin_simulations
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

COMMENT ON TABLE digital_twin_buildings IS 'Volúmenes urbanos tridimensionales con cotas y alturas catastrales reales (Fase 15)';
COMMENT ON TABLE digital_twin_simulations IS 'Registro de simulaciones de conos de sombra solar y escorrentías pluviales';
