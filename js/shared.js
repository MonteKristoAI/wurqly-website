/* ============================================================
   WURQLY — Shared JavaScript
   Scroll reveal, header scroll, mobile menu, rotating text
   ============================================================ */

// --- Scroll Reveal ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});

// --- Header Scroll Effect ---
const header = document.querySelector('.site-header');
let lastScroll = 0;

function handleHeaderScroll() {
  const scrollY = window.scrollY;
  if (scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  lastScroll = scrollY;
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });

// --- Mobile Menu ---
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('active');
    if (isOpen) {
      menu.classList.remove('active');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    } else {
      menu.classList.add('active');
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    }
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });
  });
}

document.addEventListener('DOMContentLoaded', initMobileMenu);

// --- Rotating Text ---
function initRotatingText() {
  const el = document.getElementById('rotating-text');
  if (!el) return;

  const words = JSON.parse(el.dataset.words || '[]');
  if (words.length < 2) return;

  let index = 0;
  setInterval(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-100%)';
    setTimeout(() => {
      index = (index + 1) % words.length;
      el.textContent = words[index];
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 350);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', initRotatingText);

// --- Animated Stat Counters ---
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = prefix + current.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));
}

document.addEventListener('DOMContentLoaded', animateCounters);

// --- Testimonial Scroll Dots ---
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('testimonial-track');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (track && dots.length) {
    track.addEventListener('scroll', () => {
      const scrollPercent = track.scrollLeft / (track.scrollWidth - track.clientWidth);
      const activeIndex = Math.round(scrollPercent * (dots.length - 1));
      dots.forEach((d, i) => d.classList.toggle('active', i === activeIndex));
    });
  }
});

// --- Smooth Scroll for Anchor Links ---
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const id = link.getAttribute('href');
  if (id === '#') return;
  const target = document.querySelector(id);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// --- Feature Tab Switching ---
document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      tabPanels.forEach(panel => {
        panel.classList.remove('active');
      });

      const target = document.getElementById('tab-panel-' + tabId);
      if (target) {
        target.classList.add('active');
      }
    });
  });
});

// --- Floating Scroll CTA ---
document.addEventListener('DOMContentLoaded', () => {
  const floatingCta = document.getElementById('floating-cta');
  const floatingClose = document.getElementById('floating-cta-close');
  if (!floatingCta || !floatingClose) return;

  if (sessionStorage.getItem('wurqly-float-dismissed')) return;

  let shown = false;

  function checkScroll() {
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    if (scrollPercent > 0.4 && !shown) {
      shown = true;
      floatingCta.classList.add('visible');
    }
  }

  window.addEventListener('scroll', checkScroll, { passive: true });

  floatingClose.addEventListener('click', () => {
    floatingCta.classList.remove('visible');
    sessionStorage.setItem('wurqly-float-dismissed', '1');
    window.removeEventListener('scroll', checkScroll);
  });
});

// --- Video Play Button ---
document.addEventListener('DOMContentLoaded', () => {
  const playBtn = document.getElementById('video-play-btn');
  if (!playBtn) return;

  playBtn.addEventListener('click', () => {
    window.location.href = 'mailto:hello@wurqly.com?subject=Wurqly%20Demo%20Request&body=I%20watched%20the%20demo%20video%20and%20would%20like%20to%20learn%20more.';
  });
});

// --- Spotlight Earnings Bar Animation ---
document.addEventListener('DOMContentLoaded', () => {
  const bars = document.querySelectorAll('.spotlight-bar');
  if (!bars.length) return;

  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const targetWidth = bar.dataset.width;
        bar.style.setProperty('--bar-width', targetWidth);
        bar.classList.add('animated');
        barObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(b => barObserver.observe(b));
});
