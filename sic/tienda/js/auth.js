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

    // Guardar usuario en localStorage
    const usuario = { nombre, email, password, esDuoc: email.endsWith("@duoc.cl") };
    localStorage.setItem("usuario", JSON.stringify(usuario));

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

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (usuario && usuario.email === email && usuario.password === password) {
      // Guardar usuario activo antes de redirigir
      localStorage.setItem("usuario", JSON.stringify(usuario));
      alert(`Bienvenido, ${usuario.nombre}`);
      window.location.href = "/sic/index.html"; // Cambiar por tu home real
    } else {
      alert("Correo o contraseña incorrectos.");
    }
  });
}
