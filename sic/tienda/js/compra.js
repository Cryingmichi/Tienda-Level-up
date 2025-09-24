document.addEventListener("DOMContentLoaded", () => {
  const checkoutItems = document.getElementById("checkoutItems");
  const checkoutTotal = document.getElementById("checkoutTotal");
  const btnConfirmar = document.getElementById("btnConfirmarCompra");

  // Cargar carrito y usuario
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  checkoutItems.innerHTML = "";
  checkoutTotal.textContent = "";

  if (carrito.length === 0) {
    checkoutItems.innerHTML = "<p class='text-secondary'>Tu carrito está vacío.</p>";
    btnConfirmar.disabled = true;
    return;
  }

  let total = 0;

  carrito.forEach(item => {
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
    div.className = "checkout-item d-flex justify-content-between align-items-center mb-3 p-2 border-bottom border-secondary-subtle";
    div.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${item.imagen}" alt="${item.nombre}" class="img-fluid rounded me-3" style="max-width:80px;">
        <div>
          <strong>${item.nombre}</strong><br>
          <small class="text-secondary">${item.categoria}</small>
        </div>
      </div>
      <div class="text-end">
        <div>Precio: ${precioHtml}</div>
        <div>Cantidad: ${item.cantidad}</div>
        <div>Subtotal: $${(precioUnitario * item.cantidad).toLocaleString()}</div>
      </div>
    `;
    checkoutItems.appendChild(div);
  });

  // --- PUNTOS LVL UP ---
  let descuentoPorPuntos = 0;
  let usarPuntos = false;

  if (usuario) {
    const puntosUsuario = usuario.lvlPoints || 0;

    const puntosDiv = document.createElement("div");
    puntosDiv.className = "mb-3";
    puntosDiv.innerHTML = `
      <strong>Puntos LVL UP: ${puntosUsuario}</strong><br>
      <input type="checkbox" id="usarPuntos"> Usar puntos para descuento (1000 puntos = $100)
    `;
    checkoutItems.prepend(puntosDiv);

    document.getElementById("usarPuntos").addEventListener("change", (e) => {
      usarPuntos = e.target.checked;
      if (usarPuntos) {
        descuentoPorPuntos = Math.floor(puntosUsuario / 1000) * 100;
      } else {
        descuentoPorPuntos = 0;
      }
      checkoutTotal.textContent = `Total a pagar: $${(total - descuentoPorPuntos).toLocaleString()}`;
    });
  }

  checkoutTotal.textContent = `Total a pagar: $${total.toLocaleString()}`;

  // Confirmar compra
  btnConfirmar.addEventListener("click", () => {
    if (carrito.length === 0) return;
    if (!usuario) return alert("Debes iniciar sesión para comprar.");

    let totalFinal = total - descuentoPorPuntos;

    // Restar puntos usados
    if (usarPuntos) {
      usuario.lvlPoints -= descuentoPorPuntos / 100 * 1000; // convertir a puntos
    }

    // Sumar puntos por la compra (1 punto cada $100 gastados)
    const puntosGanados = Math.floor(totalFinal / 100);
    usuario.lvlPoints = (usuario.lvlPoints || 0) + puntosGanados;

    // Actualizar usuario en localStorage
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const index = usuarios.findIndex(u => u.email === usuario.email);
    if (index !== -1) usuarios[index] = usuario;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuario", JSON.stringify(usuario));

    // Guardar compra
    const compra = {
      usuarioEmail: usuario.email,
      fecha: new Date().toLocaleString(),
      items: carrito,
      total: totalFinal,
      puntosUsados: descuentoPorPuntos,
      puntosGanados
    };
    const compras = JSON.parse(localStorage.getItem("compras")) || [];
    compras.push(compra);
    localStorage.setItem("compras", JSON.stringify(compras));

    // Vaciar carrito
    localStorage.removeItem("carrito");
    window.carrito = [];
    window.actualizarContadorCarrito();

    window.mostrarAlerta(`✅ Compra realizada con éxito. Ganaste ${puntosGanados} puntos LVL UP`, "success", 4000, "top-end");

    setTimeout(() => window.location.href = "../index.html", 1500);
  });
});
