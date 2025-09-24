// --- ALERTA BONITA ---
window.mostrarAlerta = (mensaje, tipo = "warning", duracion = 3000, posicion = "top-end") => {
  const alerta = document.createElement("div");
  alerta.className = `alert alert-${tipo} alert-dismissible fade show shadow`;
  alerta.style.position = "fixed";
  alerta.style.zIndex = 1050;

  switch(posicion) {
    case "center":
      alerta.style.top = "50%";
      alerta.style.left = "50%";
      alerta.style.transform = "translate(-50%, -50%)";
      break;
    case "top-start":   // izquierda superior
      alerta.style.top = "1rem";
      alerta.style.left = "1rem";
      break;
    case "top-end":
    default:
      alerta.style.top = "1rem";
      alerta.style.right = "1rem";
      break;
  }

  alerta.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alerta);

  setTimeout(() => alerta.remove(), duracion);
};

// --- PUNTOS LVL UP ---
const puntosPorPesos = 1000; // 1 punto por cada $1000 gastados
const descuentoPorPuntos = 100; // cada 100 puntos se puede usar
const valorDescuentoPorPuntos = 500; // $500 de descuento por cada bloque de 100 puntos

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
    window.mostrarAlerta("⚠️ Debes iniciar sesión para comprar productos.", "warning");
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
    window.mostrarAlerta("❌ No hay stock suficiente.", "danger");
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

  // Render de productos en carrito
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
      } else window.mostrarAlerta("❌ No hay más stock disponible.", "danger");
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

  // --- Checkbox para usar puntos LVL UP ---
  let usarPuntos = false;
  const lvlPoints = usuario?.lvlPoints || 0;

  if (usuario && lvlPoints > 0) {
    // Crear checkbox si no existe
    if (!document.getElementById("usarPuntosCheckbox")) {
      const div = document.createElement("div");
      div.className = "mt-2 mb-2 text-warning";
      div.innerHTML = `
        <input type="checkbox" id="usarPuntosCheckbox">
        <label for="usarPuntosCheckbox">Usar puntos LVL UP (${lvlPoints} pts disponibles)</label>
      `;
      carritoBody.appendChild(div);
    }

    // Agregar listener solo si el checkbox existe
    const checkbox = document.getElementById("usarPuntosCheckbox");
    if (checkbox) {
      checkbox.removeEventListener("change", window.renderCarritoSidebar); // limpiar listeners antiguos
      checkbox.addEventListener("change", window.renderCarritoSidebar);
      usarPuntos = checkbox.checked;
    }
  }

  // Calcular total con puntos
  let totalConPuntos = total;
  let puntosAplicados = 0;

  if (usuario && usarPuntos) {
    const bloques = Math.floor(usuario.lvlPoints / descuentoPorPuntos);
    puntosAplicados = bloques * descuentoPorPuntos;
    const descuento = bloques * valorDescuentoPorPuntos;
    totalConPuntos -= descuento;

    const descuentoDiv = document.createElement("div");
    descuentoDiv.className = "text-success fw-bold";
    descuentoDiv.textContent = `Descuento aplicado: $${descuento.toLocaleString()} (${puntosAplicados} pts)`;
    carritoBody.appendChild(descuentoDiv);
  }

  // Mostrar total final
  const totalDiv = document.createElement("div");
  totalDiv.className = "mt-3 fw-bold";
  totalDiv.textContent = `Total: $${totalConPuntos.toLocaleString()}`;
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
      } else window.mostrarAlerta("❌ No hay más stock disponible.", "danger");
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

  // --- Total con puntos (si aplica) ---
  let totalConPuntos = total;
  const usarPuntos = document.getElementById("usarPuntosCheckbox")?.checked || false;
  if (usuario && usarPuntos) {
    const bloques = Math.floor(usuario.lvlPoints / descuentoPorPuntos);
    const descuento = bloques * valorDescuentoPorPuntos;
    totalConPuntos -= descuento;

    const descuentoDiv = document.createElement("div");
    descuentoDiv.className = "text-success fw-bold";
    descuentoDiv.textContent = `Descuento aplicado: $${descuento.toLocaleString()} (${bloques * descuentoPorPuntos} pts)`;
    cartFooter.appendChild(descuentoDiv);
  }

  const totalDiv = document.createElement("div");
  totalDiv.className = "cart-total";
  totalDiv.textContent = `Total: $${totalConPuntos.toLocaleString()}`;
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
    window.mostrarAlerta("⚠️ Debes iniciar sesión para finalizar la compra.", "warning");
    window.location.href = "acceso.html";
    return;
  }

  if (window.carrito.length === 0) {
    window.mostrarAlerta("❌ Tu carrito está vacío.", "danger");
    return;
  }

  // Recuperar historial de compras
  const comprasUsuarios = JSON.parse(localStorage.getItem("comprasUsuarios")) || {};
  const compras = comprasUsuarios[userEmail] || [];

  // Calcular total
  let total = window.carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  // Aplicar puntos si seleccionó usar
  const usarPuntos = document.getElementById("usarPuntosCheckbox")?.checked || false;
  let puntosUsados = 0;
  if (usarPuntos && usuario.lvlPoints > 0) {
    const bloques = Math.floor(usuario.lvlPoints / descuentoPorPuntos);
    puntosUsados = bloques * descuentoPorPuntos;
    const descuento = bloques * valorDescuentoPorPuntos;
    total -= descuento;
    usuario.lvlPoints -= puntosUsados;
    window.mostrarAlerta(`💎 Has usado ${puntosUsados} pts para descontar $${descuento.toLocaleString()}.`, "info", 4000);
  }

  // Ganar puntos por compra
  const puntosGanados = Math.floor(total / puntosPorPesos);
  usuario.lvlPoints = (usuario.lvlPoints || 0) + puntosGanados;

  // Guardar usuario actualizado
  localStorage.setItem("usuario", JSON.stringify(usuario));

  // Nueva compra
  const nuevaCompra = {
    fecha: new Date().toLocaleString(),
    items: [...window.carrito],
    total: total
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

  // Alerta compra exitosa
  window.mostrarAlerta(`✅ Compra realizada con éxito. Has ganado ${puntosGanados} pts LVL UP.`, "success", 4000, "top-start");

  // Redirigir al perfil
  setTimeout(() => {
    window.location.href = "perfil.html";
  }, 1500);
};

// --- SIDEBAR: abrir/cerrar ---
document.addEventListener("DOMContentLoaded", () => {
  const btnAbrirCarrito = document.getElementById("btnAbrirCarrito");
  const carritoSidebarEl = document.getElementById("carritoSidebar");
  const btnCerrarCarrito = document.getElementById("btnCerrarCarrito");

  const cerrarSidebar = () => {
    if (carritoSidebarEl) {
      carritoSidebarEl.classList.remove("open");
    }
  };

  if (btnAbrirCarrito && carritoSidebarEl) {
    btnAbrirCarrito.addEventListener("click", () => {
      carritoSidebarEl.classList.add("open");
      window.renderCarritoSidebar();
    });
  }

  if (btnCerrarCarrito && carritoSidebarEl) {
    btnCerrarCarrito.addEventListener("click", cerrarSidebar);
  }

  if (carritoSidebarEl) {
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
  }

  window.renderCarritoPage?.();
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
