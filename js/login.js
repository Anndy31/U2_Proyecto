/* ============================================================
   js/login.js — Autenticación de usuarios
   UniNotas · Unidad 3

   Responsabilidades:
   - Inicializar datos en LocalStorage (primera visita)
   - Interceptar el submit del formulario de login
   - Validar credenciales con UniValidaciones
   - Guardar sesión con UniStorage
   - Redirigir según rol (estudiante → principal.html,
                          docente   → docente.html)
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

    /* Si ya hay sesión activa, redirigir directo al dashboard */
    const sesionActiva = UniStorage.obtenerSesion();
    if (sesionActiva) {
        window.location.href = sesionActiva.rol === "docente"
            ? "docente.html"
            : "principal.html";
        return;
    }

    /* Inicializar datos la primera vez (carga JSON → LocalStorage) */
    UniUI.mostrarSpinner(true);
    await UniAPI.inicializarDatos();
    UniUI.mostrarSpinner(false);

    /* Referencias al formulario */
    const form         = document.getElementById("form-login");
    const campoCorreo  = document.getElementById("correo");
    const campoPwd     = document.getElementById("contrasena");

    if (!form) return;

    /* Limpiar cualquier estado de validación residual al cargar */
    UniValidaciones.limpiarValidaciones(form);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        UniValidaciones.limpiarValidaciones(form);

        const correo   = campoCorreo.value.trim();
        const password = campoPwd.value;

        const { valido, usuario } = UniValidaciones.validarLogin(
            correo, password, campoCorreo, campoPwd
        );

        if (!valido) {
            UniUI.toastError("Credenciales incorrectas. Verifica tu correo y contraseña.");
            return;
        }

        /* Guardar sesión */
        UniStorage.guardarSesion(usuario);
        UniUI.toastExito(`¡Bienvenido, ${usuario.nombreCompleto}!`);

        /* Redirigir según rol con pequeño delay para que se vea el toast */
        setTimeout(() => {
            window.location.href = usuario.rol === "docente"
                ? "docente.html"
                : "principal.html";
        }, 1000);
    });
});
