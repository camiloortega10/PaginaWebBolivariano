/* ============================================
   AUTENTICACIÓN
   ⚠️ En producción usa hash de contraseñas (bcrypt)
   y autenticación en servidor (Firebase Auth, etc.)
   ============================================ */

   // js/auth.js
   
import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const Auth = {
  /**
   * Inicia sesión con email y contraseña.
   * Devuelve { ok: true, usuario: {...} } o { ok: false, error: "..." }
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener el rol desde Firestore (colección "usuarios", documento con el UID)
      const userDocRef = doc(db, "usuarios", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let rol = "estudiante"; // Rol por defecto si no se encuentra el documento
      let nombre = user.email;

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        rol = data.rol || "estudiante";
        nombre = data.nombre || user.email;
      }

      return {
        ok: true,
        usuario: { id: user.uid, email: user.email, nombre, rol }
      };
    } catch (error) {
      console.error("Error en login:", error);
      let mensaje = "Credenciales incorrectas.";
      if (error.code === "auth/user-not-found") mensaje = "Usuario no encontrado.";
      if (error.code === "auth/wrong-password") mensaje = "Contraseña incorrecta.";
      return { ok: false, error: mensaje };
    }
  },

  /**
   * Cierra la sesión y redirige al login.
   */
  logout() {
    signOut(auth).then(() => {
      window.location.href = 'login.html';
    });
  },

  /**
   * Devuelve una promesa que resuelve con la sesión actual o null.
   * Úsala así: const sesion = await Auth.obtenerSesion();
   */
  obtenerSesion() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          resolve(null);
          return;
        }

        // Obtener rol desde Firestore
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let rol = "estudiante";
        let nombre = user.email;

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          rol = data.rol || "estudiante";
          nombre = data.nombre || user.email;
        }

        resolve({ id: user.uid, email: user.email, nombre, rol });
      });
    });
  },

  /**
   * Verifica que haya sesión. Si se pasa un rol, lo valida.
   * Redirige si no cumple. Devuelve la sesión o null.
   */
  async requiereSesion(rolPermitido = null) {
    const sesion = await this.obtenerSesion();

    if (!sesion) {
      window.location.href = 'login.html';
      return null;
    }

    if (rolPermitido && sesion.rol !== rolPermitido) {
      alert('No tienes permiso para acceder a esta sección.');
      window.location.href = 'dashboard.html';
      return null;
    }

    return sesion;
  }
};

export { Auth };