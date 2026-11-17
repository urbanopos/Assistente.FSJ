(function () {
 'use strict';
 const durations={semanal:7,quinzenal:14,mensal:30,trimestral:90,semestral:180,anual:365};
 const dayMs=86400000;
 const formatRecife=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'});
 const date=value=>{
  if(!value)return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(value))return value;
  const timestamp=new Date(value);
  return Number.isFinite(timestamp.getTime())?formatRecife.format(timestamp):'';
 };
 const offset=(day,count)=>new Date(Date.parse(day+'T00:00:00Z')+count*dayMs).toISOString().slice(0,10);
 function bounds(frequency,created) {
  const start=date(created), length=durations[frequency];
  return start&&length?{start,end:offset(start,length),length}:null;
 }
 function state(period,day,today,{archived=false,archivedOn='',completed=false}={}) {
  if(!period||day<=period.start||day>period.end||(archivedOn&&day>archivedOn))return '';
  if(completed)return 'done';
  if(archived&&(!archivedOn||archivedOn<period.end))return '';
  return today<=period.end?'active':'late';
 }
 window.FSJTaskPeriods=Object.freeze({bounds,date,offset,state});
})();
