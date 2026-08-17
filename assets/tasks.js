/*
 * LidlVM — tasks.js
 * Logique métier écrite et adaptée pour MV.
 *
 * Rien n'est envoyé vers un serveur ici :
 * aucune saisie n'est conservée entre deux ouvertures de page.
 */

// Liste des tâches utilisées dans le bilan quotidien.
// Les libellés restent ici pour pouvoir les ajuster sans toucher au HTML.
const tasks=[
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
['🔧 Resserage','Confirmer que le resserage Non Food est validé afin que la mise en place puisse être faite le matin.']
];
// Construction de l'interface à partir des données ci-dessus.
const body=document.querySelector('#tasksBody'),lex=document.querySelector('#lexique');
// Statuts volontairement limités : il faut pouvoir répondre vite sans réfléchir à 15 choix.
const options='<option value="">— Choisir —</option><option>✅ Fait</option><option>⏳ À faire</option><option>⚠️ Partiel</option><option>❌ Non fait</option><option>➖ Non concerné</option>';
tasks.forEach(([name,desc],i)=>{const tr=document.createElement('tr'); const coffre=name.includes('coffre'); tr.innerHTML=`<td class="task-name"><span class="task-label">${name}</span><small class="task-help">${desc}</small></td><td>${coffre?`<div class="coffre-wrap"><select class="status-select" data-index="${i}">${options}<option>❗ Erreur</option></select><input class="text-input coffre-error" data-coffre="${i}" placeholder="Saisir la valeur si erreur"></div>`:`<select class="status-select" data-index="${i}">${options}</select>`}</td>`;body.appendChild(tr);const d=document.createElement('div');d.innerHTML=`<dt>${name.replace(/^\S+\s/,'')} :</dt> <dd>${desc}</dd>`;if(lex) lex.appendChild(d)});
document.querySelectorAll('.status-select').forEach(s=>s.addEventListener('change',e=>{const inp=document.querySelector(`[data-coffre="${e.target.dataset.index}"]`);if(inp)inp.classList.toggle('show',e.target.value.includes('Erreur'))}));
// Pas de sauvegarde automatique : les champs repartent vides à chaque ouverture.
// Recharge la dernière saisie connue au démarrage.
function restore(){try{const s=null;if(!s)return;document.querySelectorAll('.status-select').forEach((x,i)=>x.value=s.statuses?.[i]||'');observations.value=s.obs||'';const c=document.querySelector('[data-coffre]');if(c){c.value=s.coffre||'';c.classList.toggle('show',document.querySelector('.status-select[data-index="20"]')?.value.includes('Erreur'))}}catch{}}
// Version texte du compte-rendu, utile pour copier/coller dans un message.
function report(){
  const date=new Intl.DateTimeFormat('fr-FR',{dateStyle:'full'}).format(new Date());
  let t=`📋 BILAN DES TÂCHES — ${date.toUpperCase()}\n\n`;
  document.querySelectorAll('.status-select').forEach((s,i)=>{
    t+=`${tasks[i][0]} : ${s.value||'Non renseigné'}`;
    if(i===20&&s.value.includes('Erreur'))t+=` (${document.querySelector('[data-coffre="20"]').value||'valeur non saisie'})`;
    t+='\n'
  });
  t+=`\n🔎 Observations :\n${observations.value.trim()||'Aucune observation.'}`;
  return t
}

function statusInfo(value){
  if(value.includes('Fait')) return {label:'Fait',cls:'done',icon:'✓'};
  if(value.includes('À faire')) return {label:'À faire',cls:'todo',icon:'○'};
  if(value.includes('Partiel')) return {label:'Partiel',cls:'partial',icon:'◐'};
  if(value.includes('Non fait')) return {label:'Non fait',cls:'notdone',icon:'×'};
  if(value.includes('Non concerné')) return {label:'N/C',cls:'na',icon:'–'};
  if(value.includes('Erreur')) return {label:'Erreur',cls:'error',icon:'!'};
  return {label:'Non renseigné',cls:'empty',icon:'?'};
}

// Génération du rendu visuel du bilan.
// On n'affiche que ce qui est réellement renseigné.
function renderReport(){
  const now=new Date();
  const dateLong=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(now);
  const timeShort=new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'}).format(now);

  const filled=[];

  document.querySelectorAll('.status-select').forEach((s,i)=>{
    if(!s.value) return;

    const info=statusInfo(s.value);
    let extra='';

    if(i===20 && s.value.includes('Erreur')){
      const coffre=document.querySelector('[data-coffre="20"]');
      if(coffre && coffre.value.trim()){
        extra=`<div class="bilan-extra">Valeur coffre : ${coffre.value.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`;
      }
    }

    filled.push({
      name:tasks[i][0],
      info,
      extra
    });
  });

  const groups={
    done:filled.filter(x=>x.info.cls==='done'),
    todo:filled.filter(x=>x.info.cls==='todo'),
    partial:filled.filter(x=>x.info.cls==='partial'),
    notdone:filled.filter(x=>x.info.cls==='notdone'),
    error:filled.filter(x=>x.info.cls==='error'),
    na:filled.filter(x=>x.info.cls==='na')
  };

  const sectionLabels={
    done:'RÉALISÉ',
    todo:'À FAIRE',
    partial:'PARTIEL',
    notdone:'NON RÉALISÉ',
    error:'ANOMALIE',
    na:'NON CONCERNÉ'
  };

  const sections=[
    {key:'done',title:'Tâches réalisées',icon:'✓'},
    {key:'todo',title:'À faire',icon:'○'},
    {key:'partial',title:'Partiellement réalisé',icon:'◐'},
    {key:'notdone',title:'Non réalisé',icon:'×'},
    {key:'error',title:'Anomalies / erreurs',icon:'!'},
    {key:'na',title:'Non concerné',icon:'–'}
  ].filter(section=>groups[section.key].length>0);

  const sectionsHtml=sections.map(section=>{
    const rows=groups[section.key].map(item=>`
      <div class="bilan-report-row">
        <div class="bilan-report-task">
          <span class="bilan-status-icon ${item.info.cls}">${item.info.icon}</span>
          <div>
            <strong>${item.name}</strong>
            ${item.extra}
          </div>
        </div>
        <span class="report-status ${item.info.cls}"><b>${item.info.icon}</b><span>${item.info.label}</span></span>
      </div>
    `).join('');

    return `<section class="bilan-status-section">
      <div class="bilan-status-head">
        <div><span>${sectionLabels[section.key]}</span><strong>${section.icon} ${section.title}</strong></div>
        <b>${groups[section.key].length}</b>
      </div>
      <div>${rows}</div>
    </section>`;
  }).join('');

  const hasObs=observations.value.trim()!=='';
  const safeObs=observations.value.trim()
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');

  reportVisual.innerHTML=`
    <section class="delivery-report-cover bilan-report-cover">
      <div class="delivery-cover-copy">
        <span class="delivery-cover-kicker">SUIVI QUOTIDIEN</span>
        <h2>Bilan du jour</h2>
        <p>${dateLong.charAt(0).toUpperCase()+dateLong.slice(1)} • ${timeShort}</p>
      </div>
      <div class="delivery-cover-badge">
        <span>BILAN DU JOUR</span>
        <strong>${new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit'}).format(now)}</strong>
      </div>
    </section>

    <section class="bilan-report-content">
      <div class="bilan-report-content-head">
        <div><span>DÉTAIL DU BILAN</span><strong>Tâches renseignées</strong></div>
        <small>Suivi magasin</small>
      </div>

      <div class="bilan-status-sections">
        ${sectionsHtml || `
          <div class="delivery-empty-report">
            <span>📭</span>
            <strong>Aucune tâche renseignée</strong>
            <small>Renseignez au moins un statut avant de générer le compte-rendu.</small>
          </div>
        `}
      </div>
    </section>

    ${hasObs ? `
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
      <div><span>${new Intl.DateTimeFormat('fr-FR',{dateStyle:'short'}).format(now)}</span><small>${timeShort}</small></div>
    </section>
  `;
}

const modal=document.querySelector('#modal'),toast=document.querySelector('#toast');
// Petit retour visuel après copie, sauvegarde ou remise à zéro.
function showToast(m){toast.textContent=m;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}
generate.onclick=()=>{renderReport();modal.classList.add('show')};
closeModal.onclick=()=>modal.classList.remove('show');
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('show')});
// Copie rapide du compte-rendu texte dans le presse-papiers.
copyReport.onclick=async()=>{await navigator.clipboard.writeText(report());showToast('Compte-rendu copié')};
// Export PNG : pratique pour envoyer le compte-rendu tel quel.
downloadReport.onclick=async()=>{
  if(typeof html2canvas==='undefined'){showToast('Impossible de charger l’export PNG');return}
  const target=document.querySelector('#reportVisual');
  const canvas=await html2canvas(target,{scale:2,backgroundColor:'#f4f7fb',useCORS:true});
  const a=document.createElement('a');
  a.download=`compte-rendu-${new Date().toISOString().slice(0,10)}.png`;
  a.href=canvas.toDataURL('image/png');
  a.click();
  showToast('Compte-rendu PNG sauvegardé')
};
// Remise à zéro complète du formulaire et du stockage local.
reset.onclick=()=>{document.querySelectorAll('.status-select').forEach(x=>x.value='');document.querySelectorAll('input,textarea').forEach(x=>x.value='');document.querySelectorAll('.coffre-error').forEach(x=>x.classList.remove('show'));showToast('Formulaire réinitialisé')};
savePng.onclick=async()=>{if(typeof html2canvas==='undefined'){showToast('Impossible de charger l’export PNG');return}const canvas=await html2canvas(document.querySelector('#captureArea'),{scale:2,backgroundColor:'#f3f6fa'});const a=document.createElement('a');a.download=`bilan-taches-${new Date().toISOString().slice(0,10)}.png`;a.href=canvas.toDataURL('image/png');a.click();showToast('PNG sauvegardé')};
