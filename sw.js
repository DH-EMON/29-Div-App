var C="div29-v2";
var F=["./", "./index.html", "./manifest.json", "./gate.js", "./jco-hisab.html", "./jco-menu.html", "./jq-jonobol.html", "./jq-masala.html", "./jq-menu.html", "./jq-mess.html", "./jq-ration.html", "./jq-rr.html", "./sm-daily.html", "./sm-fresh.html", "./sm-manpower.html", "./sm-menu.html", "./sm-mess.html"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(F)}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){if(e.request.method!=="GET")return;
e.respondWith(caches.match(e.request).then(function(r){
var net=fetch(e.request).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put(e.request,cp)})}return res}).catch(function(){return r});
return r||net}).catch(function(){return caches.match("./index.html")}))});
