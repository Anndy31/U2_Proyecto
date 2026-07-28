/* ============================================================
   js/api.js — Consumo de Fetch API
   UniNotas · Unidad 3

   Responsabilidades:
   1) Descargar los JSON de /json/ la PRIMERA vez y guardarlos
      en LocalStorage a través de storage.js.
   2) Usar DATOS_SEMILLA como respaldo si el fetch falla
      (p.ej. al abrir el proyecto con protocolo file://).
   3) Restaurar los datos originales cuando se solicite.
   4) Consumir APIs externas:
      - REST Countries: lista de países para el formulario de registro.
      - Quotable: frases motivacionales para el dashboard del estudiante.

   Orden de carga obligatorio en cada HTML:
     <script src="js/storage.js"></script>
     <script src="js/utils.js"></script>
     <script src="js/api.js"></script>
   ============================================================ */

/* Rutas a los archivos JSON individuales */
const RUTAS_JSON = {
    [UniStorage.CLAVES.USUARIOS]:       "json/usuarios.json",
    [UniStorage.CLAVES.ESTUDIANTES]:    "json/estudiantes.json",
    [UniStorage.CLAVES.DOCENTES]:       "json/docentes.json",
    [UniStorage.CLAVES.MATERIAS]:       "json/materias.json",
    [UniStorage.CLAVES.CALIFICACIONES]: "json/calificaciones.json",
    [UniStorage.CLAVES.SERVICIOS]:      "json/servicios.json",
    [UniStorage.CLAVES.PERIODOS]:       "json/periodos.json"
};

/* ------------------------------------------------------------------ */
/*  Datos semilla embebidos — respaldo cuando fetch no está disponible  */
/* ------------------------------------------------------------------ */
const DATOS_SEMILLA = {
    [UniStorage.CLAVES.USUARIOS]: [
        { id:"U001", correo:"aitomalo@espe.edu.ec",      password:"uninotas123", rol:"estudiante", refId:"E001", nombreCompleto:"Anndy Ismael Tomalo" },
        { id:"U002", correo:"eparedes@espe.edu.ec",      password:"uninotas123", rol:"estudiante", refId:"E002", nombreCompleto:"Estefanía Paredes" },
        { id:"U003", correo:"lgarcia@espe.edu.ec",       password:"uninotas123", rol:"estudiante", refId:"E003", nombreCompleto:"Luis García" },
        { id:"U004", correo:"vmora@espe.edu.ec",         password:"uninotas123", rol:"estudiante", refId:"E004", nombreCompleto:"Valeria Mora" },
        { id:"U005", correo:"cvega@espe.edu.ec",         password:"uninotas123", rol:"estudiante", refId:"E005", nombreCompleto:"Carlos Vega" },
        { id:"U006", correo:"kcadena@espe.edu.ec",       password:"uninotas123", rol:"estudiante", refId:"E006", nombreCompleto:"Kevin Cadena Ramírez" },
        { id:"U007", correo:"xmora@espe.edu.ec",         password:"uninotas123", rol:"estudiante", refId:"E007", nombreCompleto:"Xavier Mora Villacís" },
        { id:"U008", correo:"mgarcía@espe.edu.ec",       password:"uninotas123", rol:"estudiante", refId:"E008", nombreCompleto:"Miguel García Peñafiel" },
        { id:"U009", correo:"mtenesaca@espe.edu.ec",     password:"uninotas123", rol:"estudiante", refId:"E009", nombreCompleto:"María José Tenesaca Herrera" },
        { id:"U010", correo:"lgarcía@espe.edu.ec",       password:"uninotas123", rol:"estudiante", refId:"E010", nombreCompleto:"Lisbeth García Cevallos" },
        { id:"U011", correo:"cvega1@espe.edu.ec",        password:"uninotas123", rol:"estudiante", refId:"E011", nombreCompleto:"Camila Vega Villacís" },
        { id:"U012", correo:"dzambrano@espe.edu.ec",     password:"uninotas123", rol:"estudiante", refId:"E012", nombreCompleto:"Doménica Zambrano Guamán" },
        { id:"U013", correo:"fmora@espe.edu.ec",         password:"uninotas123", rol:"estudiante", refId:"E013", nombreCompleto:"Fabricio Mora Quishpe" },
        { id:"U014", correo:"nmuñoz@espe.edu.ec",        password:"uninotas123", rol:"estudiante", refId:"E014", nombreCompleto:"Nicole Muñoz Villacís" },
        { id:"U015", correo:"palmeida@espe.edu.ec",      password:"uninotas123", rol:"estudiante", refId:"E015", nombreCompleto:"Paola Almeida García" },
        { id:"U016", correo:"cmora@espe.edu.ec",         password:"uninotas123", rol:"estudiante", refId:"E016", nombreCompleto:"Cristian Mora Guamán" },
        { id:"U017", correo:"aortiz@espe.edu.ec",        password:"uninotas123", rol:"estudiante", refId:"E017", nombreCompleto:"Alexander Ortiz Muñoz" },
        { id:"U018", correo:"jtenesaca@espe.edu.ec",     password:"uninotas123", rol:"estudiante", refId:"E018", nombreCompleto:"Josué Tenesaca Ramírez" },
        { id:"U019", correo:"ktoapanta@espe.edu.ec",     password:"uninotas123", rol:"estudiante", refId:"E019", nombreCompleto:"Karen Toapanta Chasi" },
        { id:"U020", correo:"bvega@espe.edu.ec",         password:"uninotas123", rol:"estudiante", refId:"E020", nombreCompleto:"Bryan Vega Chasi" },
        { id:"U021", correo:"vmora1@espe.edu.ec",        password:"uninotas123", rol:"estudiante", refId:"E021", nombreCompleto:"Valeria Mora Villacís" },
        { id:"U022", correo:"mparedes@espe.edu.ec",      password:"uninotas123", rol:"estudiante", refId:"E022", nombreCompleto:"Melany Paredes Cevallos" },
        { id:"U023", correo:"sherrera@espe.edu.ec",      password:"uninotas123", rol:"estudiante", refId:"E023", nombreCompleto:"Santiago Herrera Cando" },
        { id:"U024", correo:"apeñafiel@espe.edu.ec",     password:"uninotas123", rol:"estudiante", refId:"E024", nombreCompleto:"Andrea Peñafiel Ramírez" },
        { id:"U025", correo:"cortiz@espe.edu.ec",        password:"uninotas123", rol:"estudiante", refId:"E025", nombreCompleto:"Carlos Ortiz Herrera" },
        { id:"U026", correo:"lbeltran@espe.edu.ec",      password:"docente123",  rol:"docente",    refId:"D001", nombreCompleto:"Ing. Luis Beltran" },
        { id:"U027", correo:"vsuarez@espe.edu.ec",       password:"docente123",  rol:"docente",    refId:"D002", nombreCompleto:"Ing. Valeria Suárez" },
        { id:"U028", correo:"mandrade@espe.edu.ec",      password:"docente123",  rol:"docente",    refId:"D003", nombreCompleto:"Ing. Marco Andrade" },
        { id:"U029", correo:"ggnarvaez@espe.edu.ec",     password:"docente123",  rol:"docente",    refId:"D004", nombreCompleto:"Ing. Gabriel Gustavo Narváez" },
        { id:"U030", correo:"pvillacis@espe.edu.ec",     password:"docente123",  rol:"docente",    refId:"D005", nombreCompleto:"Ing. Patricia Villacís" },
        { id:"U031", correo:"fchuquimarca@espe.edu.ec",  password:"docente123",  rol:"docente",    refId:"D006", nombreCompleto:"Ing. Fernando Chuquimarca" },
        { id:"U032", correo:"dortiz@espe.edu.ec",        password:"docente123",  rol:"docente",    refId:"D007", nombreCompleto:"Ing. Daniela Ortiz" },
        { id:"U033", correo:"rsalazar@espe.edu.ec",      password:"docente123",  rol:"docente",    refId:"D008", nombreCompleto:"Ing. Ramiro Salazar" }
    ],
    [UniStorage.CLAVES.ESTUDIANTES]: [
        { id:"E001", cedula:"1750123456", nombres:"Anndy Ismael", apellidos:"Tomalo",  correo:"aitomalo@espe.edu.ec", semestre:6, periodo_ingreso:"2024-1", estado_academico:"Activo", nacionalidad:"Ecuador" },
        { id:"E002", cedula:"1745678901", nombres:"Estefanía",    apellidos:"Paredes", correo:"eparedes@espe.edu.ec", semestre:6, periodo_ingreso:"2024-1", estado_academico:"Activo", nacionalidad:"Ecuador" },
        { id:"E003", cedula:"1738901234", nombres:"Luis",         apellidos:"García",  correo:"lgarcia@espe.edu.ec",  semestre:6, periodo_ingreso:"2024-1", estado_academico:"Activo", nacionalidad:"Ecuador" },
        { id:"E004", cedula:"1762345678", nombres:"Valeria",      apellidos:"Mora",    correo:"vmora@espe.edu.ec",    semestre:6, periodo_ingreso:"2024-1", estado_academico:"Activo", nacionalidad:"Ecuador" },
        { id:"E005", cedula:"1729876543", nombres:"Carlos",       apellidos:"Vega",    correo:"cvega@espe.edu.ec",    semestre:6, periodo_ingreso:"2024-1", estado_academico:"Activo", nacionalidad:"Ecuador" }
    ],
    [UniStorage.CLAVES.DOCENTES]: [
        { id:"D001", nombre:"Ing. Luis Beltran",           titulo:"Magíster en Ingeniería de Sistemas",  materia_id:"23758", correo:"lbeltran@espe.edu.ec"  },
        { id:"D002", nombre:"Ing. Valeria Suárez",         titulo:"Magíster en Ingeniería de Software",  materia_id:"54125", correo:"vsuarez@espe.edu.ec"   },
        { id:"D003", nombre:"Ing. Marco Andrade",          titulo:"Magíster en Matemáticas Aplicadas",   materia_id:"26485", correo:"mandrade@espe.edu.ec"   },
        { id:"D004", nombre:"Ing. Gabriel Gustavo Narváez",titulo:"Magíster en Telecomunicaciones",      materia_id:"25485", correo:"ggnarvaez@espe.edu.ec"  }
    ],
    [UniStorage.CLAVES.MATERIAS]: [
        { codigo:"23758", nombre:"Estructura de Datos",    creditos:4, semestre:6, docente_id:"D001", periodo_id:"2026-1", descripcion:"Estudio de estructuras lineales y no lineales.", imagen:"img/materias/estructuras.png", horario:{ dia:"Lunes y Miércoles", hora:"07:00–09:00", aula:"Lab-01" } },
        { codigo:"54125", nombre:"Ingeniería de Software", creditos:3, semestre:6, docente_id:"D002", periodo_id:"2026-1", descripcion:"Metodologías para el desarrollo de software de calidad.", imagen:"img/materias/software.png", horario:{ dia:"Martes y Jueves", hora:"09:00–11:00", aula:"Aula-05" } },
        { codigo:"26485", nombre:"Cálculo Diferencial",    creditos:4, semestre:6, docente_id:"D003", periodo_id:"2026-1", descripcion:"Fundamentos del cálculo diferencial aplicado a ingeniería.", imagen:"img/materias/calculo.png", horario:{ dia:"Lunes, Miércoles y Viernes", hora:"08:00–09:00", aula:"Aula-10" } },
        { codigo:"25485", nombre:"Redes de Computadoras",  creditos:4, semestre:6, docente_id:"D004", periodo_id:"2026-1", descripcion:"Arquitectura, protocolos y administración de redes.", imagen:"img/materias/redes.png", horario:{ dia:"Martes y Jueves", hora:"11:00–13:00", aula:"Lab-02" } },
        { codigo:"31290", nombre:"Base de Datos",          creditos:4, semestre:6, docente_id:"D005", periodo_id:"2026-1", descripcion:"Diseño e implementación de bases de datos.", imagen:"img/materias/basedatos.png", horario:{ dia:"Lunes y Miércoles", hora:"11:00–13:00", aula:"Lab-03" } },
        { codigo:"48213", nombre:"Sistemas Operativos",    creditos:3, semestre:6, docente_id:"D006", periodo_id:"2026-1", descripcion:"Gestión de procesos, memoria y sistemas de archivos.", imagen:"img/materias/so.png", horario:{ dia:"Martes y Jueves", hora:"07:00–08:30", aula:"Aula-08" } },
        { codigo:"39027", nombre:"Programación Web",       creditos:4, semestre:6, docente_id:"D007", periodo_id:"2026-1", descripcion:"Desarrollo de aplicaciones web con HTML, CSS y JavaScript.", imagen:"img/materias/web.png", horario:{ dia:"Lunes, Miércoles y Viernes", hora:"14:00–15:30", aula:"Lab-01" } },
        { codigo:"56710", nombre:"Seguridad Informática",  creditos:3, semestre:6, docente_id:"D008", periodo_id:"2026-1", descripcion:"Ciberseguridad, criptografía y análisis de vulnerabilidades.", imagen:"img/materias/seguridad.png", horario:{ dia:"Miércoles y Viernes", hora:"10:00–11:30", aula:"Aula-12" } }
    ],
    [UniStorage.CLAVES.CALIFICACIONES]: [
        { id:"C001", estudiante_id:"E001", materia_codigo:"23758", periodo_id:"2026-1", parcial1:9.0,  parcial2:9.0, parcial3:9.5, promedio_final:9.11, estado:"Aprobado"  },
        { id:"C002", estudiante_id:"E001", materia_codigo:"54125", periodo_id:"2026-1", parcial1:7.0,  parcial2:8.0, parcial3:7.5, promedio_final:7.50, estado:"Aprobado"  },
        { id:"C003", estudiante_id:"E001", materia_codigo:"26485", periodo_id:"2026-1", parcial1:6.0,  parcial2:7.0, parcial3:6.5, promedio_final:6.50, estado:"Reprobado" },
        { id:"C004", estudiante_id:"E001", materia_codigo:"25485", periodo_id:"2026-1", parcial1:10.0, parcial2:9.0, parcial3:9.5, promedio_final:9.50, estado:"Aprobado"  },
        { id:"C005", estudiante_id:"E002", materia_codigo:"23758", periodo_id:"2026-1", parcial1:8.25, parcial2:8.5, parcial3:8.0, promedio_final:8.25, estado:"Aprobado"  },
        { id:"C006", estudiante_id:"E003", materia_codigo:"23758", periodo_id:"2026-1", parcial1:7.83, parcial2:7.5, parcial3:8.0, promedio_final:7.78, estado:"Aprobado"  },
        { id:"C007", estudiante_id:"E004", materia_codigo:"23758", periodo_id:"2026-1", parcial1:4.83, parcial2:5.0, parcial3:4.5, promedio_final:4.78, estado:"Reprobado" },
        { id:"C008", estudiante_id:"E005", materia_codigo:"23758", periodo_id:"2026-1", parcial1:8.0,  parcial2:7.5, parcial3:8.5, promedio_final:8.00, estado:"Aprobado"  }
    ],
    [UniStorage.CLAVES.SERVICIOS]: [
        { id:"SRV001", nombre:"Consulta de Calificaciones",     descripcion:"Accede a tus notas parciales y finales en tiempo real desde cualquier dispositivo.",          disponible:true },
        { id:"SRV002", nombre:"Descarga de Boletín de Notas",   descripcion:"Genera y descarga tu boletín de notas oficial en formato PDF con un solo clic.",                disponible:true },
        { id:"SRV003", nombre:"Promedio Ponderado",             descripcion:"Visualiza el promedio ponderado por materia y semestre de manera detallada.",                    disponible:true },
        { id:"SRV004", nombre:"Calendario Académico",           descripcion:"Accede al calendario con fechas de parciales, exámenes y períodos de recalificación.",           disponible:true },
        { id:"SRV005", nombre:"Estado Académico",               descripcion:"Revisa el estado de aprobación o reprobación por cada materia matriculada.",                     disponible:true },
        { id:"SRV006", nombre:"Notificaciones Institucionales", descripcion:"Recibe avisos y comunicados importantes de la institución directamente en el sistema.",          disponible:true }
    ],
    [UniStorage.CLAVES.PERIODOS]: [
        { id:"2026-1", nombre:"Primer Semestre 2026",  activo:true,  inicio:"2026-04-14", fin:"2026-08-20" },
        { id:"2025-2", nombre:"Segundo Semestre 2025", activo:false, inicio:"2025-10-01", fin:"2026-02-28" },
        { id:"2025-1", nombre:"Primer Semestre 2025",  activo:false, inicio:"2025-04-14", fin:"2025-08-20" }
    ]
};

/* ------------------------------------------------------------------ */
/*  Helpers internos                                                    */
/* ------------------------------------------------------------------ */

/**
 * Descarga un JSON local con Fetch.
 * Devuelve null (sin lanzar excepción) si la petición falla.
 */
async function _fetchJSON(ruta) {
    try {
        const res = await fetch(ruta);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        console.warn(`[API] fetch("${ruta}") falló → usando semilla. ${e.message}`);
        return null;
    }
}

/**
 * Descarga todos los JSON y los persiste en LocalStorage.
 * Si un fetch falla, usa el semilla correspondiente.
 */
async function _cargarTodosLosJSON() {
    const claves = Object.keys(RUTAS_JSON);
    const resultados = await Promise.all(claves.map((k) => _fetchJSON(RUTAS_JSON[k])));

    claves.forEach((clave, i) => {
        const datos = resultados[i] ?? DATOS_SEMILLA[clave];
        UniStorage.guardarColeccion(clave, datos);
    });
}

/* ------------------------------------------------------------------ */
/*  API pública                                                         */
/* ------------------------------------------------------------------ */

/**
 * Inicializa el sistema la PRIMERA vez:
 * descarga todos los JSON y los guarda en LocalStorage.
 * En visitas posteriores no toca la red (bandera "inicializado").
 */
async function inicializarDatos() {
    const yaListo  = localStorage.getItem(UniStorage.CLAVES.INICIALIZADO);
    const version  = localStorage.getItem("uninotas_version");
    const VERSION_ACTUAL = "3.0"; // incrementar cuando cambien los JSON

    /* Si no está inicializado O la versión cambió → recargar todo */
    if (!yaListo || version !== VERSION_ACTUAL) {
        await _cargarTodosLosJSON();
        localStorage.setItem(UniStorage.CLAVES.INICIALIZADO, "true");
        localStorage.setItem("uninotas_version", VERSION_ACTUAL);
    }
}

/**
 * Restaura los datos originales: sobrescribe LocalStorage con los datos
 * descargados (o semilla). No cierra la sesión activa.
 */
async function restaurarDatosOriginales() {
    await _cargarTodosLosJSON();
    localStorage.setItem(UniStorage.CLAVES.INICIALIZADO, "true");
}

/**
 * API externa 1 — countries.dev
 * Devuelve un array de países { nombre, codigo, bandera } ordenado
 * alfabéticamente. Alimenta el selector personalizado de nacionalidad
 * en registro.html (búsqueda en vivo + bandera).
 */
async function obtenerPaises() {
    try {
        const res = await fetch("https://countries.dev/countries?fields=name,alpha2Code,flag");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const datos = await res.json();
        return datos
            .map((p) => ({
                nombre: p?.name,
                codigo: p?.alpha2Code,
                bandera: p?.flag ?? "🏳️"
            }))
            .filter((p) => Boolean(p.nombre))
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
    } catch (e) {
        console.warn("[API] obtenerPaises falló → respaldo mínimo.", e.message);
        return [
            { nombre: "Ecuador",   codigo: "EC", bandera: "🇪🇨" },
            { nombre: "Colombia",  codigo: "CO", bandera: "🇨🇴" },
            { nombre: "Perú",      codigo: "PE", bandera: "🇵🇪" },
            { nombre: "México",    codigo: "MX", bandera: "🇲🇽" },
            { nombre: "España",    codigo: "ES", bandera: "🇪🇸" },
            { nombre: "Argentina", codigo: "AR", bandera: "🇦🇷" },
            { nombre: "Chile",     codigo: "CL", bandera: "🇨🇱" },
            { nombre: "Venezuela", codigo: "VE", bandera: "🇻🇪" },
            { nombre: "Bolivia",   codigo: "BO", bandera: "🇧🇴" },
            { nombre: "Paraguay",  codigo: "PY", bandera: "🇵🇾" }
        ];
    }
}

/**
 * API externa 2 — Quotable API
 * Devuelve un objeto { texto, autor } con una frase motivacional.
 * Mostrada en el dashboard del estudiante.
 */
async function obtenerFraseMotivacional() {
    try {
        const res = await fetch("https://api.quotable.io/random?tags=success|motivational");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const datos = await res.json();
        return { texto: datos.content, autor: datos.author };
    } catch (e) {
        console.warn("[API] obtenerFraseMotivacional falló → respaldo local.", e.message);
        return {
            texto: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
            autor: "Anónimo"
        };
    }
}

/* ---------- Exponer módulo globalmente ---------- */
window.UniAPI = {
    inicializarDatos,
    restaurarDatosOriginales,
    obtenerPaises,
    obtenerFraseMotivacional
};
    