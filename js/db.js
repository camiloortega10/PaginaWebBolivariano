/* ============================================
   BASE DE DATOS (localStorage)
   Para producción real, reemplaza estas
   funciones por llamadas a Firebase/Supabase.
   ============================================ */

   const DB_KEY = 'colegio_bolivariano_db';

   /* ---- Datos iniciales (solo se cargan la primera vez) ---- */
   const DATOS_INICIALES = {
     usuarios: [
       { id: 'u1', nombre: 'Administrador Principal', email: 'admin@colegio.com', password: 'admin123', rol: 'admin', creado: new Date().toISOString() },
       { id: 'u2', nombre: 'Prof. María González', email: 'maria@colegio.com', password: 'profe123', rol: 'profesor', creado: new Date().toISOString() },
       { id: 'u3', nombre: 'Prof. Carlos Pérez', email: 'carlos@colegio.com', password: 'profe123', rol: 'profesor', creado: new Date().toISOString() },
       { id: 'u4', nombre: 'Juan Estudiante', email: 'juan@colegio.com', password: 'est123', rol: 'estudiante', creado: new Date().toISOString() }
     ],
     materias: [
       {
         id: 'm1',
         nombre: 'Matemáticas',
         descripcion: 'Álgebra, geometría, cálculo y estadística.',
         profesorId: 'u2',
         imagen: 'assets/img/materia-matematicas.jpg',
         icono: '📐',
         color: '#4A90E2'
       },
       {
         id: 'm2',
         nombre: 'Ciencias Naturales',
         descripcion: 'Biología, química y física para comprender el mundo.',
         profesorId: 'u3',
         imagen: 'assets/img/materia-ciencias.jpg',
         icono: '🔬',
         color: '#28A745'
       },
       {
         id: 'm3',
         nombre: 'Lengua y Literatura',
         descripcion: 'Comprensión lectora, redacción y análisis literario.',
         profesorId: 'u2',
         imagen: 'assets/img/materia-lenguaje.jpg',
         icono: '📚',
         color: '#DC3545'
       },
       {
         id: 'm4',
         nombre: 'Inglés',
         descripcion: 'Comunicación oral y escrita en lengua inglesa.',
         profesorId: 'u3',
         imagen: 'assets/img/materia-ingles.jpg',
         icono: '🌎',
         color: '#FFC107'
       }
     ],
     /* Contenido de cada materia: clave = id de materia */
     contenidos: {
       m1: {
         texto: 'Bienvenidos al curso de Matemáticas. Aquí encontrarán los apuntes, videos y actividades de cada periodo.',
         videos: [
           { titulo: 'Introducción al Álgebra', url: 'https://www.youtube.com/embed/NybHckSEQBI' }
         ],
         actividades: [
           { titulo: 'Repaso de Geometría (Genially)', tipo: 'Genially', url: 'https://view.genially.com/embed/ejemplo' }
         ],
         libros: [
           { titulo: 'Álgebra de Baldor (PDF)', url: '#', portada: 'assets/img/materia-matematicas.jpg' }
         ]
       },
       m2: { texto: '', videos: [], actividades: [], libros: [] },
       m3: { texto: '', videos: [], actividades: [], libros: [] },
       m4: { texto: '', videos: [], actividades: [], libros: [] }
     },

       /* Noticias del colegio (para la página pública) */
  noticias: [
    {
      id: 'n1',
      titulo: 'Ceremonia de graduación promoción 2025',
      resumen: 'Nuestros estudiantes de grado once celebraron su graduación en una emotiva ceremonia junto a sus familias.',
      categoria: 'Eventos',
      fecha: '2026-11-28',
      autor: 'Rectoría',
      imagen: 'assets/img/noticia-graduacion.jpg',
      destacada: true
    },
    {
      id: 'n2',
      titulo: 'Medalla de oro en olimpiadas de matemáticas',
      resumen: 'Nuestro equipo representó a Medellín y obtuvo el primer lugar en la competencia departamental.',
      categoria: 'Logros',
      fecha: '2025-10-15',
      autor: 'Área de Matemáticas',
      imagen: 'assets/img/noticia-olimpiadas.jpg',
      destacada: false
    },
    {
      id: 'n3',
      titulo: 'Semana cultural y de la convivencia',
      resumen: 'Cinco días llenos de arte, música, deporte y reflexión sobre nuestros valores institucionales.',
      categoria: 'Cultura',
      fecha: '2025-09-20',
      autor: 'Coordinación Cultural',
      imagen: 'assets/img/noticia-cultural.jpg',
      destacada: false
    },
    {
      id: 'n4',
      titulo: 'Nueva sala de tecnología e innovación',
      resumen: 'Inauguramos un espacio con equipos de última generación para potenciar el aprendizaje STEM.',
      categoria: 'Infraestructura',
      fecha: '2025-08-10',
      autor: 'Administración',
      imagen: 'assets/img/noticia-sala-tech.jpg',
      destacada: false
    }
  ],
     /* Cuestionarios: clave = id de materia */
     cuestionarios: {
       m1: [
         {
           id: 'q1',
           titulo: 'Quiz de Práctica - Álgebra Básica',
           preguntas: [
             {
               enunciado: '¿Cuál es el valor de x en 2x + 4 = 10?',
               opciones: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
               correcta: 1
             },
             {
               enunciado: '¿Cuánto es 5² + 3?',
               opciones: ['25', '28', '30', '35'],
               correcta: 1
             }
           ]
         }
       ]
     }
   };
   
   /* ---- API de la base de datos ---- */
   const DB = {
     /* Inicializa la DB si no existe */
     init() {
       if (!localStorage.getItem(DB_KEY)) {
         localStorage.setItem(DB_KEY, JSON.stringify(DATOS_INICIALES));
       }
     },
   
     /* Lee toda la base de datos */
     leer() {
       this.init();
       return JSON.parse(localStorage.getItem(DB_KEY));
     },
   
     /* Guarda toda la base de datos */
     guardar(datos) {
       localStorage.setItem(DB_KEY, JSON.stringify(datos));
     },
   
     /* Resetea a los datos iniciales */
     resetear() {
       localStorage.setItem(DB_KEY, JSON.stringify(DATOS_INICIALES));
     },
   
     /* Genera un ID único simple */
     nuevoId(prefijo = 'id') {
       return `${prefijo}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
     },
   
     /* ---- Usuarios ---- */
     getUsuarios() { return this.leer().usuarios; },
     getUsuarioPorEmail(email) {
       return this.getUsuarios().find(u => u.email.toLowerCase() === email.toLowerCase());
     },
     getUsuarioPorId(id) {
       return this.getUsuarios().find(u => u.id === id);
     },
     agregarUsuario(usuario) {
       const datos = this.leer();
       usuario.id = this.nuevoId('u');
       usuario.creado = new Date().toISOString();
       datos.usuarios.push(usuario);
       this.guardar(datos);
       return usuario;
     },
     eliminarUsuario(id) {
       const datos = this.leer();
       datos.usuarios = datos.usuarios.filter(u => u.id !== id);
       this.guardar(datos);
     },

       /* ---- Noticias ---- */
  getNoticias() {
    return this.leer().noticias || [];
  },
  agregarNoticia(noticia) {
    const datos = this.leer();
    noticia.id = this.nuevoId('n');
    noticia.fecha = noticia.fecha || new Date().toISOString().split('T')[0];
    if (!datos.noticias) datos.noticias = [];
    datos.noticias.unshift(noticia); // la más reciente primero
    this.guardar(datos);
    return noticia;
  },
  eliminarNoticia(id) {
    const datos = this.leer();
    datos.noticias = (datos.noticias || []).filter(n => n.id !== id);
    this.guardar(datos);
  },

     /* ---- Materias ---- */
     getMaterias() { return this.leer().materias; },
     getMateriaPorId(id) { return this.getMaterias().find(m => m.id === id); },
     agregarMateria(materia) {
       const datos = this.leer();
       materia.id = this.nuevoId('m');
       datos.materias.push(materia);
       datos.contenidos[materia.id] = { texto: '', videos: [], actividades: [], libros: [] };
       this.guardar(datos);
       return materia;
     },

     actualizarMateria(id, cambios) {
      const datos = this.leer();
      const idx = datos.materias.findIndex(m => m.id === id);
      if (idx >= 0) {
        datos.materias[idx] = { ...datos.materias[idx], ...cambios };
        this.guardar(datos);
        return datos.materias[idx];
      }
      return null;
    },

     eliminarMateria(id) {
       const datos = this.leer();
       datos.materias = datos.materias.filter(m => m.id !== id);
       delete datos.contenidos[id];
       delete datos.cuestionarios[id];
       this.guardar(datos);
     },
   
     /* ---- Contenidos ---- */
     getContenido(materiaId) {
       const datos = this.leer();
       return datos.contenidos[materiaId] || { texto: '', videos: [], actividades: [], libros: [] };
     },
     guardarContenido(materiaId, contenido) {
       const datos = this.leer();
       datos.contenidos[materiaId] = contenido;
       this.guardar(datos);
     },
   
     /* ---- Cuestionarios ---- */
     getCuestionarios(materiaId) {
       const datos = this.leer();
       return datos.cuestionarios[materiaId] || [];
     },
     guardarCuestionario(materiaId, cuestionario) {
       const datos = this.leer();
       if (!datos.cuestionarios[materiaId]) datos.cuestionarios[materiaId] = [];
       if (!cuestionario.id) cuestionario.id = this.nuevoId('q');
       const idx = datos.cuestionarios[materiaId].findIndex(c => c.id === cuestionario.id);
       if (idx >= 0) datos.cuestionarios[materiaId][idx] = cuestionario;
       else datos.cuestionarios[materiaId].push(cuestionario);
       this.guardar(datos);
     },
     eliminarCuestionario(materiaId, cuestionarioId) {
       const datos = this.leer();
       datos.cuestionarios[materiaId] = (datos.cuestionarios[materiaId] || []).filter(c => c.id !== cuestionarioId);
       this.guardar(datos);
     }
   };
   
   DB.init();