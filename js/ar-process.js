(() => {
 const section = document.querySelector('.ar-process');
 if (!section) return;
 const route = section.querySelector('.ar-process__route');
 const svg = section.querySelector('svg');
 const track = svg.querySelector('.ar-process__track');
 const progress = svg.querySelector('.ar-process__progress');
 const steps = [...section.querySelectorAll('.ar-process__step')];
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const mobile = matchMedia('(max-width: 700px)');
 let length = 0, pending = false, samples = [], arrows = [];
 const arrowGroup=document.createElementNS("http://www.w3.org/2000/svg","g");svg.append(arrowGroup);
 const elements = [section.querySelector('.ar-process__start .ar-process__anchor'), ...steps.map(s => s.querySelector('.ar-process__number')), section.querySelector('.ar-process__finish .ar-process__anchor')];
 function draw() {
  const box = route.getBoundingClientRect();
  const pts = elements.map(el => {const r=el.getBoundingClientRect();return {x:r.left-box.left+r.width/2,y:r.top-box.top+r.height/2};});
  svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
  let d=`M${pts[0].x},${pts[0].y}`;
  for(let i=1;i<pts.length;i++){
   const a=pts[i-1],b=pts[i];
   if(mobile.matches){
    const bend=(a.y+b.y)/2;
    d+=` C${a.x-34},${a.y+50} ${a.x+38},${bend-10} ${(a.x+b.x)/2},${bend} S${b.x-32},${b.y-42} ${b.x},${b.y}`;
   }else{
    const direction=b.x>=a.x?1:-1;
    const bend=Math.max(55,Math.abs(b.x-a.x)*.42);
    d+=` C${a.x+direction*bend},${a.y-16} ${b.x-direction*bend},${b.y+48} ${b.x},${b.y}`;
   }
  }
  track.setAttribute('d',d);progress.setAttribute('d',d);length=progress.getTotalLength();progress.style.strokeDasharray=length;
  samples=[];for(let d=0;d<=length;d+=4)samples.push([d,progress.getPointAtLength(d).y]);
  arrowGroup.replaceChildren();arrows=[];
  const obstacles=[...route.querySelectorAll('.ar-process__card,.ar-process__photo,figure')].map(el=>{const r=el.getBoundingClientRect();return {l:r.left-box.left-12,r:r.right-box.left+12,t:r.top-box.top-12,b:r.bottom-box.top+12};});
  for(let target=length/9;target<length;target+=length/7){
   for(let d=target;d<Math.min(length,target+100);d+=10){
    const p=progress.getPointAtLength(d);
    if(obstacles.some(r=>p.x>r.l&&p.x<r.r&&p.y>r.t&&p.y<r.b))continue;
    const before=progress.getPointAtLength(Math.max(0,d-2));
    const a=document.createElementNS('http://www.w3.org/2000/svg','path');a.setAttribute('d','M-6,-4 L0,0 L-6,4');a.setAttribute('stroke','#ff790f');a.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${Math.atan2(p.y-before.y,p.x-before.x)*180/Math.PI})`);arrowGroup.append(a);arrows.push([d,a]);break;
   }
  }
  update();
 }
 function update(){
  pending=false;
  const r=route.getBoundingClientRect();
  const cursor=innerHeight*.78;
  const fraction=reduced.matches?1:Math.min(1,Math.max(0,(cursor-r.top)/r.height));
  // Locate the furthest route point reached by the viewport, including horizontal turns.
  let visible=0;
  if(reduced.matches) visible=length;
  else for(const [d,y] of samples){if(y<=cursor-r.top)visible=d;}
  if(fraction===1)visible=length;
  progress.style.strokeDashoffset=length-visible;
  arrows.forEach(([d,a])=>a.style.opacity=d<=visible?1:0);
  steps.forEach(step=>step.classList.toggle('is-reached', reduced.matches || step.querySelector('.ar-process__number').getBoundingClientRect().top<cursor));
 }
 function scroll(){if(!pending){pending=true;requestAnimationFrame(update);}}
 if(!reduced.matches)section.classList.add('is-animated');
 reduced.addEventListener('change',()=>{section.classList.toggle('is-animated',!reduced.matches);draw();});
 new ResizeObserver(draw).observe(route);
 addEventListener('scroll',scroll,{passive:true});addEventListener('resize',draw,{passive:true});
 document.fonts?.ready.then(draw);draw();
})();
