import 'fake-indexeddb/auto';
import { describe,it,expect } from 'vitest';
import { newProject,defaultSettings } from '../src/lib/model';
import { saveProject,loadAll,ConflictError,importProjects } from '../src/lib/storage';
describe('Сохранение на устройстве',()=>{
 it('сохраняет объект и не затирает новую версию устаревшей',async()=>{const p=newProject('Сохранение','Квартира','Адрес',50,defaultSettings);const one=await saveProject(p);expect(one.revision).toBe(1);const two=await saveProject({...one,address:'Новый адрес'});expect(two.revision).toBe(2);await expect(saveProject({...one,address:'Устаревший адрес'})).rejects.toBeInstanceOf(ConflictError);expect((await loadAll()).projects.find(x=>x.id===p.id)?.address).toBe('Новый адрес');});
 it('импортируется одной транзакцией и откатывается при конфликте',async()=>{const existing=await saveProject(newProject('Существующий','Дом','Адрес',100,defaultSettings));const fresh=newProject('Свежий','Дом','Адрес 2',80,defaultSettings);await expect(importProjects([fresh,existing])).rejects.toBeInstanceOf(ConflictError);expect((await loadAll()).projects.some(x=>x.id===fresh.id)).toBe(false);});
});
