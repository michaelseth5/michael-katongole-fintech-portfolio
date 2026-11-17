'use strict';
/* Small-screen route switcher: no long stacked site, no anchor-driven mega-scroll.
   Works with the existing mobile TV intro and original authored page DOM. */
(()=>{
  if(!matchMedia('(max-width:767px)').matches)return;
  const root=document.documentElement;
  const main=document.getElementById('main-content');
  if(!main)return;
  if('scrollRestoration' in history)history.scrollRestoration='manual';

  const paths={
    home:'home',projects:'project-details','project-details':'project-details',
    experience:'experience',achievements:'experience',milestone:'experience',
    milestones:'experience',skills:'skills',networking:'networking',
    reading:'listening-reading','listening-reading':'listening-reading',
    hobbies:'hobbies',contact:'contact'
  };
  const ids=['home','experience','project-details','skills','networking',
    'listening-reading','hobbies','contact'];
  const pages=new Map(ids.map(id=>[id,document.getElementById(id)]).filter(([,el])=>el));
  if(!pages.has('home'))return;
  const homeParts=['site-preview-notice','portfolio-intro-grid'];
  const quote=document.querySelector('.mk-footer-quotes');
  const menu=document.querySelector('.mk-mobile-menu');
  const menuButton=document.querySelector('.mk-mobile-menu-button');
  const brand=document.querySelector('.mk-mobile-brand');
  const owned=new Map();
  const setOwnership=(node,id)=>{
    if(!node||node.parentElement!==main)return;
    node.setAttribute('data-mk-mobile-page',id);
    if(!owned.has(id))owned.set(id,[]);
    owned.get(id).push(node);
  };
  ids.forEach(id=>setOwnership(pages.get(id),id));
  homeParts.forEach(id=>setOwnership(document.getElementById(id),'home'));
  // Keep decorative sections created before Home content on the Home page.
  const footerNodes=[...main.querySelectorAll(':scope > .mk-site-footer')];
  footerNodes.forEach(footer=>{
    const name=footer.dataset.footerPage||'';
    const key=paths[name];
    if(key)setOwnership(footer,key);
  });
  setOwnership(quote,'contact');
  // Legacy promotional blocks remain part of Home, not orphaned below every page.
  [...main.children].forEach(node=>{
    if(node.hasAttribute('data-mk-mobile-page') || node.matches('script,style'))return;
    setOwnership(node,'home');
  });
  // Milestones remain inside the Experience page, so they never create a second long route.
  const footerLinks=main.querySelectorAll('.mk-site-footer .mk-footer-nav a');
  const allMenuLinks=menu?[...menu.querySelectorAll('a[href^="#"]')]:[];
  let active='home';

  function closeMenu(){
    if(!menu||!menuButton)return;
    menu.hidden=true;
    menuButton.textContent='☰';
    menuButton.setAttribute('aria-label','Open navigation');
    menuButton.setAttribute('aria-expanded','false');
  }
  function resetTop(){
    root.classList.add('mk-mobile-route-switching');
    window.scrollTo({top:0,left:0,behavior:'instant'});
    (document.scrollingElement||root).scrollTop=0;
    requestAnimationFrame(()=>root.classList.remove('mk-mobile-route-switching'));
  }
  function navigate(id,{writeHistory=true,focus=false}={}){
    const next=paths[id]||'home';
    if(!pages.has(next))return;
    active=next;
    for(const [key,nodes] of owned){
      const show=key===next;
      nodes.forEach(el=>{
        if(show){el.setAttribute('data-mk-active','');el.removeAttribute('aria-hidden');}
        else{el.removeAttribute('data-mk-active');el.setAttribute('aria-hidden','true');}
      });
    }
    for(const a of [...allMenuLinks,...footerLinks]){
      const target=paths[decodeURIComponent(a.hash.slice(1))];
      if(target===next)a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    }
    document.body.classList.add('mk-mobile-route-active');
    closeMenu();
    if(writeHistory){
      history.pushState({mobilePage:next},'','#'+next);
    }
    resetTop();
    if(focus && next!=='home'){
      const page=pages.get(next);
      const heading=page.querySelector('h1,h2');
      if(heading){
        const old=heading.getAttribute('tabindex');
        heading.setAttribute('tabindex','-1');
        heading.focus({preventScroll:true});
        heading.addEventListener('blur',()=>{
          if(old===null)heading.removeAttribute('tabindex');
          else heading.setAttribute('tabindex',old);
        },{once:true});
      }
    }
    document.dispatchEvent(new CustomEvent('portfolio:mobile-page-change',{detail:{page:next}}));
  }

  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest('a[href^="#"]');
    if(!link)return;
    const hash=decodeURIComponent(link.hash.slice(1)).toLowerCase();
    const target=document.getElementById(hash);
    const owner=target?.closest('[data-mk-mobile-page]')?.dataset.mkMobilePage;
    if(!Object.prototype.hasOwnProperty.call(paths,hash)&&!owner)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigate(paths[hash]?hash:owner,{focus:link!==brand});
    if(target && target!==pages.get(paths[hash]||owner))requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
  },true);
  addEventListener('popstate',()=>{
    const key=decodeURIComponent(location.hash.slice(1)).toLowerCase();
    navigate(key,{writeHistory:false});
  });
  addEventListener('pageshow',event=>{
    if(event.persisted)navigate(active,{writeHistory:false});
  });

  // Ignore old deep scroll offsets from the long-page implementation on a fresh open.
  history.replaceState({mobilePage:'home'},'','#home');
  navigate('home',{writeHistory:false});
  root.classList.add('mk-mobile-ready');
})();
