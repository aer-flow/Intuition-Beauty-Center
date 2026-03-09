document.addEventListener('DOMContentLoaded', () => {
    // 0. Global Prefs
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 1. Loader Logic
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 1000);
        }
    }, 1500);

    // 2. Custom Cursor
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (dot && ring) {
        
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let dotX = mouseX, dotY = mouseY;
        let ringX = mouseX, ringY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const animateCursor = () => {
            if (prefersReducedMotion.matches) {
                dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
                ring.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
                return;
            }

            // Lerp for smooth follow
            dotX += (mouseX - dotX) * 0.2;
            dotY += (mouseY - dotY) * 0.2;
            ringX += (mouseX - ringX) * 0.1;
            ringY += (mouseY - ringY) * 0.1;

            dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
            ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

            requestAnimationFrame(animateCursor);
        };
        
        if (!prefersReducedMotion.matches) animateCursor();
        else {
            window.addEventListener('mousemove', () => {
                dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
                ring.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
            });
        }

        // Cursor Hover effects
        const hoverTargets = document.querySelectorAll('a, button, .service-card, .team-card');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            target.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });
    }

    // 3. Canvas Gold Particles in Hero
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = height + Math.random() * 200;
                this.size = Math.random() * 2 + 0.5;
                this.speedY = Math.random() * 1 + 0.5;
                this.alpha = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.y -= this.speedY;
                if (this.y < -10) {
                    this.y = height + 10;
                    this.x = Math.random() * width;
                }
            }
            draw() {
                ctx.fillStyle = `rgba(201, 168, 76, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 50; i++) particles.push(new Particle());

        function animateParticles() {
            if (prefersReducedMotion.matches) return;
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateParticles);
        }
        if (!prefersReducedMotion.matches) animateParticles();
    }

    // 4. Header Scroll & Back To Top
    const header = document.getElementById('header');
    const btt = document.getElementById('btt');
    window.addEventListener('scroll', () => {
        if (header) {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
        
        if (btt) {
            if (window.scrollY > 400) btt.classList.add('visible');
            else btt.classList.remove('visible');
        }
    });

    if (btt) {
        btt.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 5. Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('active'));
        });
    }

    // 6. Scroll Reveal (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal:not(.hero-left h1, .hero-right, .scroll-indicator)');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Trigger counters if present
                    const counters = entry.target.querySelectorAll('.counter');
                    if (counters.length > 0) runCounters(counters);
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('active'));
    }

    // 7. Number Counters Animation
    function runCounters(counters) {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };
            updateCounter();
        });
    }

    // 8. Services Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const serviceGrids = document.querySelectorAll('.service-grid');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            serviceGrids.forEach(g => {
                g.classList.remove('active');
                g.style.animation = 'none'; // reset animation
            });
            
            // Add active to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetGrid = document.getElementById(targetId);
            if (targetGrid) {
                targetGrid.classList.add('active');
                // Trigger reflow to restart CSS animation
                void targetGrid.offsetWidth; 
                targetGrid.style.animation = 'fadeBlurUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            }
        });
    });

    // 9. Bento Grid Mouse-Follow Effect
    const bentoItems = document.querySelectorAll('.bento-item');
    bentoItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            item.style.setProperty('--x', `${x}%`);
            item.style.setProperty('--y', `${y}%`);
        });
    });

    // 10. Testimonial Slider (Auto-scroll + Manual Drag)
    const tickerWrap = document.querySelector('.ticker-wrap');
    if (tickerWrap && !prefersReducedMotion.matches) {
        const ticker = tickerWrap.querySelector('.ticker');
        let isDown = false;
        let startX;
        let scrollLeft;
        let velocity = 1; // Speed of auto-scroll
        let direction = 1; // 1 for right, -1 for left
        let animationId;
        
        // Clone for seamless loop if needed, but we already have two ticker divs in HTML
        // So we'll just handle the loop logic between them
        const scrollWidth = ticker.offsetWidth + 32; // card width + gap
        
        const autoScroll = () => {
            if (!isDown) {
                tickerWrap.scrollLeft += velocity * direction;
                
                // Seamless loop
                if (tickerWrap.scrollLeft >= ticker.offsetWidth) {
                    tickerWrap.scrollLeft = 0;
                } else if (tickerWrap.scrollLeft <= 0 && direction === -1) {
                    tickerWrap.scrollLeft = ticker.offsetWidth;
                }
            }
            animationId = requestAnimationFrame(autoScroll);
        };

        tickerWrap.addEventListener('mousedown', (e) => {
            isDown = true;
            tickerWrap.classList.add('active');
            startX = e.pageX - tickerWrap.offsetLeft;
            scrollLeft = tickerWrap.scrollLeft;
            cancelAnimationFrame(animationId);
        });

        tickerWrap.addEventListener('mouseleave', () => {
            isDown = false;
            tickerWrap.classList.remove('active');
            autoScroll();
        });

        tickerWrap.addEventListener('mouseup', () => {
            isDown = false;
            tickerWrap.classList.remove('active');
            autoScroll();
        });

        tickerWrap.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - tickerWrap.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast
            tickerWrap.scrollLeft = scrollLeft - walk;
            
            // Update direction based on movement
            direction = walk > 0 ? -1 : 1;
        });

        // Touch Events
        tickerWrap.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - tickerWrap.offsetLeft;
            scrollLeft = tickerWrap.scrollLeft;
            cancelAnimationFrame(animationId);
        });

        tickerWrap.addEventListener('touchend', () => {
            isDown = false;
            autoScroll();
        });

        tickerWrap.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - tickerWrap.offsetLeft;
            const walk = (x - startX) * 2;
            tickerWrap.scrollLeft = scrollLeft - walk;
            direction = walk > 0 ? -1 : 1;
        });

        // Start initial auto-scroll
        autoScroll();
    }
});
