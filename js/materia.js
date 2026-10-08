/* ============================================
   PÁGINA DE MATERIA
   ============================================ */

   document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const materiaId = params.get('id');
    const materia = DB.getMateriaPorId(materiaId);
  
    if (!materia) {
      document.getElementById('materiaNombre').textContent = 'Materia no encontrada';
      document.getElementById('materiaDescripcion').textContent = 'Verifica el enlace.';
      return;
    }
  
    const sesion = Auth.sesion();
    const esProfesorDeEstaMateria = sesion && (sesion.rol === 'admin' || (sesion.rol === 'profesor' && materia.profesorId === sesion.id));
  
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
  
    // Render contenido
    const contenido = DB.getContenido(materiaId);
    renderizarTodo(materiaId, contenido, esProfesorDeEstaMateria);
  });
  
  function renderizarTodo(materiaId, contenido, esProfesor) {
    /* ---- CONTENIDO ---- */
    const editorCont = document.getElementById('editorContenido');
    const vistaCont = document.getElementById('vistaContenido');
  
    if (esProfesor) {
      editorCont.innerHTML = `
        <div class="panel__card">
          <h3>✏️ Editar contenido</h3>
          <textarea id="txtContenido" class="form-control" style="min-height:150px;">${contenido.texto || ''}</textarea>
          <button class="btn btn--primario" style="margin-top:1rem;" onclick="guardarTexto('${materiaId}')">Guardar contenido</button>
        </div>
      `;
    }
    vistaCont.innerHTML = contenido.texto
      ? `<div class="panel__card"><div style="white-space:pre-wrap;">${contenido.texto}</div></div>`
      : '<p class="estado-vacio"><div class="estado-vacio__icono">📄</div>Aún no hay contenido publicado.</p>';
  
    /* ---- VIDEOS ---- */
    renderEmbeds('videos', materiaId, contenido.videos || [], esProfesor, 'video');
    /* ---- ACTIVIDADES ---- */
    renderEmbeds('actividades', materiaId, contenido.actividades || [], esProfesor, 'actividad');
    /* ---- LIBROS ---- */
    renderEmbeds('libros', materiaId, contenido.libros || [], esProfesor, 'libro');
  
    /* ---- CUESTIONARIOS ---- */
    if (window.QuizUI) QuizUI.init(materiaId, esProfesor);
  }
  
  /* Guardar texto del contenido */
  window.guardarTexto = function(materiaId) {
    const contenido = DB.getContenido(materiaId);
    contenido.texto = document.getElementById('txtContenido').value;
    DB.guardarContenido(materiaId, contenido);
    alert('✅ Contenido guardado');
    location.reload();
  };
  
  /* Renderiza videos, actividades o libros */
  function renderEmbeds(tipo, materiaId, lista, esProfesor, tipoEmbed) {
    const editor = document.getElementById('editor' + capitalizar(tipo));
    const vista = document.getElementById('vista' + capitalizar(tipo));
  
    if (esProfesor) {
      editor.innerHTML = `
        <button class="btn btn--primario" style="margin-bottom:1rem;" onclick="abrirModalEmbed('${tipo}', '${materiaId}')">+ Agregar ${tipoEmbed}</button>
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
          ${esProfesor ? `<button class="btn btn--peligro btn--sm" style="float:right;" onclick="eliminarEmbed('${materiaId}','${tipo}',${i})">×</button>` : ''}
        </div>
      </div>
    `).join('');
  }
  
  function capitalizar(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  
  window.abrirModalEmbed = function(tipo, materiaId) {
    document.getElementById('embedTipo').value = tipo;
    document.getElementById('modalEmbedTitulo').textContent = 'Agregar ' + tipo;
    document.getElementById('formEmbed').reset();
    abrirModal('modalEmbed');
  };
  
  document.getElementById('formEmbed')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const materiaId = params.get('id');
    const tipo = document.getElementById('embedTipo').value; // videos | actividades | libros
    const contenido = DB.getContenido(materiaId);
    contenido[tipo] = contenido[tipo] || [];
    contenido[tipo].push({
      titulo: document.getElementById('embedTitulo').value.trim(),
      url: document.getElementById('embedUrl').value.trim(),
      tipo: tipo === 'actividades' ? 'Interactiva' : ''
    });
    DB.guardarContenido(materiaId, contenido);
    cerrarModal('modalEmbed');
    location.reload();
  });
  
  window.eliminarEmbed = function(materiaId, tipo, index) {
    if (!confirm('¿Eliminar este elemento?')) return;
    const contenido = DB.getContenido(materiaId);
    contenido[tipo].splice(index, 1);
    DB.guardarContenido(materiaId, contenido);
    location.reload();
  };