// Netlify function for unofficial Yahoo Finance chart data.
// Market quotes may be delayed or unavailable. Not intended for trading decisions.
const SYMBOLS=['NVDA','AAPL','MSFT','AMZN','GOOGL','META','TSLA','JPM','^IXIC','^NDX','^GSPC','^DJI','^RUT','^FVX','^TNX','^TYX','^VIX','GC=F','CL=F','SI=F','NG=F','BTC-USD','ETH-USD'];
let cached=null, cacheUntil=0;
async function quote(symbol){
  const url='https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol)+'?range=1d&interval=5m';
  const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; PortfolioMarketWidget/1.0)','Accept':'application/json'},signal:AbortSignal.timeout(7000)});
  if(!response.ok)throw new Error('Yahoo '+response.status);
  const payload=await response.json();const row=payload?.chart?.result?.[0];const m=row?.meta||{};
  const price=Number(m.regularMarketPrice), previousClose=Number(m.chartPreviousClose??m.previousClose);
  if(!Number.isFinite(price)||price<=0||!Number.isFinite(previousClose)||previousClose<=0)throw new Error('Invalid quote');
  const closes=(row?.indicators?.quote?.[0]?.close||[]).filter(v=>typeof v==='number'&&Number.isFinite(v));
  return {price,previousClose,currency:m.currency||'USD',closes:closes.slice(-60),marketTime:m.regularMarketTime||null};
}
exports.handler = async function(event) {
  const headers = {'Content-Type':'application/json', 'Cache-Control':'public, max-age=60, s-maxage=60, stale-while-revalidate=60'};
  const send=(statusCode,body)=>({statusCode,headers,body:JSON.stringify(body)});
  if(event.httpMethod!=='GET') return send(405,{error:'Method not allowed'});
  if(cached && Date.now()<cacheUntil) return send(200,cached);
  const results=await Promise.allSettled(SYMBOLS.map(quote));
  const quotes={};
  results.forEach((r,i)=>{if(r.status==='fulfilled') quotes[SYMBOLS[i]]=r.value});
  if(!Object.keys(quotes).length) return send(503,{error:'Yahoo feed unavailable',quotes:{}});
  const payload={source:'Yahoo Finance unofficial chart endpoint',updatedAt:new Date().toISOString(),quotes};
  cached=payload;cacheUntil=Date.now()+60000;
  return send(200,payload);
};
