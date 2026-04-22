/**
 * Ishiraa — Site configuration
 * Edit these values to rebrand without touching page markup.
 */
window.ISHIRAA_CONFIG = {
  brand: {
    name: 'Ishiraa',
    tagline: 'Quiet luxury, woven with intention.',
    description: 'Handcrafted contemporary clothing that honours craft, comfort, and conscious design.',
    year: 2026
  },
  contact: {
    whatsapp: '919876543210',
    whatsappDisplay: '+91 98765 43210',
    email: 'hello@ishiraa.com',
    instagram: 'https://instagram.com/ishiraa',
    facebook: 'https://facebook.com/ishiraa',
    pinterest: 'https://pinterest.com/ishiraa',
    address: 'Bengaluru, India'
  },
  admin: {
    // SHA-256 of default password "ishiraa@2026" — change via admin panel or regenerate hash.
    // To generate a new hash in browser DevTools:
    //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-pass'))
    //     .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
    passwordHash: '8ff4df3935ff3999c84fef1170ce1df3ab0c37359ae139a338afd11947668b2b',
    sessionHours: 8
  },
  shipping: {
    note: 'Ships across India. International shipping on request.'
  },
  currency: {
    symbol: '₹',
    code: 'INR'
  }
};
