'use strict';

/* Country-level annual merchandise trade. Data is reported, not real-time. */
(() => {
  const mount = document.getElementById('financial-globe');
  if (!mount) return;

  const wrap = mount.parentElement;
  const year = 2024;
  const topConnections = 25;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = {
    globe: null, features: [], countryByCode: new Map(), selected: null,
    flows: [], gdp: null, gdpYear: null, tradeSeq: 0, gdpSeq: 0,
    tradeCache: new Map(), message: ''
  };
  const html = value => String(value).replace(/[&<>"']/g, ch => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[ch]
  ));
  const money = value => {
    if (!Number.isFinite(value)) return 'Not Available';
    if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';
    return '$' + Math.round(value).toLocaleString('en-US');
  };
  const countryCode = f => Number(f.properties.UN_A3);
  const countryName = f => f.properties.ADMIN || f.properties.NAME || 'Unknown country';
  const reportingCode = f => countryCode(f) === 840 ? 842 : countryCode(f);

  const hud = document.createElement('div');
  hud.className = 'gf-hud';
  hud.innerHTML = '<span class="gf-live-dot" aria-hidden="true"></span><strong>GLOBAL TRADE</strong><small>2024 · ANNUAL REPORTED DATA</small>';
  const panel = document.createElement('aside');
  panel.className = 'gf-panel';
  panel.setAttribute('aria-label', 'Selected country trade statistics');
  panel.setAttribute('aria-live', 'polite');
  panel.innerHTML = '<h3>United States of America</h3><p>Loading reported trade figures…</p>';
  const status = document.createElement('div');
  status.className = 'gf-status';
  status.setAttribute('role', 'status');
  status.textContent = 'Loading country borders…';

  const fullscreen = document.createElement('button');
  fullscreen.className = 'gf-expand';
  fullscreen.type = 'button';
  fullscreen.setAttribute('aria-label', 'Expand interactive globe');
  fullscreen.title = 'Expand interactive globe';
  fullscreen.textContent = '⤢';
  wrap.append(hud, panel, status, fullscreen);

  function centroid(feature) {
    let rings = feature.geometry.coordinates;
    while (Array.isArray(rings[0]) && Array.isArray(rings[0][0])) rings = rings[0];
    if (!Array.isArray(rings) || !rings.length) return {lat: 0, lng: 0};
    let x = 0, y = 0, z = 0;
    const step = Math.max(1, Math.floor(rings.length / 120));
    for (let i = 0; i < rings.length; i += step) {
      const longitude = rings[i][0] * Math.PI / 180;
      const latitude = rings[i][1] * Math.PI / 180;
      x += Math.cos(latitude) * Math.cos(longitude);
      y += Math.cos(latitude) * Math.sin(longitude);
      z += Math.sin(latitude);
    }
    return {
      lat: Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI,
      lng: Math.atan2(y, x) * 180 / Math.PI
    };
  }

  function loadLibrary(url) {
    return new Promise((resolve, reject) => {
      if (window.Globe) return resolve();
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = () => reject(new Error('3D visualization library unavailable'));
      document.head.appendChild(script);
    });
  }

  function showPanel() {
    const selected = state.selected;
    if (!selected) {
      panel.innerHTML = '<h3>International merchandise trade</h3><p class="gf-meta">Select a country on the globe</p><p>Routes show annual reported goods trade, not financial transfers.</p>';
      return;
    }
    const imports = state.flows.filter(row => row.flow === 'M' && row.year === year);
    const exports = state.flows.filter(row => row.flow === 'X' && row.year === year);
    const sum = rows => rows.reduce((amount, row) => amount + row.usd, 0);
    const totalImports = sum(imports);
    const totalExports = sum(exports);
    const balance = totalExports - totalImports;
    const isSurplus = balance >= 0;
    const row = (label, value, tone) =>
      '<div class="gf-stat"><span>' + label + '</span><b class="' + (tone || '') + '">' + value + '</b></div>';
    let content = '<h3>' + html(countryName(selected)) + '</h3>' +
      '<p class="gf-meta">UN Comtrade · ' + year + ' · USD</p>';
    content += row('GDP', state.gdp === null ? 'Not Available' : money(state.gdp) +
      ' <small>(' + state.gdpYear + ')</small>');
    if (state.message) {
      content += '<p class="gf-unavailable">' + html(state.message) + '</p>';
    } else if (!state.flows.length) {
      content += '<p class="gf-unavailable">Retrieving reported trade data…</p>';
    } else {
      content += row('Exports', money(totalExports), 'gf-positive');
      content += row('Imports', money(totalImports), 'gf-negative');
      content += row('Reported balance',
        money(Math.abs(balance)) + ' ' + (isSurplus ? 'surplus' : 'deficit'),
        isSurplus ? 'gf-positive' : 'gf-negative');
      const partner = (data, direction) => data
        .slice().sort((a, b) => b.usd - a.usd).slice(0, 3)
        .map(flow => {
          const id = direction === 'from' ? flow.from : flow.to;
          const location = state.countryByCode.get(id);
          return '<li><span>' + html(location ? location.name : (flow.partner || 'Country')) +
            '</span><b>' + money(flow.usd) + '</b></li>';
        }).join('');
      content += '<div class="gf-partners"><strong>Top import origins</strong><ol>' +
        partner(imports, 'from') + '</ol></div>';
      content += '<div class="gf-partners"><strong>Top export destinations</strong><ol>' +
        partner(exports, 'to') + '</ol></div>';
    }
    content += '<div class="gf-legend"><span><i class="gf-dot gf-dot-export"></i>Exports</span>' +
      '<span><i class="gf-dot gf-dot-import"></i>Imports</span></div>';
    content += '<p class="gf-source">Annual goods trade · partial public preview (up to 500 rows). ' +
      'Shown totals cover returned records only, not official national totals. ' +
      'GDP: World Bank' + (state.gdpYear ? ' ' + state.gdpYear : '') + '.</p>';
    panel.innerHTML = content;
    const shortBalance = state.flows.length && !state.message
      ? (isSurplus ? 'rgba(41,210,123,.34)' : 'rgba(255,91,104,.34)')
      : 'rgba(181,151,255,.34)';
    state.globe.polygonCapColor(feature => feature === selected
      ? shortBalance : 'rgba(46,36,88,.14)');
  }

  function drawArcs() {
    if (!state.globe) return;
    const routes = state.flows
      .filter(flow => flow.year === year && flow.usd > 0 &&
        state.countryByCode.has(flow.from) && state.countryByCode.has(flow.to))
      .sort((a, b) => b.usd - a.usd).slice(0, topConnections);
    const max = Math.max(1, ...routes.map(route => route.usd));
    const arcs = routes.map(route => {
      const source = state.countryByCode.get(route.from);
      const dest = state.countryByCode.get(route.to);
      return {
        startLat: source.pos.lat, startLng: source.pos.lng,
        endLat: dest.pos.lat, endLng: dest.pos.lng,
        source: source.name, destination: dest.name,
        usd: route.usd, flow: route.flow
      };
    });
    state.globe.arcsData(arcs)
      .arcColor(route => route.flow === 'X' ? ['#19ca73', '#82f4b3'] : ['#ff5369', '#ff9b9f'])
      .arcStroke(route => .22 + 2 * Math.sqrt(route.usd / max))
      .arcAltitudeAutoScale(.33)
      .arcDashLength(reducedMotion ? 1 : .17)
      .arcDashGap(reducedMotion ? 0 : .62)
      .arcDashAnimateTime(reducedMotion ? 0 : 2100)
      .arcLabel(route => html(route.source) + ' → ' + html(route.destination) +
        '<br><b>' + money(route.usd) + '</b> · reported ' +
        (route.flow === 'X' ? 'exports' : 'imports') + ' · ' + year +
        '<br>UN Comtrade · USD (merchandise trade)');
    status.textContent = state.message || (
      'Drag to rotate · scroll to zoom · ' + arcs.length + ' annual corridors');
  }

  async function getGDP(feature) {
    const sequence = ++state.gdpSeq;
    const iso = feature.properties.ISO_A3;
    if (!/^[A-Z]{3}$/.test(iso)) { state.gdp = null; showPanel(); return; }
    try {
      const response = await fetch('/api/financial?dataset=gdp&country=' +
        encodeURIComponent(iso) + '&year=' + year);
      if (!response.ok) throw new Error('GDP not available');
      const data = await response.json();
      if (sequence !== state.gdpSeq) return;
      state.gdp = Number(data.value) > 0 ? Number(data.value) : null;
      state.gdpYear = Number(data.year) || null;
    } catch {
      if (sequence !== state.gdpSeq) return;
      state.gdp = null;
      state.gdpYear = null;
    }
    if (sequence === state.gdpSeq) showPanel();
  }

  async function getTrade(feature) {
    const sequence = ++state.tradeSeq;
    const code = reportingCode(feature);
    const cacheKey = code + ':' + year;
    state.message = '';
    state.flows = [];
    drawArcs();
    showPanel();
    try {
      let data = state.tradeCache.get(cacheKey);
      if (!data) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 18000);
        try {
          const response = await fetch('/api/financial?dataset=trade&reporter=' +
            encodeURIComponent(code) + '&year=' + year, {signal: controller.signal});
          if (!response.ok) throw new Error('Trade source currently unavailable');
          data = await response.json();
          if (!Array.isArray(data.flows)) throw new Error('Unexpected trade response');
          state.tradeCache.set(cacheKey, data);
        } finally {
          clearTimeout(timeout);
        }
      }
      if (sequence !== state.tradeSeq) return;
      state.flows = data.flows.filter(flow => Number.isFinite(flow.usd) && flow.usd > 0);
      if (!state.flows.length) state.message = 'No reported bilateral records for this country.';
    } catch (error) {
      if (sequence !== state.tradeSeq) return;
      state.flows = [];
      state.message = error.name === 'AbortError'
        ? 'Trade request timed out. Select another country.'
        : 'Trade data temporarily unavailable. Select another country.';
    }
    if (sequence === state.tradeSeq) {
      drawArcs();
      showPanel();
    }
  }

  function selectCountry(feature) {
    state.selected = feature;
    state.message = '';
    state.gdp = null;
    state.gdpYear = null;
    state.globe.pointOfView(Object.assign(centroid(feature), {altitude: 1.72}), 950);
    showPanel();
    if (!Number.isInteger(countryCode(feature)) || countryCode(feature) < 1) {
      ++state.tradeSeq;
      state.flows = [];
      state.message = 'No reporting code available for this country.';
      drawArcs();
      showPanel();
      return;
    }
    getGDP(feature);
    getTrade(feature);
  }

  async function init() {
    try {
      await loadLibrary('https://unpkg.com/globe.gl/dist/globe.gl.min.js');
      const response = await fetch('assets/countries.geojson');
      if (!response.ok) throw new Error('Country geography unavailable');
      const geo = await response.json();
      state.features = geo.features.filter(feature => feature.geometry && feature.properties);
      state.features.forEach(feature => {
        const code = countryCode(feature);
        if (code > 0) state.countryByCode.set(code, {
          name: countryName(feature), pos: centroid(feature)
        });
      });
      if (state.countryByCode.has(840))
        state.countryByCode.set(842, state.countryByCode.get(840));
      state.globe = Globe()(mount)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true).atmosphereColor('#7759bf').atmosphereAltitude(.18)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
        .polygonsData(state.features).polygonAltitude(.009)
        .polygonCapColor('rgba(46,36,88,.14)')
        .polygonSideColor('rgba(35,27,70,.11)')
        .polygonStrokeColor('#a886e5')
        .polygonLabel(feature => '<b>' + html(countryName(feature)) +
          '</b><br>Click to inspect ' + year + ' reported trade')
        .onPolygonClick(selectCountry);
      const controls = state.globe.controls();
      controls.enableDamping = true;
      controls.dampingFactor = .07;
      controls.autoRotate = !reducedMotion;
      controls.autoRotateSpeed = .34;
      state.globe.pointOfView({lat: 30, lng: -45, altitude: 2.3}, 0);
      mount.addEventListener('pointerenter', () => { controls.autoRotate = false; });
      mount.addEventListener('pointerleave', () => { controls.autoRotate = !reducedMotion; });
      mount.addEventListener('pointerdown', () => { controls.autoRotate = false; });
      const resize = () => state.globe.width(mount.clientWidth).height(mount.clientHeight);
      new ResizeObserver(resize).observe(mount);
      resize();
      const usa = state.features.find(feature => countryCode(feature) === 840);
      if (usa) selectCountry(usa);
      else {
        state.message = 'Select a country to inspect reported trade.';
        drawArcs();
      }
    } catch (error) {
      status.textContent = 'Interactive globe unavailable · WebGL or network connection required.';
      mount.innerHTML = '<div class="gf-fallback">Globe unavailable. Your portfolio remains accessible.</div>';
    }
  }

  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await wrap.requestFullscreen();
    } catch {
      status.textContent = 'Fullscreen unavailable in this browser.';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const active = Boolean(document.fullscreenElement);
    fullscreen.textContent = active ? '×' : '⤢';
    fullscreen.title = active ? 'Exit fullscreen' : 'Expand interactive globe';
    fullscreen.setAttribute('aria-label', fullscreen.title);
  });
  init();
})();
