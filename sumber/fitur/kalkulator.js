/* =====================================================================
   Kalkulator fiqih: zakat, waris (faraidh), haidh dan istihadhah.
   Logika ada di fitur/lib/*.js (ZakatLib, WarisLib, HaidhLib, bisa diuji di Node);
   berkas ini hanya tampilan. Memakai helper app.js: $, esc, fmt, IC, pageBar, store.
   ===================================================================== */
const KALI={
  zakat:{t:"Kalkulator Zakat",ar:"حِسَابُ الزَّكَاةِ",ic:"coin",d:"Emas, perak, uang, barang dagangan, hasil tani, fitrah, dan hewan ternak. Nishab dan kadar mengikuti Kitab Zakat Fathul Qorib.",bab:"u33"},
  waris:{t:"Kalkulator Waris",ar:"حِسَابُ الْفَرَائِضِ",ic:"scale",d:"Pilih ahli waris, lihat bagian masing-masing lengkap dengan alasan, termasuk 'aul, radd, dan hajb.",bab:"u75"},
  haidh:{t:"Haid dan Istihadhah",ar:"الْحَيْضُ وَالِاسْتِحَاضَةُ",ic:"drop",d:"Tentukan berapa lama darah yang keluar terhitung haid dan mana yang istihadhah, sesuai keadaan perempuan.",bab:"u14"}
};
const KAL_TOOLS=["zakat","waris","haidh"];
const KAL_NOTE="Alat bantu belajar. Untuk kasus nyata, terutama waris dan haid yang rumit, tanyakan kepada ustadz atau ustadzah.";
const KLS={zt:"emas",wr:{},wrHarta:""};
const KST={get(){return store.get("kal",{})},set(o){const c=KST.get();store.set("kal",{...c,...o})}};

/* ---------- Pembantu ---------- */
function numIn(v){
  let s=String(v==null?"":v).trim().replace(/\s|Rp/gi,"");
  if(!s)return 0;
  if(s.includes(".")&&s.includes(","))s=s.replace(/\./g,"").replace(",",".");
  else if(s.includes(","))s=s.replace(",",".");
  else if(/^\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,"");
  const n=parseFloat(s);return isFinite(n)&&n>0?n:0;
}
const nf=(x,d)=>(+x).toLocaleString("id-ID",{maximumFractionDigits:d==null?2:d});
const rp=x=>"Rp "+nf(Math.round(x),0);
const kField=(id,label,val,o)=>{o=o||{};return `<label class="fld"><span>${label}${o.hint?`<small>${o.hint}</small>`:""}</span><span class="fld-in"><input id="${id}" name="${id}" type="text" inputmode="decimal" autocomplete="off" value="${esc(val==null?"":val)}"${o.ph?` placeholder="${esc(o.ph)}"`:""}>${o.unit?`<i>${o.unit}</i>`:""}</span></label>`};
const kSel=(id,label,opts,cur)=>`<label class="fld"><span>${label}</span><span class="fld-in"><select id="${id}" name="${id}">${opts.map(([v,l])=>`<option value="${v}"${v===cur?" selected":""}>${esc(l)}</option>`).join("")}</select></span></label>`;
const kSw=(id,label,on)=>`<div class="rrow"><span>${label}</span><button type="button" class="sw" data-ksw="${id}" role="switch" aria-checked="${!!on}" aria-label="${esc(label)}"></button></div>`;
const kStat=(ok,yes,no)=>`<div class="kres-st ${ok?"ok":"no"}"><b>${ok?yes:no}</b></div>`;
const kRow=(l,v)=>`<div class="kres-r"><span>${l}</span><b>${v}</b></div>`;
const kRef=bab=>{const b=BABS.find(x=>x.id===bab);return b&&b.n?`<a class="q-link" href="#${bab}" data-go="${bab}">Baca babnya di kitab: ${esc(b.title)}</a>`:""};

/* ---------- Beranda kalkulator ---------- */
function renderKalHub(){
  $("#main").innerHTML=`<div class="wrap"><header class="head"><div class="eyebrow">Kalkulator</div><h1>Kalkulator Fiqih</h1><div class="ar-title">آلَاتُ الْحِسَابِ</div>
    <p>Hitung langsung hukum yang dibahas dalam kitab. Setiap hasil disertai alasannya, supaya bisa dipakai belajar dan bukan hanya untuk mendapat angka.</p></header>
    <div class="hcards">${KAL_TOOLS.map(t=>{const i=KALI[t];return `<a class="hcard" href="#kalkulator-${t}" data-go="kalkulator-${t}"><span class="hc-ic">${IC[i.ic]}</span><span class="hc-tx"><b>${i.t}</b><span class="ar">${i.ar}</span><span class="hc-d">${i.d}</span></span><span class="hc-go">${IC.chevR}</span></a>`}).join("")}</div>
    <p class="foot-note">${KAL_NOTE}</p></div>`;
}
function renderKal(sub){
  if(!sub||!KALI[sub]){renderKalHub();return}
  const i=KALI[sub];
  const body=sub==="zakat"?zakatUI():sub==="waris"?warisUI():haidhUI();
  $("#main").innerHTML=pageBar({back:"kalkulator",backLabel:"Kembali ke kalkulator",sub:"Kalkulator",title:i.t})+`<div class="wrap kal">
    <header class="head"><div class="eyebrow">Kalkulator</div><h1>${i.t}</h1><div class="ar-title">${i.ar}</div><p>${i.d}</p></header>${body}
    <p class="foot-note">${KAL_NOTE}</p>${kRef(i.bab)}</div>`;
  if(sub==="zakat")zakatCalc();else if(sub==="waris")warisCalc();else haidhCalc();
}

/* ====================== ZAKAT ====================== */
const ZTABS=[["emas","Emas dan perak"],["uang","Uang"],["dagang","Dagang"],["tani","Hasil tani"],["fitrah","Fitrah"],["ternak","Ternak"]];
function zakatUI(){
  const S=KST.get(),t=KLS.zt,D=ZakatLib.DEF;
  const seg=`<div class="ktabs" role="tablist" aria-label="Jenis zakat">${ZTABS.map(([v,l])=>`<button type="button" role="tab" data-kt="${v}" aria-selected="${v===t}">${l}</button>`).join("")}</div>`;
  const gold=kField("hargaEmas","Harga emas per gram",S.hargaEmas||"",{unit:"Rp",ph:"Contoh: 1.500.000",hint:"Cek harga hari ini"});
  const nsb=(id,v,u,h)=>kField(id,"Nishab (bisa diubah)",v,{unit:u,hint:h});
  let f="";
  if(t==="emas")f=`${kSel("logam","Jenis logam",[["emas","Emas (nishab 20 mitsqal)"],["perak","Perak (nishab 200 dirham)"]],S.logam||"emas")}
    ${kField("gram","Berat yang dimiliki",S.gram||"",{unit:"gram",ph:"0"})}
    ${kField("nishab","Nishab (bisa diubah)",S.nishab||"",{unit:"gram",hint:"Kosongkan untuk "+D.emasGram+" g emas atau "+D.perakGram+" g perak"})}
    ${kField("harga","Harga per gram (opsional)",S.harga||"",{unit:"Rp",hint:"Untuk melihat nilai rupiahnya"})}
    <p class="kf-note">Wajib bila sudah mencapai nishab dan dimiliki satu tahun (haul). Kadarnya 2,5%.</p>`;
  else if(t==="uang")f=`${kField("jumlah","Uang tunai dan tabungan",S.jumlah||"",{unit:"Rp",ph:"0"})}${gold}${nsb("nishab2",S.nishab2||"","gram","Kosongkan untuk "+D.emasGram+" g emas")}
    <p class="kf-note">Uang dikiaskan pada emas dan perak: nishabnya setara 20 mitsqal emas, haul satu tahun, kadar 2,5%.</p>`;
  else if(t==="dagang")f=`${kField("barang","Nilai barang dagangan",S.barang||"",{unit:"Rp",ph:"0",hint:"Dinilai dengan harga saat haul"})}
    ${kField("kas","Uang kas usaha",S.kas||"",{unit:"Rp",ph:"0"})}
    ${kField("piutang","Piutang yang bisa ditagih",S.piutang||"",{unit:"Rp",ph:"0"})}
    ${kField("utang","Utang jatuh tempo",S.utang||"",{unit:"Rp",ph:"0"})}
    <div class="rrows">${kSw("kurangi","Kurangi utang dari harta",!!S.kurangi)}</div>
    ${gold}${nsb("nishab2",S.nishab2||"","gram","Kosongkan untuk "+D.emasGram+" g emas")}
    <p class="kf-note">Zakat dagang dihitung pada akhir haul: nilai barang dibandingkan dengan nishab emas, kadar 2,5%. Pengurangan utang diperselisihkan, jadi dibuat pilihan.</p>`;
  else if(t==="tani")f=`${kField("hasil","Hasil panen",S.hasil||"",{unit:"kg",ph:"0"})}
    ${kSel("jenis","Cara pengairan",Object.entries(ZakatLib.PENGAIRAN).map(([k,v])=>[k,v.t+" ("+nf(v.k*100,1)+"%)"]),S.jenis||"hujan")}
    ${kField("nishab3","Nishab (bisa diubah)",S.nishab3||"",{unit:"kg",hint:"Kosongkan untuk "+D.panenKg+" kg (5 wasaq)"})}
    <p class="kf-note">Wajib saat panen tanpa menunggu haul, bila mencapai 5 wasaq. Untuk padi, nishab umumnya dihitung dalam beras atau gabah; sesuaikan angka nishab dengan keterangan ustadz setempat.</p>`;
  else if(t==="fitrah")f=`${kField("jiwa","Jumlah jiwa yang ditanggung",S.jiwa||"1",{unit:"orang"})}
    ${kField("kgJiwa","Takaran per jiwa (1 sha')",S.kgJiwa||"",{unit:"kg",hint:"Kosongkan untuk "+nf(D.fitrahKg)+" kg"})}
    ${kField("hargaKg","Harga makanan pokok per kg (opsional)",S.hargaKg||"",{unit:"Rp",hint:"Bila dibayar dengan uang"})}
    <p class="kf-note">Zakat fitrah satu sha' makanan pokok per jiwa. Dalam madzhab Syafi'i dibayar dengan makanan pokok; pembayaran dengan uang adalah pendapat madzhab lain yang dipakai sebagian lembaga zakat.</p>`;
  else f=`${kSel("ternak","Jenis hewan",[["kambing","Kambing atau domba"],["sapi","Sapi atau kerbau"],["unta","Unta"]],S.ternak||"kambing")}
    ${kField("ekor","Jumlah hewan",S.ekor||"",{unit:"ekor",ph:"0"})}
    <p class="kf-note">Hewan harus digembalakan di padang rumput umum (saimah) dan dimiliki satu tahun.</p>`;
  return `${seg}<form class="card kform" data-kform="zakat" onsubmit="return false">${f}</form><div id="kres" class="kres" aria-live="polite"></div>`;
}
function zakatCalc(){
  const t=KLS.zt,v=id=>{const e=document.getElementById(id);return e?e.value:""},D=ZakatLib.DEF,res=$("#kres");if(!res)return;
  const save={};["gram","nishab","harga","jumlah","hargaEmas","nishab2","barang","kas","piutang","utang","hasil","nishab3","jiwa","kgJiwa","hargaKg","ekor"].forEach(k=>{const e=document.getElementById(k);if(e)save[k]=e.value});
  ["logam","jenis","ternak"].forEach(k=>{const e=document.getElementById(k);if(e)save[k]=e.value});
  KST.set(save);
  let h="";
  if(t==="emas"){
    const lg=v("logam")||"emas",ns=numIn(v("nishab"))||(lg==="emas"?D.emasGram:D.perakGram),r=ZakatLib.logam(numIn(v("gram")),ns,numIn(v("harga")));
    h=!r.gram?`<p class="kres-h">Isi berat ${lg} yang dimiliki.</p>`:kStat(r.capai,"Wajib zakat","Belum wajib zakat")+kRow("Nishab",nf(ns)+" gram")+kRow("Dimiliki",nf(r.gram)+" gram")+
      (r.capai?kRow("Zakat (2,5%)",nf(r.zakatGram,3)+" gram")+(r.harga?kRow("Senilai",rp(r.zakatRp)):""):kRow("Kurang dari nishab",nf(r.kurang)+" gram"));
  }else if(t==="uang"||t==="dagang"){
    let r;
    if(t==="uang")r=ZakatLib.uang(numIn(v("jumlah")),numIn(v("hargaEmas")),numIn(v("nishab2")));
    else r=ZakatLib.dagang({barang:numIn(v("barang")),kas:numIn(v("kas")),piutang:numIn(v("piutang")),utang:numIn(v("utang")),kurangiUtang:(document.querySelector('[data-ksw="kurangi"]')||{}).getAttribute&&document.querySelector('[data-ksw="kurangi"]').getAttribute("aria-checked")==="true",hargaEmas:numIn(v("hargaEmas")),nishabGram:numIn(v("nishab2"))});
    const jml=t==="uang"?r.jumlah:r.total;
    if(!jml)h=`<p class="kres-h">Isi jumlah harta.</p>`;
    else if(r.perluHarga)h=`<p class="kres-h">Isi harga emas per gram agar nishab dalam rupiah bisa dihitung.</p>`;
    else h=kStat(r.capai,"Wajib zakat","Belum wajib zakat")+(t==="dagang"?kRow("Total harta dagang",rp(jml)):kRow("Harta",rp(jml)))+kRow("Nishab",rp(r.nishabRp))+(r.capai?kRow("Zakat (2,5%)",rp(r.zakat)):kRow("Kurang dari nishab",rp(r.kurang)));
  }else if(t==="tani"){
    const r=ZakatLib.tani(numIn(v("hasil")),v("jenis"),numIn(v("nishab3")));
    h=!r.hasilKg?`<p class="kres-h">Isi hasil panen.</p>`:kStat(r.capai,"Wajib zakat","Belum wajib zakat")+kRow("Nishab",nf(r.nishabKg)+" kg")+kRow("Hasil panen",nf(r.hasilKg)+" kg")+kRow("Kadar",nf(r.kadar*100,1)+"%")+(r.capai?kRow("Zakat",nf(r.zakatKg,2)+" kg"):kRow("Kurang dari nishab",nf(r.kurang)+" kg"));
  }else if(t==="fitrah"){
    const r=ZakatLib.fitrah(numIn(v("jiwa")),numIn(v("kgJiwa")),numIn(v("hargaKg")));
    h=!r.jiwa?`<p class="kres-h">Isi jumlah jiwa.</p>`:kRow("Jumlah jiwa",nf(r.jiwa,0))+kRow("Per jiwa",nf(r.kgPerJiwa)+" kg")+`<div class="kres-big"><span>Total zakat fitrah</span><b>${nf(r.kg)} kg</b></div>`+(r.harga?kRow("Bila dibayar uang",rp(r.nilai)):"");
  }else{
    const jn=v("ternak")||"kambing",r=ZakatLib.ternak(jn,numIn(v("ekor")));
    if(!r.n)h=`<p class="kres-h">Isi jumlah hewan.</p>`;
    else if(!r.ada)h=kStat(false,"","Belum wajib zakat")+kRow("Nishab",r.nishab+" ekor")+kRow("Kurang",r.kurang+" ekor");
    else h=kStat(true,"Wajib zakat","")+(r.rentang?kRow("Rentang",r.rentang):"")+`<div class="kres-big"><span>Yang dikeluarkan${r.opsi.length>1?" (pilih salah satu)":""}</span>${r.opsi.map(o=>`<ul>${o.map(x=>`<li><b>${x.j}</b> ${esc(x.t)}</li>`).join("")}</ul>`).join(r.opsi.length>1?"<div class=\"kres-or\">atau</div>":"")}</div>`+(r.sisa?kRow("Sisa hewan yang tidak terhitung",r.sisa+" ekor"):"")+r.catatan.map(c=>`<p class="kf-note">${esc(c)}</p>`).join("");
  }
  res.innerHTML=h;
}

/* ====================== WARIS ====================== */
const WGROUP=[["Pasangan",["suami","istri"]],["Keturunan",["anakL","anakP","cucuL","cucuP"]],["Orang tua dan kakek-nenek",["ayah","kakek","ibu","nenekIbu","nenekAyah"]],["Saudara",["sdrKL","sdrKP","sdrAL","sdrAP","sdrI"]],["Keponakan, paman, dan sepupu",["ponKL","ponAL","pamK","pamA","sepK","sepA"]]];
function warisUI(){
  const L=WarisLib.LABEL;
  const g=WGROUP.map(([t,ks])=>`<fieldset class="wgrp"><legend>${t}</legend>${ks.map(k=>`<div class="wrow"><span id="wl-${k}">${esc(L[k])}</span><span class="stp" role="group" aria-labelledby="wl-${k}"><button type="button" data-wd="${k}:-1" aria-label="Kurangi ${esc(L[k])}">−</button><output id="wn-${k}">${KLS.wr[k]||0}</output><button type="button" data-wd="${k}:1" aria-label="Tambah ${esc(L[k])}">+</button></span></div>`).join("")}</fieldset>`).join("");
  return `<form class="card kform" data-kform="waris" onsubmit="return false"><p class="kf-note" style="margin-top:0">Pilih ahli waris yang masih hidup saat pewaris wafat. Utang, wasiat, dan biaya pemakaman dikeluarkan lebih dahulu dari harta.</p>${g}
    ${kField("harta","Harta waris bersih (opsional)",KLS.wrHarta,{unit:"Rp",hint:"Untuk melihat bagian dalam rupiah"})}
    <button type="button" class="btn" data-wreset>Kosongkan semua</button></form><div id="kres" class="kres" aria-live="polite"></div>`;
}
const WST={fardh:"Bagian pasti",ashabah:"'Ashabah (sisa)",muqasamah:"Muqasamah",musyarakah:"Musyarakah",nol:"Tidak mendapat bagian",mahjub:"Terhalang"};
function warisCalc(){
  const res=$("#kres");if(!res)return;
  KLS.wrHarta=(document.getElementById("harta")||{}).value||"";
  const R=WarisLib.hitung(KLS.wr);
  if(R.error){res.innerHTML=Object.values(KLS.wr).some(x=>x>0)?`<p class="kres-h warn">${esc(R.error)}</p>`:`<p class="kres-h">Pilih ahli waris untuk melihat pembagiannya.</p>`;return}
  if(R.unsupported){res.innerHTML=`<p class="kres-h warn">${esc(R.unsupported)}</p>`;return}
  const harta=numIn(KLS.wrHarta),W=WarisLib;
  const pct=f=>nf(W.val(f)*100,2)+"%";
  const rows=R.rows.map(r=>{const got=r.status!=="mahjub"&&r.status!=="nol";
    return `<tr class="${got?"":"off"}"><th scope="row">${esc(r.label)}${r.n>1?` <small>(${r.n} orang)</small>`:""}</th><td>${WST[r.status]||r.status}</td><td class="num">${got?`<b>${W.txt(r.f)}</b><small>${pct(r.f)}</small>`:"-"}</td>${harta?`<td class="num">${got?rp(W.val(r.f)*harta)+(r.n>1?`<small>${rp(W.val(r.per)*harta)} per orang</small>`:""):"-"}</td>`:""}</tr><tr class="why"><td colspan="${harta?4:3}">${esc(r.why)}</td></tr>`}).join("");
  const tot=R.rows.reduce((a,r)=>W.add(a,r.f),W.Z);
  res.innerHTML=`${R.aul?`<div class="kres-st warn"><b>'Aul: asal masalah ${R.aul.dari} menjadi ${R.aul.ke}</b></div>`:""}${R.radd?`<div class="kres-st warn"><b>Radd: ada sisa yang dikembalikan</b></div>`:""}
    <div class="ktable"><table><thead><tr><th>Ahli waris</th><th>Status</th><th class="num">Bagian</th>${harta?'<th class="num">Rupiah</th>':""}</tr></thead><tbody>${rows}</tbody></table></div>
    ${W.gt(R.baitulMal,W.Z)?kRow("Sisa untuk baitul mal",W.txt(R.baitulMal)):""}
    ${R.notes.map(n=>`<p class="kf-note">${esc(n)}</p>`).join("")}`;
}

/* ====================== HAIDH ====================== */
const HS=[["mubtadiah","Baru pertama haid (mubtadi'ah)"],["mutadah","Sudah punya kebiasaan (mu'tadah)"],["mutahayyirah","Lupa kebiasaan (mutahayyirah)"]];
function haidhUI(){
  const S=KST.get().hd||{status:"mubtadiah",tamyiz:false};
  const seg=`<div class="ktabs v" role="radiogroup" aria-label="Keadaan perempuan">${HS.map(([v,l])=>`<button type="button" role="radio" data-hs="${v}" aria-checked="${v===S.status}">${l}</button>`).join("")}</div>`;
  return `<form class="card kform" data-kform="haidh" onsubmit="return false"><h2 class="kf-h">Keadaan</h2>${seg}
    <div id="hAdat"${S.status==="mutadah"?"":" hidden"}>${kField("hAdatHari","Kebiasaan haid",S.adatHari||"",{unit:"hari",hint:"Lama haid yang biasa dialami"})}</div>
    <h2 class="kf-h">Darah yang keluar</h2>
    <div class="rrows">${kSw("tamyiz","Darahnya bisa dibedakan (kuat dan lemah)",!!S.tamyiz)}</div>
    <div id="hPlain"${S.tamyiz?" hidden":""}>${kField("hHari","Sudah keluar berapa hari",S.hari||"",{unit:"hari",ph:"0"})}${kField("hJam","Ditambah jam",S.jam||"",{unit:"jam",ph:"0"})}</div>
    <div id="hTam"${S.tamyiz?"":" hidden"}>${kField("hKuat","Lama darah kuat (hitam atau merah tua)",S.kuat||"",{unit:"hari"})}${kField("hLemah","Lama darah lemah (merah muda atau kuning)",S.lemah||"",{unit:"hari"})}</div>
    <p class="kf-note">Darah dianggap keluar terus-menerus tanpa putus. Batas haid: paling sedikit sehari semalam, paling lama 15 hari 15 malam.</p></form><div id="kres" class="kres" aria-live="polite"></div>`;
}
const fJam=j=>{j=Math.round(j);const d=Math.floor(j/24),h=j%24;return (d?d+" hari":"")+(d&&h?" ":"")+(h?h+" jam":"")||"0"};
function haidhCalc(){
  const res=$("#kres");if(!res)return;
  const g=id=>(document.getElementById(id)||{}).value||"";
  const on=document.querySelector('[data-ksw="tamyiz"]').getAttribute("aria-checked")==="true";
  const st=(document.querySelector("[data-hs][aria-checked=true]")||{dataset:{hs:"mubtadiah"}}).dataset.hs;
  KST.set({hd:{status:st,tamyiz:on,adatHari:g("hAdatHari"),hari:g("hHari"),jam:g("hJam"),kuat:g("hKuat"),lemah:g("hLemah")}});
  const R=HaidhLib.analisis({status:st,adatHari:numIn(g("hAdatHari")),tamyiz:on,kuatHari:numIn(g("hKuat")),lemahHari:numIn(g("hLemah")),hari:numIn(g("hHari")),jam:numIn(g("hJam"))});
  if(R.error){res.innerHTML=`<p class="kres-h">${esc(R.error)}</p>`;return}
  const bar=R.segmen.filter(s=>s.b>s.a).map(s=>`<span class="hb ${s.t}" style="flex:${s.b-s.a}">${s.t==="haid"?"Haid":"Istihadhah"}<small>${fJam(s.b-s.a)}</small></span>`).join("");
  const kat=R.kategori==="kurang"?"Bukan haid":R.kategori==="dalam15"?"Seluruhnya haid":"Sebagian haid, sisanya istihadhah";
  res.innerHTML=`<div class="kres-st ${R.haidJam?"ok":"no"}"><b>${kat}</b></div>
    <div class="hbar" role="img" aria-label="Pembagian darah: ${R.segmen.map(s=>(s.t==="haid"?"haid ":"istihadhah ")+fJam(s.b-s.a)).join(", ")}">${bar||""}</div>
    ${R.tak?`<p class="kres-h warn">${esc(R.tak)}</p>`:kRow("Haid",fJam(R.haidJam))+kRow("Istihadhah",fJam(R.H-R.haidJam))+kRow("Cara penentuan",esc(R.metode))}
    ${R.alasan.map(a=>`<p class="kf-note">${esc(a)}</p>`).join("")}
    ${R.haidJam&&R.kategori!=="kurang"?`<p class="kf-note">Setelah haid berakhir wajib mandi, lalu shalat. Pada hari istihadhah perempuan tetap shalat dan puasa dengan bersuci seperti biasa (membersihkan darah, menyumbat, dan berwudhu setiap akan shalat fardhu).</p>`:""}`;
}

/* ---------- Interaksi ---------- */
document.addEventListener("click",e=>{
  if(route.v!=="kal")return;
  const t=e.target.closest("[data-kt]");if(t){KLS.zt=t.dataset.kt;renderKal("zakat");return}
  const sw=e.target.closest("[data-ksw]");if(sw){const on=sw.getAttribute("aria-checked")!=="true";sw.setAttribute("aria-checked",on);
    if(sw.dataset.ksw==="tamyiz"){$("#hPlain").hidden=on;$("#hTam").hidden=!on;haidhCalc()}else{const s=KST.get();KST.set({kurangi:on});zakatCalc()}return}
  const hs=e.target.closest("[data-hs]");if(hs){document.querySelectorAll("[data-hs]").forEach(b=>b.setAttribute("aria-checked",b===hs));$("#hAdat").hidden=hs.dataset.hs!=="mutadah";haidhCalc();return}
  const wd=e.target.closest("[data-wd]");
  if(wd){const [k,d]=wd.dataset.wd.split(":"),mx=WarisLib.MAX[k]||30;let n=(KLS.wr[k]||0)+(+d);n=Math.max(0,Math.min(mx,n));KLS.wr[k]=n;
    if(n&&k==="suami")KLS.wr.istri=0;if(n&&k==="istri")KLS.wr.suami=0;
    ["suami","istri"].forEach(x=>{const o=document.getElementById("wn-"+x);if(o)o.textContent=KLS.wr[x]||0});
    document.getElementById("wn-"+k).textContent=n;warisCalc();return}
  if(e.target.closest("[data-wreset]")){KLS.wr={};KLS.wrHarta="";renderKal("waris");return}
});
document.addEventListener("input",e=>{
  if(route.v!=="kal"||!e.target.closest("[data-kform]"))return;
  const f=e.target.closest("[data-kform]").dataset.kform;
  if(f==="zakat")zakatCalc();else if(f==="waris")warisCalc();else haidhCalc();
});
document.addEventListener("change",e=>{
  if(route.v!=="kal"||e.target.tagName!=="SELECT")return;
  if(e.target.closest("[data-kform=zakat]"))zakatCalc();
});
