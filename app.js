// ==========================================
// 1. DATOS DE PRUEBA (ESTADO INICIAL)
// ==========================================
// Simulamos la base de datos localmente para el prototipo
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

// ==========================================
// 2. FUNCIONES DE RENDERIZADO (DIBUJAR EN PANTALLA)
// ==========================================

// Renderizar la Tabla de Inventario (Panel Izquierdo)
function actualizarTablaInventario() {
    const tbody = document.getElementById("tabla-inventario");
    if (!tbody) return;
    
    tbody.innerHTML = ""; // Limpiar filas anteriores
    
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

// Renderizar Equipos en Uso (Panel Derecho Inferior)
function actualizarListaDevoluciones() {
    const listaContenedor = document.getElementById("lista-devoluciones");
    if (!listaContenedor) return;
    
    listaContenedor.innerHTML = ""; // Limpiar lista anterior
    
    prestamosActivos.forEach(prestamo => {
        const elemento = `
            <div class="active-loan-item d-flex justify-content-between align-items-center p-3 mb-2 rounded border bg-white">
              <div>
                <div class="fw-bold text-dark text-truncate" style="max-width: 180px;">${prestamo.alumno}</div>
                <small class="text-muted d-block">${prestamo.equipoNombre} (${prestamo.equipoCodigo})</small>
                <span class="badge bg-secondary-subtle text-secondary-emphasis custom-mini-badge">Devuelve: ${prestamo.hora}</span>
              </div>
              <button class="btn btn-sm btn-devolver d-flex align-items-center gap-1" onclick="procesarDevolucion(${prestamo.id})">
                <span>↩️</span> Devolver
              </button>
            </div>
        `;
        listaContenedor.innerHTML += elemento;
    });
}

// ==========================================
// 3. LOGICA DE NEGOCIO (ACCIONES)
// ==========================================

// Registrar un nuevo préstamo desde el formulario
document.getElementById("form-prestamo").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita que la página se recargue
    
    const nombre = document.getElementById("alumnoNombre").value;
    const codigo = document.getElementById("alumnoCodigo").value;
    const equipoCodigo = document.getElementById("equipoSeleccionado").value;
    
    // Buscar la información del equipo seleccionado
    const equipo = inventario.find(e => e.codigo === equipoCodigo);
    
    if (equipo && equipo.cantidad > 0) {
        // 1. Restar 1 a la cantidad del inventario
        equipo.cantidad -= 1;
        if (equipo.cantidad === 0) {
            equipo.estado = "Prestado";
        }
        
        // 2. Agregar el préstamo a la lista activa
        const nuevoPrestamo = {
            id: Date.now(), // Genera un ID único basado en el tiempo
            alumno: nombre,
            equipoCodigo: equipo.codigo,
            equipoNombre: equipo.nombre.split(" ")[0], // Toma la primera palabra como nombre corto
            hora: "Por definir"
        };
        prestamosActivos.push(nuevoPrestamo);
        
        // 3. Actualizar la interfaz y limpiar formulario
        actualizarTablaInventario();
        actualizarListaDevoluciones();
        document.getElementById("form-prestamo").reset();
        alert(`¡Préstamo registrado con éxito para ${nombre}!`);
    } else {
        alert("Lo sentimos, este equipo no tiene existencias disponibles en este momento.");
    }
});

// Procesar la devolución de un equipo
function procesarDevolucion(idPrestamo) {
    // Encontrar el préstamo
    const prestamoIndex = prestamosActivos.findIndex(p => p.id === idPrestamo);
    if (prestamoIndex === -1) return;
    
    const prestamo = prestamosActivos[prestamoIndex];
    
    // Devolver el equipo al inventario
    const equipo = inventario.find(e => e.codigo === prestamo.equipoCodigo);
    if (equipo) {
        equipo.cantidad += 1;
        equipo.estado = "Disponible"; // Vuelve a estar disponible
    }
    
    // Eliminar del listado de préstamos activos
    prestamosActivos.splice(prestamoIndex, 1);
    
    // Refrescar los paneles visuales
    actualizarTablaInventario();
    actualizarListaDevoluciones();
}

// ==========================================
// 4. INICIALIZACIÓN
// ==========================================
// Ejecutar las funciones al cargar la página por primera vez
actualizarTablaInventario();
actualizarListaDevoluciones();