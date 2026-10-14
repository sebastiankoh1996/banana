const assert=require('node:assert/strict');
const {createClock,fromTimeApi}=require('./synced-clock.js');
const response={year:2026,month:10,day:14,hour:4,minute:30,seconds:15,milliSeconds:123,timeZone:'UTC'};
assert.equal(fromTimeApi(response).unixMs,Date.UTC(2026,9,14,4,30,15,123));
assert.equal(fromTimeApi({...response,milliSeconds:undefined}).unixMs,Date.UTC(2026,9,14,4,30,15));
assert.throws(()=>fromTimeApi({...response,timeZone:'Asia/Singapore'}));
assert.throws(()=>fromTimeApi({...response,month:2,day:30}));
assert.throws(()=>fromTimeApi({...response,hour:24}));
assert.throws(()=>fromTimeApi({...response,seconds:'15'}));
assert.throws(()=>fromTimeApi(null));
let pc=Date.UTC(2026,9,14,1),mono=1000,online=true;
const clock=createClock({pcNow:()=>pc,monotonicNow:()=>mono,isOnline:()=>online});
assert.equal(clock.read().now,pc);
const utc=Date.UTC(2026,9,14,4);
clock.accept({unixMs:utc,serverProcessingMs:900,uncertaintyMs:20},0,1000);
assert.equal(clock.read().now,utc+50); // only transport latency is compensated again
pc+=7200000;mono+=1000;
assert.equal(clock.read().now,utc+1050); // PC wall-clock changes do not affect synced time
online=false;assert.equal(clock.read().now,pc);assert.equal(clock.read().source,'pc');
online=true;mono+=180001;assert.equal(clock.read().source,'pc'); // stale samples cannot masquerade as fresh
clock.reset();assert.equal(clock.read().source,'pc');
assert.throws(()=>clock.accept({unixMs:NaN},0,100));
assert.throws(()=>clock.accept({unixMs:utc,serverProcessingMs:-1},0,100));
console.log('Internet anchoring, latency compensation, PC clock changes, offline fallback and sample expiry passed.');
