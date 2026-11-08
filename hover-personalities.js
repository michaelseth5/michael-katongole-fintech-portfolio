/* Small, declarative hover-personality assignment. No layout or copy changes. */
(() => {
  'use strict';
  const add=(selector,variants)=>{
    const nodes=document.querySelectorAll(selector);
    nodes.forEach((node,i)=>{
      if(node.classList.contains('mk-hfx'))return;
      node.classList.add('mk-hfx',variants[i%variants.length]);
    });
  };
  // Existing card architecture retained. Different variants rotate by position.
  add('#experience .timeline > .job',['mk-hfx--edge','mk-hfx--depth','mk-hfx--float','mk-hfx--bloom']);
  add('#project-details .selected-projects-grid > .project-block',['mk-hfx--depth','mk-hfx--float','mk-hfx--edge']);
  add('#project-details .slide-deck-tile',['mk-hfx--edge','mk-hfx--soft']);
  add('#skills .large-panel',['mk-hfx--soft','mk-hfx--edge','mk-hfx--float']);
  add('#skills .skill',['mk-hfx--soft','mk-hfx--edge','mk-hfx--soft','mk-hfx--bloom']);
  add('#education .preview-school',['mk-hfx--edge','mk-hfx--soft']);
  add('#achievements .demo-milestone',['mk-hfx--bloom','mk-hfx--edge']);
  add('#achievements .dev-program',['mk-hfx--soft','mk-hfx--edge','mk-hfx--float']);
  add('#portfolio-intro-grid .mk-bento-tile',['mk-hfx--bloom','mk-hfx--edge','mk-hfx--soft']);
  add('#portfolio-intro-grid .mk-ed-card',['mk-hfx--soft','mk-hfx--edge']);
  add('#portfolio-intro-grid .mk-bento-fact',['mk-hfx--button-secondary','mk-hfx--button','mk-hfx--button-primary']);
  add('#hobbies .art-photo-card, #hobbies .travel-photo-card, #hobbies .unserious-photo, #hobbies .mentorship-shot, #hobbies .sports-photo',['mk-hfx--photo-a','mk-hfx--photo-b','mk-hfx--photo-c','mk-hfx--photo-d']);
  add('#networking .seo-photo',['mk-hfx--photo-b','mk-hfx--photo-a','mk-hfx--photo-d','mk-hfx--photo-c']);
  add('#networking .network-event-slide',['mk-hfx--edge','mk-hfx--soft','mk-hfx--bloom']);
  add('#networking .network-tab',['mk-hfx--still']);
  add('.preview-track .preview-tile',['mk-hfx--still']);
  add('.fx-d-row',['mk-hfx--still']);
  add('#home .globe-wrap',['mk-hfx--still']);
  add('#contact .large-panel',['mk-hfx--bloom']);
  add('.mk-social-link',['mk-hfx--social']);
  add('.apple-navlinks a, .page-hero a.back',['mk-hfx--still']);
  add('a.btn:not(.ghost), button.btn:not(.ghost)',['mk-hfx--button-primary']);
  add('a.btn.ghost, button.btn.ghost',['mk-hfx--button-secondary']);
  add('button.hobby-carousel-btn, button.photo-carousel-arrow, button.photo-carousel-prev, button.photo-carousel-next, button.network-prev, button.network-next, button.dev-prev, button.dev-next, button.mk-photo-carousel-prev, button.mk-photo-carousel-next, button#deck-close',['mk-hfx--button','mk-hfx--button-secondary']);
  add('a.mk-social-link',['mk-hfx--social']);
  // One delegated spotlight handler. Never run it on touch/reduced-motion devices.
  const safe=window.matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  let raf=0,last=null;
  const update=()=>{
    raf=0;
    if(!last)return;
    const {card,x,y}=last,rect=card.getBoundingClientRect();
    card.style.setProperty('--mk-hfx-x',((x-rect.left)/rect.width*100).toFixed(1)+'%');
    card.style.setProperty('--mk-hfx-y',((y-rect.top)/rect.height*100).toFixed(1)+'%');
  };
  document.addEventListener('pointermove',e=>{
    if(!safe.matches)return;
    const card=e.target.closest('#project-1.mk-hfx');
    if(!card)return;
    last={card,x:e.clientX,y:e.clientY};
    if(!raf)raf=window.requestAnimationFrame(update);
  },{passive:true});
})();
