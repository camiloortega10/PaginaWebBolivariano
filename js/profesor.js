/* ============================================
   LÓGICA DEL PROFESOR
   ============================================ */

   const ProfesorUI = {
    init() {
      this.renderMaterias();
    },
  
    renderMaterias() {
      const contenedor = document.getElementById('listaMateriasDashboard');
      const sesion = Auth.sesion();
      // El profesor ve las materias que le pertenecen (o todas si es admin)
      const materias = DB.getMaterias().filter(m => m.profesorId === sesion.id);
  
      if (!materias.length) {
        contenedor.innerHTML = '<p class="estado-vacio">No tienes materias asignadas. Contacta al administrador.</p>';
        return;
      }
  
      contenedor.innerHTML = materias.map(m => `
        <article class="card-materia">
          <img src="${m.imagen}" class="card-materia__imagen" alt="${m.nombre}"
               onerror="this.src='https://via.placeholder.com/400x300/003366/FFFFFF?text=${encodeURIComponent(m.nombre)}'"/>
          <div class="card-materia__cuerpo">
            <h3>${m.icono || ''} ${m.nombre}</h3>
            <p>${m.descripcion || ''}</p>
            <div class="card-materia__footer">
              <span>${DB.getCuestionarios(m.id).length} cuestionarios</span>
              <a href="materia.html?id=${m.id}" class="btn btn--primario btn--sm">Gestionar →</a>
            </div>
          </div>
        </article>
      `).join('');
    }
  };