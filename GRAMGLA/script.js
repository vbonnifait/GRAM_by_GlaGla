document.addEventListener("DOMContentLoaded", function() {

    /* =========================================
       1. GESTION DES FONDS (Images / Vidéos)
       Transition retardée pour laisser le texte partir d'abord
    ========================================= */
    const sections = document.querySelectorAll('.scroll-step, .tall-video-section');
    const bgLayers = document.querySelectorAll('.bg-layer');

    const backgroundObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = entry.target.getAttribute('data-index');

                bgLayers.forEach(layer => layer.classList.remove('active'));
                if(bgLayers[index]) {
                    bgLayers[index].classList.add('active');
                    if(bgLayers[index].tagName === 'VIDEO') {
                        bgLayers[index].play().catch(() => {});
                    }
                }
            }
        });
    }, {
        // L'image change quand la section est bien visible (50% de l'écran)
        threshold: 0.5,
        rootMargin: "0px 0px 0px 0px"
    });


    /* =========================================
       2. GESTION DES TEXTES
       Disparition anticipée avant le changement d'image
    ========================================= */
    const cards = document.querySelectorAll('.glass-card, .glass-card-sticky');

    // Observer pour le PREMIER texte
    const firstCardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                const rect = entry.boundingClientRect;
                if (rect.top < 0) {
                    entry.target.classList.remove('visible');
                }
            }
        });
    }, {
        // Disparaît tôt quand on scroll vers le bas (-40% en bas)
        rootMargin: "0px 0px -40% 0px",
        threshold: 0.1
    });

    // Observer pour les AUTRES textes
    const otherCardsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        // Disparaît tôt : -35% en haut, -40% en bas
        // Laisse du temps pour voir l'image seule
        rootMargin: "-35% 0px -40% 0px",
        threshold: 0
    });


    // Appliquer les observers
    cards.forEach((card, index) => {
        if (index === 0) {
            firstCardObserver.observe(card);
        } else {
            otherCardsObserver.observe(card);
        }
    });

    sections.forEach(section => backgroundObserver.observe(section));

    console.log("Script : Texte anticipé + Image retardée activés.");
});