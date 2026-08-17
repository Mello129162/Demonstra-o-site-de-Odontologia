(() => {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Menu mobile (hamburger)                                            */
  /* ------------------------------------------------------------------ */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mainNav = document.getElementById('main-nav');

  function closeMenu() {
    hamburgerBtn.classList.remove('is-open');
    mainNav.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = '';
  }

  function openMenu() {
    hamburgerBtn.classList.add('is-open');
    mainNav.classList.add('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.setAttribute('aria-label', 'Fechar menu');
    document.body.style.overflow = 'hidden';
  }

  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mainNav.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });

    // Fecha o menu ao clicar em um link
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Fecha o menu ao redimensionar para desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) closeMenu();
    });

    // Fecha com Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        closeMenu();
        hamburgerBtn.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll suave para âncoras internas                                 */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerOffset = 82;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ------------------------------------------------------------------ */
  /* Header: sombra sutil ao rolar                                      */
  /* ------------------------------------------------------------------ */
  const header = document.querySelector('.site-header');
  if (header) {
    const toggleHeaderShadow = () => {
      header.style.boxShadow = window.scrollY > 8
        ? '0 8px 24px -18px rgba(11,43,60,0.4)'
        : 'none';
    };
    toggleHeaderShadow();
    window.addEventListener('scroll', toggleHeaderShadow, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* Contadores animados das estatísticas ("Sobre a clínica")           */
  /* ------------------------------------------------------------------ */
  const statEls = document.querySelectorAll('.stat strong[data-count]');
  if (statEls.length) {
    const animateCount = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1400;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = value.toLocaleString('pt-BR') + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statEls.forEach((el) => statObserver.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Revelação suave de seções ao rolar                                 */
  /* ------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll(
    '.treatment-card, .testimonial-card, .diff-list li, .about-visual, .hero-copy'
  );

  if (revealTargets.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealTargets.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Validação e envio do formulário de contato                         */
  /* ------------------------------------------------------------------ */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  if (form) {
    const fields = {
      name: { input: form.name, error: document.getElementById('error-name') },
      email: { input: form.email, error: document.getElementById('error-email') },
      phone: { input: form.phone, error: document.getElementById('error-phone') },
      message: { input: form.message, error: document.getElementById('error-message') },
    };

    const validators = {
      name: (v) => v.trim().length >= 3 ? '' : 'Informe seu nome completo.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Informe um e-mail válido.',
      phone: (v) => v.replace(/\D/g, '').length >= 10 ? '' : 'Informe um telefone válido com DDD.',
      message: (v) => v.trim().length >= 10 ? '' : 'Conte um pouco mais (mín. 10 caracteres).',
    };

    function validateField(key) {
      const { input, error } = fields[key];
      const message = validators[key](input.value);
      const row = input.closest('.form-row');
      if (message) {
        row.classList.add('has-error');
        error.textContent = message;
        input.setAttribute('aria-invalid', 'true');
      } else {
        row.classList.remove('has-error');
        error.textContent = '';
        input.removeAttribute('aria-invalid');
      }
      return !message;
    }

    Object.keys(fields).forEach((key) => {
      fields[key].input.addEventListener('blur', () => validateField(key));
      fields[key].input.addEventListener('input', () => {
        if (fields[key].input.closest('.form-row').classList.contains('has-error')) {
          validateField(key);
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const allValid = Object.keys(fields)
        .map(validateField)
        .every(Boolean);

      if (!allValid) {
        const firstError = form.querySelector('.has-error input, .has-error textarea');
        if (firstError) firstError.focus();
        successMsg.hidden = true;
        return;
      }

      // Simula envio (sem backend)
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        setTimeout(() => { successMsg.hidden = true; }, 6000);
      }, 700);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Ano dinâmico no rodapé                                             */
  /* ------------------------------------------------------------------ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
