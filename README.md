# UniNotas — Sistema de Gestión de Notas Universitarias

## Nombre del estudiante

Anndy Ismael Tomalo

## Descripción

UniNotas es una aplicación web dinámica e interactiva desarrollada como proyecto integrador para la asignatura **Fundamentos Web**, Universidad de las Fuerzas Armadas ESPE, Sede Santo Domingo. Simula un sistema de gestión de notas universitarias que permite a estudiantes y docentes consultar y administrar calificaciones, ver reportes académicos con gráficos estadísticos, explorar servicios institucionales y registrarse en la plataforma indicando su nacionalidad.

El proyecto evolucionó durante los tres parciales: partió de una estructura HTML semántica y estática (parcial 1), se convirtió en un sitio completamente responsivo (parcial 2) y finalmente se transformó en una aplicación dinámica con JavaScript, datos en JSON, `localStorage`, librerías externas y consumo de APIs (parcial 3).

## Objetivo

Integrar HTML semántico, diseño web responsivo, JavaScript, archivos JSON, almacenamiento local, librerías externas y APIs en un proyecto de aula coherente y funcional, demostrando su evolución técnica a lo largo del curso.

## Funcionalidades

- **Autenticación simulada** (`index.html` / `login.js`) con validación de formulario.
- **Dashboard del estudiante** (`principal.html`) con navegación general del sistema.
- **Panel docente** (`docente.html` / `docentes.js`):
  - Carga dinámica de calificaciones por materia desde JSON/`localStorage`.
  - Registro, edición y eliminación de calificaciones mediante delegación de eventos.
  - Confirmación de eliminación con **SweetAlert2** y notificaciones con **Toastify**.
  - Actualización inmediata de la tabla e indicadores tras cada operación.
- **Reportes académicos** (`reportes.html` / `reportes.js`):
  - Gráficos de tipo doughnut y de barras con **Chart.js**, generados a partir de los datos reales de calificaciones.
  - Indicadores calculados con `reduce`, `filter`, `map`, `some` y `every` (total, promedio general, % aprobados/reprobados).
- **Servicios académicos** (`servicios.html` / `servicios.js`):
  - Búsqueda en tiempo real (evento `input` con *debounce*) y filtros combinados.
  - Tarjetas generadas dinámicamente desde `json/servicios.json`.
- **Registro de usuario** (`registro.html` / `registro.js`):
  - Formulario validado (correo, contraseña, confirmación, fecha de nacimiento).
  - Selector de nacionalidad conectado a la API de países, con buscador en vivo y bandera.
  - Persistencia del usuario registrado en `localStorage`.
- **Galería institucional**, **Acerca de**, **Contacto** y **Buscador** de contenido.
- **Carga inicial vía `fetch`** de todos los archivos JSON, con siembra automática en `localStorage` en el primer arranque y opción de restablecer los datos originales.
- **Manejo de errores**: validación de `response.ok`, bloques `try/catch` y valores de respaldo (*fallback*) cuando una API externa no responde.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura semántica de todas las páginas |
| CSS3 | Estilos personalizados (arquitectura modular por página) |
| Bootstrap 5.3.3 | Grid responsivo y componentes UI (navbar, cards, forms, tablas) |
| JavaScript (ES6+) | Lógica dinámica, DOM, eventos, `fetch`, `localStorage` |
| JSON | Fuente de datos del sistema (académicos, usuarios, servicios) |
| Font Awesome 6.5.0 | Íconos vectoriales |
| Git / GitHub | Control de versiones y repositorio remoto |

## Librerías incorporadas

| Librería | Uso en el proyecto |
|---|---|
| **SweetAlert2** (v11) | Confirmación de eliminación de calificaciones, restablecimiento de datos y mensajes de resultado |
| **Toastify JS** | Notificaciones breves (registro guardado, error, elemento actualizado, etc.) |
| **Chart.js** (v4.4.3) | Gráfico doughnut y de barras en el módulo de Reportes, actualizado con datos reales |

## APIs consumidas

| API | Uso |
|---|---|
| [countries.dev](https://countries.dev/countries) | Selector de nacionalidad en el formulario de registro: nombre y bandera de cada país, con búsqueda en vivo |
| [Quotable API](https://api.quotable.io) | Frase motivacional mostrada en el dashboard del estudiante |

Ambas integraciones incluyen manejo de estado de carga, verificación de `response.ok` y datos de respaldo en caso de error o falta de conexión.

## Estructura de carpetas

```
U2_Proyecto_TomaloAnndy/
│
├── index.html            # Inicio de sesión
├── principal.html        # Dashboard del estudiante
├── docente.html          # Panel del docente (CRUD de calificaciones)
├── reportes.html         # Reportes y gráficos (Chart.js)
├── servicios.html        # Servicios académicos (búsqueda y filtros)
├── galeria.html          # Galería institucional
├── acerca.html           # Información sobre el sistema
├── contacto.html         # Formulario y datos de contacto
├── buscar.html           # Buscador de contenido
├── registro.html         # Registro de usuario (con API de países)
├── README.md
│
├── css/                  # Estilos por página + estilos generales
├── js/
│   ├── main.js
│   ├── api.js            # fetch de JSON y APIs externas
│   ├── storage.js        # persistencia en localStorage
│   ├── validaciones.js
│   ├── ui.js              # SweetAlert2 / Toastify
│   ├── utils.js
│   ├── login.js
│   ├── registro.js
│   ├── docentes.js
│   ├── estudiantes.js
│   ├── servicios.js
│   └── reportes.js
│
├── json/
│   ├── estudiantes.json
│   ├── docentes.json
│   ├── materias.json
│   ├── periodos.json
│   ├── calificaciones.json
│   ├── servicios.json
│   └── usuarios.json
│
├── img/                  # Recursos gráficos
└── Barra/                # Íconos de la barra de navegación
```

## Instrucciones para ejecutar el proyecto

El proyecto consume archivos JSON mediante `fetch`, por lo que **requiere un servidor local** (no funciona abriendo el `index.html` directamente con `file://`).

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Anndy31/U2_Proyecto.git
   cd U2_Proyecto
   ```
2. Abre la carpeta en Visual Studio Code e instala la extensión **Live Server**.
3. Clic derecho sobre `index.html` → **Open with Live Server**.
4. Ingresa cualquier correo y contraseña en la pantalla de inicio de sesión para acceder al sistema.
5. En el primer arranque la aplicación descargará los archivos JSON y los guardará en `localStorage`; las siguientes ejecuciones usarán esos datos hasta que se elija "Restablecer datos".

> Se requiere conexión a internet para cargar Bootstrap, Font Awesome, SweetAlert2, Toastify, Chart.js y las APIs externas desde CDN.

## Capturas principales

_(Insertar aquí las capturas de: página principal, panel docente, reportes con gráficos, buscador de servicios, formulario de registro con selector de país, vista móvil/tableta/escritorio, SweetAlert2, Toastify y datos en localStorage)._

## Enlace de GitHub Pages

`https://anndy31.github.io/U2_Proyecto/`

## Autor

| Campo | Detalle |
|---|---|
| **Nombre** | Anndy Ismael Tomalo |
| **Institución** | Universidad de las Fuerzas Armadas ESPE |
| **Sede** | Sede Santo Domingo |
| **Carrera** | Tecnologías de la Información |
| **Asignatura** | Fundamentos Web |
| **Período** | 2026-1 |
| **GitHub** | https://github.com/Anndy31/U2_Proyecto |