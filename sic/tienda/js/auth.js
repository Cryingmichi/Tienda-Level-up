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

      // Validar región y comuna automáticamente al cambiar región
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

    // Validación inmediata al seleccionar comuna
    selectComuna.addEventListener("change", () => {
      if(selectComuna.value !== "Selecciona Comuna" && selectComuna.value !== ""){
        selectComuna.setCustomValidity("");
        selectComuna.classList.remove("is-invalid");
        selectComuna.classList.add("is-valid");
      }
    });

    // Validación inmediata al salir del campo región
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

    // --- Validación manual de Región y Comuna ---
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
    const rut = document.getElementById("regRut").value.trim();
    const emailInput = document.getElementById("regEmail");
    const email = emailInput.value.trim();
    const password = document.getElementById("regPassword").value;
    const fecha = document.getElementById("regFecha")?.value;
    const region = selectRegion.value;
    const comuna = selectComuna.value;
    const telefono = document.getElementById("regTelefono").value;

    // --- Validación RUT de 9 caracteres ---
    const rutRegex = /^[0-9]{8}[0-9Kk]$/;
    if(!rutRegex.test(rut)){
      document.getElementById("regRut").setCustomValidity("Debes ingresar un RUT válido de 9 caracteres.");
      formRegistro.classList.add("was-validated");
      return;
    } else {
      document.getElementById("regRut").setCustomValidity("");
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

    // Verificar edad si se incluyó fecha
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

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    if (usuarios.some(u => u.email === email)) {
      emailInput.setCustomValidity("Este correo ya está registrado.");
      formRegistro.classList.add("was-validated");
      return;
    } else {
      emailInput.setCustomValidity("");
    }

    // Encriptar contraseña con la misma como clave
    const passwordEncriptada = CryptoJS.AES.encrypt(password, password).toString();

    const nuevoUsuario = {
      nombre,
      apellido,
      rut,
      email,
      fecha,
      region,
      comuna,
      telefono,
      password: passwordEncriptada,
      esDuoc: email.endsWith("@duoc.cl")
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    const alerta = document.createElement("div");
    alerta.className = "alert alert-success mt-3";
    alerta.textContent = "Registro exitoso. Ahora puedes iniciar sesión.";
    formRegistro.prepend(alerta);

    setTimeout(() => {
      // Cerrar modal de registro
      const modalRegistroEl = document.getElementById("modalRegistro");
      const modalRegistroInstance = bootstrap.Modal.getInstance(modalRegistroEl);
      modalRegistroInstance.hide();

      alerta.remove();
      formRegistro.reset();
      formRegistro.classList.remove("was-validated");

      // Abrir modal de login automáticamente
      const modalLoginEl = document.getElementById("modalLogin");
      const modalLoginInstance = new bootstrap.Modal(modalLoginEl);
      modalLoginInstance.show();
    }, 2000);
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

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.email === email);

    const alertaLoginExistente = document.querySelector("#formLogin .alert");
    if (alertaLoginExistente) alertaLoginExistente.remove();

    if(usuario){
      try {
        const bytes = CryptoJS.AES.decrypt(usuario.password, password);
        const passwordDec = bytes.toString(CryptoJS.enc.Utf8);
        if(passwordDec === password){
          localStorage.setItem("usuario", JSON.stringify(usuario));
          const alerta = document.createElement("div");
          alerta.className = "alert alert-success mt-2";
          alerta.textContent = `Bienvenido, ${usuario.nombre}`;
          formLogin.prepend(alerta);
          setTimeout(() => window.location.href = "../../index.html", 1500);
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