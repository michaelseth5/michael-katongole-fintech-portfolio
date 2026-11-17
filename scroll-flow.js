'use strict';
/* Progressive reveal. TV channel events are emitted by tv-channels.js. */
(()=>{
  const host=document.getElementById('main-content');
  if(!host)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const small=matchMedia('(max-width:767px)');
  const revealSelector=[
    '.page-hero','.mk-intro-top','.mk-intro-heading','.bc-story',
    '.timeline > article','.selected-projects-grid > *','.project-block',
    '.dev-milestone','.dev-track > .dev-program',
    '.network-event-slide','.large-panel','.mk-connect-left',
    '.mk-chat-panel','.hobbies-carousel-wrap','.mk-craft-education'
  ].join(',');
  let io=null,scrollRoot=null,raf=0,activePage=null;
  const ready=new WeakSet();
  let parallaxNodes=[];
  const supportsTimeline=CSS.supports?.('animation-timeline: view()')||false;
  function rootFor(page){return page?.classList.contains('tv-page')?page:null}
  function currentPage(){
    return host.querySelector('.tv-page.is-active') || host;
  }
  function visible(el){
    const r=el.getBoundingClientRect();
    const top=scrollRoot?scrollRoot.getBoundingClientRect().top:0;
    const bottom=scrollRoot?scrollRoot.getBoundingClientRect().bottom:innerHeight;
    return r.bottom>top && r.top<bottom;
  }
  function onScroll(){
    if(raf||reduce.matches)return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      if(!activePage)return;
      const viewport=scrollRoot?.getBoundingClientRect()||{top:0,bottom:innerHeight,height:innerHeight};
      const h=viewport.height||innerHeight;
      if(!supportsTimeline){
        activePage.querySelectorAll('[data-flow-exit]').forEach(section=>{
          const box=section.getBoundingClientRect();
          const progress=Math.max(0,Math.min(1,(viewport.top-box.top)/Math.max(box.height*.6,1)));
          section.style.opacity=String(1-progress*.18);
          section.style.transform='scale('+(1-progress*.04)+')';
        });
      }
      if(small.matches)return;
      parallaxNodes.forEach(el=>{
        const box=el.getBoundingClientRect();
        if(box.bottom<viewport.top||box.top>viewport.bottom)return;
        const offset=Math.max(-18,Math.min(18,(box.top-(viewport.top+h/2))*.035));
        el.style.setProperty('--flow-parallax',offset.toFixed(1)+'px');
      });
    });
  }
  function clear(){
    io?.disconnect();io=null;
    scrollRoot?.removeEventListener('scroll',onScroll);
    if(!scrollRoot)removeEventListener('scroll',onScroll);
    cancelAnimationFrame(raf);raf=0;
    parallaxNodes.forEach(el=>el.style.removeProperty('--flow-parallax'));
    parallaxNodes=[];
  }
  function activate(page){
    clear();
    if(!page || reduce.matches){host.classList.remove('flow-enabled');return}
    activePage=page;scrollRoot=rootFor(page);
    const elements=[...page.querySelectorAll(revealSelector)].filter(el=>
      !el.closest('[hidden],[aria-hidden="true"],dialog') &&
      !el.classList.contains('mk-reveal') &&
      !el.closest('.mk-reveal')
    );
    const groups=new Map();
    elements.forEach(el=>{
      if(!ready.has(el)){
        ready.add(el);
        el.setAttribute('data-flow-reveal','');
      }
      const parent=el.parentElement;
      const index=groups.get(parent)||0;
      groups.set(parent,index+1);
      el.style.setProperty('--flow-delay',Math.min(index,5)*80+'ms');
    });
    page.querySelectorAll(':scope > section.section, :scope > #portfolio-intro-grid').forEach(el=>{
      if(el.id!=='home' && el.id!=='contact' && el.id!=='achievements')el.setAttribute('data-flow-exit','');
    });
    parallaxNodes=small.matches?[]:[...page.querySelectorAll('.dev-logo-frame img,.bc-tile img,.network-event-slide img')]
      .filter(el=>!el.closest('[data-flow-reveal]') || el.closest('[data-flow-reveal]')!==el);
    parallaxNodes.forEach(el=>el.setAttribute('data-flow-parallax',''));
    io=new IntersectionObserver(entries=>{
      const hits=entries.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      hits.forEach((entry,i)=>{
        const el=entry.target;
        el.style.setProperty('--flow-delay',Math.min(i,5)*80+'ms');
        el.classList.add('is-visible','flow-animating');
        el.addEventListener('transitionend',()=>el.classList.remove('flow-animating'),{once:true});
        io.unobserve(el);
      });
    },{root:scrollRoot,threshold:.06,rootMargin:'0px 0px 70px 0px'});
    elements.forEach(el=>{
      if(el.classList.contains('is-visible'))return;
      if(visible(el)){el.classList.add('is-visible');return}
      io.observe(el);
    });
    host.classList.add('flow-enabled');
    (scrollRoot||window).addEventListener('scroll',onScroll,{passive:true});
    onScroll();
  }
  function settled(){
    const page=currentPage();
    requestAnimationFrame(()=>activate(page));
  }
  /* Start at navigation settle, not the intermediate channel-change moment. */
  document.addEventListener('portfolio:channel-settled',settled);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',settled,{once:true});
  else settled();
  reduce.addEventListener('change',()=>{
    if(reduce.matches){
      clear();host.classList.remove('flow-enabled');
      host.querySelectorAll('[data-flow-reveal]').forEach(el=>el.classList.add('is-visible'));
      host.querySelectorAll('[data-flow-exit]').forEach(el=>{el.style.removeProperty('opacity');el.style.removeProperty('transform')});
    }else settled();
  });
})();
