/* Static QA server with gzip, matching the text compression used by the deployment CDN. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..'),cache=new Map();
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf','.json':'application/json','.geojson':'application/json','.mp4':'video/mp4','.m4a':'audio/mp4'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/')){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({quotes:{},source:'TEST FIXTURE'}));}
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{
  let entry=cache.get(file);if(!entry){const data=fs.readFileSync(file);entry={data,gzip:/\.(html|css|js|svg|json|geojson)$/.test(file)?zlib.gzipSync(data):null};cache.set(file,entry);}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  res.setHeader('Vary','Accept-Encoding');
  if(entry.gzip && /gzip/.test(req.headers['accept-encoding']||'')){res.setHeader('Content-Encoding','gzip');res.end(entry.gzip);}else res.end(entry.data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('Performance QA on http://127.0.0.1:4173'));
