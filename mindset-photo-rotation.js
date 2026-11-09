/* Mindset photo rotator: preserves original portrait, cycles four uploaded moments. */
(() => {
 const rotator=document.querySelector('#portfolio-intro-grid .mk-mindset-photo-rotator');
 if(!rotator)return;
 const frames=[...rotator.querySelectorAll('.mk-mindset-frame')];
 const next=rotator.querySelector('.mk-mindset-next');
 const indexLabel=rotator.querySelector('.mk-mindset-index');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let current=0,visible=true,hovered=false,focused=false;
 function show(index){
  current=(index+frames.length)%frames.length;
  frames.forEach((frame,i)=>frame.classList.toggle('is-active',i===current));
  indexLabel.textContent=String(current+1).padStart(2,'0')+' / '+String(frames.length).padStart(2,'0');
 }
 next.addEventListener('click',()=>show(current+1));
 rotator.addEventListener('mouseenter',()=>hovered=true);
 rotator.addEventListener('mouseleave',()=>hovered=false);
 rotator.addEventListener('focusin',()=>focused=true);
 rotator.addEventListener('focusout',e=>{if(!rotator.contains(e.relatedTarget))focused=false});
 if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>visible=entries[0]?.isIntersecting??false,{threshold:.05}).observe(rotator);
 }
 setInterval(()=>{
  if(!reduced.matches&&visible&&!hovered&&!focused&&!document.hidden)show(current+1);
 },4700);
 show(0);

})();
