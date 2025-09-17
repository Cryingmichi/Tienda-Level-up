// CARRITO GLOBAL
const usuario = JSON.parse(localStorage.getItem("usuario"));
const userEmail = usuario?.email || "invitado"; // usar "invitado" si no hay usuario

// Ocultar boton si es invitado
document.querySelectorAll(".btn-agregar").forEach(btn => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) btn.disabled = true;
});


// Cargar carrito del usuario
window.carrito = JSON.parse(localStorage.getItem(`carrito_${userEmail}`)) || [];

// Guardar carrito del usuario
window.guardarCarrito = () => {
  localStorage.setItem(`carrito_${userEmail}`, JSON.stringify(window.carrito));
};

// Actualiza contador del carrito
window.actualizarContadorCarrito = () => {
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) {
    cartCountEl.textContent = window.carrito.reduce((acc, i) => acc + (i.cantidad || 1), 0);
  }
};

// Agregar al carrito con precio original y descuento si es @duoc.cl
window.agregarAlCarrito = (id, cantidad = 1) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    alert("Debes iniciar sesión para comprar productos.");
    return;
  }

  const producto = window.productos.find(p => p.id === id);
  if (!producto) return;

  const stockActual = window.obtenerStock(id);
  if (stockActual >= cantidad) {
    window.actualizarStock(id, cantidad);

    let precioFinal = producto.precio;
    let precioOriginal = producto.precio;

    if (usuario.esDuoc) {
      precioFinal = Math.round(producto.precio * 0.8); // 20% descuento
    }

    let itemCarrito = window.carrito.find(p => p.id === id);
    if (itemCarrito) {
      itemCarrito.cantidad += cantidad;
      itemCarrito.precio = precioFinal;
      itemCarrito.precioOriginal = precioOriginal;
    } else {
      window.carrito.push({ ...producto, precio: precioFinal, precioOriginal, cantidad });
    }

    window.guardarCarrito();
    window.actualizarContadorCarrito();
    window.renderCarritoSidebar?.();
  } else {
    alert("No hay stock suficiente");
  }
};

// --- SIDEBAR ---
window.renderCarritoSidebar = () => {
  const carritoBody = document.getElementById("carritoSidebarBody");
  if (!carritoBody) return;
  carritoBody.innerHTML = "";

  if (window.carrito.length === 0) {
    carritoBody.innerHTML = "<p class='text-secondary'>Tu carrito está vacío.</p>";
    return;
  }

  window.carrito.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "d-flex justify-content-between align-items-center mb-2 border-bottom pb-2";

    let precioHtml = "";
    if (item.precioOriginal && item.precioOriginal > item.precio) {
      const descuento = Math.round((1 - item.precio / item.precioOriginal) * 100);
      precioHtml = `
        <span class="text-secondary text-decoration-line-through">$${item.precioOriginal.toLocaleString()}</span>
        <span class="text-success fw-bold ms-1">$${item.precio.toLocaleString()}</span>
        <small class="badge bg-success ms-1">-${descuento}%</small>
      `;
    } else {
      precioHtml = `$${item.precio.toLocaleString()}`;
    }

    div.innerHTML = `
      <div>
        <img src="${item.imagen}" alt="${item.nombre}" class="img-fluid rounded mb-1" style="max-width:80px;">
        <strong>${item.nombre}</strong><br>
        <small class="text-secondary">${item.categoria}</small><br>
        Precio: ${precioHtml}
      </div>
      <div class="d-flex flex-column align-items-end">
        <div class="mb-1">
          <button class="btn btn-sm btn-outline-secondary me-1" id="btnMenos${index}">-</button>
          <span id="cantidad${index}">${item.cantidad}</span>
          <button class="btn btn-sm btn-outline-secondary ms-1" id="btnMas${index}">+</button>
        </div>
        <div>
          Subtotal: $<span id="subtotal${index}">${(item.precio * item.cantidad).toLocaleString()}</span>
          <button class="btn btn-sm btn-danger ms-2" id="btnEliminar${index}"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `;
    carritoBody.appendChild(div);

    document.getElementById(`btnMas${index}`).addEventListener("click", () => {
      if (window.obtenerStock(item.id) > 0) {
        window.actualizarStock(item.id, 1);
        item.cantidad++;
        window.guardarCarrito();
        window.renderCarritoSidebar();
        window.actualizarContadorCarrito();
      } else alert("No hay más stock disponible.");
    });

    document.getElementById(`btnMenos${index}`).addEventListener("click", () => {
      if (item.cantidad > 1) {
        window.devolverStock(item.id, 1);
        item.cantidad--;
        window.guardarCarrito();
        window.renderCarritoSidebar();
        window.actualizarContadorCarrito();
      } else eliminarDelCarrito(index);
    });

    document.getElementById(`btnEliminar${index}`).addEventListener("click", () => {
      eliminarDelCarrito(index);
    });
  });

  const total = window.carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const totalDiv = document.createElement("div");
  totalDiv.className = "mt-3 fw-bold";
  totalDiv.textContent = `Total: $${total.toLocaleString()}`;
  carritoBody.appendChild(totalDiv);

  const btnVerCarrito = document.createElement("a");
  btnVerCarrito.className = "btn btn-outline-light w-100 mt-2";
  btnVerCarrito.href = "carrito.html";
  btnVerCarrito.textContent = "Ver carrito";
  carritoBody.appendChild(btnVerCarrito);

  const btnComprar = document.createElement("button");
  btnComprar.className = "btn btn-accent w-100 mt-2";
  btnComprar.textContent = "Finalizar compra";
  btnComprar.onclick = () => window.finalizarCompra();
  carritoBody.appendChild(btnComprar);
};

// --- CARRITO PAGE ---
window.renderCarritoPage = () => {
  const carritoItems = document.getElementById("carritoItems");
  const cartFooter = document.getElementById("cartFooter");
  if (!carritoItems || !cartFooter) return;

  carritoItems.innerHTML = "";
  cartFooter.innerHTML = "";

  if (window.carrito.length === 0) {
    carritoItems.innerHTML = "<p class='text-secondary'>Tu carrito está vacío.</p>";
    return;
  }

  let total = 0;

  window.carrito.forEach((item, index) => {
    let precioHtml = "";
    let precioUnitario = item.precio;

    if (item.precioOriginal && item.precioOriginal > item.precio) {
      const descuento = Math.round((1 - item.precio / item.precioOriginal) * 100);
      precioHtml = `
        <span class="text-secondary text-decoration-line-through">$${item.precioOriginal.toLocaleString()}</span>
        <span class="text-success fw-bold ms-1">$${item.precio.toLocaleString()}</span>
        <small class="badge bg-success ms-1">-${descuento}%</small>
      `;
    } else {
      precioHtml = `$${item.precio.toLocaleString()}`;
    }

    total += precioUnitario * item.cantidad;

    const div = document.createElement("div");
    div.className = "cart-item d-flex justify-content-between align-items-center mb-2 border-bottom pb-2";

    div.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${item.imagen}" alt="${item.nombre}" class="img-fluid rounded me-2" style="max-width:80px;">
        <div class="cart-details">
          <strong>${item.nombre}</strong><br>
          <small class="text-secondary">${item.categoria}</small><br>
          Precio unitario: ${precioHtml}
        </div>
      </div>
      <div class="cart-actions text-end">
        <div class="mb-1">
          <button class="btn btn-sm btn-outline-secondary" id="btnMenosPage${index}">-</button>
          <span id="cantidadPage${index}">${item.cantidad}</span>
          <button class="btn btn-sm btn-outline-secondary" id="btnMasPage${index}">+</button>
        </div>
        Subtotal: $<span id="subtotalPage${index}">${(precioUnitario * item.cantidad).toLocaleString()}</span><br>
        <button class="btn btn-sm btn-danger mt-1" id="btnEliminarPage${index}"><i class="bi bi-trash"></i></button>
      </div>
    `;
    carritoItems.appendChild(div);

    document.getElementById(`btnMasPage${index}`).addEventListener("click", () => {
      if (window.obtenerStock(item.id) > 0) {
        window.actualizarStock(item.id, 1);
        item.cantidad++;
        window.guardarCarrito();
        window.renderCarritoPage();
        window.actualizarContadorCarrito();
      } else alert("No hay más stock disponible.");
    });

    document.getElementById(`btnMenosPage${index}`).addEventListener("click", () => {
      if (item.cantidad > 1) {
        window.devolverStock(item.id, 1);
        item.cantidad--;
        window.guardarCarrito();
        window.renderCarritoPage();
        window.actualizarContadorCarrito();
      } else {
        eliminarDelCarrito(index);
        window.renderCarritoPage();
      }
    });

    document.getElementById(`btnEliminarPage${index}`).addEventListener("click", () => {
      eliminarDelCarrito(index);
      window.renderCarritoPage();
    });
  });

  const totalDiv = document.createElement("div");
  totalDiv.className = "cart-total";
  totalDiv.textContent = `Total: $${total.toLocaleString()}`;
  cartFooter.appendChild(totalDiv);

  const btnSeguir = document.createElement("a");
  btnSeguir.className = "btn btn-outline-light w-100 mt-2";
  btnSeguir.href = "productos.html";
  btnSeguir.textContent = "Seguir comprando";
  cartFooter.appendChild(btnSeguir);

  const btnComprar = document.createElement("button");
  btnComprar.className = "btn btn-accent w-100 mt-2";
  btnComprar.textContent = "Finalizar compra";
  btnComprar.onclick = () => window.finalizarCompra();
  cartFooter.appendChild(btnComprar);
};

// --- ELIMINAR DEL CARRITO ---
const eliminarDelCarrito = (index) => {
  const item = window.carrito[index];
  window.devolverStock(item.id, item.cantidad);
  window.carrito.splice(index, 1);
  window.guardarCarrito();
  window.renderCarritoSidebar();
  window.actualizarContadorCarrito();
};

// --- FINALIZAR COMPRA ---
window.finalizarCompra = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    alert("Debes iniciar sesión para finalizar la compra.");
    window.location.href = "acceso.html"; // redirige a login/registro
    return;
  }

  if (window.carrito.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }

  // Recuperar historial de compras por usuario
  const comprasUsuarios = JSON.parse(localStorage.getItem("comprasUsuarios")) || {};
  const compras = comprasUsuarios[userEmail] || [];

  // Nueva compra
  const nuevaCompra = {
    fecha: new Date().toLocaleString(),
    items: [...window.carrito], // clonamos el carrito
    total: window.carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
  };

  compras.push(nuevaCompra);
  comprasUsuarios[userEmail] = compras;
  localStorage.setItem("comprasUsuarios", JSON.stringify(comprasUsuarios));

  // Vaciar carrito
  window.carrito = [];
  window.guardarCarrito();
  window.actualizarContadorCarrito();
  window.renderCarritoSidebar?.();
  window.renderCarritoPage?.();

  // Redirigir al perfil
  window.location.href = "perfil.html";
};

// --- SIDEBAR: abrir/cerrar ---
document.addEventListener("DOMContentLoaded", () => {
  const btnAbrirCarrito = document.getElementById("btnAbrirCarrito");
  const carritoSidebarEl = document.getElementById("carritoSidebar");
  const btnCerrarCarrito = document.getElementById("btnCerrarCarrito");

  const cerrarSidebar = () => {
    carritoSidebarEl.classList.remove("open");
  };

  if (btnAbrirCarrito && carritoSidebarEl) {
    btnAbrirCarrito.addEventListener("click", () => {
      carritoSidebarEl.classList.add("open");
      window.renderCarritoSidebar();
    });
  }

  if (btnCerrarCarrito) {
    btnCerrarCarrito.addEventListener("click", cerrarSidebar);
  }

  document.addEventListener("click", (e) => {
    if (
      carritoSidebarEl.classList.contains("open") &&
      !carritoSidebarEl.contains(e.target) &&
      e.target !== btnAbrirCarrito
    ) {
      cerrarSidebar();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && carritoSidebarEl.classList.contains("open")) {
      cerrarSidebar();
    }
  });

  window.renderCarritoPage();
});

// --- SINCRONIZAR CARRITO ENTRE PESTAÑAS ---
window.addEventListener("storage", (e) => {
  if (e.key === `carrito_${userEmail}`) {
    window.carrito = JSON.parse(e.newValue) || [];
    window.renderCarritoSidebar();
    window.actualizarContadorCarrito();
    window.renderCarritoPage?.();
    window.renderizarProductos?.();
    window.actualizarProductoDetalleStock?.();
  }
});
