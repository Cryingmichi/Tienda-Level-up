document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Inicializar puntos si no existen
  if (usuario && usuario.lvlPoints === undefined) {
    usuario.lvlPoints = 0;
    localStorage.setItem("usuario", JSON.stringify(usuario));

    // También actualizar en usuariosRegistrados
    let usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
    const index = usuariosRegistrados.findIndex(u => u.email === usuario.email);
    if (index >= 0) {
      usuariosRegistrados[index].lvlPoints = 0;
      localStorage.setItem("usuariosRegistrados", JSON.stringify(usuariosRegistrados));
    }
  }

  // Mostrar datos del usuario
  if (usuario) {
    actualizarHeaderUsuario(usuario); // badge naranja
  } else {
    document.getElementById("userName").textContent = "Bienvenido, Invitado";
    document.getElementById("userEmail").textContent = "";
  }

  // Renderizar compras del usuario
  renderCompras(usuario);

  // Renderizar reseñas del usuario
  renderMisReseñasPerfil(usuario);

  // Renderizar incidencias del usuario
  renderIncidencias(usuario);

  // Agregar sección Gamificación y Referidos
  if (usuario) inicializarGamificacion(usuario);
});

// -------------------- FUNCIONES DE HEADER --------------------
function actualizarHeaderUsuario(usuario) {
  const userNameElem = document.getElementById("userName");
  const puntosBadge = `<span class="badge bg-warning text-dark ms-2">${usuario.lvlPoints || 0} pts</span>`;
  if (userNameElem) userNameElem.innerHTML = `Bienvenido, ${usuario.nombre}${puntosBadge}`;

  const userEmailElem = document.getElementById("userEmail");
  if (userEmailElem) userEmailElem.textContent = usuario.email;

  const userNameShort = document.getElementById("userNameShort");
  if (userNameShort) userNameShort.textContent = usuario.nombre;
}

// -------------------- FUNCIONES DE COMPRAS --------------------
function renderCompras(usuario) {
  const productosDiv = document.getElementById("productosComprados");
  const comprasUsuarios = JSON.parse(localStorage.getItem("comprasUsuarios")) || {};
  const compras = usuario ? comprasUsuarios[usuario.email] || [] : [];

  productosDiv.innerHTML = "";

  if (compras.length === 0) {
    productosDiv.innerHTML = "<p class='text-secondary'>No has comprado productos aún.</p>";
    return;
  }

  compras.forEach((compra, index) => {
    const compraCard = document.createElement("div");
    compraCard.className = "col-12 mb-3";

    let itemsHtml = "";
    compra.items.forEach(item => {
      let precioHtml = "";
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

      itemsHtml += `
        <div class="d-flex align-items-center border-bottom py-2">
          <img src="${item.imagen}" class="me-2 rounded" style="width:70px;height:70px;object-fit:cover;">
          <div>
            <strong>${item.nombre}</strong><br>
            <small class="text-secondary">${item.categoria}</small><br>
            Precio: ${precioHtml} · Cantidad: ${item.cantidad}
          </div>
        </div>
      `;
    });

    compraCard.innerHTML = `
      <div class="card bg-dark text-light border-secondary">
        <div class="card-header">
          <strong>Compra #${index + 1}</strong> – ${compra.fecha}
        </div>
        <div class="card-body">
          ${itemsHtml}
          <div class="mt-2 fw-bold text-end">Total: $${compra.total.toLocaleString()}</div>
        </div>
      </div>
    `;
    productosDiv.appendChild(compraCard);
  });
}

// -------------------- FUNCIONES DE RESEÑAS --------------------
function renderMisReseñasPerfil(usuario) {
  if (!usuario) return;
  const contenedor = document.getElementById("misReseñas");
  if (!contenedor) return;

  const todasReseñas = JSON.parse(localStorage.getItem("reseñas")) || {};
  const usuarioEmail = usuario.email;
  let reseñasUsuario = [];

  Object.entries(todasReseñas).forEach(([productoId, reseñasArray]) => {
    reseñasArray.forEach((r, index) => {
      if (r.email === usuarioEmail) {
        const nombreMostrar = r.nombreUsuario || usuario.nombre || r.email;
        reseñasUsuario.push({ ...r, productoId, index, nombreUsuario: nombreMostrar });
      }
    });
  });

  reseñasUsuario.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  contenedor.innerHTML = "";

  if (reseñasUsuario.length === 0) {
    contenedor.innerHTML = "<p class='text-secondary'>No has enviado reseñas aún.</p>";
    return;
  }

  reseñasUsuario.forEach(r => {
    const producto = window.productos?.find(p => p.id === r.productoId);
    const nombreProducto = producto ? producto.nombre : r.productoId;
    const imagenProducto = producto ? producto.imagen : "";
    const fechaFormateada = new Date(r.fecha).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const div = document.createElement("div");
    div.className = "list-group-item bg-dark text-light mb-3 rounded d-flex align-items-start gap-3";

    div.innerHTML = `
      <img src="${imagenProducto}" alt="${nombreProducto}" class="rounded" style="width:60px;height:60px;object-fit:cover;">
      <div class="flex-grow-1">
        <div class="d-flex justify-content-between align-items-center">
          <strong>${nombreProducto} – ${r.nombreUsuario}</strong>
          <small class="text-secondary">${fechaFormateada}</small>
        </div>
        <div class="text-warning">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
        <p class="mb-1">${r.texto}</p>
        <button class="btn btn-sm btn-outline-danger" data-producto="${r.productoId}" data-index="${r.index}">Eliminar reseña</button>
      </div>
    `;
    contenedor.appendChild(div);
  });

  contenedor.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const prodId = btn.dataset.producto;
      const idx = parseInt(btn.dataset.index);

      if (todasReseñas[prodId]) {
        todasReseñas[prodId].splice(idx, 1);
        localStorage.setItem("reseñas", JSON.stringify(todasReseñas));
      }

      if (window.productoDetalle && window.productoDetalle.id === prodId) {
        window.reseñas.splice(idx, 1);
        window.renderReseñas?.();
      }

      renderMisReseñasPerfil(usuario);
    });
  });
}

// -------------------- FUNCIONES DE INCIDENCIAS --------------------
function renderIncidencias(usuario) {
  const incidenciasDiv = document.getElementById("incidenciasUsuario");
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

    li.querySelector("button").addEventListener("click", () => {
      incidenciasUsuario.splice(index, 1);
      todasIncidencias[usuario.email] = incidenciasUsuario;
      localStorage.setItem("mensajesSoporte", JSON.stringify(todasIncidencias));
      renderIncidencias(usuario);
    });
  });
}

// -------------------- FORMULARIO SOPORTE --------------------
const formSoporte = document.getElementById('formSoporte');
const respuesta = document.getElementById('respuesta');

if (formSoporte) {
  formSoporte.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const tipo = document.getElementById('tipoMensaje').value;
    const asunto = document.getElementById('asunto').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    let almacen = JSON.parse(localStorage.getItem('mensajesSoporte')) || {};
    if (!almacen[email]) almacen[email] = [];
    almacen[email].push({ tipo, asunto, mensaje, fecha: new Date().toLocaleString() });
    localStorage.setItem('mensajesSoporte', JSON.stringify(almacen));

    respuesta.textContent = "¡Tu mensaje ha sido enviado con éxito!";
    formSoporte.reset();

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario) renderIncidencias(usuario);
  });
}

// -------------------- GAMIFICACIÓN Y CÓDIGOS --------------------
function inicializarGamificacion(usuario) {
  const input = document.getElementById("inputCodigo");
  const btnCanjear = document.getElementById("btnCanjearCodigo");
  const mensaje = document.getElementById("mensajeCodigo");

  // Lista de códigos disponibles globalmente
  const codigosGlobales = {
    "CODIGO1": 10000,
    "CODIGO2": 10000,
    "CODIGO3": 10000
  };

  // Crear registro de códigos usados por usuario si no existe
  let codigosPorUsuario = JSON.parse(localStorage.getItem("codigosPorUsuario")) || {};
  if (!codigosPorUsuario[usuario.email]) codigosPorUsuario[usuario.email] = {};

  btnCanjear?.addEventListener("click", () => {
    const codigoIngresado = input.value.trim().toUpperCase();
    if (!codigoIngresado) return;

    // Verificar que el código exista y que el usuario no lo haya usado
    if (codigosGlobales[codigoIngresado] && !codigosPorUsuario[usuario.email][codigoIngresado]) {
      const puntosGanados = codigosGlobales[codigoIngresado];

      // Sumar puntos al usuario
      usuario.lvlPoints = (usuario.lvlPoints || 0) + puntosGanados;
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Marcar código como usado por este usuario
      codigosPorUsuario[usuario.email][codigoIngresado] = true;
      localStorage.setItem("codigosPorUsuario", JSON.stringify(codigosPorUsuario));

      mensaje.textContent = `¡Código canjeado! Has ganado ${puntosGanados} puntos.`;
      mensaje.classList.remove("text-danger");
      mensaje.classList.add("text-success");
      input.value = "";

      actualizarHeaderUsuario(usuario); // actualizar badge de puntos en header
    } else {
      mensaje.textContent = "Código inválido o ya usado.";
      mensaje.classList.remove("text-success");
      mensaje.classList.add("text-danger");
    }
  });
  
  
}
