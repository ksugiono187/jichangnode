import fs from 'node:fs';
import {profiles} from './profiles.mjs';
import {dalaoArticles} from './dalaocloud.mjs';
import {guides as originalGuides,topics} from './guides.mjs';
import {deepArticles} from './magazine-editorial.mjs';
import {enrichGuide} from './guide-workbooks.mjs';
import {dossiers} from './topic-dossiers.mjs';
import {refineGuide,refineAnalysis,guideSecondary} from './refined-editorial.mjs';
const guides=originalGuides.map(a=>refineGuide(deepArticles[a.id]?{...a,...deepArticles[a.id]}:enrichGuide(a)));
import {money,quotaLabel,monthlyPlans,excluded} from '../assets/metrics.js';
const brands=JSON.parse(fs.readFileSync(new URL('./brands.json',import.meta.url),'utf8'));
const aliases={heavy:'downloads',backup:'travel',quota:'traffic',identity:'evidence',unknown:'evidence',sources:'evidence'};
export const topicIds=b=>[...new Set(profiles[b.id].topics.map(t=>aliases[t]??t))];
export {guides,topics};
const section=(heading,...paragraphs)=>({heading,paragraphs});
function analysis(b){
 const p=profiles[b.id],months=monthlyPlans(b),cycles=b.plans.filter(x=>x.cycle!=='月付'),common={brandIds:[b.id],date:'2026-10-05',kind:'analysis',topic:topicIds(b)[0]},doubtful=b.planAttribution==='disputed',cautious=excluded(b);
 const first=months[0],second=months[1];
 const upgrade=first&&second&&second.gb>first.gb&&!cautious?`${first.name}与${second.name}之间，付款从${money(first.price)}元增加到${money(second.price)}元，容量从${first.gb}GB增加到${second.gb}GB。多付${money(second.price-first.price)}元获得${second.gb-first.gb}GB标称额度，增量成本约${((second.price-first.price)/(second.gb-first.gb)).toFixed(3)}元/GB。`:null;
 const usage=first&&!cautious?Math.max(1,Math.floor(first.gb*.6)):null;
 const monthly={...common,id:`${b.id}-monthly-research`,title:`${b.name}月付怎么选：${p.headline}`,excerpt:p.deck,sections:[
 section(p.headline,p.deck,...p.strengths),
 section('先看相邻档位，多付的钱换来什么',p.monthlyInsight,...(upgrade?[upgrade]:[])),
 section('把标称容量放回自己的用量里',usage?`以${b.name}${first.name}为例，${money(first.price)}元对应${first.gb}GB，标称单价约${(first.price/first.gb).toFixed(3)}元/GB。假设一个周期实际使用${usage}GB，实际消耗成本约${(first.price/usage).toFixed(3)}元/GB，剩余${first.gb-usage}GB形成缓冲。这是用量示例，不是对用户实际消耗的预测。`:doubtful?'套餐归属没有确定时，先解决品牌与价目的对应关系；计算单价不能代替这一判断。':`${b.name}当前记录仍有容量或运营状态疑点。本篇保留套餐参考资料，但暂不据此推荐具体容量档位。`,usage?`如果你的消耗长期低于${usage}GB，提高档位的理由应来自明确的临时任务或容量缺口。若经常接近${first.gb}GB，再对照相邻档位与升级处理规则。`:'容量、重置日与可用状态明确后，再按后台计费量估算自己的档位。'),
 section('哪些条件会改变这份选择',p.tradeoff,p.verifyInsight),
 section('选择落在这里',cautious?`对${b.name}，目前先完成资料疑点的确认，再考虑付款。这里没有把尚未明确的条件换成购买结论。`:`${b.name}的选购重点是“${p.headline}”。先用相同付款周期比较适合的容量，再检查自己是否确实需要更大档位；预算余量应留给可预见的任务。`,`${b.name}各档位的金额、额度周期与来源日期已在品牌页分别列出，可与本篇的容量分析一起阅读。`)
 ],checklist:[p.strengths[0],p.monthlyInsight,p.verifyInsight]};
 const annual=cycles.filter(x=>x.cycle==='年付'),payg=cycles.filter(x=>x.cycle==='一次性');
 const example=annual.find(x=>x.price>0);
 const annualExample=example&&!cautious?`以${b.name}${example.name}为例，年付款${money(example.price)}元，平均分到12个月是${(example.price/12).toFixed(2)}元；如果只使用6个月，实际使用月份分摊为${(example.price/6).toFixed(2)}元。两个数字都是费用分摊，额度仍按“${quotaLabel(example)}”理解，不能从平均费用推导容量。`:p.cycleInsight;
 const paygExample=payg.length&&!cautious?payg.map(x=>`${x.name}：${money(x.price)}元一次付款，${quotaLabel(x)}${x.gb?'，按总额度计算约'+(x.price/x.gb).toFixed(3)+'元/GB':''}。`).join(' '):'备用需求首先看是否持续使用，以及未用额度的保留规则；没有明确的按量记录时，不假设月套餐能跨周期结转。';
 const cycle={...common,topic:payg.length?'payg':'annual',id:`${b.id}-payment-research`,title:`${b.name}付款方式：${payg.length?'日常月付与按量备用怎样取舍':annual.length?'年付支出与流量周期怎样看':'按使用频率安排预算'}`,excerpt:`${p.cycleInsight}`,sections:[
 section('持续使用和备用，先分清任务',p.cycleInsight,`${b.name}的选择可以从使用频率展开：连续几个月每天需要服务，关注每个重置周期的容量；只在出行或个别任务中使用，关注总投入与剩余额度保留。两类需求对应的“划算”不同。`),
 section('年付的钱，分摊到真正使用的月份',annualExample,annual.length?'较低月均支出伴随一次预付款。对照月付时，要同时看节点、设备和额度是否相同，不能把不同容量的年包视作相同月付的折扣版本。':'当前资料未提供可完整比较的年付方案，优先使用已有的付款周期讨论预算。'),
 section('按量包的价值在于使用时间',paygExample,payg.length?`对${b.name}的按量记录，GB数字表示整包额度，不会自动成为每月新增容量。比较时同时写下付款金额、总流量和有效条件；如果需要每月大量使用，应另与月付档位比较累计支出。`:'若日后考虑按量方案，需要取得完整的总额度与有效规则，再与现在的日常使用安排比较。'),
 section('哪些细节值得在付款前问清',p.tradeoff,p.verifyInsight),
 section('把付款安排落到实际需求',`${b.name}的付款决策可以保留两张预算：持续使用时每个周期需要多少，低频使用时多久才会消耗完一包。分别估算之后，再决定承担短期付款还是长期投入。`,'同一账号改周期、升级或叠加套餐时，重置日、到期日与余额处理可能不同。订单中的明确规则决定能否保留剩余额度。')
 ],checklist:[p.cycleInsight,'把一次支付金额与预计使用月份一起比较。',p.verifyInsight]};
 const evidence={...common,topic:'evidence',id:`${b.id}-evidence-research`,title:`${b.name}选购注意：${doubtful?'先确认套餐归属':b.id==='kosing'?'先确认当前运营状态':'价格与使用条件分开看'}`,excerpt:`${p.tradeoff}`,sections:[
 section('这个品牌先解决什么问题',p.tradeoff,p.verifyInsight),
 section('从价目里能读出什么',p.monthlyInsight,p.cycleInsight),
 section('套餐描述与实际任务怎样对应',...p.strengths,`关注${b.name}时，先选一个最常使用的目标任务，再确认地区、设备、客户端和同时在线的需求。线路标签可以帮助理解配置，但具体节点在你的网络下完成任务的表现需要实际观察。`),
 section('怎样保存一份有用的购买记录',`${b.name}的资料更新要对应到完整套餐：名称、付款周期、金额、额度单位与日期。若新购买页与旧记录不同，同时保留新值和变化原因，有助于重新判断预算。`,'优惠码是否适用应看账号资格和最终应付金额；客服说明、余额处理和续费条件应保留原文。本站参考资料与入口访问检查分别记录，完整来源可在品牌详情展开查看。')
 ],checklist:[p.tradeoff,p.verifyInsight,'保存套餐名称、完整计量周期及最终应付金额。']};
 return [monthly,cycle,evidence];
}
export const articles=[...guides,...brands.flatMap(b=>(b.id==='dalaocloud'?dalaoArticles:analysis(b)).map(a=>refineAnalysis(a,b)))];
export function articleTopicIds(a){
 const curated=Object.entries(dossiers).filter(([,d])=>d.reading.includes(a.id)).map(([id])=>id);
 if(a.kind==='guide')return [...new Set([a.topic,...(guideSecondary[a.id]||[]),...curated])];
 const b=brands.find(b=>b.id===a.brandIds[0]);const own=topicIds(b);let related=[];
 if(a.id.includes('-monthly-'))related=own.filter(t=>['budget','light','capacity','traffic','downloads','lines','devices'].includes(t));
 else if(a.id.includes('-payment-'))related=[...(b.plans.some(p=>p.cycle==='年付')?['annual']:[]),...(b.plans.some(p=>p.cycle==='一次性')?['payg']:[]),...own.filter(t=>['light','travel','budget'].includes(t))];
 else related=own.filter(t=>['coupons','promotions','privacy','support','clients','lines'].includes(t));
 return [...new Set([a.topic,...related,...curated])];
}
if(articles.length!==guides.length+brands.length*3)throw new Error(`Article count mismatch: ${articles.length}`);
