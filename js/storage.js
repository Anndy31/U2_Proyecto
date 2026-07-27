/* ============================================================
   js/storage.js — Capa de acceso a LocalStorage
   UniNotas · Unidad 3
   Toda la aplicación trabaja contra LocalStorage a través
   de este módulo. Nunca acceder a localStorage directamente
   desde otras páginas.
   ============================================================ */

const CLAVES_STORAGE = {
    USUARIOS:        "uninotas_usuarios",
    ESTUDIANTES:     "uninotas_estudiantes",
    DOCENTES:        "uninotas_docentes",
    MATERIAS:        "uninotas_materias",
    CALIFICACIONES:  "uninotas_calificaciones",
    SERVICIOS:       "uninotas_servicios",
    PERIODOS:        "uninotas_periodos",
    SESION:          "uninotas_sesion",
    INICIALIZADO:    "uninotas_inicializado"
};

/* ---------- CRUD genérico ---------- */

/**
 * Lee y parsea una colección desde LocalStorage.
 * Devuelve [] si la clave no existe o el JSON es inválido.
 */
function leerColeccion(clave) {
    try {
        const raw = localStorage.getItem(clave);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error(`[Storage] Error al leer "${clave}":`, e);
        return [];
    }
}

/**
 * Persiste una colección completa en LocalStorage.
 * Devuelve true si tuvo éxito, false si falló (p.ej. cuota llena).
 */
function guardarColeccion(clave, coleccion) {
    try {
        localStorage.setItem(clave, JSON.stringify(coleccion));
        return true;
    } catch (e) {
        console.error(`[Storage] Error al guardar "${clave}":`, e);
        return false;
    }
}

/**
 * Agrega un elemento al final de una colección.
 * Devuelve el elemento agregado.
 */
function agregarElemento(clave, elemento) {
    const col = leerColeccion(clave);
    col.push(elemento);
    guardarColeccion(clave, col);
    return elemento;
}

/**
 * Actualiza el primer elemento cuyo campo [idCampo] === idValor.
 * Devuelve el elemento actualizado o null si no se encontró.
 */
function actualizarElemento(clave, idCampo, idValor, cambios) {
    const col = leerColeccion(clave);
    const idx = col.findIndex((item) => item[idCampo] === idValor);
    if (idx === -1) return null;
    col[idx] = { ...col[idx], ...cambios };
    guardarColeccion(clave, col);
    return col[idx];
}

/**
 * Elimina el primer elemento cuyo campo [idCampo] === idValor.
 * Devuelve true si se eliminó, false si no se encontró.
 */
function eliminarElemento(clave, idCampo, idValor) {
    const col = leerColeccion(clave);
    const nueva = col.filter((item) => item[idCampo] !== idValor);
    const eliminado = nueva.length !== col.length;
    if (eliminado) guardarColeccion(clave, nueva);
    return eliminado;
}

/* ---------- Sesión ---------- */

/** Persiste el usuario autenticado en la sesión activa. */
function guardarSesion(usuario) {
    localStorage.setItem(CLAVES_STORAGE.SESION, JSON.stringify(usuario));
}

/**
 * Devuelve el usuario de la sesión activa, o null si no existe.
 */
function obtenerSesion() {
    try {
        const raw = localStorage.getItem(CLAVES_STORAGE.SESION);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/** Elimina la sesión activa (logout). */
function cerrarSesion() {
    localStorage.removeItem(CLAVES_STORAGE.SESION);
}

/* ---------- Exponer módulo globalmente ---------- */
window.UniStorage = {
    CLAVES: CLAVES_STORAGE,
    leerColeccion,
    guardarColeccion,
    agregarElemento,
    actualizarElemento,
    eliminarElemento,
    guardarSesion,
    obtenerSesion,
    cerrarSesion
};
