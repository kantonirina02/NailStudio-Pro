import { db, collection, getDocs, query, orderBy, auth, onAuthStateChanged, signOut } from './firebase.js';

// --- 1. SÉCURITÉ : VÉRIFICATION DE LA CONNEXION ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        // L'utilisateur est connecté, on affiche son email en haut à droite
        document.getElementById('adminEmailDisplay').innerText = user.email;

        // Maintenant qu'on est sûr qu'il est connecté, on charge les données
        chargerReservations();
    } else {
        // Pas d'utilisateur connecté : expulsion vers la page de connexion
        window.location.replace('login.html');
    }
});

// --- 2. GESTION DE LA DÉCONNEXION ---
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        try {
            await signOut(auth);
            // Pas besoin de faire window.location ici, le onAuthStateChanged au-dessus 
            // va détecter la déconnexion et s'occuper de l'expulsion tout seul !
        } catch (error) {
            console.error("Erreur lors de la déconnexion", error);
        }
    });
}

// --- 3. LECTURE ET AFFICHAGE DES RÉSERVATIONS ---
async function chargerReservations() {
    const tableBody = document.getElementById('reservationsTableBody');

    try {
        // On prépare la requête (trier par date de création, la plus récente en premier)
        const q = query(collection(db, "reservations"), orderBy("creeLe", "desc"));

        // On va chercher les données sur Firebase
        const querySnapshot = await getDocs(q);

        // On vide le message "Chargement..." du tableau
        tableBody.innerHTML = '';

        // S'il n'y a aucune réservation
        if (querySnapshot.empty) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        Aucune réservation pour le moment.
                    </td>
                </tr>`;
            return;
        }

        // On boucle sur chaque réservation trouvée
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const tr = document.createElement('tr');

            // On définit la couleur du badge selon le statut
            let badgeClass = "bg-warning text-dark"; // En attente
            if (data.statut === "Confirmée") badgeClass = "bg-success";
            if (data.statut === "Annulée") badgeClass = "bg-danger";

            // On construit la ligne du tableau
            tr.innerHTML = `
                <td class="fw-medium">${data.date}</td>
                <td>${data.heure}</td>
                <td><span class="text-accent fw-medium">${data.prestation}</span></td>
                <td><span class="badge ${badgeClass}">${data.statut || 'En attente'}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-success me-1" title="Confirmer"><i class="bi bi-check-lg"></i></button>
                    <button class="btn btn-sm btn-outline-danger" title="Supprimer"><i class="bi bi-trash"></i></button>
                </td>
            `;

            // On ajoute la ligne au tableau
            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erreur lors du chargement :", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i> Erreur de connexion à la base de données.
                </td>
            </tr>`;
    }
}