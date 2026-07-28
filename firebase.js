// Importation des modules Firebase officiels (via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyD4e_v9e4UwZ0n8oefaavLdR65ltUVskB4",
    authDomain: "nailstudio-pro-df43f.firebaseapp.com",
    projectId: "nailstudio-pro-df43f",
    storageBucket: "nailstudio-pro-df43f.firebasestorage.app",
    messagingSenderId: "1058129096752",
    appId: "1:1058129096752:web:b62f6e59c37d00badd3df5"
};

// Initialisation de l'application et de la base de données
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// On exporte la base de données pour pouvoir l'utiliser dans app.js
export { db, collection, addDoc, auth, signInWithEmailAndPassword };