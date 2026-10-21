/* Penentuan haid dan istihadhah madzhab Syafi'i. Murni logika (tanpa DOM).
   Batas masa (haid paling sedikit sehari semalam, paling lama 15 hari, suci paling sedikit 15 hari)
   tercantum dalam Fathul Qorib bab haid. Pembagian mubtadi'ah/mu'tadah, mumayyizah, dan syarat tamyiz
   mengikuti kitab-kitab syarah fiqih Syafi'i (Minhajuth Thalibin dan syarahnya, Fathul Mu'in).
   Satuan hitung: jam. Darah dianggap keluar terus-menerus sejak awal. */
const HaidhLib=(()=>{
const JAM=24,MAKS=15*JAM;
const n0=x=>{x=+x;return isFinite(x)&&x>0?x:0};
/* inp: {status:"mubtadiah"|"mutadah"|"mutahayyirah", adatHari, tamyiz:bool, kuatHari, lemahHari, hari, jam} */
function analisis(inp){
  const status=inp.status||"mubtadiah";
  const tamyiz=!!inp.tamyiz;
  const kuat=n0(inp.kuatHari),lemah=n0(inp.lemahHari);
  const H=tamyiz?Math.round((kuat+lemah)*JAM):Math.round(n0(inp.hari)*JAM+n0(inp.jam));
  const adat=Math.round(Math.min(15,n0(inp.adatHari))*JAM);
  const R={status,H,haidJam:0,segmen:[],metode:"",alasan:[],peringatan:[],tak:null,kategori:"",tamyizSah:null};
  if(H<=0){R.error="Isi lama darah keluar.";return R}
  if(status==="mutadah"&&!adat){R.error="Isi lama haid yang biasa Anda alami (kebiasaan).";return R}
  if(tamyiz&&(!kuat||!lemah)){R.error="Isi lama darah kuat dan darah lemah.";return R}

  if(H<JAM){
    R.kategori="kurang";R.haidJam=0;R.metode="Kurang dari sehari semalam";
    R.segmen=[{t:"istihadhah",a:0,b:H}];
    R.alasan.push("Haid paling sedikit sehari semalam (24 jam). Darah yang kurang dari itu bukan haid, melainkan darah istihadhah (darah penyakit).");
    return R;
  }
  if(H<=MAKS){
    R.kategori="dalam15";R.haidJam=H;R.metode="Seluruhnya haid";
    R.segmen=[{t:"haid",a:0,b:H}];
    R.alasan.push("Darah keluar sekurang-kurangnya sehari semalam dan tidak melebihi 15 hari 15 malam, maka seluruhnya dihukumi haid, walaupun lebih lama atau lebih singkat daripada kebiasaannya.");
    return R;
  }
  R.kategori="lebih15";
  R.alasan.push("Darah keluar melebihi 15 hari 15 malam, maka sebagiannya haid dan sisanya istihadhah. Pembagiannya bergantung pada keadaan perempuan itu.");
  if(status==="mutahayyirah"){
    R.tak="Perempuan yang lupa kebiasaan haidnya (mutahayyirah) memiliki rincian hukum khusus yang panjang (ihtiyath pada hari-hari yang diragukan), sehingga belum dihitung kalkulator ini. Tanyakan kepada ustadzah atau ahli fiqih.";
    return R;
  }
  let cond=null;
  if(tamyiz){
    const c1=kuat>=1,c2=kuat<=15,c3=lemah>=15;
    cond={c1,c2,c3};
    R.tamyizSah=c1&&c2&&c3;
    if(!R.tamyizSah){
      const gagal=[];
      if(!c1)gagal.push("darah kuat kurang dari sehari semalam");
      if(!c2)gagal.push("darah kuat lebih dari 15 hari");
      if(!c3)gagal.push("darah lemah kurang dari 15 hari berturut-turut");
      R.alasan.push("Pembedaan darah (tamyiz) tidak sah karena "+gagal.join(" dan ")+". Syaratnya: darah kuat sekurang-kurangnya sehari semalam dan tidak lebih dari 15 hari, serta darah lemah sekurang-kurangnya 15 hari berturut-turut.");
    }
  }
  if(tamyiz&&R.tamyizSah){
    R.haidJam=Math.round(kuat*JAM);R.metode="Mengikuti darah kuat (tamyiz)";
    R.alasan.push("Syarat tamyiz terpenuhi, maka haidnya adalah masa darah kuat (hitam atau merah tua), dan darah lemah adalah istihadhah."+(status==="mutadah"?" Menurut pendapat yang dipegang, pembedaan darah didahulukan daripada kebiasaan.":""));
  }else if(status==="mutadah"){
    R.haidJam=Math.min(adat,MAKS);R.metode="Mengikuti kebiasaan (adat)";
    R.alasan.push("Karena sudah punya kebiasaan dan tidak ada pembedaan darah yang sah, haidnya mengikuti lama kebiasaannya, yaitu "+Math.round(R.haidJam/JAM)+" hari. Sisanya istihadhah.");
  }else{
    R.haidJam=JAM;R.metode="Haid paling sedikit (sehari semalam)";
    R.alasan.push("Perempuan yang baru pertama kali haid (mubtadi'ah) dan tidak bisa membedakan darah dihukumi haid sehari semalam; sisa darah dalam 30 hari itu adalah istihadhah (hukumnya seperti suci).");
  }
  R.segmen=[{t:"haid",a:0,b:R.haidJam},{t:"istihadhah",a:R.haidJam,b:H}];
  return R;
}
const api={JAM,MAKS,analisis};
if(typeof module!=="undefined")module.exports=api;
return api;
})();
