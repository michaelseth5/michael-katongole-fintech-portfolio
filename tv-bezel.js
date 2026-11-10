'use strict';
/* Cosmetic CRT shell and accessible hardware, independent of channel content. */
(() => {
 const host=document.getElementById('main-content');
 const header=document.querySelector('header.apple-topbar');
 if(!host||!header||!host.classList.contains('tv-stage'))return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const channelNames=['HOME','PROJECTS','EXPERIENCE','SKILLS','MILESTONES','NETWORKING','READING','HOBBIES','CONTACT'];
 const channelKeys=['home','projects','experience','skills','milestone','networking','reading','hobbies','contact'];
 const bezel=document.createElement('div');
 bezel.className='tv-hardware';
 bezel.setAttribute('aria-label','Michael TV frame');
 document.body.appendChild(bezel);
 bezel.append(header,host);
 // Recalculate the channel pill indicator after moving the nav into the bezel.
 requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
 const glass=document.createElement('div');glass.className='tv-screen-glass';glass.setAttribute('aria-hidden','true');
 const osd=document.createElement('div');osd.className='tv-osd';osd.setAttribute('role','status');osd.setAttribute('aria-live','polite');osd.setAttribute('aria-atomic','true');
 const vol=document.createElement('div');vol.className='tv-volume-osd';vol.setAttribute('role','status');vol.setAttribute('aria-live','polite');
 const signal=document.createElement('div');signal.className='tv-no-signal';signal.setAttribute('aria-hidden','true');signal.innerHTML='<strong>NO SIGNAL</strong>';
 host.append(glass,osd,vol,signal);
 const bottom=document.createElement('div');bottom.className='tv-bezel-bottom';
 const speaker=document.createElement('div');speaker.className='tv-speaker';speaker.setAttribute('aria-hidden','true');
 for(let i=0;i<6;i++)speaker.appendChild(document.createElement('i'));
 const brand=document.createElement('span');brand.className='tv-brand';brand.textContent='MICHAEL TV';
 const controls=document.createElement('div');controls.className='tv-controls';
 const makeButton=(label,content,cls)=>{
   const b=document.createElement('button');b.type='button';b.className='tv-control '+(cls||'');
   b.setAttribute('aria-label',label);b.textContent=content;return b;
 };
 const down=makeButton('Previous channel','CH −','tv-channel-down');
 const up=makeButton('Next channel','CH +','tv-channel-up');
 const mute=makeButton('Mute TV control sounds','VOL','tv-channel-mute');
 mute.setAttribute('aria-pressed','false');
 const power=document.createElement('button');power.type='button';power.className='tv-power';power.setAttribute('aria-label','Turn TV off');
 power.setAttribute('aria-pressed','true');power.innerHTML='<span class="tv-power-light" aria-hidden="true"></span>';
 controls.append(down,up,mute,power);
 bottom.append(speaker,brand,controls);bezel.appendChild(bottom);
 let current=0,muted=false,poweredOff=false,osdTimer=0,volumeTimer=0,promptTimer=0,audioContext=null;
 const state=window.__portfolioChannelIsActive;
 if(typeof state==='function')window.__portfolioChannelIsActive=key=>!poweredOff&&state(key);
 const emitPower=()=>document.dispatchEvent(new CustomEvent('portfolio:channel-change',{detail:{key:channelKeys[current],index:current,poweredOff}}));
 const renderOSD=(number,name)=>{
   osd.innerHTML='<strong>CH '+number+'</strong><span>'+name+'</span>';
   osd.classList.add('is-expanded');
   clearTimeout(osdTimer);
   osdTimer=setTimeout(()=>osd.classList.remove('is-expanded'),2000);
 };
 const setChannelIndex=(index)=>{
   current=index;
   renderOSD(String(index+1).padStart(2,'0'),channelNames[index]);
   const currentPage=document.querySelector('.tv-page.is-active');
   // Only explicitly unfinished channels are replaced, never real content.
   const unfinished=currentPage?.querySelector('[data-channel-status="unfinished"]') ||
     currentPage?.dataset.channelStatus==='unfinished';
   host.dataset.noSignal=unfinished?'true':'false';
 };
 const activeIndex=()=>{
   const p=document.querySelector('.tv-page.is-active');
   const n=Number(p?.dataset.channel);
   return Number.isInteger(n)&&n>=0&&n<9?n:0;
 };
 setChannelIndex(activeIndex());
 document.addEventListener('portfolio:channel-change',event=>{
   if(Number.isInteger(event.detail?.index))setChannelIndex(event.detail.index);
 });
 const clickTone=()=>{
   if(muted)return;
   try{
     const Audio=window.AudioContext||window.webkitAudioContext;
     if(!Audio)return;
     audioContext=audioContext||new Audio();
     if(audioContext.state==='suspended')audioContext.resume();
     const osc=audioContext.createOscillator(),gain=audioContext.createGain(),t=audioContext.currentTime;
     osc.type='triangle';
     osc.frequency.setValueAtTime(640,t);osc.frequency.exponentialRampToValueAtTime(280,t+.052);
     gain.gain.setValueAtTime(.0001,t);
     gain.gain.exponentialRampToValueAtTime(.055,t+.006);
     gain.gain.exponentialRampToValueAtTime(.0001,t+.065);
     osc.connect(gain).connect(audioContext.destination);osc.start(t);osc.stop(t+.075);
   }catch{}
 };
 const navigate=(index)=>{
   if(poweredOff)return;
   const normalized=(index+9)%9;
   clickTone();
   window.portfolioGoToChannel?.(channelKeys[normalized]);
 };
 down.addEventListener('click',()=>navigate(current-1));
 up.addEventListener('click',()=>navigate(current+1));
 const showVolume=()=>{
   vol.textContent=muted?'VOL ▯▯▯▯▯':'VOL ▮▮▮▯▯';
   vol.classList.add('is-visible');
   clearTimeout(volumeTimer);
   volumeTimer=setTimeout(()=>vol.classList.remove('is-visible'),1500);
 };
 mute.addEventListener('click',()=>{
   muted=!muted;
   mute.setAttribute('aria-pressed',String(muted));
   mute.setAttribute('aria-label',muted?'Unmute TV control sounds':'Mute TV control sounds');
   showVolume();
 });
 power.addEventListener('click',()=>{
   poweredOff=!poweredOff;
   bezel.classList.toggle('is-powered-off',poweredOff);
   host.inert=poweredOff;
   header.inert=poweredOff;
   down.disabled=poweredOff;up.disabled=poweredOff;mute.disabled=poweredOff;
   power.setAttribute('aria-pressed',String(!poweredOff));
   power.setAttribute('aria-label',poweredOff?'Turn TV on':'Turn TV off');
   emitPower();
   if(!poweredOff)setChannelIndex(current);
 });
 document.addEventListener('keydown',event=>{
   if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||event.repeat||poweredOff)return;
   if(!/^[1-9]$/.test(event.key))return;
   if(event.target.closest('input,textarea,select,[contenteditable],[role="spinbutton"],[role="slider"],dialog'))return;
   event.preventDefault();
   const index=Number(event.key)-1;
   renderOSD('0_',channelNames[index]);
   clearTimeout(promptTimer);
   promptTimer=setTimeout(()=>navigate(index),160);
 },true);
})();
