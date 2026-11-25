// cron.js: parse 5-field cron, explain in en/ar, compute next runs. No dependencies.
(function(root){
const RANGES=[[0,59],[0,23],[1,31],[1,12],[0,6]];
const MON="jan feb mar apr may jun jul aug sep oct nov dec".split(" ");
const DOW="sun mon tue wed thu fri sat".split(" ");
const EN={dow:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],mon:["January","February","March","April","May","June","July","August","September","October","November","December"]};
const AR={dow:["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],mon:["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]};
const MACROS={"@yearly":"0 0 1 1 *","@annually":"0 0 1 1 *","@monthly":"0 0 1 * *","@weekly":"0 0 * * 0","@daily":"0 0 * * *","@midnight":"0 0 * * *","@hourly":"0 * * * *"};
function val(tok,i){
  let t=tok.toLowerCase();
  if(i===3){const k=MON.indexOf(t);if(k>=0)return k+1}
  if(i===4){const k=DOW.indexOf(t);if(k>=0)return k}
  if(!/^\d+$/.test(t))throw new Error("bad value: "+tok);
  let n=+t;if(i===4&&n===7)n=0;
  const[lo,hi]=RANGES[i];if(n<lo||n>(i===4?7:hi))throw new Error(`${tok} out of range (${lo}-${hi})`);
  return n;
}
function parseField(f,i){
  const[lo,hi]=RANGES[i];const set=new Set();let star=false;
  f.split(",").forEach(part=>{
    if(!part)throw new Error("empty list item");
    let[range,step]=part.split("/");let s=1;
    if(step!==undefined){if(!/^\d+$/.test(step)||+step<1)throw new Error("bad step: "+step);s=+step}
    let a,b;
    if(range==="*"||range==="?"){a=lo;b=hi;if(s===1)star=true;}
    else if(range.includes("-")){const[x,y]=range.split("-");a=val(x,i);b=val(y,i);if(a>b)throw new Error("range goes backwards: "+range)}
    else{a=val(range,i);b=step!==undefined?hi:a}
    for(let n=a;n<=b;n+=s)set.add(n);
  });
  return{set:[...set].sort((x,y)=>x-y),star,raw:f};
}
function parse(expr){
  expr=expr.trim().replace(/\s+/g," ");
  if(MACROS[expr.toLowerCase()])expr=MACROS[expr.toLowerCase()];
  const p=expr.split(" ");
  if(p.length!==5)throw new Error("need exactly 5 fields: minute hour day month weekday");
  return p.map((f,i)=>parseField(f,i));
}
function list(a,sep,and){return a.length<2?a.join(""):a.slice(0,-1).join(sep)+" "+and+" "+a[a.length-1]}
const p2=n=>String(n).padStart(2,"0");
function clock(h,m,lang){
  if(lang==="ar"){return p2(h)+":"+p2(m)}
  const ap=h<12?"AM":"PM";const hh=h%12===0?12:h%12;return hh+":"+p2(m)+" "+ap;
}
function fieldText(F,i,lang,L){return null}
function explain(expr,lang){
  const f=parse(expr);const[mi,ho,dm,mo,dw]=f;const ar=lang==="ar",D=ar?AR:EN;
  const and=ar?"و":"and",sep=ar?"، ":", ";
  let when;
  const single=(x)=>x.set.length===1&&!x.star;
  if(single(mi)&&single(ho)){when=ar?`الساعة ${clock(ho.set[0],mi.set[0],lang)}`:`At ${clock(ho.set[0],mi.set[0],lang)}`}
  else{
    let m;
    if(mi.raw==="*")m=ar?"كل دقيقة":"Every minute";
    else if(/^\*\/\d+$/.test(mi.raw))m=ar?(()=>{const n=+mi.raw.slice(2);return n===1?"كل دقيقة":n===2?"كل دقيقتين":`كل ${n} ${n<=10?"دقائق":"دقيقة"}`})():`Every ${mi.raw.slice(2)} minutes`;
    else if(single(mi))m=ar?`عند الدقيقة ${mi.set[0]}`:`At minute ${mi.set[0]}`;
    else m=ar?`عند الدقائق ${mi.set.join(sep)}`:`At minutes ${mi.set.join(sep)}`;
    let h="";
    if(ho.raw==="*")h="";
    else if(/^\*\/\d+$/.test(ho.raw))h=ar?` كل ${ho.raw.slice(2)} ساعة`:` of every ${ho.raw.slice(2)} hours`;
    else if(/^\d+-\d+$/.test(ho.raw)&&!ho.raw.includes(",")){const[a,b]=ho.raw.split("-").map(Number);h=ar?` بين ${clock(a,0,lang)} و ${clock(b,59,lang)}`:`, between ${clock(a,0,lang)} and ${clock(b,59,lang)}`}
    else h=ar?` في الساعات ${ho.set.map(x=>clock(x,0,lang)).join(sep)}`:` past ${list(ho.set.map(x=>clock(x,0,lang)),sep,and)}`;
    when=m+h;
  }
  let day="";
  const dmS=dm.raw==="*"||dm.raw==="?",dwS=dw.raw==="*"||dw.raw==="?";
  if(!dmS)day+=ar?` في ${dm.set.length>1?"أيام":"يوم"} ${dm.set.join(sep)} من الشهر`:` on day${dm.set.length>1?"s":""} ${list(dm.set,sep,and)} of the month`;
  if(!dwS){
    const isWk=dw.set.join()==="1,2,3,4,5",isWe=dw.set.join()==="0,6";
    if(isWk)day+=ar?(dmS?" من الاثنين للجمعة":" وكمان من الاثنين للجمعة"):(dmS?" on weekdays (Mon to Fri)":" and on weekdays");
    else if(isWe)day+=ar?" في عطلة نهاية الأسبوع":" on weekends";
    else{const names=dw.set.map(x=>D.dow[x]);day+=ar?` يوم ${names.join(sep)}`:` on ${list(names,sep,and)}`}
  }
  if(mo.raw!=="*"){const names=mo.set.map(x=>D.mon[x-1]);day+=ar?` في ${names.join(sep)}`:` in ${list(names,sep,and)}`}
  if(!dmS&&!dwS)day+=ar?" (لو الشرطين اتحققوا في أي واحد منهم بيشتغل، زي cron العادي)":" (standard cron runs when either day field matches)";
  let s=when+day+".";
  if(single(mi)&&single(ho)&&dmS&&dwS&&mo.raw==="*")s=ar?"كل يوم، "+s:"Every day. "+s;
  return s;
}
function matches(f,d){
  const[mi,ho,dm,mo,dw]=f;
  if(!mi.set.includes(d.getMinutes())||!ho.set.includes(d.getHours())||!mo.set.includes(d.getMonth()+1))return false;
  const a=dm.set.includes(d.getDate()),b=dw.set.includes(d.getDay());
  const dmS=dm.raw==="*"||dm.raw==="?",dwS=dw.raw==="*"||dw.raw==="?";
  if(dmS&&dwS)return true;if(dmS)return b;if(dwS)return a;return a||b;
}
function nextRuns(expr,count,from,utc){
  const f=parse(expr);const out=[];
  const d=new Date(from||Date.now());
  if(utc){d.setUTCSeconds(0,0);d.setUTCMinutes(d.getUTCMinutes()+1)}else{d.setSeconds(0,0);d.setMinutes(d.getMinutes()+1)}
  let guard=0;
  while(out.length<count&&guard++<600000){
    const probe=utc?new Date(d.getTime()+d.getTimezoneOffset()*60000):d;
    if(matches(f,probe))out.push(new Date(d));
    d.setMinutes(d.getMinutes()+1);
  }
  return out;
}
root.Cron={parse,explain,nextRuns};
if(typeof module!=="undefined")module.exports=root.Cron;
})(typeof window!=="undefined"?window:globalThis);
