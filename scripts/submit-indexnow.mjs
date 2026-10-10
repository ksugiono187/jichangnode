import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const {key}=JSON.parse(fs.readFileSync(root+'/data/indexnow.json','utf8'));
const origin='https://jichangnode.wiki';
const request=async(url,options={})=>{const r=await fetch(url,{...options,signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(url+' HTTP '+r.status);return r;};
// Do not announce URLs until the production domain and ownership file work over HTTPS.
const home=await(await request(origin+'/')).text();
if(!home.includes('机场node')||!home.includes('13962FC4C879EAC5F75353BE260788D1'))throw Error('正式域名未显示已发布的博客');
const keyLocation=origin+'/'+key+'.txt';
if((await(await request(keyLocation)).text()).trim()!==key)throw Error('验证文件尚未公开生效');
const sitemap=await(await request(origin+'/sitemap.xml')).text();
const urlList=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
if(!urlList.length||urlList.some(u=>new URL(u).origin!==origin))throw Error('站点地图的地址不一致');
const r=await fetch('https://api.indexnow.org/IndexNow',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify({host:'jichangnode.wiki',key,keyLocation,urlList}),signal:AbortSignal.timeout(30000)});
const record={submittedAt:new Date().toISOString(),status:r.status,urls:urlList.length,accepted:[200,202].includes(r.status),note:'接口接收不表示页面已收录或关键词排名。'};
fs.writeFileSync(process.argv[2]||root+'/IndexNow提交记录.json',JSON.stringify(record,null,2));
console.log(JSON.stringify(record));
if(!record.accepted)process.exitCode=1;
