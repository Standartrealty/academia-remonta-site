import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Смета ремонта · Академия ремонта', description: 'Замеры, чек-лист работ и предварительная смета на вашем устройстве.', manifest: '/smeta/manifest.webmanifest', appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Смета ремонта' }, icons: { icon: '/smeta/icon-192.png', apple: '/smeta/icon-192.png' } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#15272b' };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body>{children}</body></html>; }
