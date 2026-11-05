# TERRANOVA — Intelligence & Territorial Management
> *El territorio conectado. La información inteligente. Las decisiones del futuro.*

Plataforma empresarial de nivel industrial para la inteligencia territorial, catastro municipal, infraestructura, incidencias y gestión urbana en la **República Mexicana**. Diseñada bajo un modelo híbrido (*Cloud SaaS y Despliegue Privado On-premise*), con arquitectura *Offline-first*, integración cartográfica abierta con MapLibre GL JS y preparación para Gemelos Digitales e Inteligencia Artificial Agéntica.

---

## 🏛️ Contexto y Estándar Nacional (INEGI MGN)
TERRANOVA modela de forma nativa la jerarquía del **Marco Geoestadístico Nacional (MGN)**:
- **32 Entidades Federativas** (`cve_ent`)
- **2,477+ Municipios y Alcaldías** (`cve_mun`)
- **Localidades Urbanas y Rurales** (`cve_loc`)
- **AGEBs y Manzanas** (`cve_ageb`, `cve_man`)
- **Predios y Catastro Municipal:** Clave catastral estandarizada y geometrías en proyecciones oficiales (`EPSG:6362` ITRF2008 / `EPSG:4326` WGS84).

---

## 📚 Documentación Técnica Oficial (Fase 1: Fundación Arquitectónica)

### Los Diez Documentos Oficiales:
1. [F1-01: PROJECT_CHARTER.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/docs/PROJECT_CHARTER.md) — Acta de constitución, identidad y alcance.
2. [F1-02: SRS.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/docs/SRS.md) — Requerimientos funcionales (RF) y no funcionales (RNF).
3. [F1-03: ARCHITECTURE.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/docs/ARCHITECTURE.md) — Arquitectura de software, monolito modular y modelo híbrido.
4. [F1-04: DATABASE_DESIGN.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/docs/DATABASE_DESIGN.md) — Esquema relacional, espacial PostGIS y RLS multi-tenant.
5. [F1-05: GIS_SPECIFICATION.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/docs/GIS_SPECIFICATION.md) — Motor MapLibre GL JS, Vector Tiles y proyecciones en México.
6. [F1-06: OFFLINE_SYNC_SPEC.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/docs/OFFLINE_SYNC_SPEC.md) — PWA, Dexie.js, IndexedDB y protocolo de sincronización.
7. [F1-07: SECURITY_SPEC.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/docs/SECURITY_SPEC.md) — Seguridad, cifrado, matriz RBAC y auditoría inmutable.
8. [F1-08: DEPLOYMENT_SPEC.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/docs/DEPLOYMENT_SPEC.md) — Despliegues Cloud SaaS, Dedicado y Private On-premise.
9. [F1-09: MODULE_CATALOG.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/docs/MODULE_CATALOG.md) — Catálogo detallado de los 12 módulos funcionales.
10. [F1-10: ROADMAP.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/docs/ROADMAP.md) — Hoja de ruta en 16 fases y criterios de calidad.

### Documentos Complementarios de Gobernanza:
- [AGENTS.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/AGENTS.md) — Reglas permanentes inmutables para agentes de IA y desarrolladores.
- [DECISIONS.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/docs/decisions/DECISIONS.md) — Registro de Decisiones de Arquitectura (ADR-001 al ADR-007).
- [CHANGELOG.md](file:///c:/Users/luisa/OneDrive/Escritorio/TERRANOVA/CHANGELOG.md) — Historial de cambios y versiones del proyecto.

---

## 🎨 Identidad Visual y Paleta Cromática
- **Azul Profundo:** `#0B1D2A` (Fondo primario dark y barras de comando)
- **Azul Petróleo:** `#123C50` (Contenedores y superficies)
- **Verde Tecnológico:** `#17A987` (Acento de acción, KPIs y capas activas)
- **Gris Claro:** `#E9F0F2` (Texto principal en dark mode y fondo en light mode)

---

## 🚀 Infraestructura Local de Desarrollo (Docker)
```bash
# Iniciar servicios de base de datos relacional/espacial y caché
docker compose -f infrastructure/docker/docker-compose.yml up -d
```
Servicios levantados:
- **PostgreSQL 16 + PostGIS 3.4:** Puerto `5432`
- **Redis 7:** Puerto `6379`
