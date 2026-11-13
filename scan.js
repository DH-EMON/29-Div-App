/* 29 Div — ছবি/স্ক্যান থেকে টেবিলে ডাটা পূরণ (OCR)
   ছবি ফোনের ভেতরেই পড়া হয় (Tesseract.js), ছবি বা লেখা কোনো সার্ভারে যায় না।
   প্রথমবার ইন্টারনেট লাগে (পড়ার ইঞ্জিন ও বাংলা ভাষার ডেটা নামাতে), পরে ফোন জমিয়ে রাখে। */
(function(root){
"use strict";
var TESS="https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
var LANGS=[{p:"https://cdn.jsdelivr.net/gh/tesseract-ocr/tessdata_fast@4.1.0",gz:false},{p:"https://tessdata.projectnaptha.com/4.0.0_fast",gz:true}];
var BD="০১২৩৪৫৬৭৮৯";

/* ---------- ছোট সহায়ক ---------- */
function toEn(s){return String(s==null?"":s).replace(/[\u09e6-\u09ef]/g,function(d){return BD.indexOf(d)})}
function toBn(s){return String(s).replace(/[0-9]/g,function(d){return BD.charAt(+d)})}
function nrm(s){s=String(s==null?"":s);try{if(s.normalize)s=s.normalize("NFC")}catch(e){}
 return toEn(s).toLowerCase().replace(/\u09df/g,"\u09af\u09bc").replace(/\u09dc/g,"\u09a1\u09bc").replace(/\u09dd/g,"\u09a2\u09bc").replace(/[\s\u200b-\u200d\ufeff.,:;|()\[\]{}'"\u201c\u201d\u2018\u2019\-_\/\\\u0964\u0965!?]/g,"")}
function lev(a,b){var n=a.length,m=b.length,i,j,p=[],c;if(!n)return m;if(!m)return n;
 for(j=0;j<=m;j++)p[j]=j;
 for(i=1;i<=n;i++){var prev=p[0];p[0]=i;for(j=1;j<=m;j++){var t=p[j];c=a.charAt(i-1)===b.charAt(j-1)?0:1;p[j]=Math.min(p[j]+1,p[j-1]+1,prev+c);prev=t}}
 return p[m]}
function sim(a,b){var x=nrm(a),y=nrm(b);if(!x||!y)return 0;if(x===y)return 1;
 var mn=Math.min(x.length,y.length),mx=Math.max(x.length,y.length);
 if(mn>=2&&(x.indexOf(y)>=0||y.indexOf(x)>=0))return 0.85+0.15*mn/mx;
 return Math.max(0,1-lev(x,y)/mx)}
function best(label,list,min,used){var bi=-1,bs=0,i;for(i=0;i<list.length;i++){if(used&&used[i])continue;var s=sim(label,list[i]);if(s>bs){bs=s;bi=i}}
 return(bi>=0&&bs>=(min==null?0.6:min))?{i:bi,score:bs}:null}
function parseNum(s){if(s==null)return null;
 var t=toEn(String(s)).replace(/[Oo\u00d8]/g,"0").replace(/[lI|!]/g,"1").replace(/S/g,"5").replace(/B/g,"8");
 if(/^\s*\d{1,3}(,\d{2})*,\d{3}(\.\d+)?\s*$/.test(t))t=t.replace(/,/g,"");else t=t.replace(/,/g,".");t=t.replace(/[^0-9.]/g,"");
 if(!/[0-9]/.test(t))return null;var p=t.split(".");t=p[0]+(p.length>1?"."+p.slice(1).join(""):"");if(t.charAt(0)===".")t="0"+t;
 var v=parseFloat(t);return isNaN(v)?null:v}
var MON=[["জানুয়ারি","জানুয়ারী","jan"],["ফেব্রুয়ারি","ফেব্রুয়ারী","feb"],["মার্চ","mar"],["এপ্রিল","apr"],["মে","may"],["জুন","jun"],["জুলাই","jul"],["আগস্ট","আগষ্ট","aug"],["সেপ্টেম্বর","সেপ্টেম্বার","sep"],["অক্টোবর","oct"],["নভেম্বর","নভেম্বার","nov"],["ডিসেম্বর","ডিসেম্বার","dec"]];
function monthOf(w){w=nrm(w);if(!w)return 0;for(var i=0;i<12;i++)for(var j=0;j<MON[i].length;j++){var n=nrm(MON[i][j]);if(w===n||(n.length>=3&&w.indexOf(n)===0&&w.length<=n.length+2))return i+1}return 0}
function parseDate(s){var t=toEn(String(s==null?"":s)),m=/(\d{1,2})\s*[\/\-.\s]\s*(\d{1,2})\s*[\/\-.\s]\s*(\d{2,4})/.exec(t),d,mo,y;
 var nm=/(\d{1,2})\s*(?:তারিখ)?\s*[\-\/.,]?\s*([^\d\s\-\/.,]{2,})\s*[\-\/.,]?\s*(\d{2,4})?/.exec(t);
 if(nm&&monthOf(nm[2])){d=+nm[1];mo=monthOf(nm[2]);y=nm[3]?+nm[3]:null;if(y!=null&&y<100)y+=2000;
  if(mo<1||mo>12||d<1||d>31)return null;var mm=mo<10?"0"+mo:""+mo,dd=d<10?"0"+d:""+d;return{d:d,m:mo,y:y,iso:y?y+"-"+mm+"-"+dd:null}}
 if(m){d=+m[1];mo=+m[2];y=+m[3];if(y<100)y+=2000}
 else{m=/(\d{1,2})\s*[\/\-.]\s*(\d{1,2})/.exec(t);if(!m)return null;d=+m[1];mo=+m[2];y=null}
 if(mo<1||mo>12||d<1||d>31)return null;
 function p2(n){return(n<10?"0":"")+n}
 return{d:d,m:mo,y:y,iso:y?(y+"-"+p2(mo)+"-"+p2(d)):null}}

/* ---------- OCR শব্দ থেকে টেবিলের গ্রিড বানানো ---------- */
function buildGrid(words){
 var W=[],i,j;
 for(i=0;i<words.length;i++){var w=words[i],t=String(w.text==null?"":w.text).replace(/\s+/g," ").trim();
  if(!t||/^[|_\u2014\u2013\-=~.\u2500-\u257f\u2022\u00b7]+$/.test(t))continue;
  W.push({t:t,x0:w.x0,y0:w.y0,x1:w.x1,y1:w.y1,cx:(w.x0+w.x1)/2,cy:(w.y0+w.y1)/2,h:Math.max(1,w.y1-w.y0)})}
 if(!W.length)return[];
 var hs=W.map(function(w){return w.h}).sort(function(a,b){return a-b}),mh=hs[Math.floor(hs.length/2)]||10;
 W.sort(function(a,b){return a.cy-b.cy});
 var rows=[];
 W.forEach(function(w){var r=rows[rows.length-1];if(r&&Math.abs(w.cy-r.cy)<=mh*0.6){r.w.push(w);r.cy=(r.cy*(r.w.length-1)+w.cy)/r.w.length}else rows.push({cy:w.cy,w:[w]})});
 rows.forEach(function(r){r.w.sort(function(a,b){return a.x0-b.x0});var cells=[],c=null;
  r.w.forEach(function(w){if(c&&w.x0-c.x1<=mh*1.1){c.t+=" "+w.t;c.x1=Math.max(c.x1,w.x1)}else{c={t:w.t,x0:w.x0,x1:w.x1};cells.push(c)}});r.cells=cells});
 /* কলামের সীমা: সব ঘরের প্রস্থ মিলিয়ে ওভারল্যাপ করা অংশ একসাথে করা */
 var iv=[];rows.forEach(function(r){r.cells.forEach(function(c){iv.push([c.x0,c.x1])})});
 iv.sort(function(a,b){return a[0]-b[0]});
 var cols=[],cur=null;
 iv.forEach(function(v){if(cur&&v[0]<=cur[1]+mh*0.3){cur[1]=Math.max(cur[1],v[1])}else{cur=[v[0],v[1]];cols.push(cur)}});
 var G=[];
 rows.forEach(function(r){var line=[];for(j=0;j<cols.length;j++)line.push("");
  r.cells.forEach(function(c){var bj=0,bo=-1;for(j=0;j<cols.length;j++){var o=Math.min(c.x1,cols[j][1])-Math.max(c.x0,cols[j][0]);if(o>bo){bo=o;bj=j}}
   line[bj]=line[bj]?line[bj]+" "+c.t:c.t});
  var any=false;for(j=0;j<line.length;j++)if(line[j]){any=true;break}
  if(any)G.push(line)});
 return G}

/* শুধু লেখা (text) থেকে গ্রিড — ইঞ্জিন শব্দের অবস্থান না দিলে বিকল্প */
function gridFromText(txt){var G=[];String(txt||"").split(/\r?\n/).forEach(function(l){l=l.trim();if(!l)return;G.push(l.split(/\t+|\s{2,}|\s*\|\s*/).map(function(x){return x.trim()}))});
 var n=0;G.forEach(function(r){if(r.length>n)n=r.length});G.forEach(function(r){while(r.length<n)r.push("")});return G}

/* ---------- কলাম অনুমান ---------- */
function maxCols(G){var n=0;G.forEach(function(r){if(r.length>n)n=r.length});return n}
function serialCol(G,hdr){var n=maxCols(G),j,i;
 for(j=0;j<n;j++){var seq=0,tot=0,prev=null;
  for(i=hdr?1:0;i<G.length;i++){var v=parseNum(G[i][j]);if(String(G[i][j]||"").trim()==="")continue;tot++;if(v!=null&&v===Math.floor(v)&&(prev==null?(v===1||v===0):v===prev+1))seq++;if(v!=null)prev=v}
  if(tot>=2&&seq>=Math.ceil(tot*0.6))return j}
 return -1}
function guessHeader(G,F){if(!G.length)return false;var r=G[0],hit=0,dig=0,j;
 for(j=0;j<r.length;j++){var c=r[j];if(!c)continue;if(/[0-9\u09e6-\u09ef]/.test(c))dig++;
  F.forEach(function(f){var cand=[f.l].concat(f.alias||[]),k;for(k=0;k<cand.length;k++)if(sim(c,cand[k])>=0.62){hit++;return}})}
 if(hit>=1)return true;
 if(G.length>1&&dig===0){var d2=0;G[1].forEach(function(c){if(/[0-9\u09e6-\u09ef]/.test(c))d2++});return d2>0}
 return false}
function autoMap(G,F,hdr,gfn){
 var n=maxCols(G),map=[],used={},j;
 for(j=0;j<n;j++)map[j]="";
 if(hdr){for(j=0;j<n;j++){var h=G[0][j]||"",k=null;
   if(gfn){try{k=gfn(h,j)}catch(e){k=null}if(k&&used[k])k=null}
   if(!k){var bs=0,bk=null;F.forEach(function(f){if(used[f.k])return;[f.l].concat(f.alias||[]).forEach(function(c){var s=sim(h,c);if(s>bs){bs=s;bk=f.k}})});if(bk&&bs>=0.62)k=bk}
   if(k){map[j]=k;used[k]=1}}}
 var sc=serialCol(G,hdr),free=F.filter(function(f){return!used[f.k]}),pos=0;
 for(j=0;j<n&&pos<free.length;j++){if(map[j]||j===sc)continue;map[j]=free[pos++].k}
 return map}

/* ---------- ছবি প্রস্তুত ---------- */
/* টেবিলের বর্ডার/দাগ মোছা: লম্বা আড়াআড়ি ও খাড়া কালো দাগ সাদা করে দেয়, যাতে OCR লেখা ঠিক পড়ে */
function otsu(g){var hist=[],i,n=g.length;for(i=0;i<256;i++)hist[i]=0;for(i=0;i<n;i++)hist[g[i]]++;
 var sum=0,sB=0,wB=0,mx=0,th=128;for(i=0;i<256;i++)sum+=i*hist[i];
 for(i=0;i<256;i++){wB+=hist[i];if(!wB)continue;var wF=n-wB;if(!wF)break;sB+=i*hist[i];var mB=sB/wB,mF=(sum-sB)/wF,v=wB*wF*(mB-mF)*(mB-mF);if(v>mx){mx=v;th=i}}
 return Math.max(90,Math.min(190,th))}
function eraseLines(g,w,h){
 var th=otsu(g),minL=Math.max(40,Math.round(Math.max(w,h)*0.03)),mask=new Uint8Array(w*h),x,y,s,k,cnt=0;
 for(y=0;y<h;y++){x=0;while(x<w){if(g[y*w+x]<th){s=x;while(x<w&&g[y*w+x]<th)x++;if(x-s>=minL)for(k=s;k<x;k++)mask[y*w+k]=1}else x++}}
 for(x=0;x<w;x++){y=0;while(y<h){if(g[y*w+x]<th){s=y;while(y<h&&g[y*w+x]<th)y++;if(y-s>=minL)for(k=s;k<y;k++)mask[k*w+x]=1}else y++}}
 var out=new Uint8Array(g.length),i;
 for(y=0;y<h;y++)for(x=0;x<w;x++){i=y*w+x;var m=mask[i]||(x>0&&mask[i-1])||(x<w-1&&mask[i+1])||(y>0&&mask[i-w])||(y<h-1&&mask[i+w]);
  if(m){out[i]=255;cnt++}else out[i]=g[i]}
 /* ছবির বেশিরভাগ অংশ কালো হলে (ছায়া/ভরাট জায়গা) কিছু না মুছে আসলটাই ফেরত */
 if(cnt>w*h*0.35)return g;
 return out}

function prep(img){var w=img.naturalWidth||img.width,h=img.naturalHeight||img.height,mx=Math.max(w,h),s=1;
 if(mx>2400)s=2400/mx;else if(mx<1500)s=Math.min(2,1500/mx);
 var c=document.createElement("canvas");c.width=Math.round(w*s);c.height=Math.round(h*s);
 var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
 try{var id=x.getImageData(0,0,c.width,c.height),d=id.data,hist=[],i;for(i=0;i<256;i++)hist[i]=0;
  for(i=0;i<d.length;i+=4){var g=Math.round(d[i]*0.299+d[i+1]*0.587+d[i+2]*0.114);d[i]=d[i+1]=d[i+2]=g;hist[g]++}
  var tot=c.width*c.height,lo=0,hi=255,acc=0;for(i=0;i<256;i++){acc+=hist[i];if(acc>=tot*0.02){lo=i;break}}
  acc=0;for(i=255;i>=0;i--){acc+=hist[i];if(acc>=tot*0.02){hi=i;break}}
  if(hi-lo>40){var f=255/(hi-lo);for(i=0;i<d.length;i+=4){var v=(d[i]-lo)*f;v=v<0?0:v>255?255:v;d[i]=d[i+1]=d[i+2]=v}}
  var gr=new Uint8Array(c.width*c.height),p=0;for(i=0;i<d.length;i+=4)gr[p++]=d[i];
  var er=eraseLines(gr,c.width,c.height);p=0;for(i=0;i<d.length;i+=4){var q=er[p++];d[i]=d[i+1]=d[i+2]=q}
  x.putImageData(id,0,0)}catch(e){}
 return c}

/* ---------- OCR চালানো ---------- */
function loadTess(ok,fail){if(root.Tesseract)return ok();var s=document.createElement("script");s.src=TESS;s.onload=ok;s.onerror=function(){fail("পড়ার ইঞ্জিন নামানো যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।")};document.head.appendChild(s)}
function runOcr(canvas,onprog,done,fail,ctl){
 loadTess(function(){var ti=0;
  function next(){
   if(ctl.cancel)return;
   if(ti>=LANGS.length){fail("বাংলা ভাষার ডেটা নামানো যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।");return}
   var L=LANGS[ti++];
   root.Tesseract.createWorker(["ben","eng"],1,{langPath:L.p,gzip:L.gz,logger:function(m){onprog(m)}}).then(function(w){
    ctl.worker=w;
    return w.setParameters({tessedit_pageseg_mode:"6",preserve_interword_spaces:"1"}).then(function(){return w.recognize(canvas)}).then(function(r){return w.terminate().then(function(){return r})})
   }).then(function(r){if(!ctl.cancel)done(r.data||{})}).catch(function(e){try{console.warn("OCR",e)}catch(x){}if(!ctl.cancel)next()})}
  next()},fail)}
function wordsOf(data){var out=[];
 function add(w){if(w&&w.bbox)out.push({text:w.text,x0:w.bbox.x0,y0:w.bbox.y0,x1:w.bbox.x1,y1:w.bbox.y1})}
 if(data.words&&data.words.length){data.words.forEach(add);return out}
 (data.blocks||[]).forEach(function(b){(b.paragraphs||[]).forEach(function(p){(p.lines||[]).forEach(function(l){(l.words||[]).forEach(add)})})});
 return out}

/* ---------- পর্দা (UI) ---------- */
var CSS=".scn{position:fixed;inset:0;z-index:2147483000;background:var(--bg,#f5f6fa);color:var(--tx,#1b1f2a);display:none;flex-direction:column;font-family:system-ui,-apple-system,'Segoe UI','Noto Sans Bengali','Nirmala UI',Arial,sans-serif;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}"
+".scn.on{display:flex}.scn *{box-sizing:border-box}"
+".scn-bar{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 14px;font-weight:800;border-bottom:1px solid var(--bd,var(--ln,#c9ced9));background:var(--card,#fff)}"
+".scn-body{flex:1;overflow:auto;padding:14px}"
+".scn button{font:inherit;border-radius:10px;padding:11px 14px;cursor:pointer;border:1px solid var(--bd,var(--ln,#c9ced9));background:var(--card,#fff);color:var(--tx,#1b1f2a)}"
+".scn button.p{background:var(--ac,#305496);color:#fff;border:0;font-weight:700}"
+".scn button.d{color:#b42318}"
+".scn .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.scn .row>*{flex:1}"
+".scn .tip{background:var(--card,#fff);border:1px solid var(--bd,var(--ln,#c9ced9));border-radius:12px;padding:12px;font-size:14px;line-height:1.7;color:var(--mu,#6b7280)}"
+".scn .tip b{color:var(--tx,#1b1f2a)}"
+".scn img.pv{max-width:100%;max-height:220px;display:block;margin:12px auto 0;border-radius:10px;border:1px solid var(--bd,var(--ln,#c9ced9))}"
+".scn .bar{height:10px;border-radius:99px;background:var(--card,#fff);border:1px solid var(--bd,var(--ln,#c9ced9));overflow:hidden;margin:14px 0 6px}.scn .bar i{display:block;height:100%;width:0;background:var(--ac,#305496);transition:width .2s}"
+".scn .msg{text-align:center;color:var(--mu,#6b7280);font-size:14px;min-height:20px}"
+".scn .err{color:#b42318;font-weight:700;text-align:center;margin-top:12px}"
+".scn label.ck{display:flex;gap:8px;align-items:center;margin:8px 0;font-size:14.5px}"
+".scn .tw{overflow:auto;border:1px solid var(--bd,var(--ln,#c9ced9));border-radius:10px;background:var(--card,#fff);margin-top:10px;max-height:46vh}"
+".scn table{border-collapse:collapse;min-width:100%}"
+".scn td,.scn th{border:1px solid var(--bd,var(--ln,#c9ced9));padding:0;white-space:nowrap}"
+".scn th{background:var(--ac2,#eef1f6);position:sticky;top:0;z-index:1}"
+".scn td input[type=text]{width:100%;min-width:90px;border:0;background:transparent;color:inherit;font:inherit;font-size:14.5px;padding:9px 6px}"
+".scn td.n{padding:0 6px;text-align:center;min-width:34px}"
+".scn th select{width:100%;min-width:110px;font:inherit;font-size:13px;padding:8px 4px;border:0;background:transparent;color:inherit;font-weight:700}"
+".scn tr.hd td{background:var(--ac2,#eef1f6);color:var(--mu,#6b7280)}.scn tr.sk td{opacity:.4}"
+".scn .rep{background:var(--card,#fff);border:1px solid var(--bd,var(--ln,#c9ced9));border-radius:12px;padding:14px;line-height:1.8;font-size:14.5px}"
+".scn .rep ul{margin:6px 0 0;padding-left:18px;color:var(--mu,#6b7280)}"
+".scn-fab{white-space:nowrap}";

function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function esc(t){return String(t==null?"":t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}

var Scan={version:"1.0",_cfg:null,_t:{toEn:toEn,toBn:toBn,nrm:nrm,sim:sim,best:best,parseNum:parseNum,parseDate:parseDate,eraseLines:eraseLines,otsu:otsu,buildGrid:buildGrid,gridFromText:gridFromText,autoMap:autoMap,guessHeader:guessHeader,serialCol:serialCol},
 parseNum:parseNum,parseDate:parseDate,best:best,sim:sim,toBn:toBn,toEn:toEn};
var ui=null;

function ensureUi(){if(ui)return ui;
 var st=el("style");st.textContent=CSS;document.head.appendChild(st);
 var ov=el("div","scn");ov.innerHTML='<div class="scn-bar"><span id="scn-t"></span><button id="scn-x">বন্ধ ×</button></div><div class="scn-body" id="scn-b"></div>';
 document.body.appendChild(ov);
 ui={ov:ov,t:ov.querySelector("#scn-t"),b:ov.querySelector("#scn-b"),x:ov.querySelector("#scn-x"),ctl:{cancel:false},img:null,url:null};
 ui.x.onclick=function(){close()};
 return ui}
function close(){if(!ui)return;ui.ctl.cancel=true;try{if(ui.ctl.worker)ui.ctl.worker.terminate()}catch(e){}
 if(ui.url){try{URL.revokeObjectURL(ui.url)}catch(e){}ui.url=null}
 ui.ov.className="scn"}
function open(){var c=Scan._cfg;ensureUi();ui.ctl={cancel:false};ui.t.textContent=c.title||"ছবি থেকে ডাটা পূরণ";ui.ov.className="scn on";stepPick()}

function stepPick(msg){
 var b=ui.b;ui.canvas=null;
 b.innerHTML='<div class="tip"><b>ভালো ফল পেতে:</b><br>• টেবিলটা সোজা করে, পুরো ফ্রেমে নিন<br>• আলো ভালো রাখুন, ছায়া বা ঝাপসা এড়ান<br>• ছাপানো বা পরিষ্কার লেখায় ফল ভালো হয়। হাতের লেখা সবসময় ঠিক পড়া যায় না<br>• পড়ার পর <b>প্রতিটি ঘর নিজে মিলিয়ে নিন</b>, তারপর পূরণ করুন<br>🔒 ছবি ফোনের বাইরে যায় না</div>'
  +'<div class="row"><button class="p" id="s-cam">📷 ক্যামেরা</button><button id="s-gal">🖼 গ্যালারি</button></div>'
  +'<input type="file" id="s-f1" accept="image/*" capture="environment" style="display:none"><input type="file" id="s-f2" accept="image/*" style="display:none">'
  +'<div id="s-pv"></div>'+(msg?'<div class="err">'+esc(msg)+'</div>':"");
 var f1=b.querySelector("#s-f1"),f2=b.querySelector("#s-f2");
 b.querySelector("#s-cam").onclick=function(){f1.click()};b.querySelector("#s-gal").onclick=function(){f2.click()};
 function pick(f){if(!f)return;if(ui.url){try{URL.revokeObjectURL(ui.url)}catch(e){}}
  ui.url=URL.createObjectURL(f);var im=new Image();
  im.onload=function(){ui.img=im;var pv=b.querySelector("#s-pv");
   pv.innerHTML='<img class="pv" src="'+ui.url+'" alt=""><div class="row"><button class="p" id="s-go">▶ পড়ুন</button></div>';
   pv.querySelector("#s-go").onclick=function(){stepRun()}};
  im.onerror=function(){stepPick("ছবিটা খোলা যায়নি। অন্য ছবি বেছে নিন।")};
  im.src=ui.url}
 f1.onchange=function(){pick(this.files&&this.files[0])};f2.onchange=function(){pick(this.files&&this.files[0])}}

function stepRun(){
 var b=ui.b;ui.ctl={cancel:false};
 b.innerHTML='<div class="msg" id="r-m">শুরু হচ্ছে…</div><div class="bar"><i id="r-i"></i></div><div class="msg" id="r-n">প্রথমবার বাংলা ভাষার ডেটা নামতে কিছুক্ষণ লাগবে (শুধু একবার)।</div><div class="row"><button class="d" id="r-c">বাতিল</button></div>';
 var m=b.querySelector("#r-m"),i=b.querySelector("#r-i");
 b.querySelector("#r-c").onclick=function(){ui.ctl.cancel=true;try{if(ui.ctl.worker)ui.ctl.worker.terminate()}catch(e){}stepPick()};
 if(typeof navigator!=="undefined"&&navigator.onLine===false&&!root.Tesseract){ui.ctl.cancel=true;stepPick("ইন্টারনেট নেই। প্রথমবার পড়ার ইঞ্জিন নামাতে নেট লাগে।");return}
 var canvas;try{canvas=prep(ui.img)}catch(e){stepPick("ছবি প্রস্তুত করা যায়নি।");return}
 function prog(p){var s=p.status||"",pc=Math.round((p.progress||0)*100);
  var t=/loading tesseract core/.test(s)?"পড়ার ইঞ্জিন চালু হচ্ছে…":/loading language/.test(s)?"বাংলা ভাষার ডেটা নামছে…":/initializ/.test(s)?"প্রস্তুত হচ্ছে…":/recogniz/.test(s)?"ছবি পড়া হচ্ছে…":"কাজ চলছে…";
  m.textContent=t+(pc?" "+toBn(pc)+"%":"");i.style.width=pc+"%"}
 runOcr(canvas,prog,function(data){
  var G=buildGrid(wordsOf(data));
  if(!G.length&&data.text)G=gridFromText(data.text);
  if(!G.length){stepPick("ছবিতে কোনো লেখা পাওয়া যায়নি। আরও পরিষ্কার ছবি নিন।");return}
  stepReview(G)},function(msg){stepPick(msg)},ui.ctl)}

function stepReview(G){
 var c=Scan._cfg,F=typeof c.fields==="function"?c.fields():c.fields,b=ui.b,n=maxCols(G),i,j;
 var hdr=guessHeader(G,F),map=autoMap(G,F,hdr,c.guess),skip=[];
 b.innerHTML='<div class="tip" style="margin-bottom:8px">ছবিতে যা পড়া গেছে নিচে দেখুন। <b>ভুল ঘর ঠিক করুন</b>, প্রতিটি কলামের ওপরে বেছে দিন সেটা কোন ঘরে যাবে (না লাগলে "— বাদ —"), ভুল সারি বাদ দিন।</div>'
 +'<img class="pv" src="'+ui.url+'" alt="" style="max-height:110px;margin:0 0 8px">'
 +'<label class="ck"><input type="checkbox" id="v-h"'+(hdr?" checked":"")+'> প্রথম সারিটা শিরোনাম (পূরণে বাদ যাবে)</label><div id="v-o"></div>'
 +'<div class="tw"><table id="v-t"></table></div><div class="msg" id="v-m" style="margin-top:8px"></div>'
 +'<div class="row"><button class="p" id="v-ok">✔ পূরণ করুন</button><button id="v-re">↺ আবার ছবি</button></div>';
 var opts={};(c.opts||[]).forEach(function(o){opts[o.k]=!!o.def;var lb=el("label","ck",'<input type="checkbox" data-o="'+o.k+'"'+(o.def?" checked":"")+'> '+esc(o.l));b.querySelector("#v-o").appendChild(lb)});
 var T=b.querySelector("#v-t"),hch=b.querySelector("#v-h");
 function draw(){var h='<thead><tr><th></th>';
  for(j=0;j<n;j++){h+='<th><select data-j="'+j+'"><option value="">— বাদ —</option>';F.forEach(function(f){h+='<option value="'+esc(f.k)+'"'+(map[j]===f.k?" selected":"")+'>'+esc(f.l)+'</option>'});h+='</select></th>'}
  h+='</tr></thead><tbody>';
  for(i=0;i<G.length;i++){h+='<tr class="'+(i===0&&hch.checked?"hd":"")+(skip[i]?" sk":"")+'"><td class="n"><input type="checkbox" data-i="'+i+'" '+(skip[i]?"":"checked")+' aria-label="সারি ব্যবহার"></td>';
   for(j=0;j<n;j++)h+='<td><input type="text" data-i="'+i+'" data-j="'+j+'" value="'+esc(G[i][j]||"")+'"></td>';h+='</tr>'}
  T.innerHTML=h+'</tbody>';
  T.querySelectorAll("select").forEach(function(s){s.onchange=function(){map[+this.dataset.j]=this.value}});
  T.querySelectorAll('input[type=checkbox]').forEach(function(k){k.onchange=function(){skip[+this.dataset.i]=!this.checked;this.closest("tr").className=(+this.dataset.i===0&&hch.checked?"hd":"")+(skip[+this.dataset.i]?" sk":"")}});
  T.querySelectorAll('input[type=text]').forEach(function(t){t.oninput=function(){G[+this.dataset.i][+this.dataset.j]=this.value}})}
 hch.onchange=function(){hdr=hch.checked;map=autoMap(G,F,hdr,c.guess);draw()};
 draw();
 b.querySelectorAll("[data-o]").forEach(function(k){k.onchange=function(){opts[this.dataset.o]=this.checked}});
 b.querySelector("#v-re").onclick=function(){stepPick()};
 b.querySelector("#v-ok").onclick=function(){
  var rows=[],mapped=0;for(j=0;j<n;j++)if(map[j])mapped++;
  if(!mapped){b.querySelector("#v-m").innerHTML='<span class="err">কমপক্ষে একটা কলামের ওপরে বেছে দিন সেটা কোথায় যাবে।</span>';return}
  for(i=hch.checked?1:0;i<G.length;i++){if(skip[i])continue;var o={},any=false;
   for(j=0;j<n;j++)if(map[j]){var v=String(G[i][j]||"").trim();if(v!==""){o[map[j]]=v;any=true}}
   if(any)rows.push(o)}
  if(!rows.length){b.querySelector("#v-m").innerHTML='<span class="err">পূরণ করার মতো কোনো সারি নেই।</span>';return}
  var snap=null;try{snap=c.snapshot?c.snapshot():null}catch(e){}
  var rep;try{rep=c.apply(rows,opts)}catch(e){try{console.error(e)}catch(x){}b.querySelector("#v-m").innerHTML='<span class="err">পূরণ করা যায়নি: '+esc(e&&e.message||e)+'</span>';return}
  stepDone(rep||{ok:rows.length,notes:[]},snap)}}

function stepDone(rep,snap){var c=Scan._cfg,b=ui.b;
 var h='<div class="rep"><b>✔ '+toBn(rep.ok||0)+'টি '+esc(rep.unit||"সারি/ঘর")+' পূরণ হয়েছে।</b>';
 if(rep.notes&&rep.notes.length){h+='<ul>';rep.notes.slice(0,25).forEach(function(n){h+='<li>'+esc(n)+'</li>'});if(rep.notes.length>25)h+='<li>…আরও '+toBn(rep.notes.length-25)+'টি</li>';h+='</ul>'}
 h+='<div style="margin-top:10px;color:var(--mu,#6b7280)">টেবিলটা এখন একবার চোখ বুলিয়ে মিলিয়ে নিন। ভুল থাকলে নিচের বোতামে আগের অবস্থায় ফিরতে পারবেন।</div></div>'
 +'<div class="row">'+(snap!=null&&c.restore?'<button class="d" id="d-u">↩ আগের অবস্থায় ফিরুন</button>':"")+'<button class="p" id="d-c">বন্ধ করুন</button></div>';
 b.innerHTML=h;
 var u=b.querySelector("#d-u");if(u)u.onclick=function(){try{c.restore(snap)}catch(e){}b.innerHTML='<div class="rep"><b>↩ আগের অবস্থায় ফেরানো হয়েছে।</b></div><div class="row"><button class="p" id="d-c2">বন্ধ করুন</button></div>';b.querySelector("#d-c2").onclick=close};
 b.querySelector("#d-c").onclick=close}

/* ---------- পেজে বোতাম বসানো ---------- */
Scan.init=function(cfg){Scan._cfg=cfg;
 function mk(){var anchor=document.getElementById("pvb")||document.getElementById("pdf");if(!anchor||document.getElementById("scanb"))return;
  var bt=document.createElement("button");bt.id="scanb";bt.type="button";bt.className=(anchor.className||"s").replace(/\bp\b/,"s")+" scn-fab";bt.innerHTML="📷 ছবি থেকে";
  bt.onclick=function(){open()};anchor.parentNode.insertBefore(bt,anchor)}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mk);else mk();
 return Scan};
Scan.open=open;
root.Scan=Scan;
if(typeof module!=="undefined"&&module.exports)module.exports=Scan;
})(typeof window!=="undefined"?window:this);
