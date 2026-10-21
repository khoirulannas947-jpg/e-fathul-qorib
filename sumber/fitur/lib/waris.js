/* Mesin hitung waris (faraidh) madzhab Syafi'i, mengacu pada Kitab Faraidh Fathul Qorib.
   Murni logika (tanpa DOM) supaya bisa diuji di Node.
   Cakupan: 22 jenis ahli waris, hajb (penghalangan), bagian pasti, 'ashabah (bin-nafsi, bil-ghair, ma'al-ghair),
   'aul, radd, 'Umariyyatain, Musyarakah, kakek bersama saudara (muqasamah) dan Akdariyyah.
   Belum dicakup (diberi peringatan): kakek bersama saudara kandung DAN seayah (mu'addah), cucu/keponakan berbeda
   tingkat, khuntsa, mafqud, janin, dzawil arham, dan budak/pemerdeka. */
const WarisLib=(()=>{
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const lcm=(a,b)=>a/gcd(a,b)*b;
const F=(n,d)=>{d=d==null?1:d;if(d<0){n=-n;d=-d}const g=gcd(n,d)||1;return {n:n/g,d:d/g}};
const add=(a,b)=>F(a.n*b.d+b.n*a.d,a.d*b.d);
const sub=(a,b)=>F(a.n*b.d-b.n*a.d,a.d*b.d);
const mul=(a,b)=>F(a.n*b.n,a.d*b.d);
const div=(a,b)=>F(a.n*b.d,a.d*b.n);
const Z=F(0),O=F(1);
const lt=(a,b)=>a.n*b.d<b.n*a.d, gt=(a,b)=>lt(b,a), eq=(a,b)=>a.n===b.n&&a.d===b.d;
const sum=a=>a.reduce(add,Z);
const mx=(...a)=>a.reduce((m,x)=>gt(x,m)?x:m);
const txt=f=>f.d===1?String(f.n):f.n+"/"+f.d;
const val=f=>f.n/f.d;

const HEIRS=[
 ["suami","Suami"],["istri","Istri"],
 ["anakL","Anak laki-laki"],["anakP","Anak perempuan"],
 ["cucuL","Cucu laki-laki (dari anak laki-laki)"],["cucuP","Cucu perempuan (dari anak laki-laki)"],
 ["ayah","Ayah"],["kakek","Kakek (ayah dari ayah)"],
 ["ibu","Ibu"],["nenekIbu","Nenek dari pihak ibu (ibunya ibu)"],["nenekAyah","Nenek dari pihak ayah (ibunya ayah)"],
 ["sdrKL","Saudara laki-laki kandung"],["sdrKP","Saudara perempuan kandung"],
 ["sdrAL","Saudara laki-laki seayah"],["sdrAP","Saudara perempuan seayah"],
 ["sdrI","Saudara/i seibu (laki-laki atau perempuan)"],
 ["ponKL","Anak laki-laki dari saudara kandung"],["ponAL","Anak laki-laki dari saudara seayah"],
 ["pamK","Paman kandung (saudara kandung ayah)"],["pamA","Paman seayah (saudara ayah seayah)"],
 ["sepK","Anak laki-laki paman kandung"],["sepA","Anak laki-laki paman seayah"]
];
const MAX={suami:1,istri:4,ayah:1,kakek:1,ibu:1,nenekIbu:1,nenekAyah:1};
const LABEL={};HEIRS.forEach(([k,l])=>LABEL[k]=l);

function hitung(input){
  input=input||{};
  const h={};
  HEIRS.forEach(([k])=>{let v=Math.floor(+input[k]||0);if(v<0)v=0;h[k]=Math.min(v,MAX[k]||30)});
  const R={ok:false,error:null,unsupported:null,rows:[],notes:[],aul:null,radd:null,baitulMal:Z,flags:{},h};
  const total=HEIRS.reduce((a,[k])=>a+h[k],0);
  if(!total){R.error="Pilih minimal satu ahli waris.";return R}
  if(h.suami>0&&h.istri>0){R.error="Suami dan istri tidak mungkin menjadi ahli waris dari pewaris yang sama.";return R}

  /* ---------- Penanda keadaan ---------- */
  const walad=h.anakL+h.anakP+h.cucuL+h.cucuP>0;           // ada keturunan (anak/cucu dari anak laki-laki)
  const wL=h.anakL>0||h.cucuL>0;                            // ada keturunan laki-laki
  const femDesc=!wL&&(h.anakP>0||h.cucuP>0);                // keturunan hanya perempuan
  const sdrAll=h.sdrKL+h.sdrKP+h.sdrAL+h.sdrAP+h.sdrI;      // semua saudara (termasuk yang terhalang) untuk ibu
  const kakekAktif=h.kakek>0&&h.ayah===0;

  /* ---------- Hajb hirman (gugur seluruhnya) ---------- */
  const mahjub={};
  const setM=(k,why)=>{if(h[k]>0&&!mahjub[k])mahjub[k]=why};
  const ASH=[
    {id:"anak",m:"anakL",f:"anakP",label:()=>"anak laki-laki"},
    {id:"cucu",m:"cucuL",f:"cucuP",label:()=>"cucu laki-laki"},
    {id:"ayah",m:"ayah",label:()=>"ayah"},
    {id:"kakek",m:"kakek",label:()=>"kakek"},
    {id:"sdrK",m:"sdrKL",f:"sdrKP",mal:true,label:()=>h.sdrKL>0?"saudara laki-laki kandung":"saudari kandung yang menjadi 'ashabah bersama anak/cucu perempuan"},
    {id:"sdrA",m:"sdrAL",f:"sdrAP",mal:true,label:()=>h.sdrAL>0?"saudara laki-laki seayah":"saudari seayah yang menjadi 'ashabah bersama anak/cucu perempuan"},
    {id:"ponKL",m:"ponKL",label:()=>"anak laki-laki saudara kandung"},
    {id:"ponAL",m:"ponAL",label:()=>"anak laki-laki saudara seayah"},
    {id:"pamK",m:"pamK",label:()=>"paman kandung"},
    {id:"pamA",m:"pamA",label:()=>"paman seayah"},
    {id:"sepK",m:"sepK",label:()=>"anak laki-laki paman kandung"},
    {id:"sepA",m:"sepA",label:()=>"anak laki-laki paman seayah"}
  ];
  const on=g=>{
    if(h[g.m]>0&&!mahjub[g.m])return true;
    if(g.mal&&h[g.f]>0&&!mahjub[g.f]&&femDesc)return true;   // 'ashabah ma'al ghair
    return false;
  };
  let blocker=null;
  for(const g of ASH){
    const fixed=g.id==="ayah"||g.id==="kakek";   // ayah tidak pernah gugur; kakek hanya gugur oleh ayah (diatur di bawah)
    const exempt=blocker&&blocker.id==="kakek"&&(g.id==="sdrK"||g.id==="sdrA"); // kakek tidak menggugurkan saudara (Syafi'i)
    if(blocker&&!exempt&&!fixed){
      const why="terhalang "+blocker.label();
      setM(g.m,why);if(g.f)setM(g.f,why);
      continue;
    }
    if(!blocker&&on(g))blocker=g;
  }
  if(h.ayah>0){setM("kakek","terhalang ayah");setM("nenekAyah","terhalang ayah");setM("sdrI","terhalang ayah")}
  if(kakekAktif)setM("sdrI","terhalang kakek");
  if(walad)setM("sdrI","terhalang adanya anak/cucu");
  if(h.ibu>0){setM("nenekIbu","terhalang ibu");setM("nenekAyah","terhalang ibu")}
  const ashGroup=ASH.find(g=>on(g)&&!mahjub[g.m]&&!(g.id==="kakek"&&!kakekAktif));

  /* ---------- Bagian pasti (furudh) ---------- */
  const S={}; // k -> {f: Fraction (bagian seluruh kelompok), why, kind}
  const give=(k,f,why,kind)=>{if(h[k]>0&&!mahjub[k])S[k]={f,why,kind:kind||"fardh"}};
  const spouseF=h.suami>0?(walad?F(1,4):F(1,2)):h.istri>0?(walad?F(1,8):F(1,4)):Z;
  if(h.suami>0)give("suami",spouseF,walad?"1/4 karena pewaris meninggalkan anak atau cucu dari anak laki-laki.":"1/2 karena pewaris tidak meninggalkan anak atau cucu dari anak laki-laki.");
  if(h.istri>0)give("istri",spouseF,(walad?"1/8":"1/4")+(walad?" karena pewaris meninggalkan anak atau cucu dari anak laki-laki":" karena pewaris tidak meninggalkan anak atau cucu dari anak laki-laki")+(h.istri>1?"; dibagi rata untuk semua istri.":"."));

  if(h.ibu>0){
    const onlyParents=HEIRS.every(([k])=>["suami","istri","ayah","ibu"].includes(k)||h[k]===0);
    if(h.ayah>0&&onlyParents&&(h.suami>0||h.istri>0)){
      give("ibu",mul(sub(O,spouseF),F(1,3)),"1/3 dari sisa setelah bagian "+(h.suami>0?"suami":"istri")+" (masalah 'Umariyyatain: pewaris hanya meninggalkan pasangan dan kedua orang tua).");
      R.flags.umariyyah=true;
    }else if(walad)give("ibu",F(1,6),"1/6 karena ada anak atau cucu dari anak laki-laki.");
    else if(sdrAll>=2)give("ibu",F(1,6),"1/6 karena ada dua saudara atau lebih (kandung, seayah, atau seibu), termasuk saudara yang terhalang.");
    else give("ibu",F(1,3),"1/3 karena tidak ada anak, cucu, atau dua saudara atau lebih.");
  }

  const sibAktif=["sdrKL","sdrKP","sdrAL","sdrAP"].filter(k=>h[k]>0&&!mahjub[k]);
  const muq=kakekAktif&&sibAktif.length>0;      // kakek bersama saudara
  const op=h.ayah>0?"ayah":kakekAktif?"kakek":null;
  if(op&&!muq){
    if(wL)give(op,F(1,6),"1/6 karena ada anak atau cucu laki-laki.");
    else if(femDesc)give(op,F(1,6),"1/6 sebagai bagian pasti karena ada anak/cucu perempuan, lalu mengambil sisa sebagai 'ashabah.");
  }

  const nenek=["nenekIbu","nenekAyah"].filter(k=>h[k]>0&&!mahjub[k]);
  nenek.forEach(k=>give(k,F(1,6*nenek.length),nenek.length>1?"1/6 dibagi rata untuk kedua nenek.":"1/6 karena tidak ada ibu."));

  if(h.anakP>0&&h.anakL===0)give("anakP",h.anakP===1?F(1,2):F(2,3),h.anakP===1?"1/2 karena sendirian, tanpa anak laki-laki.":"2/3 dibagi rata karena dua atau lebih, tanpa anak laki-laki.");
  if(h.cucuP>0&&!mahjub.cucuP&&h.cucuL===0){
    if(h.anakP===0)give("cucuP",h.cucuP===1?F(1,2):F(2,3),h.cucuP===1?"1/2 karena sendirian, tanpa anak maupun cucu laki-laki.":"2/3 dibagi rata karena dua atau lebih, tanpa anak maupun cucu laki-laki.");
    else if(h.anakP===1)give("cucuP",F(1,6),"1/6 untuk menyempurnakan 2/3 bersama satu anak perempuan.");
    else setM("cucuP","terhalang dua anak perempuan yang sudah mengambil 2/3 (tidak ada cucu laki-laki yang menjadikannya 'ashabah)");
  }

  if(!muq){
    if(h.sdrKP>0&&!mahjub.sdrKP&&h.sdrKL===0&&!femDesc)give("sdrKP",h.sdrKP===1?F(1,2):F(2,3),h.sdrKP===1?"1/2 karena sendirian, tanpa saudara laki-laki kandung.":"2/3 dibagi rata karena dua atau lebih, tanpa saudara laki-laki kandung.");
    if(h.sdrAP>0&&!mahjub.sdrAP&&h.sdrAL===0&&!femDesc){
      if(h.sdrKP>=2)setM("sdrAP","terhalang dua saudari kandung yang sudah mengambil 2/3 (tidak ada saudara laki-laki seayah yang menjadikannya 'ashabah)");
      else if(h.sdrKP===1)give("sdrAP",F(1,6),"1/6 untuk menyempurnakan 2/3 bersama satu saudari kandung.");
      else give("sdrAP",h.sdrAP===1?F(1,2):F(2,3),h.sdrAP===1?"1/2 karena sendirian, tanpa saudara laki-laki seayah.":"2/3 dibagi rata karena dua atau lebih, tanpa saudara laki-laki seayah.");
    }
  }
  if(h.sdrI>0&&!mahjub.sdrI)give("sdrI",h.sdrI===1?F(1,6):F(1,3),h.sdrI===1?"1/6 karena sendirian.":"1/3 dibagi rata (laki-laki dan perempuan sama) karena dua orang atau lebih.");

  /* ---------- Kakek bersama saudara (pendapat Zaid bin Tsabit, dipegang Syafi'iyah) ---------- */
  let special=false; // true bila seluruh harta sudah terbagi di blok ini
  if(muq){
    const kd=sibAktif.some(k=>k==="sdrKL"||k==="sdrKP"), ay=sibAktif.some(k=>k==="sdrAL"||k==="sdrAP");
    if(kd&&ay){R.unsupported="Kakek bersama saudara kandung dan saudara seayah sekaligus (masalah mu'addah) belum dihitung kalkulator ini. Tanyakan kepada ahli faraidh.";return R}
    const sk=kd?"sdrKL":"sdrAL", sp=kd?"sdrKP":"sdrAP", b=h[sk], s=h[sp];
    const Fo=sum(["suami","istri","ibu","nenekIbu","nenekAyah","anakP","cucuP"].map(k=>S[k]?S[k].f:Z));
    const Rm=sub(O,Fo);
    const onlyAkd=h.suami===1&&h.ibu===1&&b===0&&s===1&&HEIRS.every(([k])=>["suami","ibu","kakek","sdrKP","sdrAP"].includes(k)||h[k]===0);
    special=true;
    if(onlyAkd){
      R.flags.akdariyyah=true;
      S.suami={f:F(9,27),why:"Masalah Akdariyyah: bagian pasti 1/2 (di-'aul), lalu hasil gabungan kakek dan saudari dibagi 2:1.",kind:"fardh"};
      S.ibu={f:F(6,27),why:"Masalah Akdariyyah: bagian pasti 1/3 (di-'aul).",kind:"fardh"};
      S.kakek={f:F(8,27),why:"Masalah Akdariyyah: kakek dan saudari menggabungkan bagian mereka lalu membaginya 2:1.",kind:"muqasamah"};
      S[sp]={f:F(4,27),why:"Masalah Akdariyyah: mendapat 1/2 lalu digabung dengan bagian kakek dan dibagi 2:1.",kind:"muqasamah"};
    }else{
      const U=2+2*b+s;
      const a=mul(Rm,F(2,U)), t=mul(Rm,F(1,3)), c=F(1,6);
      if(lt(Rm,c)){
        S.kakek={f:c,why:"1/6 sebagai bagian pasti karena sisa harta kurang dari 1/6; saudara tidak mendapat bagian.",kind:"fardh"};
        sibAktif.forEach(k=>{S[k]={f:Z,why:"tidak mendapat bagian karena harta telah habis oleh ahli waris yang memiliki bagian pasti.",kind:"nol"}});
      }else{
        const best=mx(a,t,c);
        const how=eq(best,a)?"muqasamah (berbagi seperti saudara laki-laki, 2 bagian untuk laki-laki dan 1 untuk perempuan)":eq(best,t)?"1/3 dari sisa harta setelah bagian pasti ahli waris lain":"1/6 dari seluruh harta";
        S.kakek={f:best,why:"Kakek mengambil yang paling besar dari tiga pilihan, yaitu "+how+".",kind:eq(best,c)&&!eq(best,a)&&!eq(best,t)?"fardh":"muqasamah"};
        const rest=sub(Rm,best), unit=div(rest,F(2*b+s));
        if(b>0)S[sk]={f:mul(unit,F(2*b)),why:"Sisa setelah bagian kakek dibagi 2:1 antara saudara laki-laki dan perempuan.",kind:"muqasamah"};
        if(s>0)S[sp]={f:mul(unit,F(s)),why:"Sisa setelah bagian kakek dibagi 2:1 antara saudara laki-laki dan perempuan.",kind:"muqasamah"};
      }
    }
  }

  /* ---------- Sisa harta: 'ashabah ---------- */
  let sumF=sum(Object.values(S).map(x=>x.f));
  if(!special){
    const g=ashGroup;
    if(g&&eq(sumF,O)&&g.id==="sdrK"&&h.sdrKL>0&&h.sdrI>=2&&S.sdrI){
      // Musyarakah (Himariyyah): saudara kandung ikut berbagi sepertiga dengan saudara seibu
      const heads=h.sdrI+h.sdrKL+h.sdrKP, pool=S.sdrI.f, per=div(pool,F(heads));
      S.sdrI={f:mul(per,F(h.sdrI)),why:"Masalah Musyarakah: sepertiga dibagi rata dengan saudara kandung.",kind:"musyarakah"};
      S.sdrKL={f:mul(per,F(h.sdrKL)),why:"Masalah Musyarakah: karena bagian pasti telah menghabiskan harta, saudara kandung ikut berbagi sepertiga dengan saudara seibu (sama rata).",kind:"musyarakah"};
      if(h.sdrKP>0)S.sdrKP={f:mul(per,F(h.sdrKP)),why:"Masalah Musyarakah: ikut berbagi sepertiga bersama saudara seibu (sama rata).",kind:"musyarakah"};
      R.flags.musyarakah=true;
    }else{
      const res=sub(O,sumF);
      if(g&&gt(res,Z)){
        const units=(g.f&&h[g.m]>0)?2*h[g.m]+h[g.f]:(g.mal&&h.sdrKL===0&&g.id==="sdrK")?h.sdrKP:(g.mal&&g.id==="sdrA"&&h.sdrAL===0)?h.sdrAP:h[g.m];
        const per=div(res,F(units));
        const put=(k,u,why)=>{
          if(!(h[k]>0)||mahjub[k])return;
          const part=mul(per,F(u));
          if(S[k])S[k]={f:add(S[k].f,part),why:S[k].why+" Lalu mengambil sisa sebagai 'ashabah.",kind:"fardh+ashabah"};
          else S[k]={f:part,why,kind:"ashabah"};
        };
        if(g.id==="anak"){put("anakL",2*h.anakL,"Mengambil sisa sebagai 'ashabah; setiap anak laki-laki mendapat dua kali bagian anak perempuan.");put("anakP",h.anakP,"Menjadi 'ashabah bil ghair bersama anak laki-laki (laki-laki 2 : perempuan 1).")}
        else if(g.id==="cucu"){put("cucuL",2*h.cucuL,"Mengambil sisa sebagai 'ashabah; satu cucu laki-laki mendapat dua kali cucu perempuan.");put("cucuP",h.cucuP,"Menjadi 'ashabah bil ghair bersama cucu laki-laki (laki-laki 2 : perempuan 1).")}
        else if(g.id==="sdrK"){
          if(h.sdrKL>0){put("sdrKL",2*h.sdrKL,"Mengambil sisa sebagai 'ashabah.");put("sdrKP",h.sdrKP,"Menjadi 'ashabah bil ghair bersama saudara laki-laki kandung (laki-laki 2 : perempuan 1).")}
          else put("sdrKP",h.sdrKP,"Menjadi 'ashabah ma'al ghair: mengambil sisa bersama anak/cucu perempuan.");
        }
        else if(g.id==="sdrA"){
          if(h.sdrAL>0){put("sdrAL",2*h.sdrAL,"Mengambil sisa sebagai 'ashabah.");put("sdrAP",h.sdrAP,"Menjadi 'ashabah bil ghair bersama saudara laki-laki seayah (laki-laki 2 : perempuan 1).")}
          else put("sdrAP",h.sdrAP,"Menjadi 'ashabah ma'al ghair: mengambil sisa bersama anak/cucu perempuan.");
        }
        else if(g.id==="ayah"||g.id==="kakek")put(g.m,1,"Mengambil seluruh sisa harta sebagai 'ashabah karena tidak ada anak atau cucu laki-laki.");
        else put(g.m,h[g.m],"Mengambil sisa sebagai 'ashabah (kerabat laki-laki terdekat yang tidak terhalang).");
      }
      sumF=sum(Object.values(S).map(x=>x.f));
    }
  }
  sumF=sum(Object.values(S).map(x=>x.f));

  /* ---------- 'Aul dan Radd ---------- */
  if(gt(sumF,O)){
    const keys=Object.keys(S).filter(k=>S[k].f.n>0);
    const asal=keys.reduce((a,k)=>lcm(a,S[k].f.d),1);
    const ke=Math.round(val(sumF)*asal);
    R.aul={dari:asal,ke};
    keys.forEach(k=>{S[k].f=div(S[k].f,sumF)});
    sumF=sum(Object.values(S).map(x=>x.f));
  }else if(lt(sumF,O)){
    const sisa=sub(O,sumF);
    const rk=Object.keys(S).filter(k=>k!=="suami"&&k!=="istri"&&S[k].f.n>0&&S[k].kind==="fardh");
    if(rk.length){
      const sr=sum(rk.map(k=>S[k].f));
      rk.forEach(k=>{S[k]={...S[k],f:add(S[k].f,mul(sisa,div(S[k].f,sr))),kind:"fardh+radd"}});
      R.radd={sisa,kepada:rk};
    }else{R.baitulMal=sisa}
    sumF=sum(Object.values(S).map(x=>x.f));
  }

  /* ---------- Susun hasil ---------- */
  HEIRS.forEach(([k,label])=>{
    const n=h[k];if(!n)return;
    if(mahjub[k]){R.rows.push({k,label,n,status:"mahjub",f:Z,per:Z,why:mahjub[k].charAt(0).toUpperCase()+mahjub[k].slice(1)+"."});return}
    if(S[k]&&S[k].f.n>0){R.rows.push({k,label,n,status:S[k].kind,f:S[k].f,per:div(S[k].f,F(n)),why:S[k].why});return}
    R.rows.push({k,label,n,status:"nol",f:Z,per:Z,why:S[k]?S[k].why:"Tidak mendapat bagian karena harta telah habis dibagikan kepada ahli waris yang lebih berhak."});
  });

  /* ---------- Catatan ---------- */
  if(R.aul)R.notes.push("Terjadi 'aul: jumlah bagian pasti melebihi harta, sehingga asal masalah "+R.aul.dari+" dinaikkan menjadi "+R.aul.ke+" dan setiap bagian dikurangi seimbang.");
  if(R.radd)R.notes.push("Terjadi radd: harta masih tersisa dan tidak ada 'ashabah, sehingga sisanya dikembalikan kepada ahli waris yang memiliki bagian pasti selain suami/istri, sesuai perbandingan bagian mereka (pendapat ulama muta'akhkhirin Syafi'iyah). Bila baitul mal dikelola dengan adil, sebagian ulama menyerahkan sisa itu ke baitul mal.");
  if(gt(R.baitulMal,Z))R.notes.push("Sisa "+txt(R.baitulMal)+" harta tidak memiliki penerima: menurut pokok madzhab menjadi hak baitul mal. Sebagian ulama membolehkan sisa ini dikembalikan kepada suami/istri bila baitul mal tidak dikelola dengan adil. Tanyakan kepada ahli faraidh.");
  if(R.flags.umariyyah)R.notes.push("Masalah 'Umariyyatain: ibu mendapat sepertiga dari sisa harta setelah bagian suami/istri, bukan sepertiga dari seluruh harta.");
  if(R.flags.musyarakah)R.notes.push("Masalah Musyarakah (Himariyyah): menurut Syafi'iyah saudara kandung ikut berbagi sepertiga bersama saudara seibu.");
  if(R.flags.akdariyyah)R.notes.push("Masalah Akdariyyah: asal masalah 6 di-'aul menjadi 9, lalu bagian kakek dan saudari digabung dan dibagi 2:1, sehingga menjadi 27.");
  if(muq&&!R.flags.akdariyyah)R.notes.push("Kakek bersama saudara: kakek tidak menggugurkan saudara kandung/seayah (pendapat Zaid bin Tsabit). Kakek mengambil yang terbesar dari tiga pilihan: muqasamah, 1/3 sisa, atau 1/6 harta.");
  if(h.cucuL>0||h.cucuP>0||h.ponKL>0||h.ponAL>0||h.sepK>0||h.sepA>0)R.notes.push("Kalkulator ini menganggap seluruh cucu, keponakan, dan sepupu berada pada satu tingkat yang sama.");
  R.ok=true;
  return R;
}
const api={hitung,HEIRS,MAX,LABEL,txt,val,F,add,sub,mul,div,eq,lt,gt,Z,O};
if(typeof module!=="undefined")module.exports=api;
return api;
})();
