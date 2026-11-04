/* 29 Div — প্রতি অ্যাপের আলাদা পাসওয়ার্ড (sm = সৈনিক মেস, jco = জেসিও মেস, jq = JQ STORE)
   বদলাতে: password-tool.html দিয়ে লাইন বানিয়ে নিচের PW-তে ওই অ্যাপের লাইনটি বদলান। */
(function(){
var PW={
sm:["65e917961ea4bc0388889c9b","02e2b828125a2066e27abc57e29e8a366be1221810751e3c5ff14b3f83be651b"],
jco:["afa851f11a767efaf93e3e82","037f9144766acc79a2b4b6397a8f84b5cbf5574316046ae4219a06cb14ac82a7"],
jq:["84b412f1e3aaff1d0621fe5e","5fa7ada31958bdcf50f2e55abb77422fb49ee4bdd5e78d560e1ece001d5318cb"]
};
var CFG={
sm:{N:"সৈনিক মেস",T:"sm-theme",P:["#2f6b4f","#305496","#b42318","#6b3fa0","#c25a00","#374151"]},
jco:{N:"জেসিও মেস",T:"jco-theme",P:["#0f5f73","#305496","#b42318","#6b3fa0","#c25a00","#374151"]},
jq:{N:"JQ STORE",T:"rr-theme",P:["#305496","#1f7a4d","#b42318","#6b3fa0","#c25a00","#374151"]}
};
var ITER=10000;
var AM=location.pathname.match(/(?:^|\/)(sm|jco|jq)-[^\/]*$/),APP=AM?AM[1]:null,C=APP?CFG[APP]:null;
var SALT=APP?PW[APP][0]:"",HASH=APP?PW[APP][1]:"",KEY="div29-auth-"+APP,FK="div29-fail-"+APP;
var K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
function utf8(s){var o=[],e=unescape(encodeURIComponent(s));for(var i=0;i<e.length;i++)o.push(e.charCodeAt(i));return o}
function sha(m){var l=m.length,H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],b=m.slice();b.push(0x80);while(b.length%64!==56)b.push(0);var hi=Math.floor(l*8/4294967296),lo=(l*8)>>>0;b.push(hi>>>24&255,hi>>>16&255,hi>>>8&255,hi&255,lo>>>24&255,lo>>>16&255,lo>>>8&255,lo&255);var w=new Array(64),i,t;
for(i=0;i<b.length;i+=64){for(t=0;t<16;t++)w[t]=(b[i+t*4]<<24|b[i+t*4+1]<<16|b[i+t*4+2]<<8|b[i+t*4+3])|0;
for(t=16;t<64;t++){var x=w[t-15],y=w[t-2];w[t]=(w[t-16]+((x>>>7|x<<25)^(x>>>18|x<<14)^(x>>>3))+w[t-7]+((y>>>17|y<<15)^(y>>>19|y<<13)^(y>>>10)))|0}
var a=H[0],bb=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
for(t=0;t<64;t++){var t1=(h+((e>>>6|e<<26)^(e>>>11|e<<21)^(e>>>25|e<<7))+((e&f)^(~e&g))+K[t]+w[t])|0,t2=(((a>>>2|a<<30)^(a>>>13|a<<19)^(a>>>22|a<<10))+((a&bb)^(a&c)^(bb&c)))|0;h=g;g=f;f=e;e=(d+t1)|0;d=c;c=bb;bb=a;a=(t1+t2)|0}
H[0]=(H[0]+a)|0;H[1]=(H[1]+bb)|0;H[2]=(H[2]+c)|0;H[3]=(H[3]+d)|0;H[4]=(H[4]+e)|0;H[5]=(H[5]+f)|0;H[6]=(H[6]+g)|0;H[7]=(H[7]+h)|0}
var o=[];for(i=0;i<8;i++)o.push(H[i]>>>24&255,H[i]>>>16&255,H[i]>>>8&255,H[i]&255);return o}
function derive(pw,salt,n){var s=utf8(salt),h=sha(s.concat(utf8(pw)));for(var i=0;i<n;i++)h=sha(h.concat(s));return h.map(function(x){return("0"+x.toString(16)).slice(-2)}).join("")}

function ok(){try{return localStorage.getItem(KEY)===HASH||sessionStorage.getItem(KEY)===HASH}catch(e){return false}}
window.smLock=function(){try{for(var k in CFG){localStorage.removeItem("div29-auth-"+k);sessionStorage.removeItem("div29-auth-"+k)}}catch(e){}if(APP)location.href="index.html";else location.reload()};
if(!C||ok())return;
var de=document.documentElement,st=document.createElement("style");
st.textContent="html{overflow:hidden!important}body{visibility:hidden!important}";de.appendChild(st);
document.addEventListener("DOMContentLoaded",function(){if(document.body&&ov.parentNode)document.body.inert=true});
function bn(n){return String(n).replace(/\d/g,function(d){return"০১২৩৪৫৬৭৮৯".charAt(d)})}
var AC=C.P[0];try{var ti=+localStorage.getItem(C.T)||0;AC=C.P[ti]||AC}catch(e){}
var ov=document.createElement("div");
ov.setAttribute("style","position:fixed;inset:0;z-index:2147483647;background:#f5f6fa;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,'Segoe UI','Noto Sans Bengali','Nirmala UI',Arial,sans-serif;color:#1b1f2a;visibility:visible");
ov.innerHTML='<div style="width:100%;max-width:360px;background:#fff;border-radius:18px;padding:28px 22px;box-shadow:0 6px 30px rgba(0,0,0,.12);text-align:center">'
+'<div style="font-size:42px;line-height:1">🔒</div>'
+'<div style="font-size:22px;font-weight:700;margin:10px 0 4px">'+C.N+'</div>'
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
