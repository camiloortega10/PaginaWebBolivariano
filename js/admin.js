/* ============================================
   LÓGICA DEL ADMINISTRADOR
   ============================================ */

   // js/admin.js
import { DB } from './db.js';
import { Auth } from './auth.js';

const AdminUI = {
  async init() {
    await this.renderUsuarios();
    await this.renderMaterias();
    await this.renderNoticias();
    await this.renderCuestionarios();
    this.bindFormularios();
  },

  /* ---- USUARIOS ---- */
  async renderUsuarios() {
    const contenedor = document.getElementById('tablaUsuarios');
    if (!contenedor) return;

    const usuarios = await DB.getUsuarios();

    if (!usuarios.length) {
      contenedor.innerHTML = '<p class="estado-vacio">No hay usuarios aún.</p>';
      return;
    }

    contenedor.innerHTML = `
      <table class="tabla">
        <thead>
          <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          ${usuarios.map(u => `
            <tr>
              <td>${u.nombre}</td>
              <td>${u.email}</td>
              <td><span class="badge badge--${u.rol}">${u.rol}</span></td>
              <td>
                <button class="btn btn--peligro btn--sm" onclick="AdminUI.eliminarUsuario('${u.id}')">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  async eliminarUsuario(id) {
    const sesion = await Auth.obtenerSesion();
    if (sesion && id === sesion.id) { alert('No puedes eliminar tu propia cuenta.'); return; }
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await DB.eliminarUsuario(id);
      await this.renderUsuarios();
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    }
  },

  /* ---- MATERIAS ---- */

async renderMaterias() {
  const contenedor = document.getElementById('listaMateriasDashboard');
  if (!contenedor) return;

  try {
    const materias = await DB.getMaterias();
    const usuarios = await DB.getUsuarios();

    if (!materias.length) {
      contenedor.innerHTML = '<p class="estado-vacio">No hay materias. Crea la primera.</p>';
      return;
    }

    contenedor.innerHTML = materias.map(m => {
      const profe = usuarios.find(u => u.id === m.profesorId);
      return `
        <article class="card-materia">
          <img src="${m.imagen}" class="card-materia__imagen" alt="${m.nombre}"
               onerror="this.src='https://via.placeholder.com/400x300/003366/FFFFFF?text=${encodeURIComponent(m.nombre)}'"/>
          <div class="card-materia__cuerpo">
            <h3>${m.icono || ''} ${m.nombre}</h3>
            <p>${m.descripcion || ''}</p>
            <div class="card-materia__footer">
              <span>${profe ? profe.nombre : 'Sin profesor'}</span>
              <div style="display:flex;gap:.3rem;">
                <a href="materia.html?id=${m.id}" class="btn btn--outline btn--sm">Ver</a>
                <button class="btn btn--primario btn--sm" onclick="AdminUI.editarMateria('${m.id}')">Editar</button>
                <button class="btn btn--peligro btn--sm" onclick="AdminUI.eliminarMateria('${m.id}')">×</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.error('❌ Error al cargar materias:', err);
    contenedor.innerHTML = `<p class="estado-vacio">Error al cargar materias: ${err.message}</p>`;
  }
},

  async eliminarMateria(id) {
    if (!confirm('¿Eliminar esta materia y todo su contenido?')) return;
    try {
      await DB.eliminarMateria(id);
      await this.renderMaterias();
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    }
  },

  async editarMateria(id) {
    const m = await DB.getMateriaPorId(id);
    if (!m) return;

    const select = document.getElementById('mProfesor');
    const profesores = (await DB.getUsuarios()).filter(u => u.rol === 'profesor' || u.rol === 'admin');
    select.innerHTML = '<option value="">Sin asignar</option>' +
      profesores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

    document.getElementById('modalMateriaTitulo').textContent = 'Editar materia';
    document.getElementById('materiaId').value = m.id;
    document.getElementById('mNombre').value = m.nombre || '';
    document.getElementById('mDescripcion').value = m.descripcion || '';
    document.getElementById('mIcono').value = m.icono || '';
    document.getElementById('mImagen').value = m.imagen || '';
    document.getElementById('mProfesor').value = m.profesorId || '';

    abrirModal('modalMateria');
  },

  /* ---- NOTICIAS ---- */
  async renderNoticias() {
    const contenedor = document.getElementById('listaNoticiasAdmin');
    if (!contenedor) return;

    const noticias = await DB.getNoticias();

    if (!noticias.length) {
      contenedor.innerHTML = '<p class="estado-vacio">No hay noticias publicadas. Crea la primera.</p>';
      return;
    }

    const fechaFormato = (fecha) => {
      if (!fecha) return 'Sin fecha';
      const d = new Date(fecha + 'T00:00:00');
      return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    contenedor.innerHTML = noticias.map(n => `
      <article class="card-materia">
        <img src="${n.imagen}" class="card-materia__imagen" alt="${n.titulo}"
             onerror="this.src='https://via.placeholder.com/400x300/003366/FFFFFF?text=Noticia'" />
        <div class="card-materia__cuerpo">
          <span class="badge" style="background:var(--azul-suave);color:var(--azul-medio);margin-bottom:.4rem;font-size:.7rem;">
            ${n.categoria || 'General'}
          </span>
          <h3 style="font-size:1.05rem;">${n.titulo}</h3>
          <p style="font-size:.85rem;">${n.resumen || ''}</p>
          <div class="card-materia__footer" style="flex-direction:column;align-items:flex-start;gap:.5rem;">
            <span style="font-size:.75rem;">📅 ${fechaFormato(n.fecha)} · ✍️ ${n.autor || 'Colegio'}</span>
            <div style="display:flex;gap:.3rem;width:100%;">
              <button class="btn btn--primario btn--sm" style="flex:1;" onclick="AdminUI.editarNoticia('${n.id}')">Editar</button>
              <button class="btn btn--peligro btn--sm" onclick="AdminUI.eliminarNoticia('${n.id}')">×</button>
            </div>
          </div>
        </div>
      </article>
    `).join('');
  },

  async editarNoticia(id) {
    const n = await DB.getNoticiaPorId(id);
    if (!n) return;

    document.getElementById('modalNoticiaTitulo').textContent = 'Editar noticia';
    document.getElementById('noticiaId').value = n.id;
    document.getElementById('nTitulo').value = n.titulo || '';
    document.getElementById('nResumen').value = n.resumen || '';
    document.getElementById('nContenido').value = n.contenido || '';
    document.getElementById('nCategoria').value = n.categoria || 'General';
    document.getElementById('nAutor').value = n.autor || '';
    document.getElementById('nFecha').value = n.fecha || '';
    document.getElementById('nImagen').value = n.imagen || '';

    abrirModal('modalNoticia');
  },

  async eliminarNoticia(id) {
    if (!confirm('¿Eliminar esta noticia? Esta acción no se puede deshacer.')) return;
    try {
      await DB.eliminarNoticia(id);
      await this.renderNoticias();
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    }
  },

  /* ---- CUESTIONARIOS ---- */
  async renderCuestionarios() {
    const contenedor = document.getElementById('listaCuestionarios');
    if (!contenedor) return;

    const materias = await DB.getMaterias();
    let html = '';
    for (const m of materias) {
      const cuest = await DB.getCuestionarios(m.id);
      if (cuest.length) {
        html += `<h3 style="margin:1rem 0 .5rem;">${m.icono || ''} ${m.nombre}</h3>`;
        html += cuest.map(c => `
          <div class="panel__card" style="margin-bottom:.5rem;padding:1rem;">
            <strong>${c.titulo}</strong>
            <span style="color:var(--gris-texto);font-size:.85rem;margin-left:.5rem;">${c.preguntas.length} preguntas</span>
          </div>
        `).join('');
      }
    }
    contenedor.innerHTML = html || '<p class="estado-vacio">No hay cuestionarios creados.</p>';
  },

  /* ---- FORMULARIOS ---- */
  bindFormularios() {
    // Nuevo usuario
    document.getElementById('btnNuevoUsuario').addEventListener('click', () => {
      document.getElementById('modalUsuarioTitulo').textContent = 'Nuevo usuario';
      document.getElementById('formUsuario').reset();
      document.getElementById('usuarioId').value = '';
      abrirModal('modalUsuario');
    });

        document.getElementById('formUsuario').addEventListener('submit', async (e) => {
      e.preventDefault();
      const datos = {
        nombre: document.getElementById('uNombre').value.trim(),
        email: document.getElementById('uEmail').value.trim(),
        password: document.getElementById('uPassword').value,
        rol: document.getElementById('uRol').value
      };
      try {
        await DB.agregarUsuario(datos);
        cerrarModal('modalUsuario');
        e.target.reset();
        await this.renderUsuarios();
        alert('✅ Usuario creado correctamente. Ya puede iniciar sesión con ese correo y contraseña.');
      } catch (err) {
        alert('❌ ' + err.message);
      }
    });

    // Nueva materia
    document.getElementById('btnNuevaMateria').addEventListener('click', async () => {
      const select = document.getElementById('mProfesor');
      const profesores = (await DB.getUsuarios()).filter(u => u.rol === 'profesor' || u.rol === 'admin');
      select.innerHTML = '<option value="">Sin asignar</option>' +
        profesores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

      document.getElementById('modalMateriaTitulo').textContent = 'Nueva materia';
      document.getElementById('materiaId').value = '';
      document.getElementById('formMateria').reset();
      abrirModal('modalMateria');
    });

    document.getElementById('formMateria').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('materiaId').value;
  const datos = {
    nombre: document.getElementById('mNombre').value.trim(),
    descripcion: document.getElementById('mDescripcion').value.trim(),
    icono: document.getElementById('mIcono').value.trim(),
    imagen: document.getElementById('mImagen').value.trim() || 'assets/img/materia-default.jpg',
    profesorId: document.getElementById('mProfesor').value || null
  };

  // Validar campos vacíos
  if (!datos.nombre) {
    alert('El nombre de la materia es obligatorio.');
    return;
  }

  const btnSubmit = e.target.querySelector('button[type="submit"]');
  const textoOriginal = btnSubmit.textContent;
  btnSubmit.textContent = 'Guardando...';
  btnSubmit.disabled = true;

  try {
    if (id) {
      await DB.actualizarMateria(id, datos);
    } else {
      await DB.agregarMateria(datos);
    }
    cerrarModal('modalMateria');
    e.target.reset();
    await this.renderMaterias();
    alert('✅ Materia guardada correctamente.');
  } catch (err) {
    console.error('Error al guardar materia:', err);
    alert('❌ Error al guardar materia:\n' + err.message);
  } finally {
    btnSubmit.textContent = textoOriginal;
    btnSubmit.disabled = false;
  }
});

    /* ============ NOTICIAS ============ */
    document.getElementById('btnNuevaNoticia').addEventListener('click', () => {
      document.getElementById('modalNoticiaTitulo').textContent = 'Nueva noticia';
      document.getElementById('noticiaId').value = '';
      document.getElementById('formNoticia').reset();
      document.getElementById('nFecha').value = new Date().toISOString().split('T')[0];
      abrirModal('modalNoticia');
    });

    document.getElementById('formNoticia').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('noticiaId').value;
      const datos = {
        titulo: document.getElementById('nTitulo').value.trim(),
        resumen: document.getElementById('nResumen').value.trim(),
        contenido: document.getElementById('nContenido').value.trim(),
        categoria: document.getElementById('nCategoria').value,
        autor: document.getElementById('nAutor').value.trim() || 'Colegio Bolivariano',
        fecha: document.getElementById('nFecha').value,
        imagen: document.getElementById('nImagen').value.trim() || 'assets/img/noticia-default.jpg'
      };
      try {
        if (id) await DB.actualizarNoticia(id, datos);
        else await DB.agregarNoticia(datos);
        cerrarModal('modalNoticia');
        e.target.reset();
        await this.renderNoticias();
      } catch (err) {
        alert('Error al guardar noticia: ' + err.message);
      }
    });
  }
};

export { AdminUI };