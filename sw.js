var C="div29-v6";
var F=["./", "./index.html", "./manifest.json", "./gate.js", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png", "./favicon-48.png", "./profile.png", "./jco-hisab.html", "./jco-menu.html", "./jq-jonobol.html", "./jq-masala.html", "./jq-menu.html", "./jq-mess.html", "./jq-ration.html", "./jq-rr.html", "./sm-daily.html", "./sm-fresh.html", "./sm-manpower.html", "./sm-menu.html", "./sm-mess.html"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(F)}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
function nf(q){return new Promise(function(ok,no){var t=setTimeout(function(){no()},4000);fetch(q).then(function(r){clearTimeout(t);ok(r)},function(e){clearTimeout(t);no(e)})})}
self.addEventListener("fetch",function(e){if(e.request.method!=="GET")return;
e.respondWith(nf(e.request).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put(e.request,cp)})}return res}).catch(function(){return caches.match(e.request).then(function(r){return r||caches.match("./index.html")})}))});
