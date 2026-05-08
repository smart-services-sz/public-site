const siteConfig = {
  owner: 'SmartService',
  domain: 'https://szsmartservice.com',
  legalEmail: 'legal@szsmartservice.com',
  contactPhone: '+54 9 11 0000 0000',
  updatedAt: '8 de mayo de 2026',
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