-- ====================================================================
-- TERRANOVA — SEEDS INICIALES 001: DATOS OFICIALES Y ORGANIZACIONES
-- ====================================================================

-- 1. Organización Piloto: H. Ayuntamiento de Puebla
INSERT INTO organizations (id, code, legal_name, trade_name, tenant_type, cve_ent, cve_mun, settings)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'MUN-PUE-001',
    'Municipio de Puebla, Gobierno Municipal Constitucional',
    'H. Ayuntamiento de Puebla',
    'MUNICIPALITY',
    '21',
    '114',
    '{"crs": "EPSG:32614", "timezone": "America/Mexico_City"}'::jsonb
) ON CONFLICT (code) DO NOTHING;

-- 2. Departamentos
INSERT INTO departments (id, organization_id, name, code, description)
VALUES 
    ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Dirección de Catastro Municipal', 'CAT', 'Administración del padrón catastral'),
    ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Secretaría de Infraestructura y Obras', 'INFRA', 'Conservación urbana y obras públicas')
ON CONFLICT (organization_id, code) DO NOTHING;

-- 3. Roles del Sistema
INSERT INTO roles (id, organization_id, name, slug, description, is_system_role)
VALUES
    ('d4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Director Territorial', 'director', 'Acceso gerencial y resolutivo', TRUE),
    ('e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Coordinador GIS', 'gis_coordinator', 'Administrador de capas cartográficas', TRUE),
    ('f6a7b89c-0d1e-2f3a-4b5c-6d7e8f9a0b1c', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Inspector de Campo', 'inspector', 'Brigadista móvil en PWA offline', TRUE)
ON CONFLICT DO NOTHING;

-- 4. Usuario Inicial Semilla (Password: Terranova2026!*)
INSERT INTO users (id, email, password_hash, first_name, last_name, job_title, is_active)
VALUES (
    '11223344-5566-7788-99aa-bbccddeeff00',
    'admin.territorial@puebla.gob.mx',
    '$2b$12$Z21ZxsQ3z7LACtj3oy7mtu6Q23vHCJchuU/6dQacMtMPRcnWkotDW',
    'Ing. Arq. Alejandro',
    'Ramírez Santillán',
    'Director General de Gestión Territorial',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- 5. Membresía del Usuario en el H. Ayuntamiento de Puebla
INSERT INTO organization_members (organization_id, user_id, role_id, is_active)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    '11223344-5566-7788-99aa-bbccddeeff00',
    'd4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a',
    TRUE
) ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 6. Predio Catastral de Referencia con Polígono Validado en Puebla
INSERT INTO properties (
    organization_id, cadastral_key, property_type, land_use, status, 
    land_area_sqm, built_area_sqm, cadastral_value, address_street, address_neighborhood, 
    geom
) VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    '21-114-001-045-0012-000',
    'URBANO',
    'HABITACIONAL',
    'REGISTERED',
    485.50,
    320.00,
    3450000.00,
    'Av. Juárez 2108',
    'Col. La Paz',
    ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(-98.2285 19.0512, -98.2275 19.0512, -98.2275 19.0505, -98.2285 19.0505, -98.2285 19.0512)')), 4326)
) ON CONFLICT (organization_id, cadastral_key) DO NOTHING;
