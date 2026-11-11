/* Consolidate desktop-only, viewport-pinned LEFT controls into one scroll-safe dock. */
(() => {
  const desktop=matchMedia('(min-width:1024px)');
  let dock=null;
  const known=['.tv-effects-control'];
  function isPinnedControl(el) {
    if(!el || !el.isConnected || el.id==='mk-desktop-control-rail')return false;
    if(el.closest('#mk-desktop-control-rail, #main-content, .tv-hardware, .apple-topbar, .mk-mobile-topbar, .mk-mobile-menu'))return false;
    if(el.matches('.mk-skip-link, .mk-mobile-chat-button, .mk-mobile-chat-sheet'))return false;
    if(known.some(selector=>el.matches(selector)))return true;
    if(el.parentElement!==document.body)return false;
    const s=getComputedStyle(el);
    if(s.position!=='fixed' || s.display==='none' || s.visibility==='hidden')return false;
    const rect=el.getBoundingClientRect();
    if(rect.left>Math.min(240,innerWidth*.18) || rect.width>Math.min(300,innerWidth*.3))return false;
    return !!el.matches('button,[role="switch"],[role="group"],[role="toolbar"]') ||
      !!el.querySelector(':scope > button, :scope > [role="switch"], :scope > [role="button"]');
  }
  function sync() {
    if(!desktop.matches || document.documentElement.classList.contains('mobile-classic')) {
      if(dock) { for(const item of [...dock.children])document.body.appendChild(item);dock.remove();dock=null; }
      return;
    }
    const candidates=[...document.body.children].filter(isPinnedControl);
    if(!candidates.length&&!dock)return;
    if(!dock) {dock=document.createElement('aside');dock.id='mk-desktop-control-rail';dock.setAttribute('aria-label','Display and media controls');document.body.appendChild(dock);}
    for(const item of candidates)dock.appendChild(item);
  }
  let scheduled=false;
  const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync();});};
  document.addEventListener('DOMContentLoaded',()=> {
    sync();
    new MutationObserver(schedule).observe(document.body,{childList:true});
  },{once:true});
  desktop.addEventListener('change',schedule);
})();
