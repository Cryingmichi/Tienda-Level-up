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

    // Mostrar precio original y descuento solo si existe
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

  checkoutTotal.textContent = `Total a pagar: $${total.toLocaleString()}`;

  // Confirmar compra
  btnConfirmar.addEventListener("click", () => {
    if (carrito.length === 0) return;

    if (!usuario) return alert("Debes iniciar sesión para comprar.");

    // Crear objeto de compra asociado al usuario
    const compra = {
      usuarioEmail: usuario.email,       // clave para filtrar luego
      fecha: new Date().toLocaleString(),
      items: carrito,
      total: total
    };

    // Guardar en localStorage
    const compras = JSON.parse(localStorage.getItem("compras")) || [];
    compras.push(compra);
    localStorage.setItem("compras", JSON.stringify(compras));

    // Vaciar carrito
    localStorage.removeItem("carrito");
    window.carrito = [];
    window.actualizarContadorCarrito();

    alert("¡Compra realizada con éxito!");
    window.location.href = "../index.html";
  });
});
