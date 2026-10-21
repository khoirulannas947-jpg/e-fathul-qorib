// Uji mesin waris: kasus buku faraidh klasik + uji sifat (jumlah bagian harus tepat 1).
const W=require("./muat.cjs")("waris","WarisLib");
let gagal=0,lulus=0;
const T=(nama,inp,harap,opt)=>{
  const r=W.hitung(inp);opt=opt||{};
  if(opt.unsupported){if(r.unsupported){lulus++}else{gagal++;console.log("GAGAL",nama,"harusnya belum didukung")}return}
  if(!r.ok){gagal++;console.log("GAGAL",nama,"error:",r.error||r.unsupported);return}
  const peta={};r.rows.forEach(x=>peta[x.k]=W.txt(x.f));
  let ok=true;
  for(const [k,v] of Object.entries(harap)){if(peta[k]!==v){ok=false;console.log("GAGAL",nama,k,"harap",v,"dapat",peta[k])}}
  if(opt.aul&&(!r.aul||r.aul.dari!==opt.aul[0]||r.aul.ke!==opt.aul[1])){ok=false;console.log("GAGAL",nama,"aul",JSON.stringify(r.aul))}
  if(opt.baitul&&W.txt(r.baitulMal)!==opt.baitul){ok=false;console.log("GAGAL",nama,"baitul",W.txt(r.baitulMal))}
  ok?lulus++:gagal++;
};
T("istri+2 anak L+1 anak P",{istri:1,anakL:2,anakP:1},{istri:"1/8",anakL:"7/10",anakP:"7/40"});
T("'Umariyyah suami",{suami:1,ibu:1,ayah:1},{suami:"1/2",ibu:"1/6",ayah:"1/3"});
T("'Umariyyah istri",{istri:1,ibu:1,ayah:1},{istri:"1/4",ibu:"1/4",ayah:"1/2"});
T("'aul 6->7",{suami:1,sdrKP:2},{suami:"3/7",sdrKP:"4/7"},{aul:[6,7]});
T("'aul 6->8",{suami:1,ibu:1,sdrKP:2},{suami:"3/8",ibu:"1/8",sdrKP:"1/2"},{aul:[6,8]});
T("musyarakah",{suami:1,ibu:1,sdrI:2,sdrKL:1},{suami:"1/2",ibu:"1/6",sdrI:"2/9",sdrKL:"1/9"});
T("radd ibu+anak P",{ibu:1,anakP:1},{anakP:"3/4",ibu:"1/4"});
T("radd anak P+cucu P",{anakP:1,cucuP:1},{anakP:"3/4",cucuP:"1/4"});
T("ma'al ghair",{anakP:1,sdrKP:1},{anakP:"1/2",sdrKP:"1/2"});
T("2 anak P + saudara L",{anakP:2,sdrKL:1},{anakP:"2/3",sdrKL:"1/3"});
T("Akdariyyah",{suami:1,ibu:1,kakek:1,sdrKP:1},{suami:"1/3",ibu:"2/9",kakek:"8/27",sdrKP:"4/27"});
T("kakek+1 saudara",{kakek:1,sdrKL:1},{kakek:"1/2",sdrKL:"1/2"});
T("kakek+2 saudara",{kakek:1,sdrKL:2},{kakek:"1/3",sdrKL:"2/3"});
T("kakek+3 saudara",{kakek:1,sdrKL:3},{kakek:"1/3",sdrKL:"2/3"});
T("anak L+ayah+ibu",{anakL:1,ayah:1,ibu:1},{anakL:"2/3",ayah:"1/6",ibu:"1/6"});
T("anak P+ayah+ibu",{anakP:1,ayah:1,ibu:1},{anakP:"1/2",ibu:"1/6",ayah:"1/3"});
T("sepuluh perempuan+1 laki (kitab)",{anakP:10,anakL:1},{anakP:"5/6",anakL:"1/6"});
T("contoh kitab: 2 anak P + kakek + 3 saudara",{anakP:2,kakek:1,sdrKL:3},{anakP:"2/3",kakek:"1/6",sdrKL:"1/6"});
T("ayah saja",{ayah:1},{ayah:"1"});
T("suami saja",{suami:1},{suami:"1/2"},{baitul:"1/2"});
T("saudara L+P kandung+ibu",{sdrKL:1,sdrKP:1,ibu:1},{ibu:"1/6",sdrKL:"5/9",sdrKP:"5/18"});
T("saudari seayah+kandung",{sdrKP:1,sdrAP:1},{sdrKP:"3/4",sdrAP:"1/4"});
T("istri+anak L+ibu+ayah",{istri:1,anakL:1,ibu:1,ayah:1},{istri:"1/8",ibu:"1/6",ayah:"1/6",anakL:"13/24"});
T("dua nenek",{nenekIbu:1,nenekAyah:1},{nenekIbu:"1/2",nenekAyah:"1/2"});
T("kakek+saudara seibu",{kakek:1,sdrI:1},{kakek:"1",sdrI:"0"});
T("saudara kandung gugurkan seayah",{sdrKL:1,sdrAL:1},{sdrKL:"1",sdrAL:"0"});
T("kakek+saudara kandung+seayah (mu'addah)",{kakek:1,sdrKL:1,sdrAL:1},{},{unsupported:true});
T("paman kandung gugurkan sepupu",{pamK:1,sepK:1},{pamK:"1",sepK:"0"});
T("cucu L gugur oleh anak L",{anakL:1,cucuL:1},{anakL:"1",cucuL:"0"});
T("cucu P gugur 2 anak P",{anakP:2,cucuP:1,ayah:1},{anakP:"2/3",cucuP:"0",ayah:"1/3"});
T("4 istri",{istri:4,ayah:1},{istri:"1/4",ayah:"3/4"});
T("kakek+anak L",{kakek:1,anakL:1},{kakek:"1/6",anakL:"5/6"});
T("ayah+saudara seibu",{ayah:1,sdrI:2},{ayah:"1",sdrI:"0"});
T("ibu+saudara kandung",{ibu:1,sdrKL:1},{ibu:"1/3",sdrKL:"2/3"});
T("ibu+3 saudara seibu+suami (ibu 1/6)",{suami:1,ibu:1,sdrI:2},{suami:"1/2",ibu:"1/6",sdrI:"1/3"});
T("nenek tertutup ibu",{ibu:1,nenekIbu:1,anakL:1},{ibu:"1/6",nenekIbu:"0",anakL:"5/6"});
T("nenek ayah tertutup ayah, nenek ibu tidak",{ayah:1,nenekAyah:1,nenekIbu:1},{ayah:"5/6",nenekAyah:"0",nenekIbu:"1/6"});
T("sdrKP sendiri 1/2 + sdrAL residu",{sdrKP:1,sdrAL:1},{sdrKP:"1/2",sdrAL:"1/2"});
T("2 sdrKP + sdrAP gugur (ibu 1/6, lalu radd)",{sdrKP:2,sdrAP:1,ibu:1},{sdrKP:"4/5",sdrAP:"0",ibu:"1/5"});

// Uji sifat: untuk semua kombinasi acak, bagian harus berjumlah tepat 1 (termasuk baitul mal)
let rnd=12345;const R=()=>(rnd=(rnd*1103515245+12345)&0x7fffffff)/0x7fffffff;
let n=0,tak=0,galat=0;
for(let i=0;i<60000;i++){
  const inp={};
  W.HEIRS.forEach(([k])=>{if(R()<0.28){inp[k]=1+Math.floor(R()*(W.MAX[k]||4)*(R()<.3?1:0.5))}});
  if(inp.suami&&inp.istri)delete inp.istri;
  const r=W.hitung(inp);
  if(r.error)continue;
  if(r.unsupported){tak++;continue}
  n++;
  let tot=W.Z;r.rows.forEach(x=>{tot=W.add(tot,x.f);if(x.f.n<0){galat++;console.log("negatif",JSON.stringify(inp))}
    if(x.status==="mahjub"&&x.f.n!==0){galat++;console.log("mahjub bernilai",JSON.stringify(inp))}});
  tot=W.add(tot,r.baitulMal);
  if(!W.eq(tot,W.O)){galat++;if(galat<8)console.log("jumlah != 1",JSON.stringify(inp),W.txt(tot))}
}
console.log(`Kasus buku: lulus ${lulus}, gagal ${gagal}. Uji sifat: ${n} kombinasi, ${tak} belum didukung, ${galat} galat.`);
process.exit(gagal||galat?1:0);
