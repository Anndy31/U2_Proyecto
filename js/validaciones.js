/* ============================================================
   js/validaciones.js — Validaciones de formularios
   UniNotas · Unidad 3

   Responsabilidades:
   - Validar formulario de login
   - Validar formulario de registro
   - Validar formulario de calificaciones (docente)
   - Mostrar/limpiar mensajes de error inline en los campos
   - Sanitizar entradas antes de persistir

   Dependencias (orden de carga en HTML):
     js/storage.js → js/utils.js → js/api.js → js/ui.js → js/validaciones.js
   ============================================================ */

/* ------------------------------------------------------------------ */
/*  HELPERS INTERNOS DE FEEDBACK VISUAL                                 */
/* ------------------------------------------------------------------ */

/**
 * Marca un campo como inválido y muestra el mensaje de error.
 * Usa las clases nativas de Bootstrap 5 (is-invalid / invalid-feedback).
 */
function _marcarInvalido(campo, mensaje) {
    campo.classList.add("is-invalid");
    campo.classList.remove("is-valid");

    let feedback = campo.nextElementSibling;
    if (!feedback || !feedback.classList.contains("invalid-feedback")) {
        feedback = document.createElement("div");
        feedback.className = "invalid-feedback";
        campo.insertAdjacentElement("afterend", feedback);
    }
    feedback.textContent = mensaje;
}

/**
 * Marca un campo como válido y elimina el mensaje de error.
 */
function _marcarValido(campo) {
    campo.classList.remove("is-invalid");
    campo.classList.add("is-valid");
    const feedback = campo.nextElementSibling;
    if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.textContent = "";
    }
}

/**
 * Limpia el estado de validación de todos los campos de un formulario.
 */
function limpiarValidaciones(formulario) {
    if (!formulario) return;
    formulario.querySelectorAll(".is-invalid, .is-valid").forEach((el) => {
        el.classList.remove("is-invalid", "is-valid");
    });
    formulario.querySelectorAll(".invalid-feedback").forEach((el) => {
        el.textContent = "";
    });
    const feedbackTerminos = formulario.querySelector("#terminos-feedback");
    if (feedbackTerminos) feedbackTerminos.style.display = "none";
}

/* ------------------------------------------------------------------ */
/*  VALIDACIÓN — LOGIN                                                  */
/* ------------------------------------------------------------------ */

/**
 * Valida el formulario de inicio de sesión.
 * Verifica formato de correo, longitud de contraseña y que el usuario
 * exista en LocalStorage con las credenciales correctas.
 *
 * @param {string} correo
 * @param {string} password
 * @param {HTMLElement} campoCorreo
 * @param {HTMLElement} campoPassword
 * @returns {{ valido: boolean, usuario: object|null }}
 */
function validarLogin(correo, password, campoCorreo, campoPassword) {
    let valido = true;

     /* Validar correo */
    if (!correo.trim()) {
        _marcarInvalido(campoCorreo, "El correo es obligatorio.");
        valido = false;
    } else if (!UniUtils.esCorreoValido(correo)) {
        _marcarInvalido(campoCorreo, "Ingresa un correo institucional válido (@espe.edu.ec).");
        valido = false;
    } else {
        _marcarValido(campoCorreo);
    }

    /* Validar contraseña */
    if (!password) {
        _marcarInvalido(campoPassword, "La contraseña es obligatoria.");
        valido = false;
    } else if (!UniUtils.esPasswordValida(password)) {
        _marcarInvalido(campoPassword, "La contraseña debe tener entre 8 y 16 caracteres.");
        valido = false;
    } else {
        _marcarValido(campoPassword);
    }

    if (!valido) return { valido: false, usuario: null };

    /* Verificar credenciales en LocalStorage */
    const usuarios = UniStorage.leerColeccion(UniStorage.CLAVES.USUARIOS);
    const usuario  = usuarios.find(
        (u) => u.correo.toLowerCase() === correo.toLowerCase().trim()
              && u.password === password
    );

    if (!usuario) {
        _marcarInvalido(campoCorreo,   "Correo o contraseña incorrectos.");
        _marcarInvalido(campoPassword, "Correo o contraseña incorrectos.");
        return { valido: false, usuario: null };
    }

    return { valido: true, usuario };
}

/* ------------------------------------------------------------------ */
/*  VALIDACIÓN — REGISTRO                                               */
/* ------------------------------------------------------------------ */

/**
 * Valida el formulario de registro de nuevo usuario.
 * Verifica todos los campos requeridos y que el correo/cédula
 * no estén ya registrados.
 *
 * @param {object} campos - { nombres, apellidos, cedula, fechaNac,
 *                            genero, semestre, correo, password }
 *                          Cada valor es el HTMLElement del input/select.
 * @returns {{ valido: boolean, datos: object|null }}
 */
function validarRegistro(campos) {
    let valido = true;

    const {
        nombres, apellidos, cedula, fechaNac,
        genero, semestre, correo, password,
        confirmarPassword, terminos
    } = campos;

    /* Nombres */
    if (!nombres.value.trim() || nombres.value.trim().length < 2) {
        _marcarInvalido(nombres, "Ingresa tus nombres (mínimo 2 caracteres).");
        valido = false;
    } else { _marcarValido(nombres); }

    /* Apellidos */
    if (!apellidos.value.trim() || apellidos.value.trim().length < 2) {
        _marcarInvalido(apellidos, "Ingresa tus apellidos (mínimo 2 caracteres).");
        valido = false;
    } else { _marcarValido(apellidos); }

    /* Cédula */
    if (!UniUtils.esCedulaValida(cedula.value)) {
        _marcarInvalido(cedula, "La cédula debe tener exactamente 10 dígitos numéricos.");
        valido = false;
    } else { _marcarValido(cedula); }

    /* Fecha de nacimiento */
    if (!fechaNac.value) {
        _marcarInvalido(fechaNac, "Selecciona tu fecha de nacimiento.");
        valido = false;
    } else {
        const hoy   = new Date();
        const nac   = new Date(fechaNac.value);
        const edad  = hoy.getFullYear() - nac.getFullYear();
        if (edad < 16 || edad > 100) {
            _marcarInvalido(fechaNac, "Ingresa una fecha de nacimiento válida (16–100 años).");
            valido = false;
        } else { _marcarValido(fechaNac); }
    }

    /* Género */
    if (!genero.value) {
        _marcarInvalido(genero, "Selecciona un género.");
        valido = false;
    } else { _marcarValido(genero); }

    /* Semestre */
    if (!semestre.value) {
        _marcarInvalido(semestre, "Selecciona tu semestre.");
        valido = false;
    } else { _marcarValido(semestre); }

    /* Correo */
    if (!UniUtils.esCorreoValido(correo.value)) {
        _marcarInvalido(correo, "Ingresa un correo institucional válido (@espe.edu.ec).");
        valido = false;
    } else { _marcarValido(correo); }

    /* Contraseña */
    if (!UniUtils.esPasswordValida(password.value)) {
        _marcarInvalido(password, "La contraseña debe tener entre 8 y 16 caracteres.");
        valido = false;
    } else { _marcarValido(password); }

    /* Confirmación de contraseña */
    if (!confirmarPassword.value) {
        _marcarInvalido(confirmarPassword, "Confirma tu contraseña.");
        valido = false;
    } else if (confirmarPassword.value !== password.value) {
        _marcarInvalido(confirmarPassword, "Las contraseñas no coinciden.");
        valido = false;
    } else { _marcarValido(confirmarPassword); }

    /* Aceptación de términos y condiciones */
    const feedbackTerminos = document.getElementById("terminos-feedback");
    if (!terminos.checked) {
        terminos.classList.add("is-invalid");
        if (feedbackTerminos) feedbackTerminos.style.display = "block";
        valido = false;
    } else {
        terminos.classList.remove("is-invalid");
        if (feedbackTerminos) feedbackTerminos.style.display = "none";
    }

    if (!valido) return { valido: false, datos: null };

    /* Verificar duplicados en LocalStorage */
    const usuarios    = UniStorage.leerColeccion(UniStorage.CLAVES.USUARIOS);
    const estudiantes = UniStorage.leerColeccion(UniStorage.CLAVES.ESTUDIANTES);

    const correoExiste  = usuarios.find((u) => u.correo.toLowerCase() === correo.value.toLowerCase().trim());
    const cedulaExiste  = estudiantes.find((e) => e.cedula === cedula.value.trim());

    if (correoExiste) {
        _marcarInvalido(correo, "Este correo ya está registrado en el sistema.");
        return { valido: false, datos: null };
    }
    if (cedulaExiste) {
        _marcarInvalido(cedula, "Esta cédula ya está registrada en el sistema.");
        return { valido: false, datos: null };
    }

    /* Retornar datos saneados */
    return {
        valido: true,
        datos: {
            nombres:   UniUtils.capitalizarTexto(nombres.value.trim()),
            apellidos: UniUtils.capitalizarTexto(apellidos.value.trim()),
            cedula:    cedula.value.trim(),
            fechaNac:  fechaNac.value,
            genero:    genero.value,
            semestre:  parseInt(semestre.value, 10),
            correo:    correo.value.toLowerCase().trim(),
            password:  password.value
        }
    };
}

/* ------------------------------------------------------------------ */
/*  VALIDACIÓN — CALIFICACIONES (Panel Docente)                         */
/* ------------------------------------------------------------------ */

/**
 * Valida los campos de nota del formulario del docente.
 * Cada nota debe estar entre 0.0 y 10.0.
 *
 * @param {HTMLElement} campoParcial1
 * @param {HTMLElement} campoParcial2
 * @param {HTMLElement} campoParcial3
 * @param {HTMLElement} campoEstudiante - select de estudiante
 * @returns {{ valido: boolean }}
 */
function validarCalificacion(campoParcial1, campoParcial2, campoParcial3, campoEstudiante) {
    let valido = true;

    /* Estudiante seleccionado */
    if (!campoEstudiante.value) {
        _marcarInvalido(campoEstudiante, "Selecciona un estudiante.");
        valido = false;
    } else { _marcarValido(campoEstudiante); }

    /* Helper para validar cada nota */
    const validarNota = (campo, etiqueta) => {
        const val = parseFloat(campo.value);
        if (campo.value === "" || isNaN(val)) {
            _marcarInvalido(campo, `${etiqueta} es obligatoria.`);
            valido = false;
        } else if (val < 0 || val > 10) {
            _marcarInvalido(campo, `${etiqueta} debe estar entre 0 y 10.`);
            valido = false;
        } else {
            _marcarValido(campo);
        }
    };

    validarNota(campoParcial1, "Parcial 1");
    validarNota(campoParcial2, "Parcial 2");
    validarNota(campoParcial3, "Parcial 3 / Examen");

    return { valido };
}

/* ------------------------------------------------------------------ */
/*  EXPONER MÓDULO                                                      */
/* ------------------------------------------------------------------ */
window.UniValidaciones = {
    limpiarValidaciones,
    validarLogin,
    validarRegistro,
    validarCalificacion
};
