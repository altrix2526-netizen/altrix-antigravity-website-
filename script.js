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

  /* ── 15. OWAIS ASSISTANT AI CHATBOT LOGIC ── */
  const trigger = document.getElementById('chatbotTrigger');
  const panel = document.getElementById('chatbotPanel');
  const closeBtn = document.getElementById('chatbotCloseBtn');
  const settingsBtn = document.getElementById('chatbotSettingsBtn');
  const settingsPanel = document.getElementById('chatbotSettingsPanel');
  const apiKeyInput = document.getElementById('geminiApiKeyInput');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const chatMessages = document.getElementById('chatbotMessages');
  const chatInput = document.getElementById('chatbotInput');
  const sendBtn = document.getElementById('chatbotSendBtn');

  let chatHistory = [
    { sender: 'assistant', text: "Hello! I'm Owais Assistant, the virtual representative for Altrix Agency. How can I help you explore our design services today?" },
    { sender: 'assistant', text: "Ask me anything about our founders (Thanseer, Owais, Harshad), our services, budget ranges, or works like hptgroupuae.com!" }
  ];

  let apiKey = localStorage.getItem('gemini_api_key') || '';
  if (apiKeyInput) apiKeyInput.value = apiKey;

  const renderMessages = () => {
    if (!chatMessages) return;
    chatMessages.innerHTML = '';
    chatHistory.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `message-bubble ${msg.sender}`;
      bubble.textContent = msg.text;
      chatMessages.appendChild(bubble);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const showTypingIndicator = () => {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const removeTypingIndicator = () => {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  };

  // Intelligent Token-Matching Knowledge Base Fallback
  const getLocalResponse = (query) => {
    const q = query.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
    const queryWords = q.split(/\s+/);
    
    const qaDatabase = [
      {
        keywords: ['founder', 'founders', 'founded', 'started', 'owners', 'owner', 'started', 'created', 'started altrix'],
        response: "Altrix Agency was founded by Thanseer (COO), Owais (CTO), and Harshad (CRO). They combine design operations, engineering leadership, and business strategy to deliver high-performance websites."
      },
      {
        keywords: ['thanseer', 'coo', 'operations', 'operational', 'deliver'],
        response: "Thanseer is the Chief Operating Officer (COO) of Altrix. He oversees project delivery, creative asset quality, and layout compliance, ensuring every pixel matches the high-end vision."
      },
      {
        keywords: ['owais', 'cto', 'tech', 'technology', 'developer', 'engineer', 'code', 'coding'],
        response: "Owais is the Chief Technology Officer (CTO) of Altrix. He leads all technical execution, site performance, interactive layouts, animations, and custom stack engineering."
      },
      {
        keywords: ['harshad', 'cro', 'revenue', 'sales', 'growth', 'business', 'onboard'],
        response: "Harshad is the Chief Revenue Officer (CRO) of Altrix. He manages revenue strategies, conversion funnels, client onboarding, and marketing pipeline optimization."
      },
      {
        keywords: ['phone', 'mobile', 'call', 'number', 'whatsapp', 'dial', 'telephone', 'phone number', 'mobile number'],
        response: "Our official call and WhatsApp hotline is +91 8248858180."
      },
      {
        keywords: ['email', 'gmail', 'mail', 'inbox', 'address', 'send email', 'email id', 'contact email'],
        response: "You can email our team directly at team@altrixagency.in."
      },
      {
        keywords: ['contact', 'reach', 'touch', 'location', 'where', 'office', 'talk', 'chat'],
        response: "You can reach Altrix Agency via email at team@altrixagency.in, call or WhatsApp at +91 8248858180, or fill out the contact form below."
      },
      {
        keywords: ['price', 'pricing', 'cost', 'budget', 'charge', 'rate', 'fees', 'rupee', 'inr', 'packages'],
        response: "Our project rates in INR are:\n• Growth: ₹2,000 – ₹5,000\n• Pro: ₹5,000 – ₹10,000\n• Enterprise: ₹20,000+"
      },
      {
        keywords: ['services', 'do you do', 'skills', 'offer', 'offerings', 'web design', 'web development', 'shopify', 'ecommerce'],
        response: "We offer end-to-end services including UI/UX Brand Design, Next.js & Webflow Development, Custom Animations, and Premium Shopify E-commerce Storefronts."
      },
      {
        keywords: ['work', 'works', 'portfolio', 'websites', 'projects', 'examples', 'done', 'show', 'case study'],
        response: "Our key works include HPT Group UAE (hptgroupuae.com) for corporate solutions, Nordic Store (minimalist luxury storefront), and Aura Finance (lead generation landing page)."
      },
      {
        keywords: ['hpt', 'hptgroupuae', 'hptgroupuae.com'],
        response: "We designed and launched HPT Group UAE (https://hptgroupuae.com), creating a clean, premium corporate portal matching their international business sectors."
      },
      {
        keywords: ['hi', 'hello', 'hey', 'greetings', 'yo', 'sup'],
        response: "Hello! I am Owais Assistant, the AI representative of Altrix. How can I help you explore our design services today?"
      }
    ];

    let bestMatch = null;
    let maxScore = 0;

    qaDatabase.forEach(item => {
      let score = 0;
      // Score based on keyword hits
      item.keywords.forEach(keyword => {
        if (queryWords.includes(keyword) || q.includes(keyword)) {
          score += 2; // Exact match weight
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestMatch = item;
      }
    });

    if (maxScore > 0 && bestMatch) {
      return bestMatch.response;
    }

    return "I'd love to help you with that! As Owais Assistant, I can tell you that Altrix Agency specializes in building high-end, premium web interfaces. You can ask me about our founders, project rates, portfolio link hptgroupuae.com, or email team@altrixagency.in!";
  };

  // Generate reply via Gemini API or fallback
  const getGeminiResponse = async (userPrompt) => {
    if (!apiKey) {
      return getLocalResponse(userPrompt);
    }
    
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: {
            parts: [{ text: "You are Owais Assistant, the highly professional, helpful, and creative AI representative of Altrix Agency (founded by Thanseer COO, Owais CTO, Harshad CRO. Email: team@altrixagency.in, Phone: +91 8248858180). Keep answers elegant and brief." }]
          }
        })
      });
      
      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      console.warn("Gemini API call failed, falling back to local model: ", e);
      return getLocalResponse(userPrompt) + "\n\n(Note: Custom Gemini API call failed. Using local database fallback)";
    }
  };

  const handleSendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;
    
    chatInput.value = '';
    chatHistory.push({ sender: 'user', text });
    renderMessages();
    
    showTypingIndicator();
    
    // Fetch response
    const reply = await getGeminiResponse(text);
    
    removeTypingIndicator();
    chatHistory.push({ sender: 'assistant', text: reply });
    renderMessages();
  };

  if (trigger && panel) {
    trigger.addEventListener('click', () => {
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) {
        renderMessages();
        setTimeout(() => chatInput.focus(), 300);
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => panel.classList.remove('open'));
    }

    if (settingsBtn && settingsPanel) {
      settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('open'));
    }

    if (saveApiKeyBtn && apiKeyInput) {
      saveApiKeyBtn.addEventListener('click', () => {
        apiKey = apiKeyInput.value.trim();
        localStorage.setItem('gemini_api_key', apiKey);
        if (settingsPanel) settingsPanel.classList.remove('open');
        
        chatHistory.push({ 
          sender: 'assistant', 
          text: apiKey ? "Gemini API configuration updated! I am now running in fully autonomous generative AI mode." : "API Key cleared. Swapped back to local knowledge base mode." 
        });
        renderMessages();
      });
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleSendMessage();
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', handleSendMessage);
    }
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
