(() => {
  'use strict';
  const root=document.documentElement;
  const $=id=>document.getElementById(id);
  const standalone=()=>!!navigator.standalone||matchMedia('(display-mode: standalone)').matches;
  root.dataset.pwaStandalone=String(standalone());
  let frame=0;
  const resize=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const v=window.visualViewport;if(!v||Math.abs(v.scale-1)<.01)root.style.setProperty('--pwa-height',(v?v.height:innerHeight)+'px');});};
  resize();window.addEventListener('resize',resize,{passive:true});window.visualViewport?.addEventListener('resize',resize,{passive:true});window.addEventListener('pageshow',resize);
  const words={zh:{install:'安装',update:'更新',title:'添加到 iPhone 主屏幕',intro:'用 Safari 打开地图后：',steps:['点击 Safari 的「分享」按钮。','选择「添加到主屏幕」。','如有「作为网页 App 打开」，保持开启，再点击「添加」。'],close:'关闭安装说明',confirm:'知道了',preparing:'正在准备离线内容…',ready:'离线内容已准备好',failed:'离线内容尚未准备好，请联网刷新重试。',unsupported:'当前浏览器无法启用离线缓存，请使用 Safari 的 HTTPS 网页。',note:'首次联网打开并完成缓存后，可离线搜索案例、查看世界概览。街道底图、GitHub 案例笔记、原 Notion 笔记和周边地图需要联网。',offline:'离线',pending:'有可用更新'},en:{install:'Install',update:'Update',title:'Add ArchCase to your Home Screen',intro:'Open the map in Safari:',steps:['Tap the Share button in Safari.','Choose Add to Home Screen.','Keep Open as Web App enabled, if shown, then tap Add.'],close:'Close installation guide',confirm:'Got it',preparing:'Preparing offline content…',ready:'Offline content is ready',failed:'Offline content is not ready. Reconnect and reload to retry.',unsupported:'Offline caching is unavailable. Open this HTTPS page in Safari.',note:'After the first online visit and completed download, search cases and browse the world overview offline. Street maps, GitHub case notes, original Notion notes and nearby maps require a connection.',offline:'Offline',pending:'Update available'}};
  let cacheState='preparing',registration=null,waiting=null,updating=false,prompt=null;
  function render(){
    const w=words[root.lang.startsWith('en')?'en':'zh'];
    $('pwa-install').textContent=w.install;$('pwa-update').textContent=w.update;
    $('pwa-dialog-title').textContent=w.title;$('pwa-dialog-intro').textContent=w.intro;
    $('pwa-steps').replaceChildren(...w.steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
    $('pwa-dialog-close').setAttribute('aria-label',w.close);$('pwa-confirm').textContent=w.confirm;
    $('pwa-cache-info').textContent=w[cacheState];$('pwa-dialog-note').textContent=w.note;
    $('pwa-state').hidden=navigator.onLine&&!waiting;$('pwa-state').textContent=!navigator.onLine?w.offline:w.pending;
    $('pwa-update').hidden=!waiting;
  }
  new MutationObserver(render).observe(root,{attributes:true,attributeFilter:['lang']});
  window.addEventListener('online',render);window.addEventListener('offline',render);
  matchMedia('(display-mode: standalone)').addEventListener('change',()=>{root.dataset.pwaStandalone=String(standalone());});
  function close(){ $('pwa-dialog').close();$('pwa-install').focus({preventScroll:true}); }
  $('pwa-install').addEventListener('click',async()=>{if(prompt){await prompt.prompt();await prompt.userChoice;prompt=null;return;}$('pwa-dialog').showModal();});
  $('pwa-dialog-close').addEventListener('click',close);$('pwa-confirm').addEventListener('click',close);
  $('pwa-dialog').addEventListener('click',event=>{if(event.target===$('pwa-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;});
  window.addEventListener('appinstalled',()=>{prompt=null;root.dataset.pwaStandalone='true';});
  function showWaiting(worker){waiting=worker;render();}
  $('pwa-update').addEventListener('click',()=>{if(waiting){updating=true;waiting.postMessage({type:'SKIP_WAITING'});$('pwa-update').disabled=true;}});
  if('serviceWorker' in navigator&&isSecureContext){
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(updating)location.reload();});
    window.addEventListener('load',async()=>{
      try{
        registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
        if(registration.waiting)showWaiting(registration.waiting);
        registration.addEventListener('updatefound',()=>{const worker=registration.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'){if(navigator.serviceWorker.controller)showWaiting(worker);cacheState='ready';render();}else if(worker.state==='redundant'&&cacheState==='preparing'){cacheState='failed';render();}});});
        const ready=await navigator.serviceWorker.ready;
        const cached=await new Promise(resolve=>{const channel=new MessageChannel();const timer=setTimeout(()=>resolve(false),40000);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(!!event.data.ready);};ready.active.postMessage({type:'ENSURE_CACHE'},[channel.port2]);});
        cacheState=cached?'ready':'failed';render();
        navigator.storage?.persist?.().catch(()=>{});
      }catch(error){console.warn('ArchCase offline setup:',error.message);cacheState='failed';render();}
    });
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&navigator.onLine)registration?.update().catch(()=>{});});
  }else cacheState='unsupported';
  render();
})();
