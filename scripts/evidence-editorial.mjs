import fs from 'node:fs';
import {quotaLabel,eligiblePlan,excluded} from '../assets/metrics.js';
const file=new URL('../data/brand-research.json',import.meta.url);
export const research=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];
const lookup=id=>research.find(r=>r.id===id);
const S=(heading,...paragraphs)=>({heading,paragraphs});
const money=n=>Number(n).toFixed(2).replace(/\.00$/,'');
const label=p=>`${p.name}：¥${money(p.price)} / ${p.cycle}，${quotaLabel(p)}`;
const monthly=b=>b.plans.filter(p=>eligiblePlan(b,p)&&!p.researchConflict).sort((a,b)=>a.price-b.price);
const facts=b=>b.plans.map(label).join('；')+'。';
const sectionEvidence=b=>{
 const r=lookup(b.id);
 return r?.summary||'当前记录来自已有价目底稿，尚未取得公开的官方完整套餐表；金额与容量按来源日期理解。';
};
const closest=(b,brands,target)=>brands.filter(x=>x.id!==b.id&&!excluded(x)).flatMap(x=>monthly(x).map(p=>({b:x,p}))).sort((a,c)=>Math.abs(a.p.gb-target)-Math.abs(c.p.gb-target)||a.p.price-c.p.price).filter((x,i,a)=>a.findIndex(z=>z.b.id===x.b.id)===i).slice(0,3);
function monthlySections(b,brands){
 const ps=monthly(b),first=ps[0],second=ps[1];
 const parts=[S('先把全部套餐和周期列清楚',facts(b),sectionEvidence(b))];
 if(!first)return [...parts,S('为什么暂不输出最低可买档位','这份记录没有同时满足归属清楚、月度额度明确和版本无冲突的常规月付。问题发生在计算之前：若容量或品牌不对，精确到三位小数的单价仍会误导购买。','表格继续展示查到的原值；需要当前品牌套餐页确认身份、金额和重置周期后，才能恢复购买建议。'),S('对照其他品牌时，先比较证据条件','可以把价目作为调查入口，但不能把同名转载、成功打开入口或多个网站重复同一表格当作订单验证。先确认每条价目的出处和适用日期，再用相同额度周期比较。')];
 const usage=Math.max(5,Math.floor(first.gb*0.75)),peers=closest(b,brands,first.gb);
 parts.push(S(`${first.gb}GB档位，实际能覆盖多大的需求`,`${b.name}${first.name}参考月付¥${first.price}，${quotaLabel(first)}，名义容量单价${(first.price/first.gb).toFixed(3)}元/GB。假设实际月用量${usage}GB，保留25%额外容量需要${money(usage*1.25)}GB，这个档位${first.gb>=usage*1.25?'可以覆盖':'不足以覆盖'}；实际消耗成本为${(first.price/usage).toFixed(3)}元/GB。`,`这里的${usage}GB是明确设定的情景。容量余量决定是否够用，付款金额决定账单是否省钱。低单位价只有在需要更多额度时才有购买价值，不能替代自己的后台计费记录。`));
 if(second)parts.push(S(`从¥${first.price}升级到¥${second.price}，核心差别是什么`,`${first.name}和${second.name}分别为${first.gb}GB与${second.gb}GB；多付¥${money(second.price-first.price)}，容量变化${second.gb-first.gb}GB。${second.gb>first.gb?'增加额度的边际成本为'+((second.price-first.price)/(second.gb-first.gb)).toFixed(3)+'元/GB。':'容量没有增加，不能用“扩容更划算”解释价差。'}`,`如果真实消耗没有超过${first.gb}GB，升级会把账单增加${money((second.price-first.price)*12)}元/年（假设连续12期价格不变）。若需求超过${first.gb}GB，比较重点才转为更大档位是否覆盖需求、升级如何处理余额和重置日。资料未给出的权益差别不以价格推断。`));
 parts.push(S('同流量附近的跨品牌对照',...peers.map(({b:x,p})=>`${x.name}${p.name}参考¥${p.price}/月、${p.gb}GB。相对本品牌${first.name}，付款${p.price>=first.price?'增加':'减少'}¥${money(Math.abs(p.price-first.price))}，容量${p.gb>=first.gb?'增加':'减少'}${Math.abs(p.gb-first.gb)}GB。两个值要同时读，容量不同的“同价”并不等价。`),'这份对照只回答参考套餐的资金与容量差别，不能从GB或价格推出线路质量、晚高峰表现、平台解锁或客服水平。换品牌还需要自己的任务样本和当前条款。'));
 parts.push(S('选购结论：哪个条件真正改变选择',`若你每周期用量不超过${usage}GB，先比较${first.name}与上面的同容量替代档，选择能够覆盖需求的最低实际付款。超过${first.gb}GB时再看扩容。不要因为更大套餐的每GB价格更低，就给长期闲置额度付费。`,sectionEvidence(b)));
 return parts;
}
function paymentSections(b,brands){
 const annual=b.plans.filter(p=>p.cycle==='年付'),payg=b.plans.filter(p=>p.cycle==='一次性'),base=monthly(b)[0];
 const parts=[S('月付、年付、一次性：先写全额付款',facts(b),'月付金额、年付总价与整包金额属于不同付款承诺。下面把现金支出和流量周期分别计算，所有计算都基于表内参考值。')];
 parts.push(S('年包是否省钱，要比较相同权益',...annual.map(p=>`${p.name}一次付款¥${p.price}，流量标注为${quotaLabel(p)}；使用12个月的费用分摊为¥${money(p.price/12)}/月，若只使用6个月则为¥${money(p.price/6)}/使用月。${p.quotaPeriod==='unknown'?'重置周期不明确，不能与每月新增额度相除，也不能把年费/12当作可月付报价。':p.quotaPeriod==='year-total'?'这是年度总额，不是每个月新增同样流量。':'这是流量周期说明，平均月费用不会改变一次预付的性质。'}`),...(annual.length?[]:['当前记录没有年付价目。不推测隐藏年价或年付折扣。'])));
 parts.push(S('按量包的核心原因：用量寿命与资金占用',...payg.map(p=>`${p.name}付款¥${p.price}，${quotaLabel(p)}。${p.gb?`名义整包单价${(p.price/p.gb).toFixed(3)}元/GB；假设每月用10GB，可消耗约${money(p.gb/10)}个月；每月用50GB，约${money(p.gb/50)}个月。`:'容量待确认，不计算单价或使用寿命。'}消耗寿命是算例，服务存续、账号要求和完整条款可能缩短实际有效期。`),...(payg.length?[]:['当前记录没有完整一次性包价目。低频备用可以调查其他品牌，但月包剩余额度不能默认跨月保留。'])));
 const p=payg.find(p=>p.gb&&!p.capacityConflict&&!p.researchConflict);
 if(base&&p)parts.push(S('低频备用和连续使用，费用拐点在哪里',`若按量${p.name}可以覆盖整段任务，¥${p.price}与月付${base.name}每期¥${base.price}的纯付款交点约为${money(p.price/base.price)}期。这个交点成立的前提是累计消耗不超过${p.gb}GB、月包需要每期付款，而且权益可比。`,`例如连续3期的月付账单为¥${money(base.price*3)}、6期为¥${money(base.price*6)}。若期间总消耗超过${p.gb}GB，一包已不够，需把加购费用计入。不能只用按量单价低或有效期长得出全年更便宜。`));
 const peers=brands.filter(x=>x.id!==b.id&&!excluded(x)).flatMap(x=>x.plans.filter(p=>p.cycle===(payg.length?'一次性':'年付')&&p.gb&&!p.capacityConflict&&!p.researchConflict).map(p=>({b:x,p}))).slice(0,3);
 parts.push(S('其他品牌的同周期参考',...peers.map(({b:x,p})=>`${x.name}${p.name}：¥${p.price}/${p.cycle}，${quotaLabel(p)}。对照本品牌时先看累计预算，再看额度能覆盖多久；额度单位不一致的两档不计算所谓折扣。`),sectionEvidence(b)));
 parts.push(S('结论：付款周期选择背后的核心原因',`对${b.name}，持续每期使用优先比较明确周期的月包；长期需求确定且条款完整时再评估年包；偶发任务再算一次性包库存。决定付款方式的是使用时间分布、额度重置和未消费资金，而不是把所有总价除以12后的最低数字。`));
 return parts;
}
function evidenceSections(b){
 const r=lookup(b.id),conflicts=r?.conflicts||[];
 return [S('本次核查取得了什么',sectionEvidence(b),`已收录价目如下：${facts(b)}`),S('价格、容量和归属：冲突怎样影响判断',...(conflicts.length?conflicts:['本轮公开资料没有解决当前订单验证问题。未记录到冲突也不等于官网确认所有参数。']),`归属状态：${b.planAttribution==='disputed'?'已有套餐与品牌对应疑点，保留原始表而不参加自动推荐。':'按已有品牌档案记录；第三方使用同名品牌不构成法律主体或当前面板身份确认。'}${b.id==='kosing'?'可信云已有运营状态疑点，本次未取得足以恢复购买推荐的证据。':''}`),S('为什么同一套餐的两个数值不能随便选',`若一个价目写${b.plans.find(p=>p.gb)?.gb||100}GB，另一个来源给出不同容量，取较大值会降低名义单价并提高可匹配用量。这个变化直接影响排行榜与购买判断，因此在取得品牌当前确认之前，应并列保留版本，而不是用更有吸引力的数字覆盖旧表。`,'公开转载可能来自同一底稿。多篇文章写同一个值只能增加可检索性，不能自动成为独立验证；访问日期也不能替代价目的发布或更新时间。'),S('套餐事实与使用表现，分别需要什么证据',`表中的付款金额与${b.line||'线路'}介绍属于价目/宣传资料。是否低延迟、晚高峰是否断连、特定平台是否可用，需要设备、网络、节点、目标任务、时段和重复样本；目前没有本站购买后的原始测试记录。`,'没有数据时，本文能给出的结论是版本差异和资金/额度影响，不能给出速度排名、稳定率或永久解锁承诺。'),S('购买决策在哪一步暂停',conflicts.length?'先把冲突套餐从自动比较中移开，核对当前面板的完整套餐名称、应付金额与流量周期。其余无冲突档位也只作为参考价目，不把第三方报价写成最终订单。':'把本文作为购买前的资料检查。先确认当前价目与服务条款，再用自己的任务观察决定是否长期投入。',b.coupon?`站长提供优惠码${b.coupon}。本轮没有确认折扣、有效期或续费资格，不把优惠码存在当作折后价格证据。`:'本站未收到该品牌独立优惠码，不用入口邀请码推算折后价。')];
}
const guideBrands={recommend:['breezenet','flycat','twilight'],cheap:['2mao','1fly','worryfree'],stable:['breezenet','flashleap','globalcloud'],coupons:['breezenet','flycat','yuzhou'],traffic:['lingdong','dalaocloud','kuajie'],renewals:['breezenet','worryfree','v2yun'],devices:['civet','flycat','invisible'],annual:['flycat','2mao','lingdong'],payg:['breezenet','sogo','worryfree'],latency:['lightspeed','guangnianti','edgenova'],evidence:['twilight','wavenet','firefly'],support:['kosing','jilian','twilight'],privacy:['invisible','breezenet','flyv'],travel:['laddercloud','sogo','stardream'],capacity:['kuaili','kuajie','u1s1'],ai:['breezenet','flashleap','globalcloud']};
export function enrichArticles(input,brands){return input.map(a=>{
 if(a.kind!=='guide'){
  const b=brands.find(b=>b.id===a.brandIds[0]);
  const mode=a.id.includes('-monthly-')?'monthly':a.id.includes('-payment-')?'payment':'evidence';
  const sections=mode==='monthly'?monthlySections(b,brands):mode==='payment'?paymentSections(b,brands):evidenceSections(b);
  const p=monthly(b)[0];
  const title=mode==='monthly'?`${b.name}月付套餐对比：${p?`¥${p.price}与容量阶梯`:'价格、流量与资料冲突'}`:mode==='payment'?`${b.name}付款周期分析：年付、月付与备用成本`: `${b.name}价格真实性核查：来源、版本差异与购买判断`;
  return {...a,title,date:'2026-10-10',sections,excerpt:mode==='monthly'?`${b.name}完整价目、相邻档位增量成本与同流量跨品牌比较。按实际用量解释选择原因，保留网上公开报价的版本冲突。`:mode==='payment'?`${b.name}各周期全额付款、额度规则、年费分摊与按量消耗寿命，比较连续使用和低频备用的实际成本。`:sectionEvidence(b),checklist:[sections[0].heading,sections[Math.min(2,sections.length-1)].heading,'查看来源版本，再核对当前订单'],researchMode:mode};
 }
 const ids=a.brandIds.length?a.brandIds:(guideBrands[a.topic]||['breezenet','2mao','1fly']);
 return {...a,brandIds:ids,date:'2026-10-10',researchMode:'guide',sections:[...a.sections,S('把本文的方法落到品牌价目上',...ids.map(id=>{const b=brands.find(x=>x.id===id);const p=monthly(b)[0];return p?`${b.name}可对照的参考档是${label(p)}。${['annual','payg'].includes(a.topic)?'另看完整表中的长期付款与一次性额度，不能仅用月起价替代本文的周期判断。':`按这档容量的80%设置情景用量为${money(p.gb*.8)}GB，实际使用成本${(p.price/(p.gb*.8)).toFixed(3)}元/GB。这个算例用于预算，不代表速度、平台可用或实际使用消耗。`}`:`${b.name}的完整价目仍可阅读，但套餐身份、容量或版本有未解决问题，本篇不以它输出确定购买档位。`;}))]};
 });}
function table(headers,rows,E,caption){return `<div class="table-wrap"><table><caption>${E(caption)}</caption><thead><tr>${headers.map(h=>`<th>${E(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
export function sourceHTML(b,E){
 const r=lookup(b.id);if(!r)return '';
 return `<div class="evidence-note"><p><strong>本轮公开核查 · ${E(r.accessDate||'2026-10-10')}</strong></p><p>${E(r.summary)}</p>${r.conflicts?.length?'<ul>'+r.conflicts.map(c=>`<li>${E(c)}</li>`).join('')+'</ul>':''}<ul class="source-links">${(r.sources||[]).map(s=>`<li><a href="${E(s.url)}" target="_blank" rel="noopener noreferrer">${E(s.publisher||s.title||new URL(s.url).hostname)}</a> · ${E(s.level||'第三方公开参考')} · ${E(s.publishedDate?'页面日期'+s.publishedDate:'页面日期未明确')}<small>${E(s.note||'')}</small></li>`).join('')}</ul></div>`;
}
export function reportedHTML(b,E){const r=lookup(b.id);if(!r?.reportedPlans?.length)return '';
 return `<section id="public-prices"><h2>网上公开价目：本轮查到的版本</h2><p>以下是来源页面的事实字段转录，不是当前官网订单。保留与旧表不一致的版本，便于核对。</p>${table(['套餐 / 版本','价格 / 付款周期','流量 / 重置','出处 / 资料日期'],r.reportedPlans.map(p=>[E(p.name),E(`¥${p.price} / ${p.cycle}`),E(p.quota||`${p.gb??'未知'}GB`)+(p.quotaNote?`<small>${E(p.quotaNote)}</small>`:''),`<a href="${E(p.source)}" target="_blank" rel="noopener noreferrer">${E(p.publisher||'公开资料')}</a><small>${E(p.sourceDate||'日期未明确')} · 第三方参考</small>`]),E,`${b.name}公开报道价目 · 查阅${r.accessDate}`)}</section>`;
}
export function brandAnalysisHTML(b,brands,E){return `<section id="analysis"><h2>套餐选择背后的核心原因</h2>${monthlySections(b,brands).slice(1).map(s=>`<h3>${E(s.heading)}</h3>${s.paragraphs.map(p=>`<p>${E(p)}</p>`).join('')}`).join('')}<h3>付款周期怎样决定预算</h3><p>${E(paymentSections(b,brands).at(-1).paragraphs[0])}</p></section>`;}
export function brandResearchHTML(b,brands,E){
 const p=monthly(b)[0];const peers=p?closest(b,brands,p.gb):[];
 return reportedHTML(b,E)+`<section id="comparison"><h2>跨品牌对照与选择原因</h2>${p?table(['品牌 / 套餐','月付参考','月度流量','名义元/GB','与本档差别'],[{b,p},...peers].map(({b:x,p:q})=>[`<a href="../../brands/${x.id}/">${E(x.name)} · ${E(q.name)}</a>`,`¥${q.price}`,`${q.gb}GB`,(q.price/q.gb).toFixed(3),x.id===b.id?'本品牌参照档':E(`价差${money(q.price-p.price)}元，容量差${q.gb-p.gb}GB`)]),E,'按相近月容量选取，比较参考账单，不代表性能排序'):'<p>本品牌缺少无争议可比较月档，先核实归属与容量，不生成误导性的最低价推荐。</p>'}<p>${E(p?`选择${b.name}的价目理由应建立在${p.gb}GB是否覆盖你的实际消耗，以及¥${p.price}是否低于覆盖同样需求的替代档。价格更低但容量不足，需要升级后重新比较；容量更大但没有用途，只会增加预付款。`:'当前的核心原因是证据不足：计算要等身份、周期、容量确定之后进行。')}</p></section><section id="web-evidence"><h2>网络核查与出处</h2>${sourceHTML(b,E)}</section>`;
}
export function articleResearchHTML(a,brands,E){
 const bs=brands.filter(b=>a.brandIds.includes(b.id));
 let rows=bs.flatMap(b=>monthly(b).slice(0,2).map(p=>({b,p})));
 if(a.researchMode==='monthly'&&rows[0])rows.push(...closest(rows[0].b,brands,rows[0].p.gb));
 const usage=a.researchMode==='monthly'&&rows[0]?Math.floor(rows[0].p.gb*.75):['light','annual','travel','payg'].includes(a.topic)?30:a.topic==='downloads'?400:100;
 const required=usage*1.25;
 const comparison=rows.length?table(['品牌 / 档位','付款 / 月','月度流量','名义元/GB',`${usage}GB用量＋25%余量`],rows.map(({b,p})=>[`<a href="../../brands/${b.id}/">${E(b.name)} · ${E(p.name)}</a>`,`¥${p.price}`,`${p.gb}GB`,(p.price/p.gb).toFixed(3),p.gb>=required?`覆盖需求；${(p.price/usage).toFixed(3)}元/实际消耗GB`:'容量不足，需另选档位']),E,`统一情景：实际用量${usage}GB，目标容量${money(required)}GB；不代表实际使用或性能测试`):'';
 const cited=[...new Set([...bs.map(b=>b.id),...rows.map(r=>r.b.id)])].map(id=>brands.find(b=>b.id===id));
 return `<section id="research-comparison"><h2>对照数据与计算口径</h2><p>本篇以公开参考价目分析费用与容量；不同日期、套餐权益和付款周期需分别理解。名义单位成本＝金额÷标称额度，情景成本＝金额÷假设实际消耗。表内算例不属于性能测量。</p>${comparison}<p><a href="../../plans/">查看29品牌完整价格流量总表 ↗</a></p></section><section id="research-sources"><h2>本篇事实来源与冲突记录</h2>${cited.map(b=>`<h3>${E(b.name)}</h3>${sourceHTML(b,E)}`).join('')}<p>本站分析与计算为原创整理。公开价目转录保留出处；来源页面上的线路、解锁或客服宣传没有被换写成本站实测结论。</p></section>`;
}
export function allPlansHTML(brands,E){return `<div class="notice">参考价目与本轮查到的公开版本分别展示。所有品牌完整收录；未知字段明确保留，不把查阅日期标成官网验证日期。</div><nav class="plan-index">${brands.map(b=>`<a href="#p-${b.id}">${E(b.name)}</a>`).join('')}</nav>${brands.map(b=>`<section class="plan-catalog" id="p-${b.id}"><span class="eyebrow">BRAND / ${b.rank}</span><h2><a href="../brands/${b.id}/">${E(b.name)}</a></h2>${table(['全部已收录套餐','金额 / 周期','流量与重置','原记录日期','比较状态'],b.plans.map(p=>[E(p.name),E(`¥${p.price} / ${p.cycle}`),E(quotaLabel(p)),E(p.sourceDate||'未明确'),E(p.researchConflict?'网络资料冲突':p.quotaPeriod==='unknown'?'重置待核实':excluded(b)?'品牌状态待核实':'参考值，未核当前订单')]),E,`${b.name}完整原记录`)}${reportedHTML(b,E).replace('id="public-prices"','')}${sourceHTML(b,E)}</section>`).join('')}`;}
