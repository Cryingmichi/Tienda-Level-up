    // Compartir
    function share(titulo, url) {
      const datos = {
        titulo,
        texto: "Mira este video en Level-Up Gamer: " + titulo,
        url: url
      };

      // Soporte Web Share API (móvil)
      if (navigator.share) {
        navigator.share(datos).catch(err => console.log(err));
        return;
      }

      // Llenar modal
      document.getElementById('modalTitulo').textContent = datos.titulo;
      document.getElementById('linkWhatsApp').href = `https://wa.me/?text=${encodeURIComponent(datos.texto)}`;
      document.getElementById('linkTwitter').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(datos.texto)}`;
      document.getElementById('linkFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(datos.url)}&quote=${encodeURIComponent(datos.texto)}`;

      // Mostrar modal
      const modalEl = document.getElementById('modalCompartir');
      const modal = new bootstrap.Modal(modalEl);
      modal.show();

      // Copiar link
      const btnCopiar = document.getElementById('btnCopiar');
      btnCopiar.onclick = async () => {
        try {
          await navigator.clipboard.writeText(`${datos.titulo} - ${datos.url}`);
          btnCopiar.innerHTML = '<i class="bi bi-check2 me-2"></i> Copiado';
          setTimeout(() => {
            btnCopiar.innerHTML = '<i class="bi bi-clipboard me-2"></i> Copiar enlace';
          }, 1500);
        } catch {
          alert("No se pudo copiar. Copia manualmente:\n" + `${datos.titulo} - ${datos.url}`);
        }
      };

      // Cerrar modal al hacer click fuera
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) modal.hide();
      });
    }

    // Detener videos al cerrar modal
    const modales = [
      {modalId:'videoModal1', iframeId:'iframe1'},
      {modalId:'videoModal2', iframeId:'iframe2'},
      {modalId:'videoModal3', iframeId:'iframe3'}
    ];

    modales.forEach(item => {
      const modalEl = document.getElementById(item.modalId);
      const iframe = document.getElementById(item.iframeId);
      modalEl.addEventListener('hidden.bs.modal', () => {
        const src = iframe.src;
        iframe.src = '';
        iframe.src = src;
      });
    });

    // Año footer
    document.getElementById('year').textContent = new Date().getFullYear();