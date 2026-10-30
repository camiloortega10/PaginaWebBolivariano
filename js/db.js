/* ============================================
   BASE DE DATOS (localStorage)
   Para producción real, reemplaza estas
   funciones por llamadas a Firebase/Supabase.
   ============================================ */

   // js/db.js
import { db, auth, firebaseConfig } from './firebase-config.js';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc,
  query, orderBy, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import {
  initializeApp,
  deleteApp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth as getAuthSecondary,
  createUserWithEmailAndPassword,
  signOut as signOutSecondary
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const DB = {
  // ============================================
  // USUARIOS
  // ============================================
  async getUsuarios() {
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getUsuarioPorId(id) {
    const docRef = doc(db, "usuarios", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async getUsuarioPorEmail(email) {
    // Firestore no permite buscar por campo sin un índice; hacemos un filtro simple
    const usuarios = await this.getUsuarios();
    return usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  /**
   * Crea un usuario en Firebase Auth Y guarda su perfil (con rol) en Firestore.
   * ⚠️ IMPORTANTE: Esta función solo debe usarse desde el panel de administrador.
   */
    async agregarUsuario(usuario) {
    // Creamos una app Firebase temporal SOLO para crear el usuario.
    // Así la sesión del administrador NO se ve afectada.
    const secondaryAppName = `secondary-${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuthSecondary(secondaryApp);

    try {
      // 1. Crear el usuario en Firebase Auth con la app secundaria
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        usuario.email,
        usuario.password
      );
      const uid = userCredential.user.uid;

      // 2. Cerrar sesión en la app secundaria (importante: sin tocar la del admin)
      await signOutSecondary(secondaryAuth);

      // 3. Guardar el perfil en Firestore usando la app principal
      const perfil = {
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        creado: new Date().toISOString()
      };
      await setDoc(doc(db, "usuarios", uid), perfil);

      return { id: uid, ...perfil };
    } catch (error) {
      console.error("Error al crear usuario:", error);
      // Traducir errores de Firebase a mensajes amigables
      let mensaje = error.message;
      if (error.code === 'auth/email-already-in-use') {
        mensaje = 'Ya existe un usuario con ese correo en Firebase Authentication. Bórralo en Firebase Console → Authentication → Users, o usa otro correo.';
      } else if (error.code === 'auth/invalid-email') {
        mensaje = 'El correo electrónico no es válido.';
      } else if (error.code === 'auth/weak-password') {
        mensaje = 'La contraseña es demasiado débil (mínimo 6 caracteres).';
      } else if (error.code === 'auth/operation-not-allowed') {
        mensaje = 'El método de correo/contraseña no está habilitado en Firebase Console → Authentication.';
      }
      throw new Error(mensaje);
    } finally {
      // 4. Limpiar la app secundaria siempre, incluso si falla
      try { await deleteApp(secondaryApp); } catch (e) { /* ignorar */ }
    }
  },

  async eliminarUsuario(id) {
    // ⚠️ Eliminar de Firestore NO elimina de Firebase Auth.
    // Para una eliminación completa necesitarías el Admin SDK (backend).
    // Por ahora, solo eliminamos el perfil de Firestore.
    await deleteDoc(doc(db, "usuarios", id));
  },

  // ============================================
  // NOTICIAS
  // ============================================
  async getNoticias() {
    // Ordenar por fecha descendente (la más reciente primero)
    const q = query(collection(db, "noticias"), orderBy("fecha", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getNoticiaPorId(id) {
    const docRef = doc(db, "noticias", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async agregarNoticia(noticia) {
    const docRef = await addDoc(collection(db, "noticias"), {
      ...noticia,
      fecha: noticia.fecha || new Date().toISOString().split('T')[0]
    });
    return { id: docRef.id, ...noticia };
  },

  async actualizarNoticia(id, cambios) {
    const noticiaRef = doc(db, "noticias", id);
    await updateDoc(noticiaRef, cambios);
    return { id, ...cambios };
  },

  async eliminarNoticia(id) {
    await deleteDoc(doc(db, "noticias", id));
  },

  // ============================================
  // MATERIAS (misma lógica que noticias)
  // ============================================
  async getMaterias() {
    const querySnapshot = await getDocs(collection(db, "materias"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getMateriaPorId(id) {
    const docRef = doc(db, "materias", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async agregarMateria(materia) {
  try {
    // 1. Crear la materia
    console.log('📝 Creando materia en Firestore:', materia);
    const docRef = await addDoc(collection(db, "materias"), materia);
    console.log('✅ Materia creada con ID:', docRef.id);

    // 2. Crear el documento de contenido vacío
    try {
      console.log('📝 Creando contenido vacío para:', docRef.id);
      await setDoc(doc(db, "contenidos", docRef.id), {
        texto: '', videos: [], actividades: [], libros: []
      });
      console.log('✅ Contenido creado');
    } catch (errCont) {
      console.warn('⚠️ La materia se creó pero NO el contenido:', errCont);
      // La materia existe; el contenido se puede crear después. No lanzamos error.
    }

    return { id: docRef.id, ...materia };
  } catch (err) {
    console.error('❌ Error al crear materia:', err);
    throw new Error(`Error creando materia: ${err.code || err.message}`);
  }
},

  async actualizarMateria(id, cambios) {
    await updateDoc(doc(db, "materias", id), cambios);
    return { id, ...cambios };
  },

  async eliminarMateria(id) {
    await deleteDoc(doc(db, "materias", id));
    // Eliminar el contenido asociado
    await deleteDoc(doc(db, "contenidos", id));
  },

  // ============================================
  // CONTENIDOS (subdocumentos por materia)
  // ============================================
  async getContenido(materiaId) {
    const docRef = doc(db, "contenidos", materiaId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : { texto: '', videos: [], actividades: [], libros: [] };
  },

  async guardarContenido(materiaId, contenido) {
    await setDoc(doc(db, "contenidos", materiaId), contenido);
  },

  // ============================================
  // CUESTIONARIOS
  // ============================================
  async getCuestionarios(materiaId) {
    // Los cuestionarios se guardan como un array dentro del documento de contenido,
    // o en una subcolección. Por simplicidad, los mantendremos en "contenidos".
    const contenido = await this.getContenido(materiaId);
    return contenido.cuestionarios || [];
  },

  async guardarCuestionario(materiaId, cuestionario) {
    const contenido = await this.getContenido(materiaId);
    if (!contenido.cuestionarios) contenido.cuestionarios = [];

    if (cuestionario.id) {
      // Editar existente
      const idx = contenido.cuestionarios.findIndex(c => c.id === cuestionario.id);
      if (idx >= 0) contenido.cuestionarios[idx] = cuestionario;
    } else {
      // Crear nuevo
      cuestionario.id = `q_${Date.now()}`;
      contenido.cuestionarios.push(cuestionario);
    }

    await this.guardarContenido(materiaId, contenido);
  },

  async eliminarCuestionario(materiaId, cuestionarioId) {
    const contenido = await this.getContenido(materiaId);
    contenido.cuestionarios = (contenido.cuestionarios || []).filter(c => c.id !== cuestionarioId);
    await this.guardarContenido(materiaId, contenido);
  }
};

export { DB };