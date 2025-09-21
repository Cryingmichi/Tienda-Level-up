  // Datos sucursales
  const sucursales = [
    { 
      nombre: 'Sucursal Las Condes', 
      direccion: 'Av. Apoquindo 1234, Las Condes, Santiago, Chile', 
      fotos: ['img/SucursalCondes.png','img/SucursalCondes2.png'], 
      coords: [-33.4037, -70.5730] 
    },
    { 
      nombre: 'Sucursal Mall Costanera', 
      direccion: 'Av. Andrés Bello 2425, Santiago, Chile', 
      fotos: ['img/SucursalMall.png','img/SucursalMall2.png'], 
      coords: [-33.4170, -70.6066] 
    }
  ];

  let currentIndexSucursal = 0;
  let currentImgIndex = 0;
  const fotoElem = document.getElementById('sucursalFoto');
  const direccionElem = document.getElementById('sucursalDireccion');

  // Inicializar mapa
  const mapaSuc = L.map('mapaSucursales').setView(sucursales[0].coords, 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(mapaSuc);

  // Marcadores
  const marcadoresSuc = sucursales.map(s => L.marker(s.coords).addTo(mapaSuc).bindPopup(`<strong>${s.nombre}</strong><br>${s.direccion}`));

  // Función para actualizar sucursal
  function actualizarSucursal(index){
    currentIndexSucursal = index;
    currentImgIndex = 0;
    fotoElem.style.opacity = 0;
    setTimeout(()=> {
      fotoElem.src = sucursales[index].fotos[currentImgIndex];
      fotoElem.style.opacity = 1;
    }, 300);
    direccionElem.textContent = sucursales[index].direccion;
    mapaSuc.setView(sucursales[index].coords, 15);
    marcadoresSuc[index].openPopup();
  }

  // Slider automático
  setInterval(() => {
    currentImgIndex = (currentImgIndex + 1) % sucursales[currentIndexSucursal].fotos.length;
    fotoElem.style.opacity = 0;
    setTimeout(()=> {
      fotoElem.src = sucursales[currentIndexSucursal].fotos[currentImgIndex];
      fotoElem.style.opacity = 1;
    }, 300);
  }, 10000);

  // Botones manuales
  document.getElementById('prevImg').addEventListener('click', ()=>{
    currentImgIndex = (currentImgIndex - 1 + sucursales[currentIndexSucursal].fotos.length) % sucursales[currentIndexSucursal].fotos.length;
    fotoElem.style.opacity = 0;
    setTimeout(()=> { fotoElem.src = sucursales[currentIndexSucursal].fotos[currentImgIndex]; fotoElem.style.opacity=1; },300);
  });
  document.getElementById('nextImg').addEventListener('click', ()=>{
    currentImgIndex = (currentImgIndex + 1) % sucursales[currentIndexSucursal].fotos.length;
    fotoElem.style.opacity = 0;
    setTimeout(()=> { fotoElem.src = sucursales[currentIndexSucursal].fotos[currentImgIndex]; fotoElem.style.opacity=1; },300);
  });

  // Inicializar primera sucursal
  actualizarSucursal(0);