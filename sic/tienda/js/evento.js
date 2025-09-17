// Inicializar el mapa
const mapa = L.map('map').setView([-33.45, -70.65], 12);

// Capa base OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(mapa);

// Datos de los eventos
const eventos = [
  { titulo: 'Evento Gaming Centro', coordenadas: [-33.4489, -70.6693], lugar: 'Centro de Convenciones Santiago' },
  { titulo: 'Torneo LevelUp', coordenadas: [-33.4378, -70.6505], lugar: 'Arena eSports Santiago' },
  { titulo: 'Meet & Greet Gamers', coordenadas: [-33.4561, -70.6391], lugar: 'Parque Bicentenario' }
];

// Crear marcadores y guardarlos por título
const marcadores = {};
eventos.forEach(evento => {
  const marcador = L.marker(evento.coordenadas).addTo(mapa)
    .bindPopup(`<strong>${evento.titulo}</strong><br>${evento.lugar}`);
  marcadores[evento.titulo] = marcador;
});

// Seleccionar contenedor de tarjetas
const contenedorCards = document.querySelector('.row.g-3.mb-4');

// Asignar coordenadas a cada tarjeta
const tarjetas = contenedorCards.querySelectorAll('.card');
tarjetas.forEach((tarjeta, indice) => {
  const evento = eventos[indice];
  tarjeta.classList.add('evento-card');
  tarjeta.dataset.lat = evento.coordenadas[0];
  tarjeta.dataset.lng = evento.coordenadas[1];

  tarjeta.addEventListener('click', () => {
    const lat = parseFloat(tarjeta.dataset.lat);
    const lng = parseFloat(tarjeta.dataset.lng);

    // Centrar mapa en la ubicación del evento
    mapa.setView([lat, lng], 15);

    // Abrir popup del marcador correspondiente
    Object.values(marcadores).forEach(marcador => {
      const posicion = marcador.getLatLng();
      if (posicion.lat === lat && posicion.lng === lng) {
        marcador.openPopup();
      }
    });
  });
});