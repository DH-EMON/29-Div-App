/* 29 Div — অফলাইন ও দ্রুত লোডের জন্য Service Worker
   নতুন ফাইল আপলোড করলে নিচের VERSION এর সংখ্যা বাড়িয়ে দিন (যেমন v2, v3) */
var VERSION="v3",CACHE="div29-"+VERSION;
var PAGES=["./","index.html","jco-hisab.html","jco-menu.html","jq-jonobol.html","jq-masala.html","jq-menu.html","jq-mess.html","jq-ration.html","jq-rr.html","sm-daily.html","sm-fresh.html","sm-manpower.html","sm-menu.html","cloud.js","manifest.json","favicon-48.png","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png"];
var SDK=["app","auth","firestore"].map(function(n){return "https://www.gstatic.com/firebasejs/10.12.2/firebase-"+n+"-compat.js"});

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    var jobs=PAGES.map(function(p){return c.add(new Request(p,{cache:"reload"}))})
      .concat(SDK.map(function(u){return fetch(new Request(u,{mode:"no-cors"})).then(function(r){return c.put(u,r)})}));
    return Promise.all(jobs.map(function(j){return j.catch(function(){})}));
  }).then(function(){return self.skipWaiting()}));
});

self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k.indexOf("div29-")===0&&k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});

function mine(u){
  return u.origin===location.origin||(u.hostname==="www.gstatic.com"&&u.pathname.indexOf("/firebasejs/")===0);
}

/* আগে ক্যাশ থেকে সঙ্গে সঙ্গে দেখায়, পেছনে নতুন কপি নামিয়ে রাখে (পরের বার নতুনটা আসবে) */
self.addEventListener("fetch",function(e){
  var r=e.request;
  if(r.method!=="GET")return;
  var u=new URL(r.url);
  if(!mine(u))return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(r,{ignoreSearch:true}).then(function(hit){
      var net=fetch(r).then(function(res){
        if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());
        return res;
      }).catch(function(){return null});
      if(hit){e.waitUntil(net);return hit}
      return net.then(function(res){
        if(res)return res;
        if(r.mode==="navigate")return c.match("index.html").then(function(i){return i||Response.error()});
        return Response.error();
      });
    });
  }));
});
