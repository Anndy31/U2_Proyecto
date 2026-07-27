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

document.addEventListener("DOMContentLoaded", () => {

    /* ── 1. Protección: solo docentes ── */
    const sesion = UniUtils.requiereAutenticacion();
    if (!sesion) return;

    /* Si un estudiante intenta entrar directamente a docente.html */
    if (sesion.rol !== "docente") {
        window.location.href = "principal.html";
        return;
    }

    /* ── 2. Datos del docente logueado ── */
    const docentes  = UniStorage.leerColeccion(UniStorage.CLAVES.DOCENTES);
    const materias  = UniStorage.leerColeccion(UniStorage.CLAVES.MATERIAS);
    const periodos  = UniStorage.leerColeccion(UniStorage.CLAVES.PERIODOS);
    const estudiantesDB = UniStorage.leerColeccion(UniStorage.CLAVES.ESTUDIANTES);

    const docente       = docentes.find((d) => d.id === sesion.refId);
    const materia       = docente ? materias.find((m) => m.codigo === docente.materia_id) : null;
    const periodoActivo = periodos.find((p) => p.activo) ?? { id: "2026-1", nombre: "2026-1" };

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
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">
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
            tr.innerHTML = `
                <td class="text-center">${idx + 1}</td>
                <td>${nombreEst}</td>
                <td class="text-center">${cal.parcial1 ?? "—"}</td>
                <td class="text-center">${cal.parcial2 ?? "—"}</td>
                <td class="text-center">${cal.parcial3 ?? "—"}</td>
                <td class="text-center ${clsProm}">${promedio}</td>
                <td class="text-center">
                    <span class="badge ${clsBadge} px-3 py-2">${estado}</span>
                </td>`;
            tbody.appendChild(tr);
        });
    }

    cargarTabla();

    /* ── 5. Llenar select de estudiantes en el formulario ── */
    const selectEst = document.getElementById("estudiante_sel");
    if (selectEst && materia) {
        const califs = UniStorage.leerColeccion(UniStorage.CLAVES.CALIFICACIONES);
        /* Mostrar todos los estudiantes (tienen o no calificación en esta materia) */
        estudiantesDB.forEach((est) => {
            const opt = document.createElement("option");
            opt.value = est.id;
            opt.textContent = `${est.apellidos} ${est.nombres}`;
            selectEst.appendChild(opt);
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
