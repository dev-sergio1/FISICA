//DATOS LOCALES

let inventario = JSON.parse(localStorage.getItem('inventario_smartlabs')) || [
    { codigo: 'OSC-01', nombre: 'Osciloscopio Digital', stock: 4, estado: 'Disponible' },
    { codigo: 'MUL-02', nombre: 'Multímetro Digital', stock: 8, estado: 'Disponible' },
    { codigo: 'FUE-03', nombre: 'Fuente de Poder Variable', stock: 3, estado: 'Disponible' }
];

let prestamosActivos = [];
let historialPrestamos = [];

let usuariosRegistrados = JSON.parse(localStorage.getItem('usuarios_smartlabs')) || [
    { nombre: "Admin Fisica", email: "ejemplo@universidad.edu", password: "contraseña123" }
];

function guardarInventario() {
    localStorage.setItem('inventario_smartlabs', JSON.stringify(inventario));
}

function guardarUsuarios() {
    localStorage.setItem('usuarios_smartlabs', JSON.stringify(usuariosRegistrados));
}

// LOGIN Y REGISTRO

const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const usuarioSesionText = document.getElementById('usuario-sesion');

document.getElementById('form-registro').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('reg-nombre').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    if (password.length < 6) {
        mostrarAlertaToast("La contraseña debe tener al menos 6 caracteres.", "bg-danger");
        return;
    }

    const existe = usuariosRegistrados.find(u => u.email === email);
    if (existe) {
        mostrarAlertaToast("Este correo institucional ya está registrado.", "bg-warning");
        return;
    }

    usuariosRegistrados.push({ nombre, email, password });
    guardarUsuarios();
    
    mostrarAlertaToast("¡Cuenta creada con éxito! Ya puedes iniciar sesión.", "bg-success");
    document.getElementById('form-registro').reset();
    
    const tabLogin = new bootstrap.Tab(document.getElementById('tab-login'));
    tabLogin.show();
});

document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const usuarioValido = usuariosRegistrados.find(u => u.email === email && u.password === password);

    if (usuarioValido) {
        sessionStorage.setItem('usuario_actual', JSON.stringify(usuarioValido));
        mostrarAlertaToast(`¡Bienvenido, ${usuarioValido.nombre}!`, "bg-success");
        cargarPanelDeControl(usuarioValido.nombre);
    } else {
        mostrarAlertaToast("Correo o contraseña incorrectos.", "bg-danger");
    }
});

function cargarPanelDeControl(nombreUsuario) {
    loginContainer.classList.add('d-none');
    dashboardContainer.classList.remove('d-none');
    usuarioSesionText.textContent = `Sesión: ${nombreUsuario}`;
    
    renderizarTodo();
}

document.getElementById('btn-logout').addEventListener('click', function() {
    sessionStorage.removeItem('usuario_actual');
    dashboardContainer.classList.add('d-none');
    loginContainer.classList.remove('d-none');
    document.getElementById('form-login').reset();
    mostrarAlertaToast("Sesión cerrada correctamente.", "bg-info");
});

window.addEventListener('DOMContentLoaded', () => {
    const usuarioGuardado = JSON.parse(sessionStorage.getItem('usuario_actual'));
    if (usuarioGuardado) {
        cargarPanelDeControl(usuarioGuardado.nombre);
    }
});


//DASHBOARD

function renderizarTodo() {
    actualizarTablaInventario(inventario);
    actualizarSelectorEquipos();
    actualizarListaDevoluciones();
    actualizarTablaHistorial();
}

function actualizarTablaInventario(datos) {
    const tbody = document.getElementById('tabla-inventario');
    tbody.innerHTML = '';

    datos.forEach(equipo => {
        let badgeColor = 'bg-success';
        if (equipo.stock === 0) {
            badgeColor = 'bg-danger';
            equipo.estado = 'Agotado';
        } else if (equipo.stock <= 2) {
            badgeColor = 'bg-warning text-dark';
            equipo.estado = 'Pocas Unidades';
        } else {
            equipo.estado = 'Disponible';
        }

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">${equipo.codigo}</td>
                <td>${equipo.nombre}</td>
                <td>${equipo.stock} uds</td>
                <td><span class="badge ${badgeColor}">${equipo.estado}</span></td>
                <td class="text-end">
                    <button onclick="prepararEdicion('${equipo.codigo}')" class="btn btn-sm btn-outline-primary py-0 px-2 me-1">Editar</button>
                    <button onclick="eliminarEquipo('${equipo.codigo}')" class="btn btn-sm btn-outline-danger py-0 px-2">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function actualizarSelectorEquipos() {
    const select = document.getElementById('equipoSeleccionado');
    select.innerHTML = '<option value="" disabled selected>Selecciona un equipo...</option>';

    inventario.forEach(equipo => {
        select.innerHTML += `
            <option value="${equipo.codigo}">${equipo.nombre} (${equipo.codigo}) - Stock: ${equipo.stock}</option>
        `;
    });
}

function actualizarListaDevoluciones() {
    const contenedor = document.getElementById('lista-devoluciones');
    contenedor.innerHTML = '';

    if (prestamosActivos.length === 0) {
        contenedor.innerHTML = '<p class="text-muted text-center py-3 my-0">No hay préstamos activos.</p>';
        return;
    }

    prestamosActivos.forEach(prestamo => {
        contenedor.innerHTML += `
            <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-bottom">
                <div>
                    <h6 class="mb-1 fw-bold">${prestamo.alumno}</h6>
                    <small class="text-muted">${prestamo.equipoNombre} (${prestamo.equipoCodigo})</small>
                </div>
                <button onclick="procesarDevolucion(${prestamo.id})" class="btn btn-sm btn-outline-danger btn-devolver">
                    Devolver
                </button>
            </div>
        `;
    });
}

function actualizarTablaHistorial() {
    const tbody = document.getElementById('tabla-historial');
    tbody.innerHTML = '';

    if (historialPrestamos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">Historial vacío.</td></tr>`;
        return;
    }

    historialPrestamos.forEach(reg => {
        tbody.innerHTML += `
            <tr>
                <td>${reg.alumno}</td>
                <td class="text-muted">${reg.codigo}</td>
                <td>${reg.equipo}</td>
                <td class="text-success small">${reg.fechaRetorno}</td>
            </tr>
        `;
    });
}


//GESTIÓN DE INVENTARIO

const formGestion = document.getElementById('form-gestion-equipo');
const btnSubmitEquipo = document.getElementById('btn-submit-equipo');
const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
const inputIdEdicion = document.getElementById('equipo-id-edicion');

formGestion.addEventListener('submit', function(e) {
    e.preventDefault();

    const codigo = document.getElementById('new-eq-codigo').value.trim().toUpperCase();
    const nombre = document.getElementById('new-eq-nombre').value.trim();
    const stock = parseInt(document.getElementById('new-eq-stock').value);
    const idEdicion = inputIdEdicion.value; // Si tiene valor, estamos editando

    if (!codigo || !nombre || isNaN(stock)) {
        mostrarAlertaToast("Por favor, llena correctamente todos los campos.", "bg-danger");
        return;
    }

    if (idEdicion) {
        const equipo = inventario.find(eq => eq.codigo === idEdicion);
        if (equipo) {
            // Si cambió el código, verificar que el nuevo no colisione con otro existente
            if (codigo !== idEdicion && inventario.some(eq => eq.codigo === codigo)) {
                mostrarAlertaToast("Ese nuevo código ya está registrado en otro equipo.", "bg-warning");
                return;
            }
            equipo.codigo = codigo;
            equipo.nombre = nombre;
            equipo.stock = stock;
            mostrarAlertaToast("Equipo actualizado correctamente.", "bg-success");
        }
    } else {
        const existe = inventario.some(eq => eq.codigo === codigo);
        if (existe) {
            mostrarAlertaToast("¡Error! Ya existe un equipo registrado con ese código.", "bg-danger");
            return;
        }

        inventario.push({
            codigo: codigo,
            nombre: nombre,
            stock: stock,
            estado: 'Disponible'
        });
        mostrarAlertaToast("Equipo añadido exitosamente al inventario.", "bg-success");
    }

    resetearFormularioGestion();
    guardarInventario();
    renderizarTodo();
});

function prepararEdicion(codigoEquipo) {
    const equipo = inventario.find(eq => eq.codigo === codigoEquipo);
    if (!equipo) return;

    document.getElementById('new-eq-codigo').value = equipo.codigo;
    document.getElementById('new-eq-nombre').value = equipo.nombre;
    document.getElementById('new-eq-stock').value = equipo.stock;
    inputIdEdicion.value = equipo.codigo;

    btnSubmitEquipo.textContent = "Actualizar Cambios";
    btnSubmitEquipo.className = "btn btn-primary btn-sm w-100 fw-bold";
    btnCancelarEdicion.classList.remove('d-none');

    const collapseEl = document.getElementById('collapseInventario');
    const bsCollapse = new bootstrap.Collapse(collapseEl, { toggle: false });
    bsCollapse.show();
}

btnCancelarEdicion.addEventListener('click', resetearFormularioGestion);

function resetearFormularioGestion() {
    formGestion.reset();
    inputIdEdicion.value = "";
    btnSubmitEquipo.textContent = "Agregar Equipo";
    btnSubmitEquipo.className = "btn btn-warning btn-sm w-100 text-dark fw-bold";
    btnCancelarEdicion.classList.add('d-none');
}

function eliminarEquipo(codigoEquipo) {
    // Validación: No permitir borrar si el equipo tiene un préstamo activo
    const tienePrestamoActivo = prestamosActivos.some(p => p.equipoCodigo === codigoEquipo);
    if (tienePrestamoActivo) {
        mostrarAlertaToast("No puedes eliminar un equipo que tiene préstamos pendientes.", "bg-danger");
        return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el equipo con código ${codigoEquipo}?`)) {
        inventario = inventario.filter(eq => eq.codigo !== codigoEquipo);
        guardarInventario();
        renderizarTodo();
        mostrarAlertaToast("Equipo eliminado del inventario.", "bg-info");
    }
}


//PRESTAMOS Y DEVOLUCIONES

document.getElementById('form-prestamo').addEventListener('submit', function(e) {
    e.preventDefault();

    const alumno = document.getElementById('alumnoNombre').value.trim();
    const codigo = document.getElementById('alumnoCodigo').value.trim();
    const equipoCodigo = document.getElementById('equipoSeleccionado').value;

    if (!alumno || !codigo || !equipoCodigo) {
        mostrarAlertaToast("Por favor, llena todos los campos.", "bg-danger");
        return;
    }

    const regexCodigo = /^\d{8}$/;
    if (!regexCodigo.test(codigo)) {
        mostrarAlertaToast("El código universitario debe tener exactamente 8 números.", "bg-warning");
        return;
    }

    const equipo = inventario.find(eq => eq.codigo === equipoCodigo);

    if (!equipo || equipo.stock <= 0) {
        mostrarAlertaToast("¡No queda stock disponible de este equipo!", "bg-danger");
        return;
    }

    equipo.stock -= 1;
    guardarInventario();

    const nuevoPrestamo = {
        id: Date.now(),
        alumno: alumno,
        codigo: codigo,
        equipoCodigo: equipo.codigo,
        equipoNombre: equipo.nombre
    };

    prestamosActivos.push(nuevoPrestamo);

    document.getElementById('form-prestamo').reset();
    renderizarTodo();
    mostrarAlertaToast("¡Préstamo registrado exitosamente!", "bg-success");
});

function procesarDevolucion(idPrestamo) {
    const indice = prestamosActivos.findIndex(p => p.id === idPrestamo);

    if (indice !== -1) {
        const prestamo = prestamosActivos[indice];

        const equipo = inventario.find(eq => eq.codigo === prestamo.equipoCodigo);
        if (equipo) {
            equipo.stock += 1;
            guardarInventario(); 
        }

        const ahora = new Date();
        const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + ahora.toLocaleDateString();

        const registroHistorial = {
            alumno: prestamo.alumno,
            codigo: prestamo.codigo,
            equipo: `${prestamo.equipoNombre} (${prestamo.equipoCodigo})`,
            fechaRetorno: horaFormateada
        };

        historialPrestamos.unshift(registroHistorial);
        prestamosActivos.splice(indice, 1);

        renderizarTodo();
        mostrarAlertaToast("Equipo devuelto y archivado en el historial.", "bg-info");
    }
}


// BÚSQUEDA Y FILTRADO

document.getElementById('buscador-inventario').addEventListener('input', function(e) {
    const texto = e.target.value.toLowerCase().trim();

    const inventarioFiltrado = inventario.filter(equipo => {
        return equipo.nombre.toLowerCase().includes(texto) || equipo.codigo.toLowerCase().includes(texto);
    });

    actualizarTablaInventario(inventarioFiltrado);
});


// ALERTAS 
function mostrarAlertaToast(mensaje, claseColor) {
    const toastElement = document.getElementById('alertaToast');
    const toastMensaje = document.getElementById('toastMensaje');

    toastElement.className = "toast align-items-center text-white border-0 " + claseColor;
    toastMensaje.textContent = mensaje;

    const bootstrapToast = new bootstrap.Toast(toastElement);
    bootstrapToast.show();
}