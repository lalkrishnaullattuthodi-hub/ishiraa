/**
 * App shell — header/footer rendering, toast, mobile nav, active link highlighting.
 */
(function () {
  'use strict';

  const cfg = window.ISHIRAA_CONFIG || {};
  const brand = cfg.brand || { name: 'Ishiraa', year: new Date().getFullYear() };
  const contact = cfg.contact || {};

  function currentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path.replace(/\.html$/, '') || 'index';
  }

  function renderHeader() {
    const mount = document.querySelector('[data-site-header]');
    if (!mount) return;
    const page = currentPage();
    const cls = (name) => page === name ? 'active' : '';
    mount.innerHTML = `
      <header class="site-header">
        <div class="container site-header__inner">
          <a class="brand" href="/index.html" aria-label="${brand.name} home">
            ${brand.name[0]}<span>${brand.name.slice(1)}</span>
          </a>
          <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
            <span></span>
          </button>
          <nav class="nav" id="siteNav">
            <a class="${cls('index')}"      href="/index.html">Home</a>
            <a class="${cls('shop')}"       href="/shop.html">Shop</a>
            <a class="${cls('gallery')}"    href="/gallery.html">Lookbook</a>
            <a class="${cls('about')}"      href="/about.html">About</a>
            <a class="${cls('size-guide')}" href="/size-guide.html">Size Guide</a>
            <a class="${cls('contact')}"    href="/contact.html">Contact</a>
          </nav>
        </div>
      </header>
    `;
    const toggle = mount.querySelector('.nav-toggle');
    const nav = mount.querySelector('#siteNav');
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function renderFooter() {
    const mount = document.querySelector('[data-site-footer]');
    if (!mount) return;
    mount.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <div class="brand">${brand.name[0]}<span>${brand.name.slice(1)}</span></div>
              <p class="mt-1">${brand.description || ''}</p>
              <div class="footer-social" aria-label="Social links">
                ${contact.instagram ? `<a href="${contact.instagram}" target="_blank" rel="noopener" aria-label="Instagram">IG</a>` : ''}
                ${contact.facebook  ? `<a href="${contact.facebook}" target="_blank" rel="noopener" aria-label="Facebook">FB</a>` : ''}
                ${contact.pinterest ? `<a href="${contact.pinterest}" target="_blank" rel="noopener" aria-label="Pinterest">PIN</a>` : ''}
              </div>
            </div>
            <div>
              <h4>Explore</h4>
              <ul>
                <li><a href="/shop.html">Shop</a></li>
                <li><a href="/gallery.html">Lookbook</a></li>
                <li><a href="/about.html">About</a></li>
                <li><a href="/size-guide.html">Size Guide</a></li>
              </ul>
            </div>
            <div>
              <h4>Help</h4>
              <ul>
                <li><a href="/contact.html">Contact</a></li>
                <li><a href="${window.IshiraaWA ? window.IshiraaWA.generalLink() : '#'}" target="_blank" rel="noopener">WhatsApp us</a></li>
                <li><a href="mailto:${contact.email}">Email</a></li>
              </ul>
            </div>
            <div>
              <h4>Reach us</h4>
              <ul>
                <li>${contact.whatsappDisplay || ''}</li>
                <li><a href="mailto:${contact.email}">${contact.email || ''}</a></li>
                <li>${contact.address || ''}</li>
              </ul>
            </div>
          </div>
          <div class="site-footer__bottom">
            <span>© ${brand.year || new Date().getFullYear()} ${brand.name}. All rights reserved.</span>
            <span>Handcrafted with care.</span>
          </div>
        </div>
      </footer>
    `;
  }

  // Toast
  function showToast(message) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('show'), 2600);
  }
  window.showToast = showToast;

  // Format helpers
  window.formatPrice = (n) => {
    const sym = (cfg.currency && cfg.currency.symbol) || '₹';
    return `${sym}${Number(n || 0).toLocaleString('en-IN')}`;
  };

  // Boot
  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
  });
})();
