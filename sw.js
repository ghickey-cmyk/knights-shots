// Knights Shot Tracker service worker: the app opens with no wifi; page updates arrive when online.
const CACHE='knights-shots-v3';
const ASSETS=['./','./index.html','./manifest.json','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  const fonts=url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';
  if(url.origin!==self.location.origin&&!fonts)return; // never cache Google Sheet traffic
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(k=>k.put('./index.html',c));return res;}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(CACHE).then(k=>k.put(req,c));}return res;})));
});
