/* Project filters apply to the actual owner-scoped list rendered by PHP. */
(()=>{'use strict';
 const root=document.querySelector('[data-dashboard]');if(!root)return;
 const cards=Array.from(root.querySelectorAll('[data-project-status]'));
 const buttons=Array.from(root.querySelectorAll('[data-project-filter]'));
 const search=root.querySelector('[data-project-search-input]');
 const count=root.querySelector('[data-project-count]');const empty=root.querySelector('[data-filter-empty]');
 if(!cards.length||!buttons.length)return;
 const map={'em-andamento':'in_progress','concluidos':'completed','em-revisao':'review','planeamento':'planning','cancelados':'cancelled'};
 const qs=new URLSearchParams(location.search);let active=map[qs.get('estado')]||'all';
 const apply=()=>{
   const term=(search?.value||'').trim().toLocaleLowerCase('pt-PT');let visible=0;
   cards.forEach(card=>{const match=(active==='all'||card.dataset.projectStatus===active)&&(!term||card.dataset.projectSearch.toLocaleLowerCase('pt-PT').includes(term));card.hidden=!match;if(match)visible++;});
   buttons.forEach(b=>{const selected=b.dataset.projectFilter===active;b.classList.toggle('is-active',selected);b.setAttribute('aria-pressed',String(selected));});
   if(count)count.textContent=String(visible);if(empty)empty.hidden=visible>0;
 };
 buttons.forEach(b=>b.addEventListener('click',()=>{active=b.dataset.projectFilter;try{if(location.protocol==='http:'||location.protocol==='https:')history.replaceState(null,'',location.pathname)}catch{}apply()}));
 search?.addEventListener('input',apply);apply();
})();
