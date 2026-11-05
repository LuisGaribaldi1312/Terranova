# TERRANOVA — REGLAS PERMANENTES PARA AGENTES DE DESARROLLO (AGENTS.md)
> Este archivo define las directrices obligatorias e inmutables para todos los agentes de Inteligencia Artificial (Antigravity, Claude Code, etc.) y desarrolladores que operen en el repositorio **TERRANOVA**.

---

## 1. PRINCIPIOS Y DECISIONES INMUTABLES
1. **Modelo Híbrido Estricto:** TERRANOVA opera bajo un solo núcleo de software común que soporta tres escenarios: *Cloud Compartido (Multi-tenant)*, *Cloud Dedicado* y *Private On-premise (Air-gapped capaz)*. Queda estrictamente prohibido crear bifurcaciones de código incompatibles para clientes privados.
2. **Cobertura Nacional México:** Los estándares geográficos y catastrales deben apegarse rigurosamente al Marco Geoestadístico Nacional (MGN) del INEGI y a las proyecciones cartográficas oficiales (`EPSG:6362` ITRF2008 / `EPSG:4326`). No se permite la inclusión de datos simulados o ficticios que pretendan hacerse pasar por información oficial.
3. **Cartografía Intercambiable:** El motor base es MapLibre GL JS con OpenStreetMap y capas vectoriales/raster OGC (WMS/WMTS/WFS). La arquitectura no debe acoplarse de forma rígida a un solo proveedor cartográfico propietario.
4. **Offline-First Nativo:** Todo módulo de captura o inspección en campo debe diseñarse para operar sin conectividad a internet desde el día 1, usando Service Workers, IndexedDB con Dexie.js, colas de sincronización transaccional con idempotencia y resolución de conflictos determinista.
5. **Horizontalidad Multi-Sector:** Un único núcleo adaptable mediante configuración por tenant para Gobiernos, Desarrolladoras Inmobiliarias, Constructoras, Consultoras y Servicios Urbanos.

---

## 2. REGLAS DE DESARROLLO Y CÓDIGO
- **TypeScript Estricto:** Modo `strict: true` en frontend y backend. Prohibido el uso de `any` injustificado. Toda entidad y respuesta debe tener tipado fuerte en `@terranova/shared`.
- **Aislamiento Multi-Tenant en Backend:** Ninguna consulta SQL o llamada a base de datos puede omitir el contexto `organization_id`. Todas las tablas sensibles deben respaldarse con PostgreSQL Row Level Security (RLS).
- **Cero Funcionalidades Fantasma:** Queda terminantemente prohibido dejar botones sin acción, enlaces a rutas inexistentes o simular respuestas de red exitosas cuando no se ha implementado el endpoint correspondiente.
- **Validación Bidireccional:** Todo formulario debe validarse en cliente y revalidarse rigurosamente en el backend (DTOs con `class-validator` / Zod).
- **Criptografía y Secretos:** Las contraseñas se procesan exclusivamente con algoritmos de derivación de claves robustos (Argon2id o BCrypt con factor de costo alto). Nunca almacenar llaves API, tokens o credenciales en texto plano en el repositorio.
- **Trazabilidad y Auditoría:** Toda mutación de datos críticos (catastro, roles, obras, expedientes) debe generar un registro inmutable en `audit_logs`.
- **Trabajo por Fases:** No iniciar código de una fase subsecuente sin haber superado los criterios de aceptación y las pruebas de la fase activa.
- **Documentación Viva:** Cualquier cambio arquitectónico, de base de datos o de API debe reflejarse inmediatamente en la carpeta `docs/` y registrarse en `docs/decisions/DECISIONS.md`.
