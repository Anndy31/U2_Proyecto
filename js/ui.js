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
/*  PANEL DE INDICADORES GLOBAL                                         */
/*  Disponible en cualquier página protegida. Calcula estadísticas      */
/*  sobre TODA la base (todas las materias/estudiantes), no solo el     */
/*  filtro activo, y se puede volver a llamar tras cualquier CRUD.      */
/* ------------------------------------------------------------------ */

/**
 * Calcula los indicadores globales del sistema a partir de LocalStorage.
 * @returns {object} { totalEstudiantes, totalDocentes, totalMaterias,
 *                      totalCalificaciones, aprobados, reprobados,
 *                      pctAprobados, pctReprobados, promedioGlobal }
 */
function calcularIndicadoresGlobales() {
    const estudiantes = UniStorage.leerColeccion(UniStorage.CLAVES.ESTUDIANTES);
    const docentes    = UniStorage.leerColeccion(UniStorage.CLAVES.DOCENTES);
    const materias    = UniStorage.leerColeccion(UniStorage.CLAVES.MATERIAS);
    const califs      = UniStorage.leerColeccion(UniStorage.CLAVES.CALIFICACIONES);

    const total = califs.length;
    const aprobados = califs.filter(
        (c) => UniUtils.calcularEstado(c.promedio_final) === "Aprobado"
    ).length;
    const reprobados = total - aprobados;
    const promedioGlobal = total > 0
        ? (califs.reduce((acc, c) => acc + Number(c.promedio_final || 0), 0) / total).toFixed(2)
        : "—";

    return {
        totalEstudiantes: estudiantes.length,
        totalDocentes: docentes.length,
        totalMaterias: materias.length,
        totalCalificaciones: total,
        aprobados,
        reprobados,
        pctAprobados: total > 0 ? Math.round((aprobados / total) * 100) : 0,
        pctReprobados: total > 0 ? Math.round((reprobados / total) * 100) : 0,
        promedioGlobal
    };
}

/**
 * Renderiza (o vuelve a renderizar) el Panel de Indicadores Global
 * dentro del contenedor indicado. Puede llamarse repetidamente —
 * por ejemplo después de crear/editar/eliminar una calificación —
 * para que los números siempre reflejen el estado actual del CRUD.
 *
 * @param {string} contenedorId - ID del <div> destino
 */
function renderizarPanelIndicadoresGlobal(contenedorId) {
    const cont = document.getElementById(contenedorId);
    if (!cont) return;

    const ind = calcularIndicadoresGlobales();

    cont.innerHTML = `
        <div class="panel-indicadores-global p-3 p-md-4 rounded shadow-sm">
            <h3 class="fw-bold mb-3 d-flex align-items-center gap-2" style="color:#1a3c6e;">
                📊 Panel de Indicadores Global
                <small class="text-muted fw-normal fs-6">(todo el sistema)</small>
            </h3>
            <div class="row g-3 text-center">
                <div class="col-6 col-md-2">
                    <div class="ind-card p-2 rounded" style="background:#e3f2fd;">
                        <div class="fs-4 fw-bold" style="color:#1a3c6e;">${ind.totalEstudiantes}</div>
                        <small class="text-muted">Estudiantes</small>
                    </div>
                </div>
                <div class="col-6 col-md-2">
                    <div class="ind-card p-2 rounded" style="background:#ede7f6;">
                        <div class="fs-4 fw-bold" style="color:#5e35b1;">${ind.totalDocentes}</div>
                        <small class="text-muted">Docentes</small>
                    </div>
                </div>
                <div class="col-6 col-md-2">
                    <div class="ind-card p-2 rounded" style="background:#fff8e1;">
                        <div class="fs-4 fw-bold" style="color:#8d6e00;">${ind.totalMaterias}</div>
                        <small class="text-muted">Materias</small>
                    </div>
                </div>
                <div class="col-6 col-md-2">
                    <div class="ind-card p-2 rounded" style="background:#e8f5e9;">
                        <div class="fs-4 fw-bold" style="color:#1e7e34;">${ind.aprobados}</div>
                        <small class="text-muted">Aprobados (${ind.pctAprobados}%)</small>
                    </div>
                </div>
                <div class="col-6 col-md-2">
                    <div class="ind-card p-2 rounded" style="background:#fdecea;">
                        <div class="fs-4 fw-bold text-danger">${ind.reprobados}</div>
                        <small class="text-muted">Reprobados (${ind.pctReprobados}%)</small>
                    </div>
                </div>
                <div class="col-6 col-md-2">
                    <div class="ind-card p-2 rounded" style="background:#f3e5f5;">
                        <div class="fs-4 fw-bold" style="color:#6a1b9a;">${ind.promedioGlobal}</div>
                        <small class="text-muted">Promedio Global</small>
                    </div>
                </div>
            </div>
        </div>`;
}

/* ------------------------------------------------------------------ */
/*  VISTA DE DETALLE POR ELEMENTO                                       */
/*  Modal (SweetAlert2) reutilizable para mostrar el detalle completo   */
/*  de un elemento (calificación de un estudiante en una materia).      */
/* ------------------------------------------------------------------ */

/**
 * Muestra un modal con el detalle completo de una calificación:
 * datos del estudiante, materia, los 3 parciales, promedio, estado
 * y su historial completo en todas las materias registradas.
 *
 * @param {object} cal        - Registro de calificaciones
 * @param {object} estudiante - Registro del estudiante (puede ser null)
 * @param {object} materia    - Registro de la materia (puede ser null)
 */
function mostrarDetalleCalificacion(cal, estudiante, materia) {
    if (typeof Swal === "undefined") return;

    const califs = UniStorage.leerColeccion(UniStorage.CLAVES.CALIFICACIONES);
    const materias = UniStorage.leerColeccion(UniStorage.CLAVES.MATERIAS);

    const nombreEst = estudiante
        ? `${UniUtils.escaparHTML(estudiante.nombres)} ${UniUtils.escaparHTML(estudiante.apellidos)}`
        : UniUtils.escaparHTML(cal.estudiante_id);

    const estado = UniUtils.calcularEstado(cal.promedio_final);
    const clsBadge = estado === "Aprobado" ? "background:#1e7e34;" : "background:#c0392b;";

    /* Historial del mismo estudiante en todas sus materias */
    const historial = estudiante
        ? califs.filter((c) => c.estudiante_id === estudiante.id)
        : [cal];

    const filasHistorial = historial.map((c) => {
        const m = materias.find((mm) => mm.codigo === c.materia_codigo);
        const est = UniUtils.calcularEstado(c.promedio_final);
        const color = est === "Aprobado" ? "#1e7e34" : "#c0392b";
        const activa = c.id === cal.id ? "font-weight:bold; background:#f0f4ff;" : "";
        return `
            <tr style="${activa}">
                <td style="text-align:left;">${UniUtils.escaparHTML(m ? m.nombre : c.materia_codigo)}</td>
                <td>${c.parcial1 ?? "—"}</td>
                <td>${c.parcial2 ?? "—"}</td>
                <td>${c.parcial3 ?? "—"}</td>
                <td style="color:${color}; font-weight:bold;">${c.promedio_final}</td>
                <td style="color:${color};">${est}</td>
            </tr>`;
    }).join("");

    Swal.fire({
        title: `Detalle de ${nombreEst}`,
        html: `
            <div style="text-align:left; font-size:0.92rem;">
                <p class="mb-1"><strong>Materia consultada:</strong>
                    ${UniUtils.escaparHTML(materia ? materia.nombre : cal.materia_codigo)}</p>
                <p class="mb-1"><strong>Período:</strong> ${UniUtils.escaparHTML(cal.periodo_id)}</p>
                <p class="mb-3">
                    <strong>Estado:</strong>
                    <span class="badge" style="${clsBadge}">${estado}</span>
                </p>
                <p class="mb-1"><strong>Parcial 1:</strong> ${cal.parcial1 ?? "—"} &nbsp;|&nbsp;
                   <strong>Parcial 2:</strong> ${cal.parcial2 ?? "—"} &nbsp;|&nbsp;
                   <strong>Parcial 3:</strong> ${cal.parcial3 ?? "—"}</p>
                <p class="mb-3"><strong>Promedio final:</strong> ${cal.promedio_final}</p>
                <hr>
                <p class="mb-2 fw-bold">Historial completo del estudiante</p>
                <div style="max-height:220px; overflow-y:auto;">
                <table style="width:100%; font-size:0.82rem; text-align:center; border-collapse:collapse;">
                    <thead>
                        <tr style="background:#1a3c6e; color:#fff;">
                            <th style="text-align:left; padding:4px;">Materia</th>
                            <th>P1</th><th>P2</th><th>P3</th><th>Prom.</th><th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>${filasHistorial}</tbody>
                </table>
                </div>
            </div>`,
        icon: undefined,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#1a3c6e",
        width: 560
    });
}

/* ------------------------------------------------------------------ */
/*  BOTÓN "RESTAURAR DATOS" — accesible desde cualquier página          */
/* ------------------------------------------------------------------ */

/**
 * Conecta el botón de restaurar datos originales si existe en el DOM.
 * Reutilizable en TODAS las páginas protegidas (estudiante y docente),
 * para que la función sea accesible a cualquier rol, no solo docentes.
 *
 * @param {string}   idBoton  - ID del botón (por defecto "btn-restaurar-datos")
 * @param {Function} [alRestaurar] - Callback opcional ejecutado tras restaurar
 *                                   (por ejemplo, para refrescar tablas/gráficos
 *                                   sin recargar toda la página).
 */
function iniciarBotonRestaurar(idBoton = "btn-restaurar-datos", alRestaurar = null) {
    const btn = document.getElementById(idBoton);
    if (!btn || btn.dataset.uniBind === "1") return; // evita doble binding
    btn.dataset.uniBind = "1";

    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const ok = await confirmar(
            "¿Restaurar datos originales?",
            "Se perderán todos los cambios realizados por cualquier usuario.",
            "Sí, restaurar"
        );
        if (!ok) return;

        mostrarSpinner(true);
        await UniAPI.restaurarDatosOriginales();
        mostrarSpinner(false);
        toastExito("Datos restaurados correctamente.");

        if (typeof alRestaurar === "function") {
            alRestaurar();
        } else {
            setTimeout(() => window.location.reload(), 1200);
        }
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
    inyectarNombreUsuario,
    calcularIndicadoresGlobales,
    renderizarPanelIndicadoresGlobal,
    mostrarDetalleCalificacion,
    iniciarBotonRestaurar
};
