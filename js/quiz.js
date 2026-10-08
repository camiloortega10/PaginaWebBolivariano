/* ============================================
   CUESTIONARIOS + GOOGLE SHEETS
   ============================================
   IMPORTANTE: reemplaza URL_GOOGLE_SHEETS por
   la URL de tu Web App de Google Apps Script.
   Ver instrucciones en el README más abajo.
   ============================================ */

   const URL_GOOGLE_SHEETS = 'https://script.google.com/macros/s/AKfycb.../exec'; // <-- CAMBIA ESTO

   const QuizUI = {
     materiaId: null,
     esProfesor: false,
   
     init(materiaId, esProfesor) {
       this.materiaId = materiaId;
       this.esProfesor = esProfesor;
       this.render();
     },
   
     render() {
       const editor = document.getElementById('editorCuestionarios');
       const vista = document.getElementById('vistaCuestionarios');
       const cuestionarios = DB.getCuestionarios(this.materiaId);
   
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
   
     crearDemo() {
       const titulo = prompt('Título del cuestionario:', 'Nuevo cuestionario');
       if (!titulo) return;
       DB.guardarCuestionario(this.materiaId, {
         titulo,
         preguntas: [
           {
             enunciado: 'Pregunta de ejemplo: ¿Cuánto es 2 + 2?',
             opciones: ['3', '4', '5', '6'],
             correcta: 1
           }
         ]
       });
       this.render();
     },
   
     eliminar(id) {
       if (!confirm('¿Eliminar cuestionario?')) return;
       DB.eliminarCuestionario(this.materiaId, id);
       this.render();
     },
   
     mostrar(id) {
       const cuestionario = DB.getCuestionarios(this.materiaId).find(c => c.id === id);
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
   
     calificar(cuestionario) {
       const nombre = document.getElementById('quizNombre').value.trim();
       if (!nombre) { alert('Por favor escribe tu nombre.'); return; }
   
       let correctas = 0;
       const respuestas = [];
       cuestionario.preguntas.forEach((p, i) => {
         const sel = document.querySelector(`input[name="p${i}"]:checked`);
         const valor = sel ? parseInt(sel.value) : -1;
         respuestas.push(valor);
         if (valor === p.correcta) correctas++;
       });
   
       const nota = Math.round((correctas / cuestionario.preguntas.length) * 100);
   
       // Mostrar resultado
       document.getElementById('quizResultado').innerHTML = `
         <div class="alerta alerta--exito" style="margin-top:1rem;">
           <strong>${nombre}</strong>, obtuviste <strong>${correctas}/${cuestionario.preguntas.length}</strong> (${nota}%)
         </div>
       `;
   
       // Enviar a Google Sheets
       this.enviarAGoogleSheets({
         nombre,
         materia: DB.getMateriaPorId(this.materiaId).nombre,
         cuestionario: cuestionario.titulo,
         nota,
         correctas,
         total: cuestionario.preguntas.length,
         fecha: new Date().toLocaleString('es-CO')
       });
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
         console.log('✅ Respuestas enviadas a Google Sheets');
       } catch (e) {
         console.error('Error al enviar a Google Sheets:', e);
       }
     }
   };