const configuredGatewayUrl = document
  .querySelector('meta[name="smartservice-gateway-url"]')
  ?.getAttribute('content')
  ?.trim();
const isLocalHost = window.location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(
  window.location.hostname,
);

const siteConfig = {
  owner: 'SmartService',
  domain: 'https://szsmartservice.com',
  legalEmail: 'legal@szsmartservice.com',
  contactPhone: '+54 9 11 0000 0000',
  updatedAt: '8 de mayo de 2026',
  gatewayUrl:
    configuredGatewayUrl ||
    (isLocalHost ? 'http://localhost:3000' : window.location.origin),
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

const publicClaimForm = document.getElementById('public-claim-form');
const claimMessage = document.getElementById('claim-message');
const claimResult = document.getElementById('claim-result');
const claimCategory = document.getElementById('claim-category');
const claimMunicipality = document.getElementById('claim-municipality');
const claimConfigRetry = document.getElementById('claim-config-retry');

if (publicClaimForm instanceof HTMLFormElement && claimMessage && claimResult &&
    claimCategory instanceof HTMLSelectElement && claimConfigRetry instanceof HTMLButtonElement) {
  const submitButton = publicClaimForm.querySelector('button[type="submit"]');
  let configurationReady = false;
  let submitting = false;

  async function loadClaimConfiguration() {
    configurationReady = false;
    claimCategory.disabled = true;
    if (submitButton) submitButton.disabled = true;
    claimConfigRetry.hidden = true;
    claimMessage.textContent = 'Cargando configuracion municipal...';
    try {
      const response = await fetch(`${siteConfig.gatewayUrl}/api/reclamos/public-config`, {
        signal: AbortSignal.timeout(10000),
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('El canal municipal no esta disponible.');
      const configuration = await response.json();
      if (!configuration.municipality || typeof configuration.municipality.name !== 'string' ||
          !Array.isArray(configuration.categories)) {
        throw new Error('No pudimos cargar la configuracion municipal.');
      }
      const categories = configuration.categories.filter((category) =>
        category && typeof category.code === 'string' && category.code &&
        typeof category.name === 'string' && category.name,
      );
      if (!categories.length) throw new Error('No hay categorias habilitadas para este municipio.');
      claimCategory.replaceChildren(
        new Option('Selecciona una categoria', '', true, true),
        ...categories.map((category) => new Option(category.name, category.code)),
      );
      if (claimMunicipality) claimMunicipality.textContent = `Municipio: ${configuration.municipality.name}`;
      claimMessage.textContent = '';
      configurationReady = true;
      claimCategory.disabled = false;
      if (submitButton) submitButton.disabled = false;
    } catch (error) {
      claimCategory.replaceChildren(new Option('No disponible', ''));
      claimMessage.textContent = error instanceof Error && error.name !== 'TimeoutError'
        ? error.message : 'No pudimos cargar la configuracion municipal.';
      claimConfigRetry.hidden = false;
    }
  }

  claimConfigRetry.addEventListener('click', loadClaimConfiguration);
  loadClaimConfiguration();

  publicClaimForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!configurationReady || submitting) return;
    claimMessage.textContent = 'Validando la direccion y registrando el reclamo...';
    claimResult.hidden = true;

    const formData = new FormData(publicClaimForm);
    const files = formData.getAll('evidencias').filter((value) => value instanceof File && value.size > 0);
    if (files.length > 3 || files.some((file) => file.size > 5 * 1024 * 1024)) {
      claimMessage.textContent = 'Adjunta hasta 3 archivos de 5 MB cada uno.';
      return;
    }

    submitting = true;
    if (submitButton) submitButton.disabled = true;
    try {
      const response = await fetch(`${siteConfig.gatewayUrl}/api/reclamos/public`, {
        method: 'POST',
        body: formData,
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          Array.isArray(body.message)
            ? body.message.join('. ')
            : body.message || 'No se pudo registrar el reclamo.',
        );
      }

      const resultHeading = document.createElement('strong');
      resultHeading.textContent = 'Reclamo registrado';
      const trackingCode = document.createElement('span');
      trackingCode.textContent = `Codigo de seguimiento: ${body.trackingCode}`;
      claimResult.replaceChildren(resultHeading, trackingCode);
      claimResult.hidden = false;
      claimMessage.textContent = body.message || 'Guarda el codigo para consultar el estado.';
      publicClaimForm.reset();
    } catch (error) {
      claimMessage.textContent = error instanceof Error
        ? error.message
        : 'No se pudo registrar el reclamo.';
    } finally {
      submitting = false;
      if (submitButton) submitButton.disabled = !configurationReady;
    }
  });
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
const trackingContact = document.getElementById('tracking-contact');
const trackingMessage = document.getElementById('tracking-message');
const trackingResult = document.getElementById('tracking-result');

if (trackingForm instanceof HTMLFormElement && trackingCode instanceof HTMLInputElement && trackingContact instanceof HTMLInputElement && trackingMessage && trackingResult) {
  trackingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = trackingCode.value.trim().toUpperCase();
    const contact = trackingContact.value.trim();
    trackingMessage.textContent = 'Consultando estado...';
    trackingResult.hidden = true;

    try {
      const response = await fetch(`${siteConfig.gatewayUrl}/api/reclamos/seguimiento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoSeguimiento: code, contacto: contact }),
      });
      if (response.status === 429) {
        throw new Error('Se alcanzo el limite de consultas. Espera antes de volver a intentar.');
      }
      const body = await response.json();
      if (!response.ok) {
        throw new Error('No se pudo validar la consulta. Verifica los datos ingresados.');
      }

      const data = body.data;
      if (body.status !== 'ok' || !data) {
        throw new Error('No encontramos un reclamo con esos datos o la informacion no coincide.');
      }

      const trackingCodeResult = document.createElement('strong');
      trackingCodeResult.textContent = data.trackingCode;
      const statusResult = document.createElement('span');
      statusResult.textContent = `Estado: ${data.status}`;
      const categoryResult = document.createElement('span');
      categoryResult.textContent = `Categoria: ${data.category}`;
      const updatedResult = document.createElement('span');
      updatedResult.textContent = `Ultima actualizacion: ${new Date(data.updatedAt).toLocaleString('es-AR')}`;
      trackingResult.replaceChildren(trackingCodeResult, statusResult, categoryResult, updatedResult);
      trackingResult.hidden = false;
      trackingMessage.textContent = '';
    } catch (error) {
      trackingMessage.textContent = error instanceof Error ? error.message : 'No se pudo validar la consulta.';
    }
  });
}