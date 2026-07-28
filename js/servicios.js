/* ============================================================
   js/servicios.js — Servicios académicos y Búsqueda
   UniNotas · Unidad 3

   Responsabilidades:
   - Renderizar tarjetas de servicios desde LocalStorage
   - Renderizar calendario académico desde datos.json
   - Búsqueda en tiempo real de estudiantes (debounce)
   - Filtros por materia, semestre y estado
   - Ordenamiento de resultados
   - Usa map / filter / find / some / reduce / sort
   ============================================================ */

/* ================================================================
   MÓDULO SERVICIOS (servicios.html)
   ================================================================ */

function iniciarServicios() {
    UniUtils.requiereAutenticacion();

    const contenedor = document.getElementById("grid-servicios");
    if (!contenedor) return;

    const servicios = UniStorage.leerColeccion(UniStorage.CLAVES.SERVICIOS);

    contenedor.innerHTML = "";

    if (servicios.length === 0) {
        contenedor.innerHTML = `<p class="text-muted text-center">No hay servicios disponibles.</p>`;
        return;
    }

    /* map → transforma cada servicio en una tarjeta */
    servicios.map((srv) => _crearTarjetaServicio(srv))
             .forEach((col) => contenedor.appendChild(col));

    /* Calendario académico */
    _renderizarCalendario();

    /* Botón "Restaurar datos" — accesible también desde Servicios */
    UniUI.iniciarBotonRestaurar("btn-restaurar-datos", () => iniciarServicios());
}

function _crearTarjetaServicio(srv) {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    const badgeDisp = srv.disponible
        ? `<span class="badge bg-success ms-2">Disponible</span>`
        : `<span class="badge bg-secondary ms-2">No disponible</span>`;

    col.innerHTML = `
        <div class="card card-servicio h-100">
            <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title fw-bold mb-0" style="color:#1a3c6e;">
                        ${UniUtils.escaparHTML(srv.nombre)}
                    </h5>
                    ${badgeDisp}
                </div>
                <p class="card-text text-muted mt-3">
                    ${UniUtils.escaparHTML(srv.descripcion)}
                </p>
            </div>
        </div>`;
    return col;
}

function _renderizarCalendario() {
    const tbody = document.getElementById("tbody-calendario");
    if (!tbody) return;

    /* Calendario embebido (viene de datos.json — no tiene colección propia en LS) */
    const calendario = [
        { actividad: "Primer Parcial",            inicio: "2026-04-14", fin: "2026-05-26", estado: "Finalizado" },
        { actividad: "Segundo Parcial",           inicio: "2026-05-26", fin: "2026-06-10", estado: "En curso"   },
        { actividad: "Tercer Parcial",            inicio: "2026-06-10", fin: "2026-07-20", estado: "Pendiente"  },
        { actividad: "Exámenes Finales",          inicio: "2026-07-20", fin: "2026-08-11", estado: "Pendiente"  },
        { actividad: "Período de Recalificación", inicio: "2026-08-12", fin: "2026-08-20", estado: "Pendiente"  }
    ];

    const claseEstado = { "Finalizado": "bg-secondary", "En curso": "bg-success", "Pendiente": "bg-warning text-dark" };

    tbody.innerHTML = calendario
        .map((item) => `
            <tr>
                <td>${UniUtils.escaparHTML(item.actividad)}</td>
                <td class="text-center">${UniUtils.formatearFecha(item.inicio)}</td>
                <td class="text-center">${UniUtils.formatearFecha(item.fin)}</td>
                <td class="text-center">
                    <span class="badge ${claseEstado[item.estado] ?? "bg-secondary"} px-2 py-1">
                        ${item.estado}
                    </span>
                </td>
            </tr>`)
        .join("");
}

/* ================================================================
   MÓDULO BÚSQUEDA (buscar.html)
   ================================================================ */

function iniciarBusqueda() {
    UniUtils.requiereAutenticacion();

    const inputNombre  = document.getElementById("buscar-nombre");
    const selMateria   = document.getElementById("buscar-materia");
    const selSemestre  = document.getElementById("buscar-semestre");
    const selEstado    = document.getElementById("buscar-estado");
    const selOrden     = document.getElementById("buscar-orden");
    const tbody        = document.getElementById("tbody-busqueda");
    const elTotal      = document.getElementById("busqueda-total");

    if (!tbody) return;

    /* Llenar select de materias dinámicamente */
    if (selMateria) {
        const materias = UniStorage.leerColeccion(UniStorage.CLAVES.MATERIAS);
        materias.forEach((m) => {
            const opt = document.createElement("option");
            opt.value = m.codigo;
            opt.textContent = `${m.codigo} — ${m.nombre}`;
            selMateria.appendChild(opt);
        });
    }

    /* Llenar select de períodos dinámicamente */
    if (selSemestre) {
        const periodos = UniStorage.leerColeccion(UniStorage.CLAVES.PERIODOS);
        periodos.forEach((p) => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.nombre;
            if (p.activo) opt.selected = true;
            selSemestre.appendChild(opt);
        });
    }

    /* Función principal de búsqueda */
    function ejecutarBusqueda() {
        const califs      = UniStorage.leerColeccion(UniStorage.CLAVES.CALIFICACIONES);
        const estudiantes = UniStorage.leerColeccion(UniStorage.CLAVES.ESTUDIANTES);
        const materias    = UniStorage.leerColeccion(UniStorage.CLAVES.MATERIAS);

        const termino  = (inputNombre?.value ?? "").toLowerCase().trim();
        const matFiltro = selMateria?.value  ?? "";
        const perFiltro = selSemestre?.value ?? "";
        const estFiltro = selEstado?.value   ?? "";
        const orden     = selOrden?.value    ?? "nombre";

        /* filter — aplicar todos los filtros */
        let resultados = califs.filter((cal) => {
            const est = estudiantes.find((e) => e.id === cal.estudiante_id);
            if (!est) return false;

            const nombreCompleto = `${est.nombres} ${est.apellidos}`.toLowerCase();
            const estado = UniUtils.calcularEstado(cal.promedio_final);

            const passNombre   = !termino  || nombreCompleto.includes(termino);
            const passMateria  = !matFiltro || cal.materia_codigo === matFiltro;
            const passPeriodo  = !perFiltro || cal.periodo_id     === perFiltro;
            const passEstado   = !estFiltro || estado             === estFiltro;

            return passNombre && passMateria && passPeriodo && passEstado;
        });

        /* sort — ordenar resultados */
        resultados = resultados.sort((a, b) => {
            const estA = estudiantes.find((e) => e.id === a.estudiante_id);
            const estB = estudiantes.find((e) => e.id === b.estudiante_id);

            if (orden === "nombre") {
                const nA = `${estA?.apellidos} ${estA?.nombres}` ?? "";
                const nB = `${estB?.apellidos} ${estB?.nombres}` ?? "";
                return nA.localeCompare(nB);
            }
            if (orden === "promedio-desc") return b.promedio_final - a.promedio_final;
            if (orden === "promedio-asc")  return a.promedio_final - b.promedio_final;
            return 0;
        });

        /* Actualizar contador */
        if (elTotal) elTotal.textContent = resultados.length;

        /* Renderizar filas */
        tbody.innerHTML = "";

        if (resultados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">
                No se encontraron resultados.</td></tr>`;
            return;
        }

        resultados.forEach((cal) => {
            const est     = estudiantes.find((e) => e.id === cal.estudiante_id);
            const materia = materias.find((m) => m.codigo === cal.materia_codigo);
            const estado  = UniUtils.calcularEstado(cal.promedio_final);
            const clsBadge = UniUtils.claseBadgeEstado(estado);
            const clsProm  = estado === "Aprobado" ? "fw-bold" : "fw-bold text-danger";
            const nombre   = est
                ? `${UniUtils.escaparHTML(est.apellidos)} ${UniUtils.escaparHTML(est.nombres)}`
                : cal.estudiante_id;

            const tr = document.createElement("tr");
            tr.dataset.calId = cal.id;
            tr.innerHTML = `
                <td>${nombre}</td>
                <td>${UniUtils.escaparHTML(materia?.nombre ?? cal.materia_codigo)}</td>
                <td class="text-center">${cal.parcial1 ?? "—"}</td>
                <td class="text-center">${cal.parcial2 ?? "—"}</td>
                <td class="text-center ${clsProm}">${cal.promedio_final}</td>
                <td class="text-center">
                    <span class="badge ${clsBadge} px-3 py-2">${estado}</span>
                </td>`;
            tbody.appendChild(tr);
        });
    }

    /* Búsqueda en tiempo real con debounce en el input de nombre */
    if (inputNombre) {
        inputNombre.addEventListener("input", UniUtils.debounce(ejecutarBusqueda, 300));
    }

    /* Filtros con cambio inmediato */
    [selMateria, selSemestre, selEstado, selOrden].forEach((el) => {
        if (el) el.addEventListener("change", ejecutarBusqueda);
    });

    /* Cargar todos los resultados al iniciar */
    ejecutarBusqueda();

    /* ── Eventos delegados sobre el <tbody> de resultados ──
       (las filas se recrean en cada búsqueda, por eso se delega en el
       contenedor fijo en lugar de enlazar cada <tr> individualmente) ── */

    /* Click → vista de detalle completo del elemento */
    tbody.addEventListener("click", (e) => {
        const fila = e.target.closest("tr[data-cal-id]");
        if (!fila) return;
        const califs = UniStorage.leerColeccion(UniStorage.CLAVES.CALIFICACIONES);
        const estudiantes = UniStorage.leerColeccion(UniStorage.CLAVES.ESTUDIANTES);
        const materias = UniStorage.leerColeccion(UniStorage.CLAVES.MATERIAS);
        const cal = califs.find((c) => c.id === fila.dataset.calId);
        if (!cal) return;
        const est = estudiantes.find((e2) => e2.id === cal.estudiante_id);
        const mat = materias.find((m) => m.codigo === cal.materia_codigo);
        UniUI.mostrarDetalleCalificacion(cal, est, mat);
    });

    /* Mouseover / mouseout → resaltar fila bajo el cursor */
    tbody.addEventListener("mouseover", (e) => {
        const fila = e.target.closest("tr[data-cal-id]");
        if (fila) fila.classList.add("fila-resaltada");
    });
    tbody.addEventListener("mouseout", (e) => {
        const fila = e.target.closest("tr[data-cal-id]");
        if (fila) fila.classList.remove("fila-resaltada");
    });

    /* Botón "Restaurar datos" — accesible también desde Buscar */
    UniUI.iniciarBotonRestaurar("btn-restaurar-datos", () => ejecutarBusqueda());
}

/* ── Exponer módulo ── */
window.UniServicios = { iniciarServicios, iniciarBusqueda };
