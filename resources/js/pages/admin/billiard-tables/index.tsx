import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/atoms/ui/badge';
import { Button } from '@/components/atoms/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { index as tablesIndex, create, destroy, edit } from '@/actions/App/Http/Controllers/Admin/BilliardTableController';
import type { BreadcrumbItem } from '@/types';
import { DeleteConfirmationDialog } from '@/components/organisms/delete-confirmation-dialog';

type BilliardTable = {
    id: number;
    name: string;
    billiard_table_type_id: number;
    billiard_table_type: { name: string } | null;
    status: 'available' | 'maintenance' | 'inactive';
    notes: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Meja Biliar', href: tablesIndex().url },
];

const statusLabels: Record<BilliardTable['status'], string> = {
    available: 'Tersedia',
    maintenance: 'Perawatan',
    inactive: 'Tidak Aktif',
};

const statusVariants: Record<BilliardTable['status'], 'default' | 'secondary' | 'destructive'> = {
    available: 'default',
    maintenance: 'secondary',
    inactive: 'destructive',
};

export default function BilliardTablesIndex({ tables }: { tables: BilliardTable[] }) {
    const [selected, setSelected] = useState<BilliardTable | null>(null);

    return (
        <>
            <Head title="Meja Biliar" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Meja Biliar</h1>
                        <p className="text-muted-foreground text-sm">
                            Kelola meja, tarif per jam, dan status operasional.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create().url}>
                            <Plus />
                            Tambah Meja
                        </Link>
                    </Button>
                </div>

                {tables.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                            <p className="font-medium">Belum ada meja biliar.</p>
                            <p className="text-muted-foreground text-sm">
                                Tambahkan meja pertama untuk mulai mengatur area bermain.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {tables.map((table) => (
                            <Card key={table.id}>
                                <CardHeader className="flex-row items-start justify-between gap-4">
                                    <div>
                                        <CardTitle>{table.name}</CardTitle>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {table.billiard_table_type?.name || 'Type belum dipilih'}
                                        </p>
                                    </div>
                                    <Badge variant={statusVariants[table.status]}>
                                        {statusLabels[table.status]}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between gap-3">
                                    <p className="text-muted-foreground line-clamp-2 text-sm">
                                        {table.notes || 'Tidak ada catatan'}
                                    </p>
                                    <div className="flex shrink-0 gap-2">
                                        <Button variant="outline" size="icon" asChild>
                                            <Link href={edit.url(table.id)} aria-label={`Edit ${table.name}`}>
                                                <Pencil />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            aria-label={`Hapus ${table.name}`}
                                            onClick={() => setSelected(table)}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                <DeleteConfirmationDialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)} itemName={selected?.name ?? ''} onConfirm={(password) => selected && router.delete(destroy.url(selected.id), { data: { current_password: password } })} />
            </div>
        </>
    );
}

BilliardTablesIndex.layout = { breadcrumbs };
