/* Keep content functional without JS; enhance theme, navigation, and form feedback. */
(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const setTheme = (theme) => {
    root.dataset.theme = theme;
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#101211' : '#f7f9f7';
  };
  try {
    const saved = localStorage.getItem('islom-theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  } catch { /* Storage may be unavailable in private browsing. */ }
  themeButton.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    try { localStorage.setItem('islom-theme', theme); } catch { /* Theme still works. */ }
  });
  document.querySelector('#year').textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window) {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      root.classList.add('js-reveal');
      document.querySelectorAll('.reveal').forEach((section) => revealObserver.observe(section));
    }
    const navLinks = [...document.querySelectorAll('nav a')];
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    navLinks.forEach((link) => sectionObserver.observe(document.querySelector(link.hash)));
  }

  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  form.querySelector('button').disabled = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const endpoint = form.getAttribute('action').trim();
    if (!/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint)) {
      status.textContent = 'Delivery is not configured yet. Please connect with me on GitHub for now.';
      return;
    }
    const button = form.querySelector('button');
    button.disabled = true;
    status.textContent = 'Sending your message…';
    try {
      const response = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Delivery failed');
      form.reset();
      status.textContent = 'Thank you! Your message was sent.';
    } catch {
      status.textContent = 'Your message could not be sent. Please try again later; your text has been kept.';
    } finally { button.disabled = false; }
  });
})();
