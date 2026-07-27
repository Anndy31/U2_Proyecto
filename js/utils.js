/* ============================================================
   js/utils.js — Funciones utilitarias reutilizables
   UniNotas · Unidad 3
   ============================================================ */

/**
 * Genera un ID único con prefijo basado en timestamp + número aleatorio.
 * Ejemplo: generarId("C") → "C17326500012345"
 */
function generarId(prefijo = "ID") {
    return `${prefijo}${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

/**
 * Capitaliza la primera letra de cada palabra de un texto.
 * Ejemplo: "anndy ismael" → "Anndy Ismael"
 */
function capitalizarTexto(texto = "") {
    return texto
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
}

/**
 * Convierte una fecha ISO "yyyy-mm-dd" a texto legible en español.
 * Ejemplo: "2026-04-14" → "14 Abril 2026"
 */
function formatearFecha(fechaIso) {
    if (!fechaIso) return "—";
    const [anio, mes, dia] = fechaIso.split("-");
    const meses = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];
    return `${parseInt(dia, 10)} ${meses[parseInt(mes, 10) - 1]} ${anio}`;
}

/**
 * Calcula el promedio de hasta 3 parciales (redondeado a 2 decimales).
 * Ignora valores que no sean número válido.
 */
function calcularPromedio(parcial1, parcial2, parcial3) {
    const notas = [parcial1, parcial2, parcial3]
        .map(Number)
        .filter((n) => !isNaN(n));
    if (notas.length === 0) return 0;
    const suma = notas.reduce((acc, n) => acc + n, 0);
    return Math.round((suma / notas.length) * 100) / 100;
}

/**
 * Determina "Aprobado" o "Reprobado" según la nota mínima de 7.0.
 */
function calcularEstado(promedio) {
    return Number(promedio) >= 7 ? "Aprobado" : "Reprobado";
}

/**
 * Devuelve una versión debounced de la función recibida.
 * Útil para búsqueda en tiempo real (espera ms sin eventos antes de ejecutar).
 */
function debounce(fn, espera = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), espera);
    };
}

/** Valida formato básico de correo electrónico. */
function esCorreoValido(correo = "") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

/** Valida que la cédula tenga exactamente 10 dígitos numéricos. */
function esCedulaValida(cedula = "") {
    return /^\d{10}$/.test(cedula.trim());
}

/** Valida contraseña: entre 8 y 16 caracteres. */
function esPasswordValida(pw = "") {
    return pw.length >= 8 && pw.length <= 16;
}

/** Obtiene el valor de un parámetro de la URL actual (?clave=valor). */
function obtenerParametroURL(nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
}

/**
 * Escapa caracteres HTML especiales para inserción segura en el DOM.
 * Evita XSS cuando los datos vienen de formularios o LocalStorage.
 */
function escaparHTML(texto = "") {
    const div = document.createElement("div");
    div.textContent = String(texto ?? "");
    return div.innerHTML;
}

/**
 * Devuelve la clase CSS del badge según el estado académico.
 * "Aprobado" → "badge-aprobado" | cualquier otro → "badge-reprobado"
 */
function claseBadgeEstado(estado) {
    return estado === "Aprobado" ? "badge-aprobado" : "badge-reprobado";
}

/**
 * Redirige al login si no hay sesión activa.
 * Llamar al inicio de cada página protegida.
 */
function requiereAutenticacion() {
    const sesion = UniStorage.obtenerSesion();
    if (!sesion) {
        window.location.href = "index.html";
    }
    return sesion;
}

/**
 * Redirige si el rol del usuario no coincide con el requerido.
 * Ejemplo: requiereRol("docente") en docente.html
 */
function requiereRol(rolRequerido) {
    const sesion = requiereAutenticacion();
    if (sesion && sesion.rol !== rolRequerido) {
        window.location.href = "principal.html";
    }
    return sesion;
}

/* ---------- Exponer módulo globalmente ---------- */
window.UniUtils = {
    generarId,
    capitalizarTexto,
    formatearFecha,
    calcularPromedio,
    calcularEstado,
    debounce,
    esCorreoValido,
    esCedulaValida,
    esPasswordValida,
    obtenerParametroURL,
    escaparHTML,
    claseBadgeEstado,
    requiereAutenticacion,
    requiereRol
};
