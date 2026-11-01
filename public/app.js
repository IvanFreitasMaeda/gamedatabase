(async()=>{
const api=async(p,o={})=>{const r=await fetch('/api/'+p,{credentials:'same-origin',headers:{'content-type':'application/json'},...o});if(!r.ok){const e=await r.json().catch(()=>({}));throw Object.assign(new Error(e.error||'Erro de conexão'),{status:r.status,retry:e.retry})}return r.json()};
const snap=new Map(),key=g=>JSON.stringify([g.s,g.r,g.rev,!!g.fav]);
const mark=()=>{snap.clear();G.forEach(g=>snap.set(g.id,key(g)))};
let tm;
save=function(){clearTimeout(tm);tm=setTimeout(()=>G.forEach(g=>{if(snap.get(g.id)!==key(g)){snap.set(g.id,key(g));api('games/'+g.id,{method:'PUT',body:JSON.stringify({s:g.s,r:g.r,rev:g.rev,fav:g.fav?1:0})}).catch(()=>toast('Não foi possível salvar. Verifique a conexão.'))}}),500)};
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
try{const r=await api('recommend',{method:'POST'});try{localStorage.setItem('estante-ai',JSON.stringify({sig:sig(),picks:r.picks}))}catch(x){}el.innerHTML=aiHtml(r.picks)}catch(x){el.innerHTML='<div class="empty" style="padding:12px">'+esc(x.message)+'</div>';if(x.retry){let s=Math.min(x.retry,60);const t=setInterval(()=>{s--;if(s<=0){clearInterval(t);b.disabled=false;b.textContent='Pedir nova sugestão com IA'}else b.textContent='Aguarde '+s+' s'},1000);b.textContent='Aguarde '+s+' s';return}}
b.disabled=false;b.textContent='Pedir nova sugestão com IA'});
// ---- Amigos e comparação de perfis ----
let ME=null,P=null,PR=null,ALL=false;
const QU=(new URLSearchParams(location.search).get('u')||'').match(/^\d{17}$/)?new URLSearchParams(location.search).get('u'):null;
const st2=document.createElement('style');
st2.textContent=`.av{width:44px;height:44px;border-radius:50%;flex:none;object-fit:cover;background:var(--line);display:grid;place-items:center;font-weight:700;color:var(--mute)}
.cp{margin-left:auto;font:700 18px 'Bricolage Grotesque',sans-serif;color:var(--brand);white-space:nowrap}
.box{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:0 0 14px}
.vs{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;text-align:center;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px}
.vs .av{width:64px;height:64px;margin:0 auto 6px;font-size:24px}
.vs strong{display:block;overflow-wrap:anywhere}
.big{font:700 44px/1 'Bricolage Grotesque',sans-serif;color:var(--brand)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.tb{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:14px}
.tb td,.tb th{padding:8px 12px;border-top:1px solid var(--line);text-align:left}
.tb td+td,.tb th+th{text-align:right}
@media (max-width:560px){.two{grid-template-columns:1fr}.big{font-size:36px}}`;
document.head.appendChild(st2);
const av=(url,n)=>url&&/^https:\/\//.test(url)?`<img class="av" src="${esc(url)}" alt="">`:`<span class="av">${esc((n||'?')[0])}</span>`;
const nota=x=>x==null?'-':x.toFixed(1).replace('.',',');
const setU=id=>{try{history.replaceState(null,'',id?'?u='+id:location.pathname)}catch(e){}};
const back=()=>ME?'<button class="btn sec" id="fback" style="margin-bottom:12px">← Amigos</button>':'';
const loginBtn=(id,t)=>`<div class="acts" style="justify-content:center;margin-top:16px"><a class="btn" href="/api/auth/steam" data-login="${id}" style="text-decoration:none">${esc(t)}</a></div>`;
const bars=gs=>gs.map(x=>`<div class="bar"><span>${esc(x.g)}</span><i style="width:${x.avg*10}%"></i><em>${nota(x.avg)}</em></div>`).join('')||'<div class="empty" style="padding:12px">Poucas notas ainda.</div>';
const gli=(g,sub,end='')=>`<div class="li">${cover({n:g.n,a:g.a,r:0})}<span><strong>${esc(g.n)}</strong><small>${sub}</small></span>${end}</div>`;
async function share(){
  const url=location.origin+'/?u='+ME.steamid;
  try{if(navigator.share){await navigator.share({title:'My Game List',text:'Compare seu perfil de jogos com o meu no My Game List',url});return}}catch(e){if(e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(url);toast('Link copiado')}catch(e){prompt('Copie o link do seu perfil:',url)}
}
const VL={public:['Público','Qualquer pessoa com o link pode ver suas notas e estatísticas.'],friends:['Só amigos','Só seus amigos da Steam que usam o app podem ver suas notas e estatísticas.'],private:['Privado','Ninguém além de você vê seu perfil.']};
const _rs=renderStats;renderStats=function(){_rs();if(!ME)return;const v=ME.vis||'friends';
  $('#app').insertAdjacentHTML('afterbegin',`<section class="box"><span class="fl">Quem pode ver seu perfil</span><div class="row" role="group" aria-label="Visibilidade do perfil">${Object.entries(VL).map(([k,x])=>`<button class="chip" data-vis="${k}" aria-pressed="${v===k}">${x[0]}</button>`).join('')}</div><small style="color:var(--mute)">${VL[v][1]} Suas resenhas nunca aparecem para outras pessoas.</small><div class="acts" style="margin-top:10px"><button class="btn sec" data-share="1">Compartilhar meu perfil</button></div></section>`)};
renderFriends=function(){if(P)return showProfile(P);loadFriends(false)};
async function loadFriends(force){
  const el=$('#app');el.innerHTML='<div class="empty"><span class="spin"></span> Buscando seus amigos da Steam...</div>';
  let r;try{r=await api('friends'+(force?'?refresh=1':''))}catch(e){el.innerHTML=`<div class="empty">${esc(e.message)}</div>`;return}
  if(V!=='friends'||P)return;
  const L=r.friends.sort((a,b)=>((b.compat&&b.compat.pct)??-1)-((a.compat&&a.compat.pct)??-1));
  const sub=f=>f.priv?'Perfil privado':f.compat&&f.compat.common?f.compat.common+(f.compat.common>1?' jogos em comum':' jogo em comum'):'Nenhum jogo em comum jogado ainda';
  el.innerHTML=`<section class="box"><strong>Convide seus amigos</strong><p class="why" style="margin:4px 0 10px">Mande seu link. Quando seus amigos da Steam entrarem no app, eles aparecem aqui e vocês podem comparar os perfis.</p><div class="acts"><button class="btn" data-share="1">Compartilhar meu link</button><button class="btn sec" id="frefresh">Atualizar lista</button></div></section>
  ${r.private?'<div class="box">Sua lista de amigos na Steam está privada, então só aparecem aqui os amigos que já encontraram você. Para ver todos, deixe a "Lista de amigos" como Pública na privacidade do perfil da Steam.</div>':''}
  <h3>Amigos no My Game List</h3>
  ${L.map(f=>`<button class="li" data-prof="${f.id}">${av(f.avatar,f.name)}<span><strong>${esc(f.name)}</strong><small>${sub(f)}</small></span>${f.compat&&f.compat.pct!=null?`<span class="cp" aria-label="Compatibilidade">${f.compat.pct}%</span>`:''}</button>`).join('')||'<div class="empty" style="padding:20px">Nenhum amigo da Steam usa o My Game List ainda. Compartilhe seu link para chamar a galera.</div>'}
  ${r.total>L.length?`<p style="color:var(--mute)">${r.total-L.length} ${r.total-L.length>1?'amigos da Steam ainda não usam':'amigo da Steam ainda não usa'} o app.</p>`:''}`;
}
async function showProfile(id){
  const el=$('#app');el.innerHTML='<div class="empty"><span class="spin"></span> Carregando perfil...</div>';
  let r;try{r=await api('u/'+id)}catch(e){if(ME&&(V!=='friends'||P!==id))return;el.innerHTML=`${back()}<div class="empty">${esc(e.message)}</div>${!ME?loginBtn(id,'Entrar com Steam'):''}`;return}
  if(ME&&(V!=='friends'||P!==id))return;
  PR=r;ALL=false;drawProfile();
}
function drawProfile(){
  const r=PR,s=r.summary,nm=esc(r.name);
  if(!r.compat){
    $('#app').innerHTML=`${back()}<div class="vs" style="grid-template-columns:auto 1fr;text-align:left">${av(r.avatar,r.name)}<div><h2 style="font-size:24px">${nm}</h2><small style="color:var(--mute)">${s.total} jogos · ${fh(s.hours)} h jogadas · nota média ${nota(s.avg)}</small></div></div>
    <h3>Mais bem avaliados</h3>${s.top.map(g=>gli(g,'Nota '+g.r+(g.h?' · '+fh(g.h)+' h':''))).join('')||'<div class="empty" style="padding:12px">Nenhum jogo avaliado ainda.</div>'}
    <h3>Gêneros favoritos</h3>${bars(s.genres)}
    ${!ME?loginBtn(r.id,'Entrar com Steam para comparar com '+r.name):''}`;
    return;
  }
  const c=r.compat,m=r.me,both=r.common.filter(x=>x.r1&&x.r2),df=x=>Math.abs(x.r1-x.r2);
  const agree=both.filter(x=>df(x)<=1).sort((a,b)=>df(a)-df(b)||(b.r1+b.r2)-(a.r1+a.r2)).slice(0,5);
  const dis=both.filter(x=>df(x)>=3).sort((a,b)=>df(b)-df(a)).slice(0,5);
  const hrs=x=>[x.h1?'Você: '+fh(x.h1)+' h':'',x.h2?nm+': '+fh(x.h2)+' h':''].filter(Boolean).join(' · ')||'Nenhum dos dois jogou ainda';
  const row=x=>gli(x,hrs(x),`<span class="cp" style="font-size:15px" aria-label="Sua nota e a nota de ${nm}">${x.r1||'–'} × ${x.r2||'–'}</span>`);
  const why=c.pct==null?'Joguem e avaliem mais jogos para calcular a compatibilidade.':[c.notes!=null?`Notas: ${c.notes}% (${c.rated} jogos avaliados pelos dois)`:'Avaliem pelo menos 3 jogos em comum para comparar as notas',c.genres!=null?`Gêneros jogados: ${c.genres}%`:''].filter(Boolean).join(' · ');
  const list=ALL?r.common:r.common.slice(0,30);
  $('#app').innerHTML=`${back()}<div class="vs"><div>${av(m.avatar,m.name)}<strong>Você</strong></div><div><div class="big">${c.pct==null?'?':c.pct+'%'}</div><small style="color:var(--mute)">compatíveis</small></div><div>${av(r.avatar,r.name)}<strong>${nm}</strong></div></div>
  <p style="color:var(--mute);text-align:center;font-size:14px">${esc(why)}</p>
  <div class="stats"><div class="stat"><b>${c.common}</b><span>jogos em comum</span></div><div class="stat"><b>${c.rated}</b><span>avaliados pelos dois</span></div><div class="stat"><b style="font-size:22px">${nota(m.summary.avg)} × ${nota(s.avg)}</b><span>nota média</span></div></div>
  ${agree.length?`<h3>Onde vocês concordam</h3>${agree.map(row).join('')}`:''}
  ${dis.length?`<h3>Onde vocês discordam</h3>${dis.map(row).join('')}`:''}
  <h3>Jogos em comum <small style="font:400 14px Figtree,sans-serif;color:var(--mute)">nota sua × de ${nm}</small></h3>
  ${list.map(row).join('')||'<div class="empty" style="padding:12px">Vocês ainda não têm jogos em comum que algum dos dois jogou.</div>'}
  ${!ALL&&r.common.length>list.length?`<div class="acts"><button class="btn sec" id="callall">Mostrar todos (${r.common.length})</button></div>`:''}
  <h3>Gêneros favoritos</h3><div class="two"><div><span class="fl">Você</span>${bars(m.summary.genres)}</div><div><span class="fl">${nm}</span>${bars(s.genres)}</div></div>
  <h3>Status da biblioteca</h3><table class="tb"><tr><th></th><th>Você</th><th>${nm}</th></tr>${Object.keys(ST).map(k=>`<tr><td>${ST[k]}</td><td>${m.summary.sts[k]||0}</td><td>${s.sts[k]||0}</td></tr>`).join('')}<tr><td>Horas jogadas</td><td>${fh(m.summary.hours)}</td><td>${fh(s.hours)}</td></tr></table>`;
}
document.addEventListener('click',e=>{if(e.target.closest('nav [data-v]')){P=null;setU(null)}},true);
document.addEventListener('click',async e=>{
  const t=e.target.closest('[data-prof],[data-vis],[data-share],[data-login],#fback,#frefresh,#callall');if(!t)return;
  if(t.dataset.login){try{sessionStorage.setItem('mgl-u',t.dataset.login)}catch(x){}return}
  if(t.dataset.prof){P=t.dataset.prof;setU(P);window.scrollTo(0,0);return showProfile(P)}
  if(t.id==='fback'){P=null;setU(null);return loadFriends(false)}
  if(t.id==='frefresh')return loadFriends(true);
  if(t.id==='callall'){ALL=true;return drawProfile()}
  if(t.dataset.share)return share();
  if(t.dataset.vis){try{ME=await api('me',{method:'PUT',body:JSON.stringify({vis:t.dataset.vis})});toast('Visibilidade do perfil atualizada')}catch(x){toast(x.message)}if(V==='stats')renderStats()}
});
try{ME=await api('me')}catch(e){
  document.querySelector('nav').hidden=true;document.querySelector('#sync').hidden=true;
  if(e.status===401&&QU)return showProfile(QU);
  document.querySelector('#app').innerHTML=e.status===401?'<div class="hero" style="grid-template-columns:1fr"><div><h2>Entre com sua conta Steam</h2><p class="why">Sua biblioteca é importada automaticamente. O app só lê a lista de jogos pública e nunca vê sua senha.</p><a class="btn" href="/api/auth/steam" style="display:inline-block;text-decoration:none">Entrar com Steam</a></div></div>':'<div class="empty">Sem conexão com o servidor. Tente novamente em instantes.</div>';
  return}
let pend=QU;try{pend=pend||sessionStorage.getItem('mgl-u');sessionStorage.removeItem('mgl-u')}catch(e){}
if(pend&&pend!==ME.steamid){V='friends';P=pend;setU(P)}else if(pend)setU(null);
await reload();
if(G.some(g=>g.p===null||(g.g.length===1&&g.g[0]==='Sem gênero')))enrichAll().catch(()=>{});
if(!G.length)doSync(document.querySelector('#sync'));else render();
})();
