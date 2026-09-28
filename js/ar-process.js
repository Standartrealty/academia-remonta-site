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
 let length = 0, pending = false, samples = [];
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
  steps.forEach(step=>step.classList.toggle('is-reached', reduced.matches || step.querySelector('.ar-process__number').getBoundingClientRect().top<cursor));
 }
 function scroll(){if(!pending){pending=true;requestAnimationFrame(update);}}
 if(!reduced.matches)section.classList.add('is-animated');
 reduced.addEventListener('change',()=>{section.classList.toggle('is-animated',!reduced.matches);draw();});
 new ResizeObserver(draw).observe(route);
 addEventListener('scroll',scroll,{passive:true});addEventListener('resize',draw,{passive:true});
 document.fonts?.ready.then(draw);draw();
})();
