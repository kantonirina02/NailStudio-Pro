import { auth, signInWithEmailAndPassword } from './firebase.js';

// --- GESTION DE LA CONNEXION (LOGIN) ---
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const btnSubmit = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = btnSubmit.innerText;

        try {
            // Animation de chargement
            btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Connexion...';
            btnSubmit.disabled = true;
            loginError.classList.add('d-none'); // On cache l'erreur précédente

            // Demande de connexion à Firebase
            await signInWithEmailAndPassword(auth, email, password);

            // Succès : On redirige vers le futur tableau de bord
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error("Erreur de connexion :", error.code);

            // Affichage de l'erreur visuelle
            loginError.classList.remove('d-none');

            // Remise à zéro du bouton
            btnSubmit.innerText = originalBtnText;
            btnSubmit.disabled = false;
            document.getElementById('passwordInput').value = ""; // On vide le mot de passe
        }
    });
}