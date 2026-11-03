/* 29 Div — পাসওয়ার্ড গেট (প্রতিটি অ্যাপের আলাদা পাসওয়ার্ড)
   পাসওয়ার্ড বদলাতে: password-tool.html থেকে পাওয়া s:"…",h:"…" লাইনটি নিচে ওই অ্যাপের s ও h এর জায়গায় বসান। */
(function(){
var APPS={
sm:{n:"সৈনিক মেস",t:"sm-theme",c:["#2f6b4f","#305496","#b42318","#6b3fa0","#c25a00","#374151"],
 s:"74e6fe5657576bd449e3a6dc",h:"e34ec207464f9b64d1c0c8f7567c3881fb5b61e02d1455821f6b3cfcfc3c7c29"},
jco:{n:"জেসিও মেস",t:"jco-theme",c:["#0f5f73","#305496","#b42318","#6b3fa0","#c25a00","#374151"],
 s:"2d133fca54bb663eccc6467e",h:"09bcd73ccca5eebf88c66b1cf228f7674e488e0b9dc2b931edfe9ccd07950e5b"},
jq:{n:"JQ STORE",t:"rr-theme",c:["#305496","#1f7a4d","#b42318","#6b3fa0","#c25a00","#374151"],
 s:"7981aba9d545298e340e7b66",h:"3f2944465ec72abf95a7bd6dea22a5bb52cd3fc7de24df6ffef6e4d923fd221b"}
};
var M=/(?:^|\/)(sm|jco|jq)-[^\/]*$/.exec(location.pathname),A=M&&APPS[M[1]];
if(!A)return;
var SALT=A.s,HASH=A.h,ITER=10000,KEY=M[1]+"-auth",FK=M[1]+"-fail";
//CORE//
function ok(){try{return localStorage.getItem(KEY)===HASH||sessionStorage.getItem(KEY)===HASH}catch(e){return false}}
window.smLock=function(){try{localStorage.removeItem(KEY);sessionStorage.removeItem(KEY)}catch(e){}location.reload()};
if(ok())return;
var de=document.documentElement,st=document.createElement("style");
st.textContent="html{overflow:hidden!important}body{visibility:hidden!important}";de.appendChild(st);
document.addEventListener("DOMContentLoaded",function(){if(document.body&&ov.parentNode)document.body.inert=true});
function bn(n){return String(n).replace(/\d/g,function(d){return"০১২৩৪৫৬৭৮৯".charAt(d)})}
var AC=A.c[0];try{AC=A.c[+localStorage.getItem(A.t)||0]||AC}catch(e){}
var ov=document.createElement("div");
ov.setAttribute("style","position:fixed;inset:0;z-index:2147483647;background:#f5f6fa;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,'Segoe UI','Noto Sans Bengali','Nirmala UI',Arial,sans-serif;color:#1b1f2a;visibility:visible");
ov.innerHTML='<div style="width:100%;max-width:360px;background:#fff;border-radius:18px;padding:28px 22px;box-shadow:0 6px 30px rgba(0,0,0,.12);text-align:center">'
+'<div style="font-size:42px;line-height:1">🔒</div>'
+'<div style="font-size:22px;font-weight:700;margin:10px 0 4px">'+A.n+'</div>'
+'<div style="font-size:14px;color:#6b7280;margin-bottom:18px">প্রবেশ করতে পাসওয়ার্ড দিন</div>'
+'<input id="gp" type="password" autocomplete="current-password" placeholder="পাসওয়ার্ড" style="width:100%;font-size:18px;padding:13px 14px;border:2px solid #c9ced9;border-radius:12px;outline:none;text-align:center;box-sizing:border-box;background:#fff;color:#1b1f2a">'
+'<label style="display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;color:#6b7280;margin:12px 0"><input id="gr" type="checkbox" checked> এই ডিভাইসে মনে রাখুন</label>'
+'<button id="gb" style="width:100%;font-size:18px;font-weight:700;padding:13px;border:0;border-radius:12px;background:'+AC+';color:#fff;cursor:pointer">প্রবেশ করুন</button>'
+'<div id="gm" style="min-height:22px;margin-top:12px;font-size:14px;color:#b42318;font-weight:600"></div></div>';
de.appendChild(ov);
var inp=ov.querySelector("#gp"),btn=ov.querySelector("#gb"),msg=ov.querySelector("#gm"),rem=ov.querySelector("#gr"),tm=0;
function fail(){try{return JSON.parse(localStorage.getItem(FK))||{n:0,u:0}}catch(e){return{n:0,u:0}}}
function setFail(o){try{localStorage.setItem(FK,JSON.stringify(o))}catch(e){}}
function tick(){var f=fail(),left=Math.ceil((f.u-Date.now())/1000);
if(left>0){btn.disabled=true;inp.disabled=true;msg.textContent="অনেকবার ভুল হয়েছে। "+bn(left)+" সেকেন্ড পর আবার চেষ্টা করুন।";clearTimeout(tm);tm=setTimeout(tick,500)}
else{btn.disabled=false;inp.disabled=false;if(/সেকেন্ড/.test(msg.textContent))msg.textContent=""}}
function unlock(){try{(rem.checked?localStorage:sessionStorage).setItem(KEY,HASH)}catch(e){}
setFail({n:0,u:0});if(st.parentNode)st.parentNode.removeChild(st);if(ov.parentNode)ov.parentNode.removeChild(ov);if(document.body)document.body.inert=false;window.scrollTo(0,0)}
function go(){var f=fail();if(f.u>Date.now()||!inp.value)return;btn.disabled=true;msg.style.color="#6b7280";msg.textContent="যাচাই হচ্ছে…";
setTimeout(function(){if(derive(inp.value,SALT,ITER)===HASH){unlock();return}
f=fail();f.n++;msg.style.color="#b42318";
if(f.n%5===0){var s=Math.min(900,30*Math.pow(2,f.n/5-1));f.u=Date.now()+s*1000}
setFail(f);inp.value="";btn.disabled=false;
if(f.u>Date.now())tick();else msg.textContent="ভুল পাসওয়ার্ড ("+bn(5-f.n%5)+" বার সুযোগ বাকি)";inp.focus()},30)}
btn.onclick=go;inp.onkeydown=function(e){if(e.key==="Enter")go()};
tick();setTimeout(function(){try{inp.focus()}catch(e){}},50);
})();
