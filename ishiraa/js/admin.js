/**
 * Admin: session + password hashing + dashboard CRUD.
 */
(function () {
  'use strict';

  const KEY_SESSION = 'ishiraa:admin-session';

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(KEY_SESSION);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s.expires || Date.now() > s.expires) { logout(); return null; }
      return s;
    } catch (_) { return null; }
  }

  async function login(password, remember) {
    const cfg = (window.ISHIRAA_CONFIG && window.ISHIRAA_CONFIG.admin) || {};
    const hash = await sha256(password);
    if (hash !== cfg.passwordHash) return false;
    const hours = remember ? (cfg.sessionHours || 8) : 4;
    localStorage.setItem(KEY_SESSION, JSON.stringify({
      loggedInAt: Date.now(),
      expires: Date.now() + hours * 3600 * 1000
    }));
    return true;
  }

  function logout() {
    localStorage.removeItem(KEY_SESSION);
  }

  function requireAuth(redirect) {
    const s = getSession();
    if (!s) { window.location.href = redirect || 'admin.html'; return false; }
    return true;
  }

  window.IshiraaAdmin = { sha256, login, logout, getSession, requireAuth };
})();
