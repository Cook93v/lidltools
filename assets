/*
 * LidlVM — delivery.js
 * Logique métier écrite et adaptée pour MV.
 *
 * Rien n'est envoyé vers un serveur ici :
 * les saisies restent dans le navigateur via localStorage.
 * Ça permet de garder l'outil rapide et utilisable sans compte utilisateur.
 */

// Types de livraison suivis dans le magasin.
// Garder l'ordre cohérent avec les catégories affichées plus bas.
const deliveries=[
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

const deliveryMeta=[
  {group:'Sec & détail',icon:'📦',hint:'Palette de détail'},
  {group:'Non Food',icon:'🛒',hint:'Palette Non Food'},
  {group:'Frais',icon:'🥗',hint:'Palette frais'},
  {group:'Surgelé',icon:'❄️',hint:'Palette surgelé'},
  {group:'Surgelé',icon:'📄',hint:'TKT surgelé'},
  {group:'VVP',icon:'🥩',hint:'TKT VVP'},
  {group:'Action',icon:'🔥',hint:'Palette action sec'},
  {group:'Action',icon:'🧊',hint:'Palette action frais'},
  {group:'Action',icon:'📦',hint:'Box action'},
  {group:'Box',icon:'📦',hint:'Box'},
  {group:'Sec & détail',icon:'➗',hint:'Demi-palette sec'},
  {group:'Frais',icon:'➗',hint:'Demi-palette frais'},
  {group:'Action',icon:'➗',hint:'Demi-palette action frais'},
  {group:'Action',icon:'➗',hint:'Demi-palette action sec'},
  {group:'Non Food',icon:'➗',hint:'Demi-palette Non Food'},
  {group:'Masse',icon:'➗',hint:'Demi-palette masse'},
  {group:'Masse',icon:'🏋️',hint:'Palette de masse'}
];

const categoryOrder=[
  {name:'Sec & détail',icon:'📦',subtitle:'Réception sec et détail',className:'cat-sec'},
  {name:'Frais',icon:'🥗',subtitle:'Réception frais',className:'cat-frais'},
  {name:'Surgelé',icon:'❄️',subtitle:'Réception surgelé',className:'cat-surg'},
  {name:'VVP',icon:'🥩',subtitle:'Réception VVP',className:'cat-vvp'},
  {name:'Action',icon:'🔥',subtitle:'Réception action',className:'cat-action'},
  {name:'Non Food',icon:'🛒',subtitle:'Réception Non Food',className:'cat-nonfood'},
  {name:'Box',icon:'📦',subtitle:'Réception box',className:'cat-box'},
  {name:'Masse',icon:'🏋️',subtitle:'Réception masse',className:'cat-masse'}
];

const categoriesRoot=document.querySelector('#deliveryCategories');

categoryOrder.forEach(cat=>{
  const section=document.createElement('section');
  section.className=`panel delivery-category ${cat.className}`;
  section.innerHTML=`
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

deliveries.forEach((n,i)=>{
  const meta=deliveryMeta[i];
  const target=document.querySelector(`[data-category="${meta.group}"]`);
  if(!target) return;
  const card=document.createElement('label');
  card.className='delivery-field-card';
  card.innerHTML=`
    <span class="delivery-field-icon">${meta.icon}</span>
    <span class="delivery-field-copy">
      <small>${meta.group.toUpperCase()}</small>
      <strong>${n.replace(/^\S+\s/,'')}</strong>
      <span>${meta.hint}</span>
    </span>
    <input class="qty-input delivery-input delivery-field-input" data-index="${i}" type="number" min="0" step="0.5" inputmode="decimal" placeholder="0">
  `;
  target.appendChild(card)
});

const inputs=[...document.querySelectorAll('.delivery-input')];
const flPalettes=document.querySelector('#flPalettes');
const flHalfPalettes=document.querySelector('#flHalfPalettes');
const modal=document.querySelector('#modal');
const toast=document.querySelector('#toast');
const deliveryReportVisual=document.querySelector('#deliveryReportVisual');

[...inputs,flPalettes,flHalfPalettes].forEach(x=>x.addEventListener('input',save));
observations.addEventListener('input',save);

// Même principe côté livraison : on garde les valeurs dans le navigateur.
function save(){
  localStorage.setItem('lidlvm-delivery',JSON.stringify({
    q:inputs.map(x=>x.value),
    flPalettes:flPalettes.value,
    flHalfPalettes:flHalfPalettes.value,
    obs:observations.value
  }))
}

// Recharge la dernière saisie connue au démarrage.
function restore(){
  try{
    const s=JSON.parse(localStorage.getItem('lidlvm-delivery'));
    if(!s)return;
    inputs.forEach((x,i)=>x.value=s.q?.[i]||'');
    flPalettes.value=s.flPalettes||'';
    flHalfPalettes.value=s.flHalfPalettes||'';
    observations.value=s.obs||''
  }catch{}
}

function n(v){return Number(v||0)}
function formatQty(v){
  const num=n(v);
  return Number.isInteger(num)?String(num):String(num).replace('.',',')
}

// Version texte du compte-rendu, utile pour copier/coller dans un message.
function report(){
  const date=new Intl.DateTimeFormat('fr-FR',{dateStyle:'full'}).format(new Date());
  let t=`🚚 LIVRAISON DU JOUR — ${date.toUpperCase()}\n\n`;
  inputs.forEach((x,i)=>t+=`${deliveries[i]} : ${formatQty(x.value)}\n`);
  t+=`\n🥬 F&L\n`;
  t+=`📦 Palettes F&L : ${formatQty(flPalettes.value)}\n`;
  t+=`➗ Demi-palettes F&L : ${formatQty(flHalfPalettes.value)}\n`;
  t+=`\n📝 Observations :\n${observations.value.trim()||'Aucune observation.'}`;
  return t
}

// Génération du rendu visuel de la livraison.
// Les catégories vides sont volontairement ignorées dans le compte-rendu.
function renderDeliveryReport(){
  const now=new Date();
  const dateLong=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(now);
  const timeShort=new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'}).format(now);

  const values=inputs.map(x=>x.value);
  const flP=flPalettes.value;
  const flH=flHalfPalettes.value;

  const grouped={};
  categoryOrder.forEach(cat=>grouped[cat.name]=[]);

  deliveries.forEach((name,i)=>{
    const meta=deliveryMeta[i];
    if(values[i]!=='' && Number(values[i])!==0){
      grouped[meta.group].push({
        name,
        qty:Number(values[i]),
        raw:values[i],
        icon:meta.icon
      });
    }
  });

  // F&L devient une catégorie normale du compte-rendu.
  const flItems=[];
  if(flP!=='' && Number(flP)!==0){
    flItems.push({
      name:'🥬 Palettes F&L',
      qty:Number(flP),
      raw:flP,
      icon:'🥬'
    });
  }
  if(flH!=='' && Number(flH)!==0){
    flItems.push({
      name:'➗ Demi-palettes F&L',
      qty:Number(flH),
      raw:flH,
      icon:'➗'
    });
  }

  const reportCategories=[
    ...categoryOrder.map(cat=>({
      name:cat.name,
      icon:cat.icon,
      items:grouped[cat.name]||[]
    })),
    {
      name:'F&L',
      icon:'🥬',
      items:flItems
    }
  ].filter(cat=>cat.items.length>0);

  const totalLines = reportCategories.reduce((sum,cat)=>sum+cat.items.length,0);

  const categorySections = reportCategories.map(cat=>{
    const total=cat.items.reduce((sum,item)=>sum+Number(item.qty||0),0);

    const rows=cat.items.map(item=>`
      <div class="delivery-detail-row">
        <div class="delivery-detail-name">
          <span class="delivery-detail-icon">${item.icon}</span>
          <span>${item.name.replace(/^\S+\s/,'')}</span>
        </div>
        <div class="delivery-detail-value">${formatQty(item.raw)}</div>
      </div>
    `).join('');

    return `
      <section class="delivery-family-block delivery-family-block-v4">
        <div class="delivery-family-head">
          <div>
            <span class="delivery-family-kicker">${cat.name.toUpperCase()}</span>
            <strong>${cat.icon} ${cat.name}</strong>
          </div>
          <div class="delivery-family-total">
            <small>Total</small>
            <strong>${formatQty(total)}</strong>
          </div>
        </div>
        <div class="delivery-family-rows">${rows}</div>
      </section>
    `;
  }).join('');

  const hasObs=observations.value.trim()!=='';
  const safeObs=observations.value.trim()
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\n/g,'<br>');

  deliveryReportVisual.innerHTML=`
    <section class="delivery-report-cover delivery-report-cover-v5">
      <div class="delivery-cover-copy">
        <span class="delivery-cover-kicker">RÉCEPTION MARCHANDISE</span>
        <h2>Compte-rendu livraison</h2>
        <p>${dateLong.charAt(0).toUpperCase()+dateLong.slice(1)} • ${timeShort}</p>
      </div>
      <div class="delivery-cover-badge">
        <span>RÉCEPTION DU JOUR</span>
        <strong>${new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit'}).format(now)}</strong>
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

      <div class="delivery-family-blocks delivery-family-blocks-v4">
        ${categorySections || `
          <div class="delivery-empty-report">
            <span>📭</span>
            <strong>Aucune quantité renseignée</strong>
            <small>Renseignez au moins une ligne avant de générer le compte-rendu.</small>
          </div>
        `}
      </div>
    </section>

    ${hasObs ? `
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
        <span>${new Intl.DateTimeFormat('fr-FR',{dateStyle:'short'}).format(now)}</span>
        <small>${timeShort}</small>
      </div>
    </section>
  `;
}

// Petit retour visuel après copie, sauvegarde ou remise à zéro.
function showToast(m){
  toast.textContent=m;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2200)
}

generate.onclick=()=>{
  renderDeliveryReport();
  modal.classList.add('show')
};

closeModal.onclick=()=>modal.classList.remove('show');
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('show')});

// Copie rapide du compte-rendu texte dans le presse-papiers.
copyReport.onclick=async()=>{
  await navigator.clipboard.writeText(report());
  showToast('Compte-rendu livraison copié')
};

// Export PNG : pratique pour envoyer le compte-rendu tel quel.
downloadReport.onclick=async()=>{
  if(typeof html2canvas==='undefined'){
    showToast('Impossible de charger l’export PNG');
    return
  }
  const canvas=await html2canvas(deliveryReportVisual,{scale:2,backgroundColor:'#f4f7fb',useCORS:true});
  const a=document.createElement('a');
  a.download=`livraison-${new Date().toISOString().slice(0,10)}.png`;
  a.href=canvas.toDataURL('image/png');
  a.click();
  showToast('Compte-rendu livraison sauvegardé')
};

// Remise à zéro complète du formulaire et du stockage local.
reset.onclick=()=>{
  localStorage.removeItem('lidlvm-delivery');
  inputs.forEach(x=>x.value='');
  flPalettes.value='';
  flHalfPalettes.value='';
  observations.value='';
  showToast('Formulaire réinitialisé')
};

restore();
