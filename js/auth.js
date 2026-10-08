/* ============================================
   AUTENTICACIÓN
   ⚠️ En producción usa hash de contraseñas (bcrypt)
   y autenticación en servidor (Firebase Auth, etc.)
   ============================================ */

   const AUTH_KEY = 'colegio_sesion';

   const Auth = {
     /* Inicia sesión */
     login(email, password) {
       const usuario = DB.getUsuarioPorEmail(email);
       if (!usuario) return { ok: false, error: 'Usuario no encontrado.' };
       if (usuario.password !== password) return { ok: false, error: 'Contraseña incorrecta.' };
       const sesion = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
       localStorage.setItem(AUTH_KEY, JSON.stringify(sesion));
       return { ok: true, usuario: sesion };
     },
   
     /* Cierra sesión */
     logout() {
       localStorage.removeItem(AUTH_KEY);
       window.location.href = 'login.html';
     },
   
     /* Obtiene la sesión actual */
     sesion() {
       const s = localStorage.getItem(AUTH_KEY);
       return s ? JSON.parse(s) : null;
     },
   
     /* Verifica que haya sesión; opcionalmente exige un rol */
     requiereSesion(rolPermitido = null) {
       const s = this.sesion();
       if (!s) {
         window.location.href = 'login.html';
         return null;
       }
       if (rolPermitido && s.rol !== rolPermitido) {
         alert('No tienes permiso para acceder a esta sección.');
         window.location.href = 'dashboard.html';
         return null;
       }
       return s;
     }
   };