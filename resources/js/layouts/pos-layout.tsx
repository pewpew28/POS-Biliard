import { Clock, LogOut, MonitorPlay, Receipt, TrendingUp, Wallet, Users } from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/atoms/ui/button';
import { Card, CardContent } from '@/components/atoms/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/atoms/ui/dialog';
import { Input } from '@/components/atoms/ui/input';
import { Label } from '@/components/atoms/ui/label';
import { Textarea } from '@/components/atoms/ui/textarea';
import { Badge } from '@/components/atoms/ui/badge';
import { logout } from '@/routes';
import { transactions as posTransactions } from '@/routes/cashier/pos/index';
import type { Auth } from '@/types';

type Props = {
    children: React.ReactNode;
};

type CurrentShift = {
    id: number;
    opened_at: string;
    initial_balance: number;
    current_balance: number;
    total_sales: number;
    total_transactions: number;
} | null;

function formatMoney(value: number): string {
    return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function PosLayout({ children }: Props) {
    const { auth, current_shift } = usePage<{ auth: Auth; current_shift: CurrentShift }>().props;

    const [showOpenShift, setShowOpenShift] = useState(false);
    const [showCloseShift, setShowCloseShift] = useState(false);
    const [showShiftSummary, setShowShiftSummary] = useState(false);
    const [initialBalance, setInitialBalance] = useState('');
    const [finalBalance, setFinalBalance] = useState('');
    const [closeNotes, setCloseNotes] = useState('');
    const [isOpening, setIsOpening] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [shiftSummary, setShiftSummary] = useState<{
        opened_at: string;
        closed_at: string;
        initial_balance: number;
        final_balance: number;
        total_sales: number;
        total_transactions: number;
    } | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (current_shift === null) {
            setShowOpenShift(true);
        } else {
            setShowOpenShift(false);
            setFinalBalance(String(current_shift.current_balance));
        }
    }, [current_shift?.id]);

    const openShift = async () => {
        if (!initialBalance) return;
        setIsOpening(true);

        router.post('/cashier/shift/open', {
            initial_balance: initialBalance,
        }, {
            onSuccess: () => {
                setShowOpenShift(false);
                setInitialBalance('');
            },
            onFinish: () => setIsOpening(false),
        });
    };

    const handleLogoutClick = () => {
        if (!current_shift) {
            router.post(logout().url);
            return;
        }
        setFinalBalance(String(current_shift.current_balance));
        setShowCloseShift(true);
    };

    const closeShiftAndLogout = async () => {
        if (!finalBalance) return;
        setIsClosing(true);

        try {
            const res = await fetch('/cashier/shift/close', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    final_balance: finalBalance,
                    notes: closeNotes,
                }),
                credentials: 'same-origin',
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.shift) {
                    setShiftSummary(data.shift);
                    setShowCloseShift(false);
                    setShowShiftSummary(true);
                    setCloseNotes('');
                }
            }
        } catch {
            // fallback: kirim via form untuk backward compat
            router.post('/cashier/shift/close', {
                final_balance: finalBalance,
                notes: closeNotes,
            }, {
                onSuccess: () => {
                    setShowCloseShift(false);
                    router.post(logout().url);
                },
                onFinish: () => setIsClosing(false),
            });
            return;
        }

        setIsClosing(false);
    };

    const confirmLogout = () => {
        router.post(logout().url);
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <header className="sticky top-0 z-20 border-b bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white shadow-md">
                <div className="flex items-center justify-between px-4 py-3 lg:px-6">
                    <div className="flex items-center gap-4">
                        <Link href="/cashier/pos" className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/20">
                                <MonitorPlay className="size-5" />
                            </div>
                            <div className="hidden flex-col sm:flex">
                                <span className="text-lg font-extrabold tracking-tight leading-none">BILIAR POS</span>
                                <span className="text-xs text-indigo-200 mt-0.5">Sistem Kasir Biliar</span>
                            </div>
                        </Link>
                    </div>

                    <div className="hidden items-center gap-6 md:flex">
                        {current_shift ? (
                            <>
                                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                                    <Clock className="size-4 text-indigo-200" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-wider text-indigo-200 leading-none">Shift Dibuka</span>
                                        <span className="text-sm font-semibold leading-tight mt-0.5">{formatTime(current_shift.opened_at)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                                    <Users className="size-4 text-indigo-200" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-wider text-indigo-200 leading-none">Kasir</span>
                                        <span className="text-sm font-semibold leading-tight mt-0.5">{auth.user.name}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Badge variant="outline" className="bg-amber-400/20 text-amber-100 border-amber-300/30 px-3 py-1.5 text-sm">
                                ⚠️ Shift Belum Dibuka
                            </Badge>
                        )}
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-wider text-indigo-200 leading-none">Tanggal & Waktu</span>
                            <span className="text-sm font-semibold tabular-nums leading-tight mt-0.5">
                                {currentTime.toLocaleString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {current_shift && (
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="text-white hover:bg-white/10 hover:text-white gap-1.5"
                            >
                                <Link href={posTransactions().url}>
                                    <Receipt className="size-4" />
                                    <span className="hidden sm:inline">Riwayat</span>
                                </Link>
                            </Button>
                        )}
                        <div className="h-8 w-px bg-white/20 mx-1 hidden sm:block" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogoutClick}
                            className="text-white hover:bg-red-500/30 hover:text-white gap-1.5"
                        >
                            <LogOut className="size-4" />
                            <span className="hidden sm:inline">Keluar</span>
                        </Button>
                    </div>
                </div>

                {current_shift && (
                    <div className="grid grid-cols-2 gap-2 border-t border-white/10 bg-white/5 px-4 py-2.5 lg:grid-cols-4 lg:px-6 lg:gap-4">
                        <div className="flex items-center gap-2.5 rounded-lg bg-white/10 px-3 py-2 ring-1 ring-white/10">
                            <div className="flex size-8 items-center justify-center rounded-md bg-emerald-500/30">
                                <Wallet className="size-4 text-emerald-100" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] uppercase tracking-wider text-indigo-200/80 leading-none">Saldo Awal</span>
                                <span className="text-sm font-bold tabular-nums truncate leading-tight mt-0.5">{formatMoney(current_shift.initial_balance)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-lg bg-white/10 px-3 py-2 ring-1 ring-white/10">
                            <div className="flex size-8 items-center justify-center rounded-md bg-emerald-500/30">
                                <TrendingUp className="size-4 text-emerald-100" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] uppercase tracking-wider text-indigo-200/80 leading-none">Penjualan</span>
                                <span className="text-sm font-bold tabular-nums truncate leading-tight mt-0.5">{formatMoney(current_shift.total_sales)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-lg bg-white/10 px-3 py-2 ring-1 ring-white/10">
                            <div className="flex size-8 items-center justify-center rounded-md bg-sky-500/30">
                                <Receipt className="size-4 text-sky-100" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] uppercase tracking-wider text-indigo-200/80 leading-none">Transaksi</span>
                                <span className="text-sm font-bold tabular-nums truncate leading-tight mt-0.5">{current_shift.total_transactions} meja</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-lg bg-white/15 px-3 py-2 ring-1 ring-white/20">
                            <div className="flex size-8 items-center justify-center rounded-md bg-amber-500/40">
                                <Wallet className="size-4 text-amber-50" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] uppercase tracking-wider text-amber-100 leading-none">Saldo Sekarang</span>
                                <span className="text-sm font-extrabold tabular-nums truncate leading-tight mt-0.5">{formatMoney(current_shift.current_balance)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1">{children}</main>

            <Dialog open={showOpenShift}>
                <DialogContent hideClose className="sm:max-w-md">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                        <MonitorPlay className="size-8 text-white" />
                    </div>
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-xl font-bold text-slate-900">Selamat Datang, {auth.user.name}!</DialogTitle>
                        <p className="text-sm text-slate-500 mt-1">
                            Silakan masukkan saldo awal kasir untuk memulai shift hari ini.
                        </p>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="initial_balance" className="text-sm font-medium">Saldo Awal Kasir</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">Rp</span>
                                <Input
                                    id="initial_balance"
                                    type="number"
                                    min={0}
                                    className="h-14 pl-12 text-2xl font-bold tabular-nums"
                                    placeholder="0"
                                    value={initialBalance}
                                    onChange={(e) => setInitialBalance(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-slate-400">Masukkan jumlah uang tunai yang ada di laci kasir saat ini.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={openShift}
                            disabled={isOpening || !initialBalance || Number(initialBalance) < 0}
                            className="h-12 w-full text-base font-semibold shadow-lg shadow-indigo-500/30"
                        >
                            {isOpening ? (
                                <span className="flex items-center gap-2">
                                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Membuka Shift...
                                </span>
                            ) : (
                                '🛒  Buka Shift & Mulai Transaksi'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showCloseShift} onOpenChange={(o) => !o && !isClosing && setShowCloseShift(false)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/20">
                                <LogOut className="size-5 text-amber-600" />
                            </div>
                            Tutup Shift & Keluar
                        </DialogTitle>
                        <p className="text-sm text-slate-500 mt-1">
                            Sebelum keluar, hitung dan masukkan jumlah uang tunai aktual di laci kasir.
                        </p>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <Card className="border-indigo-100 bg-indigo-50/50">
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Saldo Awal</span>
                                    <span className="font-semibold tabular-nums">{current_shift ? formatMoney(current_shift.initial_balance) : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Total Penjualan</span>
                                    <span className="font-semibold tabular-nums text-emerald-600">+ {current_shift ? formatMoney(current_shift.total_sales) : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-indigo-200/50 pt-2 text-base">
                                    <span className="font-medium text-slate-700">Saldo (Perhitungan Sistem)</span>
                                    <span className="font-bold tabular-nums text-indigo-700">{current_shift ? formatMoney(current_shift.current_balance) : '-'}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="space-y-2">
                            <Label htmlFor="final_balance" className="text-sm font-medium">Saldo Akhir Aktual *</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">Rp</span>
                                <Input
                                    id="final_balance"
                                    type="number"
                                    min={0}
                                    className="h-12 pl-12 text-xl font-bold tabular-nums"
                                    placeholder="0"
                                    value={finalBalance}
                                    onChange={(e) => setFinalBalance(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-slate-400">Jumlah uang tunai yang benar-benar ada di laci setelah dihitung.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="close_notes" className="text-sm font-medium">Catatan (opsional)</Label>
                            <Textarea
                                id="close_notes"
                                placeholder="Contoh: Selisih Rp 5.000 karena kurang kembalian, atau semua sesuai..."
                                value={closeNotes}
                                onChange={(e) => setCloseNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setShowCloseShift(false)}
                            disabled={isClosing}
                            className="sm:flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={closeShiftAndLogout}
                            disabled={isClosing || !finalBalance || Number(finalBalance) < 0}
                            className="h-11 sm:flex-1 font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/20"
                        >
                            {isClosing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Memproses...
                                </span>
                            ) : (
                                'Tutup Shift & Logout'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showShiftSummary}>
                <DialogContent hideClose className="sm:max-w-md">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                        <svg className="size-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-xl font-bold text-slate-900">Shift Berhasil Ditutup!</DialogTitle>
                        <p className="text-sm text-slate-500 mt-1">
                            Berikut ringkasan shift hari ini. Terima kasih atas kerja kerasnya!
                        </p>
                    </DialogHeader>
                    {shiftSummary && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <p className="text-[11px] uppercase tracking-wider text-slate-400">Saldo Awal</p>
                                    <p className="mt-1 text-lg font-bold tabular-nums text-slate-800">{formatMoney(shiftSummary.initial_balance)}</p>
                                </div>
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                                    <p className="text-[11px] uppercase tracking-wider text-emerald-500">Penjualan</p>
                                    <p className="mt-1 flex items-center gap-1 text-lg font-bold tabular-nums text-emerald-700">
                                        <TrendingUp className="size-4" />
                                        {formatMoney(shiftSummary.total_sales)}
                                    </p>
                                </div>
                            </div>
                            <Card className="border-slate-200">
                                <CardContent className="p-4 space-y-2.5 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 flex items-center gap-1.5">
                                            <Clock className="size-4" /> Waktu Shift
                                        </span>
                                        <span className="font-medium tabular-nums">
                                            {formatDateTime(shiftSummary.opened_at)}
                                            <span className="mx-1 text-slate-400">→</span>
                                            {new Date(shiftSummary.closed_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 flex items-center gap-1.5">
                                            <Receipt className="size-4" /> Total Transaksi
                                        </span>
                                        <span className="font-semibold">{shiftSummary.total_transactions} meja</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-3 text-base">
                                        <span className="font-semibold text-slate-700">Saldo Akhir</span>
                                        <span className="text-xl font-extrabold tabular-nums text-indigo-700">{formatMoney(shiftSummary.final_balance)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            onClick={confirmLogout}
                            className="h-12 w-full text-base font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20"
                        >
                            Konfirmasi & Keluar Akun
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
