/* RISICCO — cinematic front-end. Progressive enhancement; native routes remain functional. */
(() => {
 'use strict';
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const root=document.documentElement, reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const defaultPrefs={theme:'dark',accent:'gold',motion:'balanced',type:'editorial',grain:true,radius:'sharp',size:'normal',intro:'always',parallax:true,cursor:true,layout:'grid',contrast:'standard',ambient:true,tilt:true,kinetic:true,minimal:false,graffiti:true,quality:'auto'};
 const colors={gold:'#ffc02b',coral:'#ff8975',violet:'#b6a6ff',lime:'#c8e56f',ice:'#99d9df',rose:'#f6adca'};
 const allowed={theme:['dark','light','system'],accent:Object.keys(colors),motion:['full','balanced','subtle','off'],type:['editorial','modern'],radius:['sharp','soft'],size:['normal','large'],intro:['first','always','off'],layout:['grid','list'],contrast:['standard','strong'],quality:['auto','ultra','high','balanced','low','static']};
 const storageKey='risicco_preferences_v8';
 function loadPrefs(){try {const o=JSON.parse(localStorage.getItem(storageKey)||'{}');return {...defaultPrefs,...Object.fromEntries(Object.entries(o).filter(([key,value])=> key in defaultPrefs && (typeof defaultPrefs[key]==='boolean'?typeof value==='boolean':allowed[key]?.includes(value))))};}catch{return {...defaultPrefs}}}
 let prefs=loadPrefs();
 if(root.dataset.auth==='1' && window.RISICCO_ACCOUNT_PREFS && typeof window.RISICCO_ACCOUNT_PREFS==='object') { const a=window.RISICCO_ACCOUNT_PREFS; prefs={...prefs,...Object.fromEntries(Object.entries(a).filter(([k,v])=>k in defaultPrefs && (typeof defaultPrefs[k]==='boolean' ? typeof v==='boolean' : allowed[k]?.includes(v))))}; try{localStorage.setItem(storageKey,JSON.stringify(prefs))}catch{} }
 // V5.1 migration: the legacy first-visit default silently hid our signature animation.
 // Run only once per browser: deliberate choices made after the update remain respected.
 try {
   if(localStorage.getItem('risicco_intro_v5_1_migrated')!=='yes'){
     if(prefs.intro==='first')prefs.intro='always';
     localStorage.setItem(storageKey,JSON.stringify(prefs));
     localStorage.setItem('risicco_intro_v5_1_migrated','yes');
   }
 }catch{}
 function effectiveTheme(){return prefs.theme==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):prefs.theme}
 function applyPrefs(){root.dataset.theme=effectiveTheme();root.dataset.motion=reduced.matches?'off':prefs.motion;root.dataset.type=prefs.type;root.dataset.grain=prefs.grain?'on':'off';root.dataset.radius=prefs.radius;root.dataset.size=prefs.size;root.dataset.layout=prefs.layout;root.dataset.contrast=prefs.contrast;root.dataset.ambient=prefs.ambient?'on':'off';root.dataset.tilt=prefs.tilt?'on':'off';root.dataset.kinetic=prefs.kinetic?'on':'off';root.dataset.minimal=prefs.minimal?'on':'off';root.dataset.graffiti=prefs.graffiti?'on':'off';root.dataset.cursor=prefs.cursor?'on':'off';root.dataset.quality=prefs.quality;root.style.setProperty('--accent',colors[prefs.accent]);root.style.setProperty('--accent-ink','#16130c');
   const status=$('#save-status'); if(status) status.textContent='Alterações em tempo real.';document.dispatchEvent(new Event('risicco:preferences-changed'));
 }
 applyPrefs();
 function persistPrefs(){try{localStorage.setItem(storageKey,JSON.stringify(prefs))}catch{} }
 const themeMedia=matchMedia('(prefers-color-scheme: light)');themeMedia.addEventListener?.('change',()=>{if(prefs.theme==='system') applyPrefs()});
 reduced.addEventListener?.('change',()=>{applyPrefs();if(reduced.matches)finishIntro(true)});
 const intro=$('#intro'), skip=$('#skip-intro');let introTimer;
 function finishIntro(immediate=false){if(!intro)return; clearTimeout(introTimer);if(immediate){intro.hidden=true;intro.classList.add('no-animation');}else{intro.classList.add('is-finishing');introTimer=setTimeout(()=>{intro.hidden=true;intro.classList.remove('is-finishing')},850)}
   try{localStorage.setItem('risicco_intro_seen','yes')}catch{}
 }
 function introSetup(){if(!intro)return;let seen=false,forced=false;try{seen=localStorage.getItem('risicco_intro_seen')==='yes';forced=sessionStorage.getItem('risicco_force_intro')==='yes';sessionStorage.removeItem('risicco_force_intro')}catch{}
   // Manual replay works even if someone previously switched introduction off.
   const replayRequested=new URLSearchParams(location.search).get('replay')==='intro';
   const shouldSkip=!forced&&!replayRequested&&(prefs.motion==='off'||prefs.intro==='off'||(prefs.intro==='first'&&seen));
   if(reduced.matches || shouldSkip){finishIntro(true);return}
   intro.hidden=false;intro.classList.remove('no-animation','is-finishing');introTimer=setTimeout(()=>finishIntro(false),3450);
 }
 if(intro){introSetup();skip?.addEventListener('click',()=>finishIntro(true));}
 // Navigation transition anchored at the click position. Native URL navigation (no fake SPA page).
 const transition=$('.site-transition');let navigating=false;
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]'); if(!a || navigating || e.defaultPrevented || e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download') || reduced.matches || prefs.motion==='off')return;
  const url=new URL(a.href,location.href);
  if(url.origin!==location.origin || url.pathname===location.pathname && url.search===location.search || url.href.startsWith('mailto:') || url.href.startsWith('tel:')) return;
  if(!transition)return;
  navigating=true;e.preventDefault();
  const rect=a.getBoundingClientRect();const x=e.clientX||rect.x+rect.width/2;const y=e.clientY||rect.y+rect.height/2;
  transition.style.setProperty('--origin-x',x+'px');transition.style.setProperty('--origin-y',y+'px');
  const color=a.dataset.memberColor || (a.hasAttribute('data-portal-back') ? $('.member-profile')?.style.getPropertyValue('--member-accent') : null);
  if(color)transition.style.background=color;else transition.style.background='var(--accent)';
  if(a.hasAttribute('data-portal') && a.querySelector('.member-art')){
    const source=a.querySelector('.member-art'), r=source.getBoundingClientRect();
    const portal=source.cloneNode(true);
    portal.classList.add('member-portal-clone');
    Object.assign(portal.style,{position:'fixed',zIndex:'540',pointerEvents:'none',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',margin:'0'});
    document.body.appendChild(portal);
    portal.animate([
      {left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',filter:'brightness(1)'},
      {left:'0px',top:'0px',width:'100vw',height:'100vh',filter:'brightness(1.15)'}
    ],{duration:870,easing:'cubic-bezier(.19,1,.22,1)',fill:'forwards'});
    setTimeout(()=>transition.classList.add('active'),160);
    setTimeout(()=>location.assign(url.href),845);
  }else{
    transition.classList.add('active');
    setTimeout(()=>location.assign(url.href),660);
  }
 });
 // Scroll reveal / progress
 const revealTargets=$$('.reveal,.reveal-text');
 if('IntersectionObserver'in window && !reduced.matches && prefs.motion!=='off'){
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})}, {threshold:.12,rootMargin:'0px 0px -24px 0px'});
  revealTargets.forEach(el=>observer.observe(el));
 }else revealTargets.forEach(el=>el.classList.add('visible'));
 const progress=$('#scroll-progress');let ticking=false;
 function scrollUpdate(){if(progress){const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(max?100*scrollY/max:0)+'%'}
  if(prefs.parallax && !reduced.matches && prefs.motion==='full' && innerWidth>900){const art=$('[data-parallax]');if(art && art.getBoundingClientRect().bottom>0){const offset=Math.min(scrollY,650);art.style.translate=`0 ${Math.round(offset*0.065)}px`}}
  ticking=false;
 }
 addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(scrollUpdate);ticking=true}},{passive:true});scrollUpdate();
 // Mobile navigation
 const menu=$('#menu-toggle'), mobile=$('#mobile-nav');function setMenu(open){document.body.classList.toggle('menu-open',open);menu?.setAttribute('aria-expanded',String(open));menu?.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');mobile?.setAttribute('aria-hidden',String(!open));if(open)mobile?.querySelector('a')?.focus()}
 menu?.addEventListener('click',()=>setMenu(!document.body.classList.contains('menu-open')));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(document.body.classList.contains('menu-open'))setMenu(false);if(faqPanel&&!faqPanel.hidden)closeFaq()}});
 // Work filters
 const filters=$$('[data-filter]'), filterItems=$$('.filter-item');
 filters.forEach(btn=>btn.addEventListener('click',()=>{const filter=btn.dataset.filter;filters.forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn))});filterItems.forEach(item=>{item.hidden=filter!=='all'&&item.dataset.category!==filter})}));
 // Creative lab: all displayed controls are connected to real preferences.
 const controls=$('#custom-controls');
 function syncControls(){if(!controls)return;$$('[data-setting]',controls).forEach(node=>{const key=node.dataset.setting,value=prefs[key];if(node.matches('select'))node.value=String(value);else if(node.matches('input[type=checkbox]'))node.checked=Boolean(value);else{ $$('[data-value]',node).forEach(btn=>{const active=btn.dataset.value===value;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));})}})}
 if(controls){
  controls.addEventListener('click',e=>{const b=e.target.closest('[data-setting] button[data-value]');if(!b)return;prefs[b.closest('[data-setting]').dataset.setting]=b.dataset.value;applyPrefs();syncControls();persistPrefs()});
  controls.addEventListener('change',e=>{const field=e.target.closest('select[data-setting],input[data-setting]');if(!field)return;prefs[field.dataset.setting]=field.type==='checkbox'?field.checked:field.value;applyPrefs();syncControls();persistPrefs()});
  const presets={director:{...defaultPrefs},gallery:{...defaultPrefs,theme:'light',accent:'ice',motion:'subtle',grain:false,cursor:false,parallax:false,type:'modern',radius:'soft',intro:'off',ambient:false,tilt:false,kinetic:false,minimal:true,graffiti:false},accessible:{...defaultPrefs,theme:'dark',accent:'lime',contrast:'strong',size:'large',motion:'off',grain:false,cursor:false,parallax:false,intro:'off',ambient:false,tilt:false,kinetic:false,minimal:true,graffiti:false}};
  $$('[data-preset]',controls).forEach(b=>b.addEventListener('click',()=>{prefs={...presets[b.dataset.preset]};applyPrefs();syncControls();persistPrefs()}));
  $('#reset-prefs')?.addEventListener('click',()=>{prefs={...defaultPrefs};applyPrefs();syncControls();persistPrefs()});
  $('#save-prefs')?.addEventListener('click',()=>{persistPrefs();const status=$('#save-status');if(status)status.textContent='Preferências guardadas neste dispositivo.';
   if(root.dataset.auth==='1'){ $('#pref-json').value=JSON.stringify(prefs);$('#pref-form').submit()}
  });
  $('#replay-intro')?.addEventListener('click',()=>{try{sessionStorage.setItem('risicco_force_intro','yes')}catch{};location.assign($('.wordmark')?.href||'/')});
  syncControls();
 }
 // On the login screen, focus subtly wakes up the visual orbit.
 const authArt=$('.auth-art');
 if(authArt){$$('.auth-form input').forEach(input=>{input.addEventListener('focus',()=>authArt.classList.add('is-focused'));input.addEventListener('blur',()=>authArt.classList.remove('is-focused'))})}
 // Reveal password controls
 $$('.reveal-password').forEach(button=>button.addEventListener('click',()=>{const input=button.parentElement.querySelector('input');input.type=input.type==='password'?'text':'password';button.textContent=input.type==='password'?'MOSTRAR':'OCULTAR';button.setAttribute('aria-label',input.type==='password'?'Mostrar palavra-passe':'Ocultar palavra-passe')}));
 // Static preview does not pretend to persist actions requiring the backend.
 if(root.dataset.staticPreview==='1') { $$('form[method=post]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();alert('Esta é apenas a pré-visualização estática. Para usar contas, pedidos e dados reais, inicia o projeto com PHP e MySQL conforme o README.')})) }
 // FAQ is deliberately a static FAQ; never an invented AI assistant.
 const faqPanel=$('#faq-panel'),faqToggle=$('#faq-toggle');function closeFaq(){faqPanel.hidden=true;faqToggle?.setAttribute('aria-expanded','false')}
 faqToggle?.addEventListener('click',()=>{faqPanel.hidden=!faqPanel.hidden;faqToggle.setAttribute('aria-expanded',String(!faqPanel.hidden))});$('#faq-close')?.addEventListener('click',closeFaq);
 // Notices
 $$('.toast-dismiss').forEach(b=>b.addEventListener('click',()=>b.closest('.toast')?.remove()));
 // Creative cursor (mouse only); no interference with touch or keyboard.
 const cursor=$('#cursor-orbit');
 if(cursor && matchMedia('(pointer:fine)').matches && !reduced.matches){let cx=0,cy=0,tx=0,ty=0,visible=false;const loop=()=>{cx+=(tx-cx)*.22;cy+=(ty-cy)*.22;cursor.style.left=cx+'px';cursor.style.top=cy+'px';requestAnimationFrame(loop)};loop();document.addEventListener('pointermove',e=>{if(!prefs.cursor||prefs.motion==='off'){cursor.style.opacity='0';return}tx=e.clientX;ty=e.clientY;if(!visible){visible=true;cursor.style.opacity='1'}},{passive:true});document.addEventListener('pointerover',e=>cursor.classList.toggle('hovered',Boolean(e.target.closest('a,button,[role=button]'))));}
 // Optional magnetic flourish for prominent CTA; keeps click target fixed.
 if(matchMedia('(pointer:fine)').matches && !reduced.matches){$$('.magnetic').forEach(btn=>{btn.addEventListener('pointermove',e=>{if(prefs.motion!=='full')return;const r=btn.getBoundingClientRect();btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.07}px,${(e.clientY-r.top-r.height/2)*.1}px)`});btn.addEventListener('pointerleave',()=>btn.style.transform='')})}
})();
