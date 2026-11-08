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
})().catch(e=>{console.error(e);process.exitCode=1});
