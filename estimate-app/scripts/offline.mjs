import { readdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
const out=join(process.cwd(),'out');
async function files(dir){const all=[];for(const item of await readdir(dir,{withFileTypes:true})){const path=join(dir,item.name);if(item.isDirectory())all.push(...await files(path));else all.push(path);}return all;}
const paths=await files(out),hash=createHash('sha256');for(const path of paths)hash.update(await readFile(path));
const version=hash.digest('hex').slice(0,14),urls=['/smeta','/smeta/',...paths.filter(p=>!p.endsWith('.map')).map(p=>'/smeta/'+relative(out,p).split('\\').join('/'))];
const source=`const CACHE='academia-smeta-${version}';const ASSETS=${JSON.stringify(urls)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil((async()=>{const old=(await caches.keys()).filter(k=>k.startsWith('academia-smeta-')&&k!==CACHE);for(const k of old.slice(0,-1))await caches.delete(k);await self.clients.claim();})()));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||!u.pathname.startsWith('/smeta'))return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(async()=>{const cached=await caches.match('/smeta/index.html');return cached||Response.error();}));return;}e.respondWith((async()=>{const cached=await caches.match(e.request,{ignoreSearch:true});if(cached)return cached;return fetch(e.request);})());});`;
await writeFile(join(process.cwd(),'..','smeta-sw.js'),source);
const destination=join(process.cwd(),'..','smeta');await rm(destination,{recursive:true,force:true});await cp(out,destination,{recursive:true});
console.log('Static app → /smeta. Offline resources:',urls.length,'Version:',version);
