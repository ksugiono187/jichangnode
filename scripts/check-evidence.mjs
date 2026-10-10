import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const r=JSON.parse(fs.readFileSync(root+'/data/brand-research.json'));
const pages=JSON.parse(fs.readFileSync(root+'/TDK清单.json'));
const fail=[];
for(const b of r){
 const html=fs.readFileSync(root+'/dist/brands/'+b.id+'/index.html','utf8');
 for(const p of b.reportedPlans){
  if(!html.includes(p.source.replaceAll('&','&amp;')))fail.push(b.id+' source absent');
  if(!Number.isFinite(p.price)||p.price<=0)fail.push(b.id+' invalid price');
  if(!p.quota||!p.publisher)fail.push(b.id+' missing quota/source');
 }
}
const articles=pages.filter(p=>p.file.startsWith('blog/')&&p.file!=='blog/index.html');
for(const p of articles){
 const h=fs.readFileSync(root+'/dist/'+p.file,'utf8');
 if(!h.includes('id="research-sources"')||!h.includes('id="research-comparison"'))fail.push('missing evidence '+p.file);
}
const result={brands:r.length,publicPriceRecords:r.reduce((a,b)=>a+b.reportedPlans.length,0),articlesChecked:articles.length,passed:!fail.length,fail};
console.log(JSON.stringify(result));
fs.writeFileSync(root+'/资料核查验收.json',JSON.stringify(result,null,2));
if(fail.length)process.exit(1);
