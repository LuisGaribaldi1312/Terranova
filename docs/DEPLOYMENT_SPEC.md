# TERRANOVA — Especificación de Modelos de Despliegue Híbrido (DEPLOYMENT_SPEC.md)
**Código del Documento:** F1-08  
**Versión:** 1.0.0  
**Fecha:** 2026-11-05  
**Modelos:** Cloud Compartido · Cloud Dedicado · Private On-premise  

---

## 1. Visión del Modelo Híbrido
Una ventaja competitiva crucial de TERRANOVA es su capacidad de desplegarse indistintamente como un servicio SaaS multiorganización en la nube pública, o como una instalación privada dedicada en servidores propios de gobiernos estatales o grandes corporativos, **utilizando exactamente el mismo núcleo de código fuente**.

```
                           +-------------------------------------------------+
                           |           TERRANOVA CORE CODEBASE               |
                           |   (React PWA + NestJS + PostGIS + MapLibre)     |
                           +-------------------------------------------------+
                                                    │
                 ┌──────────────────────────────────┼──────────────────────────────────┐
                 ▼                                  ▼                                  ▼
    [ESCENARIO A: CLOUD SAAS]           [ESCENARIO B: CLOUD DEDICADO]      [ESCENARIO C: PRIVATE ON-PREMISE]
    - Multi-tenant compartido           - Infraestructura aislada          - Servidores locales / Air-gapped
    - Aislamiento lógico RLS            - Base de datos independiente      - Cero dependencia externa
    - Suscripción mensual recurrente    - Gestión administrada en nube     - Licencia criptográfica offline
    - Escalabilidad elástica            - SLA y soporte preferencial       - Cumplimiento de soberanía de datos
```

---

## 2. Comparativa Técnica de Escenarios

| Parámetro | Escenario A: Cloud SaaS | Escenario B: Cloud Dedicado | Escenario C: Private On-premise |
|---|---|---|---|
| **Público Objetivo** | Pequeños municipios, desarrolladoras y consultorías | Gobiernos municipales medianos o grandes constructoras | Gobiernos estatales, secretarías de estado, seguridad |
| **Infraestructura** | Servidores compartidos de alta disponibilidad | Instancias de cómputo y base de datos dedicadas | Centro de datos del cliente o nube privada (AWS/Azure/GCP) |
| **Aislamiento de Datos** | Lógico mediante PostgreSQL Row Level Security (RLS) | Físico (Instancia de PostgreSQL exclusiva) | Físico y perimetral en la red interna del cliente |
| **Validación de Licencia**| Verificación en línea contra el Billing Gateway | Token criptográfico renovado automáticamente | Archivo de licencia firmado digitalmente (RSA-4096) offline |
| **Almacenamiento Archivos**| Amazon S3 / Google Cloud Storage | Bucket S3 dedicado | MinIO local o Storage Area Network (SAN/NFS) |
| **Actualizaciones** | Continuas y centralizadas (CI/CD) | Programadas con ventana de mantenimiento | Paquetes de versión controlados (Docker Images / Helm) |

---

## 3. Mecanismo de Licenciamiento Offline (Escenario Private)
Para garantizar que una instalación privada gubernamental no dependa permanentemente de una conexión al servidor central de TERRANOVA:
1. Al formalizar el contrato, se genera un archivo `terranova.lic` cifrado y firmado con una clave privada RSA-4096 de TERRANOVA.
2. El archivo contiene en su payload JSON:
   - `organization_id` y `legal_name`.
   - Módulos autorizados (`gis`, `properties`, `infrastructure`, etc.).
   - Límite de usuarios y volumen de predios catastrales.
   - Fecha de emisión y fecha de expiración.
   - Periodo de gracia (*Grace Period*) de 30 días adicionales para renovación.
3. El servicio NestJS valida la firma asimétrica en memoria con la clave pública embebida al iniciar el contenedor. **No requiere conexión saliente a internet**.

---

## 4. Matriz de Variables de Entorno por Escenario

```ini
# Configuración Central de Despliegue
DEPLOYMENT_MODE=CLOUD_SAAS # Opciones: CLOUD_SAAS | CLOUD_DEDICATED | PRIVATE_ONPREMISE
NODE_ENV=production
PORT=3000

# Base de Datos Relacional y Geoespacial
DATABASE_HOST=terranova-postgres-postgis
DATABASE_PORT=5432
DATABASE_USER=terranova_app
DATABASE_PASSWORD=SuperSecretAppPassword123!
DATABASE_NAME=terranova_prod
DATABASE_SSL=false # true en nubes administradas

# Aislamiento Multi-Tenant
TENANT_ISOLATION_STRATEGY=RLS # Opciones: RLS | SEPARATE_DATABASE

# Motor de Almacenamiento S3 Compatible
STORAGE_PROVIDER=MINIO # Opciones: S3 | MINIO | GCS
STORAGE_ENDPOINT=http://terranova-minio:9000
STORAGE_BUCKET_NAME=terranova-documents
STORAGE_ACCESS_KEY=terranova_storage_key
STORAGE_SECRET_KEY=terranova_storage_secret

# Caché y Colas
REDIS_HOST=terranova-redis
REDIS_PORT=6379

# Cartografía y Mapas Base
MAP_TILE_PROVIDER=OPENSTREETMAP # Opciones: OPENSTREETMAP | CARTO | MAPTILER | LOCAL_TILES
MAP_OFFLINE_TILES_PATH=/var/terranova/tiles
```

---

## 5. Política de Respaldo y Recuperación ante Desastres (DRP)
1. **Respaldos de Base de Datos:**
   - Volcados lógicos con compresión diaria mediante `pg_dump` con esquema y geometrías espaciales.
   - Replicación continua de logs WAL (Write-Ahead Logging) para permitir **Point-in-Time Recovery (PITR)** con ventana de recuperación de 7 días.
2. **Respaldos de Documentos y Evidencias:**
   - Replicación sincrónica de buckets MinIO/S3 a un segundo centro de datos geográficamente distante.
3. **Métricas de Recuperación:**
   - **RPO (Recovery Point Objective):** $\le 1$ hora.
   - **RTO (Recovery Time Objective):** $\le 4$ horas en contingencia mayor.
