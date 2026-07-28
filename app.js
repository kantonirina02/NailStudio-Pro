import { db, collection, addDoc } from './firebase.js';
document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("mainNavbar");
    let lastScrollTop = 0;

    window.addEventListener("scroll", () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Si on scrolle vers le bas
        if (scrollTop > lastScrollTop) {
            navbar.style.transform = "translateY(-100%)";
            navbar.style.backgroundColor = "transparent";
        }
        // Si on scrolle vers le haut
        else {
            navbar.style.transform = "translateY(0)";
            // Ajoute un fond sombre si on n'est pas tout en haut
            if (scrollTop > 50) {
                navbar.style.backgroundColor = "rgba(44, 44, 44, 0.95)";
            } else {
                navbar.style.backgroundColor = "transparent";
            }
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
});

// --- ANIMATION DES COMPTEURS ---
const counters = document.querySelectorAll('.counter');
const speed = 200; // Plus le chiffre est bas, plus c'est rapide

const animateCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const increment = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};

// Intersection Observer pour déclencher l'animation au scroll
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        animateCounters();
        observer.disconnect(); // Arrête d'observer une fois l'animation jouée
    }
}, { threshold: 0.5 }); // Se déclenche quand 50% de la section est visible

const statsSection = document.getElementById('avant-apres');
if (statsSection) {
    observer.observe(statsSection);
}

// --- SYSTÈME DE FILTRES DE LA GALERIE ---
const filterButtons = document.querySelectorAll('.btn-filter');
const filterItems = document.querySelectorAll('.filter-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 1. Gérer l'apparence des boutons (actif/inactif)
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // 2. Récupérer la catégorie cliquée
        const filterValue = button.getAttribute('data-filter');

        // 3. Afficher ou masquer les images
        filterItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.classList.remove('hide-item');
            } else {
                item.classList.add('hide-item');
            }
        });
    });
});

// --- DÉFILEMENT AUTO DES AVIS CLIENTES ---
const avisContainer = document.getElementById('avisContainer');

if (avisContainer) {
    setInterval(() => {
        // Si on a atteint la fin du conteneur (avec une petite marge de tolérance de 10px)
        if (avisContainer.scrollLeft >= (avisContainer.scrollWidth - avisContainer.clientWidth - 10)) {
            // Retour au début
            avisContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            // Sinon, on scrolle vers la droite de 374px (350px de carte + 24px de gap)
            avisContainer.scrollBy({ left: 374, behavior: 'smooth' });
        }
    }, 4000); // Défile toutes les 4 secondes
}

// --- GESTION DU FORMULAIRE DE RÉSERVATION (FIREBASE) ---
const reservationForm = document.getElementById('reservationForm');

if (reservationForm) {
    reservationForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page au clic

        // 1. Récupération des valeurs saisies
        const prestation = document.getElementById('prestationSelect').value;
        const date = document.getElementById('dateInput').value;
        const heure = document.getElementById('heureSelect').value;

        // 2. Ciblage du bouton pour l'animation de chargement
        const btnSubmit = reservationForm.querySelector('button[type="submit"]');
        const originalBtnHtml = btnSubmit.innerHTML;

        try {
            // Modification visuelle du bouton pendant l'envoi
            btnSubmit.innerHTML = '<span>Envoi en cours...</span> <span class="spinner-border spinner-border-sm" role="status"></span>';
            btnSubmit.disabled = true;

            // 3. Envoi des données vers la collection "reservations" de Firestore
            await addDoc(collection(db, "reservations"), {
                prestation: prestation,
                date: date,
                heure: heure,
                statut: "En attente",
                creeLe: new Date() // Horodatage de la création
            });

            // 4. Succès : on prévient l'utilisateur et on vide le formulaire
            alert(`Génial ! La réservation pour le ${date} à ${heure} a bien été enregistrée.`);
            reservationForm.reset();

        } catch (error) {
            console.error("Erreur lors de la réservation : ", error);
            alert("Une erreur est survenue lors de la connexion au serveur. Veuillez réessayer.");
        } finally {
            // Quoi qu'il arrive (succès ou erreur), on remet le bouton à son état normal
            btnSubmit.innerHTML = originalBtnHtml;
            btnSubmit.disabled = false;
        }
    });
}