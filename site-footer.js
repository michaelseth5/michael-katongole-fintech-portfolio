'use strict';
/* Reusable footer injected at the bottom of every non-Home TV page.
   Classic mobile has one scrolling document, so place the same component
   after each top-level page section. Never fabricate social URLs. */
(()=>{
  const main=document.getElementById('main-content');
  if(!main)return;

  const icons={
    email:'<path d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2 9 6 9-6H3zm18 2.3-9 6-9-6V17h18V9.3z"/>',
    github:'<path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.12c-3.13.68-3.8-1.33-3.8-1.33-.51-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.85.76 2.13 1.05.35-.62.82-1.04 1.36-1.27-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.32-2.64 5.26-5.15 5.54.83.72 1.51 2.11 1.51 4.26v1.77c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8z"/>',
    linkedin:'<path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.86-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45z"/>'
  };
  const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+icons[name]+'</svg>';
  const template=document.createElement('template');
  template.innerHTML=`
    <footer class="mk-site-footer" role="contentinfo">
      <div class="mk-footer-inner">
        <span class="mk-footer-copy">© 2026 Michael Katongole</span>
        <nav class="mk-footer-nav" aria-label="Footer navigation">
          <a href="#home">Home</a>
          <a href="#experience">Experience</a>
          <a href="#project-details">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#hobbies">Hobbies</a>
          <a href="#contact">Contact</a>
        </nav>
        <div class="mk-footer-icons" aria-label="Social profiles">
          <a href="mailto:michaelkatongole5@gmail.com" aria-label="Email Michael Katongole">${icon('email')}</a>
          <a href="https://github.com/michaelseth5" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile (opens in new tab)">${icon('github')}</a>
          <a href="https://www.linkedin.com/in/michael-k-65b1a8222/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in new tab)">${icon('linkedin')}</a>
        </div>
      </div>
    </footer>`;

  function addFooter(page,key){
    if(!page || key==='home' || page.querySelector(':scope > .mk-site-footer'))return;
    const footer=template.content.firstElementChild.cloneNode(true);
    footer.dataset.footerPage=key;
    page.appendChild(footer);
  }

  function install(){
    const pages=[...main.querySelectorAll(':scope > .tv-page')];
    if(pages.length){
      for(const page of pages){
        const key=(page.dataset.channelName||'').trim().toLowerCase();
        if(key==='contact'){
          /* Keep the existing rotating quotes, and put the footer last. */
          addFooter(page,'contact');
        }else addFooter(page,key);
      }
      return;
    }
    /* Classic mobile: each section acts as a page in one scroll document. */
    const sections=[
      ['experience','experience'],['project-details','projects'],
      ['skills','skills'],['achievements','milestones'],
      ['networking','networking'],['listening-reading','reading'],
      ['hobbies','hobbies'],['contact','contact']
    ];
    const quotes=document.querySelector('.mk-footer-quotes');
    const contact=document.getElementById('contact');
    if(quotes && contact && quotes.parentElement!==main){
      contact.after(quotes);
    }
    sections.forEach(([id,key])=>{
      const section=document.getElementById(id);
      if(!section || section.closest('.tv-page'))return;
      if(id==='achievements' && section.closest('#experience'))return;
      const footer=template.content.firstElementChild.cloneNode(true);
      footer.dataset.footerPage=key;
      if(key==='contact' && quotes?.parentElement===main)quotes.after(footer);
      else section.after(footer);
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
