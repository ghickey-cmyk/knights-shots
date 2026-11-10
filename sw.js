// Knights Shot Tracker service worker: pages open with no wifi; updates arrive when online.
const CACHE='knights-shots-v5';
const ASSETS=['./','./index.html','./coach.html','./me.html','./manifest.json','./coach.json','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(a=>c.add(a).catch(()=>{})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  const fonts=url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';
  if(url.origin!==self.location.origin&&!fonts)return; // never cache Google Sheet traffic
  if(url.searchParams.has('fresh'))return;            // always-live requests
  if(req.mode==='navigate'){
    const key='./'+(url.pathname.split('/').pop()||'index.html');
    e.respondWith(fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(k=>k.put(key,c));return res;}).catch(()=>caches.match(key).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(CACHE).then(k=>k.put(req,c));}return res;})));
});
