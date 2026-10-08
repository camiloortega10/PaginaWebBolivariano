/* ============================================
   LÓGICA DEL ESTUDIANTE
   ============================================ */

   const EstudianteUI = {
    init() {
      this.renderMaterias();
    },
  
    renderMaterias() {
      const contenedor = document.getElementById('listaMateriasDashboard');
      const materias = DB.getMaterias();
  
      contenedor.innerHTML = materias.map(m => `
        <article class="card-materia">
          <img src="${m.imagen}" class="card-materia__imagen" alt="${m.nombre}"
               onerror="this.src='https://via.placeholder.com/400x300/003366/FFFFFF?text=${encodeURIComponent(m.nombre)}'"/>
          <div class="card-materia__cuerpo">
            <h3>${m.icono || ''} ${m.nombre}</h3>
            <p>${m.descripcion || ''}</p>
            <div class="card-materia__footer">
              <span>${DB.getCuestionarios(m.id).length} cuestionarios</span>
              <a href="materia.html?id=${m.id}" class="btn btn--primario btn--sm">Entrar →</a>
            </div>
          </div>
        </article>
      `).join('');
    }
  };