'use strict';
/* Small, accessible interactions shared by every portfolio page. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tabs = [...document.querySelectorAll('[data-lane]')];
  function select(tab, focus = false) {
    tabs.forEach(button => {
      const active = button === tab;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      document.getElementById(button.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus({preventScroll:true});
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
        (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(tabs[next], true);
    });
  });
  // Escape closes the expanded transcript without interrupting playback.
  document.addEventListener('keydown', event => {
    if(event.key !== 'Escape') return;
    const transcript = document.querySelector('.mk-home-welcome-transcript[open]');
    if(transcript) { transcript.open = false; transcript.querySelector('summary').focus(); }
  });
  // New page focus is explicit; reading order never enters an inactive channel.
  document.addEventListener('portfolio:channel-settled', () => {
    const page = document.querySelector('.tv-page.is-active');
    if(!page || document.querySelector('dialog[open]')) return;
    const heading = page.querySelector('h1,h2');
    if(heading) {heading.tabIndex=-1;heading.focus({preventScroll:true});}
  });
})();
