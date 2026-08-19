/*
 * LidlVM — delivery.js
 * Livraison du jour : saisie, génération du compte-rendu, copie et export PNG.
 *
 * Les données restent uniquement dans la page ouverte : aucun localStorage,
 * aucun envoi serveur.
 */

const deliveries = [
  '📦 Palette de détails',
  '🛒 Palette non food',
  '🥗 Palette frais',
  '❄️ Palette surgelé',
  '📄 TKT surgelé',
  '🥩 TKT VVP',
  '🔥 Palette action sec',
  '🧊 Palette action frais',
  '📦 Box action',
  '📦 Box',
  '➗ Demi-palette sec',
  '➗ Demi-palette frais',
  '➗ Demi-palette action frais',
  '➗ Demi-palette action sec',
  '➗ Demi-palette non food',
  '➗ Demi-palette masse',
  '🏋️ Palette de masse'
];

const deliveryMeta = [
  {group:'Sec & détail', icon:'📦', hint:'Palette de détail'},
  {group:'Non Food', icon:'🛒', hint:'Palette Non Food'},
  {group:'Frais', icon:'🥗', hint:'Palette frais'},
  {group:'Surgelé', icon:'❄️', hint:'Palette surgelé'},
  {group:'Surgelé', icon:'📄', hint:'TKT surgelé'},
  {group:'VVP', icon:'🥩', hint:'TKT VVP'},
  {group:'Action', icon:'🔥', hint:'Palette action sec'},
  {group:'Action', icon:'🧊', hint:'Palette action frais'},
  {group:'Action', icon:'📦', hint:'Box action'},
  {group:'Box', icon:'📦', hint:'Box'},
  {group:'Sec & détail', icon:'➗', hint:'Demi-palette sec'},
  {group:'Frais', icon:'➗', hint:'Demi-palette frais'},
  {group:'Action', icon:'➗', hint:'Demi-palette action frais'},
  {group:'Action', icon:'➗', hint:'Demi-palette action sec'},
  {group:'Non Food', icon:'➗', hint:'Demi-palette Non Food'},
  {group:'Masse', icon:'➗', hint:'Demi-palette masse'},
  {group:'Masse', icon:'🏋️', hint:'Palette de masse'}
];

const categoryOrder = [
  {name:'Sec & détail', icon:'📦', subtitle:'Réception sec et détail', className:'cat-sec'},
  {name:'Frais', icon:'🥗', subtitle:'Réception frais', className:'cat-frais'},
  {name:'Surgelé', icon:'❄️', subtitle:'Réception surgelé', className:'cat-surg'},
  {name:'VVP', icon:'🥩', subtitle:'Réception VVP', className:'cat-vvp'},
  {name:'Action', icon:'🔥', subtitle:'Réception action', className:'cat-action'},
  {name:'Non Food', icon:'🛒', subtitle:'Réception Non Food', className:'cat-nonfood'},
  {name:'Box', icon:'📦', subtitle:'Réception box', className:'cat-box'},
  {name:'Masse', icon:'🏋️', subtitle:'Réception masse', className:'cat-masse'}
];

const categoriesRoot = document.querySelector('#deliveryCategories');
const flPalettes = document.querySelector('#flPalettes');
const flHalfPalettes = document.querySelector('#flHalfPalettes');
const observations = document.querySelector('#observations');
const modal = document.querySelector('#modal');
const toast = document.querySelector('#toast');
const deliveryReportVisual = document.querySelector('#deliveryReportVisual');
const deliveryExportArea = document.querySelector('#deliveryExportArea');
const generateButton = document.querySelector('#generate');
const resetButton = document.querySelector('#reset');
const closeModalButton = document.querySelector('#closeModal');
const copyReportButton = document.querySelector('#copyReport');
const downloadReportButton = document.querySelector('#downloadReport');

categoryOrder.forEach(cat => {
  const section = document.createElement('section');
  section.className = `panel delivery-category ${cat.className}`;
  section.innerHTML = `
    <div class="panel-header delivery-category-header">
      <div>
        <span class="delivery-kicker">${cat.name.toUpperCase()}</span>
        <strong>${cat.icon} ${cat.name}</strong>
      </div>
      <small>${cat.subtitle}</small>
    </div>
    <div class="delivery-card-grid" data-category="${cat.name}"></div>
  `;
  categoriesRoot.appendChild(section);
});

deliveries.forEach((name, i) => {
  const meta = deliveryMeta[i];
  const target = document.querySelector(`[data-category="${meta.group}"]`);
  if (!target) return;

  const card = document.createElement('label');
  card.className = 'delivery-field-card';
  card.innerHTML = `
    <span class="delivery-field-icon">${meta.icon}</span>
    <span class="delivery-field-copy">
      <small>${meta.group.toUpperCase()}</small>
      <strong>${stripLeadingIcon(name)}</strong>
      <span>${meta.hint}</span>
    </span>
    <input class="qty-input delivery-input delivery-field-input"
           data-index="${i}"
           type="number"
           min="0"
           step="1"
           inputmode="numeric"
           placeholder="0"
           aria-label="${stripLeadingIcon(name)}">
  `;
  target.appendChild(card);
});

// Les cartes sont affichées par catégorie, donc leur ordre dans le DOM n'est pas
// le même que l'ordre du tableau `deliveries`. On reconstruit explicitement
// la liste à partir de data-index afin que chaque quantité reste liée à la
// bonne ligne du compte-rendu.
const inputs = deliveries.map((_, i) =>
  document.querySelector(`.delivery-input[data-index="${i}"]`)
);
const quantityInputs = [...inputs.filter(Boolean), flPalettes, flHalfPalettes].filter(Boolean);

function stripLeadingIcon(value) {
  return value.replace(/^\S+\s/, '');
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatQty(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  return new Intl.NumberFormat('fr-FR', {maximumFractionDigits: 2}).format(num);
}

function localDateStamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hasEnteredQuantities() {
  return quantityInputs.some(input => input.value !== '');
}

function validateDeliveryInputs() {
  for (const input of quantityInputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      input.focus();
      showToast('Corrigez la quantité indiquée');
      return false;
    }
  }

  if (!hasEnteredQuantities()) {
    showToast('Renseignez au moins une quantité');
    return false;
  }

  return true;
}

function getReportCategories() {
  const grouped = {};
  categoryOrder.forEach(cat => { grouped[cat.name] = []; });

  deliveries.forEach((name, i) => {
    const raw = inputs[i].value;
    if (raw === '') return;

    const meta = deliveryMeta[i];
    grouped[meta.group].push({
      name,
      raw,
      icon:meta.icon
    });
  });

  const categories = categoryOrder.map(cat => ({
    name:cat.name,
    icon:cat.icon,
    items:grouped[cat.name]
  }));

  const flItems = [];
  if (flPalettes.value !== '') {
    flItems.push({name:'📦 Palettes F&L', raw:flPalettes.value, icon:'📦'});
  }
  if (flHalfPalettes.value !== '') {
    flItems.push({name:'➗ Demi-palettes F&L', raw:flHalfPalettes.value, icon:'➗'});
  }

  categories.push({name:'F&L', icon:'🥬', items:flItems});
  return categories.filter(cat => cat.items.length > 0);
}

function report() {
  const now = new Date();
  const date = new Intl.DateTimeFormat('fr-FR', {dateStyle:'full'}).format(now);
  const categories = getReportCategories();
  const lines = [`🚚 LIVRAISON DU JOUR — ${date.toUpperCase()}`, ''];

  categories.forEach(cat => {
    lines.push(`${cat.icon} ${cat.name.toUpperCase()}`);
    cat.items.forEach(item => {
      lines.push(`${item.name} : ${formatQty(item.raw)}`);
    });
    lines.push('');
  });

  const obs = observations.value.trim();
  if (obs) {
    lines.push('📝 OBSERVATIONS', obs);
  }

  return lines.join('\n').trim();
}

function renderDeliveryReport() {
  const now = new Date();
  const dateLong = new Intl.DateTimeFormat('fr-FR', {
    weekday:'long', day:'numeric', month:'long', year:'numeric'
  }).format(now);
  const timeShort = new Intl.DateTimeFormat('fr-FR', {
    hour:'2-digit', minute:'2-digit'
  }).format(now);
  const reportCategories = getReportCategories();

  const categorySections = reportCategories.map(cat => {
    const rows = cat.items.map(item => `
      <div class="delivery-detail-row${Number(item.raw) === 0 ? ' is-zero' : ''}">
        <div class="delivery-detail-name">
          <span class="delivery-detail-icon">${item.icon}</span>
          <span>${escapeHTML(stripLeadingIcon(item.name))}</span>
        </div>
        <div class="delivery-detail-value">${formatQty(item.raw)}</div>
      </div>
    `).join('');

    return `
      <section class="delivery-family-block delivery-family-block-v4">
        <div class="delivery-family-head">
          <div>
            <span class="delivery-family-kicker">${escapeHTML(cat.name.toUpperCase())}</span>
            <strong>${cat.icon} ${escapeHTML(cat.name)}</strong>
          </div>
          <div class="delivery-family-total" aria-label="Nombre de lignes renseignées">
            <small>Lignes</small>
            <strong>${cat.items.length}</strong>
          </div>
        </div>
        <div class="delivery-family-rows">${rows}</div>
      </section>
    `;
  }).join('');

  const safeObs = escapeHTML(observations.value.trim()).replace(/\n/g, '<br>');

  deliveryReportVisual.innerHTML = `
    <section class="delivery-report-cover delivery-report-cover-v5">
      <div class="delivery-cover-copy">
        <span class="delivery-cover-kicker">RÉCEPTION MARCHANDISE</span>
        <h2>Compte-rendu livraison</h2>
        <p>${dateLong.charAt(0).toUpperCase() + dateLong.slice(1)} • ${timeShort}</p>
      </div>
      <div class="delivery-cover-badge">
        <span>RÉCEPTION DU JOUR</span>
        <strong>${new Intl.DateTimeFormat('fr-FR', {day:'2-digit', month:'2-digit'}).format(now)}</strong>
      </div>
    </section>

    <section class="delivery-detail-master delivery-detail-master-v4">
      <div class="delivery-detail-master-head">
        <div>
          <span>DÉTAIL DE LA RÉCEPTION</span>
          <strong>Catégories renseignées</strong>
        </div>
        <small>Réception magasin</small>
      </div>
      <div class="delivery-family-blocks delivery-family-blocks-v4">${categorySections}</div>
    </section>

    ${safeObs ? `
      <section class="delivery-observation-rich">
        <div class="delivery-observation-head">
          <span>✎</span>
          <div>
            <small>OBSERVATIONS</small>
            <strong>Informations complémentaires</strong>
          </div>
        </div>
        <p>${safeObs}</p>
      </section>
    ` : ''}

    <section class="delivery-report-signoff">
      <div>
        <span>LidlVM • Réception</span>
        <small>Compte-rendu interne</small>
      </div>
      <div>
        <span>${new Intl.DateTimeFormat('fr-FR', {dateStyle:'short'}).format(now)}</span>
        <small>${timeShort}</small>
      </div>
    </section>
  `;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

async function waitForReportImages(target) {
  const images = [...target.querySelectorAll('img')];
  await Promise.all(images.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      const done = () => resolve();
      img.addEventListener('load', done, {once:true});
      img.addEventListener('error', done, {once:true});
      window.setTimeout(done, 2000);
    });
  }));
}

let html2canvasLoadingPromise = null;

function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      script.remove();
      reject(new Error(`Chargement impossible : ${src}`));
    };
    document.head.appendChild(script);
  });
}

async function ensureHtml2Canvas() {
  if (typeof html2canvas !== 'undefined') return true;
  if (html2canvasLoadingPromise) return html2canvasLoadingPromise;

  html2canvasLoadingPromise = (async () => {
    const sources = [
      'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
      'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js'
    ];

    for (const src of sources) {
      try {
        await loadExternalScript(src);
        if (typeof html2canvas !== 'undefined') return true;
      } catch (error) {
        console.warn(error.message);
      }
    }
    return false;
  })();

  const loaded = await html2canvasLoadingPromise;
  if (!loaded) html2canvasLoadingPromise = null;
  return loaded;
}

async function exportReportPng(target, filename) {
  if (!(await ensureHtml2Canvas())) {
    showToast('Impossible de charger l’export PNG');
    return false;
  }

  target.classList.add('export-capture');
  try {
    await waitForReportImages(target);
    await new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
    const canvas = await html2canvas(target, {
      scale:2,
      backgroundColor:'#f4f7fb',
      useCORS:true,
      windowWidth:1200,
      scrollX:0,
      scrollY:0
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return true;
  } catch (error) {
    console.error('Export PNG impossible :', error);
    showToast('Erreur pendant l’export PNG');
    return false;
  } finally {
    target.classList.remove('export-capture');
  }
}

generateButton.addEventListener('click', () => {
  if (!validateDeliveryInputs()) return;
  renderDeliveryReport();
  modal.classList.add('show');
});

closeModalButton.addEventListener('click', () => modal.classList.remove('show'));
modal.addEventListener('click', event => {
  if (event.target === modal) modal.classList.remove('show');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') modal.classList.remove('show');
});

copyReportButton.addEventListener('click', async () => {
  const ok = await copyText(report());
  showToast(ok ? 'Compte-rendu livraison copié' : 'Copie impossible');
});

downloadReportButton.addEventListener('click', async () => {
  const ok = await exportReportPng(deliveryExportArea, `livraison-${localDateStamp()}.png`);
  if (ok) showToast('Compte-rendu livraison sauvegardé');
});

resetButton.addEventListener('click', () => {
  quantityInputs.forEach(input => { input.value = ''; });
  observations.value = '';
  deliveryReportVisual.innerHTML = '';
  modal.classList.remove('show');
  showToast('Formulaire réinitialisé');
});
