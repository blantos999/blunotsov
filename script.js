/* ============================================
   THCANDELS — interakce a animace
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1) SMOKE CANVAS ---------- */
  const canvas = document.getElementById('smoke-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
  }

  function createParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 200,
      r: 60 + Math.random() * 160,
      speedY: 0.15 + Math.random() * 0.35,
      speedX: (Math.random() - 0.5) * 0.25,
      opacity: 0.02 + Math.random() * 0.05,
      drift: Math.random() * Math.PI * 2
    };
  }

  function initParticles() {
    particles = [];
    const count = window.innerWidth < 700 ? 8 : 16;
    for (let i = 0; i < count; i++) {
      const p = createParticle();
      p.y = Math.random() * window.innerHeight;
      particles.push(p);
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach(p => {
      p.y -= p.speedY;
      p.drift += 0.004;
      p.x += Math.sin(p.drift) * p.speedX;

      if (p.y < -p.r) {
        Object.assign(p, createParticle());
        p.y = window.innerHeight + p.r;
      }

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      gradient.addColorStop(0, `rgba(243, 236, 221, ${p.opacity})`);
      gradient.addColorStop(1, 'rgba(243, 236, 221, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(drawParticles);
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  resizeCanvas();
  initParticles();
  if (!prefersReducedMotion) {
    drawParticles();
  } else {
    drawParticles(); // single frame for static look
  }

  window.addEventListener('resize', () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    resizeCanvas();
    initParticles();
  });


  /* ---------- 2) SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // stagger siblings slightly
        const delay = entry.target.dataset.revealDelay || 0;
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el, i) => {
    // stagger items within the same parent grid a bit
    const siblingIndex = Array.from(el.parentElement.children).indexOf(el);
    el.dataset.revealDelay = Math.min(siblingIndex * 80, 320);
    revealObserver.observe(el);
  });


  /* ---------- 3) ANIMATED COUNTERS ---------- */
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }


  /* ---------- 4) MOBILE NAV ---------- */
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('is-open');
    mobileNav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('is-open');
      mobileNav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });


  /* ---------- 5) PRODUCT TILT EFFECT ---------- */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${y * -4}deg) rotateY(${x * 6}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });


  /* ---------- 6) ADD TO CART TOAST ---------- */
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  const addButtons = document.querySelectorAll('[data-add]');
  let toastTimer = null;

  addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.add;
      toastText.textContent = `🔥 „${name}“ přidáno do košíku`;
      toast.classList.add('is-visible');

      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
      }, 2600);
    });
  });


  /* ---------- 7) VIBE PICKER ---------- */
  const vibeButtons = document.querySelectorAll('.vibe-btn');
  const vibeResult = document.getElementById('vibeResult');
  const vibeResultName = document.getElementById('vibeResultName');
  const vibeResultDesc = document.getElementById('vibeResultDesc');

  const moods = {
    relax: {
      name: 'Purple Haze — No. 01',
      desc: 'Levandule a borovice ti pomalou rukou rozváže ramena. Ideální na klidný večer s knihou nebo bez ní.'
    },
    focus: {
      name: 'Lemon Diesel — No. 03',
      desc: 'Citronová terpenová esence s mátou nakopne hlavu na úkoly, které jsi odkládal(a) tři dny.'
    },
    cozy: {
      name: 'Gelato Dream — No. 05',
      desc: 'Krémová vanilka a bobule. Zapal, zaboř se do deky a nech čas plynout jinak.'
    },
    deep: {
      name: 'Midnight Haze — No. 04',
      desc: 'Černý pepř, sandalwood a tabák. Pro pozdní hodiny, hluboké myšlenky a tichý pokoj.'
    }
  };

  vibeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      vibeButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const mood = moods[btn.dataset.mood];

      vibeResultName.style.opacity = 0;
      vibeResultDesc.style.opacity = 0;

      setTimeout(() => {
        vibeResultName.textContent = mood.name;
        vibeResultDesc.textContent = mood.desc;
        vibeResultName.style.opacity = 1;
        vibeResultDesc.style.opacity = 1;
      }, 180);

      vibeResult.style.borderColor = 'var(--gold)';
    });
  });


  /* ---------- 8) NEWSLETTER FORM ---------- */
  const ctaForm = document.getElementById('ctaForm');
  const ctaNote = document.getElementById('ctaNote');
  const ctaEmail = document.getElementById('ctaEmail');

  ctaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = ctaEmail.value.trim();

    if (email) {
      ctaNote.textContent = `Hotovo — ${email} je na listu. Brzy se ozveme. 🔥`;
      ctaNote.classList.add('is-success');
      ctaEmail.value = '';

      setTimeout(() => {
        ctaNote.textContent = 'Žádný spam. Jen vůně a vibe.';
        ctaNote.classList.remove('is-success');
      }, 4000);
    }
  });

});
