# TERRANOVA: Mapa de Módulos e Interfaces
## Arquitectura Funcional de los 12 Módulos (v1.0)

---

### Visión General de Interconexión

| Módulo | Nombre | Dominio Principal | Entradas / Fuentes | Salidas / Vínculos |
|---|---|---|---|---|
| **01** | **TERRANOVA GIS** | Cartografía interactiva, capas y análisis espacial | INEGI, PostGIS, GeoJSON, OSM | Visor central, exportación GeoJSON/SHP |
| **02** | **TERRANOVA PROPERTIES** | Gestión de predios, claves catastrales y uso de suelo | Catastro, expedientes, escrituras | Ficha catastral, avalúos, vínculos con trámites |
| **03** | **TERRANOVA INFRASTRUCTURE**| Inventario y ciclo de vida de activos urbanos | Levantamientos en campo, cuadrillas | Estado operativo, órdenes de mantenimiento |
| **04** | **TERRANOVA INCIDENTS** | Mesa de control y resolución de reportes urbanos | Ciudadanos, inspectores, PWA | Folio de atención, KPIs de respuesta |
| **05** | **TERRANOVA CITIZEN** | Portal público web/PWA para habitantes | Reportes ciudadanos anónimos/autenticados | Folio público, semáforo de obras públicas |
| **06** | **TERRANOVA PROJECTS** | Gestión técnica, financiera y física de obra pública | Contratistas, supervisores de obra | Curva S de avance, georreferenciación |
| **07** | **TERRANOVA PERMITS** | Expedientes de licencias de construcción y uso de suelo | Ciudadanos, gestores, desarrolladoras | Dictámenes de factibilidad, resolutivos |
| **08** | **TERRANOVA ANALYTICS** | Business Intelligence & Analítica geoespacial | Registros históricos de todos los módulos | Mapas de calor, tableros ejecutivos, reportes PDF |
| **09** | **TERRANOVA FIELD** | PWA offline para inspectores y brigadistas | GPS del dispositivo, cámara fotográfica | Sincronización diferida (Dexie -> API) |
| **10** | **TERRANOVA DIGITAL TWIN** | Modelado 3D, simulación y escenarios urbanos | Nubes de puntos LiDAR, mallas 3D, sensores IoT | Visualización CesiumJS, análisis de inundación/sombra |
| **11** | **TERRANOVA AI** | Agentes autónomos de consulta y predicción | Base de conocimiento vectorial y PostGIS | Respuestas en lenguaje natural, reportes predictivos |
| **12** | **TERRANOVA ADMIN** | Consola central multi-tenant, roles y gobernanza | Superadmin / Administradores de tenant | Control de licencias, auditoría y catálogos |

---

### Detalle de APIs REST Internas

```
/api/v1/
├── auth/
│   ├── POST /login
│   ├── POST /refresh
│   ├── POST /mfa/verify
│   └── GET  /profile
├── organizations/
│   ├── GET  /current
│   ├── PUT  /current
│   └── GET  /departments
├── territories/
│   ├── GET  /states (Estados 01-32 INEGI)
│   ├── GET  /municipalities?state_id=...
│   ├── GET  /neighborhoods?municipality_id=...
│   └── GET  /spatial/boundary/:id
├── gis/
│   ├── GET  /layers
│   ├── POST /layers
│   ├── GET  /features?layer_id=...&bbox=...
│   └── POST /analysis/buffer
├── properties/
│   ├── GET  / (Filtros por clave catastral, colonia, uso de suelo)
│   ├── POST /
│   ├── GET  /:id
│   └── GET  /:id/documents
├── infrastructure/
│   ├── GET  /assets?type=...&status=...
│   ├── POST /assets
│   └── POST /assets/:id/maintenance-log
├── incidents/
│   ├── GET  / (Bandeja con filtros de prioridad y estado)
│   ├── POST /
│   ├── GET  /:id
│   ├── PATCH /:id/status
│   └── POST /:id/updates (Evidencias)
├── citizen/
│   ├── POST /reports (Público con captcha y rate-limiting)
│   └── GET  /reports/track/:folio
├── projects/
│   ├── GET  /
│   ├── POST /
│   ├── GET  /:id
│   └── POST /:id/progress-log
├── permits/
│   ├── GET  /
│   ├── POST /
│   └── PATCH /:id/review
├── analytics/
│   ├── GET  /kpis/executive
│   ├── GET  /heatmaps/incidents
│   └── POST /reports/export-pdf
├── sync/
│   ├── GET  /catalogs (Descarga previa para modo offline)
│   └── POST /push (Recepción atómica por lote con idempotencia)
├── ai/
│   └── POST /chat (Asistentes territoriales: GeoAgent, UrbanAgent)
└── admin/
    ├── GET  /users
    ├── POST /users
    ├── GET  /roles
    └── GET  /audit-logs
```
