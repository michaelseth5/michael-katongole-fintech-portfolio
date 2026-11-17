/* End-to-end regression suite. APIs are deterministic test fixtures, never site data. */
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'test-results');fs.mkdirSync(output,{recursive:true});
const routes=['home','projects','experience','skills','networking','reading','hobbies','contact'];
const ids=['home','project-details','experience','skills','networking','listening-reading','hobbies','contact'];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.geojson':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.m4a':'audio/mp4','.mp4':'video/mp4','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/')){
  res.setHeader('Content-Type','application/json');
  const dataset=url.searchParams.get('dataset');
  return res.end(JSON.stringify(dataset==='gdp'?{value:29000000000000,year:2024,source:'TEST FIXTURE'}:dataset==='trade'?{flows:[{from:842,to:124,flow:'X',usd:1000000000,year:2024},{from:124,to:842,flow:'M',usd:900000000,year:2024}]}:{quotes:{}}));
 }
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report=[];let failure;
 try{
  // Fresh-session startup: no videos or media requests before explicit Play.
  const fresh=await browser.newPage({viewport:{width:1440,height:900}});
  const requests=[];fresh.on('request',r=>requests.push(r.url()));
  await fresh.goto(base,{waitUntil:'domcontentloaded'});
  await fresh.locator('#mtv-choice[open]').waitFor();
  assert.equal(requests.some(x=>/youtube|welcome.*\.(m4a|mp4)/i.test(x)),false,'No intro autoplay or preload');
  await fresh.locator('[data-mtv-choice=cinema]').click();
  await fresh.locator('#mtv-intro[open]').waitFor();
  assert.equal(await fresh.locator('.mtv-skip').isVisible(),true,'Cinema Skip is visible before playback');
  await fresh.locator('.mtv-skip').click();
  await fresh.locator('#mtv-intro[open]').waitFor({state:'hidden'});
  await fresh.locator('#financial-globe canvas').waitFor({timeout:60000});
  assert.equal(await fresh.locator('.mk-home-welcome-play').isEnabled(),true);
  await fresh.locator('#lane-fintech').click();
  assert.equal(await fresh.locator('#panel-fintech').isVisible(),true);
  await fresh.locator('#lane-fintech').press('ArrowRight');
  assert.equal(await fresh.locator('#panel-strategy').isVisible(),true);
  assert.equal(await fresh.locator('#home h1').innerText(),"Hi, I'm\nMichael Katongole.");
  await fresh.close();
  for(const width of [375,390,430,1280,1440,1536,1920]){
   const mobile=width<768,height=mobile?844:width===1280?800:1000;
   const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile});
   await context.addInitScript(()=>{
    sessionStorage.setItem('michael-tv-intro-seen-v1','1');sessionStorage.setItem('michael-mobile-intro-seen-v1','1');sessionStorage.setItem('michael-tv-spotlight-shown-v2','1');
   });
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base,{waitUntil:'domcontentloaded'});
   if(mobile)await page.locator('html.mk-mobile-ready').waitFor();
   else await page.locator('.tv-page.is-active').waitFor();
   await page.waitForTimeout(2300);
   const hero=await page.locator('#home').boundingBox();
   const visibleHero=await page.locator('#home .mk-socials-top').boundingBox();
   const bounds=await page.evaluate(()=>({body:document.documentElement.scrollWidth,width:innerWidth}));
   assert.ok(bounds.body<=width+1,'Document width '+width+': '+JSON.stringify(bounds));
   assert.ok(visibleHero.y+visibleHero.height<=height-(mobile?0:50)+2,'Hero controls fit '+width+': '+JSON.stringify(visibleHero));
   if(!mobile){
    const chrome=await page.evaluate(()=>({
     controls:document.querySelector('.tv-effects-control').getBoundingClientRect().toJSON(),
     nav:document.querySelector('#apple-navlinks').getBoundingClientRect().toJSON(),
     selector:document.querySelector('.tv-experience-button').getBoundingClientRect().toJSON()
    }));
    assert.ok(chrome.controls.right<=chrome.nav.left,'TV toggles do not overlap nav at '+width);
    assert.ok(chrome.nav.right<=chrome.selector.left,'Nav does not overlap experience selector at '+width);
   }
   if(mobile){
    assert.equal(await page.locator('#financial-globe').count(),0,'No mobile trade globe');
    assert.equal(await page.locator('script[src*="globe.gl"]').count(),0,'No mobile Globe.gl download');
    assert.equal(await page.locator('script[src*="michael-tv.js"]').count(),0,'No mobile intro videos');
   }
   await page.screenshot({path:path.join(output,'home-'+width+'.png')});
   for(let i=1;i<routes.length;i++){
    if(mobile){await page.locator('.mk-mobile-menu-button').click();await page.locator('.mk-mobile-menu a').filter({hasText:new RegExp('^'+(routes[i]==='reading'?'Literature':routes[i][0].toUpperCase()+routes[i].slice(1))+'$')}).click();}
    else await page.locator('#apple-navlinks a').nth(i).click();
    await page.locator('#'+ids[i]).waitFor({state:'visible',timeout:15000});
    if(!mobile)await page.locator('#main-content[data-channel-busy=false]').waitFor({timeout:15000});
    assert.equal(await page.locator('#'+ids[i]).isVisible(),true,'Route '+routes[i]+' at '+width);
    assert.equal(await page.locator('#home').isVisible(),false,'Home must be hidden on '+routes[i]+' at '+width);
    const size=await page.evaluate(mobile=>{
     const node=mobile?document.documentElement:document.querySelector('.tv-page.is-active');return{content:node.scrollWidth,width:node.clientWidth};
    },mobile);
    assert.ok(size.content<=size.width+1,'Page overflow '+width+' '+routes[i]+': '+JSON.stringify(size));
    if(routes[i]==='experience'){
     await page.locator('[data-exp-tab=milestones]').click();
     assert.equal(await page.locator('#achievements').isVisible(),true);
     assert.match(await page.locator('#achievements h1').innerText(),/STRONGER AS A TEAM/);
     await page.locator('[data-exp-tab=career]').click();
    }
    if(routes[i]==='skills')assert.ok(await page.getByRole('button',{name:'Figma',exact:true}).isVisible());
    if(routes[i]==='contact'){
     await page.locator('[data-mk-question]').first().click();
     assert.equal(await page.locator('.mk-chat-message[data-role=visitor]').count(),1);
     assert.equal(await page.locator('.mk-chat-form').isVisible(),true);
     assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('#contact')).backgroundColor),'rgb(244, 241, 237)');
    }
    assert.equal(await page.locator('.mk-site-footer:visible').count(),1,'One visible footer for '+routes[i]);
    if(width===390||width===1440)await page.screenshot({path:path.join(output,routes[i]+'-'+width+'.png')});
   }
   assert.deepEqual(errors,[],'Runtime errors at '+width);
   report.push({width,height,pages:8,horizontalOverflow:false,runtimeErrors:errors});
   await context.close();console.log('PASS: 8 routes, hero fit, tabs, footer and chat at '+width+'px');
  }
  const reduce=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  await reduce.addInitScript(()=>{sessionStorage.setItem('michael-tv-intro-seen-v1','1');sessionStorage.setItem('michael-tv-spotlight-shown-v2','1')});
  await reduce.goto(base);await reduce.locator('#apple-navlinks a').nth(3).click();await reduce.locator('#skills').waitFor({state:'visible'});await reduce.locator('#main-content[data-channel-busy=false]').waitFor();
  assert.equal(await reduce.locator('#skills').isVisible(),true);await reduce.close();
  fs.writeFileSync(path.join(output,'responsive-report.json'),JSON.stringify(report,null,2));
 }catch(error){failure=error;console.error(error);}finally{await browser.close();await new Promise(r=>server.close(r));}
 if(failure)throw failure;
})().catch(e=>{console.error(e);process.exitCode=1});
