import { router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, Gift, Plus, Users, X, Zap } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { create as posPayment } from '@/routes/cashier/pos/payment/index';
import { store as posStore } from '@/routes/cashier/pos/index';
import { Button } from '@/components/atoms/ui/button';
import { Card, CardContent } from '@/components/atoms/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/atoms/ui/dialog';
import { Input } from '@/components/atoms/ui/input';
import { Label } from '@/components/atoms/ui/label';
import { Badge } from '@/components/atoms/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/ui/alert';
import type { Auth } from '@/types';

type Session = {
    id: number;
    started_at: string;
    customer_name: string;
    planned_hours: number | null;
    billiard_table: { name: string };
    table_rate: { name: string; hourly_rate: number } | null;
    hourly_rate: { name: string; hourly_rate: number } | null;
    table_package: { name: string; duration_minutes: number; price: number } | null;
};

type Table = {
    id: number;
    name: string;
    status: string;
    billiard_table_type: { id: number; name: string };
    billiard_sessions: Session[];
    effective_rate: { id: number; name: string; hourly_rate: number } | null;
};

type Package = {
    id: number;
    name: string;
    duration_minutes: number;
    price: number;
    notes: string | null;
    billiard_table_type: { id: number; name: string };
};

type CurrentShift = {
    id: number;
    opened_at: string;
    initial_balance: number;
    current_balance: number;
    total_sales: number;
    total_transactions: number;
} | null;

const money = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

function formatElapsed(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

function formatRemaining(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatMinutes(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} Menit`;
    if (m === 0) return `${h} Jam`;
    return `${h}j ${m}m`;
}

function ActiveTableCard({ session, onClose }: { session: Session; onClose: () => void }) {
    const startedAt = useMemo(() => new Date(session.started_at).getTime(), [session]);
    const [elapsed, setElapsed] = useState(Date.now() - startedAt);

    useEffect(() => {
        const timer = window.setInterval(() => setElapsed(Date.now() - startedAt), 1000);
        return () => window.clearInterval(timer);
    }, [startedAt]);

    const isPackage = session.table_package !== null;
    const packageDuration = isPackage ? (session.table_package!.duration_minutes * 60 * 1000) : 0;
    const isBebas = !isPackage && session.planned_hours === null;
    const endAt = isBebas
        ? 0
        : isPackage
            ? startedAt + packageDuration
            : startedAt + (session.planned_hours ?? 0) * 60 * 60 * 1000;
    const remaining = isBebas ? -1 : Math.max(0, endAt - Date.now());
    const isExpired = !isBebas && remaining === 0;
    const isAlmostExpired = !isBebas && !isExpired && remaining < 10 * 60 * 1000;
    const rate = session.hourly_rate?.hourly_rate ?? session.table_rate?.hourly_rate ?? 0;

    const cardBorderColor = isExpired
        ? 'border-red-300 bg-red-50'
        : isAlmostExpired
            ? 'border-amber-300 bg-amber-50'
            : 'border-slate-200 bg-white';

    return (
        <Card className={`shadow-md hover:shadow-lg transition-shadow ${cardBorderColor}`}>
            <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <Badge variant="outline" className="bg-indigo-600 text-white border-indigo-600 text-[10px] px-1.5 py-0 h-auto font-bold">
                                AKTIF
                            </Badge>
                            {isPackage && (
                                <Badge variant="outline" className="bg-fuchsia-600 text-white border-fuchsia-600 text-[10px] px-1.5 py-0 h-auto font-bold">
                                    🎁 PAKET
                                </Badge>
                            )}
                            {isExpired && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-auto font-bold">
                                    WAKTU HABIS
                                </Badge>
                            )}
                            {isAlmostExpired && !isExpired && (
                                <Badge variant="outline" className="bg-amber-500 text-white border-amber-500 text-[10px] px-1.5 py-0 h-auto font-bold">
                                    HAMPIR HABIS
                                </Badge>
                            )}
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg truncate">{session.billiard_table.name}</h3>
                        <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                            <Users className="size-3.5" />
                            {session.customer_name}
                        </p>
                        {isPackage && (
                            <p className="text-xs text-fuchsia-700 font-semibold mt-0.5 truncate bg-fuchsia-50 inline-block px-1.5 py-0.5 rounded">
                                {session.table_package!.name} · {money(session.table_package!.price)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mb-3 text-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 py-3 ring-1 ring-slate-200/60">
                    <p className="text-xs text-slate-400 mb-1 font-medium">
                        {isBebas ? '⏱️ Durasi (Bebas)' : isExpired ? '⌛ Lewat Waktu' : '⏰ Sisa Waktu'}
                    </p>
                    <p className={`text-3xl font-black tabular-nums tracking-tight ${
                        isExpired ? 'text-red-600' : isAlmostExpired ? 'text-amber-600' : 'text-slate-900'
                    }`}>
                        {isExpired ? formatElapsed(elapsed) : isBebas ? formatElapsed(elapsed) : formatRemaining(remaining)}
                    </p>
                </div>

                <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {new Date(session.started_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded-md ${
                        isPackage
                            ? 'bg-fuchsia-50 text-fuchsia-700'
                            : 'bg-indigo-50 text-indigo-700'
                    }`}>
                        {isPackage ? money(session.table_package!.price) : `${money(rate)}/jam`}
                    </span>
                </div>

                <Button
                    variant={isExpired ? 'destructive' : 'default'}
                    size="sm"
                    className="w-full h-10 font-semibold shadow-sm"
                    onClick={onClose}
                >
                    <X className="size-4 mr-1" />
                    Bayar & Tutup
                </Button>
            </CardContent>
        </Card>
    );
}

function AvailableTableCard({ table, onClick, disabled }: { table: Table; onClick: () => void; disabled: boolean }) {
    const rate = table.effective_rate?.hourly_rate ?? 0;
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="group w-full text-left transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
            <div className={`h-full rounded-2xl border-2 p-4 transition-all duration-200 ${
                disabled
                    ? 'border-dashed border-slate-200 bg-slate-50'
                    : 'border-dashed border-emerald-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md hover:shadow-emerald-500/10'
            }`}>
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 h-auto font-bold ${
                            disabled ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-emerald-600 text-white border-emerald-600'
                        }`}>
                            {disabled ? 'TERBLOKIR' : 'TERSEDIA'}
                        </Badge>
                    </div>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                        disabled
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-emerald-500 text-white group-hover:scale-110'
                    }`}>
                        <Plus className="size-5" />
                    </div>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base mb-1">{table.name}</h4>
                <p className="text-sm text-slate-500 mb-2">{table.billiard_table_type.name}</p>
                <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${disabled ? 'text-slate-400' : 'text-emerald-700'}`}>
                        {money(rate)}/jam
                    </span>
                    {!disabled && (
                        <Zap className="size-4 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                </div>
            </div>
        </button>
    );
}

export default function BilliardSessionsIndex({ tables, packages = [], isPos = false }: { tables: Table[]; packages?: Package[]; isPos?: boolean }) {
    const { current_shift } = usePage<{ auth: Auth; current_shift: CurrentShift }>().props;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [pricingMode, setPricingMode] = useState<'duration' | 'package'>('duration');
    const form = useForm({ billiard_table_id: '', customer_name: '', duration_hours: '', table_package_id: '' });

    const hasActiveShift = current_shift !== null;

    const availableTables = tables.filter((table) => table.status === 'available' && table.billiard_sessions.length === 0);
    const activeTables = tables.filter((table) => table.billiard_sessions.length > 0);
    const unavailableTables = tables.filter((table) => table.status !== 'available' && table.billiard_sessions.length === 0);

    const selectedTable = availableTables.find((t) => String(t.id) === form.data.billiard_table_id);
    const matchingPackages = selectedTable
        ? packages.filter((pkg) => pkg.billiard_table_type.id === selectedTable.billiard_table_type.id)
        : [];

    const openDrawer = (tableId?: number) => {
        if (!hasActiveShift) return;
        form.reset();
        form.clearErrors();
        setPricingMode('duration');
        if (tableId !== undefined) {
            form.setData('billiard_table_id', String(tableId));
            const tbl = availableTables.find((t) => t.id === tableId);
            if (tbl) {
                const pkgsForTable = packages.filter((pkg) => pkg.billiard_table_type.id === tbl.billiard_table_type.id);
                if (pkgsForTable.length === 0) {
                    setPricingMode('duration');
                }
            }
        }
        setDrawerOpen(true);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!hasActiveShift) return;
        const payload: Record<string, string> = {
            billiard_table_id: form.data.billiard_table_id,
            customer_name: form.data.customer_name,
        };
        if (pricingMode === 'package') {
            payload.table_package_id = form.data.table_package_id;
        } else {
            payload.duration_hours = form.data.duration_hours;
        }
        const action = posStore();
        router.post(action.url, payload, {
            onSuccess: () => setDrawerOpen(false),
            onError: (errs) => form.setErrors(errs as Record<string, string>),
        });
    };

    const quickDurations = [
        { value: '', label: 'Bebas', hint: 'Tanpa batas waktu' },
        { value: '1', label: '1 Jam', hint: '' },
        { value: '2', label: '2 Jam', hint: '' },
        { value: '3', label: '3 Jam', hint: '' },
    ];

    const canSubmit =
        form.data.customer_name !== '' &&
        form.data.billiard_table_id !== '' &&
        !form.processing &&
        hasActiveShift &&
        (pricingMode === 'duration' ? true : form.data.table_package_id !== '');

    return (
        <div className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                {!hasActiveShift && (
                    <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-amber-200/70 text-amber-800">
                                <Clock className="size-4" />
                            </div>
                            <div className="flex-1">
                                <AlertTitle className="font-bold text-base">Shift Belum Dibuka</AlertTitle>
                                <AlertDescription className="text-sm">
                                    Silakan selesaikan pembukaan shift terlebih dahulu pada pop-up di atas.
                                    Kamu tidak dapat membuka sesi meja baru sebelum shift aktif.
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>
                )}

                {activeTables.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center gap-2.5">
                            <span className="flex h-3 w-3 items-center justify-center">
                                <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                            </span>
                            <h2 className="font-bold text-xl text-slate-900 tracking-tight">Meja Sedang Aktif</h2>
                            <Badge variant="default" className="bg-indigo-600 ml-1 text-xs font-bold">
                                {activeTables.length}
                            </Badge>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {activeTables.map((table) => (
                                <ActiveTableCard
                                    key={table.id}
                                    session={table.billiard_sessions[0]}
                                    onClose={() => hasActiveShift && router.get(posPayment(table.billiard_sessions[0].id).url)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {availableTables.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center gap-2.5">
                            <span className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                            <h2 className="font-bold text-xl text-slate-900 tracking-tight">Meja Tersedia</h2>
                            <Badge variant="default" className="bg-emerald-600 ml-1 text-xs font-bold">
                                {availableTables.length}
                            </Badge>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {availableTables.map((table) => (
                                <AvailableTableCard
                                    key={table.id}
                                    table={table}
                                    onClick={() => openDrawer(table.id)}
                                    disabled={!hasActiveShift}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {unavailableTables.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center gap-2.5">
                            <span className="h-3 w-3 rounded-full bg-slate-300 ring-4 ring-slate-100"></span>
                            <h2 className="font-bold text-lg text-slate-500 tracking-tight">Tidak Tersedia / Perawatan</h2>
                            <Badge variant="outline" className="ml-1 text-xs font-bold text-slate-500">
                                {unavailableTables.length}
                            </Badge>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {unavailableTables.map((table) => (
                                <div
                                    key={table.id}
                                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 opacity-60"
                                >
                                    <Badge variant="outline" className="text-[10px] px-2 py-0 h-auto mb-2 bg-slate-200 text-slate-600 border-slate-200 font-bold">
                                        OFFLINE
                                    </Badge>
                                    <h4 className="font-bold text-slate-500 text-base">{table.name}</h4>
                                    <p className="text-sm text-slate-400">{table.billiard_table_type?.name ?? '-'}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {tables.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100">
                            <CheckCircle2 className="size-12 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-1">Belum Ada Meja Biliar</h3>
                        <p className="text-slate-500 max-w-sm">
                            Silakan tambahkan data meja biliar terlebih dahulu melalui panel Admin Master Data.
                        </p>
                    </div>
                )}
            </div>

            <Dialog open={drawerOpen} onOpenChange={(o) => { if (!o && !form.processing) setDrawerOpen(false); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                                <Plus className="size-5" />
                            </div>
                            Buka Sesi Baru
                        </DialogTitle>
                        <p className="text-sm text-slate-500">
                            Masukkan data customer untuk mulai sesi biliar.
                        </p>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="customer_name" className="text-sm font-semibold">
                                Nama Customer <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="customer_name"
                                placeholder="Contoh: Budi Santoso"
                                value={form.data.customer_name}
                                onChange={(e) => form.setData('customer_name', e.target.value)}
                                autoFocus
                                className="h-11"
                            />
                            {form.errors.customer_name && <p className="text-sm text-red-500">{form.errors.customer_name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                {pricingMode === 'package' ? '🎁 Pilih Paket' : '⏱️ Pilih Durasi'}
                            </Label>
                            <div className="flex gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => { setPricingMode('duration'); form.setData('table_package_id', ''); }}
                                    className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-center text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                                        pricingMode === 'duration'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50'
                                    }`}
                                >
                                    <Clock className="size-4" /> Durasi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setPricingMode('package'); form.setData('duration_hours', ''); }}
                                    className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-center text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                                        pricingMode === 'package'
                                            ? 'border-fuchsia-600 bg-fuchsia-50 text-fuchsia-700'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-fuchsia-300 hover:bg-fuchsia-50/50'
                                    }`}
                                >
                                    <Gift className="size-4" /> Paket
                                </button>
                            </div>

                            {pricingMode === 'duration' ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {quickDurations.map((d) => {
                                        const isSelected = form.data.duration_hours === d.value;
                                        return (
                                            <button
                                                type="button"
                                                key={d.label}
                                                onClick={() => form.setData('duration_hours', d.value)}
                                                className={`rounded-xl border-2 px-2 py-3 text-center transition-all ${
                                                    isSelected
                                                        ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                <p className={`text-sm font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                    {d.label}
                                                </p>
                                                {d.hint && (
                                                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-500' : 'text-slate-400'}`}>
                                                        {d.hint}
                                                    </p>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {matchingPackages.length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-4">
                                            {selectedTable ? 'Tidak ada paket untuk tipe meja ini.' : 'Pilih meja terlebih dahulu.'}
                                        </p>
                                    ) : (
                                        matchingPackages.map((pkg) => {
                                            const isSelected = form.data.table_package_id === String(pkg.id);
                                            const savings = selectedTable?.effective_rate
                                                ? Math.round(pkg.price - (pkg.duration_minutes / 60 * selectedTable.effective_rate.hourly_rate))
                                                : 0;
                                            return (
                                                <button
                                                    type="button"
                                                    key={pkg.id}
                                                    onClick={() => form.setData('table_package_id', String(pkg.id))}
                                                    className={`w-full rounded-xl border-2 p-3.5 text-left transition-all flex items-center justify-between gap-2 ${
                                                        isSelected
                                                            ? 'border-fuchsia-500 bg-fuchsia-50 ring-4 ring-fuchsia-500/10 shadow-sm'
                                                            : 'border-slate-200 bg-white hover:border-fuchsia-300 hover:bg-fuchsia-50/30'
                                                    }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className={`font-bold text-sm ${isSelected ? 'text-fuchsia-700' : 'text-slate-800'}`}>
                                                                {pkg.name}
                                                            </p>
                                                            {isSelected && (
                                                                <div className="flex size-5 items-center justify-center rounded-full bg-fuchsia-600 text-white">
                                                                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className={`text-xs mt-0.5 ${isSelected ? 'text-fuchsia-600' : 'text-slate-500'}`}>
                                                            {formatMinutes(pkg.duration_minutes)}
                                                            {pkg.notes && <span className="ml-1">· {pkg.notes}</span>}
                                                        </p>
                                                        {savings > 0 && (
                                                            <p className="text-[10px] mt-0.5 font-semibold text-emerald-600 bg-emerald-50 inline-block px-1.5 py-0.5 rounded">
                                                                Hemat {money(savings)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className={`font-black text-base shrink-0 ${isSelected ? 'text-fuchsia-700' : 'text-slate-800'}`}>
                                                        {money(pkg.price)}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-sm font-semibold">
                                Pilih Meja <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                                {availableTables.map((table) => {
                                    const isSelected = form.data.billiard_table_id === String(table.id);
                                    const rate = table.effective_rate?.hourly_rate ?? 0;
                                    return (
                                        <button
                                            key={table.id}
                                            type="button"
                                            onClick={() => form.setData('billiard_table_id', String(table.id))}
                                            className={`rounded-xl border-2 p-3.5 text-left transition-all ${
                                                isSelected
                                                    ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500/10 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-extrabold text-slate-900">{table.name}</p>
                                                {isSelected && (
                                                    <div className="flex size-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                                                        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mb-1.5">{table.billiard_table_type.name}</p>
                                            <div className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${
                                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {money(rate)}/jam
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {form.errors.billiard_table_id && <p className="text-sm text-red-500">{form.errors.billiard_table_id}</p>}
                        </div>

                        <DialogFooter className="flex-col gap-2 pt-1 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDrawerOpen(false)}
                                disabled={form.processing}
                                className="sm:flex-1 h-11 font-semibold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                className="sm:flex-1 h-11 font-semibold shadow-md shadow-indigo-500/20"
                            >
                                {form.processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Membuka Sesi...
                                    </span>
                                ) : pricingMode === 'package' ? (
                                    <span className="flex items-center gap-1.5"><Gift className="size-4" /> Buka Paket</span>
                                ) : (
                                    '🎱  Buka Sesi'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
