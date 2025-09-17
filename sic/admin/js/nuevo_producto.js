// Elementos del formulario
const formProducto = document.getElementById('formProducto');
const categoriaSelect = document.getElementById('categoriaProducto');
const codigoInput = document.getElementById('idProducto');

// Función para generar código automático
function generarCodigo(categoria) {
  const productos = JSON.parse(localStorage.getItem('productos')) || [];
  const prefix = categoria.substring(0, 2).toUpperCase();
  const count = productos.filter(p => p.categoria === categoria).length + 1;
  return `${prefix}${String(count).padStart(3, '0')}`;
}

// Actualizar código cuando se selecciona categoría
categoriaSelect.addEventListener('change', () => {
  if(categoriaSelect.value !== "") {
    codigoInput.value = generarCodigo(categoriaSelect.value);
  } else {
    codigoInput.value = "";
  }
});

// Guardar producto
formProducto.addEventListener('submit', (e) => {
  e.preventDefault();

  let productos = JSON.parse(localStorage.getItem('productos')) || [];

  const nombre = document.getElementById('nombreProducto').value;
  const descripcion = document.getElementById('descripcionProducto').value;
  const precio = parseFloat(document.getElementById('precioProducto').value);
  const stock = parseInt(document.getElementById('stockProducto').value);
  const stockCritico = document.getElementById('stockCritico').value ? parseInt(document.getElementById('stockCritico').value) : null;
  const categoria = categoriaSelect.value;
  const imagen = document.getElementById('imagenProducto').files[0] ? document.getElementById('imagenProducto').files[0].name : null;
  const id = codigoInput.value;

  if(!nombre || !categoria || isNaN(precio) || isNaN(stock)) {
    alert("Por favor completa los campos requeridos correctamente.");
    return;
  }

  const producto = {
    id,
    nombre,
    descripcion,
    precio,
    stock,
    stockCritico,
    categoria,
    imagen
  };

  productos.push(producto);
  localStorage.setItem('productos', JSON.stringify(productos));

  // Guardar alerta para index_admin
  localStorage.setItem('alertaProducto', `Producto creado correctamente con código ${id}`);

  // Alerta si stock <= stockCritico
  if(stockCritico !== null && stock <= stockCritico) {
    alert(`Atención: El stock actual (${stock}) está por debajo o igual al stock crítico (${stockCritico})`);
  }

  // Redirigir a productos.html
  window.location.href = 'productos.html';
});
