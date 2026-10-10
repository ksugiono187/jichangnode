import {filterPlans} from './plan-selector.js';
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const download=(name,value,type='application/json')=>{const u=URL.createObjectURL(new Blob([value],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
const picker=document.querySelector('#plan-selector');
if(picker){
 const cycle=picker.elements.cycle,period=picker.elements.period;
 cycle.addEventListener('change',()=>{period.value=cycle.value==='一次性'?'total':'month';});
 const run=async()=>{const status=document.querySelector('#plan-status');try{
  const r=await fetch(new URL('./site-data.json',import.meta.url));if(!r.ok)throw Error('价目读取失败，请刷新后重试。');const {brands}=await r.json();
  const opts={cycle:cycle.value,period:period.value,budget:Number(picker.elements.budget.value),usage:Number(picker.elements.usage.value),margin:Number(picker.elements.margin.value),showUnresolved:picker.elements.unresolved.checked};
  const result=filterPlans(brands,opts),label={month:'每月／每30天',total:'一次性总额','year-total':'年度总额'}[opts.period];
  const matched=result.matches.filter(x=>!x.unresolved).length;status.textContent=`目标额度 ${result.required.toFixed(1)} GB（${label}）；${matched} 个参考档位覆盖需求；另有 ${result.excluded} 个预算内待确认档位。`;
  document.querySelector('#plan-results').innerHTML=result.matches.length?result.matches.map(({brand:b,plan:p,unresolved})=>`<article class="brand-card"><span class="eyebrow">${unresolved?'待确认 · 未作容量匹配':'参考价目 · 未核当前订单'}</span><h3><a href="../brands/${E(b.id)}/">${E(b.name)} · ${E(p.name)}</a></h3><p><strong>¥${E(p.price)} / ${E(p.cycle)}</strong></p><p>${unresolved?E(p.quotaNote||'存在容量、重置周期或归属疑点，请核对档案。'):E(p.gb)+' GB · '+E(label)}</p><p>原记录日期：${E(p.sourceDate||'未明确')}</p><p>当前设备限制、退款与优惠条件需确认。</p><a class="button" href="../brands/${E(b.id)}/#web-evidence">核对资料与来源 ↗</a></article>`).join(''):'<p class="notice">没有满足该预算和额度周期的参考档位。可以调整条件，或查看下方待核实资料；不以未知容量补齐结果。</p>';
 }catch(e){status.textContent=e.message;}};
 picker.addEventListener('submit',e=>{e.preventDefault();run();});run();
}
let correctionDraft='';const correction=document.querySelector('#correction-form');
if(correction){correction.addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(correction)),status=document.querySelector('#correction-status');try{
 const source=new URL(v.source);if(!['http:','https:'].includes(source.protocol)||source.username||source.password)throw Error('请提供不含账户凭据的公开网页链接。');
 correctionDraft=`品牌或页面：${v.brand}\n字段：${v.field}\n原记录：${v.oldValue}\n建议新值：${v.newValue}\n资料日期：${v.date}\n公开出处：${source.href}\n理由：${v.reason}\n\n本反馈为待核查建议，请编辑复核后更新。`;
 const preview=document.querySelector('#correction-draft');preview.textContent=correctionDraft;preview.hidden=false;document.querySelector('#correction-actions').hidden=false;
 const link=new URL('https://github.com/ksugiono187/jichangnode/issues/new');link.searchParams.set('title',`资料更正：${v.brand} · ${v.field}`);link.searchParams.set('body',correctionDraft);document.querySelector('#correction-submit').href=link.href;
 status.textContent='草稿已生成，尚未发送。公开提交前请在 GitHub 核对内容。';
 }catch(err){status.textContent=err.message;}});document.querySelector('#correction-download').addEventListener('click',()=>download('机场node-纠错草稿.txt',correctionDraft,'text/plain;charset=utf-8'));}
const test=document.querySelector('#test-record');if(test)test.addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(test)),status=document.querySelector('#test-status');try{
 for(const field of ['multiplier','samples','latencyMs','downloadMbps','lossPercent'])v[field]=v[field]===''?null:Number(v[field]);
 if(!Number.isInteger(v.samples)||v.samples<1)throw Error('样本次数需要填写正整数。');
 if([v.latencyMs,v.downloadMbps,v.lossPercent].every(x=>x===null))throw Error('至少填写一项真实测量值，未测的项目保持空白。');
 if(v.lossPercent!==null&&(v.lossPercent<0||v.lossPercent>100))throw Error('丢包比例必须在0到100之间。');
 const record={schemaVersion:1,recordType:'reader-observation',siteRetested:false,independentlyVerified:false,...v,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,units:{latencyMs:'ms',downloadMbps:'Mbps',lossPercent:'%'},note:'读者填写的单次观测，未上传或由机场node复测。'};
 download('机场node-个人测评记录.json',JSON.stringify(record,null,2));status.textContent='已导出个人记录，请保留原始证据。此记录未上传，也未进入本站测评或排行榜。';
 }catch(err){status.textContent=err.message;}});
