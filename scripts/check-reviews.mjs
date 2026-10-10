import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),rows=JSON.parse(fs.readFileSync(root+'/data/public-reviews.json'));
const errors=[];let metrics=0,records=0;
if(rows.length!==29||new Set(rows.map(b=>b.id)).size!==29)errors.push('29 brand coverage');
for(const b of rows){
 const html=fs.readFileSync(root+'/dist/brands/'+b.id+'/index.html','utf8');
 if(!html.includes('id="review"'))errors.push(b.id+' section');
 if(!b.records.length&&!html.includes('本轮没有找到可收录的量化实测'))errors.push(b.id+' missing not-found state');
 for(const r of b.records){
  records++;
  if(!html.includes(r.url.replaceAll('&','&amp;')))errors.push(b.id+' source link');
  if(r.independentlyVerifiedBySite!==false)errors.push(b.id+' false verification');
  for(const m of r.metrics){metrics++;if(m.value===null||m.value===undefined)errors.push(b.id+' absent value');if(typeof m.value==='number'&&!Number.isFinite(m.value))errors.push(b.id+' invalid metric');}
 }
 if(!html.includes('本站没有复测'))errors.push(b.id+' provenance');
}
const result={brands:rows.length,records,metrics,passed:!errors.length,errors};
fs.writeFileSync(root+'/测评资料验收.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(errors.length)process.exit(1);
