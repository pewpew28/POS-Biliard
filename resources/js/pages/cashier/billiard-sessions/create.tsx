import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index, store } from '@/routes/cashier/billiard-sessions/index';
import type { BreadcrumbItem } from '@/types';

type Option = { id: number; name: string; price?: number; hourly_rate?: number; billiard_table_type?: { name: string } };
type Table = { id: number; name: string; billiard_table_type: { name: string } };

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Transaksi Meja', href: index().url }, { title: 'Buka Sesi', href: '#' }];

export default function CreateBilliardSession({ tables, rates, packages }: { tables: Table[]; rates: Option[]; packages: Option[] }) {
    const form = useForm({ billiard_table_id: '', table_rate_id: '', table_package_id: '', notes: '' });
    const submit = (event: FormEvent) => { event.preventDefault(); form.post(store().url); };
    return <><Head title="Buka Sesi" /><div className="flex flex-1 flex-col gap-6 p-4 md:p-6"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" asChild><Link href={index().url}><ArrowLeft /></Link></Button><div><h1 className="text-2xl font-semibold">Buka Sesi Meja</h1><p className="text-muted-foreground text-sm">Pilih meja dan salah satu metode tarif.</p></div></div><Card className="max-w-2xl"><CardHeader><CardTitle>Detail Sesi</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label>Meja</Label><Select value={form.data.billiard_table_id} onValueChange={(value) => form.setData('billiard_table_id', value)}><SelectTrigger><SelectValue placeholder="Pilih meja" /></SelectTrigger><SelectContent>{tables.map((table) => <SelectItem key={table.id} value={String(table.id)}>{table.name} - {table.billiard_table_type.name}</SelectItem>)}</SelectContent></Select>{form.errors.billiard_table_id && <p className="text-sm text-destructive">{form.errors.billiard_table_id}</p>}</div><div className="space-y-2"><Label>Tarif Reguler</Label><Select value={form.data.table_rate_id} onValueChange={(value) => { form.setData('table_rate_id', value); form.setData('table_package_id', ''); }}><SelectTrigger><SelectValue placeholder="Pilih tarif reguler" /></SelectTrigger><SelectContent>{rates.map((rate) => <SelectItem key={rate.id} value={String(rate.id)}>{rate.name} - Rp {rate.hourly_rate?.toLocaleString('id-ID')}/jam</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Paket Tarif</Label><Select value={form.data.table_package_id} onValueChange={(value) => { form.setData('table_package_id', value); form.setData('table_rate_id', ''); }}><SelectTrigger><SelectValue placeholder="Pilih paket tarif" /></SelectTrigger><SelectContent>{packages.map((pkg) => <SelectItem key={pkg.id} value={String(pkg.id)}>{pkg.name} - Rp {pkg.price?.toLocaleString('id-ID')}</SelectItem>)}</SelectContent></Select>{(form.errors.table_rate_id || form.errors.table_package_id) && <p className="text-sm text-destructive">{form.errors.table_rate_id || form.errors.table_package_id}</p>}</div><div className="space-y-2"><Label>Catatan</Label><textarea className="border-input min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} /></div><Button type="submit" disabled={form.processing}>Buka Sesi</Button></form></CardContent></Card></div></>;
}

CreateBilliardSession.layout = { breadcrumbs };
