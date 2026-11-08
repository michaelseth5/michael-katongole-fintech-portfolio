'use strict';

(function(){
  const mount=document.getElementById('financial-globe');
  if(!mount)return;
  const wrap=mount.parentElement;
  const controls=document.createElement('div');controls.className='gf-controls';
  controls.innerHTML='<strong>GLOBAL MERCHANDISE TRADE</strong><label for="gf-mode">Flow category</label><select id="gf-mode"><option value="trade">International merchandise trade</option><option value="in">Reported imports (inflows)</option><option value="out">Reported exports (outflows)</option><option value="fdi">Foreign direct investment</option><option value="portfolio">Portfolio investment</option><option value="remit">Remittances</option><option value="capital">All capital flows</option></select><label for="gf-year">Reporting year</label><select id="gf-year"><option>2023</option><option selected>2024</option><option>2025</option></select><label for="gf-top">Largest connections</label><select id="gf-top"><option>10</option><option selected>25</option><option>50</option><option>100</option></select><label for="gf-min">Minimum USD billions</label><input type="number" id="gf-min" min="0" step="0.5" value="0"><label for="gf-country">Explore country</label><select id="gf-country" aria-label="Select country"><option value="">Choose a country...</option></select><div class="gf-actions"><button id="gf-reset" type="button">Global view</button><button id="gf-fullscreen" type="button">Expand</button><button id="gf-reload" type="button">Refresh</button></div><label class="gf-toggle"><input type="checkbox" id="gf-spin" checked> Auto rotate</label><label class="gf-toggle"><input type="checkbox" id="gf-animate" checked> Animate flows</label>';
  const panel=document.createElement('div');panel.className='gf-panel';panel.innerHTML='<h3>Explore countries</h3><p>Select a country on the globe to inspect its reported trade partners.</p>';
  const status=document.createElement('div');status.className='gf-status';status.textContent='Loading globe geography…';
  wrap.append(controls,panel,status);
  const $=id=>document.getElementById(id);
  const opt={mode:$('gf-mode'),year:$('gf-year'),top:$('gf-top'),min:$('gf-min'),spin:$('gf-spin'),animate:$('gf-animate')};
  const state={globe:null,features:[],lookup:new Map(),selected:null,flows:[],updated:'',loading:false,seq:0,cache:new Map(),countryName:'United States of America',source:'UN Comtrade',gdp:null,gdpYear:null,gdpSeq:0};
  const unsupported=['fdi','portfolio','remit','capital'];
  [...opt.mode.options].forEach(option=>{if(unsupported.includes(option.value)){option.disabled=true;option.textContent+=' (unavailable)';}});
  const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>'$'+(v>=1e12?(v/1e12).toFixed(2)+'T':v>=1e9?(v/1e9).toFixed(2)+'B':v>=1e6?(v/1e6).toFixed(1)+'M':Math.round(v).toLocaleString('en-US'));
  const code=f=>Number(f.properties.UN_A3);
  const name=f=>f.properties.ADMIN||f.properties.NAME||'Unknown country';
  function centroid(feature){
    let p=feature.geometry.coordinates;
    while(Array.isArray(p[0])&&Array.isArray(p[0][0]))p=p[0];
    if(!Array.isArray(p))return {lat:0,lng:0};
    let x=0,y=0,z=0;
    for(let i=0;i<p.length;i+=Math.max(1,Math.floor(p.length/120))){
      const lon=p[i][0]*Math.PI/180,lat=p[i][1]*Math.PI/180;
      x+=Math.cos(lat)*Math.cos(lon);y+=Math.cos(lat)*Math.sin(lon);z+=Math.sin(lat);
    }
    return {lat:Math.atan2(z,Math.sqrt(x*x+y*y))*180/Math.PI,lng:Math.atan2(y,x)*180/Math.PI};
  }
  function loadScript(url){return new Promise((ok,fail)=>{const s=document.createElement('script');s.src=url;s.onload=ok;s.onerror=fail;document.head.appendChild(s);});}
  function pick(feature){
    state.selected=feature;
    $('gf-country').value=String(code(feature));
    state.countryName=name(feature);
    state.gdp=null;state.gdpYear=null;
    fetchGDP(feature);
    state.globe.pointOfView({...centroid(feature),altitude:1.7},800);
    state.globe.polygonCapColor(f=>f===feature?'rgba(178,127,255,.42)':'rgba(60,42,105,.16)');
    if(!Number.isInteger(code(feature))||code(feature)<1){
      state.flows=[];draw();status.textContent='No UN M49 reporting code is available for this country.';return;
    }
    fetchFlows();
  }
  function draw(){
    if(!state.globe)return;
    const f=state.selected,m=opt.mode.value,year=Number(opt.year.value);
    const available=!unsupported.includes(m);
    const good=available?state.flows.filter(x=>x.year===year&&(m==='trade'||(m==='in'?x.flow==='M':x.flow==='X'))&&x.usd>=Math.max(0,Number(opt.min.value)||0)*1e9&&state.lookup.has(x.from)&&state.lookup.has(x.to)).sort((a,b)=>b.usd-a.usd).slice(0,Number(opt.top.value)):[];
    const arcs=good.map(x=>{
      const src=state.lookup.get(x.from),dst=state.lookup.get(x.to);
      return {startLat:src.pos.lat,startLng:src.pos.lng,endLat:dst.pos.lat,endLng:dst.pos.lng,usd:x.usd,flow:x.flow,src:src.name,dst:dst.name};
    });
    const max=Math.max(1,...arcs.map(x=>x.usd));
    state.globe.arcsData(arcs).arcColor(x=>x.flow==='M'?['#b795ff','#8768df']:['#31e3ee','#83f0ff']).arcStroke(x=>.22+1.8*Math.sqrt(x.usd/max))
      .arcAltitudeAutoScale(.38).arcDashLength(opt.animate.checked?.14:1).arcDashGap(opt.animate.checked?.45:0).arcDashAnimateTime(opt.animate.checked?2100:0)
      .arcLabel(x=>escapeHTML(x.src)+' → '+escapeHTML(x.dst)+'<br>'+money(x.usd)+' reported '+(x.flow==='M'?'imports':'exports')+' ('+year+') · UN Comtrade · USD');
    if(!f){panel.innerHTML='<h3>Global globe view</h3><p>Showing available corridors reported by '+escapeHTML(state.countryName)+'. Choose a country for its reported imports and exports.</p><p>These routes are not global totals or real-time transfers.</p>';status.textContent=arcs.length+' corridors · '+year+' · UN Comtrade · '+escapeHTML(state.countryName)+' reporting';return;}
    const incoming=state.flows.filter(x=>x.flow==='M'&&x.year===year);
    const outgoing=state.flows.filter(x=>x.flow==='X'&&x.year===year);
    const total=a=>a.reduce((s,x)=>s+x.usd,0);
    let body='<h3>'+escapeHTML(name(f))+'</h3><p>UN Comtrade · '+year+' · USD</p>';
    body+='<p>GDP (current US$): <b>'+(state.gdp?money(state.gdp):'Not Available')+'</b>'+(state.gdpYear?' <small>('+state.gdpYear+', World Bank)</small>':'')+'</p>';
    if(!available){
      body+='<p><b>Data unavailable.</b> This source contains merchandise trade, not '+escapeHTML(opt.mode.selectedOptions[0].text)+'.</p>';
    }else if(!state.flows.length){
      body+='<p><b>Data unavailable.</b> No reporter-level bilateral records were returned.</p>';
    }else{
      body+='<p>Reported imports: <b>'+money(total(incoming))+'</b></p><p>Reported exports: <b>'+money(total(outgoing))+'</b></p><p>Reported trade balance (exports − imports): <b>'+money(Math.abs(total(outgoing)-total(incoming)))+(total(outgoing)>=total(incoming)?' surplus':' deficit')+'</b></p>';
      const partnerList=(arr,side)=>arr.slice().sort((a,b)=>b.usd-a.usd).slice(0,5).map(x=>{
        const p=state.lookup.get(side==='from'?x.from:x.to);
        return '<li>'+escapeHTML(p?.name||x.partner||'Country')+' · '+money(x.usd)+'</li>';
      }).join('');
      body+='<p><b>Top import origins (reported)</b></p><ol>'+partnerList(incoming,'from')+'</ol>';
      body+='<p><b>Top export destinations (reported)</b></p><ol>'+partnerList(outgoing,'to')+'</ol>';
    }
    body+='<div class="gf-legend"><span><i class="gf-dot" style="background:#b795ff"></i>Imports</span><span><i class="gf-dot" style="background:#31e3ee"></i>Exports</span></div><p style="font-size:9px;margin-top:8px">UN Comtrade public preview · USD · '+year+'. Partial reporting and up to 500 records; sums are only from the records retrieved, not official national totals. These are merchandise trade values, not money transfers.</p>';
    panel.innerHTML=body;
    status.textContent=available?(arcs.length+' visible corridors · '+escapeHTML(name(f))+' · '+year+' · UN Comtrade annual reports'):'Data unavailable for this flow category · choose merchandise trade';
  }
  async function fetchGDP(feature){
    const seq=++state.gdpSeq;
    const iso=feature.properties.ISO_A3;
    if(!/^[A-Z]{3}$/.test(iso)){state.gdp=null;draw();return;}
    try{
      const response=await fetch('/api/financial?dataset=gdp&country='+encodeURIComponent(iso)+'&year='+opt.year.value);
      if(!response.ok)throw Error('GDP unavailable');
      const result=await response.json();
      if(seq!==state.gdpSeq)return;
      state.gdp=Number(result.value)>0?Number(result.value):null;
      state.gdpYear=result.year||null;
    }catch(e){if(seq!==state.gdpSeq)return;state.gdp=null;state.gdpYear=null;}
    if(seq===state.gdpSeq)draw();
  }
  async function fetchFlows(){
    const selected=state.selected;
    if(!selected)return;
    const seq=++state.seq;
    const m49=code(selected)===840?842:code(selected);
    const year=Number(opt.year.value);
    const key=m49+':'+year;
    state.loading=true;state.flows=[];draw();
    status.textContent='Retrieving UN Comtrade annual records…';
    try{
      let result=state.cache.get(key);
      if(!result){
        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),18000);
        try{
          const response=await fetch('/api/financial?dataset=trade&reporter='+encodeURIComponent(m49)+'&year='+year,{signal:controller.signal});
          if(!response.ok)throw Error('Trade data unavailable (HTTP '+response.status+')');
          result=await response.json();
          if(!Array.isArray(result.flows))throw Error('Unexpected trade response');
          state.cache.set(key,result);
        }finally{clearTimeout(timeout);}
      }
      if(seq!==state.seq)return;
      state.flows=result.flows.filter(x=>Number.isFinite(x.usd)&&x.usd>0);
      state.updated=result.retrievedAt||'';
      state.source=result.source||'UN Comtrade';
      draw();
      if(!state.flows.length)status.textContent='No country-pair trade observations available for '+year+'. Try another year.';
    }catch(err){
      if(seq!==state.seq)return;
      state.flows=[];draw();
      status.textContent=(err.name==='AbortError'?'Data request timed out':err.message)+' · other website sections remain available.';
    }finally{if(seq===state.seq)state.loading=false;}
  }
  async function init(){
    try{
      await loadScript('https://unpkg.com/globe.gl/dist/globe.gl.min.js');
      const response=await fetch('assets/countries.geojson');
      if(!response.ok)throw Error('Geographic dataset unavailable');
      const geo=await response.json();
      state.features=geo.features.filter(f=>f.geometry&&f.properties);
      state.features.forEach(f=>{const c=code(f);if(c>0)state.lookup.set(c,{name:name(f),pos:centroid(f)});});
      const countrySelect=$('gf-country');
      [...state.lookup.entries()].sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,item])=>{if(id===842)return;const o=document.createElement('option');o.value=String(id);o.textContent=item.name;countrySelect.appendChild(o);});
      state.lookup.set(842,state.lookup.get(840)||{name:'United States of America',pos:{lat:39,lng:-98}});
      state.globe=Globe()(mount).backgroundColor('rgba(0,0,0,0)').showAtmosphere(true).atmosphereColor('#6855c4').atmosphereAltitude(.18)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
        .polygonsData(state.features).polygonAltitude(.009).polygonCapColor('rgba(60,42,105,.16)')
        .polygonSideColor('rgba(35,27,70,.12)').polygonStrokeColor('#aa86ff')
        .polygonLabel(f=>'<b>'+escapeHTML(name(f))+'</b><br>Click to inspect annual reported trade')
        .onPolygonClick(f=>pick(f));
      state.globe.controls().enableDamping=true;
      state.globe.controls().dampingFactor=.07;
      state.globe.controls().autoRotate=opt.spin.checked;
      state.globe.controls().autoRotateSpeed=.42;
      state.globe.pointOfView({lat:28,lng:-25,altitude:2.3},0);
      state.globe.onGlobeClick(()=>{});
      mount.addEventListener('pointerenter',()=>{state.globe.controls().autoRotate=false;});
      mount.addEventListener('pointerleave',()=>{state.globe.controls().autoRotate=opt.spin.checked;});
      mount.addEventListener('pointerdown',()=>{state.globe.controls().autoRotate=false;});
      mount.addEventListener('pointerup',()=>{if(!mount.matches(':hover'))state.globe.controls().autoRotate=opt.spin.checked;});
      const ro=new ResizeObserver(()=>state.globe.width(mount.clientWidth).height(mount.clientHeight));ro.observe(mount);
      state.globe.width(mount.clientWidth).height(mount.clientHeight);
      const usa=state.features.find(f=>code(f)===840||name(f)==='United States of America');
      status.textContent='Drag to rotate · scroll to zoom · select a country';
      if(usa)pick(usa);
    }catch(error){status.textContent='Interactive globe unavailable: '+error.message+' · your portfolio remains accessible.';mount.innerHTML='<div style="padding:50px 12px;text-align:center;color:#a69cce">3D globe could not load. Check your connection or browser WebGL support.</div>';}
  }
  for(const el of [opt.mode,opt.top,opt.min,opt.animate])el.addEventListener('change',draw);
  opt.year.addEventListener('change',()=>{if(state.selected)fetchGDP(state.selected);fetchFlows();});
  $('gf-country').addEventListener('change',e=>{const c=Number(e.target.value);const f=state.features.find(f=>code(f)===c);if(f)pick(f);});
  opt.spin.addEventListener('change',()=>{if(state.globe)state.globe.controls().autoRotate=opt.spin.checked;});
  $('gf-reload').addEventListener('click',fetchFlows);
  $('gf-reset').addEventListener('click',()=>{if(!state.globe)return;state.selected=null;state.gdpSeq++;$('gf-country').value='';state.globe.polygonCapColor('rgba(60,42,105,.16)');state.globe.pointOfView({lat:28,lng:-25,altitude:2.3},900);draw();});
  $('gf-fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(wrap.requestFullscreen)await wrap.requestFullscreen();}catch(e){status.textContent='Fullscreen is unavailable in this browser.';}});
  document.addEventListener('fullscreenchange',()=>$('gf-fullscreen').textContent=document.fullscreenElement?'Close':'Expand');
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){opt.animate.checked=false;opt.spin.checked=false;}
  init();
})();
