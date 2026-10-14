(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BananaClock=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function fromTimeApi(value){
    if(!value||value.timeZone!=='UTC')throw Error('Unexpected time zone');
    const fields=[value.year,value.month,value.day,value.hour,value.minute,value.seconds,value.milliSeconds??0];
    if(!fields.every(Number.isInteger))throw Error('Invalid time response');
    const [year,month,day,hour,minute,second,millisecond]=fields;
    if(year<2020||year>2100||month<1||month>12||day<1||day>31||hour<0||hour>23||minute<0||minute>59||second<0||second>59||millisecond<0||millisecond>999)throw Error('Invalid time response');
    const unixMs=Date.UTC(year,month-1,day,hour,minute,second,millisecond);
    if(new Date(unixMs).getUTCDate()!==day)throw Error('Invalid calendar date');
    return {unixMs,serverProcessingMs:0,uncertaintyMs:0};
  }
  function createClock({pcNow=()=>Date.now(),monotonicNow=()=>performance.now(),isOnline=()=>navigator.onLine,maxAge=180000}={}){
    let sample=null;
    function accept({unixMs,serverProcessingMs=0,uncertaintyMs=0},start,end){
      if(!Number.isFinite(unixMs)||unixMs<Date.UTC(2020,0,1)||unixMs>Date.UTC(2101,0,1)||!Number.isFinite(serverProcessingMs)||serverProcessingMs<0||end<start)throw Error('Invalid clock sample');
      const transport=Math.max(0,end-start-serverProcessingMs);
      sample={epoch:unixMs+transport/2,anchor:end,uncertaintyMs:Math.max(0,uncertaintyMs)+transport/2};
    }
    function read(){const mono=monotonicNow();if(sample&&isOnline()&&mono>=sample.anchor&&mono-sample.anchor<=maxAge)return {now:sample.epoch+mono-sample.anchor,source:'internet',uncertaintyMs:sample.uncertaintyMs};return {now:pcNow(),source:'pc'};}
    return {accept,read,reset:()=>{sample=null;}};
  }
  return {createClock,fromTimeApi};
});
