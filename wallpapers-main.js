/* Isolated wallpaper preferences; never writes Antigravity's settings file. */
;(() => {
  'use strict';
  const {app,ipcMain}=require('electron');
  const fs=require('fs'), path=require('path');
  const THEMES=new Set(['off','clouds','aurora','lagoon','koi','jelly','boats','sakura','fireflies','moon','dunes','rain','snow','lanterns','meadow','galaxy','bamboo','code','tide','autumn','alpine','retro','lava','catnap','supercell','vents','candles','neon','blackhole','volcano','starry','radar','saturn','kelp','glitch','peacock','blueprint','stainedglass','inkwash','glacier','balloons','reef','popart','cranes','tea','oasis','lavender','windmills','island','opart','zen']);
  const file=()=>path.join(app.getPath('userData'),'ascii-wallpapers-preferences.json');
  function assertOrigin(event){
    const sf=event?.senderFrame,sender=event?.sender;
    if(!sf||sf.parent||(sender?.mainFrame&&sf!==sender.mainFrame)||sender?.getType?.()==='webview'||!/^https:\/\/127\.0\.0\.1:\d+\//.test(sf.url||'')){
      throw Error('Unsupported wallpaper origin');
    }
  }
  ipcMain.handle('ascii-wallpapers:get',event=>{
    assertOrigin(event);
    try{return JSON.parse(fs.readFileSync(file(),'utf8'));}catch{return {};}
  });
  ipcMain.handle('ascii-wallpapers:save',(event,changes)=>{
    assertOrigin(event);
    const key='asciiWallpaperPreferences.v1',raw=changes?.[key];
    if(typeof raw!=='string'||raw.length>1024)throw Error('Invalid wallpaper preferences');
    let p;
    try{p=JSON.parse(raw);}catch{throw Error('Invalid wallpaper preferences');}
    if(!p||typeof p!=='object'||Array.isArray(p)||!THEMES.has(p.theme)||!Number.isFinite(p.intensity)||p.intensity<15||p.intensity>100||typeof p.paused!=='boolean'||(p.reactive!==undefined&&typeof p.reactive!=='boolean')||(p.recolor!==undefined&&typeof p.recolor!=='boolean')||(p.glyphs!==undefined&&!['ascii','braille','blocks','katakana'].includes(p.glyphs))||(p.scale!==undefined&&!['fine','normal','chunky'].includes(p.scale))||(p.quota!==undefined&&typeof p.quota!=='boolean'))throw Error('Invalid wallpaper preferences');
    const data=JSON.stringify({[key]:JSON.stringify({theme:p.theme,intensity:p.intensity,paused:p.paused,reactive:p.reactive!==false,recolor:p.recolor!==false,glyphs:p.glyphs||'ascii',scale:p.scale||'normal',quota:p.quota!==false})});
    const target=file(),tmp=`${target}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    fs.mkdirSync(path.dirname(target),{recursive:true});
    try{fs.writeFileSync(tmp,data,'utf8');fs.renameSync(tmp,target);}catch(e){try{fs.unlinkSync(tmp);}catch{}throw e;}
  });
})();
