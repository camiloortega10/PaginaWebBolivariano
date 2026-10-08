/* ============================================
   LÓGICA DEL ADMINISTRADOR
   ============================================ */

   const AdminUI = {
    init() {
      this.renderUsuarios();
      this.renderMaterias();
      this.renderCuestionarios();
      this.bindFormularios();
    },
  
    /* ---- USUARIOS ---- */
    renderUsuarios() {
      const contenedor = document.getElementById('tablaUsuarios');
      const usuarios = DB.getUsuarios();
  
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
                  <button class="btn btn--outline btn--sm" onclick="AdminUI.editarUsuario('${u.id}')">Editar</button>
                  <button class="btn btn--peligro btn--sm" onclick="AdminUI.eliminarUsuario('${u.id}')">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    },
  
    editarUsuario(id) {
      const u = DB.getUsuarioPorId(id);
      if (!u) return;
      document.getElementById('modalUsuarioTitulo').textContent = 'Editar usuario';
      document.getElementById('usuarioId').value = u.id;
      document.getElementById('uNombre').value = u.nombre;
      document.getElementById('uEmail').value = u.email;
      document.getElementById('uPassword').value = u.password;
      document.getElementById('uRol').value = u.rol;
      abrirModal('modalUsuario');
    },
  
    eliminarUsuario(id) {
      if (id === Auth.sesion().id) { alert('No puedes eliminar tu propia cuenta.'); return; }
      if (!confirm('¿Eliminar este usuario?')) return;
      DB.eliminarUsuario(id);
      this.renderUsuarios();
    },
  
    /* ---- MATERIAS ---- */
    renderMaterias() {
      const contenedor = document.getElementById('listaMateriasDashboard');
      const materias = DB.getMaterias();
      const usuarios = DB.getUsuarios();
  
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
    },
  
    eliminarMateria(id) {
      if (!confirm('¿Eliminar esta materia y todo su contenido?')) return;
      DB.eliminarMateria(id);
      this.renderMaterias();
    },
    
    editarMateria(id) {
      const m = DB.getMateriaPorId(id);
      if (!m) return;
  
      // Cargar lista de profesores en el select
      const select = document.getElementById('mProfesor');
      const profesores = DB.getUsuarios().filter(u => u.rol === 'profesor' || u.rol === 'admin');
      select.innerHTML = '<option value="">Sin asignar</option>' +
        profesores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
  
      // Cambiar título del modal y precargar datos
      document.getElementById('modalMateriaTitulo').textContent = 'Editar materia';
      document.getElementById('materiaId').value = m.id;
      document.getElementById('mNombre').value = m.nombre || '';
      document.getElementById('mDescripcion').value = m.descripcion || '';
      document.getElementById('mIcono').value = m.icono || '';
      document.getElementById('mImagen').value = m.imagen || '';
      document.getElementById('mProfesor').value = m.profesorId || '';
  
      abrirModal('modalMateria');
    },
    
    /* ---- CUESTIONARIOS ---- */
    renderCuestionarios() {
      const contenedor = document.getElementById('listaCuestionarios');
      const materias = DB.getMaterias();
      let html = '';
      materias.forEach(m => {
        const cuest = DB.getCuestionarios(m.id);
        if (cuest.length) {
          html += `<h3 style="margin:1rem 0 .5rem;">${m.icono || ''} ${m.nombre}</h3>`;
          html += cuest.map(c => `
            <div class="panel__card" style="margin-bottom:.5rem;padding:1rem;">
              <strong>${c.titulo}</strong>
              <span style="color:var(--gris-texto);font-size:.85rem;margin-left:.5rem;">${c.preguntas.length} preguntas</span>
            </div>
          `).join('');
        }
      });
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
  
      document.getElementById('formUsuario').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('usuarioId').value;
        const datos = {
          nombre: document.getElementById('uNombre').value.trim(),
          email: document.getElementById('uEmail').value.trim(),
          password: document.getElementById('uPassword').value,
          rol: document.getElementById('uRol').value
        };
  
        if (id) {
          // Editar
          const db = DB.leer();
          const idx = db.usuarios.findIndex(u => u.id === id);
          if (idx >= 0) db.usuarios[idx] = { ...db.usuarios[idx], ...datos };
          DB.guardar(db);
        } else {
          // Crear
          if (DB.getUsuarioPorEmail(datos.email)) {
            alert('Ya existe un usuario con ese correo.');
            return;
          }
          DB.agregarUsuario(datos);
        }
        cerrarModal('modalUsuario');
        this.renderUsuarios();
      });
  
            // Nueva materia
      document.getElementById('btnNuevaMateria').addEventListener('click', () => {
        const select = document.getElementById('mProfesor');
        const profesores = DB.getUsuarios().filter(u => u.rol === 'profesor' || u.rol === 'admin');
        select.innerHTML = '<option value="">Sin asignar</option>' +
          profesores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
        
        // Modo "nuevo": limpiar formulario
        document.getElementById('modalMateriaTitulo').textContent = 'Nueva materia';
        document.getElementById('materiaId').value = '';
        document.getElementById('formMateria').reset();
        
        abrirModal('modalMateria');
      });

      document.getElementById('formMateria').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('materiaId').value;
        const datos = {
          nombre: document.getElementById('mNombre').value.trim(),
          descripcion: document.getElementById('mDescripcion').value.trim(),
          icono: document.getElementById('mIcono').value.trim(),
          imagen: document.getElementById('mImagen').value.trim() || 'assets/img/materia-default.jpg',
          profesorId: document.getElementById('mProfesor').value
        };

        if (id) {
          // Modo edición
          DB.actualizarMateria(id, datos);
        } else {
          // Modo creación
          DB.agregarMateria(datos);
        }
        
        cerrarModal('modalMateria');
        e.target.reset();
        this.renderMaterias();
      });
    }
  };