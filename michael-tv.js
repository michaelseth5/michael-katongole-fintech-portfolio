'use strict';
/* Michael TV first-visit introduction. Real page HTML is never removed.
   No video or sound autoplay occurs before a user presses Play. */
(() => {
 const KEY='michael-tv-intro-seen-v1';
 const VID='OT9HsNszYCI';
 const COUCH_VIDEO='BhUG_YEAmsc';
 const COUCH_DURATION=10;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let previouslySeen=false;
 try{previouslySeen=sessionStorage.getItem(KEY)==='1'}catch{}
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
   <div class="mtv-announcement" aria-live="polite" aria-label="You’re watching the next big global FinTech SWE Engineer in real time!"><span class="mtv-announcement-kicker">YOU’RE WATCHING</span><strong>THE NEXT BIG GLOBAL<br><em>FINTECH SWE ENGINEER</em><br><span class="mtv-announcement-live">IN REAL TIME!</span></strong><span class="mtv-announcement-station">MICHAEL TV · WORLDWIDE</span></div>
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
   <div class="mtv-actions"><button class="mtv-skip" type="button" hidden>Skip intro ›</button></div>
   <canvas class="mtv-noise" width="192" height="108" aria-hidden="true"></canvas>
  </div>`;
 document.body.appendChild(dialog);
 const screen=dialog.querySelector('.mtv-screen');
 const playBtn=dialog.querySelector('.mtv-play');
 const muteBtn=dialog.querySelector('.mtv-mute');
 const skipBtn=dialog.querySelector('.mtv-skip');
 const label=dialog.querySelector('.mtv-top-left');
 const timecode=dialog.querySelector('.mtv-time');
 const staticCanvas=dialog.querySelector('.mtv-noise');
 const staticCtx=staticCanvas.getContext('2d',{alpha:false});
 const pixels=staticCtx?.createImageData(192,108);
 let player=null, audio=null, master=null, muted=false, pending=false, active=false, exiting=false;
 let apiReady=false,apiFailed=false,apiLoading=false,playerStarted=false,trackingFinished=false;
 let clickDeadline=0,maxDeadline=0,timeTicker=0,apiScript=null,glitchTimer=0,bootTimer=0,staticFrame=0;
 let lastFocused=null,showingCouch=true;
 const markSeen=()=>{try{sessionStorage.setItem(KEY,'1')}catch{}};
 const clearRun=()=>{
   clearTimeout(clickDeadline);clearTimeout(maxDeadline);clearTimeout(glitchTimer);clearTimeout(bootTimer);
   clearInterval(timeTicker);clickDeadline=maxDeadline=glitchTimer=bootTimer=timeTicker=0;
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
   active=true;pending=false;exiting=false;playerStarted=false;trackingFinished=false;showingCouch=true;
   lastFocused=document.activeElement;
   dialog.className='mtv-boot';
   label.textContent='VIDEO 1';label.classList.add('mtv-idle-label');
   timecode.hidden=true;timecode.textContent='0:00:00';
   skipBtn.hidden=true;
   document.getElementById('mtv-youtube-player')?.replaceChildren();
   player=null;
   try{dialog.showModal()}catch{return}
   playBtn.disabled=false;
   playBtn.focus({preventScroll:true});
   bootTimer=setTimeout(()=>{dialog.classList.add('mtv-ready');ensureAPI()},reduced.matches?0:250);
 }
 function revealVideo(){
   if(!active||exiting||!playerStarted||!trackingFinished)return;
   dialog.classList.add('mtv-video-visible');
   timeTicker=setInterval(updateTime,250);updateTime();
 }
 function playMainVideo(){
   if(!active||exiting||!showingCouch||!player)return;
   showingCouch=false;playerStarted=false;pending=true;
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
             // The 25-second limit includes the playback period.
             revealVideo();
           }else if(event.data===YT.PlayerState.ENDED){
             if(showingCouch)playMainVideo();else finish('ended');
           }
         },
         onError:()=>finish('error')
       }
     });
   }catch{finish('error')}
 }
 function start(){
   if(!active||pending||playerStarted||exiting)return;
   // Sound and YouTube playback only follow this explicit trusted gesture.
   pending=true;playBtn.disabled=true;
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
   exiting=true;pending=false;
   clearRun();markSeen();
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
 // Normal first visit. Replay bypasses session restriction only on explicit click.
 if(!previouslySeen)openIntro(false);
})();
