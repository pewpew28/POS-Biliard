import { Head, Link, Form } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { create, index, store, update } from '@/actions/App/Http/Controllers/Admin/BilliardTableController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type BilliardTable = {
    id: number;
    name: string;
    billiard_table_type_id: number;
    status: 'available' | 'maintenance' | 'inactive';
    notes: string | null;
};

type TableType = { id: number; name: string };

export default function BilliardTableForm({ table, types }: { table: BilliardTable | null; types: TableType[] }) {
    const isEditing = table !== null;

    return (
        <>
            <Head title={isEditing ? 'Edit Meja Biliar' : 'Tambah Meja Biliar'} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={index().url} aria-label="Kembali ke daftar meja">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {isEditing ? 'Edit Meja Biliar' : 'Tambah Meja Biliar'}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Isi informasi meja dan tarif penggunaannya.
                        </p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Informasi Meja</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...(isEditing ? update.form(table.id) : store.form())}
                            resetOnSuccess
                            className="flex flex-col gap-5"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="name">Nama Meja</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={table?.name}
                                            placeholder="Contoh: Meja 01"
                                            aria-invalid={Boolean(errors.name)}
                                        />
                                        {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="billiard_table_type_id">Type Meja</Label>
                                        <select
                                            id="billiard_table_type_id"
                                            name="billiard_table_type_id"
                                            defaultValue={table?.billiard_table_type_id ?? ''}
                                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                        >
                                            <option value="" disabled>Pilih type meja</option>
                                            {types.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                                        </select>
                                        {errors.billiard_table_type_id && <p className="text-destructive text-sm">{errors.billiard_table_type_id}</p>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="status">Status</Label>
                                        <select
                                            id="status"
                                            name="status"
                                            defaultValue={table?.status ?? 'available'}
                                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                        >
                                            <option value="available">Tersedia</option>
                                            <option value="maintenance">Perawatan</option>
                                            <option value="inactive">Tidak Aktif</option>
                                        </select>
                                        {errors.status && <p className="text-destructive text-sm">{errors.status}</p>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="notes">Catatan (Opsional)</Label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            defaultValue={table?.notes ?? ''}
                                            rows={4}
                                            className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
                                            placeholder="Contoh: Kain meja baru diganti"
                                        />
                                        {errors.notes && <p className="text-destructive text-sm">{errors.notes}</p>}
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <Button variant="outline" asChild>
                                            <Link href={index().url}>Batal</Link>
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Menyimpan...' : 'Simpan'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

BilliardTableForm.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Meja Biliar', href: index().url },
        { title: 'Form Meja', href: create().url },
    ],
};
