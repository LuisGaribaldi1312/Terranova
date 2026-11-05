# TERRANOVA — Catálogo Integral de Módulos Comerciales y Funcionales (MODULE_CATALOG.md)
**Código del Documento:** F1-09  
**Versión:** 1.0.0  
**Fecha:** 2026-11-05  

---

## 1. Visión Modular del Producto
TERRANOVA se comercializa en esquema de licenciamiento por niveles (*Tiers: Starter, Professional, Enterprise, Government*) o mediante la contratación de módulos a la carta. La plataforma cuenta con **12 módulos funcionales principales**, respaldados por servicios centrales de administración, seguridad e integración.

---

## 2. Los 12 Módulos Funcionales

### Módulo 01: TERRANOVA GIS — Inteligencia Geográfica
- **Objetivo:** Núcleo cartográfico interactivo para visualización, medición y análisis territorial multidimensional.
- **Funcionalidades:** Mapas interactivos con MapLibre GL JS, capas temáticas (colonias, predios, redes de agua, alumbrado), dibujo de geometrías vectoriales (puntos, líneas, polígonos), cálculo de áreas y distancias con reproyección métrica oficial (`EPSG:6362` / Zonas UTM), importación/exportación GeoJSON/Shapefile.
- **Sectores:** Gobiernos, Desarrolladoras, Constructoras, Consultoras de Ingeniería.
- **Nivel Mínimo de Licencia:** Starter.

### Módulo 02: TERRANOVA PROPERTIES — Catastro y Propiedades
- **Objetivo:** Registro, control y análisis físico, jurídico y fiscal de predios, terrenos y desarrollos inmobiliarios.
- **Funcionalidades:** Clave catastral estandarizada mexicana, expediente digital del predio, registro de superficies de terreno y construcción, uso de suelo, nivel de niveles construidos, emisión de Cédula de Predio en PDF, visualización del polígono parcelario y control de acceso confidencial a datos de propietarios.
- **Sectores:** Gobiernos Municipales (Catastro), Desarrolladoras Inmobiliarias, Valuadores.
- **Nivel Mínimo de Licencia:** Starter.

### Módulo 03: TERRANOVA INFRASTRUCTURE — Infraestructura Urbana
- **Objetivo:** Inventario georreferenciado, monitoreo operativo y gestión del ciclo de vida de los activos públicos y privados.
- **Funcionalidades:** Catálogo de activos (luminarias, semáforos, señalética vial, redes de agua potable, drenaje, parques y pozos), registro de estado operativo (*Operativo, Dañado, En Mantenimiento*), especificaciones técnicas (watts, diámetros, marcas) y bitácora histórica de intervenciones.
- **Sectores:** Servicios Públicos Municipales, Operadores de Agua y Drenaje, Concesionarias.
- **Nivel Mínimo de Licencia:** Professional.

### Módulo 04: TERRANOVA INCIDENTS — Incidencias y Mesa de Control
- **Objetivo:** Gestión eficiente del ciclo de vida de reportes ciudadanos y fallas territoriales detectadas en campo.
- **Funcionalidades:** Registro geolocalizado de baches, fugas de agua, fallas de alumbrado y acumulación de basura; asignación a dependencias responsables; folios únicos consecutivos; flujo de estados (*Recibida → Validada → Asignada → En Proceso → Resuelta → Cerrada*); captura obligatoria de evidencias fotográficas del antes y después.
- **Sectores:** Gobiernos Municipales, Administradores de Fraccionamientos, Mantenimiento Urbano.
- **Nivel Mínimo de Licencia:** Starter.

### Módulo 05: TERRANOVA CITIZEN — Portal Ciudadano
- **Objetivo:** Canal digital abierto y transparente para la participación y comunicación directa entre habitantes y gobierno.
- **Funcionalidades:** Registro web y móvil de reportes ciudadanos sin registro obligatorio, captura de fotos y geolocalización por GPS del navegador, consulta de estado de reportes por folio sin exponer datos privados, mapa público de obras y avisos de cortes viales programados.
- **Sectores:** Gobiernos Municipales y Estatales.
- **Nivel Mínimo de Licencia:** Professional.

### Módulo 06: TERRANOVA PROJECTS — Obras y Proyectos Urbanos
- **Objetivo:** Control técnico, físico y financiero de obras públicas y proyectos de construcción privada.
- **Funcionalidades:** Georreferenciación de tramos viales o polígonos de obra, cronogramas y fechas clave, control de presupuesto asignado vs ejercido, registro de contratistas y supervisores, estimaciones periódicas, bitácora fotográfica y cálculo automático de avance físico/financiero (Curva S).
- **Sectores:** Obras Públicas Municipales/Estatales, Empresas Constructoras, Supervisión de Obra.
- **Nivel Mínimo de Licencia:** Professional.

### Módulo 07: TERRANOVA PERMITS — Permisos y Expedientes
- **Objetivo:** Ventanilla digital para la tramitación, revisión y seguimiento de trámites territoriales y urbanos.
- **Funcionalidades:** Solicitudes de licencias de uso de suelo, alineamiento y número oficial, licencias de construcción, dictámenes de impacto ambiental/urbano; control de requisitos documentales, observaciones técnicas de peritos y emisión de resolutivos con trazabilidad completa.
- **Sectores:** Desarrollo Urbano Municipal, Colegios de Arquitectos/Ingenieros, Desarrolladoras.
- **Nivel Mínimo de Licencia:** Enterprise / Government.

### Módulo 08: TERRANOVA ANALYTICS — Inteligencia Territorial y BI
- **Objetivo:** Tablero de comando estratégico y análisis espacial avanzado para la toma de decisiones informadas.
- **Funcionalidades:** Mapas de calor (Heatmaps) de densidad de incidencias, indicadores clave de desempeño (MTTR, porcentaje de cobertura de servicios, inversión territorial por sector), filtros por colonia y municipio, comparativas temporales y exportación ejecutiva a PDF y Excel.
- **Sectores:** Directores de Área, Alcaldes, Secretarías Estatales, Consultores Urbanistas.
- **Nivel Mínimo de Licencia:** Professional.

### Módulo 09: TERRANOVA FIELD — Aplicación de Campo Offline (PWA)
- **Objetivo:** Herramienta móvil para brigadas e inspectores con capacidad total de operación sin conexión a internet.
- **Funcionalidades:** Instalable como PWA en teléfonos y tabletas Android/iOS, captura de coordenadas GPS, almacenamiento local de formularios y fotos en Dexie.js (IndexedDB), descarga previa de mapas base y sincronización automática transparente al recuperar conexión.
- **Sectores:** Cuadrillas operativas, Inspectores de obra, Brigadas catastrales y de protección civil.
- **Nivel Mínimo de Licencia:** Professional.

### Módulo 10: TERRANOVA DIGITAL TWIN — Gemelo Digital Territorial
- **Objetivo:** Representación tridimensional fotorrealista y simulación predictiva de la dinámica urbana.
- **Funcionalidades:** Visualización de mallas 3D y modelos BIM/3D Tiles de edificaciones, integración de datos topográficos, análisis de conos de sombra solar, simulación de escorrentías e inundaciones urbanas, visualización de proyectos antes de su construcción física.
- **Sectores:** Ciudades Inteligentes (Smart Cities), Grandes Desarrolladoras, Gobiernos Metropolitanos.
- **Nivel Mínimo de Licencia:** Enterprise / Government.

### Módulo 11: TERRANOVA AI — Inteligencia Artificial Territorial
- **Objetivo:** Asistente conversacional geoespacial y agentes especializados para análisis contextual acelerado.
- **Funcionalidades:** Agentes especializados (*GeoAgent*, *UrbanAgent*, *InfraAgent*, *ProjectAgent*, *IncidentAgent*, *ReportAgent*); consultas en lenguaje natural (ej. "¿Qué colonias presentan mayor retraso en atención de baches?"); generación automática de resúmenes ejecutivos; consultas mediante Tool Calling validado (sin SQL arbitrario).
- **Sectores:** Administraciones de alto nivel, Centros de Mando (C4/C5), Analistas Senior.
- **Nivel Mínimo de Licencia:** Enterprise / Government.

### Módulo 12: TERRANOVA ADMIN — Administración Central y Gobernanza
- **Objetivo:** Consola maestra para el control institucional de la organización, seguridad y gobernanza de datos.
- **Funcionalidades:** Gestión de usuarios y miembros por departamento, configuración granular de roles y permisos (RBAC), catálogo de colonias y sectores territoriales, personalización de imagen institucional (logos, colores), bitácoras inmutables de auditoría forense y gestión de planes de suscripción.
- **Sectores:** Todos (Superadmin TERRANOVA y Administradores de Tenant).
- **Nivel Mínimo de Licencia:** Incluido en todos los planes.
