document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tablaProductos');
  const filterStock = document.getElementById('filterStock');

  // Listado de productos inicial
  let productos = JSON.parse(localStorage.getItem('productos')) || [
    {codigo:'JM001', categoria:'Juegos de Mesa', nombre:'Catan', precio:29990, stock:'Disponible', imagen:'catan.jpg'},
    {codigo:'JM002', categoria:'Juegos de Mesa', nombre:'Carcassonne', precio:24990, stock:'Disponible', imagen:'carcassonne.jpg'},
    {codigo:'AC001', categoria:'Accesorios', nombre:'Controlador Inalámbrico Xbox Series X', precio:59990, stock:'Disponible', imagen:'controlador_xbox.jpg'},
    {codigo:'AC002', categoria:'Accesorios', nombre:'Auriculares Gamer HyperX Cloud II', precio:79990, stock:'Disponible', imagen:'auriculares_hyperx.jpg'},
    {codigo:'CO001', categoria:'Consolas', nombre:'PlayStation 5', precio:549990, stock:'Agotado', imagen:'ps5.jpg'}
    // ... otros productos
  ];

  // Guardar productos iniciales si no existen
  if(!localStorage.getItem('productos')){
    localStorage.setItem('productos', JSON.stringify(productos));
  }

  function renderTabla(filtro = 'todos'){
    tabla.innerHTML = '';
    productos.forEach(p => {
      if(filtro !== 'todos' && p.stock.toLowerCase() !== filtro.toLowerCase()) return;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.codigo}</td>
        <td>${p.categoria}</td>
        <td>${p.nombre}</td>
        <td>$${p.precio.toLocaleString()} CLP</td>
        <td>${p.stock}</td>
        <td>
          <button class="btn-editar">Editar</button>
          <button class="btn-eliminar">Eliminar</button>
        </td>
      `;

      // Editar
      tr.querySelector('.btn-editar').addEventListener('click', () => {
        localStorage.setItem('productoEditar', JSON.stringify(p));
        window.location.href = 'editar_producto.html';
      });

      // Eliminar
      tr.querySelector('.btn-eliminar').addEventListener('click', () => {
        if(confirm('¿Desea eliminar este producto?')){
          productos = productos.filter(prod => prod.codigo !== p.codigo);
          localStorage.setItem('productos', JSON.stringify(productos));
          renderTabla(filterStock.value);
        }
      });

      tabla.appendChild(tr);
    });
  }

  renderTabla();

  filterStock.addEventListener('change', () => {
    renderTabla(filterStock.value);
  });
});
