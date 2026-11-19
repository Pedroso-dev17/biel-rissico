/** RISICCO V8 — dependency-free GPU Cosmic Sheet adaptation.
 * Reference generator from supplied technical file plus adapted GPU renderer: seeded sheet,
 * perspective particles, dynamic flow and ambient dust. Not a verbatim Three.js port.
 * Static DOM content is authoritative; WebGL is progressively enhanced only.
 */
(()=>{'use strict';
 const html=document.documentElement, host=document.querySelector('.home-hero');if(!host)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=document.createElement('canvas');canvas.className='v8-cosmic-canvas';canvas.setAttribute('aria-hidden','true');canvas.setAttribute('role','presentation');
 const shell=document.createElement('div');shell.className='v8-cosmic-surface';shell.setAttribute('aria-hidden','true');shell.append(canvas);host.insertBefore(shell,host.firstChild);
 let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,premultipliedAlpha:false,powerPreference:'default'});}catch(e){}
 if(!gl){shell.classList.add('v8-no-webgl');return;}
 const vert=`precision highp float;
 attribute vec3 aPosition;attribute float aMix;attribute float aScale;attribute float aPhase;
 uniform float uTime;uniform vec2 uPointer;uniform float uAspect;uniform float uScale;uniform float uSpin;
 varying float vMix;varying float vAlpha;
 void main(){vec3 p=aPosition;
 float t=uTime;float phase=p.x*1.6+p.z*1.75;
 p.y+=sin(phase*1.5+t*.64+aPhase)*.13+sin(p.x*3.0-p.z*2.6+t*.25)*.045;
 p.z+=sin(p.x*1.6+t*.2)*.10;
 float spin=uSpin*.08;mat2 rot=mat2(cos(spin),-sin(spin),sin(spin),cos(spin));p.xz=rot*p.xz;
 p.xy+=uPointer*vec2(.19,.12);p.x+=.36;
 float distance=5.0-p.z;vec2 projected=vec2(p.x*1.48/uAspect,p.y*1.48)/distance*4.3;
 gl_Position=vec4(projected,0.,1.);
 float px=uScale*aScale/distance;
 vAlpha=clamp(px*px/4.,.15,1.)*(.46+.54*pow(max(0.,1.-abs(p.x)*.24),1.5));
 gl_PointSize=clamp(px,2.,11.);
 vMix=clamp(aMix+.08*sin(t*.21+aPhase),0.,1.);
 }`;
 const frag=`precision mediump float;uniform float uOpacity;varying float vMix;varying float vAlpha;
 void main(){float d=distance(gl_PointCoord,vec2(.5));if(d>.5)discard;
 float a=1.-smoothstep(.06,.5,d);a=a*a*(.6+.4*a);
 vec3 gold=vec3(1.,.941,.145);vec3 graphite=vec3(.184,.169,.196);
 vec3 col=mix(gold,graphite,smoothstep(0.,1.,vMix));
 gl_FragColor=vec4(col,a*vAlpha*uOpacity);
 }`;
 const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 let prog;try{prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vert));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));}catch(e){console.warn('RISICCO: GPU effect disabled',e);shell.classList.add('v8-no-webgl');return;}
 gl.useProgram(prog);const buf=gl.createBuffer();const loc={pos:gl.getAttribLocation(prog,'aPosition'),mix:gl.getAttribLocation(prog,'aMix'),scale:gl.getAttribLocation(prog,'aScale'),phase:gl.getAttribLocation(prog,'aPhase')};
 const un={time:gl.getUniformLocation(prog,'uTime'),pointer:gl.getUniformLocation(prog,'uPointer'),aspect:gl.getUniformLocation(prog,'uAspect'),scale:gl.getUniformLocation(prog,'uScale'),spin:gl.getUniformLocation(prog,'uSpin'),opacity:gl.getUniformLocation(prog,'uOpacity')};
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
 // Parameters retain the reference kind/seed and optional ULTRA count. Generation is
 // intentionally adapted to plain WebGL for offline availability (no CDN dependency).
 const SPEC={kind:'cosmicSheet',seed:1690455487,count:250000,size:1.95,speed:.45,opacity:.7,colorA:'#fff025',colorB:'#2f2b32',ambient:2600};
 let n=0,quality='',width=0,height=0,dpr=1,frame=0,last=0,clock=0,visible=true,lost=false,disposed=false,pX=0,pY=0,tX=0,tY=0;
 function randSource(seed){let a=seed|0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
 function profile(){const q=html.dataset.quality||'auto';if(q!=='auto')return q;
   const mobile=matchMedia('(max-width: 760px)').matches;const cores=navigator.hardwareConcurrency||4;
   return mobile||cores<=4?'low':'balanced';}
 const counts={ultra:250000,high:130000,balanced:65000,low:18000,static:0};
 function generateFallback(data,requested,all,rng){
   for(let i=0;i<all;i++){
     const at=i*6,u=rng(),v=rng(),w=rng();
     if(i<requested){const layer=i%3, x=(u-.5)*3.3;
       data[at]=x+(rng()-.5)*.052;
       data[at+1]=Math.sin(u*6.8+v*2.3+layer*.9)*(.32+.14*v)+(v-.5)*.38;
       data[at+2]=(v-.5)*1.95+Math.cos(u*7.5+v*3.5)*.30;
       data[at+3]=Math.min(1,.03+v*.79+layer*.04);
       data[at+4]=.45+Math.pow(w,3);data[at+5]=rng()*6.283;
     }else{data[at]=(u-.5)*4.9;data[at+1]=(v-.5)*2.7;data[at+2]=(w-.5)*2.8;
       data[at+3]=rng();data[at+4]=.1+rng()*.28;data[at+5]=rng()*6.283;}
   }
 }
 function populate(q){if(!gl||disposed||lost)return;let requested=counts[q]??65000;
   const rng=randSource(SPEC.seed);const all=requested+(requested?SPEC.ambient:0);const data=new Float32Array(all*6);
   const gen=window.RisiccoParticleGenerator;
   if(gen && requested){
     try{
       // EXACT reference generator: original seeded cosmicSheet sheet, normalization,
       // density, ambient layers, mix and per-particle size attributes.
       const F=gen.generate(SPEC.kind,SPEC.seed,requested);
       const out=[0,0,0,0,0];
       for(let i=0;i<requested;i++){
         gen.evalParticle(F,i,0,out);
         const at=i*6,i4=i*4;
         data[at]=out[0];data[at+1]=out[1];data[at+2]=out[2];
         data[at+3]=out[3];data[at+4]=F.aR[i4];data[at+5]=F.aR[i4+1]*6.283185;
       }
       // Independent 2,600 ambient dust points as specified outside the generator.
       const dust=randSource(SPEC.seed^0x43726412);
       for(let i=requested;i<all;i++){
         const at=i*6,theta=dust()*6.283185,z=dust()*2-1,r=1.55+Math.cbrt(dust())*1.55;
         const ring=Math.sqrt(1-z*z);
         data[at]=Math.cos(theta)*ring*r;data[at+1]=z*r*.56;data[at+2]=Math.sin(theta)*ring*r;
         data[at+3]=dust();data[at+4]=.12+dust()*.25;data[at+5]=dust()*6.283185;
       }
     }catch(error){console.warn('RISICCO generator fallback',error);generateFallback(data,requested,all,rng);}
   }else if(requested)generateFallback(data,requested,all,rng);
   gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
   for(const [name,index] of [['pos',0],['mix',3],['scale',4],['phase',5]]){
     gl.enableVertexAttribArray(loc[name]);gl.vertexAttribPointer(loc[name],name==='pos'?3:1,gl.FLOAT,false,24,index*4);
   }
   n=all;quality=q;
 }
 function active(){return !disposed&&!lost&&!reduced.matches&&!document.hidden&&visible&&html.dataset.motion!=='off'&&html.dataset.motion!=='subtle'&&html.dataset.ambient!=='off'&&html.dataset.minimal!=='on'&&profile()!=='static';}
 function resize(){if(!gl||disposed)return;const r=host.getBoundingClientRect();width=Math.max(1,Math.round(r.width));height=Math.max(1,Math.round(r.height));dpr=Math.min(window.devicePixelRatio||1,width<760?1.25:2);
   canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);
   gl.uniform1f(un.aspect,Math.max(.75,width/height));gl.uniform1f(un.scale,SPEC.size*dpr*height*.0045*5.0);
 }
 function tick(now){frame=0;if(!active())return;const dt=Math.min(.05,(now-last)/1000);last=now;clock+=dt*SPEC.speed;
   pX+=(tX-pX)*.045;pY+=(tY-pY)*.045;
   gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
   gl.uniform1f(un.time,clock);gl.uniform1f(un.spin,clock*.0411);gl.uniform2f(un.pointer,pX,pY);
   gl.uniform1f(un.opacity,.78*SPEC.opacity*Math.max(.3,Math.min(2.2,Math.sqrt(160000/Math.max(1,n))))*.8*(html.dataset.motion==='balanced'?.76:1));
   gl.drawArrays(gl.POINTS,0,n);frame=requestAnimationFrame(tick);
 }
 function sync(){if(disposed)return;if(frame)cancelAnimationFrame(frame);frame=0;const isActive=active();canvas.hidden=!isActive;
   if(isActive){const q=profile();if(q!==quality)populate(q);last=performance.now();frame=requestAnimationFrame(tick);}}
 const onPointer=e=>{if(e.pointerType==='touch'||html.dataset.parallax==='off')return;const r=host.getBoundingClientRect();tX=Math.max(-.5,Math.min(.5,(e.clientX-r.left)/r.width-.5));tY=Math.max(-.5,Math.min(.5,(e.clientY-r.top)/r.height-.5));};
 const onLost=e=>{e.preventDefault();lost=true;sync();};const onRestored=()=>{location.reload();};
 host.addEventListener('pointermove',onPointer,{passive:true});canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',onRestored);
 const ro=window.ResizeObserver?new ResizeObserver(resize):null;ro?.observe(host);if(!ro)window.addEventListener('resize',resize);
 const io=window.IntersectionObserver?new IntersectionObserver(es=>{visible=es[0]?.isIntersecting??false;sync();},{rootMargin:'100px'}):null;io?.observe(host);
 const mo=new MutationObserver(sync);mo.observe(html,{attributes:true,attributeFilter:['data-motion','data-ambient','data-minimal','data-quality']});
 const onVisibility=()=>sync();const onReduced=()=>sync();document.addEventListener('visibilitychange',onVisibility);reduced.addEventListener?.('change',onReduced);
 function teardown(){if(disposed)return;disposed=true;if(frame)cancelAnimationFrame(frame);io?.disconnect();ro?.disconnect();mo.disconnect();
   host.removeEventListener('pointermove',onPointer);document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener?.('change',onReduced);
   canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);
   if(!ro)window.removeEventListener('resize',resize);gl.deleteBuffer(buf);gl.deleteProgram(prog);shell.remove();}
 window.addEventListener('pagehide',teardown,{once:true});resize();sync();
})();
