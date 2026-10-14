'use strict';
const {performance}=require('node:perf_hooks');
async function getInternetTime(){
  const started=performance.now();
  const response=await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC',{cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw Error('Time service unavailable');
  const value=await response.json();
  if(value.timeZone!=='UTC')throw Error('Unexpected time zone');
  const timestamp=Date.UTC(value.year,value.month-1,value.day,value.hour,value.minute,value.seconds,value.milliSeconds||0);
  if(!Number.isFinite(timestamp)||value.year<2020||value.year>2100)throw Error('Invalid time response');
  const latency=performance.now()-started;
  return {unixMs:timestamp+latency/2,uncertaintyMs:latency/2,source:'TimeAPI UTC'};
}
module.exports={getInternetTime};
