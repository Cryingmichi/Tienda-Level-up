// --- REGISTRO ---
const formRegistro = document.getElementById("formRegistro");
if (formRegistro) {
  formRegistro.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("regNombre").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const fecha = document.getElementById("regFecha").value;

    // Verificar edad
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;

    if (edad < 18) {
      alert("Debes ser mayor de 18 años para registrarte.");
      return;
    }

    // Obtener lista de usuarios existentes
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Verificar si ya existe
    if (usuarios.some(u => u.email === email)) {
      alert("Este correo ya está registrado.");
      return;
    }

    const nuevoUsuario = { nombre, email, password, esDuoc: email.endsWith("@duoc.cl") };
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Registro exitoso. Ahora puedes iniciar sesión.");
    bootstrap.Modal.getInstance(document.getElementById("modalRegistro")).hide();
  });
}

// --- LOGIN ---
const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (usuario) {
      // Guardar usuario activo (sesión)
      localStorage.setItem("usuario", JSON.stringify(usuario));
      alert(`Bienvenido, ${usuario.nombre}`);
      window.location.href = "../../index.html"; // home
    } else {
      alert("Correo o contraseña incorrectos.");
    }
  });
}
