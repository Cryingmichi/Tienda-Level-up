//GENERAR CÓDIGOS DE 10000 PUNTOS
(function generarCodigosIniciales() {
  // Revisar si ya existen códigos guardados
  const codigosGuardados = JSON.parse(localStorage.getItem("codigosPuntos")) || {};

  // Si ya existen códigos activos, no generar nuevos
  if (Object.keys(codigosGuardados).length > 0) {
    console.log("Ya existen códigos activos:", codigosGuardados);
    return;
  }

  const codigosNuevos = [];
  for (let i = 0; i < 3; i++) {
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    codigosNuevos.push(codigo);
    codigosGuardados[codigo] = 10000; // cada código vale 10000 puntos
  }

  // Guardar en localStorage
  localStorage.setItem("codigosPuntos", JSON.stringify(codigosGuardados));

  console.log("Códigos generados (cada uno vale 10.000 puntos):", codigosNuevos);
})();
