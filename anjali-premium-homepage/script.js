document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const header = document.getElementById('siteHeader');
  const progress = document.getElementById('scrollProgress');
  const menuButton = document.getElementById('menuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuScrim = document.getElementById('mobileMenuScrim');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  window.addEventListener('load', () => {
    window.setTimeout(() => document.getElementById('preloader').classList.add('loaded'), 420);
  });

  function updatePageUI() {
    const top = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${total > 0 ? (top / total) * 100 : 0}%`;
    header.classList.toggle('scrolled', top > 22);
  }

  window.addEventListener('scroll', updatePageUI, { passive: true });
  updatePageUI();

  const heroVideo = document.getElementById('heroVideo');
  const heroVideoToggle = document.getElementById('heroVideoToggle');
  const clientVideo = document.querySelector('.clients-video');
  let heroManuallyPaused = false;

  const updateHeroVideoButton = () => {
    if (!heroVideo || !heroVideoToggle) return;
    const paused = heroVideo.paused;
    heroVideoToggle.classList.toggle('is-paused', paused);
    heroVideoToggle.setAttribute('aria-pressed', String(paused));
    heroVideoToggle.setAttribute('aria-label', paused ? 'Play background railway video' : 'Pause background railway video');
    heroVideoToggle.querySelector('i').textContent = paused ? '▶' : 'Ⅱ';
    heroVideoToggle.querySelector('span').textContent = paused ? 'Play rail film' : 'Live rail film';
  };

  if (heroVideo) {
    heroVideo.playbackRate = .92;
    heroVideo.addEventListener('playing', () => {
      document.querySelector('.hero')?.classList.remove('video-buffering');
      updateHeroVideoButton();
    });
    heroVideo.addEventListener('waiting', () => document.querySelector('.hero')?.classList.add('video-buffering'));
    heroVideo.addEventListener('pause', updateHeroVideoButton);
    if (reducedMotion) {
      heroVideo.pause();
      heroManuallyPaused = true;
    } else {
      heroVideo.play().catch(updateHeroVideoButton);
    }
  }

  heroVideoToggle?.addEventListener('click', () => {
    if (heroVideo.paused) {
      heroManuallyPaused = false;
      heroVideo.play().catch(updateHeroVideoButton);
    } else {
      heroManuallyPaused = true;
      heroVideo.pause();
    }
  });

  const mediaObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('video');
      if (!video || reducedMotion) return;
      if (entry.isIntersecting) {
        if (video === heroVideo && heroManuallyPaused) return;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { rootMargin: '120px 0px', threshold: .05 });

  const heroSection = document.querySelector('.hero');
  const clientsSection = document.querySelector('.clients');
  if (heroSection) mediaObserver.observe(heroSection);
  if (clientsSection) mediaObserver.observe(clientsSection);
  if (reducedMotion) clientVideo?.pause();

  function closeMenu() {
    menuButton.classList.remove('open');
    mobileMenu.classList.remove('open');
    mobileMenuScrim?.classList.remove('open');
    header.classList.remove('menu-active');
    mobileMenu.querySelectorAll('.mobile-nav-group.open').forEach(group => {
      group.classList.remove('open');
      group.querySelector('[data-mobile-submenu]')?.setAttribute('aria-expanded', 'false');
      group.querySelector('[data-mobile-parent]')?.setAttribute('aria-expanded', 'false');
    });
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenuScrim?.setAttribute('aria-hidden', 'true');
    body.classList.remove('menu-open');
  }

  menuButton.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('open');
    menuButton.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    mobileMenuScrim?.classList.toggle('open', open);
    header.classList.toggle('menu-active', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenuScrim?.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
  });

  mobileMenu.querySelectorAll('a:not([data-mobile-parent])').forEach(link => link.addEventListener('click', closeMenu));
  mobileMenuScrim?.addEventListener('click', closeMenu);

  const toggleMobileSubmenu = group => {
    if (!group) return;
    const willOpen = !group.classList.contains('open');
      document.querySelectorAll('.mobile-nav-group.open').forEach(item => {
        if (item !== group) {
          item.classList.remove('open');
          item.querySelector('[data-mobile-submenu]')?.setAttribute('aria-expanded', 'false');
          item.querySelector('[data-mobile-parent]')?.setAttribute('aria-expanded', 'false');
        }
      });
      group.classList.toggle('open', willOpen);
      group.querySelector('[data-mobile-submenu]')?.setAttribute('aria-expanded', String(willOpen));
      group.querySelector('[data-mobile-parent]')?.setAttribute('aria-expanded', String(willOpen));
      if (willOpen) group.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  };

  document.querySelectorAll('[data-mobile-submenu]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      toggleMobileSubmenu(button.closest('.mobile-nav-group'));
    });
  });

  document.querySelectorAll('[data-mobile-parent]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      toggleMobileSubmenu(link.closest('.mobile-nav-group'));
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1023 && mobileMenu.classList.contains('open')) closeMenu();
  });

  const countUp = element => {
    if (element.dataset.done) return;
    element.dataset.done = 'true';
    const target = Number(element.dataset.count);
    const start = performance.now();
    const duration = 1350;
    const frame = time => {
      const progress = Math.min((time - start) / duration, 1);
      element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      entry.target.querySelectorAll('[data-count]').forEach(countUp);
      if (entry.target.hasAttribute('data-count')) countUp(entry.target);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -35px' });

  document.querySelectorAll('.reveal,.reveal-left,.reveal-right,[data-count]').forEach(item => revealObserver.observe(item));

  const desktopLinks = [...document.querySelectorAll('.desktop-nav .nav-link')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      desktopLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-42% 0px -51%', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));

  const mapStage = document.querySelector('.map-stage');
  const mapCaption = document.getElementById('mapCaption');
  const mapCopy = {
    tracks: 'Railway and metro project reach',
    bridges: 'Bridge and infrastructure capabilities',
    plants: 'Four manufacturing plants in Eastern India'
  };

  document.querySelectorAll('[data-map-tab]').forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.mapTab;
      document.querySelectorAll('[data-map-tab]').forEach(tab => {
        const active = tab === button;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      mapStage.dataset.mapView = view;
      mapCaption.textContent = mapCopy[view];
    });
  });

  function setupContinuousSlider(trackId, speed = 38) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const viewport = track.parentElement;
    const progressBar = document.querySelector(`[data-slider-progress="${trackId}"]`);
    const originals = [...track.children];
    const originalLength = originals.length;
    if (originalLength < 2) return;

    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('slider-clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a,button').forEach(item => item.setAttribute('tabindex', '-1'));
      track.appendChild(clone);
    });

    const cards = [...track.children];
    track.classList.add('continuous-marquee');
    let offset = 0;
    let cycleWidth = 0;
    let cardStep = 0;
    let lastTime = 0;
    let lastActive = -1;
    let dragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let hovered = false;
    let focused = false;
    let inView = true;

    const normalize = value => {
      if (!cycleWidth) return 0;
      return ((value % cycleWidth) + cycleWidth) % cycleWidth;
    };

    const markActive = () => {
      if (!cardStep || !cycleWidth) return;
      const activeIndex = Math.floor((offset + viewport.clientWidth * .5) / cardStep) % originalLength;
      if (activeIndex !== lastActive) {
        cards.forEach((card, index) => card.classList.toggle('is-active', index % originalLength === activeIndex));
        lastActive = activeIndex;
      }
      if (progressBar) progressBar.style.transform = `scaleX(${Math.max(.04, offset / cycleWidth)})`;
    };

    const render = () => {
      track.style.transform = `translate3d(${-offset}px,0,0)`;
      markActive();
    };

    const measure = () => {
      cycleWidth = track.children[originalLength]?.offsetLeft || 0;
      cardStep = originals[1]?.offsetLeft - originals[0]?.offsetLeft || originals[0].offsetWidth;
      offset = normalize(offset);
      render();
    };

    const isRunning = () => !reducedMotion && !dragging && !hovered && !focused && inView && !document.hidden;

    const frame = time => {
      if (!lastTime) lastTime = time;
      const delta = Math.min(time - lastTime, 50);
      lastTime = time;
      if (isRunning() && cycleWidth) {
        offset = normalize(offset + speed * delta / 1000);
        render();
      }
      requestAnimationFrame(frame);
    };

    const nudge = direction => {
      offset = normalize(offset + direction * cardStep);
      lastTime = 0;
      render();
    };

    document.querySelectorAll(`[data-slider-prev="${trackId}"]`).forEach(button => button.addEventListener('click', () => nudge(-1)));
    document.querySelectorAll(`[data-slider-next="${trackId}"]`).forEach(button => button.addEventListener('click', () => nudge(1)));

    track.addEventListener('pointerdown', event => {
      dragging = true;
      dragStartX = event.clientX;
      dragStartOffset = offset;
      track.classList.add('dragging');
      track.setPointerCapture?.(event.pointerId);
    });
    track.addEventListener('pointermove', event => {
      if (!dragging) return;
      offset = normalize(dragStartOffset - (event.clientX - dragStartX));
      render();
    });
    const endDrag = event => {
      if (!dragging) return;
      dragging = false;
      lastTime = 0;
      track.classList.remove('dragging');
      track.releasePointerCapture?.(event.pointerId);
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('mouseenter', () => { hovered = true; });
    track.addEventListener('mouseleave', () => { hovered = false; lastTime = 0; });
    track.addEventListener('focusin', () => { focused = true; });
    track.addEventListener('focusout', () => { focused = false; lastTime = 0; });
    document.addEventListener('visibilitychange', () => { lastTime = 0; });
    new IntersectionObserver(entries => {
      inView = entries[0]?.isIntersecting ?? true;
      lastTime = 0;
    }, { rootMargin: '120px 0px', threshold: .02 }).observe(viewport);
    window.addEventListener('resize', measure);

    measure();
    requestAnimationFrame(frame);
  }

  function setupSlider(trackId, delay = 5200) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const progressBar = document.querySelector(`[data-slider-progress="${trackId}"]`);
    const originals = [...track.children];
    const originalLength = originals.length;
    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('slider-clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a,button').forEach(item => item.setAttribute('tabindex', '-1'));
      track.appendChild(clone);
    });
    const cards = [...track.children];
    let index = 0;
    let timer;
    let dragging = false;
    let startX = 0;
    let dragBase = 0;
    let dragDistance = 0;

    const translateFor = value => -cards[Math.max(0, Math.min(value, cards.length - 1))].offsetLeft;

    const markActive = () => {
      const activeIndex = ((index % originalLength) + originalLength) % originalLength;
      cards.forEach((card, cardIndex) => card.classList.toggle('is-active', cardIndex % originalLength === activeIndex));
      if (progressBar) progressBar.style.transform = `scaleX(${(activeIndex + 1) / originalLength})`;
    };

    const render = animate => {
      track.style.transition = animate ? '' : 'none';
      track.style.transform = `translate3d(${translateFor(index)}px,0,0)`;
      markActive();
      if (!animate) requestAnimationFrame(() => track.style.transition = '');
    };

    const go = value => {
      if (value < 0) {
        index = originalLength;
        render(false);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          index = originalLength - 1;
          render(true);
        }));
        restart();
        return;
      }
      index = value;
      render(true);
      restart();
    };

    const restart = () => {
      window.clearInterval(timer);
      if (!reducedMotion && cards.length > 1) timer = window.setInterval(() => go(index + 1), delay);
    };

    document.querySelectorAll(`[data-slider-prev="${trackId}"]`).forEach(button => button.addEventListener('click', () => go(index - 1)));
    document.querySelectorAll(`[data-slider-next="${trackId}"]`).forEach(button => button.addEventListener('click', () => go(index + 1)));

    track.addEventListener('pointerdown', event => {
      dragging = true;
      startX = event.clientX;
      dragBase = translateFor(index);
      dragDistance = 0;
      track.classList.add('dragging');
      track.setPointerCapture?.(event.pointerId);
      window.clearInterval(timer);
    });

    track.addEventListener('pointermove', event => {
      if (!dragging) return;
      dragDistance = event.clientX - startX;
      track.style.transform = `translate3d(${dragBase + dragDistance}px,0,0)`;
    });

    const endDrag = event => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('dragging');
      track.releasePointerCapture?.(event.pointerId);
      if (Math.abs(dragDistance) > 48) go(index + (dragDistance < 0 ? 1 : -1));
      else render(true);
      restart();
    };

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('transitionend', event => {
      if (event.propertyName !== 'transform') return;
      if (index >= originalLength) {
        index %= originalLength;
        render(false);
      }
    });
    track.addEventListener('mouseenter', () => window.clearInterval(timer));
    track.addEventListener('mouseleave', restart);
    track.addEventListener('focusin', () => window.clearInterval(timer));
    track.addEventListener('focusout', restart);
    window.addEventListener('resize', () => render(false));
    render(false);
    restart();
  }

  setupContinuousSlider('productTrack', 52);
  setupSlider('projectTrack', 4600);
  setupContinuousSlider('articleTrack', 42);

  const videoModal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const closeVideo = document.getElementById('closeVideo');

  function openVideo() {
    videoModal.classList.add('open');
    videoModal.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');
    closeVideo.focus();
    modalVideo.play().catch(() => {});
  }

  function hideVideo() {
    videoModal.classList.remove('open');
    videoModal.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
    modalVideo.pause();
  }

  document.querySelectorAll('[data-open-video]').forEach(button => button.addEventListener('click', openVideo));
  closeVideo.addEventListener('click', hideVideo);
  videoModal.addEventListener('click', event => { if (event.target === videoModal) hideVideo(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { hideVideo(); closeMenu(); } });

  if (finePointer && !reducedMotion) {
    const heroVisual = document.getElementById('heroVisual');
    const heroImage = heroVisual.querySelector('img');
    heroVisual.addEventListener('pointermove', event => {
      const box = heroVisual.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      heroImage.style.transform = `translate3d(${x * 15}px,${y * 10}px,40px) rotateY(${x * 7 - 2}deg) rotateX(${-y * 4}deg)`;
    });
    heroVisual.addEventListener('pointerleave', () => heroImage.style.transform = '');

    document.querySelectorAll('.tilt-card, .product-card, [data-tilt], .logo-grid article').forEach(card => {
      card.addEventListener('pointermove', event => {
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - .5;
        const y = (event.clientY - box.top) / box.height - .5;
        const strength = Number(card.dataset.tilt || (card.classList.contains('product-card') ? 5 : card.matches('.logo-grid article') ? 7 : 5));
        const lift = card.classList.contains('product-card') ? -7 : card.matches('.logo-grid article') ? -5 : -2;
        card.style.transform = `perspective(1100px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg) translateY(${lift}px)`;
      });
      card.addEventListener('pointerleave', () => card.style.transform = '');
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
});
