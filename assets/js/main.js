(function () {
  'use strict';

  var WHATSAPP_NUMBER = '351936323900';

  /* ------------------------------------------------------------------ */
  /* Current year in footer                                             */
  /* ------------------------------------------------------------------ */
  var yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------ */
  /* Header: solid background after scroll                              */
  /* ------------------------------------------------------------------ */
  var header = document.getElementById('site-header');
  var headerH = header ? header.offsetHeight : 76;

  function updateHeaderState() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.setAttribute('data-state', 'scrolled');
    } else {
      header.setAttribute('data-state', 'top');
    }
  }
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  /* ------------------------------------------------------------------ */
  /* Linha de laser: acompanha a posição do scroll em todo o site        */
  /* ------------------------------------------------------------------ */
  var laserScan = document.getElementById('laser-scan');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (laserScan && !reduceMotion) {
    var laserTicking = false;

    function updateLaserScan() {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      var progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      progress = Math.max(0, Math.min(1, progress));
      var y = progress * window.innerHeight;
      laserScan.style.transform = 'translateY(' + y + 'px)';
      laserTicking = false;
    }

    function requestLaserUpdate() {
      if (!laserTicking) {
        laserTicking = true;
        window.requestAnimationFrame(updateLaserScan);
      }
    }

    updateLaserScan();
    window.addEventListener('scroll', requestLaserUpdate, { passive: true });
    window.addEventListener('resize', requestLaserUpdate);
  }

  /* ------------------------------------------------------------------ */
  /* Mobile menu                                                        */
  /* ------------------------------------------------------------------ */
  var menuToggle = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) { closeMobileMenu(); } else { openMobileMenu(); }
    });
  }

  document.querySelectorAll('#mobile-menu a').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* ------------------------------------------------------------------ */
  /* Smooth scroll with header offset (for elements not natively        */
  /* covered by CSS scroll-behavior + scroll-margin, e.g. programmatic  */
  /* triggers such as the "Ver trabalhos" hero button)                  */
  /* ------------------------------------------------------------------ */
  function scrollToId(id) {
    var target = document.getElementById(id);
    if (!target) return;
    var offset = (header ? header.offsetHeight : headerH) - 1;
    var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var hash = link.getAttribute('href');
    if (!hash || hash.length < 2) return;
    var id = hash.slice(1);
    if (!document.getElementById(id)) return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      scrollToId(id);
      closeMobileMenu();
      history.pushState(null, '', hash);
    });
  });

  /* Compensate header height via CSS scroll-margin-top on sections */
  document.querySelectorAll('main section[id]').forEach(function (section) {
    section.style.scrollMarginTop = headerH + 'px';
  });

  /* ------------------------------------------------------------------ */
  /* Scrollspy: highlight nav link for the visible section              */
  /* ------------------------------------------------------------------ */
  var navLinks = document.querySelectorAll('[data-nav-link]');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var match = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', match);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    }, { rootMargin: '-' + (headerH + 20) + 'px 0px -60% 0px', threshold: 0 });

    sections.forEach(function (section) { spyObserver.observe(section); });
  }

  /* ------------------------------------------------------------------ */
  /* Reveal-on-scroll animations                                        */
  /* ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------ */
  /* Floating WhatsApp button: visible after first scroll                */
  /* ------------------------------------------------------------------ */
  var waFloat = document.getElementById('whatsapp-float');
  var footer = document.querySelector('.site-footer');

  function updateWhatsappFloat() {
    if (!waFloat) return;
    if (window.scrollY > 320) {
      waFloat.classList.add('is-visible');
    } else {
      waFloat.classList.remove('is-visible');
    }

    if (footer) {
      var footerRect = footer.getBoundingClientRect();
      var overlap = window.innerHeight - footerRect.top;
      if (overlap > 0) {
        waFloat.style.transform = 'translateY(' + (-overlap - 20) + 'px)';
      } else {
        waFloat.style.transform = '';
      }
    }
  }
  updateWhatsappFloat();
  window.addEventListener('scroll', updateWhatsappFloat, { passive: true });
  window.addEventListener('resize', updateWhatsappFloat);

  /* ------------------------------------------------------------------ */
  /* Gallery filter                                                     */
  /* ------------------------------------------------------------------ */
  var filterButtons = document.querySelectorAll('.filter-btn');
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var filter = btn.getAttribute('data-filter');

      galleryItems.forEach(function (item) {
        var show = filter === 'all' || item.getAttribute('data-category') === filter;
        item.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ------------------------------------------------------------------ */
  /* Lightbox                                                            */
  /* ------------------------------------------------------------------ */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');

  var lastFocusedEl = null;
  var currentIndex = 0;

  function galleryVisibleItems() {
    return galleryItems.filter(function (item) { return !item.classList.contains('is-hidden'); });
  }

  function openLightbox(item) {
    var img = item.querySelector('img');
    var caption = item.querySelector('.gallery-item__caption');
    if (!img || !lightbox || !lightboxImg) return;

    lastFocusedEl = document.activeElement;

    var full = img.getAttribute('srcset');
    var largeSrc = img.src;
    if (full) {
      var candidates = full.split(',').map(function (s) { return s.trim(); });
      var last = candidates[candidates.length - 1];
      if (last) largeSrc = last.split(' ')[0];
    }

    lightboxImg.src = largeSrc;
    lightboxImg.alt = img.alt || '';
    lightboxCaption.textContent = caption ? caption.textContent : '';

    currentIndex = galleryVisibleItems().indexOf(item);

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lightboxImg.src = '';
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function showByIndex(index) {
    var items = galleryVisibleItems();
    if (!items.length) return;
    var next = (index + items.length) % items.length;
    openLightboxSilent(items[next]);
    currentIndex = next;
  }

  function openLightboxSilent(item) {
    var img = item.querySelector('img');
    var caption = item.querySelector('.gallery-item__caption');
    if (!img || !lightboxImg) return;
    var full = img.getAttribute('srcset');
    var largeSrc = img.src;
    if (full) {
      var candidates = full.split(',').map(function (s) { return s.trim(); });
      var last = candidates[candidates.length - 1];
      if (last) largeSrc = last.split(' ')[0];
    }
    lightboxImg.src = largeSrc;
    lightboxImg.alt = img.alt || '';
    lightboxCaption.textContent = caption ? caption.textContent : '';
  }

  galleryItems.forEach(function (item) {
    item.addEventListener('click', function () { openLightbox(item); });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', function () { showByIndex(currentIndex - 1); });
  if (lightboxNext) lightboxNext.addEventListener('click', function () { showByIndex(currentIndex + 1); });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showByIndex(currentIndex - 1);
    if (e.key === 'ArrowRight') showByIndex(currentIndex + 1);
    if (e.key === 'Tab') {
      // simple focus trap between the three lightbox controls
      var focusables = [lightboxPrev, lightboxClose, lightboxNext];
      var idx = focusables.indexOf(document.activeElement);
      e.preventDefault();
      if (e.shiftKey) {
        idx = (idx - 1 + focusables.length) % focusables.length;
      } else {
        idx = (idx + 1) % focusables.length;
      }
      focusables[idx].focus();
    }
  });

  /* ------------------------------------------------------------------ */
  /* Contact form -> WhatsApp message                                    */
  /* ------------------------------------------------------------------ */
  var form = document.getElementById('contact-form');

  function setFieldError(fieldId, message) {
    var errorEl = document.getElementById('error-' + fieldId);
    var field = document.getElementById('field-' + fieldId);
    if (errorEl) errorEl.textContent = message || '';
    if (field && field.parentElement) {
      field.parentElement.classList.toggle('has-error', Boolean(message));
    }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nome = form.nome.value.trim();
      var localidade = form.localidade.value.trim();
      var tipo = form.tipo.value.trim();
      var descricao = form.descricao.value.trim();

      var valid = true;

      if (!nome) { setFieldError('nome', 'Indique o seu nome.'); valid = false; }
      else { setFieldError('nome', ''); }

      if (!localidade) { setFieldError('localidade', 'Indique a sua localidade.'); valid = false; }
      else { setFieldError('localidade', ''); }

      if (!tipo) { setFieldError('tipo', 'Selecione o tipo de trabalho.'); valid = false; }
      else { setFieldError('tipo', ''); }

      if (!descricao) { setFieldError('descricao', 'Descreva brevemente o trabalho.'); valid = false; }
      else { setFieldError('descricao', ''); }

      if (!valid) {
        var firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      var message = 'Olá, Kriolo Gesso. Chamo-me ' + nome +
        ', sou de ' + localidade +
        ' e gostaria de pedir informações sobre ' + tipo + '. ' + descricao;

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
      window.open(url, '_blank', 'noopener');
    });
  }

})();
