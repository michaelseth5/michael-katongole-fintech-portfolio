/* Mindset photo rotator: preserves original portrait, cycles four uploaded moments. */
(() => {
 const rotator=document.querySelector('#portfolio-intro-grid .mk-mindset-photo-rotator');
 if(!rotator)return;
 const frames=[...rotator.querySelectorAll('.mk-mindset-frame')];
 const next=rotator.querySelector('.mk-mindset-next');
 const indexLabel=rotator.querySelector('.mk-mindset-index');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let current=0,visible=true,hovered=false,focused=false;
 function show(index){
  current=(index+frames.length)%frames.length;
  frames.forEach((frame,i)=>frame.classList.toggle('is-active',i===current));
  indexLabel.textContent=String(current+1).padStart(2,'0')+' / '+String(frames.length).padStart(2,'0');
 }
 next.addEventListener('click',()=>show(current+1));
 rotator.addEventListener('mouseenter',()=>hovered=true);
 rotator.addEventListener('mouseleave',()=>hovered=false);
 rotator.addEventListener('focusin',()=>focused=true);
 rotator.addEventListener('focusout',e=>{if(!rotator.contains(e.relatedTarget))focused=false});
 if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>visible=entries[0]?.isIntersecting??false,{threshold:.05}).observe(rotator);
 }
 setInterval(()=>{
  if(!reduced.matches&&visible&&!hovered&&!focused&&!document.hidden)show(current+1);
 },4700);
 show(0);

 // Preserve all six original images and their order. Enhance only the browser
 // presentation: gentle sharpening, high-quality upscale, no generative details.
 // On unsupported browsers, the untouched originals remain the fallback.
 function enhanceOriginal(source, crop, onReady) {
  const original=new Image();
  original.decoding='async';
  original.onload=()=>{
   try{
    const rect=crop||[0,0,original.naturalWidth,original.naturalHeight];
    const [sx,sy,sw,sh]=rect;
    if(sw<1||sh<1)return;
    const base=document.createElement('canvas');
    base.width=Math.round(sw);base.height=Math.round(sh);
    const b=base.getContext('2d',{willReadFrequently:true});
    if(!b)return;
    b.drawImage(original,sx,sy,sw,sh,0,0,base.width,base.height);
    const src=b.getImageData(0,0,base.width,base.height);
    const pixels=src.data,copy=new Uint8ClampedArray(pixels);
    const w=base.width,h=base.height,strength=.14;
    for(let y=1;y<h-1;y++){
     for(let x=1;x<w-1;x++){
      const i=(y*w+x)*4;
      for(let k=0;k<3;k++){
       const nearby=(copy[i-4+k]+copy[i+4+k]+copy[i-w*4+k]+copy[i+w*4+k])/4;
       pixels[i+k]=Math.min(255,Math.max(0,copy[i+k]+(copy[i+k]-nearby)*strength));
      }
     }
    }
    b.putImageData(src,0,0);
    const out=document.createElement('canvas');
    out.width=Math.round(sw*2.5);out.height=Math.round(sh*2.5);
    const ctx=out.getContext('2d');
    if(!ctx)return;
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    ctx.drawImage(base,0,0,out.width,out.height);
    onReady(out.toDataURL('image/png'));
   }catch(e){/* Keep the original photo if enhancement cannot run. */}
  };
  original.onerror=()=>{};
  original.src=source;
 }
 // The first two images are standalone originals.
 frames.slice(0,2).forEach(frame=>{
  const source=frame.getAttribute('src');
  if(source)enhanceOriginal(source,null,url=>{frame.src=url;});
 });
 // The last four images are unchanged quadrants of the original 2x2 sprite.
 const sprite=new Image();
 sprite.onload=()=>{
  const cellW=Math.floor(sprite.naturalWidth/2);
  const cellH=Math.floor(sprite.naturalHeight/2);
  frames.slice(2,6).forEach((frame,i)=>{
   enhanceOriginal('assets/mindset-photo-rotation.webp',
    [(i%2)*cellW,Math.floor(i/2)*cellH,cellW,cellH],url=>{
     frame.style.backgroundImage='url("'+url+'")';
     frame.style.backgroundSize='100% 100%';
     frame.style.backgroundPosition='center';
    });
  });
 };
 sprite.onerror=()=>{};
 sprite.src='assets/mindset-photo-rotation.webp';
})();
