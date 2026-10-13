/* ============================================
   PÁGINA DE NOTICIA COMPLETA
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Año en el footer
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();

  // Obtener ID desde la URL (ej: noticia.html?id=n1)
  const params = new URLSearchParams(window.location.search);
  const noticiaId = params.get('id');
  const noticia = DB.getNoticiaPorId(noticiaId);

  if (!noticia) {
    document.getElementById('noticiaTitulo').textContent = 'Noticia no encontrada';
    document.getElementById('noticiaContenido').innerHTML =
      '<p>Lo sentimos, la noticia que buscas no existe o fue eliminada.</p>' +
      '<a href="index.html#noticias" class="btn btn--primario">Volver al inicio</a>';
    document.getElementById('noticiaImagen').style.display = 'none';
    document.getElementById('noticiaCategoria').style.display = 'none';
    return;
  }

  // Formatear fecha
  const fechaFormato = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  // Actualizar título de la pestaña
  document.title = `${noticia.titulo} - Colegio Bolivariano`;

  // Miga de pan
  const miga = document.getElementById('migaTitulo');
  if (miga) miga.textContent = noticia.titulo;

  // Categoría
  document.getElementById('noticiaCategoria').textContent = noticia.categoria || 'General';

  // Título
  document.getElementById('noticiaTitulo').textContent = noticia.titulo;

  // Meta (fecha + autor)
  document.getElementById('noticiaMeta').innerHTML = `
    <span>📅 ${fechaFormato(noticia.fecha)}</span>
    <span>✍️ ${noticia.autor || 'Colegio Bolivariano'}</span>
  `;

  // Imagen
  const img = document.getElementById('noticiaImagen');
  img.src = noticia.imagen || '';
  img.alt = noticia.titulo;

  // Contenido completo
  // Si tiene 'contenido', lo mostramos; si no, usamos el resumen.
  const contenido = noticia.contenido || noticia.resumen || 'Sin contenido disponible.';
  document.getElementById('noticiaContenido').innerHTML =
    contenido.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');

  // Otras noticias (excluyendo la actual)
  renderizarOtrasNoticias(noticia.id);
});

function renderizarOtrasNoticias(idActual) {
  const contenedor = document.getElementById('otrasNoticias');
  const otras = DB.getNoticias().filter(n => n.id !== idActual).slice(0, 4);

  if (!otras.length) {
    contenedor.innerHTML = '<p style="color:var(--gris-texto);font-size:.9rem;">No hay más noticias.</p>';
    return;
  }

  const fechaCorta = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  contenedor.innerHTML = otras.map(n => `
    <a href="noticia.html?id=${n.id}" class="noticia-mini">
      <div class="noticia-mini__imagen">
        <img src="${n.imagen}" alt="${n.titulo}"
             onerror="this.src='https://via.placeholder.com/200x150/003366/FFFFFF?text=Noticia'" />
      </div>
      <div class="noticia-mini__cuerpo">
        <span class="noticia-mini__fecha">📅 ${fechaCorta(n.fecha)}</span>
        <h4>${n.titulo}</h4>
      </div>
    </a>
  `).join('');
}

/* Compartir noticia (usa la API nativa del navegador si está disponible) */
window.compartirNoticia = function() {
  const url = window.location.href;
  const titulo = document.getElementById('noticiaTitulo').textContent;

  if (navigator.share) {
    navigator.share({ title: titulo, url }).catch(() => {});
  } else {
    // Fallback: copiar al portapapeles
    navigator.clipboard.writeText(url).then(() => {
      alert('✅ Enlace copiado al portapapeles');
    }).catch(() => {
      prompt('Copia este enlace:', url);
    });
  }
};