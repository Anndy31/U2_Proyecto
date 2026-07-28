/* ============================================================
   js/reportes.js — Reportes académicos con Chart.js
   UniNotas · Unidad 3

   Responsabilidades:
   - Proteger ruta (requiere autenticación)
   - Llenar selects de materia y período dinámicamente
   - Renderizar tabla de vista previa filtrada
   - Calcular estadísticas con map/filter/reduce/find/some/every
   - Graficar con Chart.js (doughnut + bar)
   - Consumir segunda API externa (Open Trivia / Advice Slip)
     como "dato curioso" académico en el panel de reportes
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

    UniUtils.requiereAutenticacion();

    /* ── Referencias DOM ── */
    const selMateria  = document.getElementById("materia_rep");
    const selPeriodo  = document.getElementById("periodo_rep");
    const formFiltros = document.getElementById("form-reportes");
    const tbody       = document.getElementById("tbody-reporte");
    const tituloVista = document.getElementById("reporte-titulo");
    const infoGen     = document.getElementById("reporte-info");

    /* Estadísticas */
    const elTotal     = document.getElementById("stat-total");
    const elAprobados = document.getElementById("stat-aprobados");
    const elReprobados= document.getElementById("stat-reprobados");
    const elPorcentAp = document.getElementById("stat-porcent-ap");
    const elPorcentRep= document.getElementById("stat-porcent-rep");
    const elPromedio  = document.getElementById("stat-promedio");
    const progAprobados  = document.getElementById("prog-aprobados");
    const progReprobados = document.getElementById("prog-reprobados");

    /* Chart.js instances */
    let chartDoughnut = null;
    let chartBar      = null;

    /* ── 1. Llenar selects dinámicamente ── */
    const materias = UniStorage.leerColeccion(UniStorage.CLAVES.MATERIAS);
    const periodos = UniStorage.leerColeccion(UniStorage.CLAVES.PERIODOS);

    materias.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.codigo;
        opt.textContent = `${m.codigo} — ${m.nombre}`;
        selMateria.appendChild(opt);
    });

    periodos.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.nombre;
        if (p.activo) opt.selected = true;
        selPeriodo.appendChild(opt);
    });

    /* ── 2. Seleccionar primera materia y período activo por defecto ── */
    if (materias.length > 0) selMateria.value = materias[0].codigo;

    /* ── 3. Función principal de generación de reporte ── */
    function generarReporte() {
        const codigoMateria = selMateria.value;
        const periodoId     = selPeriodo.value;

        if (!codigoMateria || !periodoId) {
            UniUI.toastError("Selecciona una materia y un período.");
            return;
        }

        const califs      = UniStorage.leerColeccion(UniStorage.CLAVES.CALIFICACIONES);
        const estudiantes = UniStorage.leerColeccion(UniStorage.CLAVES.ESTUDIANTES);
        const materia     = materias.find((m) => m.codigo === codigoMateria);

        /* filter — calificaciones de esa materia y período */
        const califMateria = califs.filter(
            (c) => c.materia_codigo === codigoMateria && c.periodo_id === periodoId
        );

        /* ── Tabla vista previa ── */
        if (tituloVista) tituloVista.textContent =
            `Vista Previa — ${materia ? materia.nombre : codigoMateria}`;

        const hoy = new Date().toLocaleDateString("es-EC");
        if (infoGen) infoGen.textContent = `Período: ${periodoId} | Generado: ${hoy}`;

        tbody.innerHTML = "";

        if (califMateria.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">
                Sin calificaciones para los filtros seleccionados.</td></tr>`;
            _limpiarEstadisticas();
            return;
        }

        /* map → construir filas */
        califMateria
            .map((cal) => {
                const est    = estudiantes.find((e) => e.id === cal.estudiante_id);
                const nombre = est
                    ? `${UniUtils.escaparHTML(est.apellidos)} ${UniUtils.escaparHTML(est.nombres)}`
                    : cal.estudiante_id;
                const estado    = UniUtils.calcularEstado(cal.promedio_final);
                const clsBadge  = UniUtils.claseBadgeEstado(estado);
                const clsProm   = estado === "Aprobado" ? "fw-bold" : "fw-bold text-danger";
                return { nombre, cal, estado, clsBadge, clsProm };
            })
            .forEach(({ nombre, cal, estado, clsBadge, clsProm }) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${nombre}</td>
                    <td class="text-center">${cal.parcial1 ?? "—"}</td>
                    <td class="text-center">${cal.parcial2 ?? "—"}</td>
                    <td class="text-center ${clsProm}">${cal.promedio_final}</td>
                    <td class="text-center">
                        <span class="badge ${clsBadge} px-3 py-2">${estado}</span>
                    </td>`;
                tbody.appendChild(tr);
            });

        /* ── Estadísticas con reduce / filter / every / some ── */
        const total      = califMateria.length;

        /* filter */
        const aprobados  = califMateria.filter(
            (c) => UniUtils.calcularEstado(c.promedio_final) === "Aprobado"
        ).length;
        const reprobados = total - aprobados;

        /* reduce → suma de promedios */
        const sumaPromedios = califMateria.reduce(
            (acc, c) => acc + c.promedio_final, 0
        );
        const promedioGral = (sumaPromedios / total).toFixed(2);

        /* every → ¿todos aprobaron? */
        const todosAprobaron = califMateria.every(
            (c) => UniUtils.calcularEstado(c.promedio_final) === "Aprobado"
        );

        /* some → ¿alguno tiene nota perfecta (10)? */
        const hayPerfecto = califMateria.some(
            (c) => c.parcial1 === 10 || c.parcial2 === 10 || c.parcial3 === 10
        );

        const pctAp  = total > 0 ? Math.round((aprobados  / total) * 100) : 0;
        const pctRep = total > 0 ? Math.round((reprobados / total) * 100) : 0;

        /* Actualizar DOM estadísticas */
        if (elTotal)      elTotal.textContent      = total;
        if (elAprobados)  elAprobados.textContent  = aprobados;
        if (elReprobados) elReprobados.textContent = reprobados;
        if (elPorcentAp)  elPorcentAp.textContent  = `${pctAp}%`;
        if (elPorcentRep) elPorcentRep.textContent = `${pctRep}%`;
        if (elPromedio)   elPromedio.textContent   = promedioGral;

        if (progAprobados)  progAprobados.style.width  = `${pctAp}%`;
        if (progReprobados) progReprobados.style.width = `${pctRep}%`;

        /* Nota de contexto */
        const notaCtx = document.getElementById("stat-contexto");
        if (notaCtx) {
            notaCtx.textContent = todosAprobaron
                ? "✅ Todos los estudiantes aprobaron esta materia."
                : hayPerfecto
                    ? "⭐ Al menos un estudiante obtuvo nota perfecta (10)."
                    : `📊 Promedio general: ${promedioGral}`;
        }

        /* ── Gráficas Chart.js ── */
        _renderizarGraficaDoughnut(aprobados, reprobados);
        _renderizarGraficaBar(califMateria, estudiantes);
    }

    /* ── Limpiar estadísticas ── */
    function _limpiarEstadisticas() {
        [elTotal, elAprobados, elReprobados, elPorcentAp,
         elPorcentRep, elPromedio].forEach((el) => { if (el) el.textContent = "—"; });
        if (progAprobados)  progAprobados.style.width  = "0%";
        if (progReprobados) progReprobados.style.width = "0%";
    }

    /* ── Gráfica Doughnut — Aprobados vs Reprobados ── */
    function _renderizarGraficaDoughnut(aprobados, reprobados) {
        const canvas = document.getElementById("chart-doughnut");
        if (!canvas || typeof Chart === "undefined") return;

        if (chartDoughnut) chartDoughnut.destroy();

        chartDoughnut = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: ["Aprobados", "Reprobados"],
                datasets: [{
                    data: [aprobados, reprobados],
                    backgroundColor: ["#1e7e34", "#c0392b"],
                    borderWidth: 2,
                    borderColor: "#fff"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                    title: {
                        display: true,
                        text: "Distribución Aprobados / Reprobados",
                        color: "#1a3c6e",
                        font: { size: 14, weight: "bold" }
                    }
                }
            }
        });
    }

    /* ── Gráfica Bar — Promedio por estudiante ── */
    function _renderizarGraficaBar(califMateria, estudiantes) {
        const canvas = document.getElementById("chart-bar");
        if (!canvas || typeof Chart === "undefined") return;

        if (chartBar) chartBar.destroy();

        /* map → etiquetas y datos */
        const etiquetas = califMateria.map((cal) => {
            const est = estudiantes.find((e) => e.id === cal.estudiante_id);
            return est ? est.apellidos : cal.estudiante_id;
        });

        const promedios = califMateria.map((cal) => cal.promedio_final);

        const colores = promedios.map((p) =>
            UniUtils.calcularEstado(p) === "Aprobado" ? "#1e7e34" : "#c0392b"
        );

        chartBar = new Chart(canvas, {
            type: "bar",
            data: {
                labels: etiquetas,
                datasets: [{
                    label: "Promedio Final",
                    data: promedios,
                    backgroundColor: colores,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        min: 0, max: 10,
                        ticks: { stepSize: 1 },
                        grid: { color: "#e9ecef" }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: "Promedio Final por Estudiante",
                        color: "#1a3c6e",
                        font: { size: 14, weight: "bold" }
                    }
                }
            }
        });
    }

    /* ── 4. Segunda API externa — Advice Slip ──
       Muestra un consejo/dato de estudio en el panel lateral.
       API: https://api.adviceslip.com/advice (sin CORS, sin key) */
    async function cargarConsejoEstudio() {
        const elConsejo = document.getElementById("consejo-texto");
        if (!elConsejo) return;
        try {
            const res  = await fetch("https://api.adviceslip.com/advice");
            if (!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();
            elConsejo.textContent = `💡 "${data.slip.advice}"`;
        } catch {
            elConsejo.textContent = '💡 "La constancia es la clave del éxito académico."';
        }
    }

    await cargarConsejoEstudio();

    /* ── 5. Eventos ── */
    if (formFiltros) {
        formFiltros.addEventListener("submit", (e) => {
            e.preventDefault();
            generarReporte();
        });
    }

    /* Generar reporte automáticamente con los valores por defecto */
    generarReporte();

    /* ── Botón "Restaurar datos" — accesible también desde Reportes ── */
    UniUI.iniciarBotonRestaurar("btn-restaurar-datos", () => {
        generarReporte();
    });

    /* ── Cerrar sesión ── */
    const btnCerrar = document.getElementById("btn-cerrar-sesion");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", async (e) => {
            e.preventDefault();
            const ok = await UniUI.confirmar("¿Cerrar sesión?", "", "Sí, salir");
            if (ok) { UniStorage.cerrarSesion(); window.location.href = "index.html"; }
        });
    }
});
