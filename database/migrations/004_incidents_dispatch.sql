-- ============================================================================
-- TERRANOVA — MIGRACIÓN 004: MESA DE CONTROL DE INCIDENCIAS URBANAS Y DESPACHO
-- Fase 08: SLA, Despacho de Cuadrillas, Canales de Atención y Cierre Técnico
-- ============================================================================

ALTER TABLE incidents
    ADD COLUMN IF NOT EXISTS street VARCHAR(200),
    ADD COLUMN IF NOT EXISTS cross_streets VARCHAR(200),
    ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(150),
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
    ADD COLUMN IF NOT EXISTS citizen_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS citizen_phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS source_channel VARCHAR(50) DEFAULT 'PORTAL',
    ADD COLUMN IF NOT EXISTS assigned_crew VARCHAR(150),
    ADD COLUMN IF NOT EXISTS sla_hours INT DEFAULT 72,
    ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

-- Índices de Mesa de Control y Despacho Operativo
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(organization_id, priority);
CREATE INDEX IF NOT EXISTS idx_incidents_sla ON incidents(organization_id, sla_deadline);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(organization_id, incident_type);
CREATE INDEX IF NOT EXISTS idx_incidents_channel ON incidents(organization_id, source_channel);

-- Comentarios explicativos
COMMENT ON TABLE incidents IS 'Mesa de Control Oficial de Incidencias Urbanas y Reportes Ciudadanos con SLA y Despacho';
COMMENT ON TABLE incident_updates IS 'Trazabilidad Inmutable del Flujo de Estados de Incidencias Urbanas';
