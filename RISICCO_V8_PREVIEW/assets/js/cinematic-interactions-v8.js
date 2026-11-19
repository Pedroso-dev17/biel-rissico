/** Atmospheric depth and active section observer; never alters forms or navigation. */
(()=>{'use strict';const reduce=matchMedia('(prefers-reduced-motion: reduce)');const html=document.documentElement;
 const art=[...document.querySelectorAll('.v8-editorial-frame, .v8-visual-study')];
 let ticking=false;function pointer(e){const card=e.currentTarget;if(reduce.matches||html.dataset.motion==='off'||html.dataset.tilt==='off')return;
   const r=card.getBoundingClientRect();const dx=(e.clientX-r.left)/r.width-.5,dy=(e.clientY-r.top)/r.height-.5;
   if(ticking)return;ticking=true;requestAnimationFrame(()=>{card.style.setProperty('--v8-rx',(-dy*4)+'deg');card.style.setProperty('--v8-ry',(dx*5)+'deg');card.style.setProperty('--v8-glow-x',((dx+.5)*100)+'%');card.style.setProperty('--v8-glow-y',((dy+.5)*100)+'%');ticking=false;});
 }
 for(const el of art){el.addEventListener('pointermove',pointer,{passive:true});el.addEventListener('pointerleave',()=>{el.style.setProperty('--v8-rx','0deg');el.style.setProperty('--v8-ry','0deg');});}
 const reveals=[...document.querySelectorAll('.v8-reveal')];if(!reduce.matches&&'IntersectionObserver'in window){const io=new IntersectionObserver(es=>{for(const e of es){if(e.isIntersecting){e.target.classList.add('v8-visible');io.unobserve(e.target);}}},{threshold:.08});reveals.forEach(e=>io.observe(e));}else reveals.forEach(e=>e.classList.add('v8-visible'));
})();
