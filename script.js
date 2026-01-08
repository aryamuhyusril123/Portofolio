/* script.js */

document.addEventListener('DOMContentLoaded', () => {
    // === 1. Inisialisasi Variabel ===
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const navbar = document.getElementById('navbar');
    const filterButtons = document.querySelectorAll('.filter');
    const photoItems = document.querySelectorAll('.photo-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const galleryItems = document.querySelectorAll('.open-lightbox');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a');
    const ctaButton = document.querySelector('.cta-button');
    const contactLinks = document.querySelectorAll('.contact-link');
    const whatsappFloat = document.querySelector('.whatsapp-float');

    // === 2. Navbar & Mobile Menu ===
    function initNavbar() {
        // Toggle Mobile Menu
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            menuToggle.textContent = mobileNav.classList.contains('active') ? '✕' : '☰';
            menuToggle.setAttribute('aria-expanded', mobileNav.classList.contains('active'));
        });

        // Close mobile menu when clicking links
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                menuToggle.textContent = '☰';
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Navbar Scroll Effect
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                menuToggle.textContent = '☰';
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // === 3. Scroll Spy Navigation ===
    function initScrollSpy() {
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach((section) => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;
                
                if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                    current = section.getAttribute("id");
                }
            });

            navLinks.forEach((link) => {
                link.classList.remove("active");
                const href = link.getAttribute("href");
                if (href && href.includes(current)) {
                    link.classList.add("active");
                }
            });
        });

        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const navbarHeight = navbar.offsetHeight;
                    const targetPosition = targetElement.offsetTop - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // === 4. Gallery Filtering ===
    function initGalleryFilter() {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                
                // Add active class to clicked button
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
                
                const category = button.dataset.category;

                // Filter photos with animation
                photoItems.forEach(item => {
                    const itemCategory = item.dataset.category;
                    
                    if (category === 'all' || itemCategory === category) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.classList.remove('hidden');
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 10);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.classList.add('hidden');
                            item.style.display = 'none';
                        }, 300);
                    }
                });

                // Announce filter change for screen readers
                const filterName = category === 'all' ? 'All photos' : category + ' photos';
                announceToScreenReader(`Now showing ${filterName}`);
            });
        });
    }

    // === 5. Lightbox Gallery ===
    function initLightbox() {
        // Open Lightbox
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const imgSrc = item.getAttribute('data-src');
                const imgCaption = item.getAttribute('data-caption');
                const imgAlt = item.querySelector('img').getAttribute('alt');

                lightboxImg.src = imgSrc;
                lightboxImg.alt = imgAlt;
                lightboxCaption.textContent = imgCaption;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Announce to screen readers
                announceToScreenReader(`Opened image: ${imgCaption}`);
            });

            // Add keyboard navigation for gallery items
            item.setAttribute('tabindex', '0');
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });

        // Close Lightbox
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            lightboxImg.src = '';
            lightboxCaption.textContent = '';
        }

        lightboxClose.addEventListener('click', closeLightbox);
        
        // Close on backdrop click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
            
            // Keyboard navigation in lightbox
            if (lightbox.classList.contains('active')) {
                if (e.key === 'ArrowRight') navigateLightbox(1);
                if (e.key === 'ArrowLeft') navigateLightbox(-1);
            }
        });

        // Lightbox navigation
        function navigateLightbox(direction) {
            const currentIndex = Array.from(galleryItems).findIndex(item => 
                item.getAttribute('data-src') === lightboxImg.src
            );
            
            if (currentIndex !== -1) {
                const nextIndex = (currentIndex + direction + galleryItems.length) % galleryItems.length;
                galleryItems[nextIndex].click();
            }
        }

        // Add navigation buttons to lightbox
        const lightboxNav = document.createElement('div');
        lightboxNav.className = 'lightbox-nav';
        lightboxNav.innerHTML = `
            <button class="lightbox-prev" aria-label="Previous photo">‹</button>
            <button class="lightbox-next" aria-label="Next photo">›</button>
        `;
        lightbox.querySelector('.lightbox-content').appendChild(lightboxNav);

        // Navigation button events
        lightbox.querySelector('.lightbox-prev').addEventListener('click', () => navigateLightbox(-1));
        lightbox.querySelector('.lightbox-next').addEventListener('click', () => navigateLightbox(1));
    }

    // === 6. Interactive Elements ===
    function initInteractiveElements() {
        // CTA Button Hover Effect
        if (ctaButton) {
            ctaButton.addEventListener('mouseenter', () => {
                ctaButton.style.transform = 'translateY(-3px) scale(1.05)';
            });
            
            ctaButton.addEventListener('mouseleave', () => {
                ctaButton.style.transform = 'translateY(0) scale(1)';
            });
        }

        // Contact Links Animation
        contactLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateX(10px)';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateX(0)';
            });
        });

        // WhatsApp Float Animation
        if (whatsappFloat) {
            whatsappFloat.addEventListener('mouseenter', () => {
                whatsappFloat.style.transform = 'scale(1.1) rotate(5deg)';
            });
            
            whatsappFloat.addEventListener('mouseleave', () => {
                whatsappFloat.style.transform = 'scale(1) rotate(0)';
            });
        }

        // Skill Tags Animation
        document.querySelectorAll('.skill-tag').forEach(tag => {
            tag.addEventListener('mouseenter', () => {
                tag.style.transform = 'translateY(-5px)';
            });
            
            tag.addEventListener('mouseleave', () => {
                tag.style.transform = 'translateY(0)';
            });
        });
    }

    // === 7. Performance & Accessibility ===
    function initPerformanceFeatures() {
        // Lazy Loading for Images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Debounce scroll events
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                // Perform actions after scroll stops
            }, 100);
        });

        // Screen Reader Announcements
        window.announceToScreenReader = function(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        };
    }

    // === 8. Form Handling (for future contact form) ===
    function initFormHandling() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                // Show loading state
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
                
                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Success
                    contactForm.innerHTML = `
                        <div class="success-message" style="text-align: center; padding: 40px;">
                            <h3>Message Sent Successfully!</h3>
                            <p>Thank you for your message. I'll get back to you soon.</p>
                        </div>
                    `;
                    
                    announceToScreenReader('Message sent successfully');
                } catch (error) {
                    // Error handling
                    console.error('Form submission error:', error);
                    submitBtn.textContent = 'Error - Try Again';
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }, 2000);
                }
            });
        }
    }

    // === 9. Analytics & Tracking ===
    function initAnalytics() {
        // Track gallery interactions
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                console.log(`Gallery item clicked: ${category} - ${item.dataset.caption}`);
                // Here you can add Google Analytics or other tracking
            });
        });

        // Track filter usage
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                console.log(`Gallery filter used: ${category}`);
            });
        });

        // Track section visibility
        const observerOptions = {
            threshold: 0.5
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log(`Section entered viewport: ${entry.target.id}`);
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    // === 10. Initialize Everything ===
    function init() {
        initNavbar();
        initScrollSpy();
        initGalleryFilter();
        initLightbox();
        initInteractiveElements();
        initPerformanceFeatures();
        initFormHandling();
        initAnalytics();
        
        console.log('Portfolio initialized successfully');
    }

    // Start the application
    init();

    // === Utility Functions ===
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Add CSS for new elements
    const style = document.createElement('style');
    style.textContent = `
        .lightbox-nav {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            transform: translateY(-50%);
            pointer-events: none;
        }
        
        .lightbox-prev,
        .lightbox-next {
            pointer-events: all;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s, transform 0.3s;
            margin: 0 20px;
        }
        
        .lightbox-prev:hover,
        .lightbox-next:hover {
            background: rgba(0, 0, 0, 0.8);
            transform: scale(1.1);
        }
        
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        .photo-item {
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .photo-item.hidden {
            display: none;
        }
        
        @media (max-width: 768px) {
            .lightbox-prev,
            .lightbox-next {
                width: 40px;
                height: 40px;
                font-size: 20px;
                margin: 0 10px;
            }
        }
    `;
    document.head.appendChild(style);
});