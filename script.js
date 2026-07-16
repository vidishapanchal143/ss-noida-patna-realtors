/* ================================================================
   SS NOIDA PATNA REALTORS — MASTER JAVASCRIPT
   All interactivity: video loop, parallax, 3D tilt, flip cards,
   scroll reveals, counters, stat rings, carousel, lightbox, forms
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ================================================================
     1. NAVBAR — glass-blur shrink on scroll + mobile menu
     ================================================================ */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
    });
  });

  /* ================================================================
     2. HERO VIDEO ALTERNATION — dual clip loop via 'ended' event
     ================================================================ */
  const videoA = document.getElementById('heroVideoA');
  const videoB = document.getElementById('heroVideoB');

  if (videoA && videoB) {
    // When clip A ends, crossfade to clip B
    videoA.addEventListener('ended', () => {
      videoA.classList.remove('active');
      videoB.classList.add('active');
      videoB.currentTime = 0;
      videoB.play().catch(() => {});
    });

    // When clip B ends, crossfade back to clip A
    videoB.addEventListener('ended', () => {
      videoB.classList.remove('active');
      videoA.classList.add('active');
      videoA.currentTime = 0;
      videoA.play().catch(() => {});
    });

    // Kick off the first clip
    videoA.play().catch(() => {
      // Autoplay blocked — show poster, user can interact to start
      console.log('Autoplay blocked by browser; poster image shown instead.');
    });
  }

  /* ================================================================
     3. HERO LOAD-IN SEQUENCE — staggered fade+rise
     ================================================================ */
  const heroItems = document.querySelectorAll('.hero-load-item');
  heroItems.forEach((item, i) => {
    setTimeout(() => {
      item.style.transition = 'opacity .9s cubic-bezier(.2,.8,.2,1), transform .9s cubic-bezier(.2,.8,.2,1)';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, 200 + i * 160);
  });

  /* ================================================================
     4. BLUEPRINT SVG LINE — self-draw on page load
     ================================================================ */
  const svgPath = document.querySelector('.blueprint-route-path');
  if (svgPath) {
    // Calculate actual path length for precision
    const pathLength = svgPath.getTotalLength();
    svgPath.style.strokeDasharray = pathLength;
    svgPath.style.strokeDashoffset = pathLength;

    setTimeout(() => {
      svgPath.style.transition = 'stroke-dashoffset 3.5s cubic-bezier(.2,.8,.2,1)';
      svgPath.style.strokeDashoffset = '0';
    }, 800);
  }

  /* ================================================================
     5. PARALLAX SCROLL — hero video moves slower than content
     ================================================================ */
  const heroParallax = document.getElementById('heroParallax');
  if (heroParallax) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight * 1.2) {
        heroParallax.style.transform = `translateY(${scrollY * 0.35}px)`;
      }
    }, { passive: true });
  }

  /* ================================================================
     6. SCROLL REVEALS — IntersectionObserver site-wide
     ================================================================ */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');

        // Stagger children (grid items)
        const children = entry.target.querySelectorAll('.reveal-child, .flip-card, .gallery-item, .investment-card');
        children.forEach((child, i) => {
          setTimeout(() => child.classList.add('revealed'), i * 100);
        });

        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Also observe children that are directly in the DOM (not nested in a .reveal grid)
  document.querySelectorAll('.reveal-child').forEach(el => {
    revealObserver.observe(el);
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ================================================================
     7. COUNT-UP STATS — requestAnimationFrame triggered on scroll
     ================================================================ */
  const counters = document.querySelectorAll('.counter-number');

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = +el.getAttribute('data-target');
      const duration = 2200; // ms
      const start = performance.now();

      const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = Math.ceil(eased * target);
        el.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target.toLocaleString() + '+';
          el.style.animation = 'counterPulse .4s ease';
        }
      };

      requestAnimationFrame(update);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  /* ================================================================
     8. 3D FLIP CARDS — click/tap to flip, mouse tilt on front face
     ================================================================ */
  const flipCards = document.querySelectorAll('.flip-card');

  flipCards.forEach(card => {
    // Click to flip
    card.addEventListener('click', (e) => {
      // Don't flip if clicking the WhatsApp button on back
      if (e.target.closest('.btn-whatsapp')) return;
      card.classList.toggle('flipped');
    });

    // 3D tilt on hover (front face only)
    const inner = card.querySelector('.flip-card-inner');
    card.addEventListener('mousemove', (e) => {
      if (card.classList.contains('flipped')) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10; // max 10deg
      const rotateY = ((x - centerX) / centerX) * 10;

      inner.style.transition = 'none';
      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1)';
      if (card.classList.contains('flipped')) {
        inner.style.transform = 'rotateY(180deg)';
      } else {
        inner.style.transform = 'rotateX(0) rotateY(0)';
      }
    });
  });

  /* ================================================================
     9. TILT CARDS — for project and blog cards (non-flip)
     ================================================================ */
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      card.classList.add('tilt-active');
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('tilt-active');
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  /* ================================================================
     10. PROPERTY FILTERING — Buy / Sell / All
     ================================================================ */
  function setupFiltering(btnSelector, itemSelector) {
    const btns = document.querySelectorAll(btnSelector);
    const items = document.querySelectorAll(itemSelector);

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        items.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          if (match) {
            item.classList.remove('hidden');
            item.style.opacity = '0';
            item.style.transform = 'scale(.95)';
            requestAnimationFrame(() => {
              item.style.transition = 'opacity .4s, transform .4s';
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            });
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(.9)';
            setTimeout(() => item.classList.add('hidden'), 350);
          }
        });
      });
    });
  }

  setupFiltering('.filter-btn', '.flip-card');
  setupFiltering('.gallery-filter-btn', '.gallery-item');

  /* ================================================================
     11. GALLERY LIGHTBOX — custom-built, fade/scale-in, next/prev
     ================================================================ */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const galleryItems = document.querySelectorAll('.gallery-item');
  let currentLBIndex = 0;

  const galleryData = Array.from(galleryItems).map(item => ({
    src: item.querySelector('img').src,
    title: item.querySelector('h4')?.textContent || 'Gallery Image'
  }));

  function openLightbox(index) {
    currentLBIndex = index;
    lightboxImg.src = galleryData[index].src;
    lightboxCaption.textContent = galleryData[index].title;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
  document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-overlay')?.addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-next')?.addEventListener('click', () => openLightbox((currentLBIndex + 1) % galleryData.length));
  document.querySelector('.lightbox-prev')?.addEventListener('click', () => openLightbox((currentLBIndex - 1 + galleryData.length) % galleryData.length));

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') openLightbox((currentLBIndex + 1) % galleryData.length);
    if (e.key === 'ArrowLeft') openLightbox((currentLBIndex - 1 + galleryData.length) % galleryData.length);
  });

  /* ================================================================
     12. INVESTMENT STAT RINGS — SVG stroke-dashoffset on scroll
     ================================================================ */
  // Inject SVG gradient definition once
  const svgNS = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(svgNS, 'svg');
  defs.setAttribute('width', '0');
  defs.setAttribute('height', '0');
  defs.setAttribute('style', 'position:absolute');
  defs.innerHTML = `<defs><linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#2F4C3B"/><stop offset="100%" stop-color="#B08D46"/>
  </linearGradient></defs>`;
  document.body.appendChild(defs);

  const statRings = document.querySelectorAll('.stat-ring');
  const circumference = 2 * Math.PI * 52; // r=52

  // Set initial state
  statRings.forEach(ring => {
    const fill = ring.querySelector('.ring-fill');
    if (fill) {
      fill.style.strokeDasharray = circumference;
      fill.style.strokeDashoffset = circumference;
    }
  });

  const ringObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const ring = entry.target;
      const percentage = +ring.dataset.percentage;
      const fill = ring.querySelector('.ring-fill');
      const offset = circumference - (circumference * percentage / 100);

      setTimeout(() => {
        fill.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.2,.8,.2,1)';
        fill.style.strokeDashoffset = offset;
      }, 200);

      obs.unobserve(ring);
    });
  }, { threshold: 0.5 });

  statRings.forEach(ring => ringObserver.observe(ring));

  /* ================================================================
     13. TESTIMONIAL CAROUSEL — auto-advance + dot navigation
     ================================================================ */
  const track = document.getElementById('testimonialTrack');
  const dots = document.querySelectorAll('.testimonial-dots button');
  const slideCount = dots.length;
  let currentSlide = 0;
  let carouselInterval;

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach(d => d.classList.remove('active'));
    dots[currentSlide]?.classList.add('active');
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(+dot.dataset.index);
      resetCarousel();
    });
  });

  function nextSlide() {
    goToSlide((currentSlide + 1) % slideCount);
  }

  function resetCarousel() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 5000);
  }

  if (track) resetCarousel();

  /* ================================================================
     14. CONTACT FORM — WhatsApp deep link + mailto backup
     ================================================================ */
  const leadForm = document.getElementById('leadForm');
  const formFeedback = document.getElementById('formFeedback');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const budget = document.getElementById('budget').value;
      const propertyType = document.getElementById('propertyType').value;
      const message = document.getElementById('message').value.trim();

      // Validate required
      if (!fullName || !phone) {
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Please fill in your name and phone number.';
        return;
      }

      if (!/^[0-9]{10}$/.test(phone)) {
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Please enter a valid 10-digit phone number.';
        return;
      }

      const text = [
        `Hello SS Noida Patna Realtors,`,
        `I am interested in real estate services.`,
        `Name: ${fullName}`,
        `Phone: ${phone}`,
        email ? `Email: ${email}` : '',
        budget ? `Budget: ${budget}` : '',
        propertyType ? `Property Type: ${propertyType}` : '',
        message ? `Message: ${message}` : ''
      ].filter(Boolean).join('\n');

      const waURL = `https://wa.me/919876543210?text=${encodeURIComponent(text)}`;
      window.open(waURL, '_blank');

      // Backup: mailto
      const mailSubject = `Real Estate Enquiry from ${fullName}`;
      const mailBody = text;
      window.location.href = `mailto:info@ssnoidapatnarealtors.com?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

      formFeedback.className = 'form-feedback success';
      formFeedback.textContent = '✅ Redirecting to WhatsApp...';
      leadForm.reset();
    });
  }

  /* ================================================================
     14.5 FOUNDER CARD — mobile tap toggle
     ================================================================ */
  const founderCard = document.getElementById('founderCard');
  if (founderCard) {
    founderCard.addEventListener('click', () => {
      founderCard.classList.toggle('active');
    });
  }

  /* ================================================================
     15. THREE.JS — optional ambient particle field in hero
     ================================================================ */
  if (typeof THREE !== 'undefined') {
    const container = document.getElementById('hero-canvas-container');
    if (container) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Create particles
      const geo = new THREE.BufferGeometry();
      const count = 350;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 12;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.018,
        color: 0xB08D46,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
      });

      const particles = new THREE.Points(geo, mat);
      scene.add(particles);
      camera.position.z = 3;

      let mouseX = 0, mouseY = 0;
      document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
      });

      function animate() {
        requestAnimationFrame(animate);
        particles.rotation.y += 0.0008;
        particles.rotation.x += 0.0004;
        camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.04;
        camera.position.y += (-mouseY * 0.6 - camera.position.y) * 0.04;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }
  }
});
