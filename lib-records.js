/* 29 Div — রেকর্ড সেভ / রেকর্ড খুলুন (সব টেবিল-পেজে এক)
   পেজ থেকে যা লাগে: S, KEY, save(), toBn() এবং window.recFresh / recNew / recName / recReload।
   এই ফাইলটা পেজের মূল স্ক্রিপ্টের পরে লোড হয়। */
;(function(){
var RK=KEY+"-rec",BK=RK+"-blank";
var st=document.createElement("style");st.textContent=
"#recbar{display:flex;gap:6px;align-items:center;flex-wrap:wrap;background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:8px 10px;margin:4px 0 8px}"+
"#recbar b{flex:1;min-width:120px;font-size:13px;color:var(--tx)}"+
"#recbar button,#recm button.rb{font:inherit;font-size:13px;font-weight:700;border-radius:10px;padding:8px 10px;cursor:pointer;border:1px solid var(--bd);background:var(--card);color:var(--tx)}"+
"#recbar button.pm{background:var(--ac);color:#fff;border-color:var(--ac)}"+
"#recm{position:fixed;top:0;left:0;right:0;bottom:0;z-index:80;background:rgba(0,0,0,.45);display:none;align-items:flex-end;justify-content:center}"+
"#recm.on{display:flex}"+
"#recm .bx{background:var(--card);color:var(--tx);width:100%;max-width:560px;max-height:85%;overflow:auto;border-radius:16px 16px 0 0;padding:14px 14px calc(18px + env(safe-area-inset-bottom,0px))}"+
"#recm h3{margin:0 0 8px;font-size:17px}"+
"#recm .it{display:flex;align-items:center;gap:6px;border:1px solid var(--bd);border-radius:12px;padding:8px 10px;margin:6px 0}"+
"#recm .it div{flex:1;min-width:0}"+
"#recm .it b{display:block;font-size:15px;overflow-wrap:anywhere}"+
"#recm .it small{color:var(--mu);font-size:11px}"+
"#recm button.dl2{color:var(--bad)}"+
"#recm .row{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}"+
"#rect{position:fixed;left:50%;bottom:80px;transform:translateX(-50%);background:#222;color:#fff;padding:9px 16px;border-radius:20px;font-size:14px;z-index:90;display:none}";
document.head.appendChild(st);
function rl(){try{return JSON.parse(localStorage.getItem(RK))||[]}catch(x){return[]}}
function rs(a){try{localStorage.setItem(RK,JSON.stringify(a));return true}catch(x){alert("সেভ করা যায়নি, ফোনের জায়গা ভরে গেছে।");return false}}
function norm(o){var c=JSON.parse(JSON.stringify(o));delete c.recName;return JSON.stringify(c)}
function isSaved(){var n=norm(S);return rl().some(function(r){return norm(r.data)===n})}
function isBlank(){var n=norm(S),f=null,b=null;try{f=norm(window.recFresh())}catch(e){}try{b=localStorage.getItem(BK)}catch(e){}return n===f||n===b}
function dirty(){return !isSaved()&&!isBlank()}
var bar=document.createElement("div");bar.id="recbar";
bar.innerHTML='<b id="recn"></b><button class="pm" id="recsv">💾 রেকর্ড সেভ</button><button id="recop">📂 রেকর্ড খুলুন</button>';
var back=document.querySelector(".back");if(back&&back.parentNode)back.parentNode.insertBefore(bar,back.nextSibling);else document.body.insertBefore(bar,document.body.firstChild);
var tb=document.createElement("div");tb.id="rect";document.body.appendChild(tb);
var modal=document.createElement("div");modal.id="recm";
modal.innerHTML='<div class="bx"><h3>সেভ করা রেকর্ড</h3><div id="recl"></div><div class="row"><button class="rb" id="recnew">+ নতুন ফাঁকা হিসাব শুরু</button></div><div class="row"><button class="rb" id="recex">⬇ ব্যাকআপ ফাইল</button><button class="rb" id="recim">⬆ ফাইল থেকে আনুন</button></div><div class="row"><button class="rb" id="reccl" style="margin-left:auto">বন্ধ করুন</button></div><input type="file" id="recfile" accept=".json,application/json" style="display:none"></div>';
document.body.appendChild(modal);
function toast(m){tb.textContent=m;tb.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(function(){tb.style.display="none"},2200)}
function lab(){document.getElementById("recn").textContent="রেকর্ড: "+(S.recName||"সেভ করা হয়নি")}
function dstr(ts){var d=new Date(ts);return toBn(d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear())}
function esc(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function render(){var a=rl().slice().sort(function(x,y){return y.ts-x.ts}),h="";
if(!a.length)h='<div style="color:var(--mu);font-size:14px;padding:10px 0">এখনও কোনো রেকর্ড সেভ করা নেই।</div>';
a.forEach(function(r){h+='<div class="it"><div><b>'+esc(r.name)+'</b><small>সেভ: '+dstr(r.ts)+(S.recName===r.name?" · এখন খোলা":"")+'</small></div><button class="rb" data-o="'+r.id+'">খুলুন</button><button class="rb dl2" data-x="'+r.id+'">মুছুন</button></div>'});
document.getElementById("recl").innerHTML=h;
document.querySelectorAll("#recl button[data-o]").forEach(function(b){b.onclick=function(){openRec(this.dataset.o)}});
document.querySelectorAll("#recl button[data-x]").forEach(function(b){b.onclick=function(){delRec(this.dataset.x)}})}
function closeM(){modal.className=""}
function doSave(){var def=S.recName||window.recName();var nm=prompt("রেকর্ডের নাম লিখুন (যেমন: জানুয়ারি ২০২৬)",def);if(nm===null)return;nm=nm.trim();if(!nm)return;
var a=rl(),ix=-1;a.forEach(function(r,i){if(r.name===nm)ix=i});
if(ix>=0&&nm!==S.recName&&!confirm("\""+nm+"\" নামে রেকর্ড আগেই আছে। এটা বদলে দেবেন?"))return;
S.recName=nm;var rec={id:ix>=0?a[ix].id:String(Date.now()),name:nm,ts:Date.now(),data:JSON.parse(JSON.stringify(S))};
if(ix>=0)a[ix]=rec;else a.push(rec);
if(!rs(a)){return}save();lab();toast("সেভ হয়েছে: "+nm)}
function openRec(id){var r=rl().filter(function(x){return x.id===id})[0];if(!r)return;
if(dirty()&&!confirm("এখনকার হিসাব সেভ করা নেই। সেভ না করেই এই রেকর্ড খুলবেন? (না করতে চাইলে বাতিল দিয়ে আগে সেভ করুন)"))return;
S=JSON.parse(JSON.stringify(r.data));S.recName=r.name;save();window.recReload();lab();closeM();toast("খোলা হয়েছে: "+r.name)}
function delRec(id){var a=rl(),r=a.filter(function(x){return x.id===id})[0];if(!r)return;
if(!confirm("\""+r.name+"\" রেকর্ডটা মুছবেন? আর ফেরানো যাবে না।"))return;
rs(a.filter(function(x){return x.id!==id}));if(S.recName===r.name){delete S.recName;save();lab()}render()}
function newRec(){if(dirty()&&!confirm("এখনকার হিসাব সেভ করা নেই। সেভ না করেই নতুন ফাঁকা হিসাব শুরু করবেন?"))return;
S=window.recNew();delete S.recName;try{localStorage.setItem(BK,norm(S))}catch(e){}save();window.recReload();lab();closeM();toast("নতুন হিসাব শুরু")}
function exp(){var o={app:KEY,ts:Date.now(),current:S,records:rl()},bl=new Blob([JSON.stringify(o)],{type:"application/json"}),u=URL.createObjectURL(bl),a=document.createElement("a");a.href=u;a.download="backup-"+KEY+".json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)}
function imp(file){var fr=new FileReader();fr.onload=function(){try{var o=JSON.parse(fr.result);if(!o||o.app!==KEY||!Array.isArray(o.records)){alert("এটা এই পেজের ব্যাকআপ ফাইল না।");return}
var a=rl(),n=0;o.records.forEach(function(r){if(!r||!r.name||!r.data)return;var ix=-1;a.forEach(function(x,i){if(x.name===r.name)ix=i});if(ix>=0)a[ix]=r;else a.push(r);n++});
if(rs(a)){render();toast(toBn(n)+"টা রেকর্ড আনা হয়েছে")}}catch(e){alert("ফাইলটা পড়া যায়নি।")}};fr.readAsText(file)}
document.getElementById("recsv").onclick=doSave;
document.getElementById("recop").onclick=function(){render();modal.className="on"};
document.getElementById("reccl").onclick=closeM;
document.getElementById("recnew").onclick=newRec;
document.getElementById("recex").onclick=exp;
document.getElementById("recim").onclick=function(){document.getElementById("recfile").click()};
document.getElementById("recfile").onchange=function(){if(this.files&&this.files[0])imp(this.files[0]);this.value=""};
modal.onclick=function(e){if(e.target===modal)closeM()};
lab();
})();
