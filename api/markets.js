// Unified market endpoint for Vercel and Netlify. No API keys required.
// Stocks: unofficial Yahoo Finance (best effort); crypto: Coinbase spot;
// bonds: official U.S. Treasury daily par yields (not intraday).
const YAHOO=['NVDA','AAPL','MSFT','AMZN','GOOGL','META','TSLA','JPM','^IXIC','^NDX','^GSPC','^DJI','^RUT','^FVX','^TNX','^TYX','^VIX','GC=F','CL=F','SI=F','NG=F'];
const cryptoSymbols=['BTC-USD','ETH-USD'];
const ttl=120000;let memo=null,expires=0,ongoing=null;
async function get(url,ms=6500){
 const response=await fetch(url,{headers:{'Accept':'application/json,text/csv,*/*','User-Agent':'PortfolioDataDashboard/1.0'},signal:AbortSignal.timeout(ms)});
 if(!response.ok)throw Error('Source returned '+response.status);
 return response;
}
async function yahoo(symbol){
 const url='https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol)+'?range=1d&interval=5m';
 const json=await(await get(url)).json(),row=json?.chart?.result?.[0],m=row?.meta||{};
 const price=Number(m.regularMarketPrice),previousClose=Number(m.chartPreviousClose??m.previousClose);
 if(!(price>0&&previousClose>0))throw Error('Missing stock quote');
 return {price,previousClose,currency:m.currency||'USD',marketTime:m.regularMarketTime||null,source:'Yahoo Finance (unofficial)'};
}
async function coinbase(symbol){
 const json=await(await get('https://api.coinbase.com/v2/prices/'+symbol+'/spot')).json();
 const price=Number(json?.data?.amount);
 if(!(price>0))throw Error('Missing crypto price');
 return {price,currency:'USD',source:'Coinbase spot',asOf:new Date().toISOString()};
}
function csvCells(line){
 const cells=[];let cell='',quoted=false;
 for(let i=0;i<line.length;i++){const ch=line[i];
  if(ch==='"'){if(quoted&&line[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(ch===','&&!quoted){cells.push(cell.trim());cell='';}
  else cell+=ch;
 }
 cells.push(cell.trim());return cells;
}
async function treasury(){
 const now=new Date(),year=now.getUTCFullYear();
 const url='https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/'+year+'/all?type=daily_treasury_yield_curve&field_tdr_date_value='+year+'&page&_format=csv';
 const raw=await(await get(url,11000)).text(),lines=raw.replace(/^\uFEFF/,'').split(/\r?\n/).filter(Boolean);
 if(lines.length<2)throw Error('No Treasury rows');
 const headers=csvCells(lines[0]).map(x=>x.replace(/\s+/g,' ').toLowerCase());
 const dateCol=headers.findIndex(h=>h==='date');
 const index=n=>headers.findIndex(h=>new RegExp('^'+n+'\\s*(?:yr|year|years)$','i').test(h));
 const columns=[['^FVX',index(5)],['^TNX',index(10)],['^TYX',index(30)]];
 if(dateCol<0||columns.some(x=>x[1]<0))throw Error('Unexpected Treasury CSV columns');
 const parsed=lines.slice(1).map(csvCells).map(row=>({row,date:new Date(row[dateCol])})).filter(x=>!Number.isNaN(+x.date));
 parsed.sort((a,b)=>b.date-a.date);
 const latest=parsed.find(x=>columns.every(([,i])=>Number(x.row[i])>0));
 if(!latest)throw Error('Treasury yields unavailable');
 const asOf=latest.row[dateCol],quotes={};
 for(const [symbol,i] of columns){
  const yieldPct=Number(latest.row[i]);
  // Preserve the legacy index format (yield in percent multiplied by 10).
  quotes[symbol]={price:yieldPct*10,yieldPercent:yieldPct,currency:'PCT',asOf,source:'U.S. Treasury daily par yield'};
 }
 return {quotes,asOf};
}
async function collect(){
 const results=await Promise.allSettled([
  ...YAHOO.map(async sym=>[sym,await yahoo(sym)]),
  ...cryptoSymbols.map(async sym=>[sym,await coinbase(sym)]),
  treasury()
 ]);
 const quotes={},sources={},timestamps={};
 results.forEach((result,i)=>{
  if(result.status!=='fulfilled')return;
  if(i<YAHOO.length+cryptoSymbols.length){
   const [sym,q]=result.value;quotes[sym]=q;sources[sym]=q.source;
  }else{
   Object.assign(quotes,result.value.quotes);
   timestamps.treasuryAsOf=result.value.asOf;
  }
 });
 return {quotes,sources,updatedAt:new Date().toISOString(),timestamps,disclaimer:'Quotes may be delayed, daily or unavailable; not intended for trading decisions.'};
}
async function marketData(){
 if(memo&&Date.now()<expires)return memo;
 if(ongoing)return ongoing;
 ongoing=collect().then(data=>{
  if(Object.keys(data.quotes).length){memo=data;expires=Date.now()+ttl;}
  return data;
 }).finally(()=>{ongoing=null;});
 return ongoing;
}
module.exports=async function handler(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('Cache-Control','public, s-maxage=120, stale-while-revalidate=120');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 try{
  const data=await marketData();
  return res.status(Object.keys(data.quotes).length?200:503).json(data);
 }catch(e){return res.status(503).json({error:'Market feeds unavailable',quotes:{}});}
};
module.exports.marketData=marketData;
