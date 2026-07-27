/* ============================================================
   js/main.js — Bootstrap común de la aplicación
   UniNotas · Unidad 3

   Se incluye en TODAS las páginas protegidas (excepto index
   y registro). Centraliza:
   - Inicialización de datos en LocalStorage (primera visita)
   - Protección de ruta (redirige a login si no hay sesión)
   - Manejo del botón "Cerrar Sesión" con confirmación
   - Restauración de datos (botón opcional)
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

    /* ── 1. Inicializar datos si es primera visita ── */
    await UniAPI.inicializarDatos();

    /* ── 2. Protección de ruta — redirige si no hay sesión ── */
    const sesion = UniStorage.obtenerSesion();
    if (!sesion) {
        window.location.href = "index.html";
        return;
    }

    /* ── 3. Cerrar sesión — intercepta TODOS los enlaces con id btn-cerrar-sesion ── */
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

    /* ── 4. Restaurar datos originales (botón opcional en cualquier página) ── */
    const btnRestaurar = document.getElementById("btn-restaurar-datos");
    if (btnRestaurar) {
        btnRestaurar.addEventListener("click", async () => {
            const ok = await UniUI.confirmar(
                "¿Restaurar datos originales?",
                "Se perderán todos los cambios realizados (calificaciones, usuarios nuevos, etc.).",
                "Sí, restaurar"
            );
            if (ok) {
                UniUI.mostrarSpinner(true);
                await UniAPI.restaurarDatosOriginales();
                UniUI.mostrarSpinner(false);
                UniUI.toastExito("Datos restaurados correctamente.");
                setTimeout(() => window.location.reload(), 1500);
            }
        });
    }
});
