/* ============================================
   LÓGICA GENERAL DEL SITIO PÚBLICO
   ============================================ */

   // js/main.js
import { DB } from './db.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Año en el footer
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();

  // Renderizar noticias
  const grid = document.getElementById('gridNoticias');
  if (grid) await renderizarNoticias(grid);

  // Inicializar la sección "Sobre Nosotros" interactiva
  inicializarNosotros();
});

async function renderizarNoticias(contenedor) {
  let noticias = [];
  try {
    noticias = await DB.getNoticias(); // ✅ await
  } catch (e) {
    console.error('Error cargando noticias:', e);
    contenedor.innerHTML = '<p class="estado-vacio">No se pudieron cargar las noticias.</p>';
    return;
  }

  if (!noticias.length) {
    contenedor.innerHTML = '<p class="estado-vacio">Aún no hay noticias publicadas.</p>';
    return;
  }

  // La primera noticia se muestra como "destacada" (grande)
  const [destacada, ...resto] = noticias;

  const fechaFormato = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  contenedor.innerHTML = `
    <article class="noticia-destacada">
      <div class="noticia-destacada__imagen">
        <img src="${destacada.imagen}" alt="${destacada.titulo}"
             onerror="this.src='https://via.placeholder.com/800x500/003366/FFFFFF?text=Noticia'" />
        <span class="noticia__categoria">${destacada.categoria || 'General'}</span>
      </div>
      <div class="noticia-destacada__cuerpo">
        <div class="noticia__meta">
          <span>📅 ${fechaFormato(destacada.fecha)}</span>
          <span>✍️ ${destacada.autor || 'Colegio'}</span>
        </div>
        <h3>${destacada.titulo}</h3>
        <p>${destacada.resumen || ''}</p>
        <a href="noticia.html?id=${destacada.id}" class="btn btn--primario btn--sm">Leer más →</a>
      </div>
    </article>

    <div class="noticias-lista">
      ${resto.map(n => `
        <article class="noticia-card">
          <div class="noticia-card__imagen">
            <img src="${n.imagen}" alt="${n.titulo}"
                 onerror="this.src='https://via.placeholder.com/400x300/003366/FFFFFF?text=Noticia'" />
            <span class="noticia__categoria">${n.categoria || 'General'}</span>
          </div>
          <div class="noticia-card__cuerpo">
            <div class="noticia__meta">
              <span>📅 ${fechaFormato(n.fecha)}</span>
            </div>
            <h4>${n.titulo}</h4>
            <p>${n.resumen || ''}</p>
            <a href="noticia.html?id=${n.id}" class="noticia__link">Leer más →</a>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

/* ============================================
   SECCIÓN "SOBRE NOSOTROS" — Interactividad
   ============================================ */
function inicializarNosotros() {
  const tabs = document.querySelectorAll('.nosotros-tab');
  const paneles = document.querySelectorAll('.nosotros-panel');
  const wrapper = document.getElementById('nosotrosImgWrapper');
  const imagen = document.getElementById('nosotrosImagen');

  if (!tabs.length || !wrapper || !imagen) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      const nuevaImagen = tab.dataset.imagen;

      tabs.forEach(t => t.classList.remove('activo'));
      tab.classList.add('activo');

      paneles.forEach(p => p.classList.remove('activo'));
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('activo');

      const imagenActual = wrapper.dataset.imagenActual;
      if (nuevaImagen && imagenActual !== nuevaImagen) {
        wrapper.dataset.imagenActual = nuevaImagen;
        imagen.classList.add('fade-out');
        setTimeout(() => {
          imagen.src = nuevaImagen;
          imagen.classList.remove('fade-out');
        }, 250);
      }
    });
  });
}