/** Dependency-free WebGL spatial film sculpture. Content never depends on WebGL. */
(()=>{'use strict';
const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');
const host=document.querySelector('.home-hero,.interior-hero');if(!host)return;
const canvas=document.createElement('canvas');canvas.className='spatial-canvas';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});}catch{}if(!gl){canvas.remove();return;}
const vertex=`attribute vec3 p;uniform float time;uniform float aspect;uniform vec2 aim;varying float depth;void main(){float a=time*.055+aim.x*.12;float b=.42+aim.y*.1;vec3 v=p;v.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*v.xz;v.yz=mat2(cos(b),-sin(b),sin(b),cos(b))*v.yz;v.x+=1.1;float z=v.z+6.0;gl_Position=vec4(v.x*1.55/aspect,v.y*1.55,0.0,z);depth=clamp(1.0-z/12.0,.15,.8);}`;
const frag=`precision mediump float;varying float depth;void main(){gl_FragColor=vec4(1.0,.72,.21,depth*.48);}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');return s;}
let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('program');}catch{canvas.remove();return;}
// Three-dimensional concentric reels and helically spaced film perforations.
const points=[];function line(a,b){points.push(...a,...b)}
for(const z of [-.6,.6])for(const r of [2.15,2.35,2.7])for(let i=0;i<128;i++){let a=i*Math.PI/64,b=(i+1)*Math.PI/64;line([Math.cos(a)*r,Math.sin(a)*r,z],[Math.cos(b)*r,Math.sin(b)*r,z]);}
for(let i=0;i<64;i++){const a=i*Math.PI/32;for(const r of [2.15,2.7])line([Math.cos(a)*r,Math.sin(a)*r,-.6],[Math.cos(a)*r,Math.sin(a)*r,.6]);}
for(let j=0;j<6;j++){const a=j*Math.PI/3,cx=Math.cos(a)*1.35,cy=Math.sin(a)*1.35;for(let i=0;i<40;i++){const b=i*Math.PI/20,c=(i+1)*Math.PI/20;line([cx+Math.cos(b)*.48,cy+Math.sin(b)*.48,.61],[cx+Math.cos(c)*.48,cy+Math.sin(c)*.48,.61]);}}
gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,0,0);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
const t=gl.getUniformLocation(program,'time'),asp=gl.getUniformLocation(program,'aspect'),aim=gl.getUniformLocation(program,'aim');let x=0,y=0,visible=true,frame=0,clock=0,last=0,lost=false;
const enabled=()=>!reduce.matches&&root.dataset.motion!=='off'&&root.dataset.motion!=='subtle'&&root.dataset.ambient!=='off'&&root.dataset.minimal!=='on'&&!document.hidden&&visible&&!lost;
function size(){const r=host.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,innerWidth<700?1:1.5);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(asp,canvas.width/Math.max(canvas.height,1));}
function draw(now){frame=0;if(!enabled())return;if(now-last>32){clock+=Math.min((now-last)/1000,.05);last=now;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(t,clock);gl.uniform2f(aim,x,y);gl.drawArrays(gl.LINES,0,points.length/3);}frame=requestAnimationFrame(draw);}
function sync(){if(frame)cancelAnimationFrame(frame);frame=0;canvas.hidden=!enabled();if(enabled()){last=performance.now();frame=requestAnimationFrame(draw);}}
host.addEventListener('pointermove',e=>{if(root.dataset.parallax==='off'||e.pointerType==='touch')return;const r=host.getBoundingClientRect();x=(e.clientX-r.left)/r.width-.5;y=(e.clientY-r.top)/r.height-.5;},{passive:true});
if('IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();},{rootMargin:'80px'}).observe(host);
new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-motion','data-ambient','data-minimal']});
if('ResizeObserver'in window)new ResizeObserver(size).observe(host);else addEventListener('resize',size);
reduce.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;sync();});canvas.addEventListener('webglcontextrestored',()=>{canvas.remove();});
size();sync();
})();
