/* Live, read-only checks against public financial data sources. No keys.
   These assertions do not write sampled values into the portfolio. */
const assert=require('node:assert/strict');
async function json(url){
  let lastError;
  for(let attempt=0;attempt<2;attempt++){
    try{
      const response=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(22000)});
      assert.equal(response.ok,true,'HTTP '+response.status+' '+url);
      return await response.json();
    }catch(error){lastError=error;if(attempt===0)await new Promise(resolve=>setTimeout(resolve,1500));}
  }
  throw lastError;
}
(async()=>{
  const trade='https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=36&period=2023&partnerCode=156&cmdCode=TOTAL&flowCode=X';
  const result=await json(trade);
  assert.ok(!result.error,'UN Comtrade returned: '+result.error);
  assert.ok(Array.isArray(result.data),'UN Comtrade response missing data array');
  const bilateral=result.data.filter(row=>row.flowCode==='X'&&Number(row.reporterCode)===36&&Number(row.partnerCode)===156&&String(row.cmdCode)==='TOTAL'&&Number(row.primaryValue)>0);
  assert.ok(bilateral.length>0,'No verified Australia to China annual exports found in response');
  console.log('LIVE UN Comtrade: '+bilateral.length+' bilateral export rows, latest observation year '+bilateral[0].refYear+', source value USD '+bilateral[0].primaryValue);
  const gdp=await json('https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.CD?format=json&date=2023');
  assert.ok(Array.isArray(gdp[1])&&Number(gdp[1][0]?.value)>0,'World Bank GDP observation missing');
  console.log('LIVE World Bank: '+gdp[1][0].date+' USA GDP observation retrieved successfully');
  const netlify=require('../netlify/functions/markets.js').handler;
  const tradeProxy=await netlify({httpMethod:'GET',queryStringParameters:{dataset:'trade',reporter:'36',year:'2023'}});
  const normalized=JSON.parse(tradeProxy.body);
  if(tradeProxy.statusCode===200){
    assert.ok(Array.isArray(normalized.flows)&&normalized.flows.length>0,'Netlify trade endpoint returned no bilateral rows');
    assert.ok(normalized.flows.some(f=>f.flow==='X'&&f.from===36&&f.to>0&&f.usd>0),'Netlify trade output lacks exported trade arcs');
    console.log('LIVE PORTFOLIO TRADE PROXY: '+normalized.flows.length+' annual reported corridors normalized');
  }else{
    assert.equal(tradeProxy.statusCode,503,'Unexpected trade proxy HTTP '+tradeProxy.statusCode);
    assert.equal(normalized.error,'UN Comtrade data currently unavailable','Trade proxy must identify upstream unavailability');
    assert.deepEqual(normalized.flows,[],'Unavailable upstream must never fabricate financial flows');
    console.warn('UPSTREAM UNAVAILABLE: trade function returned the expected honest 503 error state; this run did not verify live proxy data');
  }
  const gdpProxy=await netlify({httpMethod:'GET',queryStringParameters:{dataset:'gdp',country:'USA',year:'2023'}});
  assert.equal(gdpProxy.statusCode,200,'Portfolio GDP endpoint unavailable');
  const value=JSON.parse(gdpProxy.body);
  assert.ok(value.value>0&&value.year===2023,'Portfolio GDP endpoint returned no actual-year observation');
  console.log('LIVE PORTFOLIO GDP PROXY: '+value.country+' '+value.year+' indicator verified');

})().catch(e=>{console.error(e);process.exitCode=1});
