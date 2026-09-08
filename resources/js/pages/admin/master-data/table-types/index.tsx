import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TypeController from '@/actions/App/Http/Controllers/Admin/BilliardTableTypeController';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

type TableType = { id: number; name: string; description: string | null; is_active: boolean; billiard_tables_count: number };

export default function TableTypesIndex({ types }: { types: TableType[] }) {
    const [selected, setSelected] = useState<TableType | null>(null);

    return (
        <>
            <Head title="Type Meja" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div><h1 className="text-2xl font-semibold">Type Meja</h1><p className="text-muted-foreground text-sm">Kelola kategori atau jenis meja biliar.</p></div>
                    <Button asChild><Link href={TypeController.create().url}><Plus />Tambah Type</Link></Button>
                </div>
                {types.length === 0 ? (
                    <Card><CardContent className="text-muted-foreground p-8 text-center">Tidak ada data type meja.</CardContent></Card>
                ) : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {types.map((type) => (
                        <Card key={type.id}>
                            <CardHeader className="flex-row items-start justify-between gap-3"><CardTitle>{type.name}</CardTitle><Badge variant={type.is_active ? 'default' : 'secondary'}>{type.is_active ? 'Aktif' : 'Nonaktif'}</Badge></CardHeader>
                            <CardContent className="flex items-end justify-between gap-3"><div><p className="text-muted-foreground line-clamp-2 text-sm">{type.description || 'Tidak ada deskripsi'}</p><p className="mt-2 text-xs">{type.billiard_tables_count} meja</p></div><div className="flex gap-2"><Button variant="outline" size="icon" asChild><Link href={TypeController.edit.url(type.id)}><Pencil /></Link></Button><Button variant="outline" size="icon" onClick={() => setSelected(type)}><Trash2 /></Button></div></CardContent>
                        </Card>
                    ))}
                </div>}
                <DeleteConfirmationDialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)} itemName={selected?.name ?? ''} onConfirm={(password) => selected && router.delete(TypeController.destroy.url(selected.id), { data: { current_password: password } })} />
            </div>
        </>
    );
}

TableTypesIndex.layout = { breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Type Meja', href: TypeController.index().url }] };
