'use strict';
/* Mobile-only Skills icon grid and small-screen audit helpers.
   Desktop remains unchanged. No external library or data request is made here. */
(()=>{
  if(!matchMedia('(max-width:767px)').matches)return;
  const skills=document.getElementById('skills');
  const sphere=document.getElementById('mk-skills-visual');
  if(skills && sphere && !document.getElementById('mk-skills-mobile-grid')){
    const names=[
      ['Python','python'],['SQL','mysql'],['Java','java'],['C++','cplusplus'],
      ['JavaScript','javascript'],['TypeScript','typescript'],['React','react'],
      ['Next.js','nextjs'],['Tailwind CSS','tailwindcss'],['FastAPI','fastapi'],
      ['Flask','flask'],['Node.js','nodejs'],['PostgreSQL','postgresql'],
      ['Docker','docker'],['AWS','aws'],['Pandas','pandas'],
      ['scikit-learn','scikitlearn'],['PyTorch','pytorch'],['Streamlit','streamlit'],
      ['Git','git'],['GitHub','github'],['GitHub Actions','githubactions'],
      ['Jira','jira'],['pytest','pytest'],['Figma','figma'],['Vercel','vercel']
    ];
    const grid=document.createElement('div');
    grid.id='mk-skills-mobile-grid';
    grid.setAttribute('role','group');
    grid.setAttribute('aria-label','Skills and tools');
    const status=document.createElement('p');
    status.className='mk-mobile-skill-status';
    status.setAttribute('aria-live','polite');
    status.textContent='Choose a technology to highlight it.';
    for(const [name,file] of names){
      const button=document.createElement('button');
      button.type='button';
      button.className='mk-mobile-skill';
      button.setAttribute('aria-pressed','false');
      button.setAttribute('aria-label',name);
      const icon=document.createElement('span');
      if(file==='mysql'){
        // SQL has no matching local SVG; use an accessible text mark instead.
        icon.className='mk-mobile-skill-glyph';icon.textContent='DB';
      }else{
        const img=document.createElement('img');
        img.src='assets/skills/'+file+'.svg';
        img.alt='';img.loading='lazy';img.decoding='async';
        img.width=29;img.height=29;
        icon.appendChild(img);
      }
      const text=document.createElement('span');
      text.textContent=name;
      button.append(icon,text);
      button.addEventListener('click',()=>{
        const selected=button.getAttribute('aria-pressed')==='true';
        grid.querySelectorAll('[aria-pressed]').forEach(item=>item.setAttribute('aria-pressed','false'));
        button.setAttribute('aria-pressed',String(!selected));
        status.textContent=selected?'Choose a technology to highlight it.':name+' selected.';
      });
      grid.appendChild(button);
    }
    sphere.replaceWith(grid);
    grid.after(status);
    const legend=skills.querySelector('.mk-skills-legend');
    if(legend)legend.hidden=true;
  }
  /* Prevent portrait/mobile layouts from inheriting inaccessible tab stops on
     inactive desktop-only TV controls when those controls are present. */
  document.querySelectorAll('#home .mk-home-right a,#home .mk-home-right button')
    .forEach(node=>node.setAttribute('tabindex','-1'));
})();
