import { z } from 'zod';

const positive = z.number().finite().min(0).max(10_000_000);
export const basisSchema = z.enum(['floor', 'wall', 'ceiling', 'perimeter', 'manual', 'object']);
export type Basis = z.infer<typeof basisSchema>;
export const workSchema = z.object({ id: z.string().min(1).max(100), title: z.string().min(1).max(200), category: z.string().max(100), unit: z.string().min(1).max(20), basis: basisSchema, laborPrice: positive, materialPrice: positive, custom: z.boolean().optional() });
export type Work = z.infer<typeof workSchema>;
export const openingSchema = z.object({ id: z.string(), kind: z.enum(['door','window']), width: positive.max(100), height: positive.max(100), count: positive.int().max(100) });
export const roomSchema = z.object({ id: z.string(), name: z.string().min(1).max(100), kind: z.string().max(100), length: positive.max(1000), width: positive.max(1000), height: positive.max(100), areaOverride: positive.nullable(), perimeterOverride: positive.nullable(), openings: z.array(openingSchema).max(100), notes: z.string().max(4000), reviewed: z.array(z.string()).max(50) });
export type Room = z.infer<typeof roomSchema>;
export const itemSchema = workSchema.extend({ id: z.string(), workId: z.string(), roomId: z.string(), quantity: positive.nullable(), note: z.string().max(2000) });
export type EstimateItem = z.infer<typeof itemSchema>;
export const projectSchema = z.object({ version: z.literal(1), id: z.string(), revision: z.number().int().nonnegative(), name: z.string().max(200), address: z.string().max(300), type: z.enum(['Квартира','Дом','Коммерческое помещение']), stage: z.string().max(100), declaredArea: positive.max(1_000_000), client: z.string().max(200), phone: z.string().max(60), foreman: z.string().max(200), notes: z.string().max(10000), conditions: z.array(z.string()).max(30), status: z.enum(['draft','calculated','agreed']), createdAt: z.string().datetime(), updatedAt: z.string().datetime(), rooms: z.array(roomSchema).max(100), items: z.array(itemSchema).max(10000), overhead: positive.max(100), reserve: positive.max(100), discount: positive.max(100), pricesConfirmed: z.boolean(), demo: z.boolean(), step: z.number().int().min(0).max(4) });
export type Project = z.infer<typeof projectSchema>;
export const settingsSchema = z.object({ company: z.string().max(200), phone: z.string().max(60), foreman: z.string().max(200), priceLabel: z.string().max(300) });
export type Settings = z.infer<typeof settingsSchema>;
export const defaultSettings: Settings = { company: 'ООО «АКАДЕМИЯ-ГРУПП»', phone: '+7 (989) 666-10-88', foreman: '', priceLabel: 'Примерные стартовые расценки. Замените их на прайс компании.' };
export const backupSchema = z.object({ format: z.literal('academia-estimate-backup'), schemaVersion: z.literal(1), exportedAt: z.string().datetime(), projects: z.array(projectSchema).max(1000), catalog: z.array(workSchema).max(2000), settings: settingsSchema }).superRefine((b,ctx)=>{
  const ids=new Set<string>();
  b.projects.forEach((p,i)=>{
    if(ids.has(p.id))ctx.addIssue({code:'custom',path:['projects',i],message:'Повторяющийся объект'}); ids.add(p.id);
    const roomIds=new Set(p.rooms.map(r=>r.id));
    if(roomIds.size!==p.rooms.length)ctx.addIssue({code:'custom',message:'Повторяющиеся помещения'});
    if(new Set(p.items.map(r=>r.id)).size!==p.items.length)ctx.addIssue({code:'custom',message:'Повторяющиеся работы'});
    if(p.items.some(item=>item.roomId!=='general'&&!roomIds.has(item.roomId)))ctx.addIssue({code:'custom',message:'Работа ссылается на отсутствующее помещение'});
  });
  if(new Set(b.catalog.map(w=>w.id)).size!==b.catalog.length)ctx.addIssue({code:'custom',message:'Повторяющиеся позиции прайса'});
});
export type Backup = z.infer<typeof backupSchema>;
export const uid = () => crypto.randomUUID();
export const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const statusLabels = { draft: 'Черновик', calculated: 'Рассчитано', agreed: 'Согласовано' };
export const basisLabels: Record<Basis,string> = { floor:'Площадь пола', wall:'Стены без проёмов', ceiling:'Площадь потолка', perimeter:'Периметр помещения', manual:'Указать вручную', object:'На объект / помещение' };
export function newRoom(name='Помещение 1', kind='Комната'): Room { return { id:uid(), name, kind, length:0, width:0, height:2.7, areaOverride:null, perimeterOverride:null, openings:[], notes:'', reviewed:[] }; }
export function newProject(name:string, type:Project['type'], address:string, declaredArea:number, settings:Settings): Project {
  const now=new Date().toISOString();return { version:1,id:uid(),revision:0,name,address,type,stage:'Новостройка',declaredArea,client:'',phone:'',foreman:settings.foreman,notes:'',conditions:[],status:'draft',createdAt:now,updatedAt:now,rooms:[],items:[],overhead:0,reserve:0,discount:0,pricesConfirmed:false,demo:false,step:0 };
}
export function geometry(r:Room) {
  const floor=round(r.areaOverride ?? r.length*r.width), perimeter=round(r.perimeterOverride ?? 2*(r.length+r.width));
  const openings=round(r.openings.reduce((s,o)=>s+o.width*o.height*o.count,0));
  return { floor,ceiling:floor,perimeter,openings,wall:round(Math.max(0,perimeter*r.height-openings)),grossWall:round(perimeter*r.height) };
}
export function projectArea(p:Project) { const a=round(p.rooms.reduce((s,r)=>s+geometry(r).floor,0));return a || p.declaredArea; }
export function quantity(p:Project,item:EstimateItem): number {
  if(item.quantity!==null)return round(item.quantity);
  if(item.basis==='manual')return 0;
  if(item.basis==='object')return 1;
  if(item.roomId==='general') {
    if(item.basis==='floor'||item.basis==='ceiling')return projectArea(p);
    return round(p.rooms.reduce((s,r)=>s+geometry(r)[item.basis as 'wall'|'perimeter'],0));
  }
  const r=p.rooms.find(r=>r.id===item.roomId);return r?geometry(r)[item.basis as 'floor'|'ceiling'|'wall'|'perimeter']:0;
}
export function calculate(p:Project) {
  const lines=p.items.map(item=>{const qty=quantity(p,item),laborPrice=round(item.laborPrice),materialPrice=round(item.materialPrice);const labor=round(qty*laborPrice),materials=round(qty*materialPrice);return {...item,laborPrice,materialPrice,qty,labor,materials,total:round(labor+materials)};});
  const labor=round(lines.reduce((s,l)=>s+l.labor,0)),materials=round(lines.reduce((s,l)=>s+l.materials,0)),direct=round(labor+materials);
  const overhead=round(direct*p.overhead/100),reserve=round((direct+overhead)*p.reserve/100),discount=round((direct+overhead+reserve)*p.discount/100),total=round(direct+overhead+reserve-discount);
  return {lines,labor,materials,direct,overhead,reserve,discount,total};
}
export function issues(p:Project) {
  const c=calculate(p),warnings:string[]=[];
  if(!p.name.trim())warnings.push('Укажите название объекта.');
  if(!p.address.trim())warnings.push('Добавьте адрес объекта.');
  if(!p.rooms.length)warnings.push('Добавьте хотя бы одно помещение.');
  if(!p.items.length)warnings.push('Выберите ремонтные работы.');
  if(c.lines.some(l=>l.qty<=0))warnings.push('У некоторых работ не указан объём.');
  if(c.lines.some(l=>l.laborPrice===0&&l.materialPrice===0))warnings.push('У некоторых работ нулевая цена.');
  if(!Number.isFinite(c.total)||c.total>10_000_000_000)warnings.push('Итог превышает допустимые 10 млрд ₽. Проверьте объёмы и цены.');
  return warnings;
}
export function selectedItem(w:Work,roomId:string):EstimateItem {return {...w,id:uid(),workId:w.id,roomId,quantity:null,note:''};}
export function cloneProject(p:Project,suffix=' — копия'):Project {const now=new Date().toISOString();return {...structuredClone(p),id:uid(),revision:0,name:p.name+suffix,status:'draft',createdAt:now,updatedAt:now};}
