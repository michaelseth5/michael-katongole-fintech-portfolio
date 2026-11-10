'use strict';
/* One album viewer for Hobbies and Networking. Existing captions and images are
   read from the authored DOM; no article text or links are changed. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const roots = ['hobbies', 'networking'].map(id => document.getElementById(id)).filter(Boolean);
  if (!roots.length) return;
  const galleries = new Map();
  let lightbox = null;
  let openGallery = null;
  let restoreFocus = null;
  const twodigit = n => String(n).padStart(2, '0');
  const clamp = (value, max) => (value + max) % max;

  function createButton(cls, title, symbol) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.setAttribute('aria-label', title);
    b.textContent = symbol;
    return b;
  }
  function imageSource(img) {
    return img?.getAttribute('data-deferred-src') || img?.getAttribute('src') || '';
  }
  function ensureLightbox() {
    if (lightbox) return;
    lightbox = document.createElement('dialog');
    lightbox.className = 'ug-lightbox';
    lightbox.setAttribute('aria-label', 'Photo viewer');
    lightbox.innerHTML = '<div class="ug-lightbox-surface"><button class="ug-lightbox-close" aria-label="Close photo viewer" type="button">✕</button><div class="ug-lightbox-picture"><img alt="" width="1200" height="800" /></div><div class="ug-lightbox-bar"><button class="ug-lightbox-prev" type="button" aria-label="Previous photo">←</button><span class="ug-lightbox-count" aria-live="polite"></span><button class="ug-lightbox-next" type="button" aria-label="Next photo">→</button><button class="ug-lightbox-zoom" type="button" aria-label="Zoom image" aria-pressed="false">⌕</button></div><div class="ug-lightbox-caption"></div></div>';
    document.body.appendChild(lightbox);
    lightbox.querySelector('.ug-lightbox-close').addEventListener('click', () => lightbox.close());
    lightbox.querySelector('.ug-lightbox-prev').addEventListener('click', () => openGallery?.step(-1));
    lightbox.querySelector('.ug-lightbox-next').addEventListener('click', () => openGallery?.step(1));
    const zoom = () => {
      const next = !lightbox.classList.contains('is-zoomed');
      lightbox.classList.toggle('is-zoomed', next);
      lightbox.querySelector('.ug-lightbox-zoom').setAttribute('aria-pressed', String(next));
    };
    lightbox.querySelector('.ug-lightbox-zoom').addEventListener('click', zoom);
    lightbox.querySelector('.ug-lightbox-picture').addEventListener('click', zoom);
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('close', () => {
      lightbox.classList.remove('is-zoomed');
      lightbox.querySelector('.ug-lightbox-zoom').setAttribute('aria-pressed', 'false');
      restoreFocus?.focus({preventScroll: true});
      openGallery = null; restoreFocus = null;
    });
    lightbox.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault(); openGallery?.step(event.key === 'ArrowRight' ? 1 : -1);
      }
      if (event.key === 'Tab') {
        const focusables = [...lightbox.querySelectorAll('button:not([disabled])')];
        if (!focusables.length) return;
        const current = focusables.indexOf(document.activeElement);
        if (event.shiftKey && current <= 0) {
          event.preventDefault(); focusables.at(-1).focus();
        } else if (!event.shiftKey && current === focusables.length - 1) {
          event.preventDefault(); focusables[0].focus();
        }
      }
    });
  }
  function setupAlbum(shell, root) {
    if (galleries.has(shell)) return;
    const rail = shell.querySelector('.photo-carousel-rail');
    if (!rail) return;
    const frames = [...rail.querySelectorAll(':scope > figure')].map(figure => {
      const img = figure.querySelector('img');
      if (!img) return null;
      return {src: imageSource(img), alt: img.getAttribute('alt') || '', caption: figure.querySelector('figcaption')?.innerHTML || ''};
    }).filter(x => x?.src);
    if (!frames.length) return;
    ensureLightbox();
    const art = !!shell.closest('.art-showcase');
    const album = document.createElement('div');
    album.className = 'ug-album';
    album.setAttribute('role', 'region');
    album.setAttribute('aria-roledescription', 'carousel');
    album.setAttribute('aria-label', rail.getAttribute('aria-label') || 'Photo carousel');
    album.tabIndex = 0;
    const stage = document.createElement('div');
    stage.className = 'ug-stage';
    const image = document.createElement('img');
    image.className = 'ug-photo'; image.width = 1200; image.height = 800;
    image.loading = 'lazy'; image.decoding = 'async';
    const caption = document.createElement('div'); caption.className = 'ug-caption';
    const prev = createButton('ug-prev', 'Previous photo', '←');
    const next = createButton('ug-next', 'Next photo', '→');
    const open = createButton('ug-open', 'Open photo viewer', '⤢');
    stage.append(image, caption, prev, next, open);
    const thumbnails = document.createElement('div'); thumbnails.className = 'ug-thumbnails';
    thumbnails.setAttribute('aria-label', 'Choose a photo');
    const thumbButtons = frames.map((frame, i) => {
      const button = createButton('ug-thumb', `View photo ${i + 1} of ${frames.length}`, '');
      const thumbImage = document.createElement('img');
      thumbImage.alt = ''; thumbImage.width = 84; thumbImage.height = 58;
      thumbImage.loading = 'lazy'; thumbImage.decoding = 'async';
      thumbImage.dataset.src = frame.src;
      button.appendChild(thumbImage);
      thumbnails.appendChild(button);
      return button;
    });
    // Load thumbnail images only as they approach the visible horizontal strip.
    // This avoids blank cards while retaining lazy loading for long albums.
    const thumbObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const img = entry.target.querySelector('img[data-src]');
            if (img && !img.hasAttribute('src')) img.src = img.dataset.src;
            thumbObserver.unobserve(entry.target);
          });
        }, {root:thumbnails,rootMargin:'0px 160px'})
      : null;
    thumbButtons.forEach(button => {
      if (thumbObserver) thumbObserver.observe(button);
      else button.querySelector('img').src = button.querySelector('img').dataset.src;
    });
    const footer = document.createElement('div');footer.className = 'ug-footer';
    const count = document.createElement('span');count.className = 'ug-count';count.setAttribute('aria-live', 'polite');
    const progress = document.createElement('div');progress.className = 'ug-progress';progress.setAttribute('aria-hidden', 'true');
    const progressFill = document.createElement('span');progress.appendChild(progressFill);
    footer.append(count, progress);
    album.append(stage, thumbnails, footer);
    shell.appendChild(album);
    let current = 0;
    let dragX = null;
    let hasDragged = false;
    let pending = null;
    function preloadAdjacent(index) {
      // Avoid prefetching images for categories that are not visible yet.
      const parentSlide = shell.closest('.hobby-slide,.network-event-slide');
      if (parentSlide && !parentSlide.classList.contains('ug-current')) return;
      const adjacent = frames[(index + 1) % frames.length];
      if (adjacent && (!pending || pending.src !== adjacent.src)) {
        const img = new Image();img.decoding = 'async';img.src = adjacent.src;pending = img;
      }
      thumbButtons.forEach((button, i) => {
        if (Math.abs(i - index) <= 2 || (index === frames.length - 1 && i === 0)) {
          const target = button.querySelector('img');
          if (!target.hasAttribute('src')) target.src = target.dataset.src;
        }
      });
    }
    function updateLightbox() {
      if (!lightbox?.open || openGallery?.shell !== shell) return;
      const frame = frames[current];
      const img = lightbox.querySelector('.ug-lightbox-picture img');
      img.src = frame.src; img.alt = frame.alt;
      lightbox.querySelector('.ug-lightbox-caption').innerHTML = frame.caption;
      lightbox.querySelector('.ug-lightbox-count').textContent = `${twodigit(current + 1)} / ${twodigit(frames.length)}`;
    }
    function show(index) {
      current = clamp(index, frames.length);
      const frame = frames[current];
      stage.style.setProperty('--ug-background', `url(${JSON.stringify(frame.src)})`);
      stage.classList.toggle('is-art', art);
      stage.classList.remove('is-portrait');
      image.onload = () => {
        if (image.naturalHeight > image.naturalWidth * 1.05) stage.classList.add('is-portrait');
      };
      image.src = frame.src; image.alt = frame.alt;
      caption.innerHTML = frame.caption;
      caption.title = caption.textContent.trim();
      count.textContent = `${twodigit(current + 1)} / ${twodigit(frames.length)}`;
      progressFill.style.width = `${(current + 1) * 100 / frames.length}%`;
      thumbButtons.forEach((b, i) => {
        b.classList.toggle('is-active', i === current);
        b.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
      thumbButtons[current]?.scrollIntoView({block: 'nearest', inline: 'nearest', behavior: reduce.matches ? 'instant' : 'smooth'});
      preloadAdjacent(current);
      updateLightbox();
    }
    function step(n) {show(current + n);}
    function openViewer() {
      restoreFocus = document.activeElement;
      openGallery = {step, shell};
      updateLightbox();
      if (!lightbox.open) lightbox.showModal();
      updateLightbox();
      lightbox.querySelector('.ug-lightbox-close').focus({preventScroll: true});
    }
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    open.addEventListener('click', openViewer);
    image.addEventListener('click', openViewer);
    thumbButtons.forEach((b, i) => b.addEventListener('click', () => show(i)));
    album.addEventListener('keydown', event => {
      if (event.target.closest('button') || lightbox.open) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();event.stopPropagation();step(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    stage.addEventListener('pointerdown', event => {
      if (event.target.closest('button')) return;
      dragX = event.clientX;hasDragged = false;
    });
    stage.addEventListener('pointerup', event => {
      if (dragX === null || event.target.closest('button')) return;
      const distance = event.clientX - dragX;dragX = null;
      if (Math.abs(distance) > 45) {hasDragged = true;step(distance < 0 ? 1 : -1);}
    });
    image.addEventListener('click', event => {
      if (hasDragged) {event.stopImmediatePropagation();hasDragged = false;}
    }, true);
    stage.addEventListener('pointercancel', () => {dragX = null;});
    shell.classList.add('ug-ready');
    galleries.set(shell, {show,step,frames,prefetch:()=>preloadAdjacent(current)});
    show(0);
  }
  function setupChips(root, chipsSelector, buttonsSelector, itemSelector) {
    const row = root.querySelector(chipsSelector);
    const buttons = [...root.querySelectorAll(buttonsSelector)];
    const items = [...root.querySelectorAll(itemSelector)];
    if (!row || !buttons.length || !items.length) return;
    const rail = buttons[0].parentElement;
    row.classList.add('ug-chip-row');rail.classList.add('ug-chip-rail');
    // Existing previous/next buttons for album changes are replaced by scroll-only
    // arrows, shown solely when the tab strip is actually overflowing.
    for (const b of [...row.children]) if (b !== rail) b.classList.add('ug-legacy-chip-arrow');
    const left = createButton('ug-chip-scroll ug-chip-scroll-prev', 'Scroll categories left', '←');
    const right = createButton('ug-chip-scroll ug-chip-scroll-next', 'Scroll categories right', '→');
    row.prepend(left);row.append(right);
    const sync = () => {
      const activeIndex = buttons.findIndex(b => b.getAttribute('aria-selected') === 'true' || b.classList.contains('active'));
      const index = Math.max(0, activeIndex);
      items.forEach((item, i) => {
        const active = i === index;
        item.classList.toggle('ug-current', active);
        item.setAttribute('aria-hidden', String(!active));
        // Individual gallery controls are inaccessible in inactive albums.
        if (active) {
          item.removeAttribute('inert');
          const gallery = galleries.get(item.querySelector('.photo-carousel-shell'));
          gallery?.prefetch();
        } else item.setAttribute('inert', '');
      });
      const selected = buttons[index];
      if (selected && (rail.scrollWidth > rail.clientWidth + 2)) {
        selected.scrollIntoView({inline: 'nearest', block: 'nearest', behavior: reduce.matches ? 'instant' : 'smooth'});
      }
      const overflows = rail.scrollWidth > rail.clientWidth + 3;
      row.classList.toggle('ug-overflows', overflows);
      left.hidden = !overflows;right.hidden = !overflows;
      if (root.id === 'networking') {
        root.querySelector('.ug-event-number')?.replaceChildren(document.createTextNode(`${twodigit(index + 1)} / ${twodigit(items.length)}`));
      }
    };
    left.addEventListener('click', () => rail.scrollBy({left: -Math.max(180, rail.clientWidth * .6), behavior: reduce.matches ? 'instant' : 'smooth'}));
    right.addEventListener('click', () => rail.scrollBy({left: Math.max(180, rail.clientWidth * .6), behavior: reduce.matches ? 'instant' : 'smooth'}));
    buttons.forEach(b => b.addEventListener('click', () => requestAnimationFrame(sync)));
    const mo = new MutationObserver(() => requestAnimationFrame(sync));
    buttons.forEach(b => mo.observe(b, {attributes:true, attributeFilter:['class','aria-selected']}));
    window.addEventListener('resize', sync, {passive:true});
    root.classList.add('ug-root-ready');
    sync();
  }
  roots.forEach(root => root.querySelectorAll('.photo-carousel-shell').forEach(shell => setupAlbum(shell, root)));
  const hobbies = document.getElementById('hobbies');
  if (hobbies) setupChips(hobbies, '.hobby-carousel-controls', '.hobby-carousel-dots button', '.hobby-carousel-track > article');
  const networking = document.getElementById('networking');
  if (networking) {
    const controls = networking.querySelector('.network-carousel-controls');
    if (controls && !controls.querySelector('.ug-event-number')) {
      const badge = document.createElement('span');badge.className = 'ug-event-number';badge.setAttribute('aria-label','Event number');
      controls.prepend(badge);
    }
    setupChips(networking, '.network-carousel-controls', '.network-carousel-tabs button', '.network-carousel-track > article');
  }
})();