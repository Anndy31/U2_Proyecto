/* ============================================================
   js/ui.js — Helpers de interfaz de usuario
   UniNotas · Unidad 3

   Responsabilidades:
   - Crear filas de tabla dinámicamente
   - Crear tarjetas de servicios dinámicamente
   - Mostrar notificaciones con Toastify
   - Mostrar alertas/confirmaciones con SweetAlert2
   - Mostrar/ocultar spinner de carga
   - Renderizar badges de estado académico

   Dependencias (orden de carga en HTML):
     js/storage.js → js/utils.js → js/api.js → js/ui.js
   ============================================================ */

/* ------------------------------------------------------------------ */
/*  SPINNER DE CARGA                                                    */
/* ------------------------------------------------------------------ */

/**
 * Muestra u oculta el spinner de carga global.
 * Si no existe en el DOM lo crea automáticamente.
 */
function mostrarSpinner(visible = true) {
    let spinner = document.getElementById("uninotas-spinner");

    if (!spinner) {
        spinner = document.createElement("div");
        spinner.id = "uninotas-spinner";
        spinner.innerHTML = `
            <div class="spinner-overlay">
                <div class="spinner-border text-light" role="status" style="width:3rem;height:3rem;">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>`;
        spinner.style.cssText = `
            position:fixed;inset:0;background:rgba(26,60,110,0.55);
            display:flex;align-items:center;justify-content:center;
            z-index:9999;`;
        document.body.appendChild(spinner);
    }

    spinner.style.display = visible ? "flex" : "none";
}

/* ------------------------------------------------------------------ */
/*  NOTIFICACIONES — Toastify                                           */
/* ------------------------------------------------------------------ */

/**
 * Muestra un toast de éxito (verde) en la esquina superior derecha.
 */
function toastExito(mensaje) {
    if (typeof Toastify === "undefined") {
        console.warn("[UI] Toastify no disponible:", mensaje);
        return;
    }
    Toastify({
        text: mensaje,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "#1e7e34", borderRadius: "8px", fontWeight: "bold" },
        stopOnFocus: true
    }).showToast();
}

/**
 * Muestra un toast de error (rojo) en la esquina superior derecha.
 */
function toastError(mensaje) {
    if (typeof Toastify === "undefined") {
        console.warn("[UI] Toastify no disponible:", mensaje);
        return;
    }
    Toastify({
        text: mensaje,
        duration: 4000,
        gravity: "top",
        position: "right",
        style: { background: "#c0392b", borderRadius: "8px", fontWeight: "bold" },
        stopOnFocus: true
    }).showToast();
}


/**
 * Muestra un toast informativo (azul institucional).
 */
function toastInfo(mensaje) {
    if (typeof Toastify === "undefined") {
        console.warn("[UI] Toastify no disponible:", mensaje);
        return;
    }
    Toastify({
        text: mensaje,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "#1a3c6e", borderRadius: "8px", fontWeight: "bold" },
        stopOnFocus: true
    }).showToast();
}

/* ------------------------------------------------------------------ */
/*  ALERTAS — SweetAlert2                                              */
/* ------------------------------------------------------------------ */

/**
 * Alerta de éxito con SweetAlert2.
 * Devuelve la Promise de Swal para encadenar acciones.
 */
function alertaExito(titulo, texto = "") {
    if (typeof Swal === "undefined") { alert(`✅ ${titulo}`); return Promise.resolve(); }
    return Swal.fire({
        icon: "success",
        title: titulo,
        text: texto,
        confirmButtonColor: "#1e7e34",
        confirmButtonText: "Aceptar"
    });
}


/**
 * Alerta de error con SweetAlert2.
 */
function alertaError(titulo, texto = "") {
    if (typeof Swal === "undefined") { alert(`❌ ${titulo}`); return Promise.resolve(); }
    return Swal.fire({
        icon: "error",
        title: titulo,
        text: texto,
        confirmButtonColor: "#c0392b",
        confirmButtonText: "Cerrar"
    });
}

/**
 * Diálogo de confirmación con SweetAlert2.
 * Devuelve Promise<boolean> — true si el usuario confirmó.
 */
async function confirmar(titulo, texto = "", textoBoton = "Sí, continuar") {
    if (typeof Swal === "undefined") return window.confirm(`${titulo}\n${texto}`);
    const result = await Swal.fire({
        icon: "warning",
        title: titulo,
        text: texto,
        showCancelButton: true,
        confirmButtonColor: "#c0392b",
        cancelButtonColor: "#6c757d",
        confirmButtonText: textoBoton,
        cancelButtonText: "Cancelar"
    });
    return result.isConfirmed;
}


/* ------------------------------------------------------------------ */
/*  TABLA DE CALIFICACIONES                                             */
/* ------------------------------------------------------------------ */

/**
 * Construye y devuelve un <tr> con las calificaciones de una materia.
 * Compatible con la estructura de thead de principal.html y reportes.html.
 *
 * @param {object} cal   - Registro de calificaciones
 * @param {string} nombreMateria - Nombre legible de la materia
 * @param {string} codigoMateria - Código numérico de la materia
 */
function crearFilaCalificacion(cal, nombreMateria, codigoMateria) {
    const estado = UniUtils.calcularEstado(cal.promedio_final);
    const claseBadge = UniUtils.claseBadgeEstado(estado);
    const clasePromedio = estado === "Aprobado" ? "" : "text-danger";

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${UniUtils.escaparHTML(codigoMateria)}</td>
        <td>${UniUtils.escaparHTML(nombreMateria)}</td>
        <td class="text-center">${cal.parcial1 ?? "—"}</td>
        <td class="text-center">${cal.parcial2 ?? "—"}</td>
        <td class="text-center">${cal.parcial3 ?? "—"}</td>
        <td class="text-center fw-bold ${clasePromedio}">${cal.promedio_final}</td>
        <td class="text-center">
            <span class="badge ${claseBadge} px-3 py-2">${estado}</span>
        </td>`;
    return tr;
}


/**
 * Renderiza todas las calificaciones de un estudiante en un <tbody>.
 *
 * @param {string}   tbodyId     - ID del elemento <tbody> destino
 * @param {string}   estudianteId
 * @param {string}   periodoId
 */
function renderizarTablaCalificaciones(tbodyId, estudianteId, periodoId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const calificaciones = UniStorage.leerColeccion(UniStorage.CLAVES.CALIFICACIONES);
    const materias = UniStorage.leerColeccion(UniStorage.CLAVES.MATERIAS);

    const misCalif = calificaciones.filter(
        (c) => c.estudiante_id === estudianteId && c.periodo_id === periodoId
    );

    tbody.innerHTML = "";

    if (misCalif.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">
            Sin calificaciones registradas para este período.</td></tr>`;
        return;
    }

    misCalif.forEach((cal) => {
        const materia = materias.find((m) => m.codigo === cal.materia_codigo);
        const nombre = materia ? materia.nombre : cal.materia_codigo;
        tbody.appendChild(crearFilaCalificacion(cal, nombre, cal.materia_codigo));
    });
}

/* ------------------------------------------------------------------ */
/*  TARJETAS DE SERVICIOS                                               */
/* ------------------------------------------------------------------ */

/**
 * Crea y devuelve una tarjeta Bootstrap para un servicio.
 * @param {object} servicio - { id, nombre, descripcion, disponible }
 */
function crearTarjetaServicio(servicio) {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    const disponibleBadge = servicio.disponible
        ? `<span class="badge bg-success">Disponible</span>`
        : `<span class="badge bg-secondary">No disponible</span>`;

    col.innerHTML = `
        <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title fw-bold" style="color:#1a3c6e;">
                        ${UniUtils.escaparHTML(servicio.nombre)}
                    </h5>
                    ${disponibleBadge}
                </div>
                <p class="card-text text-muted">${UniUtils.escaparHTML(servicio.descripcion)}</p>
            </div>
        </div>`;
    return col;
}

/**
 * Renderiza todas las tarjetas de servicios en un contenedor.
 * @param {string} contenedorId - ID del <div> destino (row)
 * @param {Array}  [servicios]  - Si se omite, lee de LocalStorage
 */
function renderizarServicios(contenedorId, servicios = null) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    const lista = servicios ?? UniStorage.leerColeccion(UniStorage.CLAVES.SERVICIOS);
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<p class="text-muted text-center">No hay servicios disponibles.</p>`;
        return;
    }

    lista.forEach((srv) => contenedor.appendChild(crearTarjetaServicio(srv)));
}

/* ------------------------------------------------------------------ */
/*  FRASE MOTIVACIONAL                                                  */
/* ------------------------------------------------------------------ */

/**
 * Muestra una frase motivacional en un elemento del DOM.
 * @param {string} textoId  - ID del <p> o <blockquote> para el texto
 * @param {string} autorId  - ID del elemento para el autor
 */
async function mostrarFraseMotivacional(textoId, autorId) {
    const frase = await UniAPI.obtenerFraseMotivacional();
    const elTexto = document.getElementById(textoId);
    const elAutor = document.getElementById(autorId);
    if (elTexto) elTexto.textContent = `"${frase.texto}"`;
    if (elAutor) elAutor.textContent = `— ${frase.autor}`;
}
    
/* ------------------------------------------------------------------ */
/*  NAVBAR — nombre del usuario logueado                               */
/* ------------------------------------------------------------------ */

/**
 * Inyecta el nombre del usuario autenticado en elementos con
 * el atributo data-usuario="nombre".
 */
function inyectarNombreUsuario() {
    const sesion = UniStorage.obtenerSesion();
    if (!sesion) return;

    document.querySelectorAll("[data-usuario='nombre']").forEach((el) => {
        el.textContent = UniUtils.escaparHTML(sesion.nombreCompleto ?? sesion.correo);
    });
}

/* ------------------------------------------------------------------ */
/*  EXPONER MÓDULO                                                      */
/* ------------------------------------------------------------------ */
window.UniUI = {
    mostrarSpinner,
    toastExito,
    toastError,
    toastInfo,
    alertaExito,
    alertaError,
    confirmar,
    crearFilaCalificacion,
    renderizarTablaCalificaciones,
    crearTarjetaServicio,
    renderizarServicios,
    mostrarFraseMotivacional,
    inyectarNombreUsuario
};
