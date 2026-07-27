/* ============================================================
   js/estudiantes.js — Dashboard del estudiante
   UniNotas · Unidad 3

   Responsabilidades:
   - Verificar sesión activa (protección de ruta)
   - Inyectar nombre y datos del estudiante logueado
   - Renderizar tabla de calificaciones desde LocalStorage
   - Mostrar frase motivacional (API externa)
   - Mostrar resumen académico (aprobadas/reprobadas/promedio)
   - Manejar cerrar sesión
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

    /* ── 1. Protección de ruta ── */
    const sesion = UniUtils.requiereAutenticacion();
    if (!sesion) return; // requiereAutenticacion() ya redirige

    /* ── 2. Obtener datos del estudiante logueado ── */
    const estudiantes = UniStorage.leerColeccion(UniStorage.CLAVES.ESTUDIANTES);
    const periodos    = UniStorage.leerColeccion(UniStorage.CLAVES.PERIODOS);
    const materias    = UniStorage.leerColeccion(UniStorage.CLAVES.MATERIAS);
    const califs      = UniStorage.leerColeccion(UniStorage.CLAVES.CALIFICACIONES);

    const estudiante  = estudiantes.find((e) => e.id === sesion.refId);
    const periodoActivo = periodos.find((p) => p.activo) ?? { id: "2026-1", nombre: "Período 2026-1" };

    /* ── 3. Inyectar nombre en la bienvenida ── */
    const elNombre = document.getElementById("nombre-estudiante");
    if (elNombre && estudiante) {
        elNombre.textContent =
            `${UniUtils.escaparHTML(estudiante.nombres)} ${UniUtils.escaparHTML(estudiante.apellidos)}`;
    }

    const elSemestre = document.getElementById("semestre-estudiante");
    if (elSemestre && estudiante) {
        elSemestre.textContent = `Semestre ${estudiante.semestre}`;
    }

    const elPeriodo = document.getElementById("periodo-titulo");
    if (elPeriodo) {
        elPeriodo.textContent = `Notas del Semestre — ${periodoActivo.nombre}`;
    }

    /* ── 4. Renderizar tabla de calificaciones ── */
    const tbody = document.getElementById("tbody-calificaciones");
    if (tbody && estudiante) {
        const misCalif = califs.filter(
            (c) => c.estudiante_id === estudiante.id && c.periodo_id === periodoActivo.id
        );

        tbody.innerHTML = "";

        if (misCalif.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">
                Sin calificaciones registradas para este período.</td></tr>`;
        } else {
            misCalif.forEach((cal) => {
                const materia = materias.find((m) => m.codigo === cal.materia_codigo);
                const nombre  = materia ? materia.nombre : cal.materia_codigo;
                const estado  = UniUtils.calcularEstado(cal.promedio_final);
                const clsBadge = UniUtils.claseBadgeEstado(estado);
                const clsProm  = estado === "Aprobado" ? "" : "text-danger";

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${UniUtils.escaparHTML(cal.materia_codigo)}</td>
                    <td>${UniUtils.escaparHTML(nombre)}</td>
                    <td class="text-center">${cal.parcial1 ?? "—"}</td>
                    <td class="text-center">${cal.parcial2 ?? "—"}</td>
                    <td class="text-center">${cal.parcial3 ?? "—"}</td>
                    <td class="text-center fw-bold ${clsProm}">${cal.promedio_final}</td>
                    <td class="text-center">
                        <span class="badge ${clsBadge} px-3 py-2">${estado}</span>
                    </td>`;
                tbody.appendChild(tr);
            });
        }

        /* ── 5. Resumen académico ── */
        const aprobadas   = misCalif.filter((c) => UniUtils.calcularEstado(c.promedio_final) === "Aprobado").length;
        const reprobadas  = misCalif.length - aprobadas;
        const promedioGen = misCalif.length > 0
            ? (misCalif.reduce((acc, c) => acc + c.promedio_final, 0) / misCalif.length).toFixed(2)
            : "—";

        const elAprobadas  = document.getElementById("resumen-aprobadas");
        const elReprobadas = document.getElementById("resumen-reprobadas");
        const elPromedio   = document.getElementById("resumen-promedio");

        if (elAprobadas)  elAprobadas.textContent  = aprobadas;
        if (elReprobadas) elReprobadas.textContent = reprobadas;
        if (elPromedio)   elPromedio.textContent   = promedioGen;
    }

    /* ── 6. Frase motivacional ── */
    await UniUI.mostrarFraseMotivacional("frase-texto", "frase-autor");

    /* ── 7. Cerrar sesión ── */
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
