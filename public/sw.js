const C='estante-v2';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['/','/app.js'])));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.pathname.startsWith('/api/'))return;
// Arquivos do próprio app sempre revalidam com o servidor, para o app instalado pegar a versão nova; o cache só serve offline
const req=u.origin===location.origin?fetch(u.href,{cache:'no-cache',credentials:'same-origin'}):fetch(e.request);
e.respondWith(req.then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request)))});
