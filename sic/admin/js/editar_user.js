// Lista completa de regiones y comunas
const regiones = [
  { nombre: "Región de Arica y Parinacota", comunas: ["Arica","Camarones","Putre","General Lagos"] },
  { nombre: "Región de Tarapacá", comunas: ["Iquique","Alto Hospicio","Pozo Almonte","Pica"] },
  { nombre: "Región de Antofagasta", comunas: ["Antofagasta","Mejillones","Sierra Gorda","Taltal","Calama","San Pedro de Atacama","Tocopilla"] },
  { nombre: "Región de Atacama", comunas: ["Copiapó","Caldera","Tierra Amarilla","Vallenar","Freirina","Chañaral","Diego de Almagro"] },
  { nombre: "Región de Coquimbo", comunas: ["La Serena","Coquimbo","Andacollo","Ovalle","Illapel","Los Vilos","Salamanca","Combarbalá","Monte Patria","Punitaqui","Río Hurtado"] },
  { nombre: "Región de Valparaíso", comunas: ["Valparaíso","Viña del Mar","Quilpué","Villa Alemana","San Antonio","Concón","Quintero","Puchuncaví","Casablanca","El Quisco","El Tabo","Santo Domingo"] },
  { nombre: "Región Metropolitana de Santiago", comunas: ["Santiago","Maipú","Puente Alto","La Florida","Las Condes","La Reina","Ñuñoa","Providencia","Vitacura","Lo Barnechea","Macul","Peñalolén","San Joaquín","San Miguel","Pudahuel","Quilicura","Recoleta","Renca","Pedro Aguirre Cerda","La Granja","El Bosque","La Cisterna","Cerrillos","Conchalí","Lo Espejo","Huechuraba","Independencia","Lo Prado"] },
  { nombre: "Región del Libertador General Bernardo O'Higgins", comunas: ["Rancagua","San Fernando","Santa Cruz","Machalí","Graneros","Codegua","Doñihue","Coinco","Coltauco","Requínoa","Mostazal","Olivar","Peumo","Pichidegua","Las Cabras","La Estrella","Litueche","La Junta","Navidad","Paredones"] },
  { nombre: "Región del Maule", comunas: ["Talca","Pelarco","Pencahue","Maule","San Clemente","Curicó","Hualañé","Licantén","Vichuquén","Linares","San Javier","Villa Alegre","Yerbas Buenas","Colbún","Longaví","Parral","Retiro","San Rafael","Río Claro","Cauquenes","Chanco","Pelluhue"] },
  { nombre: "Región de Ñuble", comunas: ["Chillán","Chillán Viejo","Bulnes","San Carlos","El Carmen","Pemuco","Pinto","Quillón","San Ignacio","Coihueco","Ñiquén","San Fabián","San Nicolás"] },
  { nombre: "Región del Biobío", comunas: ["Concepción","Talcahuano","Los Ángeles","Cabrero","Lebu","Arauco","Curanilahue","Lota","Hualpén","Tome","Santa Juana","Hualqui","Antuco","Laja","Mulchén","Nacimiento","Negrete","Quilaco","Quilleco","San Rosendo","Santa Bárbara","Tucapel","Yumbel"] },
  { nombre: "Región de La Araucanía", comunas: ["Temuco","Carahue","Cunco","Curarrehue","Freire","Galvarino","Gorbea","Lautaro","Loncoche","Melipeuco","Nueva Imperial","Padre Las Casas","Perquenco","Pitrufquén","Pucón","Saavedra","Teodoro Schmidt","Toltén","Vilcún","Villarrica"] },
  { nombre: "Región de Los Ríos", comunas: ["Valdivia","Corral","Lanco","Los Lagos","Máfil","Mariquina","Paillaco","Panguipulli","La Unión"] },
  { nombre: "Región de Los Lagos", comunas: ["Puerto Montt","Osorno","Ancud","Castro","Puerto Varas","Quellón","Puerto Aysén","Puerto Cisnes"] },
  { nombre: "Región de Aysén", comunas: ["Coyhaique","Puerto Aysén","Chile Chico"] },
  { nombre: "Región de Magallanes", comunas: ["Punta Arenas","Puerto Natales","Puerto Toro","Porvenir","Puerto Williams","Cabo de Hornos"] }
];

const regionSelect = document.getElementById('regionUsuario');
const comunaSelect = document.getElementById('comunaUsuario');

// Llenar select de regiones
regiones.forEach(r => {
  const opt = document.createElement('option');
  opt.value = r.nombre;
  opt.textContent = r.nombre;
  regionSelect.appendChild(opt);
});

// Cambiar comunas según región
regionSelect.addEventListener('change', ()=>{
  const sel = regiones.find(r=>r.nombre===regionSelect.value);
  comunaSelect.innerHTML = '';
  sel.comunas.forEach(c=>{
    const opt = document.createElement('option');
    opt.value=c; opt.textContent=c;
    comunaSelect.appendChild(opt);
  });
});

// Cargar datos para editar
const usuarioEditar = JSON.parse(localStorage.getItem('usuarioEditar'));
if(usuarioEditar){
  document.getElementById('idUsuario').value = usuarioEditar.id;
  document.getElementById('runUsuario').value = usuarioEditar.run;
  document.getElementById('nombreUsuario').value = usuarioEditar.nombre;
  document.getElementById('apellidoUsuario').value = usuarioEditar.apellido;
  document.getElementById('correoUsuario').value = usuarioEditar.correo;
  document.getElementById('fechaNacimiento').value = usuarioEditar.fechaNacimiento;
  document.getElementById('tipoUsuario').value = usuarioEditar.tipoUsuario;
  regionSelect.value = usuarioEditar.region;

  // Llenar comunas
  const sel = regiones.find(r=>r.nombre===regionSelect.value);
  comunaSelect.innerHTML = '';
  sel.comunas.forEach(c=>{
    const opt = document.createElement('option');
    opt.value=c; opt.textContent=c;
    comunaSelect.appendChild(opt);
  });
  comunaSelect.value = usuarioEditar.comuna;
}

// Guardar cambios
document.getElementById('formUsuario').addEventListener('submit', e=>{
  e.preventDefault();

  // Validación correo
  const correo = document.getElementById('correoUsuario').value;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/;
  if(!emailRegex.test(correo)){
    alert("El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const usuario = {
    id: document.getElementById('idUsuario').value,
    run: document.getElementById('runUsuario').value,
    nombre: document.getElementById('nombreUsuario').value,
    apellido: document.getElementById('apellidoUsuario').value,
    correo: correo,
    fechaNacimiento: document.getElementById('fechaNacimiento').value,
    tipoUsuario: document.getElementById('tipoUsuario').value,
    region: regionSelect.value,
    comuna: comunaSelect.value,
    direccion: document.getElementById('direccionUsuario').value,
    telefono: document.getElementById('telefonoUsuario').value,
    estado: usuarioEditar.estado
  };

  usuarios = usuarios.map(u=> u.id===usuario.id ? usuario : u);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  localStorage.removeItem('usuarioEditar');

  alert('Usuario editado correctamente');
  window.location.href='usuarios.html';
});
