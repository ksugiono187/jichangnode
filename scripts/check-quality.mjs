import {selectReview} from './public-reviews.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {searchEntries,searchSite} from '../assets/discovery.js';
import {eligibleTotalPlan} from '../assets/metrics.js';
import {enrichArticles} from './evidence-editorial.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const data=JSON.parse(read('dist/assets/site-data.json')),entries=searchEntries(data);
assert.equal(searchSite(entries,'　ＢＲＥＥＺＥＮＥＴ　','品牌')[0].title,'微风网络 Breezenet');
assert.equal(searchSite(entries,'','品牌').length,0);assert.equal(searchSite(entries,'没有此品牌XYZ').length,0);
assert.ok(searchSite(entries,'年付 流量','文章').length>0);assert.ok(searchSite(entries,'套餐筛选','工具').length>0);
const clean={name:'无争议总额',price:100,gb:100,cycle:'一次性',quotaPeriod:'total'};
for(const extra of [{researchConflict:true},{capacityConflict:true},{quotaPeriod:'month'},{gb:null},{price:0}])assert.equal(eligibleTotalPlan({id:'sample'},{...clean,...extra}),false);
assert.equal(eligibleTotalPlan({id:'sample'},clean),true);assert.equal(eligibleTotalPlan({id:'kosing'},clean),false);
const branded={id:'sample',name:'审查样本',plans:[{...clean,researchConflict:true}]};
const article=enrichArticles([{id:'sample-payment-research',kind:'brand',brandIds:['sample']}],[branded])[0];
const paragraph=article.sections.find(s=>s.heading==='按量包的核心原因：用量寿命与资金占用').paragraphs[0];
assert.ok(paragraph.includes('暂停单价和消耗寿命计算'));assert.ok(!paragraph.includes('名义整包单价'));
const failures=[];const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(new URL(e.name+'/',dir)):[new URL(e.name,dir)]);
for(const file of walk(new URL('dist/',root)).filter(p=>p.pathname.endsWith('.html'))){const html=fs.readFileSync(file,'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)failures.push(file.pathname+' duplicate IDs');if(/href=""/.test(html))failures.push(file.pathname+' empty link');if(!html.includes('experience.js'))failures.push(file.pathname+' missing interactions');}
const research=JSON.parse(read('data/brand-research.json'));for(const b of research)for(const p of b.reportedPlans){const source=b.sources.find(s=>s.url===p.source);if(source?.publisher&&p.publisher!==source.publisher)failures.push(b.id+' publisher mismatch');}
assert.deepEqual(failures,[]);console.log('Whole-site quality passed: search normalization and types, safe total-quota calculations, no empty links or duplicate IDs, and consistent source attribution.');

const late={testDate:'2026-09-21 23:45'},early={testDate:'2026-07-19'},month={testDate:'2026-10（具体日未公布）'};
assert.equal(selectReview([late,month,early]),late);assert.equal(selectReview([early,late]),late);assert.equal(selectReview([month]),month);
