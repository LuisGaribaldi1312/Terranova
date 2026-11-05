# TERRANOVA: Sistema de Diseño Visual y Experiencia de Usuario
## Enterprise Geospatial Technology (v1.0)

---

### 1. Filosofía Visual
TERRANOVA combina la sobriedad y robustez de una plataforma de software empresarial (B2B/B2G) con la densidad informativa y fluidez de una **consola de mando geoespacial de alta tecnología**.

- **Atmósfera:** Precisión técnica, alta legibilidad, mapas oscuros/claros de alto contraste y componentes con feedback táctil y visual inmediato.
- **Doble Esquema de Color:**
  - **Dark Mode (Default en Sala de Control / GIS):** Minimiza fatiga visual en monitores de monitoreo continuo y resalta vectores cartográficos fluorescentes.
  - **Light Mode (Default en Gestión Administrativa y Expedientes):** Optimizado para oficinas y revisión documental.

---

### 2. Paleta Cromática y Tokens de Marca

| Nombre del Token | Valor Hexadecimal | Rol en el Sistema | Uso Específico |
|---|---|---|---|
| `--color-deep-blue` | `#0B1D2A` | Fondo Primario (Dark) / Marca | Sidebar, fondos principales, encabezados oscuros |
| `--color-petroleum-blue` | `#123C50` | Contenedores / Superficies | Tarjetas, paneles flotantes, modales, bordes sutiles |
| `--color-tech-green` | `#17A987` | Acento Primario / Acción | Botones primarios, indicadores de éxito, geometrías activas, KPIs clave |
| `--color-tech-green-hover`| `#12886C` | Estado Hover Activo | Interacciones hover y focus rings |
| `--color-light-gray` | `#E9F0F2` | Fondo Primario (Light) / Texto (Dark)| Texto principal en dark mode, fondos en light mode |
| `--color-warning` | `#EAB308` | Alerta / Prevención | Incidencias pendientes, obras con retraso ligero |
| `--color-danger` | `#EF4444` | Crítico / Detención | Incidencias críticas, baches peligrosos, fallas de drenaje |
| `--color-info` | `#38BDF8` | Información / Sensores | Puntos de interés, alumbrado operativo, sensores |

---

### 3. Configuración de Tailwind CSS (Token Mapping)

```js
// packages/shared/src/styles/theme.ts o tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terranova: {
          900: '#0B1D2A', // Deep Blue
          800: '#123C50', // Petroleum Blue
          700: '#1A4F68',
          600: '#236584',
          500: '#17A987', // Tech Green (Brand Accent)
          400: '#22C49F',
          300: '#5EE0C1',
          100: '#E9F0F2', // Light Gray
          50:  '#F4F8F9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'] // Para coordenadas, claves catastrales y folios
      }
    }
  }
}
```

---

### 4. Arquitectura de Pantalla y Distribución del Layout

El layout principal se divide en una cuadrícula modular pensada para operaciones GIS fluidas:

```
+-----------------------------------------------------------------------------------------+
| [TOPBAR] Logo TERRANOVA | Selector Org: Municipio de Puebla | Notificaciones | Perfil    |
+--------------+------------------------------------------------------------+-------------+
| [SIDEBAR]    | [MAIN VIEWPORT]                                            | [INSPECTOR] |
| - Dashboard  |                                                            | Ficha de    |
| - GIS Map    |  [MAPA CARTOGRÁFICO INTERACTIVO / VISTA DE DATOS]           | Predio /    |
| - Predios    |  - Capas activas superpuestas                              | Detalle de  |
| - Infraest.  |  - Barra de herramientas de medición y dibujo              | Incidencia  |
| - Incidenc.  |  - Tarjetas flotantes de KPIs rápidos                      |             |
| - Proyectos  |                                                            | - Fotos     |
| - PWA Field  |                                                            | - Historial |
| - Admin      |                                                            | - Acciones  |
+--------------+------------------------------------------------------------+-------------+
| [STATUS BAR] Coordenadas: 19.0438° N, 98.1983° W | EPSG:6362 | Conexión: ONLINE (99.8%) |
+-----------------------------------------------------------------------------------------+
```
