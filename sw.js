const V="ponto-certo-v4";
const CORE=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET")return;
  const u=new URL(r.url);
  const net=()=>fetch(r).then(res=>{
    if(res.ok||res.type==="opaque"){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));}
    return res;
  });
  if(u.origin===location.origin){
    // arquivos do próprio app: rede primeiro (atualizações chegam sempre), cache se estiver offline
    e.respondWith(net().catch(()=>caches.match(r).then(m=>m||caches.match("./index.html"))));
  }else{
    // bibliotecas e fontes externas: cache primeiro (o app abre mesmo offline depois do 1º uso)
    e.respondWith(caches.match(r).then(m=>m||net()));
  }
});
