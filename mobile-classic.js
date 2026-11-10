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
  const voice=add('div',{className:'mk-mobile-voice',hidden:true});
  voice.setAttribute('role','dialog');voice.setAttribute('aria-label','Welcome recording');
  voice.innerHTML='<strong>Michael TV</strong><div><button class="mk-mobile-voice-toggle" type="button">Pause</button><button class="mk-mobile-voice-replay" type="button">Replay</button><button class="mk-mobile-voice-close" type="button">Close</button></div><details><summary>Transcript</summary><p>Hey. I\'m Michael. Welcome to my website. Hopefully you think the website\'s pretty cool. I think it\'s pretty cool. Don\'t spend too much time on here, you know, snooping around. But enjoy.</p></details>';
  document.body.append(voice);
  let audio;
  const finish=()=>{try{sessionStorage.setItem(KEY,'1')}catch{}intro.classList.add('is-leaving');setTimeout(()=>intro.remove(),210);};
  $('.mk-mobile-skip',intro).addEventListener('click',finish);
  $('.mk-mobile-play',intro).addEventListener('click',()=>{
   // Invoke play synchronously from user gesture, never from a timer.
   audio=new Audio('/audio/welcome.m4a');audio.preload='none';
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