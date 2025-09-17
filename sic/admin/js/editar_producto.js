// Obtener el producto seleccionado desde localStorage
const productoEditar = JSON.parse(localStorage.getItem('productoEditar'));
const formProducto = document.getElementById('formProducto');

// Prellenar los campos si existe productoEditar
if(productoEditar) {
  document.getElementById('idProducto').value = productoEditar.id;
  document.getElementById('nombreProducto').value = productoEditar.nombre;
  document.getElementById('descripcionProducto').value = productoEditar.descripcion || '';
  document.getElementById('precioProducto').value = productoEditar.precio;
  document.getElementById('stockProducto').value = productoEditar.stock;
  document.getElementById('stockCritico').value = productoEditar.stockCritico || '';
  document.getElementById('categoriaProducto').value = productoEditar.categoria;
  if(productoEditar.imagen) {
    document.getElementById('imagenPreview').src = '../assets/imagenes/' + productoEditar.imagen;
  }
}

// Manejar envío del formulario
formProducto.addEventListener('submit', function(e) {
  e.preventDefault();

  let productos = JSON.parse(localStorage.getItem('productos')) || [];
  const index = productos.findIndex(p => p.id === productoEditar.id);

  const productoActualizado = {
    id: document.getElementById('idProducto').value,
    nombre: document.getElementById('nombreProducto').value,
    descripcion: document.getElementById('descripcionProducto').value,
    precio: parseFloat(document.getElementById('precioProducto').value),
    stock: parseInt(document.getElementById('stockProducto').value),
    stockCritico: document.getElementById('stockCritico').value ? parseInt(document.getElementById('stockCritico').value) : null,
    categoria: document.getElementById('categoriaProducto').value,
    imagen: document.getElementById('imagenProducto').files[0] ? document.getElementById('imagenProducto').files[0].name : productoEditar.imagen
  };

  productos[index] = productoActualizado;
  localStorage.setItem('productos', JSON.stringify(productos));

  alert('Producto actualizado correctamente');
  window.location.href = 'productos.html';
});
