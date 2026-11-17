'use strict';
/* Small, accessible interactions shared by every portfolio page. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tabs = [...document.querySelectorAll('#home [data-lane]')];
  const rail = document.querySelector('#home .hero-lane-tabs');
  const railFrame = rail?.closest('.hero-lane-tab-rail');
  const announcement = document.querySelector('#home .hero-role-announcement');
  let panelAnimation = null;
  function updateEdges() {
    if(!rail || !railFrame)return;
    railFrame.dataset.edgeLeft = String(rail.scrollLeft > 2);
    railFrame.dataset.edgeRight = String(rail.scrollWidth - rail.clientWidth - rail.scrollLeft > 2);
  }
  function select(tab, focus = false) {
    const changed = tab.getAttribute('aria-selected') !== 'true';
    panelAnimation?.cancel();
    tabs.forEach(button => {
      const active = button === tab;
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
      panel.inert = !active;
      panel.tabIndex = active ? 0 : -1;
      panel.setAttribute('aria-hidden', String(!active));
      if(active && changed) {
        panel.scrollTop = 0;
        if(!reduced.matches) panelAnimation = panel.animate(
          [{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],
          {duration:280,easing:'cubic-bezier(.22,1,.36,1)'}
        );
        announcement.textContent = tab.textContent.trim() + '. ' + panel.textContent.trim();
      }
    });
    if (focus) tab.focus({preventScroll:true});
    if(rail && rail.scrollWidth > rail.clientWidth + 2) {
      const box=tab.getBoundingClientRect(),parent=rail.getBoundingClientRect();
      rail.scrollTo({left:rail.scrollLeft+box.left-parent.left-(rail.clientWidth-box.width)/2,
        behavior:reduced.matches?'instant':'smooth'});
    }
    requestAnimationFrame(updateEdges);
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
  document.querySelectorAll('#home .hero-lane-panel').forEach(panel=>panel.addEventListener('keydown',event=>{
    if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key))event.stopPropagation();
  }));
  rail?.addEventListener('scroll', updateEdges, {passive:true});
  if(rail)new ResizeObserver(updateEdges).observe(rail);
  document.fonts?.ready.then(updateEdges);
  reduced.addEventListener('change',()=>{if(reduced.matches)panelAnimation?.cancel();});
  updateEdges();
  const experienceButton=document.createElement('button');
  experienceButton.type='button';experienceButton.className='tv-experience-button';
  experienceButton.textContent='Michael TV';
  experienceButton.setAttribute('aria-label','Choose Michael TV experience');
  experienceButton.addEventListener('click',()=>window.portfolioChooseExperience?.());
  document.body.append(experienceButton);
  const menu=document.querySelector('.mk-mobile-menu');
  if(menu){
    const button=document.createElement('button');button.type='button';button.className='btn ghost';
    button.textContent='Michael TV';button.addEventListener('click',()=>window.portfolioChooseExperience?.());
    menu.append(button);
  }
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
