// --- VARIABLES GLOBALES ---
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let usuario = null; // Se inicializa en DOMContentLoaded
let productos = [];

// --- FUNCIONES ---
// Actualiza contador del carrito
const actualizarContadorCarrito = () => {
  document.getElementById("cartCount").textContent = carrito.length;
};

// Actualiza navbar con usuario
const actualizarNavbarUsuario = () => {
  const userNameSpan = document.getElementById("userNameShort");
  const menu = document.querySelectorAll("#nav .dropdown-item");

  if (usuario && userNameSpan) {
    userNameSpan.textContent = usuario.nombre;

    // Mostrar perfil y logout, ocultar ingresar/registrar
    menu.forEach(item => {
      if (item.textContent.includes("Ingresar") || item.textContent.includes("Registrar")) {
        item.style.display = "none";
      }
      if (item.id === "btnLogout") {
        item.style.display = "block";
        item.addEventListener("click", () => {
          localStorage.removeItem("usuario");
          location.reload();
        });
      }
    });
  } else {
    // Usuario no activo: mostrar ingresar/registrar, ocultar logout
    menu.forEach(item => {
      if (item.textContent.includes("Ingresar") || item.textContent.includes("Registrar")) {
        item.style.display = "block";
      }
      if (item.id === "btnLogout") {
        item.style.display = "none";
      }
    });
    if (userNameSpan) userNameSpan.textContent = "Invitado";
  }
};

// Renderiza productos
const renderizarProductos = (filtro = { q: "", cat: "Todas", min: 0, max: Infinity }) => {
  const contenedor = document.getElementById("products");
  if(!contenedor) return;
  contenedor.innerHTML = "";

  let filtrados = productos.filter(p => {
    const matchQ = p.nombre.toLowerCase().includes(filtro.q.toLowerCase());
    const matchCat = filtro.cat === "Todas" || p.categoria === filtro.cat;
    const matchPrecio = p.precio >= filtro.min && p.precio <= filtro.max;
    return matchQ && matchCat && matchPrecio;
  });

  filtrados.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-md-4";

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-img-container">
          <img src="${p.imagen}" alt="${p.nombre}">
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.nombre}</h5>
          <p class="card-text text-secondary">${p.categoria}</p>
          <p class="price">$${p.precio.toLocaleString()}</p>
          <div class="rating mb-2">${"★".repeat(Math.floor(p.rating))}</div>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-accent flex-grow-1" onclick="agregarAlCarrito('${p.id}')">
              <i class="bi bi-cart3 me-1"></i>Agregar
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

// Agregar producto al carrito
const agregarAlCarrito = (id) => {
  const producto = productos.find(p => p.id === id);
  if (producto) {
    carrito.push(producto);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
    alert(`${producto.nombre} agregado al carrito`);
  }
};

// Buscador avanzado
const btnAbrirBuscador = document.getElementById("btnAbrirBuscador");
const contenedorBuscador = document.getElementById("buscador");

if(btnAbrirBuscador && contenedorBuscador){
  btnAbrirBuscador.addEventListener("click", () => {
    contenedorBuscador.classList.toggle("buscador-abierto");
    contenedorBuscador.classList.toggle("buscador-cerrado");
  });
}

// Inicializar filtros
const inicializarFiltros = () => {
  const btnFilter = document.getElementById("btnFilter");
  const btnClear = document.getElementById("btnClear");

  if(btnFilter && btnClear){
    btnFilter.addEventListener("click", () => {
      const q = document.getElementById("q").value;
      const cat = document.getElementById("cat").value;
      const min = Number(document.getElementById("minPrice").value) || 0;
      const max = Number(document.getElementById("maxPrice").value) || Infinity;
      renderizarProductos({q, cat, min, max});
    });

    btnClear.addEventListener("click", () => {
      document.getElementById("q").value = "";
      document.getElementById("minPrice").value = "";
      document.getElementById("maxPrice").value = "";
      renderizarProductos();
    });
  }
};

// Inicialización principal
const boot = async () => {
  try {
    const resp = await fetch("data/productos.json");
    const data = await resp.json();

    productos = data.productos;
    const categorias = ["Todas", ...data.categorias];

    // Inicializar UI
    actualizarContadorCarrito();
    renderizarProductos();

    // Rellenar select de categorías
    const catSelect = document.getElementById("cat");
    if(catSelect){
      categorias.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        catSelect.appendChild(opt);
      });
    }

    // Inicializar filtros
    inicializarFiltros();

    // Año en footer
    const yearEl = document.getElementById("year");
    if(yearEl) yearEl.textContent = new Date().getFullYear();

  } catch (error) {
    console.error("Error cargando productos:", error);
    const contenedor = document.getElementById("products");
    if(contenedor) contenedor.innerHTML = "<p class='text-danger'>No se pudieron cargar los productos.</p>";
  }
};

// Ejecutar boot y actualizar navbar después de DOM cargado
document.addEventListener("DOMContentLoaded", () => {
  usuario = JSON.parse(localStorage.getItem("usuario")) || null;
  actualizarNavbarUsuario();
  boot();
});
