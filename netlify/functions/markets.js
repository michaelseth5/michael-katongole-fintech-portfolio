// Netlify adapter for the shared API (also deployed under Vercel /api/markets).
// All sources are public, read-only endpoints; no API keys are committed.
const {marketData}=require('../../api/markets.js');
exports.handler=async function(event){
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=60, s-maxage=120, stale-while-revalidate=120'};
 const reply=(statusCode,body)=>({statusCode,headers,body:JSON.stringify(body)});
 if(event.httpMethod!=='GET')return reply(405,{error:'Method not allowed'});
 try{
  const data=await marketData();
  return reply(Object.keys(data.quotes).length?200:503,data);
 }catch(e){return reply(503,{error:'Market feeds unavailable',quotes:{}});}
};
