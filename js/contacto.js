/* ============================================================
   js/contacto.js — Formulario de Contacto con guardado en LocalStorage
   UniNotas · Unidad 3

   Tecnologías usadas:
   ✔ Bootstrap 5      → clases is-valid / is-invalid, spinner, tabla
   ✔ JavaScript ES6+  → async/await, arrow functions, destructuring,
                         template literals, const/let
   ✔ LocalStorage     → UniStorage.leerColeccion / guardarColeccion
   ✔ SweetAlert2      → alertaExito / alertaError / confirmar
   ✔ Toastify         → toastExito / toastError
   ✔ REST Countries   → selector de país con bandera (igual que registro.js)
   ✔ Manipulación DOM → renderización dinámica de tabla de mensajes
   ============================================================ */

const CLAVE_CONTACTOS = "uninotas_contactos";

document.addEventListener("DOMContentLoaded", async () => {

    /* ── 1. Inicializar datos base ── */
    await UniAPI.inicializarDatos();

    /* ================================================================
       BLOQUE A — Selector de país con REST Countries API
       (mismo patrón que registro.js)
    ================================================================ */
    const inputBuscarPais = document.getElementById("pais_buscar");
    const inputPaisValor  = document.getElementById("pais");
    const listaPaises     = document.getElementById("pais_lista");
    let paisesDisponibles = [];

    if (inputBuscarPais && inputPaisValor && listaPaises) {
        UniUI.mostrarSpinner(true);
        paisesDisponibles = await UniAPI.obtenerPaises();   // REST Countries API
        UniUI.mostrarSpinner(false);
        inputBuscarPais.placeholder = "Escribe para buscar tu país...";

        /* Renderiza la lista filtrada */
        function renderizarListaPaises(filtro = "") {
            const texto     = filtro.trim().toLowerCase();
            const filtrados = texto
                ? paisesDisponibles.filter((p) => p.nombre.toLowerCase().includes(texto))
                : paisesDisponibles;

            listaPaises.innerHTML = "";

            if (filtrados.length === 0) {
                listaPaises.innerHTML = `<li class="list-group-item text-muted">Sin coincidencias</li>`;
            } else {
                filtrados.forEach((pais) => {
                    const li = document.createElement("li");                 // DOM
                    li.className = "list-group-item list-group-item-action";
                    li.dataset.nombre = pais.nombre;
                    li.innerHTML = `
                        <span class="me-2">${pais.bandera}</span>
                        <span>${UniUtils.escaparHTML(pais.nombre)}</span>`;
                    listaPaises.appendChild(li);
                });
            }
            listaPaises.classList.add("mostrar");
        }

        /* Preseleccionar Ecuador */
        const ecuador = paisesDisponibles.find((p) => p.nombre === "Ecuador") ?? paisesDisponibles[0];
        if (ecuador) {
            inputBuscarPais.value = `${ecuador.bandera} ${ecuador.nombre}`;
            inputPaisValor.value  = ecuador.nombre;
        }

        inputBuscarPais.addEventListener("focus", () =>
            renderizarListaPaises(inputBuscarPais.value.replace(/^\S+\s/, ""))
        );

        inputBuscarPais.addEventListener("input", () => {
            inputPaisValor.value = "";
            renderizarListaPaises(inputBuscarPais.value);
        });

        /* Delegación de click en la lista */
        listaPaises.addEventListener("click", (e) => {
            const item = e.target.closest("li[data-nombre]");
            if (!item) return;
            const pais = paisesDisponibles.find((p) => p.nombre === item.dataset.nombre);
            if (!pais) return;
            inputBuscarPais.value = `${pais.bandera} ${pais.nombre}`;
            inputPaisValor.value  = pais.nombre;
            listaPaises.classList.remove("mostrar");
        });

        /* Cerrar lista al hacer clic fuera */
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".selector-pais-contacto")) {
                listaPaises.classList.remove("mostrar");
            }
        });
    }

    /* ================================================================
       BLOQUE B — Formulario de contacto
    ================================================================ */
    const form = document.getElementById("form-contacto");
    if (!form) return;

    const campoNombre  = document.getElementById("nombre");
    const campoCorreo  = document.getElementById("correo");
    const campoAsunto  = document.getElementById("asunto");
    const campoMensaje = document.getElementById("mensaje");

    /* ── Renderizar tabla de mensajes guardados ── */
    renderizarTablaContactos();

    /* ── Submit ── */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        /* Limpiar estados Bootstrap anteriores */
        [campoNombre, campoCorreo, campoAsunto, campoMensaje].forEach((c) =>
            c.classList.remove("is-invalid", "is-valid")
        );

        const nombre  = campoNombre.value.trim();
        const correo  = campoCorreo.value.trim();
        const asunto  = campoAsunto.value;
        const mensaje = campoMensaje.value.trim();
        const pais    = inputPaisValor ? inputPaisValor.value : "No especificado";

        /* ── Validación ES6 ── */
        let valido = true;

        const marcar = (campo, condicion) => {
            if (condicion) {
                campo.classList.add("is-valid");
            } else {
                campo.classList.add("is-invalid");
                valido = false;
            }
        };

        marcar(campoNombre,  nombre.length >= 3);
        marcar(campoCorreo,  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo));
        marcar(campoAsunto,  asunto !== "");
        marcar(campoMensaje, mensaje.length >= 10);

        if (!valido) {
            UniUI.toastError("Completa todos los campos correctamente.");  // Toastify
            return;
        }

        /* ── Construir objeto de contacto (ES6 shorthand) ── */
        const nuevoContacto = {
            id:        UniUtils.generarId("CT"),
            nombre:    UniUtils.capitalizarTexto(nombre),
            correo:    correo.toLowerCase(),
            pais,
            asunto,
            mensaje,
            fecha:     new Date().toISOString(),
            fechaLeg:  new Date().toLocaleString("es-EC", {
                day: "2-digit", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit"
            })
        };

        /* ── Guardar en LocalStorage ── */
        UniStorage.agregarElemento(CLAVE_CONTACTOS, nuevoContacto);

        /* ── Feedback ── */
        await UniUI.alertaExito(                                           // SweetAlert2
            "¡Mensaje enviado!",
            `Gracias, ${nuevoContacto.nombre}. Tu informe fue guardado. Te responderemos a ${nuevoContacto.correo}.`
        );
        UniUI.toastExito("Informe registrado en el sistema.");             // Toastify

        /* ── Limpiar formulario ── */
        form.reset();
        [campoNombre, campoCorreo, campoAsunto, campoMensaje].forEach((c) =>
            c.classList.remove("is-valid")
        );
        if (inputBuscarPais && ecuador) {
            inputBuscarPais.value = `${ecuador?.bandera ?? ""} ${ecuador?.nombre ?? ""}`;
            inputPaisValor.value  = ecuador?.nombre ?? "";
        }

        /* ── Actualizar tabla del DOM ── */
        renderizarTablaContactos();
    });

    /* ================================================================
       BLOQUE C — Botón eliminar mensaje (delegación de eventos)
    ================================================================ */
    const tbodyContactos = document.getElementById("tbody-contactos");
    if (tbodyContactos) {
        tbodyContactos.addEventListener("click", async (e) => {
            const btn = e.target.closest(".btn-eliminar-contacto");
            if (!btn) return;

            const id = btn.dataset.id;
            const ok = await UniUI.confirmar(                              // SweetAlert2
                "¿Eliminar mensaje?",
                "Esta acción no se puede deshacer.",
                "Sí, eliminar"
            );
            if (!ok) return;

            UniStorage.eliminarElemento(CLAVE_CONTACTOS, "id", id);
            UniUI.toastInfo("Mensaje eliminado.");                         // Toastify
            renderizarTablaContactos();
        });
    }
});

/* ================================================================
   FUNCIÓN — Renderizar tabla de mensajes guardados (DOM dinámico)
================================================================ */
function renderizarTablaContactos() {
    const tbody = document.getElementById("tbody-contactos");
    const seccion = document.getElementById("seccion-contactos");
    if (!tbody) return;

    const registros = UniStorage.leerColeccion(CLAVE_CONTACTOS);  // LocalStorage

    /* Mostrar u ocultar la sección según si hay registros */
    if (seccion) {
        seccion.style.display = registros.length > 0 ? "block" : "none";
    }

    tbody.innerHTML = "";  // Manipulación DOM — limpiar

    if (registros.length === 0) return;

    /* Etiquetas legibles para los asuntos */
    const etiquetasAsunto = {
        notas:   "Consulta de calificaciones",
        acceso:  "Problemas de acceso",
        reporte: "Solicitud de boletín",
        otro:    "Otro"
    };

    /* Construir filas con ES6 template literals */
    registros.forEach((reg) => {
        const tr = document.createElement("tr");   // Manipulación DOM
        tr.innerHTML = `
            <td class="text-center">
                <small class="text-muted">${UniUtils.escaparHTML(reg.id)}</small>
            </td>
            <td>${UniUtils.escaparHTML(reg.nombre)}</td>
            <td>${UniUtils.escaparHTML(reg.correo)}</td>
            <td>${UniUtils.escaparHTML(reg.pais ?? "—")}</td>
            <td>
                <span class="badge bg-primary">
                    ${UniUtils.escaparHTML(etiquetasAsunto[reg.asunto] ?? reg.asunto)}
                </span>
            </td>
            <td class="text-truncate" style="max-width:180px;" title="${UniUtils.escaparHTML(reg.mensaje)}">
                ${UniUtils.escaparHTML(reg.mensaje)}
            </td>
            <td><small>${UniUtils.escaparHTML(reg.fechaLeg)}</small></td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-danger btn-eliminar-contacto"
                        data-id="${UniUtils.escaparHTML(reg.id)}"
                        title="Eliminar mensaje">
                    🗑️
                </button>
            </td>`;
        tbody.appendChild(tr);
    });
}
