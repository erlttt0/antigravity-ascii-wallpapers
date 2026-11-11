/* Usage: node manage-wallpapers.cjs install|verify|status|restore|uninstall [app-or-asar-path] */
'use strict';
const fs=require('fs'), path=require('path'), crypto=require('crypto'), vm=require('vm'), os=require('os');
const isFile=p=>{try{return fs.existsSync(p)&&fs.statSync(p).isFile();}catch{return false;}};
function resolveArchive(customArg){
 const custom=customArg||process.argv[3]||process.env.ANTIGRAVITY_ASAR||process.env.ANTIGRAVITY_APP_PATH;
 if(custom){
  const p=path.resolve(custom);
  if(isFile(p))return p;
  const nested=[path.join(p,'Contents','Resources','app.asar'),path.join(p,'resources','app.asar'),path.join(p,'app.asar')].find(isFile);
  if(nested)return nested;
  try{if(fs.existsSync(p)&&fs.statSync(p).isDirectory())return path.join(p,'app.asar');}catch{}
  return p;
 }
 const candidates=process.platform==='darwin'
  ? ['/Applications/Antigravity.app/Contents/Resources/app.asar',path.join(os.homedir(),'Applications','Antigravity.app','Contents','Resources','app.asar')]
  : process.platform==='win32'
  ? [
      ...(process.env.LOCALAPPDATA?[path.join(process.env.LOCALAPPDATA,'Programs','antigravity','resources','app.asar'),path.join(process.env.LOCALAPPDATA,'Programs','Antigravity','resources','app.asar')]:[]),
      ...(process.env.ProgramFiles?[path.join(process.env.ProgramFiles,'Antigravity','resources','app.asar'),path.join(process.env.ProgramFiles,'antigravity','resources','app.asar')]:[])
    ]
  : process.platform==='linux'
  ? [
      '/opt/Antigravity/resources/app.asar',
      '/opt/antigravity/resources/app.asar',
      '/usr/lib/antigravity/resources/app.asar',
      '/usr/lib/Antigravity/resources/app.asar',
      path.join(os.homedir(),'.local','share','antigravity','resources','app.asar'),
      path.join(os.homedir(),'.local','share','Antigravity','resources','app.asar')
    ]
  : [];
 return candidates.find(fs.existsSync)||candidates[0]||'';
}
const appDirOf=arch=>path.dirname(path.dirname(arch||''));
const MARKER='// BEGIN LOCAL ASCII WALLPAPERS';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
// Builds that were inspected by hand. Any other build must pass inspect() before it is patched.
const VERIFIED={
 '046fa2ba9abe96bc915eb7ed12887c067396a8a12148842ab4f4e2cd05a68feb':'2.28.2',
 '290e1b7a1caa430a0c5367c7b433e8d284e2ca5d0b305e91e5ce8ec926f43283':'2.29.0'
};
function parse(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length<16||bytes.readUInt32LE(0)!==4)throw Error('Unexpected ASAR format');
 const dataStart=8+bytes.readUInt32LE(4),headerLen=bytes.readUInt32LE(12);
 if(dataStart<16||dataStart>bytes.length||16+headerLen>dataStart)throw Error('Unexpected ASAR format');
 const header=JSON.parse(bytes.subarray(16,16+headerLen).toString('utf8'));
 return {header,dataStart};
}
function entries(header){
 const map=new Map();
 (function walk(tree,prefix){for(const [name,item] of Object.entries(tree.files||{})){const p=prefix?prefix+'/'+name:name;if(item.files)walk(item,p);else map.set(p,item);}})(header,'');
 return map;
}
function packedText(bytes,p){
 const {header,dataStart}=parse(bytes),item=entries(header).get(p);
 if(!item||item.unpacked||item.link)return null;
 const off=Number(item.offset),size=Number(item.size);
 if(!Number.isFinite(off)||!Number.isFinite(size)||off<0||size<0||dataStart+off+size>bytes.length)throw Error('Unexpected ASAR format');
 return bytes.subarray(dataStart+off,dataStart+off+size).toString('utf8');
}
// Electron fuses live after a fixed sentinel in the executable. Fuse 4 is EnableEmbeddedAsarIntegrityValidation:
// if a build turns it on, any edited archive would stop the app from launching, so refuse instead.
const FUSE_SENTINEL=Buffer.from('dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX');
function scanFuseWire(buf,limit=buf.length,state={seenOff:false,seenUnknown:false}){
 let pos=0;
 while((pos=buf.indexOf(FUSE_SENTINEL,pos))>=0&&pos<limit){
  const w=pos+FUSE_SENTINEL.length;
  pos++;
  if(w+2>buf.length||buf[w]!==1){state.seenUnknown=true;continue;}
  const len=buf[w+1];
  if(len<=4||w+2+len>buf.length){state.seenUnknown=true;continue;}
  const flag=buf.subarray(w+2,w+2+len).toString('latin1')[4];
  if(flag==='1')return 'on';
  if(flag==='0')state.seenOff=true;else state.seenUnknown=true;
 }
 return null;
}
function asarIntegrityFuse(targetDir=appDirOf(resolveArchive())){
 const exe=process.platform==='darwin'
  ? path.join(targetDir,'Frameworks','Electron Framework.framework','Electron Framework')
  : process.platform==='win32'
  ? path.join(targetDir,'Antigravity.exe')
  : [path.join(targetDir,'antigravity'),path.join(targetDir,'Antigravity')].find(fs.existsSync)||path.join(targetDir,'antigravity');
 if(!fs.existsSync(exe))return 'unknown';
 const state={seenOff:false,seenUnknown:false};
 let fd;
 try{
  fd=fs.openSync(exe,'r');
  const CHUNK=4*1024*1024,TAIL=512,buf=Buffer.allocUnsafe(CHUNK+TAIL);
  let pos=0;
  for(;;){
   const n=fs.readSync(fd,buf,0,buf.length,pos);
   if(n<=0)break;
   const eof=n<buf.length,limit=eof?n:n-TAIL;
   const hit=scanFuseWire(buf.subarray(0,n),limit,state);
   if(hit==='on')return 'on';
   if(eof)break;
   pos+=limit;
  }
  return !state.seenUnknown&&state.seenOff?'off':'unknown';
 }catch(e){
  if(e?.code==='ENOENT'||e?.code==='ENOTDIR'){
   let bytes;
   try{bytes=fs.readFileSync(exe);}catch{return 'unknown';}
   const hit=scanFuseWire(bytes,bytes.length,state);
   if(hit==='on')return 'on';
   return !state.seenUnknown&&state.seenOff?'off':'unknown';
  }
  return 'unknown';
 }finally{
  if(fd!==undefined){try{fs.closeSync(fd);}catch{}}
 }
}
// Compile the patched file the way Electron loads CommonJS, without running it.
function compiles(source,name){
 try{new vm.Script('(function (exports, require, module, __filename, __dirname) {'+source+'\n})',{filename:name});return true;}catch{return false;}
}
function inspect(original,script,mainScript,targetDir=appDirOf(resolveArchive())){
 const errors=[],warnings=[];
 let pkg={};try{pkg=JSON.parse(packedText(original,'package.json')||'{}');}catch{}
 const preload=packedText(original,'dist/preload.js'),main=packedText(original,'dist/main.js');
 if(pkg.productName!=='Antigravity')errors.push('package.json does not describe Antigravity');
 if(pkg.main!=='dist/main.js')errors.push('the app entry point is no longer dist/main.js');
 if(preload===null)errors.push('dist/preload.js is missing or not packed in the archive');
 if(main===null)errors.push('dist/main.js is missing or not packed in the archive');
 if(preload?.includes(MARKER)||main?.includes(MARKER))errors.push('this archive already contains wallpapers but has no matching backup; reinstall Antigravity to get a clean copy');
 if(preload!==null&&/\bdrawAsciiScene\b/.test(preload))errors.push('dist/preload.js already declares drawAsciiScene');
 if(preload!==null&&!compiles(preload+'\n\n'+MARKER+'\n;\n'+script,'dist/preload.js'))errors.push('the patched dist/preload.js would not compile');
 if(main!==null&&!compiles(main+'\n\n'+MARKER+'\n;\n'+mainScript,'dist/main.js'))errors.push('the patched dist/main.js would not compile');
 const fuse=asarIntegrityFuse(targetDir);
 if(fuse==='on')errors.push('Electron ASAR integrity validation is enabled for this build');
 if(fuse==='unknown'&&process.platform==='darwin')errors.push('could not verify the macOS Electron ASAR integrity fuse; refusing to modify the application');
 else if(fuse==='unknown')warnings.push('could not read Electron fuses from '+(process.platform==='win32'?'Antigravity.exe':'antigravity binary'));
 if(preload!==null){
  if(!preload.includes('const electron_1 = require("electron")'))warnings.push('preload has no electron_1; preferences fall back to page storage');
  if(!preload.includes('electronNativeAPI'))warnings.push('preload has no electronNativeAPI; the title bar will not be recolored');
  if(!preload.includes("'agent:update-active-count'"))warnings.push('preload no longer reports running agents; "React to agents" will have no effect');
 }
 return {version:pkg.version||'unknown',verified:VERIFIED[sha(original)]===pkg.version,errors,warnings};
}
function repack(original,script,mainScript){
 const {header,dataStart}=parse(original);
 const chunks=[];let offset=0;
 function walk(tree,prefix=''){
  for(const [name,item] of Object.entries(tree.files||{})){
   const p=prefix?prefix+'/'+name:name;
   if(item.files){walk(item,p);continue;}
   if(item.unpacked||item.link)continue;
   const off=Number(item.offset),sz=Number(item.size);
   if(!Number.isFinite(off)||!Number.isFinite(sz)||off<0||sz<0||dataStart+off+sz>original.length)throw Error('Unexpected ASAR format');
   let content=original.subarray(dataStart+off,dataStart+off+sz);
   if(p==='dist/preload.js'||p==='dist/main.js'){
    content=Buffer.concat([content,Buffer.from('\n\n'+MARKER+'\n;\n'),Buffer.from(p==='dist/preload.js'?script:mainScript)]);
    const blockSize=item.integrity?.blockSize||4194304,blocks=[];
    for(let i=0;i<content.length;i+=blockSize)blocks.push(sha(content.subarray(i,i+blockSize)));
    item.integrity={algorithm:'SHA256',hash:sha(content),blockSize,blocks};
   }
   item.offset=String(offset);item.size=content.length;offset+=content.length;chunks.push(content);
  }
 }
 walk(header);
 const json=Buffer.from(JSON.stringify(header));
 const padded=Math.ceil((4+json.length)/4)*4;
 const head=Buffer.alloc(4+padded);
 head.writeUInt32LE(padded,0);head.writeUInt32LE(json.length,4);json.copy(head,8);
 const size=Buffer.alloc(8);size.writeUInt32LE(4,0);size.writeUInt32LE(head.length,4);
 const output=Buffer.concat([size,head,...chunks]);
 // Verify every packed file after rebuilding offsets, including the edited preload and block hashes.
 const decoded=parse(output);
 function verify(tree){for(const item of Object.values(tree.files||{})){
  if(item.files){verify(item);continue;}if(item.unpacked||item.link)continue;
  const data=output.subarray(decoded.dataStart+Number(item.offset),decoded.dataStart+Number(item.offset)+item.size);
  if(data.length!==item.size)throw Error('Repacked archive verification failed');
  if(item.integrity){
   if(sha(data)!==item.integrity.hash)throw Error('Repacked archive verification failed');
   if(Array.isArray(item.integrity.blocks)){
    const bs=item.integrity.blockSize||4194304;
    if(data.length>0&&Math.ceil(data.length/bs)!==item.integrity.blocks.length)throw Error('Repacked archive verification failed');
    for(let i=0,bi=0;i<data.length;i+=bs,bi++)if(sha(data.subarray(i,i+bs))!==item.integrity.blocks[bi])throw Error('Repacked archive verification failed');
   }
  }
 }}verify(decoded.header);
 return output;
}
function permissionError(p){
 if(process.platform==='win32')return Error('Permission denied writing to '+p+'. Run PowerShell as Administrator and try again.');
 return Error('Permission denied writing to '+p+'. Run with: sudo node manage-wallpapers.cjs '+(process.argv[2]||'install'));
}
function replace(bytes,targetArchive=resolveArchive()||'app.asar'){
 const temp=targetArchive+'.ascii-wallpapers.tmp.'+process.pid;
 try{fs.writeFileSync(temp,bytes);fs.renameSync(temp,targetArchive);}
 catch(e){
  try{fs.unlinkSync(temp);}catch{}
  if(e.code==='EBUSY')throw Error('The app archive is in use. Close Antigravity completely (including the tray icon) and try again.');
  if(['EACCES','EPERM'].includes(e.code)){
   if(process.platform==='win32')throw Error('Permission denied writing to '+targetArchive+'. Run PowerShell as Administrator, or close Antigravity completely and try again.');
   throw permissionError(targetArchive);
  }
  throw e;
 }
}
function readReceipt(receiptPath,backupPath){
 if(!fs.existsSync(receiptPath))return null;
 try{
  const parsed=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('invalid');
  return parsed;
 }catch{
  throw Error('Corrupt wallpaper receipt at '+receiptPath+'; remove it or restore from '+backupPath);
 }
}
function writeAtomic(target,data){
 const tmp=target+'.tmp.'+process.pid+'.'+Date.now()+'.'+Math.random().toString(36).slice(2);
 try{fs.writeFileSync(tmp,data);fs.renameSync(tmp,target);}
 catch(e){
  try{fs.unlinkSync(tmp);}catch{}
  if(['EACCES','EPERM'].includes(e.code))throw permissionError(target);
  throw e;
 }
}
function main(){
 let action=process.argv[2];
 if(action==='uninstall')action='restore';
 if(!['install','restore','verify','status'].includes(action))throw Error('Use install, verify, status, restore, or uninstall');
 const archive=resolveArchive(),appDir=appDirOf(archive),backup=archive+'.ascii-wallpapers.backup',receipt=archive+'.ascii-wallpapers.json';
 if(!archive||!isFile(archive))throw Error('Antigravity was not found at '+archive);
 const current=fs.readFileSync(archive),digest=sha(current);
 const r=readReceipt(receipt,backup);
 if(action==='restore'){
  if(!r||!fs.existsSync(backup))throw Error('No wallpaper backup found');
  if(digest===r.original){console.log('Original app is already restored.');return;}
  if(digest!==r.patched)throw Error('The app has changed since installation (probably an update, which already removed the wallpapers). Nothing to restore.');
  const b=fs.readFileSync(backup);if(sha(b)!==r.original)throw Error('Backup checksum does not match');
  replace(b,archive);console.log('Original Antigravity '+(r.version||'')+' restored. Reload its window to remove wallpapers.');return;
 }
 // Find the clean archive: the backup when our patch is installed, otherwise the archive itself.
 let original=current,state='not installed';
 if(r&&digest===r.patched){
  if(!fs.existsSync(backup))throw Error('Wallpapers are installed but the backup is missing');
  original=fs.readFileSync(backup);
  if(sha(original)!==r.original)throw Error('Original backup checksum does not match');
  state='installed';
 }else if(r&&digest!==r.original)state='removed by an app update';
 const script=fs.readFileSync(path.join(__dirname,'wallpaper-scenes.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'ascii-wallpapers.js'),'utf8');
 const mainScript=fs.readFileSync(path.join(__dirname,'wallpapers-main.js'),'utf8');
 const report=inspect(original,script,mainScript,appDir);
 const label='Antigravity '+report.version+(report.verified?' (hand-verified build)':' (checked automatically)');
 for(const w of report.warnings)console.warn('Note: '+w+'.');
 if(action==='status'){
  console.log(label+': wallpapers '+state+(r?' (last installed for '+r.version+' at '+r.installedAt+')':'')+'.');
  console.log(report.errors.length?'Cannot be patched:\n - '+report.errors.join('\n - '):'Ready to patch.');
  return;
 }
 if(report.errors.length)throw Error('Cannot patch '+label+':\n - '+report.errors.join('\n - '));
 const patched=repack(original,script,mainScript);
 if(action==='verify'){console.log(label+': archive rebuild verified, with all packed file integrity hashes intact. No files changed.');return;}
 if(digest===sha(patched)){console.log('Latest ASCII wallpapers are installed for '+label+'; checksum verified.');return;}
 // Backup, swap, and receipt update are bracketed so partial failures restore prior state.
 let createdBackup=false,movedOld='',swapped=false;
 try{
  if(fs.existsSync(backup)&&sha(fs.readFileSync(backup))!==sha(original)){
   const old=backup+'.'+(r?.version||'previous')+'-'+Date.now();
   try{fs.renameSync(backup,old);}catch(e){if(['EACCES','EPERM'].includes(e.code))throw permissionError(old);throw e;}
   movedOld=old;
  }
  if(!fs.existsSync(backup)){
   try{fs.writeFileSync(backup,original,{flag:'wx'});}catch(e){if(['EACCES','EPERM'].includes(e.code))throw permissionError(backup);throw e;}
   createdBackup=true;
  }
  const next={version:report.version,verified:report.verified,original:sha(original),patched:sha(patched),installedAt:new Date().toISOString(),backup};
  replace(patched,archive);
  swapped=true;
  // Written only after a successful swap, so a failed swap rolls back and leaves prior state intact.
  writeAtomic(receipt,JSON.stringify(next,null,2));
  if(movedOld)console.log('Kept the backup from the previous app build at '+movedOld);
  console.log('Installed ASCII wallpapers for '+label+'. Original archive backed up at '+backup);
 }catch(e){
  if(swapped){try{replace(original,archive);}catch{}}
  if(createdBackup){try{fs.unlinkSync(backup);}catch{}}
  if(movedOld){try{fs.renameSync(movedOld,backup);}catch{}}
  throw e;
 }
}
if(require.main===module){
 try{main();}catch(e){console.error(e.message);process.exitCode=1;}
}
module.exports={resolveArchive,replace,inspect,repack,parse,asarIntegrityFuse,VERIFIED,permissionError,main};
