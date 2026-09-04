const siteConfig = {
  owner: 'SmartService',
  domain: 'https://szsmartservice.com',
  legalEmail: 'legal@szsmartservice.com',
  contactPhone: '+54 9 11 0000 0000',
  updatedAt: '8 de mayo de 2026',
  gatewayUrl: 'http://localhost:3000',
};

const textBindings = {
  'legal-owner': siteConfig.owner,
  'legal-domain': siteConfig.domain,
  'legal-domain-copy': siteConfig.domain,
  'legal-updated': siteConfig.updatedAt,
  'contact-domain': siteConfig.domain,
  'contact-phone': siteConfig.contactPhone,
  'current-year': new Date().getFullYear().toString(),
};

for (const [id, value] of Object.entries(textBindings)) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

const emailTargets = ['legal-email', 'contact-email'];
for (const id of emailTargets) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = siteConfig.legalEmail;
    element.setAttribute('href', `mailto:${siteConfig.legalEmail}`);
  }
}

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

if (menuToggle instanceof HTMLButtonElement && siteNav instanceof HTMLElement) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const trackingForm = document.getElementById('tracking-form');
const trackingCode = document.getElementById('tracking-code');
const trackingMessage = document.getElementById('tracking-message');
const trackingResult = document.getElementById('tracking-result');

if (trackingForm instanceof HTMLFormElement && trackingCode instanceof HTMLInputElement && trackingMessage && trackingResult) {
  trackingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = trackingCode.value.trim().toUpperCase();
    trackingMessage.textContent = 'Consultando estado...';
    trackingResult.hidden = true;

    try {
      const response = await fetch(`${siteConfig.gatewayUrl}/api/reclamos/seguimiento/${encodeURIComponent(code)}`);
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'No se pudo consultar el reclamo.');
      }

      const data = body.data;
      trackingResult.innerHTML = `
        <strong>${data.trackingCode}</strong>
        <span>Estado: ${data.status}</span>
        <span>Categoria: ${data.category}</span>
        <span>Ultima actualizacion: ${new Date(data.updatedAt).toLocaleString('es-AR')}</span>
      `;
      trackingResult.hidden = false;
      trackingMessage.textContent = '';
    } catch (error) {
      trackingMessage.textContent = error instanceof Error ? error.message : 'No se pudo consultar el reclamo.';
    }
  });
}