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
      res.end(JSON.stringify({quotes:{},updatedAt:new Date().toISOString()}));return;
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
    await page.waitForFunction(()=>document.querySelector('.gf-status')?.textContent.includes('visible corridors'),{timeout:30000});
    assert.match(await page.locator('.gf-panel h3').innerText(),/United States/i);
    assert.match(await page.locator('.gf-panel').innerText(),/Canada/);
    // Interaction checks: compare rendered WebGL canvas pixels, not merely visibility.
    await page.locator('#gf-spin').uncheck();
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
    await page.locator('#gf-top').selectOption('10');
    await page.locator('#gf-mode').selectOption('out');
    assert.match(await page.locator('.gf-status').innerText(),/visible corridors/);
    await page.locator('#gf-country').selectOption('124');
    await page.waitForFunction(()=>document.querySelector('.gf-panel h3')?.textContent.includes('Canada'),{timeout:15000});
    await page.locator('#gf-year').selectOption('2023');
    await page.waitForFunction(()=>document.querySelector('.gf-status')?.textContent.includes('2023'),{timeout:15000});
    await page.locator('#gf-reset').click();
    assert.match(await page.locator('.gf-panel h3').innerText(),/Global globe view/);
    await page.setViewportSize({width:390,height:844});
    await page.waitForTimeout(500);
    assert.ok(await page.locator('#financial-globe canvas').isVisible(),'3D canvas should remain visible on mobile');
    await page.screenshot({path:'globe-smoke.png',fullPage:false});
    const globeErrors=errors.filter(m=>/globe|three|webgl|financial/i.test(m));
    assert.deepEqual(globeErrors,[],'Globe console errors: '+globeErrors.join('; '));
    console.log('PASS: browser loads globe, trade arcs, country selection, filters, global view, and mobile canvas');
  } finally {
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(err=>{console.error(err);process.exitCode=1});
