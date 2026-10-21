/* Hitungan zakat madzhab Syafi'i, mengacu pada Kitab Zakat Fathul Qorib. Murni logika (tanpa DOM).
   Angka konversi (gram, kilogram) adalah angka yang lazim dipakai; ulama berbeda dalam mengonversi
   mitsqal, dirham, rithl, dan wasaq ke satuan modern, jadi semua bisa diubah pengguna. */
const ZakatLib=(()=>{
const DEF={emasGram:85,perakGram:595,panenKg:653,fitrahKg:2.5};
const KADAR=0.025;   // seperempat dari sepersepuluh
const n0=x=>{x=+x;return isFinite(x)&&x>0?x:0};

/* Emas atau perak (bila sudah haul): 20 mitsqal emas, 200 dirham perak, kadar 2,5% */
function logam(gram,nishab,harga){
  gram=n0(gram);nishab=n0(nishab);harga=n0(harga);
  const capai=nishab>0&&gram>=nishab;
  const zk=capai?gram*KADAR:0;
  return {gram,nishab,capai,kurang:capai?0:Math.max(0,nishab-gram),zakatGram:zk,zakatRp:harga&&zk?zk*harga:0,harga};
}
/* Uang tunai/tabungan: dikiaskan pada emas dan perak; nishab dihitung dari harga emas */
function uang(jumlah,hargaEmas,nishabGram){
  jumlah=n0(jumlah);hargaEmas=n0(hargaEmas);nishabGram=n0(nishabGram)||DEF.emasGram;
  const nishabRp=hargaEmas*nishabGram;
  const capai=nishabRp>0&&jumlah>=nishabRp;
  return {jumlah,nishabRp,capai,kurang:capai?0:Math.max(0,nishabRp-jumlah),zakat:capai?jumlah*KADAR:0,perluHarga:!hargaEmas};
}
/* Barang dagangan: dinilai pada akhir haul, lalu dizakati 2,5% bila nilainya mencapai nishab */
function dagang(o){
  const barang=n0(o.barang),kas=n0(o.kas),piutang=n0(o.piutang),utang=n0(o.utang),kurangi=!!o.kurangiUtang;
  const total=Math.max(0,barang+kas+piutang-(kurangi?utang:0));
  const r=uang(total,o.hargaEmas,o.nishabGram);
  return {...r,barang,kas,piutang,utang,kurangi,total};
}
/* Tanaman dan buah: 5 wasaq; 10% (air hujan/sungai), 5% (disiram dengan alat/biaya), 7,5% (sama banyak) */
const PENGAIRAN={hujan:{k:0.10,t:"Air hujan, sungai, atau mata air (tanpa biaya)"},biaya:{k:0.05,t:"Disiram dengan alat, hewan, atau biaya"},campur:{k:0.075,t:"Campuran, sama banyak"}};
function tani(hasilKg,jenis,nishabKg){
  hasilKg=n0(hasilKg);nishabKg=n0(nishabKg)||DEF.panenKg;
  const p=PENGAIRAN[jenis]||PENGAIRAN.hujan;
  const capai=hasilKg>=nishabKg;
  return {hasilKg,nishabKg,capai,kurang:capai?0:Math.max(0,nishabKg-hasilKg),kadar:p.k,zakatKg:capai?hasilKg*p.k:0,pengairan:p.t};
}
/* Zakat fitrah: satu sha' makanan pokok per jiwa */
function fitrah(jiwa,kgPerJiwa,hargaPerKg){
  jiwa=Math.floor(n0(jiwa));kgPerJiwa=n0(kgPerJiwa)||DEF.fitrahKg;hargaPerKg=n0(hargaPerKg);
  const kg=jiwa*kgPerJiwa;
  return {jiwa,kgPerJiwa,kg,harga:hargaPerKg,nilai:hargaPerKg?kg*hargaPerKg:0};
}

/* ---------- Hewan ternak ---------- */
const UMUR={
  jadzaah_dhan:"domba jadza'ah (umur ±1 tahun, masuk tahun ke-2)",tsaniyyah:"kambing tsaniyyah (umur ±2 tahun, masuk tahun ke-3)",
  makhadh:"bintu makhadh (unta betina ±1 tahun, masuk tahun ke-2)",labun:"bintu labun (unta betina ±2 tahun, masuk tahun ke-3)",
  hiqqah:"hiqqah (unta ±3 tahun, masuk tahun ke-4)",jadzaah:"jadza'ah (unta ±4 tahun, masuk tahun ke-5)",
  tabi:"tabi' (sapi ±1 tahun, masuk tahun ke-2)",musinnah:"musinnah (sapi ±2 tahun, masuk tahun ke-3)"
};
const KAMBING_T="seekor kambing: domba jadza'ah (±1 tahun, masuk tahun ke-2) atau kambing tsaniyyah (±2 tahun, masuk tahun ke-3)";
/* Cari kombinasi kelipatan a dan b yang paling banyak menutup jumlah hewan (sisa paling sedikit) */
function kombinasi(n,a,b){
  let best=-1,opsi=[];
  for(let x=0;a*x<=n;x++)for(let y=0;a*x+b*y<=n;y++){
    const T=a*x+b*y;
    if(T>best){best=T;opsi=[[x,y]]}else if(T===best)opsi.push([x,y]);
  }
  return {tutup:best,sisa:n-best,opsi};
}
function ternak(jenis,n){
  n=Math.floor(n0(n));
  const R={jenis,n,ada:false,nishab:jenis==="unta"?5:jenis==="sapi"?30:40,opsi:[],catatan:[]};
  if(n<R.nishab){R.kurang=R.nishab-n;return R}
  R.ada=true;
  if(jenis==="kambing"){
    const j=n<=120?1:n<=200?2:n<=399?3:Math.floor(n/100);
    R.opsi=[[{j,t:KAMBING_T}]];
    R.rentang=n<=120?"40–120 ekor":n<=200?"121–200 ekor":n<=399?"201–399 ekor":"400 ekor ke atas: seekor untuk setiap 100 ekor";
  }else if(jenis==="sapi"){
    const k=kombinasi(n,30,40);
    R.opsi=k.opsi.map(([x,y])=>[x?{j:x,t:UMUR.tabi}:null,y?{j:y,t:UMUR.musinnah}:null].filter(Boolean));
    R.sisa=k.sisa;
    R.catatan.push("Seekor tabi' untuk setiap 30 ekor, atau seekor musinnah untuk setiap 40 ekor. Bila ada dua cara yang sama-sama pas, pemilik boleh memilih salah satu.");
  }else{
    if(n<=120){
      const t=[[5,9,1,"kambing"],[10,14,2,"kambing"],[15,19,3,"kambing"],[20,24,4,"kambing"],[25,35,1,"makhadh"],[36,45,1,"labun"],[46,60,1,"hiqqah"],[61,75,1,"jadzaah"],[76,90,2,"labun"],[91,120,2,"hiqqah"]];
      const r=t.find(x=>n>=x[0]&&n<=x[1]);
      R.opsi=[[{j:r[2],t:r[3]==="kambing"?KAMBING_T:UMUR[r[3]]}]];
      R.rentang=r[0]+"–"+r[1]+" ekor";
    }else{
      const k=kombinasi(n,40,50);
      R.opsi=k.opsi.map(([x,y])=>[x?{j:x,t:UMUR.labun}:null,y?{j:y,t:UMUR.hiqqah}:null].filter(Boolean));
      R.sisa=k.sisa;
      R.catatan.push("Mulai 121 ekor: seekor bintu labun untuk setiap 40 ekor, atau seekor hiqqah untuk setiap 50 ekor, dipilih kombinasi yang paling sedikit menyisakan hewan. Bila ada dua cara yang sama-sama pas, pemilik boleh memilih salah satu.");
    }
  }
  return R;
}
const api={DEF,KADAR,PENGAIRAN,logam,uang,dagang,tani,fitrah,ternak,kombinasi};
if(typeof module!=="undefined")module.exports=api;
return api;
})();
