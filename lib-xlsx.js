/* 29 Div — এক্সেল (📊 শীট) বানানো: কোনো লাইব্রেরি ছাড়াই .xlsx ফাইল তৈরি
   পেজ থেকে যা লাগে: #pdf বোতাম এবং window.xlSheets() ও window.xlName।
   লোড হলে PDF বোতামের পাশে "📊 শীট" বোতাম নিজে বসায়। পেজের মূল স্ক্রিপ্টের পরে লোড হয়। */
;(function(){
var enc=new TextEncoder(),CT=null;
function crc(b){if(!CT){CT=[];for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;CT[n]=c>>>0}}var c=0xFFFFFFFF;for(var i=0;i<b.length;i++)c=CT[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function zip(files){var parts=[],cen=[],off=0;
files.forEach(function(f){var nm=enc.encode(f.name),d=f.data,c=crc(d),lh=new DataView(new ArrayBuffer(30));
lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(10,0,true);lh.setUint16(12,0x21,true);lh.setUint32(14,c,true);lh.setUint32(18,d.length,true);lh.setUint32(22,d.length,true);lh.setUint16(26,nm.length,true);
parts.push(new Uint8Array(lh.buffer),nm,d);
var ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(14,0x21,true);ch.setUint32(16,c,true);ch.setUint32(20,d.length,true);ch.setUint32(24,d.length,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
cen.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+d.length});
var cs=0;cen.forEach(function(p){cs+=p.length});
var ed=new DataView(new ArrayBuffer(22));ed.setUint32(0,0x06054b50,true);ed.setUint16(8,files.length,true);ed.setUint16(10,files.length,true);ed.setUint32(12,cs,true);ed.setUint32(16,off,true);
return new Blob(parts.concat(cen,[new Uint8Array(ed.buffer)]),{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})}
function colL(n){var s="";n++;while(n>0){var m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s}
function esc(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
window.xlCol=colL;
window.xlBuild=function(sheets){
var fonts=['<font><sz val="11"/><name val="Arial"/></font>'],fills=['<fill><patternFill patternType="none"/></fill>','<fill><patternFill patternType="gray125"/></fill>'],xfs=['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'],keys={},fk={},flk={};
function fontId(b,col){var k=(b?1:0)+"|"+(col||"");if(fk[k]!=null)return fk[k];fonts.push('<font>'+(b?'<b/>':'')+'<sz val="11"/>'+(col?'<color rgb="FF'+col+'"/>':'')+'<name val="Arial"/></font>');return fk[k]=fonts.length-1}
function fillId(c){if(!c)return 0;if(flk[c]!=null)return flk[c];fills.push('<fill><patternFill patternType="solid"><fgColor rgb="FF'+c+'"/><bgColor indexed="64"/></patternFill></fill>');return flk[c]=fills.length-1}
function sid(s){if(!s)return 0;var k=JSON.stringify([s.b,s.fill,s.col,s.nf,s.al,s.nb]);if(keys[k]!=null)return keys[k];
var nf=s.nf==="3"?164:s.nf==="5"?165:s.nf==="0"?1:0,al=s.al?'<alignment horizontal="'+(s.al==="c"?"center":"left")+'" vertical="center" wrapText="1"/>':'';
xfs.push('<xf numFmtId="'+nf+'" fontId="'+fontId(s.b,s.col)+'" fillId="'+fillId(s.fill)+'" borderId="'+(s.nb?0:1)+'" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"'+(al?' applyAlignment="1">'+al+'</xf>':'/>'));
return keys[k]=xfs.length-1}
var shx=[];
sheets.forEach(function(sh){var rows=sh.rows,x='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
if(sh.widths){x+='<cols>';sh.widths.forEach(function(w,i){x+='<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>'});x+='</cols>'}
x+='<sheetData>';
rows.forEach(function(r,ri){x+='<row r="'+(ri+1)+'">';r.forEach(function(c,ci){if(c==null)return;var o=(typeof c==="object")?c:{v:c},ref=colL(ci)+(ri+1),s=sid(o.s||(typeof c==="object"?null:{}));
if(o.f){x+='<c r="'+ref+'" s="'+s+'"'+(typeof o.v==="string"?' t="str"':'')+'><f>'+esc(o.f)+'</f>'+(o.v!=null?'<v>'+esc(o.v)+'</v>':'')+'</c>'}
else if(typeof o.v==="number"){x+='<c r="'+ref+'" s="'+s+'"><v>'+o.v+'</v></c>'}
else if(o.v==null||o.v===""){x+='<c r="'+ref+'" s="'+s+'"/>'}
else{x+='<c r="'+ref+'" s="'+s+'" t="inlineStr"><is><t xml:space="preserve">'+esc(o.v)+'</t></is></c>'}});x+='</row>'});
x+='</sheetData>';
if(sh.merges&&sh.merges.length){x+='<mergeCells count="'+sh.merges.length+'">';sh.merges.forEach(function(m){x+='<mergeCell ref="'+m+'"/>'});x+='</mergeCells>'}
x+='</worksheet>';shx.push(x)});
var styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="0.000"/><numFmt numFmtId="165" formatCode="0.00000"/></numFmts><fonts count="'+fonts.length+'">'+fonts.join('')+'</fonts><fills count="'+fills.length+'">'+fills.join('')+'</fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FF777777"/></left><right style="thin"><color rgb="FF777777"/></right><top style="thin"><color rgb="FF777777"/></top><bottom style="thin"><color rgb="FF777777"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="'+xfs.length+'">'+xfs.join('')+'</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
var names=[],used={};
sheets.forEach(function(sh,i){var n=String(sh.name||("Sheet"+(i+1))).replace(/[\[\]:*?\/\\]/g," ").slice(0,31);while(used[n])n=n.slice(0,28)+"_"+i;used[n]=1;names.push(n)});
var ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>';
sheets.forEach(function(s,i){ct+='<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'});ct+='</Types>';
var wb='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>';
names.forEach(function(n,i){wb+='<sheet name="'+esc(n)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>'});wb+='</sheets></workbook>';
var wr='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
sheets.forEach(function(s,i){wr+='<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>'});
wr+='<Relationship Id="rId'+(sheets.length+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
var rr='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
var files=[{name:"[Content_Types].xml",data:enc.encode(ct)},{name:"_rels/.rels",data:enc.encode(rr)},{name:"xl/workbook.xml",data:enc.encode(wb)},{name:"xl/_rels/workbook.xml.rels",data:enc.encode(wr)},{name:"xl/styles.xml",data:enc.encode(styles)}];
shx.forEach(function(x,i){files.push({name:"xl/worksheets/sheet"+(i+1)+".xml",data:enc.encode(x)})});
return zip(files)};
function initBtn(){var pdfB=document.getElementById("pdf");if(!pdfB||!window.xlSheets)return;
var b=document.createElement("button");b.className="s";b.id="xlb";b.textContent="📊 শীট";pdfB.parentNode.insertBefore(b,pdfB.nextSibling);
var n=document.createElement("div");n.className="note";n.style.marginTop="8px";n.textContent="📊 শীট: এক্সেল ফাইল নামে, যেটা Google Sheets অ্যাপে খুলে সরাসরি এডিট করা যায় (মূল অ্যাপের ডাটা বদলায় না)।";pdfB.parentNode.parentNode.insertBefore(n,pdfB.parentNode.nextSibling);
b.onclick=function(){try{var bl=xlBuild(window.xlSheets()),u=URL.createObjectURL(bl),a=document.createElement("a");a.href=u;a.download=(window.xlName||"sheet")+".xlsx";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)}catch(e){alert("শীট বানানো যায়নি: "+e.message)}}}
initBtn();
})();
