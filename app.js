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