/* RISICCO V5 • discreet interaction layer. Does not replace native navigation. */
(()=>{'use strict';
 const motionOK=()=>document.documentElement.dataset.motion!=='off'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 // Use the current preferences after they are applied. All decoration is optional.
 document.addEventListener('DOMContentLoaded',()=>{
   const root=document.documentElement;
   document.querySelectorAll('.service-row,.button-primary,.dash-project-card').forEach(item=>{
     item.addEventListener('pointerenter',()=>{if(motionOK())item.classList.add('v5-hovered')});
     item.addEventListener('pointerleave',()=>item.classList.remove('v5-hovered'));
   });
   // A reveal class affects no semantics; text always readable if JS is absent.
   if('IntersectionObserver' in window && motionOK()){
     const io=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){target.classList.add('v5-inview');io.unobserve(target)}}),{threshold:.1});
     document.querySelectorAll('.section-title-row,.manifesto-text,.profile-story,.dash-section-title').forEach(el=>io.observe(el));
   }
   // When changing to minimal mode remove the flourish rather than overriding the user preference.
   document.addEventListener('risicco:preferences-changed',()=>{root.classList.toggle('v5-clean',root.dataset.minimal==='on')});
 });
})();
