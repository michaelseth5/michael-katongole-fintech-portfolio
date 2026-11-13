'use strict';
/* Classic mobile mode. Only loaded at <=767px on a coarse pointer. */
(() => {
 const mq=matchMedia('(max-width: 767px)');
 if(!mq.matches)return;
 const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
 const main=$('#main-content'); if(!main)return;
 const add=(type,props={},children=[])=>{const el=document.createElement(type);Object.assign(el,props);children.forEach(c=>el.append(c));return el;};
 const links=$$('#apple-navlinks a');
 const nav=add('header',{className:'mk-mobile-topbar'});
 const brand=add('a',{className:'mk-mobile-brand',href:'#home',textContent:'Michael Katongole'});
 const menuButton=add('button',{className:'mk-mobile-menu-button',type:'button',textContent:'☰'});
 menuButton.setAttribute('aria-label','Open navigation');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-controls','mk-mobile-menu');
 nav.append(brand,menuButton);
 const menu=add('nav',{className:'mk-mobile-menu',id:'mk-mobile-menu',hidden:true});menu.setAttribute('aria-label','Mobile navigation');
 links.forEach(x=>{const item=add('a',{href:x.getAttribute('href'),textContent:x.textContent.trim()});menu.append(item);});
 const closeMenu=()=>{menu.hidden=true;menuButton.textContent='☰';menuButton.setAttribute('aria-label','Open navigation');menuButton.setAttribute('aria-expanded','false');};
 const openMenu=()=>{menu.hidden=false;menuButton.textContent='×';menuButton.setAttribute('aria-label','Close navigation');menuButton.setAttribute('aria-expanded','true');};
 menuButton.addEventListener('click',()=>menu.hidden?openMenu():closeMenu());
 menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
 // Keep the original hrefs, but resolve TV route aliases to native section IDs.
 const aliases={'#projects':'project-details','#milestone':'achievements','#milestones':'achievements','#reading':'listening-reading'};
 document.addEventListener('click',event=>{
   const a=event.target.closest('a[href^="#"]');if(!a)return;
   const dest=aliases[a.getAttribute('href')];if(!dest)return;
   const target=document.getElementById(dest);if(!target)return;
   event.preventDefault();history.pushState({},'',a.getAttribute('href'));
   target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
 });
 window.addEventListener('hashchange',()=>{const id=aliases[location.hash];if(id)document.getElementById(id)?.scrollIntoView({block:'start'});});
 document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!nav.contains(e.target))closeMenu()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
 document.body.prepend(menu);document.body.prepend(nav);
 // Move authored content, not copies: the original links, text and section IDs stay intact.
 const ordered=['home','site-preview-notice','portfolio-intro-grid','experience','project-details','skills','achievements','networking','listening-reading','hobbies','contact'];
 const owned=ordered.map(id=>document.getElementById(id)).filter(Boolean);
 owned.forEach(el=>main.append(el));
 // Experience includes the existing milestones in the same simple mobile scroll.
 const mobileExperience=$('#experience'),mobileMilestones=$('#achievements');
 if(mobileExperience && mobileMilestones){
   mobileExperience.append(mobileMilestones);
   mobileMilestones.style.marginTop='32px';
   const milestoneJump=add('a',{href:'#achievements',textContent:'View Milestones & Leadership ↓'});
   milestoneJump.className='mk-mobile-milestone-link';
   milestoneJump.style.cssText='display:inline-flex;margin:12px 0 20px;padding:10px 17px;border:1px solid #9972c8;border-radius:999px;color:#7043a4;text-decoration:none;font-weight:700;font-size:13px';
   const expHeader=mobileExperience.querySelector('.page-hero');
   if(expHeader)expHeader.append(milestoneJump);
 }

 // The Education block remains the same DOM node; it belongs under Skills on mobile.
 const edu=$('.mk-craft-education');const skills=$('#skills');
 if(edu&&skills){const placeholder=document.createComment('Education original location');edu.before(placeholder);skills.append(edu);window.addEventListener('resize',()=>{if(!mq.matches)placeholder.after(edu);else skills.append(edu);});}
 // Mobile hero has no globe or globe-vision display. Desktop markup remains intact.
 // Normal vertical document flow means the existing TV channel static handler never initializes.
 $$('details.project-expand').forEach(detail=>{
   detail.open=false;
   detail.addEventListener('toggle',()=>{if(!detail.open)return;$$('details.project-expand').forEach(other=>{if(other!==detail)other.open=false;});});
 });
 // The existing Ask Michael DOM moves into a bottom sheet, retaining event handlers.
 const chat=$('#mk-portfolio-chat');
 if(chat){
  const sheet=add('div',{className:'mk-mobile-chat-sheet',hidden:true});sheet.setAttribute('role','dialog');sheet.setAttribute('aria-label','Ask Michael');
  const close=add('button',{className:'mk-mobile-close',type:'button',textContent:'Close ×'});
  const trigger=add('button',{className:'mk-mobile-chat-button',type:'button',textContent:'Ask Michael'});
  trigger.setAttribute('aria-expanded','false');
  const dismiss=()=>{sheet.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.focus({preventScroll:true});};
  close.addEventListener('click',dismiss);
  trigger.addEventListener('click',()=>{sheet.hidden=!sheet.hidden;trigger.setAttribute('aria-expanded',String(!sheet.hidden));if(!sheet.hidden)close.focus();});
  sheet.append(close,chat);document.body.append(trigger,sheet);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.hidden)dismiss();});
 }
 // First-visit graphics-only Michael TV. No YouTube code, iframe, or video requests.
 const KEY='michael-mobile-intro-seen-v1';let seen=false;try{seen=sessionStorage.getItem(KEY)==='1'}catch{}
 if(!seen){
  const intro=add('div',{className:'mk-mobile-intro'});intro.setAttribute('role','dialog');intro.setAttribute('aria-modal','true');intro.setAttribute('aria-label','Michael TV introduction');
  intro.innerHTML='<div class="mk-mobile-intro-card"><div class="mk-mobile-intro-title">MICHAEL TV</div><div class="mk-mobile-tape" aria-hidden="true"><i></i><i></i></div><button class="mk-mobile-play" type="button">PRESS PLAY</button><button class="mk-mobile-skip" type="button">Skip</button></div>';
  document.body.append(intro);

  // Preserve mobile's graphic-only PRESS PLAY screen; show it only after Cinema is selected.
  intro.style.display='none';
  const choice=document.createElement('div');
  choice.id='mtv-mobile-choice';
  choice.setAttribute('role','dialog');
  choice.setAttribute('aria-modal','true');
  choice.setAttribute('aria-labelledby','mtv-mobile-choice-title');
  const style=document.createElement('style');
  style.textContent=\`
  #mtv-mobile-choice{position:fixed;inset:0;z-index:2147483646;overflow-y:auto;min-height:100dvh;background:radial-gradient(ellipse at 52% 32%,rgba(105,67,155,.22),transparent 65%),#0d0b14;color:#faf7ff;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text",Inter,sans-serif}
  #mtv-mobile-choice *{box-sizing:border-box}
  #mtv-mobile-choice .mtv-m-inner{min-height:100dvh;padding:calc(36px + env(safe-area-inset-top)) calc(22px + env(safe-area-inset-right)) calc(30px + env(safe-area-inset-bottom)) calc(22px + env(safe-area-inset-left));display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;max-width:520px;margin:auto}
  #mtv-mobile-choice .mtv-m-eyebrow{font-size:10px;letter-spacing:.22em;opacity:.65;font-weight:500}
  #mtv-mobile-choice h2{font:600 clamp(32px,8vw,45px)/1.12 -apple-system,BlinkMacSystemFont,"SF Pro Display",Inter,sans-serif;letter-spacing:-.03em;margin:19px 0 9px;text-wrap:balance}
  #mtv-mobile-choice .mtv-m-subtitle{font-size:15px;color:#d2c8dd;margin:0 0 30px}
  #mtv-mobile-choice .mtv-m-cards{display:grid;gap:14px;width:100%}
  #mtv-mobile-choice .mtv-m-card{display:grid;justify-items:start;gap:15px;text-align:left;width:100%;min-height:150px;padding:23px;border-radius:28px;border:1px solid rgba(237,220,255,.27);background:rgba(210,176,255,.075);color:#fff;backdrop-filter:blur(30px) saturate(180%);-webkit-backdrop-filter:blur(30px) saturate(180%);box-shadow:inset 0 1px rgba(255,255,255,.1),0 18px 38px #0004;transition:transform .35s cubic-bezier(.22,1,.36,1),opacity .35s cubic-bezier(.22,1,.36,1);cursor:pointer}
  #mtv-mobile-choice .mtv-m-card strong{font-size:20px;font-weight:600;letter-spacing:-.03em}
  #mtv-mobile-choice .mtv-m-card span{font-size:14px;color:#ddd2e7;line-height:1.45}
  #mtv-mobile-choice .mtv-m-card em{font-style:normal;font-size:14px;font-weight:600;border:1px solid #ffffff45;border-radius:999px;padding:9px 17px}
  #mtv-mobile-choice .mtv-m-card:focus-visible{outline:2px solid #d7b9ff;outline-offset:4px}
  #mtv-mobile-choice .mtv-m-card:active{transform:scale(.98)}
  #mtv-mobile-choice .mtv-m-remember{display:flex;align-items:center;gap:9px;margin-top:27px;color:#e8dff1;font-size:14px}
  #mtv-mobile-choice .mtv-m-remember input{accent-color:#b99af2;width:18px;height:18px}
  #mtv-mobile-choice .mtv-m-footer{color:#d3c6df;font-size:14px;margin:20px 0 0}
  #mtv-mobile-choice.is-leaving{opacity:0;transition:opacity .35s cubic-bezier(.22,1,.36,1);pointer-events:none}
  @media(prefers-reduced-motion:reduce){#mtv-mobile-choice .mtv-m-card{transition:none!important;transform:none!important}#mtv-mobile-choice.is-leaving{transition:opacity .17s ease}}
  @media(prefers-reduced-transparency:reduce){#mtv-mobile-choice .mtv-m-card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:#262034!important;border-color:#81718c!important}}
  \`;
  document.head.append(style);
  choice.innerHTML=\`<div class="mtv-m-inner"><div class="mtv-m-eyebrow">M I C H A E L&nbsp; T V&nbsp; P R E S E N T S</div><h2 id="mtv-mobile-choice-title">Welcome to Michael TV</h2><p class="mtv-m-subtitle">Choose your experience.</p><div class="mtv-m-cards"><button type="button" class="mtv-m-card" data-choice="cinema"><strong>Cinema Michael TV</strong><span>Full cinematic intro, credits, and the original experience.</span><em>Full Experience</em></button><button type="button" class="mtv-m-card" data-choice="instant"><strong>Instant Michael TV</strong><span>Skip the introduction and explore right away.</span><em>Enter Portfolio</em></button></div><label class="mtv-m-remember"><input type="checkbox" id="mtv-m-remember">Remember my choice</label><p class="mtv-m-footer">Your choice. Your experience.</p></div>\`;
  const REMEMBER='michael-tv-remember-choice-v1';
  const showMobileIntro=()=>{intro.style.display='';$('.mk-mobile-play',intro)?.focus({preventScroll:true});};
  const selectMobile=mode=>{
    const check=$('#mtv-m-remember',choice);
    try{if(check.checked)localStorage.setItem(REMEMBER,mode);else localStorage.removeItem(REMEMBER)}catch{}
    if(typeof navigator.vibrate==='function')navigator.vibrate(10);
    choice.classList.add('is-leaving');
    setTimeout(()=>{
      choice.remove();
      if(mode==='cinema')showMobileIntro();
      else {try{sessionStorage.setItem(KEY,'1')}catch{}}
    },matchMedia('(prefers-reduced-motion:reduce)').matches?170:350);
  };
  choice.addEventListener('click',e=>{const btn=e.target.closest('[data-choice]');if(btn)selectMobile(btn.dataset.choice)});
  choice.addEventListener('keydown',e=>{
    if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
    const cards=[...choice.querySelectorAll('[data-choice]')],idx=cards.indexOf(document.activeElement);
    e.preventDefault();cards[(idx+(['ArrowDown','ArrowRight'].includes(e.key)?1:cards.length-1))%cards.length].focus();
  });
  const reopen=document.createElement('a');
  reopen.href='#choose-experience';reopen.textContent='Choose experience';
  reopen.style.cssText='display:inline-block;margin:16px;color:#7651a6;font-weight:600;font-size:13px';
  (document.querySelector('.mk-footer')||document.querySelector('footer'))?.append(reopen);
  const openChoice=()=>{choice.classList.remove('is-leaving');document.body.append(choice);choice.querySelector('[data-choice]')?.focus({preventScroll:true})};
  reopen.addEventListener('click',e=>{e.preventDefault();openChoice()});
  let stored=null;try{stored=localStorage.getItem(REMEMBER)}catch{}
  if(stored==='cinema')showMobileIntro();
  else if(stored==='instant'){try{sessionStorage.setItem(KEY,'1')}catch{}}
  else openChoice();
  const voice=add('div',{className:'mk-mobile-voice',hidden:true});
  voice.setAttribute('role','dialog');voice.setAttribute('aria-label','Welcome recording');
  voice.innerHTML='<strong>Michael TV</strong><div><button class="mk-mobile-voice-toggle" type="button">Pause</button><button class="mk-mobile-voice-replay" type="button">Replay</button><button class="mk-mobile-voice-close" type="button">Close</button></div><details><summary>Transcript</summary><p>Hey, I\'m Michael. Welcome to my little corner of the internet. I\'m a software engineer passionate about using software engineering, data science, and artificial intelligence to drive innovation across industries and solve real-world problems. I love working at the intersection of finance and technology, building solutions that solve real-world complex problems. This site reflects the projects I\'m building, the experiences I\'ve had, and the ambitions I\'m working towards. I think technology has the power to change finance, and I\'m absolutely determined to be part of that change. But anyway, enough about me. Go have a look around, have a little wander, and enjoy the show.</p></details>';
  document.body.append(voice);
  let audio;
  const finish=()=>{try{sessionStorage.setItem(KEY,'1')}catch{}intro.classList.add('is-leaving');setTimeout(()=>intro.remove(),210);};
  $('.mk-mobile-skip',intro).addEventListener('click',finish);
  $('.mk-mobile-play',intro).addEventListener('click',()=>{
   // Invoke play synchronously from user gesture, never from a timer.
   audio=new Audio('/audio/welcome.m4a?v=2');audio.preload='none';
   audio.addEventListener('error',()=>{voice.hidden=true;},{once:true});
   audio.addEventListener('ended',()=>{voice.hidden=true;},{once:true});
   const playback=audio.play();
   if(playback&&typeof playback.then==='function')playback.then(()=>{voice.hidden=false;}).catch(()=>{voice.hidden=true;});
   finish();
  });
  $('.mk-mobile-voice-toggle',voice).addEventListener('click',e=>{
   if(!audio)return;
   if(audio.paused){audio.play().catch(()=>{});e.currentTarget.textContent='Pause';}
   else{audio.pause();e.currentTarget.textContent='Play';}
  });
  $('.mk-mobile-voice-replay',voice).addEventListener('click',()=>{if(!audio)return;audio.currentTime=0;audio.play().catch(()=>{});$('.mk-mobile-voice-toggle',voice).textContent='Pause';});
  $('.mk-mobile-voice-close',voice).addEventListener('click',()=>{audio?.pause();voice.hidden=true;});
  $('.mk-mobile-play',intro).focus();
 }
})();