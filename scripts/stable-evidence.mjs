import {publicReviews} from './public-reviews.mjs';
export const stableIds=['breezenet','flycat','firefly','civet','flashleap','worryfree','2mao','yuzhou','1fly','sujie'];
const record=id=>publicReviews.find(b=>b.id===id)?.records.find(r=>r.classification==='第三方实测'&&r.hasRawEvidence&&r.testDate&&r.metrics.length);
export function stableSummary(id){return record(id)?.summary||'公开资料不足';}
export function stableStatus(id){return record(id)?'公开样本':'资料不足';}
const text=x=>Array.isArray(x)?x.map(v=>String(v).replace(/[。；]+$/,'')).join('；'):x;
export function stableEvidenceHTML(brands,E){
 return `<section class="stable-archive" id="stable-evidence"><span class="eyebrow">PUBLIC EVIDENCE / 10 BRANDS</span><h2>10品牌公开测试：结果与异常一起看</h2><p>以下选用有测试日期、量化结果及原始证据入口的作者自述报告。按品牌库顺序编目，序号用于阅读导航。各测试条件不同，不生成稳定率或性能名次；本站没有复测或鉴定原始数据真实性。</p><nav class="brand-quicknav" aria-label="稳定性资料导航">${brands.map((b,i)=>`<a href="#stable-${E(b.id)}">${i+1}. ${E(b.name)}</a>`).join('')}</nav>${brands.map((b,i)=>{
 const r=record(b.id);if(!r)throw Error('Missing stable evidence: '+b.id);
 const evidence=[...(r.evidenceUrls||[]),...(r.evidenceUrl?[r.evidenceUrl]:[])];
 return `<article class="stable-case" id="stable-${E(b.id)}"><span class="eyebrow">RECORD / ${String(i+1).padStart(2,'0')}</span><h3>${E(b.name)}</h3><div class="review-label">公开测试样本 · 原作者报告</div><p><strong>观察结果：</strong>${E(r.summary)}</p><dl class="review-context"><dt>测试日期</dt><dd>${E(r.testDate)}</dd><dt>作者与原文</dt><dd><a href="${E(r.url)}" target="_blank" rel="noopener noreferrer">${E(r.publisher)} · 核对完整报告 ↗</a></dd><dt>测试环境</dt><dd>${E(text(r.environment))}</dd></dl><div class="table-wrap"><table><caption>保留原单位与统计口径，含异常结果</caption><thead><tr><th>指标</th><th>原文数值</th><th>节点 / 范围</th></tr></thead><tbody>${r.metrics.map(m=>`<tr><td>${E(m.metric)}</td><td>${E(m.value)} ${E(m.unit||'')}</td><td>${E(m.node||'未注明')}</td></tr>`).join('')}</tbody></table></div><div class="review-limit"><strong>可以据此判断什么</strong><p>这份记录可用于识别该次测试中的地区差异、异常和复测重点。单轮取得非零结果，不等于连续在线；低延迟也不等于所有任务稳定成功。</p><p>${E(text(r.limitations))}</p></div><p>${evidence.map((url,j)=>`<a href="${E(url)}" target="_blank" rel="noopener noreferrer">原始证据入口 ${j+1} ↗</a> · `).join('')}<a href="../../brands/${E(b.id)}/#review">更多报告、附件与套餐资料 ↗</a></p></article>`;
 }).join('')}${temporalHTML(E)}<article class="prose policy"><h2>哪些资料没有进入本专题</h2><p>大佬云未找到合格量化报告；暮光网络、跨界云现有资料仅为来源声明或商家测试，本次未计入10份作者自述样本。Sogo原文有日期和环境信息矛盾，保留在品牌档案供核对，不纳入本专题。品牌推荐前十顺序和29品牌库保持原顺序。</p><p><a href="../../reviews/">查看29品牌全部来源与缺口</a> · <a href="../../testing/">记录自己的真实测试</a></p></article></section>`;
}
function temporalHTML(E){
 const r=publicReviews.find(b=>b.id==='breezenet').records.find(r=>r.url==='https://jckevin.org/airport/reviews/weifeng-benchmark/');
 return `<article class="stable-case"><h2>补充：微风网络同日高峰时点记录</h2><p>以下是JCKevin作者网页的另一组记录，按来源声明展示。原文未明确每个时点对应节点和重复次数，不能与前文批量节点样本合并计算。</p><p>日期：${E(r.testDate)} · <a href="${E(r.url)}" target="_blank" rel="noopener noreferrer">JCKevin 原文 ↗</a></p><div class="table-wrap"><table><caption>来源自述，未独立核验</caption><thead><tr><th>时点与指标</th><th>报告值</th></tr></thead><tbody>${r.metrics.map(m=>`<tr><td>${E(m.metric)}</td><td>${E(m.value)} ${E(m.unit)}</td></tr>`).join('')}</tbody></table></div><p>${E(r.limitations)}</p></article>`;
}
