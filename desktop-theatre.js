'use strict';
/* Desktop-only Broadway reveal, after Michael TV finishes. Decorative and non-interactive. */
(() => {
  if (!matchMedia('(min-width: 768px)').matches ||
      document.documentElement.classList.contains('mobile-classic')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let spotlight = null, scene = null, shown = false, raf = 0;
  let sceneTimer = 0, lightTimer = 0;
  const button = () => document.querySelector('#home-welcome-audio .mk-home-welcome-play');
  const homeVisible = () => {
    const home = document.getElementById('home');
    if (!home) return false;
    const page = home.closest('.tv-page');
    return !page || page.classList.contains('is-active');
  };
  function positionLight() {
    raf = 0;
    if (!spotlight) return;
    const target = button();
    if (!target || !homeVisible()) { spotlight.classList.remove('is-visible'); return; }
    const rect = target.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight || rect.width < 1) {
      spotlight.classList.remove('is-visible'); return;
    }
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    spotlight.style.setProperty('--stage-x', x + 'px');
    spotlight.style.setProperty('--stage-y', y + 'px');
    spotlight.style.setProperty('--stage-height', Math.max(80,y) + 'px');
    spotlight.classList.add('is-visible');
  }
  const queueLight = () => { if (spotlight && !raf) raf = requestAnimationFrame(positionLight); };
  function removeScene() {
    clearTimeout(sceneTimer); sceneTimer = 0;
    scene?.remove(); scene = null;
  }
  function reset() {
    removeScene(); clearTimeout(lightTimer); lightTimer = 0;
    if (raf) cancelAnimationFrame(raf); raf = 0;
    spotlight?.remove(); spotlight = null; shown = false;
  }
  function show() {
    if (shown) return;
    if (!document.getElementById('home') || !button()) return;
    shown = true;
    spotlight = document.createElement('div');
    spotlight.className = 'mk-stage-spotlight';
    spotlight.setAttribute('aria-hidden', 'true');
    spotlight.innerHTML = '<div class="mk-stage-beam"></div><div class="mk-stage-pool"></div>';
    document.body.append(spotlight);
    positionLight();
    // The decorative beam is behind the curtain until the stage is revealed.
    spotlight.classList.remove('is-visible');
    if (reduced.matches) { positionLight(); return; }
    scene = document.createElement('div');
    scene.className = 'mk-broadway-scene';
    scene.setAttribute('aria-hidden','true');
    scene.innerHTML = '<div class="mk-broadway-curtain mk-broadway-left"></div><div class="mk-broadway-curtain mk-broadway-right"></div><div class="mk-broadway-valance"></div>';
    document.body.append(scene);
    requestAnimationFrame(() => requestAnimationFrame(() => scene?.classList.add('is-opening')));
    lightTimer = setTimeout(() => { lightTimer = 0; queueLight(); }, 800);
    sceneTimer = setTimeout(removeScene, 1550);
  }
  window.addEventListener('michael-tv:intro-open', reset);
  window.addEventListener('michael-tv:home-enter', show);
  window.addEventListener('resize', queueLight, {passive:true});
  window.addEventListener('scroll', queueLight, {passive:true});
  window.addEventListener('hashchange', queueLight);
  // Returning visitors have already completed the intro earlier in this session.
  let seen = false;
  try { seen = sessionStorage.getItem('michael-tv-intro-seen-v1') === '1'; } catch {}
  if (seen) {
    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(show), {once:true});
    else requestAnimationFrame(show);
  }
})();