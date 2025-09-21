document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Mostrar datos del usuario
  if (usuario) {
    document.getElementById("userName").textContent = `Bienvenido, ${usuario.nombre}`;
    document.getElementById("userEmail").textContent = usuario.email;

    const userNameShort = document.getElementById("userNameShort");
    if (userNameShort) userNameShort.textContent = usuario.nombre;
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

// Funciones de compra
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

// Funciones de reseña
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
        // 👇 Asegurar que siempre exista un nombre para mostrar
        const nombreMostrar = r.nombreUsuario || usuario.nombre || r.email;

        reseñasUsuario.push({
          ...r,
          productoId,
          index,
          nombreUsuario: nombreMostrar
        });
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
    const producto = window.productos.find(p => p.id === r.productoId);
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

// Funciones incidencias
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

// Formulario Soporte
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

//Gamificación
function inicializarGamificacion(usuario) {
  let gamificacionDiv = document.getElementById("gamificacionPerfil");
  if (!gamificacionDiv) {
    gamificacionDiv = document.createElement("div");
    gamificacionDiv.className = "profile-section";
    gamificacionDiv.innerHTML = `
      <h4>Gamificación y Referidos</h4>
      <p>Puntos acumulados: <span id="puntosUser">0</span></p>
      <p>Nivel: <span id="nivelUser">Bronce</span></p>
      <p>Código de referido: <span id="codigoRef"></span></p>
    `;
    document.querySelector("section.container").appendChild(gamificacionDiv);
  }
  actualizarGamificacion(usuario);
}

function sumarPuntosPorCompra(usuarioEmail, monto) {
  const usuariosPuntos = JSON.parse(localStorage.getItem("usuariosPuntos")) || {};
  const puntosAGanar = Math.floor(monto / 100);
  usuariosPuntos[usuarioEmail] = (usuariosPuntos[usuarioEmail] || 0) + puntosAGanar;
  localStorage.setItem("usuariosPuntos", JSON.stringify(usuariosPuntos));
}

function calcularNivel(puntos) {
  if (puntos >= 500) return "Oro";
  if (puntos >= 200) return "Plata";
  return "Bronce";
}

function actualizarGamificacion(usuario) {
  const usuariosPuntos = JSON.parse(localStorage.getItem("usuariosPuntos")) || {};
  const puntos = usuariosPuntos[usuario.email] || 0;

  document.getElementById("puntosUser").textContent = puntos;
  document.getElementById("nivelUser").textContent = calcularNivel(puntos);

  let codigo = usuario.codigoReferido || usuario.email.slice(0,3).toUpperCase() + Math.floor(Math.random()*1000);
  usuario.codigoReferido = codigo;
  localStorage.setItem("usuario", JSON.stringify(usuario));
  document.getElementById("codigoRef").textContent = codigo;
} 