/* ========================================================
   ALTRIX AGENCY — script.js
   Interactive functionality (Highly Optimized & Foolproof)
   ======================================================== */

const startApp = () => {
  const body = document.body || document.documentElement;
  
  // Detect mobile and touch devices
  const isMobileOrTouch = window.innerWidth < 1024 || 
                          ('ontouchstart' in window) || 
                          (navigator.maxTouchPoints > 0) ||
                          (navigator.msMaxTouchPoints > 0);

  // ── 0. INITIALIZE FLOATING LINES BACKGROUND (Desktop Only) ──
  const heroLinesContainer = document.getElementById('heroFloatingLines');
  const heroSection = document.getElementById('home');
  let floatingLinesInstance = null;

  if (!isMobileOrTouch && heroLinesContainer && window.FloatingLines && window.THREE) {
    floatingLinesInstance = new window.FloatingLines(heroLinesContainer, {
      linesGradient: ['#0d0d0c', '#7c725e', '#a8a090', '#c2baa8'], 
      enabledWaves: ['top', 'middle', 'bottom'],
      lineCount: [4, 5, 6],
      lineDistance: [14, 12, 10],
      bendRadius: 5.0,
      bendStrength: -0.5,
      interactive: true,
      parallax: true,
      eventSource: heroSection || window
    });
  }

  /* ── 1. STATS COUNTER & ENTRANCE TRIGGER ── */
  const triggerStatsCounter = () => {
    const statNums = document.querySelectorAll('.stat-num');
    statNums.forEach(el => animateCounter(el, parseInt(el.dataset.target), 2200));
  };

  const animateCounter = (el, target, duration = 2000) => {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };

  // Trigger stat counter after a slight page load buffer
  setTimeout(triggerStatsCounter, 300);

  /* ── 2. CUSTOM BUBBLE CURSOR FOLLOWER (Desktop Only) ── */
  const customCursor = document.getElementById('customCursor');
  const cursorText = document.getElementById('cursorText');
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let mouseX = cx, mouseY = cy;
  let cursorAnimationFrame = null;

  if (!isMobileOrTouch && customCursor) {
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const renderCursor = () => {
      cx += (mouseX - cx) * 0.15;
      cy += (mouseY - cy) * 0.15;
      customCursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      cursorAnimationFrame = requestAnimationFrame(renderCursor);
    };
    renderCursor();

    document.addEventListener('pointerover', e => {
      const el = e.target.closest('[data-cursor-text]');
      if (el && cursorText) {
        const text = el.getAttribute('data-cursor-text');
        cursorText.textContent = text;
        customCursor.classList.add('active');
      }
    });

    document.addEventListener('pointerout', e => {
      const el = e.target.closest('[data-cursor-text]');
      if (el) {
        customCursor.classList.remove('active');
      }
    });
  }

  /* ── 3. NAVBAR SCROLL EFFECT ── */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
    if (backToTop) {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }
  }, { passive: true });

  /* ── 4. MOBILE HAMBURGER ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });
  }
  document.querySelectorAll('.mobile-link, .mobile-cta-btn').forEach(link => {
    link.addEventListener('click', () => {
      if (hamburger) hamburger.classList.remove('active');
      if (mobileMenu) mobileMenu.classList.remove('open');
    });
  });

  /* ── 5. SMOOTH SCROLL FOR ANCHOR LINKS ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  /* ── 6. INTERSECTION OBSERVER FOR STATS COUNTERS ── */
  let countersStarted = false;
  const heroObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        triggerStatsCounter();
      }
    });
  }, { threshold: 0.3 });
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) heroObserver.observe(heroStats);

  /* ── 7. SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll(
    '.service-card, .portfolio-card, .founder-card, .process-step, .about-card, .contact-detail'
  );
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 3 === 1) el.classList.add('reveal-delay-1');
    if (i % 3 === 2) el.classList.add('reveal-delay-2');
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  document.querySelectorAll('.section-header').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  /* ── 8. PORTFOLIO FILTER TABS ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      portfolioCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        if (show) {
          card.style.opacity = '1';
          card.style.transform = '';
          card.style.pointerEvents = '';
        } else {
          card.style.opacity = '0.25';
          card.style.transform = 'scale(0.97)';
          card.style.pointerEvents = 'none';
        }
      });
    });
  });

  /* ── 9. CONTACT FORM VALIDATION ── */
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('formSubmitBtn');

  if (form) {
    form.addEventListener('submit', e => {
      const email = document.getElementById('email');
      const firstName = document.getElementById('firstName');

      if (!firstName.value.trim() || !email.value.trim()) {
        e.preventDefault();
        [firstName, email].forEach(input => {
          if (input && !input.value.trim()) {
            input.style.borderColor = 'rgba(13, 13, 12, 0.4)';
            input.style.boxShadow = '0 0 0 3px rgba(13, 13, 12, 0.05)';
            setTimeout(() => {
              input.style.borderColor = '';
              input.style.boxShadow = '';
            }, 2500);
          }
        });
      } else {
        if (submitBtn) {
          submitBtn.innerHTML = '<span>Sending Details...</span>';
          submitBtn.style.opacity = '0.7';
        }
      }
    });
  }

  /* ── 10. BACK TO TOP ── */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── 11. NAVBAR ACTIVE LINK HIGHLIGHTING ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const activeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active-link',
            link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px 0px 0px' });
  sections.forEach(s => activeObserver.observe(s));

  /* ── 12. TILT EFFECT ON CARDS (Desktop Only) ── */
  if (!isMobileOrTouch) {
    document.querySelectorAll('.service-card, .founder-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
      });
      card.style.mouseleave = () => {
        card.style.transform = '';
      };
    });
  }

  /* ── 13. MARQUEE PAUSE ON HOVER ── */
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    marqueeTrack.addEventListener('mouseenter', () => {
      marqueeTrack.style.animationPlayState = 'paused';
    });
    marqueeTrack.addEventListener('mouseleave', () => {
      marqueeTrack.style.animationPlayState = 'running';
    });
  }

  /* ── 14. HERO PARALLAX (Desktop Only) ── */
  const heroBg = document.querySelector('.hero-bg-image');
  if (!isMobileOrTouch && heroBg) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
      }
    }, { passive: true });
  }
};

// Foolproof Initialization Sequence (fires regardless of load timing)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

/* ── ACTIVE NAV LINK STYLE ── */
const activeNavStyle = document.createElement('style');
activeNavStyle.textContent = `.nav-link.active-link { color: var(--accent-purple) !important; font-weight: 600; }`;
document.head.appendChild(activeNavStyle);
