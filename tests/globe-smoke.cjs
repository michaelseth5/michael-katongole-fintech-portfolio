/* Browser integration smoke test for the existing static HTML portfolio.
   Trade and GDP responses in this test are fixtures, never production data. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const root = path.resolve(__dirname, '..');
  const mime = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.geojson':'application/geo+json','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.avif':'image/avif'};
  const server = http.createServer((req,res) => {
    const url = new URL(req.url, 'http://localhost');
    if ((url.pathname === '/api/markets' || url.pathname === '/api/financial')) {
      res.setHeader('Content-Type','application/json');
      const year=Number(url.searchParams.get('year') || 2024);
      if (url.searchParams.get('dataset')==='gdp') {
        res.end(JSON.stringify({country:url.searchParams.get('country'),value:1500000000000,year,source:'TEST FIXTURE'}));
        return;
      }
      if (url.searchParams.get('dataset')==='trade') {
        res.end(JSON.stringify({reporter:Number(url.searchParams.get('reporter')),year,source:'TEST FIXTURE',flows:[
          {from:842,to:124,flow:'X',usd:1200000000,year,partner:'Canada'},
          {from:124,to:842,flow:'M',usd:2400000000,year,partner:'Canada'},
          {from:842,to:826,flow:'X',usd:900000000,year,partner:'United Kingdom'}
        ]}));
        return;
      }
      res.end(JSON.stringify({quotes:{
        '^GSPC':{price:6100,previousClose:6000,source:'TEST FIXTURE'},
        '^DJI':{price:41000,previousClose:42000,source:'TEST FIXTURE'},
        'BTC-USD':{price:98000,previousClose:96000,source:'TEST FIXTURE'},
        'ETH-USD':{price:3100,previousClose:3200,source:'TEST FIXTURE'},
        '^FVX':{price:38.2,previousClose:37.5,yieldPercent:3.82,source:'TEST FIXTURE'}
      },updatedAt:new Date().toISOString()}));return;
    }
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if (!file.startsWith(root+path.sep)) {res.writeHead(403);res.end();return;}
    fs.readFile(file,(err,data)=>{
      if(err){res.writeHead(404);res.end('Not found');return;}
      res.setHeader('Content-Type',mime[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    });
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const address='http://127.0.0.1:'+server.address().port;
  let browser;
  try {
    browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const page=await browser.newPage({viewport:{width:1280,height:850}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(address,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForSelector('#financial-globe canvas',{timeout:60000});
    assert.equal(await page.locator('#site-preview-notice').count(),1,
      'Welcome/testing note should appear once');
    assert.match(await page.locator('#site-preview-notice').innerText(),/Welcome to my website!/);
    assert.match(await page.locator('#site-preview-notice').innerText(),/testing phase/);
    assert.match(await page.locator('#site-preview-notice a').getAttribute('href'),/^mailto:MichaelKatongole5@gmail.com/);
    await page.waitForFunction(()=>document.querySelector('.gf-status')?.textContent.includes('annual corridors'),{timeout:30000});
    assert.equal(await page.locator('.gf-controls').count(),0,'Oversized globe menu should be gone');
    assert.equal(await page.locator('.gf-hud').count(),1,'Compact globe HUD should exist');
    assert.equal(await page.locator('.gf-expand').count(),1,'Fullscreen affordance should remain');
    assert.match(await page.locator('.gf-panel').innerText(),/Exports/);
    assert.match(await page.locator('.gf-panel').innerText(),/Imports/);
    assert.match(await page.locator('.gf-panel').innerText(),/UN Comtrade/);
    await page.waitForFunction(()=>document.querySelector('.preview-tile.mk-up') && document.querySelector('.preview-tile.mk-down'),{timeout:15000});
    assert.ok(await page.locator('.mk-wing-quotes a.mk-up').count()>0,'Positive crypto/rate movement should be green');
    assert.ok(await page.locator('.mk-wing-quotes a.mk-down').count()>0,'Negative crypto/rate movement should be red');
    assert.match(await page.locator('.gf-legend').innerText(),/Exports/);
    assert.match(await page.locator('.gf-legend').innerText(),/Imports/);
    assert.match(await page.locator('.gf-panel h3').innerText(),/United States/i);
    assert.match(await page.locator('.gf-panel').innerText(),/Canada/);
    assert.ok(await page.evaluate(()=>{
      const globe=document.querySelector('.globe-wrap');
      const panel=document.querySelector('.gf-panel');
      const hero=document.querySelector('.hero');
      return !globe.contains(panel) && panel.parentElement===hero && globe.parentElement===hero;
    }), 'Panel must be a separate homepage element outside the entire globe box');
    const separated=await page.evaluate(()=>{
      const globe=document.querySelector('.gf-stage').getBoundingClientRect();
      const sidebar=document.querySelector('.gf-panel').getBoundingClientRect();
      const title=document.querySelector('#home .demo-hero-identity h1').getBoundingClientRect();
      const stage=document.querySelector('.globe-wrap').getBoundingClientRect();
      return {stageLeft:globe.left,stageRight:globe.right,stageBottom:globe.bottom,
        panelLeft:sidebar.left,panelTop:sidebar.top,stageWidth:globe.width,
        panelWidth:sidebar.width,titleRight:title.right,globeLeft:stage.left};
    });
    assert.ok(separated.panelTop>=separated.stageBottom+4 ||
      separated.panelLeft>=separated.stageRight+4,
      'Trade card must not overlap globe: '+JSON.stringify(separated));
    assert.ok(separated.stageWidth>260 && separated.panelWidth>=200,
      'Trade card and globe must both stay usable');
    assert.ok(separated.titleRight<=separated.globeLeft+3,
      'Globe must never cover the hero name: '+JSON.stringify(separated));
    // Interaction checks: compare rendered WebGL canvas pixels, not merely visibility.
    await page.mouse.move(0,0);
    const globeCanvas=page.locator('#financial-globe canvas');
    const rect=await globeCanvas.boundingBox();
    assert.ok(rect&&rect.width>100&&rect.height>100,'Globe canvas has measurable dimensions');
    const px=rect.x+rect.width*.53,py=rect.y+rect.height*.58;
    await page.waitForTimeout(550);
    const pixelsBefore=await globeCanvas.screenshot();
    await page.mouse.move(px,py);
    await page.mouse.down();
    await page.mouse.move(px+Math.min(100,rect.width*.18),py+35,{steps:12});
    await page.mouse.up();
    await page.waitForTimeout(650);
    const pixelsAfterDrag=await globeCanvas.screenshot();
    assert.notEqual(Buffer.compare(pixelsBefore,pixelsAfterDrag),0,'Drag should visually rotate the globe');
    await page.mouse.move(px,py);
    await page.mouse.wheel(0,-300);
    await page.waitForTimeout(700);
    const pixelsAfterZoom=await globeCanvas.screenshot();
    assert.notEqual(Buffer.compare(pixelsAfterDrag,pixelsAfterZoom),0,'Mouse wheel should visually zoom the globe');
    await page.locator('.gf-expand').click();
    await page.waitForFunction(()=>Boolean(document.fullscreenElement),{timeout:7000});
    await page.locator('.gf-expand').click();
    await page.waitForFunction(()=>!document.fullscreenElement,{timeout:7000});
    assert.match(await page.locator('.gf-panel h3').innerText(),/United States/i);
    assert.equal(await page.locator('.gf-panel').isVisible(),true);
    await page.setViewportSize({width:390,height:844});
    await page.waitForTimeout(500);
    const stacked=await page.evaluate(()=>{
      const globe=document.querySelector('.gf-stage').getBoundingClientRect();
      const sidebar=document.querySelector('.gf-panel').getBoundingClientRect();
      return {stageBottom:globe.bottom,panelTop:sidebar.top};
    });
    assert.ok(stacked.panelTop>=stacked.stageBottom+4,
      'On mobile statistics must stack below globe, never overlap');
    assert.ok(await page.locator('#financial-globe canvas').isVisible(),'3D canvas should remain visible on mobile');
    // Responsive layout audit: report exact viewport and document overflow measurements.
    for(const width of [375,430,768,1024,1440,1920]){
      await page.setViewportSize({width,height:900});
      await page.waitForTimeout(120);
      const size=await page.evaluate(()=>({
        content:document.documentElement.scrollWidth,
        viewport:document.documentElement.clientWidth
      }));
      console.log('VIEWPORT '+width+'px: scrollWidth='+size.content+'px, clientWidth='+size.viewport+'px');
      assert.ok(size.content<=size.viewport+5,'Unexpected horizontal page overflow at '+width+'px');
      if(width===1920){
        const check=await page.evaluate(()=>{
          const hero=document.querySelector('#home').getBoundingClientRect();
          const panel=document.querySelector('#home .gf-panel').getBoundingClientRect();
          const globe=document.querySelector('#home .globe-wrap').getBoundingClientRect();
          const title=document.querySelector('#home h1').getBoundingClientRect();
          return {heroRight:hero.right,panelLeft:panel.left,panelRight:panel.right,
            globeLeft:globe.left,titleRight:title.right};
        });
        assert.ok(check.panelLeft>=check.heroRight+8,
          'Wide desktop financial card must sit outside hero in right open margin: '+JSON.stringify(check));
        assert.ok(check.panelRight <= size.viewport+2,
          'Country card must fit inside viewport: '+JSON.stringify(check));
        assert.ok(check.titleRight<=check.globeLeft+3,
          'Wide desktop name must not be covered by globe: '+JSON.stringify(check));
      }
    }
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex, nofollow, noarchive, nosnippet');
    await page.locator('.mk-skip-link').focus();
    assert.equal(await page.evaluate(()=>document.activeElement?.className),'mk-skip-link');
    console.log('PASS: responsive width checks and keyboard skip navigation');
    await page.screenshot({path:'globe-smoke.png',fullPage:false});
    const globeErrors=errors.filter(m=>/globe|three|webgl|financial/i.test(m));
    assert.deepEqual(globeErrors,[],'Globe console errors: '+globeErrors.join('; '));
    console.log('PASS: browser loads minimalist globe, directional arcs, fullscreen, market tones, and mobile canvas');
  } finally {
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(err=>{console.error(err);process.exitCode=1});
