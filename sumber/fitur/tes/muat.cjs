// Memuat pustaka fitur/lib/*.js persis seperti saat disisipkan ke index.html (tanpa modul).
const fs=require("fs"),path=require("path");
module.exports=(nama,ekspor)=>{
  const src=fs.readFileSync(path.join(__dirname,"..","lib",nama+".js"),"utf8");
  return new Function("module",src+"\nreturn "+ekspor+";")({exports:{}});
};
