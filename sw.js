// Mude este número a cada atualização para os usuários receberem o aviso
const VERSAO='v1.2';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSAO).then(c=>c.add('./index.html')).catch(()=>{}));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',e=>{if(e.data==='ativar')self.skipWaiting()});
// Rede primeiro; se estiver offline, usa a cópia guardada
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(
    fetch(r,{cache:'no-cache'}).then(res=>{
      if(res&&res.ok){const cp=res.clone();caches.open(VERSAO).then(c=>c.put(r,cp)).catch(()=>{})}
      return res;
    }).catch(()=>caches.match(r).then(x=>x||caches.match('./index.html')).then(x=>x||new Response('Sem ligação à internet',{status:503})))
  );
});
