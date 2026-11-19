/** RISICCO V8: accessible, native CSS 3D photo gallery with keyboard, drag and reduced-motion fallback. */
(()=>{'use strict';
 const root=document.querySelector('[data-v8-helix]');if(!root)return;
 const cards=[...root.querySelectorAll('[data-v8-helix-card]')], prev=root.querySelector('[data-v8-prev]'),next=root.querySelector('[data-v8-next]'),current=root.querySelector('[data-v8-current]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),n=cards.length;let index=0,dragX=null, pointer=null,suppressClick=false;
 function position(){const interactive=!reduced.matches&&document.documentElement.dataset.motion!=='off'&&innerWidth>700;
    root.classList.toggle('v8-helix-static',!interactive);
    cards.forEach((card,i)=>{
      const delta=((i-index+n+n/2)%n+n)%n-n/2;
      const distance=Math.abs(delta),selected=i===index;
      if(interactive){const angle=delta*.55;const x=Math.sin(angle)*Math.min(root.clientWidth*.31,330);
        const z=-distance*165+(selected?95:0),y=Math.sin(delta*.92)*42+(distance*15);
        card.style.transform=`translate3d(calc(-50% + ${x}px),calc(-50% + ${y}px),${z}px) rotateY(${-delta*15}deg) rotateZ(${delta*-2}deg) scale(${Math.max(.58,1-distance*.09)})`;
        card.style.opacity=distance>3.4?'0':String(Math.max(.23,1-distance*.19));card.style.zIndex=String(30-Math.round(distance*4));
      }else{card.style.transform='';card.style.opacity='';card.style.zIndex='';}
      card.classList.toggle('is-current',selected);card.setAttribute('aria-hidden',String(!selected&&interactive));
      const link=card.querySelector('a');if(link)link.tabIndex=selected||!interactive?0:-1;const img=card.querySelector('img');if(selected&&img?.dataset.full&&img.getAttribute('src')!==img.dataset.full)img.src=img.dataset.full;
    });
    if(current)current.textContent=String(index+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');
 }
 const go=d=>{index=(index+d+n)%n;position();};
 prev?.addEventListener('click',()=>go(-1));next?.addEventListener('click',()=>go(1));
 root.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(1)}if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}});
 const stage=root.querySelector('[data-v8-stage]');
 stage?.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragX=e.clientX;pointer=e.pointerId;});
 stage?.addEventListener('pointerup',e=>{if(pointer!==e.pointerId||dragX===null)return;const diff=e.clientX-dragX;if(Math.abs(diff)>40){suppressClick=true;e.preventDefault();go(diff<0?1:-1);}dragX=null;pointer=null;});
 stage?.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false;}},true);
 stage?.addEventListener('pointercancel',()=>{dragX=null;pointer=null;});
 let ticking=false;const resize=()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{ticking=false;position();});}};
 addEventListener('resize',resize,{passive:true});reduced.addEventListener?.('change',position);
 const observer=new MutationObserver(position);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
 addEventListener('pagehide',()=>{observer.disconnect();removeEventListener('resize',resize);},{once:true});position();
})();
