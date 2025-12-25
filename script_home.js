document.addEventListener("DOMContentLoaded", function() {

    /* =========================================
       GESTION ACCORDÉON (Séquencé)
    ========================================= */
    const headers = document.querySelectorAll('.section-header');
    const sections = document.querySelectorAll('.accordion-section');

    const OPEN_SPEED = 350;
    const CLOSE_SPEED = 800;

    let isAnimating = false;

    headers.forEach(header => {
        header.addEventListener('click', (e) => {
            e.preventDefault();
            if (isAnimating) return;

            const parentSection = header.parentElement;
            const wasOpen = parentSection.classList.contains('is-open');
            const currentlyOpen = document.querySelector('.accordion-section.is-open');

            if (currentlyOpen && currentlyOpen !== parentSection) {
                isAnimating = true;
                closeSection(currentlyOpen, () => {
                    openSection(parentSection);
                    isAnimating = false;
                });
            } else if (wasOpen) {
                isAnimating = true;
                closeSection(parentSection, () => {
                    isAnimating = false;
                });
            } else {
                isAnimating = true;
                openSection(parentSection);
                isAnimating = false;
            }
        });
    });

    function closeSection(section, callback) {
        const content = section.querySelector('.section-content');
        const height = content.scrollHeight;
        const duration = Math.min(Math.max(height / CLOSE_SPEED, 0.2), 0.6);

        content.style.transition = `max-height ${duration}s ease-in, opacity ${duration * 0.5}s ease-out`;
        content.style.maxHeight = '0px';
        section.classList.remove('is-open');

        setTimeout(() => {
            content.style.maxHeight = null;
            if (callback) callback();
        }, duration * 1000);
    }

    function openSection(section) {
        const content = section.querySelector('.section-content');
        const height = content.scrollHeight;
        const duration = Math.min(Math.max(height / OPEN_SPEED, 0.5), 1.8);

        section.classList.add('is-open');
        content.style.transition = `max-height ${duration}s ease-out, opacity ${duration * 0.6}s ease-in`;
        content.style.maxHeight = height + "px";

        setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }


    /* =========================================
       EFFET LUMIÈRE DANS L'EAU (Bulles dégradées)
    ========================================= */
    const galleryItems = document.querySelectorAll('.gallery-item');
    const patisserieContent = document.getElementById('patisserie-content');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    let animationId = null;
    let bubbles = [];
    let time = 0;
    let targetOpacity = 0;
    let currentOpacity = 0;
    let baseColor = { r: 255, g: 255, b: 255 }; // Couleur de fond dynamique

    // Pré-charger et extraire les palettes
    const palettes = new Map();

    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        tempImg.src = img.src;

        tempImg.onload = () => {
            const palette = extractPalette(tempImg, 10);
            palettes.set(item, palette);
        };

        item.addEventListener('mouseenter', () => {
            const palette = palettes.get(item);
            if (palette && palette.length > 0) {
                startBubbleAnimation(palette);
            } else {
                const fallbackColor = item.getAttribute('data-bgcolor') || '#ffffff';
                if (patisserieContent) {
                    patisserieContent.style.background = fallbackColor;
                }
            }
        });

        item.addEventListener('mouseleave', () => {
            fadeOutAnimation();
        });
    });

    // Extraire la palette de couleurs
    function extractPalette(img, numColors) {
        const sampleSize = 150;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const pixels = [];

        try {
            for (let i = 0; i < sampleSize; i++) {
                const x = Math.floor(Math.random() * canvas.width);
                const y = Math.floor(Math.random() * canvas.height);
                const pixel = ctx.getImageData(x, y, 1, 1).data;
                pixels.push([pixel[0], pixel[1], pixel[2]]);
            }
        } catch (err) {
            return ['#f8b4d9', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#c4b5fd', '#fcd34d'].map(hex => ({
                hex,
                rgb: hexToRgb(hex)
            }));
        }

        const clusters = kMeansClustering(pixels, numColors);

        return clusters.map(c => ({
            hex: rgbToHex(c[0], c[1], c[2]),
            rgb: c
        }));
    }

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }

    function kMeansClustering(pixels, k) {
        let centers = pixels.slice(0, k).map(p => [...p]);

        for (let iter = 0; iter < 10; iter++) {
            const clusters = Array.from({ length: k }, () => []);

            pixels.forEach(pixel => {
                let minDist = Infinity;
                let closest = 0;

                centers.forEach((center, i) => {
                    const dist = colorDistance(pixel, center);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = i;
                    }
                });

                clusters[closest].push(pixel);
            });

            centers = clusters.map((cluster, i) => {
                if (cluster.length === 0) return centers[i];

                const avg = [0, 0, 0];
                cluster.forEach(p => {
                    avg[0] += p[0];
                    avg[1] += p[1];
                    avg[2] += p[2];
                });

                return [
                    Math.round(avg[0] / cluster.length),
                    Math.round(avg[1] / cluster.length),
                    Math.round(avg[2] / cluster.length)
                ];
            });
        }

        return centers;
    }

    function colorDistance(c1, c2) {
        return Math.sqrt(
            Math.pow(c1[0] - c2[0], 2) +
            Math.pow(c1[1] - c2[1], 2) +
            Math.pow(c1[2] - c2[2], 2)
        );
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    // Calculer une couleur de fond basée sur la palette
    function calculateBaseColor(palette) {
        let r = 0, g = 0, b = 0;
        palette.forEach(color => {
            r += color.rgb[0];
            g += color.rgb[1];
            b += color.rgb[2];
        });
        // Moyenne légèrement éclaircie
        return {
            r: Math.min(255, Math.round(r / palette.length * 0.3 + 180)),
            g: Math.min(255, Math.round(g / palette.length * 0.3 + 180)),
            b: Math.min(255, Math.round(b / palette.length * 0.3 + 180))
        };
    }

    // Créer une bulle
    function createBubble(color, index, total) {
        return {
            color: color,
            x: 10 + (index / total) * 80 + (Math.random() - 0.5) * 20,
            y: 20 + Math.random() * 60,
            // Bulles plus grandes
            size: 50 + Math.random() * 60,
            xSpeed: 0.0003 + Math.random() * 0.0005,
            ySpeed: 0.0002 + Math.random() * 0.0004,
            xAmplitude: 8 + Math.random() * 15,
            yAmplitude: 5 + Math.random() * 10,
            xPhase: Math.random() * Math.PI * 2,
            yPhase: Math.random() * Math.PI * 2,
            sizeSpeed: 0.0001 + Math.random() * 0.0002,
            sizeAmplitude: 10 + Math.random() * 15,
            sizePhase: Math.random() * Math.PI * 2,
            // Opacité plus élevée
            opacity: 0.7 + Math.random() * 0.25
        };
    }

    // Démarrer l'animation
    function startBubbleAnimation(palette) {
        // Calculer la couleur de fond teintée
        baseColor = calculateBaseColor(palette);

        // Créer plus de bulles pour plus de couverture
        bubbles = [];
        palette.forEach((color, i) => {
            bubbles.push(createBubble(color, i, palette.length));
        });

        // Ajouter des bulles supplémentaires
        palette.forEach((color, i) => {
            bubbles.push(createBubble(color, i + palette.length * 0.5, palette.length * 1.5));
        });

        // Encore quelques bulles pour remplir
        for (let i = 0; i < 4; i++) {
            const randomColor = palette[Math.floor(Math.random() * palette.length)];
            bubbles.push(createBubble(randomColor, Math.random() * palette.length, palette.length));
        }

        targetOpacity = 1;

        if (!animationId) {
            animateBubbles();
        }
    }

    function fadeOutAnimation() {
        targetOpacity = 0;
    }

    function animateBubbles() {
        if (!patisserieContent) return;

        time += 16;

        const opacitySpeed = 0.02;
        if (currentOpacity < targetOpacity) {
            currentOpacity = Math.min(currentOpacity + opacitySpeed, targetOpacity);
        } else if (currentOpacity > targetOpacity) {
            currentOpacity = Math.max(currentOpacity - opacitySpeed, targetOpacity);
        }

        if (currentOpacity <= 0 && targetOpacity <= 0) {
            patisserieContent.style.background = '#ffffff';
            animationId = null;
            bubbles = [];
            return;
        }

        // Interpoler la couleur de fond vers le blanc quand on quitte
        const bgR = Math.round(baseColor.r + (255 - baseColor.r) * (1 - currentOpacity));
        const bgG = Math.round(baseColor.g + (255 - baseColor.g) * (1 - currentOpacity));
        const bgB = Math.round(baseColor.b + (255 - baseColor.b) * (1 - currentOpacity));

        const gradients = bubbles.map(bubble => {
            const xOffset = Math.sin(time * bubble.xSpeed + bubble.xPhase) * bubble.xAmplitude;
            const yOffset = Math.sin(time * bubble.ySpeed + bubble.yPhase) * bubble.yAmplitude;
            const sizeOffset = Math.sin(time * bubble.sizeSpeed + bubble.sizePhase) * bubble.sizeAmplitude;

            const x = bubble.x + xOffset;
            const y = bubble.y + yOffset;
            const size = bubble.size + sizeOffset;

            const rgb = bubble.color.rgb;
            const opacity = bubble.opacity * currentOpacity;

            // Dégradé avec plus de couleur, moins de transparence
            return `radial-gradient(
                ellipse ${size}% ${size * 0.8}% at ${x}% ${y}%,
                rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity}) 0%,
                rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.85}) 25%,
                rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.6}) 50%,
                rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.3}) 75%,
                transparent 100%
            )`;
        });

        // Fond teinté au lieu du blanc pur
        patisserieContent.style.background = `
            ${gradients.join(',\n            ')},
            rgb(${bgR}, ${bgG}, ${bgB})
        `;

        animationId = requestAnimationFrame(animateBubbles);
    }

    console.log("Script Accueil : Accordéon + Effet lumière dans l'eau activés.");
});