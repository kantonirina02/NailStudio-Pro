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

// --- NAVIGATION ENTRE LES VUES ---
const navReservations = document.getElementById('navReservations');
const navGalerie = document.getElementById('navGalerie');
const viewReservations = document.getElementById('viewReservations');
const viewGalerie = document.getElementById('viewGalerie');
const pageTitle = document.getElementById('pageTitle');

if (navReservations && navGalerie) {
    navReservations.addEventListener('click', () => {
        navReservations.classList.add('active');
        navGalerie.classList.remove('active');
        viewReservations.classList.remove('d-none');
        viewGalerie.classList.add('d-none');
        pageTitle.innerText = "Gestion des Rendez-vous";
    });

    navGalerie.addEventListener('click', () => {
        navGalerie.classList.add('active');
        navReservations.classList.remove('active');
        viewGalerie.classList.remove('d-none');
        viewReservations.classList.add('d-none');
        pageTitle.innerText = "Gestion de la Galerie";
        chargerGalerieAdmin();
    });
}

// --- GESTION DE LA GALERIE (CLOUDINARY + FIRESTORE) ---
import { addDoc } from './firebase.js'; // On s'assure d'avoir addDoc pour sauvegarder l'URL

const photoCategory = document.getElementById('photoCategory');
const btnUpload = document.getElementById('btnUpload');
const photoInput = document.getElementById('photoInput');
const uploadStatus = document.getElementById('uploadStatus');
const adminGalleryGrid = document.getElementById('adminGalleryGrid');

const CLOUD_NAME = "p2rylivd";
const UPLOAD_PRESET = "cjh1trff";

if (btnUpload) {
    btnUpload.addEventListener('click', async () => {
        const file = photoInput.files[0];
        if (!file) return alert("Veuillez sélectionner une image.");

        try {
            btnUpload.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Envoi...';
            btnUpload.disabled = true;

            // 1. Envoi sur Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);

            const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData
            });

            const cloudinaryData = await cloudinaryRes.json();
            const imageUrl = cloudinaryData.secure_url;

            // 2. Sauvegarde de l'URL dans Firestore (Collection "galerie")
            // On récupère la catégorie choisie
            const categorieChoisie = photoCategory.value;

            // Sauvegarde de l'URL et de la catégorie dans Firestore
            await addDoc(collection(db, "galerie"), {
                url: imageUrl,
                categorie: categorieChoisie,
                creeLe: new Date()
            });

            uploadStatus.classList.remove('d-none');
            photoInput.value = "";
            setTimeout(() => uploadStatus.classList.add('d-none'), 3000);
            chargerGalerieAdmin();

        } catch (error) {
            console.error("Erreur d'upload :", error);
            alert("Erreur lors de l'envoi de l'image.");
        } finally {
            btnUpload.innerHTML = '<i class="bi bi-upload me-2"></i> Envoyer';
            btnUpload.disabled = false;
        }
    });
}

// Affichage des images
async function chargerGalerieAdmin() {
    if (!adminGalleryGrid) return;
    adminGalleryGrid.innerHTML = '<div class="spinner-border text-secondary"></div>';

    try {
        const q = query(collection(db, "galerie"), orderBy("creeLe", "desc"));
        const querySnapshot = await getDocs(q);

        adminGalleryGrid.innerHTML = '';

        if (querySnapshot.empty) {
            adminGalleryGrid.innerHTML = '<p class="text-muted">Aucune photo dans la galerie.</p>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const div = document.createElement('div');
            div.className = 'col-6 col-md-4 col-lg-3';
            div.innerHTML = `
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 position-relative">
                    <span class="badge bg-dark position-absolute top-0 start-0 m-2 z-1">${data.categorie || 'Autre'}</span>
                    <img src="${data.url}" class="w-100 object-fit-cover" style="height: 150px;" alt="Réalisation">
                </div>
            `;
            adminGalleryGrid.appendChild(div);
        });

    } catch (error) {
        console.error("Erreur de chargement :", error);
        adminGalleryGrid.innerHTML = '<p class="text-danger">Erreur de chargement.</p>';
    }
}