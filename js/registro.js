/* ============================================================
   js/registro.js — Registro de nuevos usuarios
   UniNotas · Unidad 3

   Responsabilidades:
   - Cargar lista de países desde API REST Countries
   - Llenar el <select id="nacionalidad"> dinámicamente
   - Interceptar el submit del formulario de registro
   - Validar con UniValidaciones
   - Crear registros en LocalStorage (usuarios + estudiantes)
   - Redirigir a index.html tras registro exitoso
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

    /* Inicializar datos si es necesario */
    await UniAPI.inicializarDatos();

    /* ── Cargar países en el select ── */
    const selectNacionalidad = document.getElementById("nacionalidad");
    if (selectNacionalidad) {
        UniUI.mostrarSpinner(true);
        const paises = await UniAPI.obtenerPaises();
        UniUI.mostrarSpinner(false);

        paises.forEach((pais) => {
            const opt = document.createElement("option");
            opt.value = pais;
            opt.textContent = pais;
            if (pais === "Ecuador") opt.selected = true;
            selectNacionalidad.appendChild(opt);
        });
    }

    /* ── Referencias al formulario ── */
    const form = document.getElementById("form-registro");
    if (!form) return;

    const campos = {
        nombres: document.getElementById("nombres"),
        apellidos: document.getElementById("apellidos"),
        cedula: document.getElementById("cedula"),
        fechaNac: document.getElementById("fecha_nacimiento"),
        genero: document.getElementById("genero"),
        semestre: document.getElementById("semestre"),
        correo: document.getElementById("correo_registro"),
        password: document.getElementById("contrasena_registro")
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        UniValidaciones.limpiarValidaciones(form);

        const { valido, datos } = UniValidaciones.validarRegistro(campos);

        if (!valido) {
            UniUI.toastError("Revisa los campos marcados en rojo.");
            return;
        }

        /* Crear nuevo estudiante */
        const nuevoEstId = UniUtils.generarId("E");
        const nuevoEst = {
            id: nuevoEstId,
            cedula: datos.cedula,
            nombres: datos.nombres,
            apellidos: datos.apellidos,
            correo: datos.correo,
            semestre: datos.semestre,
            periodo_ingreso: "2026-1",
            estado_academico: "Activo",
            nacionalidad: selectNacionalidad ? selectNacionalidad.value : "Ecuador"
        };

        /* Crear nuevo usuario */
        const nuevoUsuId = UniUtils.generarId("U");
        const nuevoUsu = {
            id: nuevoUsuId,
            correo: datos.correo,
            password: datos.password,
            rol: "estudiante",
            refId: nuevoEstId,
            nombreCompleto: `${datos.nombres} ${datos.apellidos}`
        };

        /* Persistir en LocalStorage */
        UniStorage.agregarElemento(UniStorage.CLAVES.ESTUDIANTES, nuevoEst);
        UniStorage.agregarElemento(UniStorage.CLAVES.USUARIOS, nuevoUsu);

        /* Confirmar y redirigir */
        await UniUI.alertaExito(
            "¡Registro exitoso!",
            `Bienvenido, ${nuevoUsu.nombreCompleto}. Ya puedes iniciar sesión.`
        );

        window.location.href = "index.html";
    });
});
