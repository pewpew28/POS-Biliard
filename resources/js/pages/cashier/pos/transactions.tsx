import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, ChevronDown, Clock3, Receipt, User, Wallet } from 'lucide-react';
import { useState } from 'react';
import { index as posIndex } from '@/routes/cashier/pos/index';
import { Button } from '@/components/atoms/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/atoms/ui/collapsible';
import { Badge } from '@/components/atoms/ui/badge';
import type { Auth } from '@/types';

type Transaction = {
    id: number;
    customer_name: string;
    started_at: string;
    ended_at: string;
    duration_minutes: number;
    total_amount: number;
    billiard_table: { id: number; name: string; type: string };
    rate: { name: string; hourly_rate: number } | null;
    cashier: { id: number; name: string };
    created_at: string;
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
const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
};

export default function TransactionsIndex({ transactions }: { transactions: Transaction[] }) {
    const { current_shift } = usePage<{ auth: Auth; current_shift: CurrentShift }>().props;
    const [openId, setOpenId] = useState<number | null>(null);

    const handleBack = () => {
        router.get(posIndex().url);
    };

    const totalOmset = transactions.reduce((sum, t) => sum + t.total_amount, 0);
    const totalMenit = transactions.reduce((sum, t) => sum + t.duration_minutes, 0);

    return (
        <>
            <Head title="Riwayat Transaksi" />
            <div className="flex min-h-full flex-1 flex-col bg-slate-50">
                <header className="border-b bg-white px-4 py-4 md:px-6 shadow-sm">
                    <div className="mx-auto max-w-4xl flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={handleBack}>
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                                <Receipt className="size-4" /> POS KASIR
                            </div>
                            <h1 className="mt-1 text-xl font-bold text-slate-900">Riwayat Transaksi Shift Ini</h1>
                        </div>
                        {current_shift && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                                ● Shift Aktif
                            </Badge>
                        )}
                    </div>
                </header>

                <main className="mx-auto w-full max-w-4xl flex-1 p-4 md:p-6 space-y-6">
                    {current_shift && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <Card className="border-slate-200 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
                                        <Wallet className="size-3.5" /> Total Omset
                                    </div>
                                    <p className="text-2xl font-black tabular-nums text-indigo-700">
                                        {money(totalOmset)}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
                                        <Receipt className="size-3.5" /> Transaksi
                                    </div>
                                    <p className="text-2xl font-black tabular-nums text-slate-800">
                                        {transactions.length}
                                        <span className="ml-1 text-sm font-semibold text-slate-500">meja</span>
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
                                        <Clock3 className="size-3.5" /> Total Jam Main
                                    </div>
                                    <p className="text-2xl font-black tabular-nums text-emerald-700">
                                        {formatDuration(totalMenit)}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {transactions.length === 0 ? (
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-slate-100">
                                    <Receipt className="size-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-1">Belum Ada Transaksi</h3>
                                <p className="text-slate-500 max-w-sm text-sm">
                                    Transaksi akan muncul di sini setelah ada sesi meja yang ditutup dan dibayarkan pada shift ini.
                                </p>
                                <Button onClick={handleBack} variant="outline" className="mt-6 font-semibold">
                                    ← Kembali ke POS
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => (
                                <Card key={tx.id} className="border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                    <Collapsible open={openId === tx.id} onOpenChange={(open) => setOpenId(open ? tx.id : null)}>
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-slate-50/70 transition-colors pb-3 pt-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20 text-white">
                                                            <Receipt className="size-5" />
                                                        </div>
                                                        <div className="text-left min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <CardTitle className="text-base font-black text-slate-900 truncate">
                                                                    {tx.billiard_table.name}
                                                                </CardTitle>
                                                                <Badge variant="outline" className="text-[10px] px-2 py-0 h-auto font-bold bg-slate-100 text-slate-600 border-slate-200 shrink-0">
                                                                    {tx.billiard_table.type}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                                                                <User className="size-3.5" />
                                                                {tx.customer_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className="text-right">
                                                            <p className="text-xl font-black tabular-nums text-indigo-700 leading-none">
                                                                {money(tx.total_amount)}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-1 flex items-center justify-end gap-1">
                                                                <Clock3 className="size-3" />
                                                                {formatDuration(tx.duration_minutes)}
                                                            </p>
                                                        </div>
                                                        <ChevronDown className={`size-5 text-slate-400 transition-transform shrink-0 ${openId === tx.id ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="grid gap-2.5 pt-0 pb-4 px-4">
                                                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 text-sm">
                                                    <span className="text-slate-500 flex items-center gap-1.5">
                                                        <User className="size-4" /> Kasir
                                                    </span>
                                                    <span className="font-semibold text-slate-800">{tx.cashier.name}</span>
                                                </div>
                                                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 text-sm">
                                                    <span className="text-slate-500 flex items-center gap-1.5">
                                                        <Calendar className="size-4" /> Tanggal Selesai
                                                    </span>
                                                    <span className="font-medium tabular-nums text-slate-700">
                                                        {new Date(tx.ended_at).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 text-sm">
                                                    <span className="text-slate-500 flex items-center gap-1.5">
                                                        <Clock3 className="size-4" /> Waktu Main
                                                    </span>
                                                    <span className="font-medium tabular-nums text-slate-700">
                                                        {new Date(tx.started_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                        <span className="mx-1.5 text-slate-400">→</span>
                                                        {new Date(tx.ended_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {tx.rate && (
                                                    <div className="flex items-center justify-between rounded-xl bg-indigo-50/60 p-3.5 text-sm ring-1 ring-indigo-100">
                                                        <span className="text-indigo-700 flex items-center gap-1.5 font-semibold">
                                                            💵 Tarif Digunakan
                                                        </span>
                                                        <span className="font-bold text-indigo-800">
                                                            {tx.rate.name}
                                                            <span className="ml-1.5 font-normal text-indigo-600/80 text-xs">
                                                                ({money(tx.rate.hourly_rate)}/jam)
                                                            </span>
                                                        </span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
