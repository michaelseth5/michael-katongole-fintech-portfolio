// Netlify adapter for the shared API (also deployed under Vercel /api/markets).
// All sources are public, read-only endpoints; no API keys are committed.
const {marketData}=require('../../api/markets.js');

const tradeCache = new Map();
async function tradeFlows(event) {
  const params = event.queryStringParameters || {};
  const reporter = Number(params.reporter);
  const year = Number(params.year || 2023);
  if (!Number.isInteger(reporter) || reporter < 1 || reporter > 999 ||
      !Number.isInteger(year) || year < 2015 || year > 2025) {
    return { statusCode: 400, headers: {'Content-Type':'application/json'}, body: JSON.stringify({error:'Invalid reporter or year'}) };
  }
  const key = reporter + ':' + year;
  const cached = tradeCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.response;
  const query = new URLSearchParams({
    reporterCode: String(reporter), period: String(year),
    partnerCode: 'all', cmdCode: 'TOTAL', flowCode: 'X,M'
  });
  const url = 'https://comtradeapi.un.org/public/v1/preview/C/A/HS?' + query;
  try {
    const upstream = await fetch(url, {headers:{Accept:'application/json'},signal:AbortSignal.timeout(14000)});
    if (!upstream.ok) throw Error('Comtrade HTTP ' + upstream.status);
    const payload = await upstream.json();
    if (payload.error) throw Error('Comtrade returned an error');
    const flows = (Array.isArray(payload.data) ? payload.data : [])
      .filter(row => (row.flowCode === 'X' || row.flowCode === 'M') && Number(row.partnerCode) > 0 &&
          Number(row.partnerCode) !== reporter && Number(row.primaryValue) > 0 &&
          String(row.cmdCode).toUpperCase() === 'TOTAL')
      .map(row => ({
        from: row.flowCode === 'X' ? reporter : Number(row.partnerCode),
        to: row.flowCode === 'X' ? Number(row.partnerCode) : reporter,
        flow: row.flowCode,
        usd: Number(row.primaryValue), partner: row.partnerDesc || null,
        year: Number(row.refYear || year)
      }));
    const response = { statusCode:200, headers:{
      'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'public, max-age=600, s-maxage=3600'
    }, body:JSON.stringify({
      flows, reporter, year, retrievedAt:new Date().toISOString(),
      source:'UN Comtrade public API - annual reporter-recorded merchandise imports and exports',
      coverage:'Public preview limited to 500 records; not global or real-time capital flows',
      unit:'USD', count:flows.length
    }) };
    tradeCache.set(key,{expires:Date.now()+3600000,response});
    return response;
  } catch(err) {
    return {statusCode:503,headers:{'Content-Type':'application/json'},
      body:JSON.stringify({error:'UN Comtrade data currently unavailable',flows:[]})};
  }
}

exports.handler=async function(event){
 if(event.httpMethod==='GET' && event.queryStringParameters?.dataset==='trade') return tradeFlows(event);
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=60, s-maxage=120, stale-while-revalidate=120'};
 const reply=(statusCode,body)=>({statusCode,headers,body:JSON.stringify(body)});
 if(event.httpMethod!=='GET')return reply(405,{error:'Method not allowed'});
 try{
  const data=await marketData();
  return reply(Object.keys(data.quotes).length?200:503,data);
 }catch(e){return reply(503,{error:'Market feeds unavailable',quotes:{}});}
};
