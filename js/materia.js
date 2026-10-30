/* ============================================
   PÁGINA DE MATERIA
   ============================================ */

   // js/materia.js
import { DB } from './db.js';
import { Auth } from './auth.js';
import { QuizUI } from './quiz.js';

// Exponer globalmente para los onclick="..." del HTML
window.QuizUI = QuizUI;

let materiaActualId = null;
let esProfesorActual = false;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  materiaActualId = params.get('id');

  if (!materiaActualId) {
    mostrarNoEncontrada();
    return;
  }

  let materia = null;
  try {
    materia = await DB.getMateriaPorId(materiaActualId);
  } catch (e) {
    console.error('Error cargando materia:', e);
  }

  if (!materia) {
    mostrarNoEncontrada();
    return;
  }

  const sesion = await Auth.obtenerSesion();
  esProfesorActual = sesion && (
    sesion.rol === 'admin' ||
    (sesion.rol === 'profesor' && materia.profesorId === sesion.id)
  );

  // Header
  document.title = `${materia.nombre} - Colegio Bolivariano`;
  document.getElementById('materiaNombre').textContent = `${materia.icono || ''} ${materia.nombre}`;
  document.getElementById('materiaDescripcion').textContent = materia.descripcion || '';

  // Nav login/logout
  if (sesion) {
    document.getElementById('navLogin').style.display = 'none';
    document.getElementById('navLogout').style.display = 'block';
  }

  // Tabs
  document.querySelectorAll('.materia-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.materia-tab').forEach(t => t.classList.remove('activo'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('activo'));
      tab.classList.add('activo');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('activo');
    });
  });

  // Render del contenido
  try {
    const contenido = await DB.getContenido(materiaActualId);
    await renderizarTodo(contenido);
  } catch (e) {
    console.error('Error cargando contenido:', e);
    document.getElementById('vistaContenido').innerHTML =
      '<p class="estado-vacio">Error al cargar el contenido. Revisa la consola.</p>';
  }
});

function mostrarNoEncontrada() {
  document.getElementById('materiaNombre').textContent = 'Materia no encontrada';
  document.getElementById('materiaDescripcion').textContent = 'Verifica el enlace.';
}

async function renderizarTodo(contenido) {
  /* ---- CONTENIDO ---- */
  const editorCont = document.getElementById('editorContenido');
  const vistaCont = document.getElementById('vistaContenido');

  if (esProfesorActual) {
    editorCont.innerHTML = `
      <div class="panel__card">
        <h3>✏️ Editar contenido</h3>
        <textarea id="txtContenido" class="form-control" style="min-height:150px;">${contenido.texto || ''}</textarea>
        <button class="btn btn--primario" style="margin-top:1rem;" onclick="guardarTexto()">Guardar contenido</button>
      </div>
    `;
  }
  vistaCont.innerHTML = contenido.texto
    ? `<div class="panel__card"><div style="white-space:pre-wrap;">${contenido.texto}</div></div>`
    : '<p class="estado-vacio"><div class="estado-vacio__icono">📄</div>Aún no hay contenido publicado.</p>';

  /* ---- EMBEDS ---- */
  renderEmbeds('videos', contenido.videos || [], 'video');
  renderEmbeds('actividades', contenido.actividades || [], 'actividad');
  renderEmbeds('libros', contenido.libros || [], 'libro');

  /* ---- CUESTIONARIOS ---- */
  await QuizUI.init(materiaActualId, esProfesorActual);
}

function capitalizar(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function renderEmbeds(tipo, lista, tipoEmbed) {
  const editor = document.getElementById('editor' + capitalizar(tipo));
  const vista = document.getElementById('vista' + capitalizar(tipo));
  if (!editor || !vista) return;

  if (esProfesorActual) {
    editor.innerHTML = `
      <button class="btn btn--primario" style="margin-bottom:1rem;" onclick="abrirModalEmbed('${tipo}')">+ Agregar ${tipoEmbed}</button>
    `;
  }

  if (!lista.length) {
    vista.innerHTML = `<p class="estado-vacio" style="grid-column:1/-1;"><div class="estado-vacio__icono">📭</div>No hay ${tipo} disponibles.</p>`;
    return;
  }

  vista.innerHTML = lista.map((item, i) => `
    <div class="embed-item">
      <div class="embed-responsive">
        <iframe src="${item.url}" allowfullscreen loading="lazy"></iframe>
      </div>
      <div class="embed-item__titulo">
        ${item.titulo}
        ${item.tipo ? `<span class="embed-item__tipo">${item.tipo}</span>` : ''}
        ${esProfesorActual ? `<button class="btn btn--peligro btn--sm" style="float:right;" onclick="eliminarEmbed('${tipo}',${i})">×</button>` : ''}
      </div>
    </div>
  `).join('');
}

/* ---- FUNCIONES GLOBALES PARA LOS BOTONES ---- */

window.guardarTexto = async function() {
  const texto = document.getElementById('txtContenido').value;
  try {
    const contenido = await DB.getContenido(materiaActualId);
    contenido.texto = texto;
    await DB.guardarContenido(materiaActualId, contenido);
    alert('✅ Contenido guardado');
    location.reload();
  } catch (e) {
    alert('❌ Error al guardar: ' + e.message);
  }
};

window.abrirModalEmbed = function(tipo) {
  document.getElementById('embedTipo').value = tipo;
  document.getElementById('modalEmbedTitulo').textContent = 'Agregar ' + tipo;
  document.getElementById('formEmbed').reset();
  document.getElementById('modalEmbed').classList.add('activo');
};

window.cerrarModal = function(id) {
  document.getElementById(id).classList.remove('activo');
};

window.eliminarEmbed = async function(tipo, index) {
  if (!confirm('¿Eliminar este elemento?')) return;
  try {
    const contenido = await DB.getContenido(materiaActualId);
    contenido[tipo].splice(index, 1);
    await DB.guardarContenido(materiaActualId, contenido);
    location.reload();
  } catch (e) {
    alert('❌ Error al eliminar: ' + e.message);
  }
};

// Listener del formulario de embeds
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formEmbed');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tipo = document.getElementById('embedTipo').value;
    const titulo = document.getElementById('embedTitulo').value.trim();
    const url = document.getElementById('embedUrl').value.trim();
    if (!titulo || !url) return;

    try {
      const contenido = await DB.getContenido(materiaActualId);
      if (!contenido[tipo]) contenido[tipo] = [];
      contenido[tipo].push({
        titulo,
        url,
        tipo: tipo === 'actividades' ? 'Interactiva' : ''
      });
      await DB.guardarContenido(materiaActualId, contenido);
      window.cerrarModal('modalEmbed');
      location.reload();
    } catch (err) {
      alert('❌ Error al agregar: ' + err.message);
    }
  });
});