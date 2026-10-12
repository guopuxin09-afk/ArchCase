/* Only this app's same-origin shell is cached. No map tile or Notion requests. */
'use strict';
const CACHE='archcase-pwa-__REVISION__';
const ASSETS=__PRECACHE__;
const BASE=new URL('./',self.location.href);
const SHELL=new URL('index.html',BASE).href;
const URLS=new Set(ASSETS.map(file=>new URL(file,BASE).href));
async function prepareCache(){
  const cache=await caches.open(CACHE);
  try{
    for(let i=0;i<ASSETS.length;i+=6)await Promise.all(ASSETS.slice(i,i+6).map(async file=>{
      const request=new Request(new URL(file,BASE),{cache:'reload',credentials:'same-origin'});
      if(await cache.match(request))return;
      const response=await fetch(request);
      if(!response.ok||response.redirected)throw Error('Unable to cache '+file);
      if(file==='index.html'&&!(await response.clone().text()).includes('ARCHCASE_PWA_SHELL'))throw Error('App shell not available');
      await cache.put(request,response);
    }));
  }catch(error){await caches.delete(CACHE);throw error;}
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
  await prepareCache();
  if(!self.registration.active)await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const name of await caches.keys())if(name.startsWith('archcase-pwa-')&&name!==CACHE)await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
  if(event.data?.type==='ENSURE_CACHE')event.waitUntil(prepareCache().then(()=>event.ports[0]?.postMessage({ready:true})).catch(()=>event.ports[0]?.postMessage({ready:false})));
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==BASE.origin)return;
  // Do not intercept authentication, non-app documents or external services.
  const navigation=request.mode==='navigate'&&(url.pathname===BASE.pathname||url.pathname===new URL('index.html',BASE).pathname);
  const key=navigation?SHELL:new URL(url.pathname,BASE.origin).href;
  if(!navigation&&!URLS.has(key))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE),cached=await cache.match(key);
    if(cached)return cached;
    return fetch(request);
  })());
});
