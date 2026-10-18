import { openDB, type DBSchema } from 'idb';
import { type Project, type Work, type Settings, projectSchema, defaultSettings } from './model';
import { defaultCatalog } from './catalog';
interface EstimateDB extends DBSchema {
  projects: { key:string; value:Project; indexes:{'updatedAt':string} };
  config:{ key:string; value:Work[]|Settings };
}
const DB_NAME='academia-repair-estimates';
let database:ReturnType<typeof openDB<EstimateDB>>|null=null;
export function db(){
  if(!database)database=openDB<EstimateDB>(DB_NAME,1,{upgrade(db){const store=db.createObjectStore('projects',{keyPath:'id'});store.createIndex('updatedAt','updatedAt');db.createObjectStore('config');},blocking(){database?.then(db=>db.close());database=null;}}).catch(e=>{database=null;throw e;});
  return database;
}
export async function loadAll(){const d=await db();const [projects,catalog,settings]=await Promise.all([d.getAll('projects'),d.get('config','catalog'),d.get('config','settings')]);return {projects:projects.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),catalog:(catalog as Work[]|undefined)??defaultCatalog,settings:(settings as Settings|undefined)??defaultSettings};}
export class ConflictError extends Error {constructor(){super('Объект изменён в другой вкладке. Откройте свежую версию или сохраните резервную копию.');}}
export async function saveProject(p:Project){
  projectSchema.parse(p);const d=await db(),tx=d.transaction('projects','readwrite'),existing=await tx.store.get(p.id);
  if(existing&&existing.revision!==p.revision){tx.abort();await tx.done.catch(()=>{});throw new ConflictError();}
  const saved={...p,revision:p.revision+1};await tx.store.put(saved);await tx.done;return saved;
}
export async function deleteProject(id:string){return (await db()).delete('projects',id);}
export async function saveConfig(catalog:Work[],settings:Settings){const d=await db(),tx=d.transaction('config','readwrite');await Promise.all([tx.store.put(catalog,'catalog'),tx.store.put(settings,'settings')]);await tx.done;}
export async function importProjects(projects:Project[],catalog?:Work[],settings?:Settings){const d=await db(),tx=d.transaction(['projects','config'],'readwrite');for(const p of projects){if(await tx.objectStore('projects').get(p.id)){tx.abort();await tx.done.catch(()=>{});throw new ConflictError();}await tx.objectStore('projects').put({...p,revision:1});}if(catalog)await tx.objectStore('config').put(catalog,'catalog');if(settings)await tx.objectStore('config').put(settings,'settings');await tx.done;}
