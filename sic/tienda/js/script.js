// --- VARIABLES GLOBALES ---
window.productos = [];
window.usuario = null;

// --- TOAST GLOBAL ---
window.mostrarToast = (mensaje, tipo = "success", duracion = 3000) => {
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${tipo} border-0 show position-fixed top-0 end-0 m-3`;
  toast.role = "alert";
  toast.style.zIndex = 9999;
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), duracion);
};

// --- ACTUALIZAR NAVBAR ---
window.actualizarNavbarUsuario = () => {
  const userNameSpan = document.getElementById("userNameShort");
  const menu = document.querySelectorAll("#nav .dropdown-item");
  const btnUnete = document.querySelector(".hero .btn-outline-light");

  if (window.usuario && userNameSpan) {
    userNameSpan.textContent = window.usuario.nombre || "Invitado";

    // Mostrar/ocultar items según login
    menu.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes("ingresar") || text.includes("registrar")) {
        item.style.display = "none";
      }
      if (text.includes("perfil")) {
        item.style.display = "block";
        item.href = "/sic/tienda/perfil.html";
      }
      if (item.id === "btnLogout") {
        item.style.display = "block";
        item.addEventListener("click", () => {
          localStorage.removeItem("usuario");
          window.usuario = null;
          window.actualizarNavbarUsuario();
          window.mostrarToast("Sesión cerrada correctamente.", "success", 3000);
          window.location.href = "/index.html";
        });
      }
    });

    // --- AGREGAR LINK A PANEL ADMIN ---
    if(window.usuario.rol === "admin"){
      let adminItem = document.getElementById("btnAdminPanel");
      if(!adminItem){
        adminItem = document.createElement("li");
        adminItem.innerHTML = `<a class="dropdown-item" id="btnAdminPanel" href="/sic/admin/index_admin.html">Panel Admin</a>`;
        const dropdownMenu = document.querySelector("#nav .dropdown-menu");
        if(dropdownMenu) dropdownMenu.insertBefore(adminItem, dropdownMenu.firstChild);
      }
    }

    if (btnUnete) btnUnete.style.display = "none";
  } else {
    menu.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes("ingresar") || text.includes("registrar")) {
        item.style.display = "block";
        item.href = "/sic/tienda/acceso.html";
      }
      if (item.id === "btnLogout") item.style.display = "none";
      if (text.includes("perfil")) item.style.display = "none";
      if(item.id === "btnAdminPanel") item.remove(); // eliminar link admin si no es admin
    });
    if (userNameSpan) userNameSpan.textContent = "Invitado";
    if (btnUnete) btnUnete.style.display = "inline-block";
  }

  const loginContainer = document.getElementById("loginSimulado");
  if(loginContainer){
    loginContainer.style.display = window.usuario ? "none" : "block";
  }
};

// --- RENDERIZAR PRODUCTOS ---
window.renderizarProductos = (filtro = {q: "", cat: "Todas", min: 0, max: Infinity}) => {
  const contenedor = document.getElementById("products");
  if(!contenedor) return;
  contenedor.innerHTML = "";

  const filtrados = window.productos.filter(p => {
    const matchQ = p.nombre.toLowerCase().includes(filtro.q.toLowerCase());
    const matchCat = filtro.cat === "Todas" || p.categoria === filtro.cat;
    const matchPrecio = p.precio >= filtro.min && p.precio <= filtro.max;
    const stockActual = window.obtenerStock(p.id);
    return matchQ && matchCat && matchPrecio;
  });

  filtrados.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-md-4";

    let precioFinal = p.precio;
    let descuentoHtml = "";
    if(window.usuario?.esDuoc){
      precioFinal = p.precio * 0.8;
      descuentoHtml = `<p class="price text-danger">
        <span class="text-secondary text-decoration-line-through">$${p.precio.toLocaleString()}</span>
        $${precioFinal.toLocaleString()}
      </p>`;
    } else {
      descuentoHtml = `<p class="price">$${precioFinal.toLocaleString()}</p>`;
    }

    const stockActual = window.obtenerStock(p.id);
    const stockHtml = `<p class="stock mb-2 ${stockActual === 0 ? "text-danger" : "text-success"}">
      ${stockActual} unidad${stockActual !== 1 ? "es" : ""} disponible${stockActual !== 1 ? "s" : ""}
    </p>`;

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-img-container">
          <img src="${p.imagen}" alt="${p.nombre}">
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.nombre}</h5>
          <p class="card-text text-secondary">${p.categoria}</p>
          ${descuentoHtml}
          ${stockHtml}
          <div class="rating mb-2">${"★".repeat(Math.floor(p.rating))}</div>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-accent flex-grow-1" onclick="window.agregarAlCarrito('${p.id}',1)" ${stockActual===0?"disabled":""}>
              <i class="bi bi-cart3 me-1"></i>${stockActual===0?"Agotado":"Agregar"}
            </button>
            <a href="detallep.html?id=${p.id}" class="btn btn-outline-light flex-grow-1">
              <i class="bi bi-eye me-1"></i>Ver detalles
            </a>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(col);
  });
};

// --- ACTUALIZAR CONTADOR CARRITO ---
window.actualizarContadorCarrito = () => {
  const cartCountEl = document.getElementById("cartCount");
  if(cartCountEl){
    cartCountEl.textContent = (window.carrito || []).reduce((acc,i)=> acc + (i.cantidad||1),0);
  }
};

// --- INICIALIZAR FILTROS ---
const inicializarFiltros = () => {
  const btnFilter = document.getElementById("btnFilter");
  const btnClear = document.getElementById("btnClear");

  if(btnFilter && btnClear){
    btnFilter.addEventListener("click", ()=>{
      const q = document.getElementById("q").value;
      const cat = document.getElementById("cat").value;
      const min = Number(document.getElementById("minPrice").value)||0;
      const max = Number(document.getElementById("maxPrice").value)||Infinity;
      window.renderizarProductos({q,cat,min,max});
    });

    btnClear.addEventListener("click", ()=>{
      document.getElementById("q").value = "";
      document.getElementById("minPrice").value = "";
      document.getElementById("maxPrice").value = "";
      window.renderizarProductos();
    });
  }
};

// --- BUSCADOR AVANZADO ---
const inicializarBuscador = () => {
  const btnAbrirBuscador = document.getElementById("btnAbrirBuscador");
  const contenedorBuscador = document.getElementById("buscador");

  if(btnAbrirBuscador && contenedorBuscador){
    btnAbrirBuscador.addEventListener("click", ()=>{
      contenedorBuscador.classList.toggle("buscador-abierto");
      contenedorBuscador.classList.toggle("buscador-cerrado");
    });
  }
};

// --- BOOT PRINCIPAL ---
const boot = async () => {
  try{
    let data;
    if(localStorage.getItem("productos")){
      data = {productos: JSON.parse(localStorage.getItem("productos")), categorias: []};
      data.productos = data.productos.map(p=>({...p, stockActual: p.stockActual ?? p.stock ?? 10}));
    } else {
      const resp = await fetch("data/productos.json");
      data = await resp.json();
      data.productos = data.productos.map(p=>({...p, stockActual: p.stock ?? 10}));
    }

    window.productos = window.inicializarStock(data.productos);
    localStorage.setItem("productos", JSON.stringify(window.productos));

    window.actualizarContadorCarrito();
    window.renderizarProductos();
    inicializarFiltros();
    inicializarBuscador();

    const catSelect = document.getElementById("cat");
    if(catSelect){
      catSelect.innerHTML = "";
      const optTodas = document.createElement("option");
      optTodas.value = "Todas";
      optTodas.textContent = "Todas";
      catSelect.appendChild(optTodas);

      const categoriasUnicas = [...new Set(window.productos.map(p=>p.categoria))];
      categoriasUnicas.forEach(c=>{
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        catSelect.appendChild(opt);
      });
    }

    const yearEl = document.getElementById("year");
    if(yearEl) yearEl.textContent = new Date().getFullYear();

  } catch(error){
    console.error("Error cargando productos:",error);
    const contenedor = document.getElementById("products");
    if(contenedor) contenedor.innerHTML = "<p class='text-danger'>No se pudieron cargar los productos.</p>";
  }
};

// --- DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", ()=>{
  window.usuario = JSON.parse(localStorage.getItem("usuario")) || null;
  window.actualizarNavbarUsuario();
  boot();
});
