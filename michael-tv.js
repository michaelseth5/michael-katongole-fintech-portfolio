'use strict';
/* Michael TV first-visit introduction. Real page HTML is never removed.
   No video or sound autoplay occurs before a user presses Play. */
(() => {
 const KEY='michael-tv-intro-seen-v1';
 const VID='OT9HsNszYCI';
 const OUTRO_VIDEO='ISpZC7ebJBo';
 const COUCH_VIDEO='BhUG_YEAmsc';
 const COUCH_DURATION=10;
 const welcomeVoice=new Audio();
 welcomeVoice.preload='none';
 const WELCOME_KEY='michael-tv-welcome-played-v1';
 const captions=[
  [0,'Hey, I’m Michael. Welcome to my little corner of the internet.'],
  [6,'I’m a software engineer passionate about software engineering, data science, and AI.'],
  [14,'Using technology to drive innovation across industries and solve real-world problems.'],
  [22,'I love working at the intersection of finance and technology.'],
  [29,'This site reflects the projects I’m building, the experiences I’ve had, and my ambitions.'],
  [39,'Technology has the power to change finance, and I’m determined to be part of it.'],
  [47,'Enough about me. Look around, have a little wander, and enjoy the show.']
 ];


 // Calm, image-free tvOS-style first-screen selector. No remote assets loaded here.
 const REMEMBER_KEY='michael-tv-remember-choice-v1';
 const mobile=matchMedia('(max-width:767px)');
 const pickerStyle=document.createElement('style');
 pickerStyle.id='mtv-choice-styles';
 pickerStyle.textContent=`
 #mtv-choice{position:fixed;inset:0;box-sizing:border-box;border:0;padding:0;max-width:none;max-height:none;width:100%;height:100dvh;background:radial-gradient(ellipse 60% 50% at 58% 40%,rgba(105,67,155,.22),transparent 74%),#0d0b14;color:#f9f7fc;overflow:auto;overscroll-behavior:contain;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text",Inter,sans-serif}
 #mtv-choice::backdrop{background:#0d0b14}
 #mtv-choice *{box-sizing:border-box}
 .mtv-choice-shell{min-height:100%;display:flex;align-items:center;justify-content:center;padding:max(28px,env(safe-area-inset-top)) max(22px,env(safe-area-inset-right)) max(28px,env(safe-area-inset-bottom)) max(22px,env(safe-area-inset-left))}
 .mtv-choice-inner{width:min(100%,1000px);text-align:center;padding:clamp(18px,4vw,60px) 0}
 .mtv-choice-kicker{font-size:clamp(10px,1vw,12px);font-weight:500;letter-spacing:.28em;opacity:.65;color:#e8dafa}
 .mtv-choice-inner h2{margin:22px auto 10px;max-width:820px;font-size:clamp(36px,5.2vw,66px);font-weight:600;letter-spacing:-.03em;line-height:1.08;text-wrap:balance;color:#fff}
 .mtv-choice-subtitle{font-size:clamp(15px,1.5vw,18px);margin:0 0 clamp(35px,5vw,65px);font-weight:400;color:#d2c8dd}
 .mtv-choice-buttons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(15px,2vw,26px);perspective:1200px}
 .mtv-choice-btn{position:relative;isolation:isolate;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:22px;overflow:hidden;min-width:0;min-height:260px;width:100%;padding:clamp(26px,3vw,40px);border:1px solid rgba(237,220,255,.25);border-radius:28px;background:rgba(210,176,255,.075);color:#fff;text-align:left;cursor:pointer;-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);box-shadow:inset 0 1px rgba(255,255,255,.11),0 18px 38px rgba(0,0,0,.24),0 6px 16px rgba(0,0,0,.14);transform:perspective(1100px) translateY(0) scale(1) rotateX(0deg) rotateY(0deg);transition:transform .43s cubic-bezier(.22,1,.36,1),box-shadow .43s cubic-bezier(.22,1,.36,1),opacity .35s cubic-bezier(.22,1,.36,1),background .35s cubic-bezier(.22,1,.36,1)}
 .mtv-choice-btn::before{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:radial-gradient(370px circle at var(--mx,50%) var(--my,0%),rgba(255,255,255,.14),transparent 66%);opacity:0;transition:opacity .35s cubic-bezier(.22,1,.36,1)}
 .mtv-choice-btn:hover::before,.mtv-choice-btn:focus-visible::before{opacity:1}
 .mtv-choice-buttons:has(.mtv-choice-btn:hover) .mtv-choice-btn:not(:hover),.mtv-choice-buttons:has(.mtv-choice-btn:focus-visible) .mtv-choice-btn:not(:focus-visible){opacity:.66}
 .mtv-choice-btn:hover,.mtv-choice-btn:focus-visible{transform:perspective(1100px) translateY(-6px) scale(1.04) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));box-shadow:inset 0 1px rgba(255,255,255,.22),0 30px 70px rgba(0,0,0,.4),0 14px 35px rgba(91,49,145,.24);background:rgba(210,176,255,.115)}
 .mtv-choice-btn:active{transform:scale(.98)!important}
 .mtv-choice-btn:focus-visible{outline:2px solid #d7b9ff;outline-offset:5px}
 .mtv-choice-copy{display:grid;gap:14px;align-content:start}
 .mtv-choice-copy strong{font-size:clamp(20px,2vw,26px);font-weight:600;letter-spacing:-.03em;line-height:1.2}
 .mtv-choice-copy small{font-size:clamp(14px,1.25vw,16px);font-weight:400;line-height:1.55;color:#dbd0e6}
 .mtv-choice-cta{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:11px 19px;border-radius:999px;border:1px solid rgba(255,255,255,.25);color:#f5eafc;background:rgba(255,255,255,.09);font-weight:600;font-size:14px}
 .mtv-choice-bottom{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:14px 22px;margin-top:clamp(32px,4vw,53px);font-size:14px;color:#d6c8e1}
 .mtv-choice-remember{display:inline-flex;align-items:center;gap:9px;cursor:pointer}
 .mtv-choice-remember input{accent-color:#b99af2;width:17px;height:17px}
 .mtv-choice-foot{margin:25px 0 0;font-size:14px;color:#d0c4dc}
 #mtv-choice.mtv-choice-leaving .mtv-choice-inner{opacity:0;transform:scale(1.012);transition:transform .45s cubic-bezier(.22,1,.36,1),opacity .45s cubic-bezier(.22,1,.36,1)}
 #mtv-choice.mtv-choice-leaving .mtv-choice-btn.is-chosen{transform:scale(1.045)}
 @media(max-width:767px){.mtv-choice-inner{max-width:480px;padding:20px 0}.mtv-choice-buttons{grid-template-columns:1fr;gap:15px}.mtv-choice-btn{min-height:154px;padding:24px;gap:18px}.mtv-choice-inner h2{font-size:clamp(33px,8vw,47px)}.mtv-choice-subtitle{margin-bottom:29px}.mtv-choice-btn:hover,.mtv-choice-btn:focus-visible{transform:none}.mtv-choice-bottom{margin-top:27px}.mtv-choice-foot{margin-top:18px}}
 @media(prefers-reduced-motion:reduce){.mtv-choice-btn,.mtv-choice-btn::before{transition:opacity .2s ease!important;transform:none!important}.mtv-choice-btn:hover,.mtv-choice-btn:focus-visible,.mtv-choice-btn:active{transform:none!important}.mtv-choice-leaving .mtv-choice-inner{transition:opacity .2s ease!important;transform:none!important}}
 @media(prefers-reduced-transparency:reduce){#mtv-choice .mtv-choice-btn{background:#262034!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;border-color:#81718c!important}#mtv-choice .mtv-choice-btn::before{display:none}}
 `;
 document.head.appendChild(pickerStyle);
 const choice=document.createElement('dialog');
 choice.id='mtv-choice';
 choice.setAttribute('aria-labelledby','mtv-choice-title');
 choice.innerHTML=`<div class="mtv-choice-shell"><div class="mtv-choice-inner">
 <div class="mtv-choice-kicker">M I C H A E L&nbsp;&nbsp; T V&nbsp;&nbsp; P R E S E N T S</div>
 <h2 id="mtv-choice-title">Welcome to Michael TV</h2>
 <p class="mtv-choice-subtitle">Choose your experience.</p>
 <div class="mtv-choice-buttons">
 <button type="button" class="mtv-choice-btn" data-mtv-choice="cinema" aria-label="Cinema Michael TV. Full cinematic intro, credits, and the original experience. Full Experience"><span class="mtv-choice-copy"><strong>Cinema Michael TV</strong><small>Full cinematic intro, credits, and the original experience.</small></span><span class="mtv-choice-cta">Full Experience</span></button>
 <button type="button" class="mtv-choice-btn" data-mtv-choice="instant" aria-label="Instant Michael TV. Skip the introduction and explore right away. Enter Portfolio"><span class="mtv-choice-copy"><strong>Instant Michael TV</strong><small>Skip the introduction and explore right away.</small></span><span class="mtv-choice-cta">Enter Portfolio</span></button>
 </div><div class="mtv-choice-bottom"><label class="mtv-choice-remember"><input type="checkbox" id="mtv-remember-choice">Remember my choice</label></div>
 <p class="mtv-choice-foot">Your choice. Your experience.</p>
 </div></div>`;
 document.body.appendChild(choice);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let previouslySeen=false;
 try{previouslySeen=sessionStorage.getItem(KEY)==='1'}catch{}
 // Welcome audio must not start until the video sequence completes.
 const footer=document.querySelector('.mk-footer');
 if(footer && !footer.querySelector('.mtv-replay')){
   const link=document.createElement('a');
   link.className='mtv-replay';link.href='#replay-intro';link.textContent='Replay intro';
   link.setAttribute('aria-label','Replay Michael TV introduction');
   footer.appendChild(link);
   link.addEventListener('click',e=>{e.preventDefault();openIntro(true)});
 }


 const dialog=document.createElement('dialog');
 dialog.id='mtv-intro';
 dialog.setAttribute('aria-label','Michael TV introduction');
 dialog.setAttribute('aria-describedby','mtv-intro-description');
 dialog.innerHTML=`
  <div class="mtv-screen">
   <div class="mtv-blue" aria-hidden="true"></div>
   <div class="mtv-crt" aria-hidden="true"></div>
   <div class="mtv-video" aria-label="Introduction video"><div class="mtv-video-ratio"><div id="mtv-youtube-player"></div></div></div>
   <div class="mtv-handoff" aria-hidden="true"><div class="mtv-handoff-art"><span class="mtv-handoff-kicker">NOW PLAYING</span><strong>MICHAEL TV</strong><span class="mtv-handoff-detail">TAPE 02 · TRACKING</span></div></div>
   <div class="mtv-announcement" aria-live="polite" aria-label="You’re watching the next big global FinTech SWE Engineer in real time!"><span class="mtv-announcement-kicker">YOU’RE WATCHING</span><strong>THE NEXT BIG GLOBAL<br><em>FINTECH SWE ENGINEER</em><br><span class="mtv-announcement-live">IN REAL TIME!</span></strong><span class="mtv-announcement-station">MICHAEL TV · WORLDWIDE</span></div>
   <div class="mtv-welcome" hidden><video class="mtv-speech-video" data-src="/assets/michael-tv-welcome.mp4" preload="none" playsinline aria-hidden="true"></video><div class="mtv-welcome-label">A NOTE FROM MICHAEL</div><p class="mtv-welcome-caption" aria-live="polite">Hey.</p><button class="mtv-welcome-tap" type="button" hidden>Tap to hear a welcome ▶</button><button class="mtv-welcome-next" type="button">Enter website ›</button></div>
   <div class="mtv-idle">
    <div class="mtv-title">MICHAEL TV</div>
    <p class="mtv-tagline">The world is changing. I plan to help build what's next.</p>
    <button class="mtv-play" type="button" aria-label="Play intro">PRESS PLAY ▶</button>
   </div>
   <span class="mtv-top-left mtv-idle-label" aria-live="polite">VIDEO 1</span>
   <span class="mtv-time" aria-label="Video timecode" hidden>0:00:00</span>
   <button class="mtv-mute" type="button" aria-label="Mute sound" aria-pressed="false">Sound on</button>
   <div class="mtv-vignette" aria-hidden="true"></div>
   <div class="mtv-scan" aria-hidden="true"></div>
   <div class="mtv-glitch" aria-hidden="true"></div>
   <p class="mtv-description" id="mtv-intro-description">Intro video. Press Skip to go to the site.</p>
   <div class="mtv-actions"><button class="mtv-skip" type="button" hidden>Skip Intro</button></div>
   <canvas class="mtv-noise" width="192" height="108" aria-hidden="true"></canvas>
  </div>`;
 document.body.appendChild(dialog);
 const welcomePanel=dialog.querySelector('.mtv-welcome');
 const welcomeCaption=dialog.querySelector('.mtv-welcome-caption');
 const welcomeTap=dialog.querySelector('.mtv-welcome-tap');
 const welcomeNext=dialog.querySelector('.mtv-welcome-next');
 const welcomeVideo=dialog.querySelector('.mtv-speech-video');
 let activeWelcomeMedia=welcomeVideo;
 let captionTicker=0;
 const stopWelcome=()=>{
   clearInterval(captionTicker);
   for(const media of [welcomeVoice,welcomeVideo]){
     try{media.pause();media.currentTime=0}catch{}
   }
   welcomePanel.hidden=true;
 };
 const playWelcome=()=>{
   // Allocate media sources only after Cinema mode has been chosen and playback is requested.
   if(!welcomeVoice.src)welcomeVoice.src='/audio/welcome.m4a?v=2';
   if(!welcomeVideo.src)welcomeVideo.src=welcomeVideo.dataset.src;
   // User's uploaded speech video is played inside Michael TV; audio-only is fallback.
   activeWelcomeMedia=welcomeVideo;
   const begin=(media)=>{
     try{media.currentTime=0}catch{}
     return media.play();
   };
   Promise.resolve(begin(welcomeVideo)).catch(()=>{
     activeWelcomeMedia=welcomeVoice;
     return begin(welcomeVoice);
   }).then(()=>{
     try{sessionStorage.setItem(WELCOME_KEY,'1')}catch{}
     welcomeTap.hidden=true;
     clearInterval(captionTicker);
     captionTicker=setInterval(()=>{
       for(const [at,line] of captions)
         if(activeWelcomeMedia.currentTime>=at)welcomeCaption.textContent=line;
     },200);
   }).catch(()=>{
     welcomeTap.hidden=false;
     welcomeCaption.textContent='Tap to hear my welcome.';
   });
 };
 const startWelcome=()=>{
   if(!active||exiting)return;
   try{player?.stopVideo?.()}catch{}
   // A deliberate replay includes the whole introduction, including the new speech.
   clearTimeout(maxDeadline);maxDeadline=0;
   welcomePanel.hidden=false;dialog.classList.add('mtv-welcome-active');
   welcomeCaption.textContent='Hey.';
   welcomeTap.hidden=false; // Explicit tap after VIDEO 2: reliable under browser audio rules.
 };
 welcomeTap.addEventListener('click',playWelcome);
 welcomeNext.addEventListener('click',()=>finish('welcome-skip'));
 welcomeVoice.addEventListener('ended',()=>{if(active&&!exiting&&activeWelcomeMedia===welcomeVoice)startOutro()});
 welcomeVideo.addEventListener('ended',()=>{if(active&&!exiting&&activeWelcomeMedia===welcomeVideo)startOutro()});
 welcomeVideo.addEventListener('error',()=>{
   if(!active||exiting||welcomePanel.hidden||activeWelcomeMedia!==welcomeVideo)return;
   activeWelcomeMedia=welcomeVoice;
   welcomeVoice.play().catch(()=>{welcomeTap.hidden=false});
 });
 const screen=dialog.querySelector('.mtv-screen');
 const playBtn=dialog.querySelector('.mtv-play');
 const muteBtn=dialog.querySelector('.mtv-mute');
 const skipBtn=dialog.querySelector('.mtv-skip');
 const label=dialog.querySelector('.mtv-top-left');
 const timecode=dialog.querySelector('.mtv-time');
 const staticCanvas=dialog.querySelector('.mtv-noise');
 const handoff=dialog.querySelector('.mtv-handoff');
 const staticCtx=staticCanvas.getContext('2d',{alpha:false});
 const pixels=staticCtx?.createImageData(192,108);
 let player=null, audio=null, master=null, muted=false, pending=false, active=false, exiting=false;
 let apiReady=false,apiFailed=false,apiLoading=false,playerStarted=false,trackingFinished=false;
 let clickDeadline=0,maxDeadline=0,timeTicker=0,apiScript=null,glitchTimer=0,bootTimer=0,staticFrame=0,handoffTimer=0,transitionTimer=0;
 let lastFocused=null,showingCouch=true,switching=false,handoffStartedAt=0,playingOutro=false;
 const markSeen=()=>{try{sessionStorage.setItem(KEY,'1')}catch{}};
 function showOutroFallback(){
   if(!active||exiting)return;
   clearTimeout(clickDeadline);clickDeadline=0;
   dialog.classList.remove('mtv-video-visible');
   welcomePanel.hidden=false;dialog.classList.add('mtv-welcome-active');
   welcomeCaption.textContent='The ending could not play automatically.';
   welcomeTap.hidden=true;
   let link=welcomePanel.querySelector('.mtv-outro-link');
   if(!link){link=document.createElement('a');link.className='mtv-outro-link';
     link.href='https://www.youtube.com/watch?v='+OUTRO_VIDEO;
     link.target='_blank';link.rel='noopener noreferrer';
     link.textContent='Watch the ending on YouTube ↗';
     link.style.cssText='display:inline-block;margin:12px;padding:10px 16px;color:#fff;text-decoration:underline;font-weight:700';
     welcomePanel.append(link);}
 }
 function startOutro(){
   if(!active||exiting||playingOutro)return;
   stopWelcome();
   playingOutro=true;showingCouch=false;switching=false;
   pending=true;playerStarted=false;trackingFinished=true;
   dialog.classList.remove('mtv-welcome-active','mtv-handoff-active');
   dialog.classList.add('mtv-video-visible');
   label.textContent='VIDEO 3';skipBtn.hidden=false;
   if(!player?.loadVideoById){showOutroFallback();return;}
   try{
     player.loadVideoById({videoId:OUTRO_VIDEO,startSeconds:0});
     // YouTube may block autoplay or embedding; offer an official link as fallback.
     clickDeadline=setTimeout(()=>{if(!playerStarted)showOutroFallback()},6500);
   }catch{showOutroFallback();}
 }
 const clearRun=()=>{
   clearTimeout(clickDeadline);clearTimeout(maxDeadline);clearTimeout(glitchTimer);clearTimeout(bootTimer);
   clearTimeout(handoffTimer);clearTimeout(transitionTimer);
   clearInterval(timeTicker);clickDeadline=maxDeadline=glitchTimer=bootTimer=timeTicker=handoffTimer=transitionTimer=0;
   if(staticFrame){cancelAnimationFrame(staticFrame);staticFrame=0}
 };
 const timeString=seconds=>{
   const value=Math.max(0,Math.floor(seconds||0));
   return Math.floor(value/3600)+':'+String(Math.floor(value/60)%60).padStart(2,'0')+':'+String(value%60).padStart(2,'0');
 };
 const updateTime=()=>{
   if(!active||!playerStarted)return;
   try{
     const seconds=player?.getCurrentTime?.();
     if(Number.isFinite(seconds)){
       timecode.textContent=timeString(seconds+(showingCouch?0:COUCH_DURATION));
       if(showingCouch && seconds>=COUCH_DURATION-.12)playMainVideo();
     }
   }catch{}
 };
 const setMute=(value)=>{
   muted=Boolean(value);
   muteBtn.textContent=muted?'Sound off':'Sound on';
   muteBtn.setAttribute('aria-pressed',String(muted));
   muteBtn.setAttribute('aria-label',muted?'Unmute sound':'Mute sound');
   if(master)master.gain.value=muted?0:.4;
   try{if(player){if(muted)player.mute();else player.unMute()}}catch{}
 };
 muteBtn.addEventListener('click',()=>setMute(!muted));
 const soundEffects=()=>{
   if(muted)return;
   try{
     const Audio=window.AudioContext||window.webkitAudioContext;
     if(!Audio)return;
     audio=audio||new Audio();
     audio.resume?.();
     master=audio.createGain();master.gain.value=.4;master.connect(audio.destination);
     const now=audio.currentTime;
     const tone=(freq,start,duration,gain,type='sine',endFreq=freq)=>{
       const o=audio.createOscillator(),g=audio.createGain();
       o.type=type;o.frequency.setValueAtTime(freq,now+start);
       o.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),now+start+duration);
       g.gain.setValueAtTime(0.0001,now+start);
       g.gain.exponentialRampToValueAtTime(gain,now+start+.012);
       g.gain.exponentialRampToValueAtTime(.0001,now+start+duration);
       o.connect(g).connect(master);o.start(now+start);o.stop(now+start+duration+.02);
     };
     const noise=(start,duration,gain)=>{
       const length=Math.floor(audio.sampleRate*duration),buf=audio.createBuffer(1,length,audio.sampleRate);
       const data=buf.getChannelData(0);
       for(let i=0;i<length;i++)data[i]=Math.random()*2-1;
       const s=audio.createBufferSource(),g=audio.createGain(),low=audio.createBiquadFilter();
       s.buffer=buf;low.type='lowpass';low.frequency.value=480;
       g.gain.setValueAtTime(.0001,now+start);
       g.gain.linearRampToValueAtTime(gain,now+start+.025);
       g.gain.exponentialRampToValueAtTime(.0001,now+start+duration);
       s.connect(low).connect(g).connect(master);s.start(now+start);s.stop(now+start+duration+.02);
     };
     tone(145,0,.17,.32,'triangle',55);noise(0,.17,.2); // tape insert clunk
     tone(950,.22,.055,.16,'square',430); // play click
     noise(.31,.82,.035);tone(80,.34,.78,.026,'sine',72); // soft whirr
   }catch{}
 };
 function ensureAPI(){
   if(apiReady||apiFailed||apiLoading)return;
   if(window.YT?.Player){apiReady=true;return;}
   apiLoading=true;
   const previous=window.onYouTubeIframeAPIReady;
   window.onYouTubeIframeAPIReady=()=>{
     try{previous?.()}catch{}
     apiReady=true;apiLoading=false;
     if(pending&&!exiting)createPlayer();
   };
   apiScript=document.createElement('script');
   apiScript.async=true;
   apiScript.src='https://www.youtube.com/iframe_api';
   apiScript.onerror=()=>{
     apiFailed=true;apiLoading=false;
     if(pending)finish('error');
   };
   document.head.appendChild(apiScript);
 }
 function openIntro(replay=false){
   if(active)return;
   clearRun();
   active=true;pending=false;exiting=false;playerStarted=false;trackingFinished=false;showingCouch=true;switching=false;playingOutro=false;handoffStartedAt=0;
   lastFocused=document.activeElement;
   dialog.className='mtv-boot';welcomePanel.hidden=true;
   label.textContent='VIDEO 1';label.classList.add('mtv-idle-label');
   timecode.hidden=true;timecode.textContent='0:00:00';
   skipBtn.hidden=false; // Visitors can skip even before pressing Play.
   document.getElementById('mtv-youtube-player')?.replaceChildren();
   player=null;
   try{dialog.showModal()}catch{return}
   window.dispatchEvent(new CustomEvent('michael-tv:intro-open'));
   playBtn.disabled=false;
   playBtn.focus({preventScroll:true});
   bootTimer=setTimeout(()=>{dialog.classList.add('mtv-ready')},reduced.matches?0:250);
 }
 function revealVideo(){
   if(!active||exiting||!playerStarted||!trackingFinished)return;
   dialog.classList.add('mtv-video-visible');
   if(!timeTicker)timeTicker=setInterval(updateTime,125);
   updateTime();
 }
 function releaseHandoff(){
   if(!active||exiting||!switching||!playerStarted)return;
   const remaining=Math.max(0,(reduced.matches?100:300)-(performance.now()-handoffStartedAt));
   clearTimeout(transitionTimer);
   transitionTimer=setTimeout(()=>{
     if(!active||exiting||!playerStarted)return;
     switching=false;
     dialog.classList.remove('mtv-handoff-active');
     label.textContent='VIDEO 2';
     revealVideo();
   },remaining);
 }
 function playMainVideo(){
   if(!active||exiting||!showingCouch||!player)return;
   showingCouch=false;playerStarted=false;pending=true;switching=true;
   handoffStartedAt=performance.now();
   dialog.classList.add('mtv-handoff-active');
   label.textContent='TRACKING ▶';
   timecode.textContent=timeString(COUCH_DURATION);
   clearTimeout(clickDeadline);
   clickDeadline=setTimeout(()=>{if(!playerStarted)finish('timeout')},4000);
   try{
     player.loadVideoById({videoId:VID,startSeconds:0});
   }catch{finish('error')}
 }
 function createPlayer(){
   if(!active||!pending||exiting||player||!window.YT?.Player)return;
   try{
     player=new YT.Player('mtv-youtube-player',{
       host:'https://www.youtube-nocookie.com',
       videoId:COUCH_VIDEO,
       width:'100%',height:'100%',
       playerVars:{autoplay:1,controls:0,playsinline:1,rel:0,modestbranding:1,disablekb:1,fs:0,iv_load_policy:3,origin:location.origin,start:0},
       events:{
         onReady:event=>{
           try{
             if(muted)event.target.mute();else event.target.setVolume(40);
             event.target.playVideo();
           }catch{finish('error')}
         },
         onStateChange:event=>{
           if(!active||exiting)return;
           if(event.data===YT.PlayerState.PLAYING){
             playerStarted=true;pending=false;
             clearTimeout(clickDeadline);clickDeadline=0;
             // The 25-second limit includes both embedded videos and their handoff.
             if(switching)releaseHandoff();else revealVideo();
           }else if(event.data===YT.PlayerState.ENDED){
             // Ignore a late end event from the first clip during the handoff.
             if(switching)return;
             if(playingOutro)finish('outro-ended');else if(showingCouch)playMainVideo();else startWelcome();
           }
         },
         onError:()=>playingOutro?showOutroFallback():finish('error')
       }
     });
   }catch{finish('error')}
 }
 function start(){
   if(!active||pending||playerStarted||exiting)return;
   // Sound and YouTube playback only follow this explicit trusted gesture.
   pending=true;playBtn.disabled=true;
   // Keep voice silent during both videos; no early playback or silent unlock.
   soundEffects();
   dialog.classList.add('mtv-playing','mtv-announcing');
   setTimeout(()=>{if(active&&!exiting)dialog.classList.remove('mtv-announcing')},reduced.matches?1100:2700);
   label.textContent='PLAY ▶';label.classList.remove('mtv-idle-label');
   timecode.hidden=false;skipBtn.hidden=false;
   skipBtn.focus({preventScroll:true});
   if(!reduced.matches){dialog.classList.add('mtv-tracking')}
   glitchTimer=setTimeout(()=>{
     dialog.classList.remove('mtv-tracking');
     trackingFinished=true;
     revealVideo();
   },reduced.matches?0:700);
   // Fail open rather than trapping people in an empty/blocked embed.
   clickDeadline=setTimeout(()=>{if(!playerStarted)finish('timeout')},4000);
   maxDeadline=setTimeout(()=>finish('limit'),25000);
   if(apiFailed){finish('error');return}
   if(apiReady || window.YT?.Player){apiReady=true;createPlayer()}
   else ensureAPI();
 }
 playBtn.addEventListener('click',start);
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish('escape')});
 skipBtn.addEventListener('click',()=>finish('skip'));
 const renderNoise=()=>{
   if(!staticCtx||!pixels)return;
   const d=pixels.data;
   for(let i=0;i<d.length;i+=4){
     const v=(Math.random()*256)|0;d[i]=v;d[i+1]=v;d[i+2]=v;d[i+3]=255;
   }
   staticCtx.putImageData(pixels,0,0);
 };
 function finish(reason){
   if(!active||exiting)return;
   if(reason==='ended'){startWelcome();return}
   exiting=true;pending=false;
   stopWelcome();
   clearRun();markSeen();
   dialog.classList.remove('mtv-handoff-active');
   try{player?.stopVideo?.()}catch{}
   const settle=()=>{
     try{player?.destroy?.()}catch{}
     player=null;
     if(dialog.open)dialog.close();
     active=false;
     dialog.className='';
     document.getElementById('mtv-youtube-player')?.replaceChildren();
     if(typeof window.portfolioEnterHomeFromIntro==='function')window.portfolioEnterHomeFromIntro();
     else if(location.hash!=='#home')location.hash='home';
     window.dispatchEvent(new CustomEvent('michael-tv:home-enter',{detail:{reason}}));
     const firstNav=document.querySelector('#apple-navlinks a[href="#home"]');
     (firstNav||lastFocused)?.focus?.({preventScroll:true});
   };
   if(reduced.matches){dialog.classList.add('mtv-leaving');setTimeout(settle,250);return}
   // Exit burst: 300ms like channel flipping. No idle canvas loop.
   const began=performance.now();
   renderNoise(); // One noise sample: fade the texture without rapid luminance flashing.
   const frame=now=>{
     const elapsed=now-began;
     staticCanvas.style.opacity=String(elapsed<140?Math.min(.9,elapsed/140*.9):Math.max(0,.9*(1-(elapsed-140)/160)));
     if(elapsed<300)staticFrame=requestAnimationFrame(frame);
     else{staticFrame=0;staticCanvas.style.opacity='0';settle();}
   };
   staticFrame=requestAnimationFrame(frame);
 }

 // Desktop defaults to the selector. A remembered choice is optional and reversible.
 const footerSelector=document.createElement('a');
 footerSelector.href='#choose-experience';
 footerSelector.className='mtv-replay';
 footerSelector.textContent='Choose experience';
 footerSelector.setAttribute('aria-label','Return to Michael TV experience selector');
 (document.querySelector('.mk-footer')||document.querySelector('footer'))?.append(footerSelector);
 const openPicker=()=>{
   choice.classList.remove('mtv-choice-leaving');
   try{choice.showModal()}catch{openIntro(false);return}
   choice.querySelector('[data-mtv-choice]')?.focus({preventScroll:true});
 };
 footerSelector.addEventListener('click',event=>{
   event.preventDefault();
   if(dialog.open)finish('skip');
   else openPicker();
 });
 choice.addEventListener('cancel',event=>event.preventDefault());
 const cards=[...choice.querySelectorAll('[data-mtv-choice]')];
 const moveFocus=event=>{
   if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(event.key))return;
   event.preventDefault();
   const index=cards.indexOf(document.activeElement);
   const step=['ArrowRight','ArrowDown'].includes(event.key)?1:-1;
   cards[(index+step+cards.length)%cards.length].focus();
 };
 choice.addEventListener('keydown',moveFocus);
 const tiltAllowed=matchMedia('(hover:hover) and (pointer:fine)');
 let tiltFrame=0;
 cards.forEach(card=>{
   card.addEventListener('pointermove',event=>{
     if(!tiltAllowed.matches||reduced.matches)return;
     const rect=card.getBoundingClientRect();
     const x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
     cancelAnimationFrame(tiltFrame);
     tiltFrame=requestAnimationFrame(()=>{
       card.style.setProperty('--mx',(x*100)+'%');
       card.style.setProperty('--my',(y*100)+'%');
       card.style.setProperty('--rx',((.5-y)*12).toFixed(2)+'deg');
       card.style.setProperty('--ry',((x-.5)*12).toFixed(2)+'deg');
     });
   },{passive:true});
   card.addEventListener('pointerleave',()=>{
     card.style.setProperty('--rx','0deg');
     card.style.setProperty('--ry','0deg');
   });
 });
 const completeInstant=()=>{
   markSeen();
   try{sessionStorage.setItem('michael-tv-spotlight-shown-v2','1')}catch{}
   if(typeof window.portfolioEnterHomeFromIntro==='function')window.portfolioEnterHomeFromIntro();
   else if(location.hash!=='#home')location.hash='home';
   window.dispatchEvent(new CustomEvent('michael-tv:home-enter',{detail:{reason:'instant'}}));
   document.querySelector('#apple-navlinks a[href="#home"]')?.focus?.({preventScroll:true});
 };
 const choose=selected=>{
   const remember=choice.querySelector('#mtv-remember-choice')?.checked;
   try{
     if(remember)localStorage.setItem(REMEMBER_KEY,selected);
     else localStorage.removeItem(REMEMBER_KEY);
   }catch{}
   choice.classList.add('mtv-choice-leaving');
   cards.find(card=>card.dataset.mtvChoice===selected)?.classList.add('is-chosen');
   const proceed=()=>{
     if(choice.open)choice.close();
     cards.forEach(card=>card.classList.remove('is-chosen'));
     if(selected==='cinema')openIntro(false);
     else completeInstant();
   };
   setTimeout(proceed,reduced.matches?170:420);
 };
 cards.forEach(card=>card.addEventListener('click',()=>{
   if(typeof navigator.vibrate==='function' && mobile.matches)navigator.vibrate(10);
   choose(card.dataset.mtvChoice);
 }));
 let remembered=null;
 try{remembered=localStorage.getItem(REMEMBER_KEY)}catch{}
 if(remembered!=='cinema'&&remembered!=='instant')remembered=null;
 if(!previouslySeen){
   if(remembered==='cinema')openIntro(false);
   else if(remembered==='instant')completeInstant();
   else openPicker();
 }
})();
