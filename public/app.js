(async()=>{
const api=async(p,o={})=>{const r=await fetch('/api/'+p,{credentials:'same-origin',headers:{'content-type':'application/json'},...o});if(!r.ok){const e=await r.json().catch(()=>({}));throw Object.assign(new Error(e.error||'Erro de conexão'),{status:r.status})}return r.json()};
const snap=new Map(),key=g=>JSON.stringify([g.s,g.r,g.rev]);
const mark=()=>{snap.clear();G.forEach(g=>snap.set(g.id,key(g)))};
let tm;
save=function(){clearTimeout(tm);tm=setTimeout(()=>G.forEach(g=>{if(snap.get(g.id)!==key(g)){snap.set(g.id,key(g));api('games/'+g.id,{method:'PUT',body:JSON.stringify({s:g.s,r:g.r,rev:g.rev})}).catch(()=>toast('Não foi possível salvar. Verifique a conexão.'))}}),500)};
const reload=async()=>{G=await api('games');mark()};
const enrichAll=async()=>{for(;;){const r=await api('enrich',{method:'POST'});if(!r.remaining)break;toast('Buscando gêneros e tempo para zerar. Faltam '+r.remaining+' jogos.')}await reload();render()};
const doSync=async b=>{b.disabled=true;b.textContent='Sincronizando...';try{const r=await api('sync',{method:'POST'});await reload();render();toast(r.total+' jogos importados da Steam');await enrichAll()}catch(e){toast(e.message)}b.disabled=false;b.textContent='Sincronizar Steam'};
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
if(!G.length)doSync(document.querySelector('#sync'));else render();
})();
