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

    /* ── Selector personalizado de nacionalidad (búsqueda + bandera) ── */
    const inputBuscarPais = document.getElementById("nacionalidad_buscar");
    const inputPaisValor  = document.getElementById("nacionalidad");
    const listaPaises     = document.getElementById("nacionalidad_lista");
    let paisesDisponibles = [];

    if (inputBuscarPais && inputPaisValor && listaPaises) {
        UniUI.mostrarSpinner(true);
        paisesDisponibles = await UniAPI.obtenerPaises();
        UniUI.mostrarSpinner(false);
        inputBuscarPais.placeholder = "Escribe para buscar tu país...";

        /* Renderiza la lista filtrada según lo que el usuario escribe */
        function renderizarListaPaises(filtro = "") {
            const texto = filtro.trim().toLowerCase();
            const filtrados = texto
                ? paisesDisponibles.filter((p) => p.nombre.toLowerCase().includes(texto))
                : paisesDisponibles;

            listaPaises.innerHTML = "";

            if (filtrados.length === 0) {
                listaPaises.innerHTML = `<li class="list-group-item text-muted">Sin coincidencias</li>`;
            } else {
                filtrados.forEach((pais) => {//el pais 
                    const li = document.createElement("li");
                    li.className = "list-group-item list-group-item-action";
                    li.dataset.nombre = pais.nombre;
                    li.innerHTML = `
                        <span class="bandera-pais">${pais.bandera}</span>
                        <span>${UniUtils.escaparHTML(pais.nombre)}</span>`;
                    listaPaises.appendChild(li);
                });
            }
            listaPaises.classList.add("mostrar");
        }

        /* Preseleccionar Ecuador por defecto */
        const ecuador = paisesDisponibles.find((p) => p.nombre === "Ecuador") ?? paisesDisponibles[0];
        if (ecuador) {
            inputBuscarPais.value = `${ecuador.bandera} ${ecuador.nombre}`;
            inputPaisValor.value  = ecuador.nombre;
        }

        inputBuscarPais.addEventListener("focus", () => renderizarListaPaises(inputBuscarPais.value.replace(/^\S+\s/, "")));

        inputBuscarPais.addEventListener("input", () => {
            inputPaisValor.value = ""; // se invalida hasta que elijan una opción válida de la lista
            renderizarListaPaises(inputBuscarPais.value);
        });

        /* Delegación de eventos: la lista se regenera en cada búsqueda,
           así que el click se escucha en el contenedor <ul>, no en cada <li>. */
        listaPaises.addEventListener("click", (e) => {
            const item = e.target.closest("li[data-nombre]");
            if (!item) return;
            const pais = paisesDisponibles.find((p) => p.nombre === item.dataset.nombre);
            if (!pais) return;
            inputBuscarPais.value = `${pais.bandera} ${pais.nombre}`;
            inputPaisValor.value  = pais.nombre;
            listaPaises.classList.remove("mostrar");
        });

        /* Cerrar la lista al hacer click fuera del selector */
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".selector-pais")) {
                listaPaises.classList.remove("mostrar");
            }
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
        nacionalidad: document.getElementById("nacionalidad"),
        correo: document.getElementById("correo_registro"),
        password: document.getElementById("contrasena_registro"),
        confirmarPassword: document.getElementById("confirmar_contrasena_registro"),
        terminos: document.getElementById("terminos_registro")
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
            nacionalidad: datos.nacionalidad
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
