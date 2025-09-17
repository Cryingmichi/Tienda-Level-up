// soporte.js

document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Mostrar nombre corto en navbar
  const userNameShort = document.getElementById("userNameShort");
  if (usuario && userNameShort) userNameShort.textContent = usuario.nombre;

  // Manejar formulario de soporte
  const formSoporte = document.getElementById('formSoporte');
  const respuesta = document.getElementById('respuesta');

  if (formSoporte) {
    formSoporte.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!usuario) {
        respuesta.textContent = "Debes iniciar sesión para enviar soporte.";
        return;
      }

      const nombre = usuario.nombre;
      const email = usuario.email;
      const tipo = document.getElementById('tipoMensaje').value;
      const asunto = document.getElementById('asunto').value.trim();
      const mensaje = document.getElementById('mensaje').value.trim();

      // Obtener objeto global de mensajes por usuario
      let mensajesGlobal = JSON.parse(localStorage.getItem('mensajesSoporte')) || {};
      if (!mensajesGlobal[email]) mensajesGlobal[email] = [];
      mensajesGlobal[email].push({ tipo, asunto, mensaje, fecha: new Date().toLocaleString() });

      localStorage.setItem('mensajesSoporte', JSON.stringify(mensajesGlobal));

      respuesta.textContent = "¡Tu mensaje ha sido enviado con éxito!";
      formSoporte.reset();

      // Refrescar la sección de incidencias si existe
      if (document.getElementById("incidenciasUsuario")) {
        renderIncidencias(usuario);
      }
    });
  }

  // Renderizar incidencias por usuario
  function renderIncidencias(usuario) {
    const incidenciasDiv = document.getElementById("incidenciasUsuario");
    if (!incidenciasDiv) return;

    const todasIncidencias = JSON.parse(localStorage.getItem("mensajesSoporte")) || {};
    const incidenciasUsuario = usuario ? todasIncidencias[usuario.email] || [] : [];

    incidenciasDiv.innerHTML = "";

    if (incidenciasUsuario.length === 0) {
      incidenciasDiv.innerHTML = "<p class='text-secondary'>No has enviado solicitudes de soporte.</p>";
      return;
    }

    incidenciasUsuario.forEach((i, index) => {
      const li = document.createElement("li");
      li.className = "list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-start";
      li.innerHTML = `
        <div>
          <strong>${i.tipo.toUpperCase()} - ${i.asunto}</strong> – <span class="text-secondary">${i.fecha}</span><br>
          ${i.mensaje}
        </div>
        <button class="btn btn-sm btn-outline-danger" data-index="${index}">Eliminar</button>
      `;
      incidenciasDiv.appendChild(li);

      // Botón eliminar incidencia
      li.querySelector("button").addEventListener("click", () => {
        incidenciasUsuario.splice(index, 1);
        todasIncidencias[usuario.email] = incidenciasUsuario;
        localStorage.setItem("mensajesSoporte", JSON.stringify(todasIncidencias));
        renderIncidencias(usuario);
      });
    });
  }

  // Renderizar automáticamente si estamos en perfil
  if (document.getElementById("incidenciasUsuario") && usuario) {
    renderIncidencias(usuario);
  }
});
