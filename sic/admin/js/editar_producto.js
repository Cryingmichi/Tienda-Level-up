// Obtener el producto seleccionado desde localStorage
const productoEditar = JSON.parse(localStorage.getItem('productoEditar'));
const formProducto = document.getElementById('formProducto');
const categoriaSelect = document.getElementById('categoriaProducto');
const codigoInput = document.getElementById('idProducto');
codigoInput.readOnly = true;

// Cargar categorías desde productos.json
fetch('productos.json')
  .then(response => response.json())
  .then(data => {
    // Obtener categorías únicas del JSON
    const categorias = [...new Set(data.map(p => p.categoria))];

    // Llenar el select
    categoriaSelect.innerHTML = '<option value="" disabled>Seleccione una categoría</option>';
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoriaSelect.appendChild(option);
    });

    // Prellenar categoría si estamos editando
    if (productoEditar) {
      // Si la categoría del producto no está en JSON, agregarla al select
      if (productoEditar.categoria && !categorias.includes(productoEditar.categoria)) {
        const option = document.createElement('option');
        option.value = productoEditar.categoria;
        option.textContent = productoEditar.categoria;
        categoriaSelect.appendChild(option);
      }
      categoriaSelect.value = productoEditar.categoria;
    }
  })
  .catch(err => console.error('Error cargando categorías:', err));

// Función para generar código automático
function generarCodigo(categoria, nombre) {
  const productos = JSON.parse(localStorage.getItem('productos')) || [];
  const prefix = categoria.substring(0, 2).toUpperCase() + (nombre ? nombre[0].toUpperCase() : '');
  const count = productos.filter(p => p.categoria === categoria).length + 1;
  return `${prefix}${String(count).padStart(3, '0')}`;
}

// Prellenar los demás campos si existe productoEditar
if (productoEditar) {
  codigoInput.value = productoEditar.id;
  document.getElementById('nombreProducto').value = productoEditar.nombre;
  document.getElementById('descripcionProducto').value = productoEditar.descripcion || '';
  document.getElementById('precioProducto').value = productoEditar.precio;
  document.getElementById('stockProducto').value = productoEditar.stock;
  document.getElementById('stockCritico').value = productoEditar.stockCritico || '';
  if (productoEditar.imagen) {
    document.getElementById('imagenPreview').src = '../assets/imagenes/' + productoEditar.imagen;
  }
}

// Actualizar código automáticamente al cambiar categoría o nombre
function actualizarCodigo() {
  if (categoriaSelect.value !== "") {
    const nombre = document.getElementById('nombreProducto').value;
    codigoInput.value = generarCodigo(categoriaSelect.value, nombre);
  } else {
    codigoInput.value = "";
  }
}

categoriaSelect.addEventListener('change', actualizarCodigo);
document.getElementById('nombreProducto').addEventListener('input', actualizarCodigo);

// Manejar envío del formulario
formProducto.addEventListener('submit', function(e) {
  e.preventDefault();

  let productos = JSON.parse(localStorage.getItem('productos')) || [];
  const index = productos.findIndex(p => p.id === productoEditar.id);

  const productoActualizado = {
    id: codigoInput.value,
    nombre: document.getElementById('nombreProducto').value,
    descripcion: document.getElementById('descripcionProducto').value,
    precio: parseFloat(document.getElementById('precioProducto').value),
    stock: parseInt(document.getElementById('stockProducto').value),
    stockCritico: document.getElementById('stockCritico').value ? parseInt(document.getElementById('stockCritico').value) : null,
    categoria: categoriaSelect.value,
    imagen: document.getElementById('imagenProducto').files[0] ? document.getElementById('imagenProducto').files[0].name : productoEditar.imagen
  };

  productos[index] = productoActualizado;
  localStorage.setItem('productos', JSON.stringify(productos));

  alert('Producto actualizado correctamente');
  window.location.href = 'productos.html';
});
