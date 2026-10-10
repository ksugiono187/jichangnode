export function filterPlans(brands,{cycle='月付',period='month',budget,usage,margin=20,showUnresolved=false}){
 if(![budget,usage,margin].every(Number.isFinite)||budget<=0||usage<0||margin<0||margin>100)throw Error('请填写有效的预算、用量与余量。');
 const required=usage*(1+margin/100),matches=[];let excluded=0;
 for(const b of brands)for(const p of b.plans){
  if(p.cycle!==cycle||p.price>budget)continue;
  const disputed=b.planAttribution==='disputed'||['kosing','flyv'].includes(b.id)||p.researchConflict||p.capacityConflict||p.quotaPeriod==='unknown'||!Number.isFinite(p.gb);
  if(disputed){excluded++;if(showUnresolved)matches.push({brand:b,plan:p,unresolved:true,required});continue;}
  if(p.quotaPeriod===period&&p.gb>=required)matches.push({brand:b,plan:p,unresolved:false,required});
 }
 return{required,excluded,matches:matches.sort((a,b)=>Number(a.unresolved)-Number(b.unresolved)||a.plan.price-b.plan.price||a.brand.rank-b.brand.rank)};
}
