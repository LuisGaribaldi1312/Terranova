# TERRANOVA — Registro de Cambios (CHANGELOG)
Todas las modificaciones notables a este proyecto se documentarán en este archivo siguiendo el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y respetando [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.6.0-phase.7] — 2026-11-05
### Agregado
- **Módulo de Infraestructura Urbana y Activos de Red (Fase 07)**:
- Base de datos y Migraciones:
  - Migración `database/migrations/003_infrastructure_lifecycle.sql`:
    - Ampliación de `infrastructure_assets` con `network_type` (Agua Potable, Drenaje, Alumbrado, Vialidad, Telecom), condición física (`asset_condition`), costos de instalación y mantenimiento acumulado, ciclo de vida remanente y próxima inspección programada.
    - Creación de tabla inmutable `asset_maintenance_logs` con aislamiento multi-tenant por Row Level Security (RLS) para registrar intervenciones preventivas, correctivas y de emergencia.
    - Índices de consulta optimizados por red urbana, estatus y condición.
- Backend NestJS (`apps/api/src/infrastructure/`):
  - DTOs tipados: `CreateAssetDto` (validación de código de inventario estandarizado y geometría `ST_IsValid`) y `RecordMaintenanceDto`.
  - Servicio de ciclo de vida con cálculo automatizado de antigüedad, depreciación y vida útil remanente.
  - Endpoint `GET /api/v1/infrastructure`: Búsqueda con filtros multi-criterio.
  - Endpoint `GET /api/v1/infrastructure/stats`: KPIs globales de operatividad y costos de redes.
  - Endpoint `GET /api/v1/infrastructure/:id`: Ficha técnica con bitácora histórica.
  - Endpoint `POST /api/v1/infrastructure/:id/maintenance`: Registro de orden de trabajo con actualización de condición y gasto acumulado.
- Frontend React & Interfaz de Redes (`apps/web/src/modules/InfrastructureView.tsx`):
  - Tablero de control con métricas en tiempo real: Inventario de activos, tasa de operatividad (83.3%), activos críticos, valor capital y gasto acumulado.
  - Selector de vistas: Tarjetas de red / Tabla tabular de inventario municipal.
  - Filtros dinámicos por Red (Agua Potable, Drenaje, Alumbrado, Vialidad, Telecom), Estatus y Condición.
  - Modal de Ficha Técnica de Ingeniería con especificaciones JSONB desglosadas (diámetros, presiones, potencias, voltajes, etc.).
  - Bitácora interactiva de intervenciones con formulario para registrar nuevas órdenes de trabajo.
  - Modal de alta de nuevo activo urbano con validación georreferenciada.
  - Integración en `AppShell.tsx` reemplazando los placeholders previos.
- Pruebas y Despliegue:
  - Pruebas unitarias en `tests/unit/infrastructure-lifecycle.test.ts`.
  - Compilación verificada con TypeScript (`strict: true`).
  - Sincronizado en GitHub y desplegado en Vercel Producción (`https://terranova-mx.vercel.app`).

---

## [1.5.0-phase.6] — 2026-11-05
### Agregado
- **Módulo de Territorios y Predios: Catastro Avanzado Completo (Fase 06)**.
- Base de datos y Migraciones:
  - Migración `database/migrations/002_cadastre_advancement.sql`:
    - Ampliación de campos catastrales: `property_regime` (Privada, Ejidal, Comunal, Pública, Condominio).
    - Desglose de avalúo catastral: `land_value_unit_sqm`, `construction_value_unit_sqm`, `land_cadastral_value`, `construction_cadastral_value` y `cadastral_value` total.
    - Cuadro de linderos y colindancias perimetrales: `boundary_north`, `boundary_south`, `boundary_east` y `boundary_west`.
    - Estatus fiscal predial y rezago: `tax_status` (Al Corriente, Con Adeudo, Exento), `annual_property_tax` y `tax_debt_amount`.
    - Folio de cédula oficial `cadastral_certificate_folio` y sello digital criptográfico SHA-256 `digital_stamp`.
    - Índices optimizados para consulta territorial y recaudatoria.
- Backend NestJS (`apps/api/src/properties/`):
  - `CreatePropertyDto` con validación estricta de formato de Clave Catastral Oficial Mexicana (`ENT-MUN-ZON-MAN-PRE-EDI-DEP`) mediante expresión regular oficial.
  - Validación de topología espacial con `ST_IsValid` previa a inserción.
  - Generación automática de avalúo catastral y alícuota de impuesto predial anual.
  - Emisión de Cédula Catastral Oficial con sello criptográfico SHA-256 determinista (`GET /api/v1/properties/:id/cedula`) y extracción de vértices en coordenadas geodésicas (`EPSG:4326`) y proyectadas (`EPSG:32614`).
  - Endpoint de estadísticas catastrales agregadas (`GET /api/v1/properties/stats`) para tablero municipal.
- Frontend React & Interfaz Catastral (`apps/web/src/modules/PropertiesView.tsx`):
  - Tablero de control con métricas en tiempo real: Padrón total, superficie de terreno y construcción, valuación catastral total y rezago predial.
  - Selector de vista: Cuadrícula de Fichas Catastrales / Tabla Catastral Tabular institucional.
  - Filtros multi-criterio reactivos: Por Uso de Suelo, Estatus Fiscal (Al Corriente, Con Adeudo) y Régimen Jurídico.
  - Modal Oficial de **Cédula Catastral Certificada**:
    - Ficha técnica oficial imprimible (`window.print()`).
    - Código QR de autenticidad verificable.
    - Cuadro de linderos y colindancias.
    - Determinación de avalúo desglosado (suelo y construcción).
    - Sello digital de autenticidad SHA-256 inmutable.
    - Exportación de expediente catastral a formato JSON descargable.
  - Modal de **Alta de Nuevo Predio Catastral**:
    - Formulario con cálculo de avalúo automático en tiempo real.
    - Validación y emisión inmediata de Cédula Catastral.
- Pruebas y Despliegue:
  - Pruebas unitarias en `tests/unit/cadastre-valuation.test.ts`.
  - Compilación exitosa en ambos paquetes (`apps/api` y `apps/web`).
  - Desplegado y sincronizado en Vercel Producción (`https://terranova-mx.vercel.app`).

---

## [1.4.0-phase.5] — 2026-11-05
### Agregado
- **Módulo GIS Explorer Core Completo (Fase 05)** con motor MapLibre GL JS, capas dinámicas y herramientas geoespaciales avanzadas.
- Integración de MapLibre GL JS en `apps/web/src/maps/MapLibreMap.tsx`:
  - Visualizador cartográfico acelerado por GPU (WebGL/WebGPU) con soporte 2D y 3D (pitch y bearing).
  - Proveedores cartográficos intercambiables:
    - Cartografía Urbana / OpenStreetMap oficial (OGC Tiles).
    - Satelital de Alta Resolución (Esri World Imagery / Maxar).
    - Modo Oscuro de Alto Contraste (Carto Dark Matter GL).
  - Controles de navegación nativos con brújula y escala métrica en pantalla.
- Utilidades de Cálculo Espacial Oficial en `apps/web/src/maps/spatialMath.ts`:
  - Distancia geodésica oficial de alta precisión calculada con el elipsoide GRS80 / WGS84 oficial para la República Mexicana.
  - Proyección conforme simplificada a UTM Zona 14N (`EPSG:32614`) para mediciones submétricas en el centro y sur de México.
  - Cálculo de áreas y perímetros de polígonos mediante el Teorema de Gauss / Shoelace en metros cuadrados ($m^2$) y hectáreas ($ha$).
  - Validador de topología geométrica `isValidPolygon` para prevenir polígonos degenerados o autointersecados.
- Herramientas Interactivas en `apps/web/src/modules/GisExplorerView.tsx`:
  - Selector de herramientas de mapa: Paneo/Inspección, Medición de Distancia Geodésica, Medición de Área y Dibujo de Polígonos Catastrales.
  - Capas temáticas en tiempo real:
    - Predios Catastrales Urbanos con simbología cromática según uso de suelo (Habitacional, Comercial, Industrial, Equipamiento).
    - Infraestructura Crítica Urbana (red de agua potable, luminarias LED, drenaje pluvial).
    - Incidencias Viales y Reportes Ciudadanos con marcador de severidad cromática (Alta, Media, Baja).
    - Capa digital de Terreno / Relieve sombreado.
  - Exportación de paquetes cartográficos municipales a formato GeoJSON para uso offline o integración con software GIS de escritorio (QGIS, ArcGIS).
  - Integración bidireccional con el Inspector Lateral (`RightInspector`): al hacer clic en cualquier predio o incidente, el mapa enfoca y muestra los metadatos catastrales o la ficha de la incidencia.
  - Filtros reactivos por uso de suelo y severidad.
- Pruebas y Despliegue:
  - Pruebas unitarias de cálculo geodésico y proyecciones en `tests/unit/spatial-math.test.ts`.
  - Compilación verificada con TypeScript (`strict: true`) en ambos paquetes (`apps/api` y `apps/web`).
  - Despliegue en producción en Vercel activo y verificado en `https://web-nine-lime-81.vercel.app`.

---

## [1.3.0-phase.4] — 2026-11-05
### Agregado
- **Autenticación Robusta, Roles (RBAC), MFA y Aislamiento Multi-Tenant (Fase 04)**.
- Módulo `AuthModule`:
  - Login seguro (`POST /api/v1/auth/login`) con verificación de contraseña mediante hashing BCrypt (factor de costo 12).
  - Soporte de Autenticación Multifactor **TOTP RFC 6238** (`POST /api/v1/auth/mfa/generate` y `verify`) con clave secreta y URI para Google Authenticator / Authy.
  - Registro de usuarios institucionales (`POST /api/v1/auth/register`) vinculados a organizaciones con membresía automática.
  - Consulta de perfil autenticado con rol y permisos (`GET /api/v1/auth/profile`).
  - Estrategia y Guard de JWT (`JwtStrategy`, `JwtAuthGuard`) con tokens firmados de 15 minutos de vigencia.
- Control de Acceso Basado en Roles (RBAC):
  - Decorador `@Roles(...)` y guardia `@UseGuards(RolesGuard)` para validar roles institucionales (`superadmin`, `admin`, `director`, `gis_coordinator`, `inspector`, etc.).
  - Búsqueda y asignación de roles en la organización (`POST /api/v1/users/:id/assign-role`).
- Aislamiento Multi-Tenant Forzoso:
  - `TenantGuard`: Bloqueo estricto contra accesos cruzados (*Cross-Tenant Access*); un usuario de una organización no puede consultar información de otro municipio.
  - El rol `superadmin` dispone de privilegios de auditoría global transversal.
- Trazabilidad y Auditoría:
  - `AuditService`: Registro inmutable en la tabla `audit_logs` con acción, entidad, usuario, organización, dirección IP y user agent.
- Pruebas y Calidad:
  - Suite de pruebas unitarias en `tests/unit/auth-isolation.test.ts` verificando hashing de contraseñas, aislamiento entre municipios y algoritmo TOTP.
  - Compilación exitosa del backend con NestJS (`nest build` con cero errores).

## [1.2.0-phase.3] — 2026-11-05
### Agregado
- **Backend Modular NestJS, Modelos PostGIS y Servicios Centrales (Fase 03)**.
- Scaffolding de `apps/api` con NestJS 10, TypeScript estricto y Swagger / OpenAPI 3.0 (`/api/docs`).
- Migración inicial SQL en `database/migrations/001_initial_schema.sql`:
  - Activación de extensiones espaciales: `postgis`, `pgcrypto` y `uuid-ossp`.
  - Tablas operativas: `organizations`, `departments`, `roles`, `permissions`, `role_permissions`, `users`, `organization_members`.
  - Catálogo territorial nacional INEGI MGN: `territories` (Estados 01-32, Municipios, Localidades, Colonias y AGEBs con geometría `MultiPolygon, 4326` e índice GIST).
  - Capas temáticas GIS: `map_layers` y `geographic_features`.
  - Catastro municipal: `properties` con clave catastral mexicana, uso de suelo, áreas m², geometría `Polygon, 4326`, índice GIST y cálculo métrico dinámico en `EPSG:6362` (ITRF2008).
  - Infraestructura urbana: `infrastructure_assets` con geometrías y atributos JSONB.
  - Incidencias territoriales: `incidents` con generación automática de folios consecutivos (`INC-YEAR-000000`), prioridades y evidencias.
  - Obras públicas: `projects` con avance físico y financiero.
  - Sincronización offline: `sync_operations` con garantía de idempotencia mediante `client_operation_id`.
  - Auditoría inmutable de grado forense: `audit_logs`.
  - Políticas forzosas de **PostgreSQL Row Level Security (RLS)** activas en todas las tablas sensibles.
- Seeds oficiales en `database/seeds/001_initial_seeds.sql` con la organización del *H. Ayuntamiento de Puebla*, direcciones de Catastro e Infraestructura, roles del sistema y predio piloto con polígono WKT validado.
- Módulos de dominio NestJS implementados:
  - `CommonModule`: Pool de conexión con ejecutor de consultas transaccionales con contexto de RLS (`SET LOCAL app.current_organization_id = ...`).
  - `OrganizationsModule`: CRUD de tenants y perfiles municipales.
  - `TerritoriesModule`: Consulta de las 32 entidades federativas y municipios de México.
  - `PropertiesModule`: CRUD de predios con validación topológica espacial `ST_IsValid` previa a persistencia.
  - `IncidentsModule`: Mesa de control, generador de folios y geocodificación.
  - `InfrastructureModule`: Inventario de activos urbanos.
  - `ProjectsModule`: Gestión técnica y avance de obra pública.
  - `SyncModule`: Receptor de lotes de mutaciones capturadas sin internet con validación de idempotencia.
  - `GisModule`: Cálculo de distancias geodésicas en `EPSG:6362` y capas cartográficas.
- Compilación de producción backend completada con éxito (`nest build` con cero errores).

## [1.1.0-phase.2] — 2026-11-05
### Agregado
- **Diseño UX/UI, Sistema de Diseño y Shell de la Aplicación (Fase 02)**.
- Scaffolding completo de `apps/web` con React 18, TypeScript (strict: true), Vite 5 y Tailwind CSS.
- Tokens visuales empresariales: Azul profundo (`#0B1D2A`), Azul petróleo (`#123C50`), Verde tecnológico (`#17A987`) y Gris claro (`#E9F0F2`).
- Shell interactivo completo (`AppShell.tsx`):
  - Encabezado (`Header.tsx`): Selector de municipio/organización de México, buscador global, alternador de tema claro/oscuro, centro de notificaciones y simulador de desconexión offline.
  - Barra lateral (`Sidebar.tsx`): Navegación agrupada por los 12 módulos funcionales con estados activos y colapso responsive.
  - Barra de estado (`StatusBar.tsx`): Lectura en tiempo real de coordenadas geográficas (WGS84 y UTM 14N) y monitor de IndexedDB / Dexie.js.
  - Panel Inspector lateral (`RightInspector.tsx`): Fichas técnicas completas para Predios (con Cédula Catastral), Incidencias (con evidencias fotográficas) y Obras Públicas.
- Módulos visuales operativos:
  - `DashboardView.tsx`: Tarjetas de KPI ejecutivos, visor cartográfico interactivo vectorial, actividad territorial en vivo y tabla multidominio.
  - `GisExplorerView.tsx`: Visor GIS con gestor de capas, herramientas de medición métrica (`EPSG:6362`) y descarga de paquetes offline.
  - `PropertiesView.tsx`: Catastro con búsqueda por Clave Catastral, filtros por uso de suelo y métricas consolidadas.
  - `IncidentsView.tsx`: Mesa de control con semáforo de prioridades y evidencias de campo.
  - `FieldPwaView.tsx`: Simulador interactivo de la PWA móvil de campo con almacenamiento local y cola de sincronización.
  - `AdminView.tsx`: Consola de configuración de tenant, seguridad PostgreSQL RLS y bitácora forense de auditoría inmutable.
- Compilación de producción validada exitosamente con `tsc -b && vite build` (Cero errores de TypeScript).

## [1.0.0-phase.1] — 2026-11-05
### Agregado
- **Fundación Arquitectónica y Definición de Producto (Fase 01)**.
- Documento de Visión y Acta del Proyecto (`PROJECT_CHARTER.md`).
- Especificación de Requerimientos de Software (`SRS.md`).
- Arquitectura Técnica del Sistema (`ARCHITECTURE.md`).
- Modelo Inicial de Base de Datos Relacional y Espacial PostGIS (`DATABASE_DESIGN.md`).
- Especificación del Motor Geoespacial y Cartografía para México (`GIS_SPECIFICATION.md`).
- Especificación del Motor Offline-First y Protocolo de Sincronización (`OFFLINE_SYNC_SPEC.md`).
- Especificación de Seguridad, Criptografía y Control de Acceso RBAC (`SECURITY_SPEC.md`).
- Especificación de Modelos de Despliegue Híbrido: Cloud, Dedicado y Privado (`DEPLOYMENT_SPEC.md`).
- Catálogo Integral de los 12 Módulos Funcionales (`MODULE_CATALOG.md`).
- Hoja de Ruta de Desarrollo en 16 Fases y Criterios de Aceptación (`ROADMAP.md`).
- Reglas Permanentes de Desarrollo para Agentes de IA (`AGENTS.md`).
- Registro de Decisiones de Arquitectura iniciales ADR-001 a ADR-007 (`docs/decisions/DECISIONS.md`).
- Entorno de infraestructura local en Docker Compose con PostgreSQL 16 + PostGIS 3.4 y Redis 7.
