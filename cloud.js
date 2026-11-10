/* 29 Div — Firebase লগইন + ক্লাউড সিঙ্ক (gate.js এর বদলে)
   sm = সৈনিক মেস, jco = জেসিও মেস, jq = JQ STORE
   প্রতি অ্যাপের ইউজার: sm@div29.app, jco@div29.app, jq@div29.app */
(function(){
"use strict";
var FC={
  apiKey:"AIzaSyBz5EqNxkEA7T5WNGr_dSVJvOYONk_rysk",
  authDomain:"div29v1.firebaseapp.com",
  projectId:"div29v1",
  storageBucket:"div29v1.firebasestorage.app",
  messagingSenderId:"1026392190900",
  appId:"1:1026392190900:web:7366c33ec5c13ea63a0ce1"
};
var NAMES={sm:"সৈনিক মেস",jco:"জেসিও মেস",jq:"JQ STORE"};
var PREFIX={sm:"sm-",jco:"jco-",jq:"rr-"};
var THEME={sm:"sm-theme",jco:"jco-theme",jq:"rr-theme"};
var PAL={
  sm:["#4b5320","#13294b","#a67c00","#3a4118","#0b1c36","#7d5f00"],
  jco:["#13294b","#4b5320","#a67c00","#0b1c36","#3a4118","#7d5f00"],
  jq:["#a67c00","#4b5320","#13294b","#7d5f00","#3a4118","#0b1c36"]
};
var AM=location.pathname.match(/(?:^|\/)(sm|jco|jq)-[^\/]*$/),APP=AM?AM[1]:null;
var D=document.documentElement;

function getApp(n){try{return firebase.app(n)}catch(e){return firebase.initializeApp(FC,n)}}

/* লক/লগআউট বাটন এটাই ডাকে */
window.smLock=function(){
  var done=function(){if(APP)location.href="index.html";else location.reload()};
  try{
    if(typeof firebase==="undefined"||!firebase.auth)return done();
    var ps=["sm","jco","jq"].map(function(n){return getApp(n).auth().signOut()});
    Promise.all(ps).then(done,done);
  }catch(e){done()}
};

/* অফলাইন ও দ্রুত লোডের জন্য Service Worker */
try{if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost")){
  window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});
}}catch(e){}

if(!APP)return;

var EMAIL=APP+"@div29.app",PATH="apps/"+APP+"/kv",FLAG="div29-synced-"+APP;
var AC=PAL[APP][0];
try{AC=PAL[APP][+localStorage.getItem(THEME[APP])||0]||AC}catch(e){}

/* ---------- পেজ লুকিয়ে ওভারলে ---------- */
var st=document.createElement("style");
st.textContent="html{overflow:hidden!important}body{visibility:hidden!important}";
D.appendChild(st);
var ov=document.createElement("div");
ov.setAttribute("style","position:fixed;inset:0;z-index:2147483647;background:#f5f6fa;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,'Segoe UI','Noto Sans Bengali','Nirmala UI',Arial,sans-serif;color:#1b1f2a;visibility:visible");
D.appendChild(ov);
document.addEventListener("DOMContentLoaded",function(){if(document.body&&ov.parentNode)document.body.inert=true});
function card(inner){return '<div style="width:100%;max-width:360px;background:#fff;border-radius:18px;padding:28px 22px;box-shadow:0 6px 30px rgba(0,0,0,.12);text-align:center">'+inner+'</div>'}
function say(t,retry){
  ov.innerHTML=card('<div style="font-size:42px;line-height:1">☁️</div><div style="font-size:22px;font-weight:700;margin:10px 0 4px">'+NAMES[APP]+'</div><div style="font-size:15px;color:#6b7280;margin-top:8px">'+t+'</div>'+(retry?'<button id="gx" style="margin-top:16px;width:100%;font-size:17px;font-weight:700;padding:12px;border:0;border-radius:12px;background:'+AC+';color:#fff">আবার চেষ্টা করুন</button>':''));
  if(retry){var b=ov.querySelector("#gx");if(b)b.onclick=function(){location.reload()}}
}
function unlock(){
  if(st.parentNode)st.parentNode.removeChild(st);
  if(ov.parentNode)ov.parentNode.removeChild(ov);
  if(document.body)document.body.inert=false;
  window.scrollTo(0,0);
}
function onBody(fn){if(document.body)fn();else document.addEventListener("DOMContentLoaded",fn)}

say("লোড হচ্ছে…");
if(typeof firebase==="undefined"||!firebase.auth||!firebase.firestore){
  say("ইন্টারনেট সংযোগ দরকার। নেট চালু করে আবার চেষ্টা করুন।",true);
  return;
}

var app=getApp(APP),auth=app.auth(),db=app.firestore();
try{db.settings({experimentalAutoDetectLongPolling:true,merge:true})}catch(e){}
try{db.enablePersistence({synchronizeTabs:true}).catch(function(){})}catch(e){}

/* ---------- সিঙ্ক ইঞ্জিন ---------- */
var OS=Storage.prototype.setItem,OR=Storage.prototype.removeItem;
var ready=false,reconciled=false,touched={},pend={},tm=0,inflight=0,lastErr="";
function sk(k){return typeof k==="string"&&k.indexOf(PREFIX[APP])===0&&k!==THEME[APP]}
function keys(){var o=[];try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(sk(k))o.push(k)}}catch(e){}return o}

Storage.prototype.setItem=function(k,v){
  OS.call(this,k,v);
  if(this===localStorage&&ready&&sk(k)){touched[k]=1;queue(k)}
};
Storage.prototype.removeItem=function(k){
  OR.call(this,k);
  if(this===localStorage&&ready&&sk(k)){touched[k]=1;queue(k)}
};
function queue(k){pend[k]=1;badge();clearTimeout(tm);tm=setTimeout(flush,700)}
function flush(){
  clearTimeout(tm);
  var ks=Object.keys(pend);pend={};
  ks.forEach(pushKey);
}
function pushKey(k){
  var v=null;try{v=localStorage.getItem(k)}catch(e){}
  var ref=db.collection(PATH).doc(k);
  inflight++;badge();
  var p=(v==null)?ref.delete():ref.set({v:v,t:firebase.firestore.FieldValue.serverTimestamp()});
  p.then(function(){inflight--;lastErr="";badge()}).catch(function(e){
    inflight--;lastErr=e&&e.code||"error";badge();
    var m="ক্লাউডে সেভ হয়নি।";
    if(lastErr==="permission-denied")m+=" অনুমতি নেই (Rules/লগইন দেখুন)।";
    else if(lastErr==="invalid-argument"||lastErr==="resource-exhausted")m+=" ডেটা অনেক বড় হয়ে গেছে। পুরনো রেকর্ড মুছুন বা ব্যাকআপ নিন।";
    toast(m);
  });
}
window.addEventListener("pagehide",function(){if(ready)flush()});
document.addEventListener("visibilitychange",function(){if(document.hidden&&ready)flush()});
window.addEventListener("online",badge);window.addEventListener("offline",badge);

/* ---------- ছোট ব্যাজ ও বার্তা ---------- */
var bd=null;
function badge(){
  onBody(function(){
    if(!bd){bd=document.createElement("div");
      bd.setAttribute("style","position:fixed;left:8px;bottom:8px;z-index:2147483000;font:12px/1 system-ui,'Noto Sans Bengali',sans-serif;background:rgba(20,24,35,.78);color:#fff;padding:6px 9px;border-radius:12px;pointer-events:none");
      document.body.appendChild(bd)}
    var t;
    if(lastErr)t="⚠️ সেভ হয়নি";
    else if(navigator.onLine===false)t="📴 অফলাইন"+(inflight||Object.keys(pend).length?" (অপেক্ষায়)":"");
    else if(inflight||Object.keys(pend).length)t="☁️ সিঙ্ক হচ্ছে…";
    else t="☁️ সিঙ্ক হয়েছে";
    bd.textContent=t;
  });
}
function toast(m){
  onBody(function(){
    var d=document.createElement("div");
    d.setAttribute("style","position:fixed;left:12px;right:12px;bottom:44px;z-index:2147483001;background:#b42318;color:#fff;padding:12px 14px;border-radius:12px;font:14px/1.4 system-ui,'Noto Sans Bengali',sans-serif;text-align:center");
    d.textContent=m;document.body.appendChild(d);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d)},6000);
  });
}
var bn=null;
function banner(){
  if(bn)return;
  onBody(function(){
    bn=document.createElement("div");
    bn.setAttribute("style","position:fixed;left:0;right:0;top:0;z-index:2147483001;background:#1f2937;color:#fff;padding:12px 14px;font:14px/1.4 system-ui,'Noto Sans Bengali',sans-serif;text-align:center;cursor:pointer");
    bn.textContent="অন্য ডিভাইসে নতুন ডেটা এসেছে। দেখতে এখানে চাপুন।";
    bn.onclick=function(){location.reload()};
    document.body.appendChild(bn);
  });
}

/* ---------- প্রথম মিলানো (পেজ খোলার আগে) ---------- */
function canReload(){
  try{var k="div29-rl-"+APP,l=+sessionStorage.getItem(k)||0;if(Date.now()-l<6000)return false;sessionStorage.setItem(k,String(Date.now()));return true}catch(e){return true}
}
function reconcile(snap){
  var cloud={},changed=false;
  snap.forEach(function(d){if(!d.metadata.hasPendingWrites)cloud[d.id]=d.data().v;else cloud[d.id]=undefined});
  Object.keys(cloud).forEach(function(k){
    if(!sk(k)||cloud[k]===undefined)return;
    var lv=null;try{lv=localStorage.getItem(k)}catch(e){}
    if(lv!==cloud[k]){
      if(lv!=null){try{OS.call(localStorage,"div29-bak-"+k,lv)}catch(e){}}
      try{OS.call(localStorage,k,cloud[k]);changed=true}catch(e){}
    }
  });
  var ids={};snap.forEach(function(d){ids[d.id]=1});
  keys().forEach(function(k){if(!ids[k])pushKey(k)});
  try{OS.call(localStorage,FLAG,"1")}catch(e){}
  ready=true;reconciled=true;
  if(changed&&canReload()){location.reload();return}
  unlock();badge();
  if(changed)banner();
}
function lateReconcile(snap){
  var n=0,ids={};
  snap.forEach(function(d){
    var k=d.id;ids[k]=1;
    if(d.metadata.hasPendingWrites||!sk(k)||touched[k])return;
    var v=d.data().v,lv=null;try{lv=localStorage.getItem(k)}catch(e){}
    if(lv!==v){
      if(lv!=null){try{OS.call(localStorage,"div29-bak-"+k,lv)}catch(e){}}
      try{OS.call(localStorage,k,v);n++}catch(e){}
    }
  });
  keys().forEach(function(k){if(!ids[k]&&!touched[k])pushKey(k)});
  try{OS.call(localStorage,FLAG,"1")}catch(e){}
  reconciled=true;
  if(n){
    if(!Object.keys(touched).length&&canReload()){location.reload();return}
    banner();
  }
  badge();
}
function remote(snap){
  var n=0;
  snap.docChanges().forEach(function(ch){
    var d=ch.doc,k=d.id;
    if(d.metadata.hasPendingWrites||!sk(k)||touched[k]||ch.type==="removed")return;
    var v=d.data().v,lv=null;try{lv=localStorage.getItem(k)}catch(e){}
    if(lv!==v){try{OS.call(localStorage,k,v);n++}catch(e){}}
  });
  if(n)banner();
}

var started=false,early=false;
function startSync(){
  if(started)return;started=true;
  say("ডেটা লোড হচ্ছে…");
  /* নেট ধীর বা না থাকলে ১০ সেকেন্ড পর ফোনের ডেটা দিয়েই খুলবে */
  var wasSynced=false;try{wasSynced=!!localStorage.getItem(FLAG)}catch(e){}
  setTimeout(function(){
    if(!reconciled&&!ready){ready=true;early=true;unlock();badge()}
  },wasSynced?1500:10000);
  db.collection(PATH).onSnapshot(function(snap){
    if(!reconciled){
      if(snap.metadata.fromCache)return;
      if(early)lateReconcile(snap);else reconcile(snap);
    }else remote(snap);
  },function(e){
    lastErr=e&&e.code||"error";
    if(!ready){ready=true;unlock()}
    badge();
    toast(lastErr==="permission-denied"?"ক্লাউড থেকে ডেটা পড়ার অনুমতি নেই। অ্যাডমিনকে জানান।":"ক্লাউড সংযোগে সমস্যা।");
  });
}

/* ---------- লগইন ---------- */
function showLogin(){
  ov.innerHTML=card(
    '<div style="font-size:42px;line-height:1">🔒</div>'
    +'<div style="font-size:22px;font-weight:700;margin:10px 0 4px">'+NAMES[APP]+'</div>'
    +'<div style="font-size:14px;color:#6b7280;margin-bottom:18px">প্রবেশ করতে পাসওয়ার্ড দিন</div>'
    +'<input id="gp" type="password" autocomplete="current-password" placeholder="পাসওয়ার্ড" style="width:100%;font-size:18px;padding:13px 14px;border:2px solid #c9ced9;border-radius:12px;outline:none;text-align:center;box-sizing:border-box;background:#fff;color:#1b1f2a">'
    +'<label style="display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;color:#6b7280;margin:12px 0"><input id="gr" type="checkbox" checked> এই ডিভাইসে মনে রাখুন</label>'
    +'<button id="gb" style="width:100%;font-size:18px;font-weight:700;padding:13px;border:0;border-radius:12px;background:'+AC+';color:#fff;cursor:pointer">প্রবেশ করুন</button>'
    +'<div id="gm" style="min-height:22px;margin-top:12px;font-size:14px;color:#b42318;font-weight:600"></div>');
  var inp=ov.querySelector("#gp"),btn=ov.querySelector("#gb"),msg=ov.querySelector("#gm"),rem=ov.querySelector("#gr");
  function go(){
    if(!inp.value)return;
    btn.disabled=true;msg.style.color="#6b7280";msg.textContent="যাচাই হচ্ছে…";
    var P=rem.checked?firebase.auth.Auth.Persistence.LOCAL:firebase.auth.Auth.Persistence.SESSION;
    auth.setPersistence(P).then(function(){return auth.signInWithEmailAndPassword(EMAIL,inp.value)}).catch(function(e){
      var c=e&&e.code||"",t="লগইন হয়নি। আবার চেষ্টা করুন।";
      if(c==="auth/invalid-credential"||c==="auth/wrong-password"||c==="auth/user-not-found"||c==="auth/invalid-login-credentials")t="ভুল পাসওয়ার্ড";
      else if(c==="auth/too-many-requests")t="অনেকবার ভুল হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
      else if(c==="auth/network-request-failed")t="ইন্টারনেট নেই। প্রথমবার লগইনে নেট লাগবে।";
      msg.style.color="#b42318";msg.textContent=t;inp.value="";btn.disabled=false;inp.focus();
    });
  }
  btn.onclick=go;inp.onkeydown=function(e){if(e.key==="Enter")go()};
  setTimeout(function(){try{inp.focus()}catch(e){}},50);
}

auth.onAuthStateChanged(function(u){
  if(u&&u.email===EMAIL)startSync();
  else{if(u)auth.signOut();if(!started)showLogin();else location.reload()}
});
})();
