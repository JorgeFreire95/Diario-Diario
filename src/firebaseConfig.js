import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Configuración de Firebase proporcionada por el usuario
const firebaseConfig = {
    apiKey: "AIzaSyA8F9pLlCHKZv16TPncCVRSyXIN0kVAe3E",
    authDomain: "diario-diario-b4f7f.firebaseapp.com",
    projectId: "diario-diario-b4f7f",
    storageBucket: "diario-diario-b4f7f.firebasestorage.app",
    messagingSenderId: "503774258804",
    appId: "1:503774258804:web:c092b04b1fe27c9e201321",
    measurementId: "G-74F1B181DN"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
