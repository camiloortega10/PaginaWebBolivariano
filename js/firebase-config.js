// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// 🔽 PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE 🔽
export const firebaseConfig = {
  /*apiKey: "TU_API_KEY",
  authDomain: "pagina-web-bolivariano.firebaseapp.com",
  projectId: "pagina-web-bolivariano",
  storageBucket: "pagina-web-bolivariano.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"*/

apiKey: "AIzaSyAMFM0aEmfP_BJAu0AhwuNvTbldmEce6U4",
authDomain: "pagina-web-bolivariano-1b036.firebaseapp.com",
projectId: "pagina-web-bolivariano-1b036",
storageBucket: "pagina-web-bolivariano-1b036.firebasestorage.app",
messagingSenderId: "52921141796",
appId: "1:52921141796:web:2ca700a394ec6d0c0766b1",
measurementId: "G-XGBZFPG4BB"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios para usarlos en otros archivos
export const auth = getAuth(app);
export const db = getFirestore(app);