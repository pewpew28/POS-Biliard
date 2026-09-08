import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock3, CreditCard, Plus, Square, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { close, store } from '@/routes/cashier/billiard-sessions/index';
import { close as posClose, store as posStore } from '@/routes/cashier/pos/index';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Session = {
    id: number;
    started_at: string;
    customer_name: string;
    planned_hours: number;
    billiard_table: { name: string };
    table_rate: { name: string; hourly_rate: number } | null;
    hourly_rate: { name: string; hourly_rate: number } | null;
};

type Table = {
    id: number;
    name: string;
    status: string;
    billiard_table_type: { name: string };
    billiard_sessions: Session[];
    effective_rate: { id: number; name: string; hourly_rate: number; source: 'hourly' | 'regular' } | null;
};

const money = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;
const durationOptions = [1, 2, 3, 4, 5, 6, 8, 10, 12];

function Countdown({ session }: { session: Session }) {
    const endAt = useMemo(() => new Date(new Date(session.started_at).getTime() + session.planned_hours * 60 * 60 * 1000), [session]);
    const [remaining, setRemaining] = useState(Math.max(0, endAt.getTime() - Date.now()));

    useEffect(() => {
        const timer = window.setInterval(() => setRemaining(Math.max(0, endAt.getTime() - Date.now())), 1000);
        return () => window.clearInterval(timer);
    }, [endAt]);

    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return (
        <div className={`rounded-xl p-5 ${remaining === 0 ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
            <div className="flex items-center gap-3 text-sm font-medium"><Clock3 className="size-5" /> Sisa waktu bermain</div>
            <p className="mt-2 text-4xl font-bold tabular-nums">{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</p>
            <p className="mt-1 text-sm opacity-80">Customer: {session.customer_name}</p>
        </div>
    );
}

export default function BilliardSessionsIndex({ tables, isPos = false }: { tables: Table[]; isPos?: boolean }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const form = useForm({ billiard_table_id: '', customer_name: '', duration_hours: '' });
    const availableTables = tables.filter((table) => table.status === 'available' && table.billiard_sessions.length === 0);

    const openDrawer = (tableId?: number) => {
        form.reset();
        form.clearErrors();
        if (tableId !== undefined) {
            form.setData('billiard_table_id', String(tableId));
        }
        setDrawerOpen(true);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const action = isPos ? posStore() : store();
        form.post(action.url, { onSuccess: () => setDrawerOpen(false) });
    };

    return (
        <>
            <Head title="Kasir Meja" />
            <div className="flex min-h-full flex-1 flex-col bg-muted/20">
                <header className="border-b bg-background px-4 py-4 md:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-primary"><CreditCard className="size-4" /> POS KASIR</div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight">Daftar Meja Biliar</h1>
                            <p className="text-sm text-muted-foreground">Pantau semua meja dan buka sesi baru saat customer datang.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-2 text-sm shadow-sm"><Users className="size-4 text-muted-foreground" /><span>Meja bermain</span><strong>{tables.filter((table) => table.billiard_sessions.length > 0).length}/{tables.length}</strong></div>
                            <Button onClick={() => openDrawer()}><Plus className="size-4" /> Tambah Sesi</Button>
                        </div>
                    </div>
                </header>

                <main className="grid flex-1 gap-4 p-4 sm:grid-cols-2 md:p-6 xl:grid-cols-3">
                    {tables.map((table) => {
                        const session = table.billiard_sessions[0];
                        const busy = Boolean(session);
                        return (
                            <Card key={table.id} className="overflow-hidden">
                                <CardHeader className="border-b">
                                    <div className="flex items-start justify-between gap-3">
                                        <div><p className="text-sm text-muted-foreground">{table.billiard_table_type.name}</p><CardTitle className="mt-1 text-2xl">{table.name}</CardTitle></div>
                                        <Badge variant={busy ? 'secondary' : 'default'}>{busy ? 'Bermain' : table.status === 'available' ? 'Tersedia' : 'Tidak tersedia'}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 p-5">
                                    {session ? (
                                        <>
                                            <Countdown session={session} />
                                            <div className="grid gap-3 text-sm sm:grid-cols-2">
                                                <div className="rounded-lg border p-3"><p className="text-muted-foreground">Mulai</p><p className="font-semibold">{new Date(session.started_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p></div>
                                                <div className="rounded-lg border p-3"><p className="text-muted-foreground">Tarif</p><p className="font-semibold">{money(session.hourly_rate?.hourly_rate ?? session.table_rate?.hourly_rate ?? 0)}/jam</p></div>
                                            </div>
                                            <Button variant="destructive" className="w-full" onClick={() => router.post((isPos ? posClose(session.id) : close(session.id)).url)}><Square className="size-4" /> Tutup Sesi</Button>
                                        </>
                                    ) : table.status === 'available' ? (
                                        <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center"><CheckCircle2 className="size-8 text-emerald-500" /><p className="text-sm text-muted-foreground">Meja siap digunakan</p><Button variant="outline" onClick={() => openDrawer(table.id)}>Buka Sesi di Meja Ini</Button></div>
                                    ) : (
                                        <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center"><p className="text-sm text-muted-foreground">Meja sedang tidak tersedia</p></div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </main>

                <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <DialogContent className="top-0 right-0 left-auto h-full max-w-md translate-x-0 translate-y-0 rounded-none border-y-0 border-r-0 sm:max-w-md">
                        <DialogHeader><DialogTitle>Tambah Sesi Baru</DialogTitle><DialogDescription>Masukkan data customer, durasi, dan meja yang akan digunakan.</DialogDescription></DialogHeader>
                        <form onSubmit={submit} className="flex flex-1 flex-col gap-5 py-4">
                            <div className="space-y-2"><Label htmlFor="customer_name">Nama customer</Label><Input id="customer_name" value={form.data.customer_name} onChange={(event) => form.setData('customer_name', event.target.value)} placeholder="Contoh: Budi" autoFocus />{form.errors.customer_name && <p className="text-sm text-destructive">{form.errors.customer_name}</p>}</div>
                            <div className="space-y-2"><Label>Meja</Label><Select value={form.data.billiard_table_id} onValueChange={(value) => form.setData('billiard_table_id', value)}><SelectTrigger className="w-full"><SelectValue placeholder="Pilih meja tersedia" /></SelectTrigger><SelectContent>{availableTables.map((table) => <SelectItem key={table.id} value={String(table.id)}>{table.name} · {table.billiard_table_type.name}</SelectItem>)}</SelectContent></Select>{form.errors.billiard_table_id && <p className="text-sm text-destructive">{form.errors.billiard_table_id}</p>}</div>
                            <div className="space-y-2"><Label>Durasi bermain</Label><Select value={form.data.duration_hours} onValueChange={(value) => form.setData('duration_hours', value)}><SelectTrigger className="w-full"><SelectValue placeholder="Pilih durasi" /></SelectTrigger><SelectContent>{durationOptions.map((hours) => <SelectItem key={hours} value={String(hours)}>{hours} jam</SelectItem>)}</SelectContent></Select>{form.errors.duration_hours && <p className="text-sm text-destructive">{form.errors.duration_hours}</p>}</div>
                            <DialogFooter className="mt-auto"><Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}><X className="size-4" /> Batal</Button><Button type="submit" disabled={form.processing}><Plus className="size-4" /> {form.processing ? 'Membuka...' : 'Buka Sesi'}</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
