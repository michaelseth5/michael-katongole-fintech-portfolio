'use strict';
/* Four landmarks inside Home's own TV channel. No page-level scrolling. */
(() => {
  const stage=document.querySelector('#main-content.tv-stage');
  const panel=stage?.querySelector('.tv-page-home');
  if(!stage || !panel){
    // Classic mobile has document scrolling rather than a TV scroll panel.
    if(!document.documentElement.classList.contains('mobile-classic'))return;
    const mobileLandmarks=[
      document.getElementById('home'),
      document.querySelector('.mk-bento-mindset'),
      document.querySelector('.mk-bento-craft'),
      document.querySelector('.mk-nyc-map-card')
    ];
    if(mobileLandmarks.some(node=>!node))return;
    const mobileNav=document.createElement('nav');
    mobileNav.className='tv-home-section-buttons tv-home-section-buttons-mobile';
    mobileNav.setAttribute('aria-label','Home section scrolling');
    const button=(label,symbol)=>{
      const el=document.createElement('button');
      el.type='button';
      el.className='tv-home-section-button';
      el.setAttribute('aria-label',label);
      el.innerHTML='<span aria-hidden="true">'+symbol+'</span>';
      mobileNav.append(el);
      return el;
    };
    const up=button('Scroll up one section','⌃');
    const down=button('Scroll down one section','⌄');
    document.body.append(mobileNav);
    let current=0,pending=0;
    const updateMobile=()=>{
      pending=0;
      const cutoff=Math.min(220,innerHeight*.35);
      current=0;
      for(let i=1;i<mobileLandmarks.length;i++){
        if(mobileLandmarks[i].getBoundingClientRect().top<=cutoff)current=i;
      }
      up.disabled=current===0;
      down.disabled=current>=mobileLandmarks.length-1;
    };
    const jumpMobile=offset=>{
      const target=mobileLandmarks[Math.min(mobileLandmarks.length-1,Math.max(0,current+offset))];
      window.scrollTo({top:target.getBoundingClientRect().top+scrollY-16,
        behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    };
    up.addEventListener('click',()=>jumpMobile(-1));
    down.addEventListener('click',()=>jumpMobile(1));
    const scheduleMobile=()=>{if(!pending)pending=requestAnimationFrame(updateMobile)};
    addEventListener('scroll',scheduleMobile,{passive:true});
    addEventListener('resize',scheduleMobile,{passive:true});
    scheduleMobile();
    return;
  }
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
  home.append(cue); // Keep SCROLL at the bottom of the hero, before the welcome notice.
  stage.append(progress);
  const sectionButtons=document.createElement('nav');
  sectionButtons.className='tv-home-section-buttons';
  sectionButtons.setAttribute('aria-label','Home section scrolling');
  const makeSectionButton=(direction,label,symbol)=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='tv-home-section-button tv-home-section-'+direction;
    button.setAttribute('aria-label',label);
    button.title=label;
    button.innerHTML='<span aria-hidden="true">'+symbol+'</span>';
    sectionButtons.append(button);
    return button;
  };
  const scrollUp=makeSectionButton('up','Scroll up one section','⌃');
  const scrollDown=makeSectionButton('down','Scroll down one section','⌄');
  stage.append(sectionButtons);

  let ready=false,activeIndex=0,revealTimer=0,scrollFrame=0,wasActive=false;
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
    const eligible=isActive();
    // Returning to Home is a fresh visit: start at the hero and show the cue again.
    if(eligible && !wasActive){
      panel.scrollTop=0;
      ready=true;
    }
    wasActive=eligible;
    const nearTop=panel.scrollTop<=80;
    cue.classList.toggle('is-shown',eligible && ready && nearTop);
    cue.disabled=!eligible || !nearTop;
    progress.hidden=!eligible;
    sectionButtons.hidden=!eligible;
    if(!eligible){
      scrollUp.disabled=true;
      scrollDown.disabled=true;
      return;
    }
    const cutoff=panel.getBoundingClientRect().top+Math.min(220,panel.clientHeight*.35);
    let selected=0;
    for(let i=1;i<landmarks.length;i++){
      if(landmarks[i].node.getBoundingClientRect().top<=cutoff)selected=i;
    }
    activeIndex=selected;
    scrollUp.disabled=selected===0;
    scrollDown.disabled=selected>=landmarks.length-1;
    dots.forEach((dot,i)=>{
      if(i===selected)dot.setAttribute('aria-current','location');
      else dot.removeAttribute('aria-current');
    });
  };
  const schedule=()=>{
    if(!scrollFrame)scrollFrame=requestAnimationFrame(update);
  };
  cue.addEventListener('click',()=>jumpTo(1));
  scrollUp.addEventListener('click',()=>jumpTo(Math.max(0,activeIndex-1)));
  scrollDown.addEventListener('click',()=>jumpTo(Math.min(landmarks.length-1,activeIndex+1)));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>jumpTo(i)));
  // Let native wheel events scroll Home from the globe and all ordinary elements.
  // The small independently scrollable country-stats card is the one exception:
  // forward its wheel delta unchanged to Home, rather than trapping it in the card.
  // Globe.js alone owns modifier-wheel pinch zoom over the canvas.
  panel.addEventListener('wheel',event=>{
    if(!isActive() || event.ctrlKey || event.metaKey || !event.cancelable)return;
    if(!event.target.closest('.gf-panel'))return;
    const unit=event.deltaMode===1?16:event.deltaMode===2?panel.clientHeight:1;
    event.preventDefault();
    panel.scrollTop+=event.deltaY*unit;
  },{passive:false});
  panel.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('portfolio:channel-change',()=>requestAnimationFrame(schedule));

  // In TV mode the document itself cannot scroll. Preserve familiar keyboard
  // scrolling without hijacking input fields, links, or custom controls.
  document.addEventListener('keydown',e=>{
    if(e.defaultPrevented || !isActive() || e.altKey || e.ctrlKey || e.metaKey)return;
    if(e.target.closest('input,textarea,select,[contenteditable="true"],[role="slider"],dialog,.photo-carousel-rail,.hobby-carousel-track'))return;
    if(e.target.closest('button,[role="button"],a,summary'))return;
    const pageStep=Math.max(80,panel.clientHeight*.85);
    let amount=0;
    if(e.key==='ArrowDown')amount=48;
    else if(e.key==='ArrowUp')amount=-48;
    else if(e.key==='PageDown' || (e.key===' ' && !e.shiftKey))amount=pageStep;
    else if(e.key==='PageUp' || (e.key===' ' && e.shiftKey))amount=-pageStep;
    else return;
    e.preventDefault();
    panel.scrollBy({top:amount,behavior:reduced.matches?'instant':'smooth'});
  });

  // First load reveals after two seconds; every later Home visit reveals immediately.
  revealTimer=setTimeout(()=>{ready=true;schedule()},2000);
  schedule();
})();
