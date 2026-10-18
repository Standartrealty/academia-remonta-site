import { calculate, projectArea, quantity, statusLabels, type Project, type Settings, type Backup } from './model';
import { categoryTitle } from './catalog';
import { decimal } from './utils';
export function filename(name:string,ext:string){return `${name.replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,75)||'Смета'}.${ext}`;}
export function download(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
export function exportJSON(backup:Backup,name='Резервная копия смет'){download(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}),filename(name,'json'));}
export async function pdfBlob(p:Project,settings:Settings):Promise<Blob>{
  const [{jsPDF},{default:autoTable},fontResponse]=await Promise.all([import('jspdf'),import('jspdf-autotable'),fetch('/smeta/fonts/DejaVuSans.ttf')]);
  if(!fontResponse.ok)throw new Error('Не удалось загрузить шрифт PDF. Откройте приложение онлайн один раз.');
  const bytes=new Uint8Array(await fontResponse.arrayBuffer());let base64='';for(let i=0;i<bytes.length;i+=16384)base64+=String.fromCharCode(...bytes.subarray(i,i+16384));
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});doc.addFileToVFS('DejaVuSans.ttf',btoa(base64));doc.addFont('DejaVuSans.ttf','DejaVu','normal');doc.addFont('DejaVuSans.ttf','DejaVu','bold');doc.setFont('DejaVu');
  doc.setTextColor('#17282b');doc.setFontSize(18);doc.text('ПРЕДВАРИТЕЛЬНАЯ СМЕТА',14,18);
  doc.setFontSize(10);let y=27;
  const info=[p.name,p.address,`${p.type} · ${decimal(projectArea(p))} м² · ${statusLabels[p.status]}`,`Дата: ${new Date().toLocaleDateString('ru-RU')} · ${settings.company} · ${settings.phone}`,p.client?`Заказчик: ${p.client}${p.phone?' · '+p.phone:''}`:'',p.foreman?`Ответственный: ${p.foreman}`:'',p.pricesConfirmed?'Расценки проверены ответственным.':'ВНИМАНИЕ: расценки не подтверждены; предварительный расчёт.',p.demo?'ДЕМОНСТРАЦИОННЫЙ ОБЪЕКТ':''].filter(Boolean);
  for(const line of info){const parts=doc.splitTextToSize(line,265);doc.text(parts,14,y);y+=parts.length*5;}
  const c=calculate(p);let index=0;const body:(string|{content:string;colSpan:number;styles:Record<string,unknown>})[][]=[];
  for(const roomId of [...p.rooms.map(r=>r.id),'general']){
    const lines=c.lines.filter(l=>l.roomId===roomId);if(!lines.length)continue;
    const label=roomId==='general'?'Общие работы по объекту':p.rooms.find(r=>r.id===roomId)?.name??'Помещение';
    body.push([{content:label,colSpan:8,styles:{fillColor:[239,243,241],fontStyle:'bold'}}]);
    for(const line of lines)body.push([String(++index),line.title+(line.note?'\n'+line.note:''),line.unit,decimal(line.qty),decimal(line.laborPrice),decimal(line.materialPrice),decimal(line.labor),decimal(line.materials)]);
  }
  const value=(n:number)=>decimal(n)+' ₽';
  body.push([{content:'Стоимость работ',colSpan:7,styles:{}},value(c.labor)]);
  body.push([{content:'Материалы, включённые в расчёт',colSpan:7,styles:{}},value(c.materials)]);
  body.push([{content:`Накладные расходы · ${p.overhead}% от прямых затрат`,colSpan:7,styles:{}},value(c.overhead)]);
  body.push([{content:`Резерв · ${p.reserve}% после накладных расходов`,colSpan:7,styles:{}},value(c.reserve)]);
  body.push([{content:`Скидка · ${p.discount}% от суммы с резервом`,colSpan:7,styles:{}},'−'+value(c.discount)]);
  body.push([{content:'ИТОГО ПРЕДВАРИТЕЛЬНО',colSpan:7,styles:{fillColor:[255,236,221],fontStyle:'bold'}},{content:value(c.total),colSpan:1,styles:{fillColor:[255,236,221],fontStyle:'bold'}}]);
  autoTable(doc,{startY:y+3,head:[['№','Наименование работ','Ед.','Объём','Работа, ₽/ед.','Материалы, ₽/ед.','Работы, ₽','Материалы, ₽']],body:body as Parameters<typeof autoTable>[1]['body'],styles:{font:'DejaVu',fontSize:8,cellPadding:3,overflow:'linebreak'},headStyles:{fillColor:[23,40,43],textColor:255,fontStyle:'normal'},columnStyles:{0:{cellWidth:10},1:{cellWidth:85},2:{cellWidth:15},3:{cellWidth:22}},margin:{top:15,bottom:18,left:14,right:14},didDrawPage:()=>{doc.setFont('DejaVu');doc.setFontSize(8);doc.setTextColor('#718080');doc.text('Смета ремонта · '+p.name.slice(0,55),14,202);doc.text(String(doc.getCurrentPageInfo().pageNumber),278,202);}});
  // Terms live on a separate page if the table used the available space.
  const finalY=(doc as unknown as {lastAutoTable:{finalY:number}}).lastAutoTable.finalY;
  let noteY=finalY+9;if(noteY>165){doc.addPage();noteY=20;}
  doc.setFont('DejaVu');doc.setFontSize(9);doc.setTextColor('#566464');
  const notes=['Стоимость предварительная и уточняется после согласования объёмов и расценок.','Материалы с нулевой ценой в итог не включены. Смета не является договором.',p.notes?'Примечания: '+p.notes:''].filter(Boolean);
  for(const note of notes){const parts=doc.splitTextToSize(note,265);for(const part of parts){if(noteY>192){doc.addPage();noteY=20;}doc.text(part,14,noteY);noteY+=5;}}
  return doc.output('blob');
}
export async function excelBlob(p:Project,settings:Settings):Promise<Blob>{
  const module=await import('exceljs');const ExcelJS=module.default??module;const book=new ExcelJS.Workbook();book.creator=settings.company;book.created=new Date();book.calcProperties.fullCalcOnLoad=true;
  const sheet=book.addWorksheet('Смета',{views:[{state:'frozen',ySplit:8}]});sheet.columns=[{width:7},{width:27},{width:42},{width:12},{width:12},{width:15},{width:18},{width:18},{width:18},{width:18}];
  sheet.mergeCells('A1:J1');sheet.getCell('A1').value='ПРЕДВАРИТЕЛЬНАЯ СМЕТА · '+p.name;sheet.getCell('A1').font={size:16,bold:true,color:{argb:'FF17282B'}};
  const infos=[p.address,`${p.type} · ${projectArea(p)} м² · ${statusLabels[p.status]}`,`Заказчик: ${p.client||'не указан'} · ${p.phone||''}`,`Ответственный: ${p.foreman||'не указан'} · ${settings.company} · ${settings.phone}`,p.pricesConfirmed?'Расценки проверены ответственным':'ВНИМАНИЕ: расценки не подтверждены',p.demo?'ДЕМОНСТРАЦИОННЫЙ ОБЪЕКТ':'Нулевые цены материалов означают, что материалы не включены.'];
  infos.forEach((value,i)=>{sheet.mergeCells(i+2,1,i+2,10);sheet.getCell(i+2,1).value=value;});
  sheet.addRow(['№','Помещение','Наименование работ','Ед.','Объём','Работа, ₽/ед.','Материал, ₽/ед.','Работы, ₽','Материалы, ₽','Итого, ₽']);
  sheet.getRow(8).eachCell(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF17282B'}};c.font={bold:true,color:{argb:'FFFFFFFF'}};});
  const c=calculate(p);c.lines.forEach((line,i)=>{const row=sheet.addRow([i+1,line.roomId==='general'?'Общие работы':p.rooms.find(r=>r.id===line.roomId)?.name,line.title,line.unit,line.qty,line.laborPrice,line.materialPrice]);const n=row.number;row.getCell(8).value={formula:`ROUND(E${n}*F${n},2)`,result:line.labor};row.getCell(9).value={formula:`ROUND(E${n}*G${n},2)`,result:line.materials};row.getCell(10).value={formula:`H${n}+I${n}`,result:line.total};if(line.note)row.getCell(3).note=line.note;row.height=30;row.alignment={vertical:'middle',wrapText:true};});
  const first=9,last=8+c.lines.length;
  function summary(label:string,formula:string,result:number,percent?:number){const row=sheet.addRow([]);sheet.mergeCells(row.number,1,row.number,8);row.getCell(1).value=label;if(percent!==undefined)row.getCell(9).value=percent;row.getCell(10).value={formula,result};row.font={bold:true};return row.number;}
  const direct=summary('Прямые затраты',last>=first?`SUM(J${first}:J${last})`:'0',c.direct);
  const overhead=summary('Накладные расходы, %',`ROUND(J${direct}*I${direct+1}/100,2)`,c.overhead,p.overhead);
  const reserve=summary('Резерв, %',`ROUND((J${direct}+J${overhead})*I${overhead+1}/100,2)`,c.reserve,p.reserve);
  const discount=summary('Скидка, %',`ROUND((J${direct}+J${overhead}+J${reserve})*I${reserve+1}/100,2)`,c.discount,p.discount);
  const total=summary('ИТОГО ПРЕДВАРИТЕЛЬНО',`J${direct}+J${overhead}+J${reserve}-J${discount}`,c.total);sheet.getRow(total).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFECDD'}};
  sheet.eachRow((row,n)=>{if(n>=9){for(let col=5;col<=10;col++)row.getCell(col).numFmt='#,##0.00';}row.eachCell(cell=>{cell.border={bottom:{style:'hair',color:{argb:'FFE2E8E5'}}};});});
  sheet.autoFilter={from:{row:8,column:1},to:{row:last>=first?last:8,column:10}};sheet.pageSetup={orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,paperSize:9};sheet.headerFooter.oddFooter='Предварительный расчёт · Страница &P из &N';
  const notes=book.addWorksheet('Информация');notes.columns=[{width:26},{width:100}];notes.addRows([['Объект',p.name],['Адрес',p.address],['Статус',statusLabels[p.status]],['Создан',new Date(p.createdAt).toLocaleString('ru-RU')],['Изменён',new Date(p.updatedAt).toLocaleString('ru-RU')],['Примечания',p.notes],['Условия','Стоимость предварительная. Материалы с нулевой ценой не включены.'],['Проверка прайса',p.pricesConfirmed?'Подтверждена ответственным':'Не подтверждена']]);
  const measures=book.addWorksheet('Замеры');measures.columns=[{width:28},{width:14},{width:14},{width:14},{width:14},{width:18}];measures.addRow(['Помещение','Длина, м','Ширина, м','Высота, м','Пол, м²','Периметр, м']);for(const room of p.rooms)measures.addRow([room.name,room.length,room.width,room.height,room.areaOverride??room.length*room.width,room.perimeterOverride??2*(room.length+room.width)]);
  const buffer=await book.xlsx.writeBuffer();return new Blob([new Uint8Array(buffer)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
