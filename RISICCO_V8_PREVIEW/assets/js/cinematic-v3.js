/** RISICCO V3 / Living Motion System — additive enhancement, not route authentication. */
(()=>{
 'use strict';
 const doc=document, html=doc.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const q=(s,r=doc)=>r.querySelector(s);
 const qa=(s,r=doc)=>Array.from(r.querySelectorAll(s));
 const motion=()=>!reduced.matches && html.dataset.motion!=='off';
 const full=()=>motion() && html.dataset.motion==='full';
 // Page-to-page arrival: complementary to the existing outgoing portal transition.
 // Decorative only, pointer events never intercepted, and skipped on intro / reduced motion.
 if(motion() && html.dataset.page!=='home' && html.dataset.motion!=='subtle'){
   const arrival=doc.createElement('div');
   arrival.className='cinema-arrival';arrival.setAttribute('aria-hidden','true');
   arrival.innerHTML='<div class="cinema-arrival-upper"></div><div class="cinema-arrival-lower"></div><div class="cinema-arrival-mark"><span>R.</span><small>THE NEXT CHAPTER / RISICCO</small></div>';
   doc.body.append(arrival);
   requestAnimationFrame(()=>requestAnimationFrame(()=>arrival.classList.add('cinema-arrival-play')));
   setTimeout(()=>arrival.remove(),1150);
 }
 const can=(pref)=>motion() && html.dataset[pref]!=='off';
 let observer=null;
 const once=(els,cls='cinema-in')=>{
  if(!els.length)return;
  if(!motion() || !('IntersectionObserver' in window)) {els.forEach(el=>el.classList.add(cls));return;}
  const io=new IntersectionObserver(entries=>{entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add(cls);io.unobserve(e.target);}
  });},{threshold:.055,rootMargin:'0px 0px -25px 0px'});
  els.forEach((el,i)=>{el.style.setProperty('--cinema-stagger', `${(i%4)*95}ms`);io.observe(el)});
 };
 // Section sequence: film-camera cue changes while reading, also on pages without a hero.
 const scenes=qa('#main > section, #main > .member-profile > section, #main > .dash-root').filter(el=>el.getBoundingClientRect().height>0);
 const total=q('#cinema-scene-total'),number=q('#cinema-scene-number'),name=q('#cinema-scene-name'),bar=q('#cinema-scene-progress');
 if(total)total.textContent=String(scenes.length||1).padStart(2,'0');
 const sceneNames=['OPENING FRAME','THE CONCEPT','CREATIVE STUDIO','IN MOTION','THE PROCESS','NEXT CHAPTER','RISICCO / STUDIO'];
 let scrollBusy=false;
 function refreshScene(){
  scrollBusy=false;
  if(!scenes.length)return;
  const anchor=innerHeight*.41;
  let active=0;
  for(let i=0;i<scenes.length;i++){if(scenes[i].getBoundingClientRect().top<=anchor)active=i;}
  if(number)number.textContent=String(active+1).padStart(2,'0');
  if(name)name.textContent=sceneNames[active%sceneNames.length];
  const max=Math.max(1,doc.documentElement.scrollHeight-innerHeight);
  if(bar)bar.style.transform=`scaleX(${Math.max(0,Math.min(1,scrollY/max))})`;
 }
 addEventListener('scroll',()=>{if(!scrollBusy){scrollBusy=true;requestAnimationFrame(refreshScene)}},{passive:true});
 addEventListener('resize',refreshScene,{passive:true});refreshScene();
 // On every page, copy and cards are revealed in staggered editorial beats.
 const revealSelectors=[
  '.service-row','.service-tile','.work-card','.team-mini','.member-card','.process-steps > div',
  '.dash-stat-grid > *','.dash-project-card','.dash-list-row','.dash-detail-metrics > div',
  '.dash-timeline-item','.dash-info-panel','.portfolio-toolbar','.service-info-grid','.profile-story > div'
 ];
 const revealTargets=qa(revealSelectors.join(',')).filter(el=>!el.classList.contains('reveal'));
 const showAll=()=>revealTargets.forEach(el=>el.classList.add('cinema-in'));
 if(motion()){
  revealTargets.forEach(el=>el.classList.add('cinema-reveal'));
  once(revealTargets);
 }else showAll();
 // Text-masking while preserving original semantic headings and inline em/mark/span elements.
 const headingSelectors='.home-hero h1, .interior-hero h1, .service-individual-heading h1, .profile-heading h1, .customize-heading h1, .auth-body h1, .dash-page-top h1, .team-page h1, .statement-copy h2, .section-title-row h2, .process-section h2, .team-preview-head h2';
 const headings=qa(headingSelectors);
 function makeKinetic(heading){
  if(heading.dataset.kineticReady)return;
  const walker=doc.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
  const texts=[];let node;
  while((node=walker.nextNode())) if(node.nodeValue && /\S/.test(node.nodeValue) && !node.parentElement.closest('svg,script,style')) texts.push(node);
  let index=0;
  for(const original of texts){
   const pieces=original.textContent.split(/(\s+)/g);const fragment=doc.createDocumentFragment();
   for(const piece of pieces){
    if(!piece)continue;
    if(/^\s+$/.test(piece)){fragment.append(doc.createTextNode(piece));continue;}
    const outer=doc.createElement('span');outer.className='cinema-word';
    const inner=doc.createElement('span');inner.className='cinema-word-inner';inner.textContent=piece;
    inner.style.setProperty('--word-delay',`${Math.min(index++,22)*48}ms`);
    outer.append(inner);fragment.append(outer);
   }
   original.replaceWith(fragment);
  }
  heading.dataset.kineticReady='1';
 }
 if(motion() && html.dataset.kinetic!=='off'){
  headings.forEach(makeKinetic);
  if('IntersectionObserver' in window){
   observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('cinema-words-visible');observer.unobserve(entry.target)}
   })},{threshold:.08,rootMargin:'0px 0px -16px 0px'});
   headings.forEach(h=>observer.observe(h));
  }else headings.forEach(h=>h.classList.add('cinema-words-visible'));
 }
 // Pointer-driven ambient light and depth, throttled to animation frames.
 let pointerX=innerWidth/2,pointerY=innerHeight/2,mouseDirty=false;
 function move(){
  mouseDirty=false;
  if(!fine.matches||!full())return;
  html.style.setProperty('--cinema-px',`${pointerX}px`);
  html.style.setProperty('--cinema-py',`${pointerY}px`);
  const hero=q('.home-hero');
  if(hero){
   const r=hero.getBoundingClientRect();
   if(r.bottom>0 && r.top<innerHeight){
     const x=(pointerX-r.left)/Math.max(1,r.width)-.5;
     const y=(pointerY-r.top)/Math.max(1,r.height)-.5;
     hero.style.setProperty('--hero-perspective-x',`${(y*3.8).toFixed(2)}deg`);
     hero.style.setProperty('--hero-perspective-y',`${(-x*5.4).toFixed(2)}deg`);
     hero.style.setProperty('--hero-shift-x',`${(x*22).toFixed(0)}px`);
     hero.style.setProperty('--hero-shift-y',`${(y*19).toFixed(0)}px`);
   }
  }
 }
 if(fine.matches){addEventListener('pointermove',e=>{
  pointerX=e.clientX;pointerY=e.clientY;
  if(!mouseDirty){mouseDirty=true;requestAnimationFrame(move)}
 },{passive:true});}
 // Magnetic 3D panels and interactive highlights; no transform changes to links/hitboxes.
 const tiltNodes=qa('.work-card, .service-tile, .team-mini, .member-card, .dash-project-card');
 if(fine.matches){
  tiltNodes.forEach(card=>{
   let frame=0;
   card.classList.add('cinema-tilt');
   card.addEventListener('pointermove',e=>{
    if(!can('tilt') || !full())return;
    const r=card.getBoundingClientRect();
    const x=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));
    const y=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));
    if(frame)cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      card.style.setProperty('--card-rx',`${(-y*4).toFixed(2)}deg`);
      card.style.setProperty('--card-ry',`${(x*5).toFixed(2)}deg`);
      card.style.setProperty('--card-x',`${((x+1)*50).toFixed(2)}%`);
      card.style.setProperty('--card-y',`${((y+1)*50).toFixed(2)}%`);
    });
   },{passive:true});
   card.addEventListener('pointerleave',()=>{
    if(frame)cancelAnimationFrame(frame);
    card.style.setProperty('--card-rx','0deg');card.style.setProperty('--card-ry','0deg');
    card.style.setProperty('--card-x','50%');card.style.setProperty('--card-y','50%');
   });
  });
 }
 // Motion is never an authentication or navigation gate. Existing HTML remains clickable.
 // Animated progress bars start when visible; the value always comes from the server.
 const meters=qa('.dash-progress-track');
 if(meters.length){
  if(motion() && 'IntersectionObserver' in window){
   const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('cinema-progress-active');io.unobserve(entry.target)}}),{threshold:.1});
   meters.forEach(el=>io.observe(el));
  }else meters.forEach(el=>el.classList.add('cinema-progress-active'));
 }
 // Include subtle floating ticker, but only on the artistic pages and only full motion.
 const tickerTargets=qa('.hero-art-tag, .hero-art-sticker, .statement-stamp, .team-mini-art');
 tickerTargets.forEach((el,i)=>el.style.setProperty('--float-offset',`${i*-.8}s`));
 const sync=()=>{
  if(!motion()){
   showAll();headings.forEach(h=>h.classList.add('cinema-words-visible'));
   meters.forEach(el=>el.classList.add('cinema-progress-active'));
  }else if(html.dataset.kinetic==='off'){headings.forEach(h=>h.classList.add('cinema-words-visible'))}
  if(!can('tilt'))tiltNodes.forEach(card=>{card.style.setProperty('--card-rx','0deg');card.style.setProperty('--card-ry','0deg')});
 };
 doc.addEventListener('risicco:preferences-changed',sync);
 reduced.addEventListener?.('change',sync);
 addEventListener('pageshow',()=>{refreshScene();if(doc.visibilityState==='visible')sync()});
 sync();
})();
