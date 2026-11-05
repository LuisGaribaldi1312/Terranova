# TERRANOVA — Registro de Cambios (CHANGELOG)
Todas las modificaciones notables a este proyecto se documentarán en este archivo siguiendo el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y respetando [Semantic Versioning](https://semver.org/lang/es/).

---

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
