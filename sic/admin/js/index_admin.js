// 1️ Seleccionamos los elementos del DOM que vamos a usar
const bell = document.querySelector('.notification-bell'); // Selecciona el ícono de la campana
const box = document.querySelector('.notification-box');   // Selecciona el recuadro de notificaciones

// 2️ Agregamos un "evento de clic" a la campana para mostrar u ocultar el recuadro
bell.addEventListener('click', () => {
    // Si el recuadro está visible (display === 'block') se oculta, si está oculto se muestra
    box.style.display = box.style.display === 'block' ? 'none' : 'block';
});

// 3️ Agregamos un evento al documento completo para cerrar el recuadro al hacer clic fuera
document.addEventListener('click', (e) => {
    // e.target es el elemento en el que hicimos clic
    // .contains verifica si el elemento clickeado está dentro de la campana o del recuadro
    if (!bell.contains(e.target) && !box.contains(e.target)) {
        box.style.display = 'none'; // Si clickeamos fuera, ocultamos el recuadro
    }
});