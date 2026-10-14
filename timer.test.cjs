const assert=require('node:assert/strict');
const {stateAt,scheduleAt,ALARM_DURATION}=require('./timer.js');
const target=new Date(2026,9,14,12).getTime();
for(const [ms,phase,scale,text] of [[601000,'normal',1,'10:01'],[600000,'warning',1,'10:00'],[300000,'warning',1.5,'05:00'],[1000,'warning',1.9983333333333333,'00:01'],[0,'alarm',2,'00:00'],[-1000,'alarm',2,'00:00'],[-3600000,'alarm',2,'00:00']]){
  const result=stateAt(target-ms,target);assert.equal(result.phase,phase);assert.ok(Math.abs(result.scale-scale)<1e-9);assert.equal(result.text,text);
}
assert.equal(stateAt(target-1,target).text,'00:01');
assert.equal(ALARM_DURATION,600000);
const instant=time=>Date.parse('2026-10-14T'+time+'+08:00');
for(const [time,phase,label,text] of [
  ['11:49:59','normal','12pm','10:01'],['11:50:00','warning','12pm','10:00'],
  ['12:00:00','alarm','12pm','00:00'],['12:09:59.999','alarm','12pm','00:00'],
  ['12:10:00','normal','6pm','5:50:00'],['17:50:00','warning','6pm','10:00'],
  ['18:00:00','alarm','6pm','00:00'],['18:09:59.999','alarm','6pm','00:00'],
  ['18:10:00','normal','12pm','17:50:00'],['23:59:59','normal','12pm','12:00:01'],
  ['00:00:00','normal','12pm','12:00:00']
]){const result=scheduleAt(instant(time));assert.equal(result.phase,phase,time);assert.equal(result.label,label,time);assert.equal(result.text,text,time);}
assert.equal(scheduleAt(instant('18:10:00')).target,Date.parse('2026-10-15T12:00:00+08:00'));
// A late resume or reload follows the current schedule rather than replaying stale alarms.
assert.equal(scheduleAt(instant('13:00:00')).label,'6pm');
assert.equal(scheduleAt(instant('18:05:00')).phase,'alarm');
console.log('Noon/6pm schedule, ten-minute alarms, automatic reset and next-day rollover passed.');
