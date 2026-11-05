# TERRANOVA — Especificación de Seguridad, Criptografía y Control de Acceso (SECURITY_SPEC.md)
**Código del Documento:** F1-07  
**Versión:** 1.0.0  
**Fecha:** 2026-11-05  
**Estándares:** OWASP ASVS v4.0 / LGPDPPSO (México) / ISO 27001  

---

## 1. Filosofía de Seguridad Defensiva
TERRANOVA gestiona información territorial crítica: coordenadas de infraestructura estratégica de agua y drenaje, avalúos de predios, identidades de propietarios y trazabilidad de licencias de construcción. La seguridad está diseñada bajo el principio de **Defensa en Profundidad (Defense in Depth)** y **Cero Confianza (Zero Trust)**.

---

## 2. Autenticación y Gestión de Sesiones

```
[USUARIO CLIENTE]
       │
       ▼ Credenciales (Email + Password + MFA Code)
[ENDPOINT /api/v1/auth/login]
       │
       ├── 1. Rate Limiting: 5 intentos por IP en 15 minutos (Redis)
       ├── 2. Hash Verification: Argon2id (Parámetros: m=65536, t=3, p=4)
       ├── 3. MFA Verification: TOTP RFC 6238 (Obligatorio para roles directivos)
       └── 4. Session Minting:
             ├── Access Token: JWT (RS256, expiración 15 minutos)
             └── Refresh Token: Token criptográfico opaco almacenado en Cookie HTTPOnly
```

### Reglas de Contraseñas:
- Longitud mínima: 12 caracteres.
- Complejidad: Al menos una mayúscula, una minúscula, un número y un símbolo.
- Verificación contra listas de contraseñas comprometidas (HaveIBeenPwned API / Bloom Filter local).

---

## 3. Matriz de Control de Acceso Basado en Roles (RBAC)

| Módulo | Superadmin | Administrador Org | Director | Coordinador GIS | Inspector Campo | Analista | Gestor | Ciudadano |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **GIS Explorer (Capas)** | Total | Total | Lectura | Total | Lectura | Lectura | Lectura | Capas Públicas |
| **Catastro (Predios)** | Total | Total | Lectura | Edición Geom | Sin Acceso | Lectura | Edición Datos | Ficha Pública |
| **Propietarios (Datos)** | Auditoría | Total | Autorizado | Sin Acceso | Sin Acceso | Anonimizado | Autorizado | Prohibido |
| **Infraestructura** | Total | Total | Lectura | Edición Geom | Bitácoras | Lectura | Lectura | Sin Acceso |
| **Incidencias** | Total | Total | Supervisión | Consulta | Captura / Cierre| Consulta | Asignación | Reportar / Seguir |
| **Obras Públicas** | Total | Total | Aprobación | Consulta Espacial| Evidencias | Consulta | Estimaciones | Semáforo Público |
| **Permisos / Trámites**| Total | Total | Resolutivo | Factibilidad | Inspección | Consulta | Armado Exp. | Solicitud Propia |
| **Auditoría (Logs)** | Global | Por Tenant | Lectura | Sin Acceso | Sin Acceso | Sin Acceso | Sin Acceso | Prohibido |

---

## 4. Aislamiento Físico y Lógico Multi-Tenant (RLS)

### Política de Aislamiento Inviolable:
Para evitar filtraciones involuntarias de datos entre administraciones municipales o empresas privadas:
1. Se activa PostgreSQL Row Level Security en todas las tablas sensibles.
2. Cada transacción de base de datos ejecutada por el servicio NestJS establece:
   ```sql
   SET LOCAL app.current_organization_id = '<uuid_tenant>';
   ```
3. Si un intento de consulta omite el filtro de tenant o intenta inyectar un ID distinto, la política SQL bloquea la lectura o escritura:
   ```sql
   CREATE POLICY rls_strict_tenant ON incidents
       AS RESTRICTIVE
       USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);
   ```

---

## 5. Criptografía y Protección de Archivos y Documentos
1. **Tránsito:** Todo el tráfico HTTP y WebSocket se cifra obligatoriamente con **TLS 1.3** con suites de cifrado modernas (HSTS activo con precarga, `max-age=31536000`).
2. **Reposo:** Los volúmenes de base de datos PostgreSQL y los buckets S3 compatibles (MinIO) se cifran mediante **AES-256 (XTS o GCM)**.
3. **Documentos Privados:** Los archivos adjuntos a expedientes catastrales y escrituras notariales se almacenan en buckets privados inaccesibles por URL pública. El acceso se otorga únicamente mediante **URLs firmadas temporalmente (Pre-signed URLs)** con vigencia máxima de 5 minutos, generadas tras verificar los permisos RBAC del usuario solicitante.

---

## 6. Registro de Auditoría Inmutable (Government-Grade Audit Trail)
Cada acción de creación, actualización o eliminación en entidades de negocio, así como la consulta a datos sensibles (propietarios catastrales), genera un registro estructurado en la tabla `audit_logs`:
```sql
INSERT INTO audit_logs (
    organization_id, user_id, action, entity_name, entity_id, 
    old_values, new_values, ip_address, user_agent
) VALUES (
    $1, $2, 'PROPERTY_OWNER_DATA_VIEWED', 'properties', $3,
    NULL, json_build_object('cadastral_key', $4), $5, $6
);
```
Los registros de auditoría tienen permisos de solo inserción (`INSERT ONLY`) y se exportan diariamente a almacenamiento inmutable WORM (*Write Once, Read Many*) para prevenir alteraciones forenses.
