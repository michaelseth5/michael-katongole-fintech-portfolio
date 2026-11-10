'use strict';
/* Nine full-screen channel views. Existing section DOM stays mounted and is moved,
   not duplicated, so carousels, panels, linked data, and form state are retained. */
(() => {
  const host = document.getElementById('main-content');
  const nav = document.getElementById('apple-navlinks');
  if (!host || !nav) return;

  const channels = [
    {key:'home', id:'home', label:'Home'},
    {key:'projects', id:'project-details', label:'Projects'},
    {key:'experience', id:'experience', label:'Experience'},
    {key:'skills', id:'skills', label:'Skills'},
    {key:'milestone', id:'achievements', label:'Milestones'},
    {key:'networking', id:'networking', label:'Networking'},
    {key:'reading', id:'listening-reading', label:'Reading'},
    {key:'hobbies', id:'hobbies', label:'Hobbies'},
    {key:'contact', id:'contact', label:'Contact'}
  ];
  const aliases = new Map(channels.flatMap((entry,i) => [
    [entry.key,i],[entry.id,i]
  ]));
  aliases.set('milestones',4);
    const found = channels.map(item => document.getElementById(item.id));
  if (found.some(item => !item)) return;

  // Preserve the non-nav editorial content inside Home and footer inside Contact.
  const homeExtras = [
    document.getElementById('site-preview-notice'),
    document.querySelector('.mk-purple-section-transition'),
    document.getElementById('portfolio-intro-grid')
  ].filter(Boolean);
  const finalExtras = [
    document.querySelector('.mk-footer-quotes'),
    document.querySelector('footer')
  ].filter(Boolean);
  const activeFromHash = () => {
    const raw = decodeURIComponent(location.hash.replace(/^#/, '')).toLowerCase();
    if (aliases.has(raw)) return aliases.get(raw);
    const target = raw ? document.getElementById(raw) : null;
    if (target) {
      const owner = target.closest('.tv-page');
      if (owner) return Number(owner.dataset.channel);
      const container = channels.findIndex(entry => target.closest('#' + entry.id));
      if (container >= 0) return container;
    }
    return 0;
  };
  const startIndex = activeFromHash();
  const panels = channels.map((entry,i) => {
    const p = document.createElement('div');
    p.className = 'tv-page' + (i===0?' tv-page-home':'');
    p.dataset.channel = String(i);
    p.dataset.channelName = entry.label;
    p.setAttribute('role','region');
    p.setAttribute('aria-label',entry.label+' page');
    p.setAttribute('aria-hidden',i===startIndex?'false':'true');
    if (i!==startIndex) p.inert = true;
    host.appendChild(p);
    p.appendChild(found[i]);
    if (i===0) homeExtras.forEach(node => p.appendChild(node));
    if (i===8) finalExtras.forEach(node => p.appendChild(node));
    return p;
  });
  // In some historic markup, Networking is nested in the Hobbies carousel.
  // Moving its original node into its own channel intentionally avoids a duplicate.
  host.classList.add('tv-stage');
  document.documentElement.classList.add('tv-mode');
  document.body.classList.add('tv-mode');

  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.className = 'tv-static';
  noiseCanvas.width=192;noiseCanvas.height=108;
  noiseCanvas.setAttribute('aria-hidden','true');
  const scan = document.createElement('div');
  scan.className='tv-scanlines';
  scan.setAttribute('aria-hidden','true');
  const channelLabel = document.createElement('div');
  channelLabel.className='tv-channel-number';
  channelLabel.setAttribute('aria-hidden','true');
  const fadeShutter=document.createElement('div');
  fadeShutter.className='tv-fade-shutter';
  fadeShutter.setAttribute('aria-hidden','true');
  const announcer=document.createElement('div');
  announcer.className='tv-announcer sr-only';
  announcer.setAttribute('role','status');
  announcer.setAttribute('aria-live','polite');
  announcer.setAttribute('aria-atomic','true');
  host.append(noiseCanvas,fadeShutter,scan,channelLabel,announcer);

  const ctx = noiseCanvas.getContext('2d',{alpha:false});
  const noiseImage=ctx ? ctx.createImageData(192,108) : null;
  const navLinks=[...nav.querySelectorAll('a[href^="#"]')];
  const indicator=document.getElementById('apple-nav-indicator');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:819px)');
  let current=startIndex, busy=false;
  window.__portfolioChannelIsActive = key => channels[current].key===key;
  const emitChange = () => {
    document.dispatchEvent(new CustomEvent('portfolio:channel-change',{
      detail:{key:channels[current].key,index:current}
    }));
  };
  const updateNav = () => {
    const link=navLinks[current];
    navLinks.forEach((node,i) => {
      node.classList.toggle('active',i===current);
      if(i===current)node.setAttribute('aria-current','page');
      else node.removeAttribute('aria-current');
    });
    channelLabel.textContent='CH '+String(current+1).padStart(2,'0');
    if(link && indicator){
      const r=link.getBoundingClientRect(),base=nav.getBoundingClientRect();
      indicator.style.transform='translate3d('+(r.left-base.left+nav.scrollLeft)+'px,0,0)';
      indicator.style.width=r.width+'px';
      if(!mobile.matches && !reduced.matches){
        link.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
      }
    }
  };
  const setPanel = (next,announce=true) => {
    panels[current].classList.remove('is-active','tv-mobile-enter-forward','tv-mobile-enter-back','tv-page-tv-exit','tv-page-tv-enter');
    panels[current].setAttribute('aria-hidden','true');
    panels[current].inert=true;
    current=next;
    const active=panels[current];
    active.classList.add('is-active');
    active.setAttribute('aria-hidden','false');
    active.inert=false;
    updateNav();
    emitChange();
    if(announce)announcer.textContent=channels[current].label+' page, channel '+(current+1);
  };
  panels[current].classList.add('is-active');
  updateNav();
  emitChange();

  const paintNoise=() => {
    if(!ctx||!noiseImage)return;
    const pixels=noiseImage.data;
    for(let i=0;i<pixels.length;i+=4){
      const v=(Math.random()*256)|0;
      pixels[i]=v;pixels[i+1]=v;pixels[i+2]=v;pixels[i+3]=255;
    }
    ctx.putImageData(noiseImage,0,0);
  };
  function go(index,options={}){
    if(busy || index<0 || index>=channels.length || index===current)return;
    const previous=current;
    busy=true;
    if(options.push !== false){
      history.pushState({channel:channels[index].key},'','#'+channels[index].key);
    }
    const finish=()=>{
      noiseCanvas.style.opacity='0';
      fadeShutter.style.opacity='0';
      busy=false;
    };
    if(mobile.matches){
      setPanel(index);
      const active=panels[index];
      active.classList.add(index>previous?'tv-mobile-enter-forward':'tv-mobile-enter-back');
      setTimeout(()=>{
        active.classList.remove('tv-mobile-enter-forward','tv-mobile-enter-back');
        finish();
      },240);
      return;
    }
    // Reduced motion: 350ms simple fade using a card-color shutter.
    if(reduced.matches || !ctx){
      const began=performance.now();let swapped=false;
      const frame=now=>{
        const t=now-began;
        fadeShutter.style.opacity=String(t<175?Math.min(1,t/175):Math.max(0,1-(t-175)/175));
        if(t>=175&&!swapped){setPanel(index);swapped=true;}
        if(t<350)requestAnimationFrame(frame);
        else{if(!swapped)setPanel(index);finish();}
      };
      requestAnimationFrame(frame);
      return;
    }
    // Active only for the 300ms transition; 192×108 pixelated grayscale texture.
    const began=performance.now();let swapped=false;
    const frame=now=>{
      const t=now-began;
      const alpha=t<140?Math.min(.9,.9*t/140):Math.max(0,.9*(1-(t-140)/160));
      paintNoise();
      noiseCanvas.style.opacity=String(alpha);
      if(t>=140&&!swapped){setPanel(index);swapped=true;}
      if(t<300)requestAnimationFrame(frame);
      else{if(!swapped)setPanel(index);finish();}
    };
    requestAnimationFrame(frame);
  }
  const routeForHref = href => {
    if(!href || href[0]!=='#')return -1;
    const key=decodeURIComponent(href.slice(1)).toLowerCase();
    if(aliases.has(key))return aliases.get(key);
    const target=document.getElementById(key);
    const owner=target?.closest('.tv-page');
    return owner?Number(owner.dataset.channel):-1;
  };
  // Capture before other delegated smooth-scroll handlers; keep external links intact.
  document.addEventListener('click',event=>{
    if(event.defaultPrevented || event.button!==0 || event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
    const link=event.target.closest('a[href^="#"]');
    if(!link)return;
    const index=routeForHref(link.getAttribute('href'));
    if(index<0)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    go(index);
  },true);

  const syncLocation=()=>{
    const wanted=activeFromHash();
    if(wanted!==current && !busy)go(wanted,{push:false});
  };
  addEventListener('popstate',syncLocation);
  addEventListener('hashchange',syncLocation);
  addEventListener('resize',updateNav,{passive:true});

  // Don't hijack left/right arrows while editing text or operating existing galleries.
  document.addEventListener('keydown',event=>{
    if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
    if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
    const target=event.target;
    if(target.closest('input, textarea, select, [contenteditable="true"], [role="slider"], .photo-carousel-rail, .hobby-carousel-track, .mk-carousel, .deck-viewer'))return;
    event.preventDefault();
    go((current+(event.key==='ArrowRight'?1:channels.length-1))%channels.length);
  });
  let touchStart=null;
  host.addEventListener('touchstart',event=>{
    if(event.touches.length!==1)return;
    const target=event.target;
    if(target.closest('.photo-carousel-rail,.hobby-carousel-track,.photo-carousel,.mk-carousel,canvas')){touchStart=null;return;}
    const t=event.touches[0];touchStart={x:t.clientX,y:t.clientY};
  },{passive:true});
  host.addEventListener('touchend',event=>{
    if(!touchStart||event.changedTouches.length!==1)return;
    const t=event.changedTouches[0],dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;
    touchStart=null;
    if(Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*1.4)return;
    go((current+(dx<0?1:channels.length-1))%channels.length);
  },{passive:true});

  // Expose an explicit channel-navigation operation to existing CTAs if needed.
  window.portfolioGoToChannel = key => {
    const next=aliases.get(key);
    if(next!==undefined)go(next);
  };
  // The intro has its own channel static. Hand off directly to Home without a
  // second transition or a momentary flash of a deep-linked section.
  window.portfolioEnterHomeFromIntro = () => {
    if(current!==0 && !busy)setPanel(0);
    const target='#home';
    if(location.hash!==target)history.replaceState({channel:'home'},'',target);
    panels[0]?.scrollTo({top:0,behavior:'instant'});
  };
})();
