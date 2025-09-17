// --- VARIABLES GLOBALES ---
window.productoDetalle = null;
window.reseñas = [];

// Asegurarse de tener la variable global usuario
window.usuario = window.usuario || JSON.parse(localStorage.getItem("usuario")) || null;

// Mostrar nombre en formulario si está logueado
const nombreInput = document.getElementById("reseñaNombre");
if (nombreInput) {
  if (window.usuario) {
    nombreInput.value = window.usuario.nombre;
    nombreInput.disabled = true; // no se puede cambiar
  } else {
    nombreInput.value = "";
    nombreInput.disabled = false;
  }
}

// Cargar detalle del producto
window.cargarProductoDetalle = () => {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id || !window.productos) return;

  const producto = window.productos.find(p => p.id === id);
  if (!producto) return;
  window.productoDetalle = producto;

  const imgEl = document.getElementById("detalleImagen");
  const nombreEl = document.getElementById("detalleNombre");
  const categoriaEl = document.getElementById("detalleCategoria");
  const precioEl = document.getElementById("detallePrecio");
  const descEl = document.getElementById("detalleDescripcion");
  const stockEl = document.getElementById("detalleStock");
  const cantEl = document.getElementById("cantidadSeleccionada");
  const especEl = document.getElementById("detalleEspecificaciones");

  if (imgEl) imgEl.src = producto.imagen || "";
  if (nombreEl) nombreEl.textContent = producto.nombre || "";
  if (categoriaEl) categoriaEl.textContent = producto.categoria || "";
  if (descEl) descEl.textContent = producto.descripcion || "";

  // Precio con descuento
  let precioFinal = producto.precio;
  if (window.usuario?.esDuoc) precioFinal = producto.precio * 0.8;
  if (precioEl) {
    if (window.usuario?.esDuoc) {
      precioEl.innerHTML = `<span class="text-secondary text-decoration-line-through">$${producto.precio.toLocaleString()}</span> $${precioFinal.toLocaleString()}`;
    } else {
      precioEl.textContent = `$${precioFinal.toLocaleString()}`;
    }
  }

  // Stock
  window.actualizarProductoDetalleStock = () => {
    const stockActual = window.obtenerStock(producto.id);
    if (stockEl) stockEl.textContent = stockActual > 0 ? `${stockActual} unidad${stockActual !== 1 ? "es" : ""} disponible${stockActual !== 1 ? "s" : ""}` : "Agotado";
    if (cantEl) {
      cantEl.value = 1;
      cantEl.max = stockActual;
    }
  };
  window.actualizarProductoDetalleStock();

  // Especificaciones
  if (especEl) {
    if (producto.detalles && Object.keys(producto.detalles).length > 0) {
      let tabla = `<table class="table table-dark table-striped custom-table"><tbody>`;
      for (const [key, val] of Object.entries(producto.detalles)) {
        tabla += `<tr><th>${key}</th><td>${val}</td></tr>`;
      }
      tabla += `</tbody></table>`;
      especEl.innerHTML = tabla;
    } else {
      especEl.innerHTML = "<p class='text-secondary'>No hay especificaciones disponibles.</p>";
    }
  }

  // Botón agregar al carrito
  const btnAgregar = document.getElementById("detalleAgregar");
  if (btnAgregar) {
    btnAgregar.onclick = () => {
      const cantidad = Number(cantEl?.value) || 1;
      window.agregarAlCarrito(producto.id, cantidad);
      window.actualizarProductoDetalleStock();
      cantEl.value = cantidad > window.obtenerStock(producto.id) ? window.obtenerStock(producto.id) : cantidad;
    };
  }

  // Cargar reseñas
  const todasReseñas = JSON.parse(localStorage.getItem("reseñas")) || {};
  window.reseñas = todasReseñas[producto.id] || [];
  window.renderReseñas?.();
};

// Renderizar reseñas
window.renderReseñas = () => {
  const contenedor = document.getElementById("reseñasProducto");
  const promedioEl = document.getElementById("promedioEstrellas");
  const totalEl = document.getElementById("totalReseñas");
  if (!contenedor || !promedioEl || !totalEl) return;

  contenedor.innerHTML = "";
  if (window.reseñas.length === 0) {
    contenedor.innerHTML = "<p class='text-secondary'>No hay reseñas todavía.</p>";
    promedioEl.textContent = "";
    totalEl.textContent = "";
    return;
  }

  const promedio = window.reseñas.reduce((acc, r) => acc + r.rating, 0) / window.reseñas.length;
  promedioEl.textContent = "★".repeat(Math.round(promedio));
  totalEl.textContent = `(${window.reseñas.length} reseña${window.reseñas.length > 1 ? "s" : ""})`;

  window.reseñas.forEach(r => {
    const fechaFormateada = new Date(r.fecha).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const div = document.createElement("div");
    div.className = "list-group-item bg-dark text-light mb-2 rounded";
    div.innerHTML = `<strong>${r.nombre}</strong> <small class="text-secondary">${fechaFormateada}</small> <span class="text-warning">${"★".repeat(r.rating)}</span><p>${r.texto}</p>`;
    contenedor.appendChild(div);
  });
};

// Inicializar formulario de reseña con estrellas interactivas
window.initFormReseña = () => {
  const btnEnviar = document.getElementById("btnAgregarReseña");
  const estrellasForm = document.getElementById("estrellasForm");
  const ratingInput = document.getElementById("reseñaRating");
  if (!btnEnviar || !estrellasForm || !ratingInput) return;

  // Valor inicial de estrellas
  let rating = parseInt(ratingInput.value) || 5;
  estrellasForm.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);

  // Evento para mostrar estrellas según el movimiento del mouse
  estrellasForm.addEventListener("mousemove", (e) => {
    const width = estrellasForm.clientWidth / 5;
    const hoverRating = Math.ceil(e.offsetX / width);
    estrellasForm.textContent = "★".repeat(hoverRating) + "☆".repeat(5 - hoverRating);
  });

  // Evento al salir con el mouse: volver al valor guardado
  estrellasForm.addEventListener("mouseleave", () => {
    rating = parseInt(ratingInput.value) || 5;
    estrellasForm.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
  });

  // Evento click para seleccionar rating
  estrellasForm.addEventListener("click", (e) => {
    const width = estrellasForm.clientWidth / 5;
    rating = Math.ceil(e.offsetX / width);
    ratingInput.value = rating;
    estrellasForm.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
  });

  // Botón enviar reseña
  btnEnviar.addEventListener("click", () => {
    if (!window.usuario) {
      alert("Debes iniciar sesión para enviar una reseña.");
      return;
    }

    const nombre = window.usuario.nombre;
    const email = window.usuario.email; // ← Se guarda el email
    const texto = document.getElementById("reseñaTexto")?.value.trim();
    if (!texto) { alert("Completa tu reseña."); return; }

    const nueva = { nombre, email, texto, rating, fecha: new Date() }; // ← Guardar email
    window.reseñas.push(nueva);

    // === Actualizar nombre en todas las reseñas existentes ===
  // Actualizar nombre en todas las reseñas del usuario
  const todasReseñas = JSON.parse(localStorage.getItem("reseñas")) || {};
  Object.values(todasReseñas).forEach(reseñasArray => {
    reseñasArray.forEach(r => {
      if (r.email === usuario.email) r.nombre = usuario.nombre;
    });
  });
  localStorage.setItem("reseñas", JSON.stringify(todasReseñas));

  // Actualizar reseñas en detalle de producto si está abierto
  if (window.productoDetalle) {
    window.reseñas = todasReseñas[window.productoDetalle.id] || [];
    window.renderReseñas(); // refresca la vista
  }
});
};
