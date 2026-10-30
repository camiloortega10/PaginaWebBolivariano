/* ============================================
   CUESTIONARIOS + GOOGLE SHEETS
   ============================================
   IMPORTANTE: reemplaza URL_GOOGLE_SHEETS por
   la URL de tu Web App de Google Apps Script.
   Ver instrucciones en el README más abajo.
   ============================================ */

   // js/quiz.js
import { DB } from './db.js';

const URL_GOOGLE_SHEETS = 'https://script.google.com/macros/s/AKfycb.../exec'; // <-- CAMBIA ESTO

const QuizUI = {
  materiaId: null,
  esProfesor: false,

  async init(materiaId, esProfesor) {
    this.materiaId = materiaId;
    this.esProfesor = esProfesor;
    await this.render();
  },

  async render() {
    const editor = document.getElementById('editorCuestionarios');
    const vista = document.getElementById('vistaCuestionarios');
    if (!editor || !vista) return;

    let cuestionarios = [];
    try {
      cuestionarios = await DB.getCuestionarios(this.materiaId);
    } catch (e) {
      console.error('Error cargando cuestionarios:', e);
      vista.innerHTML = '<p class="estado-vacio">Error al cargar cuestionarios.</p>';
      return;
    }

    if (this.esProfesor) {
      editor.innerHTML = `
        <button class="btn btn--primario" style="margin-bottom:1rem;" onclick="QuizUI.crearDemo()">+ Crear cuestionario de ejemplo</button>
      `;
    }

    if (!cuestionarios.length) {
      vista.innerHTML = '<p class="estado-vacio"><div class="estado-vacio__icono">📝</div>No hay cuestionarios disponibles.</p>';
      return;
    }

    vista.innerHTML = cuestionarios.map(c => `
      <div class="panel__card">
        <h3>${c.titulo}</h3>
        <p style="color:var(--gris-texto);font-size:.9rem;margin-bottom:1rem;">${c.preguntas.length} preguntas</p>
        <button class="btn btn--primario" onclick="QuizUI.mostrar('${c.id}')">Responder</button>
        ${this.esProfesor ? `<button class="btn btn--peligro" onclick="QuizUI.eliminar('${c.id}')">Eliminar</button>` : ''}
      </div>
    `).join('');
  },

  async crearDemo() {
    const titulo = prompt('Título del cuestionario:', 'Nuevo cuestionario');
    if (!titulo) return;
    try {
      await DB.guardarCuestionario(this.materiaId, {
        titulo,
        preguntas: [
          {
            enunciado: 'Pregunta de ejemplo: ¿Cuánto es 2 + 2?',
            opciones: ['3', '4', '5', '6'],
            correcta: 1
          }
        ]
      });
      await this.render();
    } catch (e) {
      alert('❌ Error al crear cuestionario: ' + e.message);
    }
  },

  async eliminar(id) {
    if (!confirm('¿Eliminar cuestionario?')) return;
    try {
      await DB.eliminarCuestionario(this.materiaId, id);
      await this.render();
    } catch (e) {
      alert('❌ Error al eliminar: ' + e.message);
    }
  },

  async mostrar(id) {
    let cuestionario = null;
    try {
      const cuestionarios = await DB.getCuestionarios(this.materiaId);
      cuestionario = cuestionarios.find(c => c.id === id);
    } catch (e) {
      alert('Error: ' + e.message);
      return;
    }
    if (!cuestionario) return;

    const vista = document.getElementById('vistaCuestionarios');
    vista.innerHTML = `
      <div class="panel__card">
        <h2>${cuestionario.titulo}</h2>
        <div class="form-grupo" style="margin-top:1rem;">
          <label>Tu nombre completo</label>
          <input type="text" id="quizNombre" class="form-control" required />
        </div>
        <form id="formQuiz">
          ${cuestionario.preguntas.map((p, i) => `
            <div class="pregunta">
              <div class="pregunta__enunciado">${i + 1}. ${p.enunciado}</div>
              ${p.opciones.map((op, j) => `
                <label class="opcion">
                  <input type="radio" name="p${i}" value="${j}" required />
                  <span>${op}</span>
                </label>
              `).join('')}
            </div>
          `).join('')}
          <button type="submit" class="btn btn--primario btn--block">Enviar respuestas</button>
        </form>
        <div id="quizResultado"></div>
      </div>
    `;

    document.getElementById('formQuiz').addEventListener('submit', (e) => {
      e.preventDefault();
      this.calificar(cuestionario);
    });
  },

  async calificar(cuestionario) {
    const nombre = document.getElementById('quizNombre').value.trim();
    if (!nombre) { alert('Por favor escribe tu nombre.'); return; }

    let correctas = 0;
    cuestionario.preguntas.forEach((p, i) => {
      const sel = document.querySelector(`input[name="p${i}"]:checked`);
      const valor = sel ? parseInt(sel.value) : -1;
      if (valor === p.correcta) correctas++;
    });

    const nota = Math.round((correctas / cuestionario.preguntas.length) * 100);

    document.getElementById('quizResultado').innerHTML = `
      <div class="alerta alerta--exito" style="margin-top:1rem;">
        <strong>${nombre}</strong>, obtuviste <strong>${correctas}/${cuestionario.preguntas.length}</strong> (${nota}%)
      </div>
    `;

    try {
      const materia = await DB.getMateriaPorId(this.materiaId);
      this.enviarAGoogleSheets({
        nombre,
        materia: materia ? materia.nombre : '—',
        cuestionario: cuestionario.titulo,
        nota,
        correctas,
        total: cuestionario.preguntas.length,
        fecha: new Date().toLocaleString('es-CO')
      });
    } catch (e) {
      console.error(e);
    }
  },

  async enviarAGoogleSheets(datos) {
    if (URL_GOOGLE_SHEETS.includes('AKfycb...')) {
      console.warn('⚠️ Configura URL_GOOGLE_SHEETS en js/quiz.js para guardar en Google Sheets.');
      return;
    }
    try {
      await fetch(URL_GOOGLE_SHEETS, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
    } catch (e) {
      console.error('Error al enviar a Google Sheets:', e);
    }
  }
};

export { QuizUI };