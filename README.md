# UniNotas — Sistema de Gestión de Notas Universitarias

## Nombre del estudiante

**Anndy Ismael Tomalo**

---

## Descripción

UniNotas es una aplicación web dinámica e interactiva desarrollada como proyecto integrador para la asignatura **Fundamentos Web**, Universidad de las Fuerzas Armadas ESPE, Sede Santo Domingo. Simula un sistema de gestión de notas universitarias que permite a estudiantes y docentes consultar y administrar calificaciones, ver reportes académicos con gráficos estadísticos, explorar servicios institucionales y registrarse en la plataforma indicando su nacionalidad mediante una API externa.

El proyecto evolucionó durante los tres parciales: partió de una estructura HTML semántica y estática (Parcial 1), se transformó en un sitio completamente responsivo con Bootstrap (Parcial 2) y, en su versión final, se convirtió en una aplicación dinámica con JavaScript, datos en JSON, `localStorage`, librerías externas y consumo de APIs (Parcial 3).

---

## Objetivo

Integrar HTML semántico, diseño web responsivo, JavaScript, archivos JSON, almacenamiento local, librerías externas y APIs en el proyecto de aula, demostrando su evolución técnica a lo largo del curso mediante evidencias de funcionamiento y publicación en GitHub.

---

## Funcionalidades

### Autenticación simulada
- Inicio de sesión (`index.html` / `login.js`) con validación de correo y contraseña.
- Redirección automática según rol: estudiante → `principal.html`, docente → `docente.html`.
- Protección de rutas en todas las páginas protegidas.
- Cierre de sesión con confirmación mediante SweetAlert2.

### Dashboard del estudiante (`principal.html`)
- Bienvenida con nombre del estudiante inyectado dinámicamente.
- Frase motivacional obtenida desde la API externa Quotable (con fallback local).
- Panel de indicadores globales del sistema (estudiantes, docentes, materias, aprobados, reprobados, promedio global), calculados con `reduce`, `filter` y `map`.
- Resumen académico personal: materias aprobadas, reprobadas y promedio general del período activo.
- Tabla de calificaciones generada desde `localStorage`, con columna de detalle y resaltado de filas por `mouseover`.
- Modal de detalle completo del elemento con historial del estudiante (SweetAlert2).

### Panel docente (`docente.html` / `docentes.js`)
- Acceso restringido al rol `docente`.
- Inyección dinámica del nombre del docente, materia asignada y período activo.
- Tabla de estudiantes matriculados en la materia del docente con vista rápida por `mouseover`.
- CRUD completo de calificaciones mediante delegación de eventos:
  - **Registrar** nueva calificación con cálculo automático de promedio y estado.
  - **Editar** precargando los datos del registro seleccionado en el formulario.
  - **Eliminar** con confirmación previa mediante SweetAlert2.
- Gráfico de dona (Chart.js) que se actualiza en tiempo real tras cada operación CRUD.
- Panel de indicadores globales sincronizado con el CRUD.
- Formulario con `select` de estudiantes llenado dinámicamente y precarga de notas existentes.

### Reportes académicos (`reportes.html` / `reportes.js`)
- Filtros combinados por materia y período (selects llenados dinámicamente).
- Tabla de vista previa generada con `map` sobre los datos filtrados.
- Estadísticas calculadas: total de estudiantes, aprobados, reprobados, porcentajes y promedio general, usando `filter`, `reduce`, `every` y `some`.
- Barras de progreso y nota de contexto contextual.
- Gráfico de dona (aprobados vs. reprobados) y gráfico de barras (promedio por estudiante) con Chart.js.
- Consejo del día obtenido desde la API externa Advice Slip (con fallback).
- Botón "Restaurar datos" que recarga los gráficos sin recargar la página.

### Servicios académicos (`servicios.html` / `servicios.js`)
- Tarjetas generadas dinámicamente desde `json/servicios.json` con badge de disponibilidad.
- Tabla de calendario académico 2026-1 con estados en tiempo real.

### Buscador de contenido (`buscar.html` / `servicios.js → iniciarBusqueda`)
- Búsqueda en tiempo real con evento `input` y **debounce** (300 ms) sobre nombre del estudiante.
- Filtros combinados: materia (select dinámico), período, estado académico (Aprobado / Reprobado).
- Ordenamiento por nombre (A–Z), promedio mayor a menor y promedio menor a mayor.
- Contador de resultados actualizado en cada búsqueda.
- Vista de detalle completo al hacer clic sobre una fila (modal SweetAlert2).
- Delegación de eventos para `click`, `mouseover` y `mouseout` sobre filas dinámicas.

### Registro de usuarios (`registro.html` / `registro.js`)
- Formulario con validación completa: nombres, apellidos, cédula (10 dígitos), fecha de nacimiento (16–100 años), género, semestre, correo, contraseña (8–16 caracteres), confirmación de contraseña y aceptación de términos.
- Selector personalizado de **nacionalidad** conectado a la API `countries.dev`:
  - Búsqueda en vivo mientras el usuario escribe.
  - Muestra bandera emoji y nombre del país.
  - Delegación de eventos en la lista desplegable.
  - Ecuador preseleccionado por defecto.
  - Fallback con 10 países latinoamericanos si la API no responde.
- Verificación de correo y cédula no duplicados en `localStorage`.
- Persistencia del nuevo usuario y estudiante en `localStorage`.
- Modal de términos y condiciones con Bootstrap.
- Confirmación con SweetAlert2 y redirección al login tras el registro.

### Galería institucional (`galeria.html`)
- Recursos visuales del sistema con CSS Grid personalizado.
- Panel de estadísticas del proyecto con Flexbox Bootstrap.

### Acerca de (`acerca.html`)
- Misión, visión y objetivos del sistema.
- Acordeón Bootstrap con componentes interactivos.

### Contacto (`contacto.html`)
- Información de contacto institucional.

### Carga y persistencia de datos
- Primera ejecución: descarga todos los JSON mediante `fetch` con `Promise.all` y los persiste en `localStorage`.
- Visitas posteriores: lee directamente de `localStorage` (bandera `uninotas_inicializado`).
- Versionamiento: si `uninotas_version` cambia, se fuerza la recarga de los JSON.
- Fallback embebido: si `fetch` falla (protocolo `file://`), se usan los datos semilla de `api.js`.
- Restablecimiento: botón "Restaurar datos" disponible en todas las páginas protegidas con confirmación previa.

### Panel de indicadores y operaciones sobre arreglos
- `map()` — construcción de filas, tarjetas, etiquetas de gráficos y listados.
- `filter()` — filtrado por materia, período, estado y término de búsqueda.
- `find()` — resolución de relaciones entre JSON (docente → materia, cal → estudiante).
- `reduce()` — cálculo de promedios y sumas de totales.
- `sort()` — ordenamiento por nombre y promedio.
- `every()` — verificación de aprobación total en una materia.
- `some()` — detección de nota perfecta (10) en algún parcial.

### Manejo de errores
- Validación de `response.ok` en todos los `fetch`.
- Bloques `try/catch` en carga de JSON y APIs externas.
- Fallback de datos cuando la API no responde.
- Mensaje visible al usuario cuando no hay resultados.
- Mensajes inline de validación en todos los formularios con clases Bootstrap (`is-invalid` / `is-valid`).

### Indicadores de carga
- Spinner de carga global creado dinámicamente y controlado con `mostrarSpinner(true/false)`.
- Texto "Cargando..." en todos los contenedores dinámicos antes de que JS inyecte los datos.

---

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura semántica de todas las páginas (`header`, `nav`, `main`, `section`, `article`, `footer`, `form`, `table`) |
| CSS3 | Estilos personalizados modulares por página + `general.css` compartido |
| Bootstrap 5.3.3 | Grid responsivo, navbar, cards, formularios, tablas, modales, acordeón, badges, progress bars |
| JavaScript ES6+ | Manipulación del DOM, eventos, `fetch`, `async/await`, módulos globales, delegación de eventos |
| JSON | Fuente de datos del sistema (7 archivos) |
| Font Awesome 6.5.0 | Íconos vectoriales en el header de login |
| Git / GitHub | Control de versiones y repositorio remoto |

---

## Librerías incorporadas

| Librería | Versión | Incorporación | Uso en el proyecto |
|---|---|---|---|
| **SweetAlert2** | v11 | CDN | Confirmación de eliminación de calificaciones, restablecimiento de datos, modal de detalle completo, confirmación de registro, cierre de sesión |
| **Toastify JS** | Última | CDN | Notificaciones breves de éxito (verde), error (rojo) e informativas (azul): registro guardado, calificación actualizada, eliminación, datos restaurados, bienvenida |
| **Chart.js** | v4.4.3 | CDN | Gráfico de dona (aprobados/reprobados) en reportes y en el panel docente; gráfico de barras (promedio por estudiante) en reportes. Se actualiza al crear, editar o eliminar calificaciones |

---

## APIs consumidas

| API | URL | Uso | Manejo de errores |
|---|---|---|---|
| **countries.dev** | `https://countries.dev/countries?fields=name,alpha2Code,flag` | Selector personalizado de nacionalidad en `registro.html`: nombre del país, bandera emoji y búsqueda en vivo | Fallback con 10 países latinoamericanos |
| **Quotable API** | `https://api.quotable.io/random?tags=success\|motivational` | Frase motivacional en el dashboard del estudiante | Fallback con frase local |
| **Advice Slip** | `https://api.adviceslip.com/advice` | Consejo del día en el panel de reportes | Fallback con mensaje fijo |

Todas las integraciones verifican `response.ok`, incluyen `try/catch` y muestran un valor de respaldo cuando la API no responde.

---

## Organización de los archivos JSON

La carpeta `json/` contiene **7 archivos** con más de 100 registros distribuidos. Los datos se cargan mediante `fetch` en la primera ejecución y se persisten en `localStorage`.

| Archivo | Registros | Descripción | Relaciones |
|---|---|---|---|
| `usuarios.json` | 33 | Credenciales de acceso (correo, password, rol, `refId`) | `refId` → `estudiantes.json` o `docentes.json` |
| `estudiantes.json` | 25 | Datos académicos y personales del estudiante | `correo` coincide con `usuarios.json` |
| `docentes.json` | 8 | Nombre, título, correo y `materia_id` del docente | `materia_id` → `materias.json` |
| `materias.json` | 8 | Código, nombre, créditos, semestre, `docente_id` | `docente_id` → `docentes.json` |
| `calificaciones.json` | 73 | Parcial 1, 2, 3, promedio final, estado, `estudiante_id`, `materia_codigo` | `estudiante_id` → `estudiantes.json`; `materia_codigo` → `materias.json` |
| `servicios.json` | 6 | Servicios académicos disponibles | — |
| `periodos.json` | 3 | Períodos académicos con bandera `activo` | Referenciado en `calificaciones.json` y `materias.json` |

**Relaciones gestionadas por JavaScript:**
- El docente logueado se identifica con `sesion.refId` → busca en `docentes.json` → obtiene `materia_id` → busca en `materias.json` con `find()`.
- Cada calificación referencia `estudiante_id` y `materia_codigo`; JavaScript resuelve los nombres con `find()` al renderizar tablas y gráficos.
- Los períodos son filtrados con `find((p) => p.activo)` para determinar el período académico vigente.

---

## Eventos de JavaScript utilizados

| Evento | Dónde se usa |
|---|---|
| `DOMContentLoaded` | Punto de entrada de todos los módulos JS |
| `submit` | Formularios de login, registro y calificaciones |
| `input` | Búsqueda en tiempo real con debounce (buscar.html, selector de países) |
| `change` | Filtros de materia, período y estado; preselección de estudiante en el formulario docente |
| `click` | Botones de detalle, editar, eliminar, restaurar datos, cerrar sesión |
| `mouseover` / `mouseout` | Resaltado de filas en tablas y vista rápida del docente |
| Delegación de eventos | Todos los botones generados dinámicamente en `tbody-docente`, `tbody-calificaciones` y `tbody-busqueda` |

---

## Estructura de carpetas

```
U2_Proyecto_TomaloAnndy/
│
├── index.html            # Inicio de sesión
├── principal.html        # Dashboard del estudiante
├── docente.html          # Panel del docente (CRUD de calificaciones + gráfico)
├── reportes.html         # Reportes con estadísticas y gráficos Chart.js
├── servicios.html        # Servicios académicos y calendario
├── galeria.html          # Galería institucional
├── acerca.html           # Información sobre el sistema
├── contacto.html         # Formulario y datos de contacto
├── buscar.html           # Buscador con filtros y ordenamiento
├── registro.html         # Registro de usuario (con API de países)
├── README.md
│
├── css/
│   ├── general.css       # Estilos compartidos (header, footer, navbar, spinner)
│   ├── index.css         # Login
│   ├── principal.css     # Dashboard estudiante
│   ├── docente.css       # Panel docente
│   ├── reportes.css      # Reportes
│   ├── servicios.css     # Servicios
│   ├── galeria.css       # Galería
│   ├── acerca.css        # Acerca de
│   ├── registro.css      # Registro
│   ├── contacto.css      # Contacto
│   └── buscar.css        # Buscador
│
├── js/
│   ├── storage.js        # Capa de acceso a localStorage (CRUD genérico + sesión)
│   ├── utils.js          # Funciones utilitarias: calcularPromedio, calcularEstado,
│   │                     # debounce, escaparHTML, generarId, validadores básicos
│   ├── api.js            # Fetch de JSON locales + APIs externas + datos semilla
│   ├── ui.js             # SweetAlert2, Toastify, spinner, tablas, tarjetas,
│   │                     # panel de indicadores, detalle de calificación
│   ├── validaciones.js   # Validación de login, registro y calificaciones
│   ├── main.js           # Bootstrap de páginas protegidas (protección de ruta,
│   │                     # navbar por rol, cerrar sesión, restaurar datos)
│   ├── login.js          # Autenticación y redirección por rol
│   ├── registro.js       # Registro de usuario + selector de nacionalidad con API
│   ├── estudiantes.js    # Dashboard del estudiante (tabla, resumen, frase)
│   ├── docentes.js       # Panel docente (CRUD, gráfico, vista rápida, hover)
│   ├── reportes.js       # Reportes, estadísticas, Chart.js, Advice Slip API
│   └── servicios.js      # Servicios (tarjetas, calendario) + Buscador (filtros,
│                          # ordenamiento, debounce, delegación de eventos)
│
├── json/
│   ├── usuarios.json     # 33 registros — credenciales de acceso
│   ├── estudiantes.json  # 25 registros — datos académicos y personales
│   ├── docentes.json     # 8 registros  — docentes y materia asignada
│   ├── materias.json     # 8 registros  — materias del semestre
│   ├── calificaciones.json # 73 registros — notas parciales y promedio
│   ├── servicios.json    # 6 registros  — servicios institucionales
│   └── periodos.json     # 3 registros  — períodos académicos
│
├── img/                  # Recursos gráficos (logos, imágenes)
└── Barra/                # Íconos .ico para favicon de cada página
```

---

## Instrucciones para ejecutar el proyecto

El proyecto consume archivos JSON mediante `fetch`, por lo que **requiere un servidor local** y no funciona al abrir `index.html` directamente con el protocolo `file://`.

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Anndy31/U2_Proyecto.git
   cd U2_Proyecto
   ```

2. Abre la carpeta en **Visual Studio Code** e instala la extensión **Live Server**.

3. Haz clic derecho sobre `index.html` → **Open with Live Server**.

4. Ingresa con cualquiera de las credenciales de prueba:

   | Rol | Correo | Contraseña |
   |---|---|---|
   | Estudiante | `aitomalo@espe.edu.ec` | `uninotas123` |
   | Docente | `lbeltran@espe.edu.ec` | `docente123` |
   | Docente | `vsuarez@espe.edu.ec` | `docente123` |

5. En el **primer arranque** la aplicación descarga los archivos JSON y los guarda en `localStorage`. Las siguientes ejecuciones usarán esos datos almacenados.

6. Para volver a los datos originales, usa el botón **↺ Restaurar datos** disponible en la barra de navegación.

> Se requiere conexión a Internet para cargar Bootstrap, Font Awesome, SweetAlert2, Toastify, Chart.js y las APIs externas desde CDN.

---

## Capturas principales

> _(Insertar capturas de: página de login, dashboard del estudiante, panel docente con tabla y gráfico, reportes con gráfico de dona y de barras, buscador con filtros activos, formulario de registro con selector de país, vista móvil / tableta / escritorio de la misma sección, modal SweetAlert2 de confirmación de eliminación, notificación Toastify, datos almacenados en localStorage desde DevTools, repositorio GitHub y GitHub Pages.)_

---

## Enlace de GitHub Pages

🔗 **Aplicación publicada:** `https://anndy31.github.io/U2_Proyecto/`

🔗 **Repositorio:** `https://github.com/Anndy31/U2_Proyecto`

---

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
