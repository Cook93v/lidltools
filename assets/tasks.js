/*
 * LidlVM — tasks.js
 * Bilan des tâches : saisie, génération du compte-rendu, copie et export PNG.
 *
 * Les données restent uniquement dans la page ouverte : aucun localStorage,
 * aucun envoi serveur.
 */

const tasks = [
  ['🤖 Autodispo','Effectuer la remontée des stocks du magasin.'],
  ['📦 Commande VVP','Effectuer la commande VVP.'],
  ['🏬 Dates magasin','Réaliser le tour de liste donné pour le contrôle des dates magasin.'],
  ['📅 Dates VVP','Contrôler uniquement les dates de la zone VVP.'],
  ['📖 Dates manuel','Vérifier certaines familles définies le jour J.'],
  ['🔥 Plan de cuisson','Préparer le plaquage boulangerie pour le lendemain matin.'],
  ['🧾 HACCP','Valider la liste des éléments HACCP en fin de journée.'],
  ['🗂️ Mise à plat','Retravailler l’ensemble du rayonnage et s’assurer qu’aucun carton ne traîne.'],
  ['🧼 Nettoyage caisse','Nettoyer la zone caisse ainsi que les abords des caisses.'],
  ['🥖 Nettoyage boulangerie','Nettoyer l’ensemble de la zone boulangerie.'],
  ['📚 Rangement des articles','Ranger les articles qui traînent en caisse, en réserve ou dans le magasin.'],
  ['♻️ Coin pertes','Nettoyer la zone pertes et typer toutes les pertes.'],
  ['📦 Ramassage palette / TKT / perte / balle','Confirmer que le chauffeur a récupéré les palettes, TKT, pertes et balles.'],
  ['🍞 Perte pain','Confirmer que les pertes pain ont été effectuées.'],
  ['🛒 Non food saisie','Indiquer si du stock Non Food doit être saisi pour être mis en réserve.'],
  ['🥗 Saisie reliquat frais','Saisir le reliquat frais.'],
  ['🍎 Saisie reliquat F&L','Confirmer que le reliquat Fruits & Légumes a été saisi.'],
  ['❄️ Saisie reliquat surg','Confirmer que le reliquat surgelé a été saisi et mis en chambre froide.'],
  ['🛍️ Saisie reliquat sec','Confirmer que le reliquat sec a été saisi.'],
  ['🥩 Saisie reliquat VVP','Confirmer que le reliquat VVP a été saisi.'],
  ['💰 Édition coffre','Vérifier le stock du coffre et du coffre annexe et contrôler qu’il n’y a aucune anomalie.'],
  ['🔧 Resserrage','Confirmer que le resserrage Non Food est validé afin que la mise en place puisse être faite le matin.']
];

const body = document.querySelector('#tasksBody');
const lexique = document.querySelector('#lexique');
const observations = document.querySelector('#observations');
const modal = document.querySelector('#modal');
const toast = document.querySelector('#toast');
const reportVisual = document.querySelector('#reportVisual');
const bilanExportArea = document.querySelector('#bilanExportArea');
const generateButton = document.querySelector('#generate');
const savePngButton = document.querySelector('#savePng');
const resetButton = document.querySelector('#reset');
const closeModalButton = document.querySelector('#closeModal');
const copyReportButton = document.querySelector('#copyReport');
const downloadReportButton = document.querySelector('#downloadReport');

const coffreIndex = tasks.findIndex(([name]) => name.includes('Édition coffre'));
const options = '<option value="">— Choisir —</option><option>✅ Fait</option><option>⏳ À faire</option><option>⚠️ Partiel</option><option>❌ Non fait</option><option>➖ Non concerné</option>';

tasks.forEach(([name, desc], i) => {
  const row = document.createElement('tr');
  const isCoffre = i === coffreIndex;
  row.innerHTML = `
    <td class="task-name">
      <span class="task-label">${name}</span>
      <small class="task-help">${desc}</small>
    </td>
    <td>
      ${isCoffre ? `
        <div class="coffre-wrap">
          <select class="status-select" data-index="${i}" aria-label="Statut ${name}">${options}<option>❗ Erreur</option></select>
          <input class="text-input coffre-error" data-coffre="${i}" placeholder="Saisir la valeur si erreur" aria-label="Valeur de l'erreur coffre">
        </div>
      ` : `<select class="status-select" data-index="${i}" aria-label="Statut ${name}">${options}</select>`}
    </td>
  `;
  body.appendChild(row);

  if (lexique) {
    const item = document.createElement('div');
    item.innerHTML = `<dt>${stripLeadingIcon(name)} :</dt><dd>${desc}</dd>`;
    lexique.appendChild(item);
  }
});

const statusSelects = [...document.querySelectorAll('.status-select')];
const coffreInput = document.querySelector(`[data-coffre="${coffreIndex}"]`);

statusSelects.forEach(select => {
  select.addEventListener('change', event => {
    if (Number(event.target.dataset.index) !== coffreIndex || !coffreInput) return;
    const hasError = event.target.value.includes('Erreur');
    coffreInput.classList.toggle('show', hasError);
    if (!hasError) coffreInput.value = '';
  });
});

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

function localDateStamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function filledStatuses() {
  return statusSelects
    .map((select, i) => ({select, index:i}))
    .filter(item => item.select.value !== '');
}

function validateBilan() {
  if (filledStatuses().length === 0) {
    showToast('Renseignez au moins une tâche');
    return false;
  }
  return true;
}

function statusInfo(value) {
  const map = {
    '✅ Fait': {label:'Fait', cls:'done', icon:'✓'},
    '⏳ À faire': {label:'À faire', cls:'todo', icon:'○'},
    '⚠️ Partiel': {label:'Partiel', cls:'partial', icon:'◐'},
    '❌ Non fait': {label:'Non fait', cls:'notdone', icon:'×'},
    '➖ Non concerné': {label:'N/C', cls:'na', icon:'–'},
    '❗ Erreur': {label:'Erreur', cls:'error', icon:'!'}
  };
  return map[value] || {label:'Non renseigné', cls:'empty', icon:'?'};
}

function report() {
  const date = new Intl.DateTimeFormat('fr-FR', {dateStyle:'full'}).format(new Date());
  const lines = [`📋 BILAN DES TÂCHES — ${date.toUpperCase()}`, ''];

  filledStatuses().forEach(({select, index}) => {
    let line = `${tasks[index][0]} : ${select.value}`;
    if (index === coffreIndex && select.value.includes('Erreur')) {
      line += ` (${coffreInput && coffreInput.value.trim() ? coffreInput.value.trim() : 'valeur non saisie'})`;
    }
    lines.push(line);
  });

  const obs = observations.value.trim();
  if (obs) lines.push('', '🔎 OBSERVATIONS', obs);
  return lines.join('\n').trim();
}

function renderReport() {
  const now = new Date();
  const dateLong = new Intl.DateTimeFormat('fr-FR', {
    weekday:'long', day:'numeric', month:'long', year:'numeric'
  }).format(now);
  const timeShort = new Intl.DateTimeFormat('fr-FR', {
    hour:'2-digit', minute:'2-digit'
  }).format(now);

  const filled = filledStatuses().map(({select, index}) => {
    const info = statusInfo(select.value);
    let extra = '';

    if (index === coffreIndex && select.value.includes('Erreur') && coffreInput && coffreInput.value.trim()) {
      extra = `<div class="bilan-extra">Valeur coffre : ${escapeHTML(coffreInput.value.trim())}</div>`;
    }

    return {name:tasks[index][0], info, extra};
  });

  const groups = {
    done:filled.filter(x => x.info.cls === 'done'),
    todo:filled.filter(x => x.info.cls === 'todo'),
    partial:filled.filter(x => x.info.cls === 'partial'),
    notdone:filled.filter(x => x.info.cls === 'notdone'),
    error:filled.filter(x => x.info.cls === 'error'),
    na:filled.filter(x => x.info.cls === 'na')
  };

  const sectionLabels = {
    done:'RÉALISÉ',
    todo:'À FAIRE',
    partial:'PARTIEL',
    notdone:'NON RÉALISÉ',
    error:'ANOMALIE',
    na:'NON CONCERNÉ'
  };

  const sections = [
    {key:'done', title:'Tâches réalisées', icon:'✓'},
    {key:'todo', title:'À faire', icon:'○'},
    {key:'partial', title:'Partiellement réalisé', icon:'◐'},
    {key:'notdone', title:'Non réalisé', icon:'×'},
    {key:'error', title:'Anomalies / erreurs', icon:'!'},
    {key:'na', title:'Non concerné', icon:'–'}
  ].filter(section => groups[section.key].length > 0);

  const sectionsHtml = sections.map(section => {
    const rows = groups[section.key].map(item => `
      <div class="bilan-report-row">
        <div class="bilan-report-task">
          <span class="bilan-status-icon ${item.info.cls}">${item.info.icon}</span>
          <div>
            <strong>${escapeHTML(item.name)}</strong>
            ${item.extra}
          </div>
        </div>
        <span class="report-status ${item.info.cls}"><b>${item.info.icon}</b><span>${item.info.label}</span></span>
      </div>
    `).join('');

    return `
      <section class="bilan-status-section">
        <div class="bilan-status-head">
          <div><span>${sectionLabels[section.key]}</span><strong>${section.icon} ${section.title}</strong></div>
          <b>${groups[section.key].length}</b>
        </div>
        <div>${rows}</div>
      </section>
    `;
  }).join('');

  const safeObs = escapeHTML(observations.value.trim()).replace(/\n/g, '<br>');

  reportVisual.innerHTML = `
    <section class="delivery-report-cover bilan-report-cover">
      <div class="delivery-cover-copy">
        <span class="delivery-cover-kicker">SUIVI QUOTIDIEN</span>
        <h2>Bilan du jour</h2>
        <p>${dateLong.charAt(0).toUpperCase() + dateLong.slice(1)} • ${timeShort}</p>
      </div>
      <div class="delivery-cover-badge">
        <span>BILAN DU JOUR</span>
        <strong>${new Intl.DateTimeFormat('fr-FR', {day:'2-digit', month:'2-digit'}).format(now)}</strong>
      </div>
    </section>

    <section class="bilan-report-content">
      <div class="bilan-report-content-head">
        <div><span>DÉTAIL DU BILAN</span><strong>Tâches renseignées</strong></div>
        <small>Suivi magasin</small>
      </div>
      <div class="bilan-status-sections">${sectionsHtml}</div>
    </section>

    ${safeObs ? `
      <section class="delivery-observation-rich">
        <div class="delivery-observation-head">
          <span>✎</span>
          <div><small>OBSERVATIONS</small><strong>Informations complémentaires</strong></div>
        </div>
        <p>${safeObs}</p>
      </section>
    ` : ''}

    <section class="delivery-report-signoff">
      <div><span>LidlVM • Bilan du jour</span><small>Compte-rendu interne</small></div>
      <div><span>${new Intl.DateTimeFormat('fr-FR', {dateStyle:'short'}).format(now)}</span><small>${timeShort}</small></div>
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

function openReport() {
  if (!validateBilan()) return false;
  renderReport();
  modal.classList.add('show');
  return true;
}

generateButton.addEventListener('click', openReport);

savePngButton.addEventListener('click', async () => {
  if (!openReport()) return;
  const ok = await exportReportPng(bilanExportArea, `bilan-taches-${localDateStamp()}.png`);
  if (ok) showToast('Bilan PNG sauvegardé');
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
  showToast(ok ? 'Compte-rendu copié' : 'Copie impossible');
});

downloadReportButton.addEventListener('click', async () => {
  const ok = await exportReportPng(bilanExportArea, `compte-rendu-${localDateStamp()}.png`);
  if (ok) showToast('Compte-rendu PNG sauvegardé');
});

resetButton.addEventListener('click', () => {
  statusSelects.forEach(select => { select.value = ''; });
  document.querySelectorAll('input, textarea').forEach(input => { input.value = ''; });
  document.querySelectorAll('.coffre-error').forEach(input => input.classList.remove('show'));
  reportVisual.innerHTML = '';
  modal.classList.remove('show');
  showToast('Formulaire réinitialisé');
});
