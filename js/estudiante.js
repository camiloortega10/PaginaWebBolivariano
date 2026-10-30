/* ============================================
   LÓGICA DEL ESTUDIANTE
   ============================================ */

   // js/estudiante.js
import { DB } from './db.js';

const EstudianteUI = {
  async init() {
    await this.renderMaterias();
  },

  async renderMaterias() {
    const contenedor = document.getElementById('listaMateriasDashboard');
    if (!contenedor) return;

    const materias = await DB.getMaterias();

    if (!materias.length) {
      contenedor.innerHTML = '<p class="estado-vacio">Aún no hay materias disponibles.</p>';
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
            <a href="materia.html?id=${m.id}" class="btn btn--primario btn--sm">Entrar →</a>
          </div>
        </div>
      </article>
    `).join('');
  }
};

export { EstudianteUI };