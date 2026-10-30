/* ============================================
   PÁGINA DE NOTICIA COMPLETA
   ============================================ */

// js/noticia.js
import { DB } from './db.js';

document.addEventListener('DOMContentLoaded', async () => {
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();

  const params = new URLSearchParams(window.location.search);
  const noticiaId = params.get('id');

  if (!noticiaId) {
    mostrarNoEncontrada();
    return;
  }

  let noticia = null;
  try {
    noticia = await DB.getNoticiaPorId(noticiaId);
  } catch (e) {
    console.error('Error cargando noticia:', e);
  }

  if (!noticia) {
    mostrarNoEncontrada();
    return;
  }

  const fechaFormato = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  document.title = `${noticia.titulo} - Colegio Bolivariano`;

  const miga = document.getElementById('migaTitulo');
  if (miga) miga.textContent = noticia.titulo;

  document.getElementById('noticiaCategoria').textContent = noticia.categoria || 'General';
  document.getElementById('noticiaTitulo').textContent = noticia.titulo;

  document.getElementById('noticiaMeta').innerHTML = `
    <span>📅 ${fechaFormato(noticia.fecha)}</span>
    <span>✍️ ${noticia.autor || 'Colegio Bolivariano'}</span>
  `;

  const img = document.getElementById('noticiaImagen');
  img.src = noticia.imagen || '';
  img.alt = noticia.titulo;

  const contenido = noticia.contenido || noticia.resumen || 'Sin contenido disponible.';
  document.getElementById('noticiaContenido').innerHTML =
    contenido.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');

  await renderizarOtrasNoticias(noticia.id);
});

function mostrarNoEncontrada() {
  document.getElementById('noticiaTitulo').textContent = 'Noticia no encontrada';
  document.getElementById('noticiaContenido').innerHTML =
    '<p>Lo sentimos, la noticia que buscas no existe o fue eliminada.</p>' +
    '<a href="index.html#noticias" class="btn btn--primario">Volver al inicio</a>';
  const img = document.getElementById('noticiaImagen');
  if (img) img.style.display = 'none';
  const cat = document.getElementById('noticiaCategoria');
  if (cat) cat.style.display = 'none';
}

async function renderizarOtrasNoticias(idActual) {
  const contenedor = document.getElementById('otrasNoticias');
  if (!contenedor) return;

  let otras = [];
  try {
    const todas = await DB.getNoticias();
    otras = todas.filter(n => n.id !== idActual).slice(0, 4);
  } catch (e) {
    console.error(e);
  }

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

window.compartirNoticia = function() {
  const url = window.location.href;
  const titulo = document.getElementById('noticiaTitulo').textContent;

  if (navigator.share) {
    navigator.share({ title: titulo, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      alert('✅ Enlace copiado al portapapeles');
    }).catch(() => {
      prompt('Copia este enlace:', url);
    });
  }
};