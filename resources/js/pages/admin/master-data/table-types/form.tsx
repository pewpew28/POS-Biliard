import { Form, Head, Link } from '@inertiajs/react';
import { Button } from '@/components/atoms/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { Input } from '@/components/atoms/ui/input';
import { Label } from '@/components/atoms/ui/label';
import TypeController from '@/actions/App/Http/Controllers/Admin/BilliardTableTypeController';

type TableType = { id: number; name: string; description: string | null; is_active: boolean };
export default function TableTypeForm({ tableType }: { tableType: TableType | null }) {
    const editing = Boolean(tableType);
    return <><Head title={editing ? 'Edit Type Meja' : 'Tambah Type Meja'} /><div className="flex flex-1 flex-col gap-6 p-4 md:p-6"><h1 className="text-2xl font-semibold">{editing ? 'Edit Type Meja' : 'Tambah Type Meja'}</h1><Card className="max-w-2xl"><CardHeader><CardTitle>Informasi Type</CardTitle></CardHeader><CardContent><Form {...(editing ? TypeController.update.form(tableType!.id) : TypeController.store.form())} className="flex flex-col gap-5">{({ errors, processing }) => <><div className="flex flex-col gap-2"><Label htmlFor="name">Nama</Label><Input id="name" name="name" defaultValue={tableType?.name} />{errors.name && <p className="text-destructive text-sm">{errors.name}</p>}</div><div className="flex flex-col gap-2"><Label htmlFor="description">Deskripsi</Label><textarea id="description" name="description" defaultValue={tableType?.description ?? ''} rows={4} className="border-input bg-background rounded-md border px-3 py-2 text-sm" /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" value="1" defaultChecked={tableType?.is_active ?? true} /> Aktif</label><div className="flex justify-end gap-3"><Button variant="outline" asChild><Link href={TypeController.index().url}>Batal</Link></Button><Button type="submit" disabled={processing}>Simpan</Button></div></>}</Form></CardContent></Card></div></>;
}
TableTypeForm.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Type Meja', href: TypeController.index().url }] };
