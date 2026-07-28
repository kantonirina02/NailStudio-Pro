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