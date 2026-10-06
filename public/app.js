(async()=>{
const api=async(p,o={})=>{const r=await fetch('/api/'+p,{credentials:'same-origin',headers:{'content-type':'application/json'},...o});if(!r.ok){const e=await r.json().catch(()=>({}));throw Object.assign(new Error(e.error||'Erro de conexão'),{status:r.status})}return r.json()};
const snap=new Map(),key=g=>JSON.stringify([g.s,g.r,g.rev]);
const mark=()=>{snap.clear();G.forEach(g=>snap.set(g.id,key(g)))};
let tm;
save=function(){clearTimeout(tm);tm=setTimeout(()=>G.forEach(g=>{if(snap.get(g.id)!==key(g)){snap.set(g.id,key(g));api('games/'+g.id,{method:'PUT',body:JSON.stringify({s:g.s,r:g.r,rev:g.rev})}).catch(()=>toast('Não foi possível salvar. Verifique a conexão.'))}}),500)};
const reload=async()=>{G=await api('games');mark()};
const st=document.createElement('style');
st.textContent=`.prog{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:0 0 14px}
.pt{display:flex;align-items:center;gap:10px;font-weight:500}
.pp{margin-left:auto;color:var(--mute);font-size:14px;white-space:nowrap}
.pb{height:8px;border-radius:4px;background:var(--line);margin-top:10px;overflow:hidden}
.pb i{display:block;height:100%;width:0;background:var(--acc);border-radius:4px;transition:width .35s ease}
.pb.ind i{width:35%;transition:none;animation:ind 1.2s ease-in-out infinite}
.spin{width:16px;height:16px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;display:inline-block;vertical-align:-3px;animation:sp .8s linear infinite;flex:none}
@keyframes sp{to{transform:rotate(360deg)}}
@keyframes ind{0%{margin-left:-35%}100%{margin-left:100%}}
@media (prefers-reduced-motion:reduce){.spin,.pb.ind i{animation-duration:2.4s}}`;
document.head.appendChild(st);
const prog=(msg,pct)=>{let el=document.querySelector('.prog');
  if(!el){el=document.createElement('div');el.className='prog';el.setAttribute('role','status');el.innerHTML='<div class="pt"><span class="spin"></span><span class="pm"></span><span class="pp"></span></div><div class="pb"><i></i></div>';document.querySelector('main').before(el)}
  el.querySelector('.pm').textContent=msg;const pb=el.querySelector('.pb'),pp=el.querySelector('.pp');
  if(pct==null){pb.classList.add('ind');pp.textContent=''}else{pb.classList.remove('ind');pb.querySelector('i').style.width=pct+'%';pp.textContent=pct+'%'}};
const unprog=()=>{const el=document.querySelector('.prog');if(el)el.remove()};
let enr=false;
const enrichAll=async()=>{
  if(enr)return;enr=true;let total=0;
  try{for(;;){
    const r=await api('enrich',{method:'POST'});
    if(!total)total=r.remaining+6;
    if(!r.remaining)break;
    total=Math.max(total,r.remaining);
    const done=total-r.remaining;
    prog('Buscando gêneros, plataformas e tempo para zerar: '+done+' de '+total,Math.round(done/total*100));
  }}finally{enr=false;unprog()}
  await reload();render();
};
const doSync=async b=>{
  b.disabled=true;b.innerHTML='<span class="spin"></span> Sincronizando...';
  prog('Importando sua biblioteca da Steam...',null);
  try{
    const r=await api('sync',{method:'POST'});
    await reload();render();
    toast(r.total+' jogos importados da Steam');
    await enrichAll();
    toast('Sincronização concluída');
  }catch(e){toast(e.message)}
  if(!enr)unprog();
  b.disabled=false;b.textContent='Sincronizar Steam';
};
document.addEventListener('click',e=>{const b=e.target.closest('#sync');if(b){e.stopImmediatePropagation();doSync(b)}},true);
if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
const sig=()=>G.filter(g=>g.r).map(g=>g.id+':'+g.r).join(',');
const aiHtml=p=>p.map(x=>{const g=G.find(y=>y.id===x.id);return g?`<button class="li" data-open="${g.id}">${cover({...g,r:0})}<span><strong>${esc(g.n)}</strong><small>${esc(x.reason)}</small></span></button>`:''}).join('');
const showAI=()=>{try{const c=JSON.parse(localStorage.getItem('estante-ai')||'null'),el=document.querySelector('#ai');if(c&&el&&c.sig===sig())el.innerHTML=aiHtml(c.picks)}catch(e){}};
const _render=render;render=function(){_render();if(V==='next')showAI()};
document.addEventListener('click',async e=>{const b=e.target.closest('#aibtn');if(!b)return;b.disabled=true;b.textContent='Pensando...';const el=document.querySelector('#ai');
try{const r=await api('recommend',{method:'POST'});try{localStorage.setItem('estante-ai',JSON.stringify({sig:sig(),picks:r.picks}))}catch(x){}el.innerHTML=aiHtml(r.picks)}catch(x){el.innerHTML='<div class="empty" style="padding:12px">'+esc(x.message)+'</div>'}
b.disabled=false;b.textContent='Pedir nova sugestão com IA'});
try{await api('me')}catch(e){
  document.querySelector('nav').hidden=true;document.querySelector('#sync').hidden=true;
  document.querySelector('#app').innerHTML=e.status===401?'<div class="hero" style="grid-template-columns:1fr"><div><h2>Entre com sua conta Steam</h2><p class="why">Sua biblioteca é importada automaticamente. O app só lê a lista de jogos pública e nunca vê sua senha.</p><a class="btn" href="/api/auth/steam" style="display:inline-block;text-decoration:none">Entrar com Steam</a></div></div>':'<div class="empty">Sem conexão com o servidor. Tente novamente em instantes.</div>';
  return}
await reload();
if(G.some(g=>g.p===null))enrichAll().catch(()=>{});
if(!G.length)doSync(document.querySelector('#sync'));else render();
})();
