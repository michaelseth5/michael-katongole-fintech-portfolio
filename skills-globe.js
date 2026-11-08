'use strict';

/* Interactive 2D projection of a 3D wireframe skills sphere; no framework required. */
(() => {
  const host = document.getElementById('mk-skills-visual');
  const canvas = document.getElementById('mk-skills-wireframe');
  const layer = document.getElementById('mk-skills-logos');
  if (!host || !canvas || !layer) return;

  const context = canvas.getContext('2d');
  if (!context) return;
  const radians = Math.PI / 180;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const logos = [
    ['Python', 'python', 'Languages', 26, -65],
    ['React', 'react', 'Frontend', -10, 40],
    ['PostgreSQL', 'postgresql', 'Databases', -35, 144],
    ['Git', 'git', 'Developer tools', -57, 245],
    ['TypeScript', 'typescript', 'Languages', 45, 90],
    ['JavaScript', 'javascript', 'Languages', 8, 188],
    ['Next.js', 'nextjs', 'Frontend', -12, 283],
    ['Docker', 'docker', 'Infrastructure', -55, 342],
    ['Tailwind CSS', 'tailwindcss', 'Frontend', -5, 355],
    ['FastAPI', 'fastapi', 'Backend', 55, 260],
    ['PyTorch', 'pytorch', 'Machine learning', 62, 185],
    ['Node.js', 'nodejs', 'Backend', 4, 118]
  ];

  const defaults = logos.map(([, , , latitude, longitude]) => ({
    latitude: latitude * radians,
    longitude: longitude * radians
  }));
  let width = 0;
  let height = 0;
  let yaw = .65;
  let pitch = -.22;
  let lastFrame = 0;
  let activePointer = null;
  let pointerMoved = false;
  let automatic = !reducedMotion;
  let hovering = false;
  let focusInside = false;
  let frame = 0;

  host.setAttribute('tabindex', '0');
  host.setAttribute('role', 'region');
  host.setAttribute('aria-label',
    'Interactive skills globe. Drag or swipe to rotate. Use arrow keys to rotate. Use Shuffle to rearrange logos.');

  const tools = document.createElement('div');
  tools.className = 'mk-skills-tools';
  tools.innerHTML =
    '<button type="button" data-action="shuffle" aria-label="Shuffle skill logo positions">Shuffle</button>' +
    '<button type="button" data-action="reset" aria-label="Reset skills globe to original view">Reset</button>' +
    '<button type="button" data-action="motion" aria-label="Toggle globe auto rotation">' +
      (automatic ? 'Pause' : 'Play') + '</button>';
  const description = document.createElement('p');
  description.className = 'mk-skills-hint';
  description.textContent = 'Drag to rotate · tap a logo · shuffle the layout';
  const selection = document.createElement('p');
  selection.className = 'mk-skills-selection';
  selection.setAttribute('role', 'status');
  selection.setAttribute('aria-live', 'polite');
  selection.textContent = 'Explore my tech stack';
  host.append(tools, description, selection);

  const items = logos.map(([name, asset, group], index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mk-skill-particle';
    button.setAttribute('aria-label', name + ' · ' + group);
    button.title = name + ' · ' + group;

    const holder = document.createElement('span');
    holder.className = 'mk-icon';
    const image = document.createElement('img');
    image.src = 'assets/skills/' + asset + '.svg';
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 40;
    image.height = 40;
    holder.append(image);

    const label = document.createElement('span');
    label.className = 'mk-logo-text';
    label.textContent = name;
    button.append(holder, label);
    button.addEventListener('click', () => {
      if (pointerMoved) return;
      layer.querySelectorAll('.mk-skill-particle.is-selected')
        .forEach(other => other.classList.remove('is-selected'));
      button.classList.add('is-selected');
      selection.textContent = name + ' · ' + group;
    });
    layer.append(button);
    return {element: button, name, group,
      latitude: defaults[index].latitude,
      longitude: defaults[index].longitude};
  });

  function point(latitude, longitude) {
    return {x: Math.cos(latitude) * Math.cos(longitude),
      y: Math.sin(latitude), z: Math.cos(latitude) * Math.sin(longitude)};
  }
  function measure() {
    const rect = host.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (!width || !height) return;
    const dpi = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpi);
    canvas.height = Math.round(height * dpi);
    context.setTransform(dpi, 0, 0, dpi, 0, 0);
    render(performance.now());
  }
  function project(vector, radius, cx, cy) {
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const x = vector.x * cosYaw - vector.z * sinYaw;
    const depth = vector.x * sinYaw + vector.z * cosYaw;
    const y = vector.y * cosPitch - depth * sinPitch;
    const z = vector.y * sinPitch + depth * cosPitch;
    return {x: cx + x * radius, y: cy - y * radius, z};
  }
  function render(now) {
    if (!width || !height) return;
    if (automatic && !reducedMotion && !hovering && !focusInside && activePointer === null && lastFrame) {
      yaw += Math.min(70, now - lastFrame) * .00012;
    }
    lastFrame = now;
    const radius = Math.min(width * .31, height * .405, 213);
    const cx = width * .5;
    const cy = height * .5;
    const coords = vector => project(vector, radius, cx, cy);
    context.clearRect(0, 0, width, height);
    const gradient = context.createRadialGradient(
      cx - radius * .18, cy - radius * .25, radius * .08,
      cx, cy, radius * 1.2);
    gradient.addColorStop(0, 'rgba(225,229,252,.35)');
    gradient.addColorStop(.65, 'rgba(235,238,254,.1)');
    gradient.addColorStop(1, 'rgba(245,247,255,0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(cx, cy, radius * 1.3, 0, 2 * Math.PI);
    context.fill();

    function line(points, alpha) {
      let previous = null;
      for (const position of points) {
        const next = coords(position);
        if (previous) {
          context.beginPath();
          context.moveTo(previous.x, previous.y);
          context.lineTo(next.x, next.y);
          context.strokeStyle = next.z + previous.z < 0
            ? 'rgba(171,183,218,' + (alpha * .42) + ')'
            : 'rgba(158,174,215,' + alpha + ')';
          context.lineWidth = .7;
          context.stroke();
        }
        previous = next;
      }
    }
    for (let index = -7; index <= 7; index++) {
      const latitude = index / 8 * Math.PI / 2;
      const points = [];
      for (let step = 0; step <= 82; step++) points.push(point(latitude, 2 * Math.PI * step / 82));
      line(points, .36);
    }
    for (let index = 0; index < 22; index++) {
      const points = [];
      for (let step = 0; step <= 60; step++)
        points.push(point(-Math.PI / 2 + step * Math.PI / 60, index * Math.PI / 11));
      line(points, .33);
    }
    for (let index = 0; index < 12; index++) {
      const points = [];
      for (let step = 0; step <= 130; step++) {
        const latitude = -Math.PI / 2 + step * Math.PI / 130;
        points.push(point(latitude, index * Math.PI / 6 + latitude * .72));
      }
      line(points, .16);
    }
    context.strokeStyle = 'rgba(151,170,211,.23)';
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.stroke();

    for (const item of items) {
      const position = coords(point(item.latitude, item.longitude));
      const depth = (position.z + 1) / 2;
      item.element.style.left = position.x + 'px';
      item.element.style.top = position.y + 'px';
      item.element.style.opacity = .35 + .65 * depth;
      item.element.style.zIndex = depth > .5 ? '3' : '1';
      item.element.style.transform = 'translate(-50%,-50%) scale(' + (.7 + .4 * depth) + ')';
    }
  }
  function animate(now) {
    render(now);
    frame = requestAnimationFrame(animate);
  }

  host.addEventListener('pointerdown', event => {
    if (event.target.closest('.mk-skills-tools') || event.target.closest('.mk-skill-particle')) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    activePointer = {id: event.pointerId, x: event.clientX, y: event.clientY};
    pointerMoved = false;
    host.classList.add('is-dragging');
    host.setPointerCapture(event.pointerId);
  });
  host.addEventListener('pointermove', event => {
    if (!activePointer || activePointer.id !== event.pointerId) return;
    const deltaX = event.clientX - activePointer.x;
    const deltaY = event.clientY - activePointer.y;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 2) pointerMoved = true;
    yaw += deltaX * .007;
    pitch = Math.max(-1.1, Math.min(1.1, pitch + deltaY * .006));
    activePointer.x = event.clientX;
    activePointer.y = event.clientY;
    if (reducedMotion) render(performance.now());
  });
  function endDrag(event) {
    if (!activePointer || activePointer.id !== event.pointerId) return;
    activePointer = null;
    host.classList.remove('is-dragging');
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
    // Prevent a drag gesture from accidentally activating a logo.
    if (pointerMoved) setTimeout(() => { pointerMoved = false; }, 0);
  }
  host.addEventListener('pointerup', endDrag);
  host.addEventListener('pointercancel', endDrag);
  host.addEventListener('pointerenter', () => { hovering = true; });
  host.addEventListener('pointerleave', () => { hovering = false; });
  host.addEventListener('focusin', () => { focusInside = true; });
  host.addEventListener('focusout', event => {
    if (!host.contains(event.relatedTarget)) focusInside = false;
  });
  host.addEventListener('keydown', event => {
    if (event.target.closest('.mk-skills-tools') ||
        event.target.classList.contains('mk-skill-particle')) return;
    const key = event.key;
    if (key !== 'ArrowLeft' && key !== 'ArrowRight' &&
        key !== 'ArrowUp' && key !== 'ArrowDown') return;
    event.preventDefault();
    if (key === 'ArrowLeft') yaw -= .16;
    if (key === 'ArrowRight') yaw += .16;
    if (key === 'ArrowUp') pitch = Math.max(-1.1, pitch - .12);
    if (key === 'ArrowDown') pitch = Math.min(1.1, pitch + .12);
    if (reducedMotion) render(performance.now());
  });
  tools.addEventListener('click', event => {
    const action = event.target.closest('button')?.dataset.action;
    if (action === 'shuffle') {
      const offset = Math.random() * Math.PI * 2;
      const count = items.length;
      items.forEach((item, index) => {
        const fraction = (index + .5) / count;
        item.latitude = Math.asin(1 - 2 * fraction);
        item.longitude = index * Math.PI * (3 - Math.sqrt(5)) + offset;
      });
      selection.textContent = 'Skills rearranged · drag to explore';
    } else if (action === 'reset') {
      items.forEach((item, index) => {
        item.latitude = defaults[index].latitude;
        item.longitude = defaults[index].longitude;
        item.element.classList.remove('is-selected');
      });
      yaw = .65;
      pitch = -.22;
      selection.textContent = 'Original layout restored';
    } else if (action === 'motion') {
      automatic = !automatic;
      event.target.textContent = automatic ? 'Pause' : 'Play';
      event.target.setAttribute('aria-pressed', String(automatic));
      selection.textContent = automatic ? 'Auto rotation on' : 'Auto rotation paused';
    }
    if (reducedMotion) render(performance.now());
  });
  tools.querySelector('[data-action="motion"]').setAttribute('aria-pressed', String(automatic));
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(host);
  else window.addEventListener('resize', measure, {passive: true});
  measure();
  if (!reducedMotion) frame = requestAnimationFrame(animate);
})();
