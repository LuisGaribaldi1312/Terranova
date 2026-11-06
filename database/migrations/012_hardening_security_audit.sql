-- ============================================================================
-- TERRANOVA — MIGRACIÓN 012: HARDENING, AUDITORÍA OWASP Y BLINDAJE INDUSTRIAL
-- Fase 16: Ciberseguridad Defensiva, Inmutabilidad WORM y Postura de Seguridad
-- Cumplimiento: OWASP ASVS v4.0 / LGPDPPSO (México) / ISO 27001
-- ============================================================================

-- 1. Tabla de Evaluaciones de Postura de Seguridad y Auditoría OWASP Top 10
CREATE TABLE IF NOT EXISTS security_posture_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scan_trigger VARCHAR(50) NOT NULL DEFAULT 'MANUAL', -- 'SCHEDULED', 'MANUAL', 'PIPELINE_CI_CD'
    overall_score INT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLIANT',    -- 'COMPLIANT', 'WARNING', 'CRITICAL_RISK'
    owasp_a01_access_control VARCHAR(30) NOT NULL DEFAULT 'PASSED',
    owasp_a02_cryptographic VARCHAR(30) NOT NULL DEFAULT 'PASSED',
    owasp_a03_injection VARCHAR(30) NOT NULL DEFAULT 'PASSED',
    owasp_a04_insecure_design VARCHAR(30) NOT NULL DEFAULT 'PASSED',
    owasp_a05_misconfiguration VARCHAR(30) NOT NULL DEFAULT 'PASSED',
    owasp_a07_auth_failures VARCHAR(30) NOT NULL DEFAULT 'PASSED',
    rls_active_tables_count INT NOT NULL DEFAULT 12,
    tested_endpoints_count INT NOT NULL DEFAULT 48,
    critical_vulnerabilities_count INT NOT NULL DEFAULT 0,
    high_vulnerabilities_count INT NOT NULL DEFAULT 0,
    medium_vulnerabilities_count INT NOT NULL DEFAULT 0,
    scan_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    auditor_signature_hash VARCHAR(64) NOT NULL -- SHA-256 del resultado
);

-- Habilitar RLS en security_posture_scans
ALTER TABLE security_posture_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_security_scans ON security_posture_scans
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

-- 2. Tabla de Reglas de Filtrado IP y Mitigación de Fuerza Bruta / DoS
CREATE TABLE IF NOT EXISTS security_ip_reputation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    ip_cidr VARCHAR(45) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('ALLOW', 'DENY', 'CHALLENGE')),
    reason VARCHAR(255) NOT NULL,
    failed_attempts_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    CONSTRAINT unique_tenant_ip_rule UNIQUE (organization_id, ip_cidr)
);

ALTER TABLE security_ip_reputation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_ip_rules ON security_ip_reputation_rules
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

-- 3. Tabla de Manifiestos de Auditoría WORM (Write Once, Read Many)
CREATE TABLE IF NOT EXISTS audit_export_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    manifest_folio VARCHAR(60) NOT NULL UNIQUE,
    records_count INT NOT NULL CHECK (records_count >= 0),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by VARCHAR(100) NOT NULL,
    archive_checksum_sha256 VARCHAR(64) NOT NULL,
    digital_signature_hmac VARCHAR(128) NOT NULL,
    worm_locked BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE audit_export_manifests ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_audit_manifests ON audit_export_manifests
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

-- 4. Triggers de Inmutabilidad Estricta (Garantía Legal Anti-Manipulación Forense)
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'VIOLACIÓN DE SEGURIDAD LEGAL: Los registros de auditoría y trazabilidad en TERRANOVA son inmutables (WORM). Las operaciones UPDATE y DELETE están estrictamente prohibidas por ordenanza de ciberseguridad gubernamental.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger sobre audit_export_manifests
DROP TRIGGER IF EXISTS trg_prevent_manifest_tampering ON audit_export_manifests;
CREATE TRIGGER trg_prevent_manifest_tampering
    BEFORE UPDATE OR DELETE ON audit_export_manifests
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_tampering();

-- Índices de consulta rápida de auditoría y escaneos de seguridad
CREATE INDEX IF NOT EXISTS idx_security_scans_org ON security_posture_scans(organization_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_ip_rules_org ON security_ip_reputation_rules(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_audit_manifests_org ON audit_export_manifests(organization_id, generated_at DESC);
