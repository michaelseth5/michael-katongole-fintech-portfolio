'use strict';
/* Four landmarks inside Home's own TV channel. No page-level scrolling. */
(() => {
  const stage=document.querySelector('#main-content.tv-stage');
  const panel=stage?.querySelector('.tv-page-home');
  if(!stage || !panel)return;
  const home=document.getElementById('home');
  const landmarks=[
    {label:'Hero',node:home},
    {label:'Mindset',node:panel.querySelector('.mk-bento-mindset')},
    {label:'Craft',node:panel.querySelector('.mk-bento-craft')},
    {label:'Next Chapter',node:panel.querySelector('.mk-nyc-map-card')}
  ];
  if(landmarks.some(entry=>!entry.node))return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const cue=document.createElement('button');
  cue.type='button';cue.className='tv-home-scroll-cue';
  cue.setAttribute('aria-label','Scroll to next section');
  cue.innerHTML='<span class="tv-scroll-word" aria-hidden="true">SCROLL</span><span class="tv-scroll-chevron" aria-hidden="true">⌄</span>';
  const progress=document.createElement('nav');
  progress.className='tv-home-progress';
  progress.setAttribute('aria-label','Home section progress');
  const dots=landmarks.map((item,i)=>{
    const dot=document.createElement('button');
    dot.type='button';
    dot.setAttribute('aria-label','Scroll to '+item.label);
    dot.title=item.label;
    dot.dataset.landmark=String(i);
    progress.appendChild(dot);
    return dot;
  });
  stage.append(cue,progress);

  let permanentlyHidden=false,ready=false,activeIndex=0,revealTimer=0,scrollFrame=0;
  const isActive=()=>panel.classList.contains('is-active') && !stage.inert;
  const destinationTop=node=>{
    const top=panel.scrollTop+node.getBoundingClientRect().top-panel.getBoundingClientRect().top;
    return Math.max(0,Math.min(top-12,panel.scrollHeight-panel.clientHeight));
  };
  const jumpTo=i=>{
    if(!isActive())return;
    const node=landmarks[i]?.node;
    if(!node)return;
    panel.scrollTo({top:destinationTop(node),behavior:reduced.matches?'instant':'smooth'});
  };
  const update=()=>{
    scrollFrame=0;
    if(panel.scrollTop>80)permanentlyHidden=true;
    const eligible=isActive();
    cue.classList.toggle('is-shown',eligible && ready && !permanentlyHidden);
    cue.disabled=!eligible || permanentlyHidden;
    progress.hidden=!eligible;
    if(!eligible)return;
    const cutoff=panel.getBoundingClientRect().top+Math.min(220,panel.clientHeight*.35);
    let selected=0;
    for(let i=1;i<landmarks.length;i++){
      if(landmarks[i].node.getBoundingClientRect().top<=cutoff)selected=i;
    }
    activeIndex=selected;
    dots.forEach((dot,i)=>{
      if(i===selected)dot.setAttribute('aria-current','location');
      else dot.removeAttribute('aria-current');
    });
  };
  const schedule=()=>{
    if(!scrollFrame)scrollFrame=requestAnimationFrame(update);
  };
  cue.addEventListener('click',()=>jumpTo(1));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>jumpTo(i)));
  panel.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('portfolio:channel-change',schedule);

  document.addEventListener('keydown',e=>{
    if(e.defaultPrevented || !isActive() || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)return;
    if(e.key!=='ArrowDown' && e.key!=='PageDown')return;
    if(e.target.closest('input,textarea,select,[contenteditable="true"],[role="slider"],dialog,.photo-carousel-rail,.hobby-carousel-track'))return;
    // Do not hijack vertical scrolling when a control within Home already handles it.
    if(e.target.closest('button,[role="button"],a') && e.target!==cue && !progress.contains(e.target))return;
    if(activeIndex>=landmarks.length-1)return;
    e.preventDefault();
    jumpTo(activeIndex+1);
  });

  // Reveal only once, two seconds after the first page load.
  revealTimer=setTimeout(()=>{ready=true;schedule()},2000);
  schedule();
})();
