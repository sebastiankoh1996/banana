(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BananaTimer=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const ALARM_DURATION=10*60*1000;
  const dayFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'numeric',day:'numeric'});
  function scheduleAt(now){
    const parts=Object.fromEntries(dayFormatter.formatToParts(new Date(now)).map(p=>[p.type,p.value]));
    const midnight=Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day))-8*60*60*1000;
    const events=[{target:midnight-6*60*60*1000,label:'6pm'},{target:midnight+12*60*60*1000,label:'12pm'},{target:midnight+18*60*60*1000,label:'6pm'},{target:midnight+36*60*60*1000,label:'12pm'}];
    const event=events.find(e=>now>=e.target&&now<e.target+ALARM_DURATION)||events.find(e=>e.target>now);
    return {...stateAt(now,event.target),...event,alarmUntil:event.target+ALARM_DURATION};
  }
  function stateAt(now,target){
    const remaining=Math.max(0,target-now),seconds=Math.ceil(remaining/1000);
    const phase=remaining===0?'alarm':remaining<=600000?'warning':'normal';
    const scale=phase==='normal'?1:1+Math.min(1,Math.max(0,(600000-remaining)/600000));
    const hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60),secs=seconds%60;
    return {phase,scale,seconds,text:`${hours?hours+':':''}${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`};
  }
  return {scheduleAt,stateAt,ALARM_DURATION};
});
