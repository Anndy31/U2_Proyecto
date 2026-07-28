/* ============================================================
   js/docentes.js — Panel del Docente
   UniNotas · Unidad 3

   Responsabilidades:
   - Verificar sesión activa y que el rol sea "docente"
   - Inyectar nombre del docente, materia y período en el header
   - Llenar el <select> de estudiantes dinámicamente
   - Renderizar tabla de estudiantes con sus calificaciones
   - Guardar / actualizar calificaciones en LocalStorage
   - Recalcular promedio y estado automáticamente
   - Manejar cerrar sesión con confirmación
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

    /* ── 0. Inicializar datos si es primera visita ── */
    await UniAPI.inicializarDatos();

    /* ── 1. Protección: solo docentes ── */
    const sesion = UniUtils.requiereAutenticacion();
    if (!sesion) return;

    /* Si un estudiante intenta entrar directamente a docente.html */
    if (sesion.rol !== "docente") {
        window.location.href = "principal.html";
        return;
    }

    /* ── 2. Ocultar "Inicio" del navbar ya que es el dashboard del estudiante ── */
    const navInicio = document.getElementById("nav-inicio");
    if (navInicio) navInicio.style.display = "none";

    /* ── Datos del docente logueado ── */
    const docentes  = UniStorage.leerColeccion(UniStorage.CLAVES.DOCENTES);
    const materias  = UniStorage.leerColeccion(UniStorage.CLAVES.MATERIAS);
    const periodos  = UniStorage.leerColeccion(UniStorage.CLAVES.PERIODOS);
    const estudiantesDB = UniStorage.leerColeccion(UniStorage.CLAVES.ESTUDIANTES);

    const docente       = docentes.find((d) => d.id === sesion.refId);
    const materia       = docente ? materias.find((m) => m.codigo === docente.materia_id) : null;
    const periodoActivo = periodos.find((p) => p.activo) ?? { id: "2026-1", nombre: "2026-1" };

    /* Si no se encontró la materia mostrar error visible */
    if (!materia) {
        const tbody = document.getElementById("tbody-docente");
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-3">
            ⚠️ No se encontró la materia asignada para este docente (refId: ${sesion.refId}).
            Intenta restaurar los datos originales.</td></tr>`;
        UniUI.toastError("No se pudo cargar la materia del docente. Verifica los datos.");
        return;
    }

    /* ── 3. Inyectar datos en el header del panel ── */
    const elDocente = document.getElementById("docente-nombre");
    const elMateria = document.getElementById("docente-materia");
    const elPeriodo = document.getElementById("docente-periodo");

    if (elDocente) elDocente.textContent = docente ? docente.nombre : sesion.nombreCompleto;
    if (elMateria) elMateria.textContent = materia
        ? `${materia.codigo} ${materia.nombre}`
        : "Sin materia asignada";
    if (elPeriodo) elPeriodo.textContent = periodoActivo.id;

    /* ── 4. Cargar calificaciones y renderizar tabla ── */
    function cargarTabla() {
        const califs = UniStorage.leerColeccion(UniStorage.CLAVES.CALIFICACIONES);
        const tbody  = document.getElementById("tbody-docente");
        if (!tbody || !materia) return;

        /* Estudiantes que tienen calificación en la materia del docente */
        const califMateria = califs.filter(
            (c) => c.materia_codigo === materia.codigo && c.periodo_id === periodoActivo.id
        );

        tbody.innerHTML = "";

        if (califMateria.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-3">
                Sin estudiantes registrados para esta materia.</td></tr>`;
            return;
        }

        califMateria.forEach((cal, idx) => {
            const est = estudiantesDB.find((e) => e.id === cal.estudiante_id);
            const nombreEst = est
                ? `${UniUtils.escaparHTML(est.apellidos)} ${UniUtils.escaparHTML(est.nombres)}`
                : cal.estudiante_id;

            const promedio  = UniUtils.calcularPromedio(cal.parcial1, cal.parcial2, cal.parcial3);
            const estado    = UniUtils.calcularEstado(promedio);
            const clsBadge  = UniUtils.claseBadgeEstado(estado);
            const clsProm   = estado === "Aprobado" ? "fw-bold" : "fw-bold text-danger";

            const tr = document.createElement("tr");
            tr.dataset.calId = cal.id;
            tr.dataset.estudianteId = cal.estudiante_id;
            tr.innerHTML = `
                <td class="text-center">${idx + 1}</td>
                <td>${nombreEst}</td>
                <td class="text-center">${cal.parcial1 ?? "—"}</td>
                <td class="text-center">${cal.parcial2 ?? "—"}</td>
                <td class="text-center">${cal.parcial3 ?? "—"}</td>
                <td class="text-center ${clsProm}">${promedio}</td>
                <td class="text-center">
                    <span class="badge ${clsBadge} px-3 py-2">${estado}</span>
                </td>
                <td class="text-center text-nowrap">
                    <button type="button" class="btn btn-sm btn-outline-primary btn-editar-cal"
                            data-cal-id="${cal.id}" title="Editar calificación">
                        ✏️ Editar
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-cal"
                            data-cal-id="${cal.id}" title="Eliminar calificación">
                        🗑️ Eliminar
                    </button>
                </td>`;
            tbody.appendChild(tr);
        });
    }

    cargarTabla();

    /* ── 4.1 Delegación de eventos — Editar / Eliminar por fila ──
       Se delega en el <tbody>, ya que las filas se crean dinámicamente
       en cada llamada a cargarTabla(). ── */
    const tbodyDocente = document.getElementById("tbody-docente");
    if (tbodyDocente) {
        tbodyDocente.addEventListener("click", async (e) => {
            const btnEditar   = e.target.closest(".btn-editar-cal");
            const btnEliminar = e.target.closest(".btn-eliminar-cal");

            /* ---- Editar: precarga el formulario con los datos actuales ---- */
            if (btnEditar) {
                const calId = btnEditar.dataset.calId;
                const califs = UniStorage.leerColeccion(UniStorage.CLAVES.CALIFICACIONES);
                const cal = califs.find((c) => c.id === calId);
                if (!cal) return;

                const campoEst = document.getElementById("estudiante_sel");
                const campoP1  = document.getElementById("nota_tarea");
                const campoP2  = document.getElementById("nota_proyecto");
                const campoP3  = document.getElementById("nota_examen");

                if (campoEst) campoEst.value = cal.estudiante_id;
                if (campoP1)  campoP1.value  = cal.parcial1 ?? "";
                if (campoP2)  campoP2.value  = cal.parcial2 ?? "";
                if (campoP3)  campoP3.value  = cal.parcial3 ?? "";

                document.getElementById("form-notas")?.scrollIntoView({ behavior: "smooth", block: "center" });
                campoP1?.focus();
                UniUI.toastInfo("Datos cargados en el formulario. Modifica y presiona Guardar.");
                return;
            }

            /* ---- Eliminar: confirmación con SweetAlert2 antes de borrar ---- */
            if (btnEliminar) {
                const calId = btnEliminar.dataset.calId;
                const fila  = btnEliminar.closest("tr");
                const nombreEst = fila?.children?.[1]?.textContent?.trim() ?? "este registro";

                const ok = await UniUI.confirmar(
                    "¿Eliminar calificación?",
                    `Se eliminará permanentemente la calificación de ${nombreEst} en ${materia.nombre}.`,
                    "Sí, eliminar"
                );
                if (!ok) return;

                const eliminado = UniStorage.eliminarElemento(
                    UniStorage.CLAVES.CALIFICACIONES, "id", calId
                );

                if (eliminado) {
                    UniUI.toastExito("Calificación eliminada correctamente.");
                    cargarTabla(); // refrescar tabla tras eliminar
                } else {
                    UniUI.toastError("No se pudo eliminar la calificación.");
                }
            }
        });
    }

    /* ── 5. Llenar select de estudiantes en el formulario ── */
    const selectEst = document.getElementById("estudiante_sel");
    if (selectEst && materia) {
        estudiantesDB.forEach((est) => {
            const opt = document.createElement("option");
            opt.value = est.id;
            opt.textContent = `${est.apellidos} ${est.nombres}`;
            selectEst.appendChild(opt);
        });

        /* Al seleccionar un estudiante, precargar sus notas si ya existen */
        selectEst.addEventListener("change", () => {
            const califs = UniStorage.leerColeccion(UniStorage.CLAVES.CALIFICACIONES);
            const existe = califs.find(
                (c) => c.estudiante_id === selectEst.value
                    && c.materia_codigo === materia.codigo
                    && c.periodo_id    === periodoActivo.id
            );
            const campoP1 = document.getElementById("nota_tarea");
            const campoP2 = document.getElementById("nota_proyecto");
            const campoP3 = document.getElementById("nota_examen");

            if (existe) {
                campoP1.value = existe.parcial1 ?? "";
                campoP2.value = existe.parcial2 ?? "";
                campoP3.value = existe.parcial3 ?? "";
                UniUI.toastInfo("Notas existentes cargadas. Puedes modificarlas.");
            } else {
                campoP1.value = "";
                campoP2.value = "";
                campoP3.value = "";
            }
        });
    }

    /* ── 6. Submit del formulario — guardar/actualizar calificación ── */
    const formNotas = document.getElementById("form-notas");
    if (formNotas) {
        formNotas.addEventListener("submit", (e) => {
            e.preventDefault();
            UniValidaciones.limpiarValidaciones(formNotas);

            const campoEst = document.getElementById("estudiante_sel");
            const campoP1  = document.getElementById("nota_tarea");
            const campoP2  = document.getElementById("nota_proyecto");
            const campoP3  = document.getElementById("nota_examen");

            const { valido } = UniValidaciones.validarCalificacion(
                campoP1, campoP2, campoP3, campoEst
            );
            if (!valido) {
                UniUI.toastError("Revisa los campos marcados.");
                return;
            }

            const estudianteId = campoEst.value;
            const p1 = parseFloat(campoP1.value);
            const p2 = parseFloat(campoP2.value);
            const p3 = parseFloat(campoP3.value);
            const promedio = UniUtils.calcularPromedio(p1, p2, p3);
            const estado   = UniUtils.calcularEstado(promedio);

            /* Buscar si ya existe una calificación para actualizar */
            const califs = UniStorage.leerColeccion(UniStorage.CLAVES.CALIFICACIONES);
            const existe = califs.find(
                (c) => c.estudiante_id === estudianteId
                    && c.materia_codigo === materia.codigo
                    && c.periodo_id    === periodoActivo.id
            );

            if (existe) {
                /* Actualizar */
                UniStorage.actualizarElemento(
                    UniStorage.CLAVES.CALIFICACIONES,
                    "id", existe.id,
                    { parcial1: p1, parcial2: p2, parcial3: p3,
                      promedio_final: promedio, estado }
                );
                UniUI.toastExito("Calificación actualizada correctamente.");
            } else {
                /* Crear nueva */
                const nueva = {
                    id:             UniUtils.generarId("C"),
                    estudiante_id:  estudianteId,
                    materia_codigo: materia.codigo,
                    periodo_id:     periodoActivo.id,
                    parcial1: p1, parcial2: p2, parcial3: p3,
                    promedio_final: promedio,
                    estado
                };
                UniStorage.agregarElemento(UniStorage.CLAVES.CALIFICACIONES, nueva);
                UniUI.toastExito("Calificación registrada correctamente.");
            }

            formNotas.reset();
            UniValidaciones.limpiarValidaciones(formNotas);
            cargarTabla(); // refrescar tabla
        });
    }

    /* ── 7. Cerrar sesión con confirmación ── */
    const btnCerrar = document.getElementById("btn-cerrar-sesion");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", async (e) => {
            e.preventDefault();
            const ok = await UniUI.confirmar(
                "¿Cerrar sesión?",
                "Se cerrará tu sesión actual.",
                "Sí, salir"
            );
            if (ok) {
                UniStorage.cerrarSesion();
                window.location.href = "index.html";
            }
        });
    }
});
