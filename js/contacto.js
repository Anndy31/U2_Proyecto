/* ============================================================
   js/contacto.js — Formulario de Contacto
   UniNotas · Unidad 3

   Responsabilidades:
   - Interceptar el submit del formulario de contacto
   - Validar campos (nombre, correo, asunto, mensaje)
   - Guardar el informe/mensaje en LocalStorage bajo la clave
     "uninotas_contactos"
   - Mostrar feedback con SweetAlert2 y Toastify
   - Limpiar el formulario tras un envío exitoso
   ============================================================ */

/* Clave de almacenamiento para los mensajes de contacto */
const CLAVE_CONTACTOS = "uninotas_contactos";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector(".form-contacto");
    if (!form) return;

    /* ── Referencias a los campos ── */
    const campoNombre  = document.getElementById("nombre");
    const campoCorreo  = document.getElementById("correo");
    const campoAsunto  = document.getElementById("asunto");
    const campoMensaje = document.getElementById("mensaje");

    /* ── Cambiar method a POST para evitar datos en la URL ── */
    form.method = "post";

    /* ── Submit ── */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        /* Limpiar validaciones anteriores */
        [campoNombre, campoCorreo, campoAsunto, campoMensaje].forEach((c) => {
            c.classList.remove("is-invalid", "is-valid");
        });

        /* Recoger valores */
        const nombre  = campoNombre.value.trim();
        const correo  = campoCorreo.value.trim();
        const asunto  = campoAsunto.value;
        const mensaje = campoMensaje.value.trim();

        /* ── Validaciones ── */
        let valido = true;

        if (nombre.length < 3) {
            campoNombre.classList.add("is-invalid");
            valido = false;
        } else {
            campoNombre.classList.add("is-valid");
        }

        /* Correo: acepta cualquier correo válido (no solo institucional) */
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(correo)) {
            campoCorreo.classList.add("is-invalid");
            valido = false;
        } else {
            campoCorreo.classList.add("is-valid");
        }

        if (!asunto) {
            campoAsunto.classList.add("is-invalid");
            valido = false;
        } else {
            campoAsunto.classList.add("is-valid");
        }

        if (mensaje.length < 10) {
            campoMensaje.classList.add("is-invalid");
            valido = false;
        } else {
            campoMensaje.classList.add("is-valid");
        }

        if (!valido) {
            UniUI.toastError("Por favor, completa todos los campos correctamente.");
            return;
        }

        /* ── Construir registro ── */
        const nuevoContacto = {
            id:        UniUtils.generarId("CT"),
            nombre:    UniUtils.capitalizarTexto(nombre),
            correo:    correo.toLowerCase(),
            asunto:    asunto,
            mensaje:   mensaje,
            fecha:     new Date().toISOString(),          // timestamp ISO completo
            fechaLeg:  new Date().toLocaleString("es-EC") // versión legible
        };

        /* ── Guardar en LocalStorage ── */
        const registros = UniStorage.leerColeccion(CLAVE_CONTACTOS);
        registros.push(nuevoContacto);
        UniStorage.guardarColeccion(CLAVE_CONTACTOS, registros);

        /* ── Feedback al usuario ── */
        await UniUI.alertaExito(
            "¡Mensaje enviado!",
            `Gracias, ${nuevoContacto.nombre}. Tu informe fue registrado correctamente. Te responderemos a ${nuevoContacto.correo}.`
        );

        UniUI.toastExito("Informe guardado exitosamente.");

        /* ── Limpiar formulario ── */
        form.reset();
        [campoNombre, campoCorreo, campoAsunto, campoMensaje].forEach((c) => {
            c.classList.remove("is-valid");
        });
    });
});
