// REGIONES Y COMUNAS
const regiones = [
  { nombre: "Región de Arica y Parinacota", comunas: ["Arica","Camarones","Putre","General Lagos"] },
  { nombre: "Región de Tarapacá", comunas: ["Iquique","Alto Hospicio","Pozo Almonte","Pica"] },
  { nombre: "Región de Antofagasta", comunas: ["Antofagasta","Mejillones","Sierra Gorda","Taltal","Calama","San Pedro de Atacama","Tocopilla"] },
  { nombre: "Región de Atacama", comunas: ["Copiapó","Caldera","Tierra Amarilla","Vallenar","Freirina","Chañaral","Diego de Almagro"] },
  { nombre: "Región de Coquimbo", comunas: ["La Serena","Coquimbo","Andacollo","Ovalle","Illapel","Los Vilos","Salamanca","Combarbalá","Monte Patria","Punitaqui","Río Hurtado"] },
  { nombre: "Región de Valparaíso", comunas: ["Valparaíso","Viña del Mar","Quilpué","Villa Alemana","Concón","Quintero","Puchuncaví","Casablanca","San Antonio","Cartagena","El Tabo","El Quisco","Santo Domingo","Algarrobo","Rinconada de Los Andes","San Felipe","Los Andes","Santa María","Putaendo","Panquehue","Llay Llay","Catemu","Calle Larga","Rinconada","Cabildo","La Ligua","Petorca","Zapallar","Papudo"] },
  { nombre: "Región Metropolitana de Santiago", comunas: ["Santiago","Cerrillos","Cerro Navia","Conchalí","El Bosque","Estación Central","Huechuraba","Independencia","La Cisterna","La Florida","La Granja","La Pintana","La Reina","Las Condes","Lo Barnechea","Lo Espejo","Lo Prado","Macul","Maipú","Pedro Aguirre Cerda","Peñalolén","Providencia","Pudahuel","Quilicura","Quinta Normal","Recoleta","Renca","San Joaquín","San Miguel","San Ramón","Vitacura","Puente Alto","Pirque","San José de Maipo","Colina","Lampa","Tiltil","San Bernardo","Buin","Calera de Tango","Paine","Melipilla","Alhué","Curacaví","María Pinto","San Pedro"] },
  { nombre: "Región del Libertador General Bernardo O'Higgins", comunas: ["Rancagua","Machalí","Graneros","Codegua","Doñihue","Coinco","Coltauco","Requínoa","Mostazal","Olivar","San Vicente","Peumo","Pichidegua","Las Cabras","La Estrella","Litueche","La Junta","Navidad","Paredones","San Fernando","Chimbarongo","Nancagua","Placilla","Pumanque","Santa Cruz","Lolol","Palmilla","Peralillo","Marchihue","Litueche"] },
  { nombre: "Región del Maule", comunas: ["Talca","Pelarco","Pencahue","Maule","San Clemente","Curicó","Hualañé","Licantén","Vichuquén","Linares","San Javier","Villa Alegre","Yerbas Buenas","Colbún","Longaví","Parral","Retiro","San Rafael","Rio Claro","Teno","Cauquenes","Chanco","Pelluhue"] },
  { nombre: "Región de Ñuble", comunas: ["Chillán","Chillán Viejo","Bulnes","San Carlos","El Carmen","Pemuco","Pinto","Quillón","San Ignacio","Coihueco","Ñiquén","San Fabián","San Nicolás"] },
  { nombre: "Región del Biobío", comunas: ["Concepción","Coronel","Chiguayante","Florida","Hualpén","Hualqui","Lota","Penco","San Pedro de la Paz","Santa Juana","Talcahuano","Tomé","Hualqui","Cabrero","Lebu","Arauco","Curanilahue","Los Ángeles","Antuco","Cabrero","Laja","Mulchén","Nacimiento","Negrete","Quilaco","Quilleco","San Rosendo","Santa Bárbara","Tucapel","Yumbel"] },
  { nombre: "Región de La Araucanía", comunas: ["Temuco","Carahue","Cunco","Curarrehue","Freire","Galvarino","Gorbea","Lautaro","Loncoche","Melipeuco","Nueva Imperial","Padre Las Casas","Perquenco","Pitrufquén","Pucón","Saavedra","Teodoro Schmidt","Toltén","Vilcún","Villarrica"] },
  { nombre: "Región de Los Ríos", comunas: ["Valdivia","Corral","Lanco","Los Lagos","Máfil","Mariquina","Paillaco","Panguipulli","La Unión","Futrono","Lago Ranco","Río Bueno"] },
  { nombre: "Región de Los Lagos", comunas: ["Puerto Montt","Calbuco","Cochamó","Fresia","Frutillar","Llanquihue","Los Muermos","Maullín","Puerto Varas","Castro","Ancud","Chonchi","Curaco de Vélez","Dalcahue","Puqueldón","Queilén","Quellón","Quemchi","Quinchao","Osorno","Puerto Octay","Puyehue","Río Negro","San Juan de la Costa","San Pablo"] },
  { nombre: "Región de Aysén", comunas: ["Coyhaique","Lago Verde","Chile Chico","Río Ibáñez","Aysén","Cisnes","Guaitecas","Puerto Aysén","Puerto Chacabuco","Puerto Cisnes"] },
  { nombre: "Región de Magallanes y de la Antártica Chilena", comunas: ["Punta Arenas","Laguna Blanca","Río Verde","San Gregorio","Porvenir","Primavera","Timaukel","Torres del Paine","Cabo de Hornos","Antártica","Puerto Natales","Puerto Toro"] }
];

const regionSelect = document.getElementById('regionUsuario');
const comunaSelect = document.getElementById('comunaUsuario');

// Llenar select de regiones
regiones.forEach(r=>{
  const opt = document.createElement('option');
  opt.value = r.nombre;
  opt.textContent = r.nombre;
  regionSelect.appendChild(opt);
});

// Actualizar comunas al cambiar región
regionSelect.addEventListener('change', ()=>{
  const sel = regiones.find(r=>r.nombre===regionSelect.value);
  comunaSelect.innerHTML = '';
  sel.comunas.forEach(c=>{
    const opt = document.createElement('option');
    opt.value=c;
    opt.textContent=c;
    comunaSelect.appendChild(opt);
  });
});

// GUARDAR NUEVO USUARIO
document.getElementById('formNuevoUsuario').addEventListener('submit', e=>{
  e.preventDefault();

  const run = document.getElementById('runUsuario').value.toUpperCase();
  const nombre = document.getElementById('nombreUsuario').value;
  const apellido = document.getElementById('apellidoUsuario').value;
  const correo = document.getElementById('correoUsuario').value;
  const fechaNacimiento = document.getElementById('fechaNacimiento').value;
  const tipoUsuario = document.getElementById('tipoUsuario').value;
  const region = regionSelect.value;
  const comuna = comunaSelect.value;
  const direccion = document.getElementById('direccionUsuario').value;
  const telefono = document.getElementById('telefonoUsuario').value;

  // Validar RUN
  const runRegex = /^[0-9]{7,8}[0-9Kk]$/;
  if(!runRegex.test(run)){
    alert('RUN inválido. Debe ser sin puntos ni guion, ej: 19011022K');
    return;
  }

  // Validar correo
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/;
  if(!emailRegex.test(correo)){
    alert('Correo no válido. Solo se permiten @duoc.cl, @profesor.duoc.cl o @gmail.com');
    return;
  }

  // Guardar usuario en localStorage
  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  // Generar ID
  const maxId = usuarios.reduce((max,u)=> Math.max(max, parseInt(u.id.replace(/\D/g,''))), 0);
  const idUsuario = 'U' + String(maxId+1).padStart(3,'0');

  const usuario = {
    id: idUsuario,
    run,
    nombre,
    apellido,
    correo,
    fechaNacimiento,
    tipoUsuario,
    region,
    comuna,
    direccion,
    telefono,
    estado: 'activo'
  };

  usuarios.push(usuario);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  alert('Usuario creado correctamente');

  window.location.href = 'usuarios.html';
});
