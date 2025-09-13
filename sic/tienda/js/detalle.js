// ESTADO GLOBAL
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let productos = [];

// FUNCIONES
const agregarAlCarrito = (id) => {
  const producto = productos.find(p => p.id === id);
  if (producto) {
    carrito.push(producto);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert(`${producto.nombre} agregado al carrito`);
  }
};

const obtenerParametroURL = (nombre) => {
  return new URLSearchParams(window.location.search).get(nombre);
};

// RENDERIZAR ESPECIFICACIONES
const renderEspecificaciones = (detalles) => {
  const contenedor = document.getElementById("detalleEspecificaciones");
  if (!detalles) {
    contenedor.innerHTML = "<p class='text-secondary'>No hay especificaciones disponibles.</p>";
    return;
  }

  let html = `<table class="table align-middle custom-table"><tbody>`;
  for (let [clave, valor] of Object.entries(detalles)) {
    html += `
      <tr>
        <th>${clave}</th>
        <td>${valor}</td>
      </tr>
    `;
  }
  html += "</tbody></table>";
  contenedor.innerHTML = html;
};

// CARGAR PRODUCTO
const cargarProducto = async () => {
  try {
    // Ruta actualizada de tu JSON
    const resp = await fetch("data/productos.json");
    const data = await resp.json();
    productos = data.productos;

    const id = obtenerParametroURL("id");
    const p = productos.find(prod => prod.id === id);
    if (!p) return;

    // Mostrar detalles del producto
    document.getElementById("detalleNombre").textContent = p.nombre;
    document.getElementById("detalleCategoria").textContent = p.categoria;
    document.getElementById("detallePrecio").textContent = `$${p.precio.toLocaleString()}`;
    document.getElementById("detalleDescripcion").textContent = p.descripcion;
    document.getElementById("detalleImagen").src = p.imagen;
    document.getElementById("detalleImagen").alt = p.nombre;

    document.getElementById("detalleAgregar").onclick = () => agregarAlCarrito(p.id);

    if (p.detalles) renderEspecificaciones(p.detalles);

    document.getElementById("year").textContent = new Date().getFullYear();
    document.title = `Level‑Up Gamer · ${p.nombre}`;

  } catch (error) {
    console.error("Error cargando producto:", error);
  }
};

// INICIALIZACIÓN
cargarProducto();