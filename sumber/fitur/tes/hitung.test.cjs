// Uji pustaka zakat dan haidh.
const Z=require("./muat.cjs")("zakat","ZakatLib"),H=require("./muat.cjs")("haidh","HaidhLib");
let ok=0,bad=0;
const eq=(n,a,b)=>{const A=JSON.stringify(a),B=JSON.stringify(b);if(A===B)ok++;else{bad++;console.log("GAGAL",n,"\n  harap",B,"\n  dapat",A)}};
const near=(n,a,b)=>eq(n,Math.round(a*1e6)/1e6,b);

// Emas dan perak
eq("emas di bawah nishab",Z.logam(84.9,85).capai,false);
eq("emas tepat nishab",Z.logam(85,85).capai,true);
near("zakat emas 100 g",Z.logam(100,85,1000000).zakatGram,2.5);
near("zakat emas Rp",Z.logam(100,85,1000000).zakatRp,2500000);
eq("perak 595",Z.logam(595,595).capai,true);
// Uang dan dagang
eq("uang tanpa harga",Z.uang(100e6,0).perluHarga,true);
eq("uang capai",Z.uang(100e6,1e6).capai,true);
near("zakat uang",Z.uang(200e6,1e6).zakat,5e6);
eq("uang belum capai",Z.uang(80e6,1e6).capai,false);
near("dagang jumlah",Z.dagang({barang:100e6,kas:20e6,piutang:10e6,utang:30e6,kurangiUtang:false,hargaEmas:1e6}).total,130e6);
near("dagang kurangi utang",Z.dagang({barang:100e6,kas:20e6,piutang:10e6,utang:30e6,kurangiUtang:true,hargaEmas:1e6}).total,100e6);
near("zakat dagang",Z.dagang({barang:200e6,hargaEmas:1e6}).zakat,5e6);
// Pertanian
near("tani hujan",Z.tani(700,"hujan").zakatKg,70);
near("tani biaya",Z.tani(700,"biaya").zakatKg,35);
near("tani campur",Z.tani(700,"campur").zakatKg,52.5);
eq("tani kurang nishab",Z.tani(600,"hujan").capai,false);
eq("tani nishab ubah",Z.tani(500,"hujan",400).capai,true);
// Fitrah
near("fitrah kg",Z.fitrah(4,2.5,15000).kg,10);
near("fitrah nilai",Z.fitrah(4,2.5,15000).nilai,150000);
// Ternak
const ring=r=>r.ada?r.opsi.map(o=>o.map(x=>x.j+" "+x.t.split(" ")[0]+(x.t.startsWith("seekor")?"":"")).join("+")):"-";
const kb=n=>Z.ternak("kambing",n),sp=n=>Z.ternak("sapi",n),un=n=>Z.ternak("unta",n);
eq("kambing 39",kb(39).ada,false);
[[40,1],[120,1],[121,2],[200,2],[201,3],[399,3],[400,4],[550,5]].forEach(([n,j])=>eq("kambing "+n,kb(n).opsi[0][0].j,j));
eq("sapi 29",sp(29).ada,false);
const sj=n=>sp(n).opsi.map(o=>o.map(x=>x.j+(x.t.startsWith("tabi")?"T":"M")).join("+"));
eq("sapi 30",sj(30),["1T"]);eq("sapi 39",sj(39),["1T"]);eq("sapi 40",sj(40),["1M"]);eq("sapi 59",sj(59),["1M"]);
eq("sapi 60",sj(60),["2T"]);eq("sapi 70",sj(70),["1T+1M"]);eq("sapi 80",sj(80),["2M"]);eq("sapi 90",sj(90),["3T"]);
eq("sapi 120 dua pilihan",sj(120).sort(),["3M","4T"]);
eq("unta 4",un(4).ada,false);
const uj=n=>un(n).opsi.map(o=>o.map(x=>x.j+x.t.split(" ")[0]).join("+"));
eq("unta 5",un(5).opsi[0][0].j,1);eq("unta 24",un(24).opsi[0][0].j,4);
eq("unta 25",uj(25),["1bintu"]);eq("unta 35",uj(35),["1bintu"]);eq("unta 36",uj(36),["1bintu"]);
eq("unta 46",uj(46),["1hiqqah"]);eq("unta 61",uj(61),["1jadza'ah"]);eq("unta 76",uj(76),["2bintu"]);eq("unta 91",uj(91),["2hiqqah"]);
eq("unta 121",uj(121),["3bintu"]);eq("unta 130",uj(130),["2bintu+1hiqqah"]);eq("unta 140",uj(140),["1bintu+2hiqqah"]);
eq("unta 150",uj(150),["3hiqqah"]);eq("unta 200 dua pilihan",uj(200).sort(),["4hiqqah","5bintu"]);

// Haidh
const A=H.analisis;
eq("kurang 24 jam",A({status:"mubtadiah",hari:0,jam:20}).kategori,"kurang");
eq("7 hari semua haid",A({status:"mubtadiah",hari:7,jam:0}).haidJam,168);
eq("tepat 15 hari",A({status:"mutadah",adatHari:6,hari:15,jam:0}).kategori,"dalam15");
eq("15 hari lebih 1 jam",A({status:"mutadah",adatHari:6,hari:15,jam:1}).kategori,"lebih15");
eq("mubtadiah tanpa tamyiz",A({status:"mubtadiah",hari:20,jam:0}).haidJam,24);
eq("mutadah adat 6",A({status:"mutadah",adatHari:6,hari:20,jam:0}).haidJam,144);
eq("tamyiz sah",A({status:"mubtadiah",tamyiz:true,kuatHari:5,lemahHari:15}).haidJam,120);
eq("tamyiz tidak sah (lemah<15), mubtadiah",A({status:"mubtadiah",tamyiz:true,kuatHari:8,lemahHari:10}).haidJam,24);
eq("tamyiz tidak sah, mutadah ikut adat",A({status:"mutadah",adatHari:7,tamyiz:true,kuatHari:8,lemahHari:10}).haidJam,168);
eq("mutadah mumayyizah ikut tamyiz",A({status:"mutadah",adatHari:7,tamyiz:true,kuatHari:5,lemahHari:20}).haidJam,120);
eq("kuat >15 tidak sah",A({status:"mubtadiah",tamyiz:true,kuatHari:16,lemahHari:15}).tamyizSah,false);
eq("mutahayyirah >15 tidak didukung",!!A({status:"mutahayyirah",hari:20,jam:0}).tak,true);
eq("mutahayyirah <=15 semua haid",A({status:"mutahayyirah",hari:9,jam:0}).haidJam,216);
eq("segmen jumlah",A({status:"mubtadiah",hari:20,jam:0}).segmen.map(s=>[s.t,s.a,s.b]),[["haid",0,24],["istihadhah",24,480]]);
eq("galat kosong",!!A({status:"mubtadiah",hari:0,jam:0}).error,true);
console.log(`Zakat dan haidh: lulus ${ok}, gagal ${bad}.`);
process.exit(bad?1:0);
