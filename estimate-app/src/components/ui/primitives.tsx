'use client';
// shadcn/ui component patterns, composed with Radix primitives (MIT).
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertPrimitive from '@radix-ui/react-alert-dialog';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
const variants=cva('btn',{variants:{variant:{default:'btn-primary',secondary:'btn-secondary',ghost:'btn-ghost',outline:'btn-outline',danger:'btn-danger'},size:{default:'',sm:'btn-sm',icon:'btn-icon'}},defaultVariants:{variant:'default',size:'default'}});
export function Button({className,variant,size,type='button',...props}:React.ComponentProps<'button'>&VariantProps<typeof variants>){return <button type={type} className={cn(variants({variant,size}),className)} {...props}/>;}
export function Input({className,...props}:React.ComponentProps<'input'>){return <input className={cn('input',className)} {...props}/>;}
export function Textarea({className,...props}:React.ComponentProps<'textarea'>){return <textarea className={cn('input textarea',className)} {...props}/>;}
export function Select({className,...props}:React.ComponentProps<'select'>){return <select className={cn('input select',className)} {...props}/>;}
export function Badge({className,...props}:React.ComponentProps<'span'>){return <span className={cn('badge',className)} {...props}/>;}
export function Checkbox({className,...props}:React.ComponentProps<typeof CheckboxPrimitive.Root>){return <CheckboxPrimitive.Root className={cn('checkbox',className)} {...props}><CheckboxPrimitive.Indicator><Check size={13} strokeWidth={3}/></CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>;}
export const Dialog=DialogPrimitive.Root;
export function DialogContent({children,className,...props}:React.ComponentProps<typeof DialogPrimitive.Content>){return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="dialog-overlay"/><DialogPrimitive.Content className={cn('dialog-content',className)} {...props}>{children}<DialogPrimitive.Close className="dialog-close" aria-label="Закрыть"><X size={20}/></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;}
export const DialogTitle=DialogPrimitive.Title;
export const DialogDescription=DialogPrimitive.Description;
export function Confirm({open,onOpenChange,title,description,onConfirm,confirmLabel='Удалить',danger=true}:{open:boolean;onOpenChange:(v:boolean)=>void;title:string;description:string;onConfirm:()=>void;confirmLabel?:string;danger?:boolean}){return <AlertPrimitive.Root open={open} onOpenChange={onOpenChange}><AlertPrimitive.Portal><AlertPrimitive.Overlay className="dialog-overlay"/><AlertPrimitive.Content className="dialog-content confirm-content"><AlertPrimitive.Title className="dialog-title">{title}</AlertPrimitive.Title><AlertPrimitive.Description className="dialog-description">{description}</AlertPrimitive.Description><div className="dialog-actions"><AlertPrimitive.Cancel asChild><Button variant="outline">Отмена</Button></AlertPrimitive.Cancel><AlertPrimitive.Action asChild><Button variant={danger?'danger':'default'} onClick={onConfirm}>{confirmLabel}</Button></AlertPrimitive.Action></div></AlertPrimitive.Content></AlertPrimitive.Portal></AlertPrimitive.Root>;}
export const DropdownMenu=DropdownPrimitive.Root;
export const DropdownMenuTrigger=DropdownPrimitive.Trigger;
export function DropdownMenuContent(props:React.ComponentProps<typeof DropdownPrimitive.Content>){return <DropdownPrimitive.Portal><DropdownPrimitive.Content className="dropdown-content" align="end" sideOffset={6} {...props}/></DropdownPrimitive.Portal>;}
export function DropdownMenuItem({className,...props}:React.ComponentProps<typeof DropdownPrimitive.Item>){return <DropdownPrimitive.Item className={cn('dropdown-item',className)} {...props}/>;}
export function Field({label,hint,children,className}:{label:string;hint?:string;children:React.ReactNode;className?:string}){return <label className={cn('field',className)}><span>{label}</span>{children}{hint?<small>{hint}</small>:null}</label>;}
export function NumberInput({value,onValueChange,max=10000000,...props}:{value:number;onValueChange:(n:number)=>void;max?:number}&Omit<React.ComponentProps<'input'>,'value'|'onChange'|'type'|'max'>){
  const [text,setText]=React.useState(String(value));const focused=React.useRef(false);
  React.useEffect(()=>{if(!focused.current)setText(String(value));},[value]);
  return <Input {...props} type="text" inputMode="decimal" value={text} onFocus={()=>{focused.current=true;}} onChange={e=>{const v=e.target.value;if(!/^\d*([.,]\d*)?$/.test(v))return;setText(v);const n=Number(v.replace(',','.'));if(Number.isFinite(n)&&n<=max&&n!==value)onValueChange(n);}} onBlur={()=>{focused.current=false;const n=Math.round(Math.max(0,Math.min(max,Number(text.replace(',','.'))||0))*100)/100;if(n!==value)onValueChange(n);setText(String(n));}}/>;
}
