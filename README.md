# UniNotas — Sistema de Gestión de Notas Universitarias

## Descripción

UniNotas es una aplicación web estática desarrollada como proyecto académico para la asignatura **Fundamentos Web** de la Universidad de las Fuerzas Armadas ESPE, Sede Santo Domingo. Simula un sistema de gestión de notas universitarias, permitiendo a estudiantes y docentes consultar calificaciones, reportes académicos, servicios institucionales y más, todo desde una interfaz web moderna y responsiva.

---

## Objetivo

Desarrollar un sitio web multi-página aplicando los fundamentos del desarrollo frontend: HTML5 semántico, CSS3 modular y Bootstrap 5, con integración de datos estructurados en formatos JSON y XML que representen la información académica del sistema.

---

## Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| HTML5 | — | Estructura semántica de todas las páginas |
| CSS3 | — | Estilos personalizados (arquitectura modular) |
| Bootstrap | 5.3.3 | Framework CSS responsivo y componentes UI |
| Font Awesome | 6.5.0 | Íconos vectoriales |
| JSON | — | Almacenamiento de datos académicos |
| XML | 1.0 | Representación alternativa de datos estructurados |
| Git / GitHub | — | Control de versiones y repositorio remoto |

---

## Estructura de Carpetas

```
U2_Proyecto_TomaloAnndy/
│
├── index.html            # Página de inicio de sesión
├── principal.html        # Dashboard principal (panel del estudiante)
├── docente.html          # Panel del docente
├── reportes.html         # Reportes de calificaciones
├── servicios.html        # Servicios académicos disponibles
├── galeria.html          # Galería institucional
├── acerca.html           # Información sobre el sistema
├── contacto.html         # Formulario y datos de contacto
├── buscar.html           # Buscador de contenido
├── registro.html         # Registro de nuevo usuario
│
├── css/
│   ├── general.css       # Estilos globales y overrides de Bootstrap
│   ├── index.css         # Estilos de la página de login
│   ├── principal.css     # Estilos del dashboard
│   ├── docente.css       # Estilos del panel docente
│   ├── reportes.css      # Estilos de reportes
│   ├── servicios.css     # Estilos de servicios
│   ├── galeria.css       # Estilos de la galería
│   ├── acerca.css        # Estilos de la página Acerca de
│   ├── contacto.css      # Estilos de contacto
│   ├── buscar.css        # Estilos del buscador
│   └── registro.css      # Estilos del formulario de registro
│
├── datos/
│   ├── datos.json        # Datos académicos en formato JSON
│   └── datos.xml         # Datos académicos en formato XML
│
├── img/
│   ├── logo.png
│   ├── logo1.png
│   ├── que es.jpg
│   └── telf.png
│
└── Barra/
    └── *.ico             # Íconos de la barra de navegación
```

---

## Páginas Disponibles

| Archivo | Título | Descripción |
|---|---|---|
| `index.html` | Inicio de Sesión | Formulario de autenticación con credenciales universitarias |
| `principal.html` | Dashboard | Panel de bienvenida con navegación general del sistema |
| `docente.html` | Panel Docente | Vista para gestión de calificaciones por parte del docente |
| `reportes.html` | Reportes | Visualización de calificaciones parciales y finales |
| `servicios.html` | Servicios | Servicios académicos ofrecidos por la institución |
| `galeria.html` | Galería | Galería de imágenes institucionales |
| `acerca.html` | Acerca de | Información general sobre el sistema UniNotas |
| `contacto.html` | Contacto | Formulario de contacto y datos institucionales |
| `buscar.html` | Buscar | Módulo de búsqueda de contenido |
| `registro.html` | Registro | Formulario de creación de cuenta para nuevos usuarios |

---

## Componentes Bootstrap Utilizados

- **Navbar** (`navbar`, `navbar-expand-lg`, `navbar-toggler`, `collapse`) — Barra de navegación responsiva con menú colapsable
- **Cards** (`card`, `.card-uninotas`) — Contenedores de información y formularios
- **Forms** (`form-control`, `form-label`, `mb-3`) — Formularios de login, registro y contacto
- **Buttons** (`btn`, `btn-primary`, `btn-lg`, `d-grid`) — Botones de acción
- **Grid System** (`container`, `container-fluid`, `row`, `col-*`) — Sistema de columnas responsivo
- **Utilities** (`text-center`, `fw-bold`, `text-muted`, `mt-*`, `mx-auto`, `gap-*`) — Clases de utilidad para espaciado, alineación y tipografía
- **Tables** (`table`, `table-striped`, `table-hover`) — Tablas de calificaciones y reportes

---

## Archivos de Datos

### `datos/datos.json`

Archivo en formato **JSON (JavaScript Object Notation)** que actúa como base de datos estática del sistema. Contiene información organizada en los siguientes objetos:

- **`sistema`** — Metadatos del proyecto: nombre, versión, institución, autor y enlace a GitHub.
- **`periodos`** — Semestres académicos disponibles con fechas de inicio y fin (2025-1, 2025-2, 2026-1).
- **`materias`** — Asignaturas del período activo: Estructura de Datos, Ingeniería de Software, Cálculo Diferencial y Redes de Computadoras.
- **`docentes`** — Información de los cuatro docentes asignados a cada materia, incluyendo correo institucional.
- **`estudiantes`** — Registro de cinco estudiantes con sus datos académicos y estado activo.
- **`calificaciones`** — Notas de los tres parciales y promedio final por estudiante y materia, con estado Aprobado/Reprobado.
- **`calendario_academico`** — Fechas de parciales, exámenes finales y período de recalificaciones.
- **`servicios`** — Listado de los seis servicios disponibles en el sistema.
- **`contacto`** — Información institucional de soporte: correo, teléfono, dirección y redes sociales.

### `datos/datos.xml`

Archivo en formato **XML (eXtensible Markup Language)** que representa un subconjunto de los datos académicos del sistema con estructura jerárquica de etiquetas. Contiene:

- **`<sistema>`** — Información general del sistema (nombre, versión, institución, sede, autor).
- **`<estudiantes>`** — Datos del estudiante principal (E001: Anndy Ismael Tomalo), con cédula, correo y semestre.
- **`<materias>`** — Las cuatro materias del período activo con sus códigos y créditos.
- **`<calificaciones>`** — Registros de notas del estudiante E001 en dos materias, con parciales, promedio final y estado.

> El archivo XML utiliza atributos (`id`, `codigo`, `estudiante_id`, `materia_codigo`) para establecer relaciones entre entidades, mientras que el JSON usa propiedades anidadas para una representación más completa del mismo modelo de datos.

---

## Instrucciones para Ejecutar el Proyecto

El proyecto es completamente estático (HTML + CSS + JS). No requiere instalación de dependencias ni servidor backend.

**Opción 1 — Abrir directamente en el navegador:**

1. Descarga o clona el repositorio.
2. Abre el archivo `index.html` con cualquier navegador moderno (Chrome, Firefox, Edge).
3. Ingresa cualquier correo y contraseña para acceder al sistema.

**Opción 2 — Clonar desde GitHub:**

```bash
git clone https://github.com/Anndy31/U2_Proyecto.git
cd U2_Proyecto
# Abre index.html en tu navegador
```

**Opción 3 — Con extensión Live Server (VS Code):**

1. Instala la extensión **Live Server** en Visual Studio Code.
2. Abre la carpeta del proyecto.
3. Haz clic derecho sobre `index.html` → **Open with Live Server**.

> **Nota:** Para que los íconos de Font Awesome carguen correctamente se requiere conexión a internet, ya que se cargan desde CDN.

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
| **GitHub** | [https://github.com/Anndy31/U2_Proyecto](https://github.com/Anndy31/U2_Proyecto) |
