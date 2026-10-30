/* ============================================
   LÓGICA DEL PROFESOR
   ============================================ */

   // js/profesor.js
import { DB } from './db.js';
import { Auth } from './auth.js';

const ProfesorUI = {
  async init() {
    await this.renderMaterias();
  },

  async renderMaterias() {
    const contenedor = document.getElementById('listaMateriasDashboard');
    if (!contenedor) return;

    const sesion = await Auth.obtenerSesion();
    if (!sesion) return;

    const todasMaterias = await DB.getMaterias();
    const materias = todasMaterias.filter(m => m.profesorId === sesion.id);

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
            <a href="materia.html?id=${m.id}" class="btn btn--primario btn--sm">Gestionar →</a>
          </div>
        </div>
      </article>
    `).join('');
  }
};

export { ProfesorUI };