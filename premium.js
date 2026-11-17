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
  // Cards layer as the next chapter arrives. Tall or expanded case studies remain
  // in normal flow so their content can always be reached on short screens.
  const stackGroups = ['#project-details .container', '#experience .simple-list'];
  function stack() {
    document.querySelectorAll('[data-stack-card]').forEach(card => card.removeAttribute('data-stack-card'));
    if(reduced.matches || innerWidth < 768) return;
    stackGroups.forEach(selector => {
      const group = document.querySelector(selector);
      if(!group) return;
      [...group.children].filter(card => card.matches('.project-block,.demo-milestone,.dev-milestone')).forEach((card,index) => {
        const room = document.querySelector('.tv-page.is-active')?.clientHeight || innerHeight;
        if(card.offsetHeight < room - 100 && !card.querySelector('details[open]')) {
          card.setAttribute('data-stack-card','');
          card.style.setProperty('--stack-top',(24 + Math.min(index,4)*10)+'px');
          card.style.setProperty('--stack-index',String(index+1));
        }
      });
    });
  }
  new ResizeObserver(stack).observe(document.getElementById('main-content'));
  document.addEventListener('portfolio:channel-settled',stack);
  document.addEventListener('toggle',stack,true);
  // New page focus is explicit; reading order never enters an inactive channel.
  document.addEventListener('portfolio:channel-settled', () => {
    const page = document.querySelector('.tv-page.is-active');
    if(!page || document.querySelector('dialog[open]')) return;
    const heading = page.querySelector('h1,h2');
    if(heading) {heading.tabIndex=-1;heading.focus({preventScroll:true});}
  });
})();
