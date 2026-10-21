/* =====================================================================
   Latihan interaktif: i'rab, kuis bab, susun kalimat.
   Disisipkan ke dalam app.js (satu lingkup), memakai helper yang sudah ada:
   $, esc, norm, fmt, IC, K, IDX, BABS, AVAIL, KD, loadKitab, babParas, store, HIST, parseMM, pageBar, bareAr.
   Progres tersimpan di perangkat: localStorage "efq:lat".
   ===================================================================== */
const LAT_TYPES=["irab","kuis","susun"];
const LATI={
  irab:{t:"Latihan I'rab",ar:"تَدْرِيْبُ الْإِعْرَابِ",ic:"pen",d:"Satu kata disorot dalam kalimat kitab. Tebak kedudukannya: mubtada', khabar, fa'il, maf'ul, dan seterusnya.",
    note:"Kunci jawaban hanya diambil dari kata yang i'rabnya ditulis tangan dan cocok dengan kode kedudukannya, bukan dari baris i'rab otomatis."},
  kuis:{t:"Kuis Bab",ar:"اِخْتِبَارُ الْبَابِ",ic:"quiz",d:"Soal pilihan ganda dari mind map bab (poin, kelompok, dan nomor paragraf) serta arti kata dalam kitab.",
    note:"Soal disusun otomatis dari mind map dan makna per kata. Bab yang belum punya mind map memakai soal arti kata saja."},
  susun:{t:"Susun Kalimat",ar:"تَرْتِيْبُ الْجُمَلِ",ic:"shuffle",d:"Kata-kata Arab diacak. Susun kembali menjadi kalimat yang benar untuk melatih tarkib dan hafalan matan.",
    note:"Ketuk kata untuk menaruhnya di baris jawaban, ketuk lagi untuk mengembalikan. Percobaan pertama yang menentukan skor."}
};
const LS={st:null};
const LST={get(){return store.get("lat",{})},set(v){store.set("lat",v)}};
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick1=a=>a[Math.floor(Math.random()*a.length)];
function latStat(type,ok,code){
  const L=LST.get();const s=L[type]=L[type]||{n:0,ok:0,by:{}};
  s.n++;if(ok)s.ok++;
  if(code){const b=s.by[code]=s.by[code]||[0,0];b[0]++;if(ok)b[1]++}
  LST.set(L);
}
const QL=c=>({mj:["Majrur (setelah huruf jar)","مجرور"],ma:["Mudhaf Ilaih","مضاف إليه"]}[c]||[(K[c]||K.hr)[0],(K[c]||K.hr)[1]]);

/* ---------- Cakupan bahan ---------- */
function latScope(){
  const L=LST.get();let sc=L.sc;
  if(!sc||(sc.k&&!IDX.some(k=>k.id===sc.k))||(sc.b&&!BABS.some(b=>b.id===sc.b))){
    const last=(HIST.all()[0]||{}).bab,b=(last&&BABS.find(x=>x.id===last))||AVAIL[0];
    sc={k:b.k,b:b.id};
  }
  return sc;
}
const scopeBabs=sc=>sc.b?BABS.filter(b=>b.id===sc.b):sc.k?BABS.filter(b=>b.k===sc.k&&b.n):AVAIL;
const latOpt=(list,sel)=>list.map(([v,l])=>`<option value="${esc(v)}"${v===sel?" selected":""}>${esc(l)}</option>`).join("");

/* ---------- Pembuat soal: i'rab ---------- */
const IRK={mb:/mubtada/i,kh:/khabar/i,ki:/khabar/i,fa:/fa'il/i,nf:/na'ib/i,ii:/isim/i,mf:/maf'ul bih/i,mm:/muthlaq/i,ml:/ajlih/i,zf:/zharaf/i,ms:/mustatsna/i,hl:/\bhal\b/i,tm:/tamyiz/i,na:/na'at|sifat/i,ma:/mudhaf/i,bd:/badal/i,ab:/bayan|tafsir/i,mt:/ma'thuf|athaf/i,tk:/taukid/i,mj:/majrur/i};
const IRC={mb:["kh","fa","ii","nf"],kh:["mb","ki","mf","hl"],fa:["nf","mb","mf","ii"],nf:["fa","mb","mf","ii"],ii:["mb","fa","ki","nf"],ki:["kh","ii","hl","mf"],mf:["fa","hl","tm","mm"],mm:["mf","hl","ml","tm"],ml:["mf","mm","hl","tm"],zf:["mf","hl","tm","mj"],ms:["mf","bd","na","tm"],hl:["mf","tm","na","kh"],tm:["hl","mf","na","mm"],na:["bd","ab","mt","tk"],ma:["mj","na","bd","mt"],bd:["na","ab","mt","tk"],ab:["bd","na","mt","tk"],mt:["bd","na","ab","ma"],tk:["na","bd","ab","mt"],mj:["ma","mf","zf","mt"]};
function ctxHTML(p,wi,before,after){
  const from=Math.max(0,wi-before),to=Math.min(p.words.length,wi+after+1);
  return (from?"… ":"")+p.words.slice(from,to).map((x,j)=>from+j===wi?`<mark class="tgt">${esc(x.a)}</mark>`:esc(x.a)).join(" ")+(to<p.words.length?" …":"");
}
function irabPool(paras){
  const pool=[];
  paras.forEach(p=>{
    const rows={},cnt={};
    p.irob.forEach(r=>{if(!r.au){const k=norm(r.a);(rows[k]=rows[k]||[]).push(r)}});
    p.words.forEach(w=>{const k=norm(w.a);cnt[k]=(cnt[k]||0)+1});
    p.words.forEach((w,wi)=>{
      const rx=IRK[w.k];if(!rx)return;
      const k=norm(w.a);if(cnt[k]>1||!rows[k]||rows[k].length!==1)return;
      const r=rows[k][0];
      if(!rx.test(r.x)||/\s\/\s|\batau\b/i.test(r.x))return;
      pool.push({p,wi,w,r,code:w.k});
    });
  });
  return pool;
}
function irabQ({p,wi,w,r,code}){
  const ds=shuf(IRC[code].slice()).slice(0,3);
  const opts=shuf([code,...ds]).map(c=>({c,t:QL(c)[0],ar:QL(c)[1]}));
  return {type:"irab",code,prompt:"Apa kedudukan kata bergaris dalam kalimat ini?",ctx:ctxHTML(p,wi,7,4),sub:"Makna kata: "+w.t,opts,
    ans:opts.findIndex(o=>o.c===code),expl:`Jawaban: <b>${esc(QL(code)[0])}</b>. I'rab dalam kitab: ${esc(r.x)}`,link:{bab:p.bab,pid:p.id},ar:w.a};
}
function buildIrab(paras,n){
  const pool=irabPool(paras);if(!pool.length)return [];
  const L=(LST.get().irab||{}).by||{};
  const weak=new Set(Object.entries(L).filter(([c,v])=>v[0]>=5&&v[1]/v[0]<.6).map(x=>x[0]));
  const by={};pool.forEach(x=>(by[x.code]=by[x.code]||[]).push(x));
  Object.values(by).forEach(shuf);
  const out=[];
  while(out.length<n){
    const codes=Object.keys(by).filter(c=>by[c].length);if(!codes.length)break;
    const wt=codes.map(c=>Math.sqrt(Math.min(by[c].length,50))*(weak.has(c)?3:1));
    let r=Math.random()*wt.reduce((a,b)=>a+b,0),ci=0;
    for(;ci<codes.length-1&&r>wt[ci];ci++)r-=wt[ci];
    out.push(irabQ(by[codes[ci]].pop()));
  }
  return out;
}

/* ---------- Pembuat soal: kuis bab ---------- */
const okT=t=>!!t&&t.length>=3&&t.length<=68;
const descs=(n,out)=>{(n.kids||[]).forEach(k=>{out.push(k);descs(k,out)});return out};
const refLbl=r=>"Paragraf "+r[0]+(r[1]!==r[0]?"–"+r[1]:"");
function buildKuis(babs,paras,n){
  const T={t1:[],t2:[],t3:[],t4:[]};
  babs.forEach(b=>{
    const txt=KD[b.k]&&KD[b.k].mm[b.id];if(!txt)return;
    const ps=babParas(b),top=parseMM(txt),l1=top.filter(x=>okT(x.t));
    if(l1.length<2)return;
    const owner=new Map(),count=new Map();
    l1.forEach((P,pi)=>[P,...descs(P,[])].forEach(x=>{count.set(x.t,(count.get(x.t)||0)+1);const s=owner.get(x.t)||new Set();s.add(pi);owner.set(x.t,s)}));
    const uniq=x=>okT(x.t)&&count.get(x.t)===1;
    l1.forEach((P,pi)=>{
      const kids=P.kids.filter(uniq),all=descs(P,[]).filter(uniq);
      // T1: poin ini termasuk pembahasan apa?
      if(l1.length>=4)all.forEach(x=>{
        const ds=shuf(l1.filter((_,j)=>j!==pi)).slice(0,3);
        const opts=shuf([P,...ds]).map(o=>({t:o.t,ar:""}));
        T.t1.push({type:"kuis",prompt:"Poin berikut termasuk dalam pembahasan apa?",ctx:null,big:x.t,opts,ans:opts.findIndex(o=>o.t===P.t),
          expl:`“${esc(x.t)}” termasuk dalam <b>${esc(P.t)}</b>.`,link:x.ref?{bab:b.id,pid:ps[x.ref[0]-1]&&ps[x.ref[0]-1].id}:(P.ref?{bab:b.id,pid:ps[P.ref[0]-1]&&ps[P.ref[0]-1].id}:null)});
      });
      // T2: manakah yang termasuk dalam P?
      if(kids.length>=1){
        const mine=new Set(descs(P,[]).map(x=>x.t));
        const others=l1.filter((_,j)=>j!==pi).flatMap(Q=>Q.kids.filter(uniq)).filter(x=>!mine.has(x.t));
        const pool=[...new Set(others.map(x=>x.t))];
        if(pool.length>=3)kids.forEach(x=>{
          const ds=shuf(pool.slice()).slice(0,3);
          const opts=shuf([x.t,...ds]).map(t=>({t,ar:""}));
          T.t2.push({type:"kuis",prompt:"Manakah yang termasuk dalam pembahasan “"+P.t+"”?",ctx:null,opts,ans:opts.findIndex(o=>o.t===x.t),
            expl:`<b>${esc(x.t)}</b> termasuk dalam “${esc(P.t)}”.`,link:x.ref?{bab:b.id,pid:ps[x.ref[0]-1]&&ps[x.ref[0]-1].id}:null});
        });
      }
    });
    // T3: poin ini dibahas di paragraf berapa?
    const nodes=l1.flatMap(P=>[P,...descs(P,[])]).filter(x=>x.ref&&uniq(x)&&ps[x.ref[0]-1]);
    const labels=nodes.map(x=>({r:x.ref,l:refLbl(x.ref)}));
    nodes.forEach(x=>{
      const c=refLbl(x.ref);
      const ds=[...new Set(labels.filter(y=>y.r[1]<x.ref[0]||y.r[0]>x.ref[1]).map(y=>y.l))].filter(l=>l!==c);
      if(ds.length<3)return;
      const opts=shuf([c,...shuf(ds).slice(0,3)]).map(t=>({t,ar:""}));
      T.t3.push({type:"kuis",prompt:"Poin berikut dibahas di paragraf berapa?",ctx:null,big:x.t,opts,ans:opts.findIndex(o=>o.t===c),
        expl:`“${esc(x.t)}” dibahas di <b>${esc(c)}</b>.`,link:{bab:b.id,pid:ps[x.ref[0]-1].id}});
    });
  });
  // T4: arti kata
  const bank=new Map();
  paras.forEach(p=>p.words.forEach(w=>{if(w.k!=="hr"&&w.k!=="jr"&&w.t&&w.t.length<=36)bank.set(w.t.toLowerCase(),w.t)}));
  const bankArr=[...bank.values()];
  if(bankArr.length>=8){
    const cand=[];
    paras.forEach(p=>p.words.forEach((w,wi)=>{if(w.k!=="hr"&&w.k!=="jr"&&w.t&&w.t.length<=36&&norm(w.a).length>=3)cand.push({p,w,wi})}));
    shuf(cand).slice(0,Math.max(n*3,40)).forEach(({p,w,wi})=>{
      const first=w.t.toLowerCase().split(/\s+/)[0];
      const ds=shuf(bankArr.slice()).filter(t=>t.toLowerCase()!==w.t.toLowerCase()&&t.toLowerCase().split(/\s+/)[0]!==first).slice(0,3);
      if(ds.length<3)return;
      const opts=shuf([w.t,...ds]).map(t=>({t,ar:""}));
      T.t4.push({type:"kuis",prompt:"Apa arti kata bergaris ini dalam kitab?",ctx:ctxHTML(p,wi,5,3),opts,ans:opts.findIndex(o=>o.t===w.t),
        expl:`<span class="ar">${esc(w.a)}</span> berarti <b>${esc(w.t)}</b>.`,link:{bab:p.bab,pid:p.id}});
    });
  }
  Object.values(T).forEach(shuf);
  const wt={t1:.3,t2:.25,t3:.25,t4:.2},out=[];
  while(out.length<n){
    const ks=Object.keys(T).filter(k=>T[k].length);if(!ks.length)break;
    let r=Math.random()*ks.reduce((a,k)=>a+wt[k],0),ki=0;
    for(;ki<ks.length-1&&r>wt[ks[ki]];ki++)r-=wt[ks[ki]];
    out.push(T[ks[ki]].pop());
  }
  return out;
}

/* ---------- Pembuat soal: susun kalimat ---------- */
function buildSusun(paras,n,L){
  const lv=L.lv||2,[mn,mx]=[[3,5],[5,7],[7,10]][lv-1],matan=!!L.matan,items=[];
  paras.forEach(p=>{
    if(matan&&!p.matan)return;
    let cur=[];
    p.words.forEach((w,i)=>{
      cur.push(i);
      const end=/[،؛:.؟!]$/.test(w.a.trim())||i===p.words.length-1;
      if((end&&cur.length>=mn)||cur.length>=mx){
        if(cur.length>=mn&&(!matan||cur.every(j=>p.words[j].m)))items.push({p,idx:cur.slice()});
        cur=[];
      }
    });
  });
  const out=[];
  shuf(items).forEach(it=>{
    if(out.length>=n)return;
    const tiles=it.idx.map((j,ord)=>({a:it.p.words[j].a,t:it.p.words[j].t,ord}));
    if(new Set(tiles.map(t=>t.a)).size<2)return;
    let order=tiles.map((_,i)=>i),tries=0;
    do{shuf(order);tries++}while(tries<12&&order.every((v,i)=>tiles[v].a===tiles[i].a));
    const sh=order.map(i=>tiles[i]);
    out.push({type:"susun",tiles:sh,correct:tiles.map(t=>t.a),slots:[],tries:0,done:false,hint:false,msg:"",mark:false,
      link:{bab:it.p.bab,pid:it.p.id},meaning:tiles.map(t=>t.t).join(" · ")});
  });
  return out;
}

/* ---------- Layar: beranda latihan ---------- */
function renderLatHub(){
  const L=LST.get(),tot=LAT_TYPES.reduce((a,t)=>a+((L[t]||{}).n||0),0),oks=LAT_TYPES.reduce((a,t)=>a+((L[t]||{}).ok||0),0);
  const cards=LAT_TYPES.map(t=>{const i=LATI[t],s=L[t]||{n:0,ok:0};
    return `<a class="hcard" href="#latihan-${t}" data-go="latihan-${t}"><span class="hc-ic">${IC[i.ic]}</span><span class="hc-tx"><b>${i.t}</b><span class="ar">${i.ar}</span><span class="hc-d">${i.d}</span>
      <small>${s.n?`${fmt(s.n)} soal dijawab · ${Math.round(s.ok/s.n*100)}% benar`:"Belum dicoba"}</small></span><span class="hc-go">${IC.chevR}</span></a>`}).join("");
  const by=(L.irab||{}).by||{},weak=Object.entries(by).filter(([c,v])=>v[0]>=5).map(([c,v])=>[c,v[1]/v[0],v[0]]).sort((a,b)=>a[1]-b[1]).filter(x=>x[1]<.75).slice(0,4);
  const wk=weak.length?`<div class="sec-h"><h2>Kedudukan yang perlu diulang</h2></div><div class="chips">${weak.map(([c,r,n])=>`<span class="chip plain">${esc(QL(c)[0])} <b>${Math.round(r*100)}%</b> <small>(${n} soal)</small></span>`).join("")}</div><p class="km-info">Soal latihan i'rab otomatis lebih sering memilih kedudukan ini.</p>`:"";
  $("#main").innerHTML=`<div class="wrap"><header class="head"><div class="eyebrow">Latihan</div><h1>Latihan Interaktif</h1><div class="ar-title">تَمَارِيْنُ</div>
    <p>Uji pemahaman setelah membaca. Soal diambil dari kitab yang tersedia di aplikasi ini, jadi selalu sesuai dengan isi bacaan.</p>
    ${tot?`<div class="meta-row"><span class="tag">${fmt(tot)} soal dijawab</span><span class="tag">${Math.round(oks/tot*100)}% benar</span></div>`:""}</header>
    <div class="hcards">${cards}</div>${wk}
    <p class="foot-note">Progres latihan tersimpan di perangkat dan browser ini saja.</p></div>`;
}

/* ---------- Layar: pengaturan sebelum mulai ---------- */
function renderLatSetup(type){
  const L=LST.get(),sc=latScope(),i=LATI[type],n=L.n||10;
  const kOpt=[["","Semua kitab (memuat 17 file)"],...IDX.map(k=>[k.id,k.title])];
  const bOpt=[["","Semua bab dalam kitab ini"],...BABS.filter(b=>b.k===sc.k&&b.n).map(b=>[b.id,b.title])];
  const seg=(attr,vals,cur)=>`<div class="seg" role="group">${vals.map(([v,l])=>`<button type="button" ${attr}="${v}" aria-pressed="${String(cur)===String(v)}">${l}</button>`).join("")}</div>`;
  const sw=(k,lbl,on)=>`<div class="rrow"><span>${lbl}</span><button type="button" class="sw" data-lssw="${k}" role="switch" aria-checked="${!!on}" aria-label="${esc(lbl)}"></button></div>`;
  $("#main").innerHTML=pageBar({back:"latihan",backLabel:"Kembali ke latihan",sub:"Latihan",title:i.t})+`<div class="wrap lat">
    <header class="head"><div class="eyebrow">Latihan</div><h1>${i.t}</h1><div class="ar-title">${i.ar}</div><p>${i.d}</p></header>
    <section class="card lat-set"><h2>Pilih bahan latihan</h2>
      <label class="fld"><span>Kitab</span><select id="lsK" data-ls="k">${latOpt(kOpt,sc.k)}</select></label>
      <label class="fld"${sc.k?"":" hidden"}><span>Bab</span><select id="lsB" data-ls="b">${latOpt(bOpt,sc.b)}</select></label>
      <div class="fld"><span>Jumlah soal</span>${seg("data-lsn",[[5,5],[10,10],[15,15],[20,20]],n)}</div>
      ${type==="susun"?`<div class="fld"><span>Panjang kalimat</span>${seg("data-lslv",[[1,"Pendek"],[2,"Sedang"],[3,"Panjang"]],L.lv||2)}</div>
        <div class="rrows">${sw("matan","Hanya kalimat matan Abu Syuja'",L.matan)}${sw("hk","Tanpa harakat (lebih sulit)",L.hk)}</div>`:""}
      <div class="btns"><button type="button" class="btn pri" data-lat="start">${IC.arrow}Mulai latihan</button></div>
    </section>
    <p class="foot-note">${i.note}</p></div>`;
}

/* ---------- Layar: sesi soal ---------- */
function renderLat(sub){
  if(!sub){renderLatHub();return}
  if(LS.st&&LS.st.type===sub&&LS.st.active)renderLatSession();else renderLatSetup(sub);
}
async function latStart(type){
  const L=LST.get(),sc=latScope(),n=L.n||10,babs=scopeBabs(sc);
  $("#main").innerHTML=`<div class="wrap"><div class="loading">Menyiapkan soal…</div></div>`;
  try{await Promise.all([...new Set(babs.map(b=>b.k))].map(k=>loadKitab(k)))}catch(e){$("#main").innerHTML=failHTML();return}
  if(route.v!=="lat"||route.s!==type)return;
  const paras=babs.flatMap(b=>babParas(b));
  const qs=type==="irab"?buildIrab(paras,n):type==="kuis"?buildKuis(babs,paras,n):buildSusun(paras,n,L);
  if(!qs.length){
    $("#main").innerHTML=`<div class="wrap lat"><div class="empty"><p>Bahan di cakupan ini belum cukup untuk membuat soal ${LATI[type].t.toLowerCase()}. Coba pilih cakupan yang lebih luas.</p><div class="btns" style="justify-content:center"><button type="button" class="btn pri" data-lat="setup">Ubah cakupan</button></div></div></div>`;return;
  }
  LS.st={type,qs,i:0,score:0,res:[],active:true,done:false,n:qs.length,hk:!!L.hk};
  renderLatSession();
}
function latTop(st){
  return `<div class="lat-top"><span class="chip plain">Soal <b>${Math.min(st.i+1,st.n)}</b> dari ${st.n}</span><span class="chip plain">Benar <b>${st.score}</b></span><button type="button" class="chip" data-lat="stop">Akhiri</button></div>
    <div class="pbar" aria-hidden="true"><i style="width:${Math.round(st.res.length/st.n*100)}%"></i></div>`;
}
function mcqHTML(q,st){
  const ans=q.pick!=null,last=st.i+1>=st.n;
  return `<section class="card q"><div class="q-p">${esc(q.prompt)}</div>${q.big?`<div class="q-big">${esc(q.big)}</div>`:""}${q.ctx?`<div class="q-ctx ar">${q.ctx}</div>`:""}${q.sub?`<div class="q-sub">${esc(q.sub)}</div>`:""}
    <div class="q-opts" role="group" aria-label="Pilihan jawaban">${q.opts.map((o,i)=>`<button type="button" class="opt${ans?(i===q.ans?" ok":i===q.pick?" bad":""):""}" data-lat="opt" data-i="${i}"${ans?" disabled":""}><span class="opt-k">${i+1}</span><span class="opt-t">${esc(o.t)}${o.ar?` <span class="ar">${esc(o.ar)}</span>`:""}</span></button>`).join("")}</div>
    ${ans?`<div class="q-fb ${q.pick===q.ans?"ok":"bad"}" role="status"><b>${q.pick===q.ans?"Benar":"Belum tepat"}</b><p>${q.expl}</p>${q.link&&q.link.pid?`<a href="#${q.link.bab}" data-go="${q.link.bab}" data-para="${esc(q.link.pid)}" class="q-link">Buka paragraf di kitab</a>`:""}</div>
    <div class="btns"><button type="button" class="btn pri" data-lat="next" id="latNext">${last?"Lihat hasil":"Soal berikutnya"}${IC.arrow}</button></div>`:""}</section>`;
}
function susunHTML(q,st){
  const show=a=>st.hk?bareAr(a):a,inLine=new Set(q.slots),last=st.i+1>=st.n;
  const line=q.slots.map((si,pos)=>{const t=q.tiles[si];const c=q.done||q.mark?(t.a===q.correct[pos]?" ok":" bad"):"";return `<button type="button" class="tile${c}" data-lat="tl" data-i="${si}"${q.done?" disabled":""}>${esc(show(t.a))}</button>`}).join("");
  const pool=q.tiles.map((t,i)=>inLine.has(i)?"":`<button type="button" class="tile" data-lat="tp" data-i="${i}">${esc(show(t.a))}</button>`).join("");
  return `<section class="card q susun"><div class="q-p">Susun kata-kata berikut menjadi kalimat yang benar.</div>
    <div class="s-line ar${q.slots.length?"":" empty"}" aria-label="Baris jawaban">${line||'<span class="s-ph">Ketuk kata di bawah untuk memulai</span>'}</div>
    <div class="s-pool ar" aria-label="Kata-kata acak">${pool||""}</div>
    ${q.hint||q.done?`<div class="q-sub">Makna berurutan: ${esc(q.meaning)}</div>`:`<button type="button" class="chip" data-lat="hint">Tampilkan petunjuk makna</button>`}
    ${q.msg&&!q.done?`<div class="q-fb bad" role="status"><p>${esc(q.msg)}</p></div>`:""}
    ${q.done?`<div class="q-fb ${q.good?"ok":"bad"}" role="status"><b>${q.good?"Benar":q.rev?"Jawaban yang benar":"Selesai"}</b><p class="ar q-ans">${esc(q.correct.join(" "))}</p>${q.link?`<a href="#${q.link.bab}" data-go="${q.link.bab}" data-para="${esc(q.link.pid)}" class="q-link">Buka paragraf di kitab</a>`:""}</div>
      <div class="btns"><button type="button" class="btn pri" data-lat="next" id="latNext">${last?"Lihat hasil":"Soal berikutnya"}${IC.arrow}</button></div>`
    :`<div class="btns"><button type="button" class="btn pri" data-lat="chk"${q.slots.length===q.tiles.length?"":" disabled"}>Periksa</button><button type="button" class="btn" data-lat="clr"${q.slots.length?"":" disabled"}>Kosongkan</button><button type="button" class="btn" data-lat="rev">Lihat jawaban</button></div>`}</section>`;
}
function renderLatSession(){
  const st=LS.st;if(!st){renderLatHub();return}
  const bar=pageBar({back:"latihan",backLabel:"Kembali ke latihan",sub:"Latihan",title:LATI[st.type].t});
  if(st.done){$("#main").innerHTML=bar+`<div class="wrap lat">${latResult(st)}</div>`;$("#main").scrollTop=0;return}
  const q=st.qs[st.i];
  $("#main").innerHTML=bar+`<div class="wrap lat">${latTop(st)}${q.type==="susun"?susunHTML(q,st):mcqHTML(q,st)}</div>`;
}
function latResult(st){
  const pct=st.res.length?Math.round(st.score/st.res.length*100):0;
  const msg=pct>=90?"Mumtaz, sangat baik!":pct>=70?"Bagus, terus lanjutkan.":pct>=50?"Cukup. Ulangi bagian yang salah.":"Jangan menyerah. Baca ulang bab lalu coba lagi.";
  const wrong=st.res.filter(r=>!r.ok);
  let brk="";
  if(st.type==="irab"){
    const by={};st.res.forEach(r=>{const b=by[r.q.code]=by[r.q.code]||[0,0];b[0]++;if(r.ok)b[1]++});
    brk=`<div class="chips">${Object.entries(by).map(([c,v])=>`<span class="chip plain">${esc(QL(c)[0])} <b>${v[1]}/${v[0]}</b></span>`).join("")}</div>`;
  }
  const items=wrong.map(r=>{const q=r.q;
    const body=q.type==="susun"?`<span class="ar w-ar">${esc(q.correct.join(" "))}</span>`
      :q.type==="irab"?`<span class="ar w-ar">${esc(q.ar)}</span><span class="w-t">${q.expl}</span>`
      :`<span class="w-t">${q.big?esc(q.big)+" → ":""}${q.expl}</span>`;
    return `<li>${body}${q.link&&q.link.pid?`<a href="#${q.link.bab}" data-go="${q.link.bab}" data-para="${esc(q.link.pid)}" class="q-link">Buka paragraf</a>`:""}</li>`}).join("");
  return `<section class="card result"><div class="res-score"><b>${st.score}</b><span>/ ${st.res.length}</span></div><div class="res-pct">${pct}% benar</div><p>${msg}</p>${brk}</section>
    ${wrong.length?`<div class="sec-h"><h2>Yang perlu diulang (${wrong.length})</h2></div><ul class="w-list">${items}</ul>`:""}
    <div class="btns res-btns">${wrong.length?`<button type="button" class="btn pri" data-lat="redo">Ulangi yang salah</button>`:""}<button type="button" class="btn${wrong.length?"":" pri"}" data-lat="setup">Latihan baru</button><a class="btn" href="#latihan" data-go="latihan">Menu latihan</a></div>`;
}
function latNext(){
  const st=LS.st;if(!st)return;
  if(st.i+1>=st.n){st.done=true;st.active=false}else st.i++;
  renderLatSession();$("#main").scrollTop=0;
}
function latRecord(q,ok){
  const st=LS.st;st.res.push({ok,q});if(ok)st.score++;
  latStat(st.type,ok,q.code);
}
function latStop(){
  const st=LS.st;if(!st)return;
  if(!st.res.length){LS.st=null;renderLatSetup(st.type);return}
  st.n=st.res.length;st.done=true;st.active=false;renderLatSession();
}
function latRedo(){
  const st=LS.st;if(!st)return;
  const qs=st.res.filter(r=>!r.ok).map(r=>{const q=r.q;
    if(q.type==="susun"){const order=q.tiles.map((_,i)=>i);shuf(order);return {...q,tiles:order.map(i=>q.tiles[i]),slots:[],tries:0,done:false,hint:false,msg:"",mark:false,good:false,rev:false}}
    const c={...q};delete c.pick;return c});
  LS.st={type:st.type,qs:shuf(qs),i:0,score:0,res:[],active:true,done:false,n:qs.length,hk:st.hk};
  renderLatSession();$("#main").scrollTop=0;
}
function latSusunDone(q,ok){q.done=true;q.good=ok;latRecord(q,ok)}
function latAct(a,el){
  const st=LS.st,q=st&&!st.done?st.qs[st.i]:null;
  if(a==="start"){latStart(route.s);return}
  if(a==="setup"){const t=st?st.type:route.s;LS.st=null;if(route.s!==t)go("latihan-"+t);else renderLatSetup(t);return}
  if(a==="stop"){latStop();return}
  if(a==="next"){latNext();return}
  if(a==="redo"){latRedo();return}
  if(!q)return;
  if(a==="opt"){
    if(q.pick!=null)return;
    q.pick=+el.dataset.i;latRecord(q,q.pick===q.ans);renderLatSession();
    const nb=$("#latNext");if(nb)try{nb.focus({preventScroll:true});nb.scrollIntoView({block:"nearest",behavior:"smooth"})}catch(_){}
    return;
  }
  if(q.type!=="susun"||q.done)return;
  if(a==="tp"){q.slots.push(+el.dataset.i);q.msg="";q.mark=false}
  else if(a==="tl"){const i=+el.dataset.i;q.slots=q.slots.filter(x=>x!==i);q.msg="";q.mark=false}
  else if(a==="clr"){q.slots=[];q.msg="";q.mark=false}
  else if(a==="hint"){q.hint=true}
  else if(a==="chk"){
    if(q.slots.length!==q.tiles.length)return;
    if(q.slots.every((si,pos)=>q.tiles[si].a===q.correct[pos])){latSusunDone(q,q.tries===0&&!q.rev)}
    else{q.tries++;q.mark=true;q.msg="Belum tepat. Kata bergaris merah masih salah tempat; ketuk untuk memindahkannya."}
  }else if(a==="rev"){
    q.rev=true;q.slots=q.tiles.map((t,i)=>[i,t.ord]).sort((x,y)=>x[1]-y[1]).map(x=>x[0]);latSusunDone(q,false);
  }
  renderLatSession();
  if(q.done){const nb=$("#latNext");if(nb)try{nb.focus({preventScroll:true})}catch(_){}}
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-lat]");if(b&&route.v==="lat"){e.preventDefault();latAct(b.dataset.lat,b);return}
  if(route.v!=="lat")return;
  const n=e.target.closest("[data-lsn]");if(n){const L=LST.get();L.n=+n.dataset.lsn;LST.set(L);renderLatSetup(route.s);return}
  const lv=e.target.closest("[data-lslv]");if(lv){const L=LST.get();L.lv=+lv.dataset.lslv;LST.set(L);renderLatSetup(route.s);return}
  const sw=e.target.closest("[data-lssw]");if(sw){const L=LST.get();L[sw.dataset.lssw]=!L[sw.dataset.lssw];LST.set(L);renderLatSetup(route.s);return}
});
document.addEventListener("change",e=>{
  const s=e.target.closest("[data-ls]");if(!s||route.v!=="lat")return;
  const L=LST.get(),sc=latScope();
  if(s.dataset.ls==="k"){sc.k=s.value;sc.b=""}else sc.b=s.value;
  L.sc=sc;LST.set(L);renderLatSetup(route.s);
});
document.addEventListener("keydown",e=>{
  if(route.v!=="lat"||!LS.st||LS.st.done||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
  const q=LS.st.qs[LS.st.i];if(!q||q.type==="susun"||q.pick!=null)return;
  const i=+e.key-1;if(i>=0&&i<q.opts.length){e.preventDefault();q.pick=i;latRecord(q,i===q.ans);renderLatSession();const nb=$("#latNext");if(nb)nb.focus({preventScroll:true})}
});
