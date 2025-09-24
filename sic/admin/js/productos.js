document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tablaProductos');
  const filterStock = document.getElementById('filterStock');
  let productos = [];

  async function cargarProductos() {
    if (localStorage.getItem('productos')) {
      productos = JSON.parse(localStorage.getItem('productos')).map(p => ({
        ...p,
        stock: Number(p.stock)
      }));
      renderTabla();
    } else {
      try {
        const response = await fetch('productos.json'); //aqui error
        if (!response.ok) throw new Error('Error al cargar productos.json');
        const data = await response.json();
        productos = data.productos.map(p => ({
          ...p,
          stock: Number(p.stock)
        }));
        localStorage.setItem('productos', JSON.stringify(productos));
        renderTabla();
      } catch (error) {
        console.error('No se pudieron cargar los productos:', error);
      }
    }
  }

  function renderTabla(filtro = 'todos') {
    tabla.innerHTML = '';

    if (!productos || productos.length === 0) {
      tabla.innerHTML = `<tr><td colspan="6">No hay productos disponibles</td></tr>`;
      return;
    }

    productos.forEach(p => {
      // Filtrar stock
      if (filtro === 'disponible' && p.stock <= 0) return;
      if (filtro === 'agotado' && p.stock > 0) return;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.categoria}</td>
        <td>${p.nombre}</td>
        <td>$${p.precio.toLocaleString()} CLP</td>
        <td>${p.stock > 0 ? p.stock : 'Agotado'}</td>
        <td>
          <button class="btn-editar">Editar</button>
          <button class="btn-eliminar">Eliminar</button>
        </td>
      `;

      tr.querySelector('.btn-editar').addEventListener('click', () => {
        localStorage.setItem('productoEditar', JSON.stringify(p));
        window.location.href = 'editar_producto.html';
      });

      tr.querySelector('.btn-eliminar').addEventListener('click', () => {
        if (confirm('¿Desea eliminar este producto?')) {
          productos = productos.filter(prod => prod.id !== p.id);
          localStorage.setItem('productos', JSON.stringify(productos));
          renderTabla(filterStock.value);
        }
      });

      tabla.appendChild(tr);
    });
  }

  filterStock.addEventListener('change', () => {
    renderTabla(filterStock.value);
  });

  cargarProductos();
});
