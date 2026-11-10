'use strict';
/* Sport-card reveal and tap state only; the existing photo carousel is untouched. */
(() => {
 const grid=document.querySelector('#hobbies .sports-showcase .sports-emoji-grid');
 if(!grid)return;
 const cards=[...grid.querySelectorAll('.sports-emoji-card')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 cards.forEach((card,i)=>{
   card.style.setProperty('--sport-index',i);
   card.addEventListener('click',()=>{
     const next=card.getAttribute('aria-pressed')!=='true';
     cards.forEach(item=>{item.classList.remove('is-engaged');item.setAttribute('aria-pressed','false')});
     if(next){card.classList.add('is-engaged');card.setAttribute('aria-pressed','true')}
   });
 });
 const reveal=()=>cards.forEach(card=>card.classList.add('is-visible'));
 if(reduced || !('IntersectionObserver' in window)){reveal();return;}
 const observer=new IntersectionObserver(entries=>{
   if(entries.some(item=>item.isIntersecting)){reveal();observer.disconnect()}
 },{threshold:.08});
 observer.observe(grid);
})();
