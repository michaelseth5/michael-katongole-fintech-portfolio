'use strict';

/* Progressive enhancement only: original content stays in the document. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroName = document.querySelector('#home .demo-hero-identity h1');
  const ioSupported = 'IntersectionObserver' in window;

  // The name is visually staggered but exposed once to assistive technology.
  if (heroName && !reduce) {
    const originalName = heroName.innerText.trim().replace(/\s+/g, ' ');
    let index = 0;
    const walker = document.createTreeWalker(heroName, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (!node.textContent || !node.textContent.trim()) continue;
      // Animate only the actual name. The "Hi, I'm" opener remains stable.
      if (node.parentElement?.classList.contains('mk-title-solid')) continue;
      const fragment = document.createDocumentFragment();
      for (const character of node.textContent) {
        if (/\s/.test(character)) {
          fragment.append(document.createTextNode(character));
          continue;
        }
        const span = document.createElement('span');
        span.className = 'polish-letter';
        span.style.setProperty('--letter-index', String(index++));
        span.setAttribute('aria-hidden', 'true');
        span.textContent = character;
        fragment.append(span);
      }
      node.replaceWith(fragment);
    }
    heroName.setAttribute('aria-label', originalName);
    document.documentElement.classList.add('polish-ready');
  }

  // Add a decorative marquee sourced from existing skill labels; no skills
  // are modified, moved, removed, or duplicated for screen readers.
  const skills = document.querySelector('#skills .sectionhead');
  const skillNames = [...document.querySelectorAll('#skills .skills .skill')]
    .map(element => element.textContent.trim()).filter(Boolean);
  if (skills && skillNames.length) {
    const marquee = document.createElement('div');
    marquee.className = 'polish-skill-marquee';
    marquee.setAttribute('aria-hidden', 'true');
    const track = document.createElement('div');
    track.className = 'polish-skill-track';
    const names = reduce ? skillNames : [...skillNames, ...skillNames];
    for (const name of names) {
      const pill = document.createElement('span');
      pill.textContent = name;
      track.append(pill);
    }
    marquee.append(track);
    skills.insertAdjacentElement('afterend', marquee);
  }

  if (!ioSupported || reduce) return;

  // Observe existing cards/headings only; never animate the globe canvases,
  // fixed navigation, or a section wrapper enclosing interactive controls.
  const selectors = [
    '.sectionhead',
    '#skills .three > .large-panel',
    '#portfolio-intro-grid .mk-ed-card',
    '#hobbies .art-photo-card',
    '#hobbies .travel-photo-card',
    '#project-details .project-framework-item'
  ];
  const targets = [...new Set(
    selectors.flatMap(selector => [...document.querySelectorAll(selector)])
  )];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('polish-visible');
      observer.unobserve(entry.target);
    }
  }, {rootMargin: '0px 0px -30px 0px', threshold: .08});
  targets.forEach(element => {
    // Never hide content that's already on screen during initialization.
    const rect = element.getBoundingClientRect();
    if (rect.top < innerHeight && rect.bottom > 0) return;
    const parent = element.parentElement;
    if (parent) {
      const siblings = [...parent.children].filter(child => targets.includes(child));
      const index = siblings.indexOf(element);
      if (index >= 0) element.style.setProperty('--polish-stagger',
        Math.min(index, 4) * 100 + 'ms');
    }
    element.classList.add('polish-observe');
    observer.observe(element);
  });
})();
