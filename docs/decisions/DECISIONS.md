# TERRANOVA — Registro de Decisiones de Arquitectura (ADR)
## Documento Oficial de Decisiones Técnicas

---

### ADR-001: Modelo Híbrido (Cloud Multi-tenant + Cloud Dedicado + Private On-premise)
- **Estado:** Aprobado
- **Fecha:** 2026-11-05
- **Contexto:** Se requiere vender TERRANOVA tanto a pequeños municipios y empresas privadas en modalidad SaaS por suscripción, como a secretarías de estado o grandes corporativos que por regulaciones de seguridad o soberanía de datos exigen infraestructura dedicada u on-premise.
- **Decisión:** Desarrollar un único núcleo de software modular (Monolito Modular en NestJS + Frontend React PWA) gobernado por variables de entorno y perfiles de despliegue (`TENANT_MODE=MULTI_TENANT | DEDICATED | PRIVATE`).
- **Consecuencias:** Se evita duplicidad de código y mantenimiento de múltiples repositorios; las versiones on-premise validan su licencia mediante firmas criptográficas asimétricas y llaves offline con tolerancia temporal documentada.

---

### ADR-002: Estándar Territorial México (INEGI MGN + Clave Catastral Unificada)
- **Estado:** Aprobado
- **Fecha:** 2026-11-05
- **Contexto:** El producto operará en los 32 estados y 2,477+ municipios de México. Cada estado o municipio maneja formatos catastrales y clasificaciones particulares, pero todos comparten el Marco Geoestadístico Nacional del INEGI.
- **Decisión:** Implementar el esquema jerárquico nacional: Entidad Federativa (01-32) → Municipio (001-2477) → Localidad (0001-9999) → AGEB → Manzana → Predio. La cartografía se almacena en `EPSG:4326` y se reproyecta a `EPSG:6362` (ITRF2008) o a la zona UTM correspondiente para cálculos de área y distancia.
- **Consecuencias:** Compatibilidad nativa con capas oficiales del INEGI, SEDATU y catastros estatales; cero dependencia de datos simulados.

---

### ADR-003: Motor Geoespacial con MapLibre GL JS y PostGIS
- **Estado:** Aprobado
- **Fecha:** 2026-11-05
- **Contexto:** Se requiere un motor de mapas de alto rendimiento, compatible con dispositivos móviles, sin tarifas abusivas por petición ni dependencias propietarias que bloqueen despliegues en redes privadas.
- **Decisión:** Adoptar **MapLibre GL JS** como motor de renderizado vectorial en frontend y **PostgreSQL 16 + PostGIS 3.4** en base de datos.
- **Consecuencias:** Total independencia tecnológica; soporte nativo para Vector Tiles (MVT), GeoJSON, WMS/WMTS/WFS y ortofotos de alta resolución.

---

### ADR-004: Arquitectura Offline-First con Dexie.js e Idempotencia
- **Estado:** Aprobado
- **Fecha:** 2026-11-05
- **Contexto:** Las brigadas de campo, inspectores de obra y cuadrillas de servicios urbanos operan con frecuencia en áreas con mala o nula cobertura celular.
- **Decisión:** Diseñar la PWA bajo un modelo **Offline-First real**. Toda mutación en campo se registra en IndexedDB mediante Dexie.js con un identificador único universal (`client_operation_id`), timestamp de cliente y cola transaccional. Al recuperar conexión, se envía por lotes al endpoint `/api/v1/sync/push`.
- **Consecuencias:** Los datos nunca se pierden si se cierra la app o se apaga el teléfono; se eliminan duplicados mediante claves de idempotencia.

---

### ADR-005: Aislamiento de Datos Multi-Tenant mediante PostgreSQL RLS
- **Estado:** Aprobado
- **Fecha:** 2026-11-05
- **Contexto:** En el esquema Cloud compartido coexisten múltiples organizaciones gubernamentales y privadas. Una filtración de información entre municipios o empresas representaría un incumplimiento legal crítico.
- **Decisión:** No depender únicamente de filtros en cláusulas `WHERE` de la capa de aplicación. Se implementa forzosamente **PostgreSQL Row Level Security (RLS)** a nivel de base de datos activado por sesión (`SET LOCAL app.current_organization_id = ...`).
- **Consecuencias:** Incluso si existiera un fallo en el código de backend, el motor de base de datos bloquea físicamente cualquier intento de lectura o escritura fuera del tenant asignado.

---

### ADR-006: Monolito Modular con NestJS vs Microservicios
- **Estado:** Aprobado
- **Fecha:** 2026-11-05
- **Contexto:** La plataforma cuenta con 12 módulos funcionales. Iniciar con microservicios aumentaría drásticamente la latencia, los costos operativos y la complejidad de despliegue en clientes On-premise.
- **Decisión:** Estructurar el backend como un **Monolito Modular estricto** en NestJS, con fronteras de dominio bien delimitadas (`apps/api/src/modules/*`), compartiendo librerías a través de `@terranova/shared`.
- **Consecuencias:** Simplicidad de despliegue (un solo contenedor API + DB), menor consumo de memoria y facilidad para evolucionar a microservicios en el futuro si la escala de un módulo específico lo amerita.

---

### ADR-007: Estrategia de IA Agéntica Controlada (Zero Arbitrary SQL)
- **Estado:** Aprobado
- **Fecha:** 2026-11-05
- **Contexto:** Los módulos futuros de IA (TERRANOVA AI / GeoAgents) deben asistir al usuario sin comprometer la seguridad, integridad de datos o veracidad técnica.
- **Decisión:** La IA opera como una interfaz de lenguaje natural sobre APIs de dominio validadas y herramientas semánticas específicas (Tool Calling / Function Calling). Se prohíbe terminantemente la ejecución de consultas SQL arbitrarias generadas por LLMs directas a la base de datos de producción.
- **Consecuencias:** Protección absoluta contra inyecciones SQL y alucinaciones que alteren catastros u obras públicas.
