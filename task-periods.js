(function () {
 'use strict';
 const durations=Object.freeze({semanal:7,quinzenal:14,mensal:30,trimestral:90,semestral:180,anual:365});
 const formatter=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'});
 const date=value=>{
  if(!value)return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(String(value)))return String(value);
  const timestamp=new Date(value);
  return Number.isFinite(timestamp.getTime())?formatter.format(timestamp):'';
 };
 const offset=(day,count)=>new Date(Date.parse(day+'T00:00:00Z')+count*86400000).toISOString().slice(0,10);
 const firstMonday=created=>{
  const start=date(created);if(!start)return '';
  const weekday=new Date(start+'T00:00:00Z').getUTCDay();
  return offset(start,(8-weekday)%7||7);
 };
 function bounds(frequency,created,reference){
  const length=durations[String(frequency||'').toLowerCase()];
  const first=firstMonday(created);
  if(!length||!first)return null;
  const day=date(reference)||date(new Date());
  const cycle=day>=first?Math.floor((Date.parse(day)-Date.parse(first))/(length*86400000)):0;
  const start=offset(first,cycle*length);
  return {start,end:offset(start,length-1),length,cycle,first};
 }
 function state(period,day,today,{archived=false,archivedOn='',completed=false}={}){
  if(!period||day<period.start||day>period.end||(archivedOn&&day>archivedOn))return '';
  if(completed)return 'done';
  if(archived&&(!archivedOn||archivedOn<period.end))return '';
  return today>period.end?'late':'active';
 }
 window.FSJTaskPeriods=Object.freeze({bounds,date,offset,firstMonday,state,durations});
})();
