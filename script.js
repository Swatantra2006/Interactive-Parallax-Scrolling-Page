document.addEventListener('DOMContentLoaded', () => {
    // 1. Loader
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1500);

    // 2. Custom Cursor
    const cursor = document.getElementById('custom-cursor');
    const cursorFollower = document.getElementById('custom-cursor-follower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // Immediate update for dot
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    // Smooth follower animation
    const updateFollower = () => {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(updateFollower);
    };
    updateFollower();

    // Hover states for cursor
    const interactables = document.querySelectorAll('a, button, .glass-card, .tilt-card');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => cursorFollower.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hovering'));
    });

    // 3. Smooth Parallax Scrolling
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const finalParallax = document.querySelector('.final-bg-parallax');
    let currentScrollY = window.scrollY;

    // Use requestAnimationFrame for smooth interpolation
    const updateParallax = () => {
        // Smooth scroll interpolation (lerp)
        currentScrollY += (window.scrollY - currentScrollY) * 0.1;
        
        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed'));
            const yPos = -(currentScrollY * speed);
            layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });

        if (finalParallax) {
            const speed = parseFloat(finalParallax.getAttribute('data-speed'));
            // Compute offset specifically for the final section so it doesn't move offscreen too early
            const finalRect = document.getElementById('section-final').getBoundingClientRect();
            // Start parallax only when it's near the viewport
            if (finalRect.top < window.innerHeight * 1.5) {
                const offset = (window.scrollY - (document.body.scrollHeight - window.innerHeight)); 
                const yPos = offset * speed;
                finalParallax.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        }
        
        requestAnimationFrame(updateParallax);
    };
    updateParallax();

    // 4. Scroll Progress & Back to Top
    const progressBar = document.getElementById('scroll-progress-bar');
    const backToTop = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        // Progress bar
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        progressBar.style.width = `${progress}%`;

        // Back to top visibility
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 5. Intersection Observer for Reveals
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it's a progress container, trigger the fill animation
                if (entry.target.classList.contains('progress-container')) {
                    const fill = entry.target.querySelector('.progress-fill');
                    if (fill) {
                        fill.style.width = fill.getAttribute('data-width');
                    }
                }
                // Unobserve after revealing to keep it visible
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .timeline-item');
    revealElements.forEach(el => observer.observe(el));

    // 6. Tilt Effect for Experience Zone Cards
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        const inner = card.querySelector('.tilt-card-inner');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotation up to 15 degrees
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;
            
            inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            inner.style.transform = `rotateX(0deg) rotateY(0deg)`;
        });
    });

    // 7. Canvas Confetti Effect for CTA
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    let isConfettiActive = false;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const colors = ['#00F0FF', '#B026FF', '#FF00E5', '#FFFFFF'];

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.r = Math.random() * 6 + 2;
            this.dx = Math.random() * 12 - 6;
            this.dy = Math.random() * -15 - 5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.tilt = Math.floor(Math.random() * 10) - 10;
            this.tiltAngleInc = (Math.random() * 0.07) + 0.05;
            this.tiltAngle = 0;
            this.gravity = 0.3;
        }

        update() {
            this.dy += this.gravity;
            this.x += this.dx;
            this.y += this.dy;
            this.tiltAngle += this.tiltAngleInc;
            // Wobble effect
            this.x += Math.sin(this.tiltAngle) * 2;
        }

        draw() {
            ctx.beginPath();
            ctx.lineWidth = this.r;
            ctx.strokeStyle = this.color;
            ctx.moveTo(this.x + this.tilt + this.r, this.y);
            ctx.lineTo(this.x + this.tilt, this.y + this.tilt + this.r);
            ctx.stroke();
        }
    }

    const animateConfetti = () => {
        if (!isConfettiActive && particles.length === 0) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, index) => {
            p.update();
            p.draw();
            // Remove particle if off screen
            if (p.y > canvas.height) {
                particles.splice(index, 1);
            }
        });
        
        requestAnimationFrame(animateConfetti);
    };

    const btnConfetti = document.getElementById('btn-confetti');
    btnConfetti.addEventListener('click', () => {
        const rect = btnConfetti.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
        
        // Spawn 150 particles
        for (let i = 0; i < 150; i++) {
            particles.push(new Particle(startX, startY));
        }
        
        if (!isConfettiActive) {
            isConfettiActive = true;
            animateConfetti();
            // Stop flag after a few seconds when particles are clear
            setTimeout(() => {
                isConfettiActive = false;
            }, 6000);
        }
    });

    // 8. Ambient Glow: gently follows the mouse globally
    const ambientGlow = document.getElementById('ambient-glow');
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        ambientGlow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(176, 38, 255, 0.08) 0%, transparent 60%)`;
    });
});
