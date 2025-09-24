// --- CLAVE FIJA PARA ENCRIPTACIÓN ---
const claveSecreta = "miClaveFijaParaAES";

// --- CREAR USUARIOS PREDEFINIDOS SI NO EXISTEN ---
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
if(usuarios.length === 0){
  const usuariosIniciales = [
    {
      nombre: "Admin",
      apellido: "Sistema",
      rut: CryptoJS.AES.encrypt("12345678K", claveSecreta).toString(),
      email: "admin@levelup.cl",
      fecha: "1990-01-01",
      region: "Metropolitana",
      comuna: "Santiago",
      telefono: "123456789",
      password: CryptoJS.AES.encrypt("admin123", claveSecreta).toString(),
      esDuoc: false,
      rol: "admin"
    },
    {
      nombre: "Usuario",
      apellido: "Normal",
      rut: CryptoJS.AES.encrypt("87654321K", claveSecreta).toString(),
      email: "usuario@levelup.cl",
      fecha: "1995-05-10",
      region: "Metropolitana",
      comuna: "Providencia",
      telefono: "987654321",
      password: CryptoJS.AES.encrypt("user123", claveSecreta).toString(),
      esDuoc: false,
      rol: "usuario"
    }
  ];

  usuarios = usuariosIniciales;
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// --- CARGAR REGIONES DESDE JSON ---
fetch("data/regiones.json")
  .then(res => res.json())
  .then(data => {
    const selectRegion = document.getElementById("regRegion");
    const selectComuna = document.getElementById("regComuna");

    data.forEach(r => {
      const option = document.createElement("option");
      option.value = r.region;
      option.textContent = r.region;
      selectRegion.appendChild(option);
    });

    selectRegion.addEventListener("change", () => {
      const regionSeleccionada = selectRegion.value;
      selectComuna.innerHTML = '<option disabled selected>Selecciona Comuna</option>';
      const regionObj = data.find(r => r.region === regionSeleccionada);
      if(regionObj) {
        regionObj.comunas.forEach(c => {
          const option = document.createElement("option");
          option.value = c;
          option.textContent = c;
          selectComuna.appendChild(option);
        });
      }

      if(selectRegion.value !== "Selecciona Región" && selectRegion.value !== ""){
        selectRegion.setCustomValidity("");
        selectRegion.classList.remove("is-invalid");
        selectRegion.classList.add("is-valid");
      }
      if(selectComuna.value !== "Selecciona Comuna" && selectComuna.value !== ""){
        selectComuna.setCustomValidity("");
        selectComuna.classList.remove("is-invalid");
        selectComuna.classList.add("is-valid");
      } else {
        selectComuna.classList.remove("is-valid");
      }
    });

    selectComuna.addEventListener("change", () => {
      if(selectComuna.value !== "Selecciona Comuna" && selectComuna.value !== ""){
        selectComuna.setCustomValidity("");
        selectComuna.classList.remove("is-invalid");
        selectComuna.classList.add("is-valid");
      }
    });

    selectRegion.addEventListener("blur", () => {
      if(selectRegion.value !== "Selecciona Región" && selectRegion.value !== ""){
        selectRegion.setCustomValidity("");
        selectRegion.classList.remove("is-invalid");
        selectRegion.classList.add("is-valid");
      }
    });
  });

// --- REGISTRO ---
const formRegistro = document.getElementById("formRegistro");
if (formRegistro) {
  formRegistro.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();

    formRegistro.classList.add("was-validated");

    const selectRegion = document.getElementById("regRegion");
    const selectComuna = document.getElementById("regComuna");
    if (selectRegion.value === "Selecciona Región" || selectRegion.value === "") {
      selectRegion.setCustomValidity("Debes seleccionar una región.");
      selectRegion.classList.add("is-invalid");
    } else {
      selectRegion.setCustomValidity("");
      selectRegion.classList.remove("is-invalid");
      selectRegion.classList.add("is-valid");
    }
    if (selectComuna.value === "Selecciona Comuna" || selectComuna.value === "") {
      selectComuna.setCustomValidity("Debes seleccionar una comuna.");
      selectComuna.classList.add("is-invalid");
    } else {
      selectComuna.setCustomValidity("");
      selectComuna.classList.remove("is-invalid");
      selectComuna.classList.add("is-valid");
    }

    if (!formRegistro.checkValidity()) return;

    const nombre = document.getElementById("regNombre").value.trim();
    const apellido = document.getElementById("regApellido").value.trim();
    const rutInput = document.getElementById("regRut");
    const rut = rutInput.value.trim();
    const emailInput = document.getElementById("regEmail");
    const email = emailInput.value.trim();
    const password = document.getElementById("regPassword").value;
    const fecha = document.getElementById("regFecha")?.value;
    const region = selectRegion.value;
    const comuna = selectComuna.value;
    const telefono = document.getElementById("regTelefono").value;

    // --- Validación RUT ---
    const rutRegex = /^[0-9]{8}[0-9Kk]$/;
    if(!rutRegex.test(rut)){
      rutInput.setCustomValidity("Debes ingresar un RUT válido de 9 caracteres.");
      formRegistro.classList.add("was-validated");
      return;
    } else {
      rutInput.setCustomValidity("");
    }

    // --- Validación de correo ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
      emailInput.setCustomValidity("⚠️ Ingresa un correo válido.");
      formRegistro.classList.add("was-validated");
      return;
    } else {
      emailInput.setCustomValidity("");
    }

    // --- Validación de edad ---
    if(fecha){
      const nacimiento = new Date(fecha);
      const hoy = new Date();
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
      if (edad < 18) {
        document.getElementById("regFecha").setCustomValidity("Debes ser mayor de 18 años.");
        formRegistro.classList.add("was-validated");
        return;
      } else {
        document.getElementById("regFecha").setCustomValidity("");
      }
    }

    usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    if (usuarios.some(u => u.email === email)) {
      emailInput.setCustomValidity("Este correo ya está registrado.");
      formRegistro.classList.add("was-validated");
      return;
    } else {
      emailInput.setCustomValidity("");
    }

    // --- Encriptar datos sensibles ---
    const rutEncriptado = CryptoJS.AES.encrypt(rut, claveSecreta).toString();
    const passwordEncriptada = CryptoJS.AES.encrypt(password, claveSecreta).toString();

    const nuevoUsuario = {
      nombre,
      apellido,
      rut: rutEncriptado,
      email,
      fecha,
      region,
      comuna,
      telefono,
      password: passwordEncriptada,
      esDuoc: email.endsWith("@duoc.cl"),
      rol: "usuario"
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    const alerta = document.createElement("div");
    alerta.className = "alert alert-success mt-3";
    alerta.textContent = "Registro exitoso. Ahora puedes iniciar sesión.";
    formRegistro.prepend(alerta);

    setTimeout(() => {
      const modalRegistroEl = document.getElementById("modalRegistro");
      const modalRegistroInstance = bootstrap.Modal.getInstance(modalRegistroEl);
      modalRegistroInstance.hide();

      alerta.remove();
      formRegistro.reset();
      formRegistro.classList.remove("was-validated");

      const modalLoginEl = document.getElementById("modalLogin");
      const modalLoginInstance = new bootstrap.Modal(modalLoginEl);
      modalLoginInstance.show();
    }, 2000);
  });
}

// --- VALIDACIÓN EN TIEMPO REAL DE EDAD ---
const inputFecha = document.getElementById("regFecha");
if (inputFecha) {
  inputFecha.addEventListener("input", () => {
    const fecha = inputFecha.value;
    if (!fecha) {
      inputFecha.setCustomValidity("Debes ingresar tu fecha de nacimiento.");
      inputFecha.classList.add("is-invalid");
      inputFecha.classList.remove("is-valid");
      return;
    }

    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;

    if (edad < 18) {
      inputFecha.setCustomValidity("Debes ser mayor de 18 años.");
      inputFecha.classList.add("is-invalid");
      inputFecha.classList.remove("is-valid");
    } else {
      inputFecha.setCustomValidity("");
      inputFecha.classList.remove("is-invalid");
      inputFecha.classList.add("is-valid");
    }
  });
}

// --- LOGIN ---
const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();

    formLogin.classList.add("was-validated");
    if (!formLogin.checkValidity()) return;

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.email === email);

    const alertaLoginExistente = document.querySelector("#formLogin .alert");
    if (alertaLoginExistente) alertaLoginExistente.remove();

    if(usuario){
      try {
        const bytesPass = CryptoJS.AES.decrypt(usuario.password, claveSecreta);
        const passwordDec = bytesPass.toString(CryptoJS.enc.Utf8);

        if(passwordDec === password){
          const bytesRut = CryptoJS.AES.decrypt(usuario.rut, claveSecreta);
          const rutDec = bytesRut.toString(CryptoJS.enc.Utf8);
          const usuarioSesion = {...usuario, rut: rutDec};

          localStorage.setItem("usuario", JSON.stringify(usuarioSesion));
          const alerta = document.createElement("div");
          alerta.className = "alert alert-success mt-2";
          alerta.textContent = `Bienvenido, ${usuario.nombre}`;
          formLogin.prepend(alerta);

          setTimeout(() => {
            if(usuarioSesion.rol === "admin"){
              window.location.href = "/sic/admin/index_admin.html";
            } else {
              window.location.href = "../../index.html";
            }
          }, 1500);
        } else {
          const alerta = document.createElement("div");
          alerta.className = "alert alert-danger mt-2";
          alerta.textContent = "Correo o contraseña incorrectos.";
          formLogin.prepend(alerta);
        }
      } catch (error) {
        const alerta = document.createElement("div");
        alerta.className = "alert alert-danger mt-2";
        alerta.textContent = "Correo o contraseña incorrectos.";
        formLogin.prepend(alerta);
      }
    } else {
      const alerta = document.createElement("div");
      alerta.className = "alert alert-danger mt-2";
      alerta.textContent = "Correo o contraseña incorrectos.";
      formLogin.prepend(alerta);
    }
  });
}
