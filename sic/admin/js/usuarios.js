document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.querySelector('#tablaUsuarios');
  const btnCrear = document.getElementById('btnCrear');
  const filterSelect = document.getElementById('filter');

  // Redirigir al formulario de nuevo usuario
  btnCrear.addEventListener('click', () => {
    window.location.href = 'nuevo_user.html';
  });

  // Cargar usuarios desde localStorage
  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  // Función para renderizar la tabla según el filtro
  function renderTabla(filtro = 'todos') {
    tabla.innerHTML = "";

    let usuariosFiltrados = usuarios;
    if (filtro !== 'todos') {
      usuariosFiltrados = usuarios.filter(u => u.estado === filtro);
    }

    usuariosFiltrados.forEach(usuario => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.run}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.apellido}</td>
        <td>${usuario.correo}</td>
        <td>${usuario.fechaNacimiento || '-'}</td>
        <td>${usuario.tipoUsuario}</td>
        <td>${usuario.region}</td>
        <td>${usuario.comuna}</td>
        <td>${usuario.direccion}</td>
        <td>${usuario.telefono}</td>
        <td>
          <button class="btn-estado ${usuario.estado}">${usuario.estado.charAt(0).toUpperCase() + usuario.estado.slice(1)}</button>
        </td>
        <td>
          <button class="btn-editar">Editar</button>
          <button class="btn-eliminar">Eliminar</button>
          <button class="btn-bloquear">${usuario.estado === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}</button>
        </td>
      `;

      // Botón editar
      tr.querySelector('.btn-editar').addEventListener('click', () => {
        localStorage.setItem('usuarioEditar', JSON.stringify(usuario));
        window.location.href = 'editar_user.html';
      });

      // Botón eliminar
      tr.querySelector('.btn-eliminar').addEventListener('click', () => {
        if (confirm('¿Seguro que deseas eliminar este usuario?')) {
          usuarios = usuarios.filter(u => u.id !== usuario.id);
          localStorage.setItem('usuarios', JSON.stringify(usuarios));
          renderTabla(filterSelect.value);
        }
      });

      // Botón bloquear / desbloquear
      tr.querySelector('.btn-bloquear').addEventListener('click', () => {
        if (usuario.estado === 'bloqueado') {
          usuario.estado = 'activo';
        } else {
          usuario.estado = 'bloqueado';
        }
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        renderTabla(filterSelect.value);
      });

      tabla.appendChild(tr);
    });
  }

  // Escuchar cambios en el filtro
  filterSelect.addEventListener('change', () => {
    renderTabla(filterSelect.value);
  });

  // Render inicial
  renderTabla();
});
