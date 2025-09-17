// --- STOCK GLOBAL ---
window.productosStock = JSON.parse(localStorage.getItem("productosStock")) || {};

// Inicializa stock de productos
window.inicializarStock = (productos) => {
  productos.forEach(p => {
    if (window.productosStock[p.id] == null) {
      window.productosStock[p.id] = p.stockActual ?? 10;
    }
  });
  localStorage.setItem("productosStock", JSON.stringify(window.productosStock));
  return productos;
};

// Obtener stock de un producto
window.obtenerStock = (id) => window.productosStock[id] ?? 0;

// Actualizar stock al agregar al carrito
window.actualizarStock = (id, cantidad) => {
  if (window.productosStock[id] != null) {
    window.productosStock[id] -= cantidad;
    if (window.productosStock[id] < 0) window.productosStock[id] = 0;
    localStorage.setItem("productosStock", JSON.stringify(window.productosStock));
    window.renderizarProductos?.();
    window.renderCarritoSidebar?.();
    window.actualizarProductoDetalleStock?.();
  }
};

// Devolver stock (al quitar del carrito)
window.devolverStock = (id, cantidad) => {
  if (window.productosStock[id] != null) {
    window.productosStock[id] += cantidad;
    localStorage.setItem("productosStock", JSON.stringify(window.productosStock));
    window.renderizarProductos?.();
    window.renderCarritoSidebar?.();
    window.actualizarProductoDetalleStock?.();
  }
};
