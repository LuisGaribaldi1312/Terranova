-- ==============================================================================
-- TERRANOVA — Migración 009: Vistas y Agregaciones Espaciales de BI & Heatmaps
-- Soporta el motor de analítica territorial e inteligencia de negocios (Fase 13)
-- ==============================================================================

-- 1. Tabla de Agregados Pre-calculados por Colonia / Cuadrante
CREATE TABLE IF NOT EXISTS analytics_neighborhood_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    neighborhood_name VARCHAR(150) NOT NULL,
    municipality_code VARCHAR(10) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_incidents INT NOT NULL DEFAULT 0,
    resolved_incidents INT NOT NULL DEFAULT 0,
    sla_breached_incidents INT NOT NULL DEFAULT 0,
    avg_mttr_hours NUMERIC(8, 2) NOT NULL DEFAULT 0.00,  -- Mean Time to Resolution
    urban_health_index NUMERIC(5, 2) NOT NULL DEFAULT 100.00, -- Índice de Salud Urbana (0-100)
    total_infrastructure_assets INT NOT NULL DEFAULT 0,
    active_construction_permits INT NOT NULL DEFAULT 0,
    estimated_maintenance_cost_mxn NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    centroid_coordinates GEOMETRY(Point, 4326),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_neigh_org ON analytics_neighborhood_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_neigh_period ON analytics_neighborhood_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_analytics_neigh_geom ON analytics_neighborhood_metrics USING GIST(centroid_coordinates);

-- 2. Función PostGIS para Agregación en Cuadrícula de Calor (Spatial Grid Heatmap)
-- Agrupa cientos de miles de puntos de incidencia en celdas espaciales de alta velocidad
CREATE OR REPLACE FUNCTION get_spatial_heatmap_grid(
    p_org_id UUID,
    p_grid_size_degrees DOUBLE PRECISION DEFAULT 0.005 -- ~500 metros en el ecuador
)
RETURNS TABLE (
    grid_lng DOUBLE PRECISION,
    grid_lat DOUBLE PRECISION,
    incident_count BIGINT,
    intensity_weight DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        ST_X(ST_Centroid(ST_SnapToGrid(coordinates::geometry, p_grid_size_degrees))) AS grid_lng,
        ST_Y(ST_Centroid(ST_SnapToGrid(coordinates::geometry, p_grid_size_degrees))) AS grid_lat,
        COUNT(*) AS incident_count,
        SUM(
            CASE priority
                WHEN 'CRITICAL' THEN 4.0
                WHEN 'HIGH' THEN 2.5
                WHEN 'MEDIUM' THEN 1.5
                ELSE 1.0
            END
        ) AS intensity_weight
    FROM incidents
    WHERE organization_id = p_org_id
    GROUP BY ST_SnapToGrid(coordinates::geometry, p_grid_size_degrees);
$$;

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE analytics_neighborhood_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_neigh_metrics_tenant_isolation ON analytics_neighborhood_metrics
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

COMMENT ON TABLE analytics_neighborhood_metrics IS 'Métricas agregadas y consolidadas de rendimiento urbano y salud territorial por colonia (Fase 13)';
COMMENT ON FUNCTION get_spatial_heatmap_grid IS 'Agregación espacial de alto rendimiento en cuadrícula para mapas de calor georreferenciados';
