(function(){
const K={
 mb:["Mubtada'","مبتدأ","م","subj"], fa:["Fa'il","فاعل","فا","subj"], nf:["Na'ibul Fa'il","نائب الفاعل","نف","subj"],
 ii:["Isim Inna / Kana","اسم إنّ/كان","اسم","subj"],
 kh:["Khabar","خبر","خ","pred"], ki:["Khabar Inna / Kana","خبر إنّ/كان","خبر","pred"], mq:["Maqul Qaul (isi ucapan)","مقول القول","مقول","pred"],
 mf:["Maf'ul Bih","مفعول به","مف","obj"], mm:["Maf'ul Muthlaq","مفعول مطلق","مط","obj"], ml:["Maf'ul li Ajlih","مفعول لأجله","مل","obj"],
 zf:["Zharaf (Maf'ul Fih)","ظرف","ظ","obj"], ms:["Mustatsna","مستثنى","مس","obj"], hl:["Hal","حال","حا","obj"], tm:["Tamyiz","تمييز","تم","obj"],
 na:["Na'at (Sifat)","نعت","نع","tabi"], ma:["Mudhaf Ilaih","مضاف إليه","مض","tabi"], bd:["Badal","بدل","بد","tabi"],
 ab:["'Athaf Bayan / Tafsir","عطف بيان","عب","tabi"], mt:["Ma'thuf (yang di-'athaf-kan)","معطوف","مع","tabi"], tk:["Taukid","توكيد","تك","tabi"],
 fi:["Fi'il","فعل","فع","fiil"], jr:["Huruf Jar","حرف جر","ج","harf"], mj:["Majrur","مجرور","مج","majrur"],
 hr:["Huruf (Ma'ani)","حرف","حر","harf"]
};
const LEG=[["subj","Mubtada', Fa'il, Isim"],["pred","Khabar"],["fiil","Fi'il"],["obj","Maf'ul, Hal, Zharaf, Tamyiz"],["tabi","Na'at, Mudhaf Ilaih, 'Athaf, Badal"],["majrur","Majrur"],["harf","Huruf"]];
const IC={
 book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/></svg>',
 map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="5" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M7.5 12h4M11.5 12V5h5M11.5 12v7h5"/></svg>',
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10.5 12 4l8.5 6.5V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/></svg>',
 spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
 send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
 dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
 dict:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5V4.5"/><path d="M9 7h7M9 11h5"/></svg>',
 search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
 list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
 bm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-4.2L5.5 21V4.5a1 1 0 0 1 1-1z"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
 chevL:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
 chevR:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
 copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/></svg>',
 trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/></svg>',
 aa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19 8 5l5 14M4.8 14h6.4"/><path d="M14.5 10.5a3 3 0 0 1 5.5 1.7V19M20 15.2c-1-.9-5.5-1.3-5.5 1.6 0 2.5 4 2.4 5.5.2"/></svg>',
 pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/></svg>',
 quiz:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 9h8M8 13h5"/><path d="m8.5 17 1.3 1.3L12 16"/></svg>',
 shuffle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h3.5c5 0 6 10 11 10H21M3 17h3.5c1.6 0 2.8-.9 3.8-2.1M14 9c1-1.2 2.2-2 3.5-2H21"/><path d="m18.5 14.5 2.5 2.5-2.5 2.5M18.5 4.5 21 7l-2.5 2.5"/></svg>',
 calc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/></svg>',
 scale:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16M7 20h10M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/></svg>',
 coin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.2c-.6-.8-1.5-1.2-2.6-1.2-1.4 0-2.4.7-2.4 1.8 0 2.5 5 1.2 5 3.8 0 1.2-1.1 2-2.6 2-1.2 0-2.2-.5-2.8-1.4M12 6.5V8M12 16v1.5"/></svg>',
 drop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.700 12 3.500 12 3.500z"/></svg>',
 arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};
const IDX=window.FQINDEX||[];
const BABS=[];IDX.forEach((k,ki)=>k.babs.forEach(b=>BABS.push({...b,k:k.id,kt:k.title,kar:k.ar,ki})));
const AVAIL=BABS.filter(b=>b.n>0);
const KD={},LD={};
const TOT={p:BABS.reduce((a,b)=>a+b.n,0),w:BABS.reduce((a,b)=>a+(b.w||0),0)};

const norm=s=>(s||"").replace(/[ً-ٰ۟ـ«»﴿﴾()،؛:.!?\-]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").toLowerCase().trim();
const core=s=>{s=norm(s);if(s.length>3&&"وف".includes(s[0]))s=s.slice(1);if(s.length>3&&"بلك".includes(s[0]))s=s.slice(1);if(s.length>4&&s.startsWith("ال"))s=s.slice(2);return s};
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=n=>n.toLocaleString("id-ID");
function parse(p){
  const words=p.w.split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const [a,t,k]=l.split("|").map(x=>(x||"").trim());const m=a.startsWith("*");return {a:m?a.slice(1):a,t,k,m}});
  const irob=(p.i||"").split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const ix=l.indexOf("::");let x=l.slice(ix+2).trim();const au=x[0]==="~";if(au)x=x.slice(1).trim();return {a:l.slice(0,ix).trim(),x,au}});
  return {...p,words,irob};
}
function loadKitab(kid){
  if(KD[kid])return Promise.resolve(KD[kid]);
  if(LD[kid])return LD[kid];
  const get=()=>fetch("data/"+kid+".json",{credentials:"same-origin"});
  LD[kid]=get().then(r=>{
      if(r.status===401&&window.EFQAuth)return EFQAuth.refresh().then(ok=>ok?get():r).then(r2=>{if(r2.status===401){EFQAuth.toLogin();throw new Error("login")}return r2});
      return r})
    .then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})
    .then(j=>{const arr=Array.isArray(j)?j:j.p;KD[kid]={paras:arr.map(parse),mm:(j&&j.mm)||{}};return KD[kid]})
    .catch(e=>{delete LD[kid];throw e});
  return LD[kid];
}
const babParas=b=>(KD[b.k]?KD[b.k].paras.filter(p=>p.bab===b.id):[]);

const $=s=>document.querySelector(s);
const store={get(k,d){try{const v=localStorage.getItem("efq:"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("efq:"+k,JSON.stringify(v))}catch(e){}}};
const pref={t:store.get("t",true),k:store.get("k",true),size:store.get("size",0),tab:store.get("tab","x"),theme:store.get("theme",null),mz:store.get("mz",1),arf:store.get("arf","naskh")};
let route={v:"home"},SQ="",VIEW=[];
/* Riwayat bacaan & penanda: disimpan di perangkat ini (localStorage) */
const HIST={
  all(){let h=store.get("hist",null);if(!h){const l=store.get("bab",null);h=l?[{bab:l,pid:null,i:0,t:0}]:[];store.set("hist",h)}return h.filter(x=>BABS.some(b=>b.id===x.bab&&b.n))},
  open(bab){const h=HIST.all();const cur=h.find(x=>x.bab===bab)||{bab,pid:null,i:0};const n=[{...cur,t:Date.now()},...h.filter(x=>x.bab!==bab)].slice(0,15);store.set("hist",n);store.set("bab",bab)},
  pos(bab,pid,i){const h=HIST.all();const x=h.find(y=>y.bab===bab);if(!x||x.pid===pid)return;x.pid=pid;x.i=i;x.t=Date.now();store.set("hist",h)},
  clear(){store.set("hist",[])}
};
const BM={
  all(){return store.get("bm",[])},
  has(id){return BM.all().some(x=>x.id===id)},
  toggle(p){const L=BM.all();const i=L.findIndex(x=>x.id===p.id);
    if(i>=0)L.splice(i,1);else{const b=BABS.find(x=>x.id===p.bab);L.unshift({id:p.id,bab:p.bab,no:babParas(b).indexOf(p)+1,ar:p.words.slice(0,14).map(w=>w.a).join(" "),tr:(p.t||"").slice(0,160),t:Date.now()})}
    store.set("bm",L);return i<0},
  del(id){store.set("bm",BM.all().filter(x=>x.id!==id))}
};
function ago(t){if(!t)return "";const d=(Date.now()-t)/1000;if(d<60)return "baru saja";if(d<3600)return Math.floor(d/60)+" menit lalu";if(d<86400)return Math.floor(d/3600)+" jam lalu";if(d<172800)return "kemarin";if(d<604800)return Math.floor(d/86400)+" hari lalu";return new Date(t).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}

/* ---------- Routing (#beranda, #daftar, #daftar-thaharah, #cari, #tersimpan, #kamus, #u05, #peta-u05, #kitab-shalat) ---------- */
function parseHash(h){
  h=(h||"").replace(/^#/,"");
  if(!h||h==="beranda")return {v:"home"};
  if(h==="kamus")return {v:"kamus"};
  if(h==="cari")return {v:"cari"};
  if(h==="tersimpan")return {v:"saved"};
  if(h==="daftar")return {v:"daftar"};
  if(h==="latihan")return {v:"lat"};
  if(h.startsWith("latihan-")){const s=h.slice(8);return LAT_TYPES.includes(s)?{v:"lat",s}:{v:"lat"}}
  if(h==="kalkulator")return {v:"kal"};
  if(h.startsWith("kalkulator-")){const s=h.slice(11);return KAL_TOOLS.includes(s)?{v:"kal",s}:{v:"kal"}}
  if(h.startsWith("daftar-")){const k=IDX.find(x=>x.id===h.slice(7));return {v:"daftar",k:k?k.id:null}}
  if(h.startsWith("peta-")){const b=BABS.find(x=>x.id===h.slice(5));if(b&&b.n)return {v:"map",bab:b.id}}
  if(h.startsWith("kitab-")){const k=IDX.find(x=>x.id===h.slice(6));if(k)return {v:"kmap",k:k.id}}
  const b=BABS.find(x=>x.id===h);if(b&&b.n)return {v:"read",bab:b.id};
  return {v:"home"};
}
const hashOf=r=>r.v==="kamus"?"kamus":r.v==="cari"?"cari":r.v==="saved"?"tersimpan":r.v==="daftar"?(r.k?"daftar-"+r.k:"daftar"):r.v==="read"?r.bab:r.v==="map"?"peta-"+r.bab:r.v==="kmap"?"kitab-"+r.k:r.v==="lat"?(r.s?"latihan-"+r.s:"latihan"):r.v==="kal"?(r.s?"kalkulator-"+r.s:"kalkulator"):"beranda";
function go(h,opt){
  opt=opt||{};
  const r=parseHash(h);route=r;
  if(r.v!=="cari"){const qi=$("#q");if(qi&&document.activeElement!==qi)qi.value=""}
  try{history[opt.replace?"replaceState":"pushState"](null,"","#"+hashOf(r))}catch(_){}
  $("#sheet").hidden=true;render(opt);
}
window.addEventListener("popstate",()=>{route=parseHash(location.hash);$("#sheet").hidden=true;render()});

/* ---------- Navigasi: sidebar (desktop) & bottom nav (HP/tablet) ---------- */
const NAV=[["beranda","Beranda","home",r=>r.v==="home"],["daftar","Daftar Bab","list",r=>["daftar","read","map","kmap"].includes(r.v)],["cari","Cari","search",r=>r.v==="cari"],["kamus","Kamus","dict",r=>r.v==="kamus"],["latihan","Latihan","pen",r=>r.v==="lat"],["kalkulator","Kalkulator","calc",r=>r.v==="kal"],["tersimpan","Tersimpan","bm",r=>r.v==="saved",true]];
function curK(){return route.v==="kmap"||route.v==="daftar"?route.k:(route.bab?BABS.find(b=>b.id===route.bab).k:null)}
function toc(){
  const ck=curK();
  let h=NAV.map(([id,l,ic,on])=>`<a class="nav-i${(id==="daftar"?route.v==="daftar":on(route))?" on":""}" href="#${id}" data-go="${id}">${IC[ic]}${l}${id==="tersimpan"&&BM.all().length?`<span class="cnt">${BM.all().length}</span>`:""}</a>`).join("")+`<div class="toc-label">17 kitab</div>`;
  h+=IDX.map((k,i)=>{
    const list=`<a class="kmap${route.v==="kmap"&&route.k===k.id?" on":""}" href="#kitab-${k.id}" data-go="kitab-${k.id}">${IC.map}<span>Mind map kitab</span></a>`+
      k.babs.map(b=>`<a href="#${b.id}" data-go="${b.id}" class="${route.bab===b.id?"on":""}"><span>${esc(b.title)}</span><small>${b.n}</small></a>`).join("");
    return `<details${ck===k.id?" open":""}><summary><span class="n">${i+1}</span><span class="tt">${esc(k.title)}</span>${IC.chevR.replace("<svg",'<svg class="chev"')}</summary><div class="lst">${list}</div></details>`;
  }).join("");
  $("#toc").innerHTML=h;
  const on=$("#toc .lst a.on");if(on&&on.scrollIntoView)try{on.scrollIntoView({block:"nearest"})}catch(_){}
  $("#bnav").innerHTML=NAV.filter(n=>!n[4]).map(([id,l,ic,on])=>`<a href="#${id}" data-go="${id}" class="${on(route)?"on":""}"${on(route)?' aria-current="page"':""}>${IC[ic]}<span>${l==="Daftar Bab"?"Daftar":l==="Kalkulator"?"Hitung":l}</span></a>`).join("");
}

/* ---------- Bilah halaman ---------- */
function pageBar(o){
  // o: {back, backLabel, sub, title, seg, tools}
  return `<div class="bar"><div class="bar-in">${o.back?`<a class="icon-btn" href="#${o.back}" data-go="${o.back}" aria-label="${esc(o.backLabel||"Kembali")}">${IC.chevL}</a>`:""}
    <div class="bar-t">${o.sub?`<small>${o.sub}</small>`:""}<b>${o.title}</b></div>${o.seg||""}${o.tools||""}</div><div class="prog"><i id="prog"></i></div>${o.extra||""}</div>`;
}
function rsetHTML(){
  return `<div class="rset" id="rset" hidden role="dialog" aria-label="Pengaturan bacaan">
    <h3>Tampilan bacaan</h3>
    <div class="rrow"><span>Makna per kata</span><button class="sw" id="tgT" role="switch" aria-checked="${pref.t}" aria-label="Tampilkan makna per kata"></button></div>
    <div class="rrow"><span>Simbol kedudukan</span><button class="sw" id="tgK" role="switch" aria-checked="${pref.k}" aria-label="Tampilkan simbol kedudukan"></button></div>
    <div class="rrow"><span>Ukuran huruf Arab</span><span class="stp"><button id="fsMinus" aria-label="Perkecil huruf Arab">A−</button><output id="fsVal">${100+pref.size*10}%</output><button id="fsPlus" aria-label="Perbesar huruf Arab">A+</button></span></div>
    <div class="rrow"><span>Jenis huruf Arab</span><span class="seg" role="group" aria-label="Jenis huruf Arab"><button data-arf="naskh" aria-pressed="${pref.arf!=="amiri"}">Naskh</button><button data-arf="amiri" aria-pressed="${pref.arf==="amiri"}">Amiri</button></span></div>
    <h3>Warna kedudukan</h3>
    <div class="legend">${LEG.map(([c,l])=>`<span><i class="k-${c}"></i>${l}</span>`).join("")}</div>
  </div>`;
}
function bar(b,view){
  const seg=`<div class="seg" role="group" aria-label="Tampilan"><button data-go="${b.id}" aria-pressed="${view==="read"}" aria-label="Bacaan">${IC.book}<span class="lbl">Bacaan</span></button><button data-go="peta-${b.id}" aria-pressed="${view==="map"}" aria-label="Mind map">${IC.map}<span class="lbl">Mind map</span></button></div>`;
  const tools=view==="read"?`<button class="icon-btn" id="rsetBtn" aria-label="Pengaturan bacaan" aria-expanded="false" aria-controls="rset">${IC.aa}</button>`:"";
  return pageBar({back:"daftar-"+b.k,backLabel:"Kembali ke daftar bab",sub:`${esc(b.kt)}`,title:esc(b.title),seg,tools,extra:view==="read"?rsetHTML():""});
}
function head(b,extra){
  const ps=babParas(b),m=ps.filter(p=>p.matan).length;
  return `<header class="head"><div class="eyebrow">Kitab ${b.ki+1} · ${esc(b.kt)}</div><h1>${esc(b.title)}</h1><div class="ar-title">${b.ar}</div>${b.desc?`<p>${esc(b.desc)}</p>`:""}
   <div class="meta-row"><span class="tag">${b.n} paragraf</span><span class="tag">${fmt(b.w||0)} kata</span>${m?`<span class="tag"><i></i>${m} memuat matan</span>`:""}${extra||""}</div></header>`;
}

/* ---------- Bacaan ---------- */
function wordHTML(w,vi,wi,hit){
  const k=K[w.k]||K.hr;
  return `<button class="w${w.m?" m":""}${hit?" hit":""}" data-v="${vi}" data-w="${wi}"><span class="a">${esc(w.a)}</span><span class="t">${esc(w.t)}</span><span class="k k-${k[3]}" title="${esc(k[0])}">${k[2]}</span></button>`;
}
function paraHTML(p,vi,qn,showSrc){
  const b=BABS.find(x=>x.id===p.bab);const no=babParas(b).indexOf(p)+1;
  const ws=p.words.map((w,wi)=>wordHTML(w,vi,wi,qn&&(norm(w.a).includes(qn)||(w.t||"").toLowerCase().includes(qn)))).join("");
  const ir=p.irob.map(r=>`<li${r.au?' class="au"':''}><span class="ar">${esc(r.a)}</span><span>${esc(r.x)}${r.au?'<em class="aut">otomatis</em>':''}</span></li>`).join("");
  const sy=p.s.split(/\n\s*\n/).map(x=>`<p>${esc(x.trim())}</p>`).join("");
  const tab=pref.tab, bm=BM.has(p.id);
  return `<article class="para" id="p-${p.id}" data-pi="${vi}">
   <div class="para-top"><span class="no" title="Paragraf ${no}">${no}</span>${showSrc?`<span class="src"><a href="#${b.id}" data-go="${b.id}" data-para="${p.id}">${esc(b.kt)} · ${esc(b.title)}</a></span>`:`<span class="kind${p.matan?" m":""}"><i></i>${p.matan?"Matan + syarah":"Syarah"}</span>`}
    <span class="act"><button data-bm="${vi}" aria-pressed="${bm}" aria-label="${bm?"Hapus penanda":"Tandai paragraf ini"}" title="${bm?"Hapus penanda":"Tandai paragraf"}">${IC.bm}</button><button data-copy="${vi}" aria-label="Salin teks Arab" title="Salin teks Arab">${IC.copy}</button></span></div>
   <div class="text">${ws}</div>
   <div class="trans"><b>Terjemah</b>${esc(p.t)}</div>
   <div class="tabs" role="tablist" aria-label="Detail paragraf"><button role="tab" aria-selected="${tab==="i"}" data-tab="i">I'rab</button><button role="tab" aria-selected="${tab==="s"}" data-tab="s">Penjelasan</button>${AI_ON?`<button role="tab" aria-selected="false" data-tab="a" class="ai-tab">${IC.spark}Tanya AI</button>`:""}</div>
   <div class="pane" data-pane="i"${tab==="i"?"":" hidden"}>${p.irob.some(r=>r.au)?'<p class="irob-note">Baris berlabel <em class="aut">otomatis</em> disusun dari kedudukan kata dan harakat akhirnya. Cocokkan dengan guru atau kitab nahwu.</p>':""}<ul class="irob">${ir}</ul></div>
   <div class="pane syarh" data-pane="s"${tab==="s"?"":" hidden"}>${sy}</div>
   ${AI_ON?aiPane(p,vi):""}
  </article>`;
}
/* ---------- Tanya AI (per paragraf) ---------- */
const AI_ON=!!window.EFQAuth;
const CONV={};
const AI_SUG=[["Jelaskan i'rab","Jelaskan i'rab kalimat-kalimat di paragraf ini langkah demi langkah."],["Untuk pemula","Jelaskan isi paragraf ini dengan bahasa sederhana untuk pemula, beserta contoh sehari-hari."],["Dalil & alasan","Apa dalil atau alasan hukum yang disebut dalam paragraf ini?"],["Poin hafalan","Ringkas paragraf ini menjadi poin-poin penting untuk dihafal."]];
function aiFmt(t){
  let h=esc(t).replace(/\*\*([^*\n]+)\*\*/g,"<b>$1</b>").replace(/(^|[\s(])\*(?!\s)([^*\n]+?)\*(?=[\s.,;:!?)]|$)/gm,"$1<i>$2</i>");
  h=h.replace(/[\u0600-\u06FF][\u0600-\u06FF\u064B-\u065F\u0670\s]*[\u0600-\u06FF\u064B-\u065F\u0670]|[\u0600-\u06FF]/g,m=>`<bdi class="ar-in">${m}</bdi>`);
  return h.split(/\n\s*\n/).map(blk=>{
    const ls=blk.trim().split("\n");let out="",list=null;
    const flush=()=>{if(list){out+=`<${list.t}>${list.i.map(x=>`<li>${x}</li>`).join("")}</${list.t}>`;list=null}};
    ls.forEach(l=>{const u=l.match(/^\s*[-•*]\s+(.*)/),o=l.match(/^\s*\d+[.)]\s+(.*)/);const it=u||o;
      if(it){const t=u?"ul":"ol";if(!list||list.t!==t){flush();list={t,i:[]}}list.i.push(it[1])}
      else if(list&&/^\s{2,}\S/.test(l)){list.i[list.i.length-1]+="<br>"+l.trim()}
      else{flush();out+=`<p>${l.trim()}</p>`}});
    flush();return out;
  }).join("");
}
function aiMsgs(pid){
  const c=CONV[pid]||[];
  return c.map(m=>m.role==="user"?`<div class="ai-q">${esc(m.content)}</div>`:m.role==="err"?`<div class="ai-err">${esc(m.content)}</div>`:`<div class="ai-a">${aiFmt(m.content)}</div>`).join("")+(CONV[pid]&&CONV[pid].busy?`<div class="ai-wait"><i></i><i></i><i></i> Ustadz AI sedang menyusun jawaban…</div>`:"");
}
function aiPane(p,vi){
  const has=(CONV[p.id]||[]).length;
  return `<div class="pane ai" data-pane="a" hidden>
    <div class="ai-log" aria-live="polite">${has?aiMsgs(p.id):`<p class="ai-hi">${IC.spark}<span>Tanyakan apa saja tentang paragraf ini: makna kata, i'rab, maksud hukum, atau minta penjelasan yang lebih sederhana.</span></p>`}</div>
    <div class="ai-sug">${AI_SUG.map(s=>`<button type="button" data-ask="${esc(s[1])}">${esc(s[0])}</button>`).join("")}</div>
    <form class="ai-form" data-ai="${vi}"><textarea rows="1" maxlength="600" placeholder="Tulis pertanyaan tentang paragraf ini…" aria-label="Pertanyaan untuk Tanya AI"></textarea><button type="submit" aria-label="Kirim pertanyaan">${IC.send}</button></form>
    <p class="ai-note">Jawaban AI adalah alat bantu belajar, bukan fatwa. Bila ragu, tanyakan kepada guru.</p>
  </div>`;
}
function aiRefresh(art,pid){const log=art.querySelector(".ai-log");if(!log)return;log.innerHTML=aiMsgs(pid);const last=log.lastElementChild;if(!last)return;log.scrollTop=Math.max(0,last.offsetTop-log.offsetTop-8);try{art.querySelector(".ai").scrollIntoView({block:"nearest",behavior:"smooth"})}catch(_){}}
async function aiAsk(form,text){
  const p=VIEW[+form.dataset.ai];if(!p)return;
  const art=form.closest(".para"),ta=form.querySelector("textarea"),btn=form.querySelector("button");
  text=(text||ta.value).trim();if(!text||(CONV[p.id]&&CONV[p.id].busy))return;
  const c=CONV[p.id]=CONV[p.id]||[];
  const riwayat=c.filter(m=>m.role!=="err").slice(-6).map(m=>({role:m.role,content:m.content}));
  c.push({role:"user",content:text});c.busy=true;ta.value="";ta.style.height="";btn.disabled=true;aiRefresh(art,p.id);
  const b=BABS.find(x=>x.id===p.bab);
  const send=()=>fetch("/api/tanya",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({kitab:b.k,pid:p.id,judul:b.title,q:text,riwayat})});
  try{
    let r=await send();
    if(r.status===401&&window.EFQAuth){const ok=await EFQAuth.refresh();if(ok)r=await send();if(r.status===401){EFQAuth.toLogin();return}}
    const j=await r.json().catch(()=>({}));
    if(r.ok&&j.jawab)c.push({role:"assistant",content:j.jawab});
    else c.push({role:"err",content:j.pesan||"Maaf, terjadi kesalahan. Coba lagi."});
  }catch(_){c.push({role:"err",content:"Koneksi bermasalah. Periksa internet lalu coba lagi."})}
  finally{c.busy=false;btn.disabled=false;aiRefresh(art,p.id)}
}
function pager(b,view){
  const ai=AVAIL.findIndex(x=>x.id===b.id),pv=AVAIL[ai-1],nx=AVAIL[ai+1],pre=view==="map"?"peta-":"";
  return `<nav class="pager" aria-label="Bab sebelumnya dan berikutnya">${pv?`<a href="#${pre}${pv.id}" data-go="${pre}${pv.id}">${IC.chevL}<span><small>Sebelumnya</small><b>${esc(pv.title)}</b></span></a>`:""}${nx?`<a class="nx" href="#${pre}${nx.id}" data-go="${pre}${nx.id}"><span><small>Berikutnya</small><b>${esc(nx.title)}</b></span>${IC.chevR}</a>`:""}</nav>`;
}
function applyPrefs(){
  document.body.classList.toggle("hide-t",!pref.t);document.body.classList.toggle("hide-k",!pref.k);
  const t=$("#tgT"),k=$("#tgK"),v=$("#fsVal");if(t)t.setAttribute("aria-checked",pref.t);if(k)k.setAttribute("aria-checked",pref.k);if(v)v.textContent=(100+pref.size*10)+"%";
  document.querySelectorAll("[data-arf]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.arf===(pref.arf==="amiri"?"amiri":"naskh")));
  const base=window.innerWidth<768?25:30;document.documentElement.style.setProperty("--ar-size",Math.round(base*(1+pref.size*.1))+"px");
  if(pref.arf==="amiri")document.documentElement.setAttribute("data-arfont","amiri");else document.documentElement.removeAttribute("data-arfont");
  if(pref.theme)document.documentElement.setAttribute("data-theme",pref.theme);else document.documentElement.removeAttribute("data-theme");
  const mc=document.querySelector('meta[name="theme-color"]');if(mc)mc.setAttribute("content",getComputedStyle(document.documentElement).getPropertyValue("--surface").trim()||"#ffffff");
}

/* ---------- Mind map ---------- */
function parseMM(txt){
  const root={kids:[]};const st=[{d:-1,n:root}];
  (txt||"").split("\n").forEach(line=>{
    if(!line.trim())return;
    const d=Math.floor(line.match(/^ */)[0].length/2);let s=line.trim(),ref=null;
    const m=s.match(/\s@(\d+)(?:-(\d+))?$/);if(m){ref=[+m[1],+(m[2]||m[1])];s=s.slice(0,m.index).trim()}
    const ix=s.indexOf("|");const node={t:ix<0?s:s.slice(0,ix).trim(),ar:ix<0?"":s.slice(ix+1).trim(),ref,kids:[]};
    while(st.length>1&&st[st.length-1].d>=d)st.pop();
    st[st.length-1].n.kids.push(node);st.push({d,n:node});
  });
  return root.kids;
}
function autoMM(b){ // cadangan bila bab belum punya peta: tiap paragraf jadi cabang
  return babParas(b).map((p,i)=>{const m=(p.t.match(/\(([^)]{3,80})\)/)||[])[1];return {t:m?m.replace(/^./,c=>c.toUpperCase()):p.t.slice(0,70)+"…",ar:"",ref:[i+1,i+1],kids:[]}});
}
function mmOf(b){const t=KD[b.k]&&KD[b.k].mm[b.id];return t?parseMM(t):autoMM(b)}
function mmNode(n,d,bi,bab){
  const kids=n.kids||[];
  const refTx=n.ref?`<span class="mref">¶${n.ref[0]}${n.ref[1]!==n.ref[0]?"–"+n.ref[1]:""}</span>`:"";
  const inner=`${esc(n.t)}${refTx}${n.ar?`<span class="ar">${esc(n.ar)}</span>`:""}`;
  const target=n.go?` data-go="${n.go}"`:n.ref?` data-jump="${bab}:${n.ref[0]}"`:"";
  const lab=target?`<button class="mlab"${target} title="${n.go?"Buka mind map bab ini":"Buka paragraf "+n.ref[0]}">${inner}</button>`:`<span class="mlab">${inner}</span>`;
  const col=d===1?` style="--c:var(--b${bi%6})"`:"";
  return `<div class="mn d${d}${n.shut?" shut":""}"${col}><div class="ml">${lab}${kids.length?`<button class="mtg" data-mtg aria-expanded="${!n.shut}" aria-label="Lipat atau buka cabang">${kids.length}</button>`:""}</div>${kids.length?`<div class="mk">${kids.map((c,i)=>mmNode(c,d+1,d===0?i:bi,n.bab||bab)).join("")}</div>`:""}</div>`;
}
function mmTools(){
  return `<div class="mm-tools"><button class="chip plain" data-mmall="open">Buka semua</button><button class="chip plain" data-mmall="l1">Ringkas</button>
   <span class="fs" role="group" aria-label="Perbesar mind map"><button data-mz="-1" aria-label="Perkecil">−</button><button data-mz="1" aria-label="Perbesar">+</button></span>
   <span class="hint">Klik cabang bertanda ¶ untuk membuka paragrafnya. Klik angka bulat untuk melipat cabang. Geser kanvas untuk menjelajah.</span></div>`;
}
function mmCanvas(root){return `<div class="mm-canvas" id="mmc"><div class="mm" style="--mz:${pref.mz}">${mmNode(root,0,0,root.bab)}</div></div>`}

/* ---------- Tampilan ---------- */
function failHTML(){return `<div class="wrap"><div class="empty">Data kitab ini belum bisa dimuat. Periksa koneksi lalu muat ulang halaman.</div></div>`}
function needKitab(kid,msg){
  if(KD[kid])return false;
  $("#main").innerHTML=`<div class="wrap"><div class="loading">${esc(msg)}</div></div>`;
  const r=route;loadKitab(kid).then(()=>{if(route===r)render()}).catch(()=>{$("#main").innerHTML=failHTML()});
  return true;
}
/* ---------- Kamus kosakata ---------- */
const HIJ="ابتثجحخدذرزسشصضطظعغفقكلمنهوي".split("");
const HNORM={"أ":"ا","إ":"ا","آ":"ا","ٱ":"ا","ء":"ا","ؤ":"و","ئ":"ي","ى":"ي","ة":"ه"};
const JN={i:["Isim","اسم"],f:["Fi'il","فعل"],h:["Huruf","حرف"]};
const bareAr=s=>(s||"").replace(/[ً-ٰٟـ]/g,"").replace(/[^ء-يٱ]/g,"");
const kLetter=b=>{const c=HNORM[b[0]]||b[0];return HIJ.includes(c)?c:"ا"};
let KM=null,KMP=null;const KS={l:"ا",j:"",q:"",open:null};
function loadKamus(){
  if(KM)return Promise.resolve(KM);if(KMP)return KMP;
  const get=()=>fetch("data/kamus.json",{credentials:"same-origin"});
  KMP=get().then(r=>{if(r.status===401&&window.EFQAuth)return EFQAuth.refresh().then(ok=>ok?get():r).then(r2=>{if(r2.status===401){EFQAuth.toLogin();throw new Error("login")}return r2});return r})
    .then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})
    .then(j=>{j.e.forEach((e,i)=>{e.i=i;e.L=kLetter(e.b);e.mx=(e.m||[]).join(" · ").toLowerCase()});const cnt={};j.e.forEach(e=>{cnt[e.L]=(cnt[e.L]||0)+1});j.cnt=cnt;KM=j;return j})
    .catch(e=>{KMP=null;throw e});
  return KMP;
}
function kamusRows(list){
  return list.map(e=>`<details class="ke" data-ke="${e.i}"${KS.open===e.i?" open":""}><summary><span class="ke-a">${esc(e.a)}</span><span class="ke-j j-${e.j}">${JN[e.j][0]}</span><span class="ke-m">${esc((e.m||[]).join(" · ")||"—")}</span><span class="ke-n" title="Muncul ${fmt(e.n)} kali dalam kitab">${fmt(e.n)}×</span></summary><div class="ke-body">${KS.open===e.i?kamusBody(e):""}</div></details>`).join("");
}
function kamusBody(e){
  const forms=(e.v||[]).map(v=>`<span class="ar">${esc(v)}</span>`).join("");
  const refs=(e.r||[]).map(r=>{const b=BABS.find(x=>x.id===r[1]);const v=typeof r[2]==="number"?e.v[r[2]]:r[2];
    return `<li><span class="ar">${esc(v)}</span><span class="rm">${esc(r[3]||"")}</span>${b?`<a href="#${b.id}" data-go="${b.id}" data-para="${esc(r[0])}">${esc(b.kt)} · ${esc(b.title)}</a>`:""}</li>`}).join("");
  return `<div class="ke-row"><b>Jenis</b><span>${JN[e.j][0]} <span class="ar">(${JN[e.j][1]})</span></span></div>
    <div class="ke-row"><b>Makna dalam kitab</b><span>${esc((e.m||[]).join("; ")||"—")}</span></div>
    <div class="ke-row"><b>Bentuk yang muncul</b><span class="ke-forms">${forms}</span></div>
    <div class="ke-ex"><b>Contoh pemakaian${e.n>e.r.length?` (${e.r.length} dari ${fmt(e.n)})`:""}</b><ul>${refs}</ul></div>`;
}
function kamusList(){
  if(!KM)return [];
  let L=KM.e;
  if(KS.j)L=L.filter(e=>e.j===KS.j);
  const qq=KS.q.trim();
  if(qq){const qa=bareAr(qq),ql=qq.toLowerCase();
    if(qa){const nq=norm(qa);L=L.filter(e=>e.b.includes(qa)||norm(e.b).includes(nq));
      L=L.slice().sort((a,b)=>((a.b===qa?0:a.b.startsWith(qa)?1:2)-(b.b===qa?0:b.b.startsWith(qa)?1:2))||a.i-b.i)}
    else{const wre=new RegExp("(^|[^a-z])"+ql.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
      const rank=e=>{const ms=(e.m||[]).map(x=>x.toLowerCase());if(ms[0]===ql)return 0;if(ms.includes(ql))return 1;if(ms.some(x=>x.startsWith(ql+" ")))return 2;if(wre.test(e.mx))return 3;return e.mx.includes(ql)?4:9};
      L=L.map(e=>[rank(e),e]).filter(x=>x[0]<9).sort((a,b)=>a[0]-b[0]||b[1].n-a[1].n).map(x=>x[1])}
  }else L=L.filter(e=>e.L===KS.l);
  return L;
}
function kamusResults(){
  const L=kamusList(),max=KS.q?300:1500,shown=L.slice(0,max);
  const info=KS.q?`${fmt(L.length)} kosakata cocok${L.length>max?`, ditampilkan ${max} pertama`:""}.`:`Huruf <bdi class="ar">${KS.l}</bdi> · ${fmt(L.length)} kosakata${KS.j?" ("+JN[KS.j][0]+")":""}.`;
  return `<p class="km-info">${info}</p>${shown.length?`<div class="km-list">${kamusRows(shown)}</div>`:`<div class="empty">Tidak ada kosakata yang cocok. Coba tulis tanpa harakat, misalnya <b class="ar">صلاة</b>, atau arti Indonesia seperti <b>shalat</b>.</div>`}`;
}
function renderKamus(opt){
  if(!KM){$("#main").innerHTML=`<div class="wrap"><div class="loading">Memuat kamus…</div></div>`;const r=route;loadKamus().then(()=>{if(route===r)renderKamus(opt)}).catch(()=>{$("#main").innerHTML=failHTML()});return}
  if(opt&&opt.kamus!=null){const e=KM.e[opt.kamus];if(e){KS.q="";KS.j="";KS.l=e.L;KS.open=e.i}}
  const c={i:0,f:0,h:0};KM.e.forEach(e=>c[e.j]++);
  const letters=HIJ.map(h=>`<button class="km-l${!KS.q&&KS.l===h?" on":""}" data-kl="${h}"${KM.cnt[h]?"":" disabled"} aria-label="Huruf ${h}">${h}</button>`).join("");
  $("#main").innerHTML=`<div class="wrap"><header class="head"><div class="eyebrow">Kamus</div><h1>Kamus Kosakata</h1><div class="ar-title">مُعْجَمُ الْأَلْفَاظِ</div>
    <p>Semua kosakata yang muncul dalam kitab, baik isim, fi'il, maupun huruf, diurutkan menurut abjad hijaiyah. Kata yang diawali <span class="ar">وَ، فَ، بِ، لِ، كَ</span> atau <span class="ar">الْ</span> dikelompokkan ke bentuk dasarnya. Klik kosakata untuk melihat makna, bentuk yang muncul, dan contoh paragrafnya.</p>
    <div class="meta-row"><span class="tag">${fmt(KM.e.length)} kosakata</span><span class="tag">${fmt(c.i)} isim</span><span class="tag">${fmt(c.f)} fi'il</span><span class="tag">${fmt(c.h)} huruf</span></div></header>
    <div class="km-tools"><label class="km-q">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'}<input id="kq" type="search" placeholder="Cari kata Arab atau arti Indonesia" value="${esc(KS.q)}" aria-label="Cari di kamus"></label>
     <div class="seg km-j" role="group" aria-label="Jenis kata">${[["","Semua"],["i","Isim"],["f","Fi'il"],["h","Huruf"]].map(([k,l])=>`<button data-kj="${k}" aria-pressed="${KS.j===k}">${l}</button>`).join("")}</div></div>
    <nav class="km-letters" aria-label="Abjad hijaiyah">${letters}</nav>
    <div id="kmRes">${kamusResults()}</div></div>`;
  document.documentElement.style.setProperty("--kmtop","12px");
  if(KS.open!=null){const d=document.querySelector(`[data-ke="${KS.open}"]`);if(d)requestAnimationFrame(()=>d.scrollIntoView({block:"center"}))}
}
function kamusUpdate(){const r=$("#kmRes");if(r)r.innerHTML=kamusResults();document.querySelectorAll(".km-l").forEach(b=>b.classList.toggle("on",!KS.q&&b.dataset.kl===KS.l));document.querySelectorAll("[data-kj]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.kj===KS.j))}
document.addEventListener("toggle",e=>{const d=e.target;if(!d.classList||!d.classList.contains("ke")||!d.open)return;const en=KM&&KM.e[+d.dataset.ke];if(!en)return;KS.open=en.i;const b=d.querySelector(".ke-body");if(!b.innerHTML)b.innerHTML=kamusBody(en)},true);
document.addEventListener("click",e=>{
  const l=e.target.closest("[data-kl]");if(l){KS.l=l.dataset.kl;KS.q="";KS.open=null;const i=$("#kq");if(i)i.value="";kamusUpdate();const r=$("#kmRes");if(r&&r.getBoundingClientRect().top<0)r.scrollIntoView({block:"start"});return}
  const j=e.target.closest("[data-kj]");if(j){KS.j=j.dataset.kj;KS.open=null;kamusUpdate();return}
  const k=e.target.closest("[data-kamus]");if(k){const key=k.dataset.kamus;$("#sheet").hidden=true;loadKamus().then(m=>{const i=m.s[key];go("kamus",{kamus:i})}).catch(()=>go("kamus"));return}
});
let kqt;document.addEventListener("input",e=>{if(e.target.id!=="kq")return;clearTimeout(kqt);kqt=setTimeout(()=>{KS.q=e.target.value;KS.open=null;kamusUpdate()},200)});
/* ---------- Aplikasi: pasang (PWA) & baca offline ---------- */
const APP_ON=!!window.EFQAuth&&"serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost");
const isStandalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
let installEvt=null,offInfo={n:null,busy:false,done:0};
function appCard(){
  const inst=isStandalone()?`<span class="app-ok">${IC.check}Aplikasi sudah terpasang</span>`
    :installEvt?`<button class="btn pri" id="installBtn">${IC.dl}Pasang aplikasi</button>`
    :isIOS?`<p class="app-hint">Di iPhone/iPad: buka di <b>Safari</b>, ketuk tombol <b>Bagikan</b> lalu pilih <b>Tambah ke Layar Utama</b>.</p>`
    :`<p class="app-hint">Buka menu browser (⋮) lalu pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.</p>`;
  const total=IDX.length,n=offInfo.n;
  const off=offInfo.busy?`<button class="btn" disabled>${IC.dl}Mengunduh ${offInfo.done}/${total} kitab…</button>`
    :`<button class="btn${n===total?"":" pri-soft"}" id="offBtn">${IC.dl}${n===total?"Perbarui simpanan offline":"Simpan semua kitab untuk offline"}</button>`;
  return `<section class="appcard" id="appCard"><div class="app-ic"><img src="/icons/icon-192.png" alt="" width="56" height="56"></div>
    <div class="app-tx"><h2>Pasang sebagai aplikasi</h2><p>Buka langsung dari layar utama HP atau laptop, tampil layar penuh, dan tetap bisa dibaca tanpa internet setelah kitab disimpan.</p>
    <div class="btns">${inst}${off}</div>
    <p class="app-st">${n==null?"Memeriksa simpanan offline…":n===total?`${IC.check}Semua ${total} kitab tersimpan dan bisa dibaca offline.`:`${n} dari ${total} kitab tersimpan offline.`} Tanya AI tetap memerlukan internet.</p></div></section>`;
}
function refreshAppCard(){const c=$("#appCard");if(c)c.outerHTML=appCard()}
async function countOffline(){try{const c=await caches.open("efq-data-v2");const ks=await c.keys();offInfo.n=IDX.filter(k=>ks.some(r=>new URL(r.url,location.href).pathname==="/data/"+k.id+".json")).length}catch(_){offInfo.n=0}refreshAppCard()}
async function saveOffline(){
  if(offInfo.busy)return;offInfo.busy=true;offInfo.done=0;refreshAppCard();
  try{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>{navigator.serviceWorker.addEventListener("controllerchange",r,{once:true});setTimeout(r,6000)})}catch(_){}
  let fail=0;
  for(const k of IDX){try{const r=await fetch("data/"+k.id+".json",{credentials:"same-origin",cache:"no-cache"});if(r.status===401&&window.EFQAuth){await EFQAuth.refresh();const r2=await fetch("data/"+k.id+".json",{credentials:"same-origin"});if(!r2.ok)fail++}else if(!r.ok)fail++}catch(_){fail++}offInfo.done++;refreshAppCard()}
  try{await fetch("data/kamus.json",{credentials:"same-origin",cache:"no-cache"})}catch(_){}
  offInfo.busy=false;await countOffline();if(fail)alertBar(fail+" kitab gagal diunduh. Periksa koneksi lalu coba lagi.");
}
function alertBar(t){const c=$("#appCard .app-st");if(c)c.textContent=t}
if(APP_ON){
  window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").then(()=>countOffline()).catch(()=>{offInfo.n=0;refreshAppCard()})});
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvt=e;refreshAppCard()});
  window.addEventListener("appinstalled",()=>{installEvt=null;refreshAppCard()});
  document.addEventListener("click",async e=>{
    if(e.target.closest("#installBtn")&&installEvt){const ev=installEvt;installEvt=null;ev.prompt();try{await ev.userChoice}catch(_){}refreshAppCard();return}
    if(e.target.closest("#offBtn"))saveOffline();
  });
}
function renderHome(){
  const H=HIST.all();const cur=H[0],cb=cur&&BABS.find(b=>b.id===cur.bab);
  const pct=cb?Math.round(((cur.i||0)+1)/cb.n*100):0;
  const cont=cb?`<section class="cont" aria-label="Lanjutkan membaca"><div class="cont-top"><div class="tx"><small>Kitab ${cb.ki+1} · ${esc(cb.kt)}</small><b>${esc(cb.title)}</b><span class="ar">${cb.ar}</span></div></div>
      <div class="pbar" aria-hidden="true"><i style="width:${cur.pid?pct:2}%"></i></div>
      <div class="cont-foot"><span>${cur.pid?`Paragraf ${(cur.i||0)+1} dari ${cb.n}`:`${cb.n} paragraf`}${cur.t?" · "+ago(cur.t):""}</span><a class="btn pri" href="#${cb.id}" data-go="${cb.id}"${cur.pid?` data-para="${esc(cur.pid)}"`:""}>${IC.book}Lanjutkan</a></div></section>`
    :`<section class="cont" aria-label="Mulai membaca"><div class="cont-top"><div class="tx"><small>Mulai dari awal kitab</small><b>${esc(AVAIL[0].title)}</b><span class="ar">${AVAIL[0].ar}</span></div></div>
      <div class="cont-foot"><span>${IDX.length} kitab · ${BABS.length} bab · ${fmt(TOT.p)} paragraf</span><a class="btn pri" href="#${AVAIL[0].id}" data-go="${AVAIL[0].id}">${IC.book}Mulai membaca</a></div></section>`;
  const recent=H.slice(1,5).map(x=>{const b=BABS.find(y=>y.id===x.bab);return `<a class="row" href="#${b.id}" data-go="${b.id}"${x.pid?` data-para="${esc(x.pid)}"`:""}><span class="num">${IC.clock.replace("<svg",'<svg width="16" height="16"')}</span><span class="tx"><b>${esc(b.title)}</b><small>${esc(b.kt)}${x.t?" · "+ago(x.t):""}</small></span><span class="end">${IC.chevR.replace("<svg",'<svg class="chev"')}</span></a>`}).join("");
  const kits=IDX.map((k,i)=>{const n=k.babs.reduce((a,b)=>a+b.n,0);return `<a class="row" href="#daftar-${k.id}" data-go="daftar-${k.id}"><span class="num">${i+1}</span><span class="tx"><b>${esc(k.title)}</b><small>${k.babs.length} bab · ${fmt(n)} paragraf</small></span><span class="end">${IC.chevR.replace("<svg",'<svg class="chev"')}</span></a>`}).join("");
  $("#main").innerHTML=`<div class="wrap">
   <section class="intro"><div class="intro-t"><div><div class="intro-ar">فَتْحُ الْقَرِيْبِ الْمُجِيْبِ</div><h1>Kitab Fathul Qorib, kata demi kata</h1><p>Matan Abu Syuja' dan syarah Ibnu Qasim lengkap dengan makna, kedudukan, i'rab, dan penjelasan.</p></div></div>
     <label class="field"><span class="sr">Cari</span>${IC.search}<input id="hq" type="search" placeholder="Cari bab, lafadz Arab, atau kata Indonesia" autocomplete="off" enterkeyhint="search"></label></section>
   <div class="sec-h"><h2>${cb?"Lanjutkan membaca":"Mulai membaca"}</h2></div>
   ${cont}
   ${recent?`<div class="sec-h"><h2>Riwayat bacaan</h2><a href="#tersimpan" data-go="tersimpan">Lihat semua</a></div><div class="rows">${recent}</div>`:""}
   <div class="sec-h"><h2>Daftar kitab</h2><a href="#daftar" data-go="daftar">Semua bab</a></div>
   <div class="kits">${kits}</div>
   ${APP_ON?appCard():""}
   <p class="foot-note">Teks Arab diambil dari edisi digital Fathul Qorib (OpenITI, salinan Maktabah Syamilah) lalu diberi harakat. Makna, i'rab, penjelasan, dan mind map adalah bantuan belajar; cocokkan dengan kitab cetak dan bimbingan guru. Lafadz bertinta <b style="color:var(--matan)">merah</b> adalah matan Abu Syuja'.</p>
  </div>`;
}
function renderDaftar(kid,opt){
  const lastBab=(HIST.all()[0]||{}).bab;
  const groups=IDX.map((k,i)=>`<section class="kgroup" id="kg-${k.id}" data-kg><div class="kgroup-h"><span class="num">${String(i+1).padStart(2,"0")}</span><h2>${esc(k.title)}</h2><a href="#kitab-${k.id}" data-go="kitab-${k.id}">${IC.map}Mind map</a></div>
    <div class="rows">${k.babs.map((b,j)=>`<a class="row${b.id===lastBab?" on":""}" href="#${b.id}" data-go="${b.id}" data-f="${esc(norm(b.title+" "+b.ar+" "+(b.desc||"")+" "+k.title))}"><span class="num">${j+1}</span><span class="tx"><b>${esc(b.title)}</b><small>${b.n} paragraf${b.id===lastBab?" · terakhir dibaca":""}</small></span><span class="end"><span class="ar">${esc(b.ar.length>26?"":b.ar)}</span>${IC.chevR.replace("<svg",'<svg class="chev"')}</span></a>`).join("")}</div></section>`).join("");
  $("#main").innerHTML=`<div class="wrap">
    <header class="head"><div class="eyebrow">Daftar isi</div><h1>Daftar Bab</h1><p>${IDX.length} kitab dan ${BABS.length} bab, sesuai urutan kitab Fathul Qorib.</p></header>
    <div class="fl-bar"><label class="field"><span class="sr">Saring bab</span>${IC.search}<input id="dq" type="search" placeholder="Saring bab, misalnya wudhu atau zakat" autocomplete="off"></label></div>
    <div id="dlist">${groups}</div><div class="empty" id="dnone" hidden>Tidak ada bab yang cocok.</div></div>`;
  if(kid){const g=document.getElementById("kg-"+kid);if(g)requestAnimationFrame(()=>g.scrollIntoView({block:"start"}))}
}
function filterDaftar(v){
  const n=norm(v);let any=0;
  document.querySelectorAll("#dlist [data-kg]").forEach(g=>{let c=0;g.querySelectorAll("[data-f]").forEach(a=>{const ok=!n||a.dataset.f.includes(n);a.hidden=!ok;if(ok)c++});g.hidden=!c;any+=c});
  const e=$("#dnone");if(e)e.hidden=!!any;
}
/* ---------- Pencarian ---------- */
function hl(t,qn){if(!qn||/[؀-ۿ]/.test(qn))return esc(t);const i=t.toLowerCase().indexOf(qn);if(i<0)return esc(t);return esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+qn.length))+"</mark>"+esc(t.slice(i+qn.length))}
function renderCari(){
  $("#main").innerHTML=`<div class="wrap">
    <header class="head"><div class="eyebrow">Pencarian</div><h1>Cari di kitab</h1><p>Cari judul bab, lafadz Arab (boleh tanpa harakat), atau kata Indonesia dalam makna dan terjemah.</p></header>
    <label class="field sfield"><span class="sr">Kata kunci</span>${IC.search}<input id="sq" type="search" placeholder="Contoh: wudhu, ماء, zakat fitrah" value="${esc(SQ)}" autocomplete="off" enterkeyhint="search"></label>
    <div id="sres"></div></div>`;
  updateCari();
}
let cariTok=0;
function updateCari(){
  const box=$("#sres");if(!box)return;
  const raw=SQ.trim(),qn=norm(raw);
  if(qn.length<2){box.innerHTML=`<div class="empty"><p style="margin:0 0 12px">Ketik minimal 2 huruf. Coba salah satu:</p><div class="btns" style="justify-content:center">${["wudhu","ماء","shalat jumat","zakat"].map(x=>`<button class="chip" data-sq="${esc(x)}">${esc(x)}</button>`).join("")}</div></div>`;return}
  const babHits=BABS.filter(b=>b.n&&norm(b.title+" "+b.ar+" "+(b.desc||"")+" "+b.kt).includes(qn)).slice(0,20);
  const babRows=babHits.map(b=>`<a class="row" href="#${b.id}" data-go="${b.id}"><span class="num">${IC.book.replace("<svg",'<svg width="16" height="16"')}</span><span class="tx"><b>${hl(b.title,qn)}</b><small>${esc(b.kt)} · ${b.n} paragraf</small></span><span class="end">${IC.chevR.replace("<svg",'<svg class="chev"')}</span></a>`).join("");
  const kamusRow=`<a class="row" href="#kamus" data-kamusq="${esc(raw)}"><span class="num">${IC.dict.replace("<svg",'<svg width="16" height="16"')}</span><span class="tx"><b>Cari “${esc(raw)}” di kamus</b><small>Makna kosakata, bentuk kata, dan contoh pemakaiannya</small></span><span class="end">${IC.chevR.replace("<svg",'<svg class="chev"')}</span></a>`;
  const need=IDX.filter(k=>!KD[k.id]);
  let paraHTMLs;
  if(need.length){
    paraHTMLs=`<div class="loading">Memuat isi kitab untuk pencarian teks…</div>`;
    const tok=++cariTok;Promise.all(need.map(k=>loadKitab(k.id))).then(()=>{if(tok===cariTok&&route.v==="cari")updateCari()}).catch(()=>{const pr=$("#pres");if(pr)pr.innerHTML=`<div class="empty">Isi kitab belum bisa dimuat. Periksa koneksi lalu coba lagi.</div>`});
  }else{
    const all=IDX.flatMap(k=>KD[k.id].paras);
    const hits=all.filter(p=>p.words.some(w=>norm(w.a).includes(qn)||(w.t||"").toLowerCase().includes(qn))||(p.t||"").toLowerCase().includes(qn));
    const rows=hits.slice(0,50).map(p=>{const b=BABS.find(x=>x.id===p.bab);const no=babParas(b).indexOf(p)+1;
      let wi=p.words.findIndex(w=>norm(w.a).includes(qn)||(w.t||"").toLowerCase().includes(qn));if(wi<0)wi=0;const st=Math.max(0,wi-4);
      const ar=p.words.slice(st,st+12).map((w,j)=>st+j===wi&&(norm(w.a).includes(qn)||(w.t||"").toLowerCase().includes(qn))?`<mark>${esc(w.a)}</mark>`:esc(w.a)).join(" ");
      return `<a class="row" href="#${b.id}" data-go="${b.id}" data-para="${p.id}"><span class="num">${no}</span><span class="tx"><small>${esc(b.kt)} · ${esc(b.title)}</small><span class="ar">${st?"… ":""}${ar} …</span><span class="snip">${hl(p.t||"",qn)}</span></span><span class="end">${IC.chevR.replace("<svg",'<svg class="chev"')}</span></a>`}).join("");
    paraHTMLs=hits.length?`<p class="km-info">${fmt(hits.length)} paragraf ditemukan${hits.length>50?", ditampilkan 50 pertama. Perjelas kata kunci untuk mempersempit hasil":""}.</p><div class="rows">${rows}</div>`
      :`<div class="empty">Tidak ada paragraf yang cocok. Coba lafadz tanpa harakat, misalnya <b class="ar">ماء</b>, atau kata Indonesia seperti <b>air</b>.</div>`;
  }
  box.innerHTML=`${babRows?`<div class="sec-h"><h2>Bab</h2><span class="km-info" style="margin:0">${babHits.length} cocok</span></div><div class="rows">${babRows}</div>`:""}
    <div class="sec-h"><h2>Kosakata</h2></div><div class="rows">${kamusRow}</div>
    <div class="sec-h"><h2>Paragraf</h2></div><div id="pres">${paraHTMLs}</div>`;
}
/* ---------- Tersimpan: penanda & riwayat ---------- */
function renderSaved(){
  const B=BM.all(),H=HIST.all();
  const bms=B.map(x=>{const b=BABS.find(y=>y.id===x.bab);if(!b)return "";return `<div class="row"><a class="num" href="#${b.id}" data-go="${b.id}" data-para="${esc(x.id)}" style="text-decoration:none">${x.no||"¶"}</a>
      <a class="tx" href="#${b.id}" data-go="${b.id}" data-para="${esc(x.id)}" style="text-decoration:none"><small>${esc(b.kt)} · ${esc(b.title)} · ${ago(x.t)}</small><span class="ar">${esc(x.ar)}</span><span class="snip">${esc(x.tr)}</span></a>
      <span class="end"><button class="ibtn" data-bmdel="${esc(x.id)}" aria-label="Hapus penanda">${IC.trash}</button></span></div>`}).join("");
  const hs=H.map(x=>{const b=BABS.find(y=>y.id===x.bab);return `<a class="row" href="#${b.id}" data-go="${b.id}"${x.pid?` data-para="${esc(x.pid)}"`:""}><span class="num">${IC.clock.replace("<svg",'<svg width="16" height="16"')}</span><span class="tx"><b>${esc(b.title)}</b><small>${esc(b.kt)}${x.pid?` · paragraf ${(x.i||0)+1} dari ${b.n}`:""}${x.t?" · "+ago(x.t):""}</small></span><span class="end">${IC.chevR.replace("<svg",'<svg class="chev"')}</span></a>`}).join("");
  $("#main").innerHTML=`<div class="wrap">
    <header class="head"><div class="eyebrow">Tersimpan</div><h1>Penanda &amp; Riwayat</h1><p>Disimpan di perangkat dan browser ini saja.</p></header>
    <div class="sec-h"><h2>Penanda paragraf</h2><span class="km-info" style="margin:0">${B.length}</span></div>
    ${bms?`<div class="rows">${bms}</div>`:`<div class="card empty" style="padding:28px 16px">Belum ada penanda. Ketuk ikon ${IC.bm.replace("<svg",'<svg width="16" height="16" style="vertical-align:-3px"')} di pojok paragraf untuk menyimpannya di sini.</div>`}
    <div class="sec-h"><h2>Riwayat bacaan</h2>${H.length?`<button id="histClear">Hapus riwayat</button>`:""}</div>
    ${hs?`<div class="rows">${hs}</div>`:`<div class="card empty" style="padding:28px 16px">Belum ada riwayat bacaan.</div>`}
  </div>`;
}
function renderRead(b,opt){
  if(needKitab(b.k,"Memuat "+b.kt+"…"))return;
  const ps=babParas(b);VIEW=ps;HIST.open(b.id);
  $("#main").innerHTML=bar(b,"read")+`<div class="wrap">${head(b)}${ps.map((p,i)=>paraHTML(p,i)).join("")}${pager(b,"read")}</div>`;
  applyPrefs();
  const nx=AVAIL[AVAIL.findIndex(x=>x.id===b.id)+1];if(nx&&!KD[nx.k])loadKitab(nx.k).catch(()=>{});
  if(opt&&opt.para){const el=document.getElementById("p-"+opt.para);if(el){el.scrollIntoView({block:"start"});el.classList.add("flash")}}
}
function renderMap(b){
  if(needKitab(b.k,"Memuat "+b.kt+"…"))return;
  const kids=mmOf(b);const auto=!(KD[b.k].mm[b.id]);
  const cnt=n=>n.kids.reduce((s,c)=>s+1+cnt(c),0);
  if(kids.reduce((s,c)=>s+1+cnt(c),0)>36)kids.forEach(c=>c.kids.forEach(g=>{if(g.kids.length)g.shut=true}));
  const root={t:b.title,ar:b.ar,kids,bab:b.id};
  $("#main").innerHTML=bar(b,"map")+`<div class="wrap wide">${head(b)}${mmTools()}${mmCanvas(root)}${auto?`<div class="mm-legend">Peta ini disusun otomatis dari paragraf bab.</div>`:""}${pager(b,"map")}</div>`;
  centerMM();
}
function renderKMap(kid){
  const k=IDX.find(x=>x.id===kid);
  if(needKitab(kid,"Memuat "+k.title+"…"))return;
  const babs=BABS.filter(b=>b.k===kid);
  const root={t:"Kitab "+k.title,ar:k.ar,kids:babs.map(b=>({t:b.title,ar:"",go:"peta-"+b.id,bab:b.id,shut:babs.length>8,kids:mmOf(b).map(n=>({t:n.t,ar:"",ref:n.ref,kids:[]}))}))};
  const n=babs.reduce((a,b)=>a+b.n,0);
  const seg=`<div class="seg"><button data-go="${babs[0].id}" aria-pressed="false" aria-label="Mulai baca">${IC.book}<span class="lbl">Mulai baca</span></button><button aria-pressed="true" aria-label="Mind map kitab">${IC.map}<span class="lbl">Mind map</span></button></div>`;
  $("#main").innerHTML=pageBar({back:"daftar-"+kid,backLabel:"Kembali ke daftar bab",sub:"Kitab "+(IDX.indexOf(k)+1)+" dari "+IDX.length,title:"Mind map "+esc(k.title),seg})+`<div class="wrap wide"><header class="head"><div class="eyebrow">Kitab ${IDX.indexOf(k)+1} dari ${IDX.length}</div><h1>Mind map ${esc(k.title)}</h1><div class="ar-title">${k.ar}</div>
   <p>Gambaran seluruh bab dalam kitab ini. Klik nama bab untuk membuka mind map lengkapnya, atau pokok bahasan bertanda ¶ untuk langsung membaca paragrafnya.</p>
   <div class="meta-row"><span class="tag">${babs.length} bab</span><span class="tag">${fmt(n)} paragraf</span></div></header>
   ${mmTools()}${mmCanvas(root)}</div>`;
  centerMM();
}
function render(opt){
  applyPrefs();toc();
  const m=$("#main");
  if(route.v==="read")renderRead(BABS.find(b=>b.id===route.bab),opt);
  else if(route.v==="map")renderMap(BABS.find(b=>b.id===route.bab));
  else if(route.v==="kmap")renderKMap(route.k);
  else if(route.v==="kamus")renderKamus(opt);
  else if(route.v==="daftar")renderDaftar(route.k,opt);
  else if(route.v==="cari")renderCari();
  else if(route.v==="saved")renderSaved();
  else if(route.v==="lat")renderLat(route.s);
  else if(route.v==="kal")renderKal(route.s);
  else renderHome();
  if(!(opt&&opt.para)&&!(route.v==="daftar"&&route.k))m.scrollTop=0;
  onScroll();
  if(opt&&opt.focus){const f=$(opt.focus);if(f)f.focus()}
}

/* ---------- Mind map: interaksi ---------- */
function centerMM(){const c=$("#mmc");if(!c)return;requestAnimationFrame(()=>{c.scrollLeft=0})}
function mmAll(mode){
  document.querySelectorAll("#mmc .mn").forEach(n=>{const d=+(n.className.match(/d(\d)/)||[0,0])[1];const sh=mode==="l1"?d>=1:false;n.classList.toggle("shut",sh&&!!n.querySelector(":scope>.mk"));const t=n.querySelector(":scope>.ml>.mtg");if(t)t.setAttribute("aria-expanded",!sh)});
  centerMM();
}
(function pan(){
  let s=null;
  document.addEventListener("pointerdown",e=>{const c=e.target.closest("#mmc");if(!c||e.button!==0||e.pointerType==="touch"||e.target.closest("button"))return;s={c,x:e.clientX,y:e.clientY,l:c.scrollLeft,t:c.scrollTop};c.classList.add("drag")});
  document.addEventListener("pointermove",e=>{if(!s)return;s.c.scrollLeft=s.l-(e.clientX-s.x);s.c.scrollTop=s.t-(e.clientY-s.y)});
  document.addEventListener("pointerup",()=>{if(s){s.c.classList.remove("drag");s=null}});
})();

/* ---------- Kartu kata ---------- */
function showWord(vi,wi,el){
  document.querySelectorAll(".w.sel").forEach(x=>x.classList.remove("sel"));el.classList.add("sel");
  const p=VIEW[vi],w=p.words[wi],k=K[w.k]||K.hr;
  const nw=norm(w.a);const r=p.irob.find(r=>{const na=norm(r.a);return na&&(na===nw||na.split(" ").includes(nw))})||p.irob.find(r=>r.a.split(" ").map(core).includes(core(w.a)));
  $("#sheet").innerHTML=`<button class="x" id="sx" aria-label="Tutup">×</button>
   <div class="big${w.m?" m":""}">${esc(w.a)}</div>
   <dl><dt>Makna</dt><dd>${esc(w.t)}</dd><dt>Kedudukan</dt><dd><span class="kb k-${k[3]}">${k[2]}</span>${esc(k[0])} <span class="ar">(${k[1]})</span></dd><dt>Sumber</dt><dd>${w.m?"Lafadz matan (Abu Syuja')":"Lafadz syarah (Ibnu Qasim)"}</dd></dl>
   ${r?`<div class="note"><b>I'rab:</b> ${esc(r.x)}${r.au?' <em class="aut">otomatis</em>':""}</div>`:""}
   <button class="btn sheet-k" data-kamus="${esc(bareAr(w.a)+"|"+({fi:"f",jr:"h",hr:"h"}[w.k]||"i"))}">${IC.dict}Lihat di kamus</button>`;
  $("#sheet").hidden=false;$("#sx").onclick=()=>{$("#sheet").hidden=true;el.classList.remove("sel")};
}

/* ---------- Event ---------- */
function closeRset(){const r=$("#rset");if(r&&!r.hidden){r.hidden=true;const b=$("#rsetBtn");if(b)b.setAttribute("aria-expanded","false")}}
document.addEventListener("click",e=>{
  if(!e.target.closest("#rset,#rsetBtn"))closeRset();
  const g=e.target.closest("[data-go]");
  if(g){e.preventDefault();if(g.getAttribute("aria-pressed")==="true"&&!g.dataset.para)return;
    const id=g.dataset.go;go(id,{para:g.dataset.para,focus:id==="cari"&&window.innerWidth>=768?"#sq":null});return;}
  const kq=e.target.closest("[data-kamusq]");if(kq){e.preventDefault();const si=$("#sq");KS.q=((si&&si.value)||kq.dataset.kamusq).trim();KS.open=null;go("kamus");return}
  const sqb=e.target.closest("[data-sq]");if(sqb){SQ=sqb.dataset.sq;const i=$("#sq");if(i)i.value=SQ;updateCari();return}
  const j=e.target.closest("[data-jump]");
  if(j){const [bab,n]=j.dataset.jump.split(":");const b=BABS.find(x=>x.id===bab);const p=babParas(b)[+n-1];go(bab,{para:p&&p.id});return;}
  const tg=e.target.closest("[data-mtg]");
  if(tg){const n=tg.closest(".mn");n.classList.toggle("shut");tg.setAttribute("aria-expanded",!n.classList.contains("shut"));return;}
  const ma=e.target.closest("[data-mmall]");if(ma){mmAll(ma.dataset.mmall);return;}
  const mz=e.target.closest("[data-mz]");
  if(mz){pref.mz=Math.min(1.5,Math.max(.7,Math.round((pref.mz+(+mz.dataset.mz)*.1)*10)/10));store.set("mz",pref.mz);const m=$("#mmc .mm");if(m)m.style.setProperty("--mz",pref.mz);return;}
  const w=e.target.closest(".w");if(w){showWord(+w.dataset.v,+w.dataset.w,w);return;}
  const cp=e.target.closest("[data-copy]");
  if(cp){const p=VIEW[+cp.dataset.copy];const tx=p.words.map(x=>x.a).join(" ");const old=cp.innerHTML;const done=()=>{cp.innerHTML=IC.check;cp.setAttribute("aria-label","Tersalin");setTimeout(()=>{cp.innerHTML=old;cp.setAttribute("aria-label","Salin teks Arab")},1500)};
    try{navigator.clipboard.writeText(tx).then(done,()=>{fallbackCopy(tx);done()})}catch(_){fallbackCopy(tx);done()}return;}
  const bmb=e.target.closest("[data-bm]");
  if(bmb){const p=VIEW[+bmb.dataset.bm];if(!p)return;const on=BM.toggle(p);bmb.setAttribute("aria-pressed",on);bmb.setAttribute("aria-label",on?"Hapus penanda":"Tandai paragraf ini");bmb.title=on?"Hapus penanda":"Tandai paragraf";toc();return}
  const bd=e.target.closest("[data-bmdel]");if(bd){BM.del(bd.dataset.bmdel);renderSaved();toc();return}
  if(e.target.closest("#histClear")){HIST.clear();renderSaved();return}
  const ask=e.target.closest("[data-ask]");
  if(ask){const f=ask.closest(".pane").querySelector(".ai-form");aiAsk(f,ask.dataset.ask);return;}
  const t=e.target.closest("[data-tab]");
  if(t){const art=t.closest(".para");const was=t.getAttribute("aria-selected")==="true";const nt=was?"x":t.dataset.tab;
    if(t.dataset.tab!=="a"){pref.tab=nt;store.set("tab",nt)}
    art.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-selected",b===t&&!was));
    art.querySelectorAll("[data-pane]").forEach(p=>p.hidden=p.dataset.pane!==nt);
    if(nt==="a"){const ta=art.querySelector(".ai-form textarea");if(ta&&window.innerWidth>=768)ta.focus()}return;}
  if(e.target.closest("#rsetBtn")){const r=$("#rset"),b=$("#rsetBtn");r.hidden=!r.hidden;b.setAttribute("aria-expanded",!r.hidden);return}
  if(e.target.closest("#tgT")){pref.t=!pref.t;store.set("t",pref.t);applyPrefs();return}
  if(e.target.closest("#tgK")){pref.k=!pref.k;store.set("k",pref.k);applyPrefs();return}
  if(e.target.closest("#fsPlus")){pref.size=Math.min(5,pref.size+1);store.set("size",pref.size);applyPrefs();return}
  if(e.target.closest("#fsMinus")){pref.size=Math.max(-2,pref.size-1);store.set("size",pref.size);applyPrefs();return}
  const af=e.target.closest("[data-arf]");if(af){pref.arf=af.dataset.arf;store.set("arf",pref.arf);applyPrefs();return}
});
document.addEventListener("submit",e=>{const f=e.target.closest(".ai-form");if(!f)return;e.preventDefault();aiAsk(f)});
let sqt;
document.addEventListener("input",e=>{
  const ta=e.target.closest(".ai-form textarea");if(ta){ta.style.height="";ta.style.height=Math.min(160,ta.scrollHeight)+"px";return}
  const id=e.target.id;
  if(id==="dq"){filterDaftar(e.target.value);return}
  if(id==="hq"){SQ=e.target.value;if(SQ.trim().length>=1)go("cari",{focus:"#sq"});return}
  if(id==="q"||id==="sq"){const v=e.target.value;clearTimeout(sqt);sqt=setTimeout(()=>{SQ=v;
      if(id==="q"){if(route.v!=="cari")go("cari");else{const s2=$("#sq");if(s2)s2.value=v;updateCari()}}
      else{const h=$("#q");if(h&&window.innerWidth>=1024)h.value=v;updateCari()}},250)}
});
document.addEventListener("keydown",e=>{const ta=e.target.closest&&e.target.closest(".ai-form textarea");if(ta&&e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();aiAsk(ta.form)}});
function fallbackCopy(tx){const ta=document.createElement("textarea");ta.value=tx;document.body.appendChild(ta);ta.select();try{document.execCommand("copy")}catch(_){}ta.remove()}
/* ---------- Akun (hanya di situs yang memakai login) ---------- */
if(window.EFQAuth){
  EFQAuth.session().then(u=>{
    if(!u)return;
    $("#userBox").hidden=false;
    $("#userName").textContent=u.name;$("#userMail").textContent=u.email;$("#userProv").textContent="Masuk dengan akun Firebase";
    $("#userInit").textContent=(u.name||"?").trim().charAt(0).toUpperCase();
    if(u.image){const im=$("#userImg");im.src=u.image;im.hidden=false;$("#userInit").hidden=true;im.onerror=()=>{im.hidden=true;$("#userInit").hidden=false}}
  }).catch(()=>{});
  $("#userBtn").onclick=e=>{e.stopPropagation();const m=$("#userMenu");m.hidden=!m.hidden;$("#userBtn").setAttribute("aria-expanded",!m.hidden)};
  document.addEventListener("click",e=>{if(!e.target.closest("#userBox"))$("#userMenu").hidden=true});
  $("#logoutBtn").onclick=()=>{$("#logoutBtn").disabled=true;$("#logoutBtn").textContent="Keluar…";EFQAuth.signOut().finally(()=>location.href="/login?keluar=1")};
}
$("#themeBtn").onclick=()=>{const dark=pref.theme?pref.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;pref.theme=dark?"light":"dark";store.set("theme",pref.theme);applyPrefs()};
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){$("#sheet").hidden=true;closeRset()}
  if(e.key==="/"&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();if(window.innerWidth>=1024)$("#q").focus();else go("cari",{focus:"#sq"})}
});
let posT;
function trackPos(){if(route.v!=="read")return;const bar=$("#main .bar");const top=(bar?bar.getBoundingClientRect().bottom:0)+24;
  for(const el of document.querySelectorAll("#main .para")){const r=el.getBoundingClientRect();if(r.bottom>top){const i=+el.dataset.pi;const p=VIEW[i];if(p)HIST.pos(route.bab,p.id,i);break}}}
function onScroll(){const m=$("#main"),p=$("#prog");if(p){const h=m.scrollHeight-m.clientHeight;p.style.width=(h>0?Math.min(100,m.scrollTop/h*100):0)+"%"}
  if(route.v==="read"){clearTimeout(posT);posT=setTimeout(trackPos,350)}}
$("#main").addEventListener("scroll",onScroll,{passive:true});
window.addEventListener("resize",applyPrefs);

/*__FITUR__*/
route=parseHash(location.hash);
try{history.replaceState(null,"","#"+hashOf(route))}catch(_){}
render();
})();
