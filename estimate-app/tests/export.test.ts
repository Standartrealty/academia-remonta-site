import { it,expect,vi } from 'vitest';
import { readFile,writeFile } from 'node:fs/promises';
import ExcelJS from 'exceljs';
import { newProject,newRoom,defaultSettings,selectedItem,calculate } from '../src/lib/model';
import { defaultCatalog } from '../src/lib/catalog';
import { pdfBlob,excelBlob } from '../src/lib/export';
it('создаёт PDF с кириллицей и Excel с формулами и совпадающим итогом',async()=>{
 const p=newProject('Проверка — квартира','Квартира','Махачкала, тестовый адрес',20,defaultSettings),room={...newRoom('Гостиная'),length:5,width:4};p.rooms=[room];p.items=[{...selectedItem(defaultCatalog.find(w=>w.id==='laminate')!,room.id),materialPrice:900}];p.reserve=5;
 const font=await readFile(new URL('../public/fonts/DejaVuSans.ttf',import.meta.url));vi.stubGlobal('fetch',async()=>new Response(font));
 try{const pdf=await pdfBlob(p,defaultSettings),pdfBytes=new Uint8Array(await pdf.arrayBuffer());expect(new TextDecoder().decode(pdfBytes.slice(0,4))).toBe('%PDF');expect(pdfBytes.length).toBeGreaterThan(50000);await writeFile('/tmp/ar-estimate-check.pdf',pdfBytes);}finally{vi.unstubAllGlobals();}
 const excel=await excelBlob(p,defaultSettings),bytes=new Uint8Array(await excel.arrayBuffer()),book=new ExcelJS.Workbook();await book.xlsx.load(bytes as unknown as ExcelJS.Buffer);const sheet=book.getWorksheet('Смета')!;expect(sheet.getCell('H9').formula).toBe('ROUND(E9*F9,2)');expect(sheet.getCell('J14').result).toBe(calculate(p).total);expect(book.getWorksheet('Замеры')!.getCell('E2').value).toBe(20);await writeFile('/tmp/ar-estimate-check.xlsx',bytes);
});
