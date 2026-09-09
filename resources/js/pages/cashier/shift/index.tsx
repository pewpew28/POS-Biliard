import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, DollarSign, Plus, Receipt, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/atoms/ui/button';
import { Card, CardContent } from '@/components/atoms/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/atoms/ui/dialog';
import { Input } from '@/components/atoms/ui/input';
import { Label } from '@/components/atoms/ui/label';

type MutationType = {
    id: number;
    type: string;
    amount: number;
    description: string | null;
    created_at: string;
};

type CurrentShiftType = {
    id: number;
    opened_at: string;
    initial_balance: number;
    current_balance: number;
    total_sales: number;
    total_transactions: number;
    recent_mutations: MutationType[];
};

type TodaySummaryType = {
    total_sales: number;
    total_transactions: number;
    shifts_count: number;
};

function formatMoney(value: number): string {
    return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function ShiftIndex({
    current_shift,
    today_summary,
}: {
    current_shift: CurrentShiftType | null;
    today_summary: TodaySummaryType;
}) {
    const [openModal, setOpenModal] = useState<'open' | 'mutation' | null>(null);
    const openForm = useForm({ initial_balance: '' });
    const mutationForm = useForm({ type: 'deposit', amount: '', description: '' });

    const handleOpenShift = (e: React.FormEvent) => {
        e.preventDefault();
        openForm.post('/cashier/shift/open', {
            onSuccess: () => {
                setOpenModal(null);
                openForm.reset();
            },
        });
    };

    const handleAddMutation = (e: React.FormEvent) => {
        e.preventDefault();
        mutationForm.post('/cashier/shift/mutation', {
            onSuccess: () => {
                setOpenModal(null);
                mutationForm.reset();
            },
        });
    };

    return (
        <>
            <Head title="Shift Kasir" />
            <div className="flex min-h-full flex-col">
                {/* Header */}
                <header className="border-b bg-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" asChild>
                                <a href="/cashier/pos">
                                    <ArrowLeft className="size-4" />
                                </a>
                            </Button>
                            <div>
                                <h1 className="font-semibold text-slate-900">Shift</h1>
                                <p className="text-sm text-slate-500">
                                    {current_shift ? `Buka ${formatTime(current_shift.opened_at)}` : 'Belum buka shift'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-4 space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <DollarSign className="size-4" /> Saldo
                                </div>
                                <p className="text-xl font-bold text-slate-900">
                                    {current_shift ? formatMoney(current_shift.current_balance) : '-'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <TrendingUp className="size-4" /> Penjualan
                                </div>
                                <p className="text-xl font-bold text-emerald-600">
                                    {current_shift ? formatMoney(current_shift.total_sales) : formatMoney(today_summary.total_sales)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {!current_shift ? (
                        /* No Shift - Open Shift */
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 rounded-full bg-slate-100 p-4">
                                <Receipt className="size-8 text-slate-400" />
                            </div>
                            <h2 className="mb-2 font-semibold">Belum Ada Shift</h2>
                            <p className="mb-6 text-sm text-slate-500">
                                Buka shift untuk mulai transaksi
                            </p>
                            <Button onClick={() => setOpenModal('open')} className="gap-2">
                                <Plus className="size-4" /> Buka Shift
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 gap-2" onClick={() => setOpenModal('mutation')}>
                                    <Plus className="size-4" /> Mutasi
                                </Button>
                                <Button variant="outline" className="flex-1" asChild>
                                    <a href="/cashier/pos">Ke Kasir</a>
                                </Button>
                            </div>

                            {/* Recent Mutations */}
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="mb-3 font-medium text-slate-900">Mutasi Terakhir</h3>
                                    {current_shift.recent_mutations.length === 0 ? (
                                        <p className="py-4 text-center text-sm text-slate-400">Belum ada mutasi</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {current_shift.recent_mutations.map((m) => (
                                                <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {m.type === 'sale' ? 'Penjualan' : m.type === 'deposit' ? 'Setor' : m.type === 'withdrawal' ? 'Tarik' : 'Mutasi'}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{m.description || formatTime(m.created_at)}</p>
                                                    </div>
                                                    <p className={`text-sm font-semibold ${m.type === 'withdrawal' ? 'text-red-500' : 'text-emerald-600'}`}>
                                                        {m.type === 'withdrawal' ? '-' : '+'}{formatMoney(m.amount)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Open Shift Modal */}
                <Dialog open={openModal === 'open'} onOpenChange={(o) => !o && setOpenModal(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Buka Shift</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleOpenShift} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Saldo Awal</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
                                    <Input
                                        type="number"
                                        className="pl-10"
                                        placeholder="0"
                                        value={openForm.data.initial_balance}
                                        onChange={(e) => openForm.setData('initial_balance', e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full" disabled={openForm.processing}>
                                    {openForm.processing ? 'Membuka...' : 'Buka Shift'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Add Mutation Modal */}
                <Dialog open={openModal === 'mutation'} onOpenChange={(o) => !o && setOpenModal(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Mutasi</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddMutation} className="space-y-4">
                            <div className="flex gap-2">
                                {(['deposit', 'withdrawal'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => mutationForm.setData('type', type)}
                                        className={`flex-1 rounded-lg border-2 p-3 text-center font-medium transition-all ${
                                            mutationForm.data.type === type
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                                : 'border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        {type === 'deposit' ? 'Setor' : 'Tarik'}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <Label>Jumlah</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
                                    <Input
                                        type="number"
                                        className="pl-10"
                                        placeholder="0"
                                        value={mutationForm.data.amount}
                                        onChange={(e) => mutationForm.setData('amount', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Keterangan</Label>
                                <Input
                                    placeholder="Contoh: Setoran bank"
                                    value={mutationForm.data.description}
                                    onChange={(e) => mutationForm.setData('description', e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full" disabled={mutationForm.processing}>
                                    {mutationForm.processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
