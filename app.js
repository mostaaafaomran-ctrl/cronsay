(()=>{
const $=id=>document.getElementById(id);
const TX={en:{lbl:"$ cron expression",next:"next runs",ex:"try",utc:"show times in UTC",none:"no upcoming run found",f:["minute","hour","day","month","weekday"],btn:"AR"},
ar:{lbl:"$ تعبير cron",next:"المرات الجاية",ex:"جرّب",utc:"اعرض الأوقات بتوقيت UTC",none:"مفيش تشغيل جاي",f:["دقيقة","ساعة","يوم","شهر","أسبوع"],btn:"EN"}};
const EX=["*/15 9-17 * * 1-5","0 0 * * *","30 8 1 * *","0 */6 * * *","0 9 * * sat,sun","@weekly","5 4 * * mon"];
let lang=localStorage.getItem("cronsay-lang")||"en";
function run(){
  const v=$("expr").value,tx=TX[lang];
  document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";
  $("lbl").textContent=tx.lbl;$("nextH").textContent=tx.next;$("exH").textContent=tx.ex;$("utcL").textContent=tx.utc;$("lang").textContent=tx.btn;
  const parts=v.trim().split(/\s+/);
  $("fields").innerHTML=tx.f.map((n,i)=>`<div><b>${parts.length===5?parts[i].replace(/</g,"&lt;"):"-"}</b>${n}</div>`).join("");
  try{
    $("say").textContent=Cron.explain(v,lang);$("err").textContent="";
    const utc=$("utc").checked;
    const runs=Cron.nextRuns(v,5,Date.now(),utc);
    $("next").innerHTML=runs.length?runs.map(d=>`<li>${utc?d.toISOString().replace("T"," ").slice(0,16)+" UTC":d.toLocaleString("en-GB",{weekday:"short",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</li>`).join(""):`<li>${tx.none}</li>`;
  }catch(e){$("say").textContent="";$("err").textContent="error: "+e.message;$("next").innerHTML=""}
}
$("ex").innerHTML=EX.map(e=>`<button>${e}</button>`).join("");
$("ex").onclick=e=>{if(e.target.tagName==="BUTTON"){$("expr").value=e.target.textContent;run()}};
$("expr").oninput=run;$("utc").onchange=run;
$("lang").onclick=()=>{lang=lang==="en"?"ar":"en";localStorage.setItem("cronsay-lang",lang);run()};
run();
})();
