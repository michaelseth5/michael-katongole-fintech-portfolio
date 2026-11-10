'use strict';
/* Desktop-only Broadway reveal, after Michael TV finishes. Decorative and non-interactive. */
(() => {
  if (!matchMedia('(min-width: 768px)').matches ||
      document.documentElement.classList.contains('mobile-classic')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ONCE_KEY = 'michael-tv-spotlight-shown-v2';
  const CURTAIN_MS = 1200;
  const LIGHT_MS = 7000;
  let scene = null, spotlight = null, raf = 0;
  let curtainTimer = 0, endTimer = 0, fallbackTimer = 0;
  let started = false, lighting = false;
  const button = () => document.querySelector('#home-welcome-audio .mk-home-welcome-play');
  const homeVisible = () => {
    const home = document.getElementById('home');
    if (!home) return false;
    const page = home.closest('.tv-page');
    return !page || page.classList.contains('is-active');
  };
  function alreadyShown() {
    try { return sessionStorage.getItem(ONCE_KEY) === '1'; } catch { return started; }
  }
  function markShown() {
    try { sessionStorage.setItem(ONCE_KEY,'1'); } catch {}
  }
  function updateTarget() {
    raf = 0;
    if (!spotlight) return;
    const target = button();
    if (!target || !homeVisible()) { stopEffects(); return; }
    const r = target.getBoundingClientRect();
    // Never move the actual button; the light follows its real viewport position.
    if (r.width <= 0 || r.height <= 0 || r.bottom < 0 || r.top > innerHeight) {
      stopEffects(); return;
    }
    const x = r.left + r.width/2, y = r.top + r.height/2;
    const cx = Math.max(40,Math.min(innerWidth-40,x-90));
    const radiusX = r.width/2 + 25;
    const radiusY = r.height/2 + 19;
    const radiusBeam = Math.max(65,r.width/2+35);
    for(const [key,value] of Object.entries({
      '--stage-x':x+'px','--stage-y':y+'px',
      '--source-x':cx+'px','--hole-rx':radiusX+'px',
      '--hole-ry':radiusY+'px','--beam-radius':radiusBeam+'px'
    })) spotlight.style.setProperty(key,value);
  }
  function queuePosition() {
    if (spotlight && !raf) raf = requestAnimationFrame(updateTarget);
  }
  function stopEffects() {
    clearTimeout(curtainTimer);clearTimeout(endTimer);clearTimeout(fallbackTimer);
    curtainTimer=endTimer=fallbackTimer=0;
    if (raf) cancelAnimationFrame(raf);raf=0;
    scene?.remove();scene=null;
    spotlight?.remove();spotlight=null;lighting=false;
  }
  function beginLight() {
    curtainTimer = 0;
    if (!started || reduced.matches || !homeVisible()) { stopEffects(); return; }
    spotlight = document.createElement('div');
    spotlight.className = 'mk-stage-spotlight';
    spotlight.setAttribute('aria-hidden','true');
    spotlight.innerHTML =
      '<div class="mk-stage-blackout"></div>' +
      '<div class="mk-stage-beam"></div>' +
      '<div class="mk-stage-pool"></div>';
    document.body.append(spotlight);
    updateTarget();
    if (!spotlight) return;
    lighting = true;
    // The spotlight clock runs for exactly 7000 ms, regardless of curtain timing.
    spotlight.classList.add('is-running');
    endTimer = setTimeout(stopEffects,LIGHT_MS);
  }
  function show() {
    if (started || alreadyShown() || !homeVisible() || !button()) return;
    started = true;
    markShown();
    if (reduced.matches) return; // Reduced-motion users see the page directly.
    scene = document.createElement('div');
    scene.className = 'mk-broadway-scene';
    scene.setAttribute('aria-hidden','true');
    scene.innerHTML =
      '<div class="mk-broadway-curtain mk-broadway-left"></div>' +
      '<div class="mk-broadway-curtain mk-broadway-right"></div>' +
      '<div class="mk-broadway-valance"></div>';
    document.body.append(scene);
    requestAnimationFrame(() => requestAnimationFrame(() => scene?.classList.add('is-opening')));
    curtainTimer = setTimeout(beginLight,CURTAIN_MS);
    // Curtain removal must not stop the spotlight.
    fallbackTimer = setTimeout(()=>{scene?.remove();scene=null;fallbackTimer=0},1550);
  }
  function onIntroOpen() { stopEffects(); } // Do not replay once the visit's light show ran.
  window.addEventListener('michael-tv:intro-open',onIntroOpen);
  window.addEventListener('michael-tv:home-enter',()=>{
    requestAnimationFrame(()=>requestAnimationFrame(show));
  });
  window.addEventListener('resize',queuePosition,{passive:true});
  window.addEventListener('scroll',queuePosition,{passive:true});
  window.addEventListener('hashchange',()=>{
    if (lighting && !homeVisible()) stopEffects();
    if (!started && !alreadyShown() && (location.hash==='#home' || !location.hash))
      requestAnimationFrame(()=>requestAnimationFrame(show));
  });
  // On a returning page load in the same tab, preserve the original intro rules.
  let introSeen=false;
  try { introSeen=sessionStorage.getItem('michael-tv-intro-seen-v1')==='1'; } catch {}
  if (introSeen && !alreadyShown()) {
    if(document.readyState==='loading')
      document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(show),{once:true});
    else requestAnimationFrame(show);
  }
})();