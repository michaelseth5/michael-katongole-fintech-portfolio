'use strict';
(()=>{
  // Fold the original milestone DOM into Experience without recreating cards or photos.
  const experience=document.getElementById('experience');
  const milestones=document.getElementById('achievements');
  if(experience && milestones){
    const careerPane=document.createElement('div');
    careerPane.className='mk-exp-pane';
    careerPane.id='mk-exp-professional';
    while(experience.firstChild)careerPane.appendChild(experience.firstChild);
    const tabs=document.createElement('div');
    tabs.className='mk-exp-tabs';
    tabs.setAttribute('role','tablist');
    tabs.setAttribute('aria-label','Experience categories');
    tabs.innerHTML='<button type="button" role="tab" id="mk-exp-tab-career" aria-controls="mk-exp-professional" data-exp-tab="career">Professional</button><button type="button" role="tab" id="mk-exp-tab-milestones" aria-controls="achievements" data-exp-tab="milestones">Milestones &amp; Leadership</button>';
    experience.append(tabs,careerPane,milestones);
    careerPane.setAttribute('role','tabpanel');
    careerPane.setAttribute('aria-labelledby','mk-exp-tab-career');
    milestones.setAttribute('role','tabpanel');
    milestones.setAttribute('aria-labelledby','mk-exp-tab-milestones');
    milestones.classList.add('mk-exp-milestones');
    const style=document.createElement('style');
    style.textContent=`
    #experience .mk-exp-tabs{position:relative;z-index:4;display:flex;justify-content:center;gap:5px;width:max-content;max-width:calc(100% - 32px);margin:32px auto 0;padding:5px;border:1px solid rgba(174,130,218,.32);border-radius:999px;background:rgba(32,22,52,.64);backdrop-filter:blur(14px)}
    #experience .mk-exp-tabs button{border:0;border-radius:999px;background:transparent;color:inherit;opacity:.7;padding:12px clamp(14px,2vw,24px);font:650 13px 'DM Sans',system-ui,sans-serif;cursor:pointer;white-space:normal}
    #experience .mk-exp-tabs button[aria-selected="true"]{background:#b69ae9;color:#1b1027;opacity:1;box-shadow:0 4px 14px #0002}
    #experience .mk-exp-tabs button:focus-visible{outline:2px solid #cdafff;outline-offset:3px}
    #experience .mk-exp-pane[hidden],#experience .mk-exp-milestones[hidden]{display:none!important}
    #experience .mk-exp-milestones{border-bottom:0!important}
    @media(max-width:500px){#experience .mk-exp-tabs{width:calc(100% - 28px)}#experience .mk-exp-tabs button{flex:1;font-size:12px;padding:11px 8px}}
    `;
    document.head.append(style);
    const controls=[...tabs.querySelectorAll('[data-exp-tab]')];
    const setExperienceTab=(tab,changeHash=false)=>{
      const showMilestones=tab==='milestones';
      careerPane.hidden=showMilestones;
      milestones.hidden=!showMilestones;
      // Fade in the selected panel. Both panels inherit the same Experience background,
      // so switching never exposes the former light-theme section surface.
      const activePane=showMilestones?milestones:careerPane;
      if(changeHash && !matchMedia('(prefers-reduced-motion:reduce)').matches)
        activePane.animate([{opacity:0},{opacity:1}],{duration:260,easing:'cubic-bezier(.22,1,.36,1)'});
      for(const button of controls){
        const selected=(button.dataset.expTab===tab);
        button.setAttribute('aria-selected',String(selected));
        button.tabIndex=selected?0:-1;
      }
      if(changeHash)history.replaceState(null,'',showMilestones?'#achievements':'#experience');
      experience.closest('.tv-page')?.scrollTo({top:0,behavior:'instant'});
    };
    controls.forEach(button=>button.addEventListener('click',()=>setExperienceTab(button.dataset.expTab,true)));
    tabs.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
      event.preventDefault();event.stopPropagation();
      const target=event.key==='ArrowRight'?controls[1]:controls[0];
      setExperienceTab(target.dataset.expTab,true);target.focus();
    });
    const syncTabFromHash=()=>{
      const hash=location.hash.slice(1).toLowerCase();
      if(['achievements','milestone','milestones'].includes(hash))setExperienceTab('milestones');
      else if(hash==='experience')setExperienceTab('career');
    };
    setExperienceTab(['#achievements','#milestone','#milestones'].includes(location.hash.toLowerCase())?'milestones':'career');
    window.addEventListener('hashchange',syncTabFromHash);
    window.addEventListener('popstate',syncTabFromHash);
    document.addEventListener('portfolio:mobile-page-change',syncTabFromHash);
  }

})();
