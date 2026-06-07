//DATOS

let inventario = [
    { codigo: "FIS-001", nombre: "Multímetro Digital", info: "Marca Fluke - Precisión alta", categoria: "Electrónica", cantidad: 5, estado: "Disponible" },
    { codigo: "FIS-002", nombre: "Osciloscopio de Rayos Catódicos", info: "20 MHz - Canales duales", categoria: "Ondas", cantidad: 2, estado: "Prestado" },
    { codigo: "FIS-003", nombre: "Fuente de Alimentación Regulada", info: "0-30V / 0-5A", categoria: "Electricidad", cantidad: 3, estado: "En Soporte" },
    { codigo: "FIS-004", nombre: "Juego de Pesas y Soporte", info: "Mecánica clásica - 10g a 500g", categoria: "Mecánica", cantidad: 10, estado: "Disponible" }
];

let prestamosActivos = [
    { id: 1, alumno: "Carlos Mendoza", equipoCodigo: "FIS-002", equipoNombre: "Osciloscopio", hora: "4:00 PM" },
    { id: 2, alumno: "Ana Valeria Torres", equipoCodigo: "FIS-001", equipoNombre: "Multímetro", hora: "5:30 PM" }
];

let historialPrestamos = []; 


//FUNCIONES DE RENDERIZADO

function actualizarTablaInventario() {
    const tbody = document.getElementById("tabla-inventario");
    if (!tbody) return;
    
    tbody.innerHTML = ""; 
    
    inventario.forEach(equipo => {
        let badgeClass = "";
        if (equipo.estado === "Disponible") badgeClass = "text-success bg-success-subtle border-success-subtle";
        else if (equipo.estado === "Prestado") badgeClass = "text-warning bg-warning-subtle border-warning-subtle";
        else badgeClass = "text-danger bg-danger-subtle border-danger-subtle";

        const fila = `
            <tr>
            <td class="ps-4 fw-bold text-secondary">${equipo.codigo}</td>
            <td>
                <div class="fw-bold text-dark">${equipo.nombre}</div>
                <small class="text-muted">${equipo.info}</small>
            </td>
            <td><span class="badge bg-light text-dark border">${equipo.categoria}</span></td>
            <td class="text-center fw-semibold">${equipo.cantidad}</td>
            <td class="text-center">
                <span class="badge ${badgeClass}">${equipo.estado}</span>
            </td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

function actualizarListaDevoluciones() {
    const listaContenedor = document.getElementById("lista-devoluciones");
    if (!listaContenedor) return;
    
    listaContenedor.innerHTML = ""; 
    
    prestamosActivos.forEach(prestamo => {
        const elemento = `
            <div class="active-loan-item d-flex justify-content-between align-items-center p-3 mb-2 rounded border bg-white">
            <div>
                <div class="fw-bold text-dark text-truncate" style="max-width: 180px;">${prestamo.alumno}</div>
                <small class="text-muted d-block">${prestamo.equipoNombre} (${prestamo.equipoCodigo})</small>
                <span class="badge bg-secondary-subtle text-secondary-emphasis custom-mini-badge">Prestado: ${prestamo.hora}</span>
            </div>
            <button class="btn btn-sm btn-devolver d-flex align-items-center gap-1" onclick="procesarDevolucion(${prestamo.id})">
                <span>↩️</span> Devolver
            </button>
            </div>
        `;
        listaContenedor.innerHTML += elemento;
    });
}

function actualizarTablaHistorial() {
    const tbodyHistorial = document.getElementById("tabla-historial");
    if (!tbodyHistorial) return;
    
    if (historialPrestamos.length === 0) {
        tbodyHistorial.innerHTML = `<tr><td colspan="5" class="text-muted py-4">Aún no hay préstamos finalizados en esta sesión.</td></tr>`;
        return;
    }
    
    tbodyHistorial.innerHTML = ""; 
    
    [...historialPrestamos].reverse().forEach(registro => {
        const fila = `
            <tr>
            <td class="fw-bold text-dark">${registro.alumno}</td>
            <td class="text-muted">${registro.equipoNombre}</td>
            <td><span class="badge bg-light text-secondary border">${registro.horaPrestamo}</span></td>
            <td><span class="badge bg-primary-subtle text-primary border">${registro.horaDevolucion}</span></td>
            <td><span class="badge bg-success text-white">Finalizado</span></td>
            </tr>
        `;
        tbodyHistorial.innerHTML += fila;
    });
}

//PRESTAMO

document.getElementById("form-prestamo").addEventListener("submit", function(event) {
    event.preventDefault(); 
    
    const nombreInput = document.getElementById("alumnoNombre");
    const codigoInput = document.getElementById("alumnoCodigo");
    const equipoInput = document.getElementById("equipoSeleccionado");

    const nombre = nombreInput.value.trim();
    const codigo = codigoInput.value.trim();
    const equipoCodigo = equipoInput.value;
    
    // Validaciones
    if (!nombre || !codigo || !equipoCodigo) {
        mostrarAlertaToast("Por favor, completa todos los campos antes de registrar el préstamo.", "danger");
        return; 
    }

    const formatoCodigoRegex = /^\d{8}$/; 
    if (!formatoCodigoRegex.test(codigo)) {
        mostrarAlertaToast("El código universitario debe tener exactamente 8 dígitos numéricos.", "warning");
        codigoInput.focus(); 
        return;
    }
    
    const equipo = inventario.find(e => e.codigo === equipoCodigo);
    
    if (equipo && equipo.cantidad > 0) {
        equipo.cantidad -= 1;
        if (equipo.cantidad === 0) {
            equipo.estado = "Prestado";
        }
        
        const nuevoPrestamo = {
            id: Date.now(), 
            alumno: nombre,
            equipoCodigo: equipo.codigo,
            equipoNombre: equipo.nombre.split(" ")[0], 
            hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
        };
        prestamosActivos.push(nuevoPrestamo);
        
        actualizarTablaInventario();
        actualizarListaDevoluciones();
        document.getElementById("form-prestamo").reset();
        
        mostrarAlertaToast(`¡Préstamo de ${nuevoPrestamo.equipoNombre} registrado para ${nombre}!`, "success");
    } else {
        mostrarAlertaToast("Lo sentimos, este equipo no tiene existencias disponibles.", "danger");
    }
});

function procesarDevolucion(idPrestamo) {
    const prestamoIndex = prestamosActivos.findIndex(p => p.id === idPrestamo);
    if (prestamoIndex === -1) return;
    
    const prestamo = prestamosActivos[prestamoIndex];
    
    const equipo = inventario.find(e => e.codigo === prestamo.equipoCodigo);
    if (equipo) {
        equipo.cantidad += 1;
        equipo.estado = "Disponible"; 
    }
    
    const registroHistorial = {
        alumno: prestamo.alumno,
        equipoNombre: prestamo.equipoNombre,
        horaPrestamo: prestamo.hora,
        horaDevolucion: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    historialPrestamos.push(registroHistorial);
    prestamosActivos.splice(prestamoIndex, 1);
    
    actualizarTablaInventario();
    actualizarListaDevoluciones();
    actualizarTablaHistorial();
    
    mostrarAlertaToast(`¡Equipo devuelto por ${prestamo.alumno} con éxito!`, "success");
}

///BUSQUEDA

document.getElementById("buscador-inventario").addEventListener("input", function(event) {
    const textoBuscado = event.target.value.toLowerCase();
    const tabla = document.getElementById("tabla-inventario");
    const filas = tabla.getElementsByTagName("tr");
    
    for (let i = 0; i < filas.length; i++) {
        const codigo = filas[i].getElementsByTagName("td")[0].textContent.toLowerCase();
        const nombre = filas[i].getElementsByTagName("td")[1].textContent.toLowerCase();
        
        if (codigo.includes(textoBuscado) || nombre.includes(textoBuscado)) {
            filas[i].style.display = ""; 
        } else {
            filas[i].style.display = "none"; 
        }
    }
});

//INTERFAZ

function mostrarAlertaToast(mensaje, tipoDeAlerta) {
    const toastElement = document.getElementById('liveToast');
    const toastBody = document.getElementById('toastMessage');
    
    toastBody.textContent = mensaje;
    
    toastElement.classList.remove('text-bg-success', 'text-bg-danger', 'text-bg-warning', 'text-bg-primary');
    toastElement.classList.add(`text-bg-${tipoDeAlerta}`);
    
    if (tipoDeAlerta === 'warning') {
        toastElement.classList.remove('text-white');
        toastElement.classList.add('text-dark');
        const closeBtn = toastElement.querySelector('.btn-close');
        closeBtn.classList.remove('btn-close-white');
    } else {
        toastElement.classList.add('text-white');
        toastElement.classList.remove('text-dark');
        const closeBtn = toastElement.querySelector('.btn-close');
        closeBtn.classList.add('btn-close-white');
    }

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}


//INICIALIZACIÓN

actualizarTablaInventario();
actualizarListaDevoluciones();
actualizarTablaHistorial();