# TERRANOVA — Especificación de Requerimientos de Software (SRS.md)
**Código del Documento:** F1-02  
**Versión:** 1.0.0  
**Fecha:** 2026-11-05  
**Norma:** IEEE 830 / ISO/IEC/IEEE 29148  

---

## 1. Introducción
### 1.1 Propósito
Este documento define los requerimientos funcionales, requerimientos no funcionales, interfaces externas y restricciones de diseño para la plataforma **TERRANOVA (Intelligence & Territorial Management)** en sus modalidades Cloud (SaaS) y Private (On-premise).

### 1.2 Convención de Prioridades (MoSCoW)
- **[M] Must Have:** Obligatorio para el lanzamiento del MVP comercial (Fases 1 a 8).
- **[S] Should Have:** Muy deseable para la Versión PRO (Fases 9 a 13).
- **[C] Could Have:** Características avanzadas de la Versión ADVANCED (Fases 14 a 16).
- **[W] Won't Have (v1.0):** No incluido en la versión 1.0; planificado para iteraciones futuras.

---

## 2. Requerimientos Funcionales (RF)

### 2.1 Gestión Territorial y GIS (Módulo 1)
- **RF-GIS-01 [M]:** El sistema debe desplegar un mapa interactivo con soporte de navegación fluida (zoom, paneo, rotación, inclinación) utilizando MapLibre GL JS.
- **RF-GIS-02 [M]:** El sistema debe permitir cargar y activar/desactivar capas temáticas: Colonias, Manzanas, Predios, Alumbrado, Red Hidráulica, Drenaje, Obras e Incidencias.
- **RF-GIS-03 [M]:** El sistema debe soportar dibujo y edición geométrica de puntos, líneas y polígonos con captura automática de coordenadas geográficas en `EPSG:4326`.
- **RF-GIS-04 [M]:** El sistema debe calcular distancias y superficies proyectando dinámicamente las geometrías al sistema de referencia métrico oficial correspondiente (`EPSG:6362` o zona UTM).
- **RF-GIS-05 [S]:** El sistema debe permitir la importación y exportación de capas en formatos estándar: GeoJSON, Shapefile (.zip), GeoPackage y KML.
- **RF-GIS-06 [S]:** El sistema debe permitir la integración de capas remotas OGC (WMS/WMTS/WFS) de fuentes oficiales como el INEGI o servidores locales.

### 2.2 Predios y Catastro (Módulo 2)
- **RF-PROP-01 [M]:** El sistema debe registrar predios con clave catastral unificada (Zona, Manzana, Lote, Edificio, Depto), superficie de terreno, superficie construida y uso de suelo.
- **RF-PROP-02 [M]:** El sistema debe vincular cada predio con su polígono georreferenciado e impedir la superposición involuntaria mediante validación topológica.
- **RF-PROP-03 [M]:** El sistema debe generar una Cédula / Ficha Técnica de Predio descargable en formato PDF con mapa de localización y colindancias.
- **RF-PROP-04 [M]:** El sistema debe registrar un expediente digital de documentos vinculados (escrituras escaneadas, boletas prediales, fotografías) con acceso restringido por roles.

### 2.3 Infraestructura Urbana (Módulo 3)
- **RF-INF-01 [M]:** El sistema debe inventariar activos urbanos georreferenciados (luminarias, semáforos, señalética, parques, pozos, válvulas de agua).
- **RF-INF-02 [M]:** Cada activo debe registrar su estado operativo: *Operativo*, *Mantenimiento Requerido*, *Dañado*, *Fuera de Servicio*.
- **RF-INF-03 [M]:** El sistema debe mantener una bitácora histórica de intervenciones y mantenimiento preventivo/correctivo para cada activo.

### 2.4 Incidencias Urbanas (Módulo 4)
- **RF-INC-01 [M]:** El sistema debe permitir registrar incidencias geolocalizadas con título, descripción, tipo de falla, fotos de evidencia y nivel de prioridad.
- **RF-INC-02 [M]:** El sistema debe generar un folio único consecutivo por organización (Ej. `INC-2026-000142`).
- **RF-INC-03 [M]:** El sistema debe soportar el flujo de estados: *Recibida → Validada → Asignada → En Proceso → Resuelta → Cerrada / Rechazada*.
- **RF-INC-04 [M]:** Al resolverse una incidencia, el técnico debe adjuntar obligatoriamente fotografía de evidencia de la solución.

### 2.5 Portal Ciudadano (Módulo 5)
- **RF-CIT-01 [S]:** Portal público web y PWA para que los habitantes reporten incidencias urbanas con geolocalización por GPS del navegador y fotografías.
- **RF-CIT-02 [S]:** Consulta pública del estado de atención de reportes mediante número de folio sin exponer datos personales privados.
- **RF-CIT-03 [S]:** Visualización de mapa público con avisos municipales de obras y cortes viales programados.

### 2.6 Obras y Proyectos Urbanos (Módulo 6)
- **RF-PRJ-01 [S]:** Registro de obras públicas o privadas con presupuesto asignado, contratista, supervisor responsable, fechas de inicio y término.
- **RF-PRJ-02 [S]:** Georreferenciación de la obra (tramo de calle, polígono de parque o punto de instalación).
- **RF-PRJ-03 [S]:** Registro de estimaciones, porcentaje de avance físico y financiero con generación de Curva S.

### 2.7 Permisos y Expedientes (Módulo 7)
- **RF-PER-01 [S]:** Gestión digital de solicitudes de licencias de uso de suelo, alineamiento y número oficial, y licencias de construcción.
- **RF-PER-02 [S]:** Carga de requisitos documentales y emisión de observaciones técnicas con trazabilidad de revisiones.

### 2.8 Analítica y Business Intelligence (Módulo 8)
- **RF-ANA-01 [S]:** Generación de mapas de calor (Heatmaps) de concentración de incidencias, delitos o fallas de alumbrado.
- **RF-ANA-02 [S]:** Tableros ejecutivos con KPIs: tiempo medio de respuesta (MTTR), inversión ejercida y cobertura de servicios.

### 2.9 Aplicación de Campo PWA Offline (Módulo 9)
- **RF-FLD-01 [S]:** La PWA debe permitir capturar incidencias, predios e inspecciones sin conexión a internet, persistiendo los datos en Dexie.js.
- **RF-FLD-02 [S]:** La PWA debe capturar fotografías con la cámara del dispositivo y comprimirlas localmente a formato WebP preservando coordenadas GPS en metadatos.
- **RF-FLD-03 [S]:** La PWA debe permitir la descarga previa de áreas cartográficas (Vector Tiles / GeoJSON) para visualización sin red.
- **RF-FLD-04 [S]:** El motor de sincronización debe detectar la reanudación de conectividad y transmitir la cola de operaciones pendientes mediante lotes idempotentes.

### 2.10 Gemelo Digital 3D (Módulo 10)
- **RF-DTW-01 [C]:** Visualización tridimensional del entorno urbano integrando modelos 3D Tiles y elevaciones topográficas.
- **RF-DTW-02 [C]:** Simulación de escenarios de sombra y análisis de elevación para zonas de riesgo de inundación.

### 2.11 Inteligencia Artificial Territorial (Módulo 11)
- **RF-AI-01 [C]:** Asistente conversacional especializado (GeoAgent, UrbanAgent, InfraAgent) para responder consultas territoriales complejas en lenguaje natural.
- **RF-AI-02 [C]:** La IA debe formular consultas a través de endpoints de API controlados y validados; cero ejecución de SQL arbitrario en producción.

### 2.12 Administración Central y Multi-Tenant (Módulo 12)
- **RF-ADM-01 [M]:** Control de usuarios, roles granulares, departamentos, asignación de permisos y bitácora de auditoría inmutable.
- **RF-ADM-02 [M]:** Aislamiento estricto de información por organización en base de datos mediante PostgreSQL Row Level Security (RLS).
- **RF-ADM-03 [M]:** Configuración de la organización (logotipos institucionales, colores temáticos, proyección cartográfica local y límites territoriales).

---

## 3. Requerimientos No Funcionales (RNF)

### 3.1 Rendimiento y Eficiencia
- **RNF-PERF-01:** El tiempo de respuesta de las APIs transaccionales debe ser menor a 300 ms en el percentil 95 (P95) bajo carga normal.
- **RNF-PERF-02:** El visor de mapas con MapLibre GL JS debe mantener una tasa de cuadros estable de al menos 45 FPS en equipos estándar al visualizar hasta 10,000 entidades simultáneas.
- **RNF-PERF-03:** Las consultas espaciales complejas (intersecciones de polígonos, buffers) deben retornar resultados en menos de 1.5 segundos gracias a índices espaciales `GIST`.

### 3.2 Seguridad y Protección de Datos
- **RNF-SEC-01:** Toda comunicación externa e interna debe estar cifrada mediante TLS 1.3.
- **RNF-SEC-02:** Las contraseñas deben almacenarse utilizando el algoritmo de derivación de claves Argon2id o BCrypt con factor de costo $\ge 12$.
- **RNF-SEC-03:** El sistema debe ofrecer Autenticación Multifactor (MFA / TOTP) obligatoria para usuarios con roles de Administrador y Director.
- **RNF-SEC-04:** Cumplimiento con la legislación mexicana de protección de datos personales en posesión de sujetos obligados (LGPDPPSO). Ningún dato de propietarios catastrales o denunciantes ciudadanos debe exponerse públicamente.

### 3.3 Disponibilidad y Resiliencia
- **RNF-AVAIL-01:** La modalidad SaaS Cloud debe ofrecer una disponibilidad mensual de servicio del 99.9% (SLA).
- **RNF-AVAIL-02:** Los despliegues Private On-premise deben operar de forma 100% autónoma, sin requerir conexión a internet para autenticar usuarios locales o consultar capas locales.
- **RNF-AVAIL-03:** Los respaldos de base de datos deben ejecutarse diariamente de forma automatizada, con pruebas de restauración trimestrales (RPO < 2 horas, RTO < 4 horas).

### 3.4 Usabilidad y Accesibilidad
- **RNF-UX-01:** La interfaz debe ser completamente adaptativa (*Mobile-First Responsive*) para operar en smartphones, tabletas rugerizadas de campo y monitores de alta resolución (4K) en salas de control.
- **RNF-UX-02:** El sistema debe ofrecer alternancia fluida entre Modo Oscuro (Dark Mode de alto contraste geoespacial) y Modo Claro (Light Mode administrativo).

---

## 4. Criterios de Aceptación del Documento
- Cobertura total de los 12 módulos funcionales.
- Separación rigurosa entre requisitos del MVP comercial y versiones avanzadas.
- Inclusión explícita de las cinco decisiones inmutables aprobadas.
