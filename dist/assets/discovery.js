const normalize=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
export function searchEntries(data){return [
 ...data.brands.map(b=>({title:b.name,description:b.summary||'价格、流量、公开来源与资料冲突。',path:`brands/${b.id}/`,type:'品牌',keywords:[b.id,...b.plans.map(p=>p.name)].join(' ')})),
 ...data.articles.map(a=>({...a,type:'文章',keywords:a.keywords||''})),
 ...data.topics.map(t=>({title:t.name,description:t.desc,path:t.path,type:'专题',keywords:t.id})),
 ...[['plans','套餐筛选与全部价目','按付款预算、流量周期和需求找参考档位。'],['compare','品牌套餐对比','将三个品牌的价格、额度和资料状态并排比较。'],['reviews','公开测评资料','查看测试环境、原始来源和数据限制。'],['testing','测评记录工具','记录自己的观测并导出，未经本站复测。'],['corrections','资料纠错与编辑联系','生成有公开证据的更正草稿。'],['faq','常见问题','理解年付、流量周期、优惠码和榜单口径。']].map(([id,title,description])=>({title,description,path:`${id}/`,type:'工具',keywords:id}))
 ];}
export function searchSite(entries,query,type='all'){
 const words=normalize(query).split(' ').filter(Boolean);if(!words.length)return [];
 return entries.filter(x=>type==='all'||x.type===type).map(x=>{const title=normalize(x.title),text=normalize(`${x.title} ${x.description} ${x.keywords}`);return {...x,score:words.every(w=>text.includes(w))?words.reduce((n,w)=>n+(title===w?20:title.includes(w)?5:1),0):-1};}).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'zh-CN'));
}
