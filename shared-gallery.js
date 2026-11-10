'use strict';
/* One progressive enhancement for the existing Hobbies and Networking gallery DOM.
   Preserves the original event/carousel engines and all supplied media and captions. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const activate=()=> {
   const pages=[
     {root:document.getElementById('hobbies'),controls:'.hobby-carousel-controls',chips:'.hobby-carousel-dots',prev:'.hobby-carousel-btn.prev',next:'.hobby-carousel-btn.next',active:'.hobby-carousel-track>article',tabs:'.hobby-carousel-dots button'},
     {root:document.getElementById('networking'),controls:'.network-carousel-controls',chips:'.network-carousel-tabs',prev:'.network-prev',next:'.network-next',active:'.network-event-slide',tabs:'.network-carousel-tabs button'}
   ];
   const marks=new WeakSet();
   const enhancement=(rail)=>{
     if(marks.has(rail))return;
     marks.add(rail);
     const page=rail.closest('.tv-gallery-page');
     if(!page)return;
     const wrap=rail.parentElement;
     if(!wrap)return;
     wrap.classList.add('tv-shared-gallery-wrap');
     const bar=document.createElement('div');
     bar.className='tv-shared-progress';
     bar.innerHTML='<div class="tv-shared-progress-track" aria-hidden="true"><span class="tv-shared-progress-fill"></span></div><div class="tv-shared-progress-controls"><button type="button" class="tv-shared-photo-prev" aria-label="Previous photo">‹</button><span class="tv-shared-photo-count" aria-live="polite">01 / 01</span><button type="button" class="tv-shared-photo-next" aria-label="Next photo">›</button></div>';
     wrap.appendChild(bar);
     const cards=[...rail.querySelectorAll(':scope > figure')];
     if(!cards.length){bar.remove();return;}
     cards.forEach(card=>{
       // Wrap existing caption nodes without changing caption text.
       const caption=card.querySelector('figcaption');
       if(!caption || caption.querySelector('strong'))return;
       const index=caption.querySelector('.seo-photo-index');
       if(index)index.remove();
       const content=document.createElement('strong');
       while(caption.firstChild)content.appendChild(caption.firstChild);
       caption.appendChild(content);
       if(index)caption.prepend(index);
     });
     let current=0;
     const prev=bar.querySelector('.tv-shared-photo-prev'),next=bar.querySelector('.tv-shared-photo-next');
     const count=bar.querySelector('.tv-shared-photo-count'),fill=bar.querySelector('.tv-shared-progress-fill');
     const update=()=>{
       const max=Math.max(0,rail.scrollWidth-rail.clientWidth);
       const fraction=max?Math.max(0,Math.min(1,rail.scrollLeft/max)):1;
       const midpoint=rail.scrollLeft+Math.min(rail.clientWidth*.3,120);
       current=cards.reduce((best,card,i)=>Math.abs(card.offsetLeft-rail.offsetLeft-midpoint)<Math.abs(cards[best].offsetLeft-rail.offsetLeft-midpoint)?i:best,0);
       count.textContent=String(current+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
       fill.style.width=(fraction*100)+'%';
       wrap.classList.toggle('is-at-end',max<4||rail.scrollLeft>=max-3);
       prev.disabled=rail.scrollLeft<=2;next.disabled=max<4||rail.scrollLeft>=max-3;
     };
     const scroll=(dir)=>{
       const width=cards[0].getBoundingClientRect().width+12;
       rail.scrollBy({left:dir*width,behavior:reduced.matches?'instant':'smooth'});
     };
     prev.addEventListener('click',()=>scroll(-1));
     next.addEventListener('click',()=>scroll(1));
     rail.addEventListener('keydown',e=>{
       if(e.target.closest('input,textarea,button,select'))return;
       if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
         e.preventDefault();e.stopImmediatePropagation();scroll(e.key==='ArrowRight'?1:-1);
       }
     },true);
     rail.addEventListener('scroll',()=>requestAnimationFrame(update),{passive:true});
     rail.addEventListener('touchend',()=>setTimeout(update,200),{passive:true});
     window.addEventListener('resize',update,{passive:true});
     const slides=page.querySelector('.network-carousel-track');
     if(slides){page.querySelectorAll('.network-tab').forEach(tab=>tab.addEventListener('click',()=>setTimeout(update,180)));}
     update();
   };
   pages.forEach(({root,controls,chips,prev,next,active,tabs})=>{
     if(!root)return;
     root.classList.add('tv-gallery-page');
     const row=root.querySelector(controls),rail=root.querySelector(chips);
     if(row&&rail){
       row.classList.add('tv-shared-chips');
       rail.classList.add('tv-shared-chip-rail');
       root.querySelector(prev)?.classList.add('tv-shared-arrow');
       root.querySelector(next)?.classList.add('tv-shared-arrow');
       const buttons=[...root.querySelectorAll(tabs)];
       const keepChipVisible=()=>{
         const selected=buttons.find(x=>x.classList.contains('active')||x.getAttribute('aria-selected')==='true');
         if(!selected)return;
         const left=selected.offsetLeft-rail.offsetLeft;
         if(left<rail.scrollLeft||left+selected.offsetWidth>rail.scrollLeft+rail.clientWidth)
           rail.scrollTo({left:Math.max(0,left-(rail.clientWidth-selected.offsetWidth)/2),behavior:reduced.matches?'instant':'smooth'});
       };
       buttons.forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(keepChipVisible)));
       root.querySelector(prev)?.addEventListener('click',()=>setTimeout(keepChipVisible,60));
       root.querySelector(next)?.addEventListener('click',()=>setTimeout(keepChipVisible,60));
       const observer=new MutationObserver(()=>requestAnimationFrame(keepChipVisible));
       buttons.forEach(button=>observer.observe(button,{attributes:true,attributeFilter:['class','aria-selected']}));
       keepChipVisible();
     }
     if(root.id==='networking'){
       const track=root.querySelector('.network-carousel-track');
       track?.classList.add('tv-shared-panel');
       const slides=[...root.querySelectorAll('.network-event-slide')];
       slides.forEach((slide,i)=>{
         const header=slide.querySelector('.seo-event-header');
         if(!header)return;
         const tag=header.querySelector('.seo-event-label');
         const eyebrow=header.querySelector('.eyebrow');
         if(tag&&eyebrow){
           const saved=tag.textContent.trim();
           eyebrow.textContent=String(i+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0')+' · '+saved;
           tag.remove();
         }
       });
       // The existing event engine owns chip and event transitions.
       root.addEventListener('keydown',event=>{
         if(!['ArrowUp','ArrowDown'].includes(event.key))return;
         if(event.target.closest('input,textarea,select,[contenteditable=true]'))return;
         event.preventDefault();event.stopPropagation();
         root.querySelector(event.key==='ArrowDown'?'.network-next':'.network-prev')?.click();
       },true);
     }else{
       root.querySelector('.hobby-carousel-track')?.classList.add('tv-shared-panel');
     }
     root.querySelectorAll('.photo-carousel-rail').forEach(enhancement);
   });
   // Number keys select the six Networking events while that TV channel is visible.
   // Capture at window before the bezel's global 1-9 channel handler.
   window.addEventListener('keydown',event=>{
     if(event.defaultPrevented||event.repeat||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey)return;
     const network=document.getElementById('networking');
     if(!network?.closest('.tv-page.is-active')||event.target.closest('dialog,input,textarea,select,[contenteditable]'))return;
     const index=Number(event.key)-1;
     if(!Number.isInteger(index)||index<0||index>=6)return;
     const target=network.querySelectorAll('.network-carousel-tabs button')[index];
     if(!target)return;
     event.preventDefault();event.stopImmediatePropagation();
     target.click();
   },true);
   // Channel moves original DOM nodes. Activate an unseen rail on the new channel.
   document.addEventListener('portfolio:channel-change',()=>{
     pages.forEach(p=>p.root?.querySelectorAll('.photo-carousel-rail').forEach(enhancement));
   });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',activate,{once:true});
 else activate();
})();
