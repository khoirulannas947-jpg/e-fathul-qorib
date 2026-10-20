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
 book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/></svg>',
 map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="5" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M7.5 12h4M11.5 12V5h5M11.5 12v7h5"/></svg>',
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
 spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
 send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
 dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
 dict:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5V4.5"/><path d="M9 7h7M9 11h5"/></svg>',
 arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};
const IDX=window.FQINDEX||[];
const BABS=[];IDX.forEach((k,ki)=>k.babs.forEach(b=>BABS.push({...b,k:k.id,kt:k.title,kar:k.ar,ki})));
const AVAIL=BABS.filter(b=>b.n>0);
const KD={},LD={};
const TOT={p:BABS.reduce((a,b)=>a+b.n,0),w:BABS.reduce((a,b)=>a+(b.w||0),0)};

const norm=s=>(s||"").replace(/[ً-ٰ۟ـ«»﴿﴾()،؛:.!?\-]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").toLowerCase().trim();
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=n=>n.toLocaleString("id-ID");
function parse(p){
  const words=p.w.split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const [a,t,k]=l.split("|").map(x=>(x||"").trim());const m=a.startsWith("*");return {a:m?a.slice(1):a,t,k,m}});
  const irob=(p.i||"").split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const ix=l.indexOf("::");return {a:l.slice(0,ix).trim(),x:l.slice(ix+2).trim()}});
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
const pref={t:store.get("t",true),k:store.get("k",true),size:store.get("size",0),tab:store.get("tab","i"),theme:store.get("theme",null),mz:store.get("mz",1)};
let route={v:"home"},q="",VIEW=[];
const last=store.get("bab",null);

/* ---------- Routing (#beranda, #u05, #peta-u05, #kitab-shalat) ---------- */
function parseHash(h){
  h=(h||"").replace(/^#/,"");
  if(!h||h==="beranda")return {v:"home"};
  if(h==="kamus")return {v:"kamus"};
  if(h.startsWith("peta-")){const b=BABS.find(x=>x.id===h.slice(5));if(b&&b.n)return {v:"map",bab:b.id}}
  if(h.startsWith("kitab-")){const k=IDX.find(x=>x.id===h.slice(6));if(k)return {v:"kmap",k:k.id}}
  const b=BABS.find(x=>x.id===h);if(b&&b.n)return {v:"read",bab:b.id};
  return {v:"home"};
}
const hashOf=r=>r.v==="kamus"?"kamus":r.v==="read"?r.bab:r.v==="map"?"peta-"+r.bab:r.v==="kmap"?"kitab-"+r.k:"beranda";
function go(h,opt){
  opt=opt||{};
  const r=parseHash(h);route=r;q="";$("#q").value="";
  try{history[opt.replace?"replaceState":"pushState"](null,"","#"+hashOf(r))}catch(_){}
  closeToc();$("#sheet").hidden=true;render(opt);
}
window.addEventListener("popstate",()=>{route=parseHash(location.hash);q="";$("#q").value="";render()});

/* ---------- Daftar isi ---------- */
function curK(){return route.v==="kmap"?route.k:(route.bab?BABS.find(b=>b.id===route.bab).k:null)}
function toc(){
  const ck=curK();
  let h=`<a class="toc-home${route.v==="home"&&!q?" on":""}" href="#beranda" data-go="beranda">${IC.home}Beranda</a><a class="toc-home${route.v==="kamus"&&!q?" on":""}" href="#kamus" data-go="kamus">${IC.dict}Kamus kosakata</a><div class="toc-label">17 kitab</div>`;
  h+=IDX.map((k,i)=>{
    const n=k.babs.reduce((a,b)=>a+b.n,0);
    const list=`<a class="kmap${route.v==="kmap"&&route.k===k.id?" on":""}" href="#kitab-${k.id}" data-go="kitab-${k.id}">${IC.map}<span>Mind map kitab</span></a>`+
      k.babs.map(b=>`<a href="#${b.id}" data-go="${b.id}" class="${route.bab===b.id&&!q?"on":""}"><span>${esc(b.title)}</span><small>${b.n}</small></a>`).join("");
    return `<details${ck===k.id?" open":""}><summary><span class="n">${i+1}</span><span class="tt">${esc(k.title)}<span class="ar">${k.ar}</span></span><span class="cnt">${k.babs.length} bab</span></summary><div class="lst">${list}</div></details>`;
  }).join("");
  $("#toc").innerHTML=h;
  const on=$("#toc .lst a.on");if(on&&on.scrollIntoView)try{on.scrollIntoView({block:"nearest"})}catch(_){}
}
function openToc(){$("#toc").classList.add("open")}
function closeToc(){$("#toc").classList.remove("open")}

/* ---------- Toolbar ---------- */
function bar(b,view){
  const crumb=`<nav class="crumb" aria-label="Lokasi"><a href="#beranda" data-go="beranda">Beranda</a><span>›</span><a href="#kitab-${b.k}" data-go="kitab-${b.k}">${esc(b.kt)}</a><span>›</span><b>${esc(b.title)}</b></nav>`;
  const seg=`<div class="seg" role="group" aria-label="Tampilan"><button data-go="${b.id}" aria-pressed="${view==="read"}">${IC.book}Bacaan</button><button data-go="peta-${b.id}" aria-pressed="${view==="map"}">${IC.map}Mind map</button></div>`;
  const ctl=view==="read"?`<div class="ctl"><button class="chip" id="tgT" aria-pressed="${pref.t}">Makna</button><button class="chip" id="tgK" aria-pressed="${pref.k}">Kedudukan</button><span class="fs" role="group" aria-label="Ukuran huruf Arab"><button id="fsMinus" aria-label="Perkecil huruf Arab">A−</button><button id="fsPlus" aria-label="Perbesar huruf Arab">A+</button></span></div>`:"";
  return `<div class="bar"><div class="bar-in">${crumb}${seg}${ctl}</div><div class="prog"><i id="prog"></i></div></div>`;
}
function head(b,extra){
  const ps=babParas(b),m=ps.filter(p=>p.matan).length;
  return `<header class="head"><div><div class="eyebrow">Kitab ${b.ki+1} · ${esc(b.kt)}</div><h1>${esc(b.title)}</h1></div><div class="ar-title">${b.ar}</div><p>${esc(b.desc)}</p>
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
  const ir=p.irob.map(r=>`<li><span class="ar">${esc(r.a)}</span><span>${esc(r.x)}</span></li>`).join("");
  const sy=p.s.split(/\n\s*\n/).map(x=>`<p>${esc(x.trim())}</p>`).join("");
  const tab=pref.tab;
  return `<article class="para" id="p-${p.id}">
   <div class="para-top"><span class="no">${no}</span>${showSrc?`<span class="src"><a href="#${b.id}" data-go="${b.id}" data-para="${p.id}">${esc(b.kt)} · ${esc(b.title)}</a></span>`:`<span class="kind${p.matan?" m":""}"><i></i>${p.matan?"Matan + syarah":"Syarah"}</span>`}
    <span class="act"><button data-copy="${vi}" title="Salin teks Arab paragraf ini">Salin Arab</button></span></div>
   <div class="text">${ws}</div>
   <div class="trans"><b>Terjemah</b>${esc(p.t)}</div>
   <div class="tabs" role="tablist"><button role="tab" aria-selected="${tab==="i"}" data-tab="i">I'rab</button><button role="tab" aria-selected="${tab==="s"}" data-tab="s">Penjelasan</button>${AI_ON?`<button role="tab" aria-selected="false" data-tab="a" class="ai-tab">${IC.spark}Tanya AI</button>`:""}<button role="tab" aria-selected="${tab==="x"}" data-tab="x">Tutup</button></div>
   <div class="pane" data-pane="i"${tab==="i"?"":" hidden"}><ul class="irob">${ir}</ul></div>
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
  return `<nav class="pager">${pv?`<a href="#${pre}${pv.id}" data-go="${pre}${pv.id}"><small>Sebelumnya</small><b>${esc(pv.title)}</b></a>`:""}${nx?`<a class="nx" href="#${pre}${nx.id}" data-go="${pre}${nx.id}"><small>Berikutnya</small><b>${esc(nx.title)}</b></a>`:""}</nav>`;
}
function applyPrefs(){
  document.body.classList.toggle("hide-t",!pref.t);document.body.classList.toggle("hide-k",!pref.k);
  const t=$("#tgT"),k=$("#tgK");if(t)t.setAttribute("aria-pressed",pref.t);if(k)k.setAttribute("aria-pressed",pref.k);
  document.documentElement.style.setProperty("--ar-size",(window.innerWidth<720?25:30)+pref.size*4+"px");
  if(pref.theme)document.documentElement.setAttribute("data-theme",pref.theme);else document.documentElement.removeAttribute("data-theme");
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
  const r=route;loadKitab(kid).then(()=>{if(route===r&&!q)render()}).catch(()=>{$("#main").innerHTML=failHTML()});
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
  const info=KS.q?`${fmt(L.length)} kosakata cocok${L.length>max?`, ditampilkan ${max} pertama`:""}.`:`Huruf <span class="ar">${KS.l}</span>: ${fmt(L.length)} kosakata${KS.j?" ("+JN[KS.j][0]+")":""}.`;
  return `<p class="km-info">${info}</p>${shown.length?`<div class="km-list">${kamusRows(shown)}</div>`:`<div class="empty">Tidak ada kosakata yang cocok. Coba tulis tanpa harakat, misalnya <b class="ar">صلاة</b>, atau arti Indonesia seperti <b>shalat</b>.</div>`}`;
}
function renderKamus(opt){
  if(!KM){$("#main").innerHTML=`<div class="wrap"><div class="loading">Memuat kamus…</div></div>`;const r=route;loadKamus().then(()=>{if(route===r&&!q)renderKamus(opt)}).catch(()=>{$("#main").innerHTML=failHTML()});return}
  if(opt&&opt.kamus!=null){const e=KM.e[opt.kamus];if(e){KS.q="";KS.j="";KS.l=e.L;KS.open=e.i}}
  const c={i:0,f:0,h:0};KM.e.forEach(e=>c[e.j]++);
  const letters=HIJ.map(h=>`<button class="km-l${!KS.q&&KS.l===h?" on":""}" data-kl="${h}"${KM.cnt[h]?"":" disabled"} aria-label="Huruf ${h}">${h}</button>`).join("");
  $("#main").innerHTML=`<div class="bar"><div class="bar-in"><nav class="crumb" aria-label="Lokasi"><a href="#beranda" data-go="beranda">Beranda</a><span>›</span><b>Kamus kosakata</b></nav></div><div class="prog"><i id="prog"></i></div></div>
   <div class="wrap"><header class="head"><div><div class="eyebrow">Kamus · مُعْجَم</div><h1>Kamus Kosakata Fathul Qorib</h1></div><div class="ar-title">مُعْجَمُ الْأَلْفَاظِ</div>
    <p>Semua kosakata yang muncul dalam kitab, baik isim, fi'il, maupun huruf, diurutkan menurut abjad hijaiyah. Kata yang diawali <span class="ar">وَ، فَ، بِ، لِ، كَ</span> atau <span class="ar">الْ</span> dikelompokkan ke bentuk dasarnya. Klik kosakata untuk melihat makna, bentuk yang muncul, dan contoh paragrafnya.</p>
    <div class="meta-row"><span class="tag">${fmt(KM.e.length)} kosakata</span><span class="tag">${fmt(c.i)} isim</span><span class="tag">${fmt(c.f)} fi'il</span><span class="tag">${fmt(c.h)} huruf</span></div></header>
    <div class="km-tools"><label class="km-q">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'}<input id="kq" type="search" placeholder="Cari kata Arab atau arti Indonesia" value="${esc(KS.q)}" aria-label="Cari di kamus"></label>
     <div class="seg km-j" role="group" aria-label="Jenis kata">${[["","Semua"],["i","Isim"],["f","Fi'il"],["h","Huruf"]].map(([k,l])=>`<button data-kj="${k}" aria-pressed="${KS.j===k}">${l}</button>`).join("")}</div></div>
    <nav class="km-letters" aria-label="Abjad hijaiyah">${letters}</nav>
    <div id="kmRes">${kamusResults()}</div></div>`;
  const bh=document.querySelector("#main .bar");if(bh)document.documentElement.style.setProperty("--kmtop",(bh.offsetHeight+8)+"px");
  if(KS.open!=null){const d=document.querySelector(`[data-ke="${KS.open}"]`);if(d)requestAnimationFrame(()=>d.scrollIntoView({block:"center"}))}
}
function kamusUpdate(){const r=$("#kmRes");if(r)r.innerHTML=kamusResults();document.querySelectorAll(".km-l").forEach(b=>b.classList.toggle("on",!KS.q&&b.dataset.kl===KS.l));document.querySelectorAll("[data-kj]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.kj===KS.j))}
document.addEventListener("toggle",e=>{const d=e.target;if(!d.classList||!d.classList.contains("ke")||!d.open)return;const en=KM&&KM.e[+d.dataset.ke];if(!en)return;KS.open=en.i;const b=d.querySelector(".ke-body");if(!b.innerHTML)b.innerHTML=kamusBody(en)},true);
document.addEventListener("click",e=>{
  const l=e.target.closest("[data-kl]");if(l){KS.l=l.dataset.kl;KS.q="";KS.open=null;const i=$("#kq");if(i)i.value="";kamusUpdate();$("#main").scrollTop=Math.min($("#main").scrollTop,($(".km-letters")||{offsetTop:0}).offsetTop-60);return}
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
async function countOffline(){try{const c=await caches.open("efq-data-v1");const ks=await c.keys();offInfo.n=IDX.filter(k=>ks.some(r=>new URL(r.url,location.href).pathname==="/data/"+k.id+".json")).length}catch(_){offInfo.n=0}refreshAppCard()}
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
  const lb=last&&AVAIL.find(b=>b.id===last);
  $("#main").innerHTML=`<div class="wrap">
   <section class="hero"><div>
     <div class="eyebrow">Fathul Qarib al-Mujib · Syarah Matan at-Taqrib</div>
     <h1>Kitab Fathul Qorib, kata demi kata</h1>
     <p>Matan Abu Syuja' dan syarah Ibnu Qasim al-Ghazzi lengkap: makna dan kedudukan setiap kata, terjemah utuh, i'rab, dan penjelasan per paragraf. Tiap bab punya mind map untuk melihat isinya sekilas.</p>
     <div class="btns">${lb?`<a class="btn pri" href="#${lb.id}" data-go="${lb.id}">${IC.book}Lanjutkan: ${esc(lb.title)}</a><a class="btn" href="#khutbah" data-go="khutbah">Mulai dari awal</a>`:`<a class="btn pri" href="#khutbah" data-go="khutbah">${IC.book}Mulai membaca</a>`}<a class="btn" href="#kitab-thaharah" data-go="kitab-thaharah">${IC.map}Lihat mind map</a><a class="btn" href="#kamus" data-go="kamus">${IC.dict}Kamus kosakata</a></div>
   </div><div class="cal">فَتْحُ الْقَرِيْبِ الْمُجِيْبِ<small>فِيْ شَرْحِ أَلْفَاظِ التَّقْرِيْبِ</small></div></section>
   <div class="stats"><div><b>${IDX.length}</b><span>kitab</span></div><div><b>${BABS.length}</b><span>bab & fasal</span></div><div><b>${fmt(TOT.p)}</b><span>paragraf</span></div><div><b>${fmt(TOT.w)}</b><span>kata bermakna</span></div></div>
   ${APP_ON?appCard():""}
   <div class="sec-h"><h2>Daftar kitab</h2><span>Urutan sesuai kitab</span></div>
   <div class="kgrid">${IDX.map((k,i)=>{const n=k.babs.reduce((a,b)=>a+b.n,0);return `<div class="kcard"><div class="top-row"><span class="num">${String(i+1).padStart(2,"0")}</span><span class="ar">${k.ar}</span></div>
     <div><h3>${esc(k.title)}</h3><div class="sub">${k.babs.length} bab · ${fmt(n)} paragraf</div></div>
     <div class="acts"><a href="#${k.babs[0].id}" data-go="${k.babs[0].id}">Baca</a><a href="#kitab-${k.id}" data-go="kitab-${k.id}">Mind map</a></div></div>`}).join("")}</div>
   <div class="sec-h"><h2>Cara membaca</h2></div>
   <div class="howto">
     <div><h3>Lafadz merah dan hitam</h3><p>Lafadz bertinta <b style="color:var(--matan)">merah</b> adalah matan Abu Syuja'. Lafadz hitam adalah syarah Ibnu Qasim. Di bawah tiap lafadz ada makna Indonesia dan simbol kedudukannya.</p></div>
     <div><h3>Klik satu kata</h3><p>Kartu detail menampilkan makna, kedudukan lengkap, dan i'rab kata itu. Tombol Makna dan Kedudukan di atas bacaan menyembunyikan baris bantu untuk latihan membaca.</p></div>
     <div><h3>Warna kedudukan</h3><div class="legend">${LEG.map(([c,l])=>`<span><i class="k-${c}"></i>${l}</span>`).join("")}</div></div>
   </div>
   <div class="notice">Teks Arab diambil dari edisi digital Fathul Qorib (OpenITI, salinan Maktabah Syamilah) lalu diberi harakat. Makna, i'rab, penjelasan, dan mind map adalah bantuan belajar. Cocokkan dengan kitab cetak dan bimbingan guru sebelum dijadikan pegangan.</div>
  </div>`;
}
function renderRead(b,opt){
  if(needKitab(b.k,"Memuat "+b.kt+"…"))return;
  const ps=babParas(b);VIEW=ps;store.set("bab",b.id);
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
  $("#main").innerHTML=bar(b,"map")+`<div class="wrap">${head(b)}${mmTools()}${mmCanvas(root)}${auto?`<div class="mm-legend">Peta ini disusun otomatis dari paragraf bab.</div>`:""}${pager(b,"map")}</div>`;
  centerMM();
}
function renderKMap(kid){
  const k=IDX.find(x=>x.id===kid);
  if(needKitab(kid,"Memuat "+k.title+"…"))return;
  const babs=BABS.filter(b=>b.k===kid);
  const root={t:"Kitab "+k.title,ar:k.ar,kids:babs.map(b=>({t:b.title,ar:"",go:"peta-"+b.id,bab:b.id,shut:babs.length>8,kids:mmOf(b).map(n=>({t:n.t,ar:"",ref:n.ref,kids:[]}))}))};
  const n=babs.reduce((a,b)=>a+b.n,0);
  $("#main").innerHTML=`<div class="bar"><div class="bar-in"><nav class="crumb"><a href="#beranda" data-go="beranda">Beranda</a><span>›</span><b>Mind map ${esc(k.title)}</b></nav>
     <div class="seg"><button data-go="${babs[0].id}" aria-pressed="false">${IC.book}Mulai baca</button><button aria-pressed="true">${IC.map}Mind map kitab</button></div></div><div class="prog"><i id="prog"></i></div></div>
   <div class="wrap"><header class="head"><div><div class="eyebrow">Kitab ${IDX.indexOf(k)+1} dari ${IDX.length}</div><h1>Mind map ${esc(k.title)}</h1></div><div class="ar-title">${k.ar}</div>
   <p>Gambaran seluruh bab dalam kitab ini beserta pokok bahasannya. Klik nama bab untuk membuka mind map lengkapnya, atau klik pokok bahasan bertanda ¶ untuk langsung membaca paragrafnya.</p>
   <div class="meta-row"><span class="tag">${babs.length} bab</span><span class="tag">${fmt(n)} paragraf</span></div></header>
   ${mmTools()}${mmCanvas(root)}</div>`;
  centerMM();
}
function renderSearch(){
  const qn=norm(q);
  const need=IDX.filter(k=>!KD[k.id]);
  if(need.length){
    $("#main").innerHTML=`<div class="wrap"><div class="loading">Memuat seluruh kitab untuk pencarian…</div></div>`;
    Promise.all(need.map(k=>loadKitab(k.id))).then(()=>{if(norm(q)===qn)render()}).catch(()=>{$("#main").innerHTML=failHTML()});
    return;
  }
  const all=IDX.flatMap(k=>KD[k.id].paras);
  const hits=all.filter(p=>p.words.some(w=>norm(w.a).includes(qn)||(w.t||"").toLowerCase().includes(qn))||(p.t||"").toLowerCase().includes(qn));
  const shown=hits.slice(0,60);VIEW=shown;
  $("#main").innerHTML=`<div class="bar"><div class="bar-in"><nav class="crumb"><a href="#beranda" data-go="beranda">Beranda</a><span>›</span><b>Pencarian</b></nav><div class="ctl"><button class="chip" id="tgT" aria-pressed="${pref.t}">Makna</button><button class="chip" id="tgK" aria-pressed="${pref.k}">Kedudukan</button></div></div><div class="prog"><i id="prog"></i></div></div>
   <div class="wrap"><header class="head"><div><div class="eyebrow">Hasil pencarian</div><h1>“${esc(q)}”</h1></div><p>${hits.length?`${fmt(hits.length)} paragraf ditemukan${hits.length>60?". Ditampilkan 60 pertama; perjelas kata kunci untuk mempersempit hasil.":"."}`:""}</p></header>
   ${shown.length?shown.map((p,i)=>paraHTML(p,i,qn,true)).join(""):`<div class="empty">Tidak ada yang cocok. Coba lafadz tanpa harakat, misalnya <b class="ar">ماء</b>, atau kata Indonesia seperti <b>air</b>.</div>`}</div>`;
  applyPrefs();
}
function render(opt){
  applyPrefs();toc();
  const m=$("#main");
  if(q)renderSearch();
  else if(route.v==="read")renderRead(BABS.find(b=>b.id===route.bab),opt);
  else if(route.v==="map")renderMap(BABS.find(b=>b.id===route.bab));
  else if(route.v==="kmap")renderKMap(route.k);
  else if(route.v==="kamus")renderKamus(opt);
  else renderHome();
  if(!(opt&&opt.para))m.scrollTop=0;
  onScroll();
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
  const nw=norm(w.a);const r=p.irob.find(r=>{const na=norm(r.a);return na&&(na===nw||na.split(" ").includes(nw))});
  $("#sheet").innerHTML=`<button class="x" id="sx" aria-label="Tutup">×</button>
   <div class="big${w.m?" m":""}">${esc(w.a)}</div>
   <dl><dt>Makna</dt><dd>${esc(w.t)}</dd><dt>Kedudukan</dt><dd><span class="kb k-${k[3]}">${k[2]}</span>${esc(k[0])} <span class="ar">(${k[1]})</span></dd><dt>Sumber</dt><dd>${w.m?"Lafadz matan (Abu Syuja')":"Lafadz syarah (Ibnu Qasim)"}</dd></dl>
   ${r?`<div class="note"><b>I'rab:</b> ${esc(r.x)}</div>`:""}
   <button class="btn sheet-k" data-kamus="${esc(bareAr(w.a)+"|"+({fi:"f",jr:"h",hr:"h"}[w.k]||"i"))}">${IC.dict}Lihat di kamus</button>`;
  $("#sheet").hidden=false;$("#sx").onclick=()=>{$("#sheet").hidden=true;el.classList.remove("sel")};
}

/* ---------- Event ---------- */
document.addEventListener("click",e=>{
  const g=e.target.closest("[data-go]");
  if(g){e.preventDefault();if(g.getAttribute("aria-pressed")==="true"&&!g.dataset.para)return;go(g.dataset.go,{para:g.dataset.para});return;}
  const j=e.target.closest("[data-jump]");
  if(j){const [bab,n]=j.dataset.jump.split(":");const b=BABS.find(x=>x.id===bab);const p=babParas(b)[+n-1];go(bab,{para:p&&p.id});return;}
  const tg=e.target.closest("[data-mtg]");
  if(tg){const n=tg.closest(".mn");n.classList.toggle("shut");tg.setAttribute("aria-expanded",!n.classList.contains("shut"));return;}
  const ma=e.target.closest("[data-mmall]");if(ma){mmAll(ma.dataset.mmall);return;}
  const mz=e.target.closest("[data-mz]");
  if(mz){pref.mz=Math.min(1.5,Math.max(.7,Math.round((pref.mz+(+mz.dataset.mz)*.1)*10)/10));store.set("mz",pref.mz);const m=$("#mmc .mm");if(m)m.style.setProperty("--mz",pref.mz);return;}
  const w=e.target.closest(".w");if(w){showWord(+w.dataset.v,+w.dataset.w,w);return;}
  const cp=e.target.closest("[data-copy]");
  if(cp){const p=VIEW[+cp.dataset.copy];const tx=p.words.map(x=>x.a).join(" ");const done=()=>{cp.textContent="Tersalin";setTimeout(()=>cp.textContent="Salin Arab",1500)};
    try{navigator.clipboard.writeText(tx).then(done,()=>{fallbackCopy(tx);done()})}catch(_){fallbackCopy(tx);done()}return;}
  const t=e.target.closest("[data-tab]");
  const ask=e.target.closest("[data-ask]");
  if(ask){const f=ask.closest(".pane").querySelector(".ai-form");aiAsk(f,ask.dataset.ask);return;}
  if(t){if(t.dataset.tab!=="a"){pref.tab=t.dataset.tab;store.set("tab",pref.tab);}const art=t.closest(".para");art.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-selected",b===t));
    art.querySelectorAll("[data-pane]").forEach(p=>p.hidden=p.dataset.pane!==t.dataset.tab);return;}
  if(e.target.closest("#tgT")){pref.t=!pref.t;store.set("t",pref.t);applyPrefs();return}
  if(e.target.closest("#tgK")){pref.k=!pref.k;store.set("k",pref.k);applyPrefs();return}
  if(e.target.closest("#fsPlus")){pref.size=Math.min(4,pref.size+1);store.set("size",pref.size);applyPrefs();return}
  if(e.target.closest("#fsMinus")){pref.size=Math.max(-2,pref.size-1);store.set("size",pref.size);applyPrefs();return}
  if(e.target.closest("#scrim"))closeToc();
});
document.addEventListener("submit",e=>{const f=e.target.closest(".ai-form");if(!f)return;e.preventDefault();aiAsk(f)});
document.addEventListener("input",e=>{const ta=e.target.closest(".ai-form textarea");if(!ta)return;ta.style.height="";ta.style.height=Math.min(160,ta.scrollHeight)+"px"});
document.addEventListener("keydown",e=>{const ta=e.target.closest&&e.target.closest(".ai-form textarea");if(ta&&e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();aiAsk(ta.form)}});
function fallbackCopy(tx){const ta=document.createElement("textarea");ta.value=tx;document.body.appendChild(ta);ta.select();try{document.execCommand("copy")}catch(_){}ta.remove()}
$("#menuBtn").onclick=()=>{$("#toc").classList.contains("open")?closeToc():openToc()};
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
let qt;$("#q").addEventListener("input",e=>{clearTimeout(qt);qt=setTimeout(()=>{q=e.target.value.trim();$("#sheet").hidden=true;render()},280)});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){$("#sheet").hidden=true;closeToc()}
  if(e.key==="/"&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();$("#q").focus()}
});
function onScroll(){const m=$("#main"),p=$("#prog");if(!p)return;const h=m.scrollHeight-m.clientHeight;p.style.width=(h>0?Math.min(100,m.scrollTop/h*100):0)+"%"}
$("#main").addEventListener("scroll",onScroll,{passive:true});
window.addEventListener("resize",applyPrefs);

route=parseHash(location.hash);
try{history.replaceState(null,"","#"+hashOf(route))}catch(_){}
render();
})();
