# TERRANOVA — Hoja de Ruta de Desarrollo y Criterios de Aceptación (ROADMAP.md)
**Código del Documento:** F1-10  
**Versión:** 1.0.0  
**Fecha:** 2026-11-05  

---

## 1. Estrategia de Entrega por Fases y Versiones Comerciales
Para asegurar la viabilidad comercial y técnica del producto, el desarrollo se divide en **16 fases consecutivas**, agrupadas en tres versiones comerciales entregables:

```mermaid
timeline
    title Hoja de Ruta Comercial TERRANOVA
    section BLOQUE 1: MVP COMERCIAL
      Fase 01 : Fundación Arquitectónica & Docs
      Fase 02 : Shell UX/UI & Sistema de Diseño
      Fase 03 : Backend NestJS & Base de Datos PostGIS
      Fase 04 : Autenticación & Aislamiento Multi-Tenant RLS
      Fase 05 : GIS Explorer Core (MapLibre GL JS)
      Fase 06 : Territorios & Predios Catastrales
      Fase 07 : Infraestructura Urbana
      Fase 08 : Incidencias & Mesa de Control
    section BLOQUE 2: VERSIÓN PRO
      Fase 09 : Portal Ciudadano Público
      Fase 10 : Obras y Proyectos Urbanos
      Fase 11 : Permisos y Trámites
      Fase 12 : Field PWA Offline (Dexie.js)
      Fase 13 : Analytics & Business Intelligence
    section BLOQUE 3: VERSIÓN ADVANCED
      Fase 14 : TERRANOVA AI (GeoAgentes)
      Fase 15 : Gemelo Digital 3D (CesiumJS / 3D Tiles)
      Fase 16 : Hardening, Auditoría & Lanzamiento Comercial
```

---

## 2. Detalle de las 16 Fases y Entregables Verificables

| Fase | Título | Entregables Clave | Criterio de Aceptación Innegociable |
|---|---|---|---|
| **01** | **Fundación Arquitectónica** | 10 documentos oficiales, ADRs, Docker, workspace monorepo | Documentación completa y coherente sin contradicciones. |
| **02** | **Diseño UX/UI & Shell** | Layout maestro, paleta empresarial, modo oscuro/claro, componentes base | Responsive en móvil/escritorio, cero botones fantasma. |
| **03** | **Backend & DB PostGIS** | NestJS modular, TypeORM/Kysely con PostGIS, migraciones SQL | Migraciones corren limpias, validación espacial ST_IsValid funcional. |
| **04** | **Auth & Multi-Tenant RLS**| JWT, Argon2id, MFA TOTP, RLS activado en todas las tablas | Imposible leer o escribir datos de otra organización en pruebas unitarias. |
| **05** | **GIS Explorer Core** | Visor MapLibre, capas temáticas, dibujo y medición métrica | Cálculo de distancias y superficies proyectado en EPSG:6362/UTM. |
| **06** | **Territorios & Predios** | CRUD de predios, clave catastral mexicana, cédula PDF | Validación topológica de polígonos parcelarios sin solapes no autorizados. |
| **07** | **Infraestructura Urbana** | Inventario georreferenciado de luminarias, agua y pavimento | Filtrado espacial de activos y bitácoras de mantenimiento funcional. |
| **08** | **Incidencias Urbanas** | Mesa de control con ciclo de vida completo de reportes y fotos | Generación automática de folios únicos y evidencias de resolución. |
| **09** | **Portal Ciudadano** | Portal público web/móvil con consulta de folios sin login | Cero exposición de datos personales privados, captcha activo. |
| **10** | **Obras y Proyectos** | Control técnico y financiero de contratos con Curva S | Georreferenciación de tramos viales y cálculo automático de avance. |
| **11** | **Permisos y Trámites** | Expedientes digitales de uso de suelo y licencias de construcción| Trazabilidad de revisiones técnicas y resolutivos descargables. |
| **12** | **Field PWA Offline** | PWA con almacenamiento Dexie.js y cola de sincronización | Captura de 50 incidencias/fotos sin internet y sincronización sin duplicados. |
| **13** | **Analytics & BI** | Mapas de calor (Heatmaps), tableros KPI y exportación ejecutiva | Tiempos de agregación espacial < 1.5s sobre 100,000 registros. |
| **14** | **TERRANOVA AI** | GeoAgentes en lenguaje natural con consultas controladas | Cero ejecución de SQL arbitrario; respuestas trazables a fuentes oficiales. |
| **15** | **Gemelo Digital 3D** | Visualización 3D urbana con elevaciones y sombras | Tasa de refresco > 30 FPS en mallas urbanas con elevación de terreno. |
| **16** | **Hardening & Lanzamiento**| Auditoría de seguridad OWASP, pruebas de carga y empaquetado | Cero vulnerabilidades críticas o altas, imágenes Docker listas para producción. |

---

## 3. Criterios de Paso de Fase (Quality Gates)
1. **Verificación de Entregables:** Cada fase debe contar con un checklist de verificación al 100%.
2. **Cero Funcionalidades Simuladas:** Toda pantalla implementada en una fase debe conectarse a servicios reales o almacenar información en persistencia válida.
3. **Pruebas Automatizadas:** Cada módulo debe contar con pruebas unitarias (`Vitest`) para lógica de negocio y pruebas de integración de API (`Supertest`).
4. **Aprobación Formal:** No se iniciará el código de la fase siguiente sin la autorización expresa del auditor técnico o usuario líder.
