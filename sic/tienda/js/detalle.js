// ESTADO GLOBAL
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let productos = [];

// --- USUARIO LOGUEADO EN NAVBAR ---
const usuario = JSON.parse(localStorage.getItem("usuario")) || null;
const userNameSpan = document.getElementById("userNameShort");
if (usuario && userNameSpan) {
  userNameSpan.textContent = usuario.nombre;
} else if (userNameSpan) {
  userNameSpan.textContent = "Invitado";
}

// Opcional: logout en detallep.html
const btnLogout = document.getElementById("btnLogout");
if (usuario && btnLogout) {
  btnLogout.style.display = "block";
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    location.reload();
  });
} else if (btnLogout) {
  btnLogout.style.display = "none";
}

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

// Reseñas guardadas en localStorage
let reseñas = JSON.parse(localStorage.getItem("reseñas")) || {};

// Mostrar reseñas
const mostrarReseñas = (idProducto) => {
  const contenedor = document.getElementById("reseñasProducto");
  const promedioEstrellasDiv = document.getElementById("promedioEstrellas");
  const totalReseñasSpan = document.getElementById("totalReseñas");

  contenedor.innerHTML = "";
  if (!reseñas[idProducto] || reseñas[idProducto].length === 0) {
    contenedor.innerHTML = "<p class='text-secondary'>No hay reseñas todavía.</p>";
    promedioEstrellasDiv.textContent = "";
    totalReseñasSpan.textContent = "";
    return;
  }

  let total = reseñas[idProducto].length;
  let suma = reseñas[idProducto].reduce((acc, r) => acc + r.rating, 0);
  let promedio = (suma / total).toFixed(1);

  promedioEstrellasDiv.textContent = "★".repeat(Math.round(promedio)) + "☆".repeat(5 - Math.round(promedio));
  totalReseñasSpan.textContent = `(${total} reseña${total>1?"s":""})`;

  reseñas[idProducto].forEach(r => {
    const div = document.createElement("div");
    div.className = "list-group-item bg-dark text-white mb-2 rounded d-flex gap-2 align-items-start";
    div.style.padding = "0.75rem";

    div.innerHTML = `
      <div class="user-icon bg-secondary rounded-circle text-center text-white" style="width:40px; height:40px; line-height:40px; font-weight:bold;">
        ${r.nombre.charAt(0).toUpperCase()}
      </div>
      <div>
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong>${r.nombre}</strong>
          <small class="text-secondary">${new Date(r.fecha).toLocaleDateString()}</small>
        </div>
        <div class="text-warning mb-1">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
        <p class="mb-0">${r.texto}</p>
      </div>
    `;
    contenedor.appendChild(div);
  });
};

// Estrellas interactivas en formulario
const estrellasForm = document.getElementById("estrellasForm");
estrellasForm.addEventListener("mousemove", (e) => {
  let width = estrellasForm.clientWidth / 5;
  let rating = Math.ceil(e.offsetX / width);
  estrellasForm.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
});
estrellasForm.addEventListener("mouseleave", () => {
  let rating = document.getElementById("reseñaRating").value;
  estrellasForm.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
});
estrellasForm.addEventListener("click", () => {
  let rating = estrellasForm.textContent.replace(/☆/g,"").length;
  document.getElementById("reseñaRating").value = rating;
});

// Agregar reseña
document.getElementById("btnAgregarReseña").addEventListener("click", () => {
  const idProducto = obtenerParametroURL("id");
  const nombre = document.getElementById("reseñaNombre").value.trim();
  const texto = document.getElementById("reseñaTexto").value.trim();
  const rating = parseInt(document.getElementById("reseñaRating").value);

  if (!nombre || !texto) return alert("Completa tu nombre y reseña.");

  if (!reseñas[idProducto]) reseñas[idProducto] = [];
  reseñas[idProducto].push({ nombre, texto, rating, fecha: new Date() });
  localStorage.setItem("reseñas", JSON.stringify(reseñas));

  mostrarReseñas(idProducto);

  // Limpiar formulario
  document.getElementById("reseñaNombre").value = "";
  document.getElementById("reseñaTexto").value = "";
  document.getElementById("reseñaRating").value = "5";
  estrellasForm.textContent = "★★★★★";
});

// Mostrar reseñas al cargar producto
mostrarReseñas(obtenerParametroURL("id"));


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