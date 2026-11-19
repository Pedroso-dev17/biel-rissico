/** Additive cursor, 40-sample quadratic spline. Native system cursor is NEVER replaced. */
(()=>{'use strict';
 const html=document.documentElement,coarse=matchMedia('(hover: hover) and (pointer: fine)'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let layer,ctx,frame=0,points=[],active=false,opacity=0,lastPointer=0,last=0;
 const N=40,headWidth=15,dprCap=2;
 const shouldMount=()=>coarse.matches&&!reduce.matches&&html.dataset.cursor!=='off'&&html.dataset.motion!=='off'&&html.dataset.minimal!=='on';
 function resize(){if(!layer)return;const d=Math.min(devicePixelRatio||1,dprCap);layer.width=Math.ceil(innerWidth*d);layer.height=Math.ceil(innerHeight*d);layer.style.width='100vw';layer.style.height='100vh';ctx.setTransform(d,0,0,d,0,0);}
 function pointer(e){if(e.pointerType==='touch')return;lastPointer=performance.now();if(!active){points=[];opacity=0;active=true;}points.unshift({x:e.clientX,y:e.clientY});if(points.length>N)points.length=N;}
 function draw(now){frame=0;if(!layer)return;const dt=Math.min(.06,Math.max(0,(now-last)/1000));last=now;
   ctx.clearRect(0,0,innerWidth,innerHeight);
   if(active&&now-lastPointer>60)opacity=Math.max(0,opacity-dt*.9);else if(active)opacity=Math.min(.8,opacity+dt*3);
   if(points.length>1&&opacity>.01){
     // Tail is thinned by path section, and each quadratic is joined at midpoints.
     for(let i=0;i<points.length-1;i++){
       const a=points[i],b=points[i+1],c=points[Math.min(points.length-1,i+2)];
       const progress=i/(N-1),fade=Math.pow(1-progress,1.9);
       const grad=ctx.createLinearGradient(a.x,a.y,c.x+1,c.y+1);
       grad.addColorStop(0,'rgba(255,255,255,.95)');grad.addColorStop(.9,'rgba(91,155,246,.76)');
       ctx.beginPath();ctx.moveTo((a.x+b.x)/2,(a.y+b.y)/2);
       ctx.quadraticCurveTo(b.x,b.y,(b.x+c.x)/2,(b.y+c.y)/2);
       ctx.lineCap='round';ctx.strokeStyle=grad;ctx.lineWidth=Math.max(.15,headWidth*fade);
       ctx.globalAlpha=opacity*fade*.9;ctx.shadowColor='rgba(255,202,64,.38)';ctx.shadowBlur=7*fade;ctx.stroke();
     }
     ctx.globalAlpha=1;ctx.shadowBlur=0;
   }
   if(opacity>.01||now-lastPointer<450)frame=requestAnimationFrame(draw);else active=false;
 }
 function sync(){const use=shouldMount();if(use&&!layer){
   layer=document.createElement('canvas');layer.className='v8-swirl-cursor';layer.setAttribute('aria-hidden','true');
   layer.style.cssText='position:fixed;inset:0;z-index:10000;pointer-events:none;user-select:none;';
   document.body.append(layer);ctx=layer.getContext('2d');resize();addEventListener('pointermove',pointer,{passive:true});addEventListener('resize',resize,{passive:true});html.classList.add('v8-swirl-enabled');
 }else if(!use&&layer){
   removeEventListener('pointermove',pointer);removeEventListener('resize',resize);if(frame)cancelAnimationFrame(frame);frame=0;layer.remove();layer=null;ctx=null;points=[];active=false;html.classList.remove('v8-swirl-enabled');
 }}
 const observer=new MutationObserver(sync);observer.observe(html,{attributes:true,attributeFilter:['data-motion','data-cursor','data-minimal']});
 coarse.addEventListener?.('change',sync);reduce.addEventListener?.('change',sync);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){active=false;opacity=0;if(ctx)ctx.clearRect(0,0,innerWidth,innerHeight);}});
 addEventListener('pagehide',()=>{removeEventListener('pointermove',startFrame);observer.disconnect();if(layer){removeEventListener('pointermove',pointer);removeEventListener('resize',resize);if(frame)cancelAnimationFrame(frame);layer.remove();}},{once:true});
 sync();
 const startFrame=()=>{if(layer&&!frame){last=performance.now();frame=requestAnimationFrame(draw);}};
 addEventListener('pointermove',startFrame,{passive:true});
})();
