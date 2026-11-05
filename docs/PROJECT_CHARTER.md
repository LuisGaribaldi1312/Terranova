# TERRANOVA — Acta de Constitución del Proyecto (PROJECT_CHARTER.md)
**Código del Documento:** F1-01  
**Versión:** 1.0.0  
**Fecha:** 2026-11-05  
**Estado:** Aprobado  

---

## 1. Identidad y Definición del Producto
- **Nombre Comercial:** TERRANOVA
- **Nombre Empresarial:** TERRANOVA Intelligence
- **Eslogan Oficial:** *El territorio conectado. La información inteligente. Las decisiones del futuro.*
- **Sub-lema Operativo:** *Comprende tu territorio. Transforma tu ciudad.*
- **Categoría:** Plataforma SaaS / On-premise de Inteligencia Territorial, Catastro Municipal y Gestión Urbana.
- **Mercado Objetivo:** República Mexicana (32 Entidades Federativas, 2,477+ Municipios, Desarrolladoras Inmobiliarias, Empresas Constructoras, Administradores de Infraestructura y Consultoras de Ingeniería).

---

## 2. Visión y Objetivos Estratégicos
Convertir a **TERRANOVA** en el sistema operativo estándar de gestión e inteligencia territorial de México, superando los sistemas cartográficos estáticos convencionales mediante la integración de:
1. **Sistemas de Información Geográfica (GIS) Avanzados** basados en estándares abiertos y fuentes oficiales (INEGI, SEDATU, Catastros Estatales).
2. **Capacidad Operativa Offline-First** para asegurar la continuidad de cuadrillas e inspectores de campo en áreas sin conectividad celular.
3. **Plataforma Multi-Tenant e Híbrida** (SaaS Central en la Nube y Despliegues Privados On-premise para entidades con requerimientos de soberanía de datos).
4. **Preparación Arquitectónica para Gemelos Digitales (Digital Twins)** y modelos de simulación urbana tridimensional (3D).
5. **Capa Agéntica de Inteligencia Artificial (Agentic AI)** para consultas semánticas, detección de anomalías y pronósticos territoriales con control humano en el ciclo (*Human-in-the-Loop*).

---

## 3. Alcance del Proyecto
### 3.1 Dentro del Alcance (In-Scope)
- Núcleo de software común configurable para Gobiernos, Desarrolladoras Inmobiliarias, Constructoras y Empresas de Servicios Urbanos.
- Administración del Marco Geoestadístico Nacional (Estados, Municipios, Localidades, AGEBs, Manzanas y Predios).
- Los 12 módulos funcionales principales: GIS Explorer, Properties (Catastro), Infrastructure, Incidents, Citizen Portal, Projects (Obras), Permits (Expedientes), Analytics (BI), Field PWA (Offline), Digital Twin (3D), TERRANOVA AI y Administration.
- Soporte para tres escenarios de despliegue: Cloud Compartido, Cloud Dedicado y Private On-premise.
- Protocolo de sincronización con almacenamiento local en Dexie.js (IndexedDB) y resolución determinista de conflictos.
- Esquema de seguridad granular (RBAC) con aislamiento forzoso de datos mediante PostgreSQL Row Level Security (RLS).

### 3.2 Fuera del Alcance (Out-of-Scope)
- TERRANOVA **no sustituye la fe pública ni el valor legal de escrituras notariales** o resolutivos judiciales de propiedad. Los datos de tenencia de la tierra reflejan información administrativa de referencia.
- TERRANOVA **no emite autorizaciones jurídicas automáticas sin intervención humana**; todo dictamen de uso de suelo o licencia de obra requiere la firma/aprobación de un funcionario autorizado.
- No se incluye la comercialización de imágenes satelitales propietarias de alta resolución sin la debida licencia contratada por el cliente.

---

## 4. Reglas Técnicas Fundamentales
1. **Un Solo Código Fuente (Single Codebase):** Las versiones Cloud y Private comparten el 100% de la lógica de negocio y componentes.
2. **Independencia Cartográfica:** El frontend utiliza MapLibre GL JS y abstrae los proveedores de teselas (OSM, Carto, Mapbox, INEGI, servidores WMS locales).
3. **Validación Espacial Obligatoria:** Toda geometría persistida en la base de datos debe ser topológicamente válida según las reglas de OGC / PostGIS (`ST_IsValid`).
4. **Aislamiento Multi-Tenant Físico o Criptográfico:** Ningún usuario o proceso de una organización puede acceder a datos de otra organización bajo ninguna circunstancia.
5. **Idempotencia en Sincronización:** Toda mutación generada sin conexión incluye un UUID generado en cliente que previene duplicaciones accidentales.

---

## 5. Riesgos del Proyecto y Mitigaciones
| Riesgo Identificado | Impacto | Probabilidad | Estrategia de Mitigación |
|---|---|---|---|
| Reticencia de municipios a compartir información catastral | Alto | Alta | Arquitectura Private On-premise que permite al municipio conservar el control total de sus datos y servidores. |
| Inconsistencias en cartografías locales (geometrías sobrepuestas) | Medio | Alta | Rutinas automáticas de corrección topológica (`ST_MakeValid`) y banderas de revisión asistida. |
| Pérdida de datos en campo por fallas en dispositivos móviles | Alto | Media | Almacenamiento local redundante en IndexedDB y política de borrado únicamente tras confirmación HTTP 200 con checksum. |

---

## 6. Criterios de Aceptación
- Documentación completa aprobada por el comité técnico y de negocio.
- Estructura de repositorio inicializada y verificada con pipelines de compilación.
- Aprobación formal de las directrices inmutables antes del inicio de código funcional.
