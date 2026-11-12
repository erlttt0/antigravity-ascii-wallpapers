/* Antigravity animated themes. All artwork and preferences stay on this device. */
(() => {
  'use strict';
  if (window.self !== window.top) return;
  if (window.__agyAsciiInstalled) return;
  window.__agyAsciiInstalled = true;
  const KEY='asciiWallpaperPreferences.v1';
  const themes=[
    {id:'clouds',name:'Cloud Drift',light:true,sky:'#b4d9ee',floor:'#cceaf8',beam:'#62b9f1',chrome:'#b7e1f3',panel:'#f1faff',card:'#f0faff',fg:'#203645',muted:'#476475',border:'#9bbdce',accent:'#367ca6',ink:'#fffef7',glyph:'#648798'},
    {id:'aurora',name:'Aurora',light:false,sky:'#061220',floor:'#0d2233',beam:'#1f6b62',chrome:'#0a1724',panel:'#0b1826',card:'#16283a',fg:'#e9f4f2',muted:'#a9c4c4',border:'#35506a',accent:'#7cf2b4',ink:'#7cf2b4',glyph:'#10202e'},
    {id:'lagoon',name:'Honu Lagoon',light:false,sky:'#286f70',floor:'#084d63',beam:'#45e0d9',chrome:'#1d6666',panel:'#103c45',card:'#225560',fg:'#effaf6',muted:'#bfdfdb',border:'#49868a',accent:'#a2e2c2',ink:'#e3dcaa',glyph:'#375957'},
    {id:'koi',name:'Koi Pond',light:false,sky:'#315c4f',floor:'#1c493e',beam:'#8ce2bd',chrome:'#2d584b',panel:'#193d34',card:'#315b4e',fg:'#f0f7e9',muted:'#c2d8c3',border:'#638c71',accent:'#dfc890',ink:'#ead0a1',glyph:'#475e39'},
    {id:'jelly',name:'Jellyfish',light:false,sky:'#0c2e3e',floor:'#07111f',beam:'#286db0',chrome:'#0b2c3e',panel:'#0b1520',card:'#172b39',fg:'#edf1f7',muted:'#b6c6d6',border:'#42566e',accent:'#e8a7d0',ink:'#bca5d2',glyph:'#2d3148'},
    {id:'boats',name:'Paper Boats',light:true,sky:'#badbd5',floor:'#d4e8df',beam:'#7ebdc1',chrome:'#c4dfd8',panel:'#f2faf5',card:'#f0f8f3',fg:'#263f3b',muted:'#49665e',border:'#a0bdb2',accent:'#3e7a71',ink:'#fffef2',glyph:'#69887c'},
    {id:'sakura',name:'Sakura',light:true,sky:'#f6dfe7',floor:'#fbeef2',beam:'#f3b8cc',chrome:'#f4dbe4',panel:'#fff7fa',card:'#fff4f7',fg:'#4a2d38',muted:'#7a5866',border:'#e2b8c7',accent:'#c2557d',ink:'#ffffff',glyph:'#a1576f'},
    {id:'fireflies',name:'Fireflies',light:false,sky:'#071a17',floor:'#102b21',beam:'#1b493a',chrome:'#0a1c17',panel:'#0b1b15',card:'#172c22',fg:'#f0f2df',muted:'#b9c8ad',border:'#425e48',accent:'#d5e59d',ink:'#d6df9c',glyph:'#374c2c'},
    {id:'moon',name:'Moonlit',light:false,sky:'#090c1a',floor:'#1e2c60',beam:'#263f91',chrome:'#101528',panel:'#0d1224',card:'#1e263c',fg:'#edf0fa',muted:'#bdc6df',border:'#465375',accent:'#ddd8ad',ink:'#8b9bc8',glyph:'#212943'},
    {id:'dunes',name:'Ember Dunes',light:false,sky:'#2b1534',floor:'#8a4a32',beam:'#c86a3e',chrome:'#231228',panel:'#1f1024',card:'#352032',fg:'#fbeadb',muted:'#d8b8a4',border:'#6a4352',accent:'#ffb46b',ink:'#ffd9a8',glyph:'#3a1f22'},
    {id:'rain',name:'Night Rain',light:false,sky:'#0a1120',floor:'#141d31',beam:'#24365a',chrome:'#0c1322',panel:'#0d1424',card:'#1a2438',fg:'#e8eef8',muted:'#aebbd2',border:'#3a4a68',accent:'#ffd27a',ink:'#8fb4e6',glyph:'#0d1526'},
    {id:'snow',name:'Snowfall',light:true,sky:'#c7d9e8',floor:'#eef4f9',beam:'#ffffff',chrome:'#d6e4ef',panel:'#f6fafd',card:'#f3f8fc',fg:'#1f3242',muted:'#4b6275',border:'#a9bfd0',accent:'#3a6f96',ink:'#ffffff',glyph:'#5e7d94'},
    {id:'lanterns',name:'Sky Lanterns',light:false,sky:'#0b1030',floor:'#141a40',beam:'#3a3470',chrome:'#0c1028',panel:'#0d1230',card:'#1b2146',fg:'#f4eee4',muted:'#c2bccf',border:'#3d4170',accent:'#ffb35c',ink:'#ffcf8a',glyph:'#1c1a3a'},
    {id:'meadow',name:'Windy Meadow',light:true,sky:'#cfe9f3',floor:'#dcefd0',beam:'#9fd38a',chrome:'#d4ebde',panel:'#f6fbf2',card:'#f3f9ee',fg:'#213a24',muted:'#4b6a4c',border:'#a9c9a0',accent:'#3f7f3a',ink:'#ffffff',glyph:'#5e8a52'},
    {id:'galaxy',name:'Spiral Galaxy',light:false,sky:'#06051a',floor:'#0e0a26',beam:'#3a2a7a',chrome:'#09071c',panel:'#0a081e',card:'#181436',fg:'#eeeaff',muted:'#b8b0d8',border:'#3c3570',accent:'#b9a3ff',ink:'#cbbcff',glyph:'#141030'},
    {id:'bamboo',name:'Bamboo Grove',light:true,sky:'#dcebdc',floor:'#e8f1e0',beam:'#b5d6a5',chrome:'#dbe9d6',panel:'#f6faf2',card:'#f2f8ee',fg:'#1f3520',muted:'#4d6a4a',border:'#a7c4a0',accent:'#3e7a36',ink:'#f4fbef',glyph:'#5f8754'},
    {id:'code',name:'Digital Rain',light:false,sky:'#020b06',floor:'#04140b',beam:'#0f5a2a',chrome:'#030d07',panel:'#04110a',card:'#0c2214',fg:'#d9ffe4',muted:'#8fc9a2',border:'#1f5a34',accent:'#5dff8a',ink:'#5dff8a',glyph:'#062a12'},
    {id:'tide',name:'Morning Tide',light:true,sky:'#fbe2d0',floor:'#cfe6ea',beam:'#ffd2b0',chrome:'#f5e0d4',panel:'#fffaf6',card:'#fdf6f0',fg:'#2a3440',muted:'#5a6670',border:'#d9c3b5',accent:'#2f7f95',ink:'#ffffff',glyph:'#7a8f99'},
    {id:'autumn',name:'Autumn Leaves',light:true,sky:'#f6e3c8',floor:'#efd3b0',beam:'#f0b070',chrome:'#f2dcc0',panel:'#fff8ef',card:'#fdf3e6',fg:'#3a2416',muted:'#6e5040',border:'#ddb994',accent:'#c0502a',ink:'#fff6e8',glyph:'#9a6040'},
    {id:'alpine',name:'Alpine Dawn',light:true,sky:'#d6cfee',floor:'#f8e2d4',beam:'#f3c9c6',chrome:'#e2d9f0',panel:'#fbf8ff',card:'#f7f3fd',fg:'#2a2545',muted:'#5a5478',border:'#c4b9de',accent:'#6a5aa8',ink:'#ffffff',glyph:'#8a80b4'},
    {id:'retro',name:'Retro Sunset',light:false,sky:'#0d0221',floor:'#1a0630',beam:'#7a1f8a',chrome:'#10032a',panel:'#10042a',card:'#22104a',fg:'#fbeaff',muted:'#d0b4e0',border:'#5a2a7a',accent:'#ff5ad8',ink:'#ff7ad8',glyph:'#2a0a3a'},
    {id:'lava',name:'Lava Lamp',light:false,sky:'#1a0726',floor:'#3a0d22',beam:'#8a2a3a',chrome:'#16061e',panel:'#170620',card:'#2c1230',fg:'#ffeede',muted:'#d8b4b4',border:'#5e2a44',accent:'#ff9a3c',ink:'#ffb070',glyph:'#2a0a18'},
    {id:'catnap',name:'Starry Catnap',light:false,sky:'#070a24',floor:'#1a1a50',beam:'#4b3fb0',chrome:'#0a0c28',panel:'#0b0e2a',card:'#1b1e44',fg:'#f1eeff',muted:'#bfbcdc',border:'#3f4078',accent:'#f0a95e',ink:'#ffc88a',glyph:'#1b1f4a'},
{id:'supercell',name:'Supercell',light:false,sky:'#262a18',floor:'#3a3820',beam:'#8a8a4a',chrome:'#22261a',panel:'#262a1c',card:'#363a26',fg:'#f6f4dc',muted:'#c8c6a0',border:'#5a5e3a',accent:'#ecd070',ink:'#f4f0b0',glyph:'#383c22'},
    {id:'vents',name:'Black Smokers',light:false,sky:'#040303',floor:'#140a08',beam:'#6a2a14',chrome:'#080505',panel:'#0a0706',card:'#1a1412',fg:'#fff2e6',muted:'#c8b4a8',border:'#3a2a24',accent:'#ff8a3a',ink:'#ffb040',glyph:'#1e1614'},
    {id:'candles',name:'Candlelight',light:false,sky:'#120804',floor:'#2e1a0c',beam:'#6a4018',chrome:'#140a05',panel:'#170c06',card:'#2a1a0e',fg:'#fff4e0',muted:'#d4bc98',border:'#4e3418',accent:'#ffc878',ink:'#ffd474',glyph:'#2a1a0e'},
    {id:'neon',name:'Neon Alley',light:false,sky:'#05030c',floor:'#120a20',beam:'#6a2aa0',chrome:'#08050f',panel:'#0a0614',card:'#1a1230',fg:'#f6eeff',muted:'#c4b4e0',border:'#44306e',accent:'#ff3fbf',ink:'#3ff0ff',glyph:'#150d24'},
    {id:'blackhole',name:'Black Hole',light:false,sky:'#04020a',floor:'#0a0614',beam:'#5a2a4a',chrome:'#06040c',panel:'#080610',card:'#18121e',fg:'#fff4e8',muted:'#cdb8b0',border:'#3e2a3a',accent:'#ffc46a',ink:'#ffc46a',glyph:'#120a12'},
    {id:'volcano',name:'Volcano',light:false,sky:'#0c0610',floor:'#2a0e10',beam:'#8a2a1a',chrome:'#100810',panel:'#120a12',card:'#261418',fg:'#ffeee2',muted:'#d4b4a8',border:'#5a2e2a',accent:'#ffa040',ink:'#ffa040',glyph:'#1e0e10'},
    {id:'starry',name:'Swirling Night',light:false,sky:'#10245e',floor:'#0c1838',beam:'#24458e',chrome:'#0e1e4a',panel:'#10204e',card:'#1c3266',fg:'#f6f4e0',muted:'#bccae8',border:'#3a5aa0',accent:'#ffd84a',ink:'#ffd84a',glyph:'#24458e'},
    {id:'radar',name:'Radar Scope',light:false,sky:'#0c0702',floor:'#160c03',beam:'#6a4612',chrome:'#0e0803',panel:'#110a04',card:'#22160a',fg:'#fff2c4',muted:'#d4b880',border:'#4a3210',accent:'#ffc24a',ink:'#ffc24a',glyph:'#2e1e08'},
    {id:'saturn',name:'Ice Giant',light:false,sky:'#020a12',floor:'#05182a',beam:'#145a7a',chrome:'#030c16',panel:'#04101c',card:'#0e2030',fg:'#effdff',muted:'#a8d4e2',border:'#1e4a62',accent:'#6cd0e6',ink:'#b4f0fa',glyph:'#0e2a3e'},
    {id:'kelp',name:'Kelp Forest',light:false,sky:'#2a6e9e',floor:'#061c3a',beam:'#14385a',chrome:'#0a2440',panel:'#0c2846',card:'#163a5c',fg:'#eef6ff',muted:'#a8c4dc',border:'#2e5478',accent:'#f0cc64',ink:'#d4a83c',glyph:'#14385a'},
    {id:'glitch',name:'Signal Glitch',light:false,sky:'#050508',floor:'#0a0a12',beam:'#34344a',chrome:'#07070c',panel:'#09090e',card:'#18181f',fg:'#ffffff',muted:'#b4b4c8',border:'#34344a',accent:'#ff2a6a',ink:'#2af0ff',glyph:'#20202e'},
    {id:'peacock',name:'Peacock Feathers',light:false,sky:'#04100e',floor:'#081e1c',beam:'#14806e',chrome:'#06120f',panel:'#071613',card:'#102a26',fg:'#eefff6',muted:'#a4d4c4',border:'#1e5048',accent:'#f4d860',ink:'#38d0bc',glyph:'#0e3430'},
    {id:'blueprint',name:'Blueprint',light:false,sky:'#0f3c8c',floor:'#0a2c6c',beam:'#5a86d0',chrome:'#0d3478',panel:'#0e387e',card:'#1a4892',fg:'#ffffff',muted:'#cfe2ff',border:'#5a86d0',accent:'#ffd84a',ink:'#cfe2ff',glyph:'#2a5aa8'},
    {id:'stainedglass',name:'Stained Glass',light:false,sky:'#1e1814',floor:'#2a221c',beam:'#5a4c44',chrome:'#1a1511',panel:'#1e1814',card:'#2e2620',fg:'#fff4d0',muted:'#d4c4a8',border:'#4a3e34',accent:'#f0b02a',ink:'#f0b02a',glyph:'#3a302c'},
    {id:'inkwash',name:'Ink Wash',light:true,sky:'#f3eee2',floor:'#e9e2d2',beam:'#d8d2c4',chrome:'#ece6d8',panel:'#faf8f2',card:'#f3efe4',fg:'#1e1e1e',muted:'#5a5a58',border:'#cfc8b8',accent:'#c4302a',ink:'#ffffff',glyph:'#8e8e8e'},
    {id:'glacier',name:'Ice Cave',light:true,sky:'#d8ecf8',floor:'#cfe6f0',beam:'#aee0f6',chrome:'#d4eaf4',panel:'#f4fbff',card:'#eaf6fc',fg:'#123a54',muted:'#3e6680',border:'#9ccbe2',accent:'#1e88c8',ink:'#ffffff',glyph:'#5a8aa8'},
    {id:'balloons',name:'Hot Air Balloons',light:true,sky:'#f2c4dc',floor:'#eef4dc',beam:'#ffe2ee',chrome:'#f2dce6',panel:'#fffaf8',card:'#fdf2f4',fg:'#3a2a32',muted:'#6e5a64',border:'#e0c4d0',accent:'#e0508a',ink:'#ffffff',glyph:'#a07888'},
    {id:'reef',name:'Coral Reef',light:true,sky:'#6ad4e6',floor:'#c4eeee',beam:'#a8f0f4',chrome:'#bfe8ee',panel:'#f2fcfc',card:'#eaf8f8',fg:'#1e3a44',muted:'#486a74',border:'#9ccad2',accent:'#e0506a',ink:'#ffffff',glyph:'#5a8a94'},
    {id:'popart',name:'Pop Art',light:true,sky:'#fff4d4',floor:'#ffeec4',beam:'#ffe02a',chrome:'#fff0c8',panel:'#fffbec',card:'#fff6dc',fg:'#111111',muted:'#4a4a4a',border:'#111111',accent:'#ff2a2a',ink:'#ffffff',glyph:'#2a64ff'},
    {id:'cranes',name:'Paper Cranes',light:true,sky:'#e6ddf0',floor:'#fbf3e6',beam:'#f4c8d4',chrome:'#ece4ee',panel:'#fdfaff',card:'#f8f2f8',fg:'#3a2e3e',muted:'#6a5a6e',border:'#d4c4d8',accent:'#c8506e',ink:'#ffffff',glyph:'#8a7a8e'},
    {id:'tea',name:'Matcha',light:true,sky:'#f4f0e2',floor:'#e6dcc4',beam:'#c4dc84',chrome:'#ece6d4',panel:'#fbf9f0',card:'#f4efe0',fg:'#24201c',muted:'#5e5446',border:'#d4c8a8',accent:'#6e9a2e',ink:'#ffffff',glyph:'#8a7a5a'},
    {id:'oasis',name:'Desert Oasis',light:true,sky:'#f6d8a0',floor:'#f0d8a0',beam:'#ffe6b0',chrome:'#f2e0bc',panel:'#fffaee',card:'#fcf2de',fg:'#3a2c1a',muted:'#6e5a3e',border:'#dcc49a',accent:'#2e8a6a',ink:'#ffffff',glyph:'#9a8058'},
    {id:'lavender',name:'Lavender Fields',light:true,sky:'#ffd8c4',floor:'#e8cce8',beam:'#e4c4f0',chrome:'#f0dce6',panel:'#fdf8fc',card:'#f8eef6',fg:'#36283e',muted:'#685874',border:'#d6bed8',accent:'#8a5ac8',ink:'#ffffff',glyph:'#8a7a96'},
    {id:'windmills',name:'Windmills',light:true,sky:'#aeb4bf',floor:'#eeede6',beam:'#d9dce2',chrome:'#dcdee2',panel:'#f8f8f6',card:'#f0f0ec',fg:'#22262c',muted:'#50565e',border:'#b8bcc4',accent:'#e04a5a',ink:'#ffffff',glyph:'#6a707a'},
    {id:'island',name:'Island Palms',light:true,sky:'#7ccaf0',floor:'#2aa0c0',beam:'#a8e8f0',chrome:'#c4e6f2',panel:'#f2fbfe',card:'#eaf6fa',fg:'#16323e',muted:'#40606c',border:'#94c4d4',accent:'#1a8ab0',ink:'#ffffff',glyph:'#4e7a88'},
    {id:'opart',name:'Moire',light:true,sky:'#f7f7f3',floor:'#efefea',beam:'#dcdcd6',chrome:'#efefea',panel:'#fbfbf8',card:'#f2f2ee',fg:'#121212',muted:'#555555',border:'#cfcfc8',accent:'#e23a3a',ink:'#ffffff',glyph:'#444444'},
    {id:'zen',name:'Zen Garden',light:true,sky:'#f4ece0',floor:'#ece2d2',beam:'#e8dcc8',chrome:'#ece4d8',panel:'#fbf8f2',card:'#f6f0e6',fg:'#2e2a22',muted:'#625a4c',border:'#d4c8b4',accent:'#5a8a4a',ink:'#ffffff',glyph:'#8a8270'}
  ];
  const native=typeof electron_1!=='undefined'?{
    get:()=>electron_1.ipcRenderer.invoke('ascii-wallpapers:get'),
    save:value=>electron_1.ipcRenderer.invoke('ascii-wallpapers:save',{[KEY]:value})
  }:null;
  const windowAPI=typeof electronNativeAPI!=='undefined'?electronNativeAPI:window.electronNative;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const GLYPHS=['ascii','braille','blocks','katakana'],SCALES=['fine','normal','chunky'];
  let prefs={theme:'clouds',intensity:100,paused:reduced.matches,reactive:true,recolor:true,glyphs:'ascii',scale:'normal',quota:true};
  let alive=true,suspended=false,open=false,shell,sheet,canvas,ctx,host,shadow,style,observer,resizeObserver;
  let sceneWidth=0,sceneHeight=0,calmBox=null;
  let raf=0,last=0,time=0,layoutTimer=0,resizeRaf=0,previewRaf=0,saveQueue=Promise.resolve(),lastPreview=-1,triggerAnchor=null,needsModeSync=false;
  const cleanups=[],modeNodes=new Map();
  let originalChrome,originalChromeCaptured=false;
  // Agent activity: energy eases toward 1 while agents run; pulse is a one-shot ripple when one finishes.
  let agents=0,energy=0,pulse=0,unhookAgents=null;
  const current=()=>themes.find(t=>t.id===prefs.theme)||themes[0];
  function validate(p){return {theme:p?.theme==='off'||themes.some(t=>t.id===p?.theme)?p.theme:'clouds',intensity:Number.isFinite(p?.intensity)?Math.min(100,Math.max(15,p.intensity)):100,paused:typeof p?.paused==='boolean'?p.paused:reduced.matches,reactive:p?.reactive!==false,recolor:p?.recolor!==false,glyphs:GLYPHS.includes(p?.glyphs)?p.glyphs:'ascii',scale:SCALES.includes(p?.scale)?p.scale:'normal',quota:p?.quota!==false};}
  // Antigravity already reports its running-agent count to the main process for the tray menu
  // (agent:update-active-count). Observe that call in this isolated preload instead of scraping the DOM.
  function hookAgents(){
    const ipc=typeof electron_1!=='undefined'?electron_1.ipcRenderer:null;
    if(!ipc||typeof ipc.invoke!=='function')return;
    const original=ipc.invoke;
    const wrapped=function(channel,...args){
      if(alive&&!suspended&&channel==='agent:update-active-count'){try{onAgents(Number(args[0]));}catch{}}
      return original.call(this,channel,...args);
    };
    try{ipc.invoke=wrapped;}catch{return;}
    if(ipc.invoke===wrapped)unhookAgents=()=>{if(ipc.invoke===wrapped)ipc.invoke=original;};
  }
  function onAgents(n){
    if(!Number.isFinite(n)||n<0)return;
    const previous=agents;agents=n;
    // While the window is hidden the ripple waits, so it plays when you come back to a finished agent.
    if(n<previous&&prefs.reactive&&!prefs.paused&&prefs.theme!=='off')pulse=1;
    if(n<previous){clearTimeout(quotaRetryTimer);quotaRetryTimer=setTimeout(()=>{quotaRetryTimer=0;loadQuota();},3000);}
    schedule();
  }
  hookAgents();
  // Model quota comes from the local language server's GetUserStatus RPC, the same call Antigravity's own UI makes.
  let quota=[],quotaTimer=0,quotaRetryTimer=0,quotaSeq=0,quotaAbort=null,quotaLoading=false,csrf='',quotaPlan='',quotaAt=0,quotaFailed=false,lastLow=null;
  function clearQuotaWork(){quotaSeq++;clearTimeout(quotaRetryTimer);quotaRetryTimer=0;quotaAbort?.abort();quotaAbort=null;quotaLoading=false;}
  // Protobuf JSON drops zero values, so an exhausted limit has a resetTime but no remainingFraction.
  const hasQuota=q=>q&&(q.resetTime||'remainingFraction' in q),fraction=v=>Math.min(1,Math.max(0,Number(v)||0));
  // RetrieveUserQuotaSummary: the shared-limit groups (Gemini, Claude and GPT, Argon) behind Antigravity's own View Usage menu.
  function quotaSummary(groups){
    const windows={weekly:'Weekly','5h':'5-hour'};
    return (groups||[]).map(g=>{
      const buckets=(g?.buckets||[]).filter(hasQuota).map(b=>({label:windows[b.window]||String(b.displayName||'Limit'),left:fraction(b.remainingFraction),reset:Date.parse(b.resetTime)||0}));
      return {name:String(g?.displayName||'Models'),info:String(g?.description||''),buckets,left:Math.min(...buckets.map(b=>b.left))};
    }).filter(g=>g.buckets.length);
  }
  // Fallback for builds without the summary RPC: per-model quota from GetUserStatus, Low/Medium/High merged.
  function quotaGroups(configs){
    const groups=new Map();
    for(const m of configs||[]){
      const q=m?.quotaInfo;if(!hasQuota(q))continue;
      const name=String(m.label||'Model').replace(/\s*\((?:low|medium|high)\)$/i,''),left=fraction(q.remainingFraction),g=groups.get(name);
      if(!g||left<g.left)groups.set(name,{name,info:'',left,buckets:[{label:'Limit',left,reset:Date.parse(q.resetTime)||0}]});
    }
    return [...groups.values()].sort((a,b)=>a.left-b.left||a.name.localeCompare(b.name));
  }
  async function quotaToken(force=false,signal){
    const prev=force?csrf:'';
    const clean=v=>{const s=String(v||'').trim();return s&&s!=='[REDACTED]'?s:'';};
    const find=s=>clean(String(s||'').match(/"?csrfToken"?\s*:\s*"([^"]+)"/)?.[1]);
    const fromStore=(skip='')=>{
      const out=[];
      try{out.push(clean(localStorage.getItem('agy_session_csrf_token')));}catch{}
      if(typeof document.cookie==='string')try{const hit=document.cookie.split('; ').find(x=>x.startsWith('csrfToken='));if(hit)out.push(clean(hit.slice(10)));}catch{}
      return out.find(v=>v&&v!==skip)||'';
    };
    if(force)csrf='';
    if(!csrf&&!force)csrf=fromStore()||[...document.scripts].map(s=>find(s.textContent)).find(Boolean)||'';
    if(!csrf){
      try{const r=await fetch('/',{cache:'no-store',signal});if(r.ok)csrf=find(await r.text());else if(!force)throw Error('token unavailable');}
      catch(err){if(!force)throw err;}
    }
    if(!csrf&&force)csrf=fromStore(prev);
    if(!csrf)throw Error('missing csrf token');
    return csrf;
  }
  async function loadQuota(){
    if(!alive||suspended||!prefs.quota||document.hidden||!/^https:\/\/127\.0\.0\.1:\d+$/.test(location.origin))return;
    const seq=++quotaSeq;quotaAbort?.abort();
    const ctrl=new AbortController();quotaAbort=ctrl;quotaLoading=true;
    const tmo=setTimeout(()=>ctrl.abort(),8000);
    shadow?.querySelector('.quota-refresh')?.setAttribute('data-busy','');
    try{
      const rpcOnce=async force=>{
        const token=await quotaToken(force,ctrl.signal);
        const headers={'Content-Type':'application/json','Connect-Protocol-Version':'1','x-codeium-csrf-token':token};
        let authErr=false;
        const rpc=name=>fetch('/exa.language_server_pb.LanguageServerService/'+name,{method:'POST',cache:'no-store',signal:ctrl.signal,headers,body:'{}'}).then(r=>{if(r.status===401||r.status===403){csrf='';authErr=true;}return r.ok?r.json():null;},()=>null);
        const [summary,user]=await Promise.all([rpc('RetrieveUserQuotaSummary'),rpc('GetUserStatus')]);
        return {summary,user,authErr};
      };
      let res=await rpcOnce(false);
      if(res.authErr&&seq===quotaSeq&&alive)res=await rpcOnce(true);
      if(seq!==quotaSeq||!alive)return;
      const status=res.user?.userStatus,groups=quotaSummary(res.summary?.response?.groups),configs=status?.cascadeModelConfigData?.clientModelConfigs;
      if((!res.summary&&!status)||(!groups.length&&!Array.isArray(configs)))throw Error('quota unavailable');
      quota=groups.length?groups:quotaGroups(configs);
      quotaPlan=String(status?.userTier?.name||status?.planStatus?.planInfo?.planName||quotaPlan);quotaAt=Date.now();quotaFailed=false;
    }catch{
      if(seq!==quotaSeq||!alive)return;
      quotaFailed=true;
    }finally{
      clearTimeout(tmo);
      if(seq===quotaSeq){quotaLoading=false;if(quotaAbort===ctrl)quotaAbort=null;if(alive)showQuota();}
    }
  }
  const until=ms=>{const m=Math.max(0,Math.round((ms-Date.now())/60000)),d=Math.floor(m/1440),h=Math.floor(m%1440/60);return d?`${d}d ${h}h`:h?`${h}h ${m%60}m`:`${m}m`;};
  const clock=ms=>new Date(ms).toLocaleString([],{weekday:'short',hour:'numeric',minute:'2-digit'});
  const health=f=>f<.2?'low':f<.5?'warn':'ok';
  function showQuota(){
    if(!shadow)return;
    const chip=shadow.querySelector('.quota'),list=shadow.querySelector('.quota-list'),low=quota.reduce((a,g)=>!a||g.left<a.left?g:a,null);
    const restoreFocus=shadow.activeElement?.classList?.contains('quota-refresh');
    chip.hidden=!prefs.quota||(!low&&!quotaFailed);
    if(chip.hidden){quotaList(false);return;}
    const pct=g=>Math.round(g.left*100)+'%',meter=(cls,g)=>{const e=make('span',{class:cls,'data-health':health(g.left),'aria-hidden':'true'});e.style.setProperty('--p',g.left*100+'%');return e;};
    const short=g=>g.name.replace(/\s+models?$/i,'').replace(/\s+and\s+/i,'/');
    if(low){
      // Every group on the chip, each showing its tighter limit (weekly or 5-hour).
      chip.replaceChildren(...quota.map(g=>{const e=make('span',{class:'quota-item','data-health':health(g.left)});e.append(meter('quota-ring',g),make('span',{class:'quota-short'},short(g)),make('span',{},pct(g)));return e;}));
      chip.toggleAttribute('data-stale',quotaFailed);
      chip.title=`Model quota${quotaFailed?' · offline':''}`;chip.setAttribute('aria-label','Model quota: '+quota.map(g=>`${g.name} ${pct(g)}`).join(', '));
      // Nudge once when the lowest model first drops into the red, not on every refresh.
      if(low.left<.2&&lastLow!==null&&lastLow>=.2&&!reduced.matches)chip.animate([{transform:'scale(1)'},{transform:'scale(1.15)'},{transform:'scale(1)'}],{duration:500,iterations:3});
      lastLow=low.left;
    }else{
      chip.replaceChildren(make('span',{},'Quota offline'));
      chip.setAttribute('data-stale','');
      chip.title='Model quota offline (click to retry)';chip.setAttribute('aria-label','Model quota offline');
    }
    const head=make('div',{class:'quota-head'}),refresh=make('button',{class:'tool quota-refresh',type:'button','aria-label':'Refresh model quota',title:'Refresh'},'↻');
    if(quotaLoading)refresh.setAttribute('data-busy','');
    const statusText=quotaFailed?'Offline'+(quotaAt?' · '+clock(quotaAt):''):'Updated '+clock(quotaAt);
    head.append(make('strong',{},'Model quota'),make('span',{class:'kind'},quotaPlan),make('span',{class:'spacer'}),make('span',{class:'kind'},statusText),refresh);
    refresh.onclick=loadQuota; // rebuilt on every refresh, so no listen() bookkeeping
    if(quota.length){
      list.replaceChildren(head,...quota.flatMap(g=>[
        make('div',g.info?{class:'quota-group',title:g.info}:{class:'quota-group'},g.name),
        ...g.buckets.map(b=>{
          const row=make('div',{class:'quota-row'}),bar=make('span',{class:'quota-bar'});bar.append(meter('quota-fill',b));
          row.append(make('span',{class:'quota-name'},b.label),bar,make('span',{class:'value','data-health':health(b.left)},pct(b)),make('span',b.reset?{class:'kind',title:'Resets '+clock(b.reset)}:{class:'kind'},b.left>=1?'full':b.reset?'resets in '+until(b.reset):''));
          return row;
        })
      ]));
    }else{
      list.replaceChildren(head,make('div',{class:'quota-empty kind'},'Could not reach language server. Click ↻ to retry.'));
    }
    if(restoreFocus&&!list.hidden)refresh.focus({preventScroll:true});
    positionTrigger();
  }
  function quotaList(value){const list=shadow?.querySelector('.quota-list');if(!list)return;if(value&&open)toggle(false,false);list.hidden=!value;shadow.querySelector('.quota').setAttribute('aria-expanded',String(value));if(value)positionTrigger();}
  const make=(tag,attrs={},text='')=>{const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;return e;};
  function listen(e,name,fn,options){e.addEventListener(name,fn,options);cleanups.push(()=>e.removeEventListener(name,fn,options));}
  function save(){const value=JSON.stringify(prefs),err=shadow?.querySelector('.save-error'),tr=shadow?.querySelector('.trigger');saveQueue=saveQueue.catch(()=>{}).then(()=>native?native.save(value):localStorage.setItem(KEY,value)).then(()=>{if(err){err.hidden=true;err.textContent='';}if(tr){tr.removeAttribute('data-save-error');tr.title=triggerTitle;}}).catch(()=>{const msg='Could not save this theme. Please try again.';if(err){err.textContent=msg;err.hidden=false;}if(tr){tr.setAttribute('data-save-error','');tr.title=msg;}const st=shadow?.querySelector('.status');if(st)st.textContent=msg;});}
  const paletteIcon='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.5"/></svg>';
  const closeIcon='<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg>';
  const isMac=typeof navigator!=='undefined'&&(/(Mac|iPhone|iPad|iPod)/i.test(navigator.platform||'')||/Mac/i.test(navigator.userAgent||''));
  const triggerTitle='Themes · '+(isMac?'⌥⌘W':'Ctrl+Alt+W');
  function build(){
    host=make('div',{id:'agy-ascii-controls'});if(isMac)host.setAttribute('data-platform','darwin');host.style.visibility='hidden';document.body.append(host);shadow=host.attachShadow({mode:'open'});
    const css=make('style');css.textContent=`
      :host{all:initial;position:fixed;top:0;left:0;width:0;height:0;z-index:2147483000;pointer-events:none;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:var(--aw-fg,#edf0fa);--aw-panel:#0d1224;--aw-card:#1e263c;--aw-fg:#edf0fa;--aw-muted:#bdc6df;--aw-border:#465375;--aw-accent:#ddd8ad}
      *{box-sizing:border-box}button,input{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible{outline:2px solid var(--aw-accent);outline-offset:3px}button:disabled{opacity:.45;cursor:default}[hidden]{display:none!important}
      .trigger{position:fixed;top:5px;right:155px;pointer-events:auto;-webkit-app-region:no-drag;display:flex;align-items:center;gap:6px;height:25px;padding:0 9px;border:1px solid transparent;border-radius:5px;color:var(--aw-fg);background:transparent;font-size:11px}
      :host([data-platform=darwin]) .trigger{right:200px}
      .trigger:hover,.trigger[aria-expanded=true]{background:color-mix(in srgb,var(--aw-fg) 10%,transparent)}.trigger[data-save-error]{color:color-mix(in srgb,#ff5f5f 85%,var(--aw-fg))}
      [data-health=ok]{--c:var(--aw-accent)}[data-health=warn]{--c:color-mix(in srgb,#f0a83a 80%,var(--aw-fg))}[data-health=low]{--c:color-mix(in srgb,#ff5f5f 85%,var(--aw-fg))}
      .quota{position:fixed;top:5px;right:240px;max-width:min(360px,calc(100vw - 260px));overflow:hidden;pointer-events:auto;-webkit-app-region:no-drag;display:flex;align-items:center;gap:12px;height:25px;padding:0 8px;border:1px solid transparent;border-radius:5px;color:var(--aw-fg);background:transparent;font-size:11px;font-variant-numeric:tabular-nums;white-space:nowrap}
      .quota:hover,.quota[aria-expanded=true]{background:color-mix(in srgb,var(--aw-fg) 10%,transparent)}.quota[data-stale]{opacity:.55}
      .quota-item{display:flex;align-items:center;gap:5px}.quota-item[data-health=low]{color:var(--c)}.quota-short{color:var(--aw-muted)}
      @media(max-width:1000px){.quota-short{display:none}.quota{gap:8px}}
      .quota-ring{width:13px;height:13px;border-radius:50%;background:conic-gradient(var(--c) var(--p),color-mix(in srgb,var(--aw-fg) 20%,transparent) 0);-webkit-mask:radial-gradient(circle,transparent 3.5px,#000 4px);mask:radial-gradient(circle,transparent 3.5px,#000 4px)}
      .quota-list{position:fixed;pointer-events:auto;-webkit-app-region:no-drag;display:grid;grid-template-columns:auto 96px auto auto;gap:7px 12px;align-items:center;min-width:300px;max-width:calc(100vw - 16px);overflow-x:auto;padding:10px 12px 12px;border:1px solid var(--aw-border);border-radius:8px;background:var(--aw-panel);color:var(--aw-fg);box-shadow:0 6px 20px #0000001a;font-size:11px;white-space:nowrap}
      .quota-head{grid-column:1/-1;display:flex;align-items:center;gap:8px;margin-bottom:3px;font-size:12px}.quota-head strong{font-weight:600}.quota-refresh{font-size:13px}.quota-refresh[data-busy]{opacity:.5}
      .quota-group{grid-column:1/-1;margin-top:4px;font-weight:600}.quota-row .quota-name{padding-left:10px;color:var(--aw-muted)}.quota-empty{grid-column:1/-1;color:var(--aw-muted);padding:4px 0}
      .quota-row{display:contents}.quota-row .value{text-align:right;font-variant-numeric:tabular-nums}.quota-row .value[data-health=low]{color:var(--c)}
      .quota-bar{height:6px;border-radius:3px;background:color-mix(in srgb,var(--aw-fg) 14%,transparent);overflow:hidden}.quota-fill{display:block;height:100%;width:var(--p);border-radius:inherit;background:var(--c)}
      .panel{position:fixed;top:44px;right:8px;bottom:8px;width:min(340px,calc(100vw - 24px));display:flex;flex-direction:column;gap:10px;pointer-events:auto;-webkit-app-region:no-drag;padding:12px;border:1px solid var(--aw-border);border-radius:10px;background:color-mix(in srgb,var(--aw-panel) 94%,transparent);backdrop-filter:blur(18px);color:var(--aw-fg);box-shadow:0 12px 40px #00000030}
      .panel:not([hidden]){animation:aw-in .18s ease-out}@keyframes aw-in{from{opacity:0;transform:translateX(18px)}}
      .header{display:flex;align-items:center;gap:8px;height:24px;font-size:13px;white-space:nowrap}.header strong{font-weight:600}.count{color:var(--aw-muted);font-size:11px;font-variant-numeric:tabular-nums}
      .now{display:flex;align-items:baseline;gap:8px;min-height:16px;font-size:12px;white-space:nowrap}.current{overflow:hidden;text-overflow:ellipsis}.kind{color:var(--aw-muted);font-size:11px}.spacer{flex:1}
      .tools{display:flex;gap:2px}.tool{display:flex;align-items:center;justify-content:center;height:22px;padding:0 7px;border:0;border-radius:4px;color:var(--aw-muted);background:none;font-size:11px}.tool:hover{color:var(--aw-fg);background:color-mix(in srgb,var(--aw-fg) 8%,transparent)}.tool[aria-pressed=true]{color:var(--aw-fg)}
      .find{display:flex;gap:6px}.search{flex:1;min-width:0;height:28px;padding:0 10px;border:1px solid var(--aw-border);border-radius:6px;background:var(--aw-card);color:var(--aw-fg);font:inherit;font-size:12px}.search::placeholder{color:var(--aw-muted)}.search:focus-visible{outline:2px solid var(--aw-accent);outline-offset:1px}
      .shuffle{height:28px;padding:0 10px;border:1px solid var(--aw-border);border-radius:6px;background:var(--aw-card);color:var(--aw-fg);font-size:11px}.shuffle:hover{border-color:var(--aw-accent)}
      .filters{display:flex;padding:2px;border-radius:7px;background:color-mix(in srgb,var(--aw-fg) 7%,transparent)}.filter{flex:1;height:24px;border:0;border-radius:5px;background:none;color:var(--aw-muted);font-size:11px}.filter[aria-pressed=true]{background:var(--aw-card);color:var(--aw-fg);box-shadow:0 1px 3px #0000001f}
      .choices{flex:1;min-height:0;overflow-y:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-content:start;gap:12px 10px;padding:3px 4px 4px 3px;scrollbar-width:thin}
      .choice{display:flex;flex-direction:column;gap:5px;padding:0;border:0;border-radius:6px;background:none;color:var(--aw-fg);text-align:left;min-width:0}.choice:focus-visible{outline-offset:3px}
      .preview{display:block;width:100%;aspect-ratio:8/5;height:auto;border-radius:6px;opacity:.85;transition:opacity .12s,transform .12s}.choice:hover .preview,.choice:focus-visible .preview,.choice[aria-pressed=true] .preview{opacity:1}.choice:hover .preview{transform:translateY(-1px)}
      .choice[aria-pressed=true] .preview{box-shadow:0 0 0 2px var(--aw-panel),0 0 0 4px var(--aw-accent)}
      .name{display:flex;align-items:baseline;gap:6px;font-size:11px;line-height:1.2}.name span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.name .kind{font-size:10px}
      .empty{grid-column:1/-1;padding:24px 0;text-align:center;color:var(--aw-muted);font-size:12px}
      .settings{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:10px 2px 0;border-top:1px solid color-mix(in srgb,var(--aw-border) 60%,transparent);font-size:11px;color:var(--aw-muted)}.settings label{display:flex;align-items:center;gap:6px;white-space:nowrap}.settings input[type=range]{width:110px;accent-color:var(--aw-fg)}.settings input[type=checkbox]{margin:0;accent-color:var(--aw-fg)}.settings select{height:22px;padding:0 6px;border:1px solid var(--aw-border);border-radius:4px;background:var(--aw-card);color:var(--aw-fg);font:inherit;cursor:pointer}.settings select:focus-visible{outline:2px solid var(--aw-accent);outline-offset:2px}.value{font-variant-numeric:tabular-nums;min-width:28px}.save-error{padding:6px 8px;border:1px solid color-mix(in srgb,#ff5f5f 55%,transparent);border-radius:6px;background:color-mix(in srgb,#ff5f5f 14%,transparent);color:var(--aw-fg);font-size:11px}.status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
      @media(max-width:650px){.trigger span{display:none}.trigger{right:145px}.settings input[type=range]{width:100px}}
      @media(prefers-reduced-motion:reduce){.preview{transition:none}.panel:not([hidden]){animation:none}}
    `;shadow.append(css);
    const trigger=make('button',{class:'trigger',type:'button','aria-label':'Choose theme','aria-expanded':'false','aria-controls':'theme-picker',title:triggerTitle});trigger.innerHTML=paletteIcon+'<span>Themes</span>';
    const panel=make('aside',{class:'panel',id:'theme-picker','aria-label':'ASCII wallpaper themes',hidden:''});
    const header=make('div',{class:'header'});header.append(make('strong',{},'Themes'),make('span',{class:'count'},String(themes.length)),make('span',{class:'spacer'}));
    const now=make('div',{class:'now'});now.append(make('span',{class:'current'}),make('span',{class:'kind'}));
    const tools=make('div',{class:'tools'});
    const pause=make('button',{class:'tool pause',type:'button',title:'Pause or resume the wallpaper','aria-pressed':'false'},'Pause');
    const settings=make('button',{class:'tool settings-toggle',type:'button','aria-expanded':'false','aria-controls':'theme-settings'},'Adjust');
    const off=make('button',{class:'tool reset',type:'button',title:'Restore Antigravity’s original appearance'},'Off');
    const close=make('button',{class:'tool close',type:'button','aria-label':'Close theme picker'});close.innerHTML=closeIcon;
    tools.append(pause,settings,off,close);header.append(tools);
    const find=make('div',{class:'find'}),search=make('input',{class:'search',type:'search',placeholder:`Search ${themes.length} themes`,'aria-label':'Search themes',spellcheck:'false'}),shuffle=make('button',{class:'shuffle',type:'button',title:'Pick a random theme'},'Shuffle');find.append(search,shuffle);
    const filters=make('div',{class:'filters',role:'group','aria-label':'Filter themes'});
    for(const [id,name] of [['all','All'],['light','Light'],['dark','Dark']])filters.append(make('button',{class:'filter',type:'button','data-filter':id,'aria-pressed':String(id==='all')},name));
    panel.append(header,now,find,filters);
    const choices=make('div',{class:'choices','aria-label':'Themes'});
    for(const t of themes){const b=make('button',{class:'choice',type:'button','data-theme':t.id,'aria-pressed':'false','aria-label':`${t.name}, ${t.light?'light':'dark'}`});const preview=make('canvas',{class:'preview',width:'160',height:'100','aria-hidden':'true'}),name=make('span',{class:'name','aria-hidden':'true'});name.append(make('span',{},t.name),make('span',{class:'kind'},t.light?'Light':'Dark'));b.append(preview,name);listen(b,'click',()=>select(t.id));listen(b,'pointerenter',()=>label(t));listen(b,'focus',()=>label(t));choices.append(b);}
    const empty=make('div',{class:'empty',hidden:''},'No themes match');choices.append(empty);
    listen(choices,'pointerleave',()=>label());listen(choices,'focusout',e=>{if(!choices.contains(e.relatedTarget))label();});
    let filter='all';
    const applyFilter=()=>{const q=search.value.trim().toLowerCase();let shown=0;for(const b of choices.querySelectorAll('.choice')){const t=themes.find(x=>x.id===b.dataset.theme),hit=(filter==='all'||(filter==='light')===t.light)&&(!q||t.name.toLowerCase().includes(q)||t.id.includes(q));b.hidden=!hit;shown+=hit;}empty.hidden=shown>0;previews(true);};
    listen(search,'input',applyFilter);
    // Keep typing inside the search box from reaching Antigravity's own shortcuts.
    listen(search,'keydown',e=>{if(e.key!=='Escape')e.stopPropagation();if(e.key==='ArrowDown'){e.preventDefault();choices.querySelector('.choice:not([hidden])')?.focus();}});
    listen(filters,'click',e=>{const b=e.target.closest('.filter');if(!b)return;filter=b.dataset.filter;filters.querySelectorAll('.filter').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));applyFilter();});
    listen(shuffle,'click',()=>{const pool=[...choices.querySelectorAll('.choice:not([hidden])')].map(b=>b.dataset.theme).filter(id=>id!==prefs.theme);if(pool.length){const id=pool[Math.floor(Math.random()*pool.length)];select(id);shadow.querySelector(`[data-theme="${id}"]`)?.scrollIntoView({block:'nearest'});}});
    const adjust=make('div',{class:'settings',id:'theme-settings',hidden:''});
    const intensity=make('label',{},'Intensity'),range=make('input',{type:'range',min:'15',max:'100',step:'1','aria-label':'Wallpaper intensity'});intensity.append(range);
    const glyphLabel=make('label',{},'Glyphs'),glyphSelect=make('select',{class:'glyphs','aria-label':'Character style'});
    for(const [id,name] of [['ascii','ASCII'],['braille','Braille'],['blocks','Blocks'],['katakana','Katakana']])glyphSelect.append(make('option',{value:id},name));
    glyphLabel.append(glyphSelect);
    const scaleLabel=make('label',{},'Grid'),scaleSelect=make('select',{class:'scale','aria-label':'Grid density'});
    for(const [id,name] of [['fine','Fine'],['normal','Normal'],['chunky','Chunky']])scaleSelect.append(make('option',{value:id},name));
    scaleLabel.append(scaleSelect);
    const recolor=make('label',{title:'Recolor the sidebar, composer and title bar to match the scene'},'Theme app'),recolorBox=make('input',{type:'checkbox',class:'recolor'});recolor.prepend(recolorBox);
    const reactive=make('label',{title:'Speed up while agents run and ripple when one finishes'},'React to agents'),reactiveBox=make('input',{type:'checkbox',class:'reactive'});reactive.prepend(reactiveBox);
    const quotaPref=make('label',{title:'Show remaining model quota in the title bar'},'Show quota'),quotaBox=make('input',{type:'checkbox',class:'quota-pref'});quotaPref.prepend(quotaBox);
    adjust.append(intensity,make('span',{class:'value'}),glyphLabel,scaleLabel,make('span',{class:'spacer'}),recolor,reactive,quotaPref);
    panel.append(choices,adjust,make('div',{class:'save-error',role:'alert',hidden:''}),make('div',{class:'status','aria-live':'polite'}));
    const quotaChip=make('button',{class:'quota',type:'button','aria-expanded':'false','aria-controls':'quota-list',hidden:''}),quotaPanel=make('section',{class:'quota-list',id:'quota-list','aria-label':'Model quota',hidden:''});
    shadow.append(trigger,panel,quotaChip,quotaPanel);
    listen(quotaChip,'click',()=>{quotaList(quotaPanel.hidden);if(!quotaPanel.hidden)loadQuota();});
    listen(quotaBox,'change',()=>{prefs.quota=quotaBox.checked;showQuota();loadQuota();save();});
    listen(trigger,'click',()=>toggle(!open));listen(close,'click',()=>toggle(false));listen(off,'click',()=>select('off'));
    listen(pause,'click',()=>{prefs.paused=!prefs.paused;apply();save();});
    listen(settings,'click',()=>{adjust.hidden=!adjust.hidden;settings.setAttribute('aria-expanded',String(!adjust.hidden));syncLayout();});
    listen(range,'input',()=>{prefs.intensity=Number(range.value);shadow.querySelector('.value').textContent=prefs.intensity+'%';render();});listen(range,'change',save);
    listen(glyphSelect,'change',()=>{prefs.glyphs=glyphSelect.value;render();previews(true);save();});
    listen(scaleSelect,'change',()=>{prefs.scale=scaleSelect.value;render();save();});
    listen(recolorBox,'change',()=>{prefs.recolor=recolorBox.checked;apply();save();});
    listen(reactiveBox,'change',()=>{prefs.reactive=reactiveBox.checked;if(!prefs.reactive){pulse=0;}save();});
    // Two-column grid: left/right step one card, up/down step a row, over the cards the filter leaves visible.
    listen(choices,'keydown',e=>{const all=[...choices.querySelectorAll('.choice:not([hidden])')],i=all.indexOf(e.target.closest('.choice'));if(i<0)return;let next=i;if(e.key==='ArrowRight')next=Math.min(all.length-1,i+1);else if(e.key==='ArrowLeft')next=Math.max(0,i-1);else if(e.key==='ArrowDown')next=Math.min(all.length-1,i+2);else if(e.key==='ArrowUp'){if(i<2){e.preventDefault();search.focus();return;}next=i-2;}else if(e.key==='Home')next=0;else if(e.key==='End')next=all.length-1;else return;e.preventDefault();all[next].focus();all[next].scrollIntoView({block:'nearest'});select(all[next].dataset.theme);});
    listen(document,'pointerdown',e=>{if(e.composedPath().includes(host))return;if(open)toggle(false,false);quotaList(false);});
    listen(document,'keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.altKey&&e.code==='KeyW'){e.preventDefault();e.stopPropagation();toggle(!open);}
      if(e.key==='Escape'&&!quotaPanel.hidden){e.preventDefault();quotaList(false);quotaChip.focus();}
      else if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();toggle(false);}
      const editor=e.target?.closest?.('[contenteditable=true],[contenteditable=""],textarea');
      if(e.key==='Enter'&&!e.shiftKey&&editor){
        const text=(editor.value??editor.textContent??'').replace(/[\u200B-\u200D\u2060\uFEFF]/g,'').trim();
        const match=text.match(/^\/themes?(?:\s+(.+))?$/i);
        if(match){
          e.preventDefault();e.stopImmediatePropagation();
          if(editor.matches('textarea')){const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;setter.call(editor,'');editor.dispatchEvent(new Event('input',{bubbles:true}));}
          else{const range=document.createRange?.(),sel=getSelection?.();if(range&&sel){range.selectNodeContents(editor);sel.removeAllRanges();sel.addRange(range);}document.execCommand?.('delete');}
          const arg=match[1]?.trim().toLowerCase();
          if(!arg)toggle(true);
          else if(['off','reset','stock','default'].includes(arg))select('off');
          else if(['random','shuffle'].includes(arg)){const pool=themes.filter(t=>t.id!==prefs.theme);select(pool[Math.floor(Math.random()*pool.length)].id);}
          else{const found=themes.find(t=>t.id===arg||t.name.toLowerCase()===arg||t.name.toLowerCase().includes(arg));if(found)select(found.id);else toggle(true);}
        }
      }
    },true);
  }
  function toggle(value,focus=true){open=value;if(open)quotaList(false);shadow.querySelector('.panel').hidden=!open;shadow.querySelector('.trigger').setAttribute('aria-expanded',String(open));syncLayout();if(open){const active=shadow.querySelector(`[data-theme="${prefs.theme==='off'?'clouds':prefs.theme}"]`),target=active&&!active.hidden?active:shadow.querySelector('.choice:not([hidden])')||shadow.querySelector('.search');target?.focus({preventScroll:true});if(target?.classList?.contains('choice'))target.scrollIntoView({block:'nearest',inline:'center'});previews(true);}else{stopPreviews();if(focus)shadow.querySelector('.trigger').focus();}}
  function select(id){prefs.theme=id;apply();save();}
  function label(t=prefs.theme==='off'?null:current()){shadow.querySelector('.current').textContent=t?t.name:'Original';shadow.querySelector('.kind').textContent=t?(t.light?'Light':'Dark'):'Antigravity';}
  function positionTrigger(){
    if(!shadow)return;
    const trigger=shadow.querySelector('.trigger');
    if(!trigger)return;
    let anchor=triggerAnchor?.isConnected&&/Open\s+IDE/i.test(triggerAnchor.textContent||'')&&(triggerAnchor.textContent||'').trim().length<30?triggerAnchor:null,r=null;
    if(anchor){
      r=anchor.getBoundingClientRect();
      if(!(r.top>=0&&r.top<60&&r.left>50&&r.width>10&&r.height>10)){anchor=null;r=null;}
    }
    if(!anchor){
      const topBar=document.querySelector('.agy-shell > .shrink-0');
      const findIn=(root,sel)=>{
        for(const el of root.querySelectorAll(sel)){
          const txt=el.textContent||'';
          if(/Open\s+IDE/i.test(txt)&&txt.trim().length<30){
            const er=el.getBoundingClientRect();
            if(er.top>=0&&er.top<60&&er.left>50&&er.width>10&&er.height>10)return el.closest('button, a, [role="button"]')||el;
          }
        }
        return null;
      };
      anchor=(topBar?findIn(topBar,'button, a, [role="button"]'):null)||findIn(document,'button, a, [role="button"]')||(topBar?findIn(topBar,'div'):null);
      triggerAnchor=anchor;
    }
    if(anchor){
      r=r||anchor.getBoundingClientRect();
      trigger.style.right=Math.round(window.innerWidth-r.left+8)+'px';
      const targetTop=Math.round(r.top+(r.height-25)/2);
      if(targetTop>=0&&targetTop<40)trigger.style.top=targetTop+'px';
    }else{
      trigger.style.right=isMac?'200px':'155px';
      trigger.style.top='5px';
    }
    const chip=shadow.querySelector('.quota'),list=shadow.querySelector('.quota-list');
    if(chip&&!chip.hidden){
      const vw=window.innerWidth||1200,r=trigger.getBoundingClientRect();chip.style.top=Math.round(r.top)+'px';chip.style.right=Math.round(vw-r.left+4)+'px';
      const c=chip.getBoundingClientRect(),listW=Math.max(list.getBoundingClientRect?.().width||0,300);
      list.style.top=Math.round(c.bottom+6)+'px';list.style.right=Math.min(Math.max(8,Math.round(vw-c.right)),Math.max(8,Math.round(vw-Math.min(listW,vw-16)-8)))+'px';
    }
  }
  function syncLayout(skipRender=false){
    positionTrigger();
    const target=shell||sheet;if(!host||!target||!target.isConnected)return;
    const bounds=target.getBoundingClientRect();
    const sheetEl=document.querySelector('.agy-sheet')||target;
    const composerElement=sheetEl.querySelector('.surface-composer'),composer=composerElement?.getBoundingClientRect();
    const composerGroup=composerElement?.closest('[style*="--max-conversation-width"]')?.getBoundingClientRect();
    // The artwork keeps the live text column and titlebar calm, whatever the window width.
    const column=composerGroup?.width?composerGroup:composer;
    const topBar=document.querySelector('.agy-shell > .shrink-0');
    const topHeight=Math.round(topBar?.getBoundingClientRect().height||38);
    const next=column?.width?{l:Math.round(column.left-bounds.left),r:Math.round(column.right-bounds.left),t:topHeight}:{l:-1,r:-1,t:topHeight};
    if(next?.l!==calmBox?.l||next?.r!==calmBox?.r||next?.t!==calmBox?.t){calmBox=next;if(!skipRender)render();}
    // The picker is a sidebar docked to the right, just under the titlebar.
    shadow.querySelector('.panel').style.top=(topHeight+6)+'px';
  }
  function setMode(t,off){
    for(const e of modeNodes.keys())if(!e.isConnected)modeNodes.delete(e);
    needsModeSync=false;
    const names=['dark','light','dark-theme','light-theme','theme-dark','theme-light'];
    if(off){for(const [e,old]of modeNodes){if(e.isConnected){e.classList.remove(...names);e.classList.add(...old);}}modeNodes.clear();return;}
    const nodes=[document.body,...document.querySelectorAll('#root .dark,#root .light')];
    for(const e of nodes){if(!modeNodes.has(e))modeNodes.set(e,names.filter(c=>e.classList.contains(c)));e.classList.remove(...names);e.classList.add(t.light?'light':'dark');if(e===document.body)e.classList.add(t.light?'light-theme':'dark-theme',t.light?'theme-light':'theme-dark');}
  }
  function hostIsLight(){
    if(shell?.closest?.('.light'))return true;
    const hasLight=!!document.querySelector('#root .light'),hasDark=!!document.querySelector('#root .dark');
    if(hasLight&&!hasDark)return true;
    if(hasDark&&!hasLight)return false;
    const bg=getComputedStyle(shell||document.body).getPropertyValue('--background').trim();
    const m=bg.match(/^#([0-9a-f]{3,8})$/i);
    if(m){let h=m[1];if(h.length===3)h=h.replace(/./g,c=>c+c);if(h.length>=6){const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return (0.299*r+0.587*g+0.114*b)>128;}}
    const rgb=bg.match(/rgb\w*\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
    if(rgb)return (0.299*rgb[1]+0.587*rgb[2]+0.114*rgb[3])>128;
    return false;
  }
  function hostPalette(off,t){
    if(!off)return t;
    return hostIsLight()?{panel:'#ffffff',card:'#f4f4f5',fg:'#18181b',muted:'#52525b',border:'#d4d4d8',accent:'#2563eb'}:{panel:'#18181b',card:'#27272a',fg:'#f4f4f5',muted:'#a1a1aa',border:'#3f3f46',accent:'#60a5fa'};
  }
  function sampleChrome(){
    const el=document.querySelector('.agy-shell');
    if(!el||originalChromeCaptured)return;
    const c=getComputedStyle(el),light=hostIsLight();
    originalChrome={color:c.getPropertyValue('--background').trim()||(light?'#ffffff':'#101010'),symbolColor:c.getPropertyValue('--foreground').trim()||(light?'#1f2328':'#cccccc')};
    originalChromeCaptured=true;
  }
  function appearance(t,off){
    const full=!off&&prefs.recolor;
    setMode(t,!full);
    const viewerReset=`
      body[data-aw-theme] .surface-composer,body[data-aw-theme] iframe,body[data-aw-theme] embed,body[data-aw-theme] object,body[data-aw-theme] .pdfViewer,body[data-aw-theme] .textLayer,body[data-aw-theme] [class*="pdf" i],body[data-aw-theme] [class*="pdf" i] *,body[data-aw-theme] .monaco-editor,body[data-aw-theme] .monaco-editor *,body[data-aw-theme] [class*="artifact" i],body[data-aw-theme] [class*="artifact" i] *,body[data-aw-theme] .markdown-body,body[data-aw-theme] .prose{text-shadow:none!important}
      body[data-aw-theme] iframe,body[data-aw-theme] embed,body[data-aw-theme] object,body[data-aw-theme] .pdfViewer,body[data-aw-theme] [class*="pdf" i]{isolation:isolate;color:initial}
      body[data-aw-theme] [class*="artifact" i]{isolation:isolate}
    `;
    if(off){delete document.body.dataset.awTheme;delete document.body.dataset.awMode;style.textContent='';host.style.colorScheme=hostIsLight()?'light':'dark';}
    else if(!full){
      document.body.dataset.awTheme=t.id;delete document.body.dataset.awMode;host.style.colorScheme=t.light?'light':'dark';
      style.textContent=`
        body[data-aw-theme] .agy-shell{position:relative!important;isolation:isolate!important;background:transparent!important;--max-conversation-width:min(60rem,50vw)!important}
        @media(max-width:900px){body[data-aw-theme] .agy-shell{--max-conversation-width:100%!important}}
        body[data-aw-theme] .agy-inset-shell{background:transparent!important;background-color:transparent!important}
        body[data-aw-theme] .agy-sheet{isolation:isolate;background:transparent!important;background-color:transparent!important;color:${t.fg};text-shadow:0 0 2px ${t.light?t.floor:t.sky},0 0 6px ${t.light?t.floor:t.sky},0 0 12px ${t.light?t.floor:t.sky}}
        body[data-aw-theme] .bg-sidebar{background:transparent!important;background-color:transparent!important}
        body[data-aw-theme] .agy-inset-shell > div:first-child > div:first-child,body[data-aw-theme] [aria-label="Sidebar"],body[data-aw-theme] nav.bg-sidebar{background-color:color-mix(in srgb,${t.chrome} 30%,transparent)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;border-right:1px solid color-mix(in srgb,${t.border} 30%,rgba(255,255,255,0.08))!important}
        body[data-aw-theme] .agy-shell > .shrink-0{position:relative!important;z-index:30!important;background-color:color-mix(in srgb,${t.chrome} 30%,transparent)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;border-bottom:0!important}
        body[data-aw-theme] .agy-user-bubble{color:var(--foreground);text-shadow:none}
        body[data-aw-theme] .agy-sidebar-row{--row-bg:transparent!important}
        body[data-aw-theme] .agy-sidebar-row:hover:not(.bg-sidebar-secondary){background-color:color-mix(in srgb,${t.fg} 7%,transparent)!important}
        body[data-aw-theme] .agy-sidebar-row.bg-sidebar-secondary,body[data-aw-theme] .agy-sidebar-row[data-active="true"]{background-color:color-mix(in srgb,${t.accent} 20%,${t.panel})!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;border:1px solid color-mix(in srgb,${t.accent} 35%,transparent)!important;box-shadow:0 2px 10px rgba(0,0,0,0.2)!important}
        body[data-aw-theme] :is(.agy-sidebar-row,[data-testid="conversation-row-history"]) .agy-row-actions::before{display:none!important;background:transparent!important}
        body[data-aw-theme] :is(.agy-sidebar-row,[data-testid="conversation-row-history"]) .agy-row-actions{background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;right:6px!important;gap:2px!important}
        body[data-aw-theme] .agy-row-actions button{border-radius:6px!important;background:transparent!important;transition:background .12s ease,color .12s ease}
        body[data-aw-theme] .agy-row-actions button:hover{background:color-mix(in srgb,${t.fg} 14%,transparent)!important;color:${t.fg}!important}
        body[data-aw-theme] .agy-sidebar-row:hover > div:nth-child(2),body[data-aw-theme] .agy-sidebar-row.bg-sidebar-secondary > div:nth-child(2),body[data-aw-theme] .agy-sidebar-row[data-active="true"] > div:nth-child(2){padding-right:76px!important;transition:padding-right .15s ease-out}
        body[data-aw-theme] .surface-opaque,body[data-aw-theme] .border-menu-border,body[data-aw-theme] [role="menu"],body[data-aw-theme] [data-radix-menu-content]{background-color:color-mix(in srgb,${t.panel} 88%,transparent)!important;backdrop-filter:blur(24px)!important;-webkit-backdrop-filter:blur(24px)!important;border:1px solid color-mix(in srgb,${t.border} 45%,transparent)!important;box-shadow:0 12px 36px rgba(0,0,0,0.45)!important;border-radius:8px!important}
        body[data-aw-theme] .agy-sheet [class*="pt-[30vh]"]{padding-top:0!important;justify-content:flex-end!important;padding-bottom:24px!important}
        body[data-aw-theme] .surface-composer{background:color-mix(in srgb,${t.border} 35%,transparent)!important;border:1px solid color-mix(in srgb,${t.border} 50%,transparent)!important;box-shadow:0 10px 32px rgba(0,0,0,0.25),0 0 0 1px color-mix(in srgb,${t.accent} 20%,transparent)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;color:var(--foreground);text-shadow:none}
        body[data-aw-theme] .surface-composer-card{background:color-mix(in srgb,${t.card} 85%,transparent)!important;box-shadow:none!important}
        body[data-aw-theme] .md-sticky-message-bleed,body[data-aw-theme] .md-sticky-message-bleed::before,body[data-aw-theme] .md-sticky-message-bleed::after{background:transparent!important}
        body[data-aw-theme] .agy-sheet [class*=bottom-0][class*=pointer-events-none]{background-image:none!important}
        body[data-aw-theme] .agy-sheet[data-sheet-inset] [data-main-content-body],body[data-aw-theme] .agy-inset-shell [data-side-panel-body]{background-color:transparent!important}
        ${viewerReset}
      `;
    }else{
      document.body.dataset.awTheme=t.id;document.body.dataset.awMode=t.light?'light':'dark';host.style.colorScheme=t.light?'light':'dark';
      const tokens={secondary:`color-mix(in srgb,${t.accent} ${t.light?'18':'22'}%,${t.panel})`,background:t.chrome,foreground:t.fg,'secondary-foreground':t.muted,'muted-foreground':t.muted,muted:t.card,card:t.card,'card-border':t.border,border:t.border,sidebar:t.chrome,'sidebar-muted':t.card,'sidebar-secondary':t.panel,primary:t.accent,'primary-foreground':t.fg,'cta-foreground':t.light?'#ffffff':t.sky,popover:t.panel,'popover-foreground':t.fg,accent:t.card,'accent-foreground':t.fg,input:t.border,ring:t.accent};
      const declarations=Object.entries(tokens).flatMap(([k,v])=>[`--${k}:${v}!important`,`--color-${k}:${v}!important`]).join(';');
      const editor=`--editor-code-block-background:${t.panel}!important;--code-foreground:${t.light?'#875632':'#e7c59e'}!important;--editor-selection-background:${t.light?'#538da52e':'#9fbae133'}!important;--color-selection-background:${t.light?'#538da52e':'#9fbae133'}!important;--glass-border:${t.border}!important;--glass:color-mix(in srgb,${t.light?t.panel:t.card} 82%,transparent)!important;--glass-highlight:${t.light?'rgb(255 255 255 / .7)':'rgb(255 255 255 / .06)'}!important;--focus-ring-color:${t.accent}!important;--editor-line-number-foreground:${t.muted}!important;--color-editorLineNumber-foreground:${t.muted}!important;`;
      style.textContent=`
        body[data-aw-theme],body[data-aw-theme] #root .dark,body[data-aw-theme] #root .light,body[data-aw-theme] .agy-shell{${declarations};${editor}color-scheme:${t.light?'light':'dark'};color:${t.fg}}
        body[data-aw-theme] .agy-shell{position:relative!important;isolation:isolate!important;background:transparent!important;--max-conversation-width:min(60rem,50vw)!important}
        body[data-aw-theme] .agy-inset-shell{background:transparent!important;background-color:transparent!important}
        body[data-aw-theme] .agy-sheet{isolation:isolate;background:transparent!important;background-color:transparent!important}
        body[data-aw-theme] .bg-sidebar{background:transparent!important;background-color:transparent!important}
        body[data-aw-theme] .agy-inset-shell > div:first-child > div:first-child,body[data-aw-theme] [aria-label="Sidebar"],body[data-aw-theme] nav.bg-sidebar{background-color:color-mix(in srgb,${t.chrome} 30%,transparent)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;border-right:1px solid color-mix(in srgb,${t.border} 30%,rgba(255,255,255,0.08))!important}
        body[data-aw-theme] .agy-shell > .shrink-0{position:relative!important;z-index:30!important;background-color:color-mix(in srgb,${t.chrome} 30%,transparent)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;border-bottom:0!important}
        body[data-aw-theme] .agy-sidebar-row{--row-bg:transparent!important}
        body[data-aw-theme] .agy-sidebar-row:hover:not(.bg-sidebar-secondary){background-color:color-mix(in srgb,${t.fg} 7%,transparent)!important}
        body[data-aw-theme] .agy-sidebar-row.bg-sidebar-secondary,body[data-aw-theme] .agy-sidebar-row[data-active="true"]{background-color:color-mix(in srgb,${t.accent} 20%,${t.panel})!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;border:1px solid color-mix(in srgb,${t.accent} 35%,transparent)!important;box-shadow:0 2px 10px rgba(0,0,0,0.2)!important}
        body[data-aw-theme] :is(.agy-sidebar-row,[data-testid="conversation-row-history"]) .agy-row-actions::before{display:none!important;background:transparent!important}
        body[data-aw-theme] :is(.agy-sidebar-row,[data-testid="conversation-row-history"]) .agy-row-actions{background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;right:6px!important;gap:2px!important}
        body[data-aw-theme] .agy-row-actions button{border-radius:6px!important;background:transparent!important;transition:background .12s ease,color .12s ease}
        body[data-aw-theme] .agy-row-actions button:hover{background:color-mix(in srgb,${t.fg} 14%,transparent)!important;color:${t.fg}!important}
        body[data-aw-theme] .agy-sidebar-row:hover > div:nth-child(2),body[data-aw-theme] .agy-sidebar-row.bg-sidebar-secondary > div:nth-child(2),body[data-aw-theme] .agy-sidebar-row[data-active="true"] > div:nth-child(2){padding-right:76px!important;transition:padding-right .15s ease-out}
        body[data-aw-theme] .surface-opaque,body[data-aw-theme] .border-menu-border,body[data-aw-theme] [role="menu"],body[data-aw-theme] [data-radix-menu-content]{background-color:color-mix(in srgb,${t.panel} 88%,transparent)!important;backdrop-filter:blur(24px)!important;-webkit-backdrop-filter:blur(24px)!important;border:1px solid color-mix(in srgb,${t.border} 45%,transparent)!important;box-shadow:0 12px 36px rgba(0,0,0,0.45)!important;border-radius:8px!important}
        body[data-aw-theme] .agy-sheet [class*="pt-[30vh]"]{padding-top:0!important;justify-content:flex-end!important;padding-bottom:24px!important}
        @media(max-width:900px){body[data-aw-theme] .agy-shell{--max-conversation-width:100%!important}}
        body[data-aw-theme] .agy-sheet{text-shadow:0 0 2px ${t.light?t.floor:t.sky},0 0 6px ${t.light?t.floor:t.sky},0 0 12px ${t.light?t.floor:t.sky}}body[data-aw-theme] .surface-composer{text-shadow:none}body[data-aw-theme] .agy-user-bubble{color:var(--foreground);text-shadow:none}
        body[data-aw-theme] .md-sticky-message-bleed,body[data-aw-theme] .md-sticky-message-bleed::before,body[data-aw-theme] .md-sticky-message-bleed::after{background:transparent!important}
        body[data-aw-theme] .agy-sheet [class*=bottom-0][class*=pointer-events-none]{background-image:none!important}
        body[data-aw-theme] .agy-sheet[data-sheet-inset] [data-main-content-body],body[data-aw-theme] .agy-inset-shell [data-side-panel-body]{background-color:transparent!important}
        body[data-aw-theme] .surface-composer{background:color-mix(in srgb,${t.border} 35%,transparent)!important;border:1px solid color-mix(in srgb,${t.border} 50%,transparent)!important;box-shadow:0 10px 32px rgba(0,0,0,0.25),0 0 0 1px color-mix(in srgb,${t.accent} 20%,transparent)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important}
        body[data-aw-theme] .surface-composer-card{background:color-mix(in srgb,${t.card} 85%,transparent)!important;box-shadow:none!important}
        body[data-aw-theme] ::selection{background:${t.light?'#72b5d34d':'#a4bbe645'}}
        body[data-aw-theme] ::-webkit-scrollbar-thumb{background:color-mix(in srgb,${t.muted} 45%,transparent);border-radius:8px}body[data-aw-theme] input,body[data-aw-theme] textarea,body[data-aw-theme] [contenteditable=true]{caret-color:${t.fg}}
        body[data-aw-mode=light] pre,body[data-aw-mode=light] code{--syntax-string:#477148;--syntax-keyword:#795498;--syntax-comment:#627b72}
        ${viewerReset}
      `;
    }
    const ui=hostPalette(off,t);
    for(const k of ['panel','card','fg','muted','border','accent'])host.style.setProperty('--aw-'+k,ui[k]);
    const colors=!off?{color:'#00000000',symbolColor:t.fg}:originalChrome;
    if(colors)windowAPI?.setTitleBarOverlay(colors)?.catch?.(()=>{});
  }
  function apply(){
    if(!shadow)return;
    const t=current(),off=prefs.theme==='off';appearance(t,off);
    if(canvas)canvas.hidden=off;
    shadow.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===prefs.theme)));
    const pause=shadow.querySelector('.pause');pause.textContent=prefs.paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(prefs.paused));pause.disabled=off;
    const range=shadow.querySelector('input[type=range]'),glyphs=shadow.querySelector('.glyphs'),scale=shadow.querySelector('.scale'),recolor=shadow.querySelector('.recolor'),reactive=shadow.querySelector('.reactive');
    range.value=String(prefs.intensity);range.disabled=off;glyphs.value=prefs.glyphs;glyphs.disabled=off;scale.value=prefs.scale;scale.disabled=off;recolor.checked=prefs.recolor;recolor.disabled=off;reactive.checked=prefs.reactive;reactive.disabled=off;shadow.querySelector('.quota-pref').checked=prefs.quota;
    shadow.querySelector('.value').textContent=prefs.intensity+'%';label();
    shadow.querySelector('.status').textContent=off?'Original appearance restored':`${t.name}, ${t.light?'light':'dark'} appearance`;
    render();syncLayout();schedule();
  }
  function mount(){
    const target=document.querySelector('.agy-shell')||document.querySelector('.agy-sheet');if(!target)return;host.style.visibility='visible';
    sheet=document.querySelector('.agy-sheet');
    if(shell!==target||!canvas?.isConnected){resizeObserver?.disconnect();cancelAnimationFrame(resizeRaf);resizeRaf=0;canvas?.remove();shell=target;sampleChrome();canvas=make('canvas',{id:'agy-ascii-scene','aria-hidden':'true'});Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'-1',pointerEvents:'none'});shell.prepend(canvas);ctx=canvas.getContext('2d',{alpha:false});resizeObserver=new ResizeObserver(()=>{if(!resizeRaf)resizeRaf=requestAnimationFrame(()=>{resizeRaf=0;if(!alive)return;resize();syncLayout(true);render();});});resizeObserver.observe(shell);resize();apply();}
    else{if(needsModeSync&&prefs.theme!=='off'&&prefs.recolor)setMode(current(),false);else needsModeSync=false;syncLayout();}
  }
  function resize(){const target=shell||sheet;if(!target)return;const r=target.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.5);sceneWidth=r.width;sceneHeight=r.height;canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);ctx.setTransform(d,0,0,d,0,0);}
  function render(){if(ctx&&canvas&&!canvas.hidden){drawAsciiScene(ctx,sceneWidth,sceneHeight,current(),time,.35+.65*prefs.intensity/100,calmBox,{energy,pulse,glyphs:prefs.glyphs,scale:prefs.scale});}}
  function stopPreviews(){cancelAnimationFrame(previewRaf);previewRaf=0;}
  function drawPreview(c,t){drawAsciiScene(c.getContext('2d'),c.width,c.height,t,time,1,null,{glyphs:prefs.glyphs});c.dataset.previewKey=prefs.glyphs;}
  function previews(all=false){
    if(!shadow||!open)return;
    if(!all){if(prefs.theme==='off')return;const t=current(),c=shadow.querySelector(`[data-theme="${t.id}"] canvas`);if(c&&!c.parentNode.hidden)drawPreview(c,t);return;}
    stopPreviews();
    const queue=[];
    for(const t of themes){
      const c=shadow.querySelector(`[data-theme="${t.id}"] canvas`);
      if(!c||c.parentNode.hidden||c.dataset.previewKey===prefs.glyphs)continue;
      if(t.id===prefs.theme)drawPreview(c,t);else queue.push([c,t]);
    }
    if(!queue.length)return;
    let idx=0;
    const step=()=>{
      previewRaf=0;if(!alive||!open||document.hidden)return;
      for(let n=0;n<6&&idx<queue.length;){const [c,t]=queue[idx++];if(c.parentNode.hidden||c.dataset.previewKey===prefs.glyphs)continue;drawPreview(c,t);n++;}
      if(idx<queue.length)previewRaf=requestAnimationFrame(step);
    };
    previewRaf=requestAnimationFrame(step);
  }
  function schedule(){cancelAnimationFrame(raf);raf=0;last=performance.now();if(alive&&!suspended&&!document.hidden&&!prefs.paused&&prefs.theme!=='off')raf=requestAnimationFrame(tick);}
  function tick(now){
    if(!alive||suspended)return;
    if(now-last>=33){
      const dt=Math.min((now-last)/1000,.1);last=now;
      // Ease into and out of the working state so a quick tool call never makes the scene lurch.
      const target=prefs.reactive&&agents>0?1:0;energy+=(target-energy)*Math.min(1,dt*(target?1.2:.6));if(energy<.002)energy=0;
      pulse=Math.max(0,pulse-dt/1.8);
      time+=dt*(1+.8*energy);render();
      if(open&&Math.floor(time*5)!==lastPreview){lastPreview=Math.floor(time*5);previews();}
    }
    raf=requestAnimationFrame(tick);
  }
  function pauseActivity(keepAlive){
    if(keepAlive)suspended=true;else alive=false;
    cancelAnimationFrame(raf);raf=0;cancelAnimationFrame(resizeRaf);resizeRaf=0;stopPreviews();
    clearTimeout(layoutTimer);layoutTimer=0;clearInterval(quotaTimer);quotaTimer=0;
    clearQuotaWork();observer?.disconnect();resizeObserver?.disconnect();
  }
  function resumeActivity(){
    suspended=false;
    observer?.observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
    if(shell?.isConnected)resizeObserver?.observe(shell);else mount();
    if(!quotaTimer)quotaTimer=setInterval(loadQuota,60000);
    render();syncLayout();schedule();loadQuota();
  }
  function dispose(){pauseActivity(false);unhookAgents?.();cleanups.forEach(f=>f());setMode(current(),true);delete document.body.dataset.awTheme;delete document.body.dataset.awMode;canvas?.remove();host?.remove();style?.remove();if(originalChrome)windowAPI?.setTitleBarOverlay(originalChrome)?.catch?.(()=>{});window.__agyAsciiInstalled=false;}
  async function start(){
    window.__agyAsciiDispose=dispose;
    listen(window,'pagehide',e=>{if(!e?.persisted)dispose();else pauseActivity(true);});
    listen(window,'pageshow',e=>{if(e?.persisted&&alive&&suspended)resumeActivity();});
    try{const data=native?await native.get():{[KEY]:localStorage.getItem(KEY)};if(data?.[KEY])prefs=validate(JSON.parse(data[KEY]));}catch{}
    if(!alive)return;
    shell=document.querySelector('.agy-shell');sampleChrome();
    style=make('style',{id:'agy-ascii-style'});document.head.append(style);build();mount();
    observer=new MutationObserver(records=>{if(records?.some(r=>[...(r.addedNodes||[])].some(n=>n.nodeType===1)))needsModeSync=true;if(!layoutTimer)layoutTimer=setTimeout(()=>{layoutTimer=0;mount();},120);});observer.observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
    loadQuota();quotaTimer=setInterval(loadQuota,60000);
    listen(window,'resize',syncLayout);listen(document,'visibilitychange',()=>{if(document.hidden)stopPreviews();else{render();syncLayout();loadQuota();if(open)previews(true);}schedule();});listen(reduced,'change',()=>{if(reduced.matches){prefs.paused=true;apply();save();}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
