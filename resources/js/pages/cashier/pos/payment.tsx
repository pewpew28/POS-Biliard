import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Copy,
    CreditCard,
    Gift,
    Printer,
    Receipt,
    User as UserIcon,
    Wallet,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { close as paymentClose } from '@/routes/cashier/pos/index';
import { index as posIndex } from '@/routes/cashier/pos/index';
import { Button } from '@/components/atoms/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/atoms/ui/dialog';
import { Input } from '@/components/atoms/ui/input';
import { Label } from '@/components/atoms/ui/label';
import { Badge } from '@/components/atoms/ui/badge';
import { toast } from 'sonner';
import type { Auth } from '@/types';

type SessionData = {
    id: number;
    customer_name: string;
    started_at: string;
    ended_at: string;
    duration_minutes: number;
    total_amount: number;
    billiard_table: { id: number; name: string; type: string };
    rate: { id: number; name: string; hourly_rate: number } | null;
    package: { id: number; name: string; duration_minutes: number; price: number } | null;
    closed_session_id?: number;
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
    return h > 0 ? `${h} jam ${m} menit` : `${m} menit`;
};

function ReceiptView({
    receipt,
}: {
    receipt: {
        no: string;
        transactionDate: string;
        cashierName: string;
        shiftId: number;
        customer: string;
        tableName: string;
        tableType: string;
        rateName: string;
        rateHourly: number;
        isPackage: boolean;
        packageName?: string;
        startedAt: string;
        endedAt: string;
        durationMinutes: number;
        subtotal: number;
        paymentAmount: number;
        change: number;
    };
}) {
    const isPkg = receipt.isPackage;
    return (
        <div id="receipt-printable" className="mx-auto max-w-sm bg-white text-slate-900">
            <div className="border border-dashed border-slate-300 rounded-2xl p-5 bg-gradient-to-b from-white to-slate-50 shadow-sm">
                <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-slate-200">
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/30">
                        <Receipt className="size-6 text-white" />
                    </div>
                    <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">BILIAR POS</h1>
                    <p className="text-[11px] text-slate-500 mt-1">Sistem Kasir Biliar</p>
                    <p className="text-[11px] text-slate-400 mt-1">Jl. Contoh No. 123, Indonesia</p>
                </div>

                <div className="space-y-1.5 mb-4 pb-4 border-b border-dashed border-slate-200 text-[12px]">
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500 shrink-0">No. Struk</span>
                        <span className="font-bold tabular-nums text-slate-800">{receipt.no}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500 shrink-0">Tgl / Jam</span>
                        <span className="font-medium tabular-nums text-slate-800">{receipt.transactionDate}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500 shrink-0">Kasir</span>
                        <span className="font-medium text-slate-800">{receipt.cashierName}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500 shrink-0">ID Shift</span>
                        <span className="font-medium tabular-nums text-slate-800">#{receipt.shiftId.toString().padStart(4, '0')}</span>
                    </div>
                </div>

                <div className="space-y-1.5 mb-4 pb-4 border-b border-dashed border-slate-200 text-[12px]">
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500 shrink-0">Customer</span>
                        <span className="font-semibold text-slate-800">{receipt.customer}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500 shrink-0">Meja</span>
                        <span className="font-semibold text-slate-800">{receipt.tableName} ({receipt.tableType})</span>
                    </div>
                    {isPkg ? (
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-500 shrink-0">Paket</span>
                            <span className="font-bold text-fuchsia-700">🎁 {receipt.packageName}</span>
                        </div>
                    ) : (
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-500 shrink-0">Tarif</span>
                            <span className="font-medium text-slate-800">
                                {receipt.rateName} · {money(receipt.rateHourly)}/jam
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500 shrink-0">Waktu Main</span>
                        <span className="font-medium tabular-nums text-slate-800">
                            {new Date(receipt.startedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            <span className="mx-1 text-slate-400">→</span>
                            {new Date(receipt.endedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500 shrink-0">Durasi</span>
                        <span className={`font-semibold tabular-nums ${isPkg ? 'text-fuchsia-700' : 'text-indigo-700'}`}>
                            {formatDuration(receipt.durationMinutes)}
                        </span>
                    </div>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b-2 border-dashed border-slate-200">
                    <div className="flex justify-between items-start gap-3 text-[13px]">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{isPkg ? receipt.packageName : receipt.tableName}</span>
                            <span className="text-[11px] text-slate-500">
                                {isPkg
                                    ? receipt.packageName
                                    : `${formatDuration(receipt.durationMinutes)} × ${money(receipt.rateHourly)}/jam`}
                            </span>
                        </div>
                        <span className={`font-bold tabular-nums text-base ${isPkg ? 'text-fuchsia-700' : 'text-slate-900'}`}>
                            {money(receipt.subtotal)}
                        </span>
                    </div>
                </div>

                <div className="space-y-2 text-[13px] mb-4">
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-600">Sub Total</span>
                        <span className="font-semibold tabular-nums text-slate-800">{money(receipt.subtotal)}</span>
                    </div>
                    <div className="flex justify-between gap-3 items-center pt-1 border-t border-slate-100">
                        <span className="font-bold text-slate-900">TOTAL BAYAR</span>
                        <span className={`text-xl font-black tabular-nums ${isPkg ? 'text-fuchsia-700' : 'text-indigo-700'}`}>
                            {money(receipt.subtotal)}
                        </span>
                    </div>
                </div>

                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 space-y-1.5 text-[12px] mb-4">
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500 flex items-center gap-1">
                            <Wallet className="size-3.5" /> Tunai Dibayar
                        </span>
                        <span className="font-bold tabular-nums text-slate-800">{money(receipt.paymentAmount)}</span>
                    </div>
                    <div className="flex justify-between gap-3 items-center">
                        <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="size-3.5" /> Kembalian
                        </span>
                        <span className={`font-black tabular-nums ${receipt.change > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {receipt.change > 0 ? money(receipt.change) : '-'}
                        </span>
                    </div>
                </div>

                <div className="text-center space-y-1 pt-2">
                    {isPkg ? (
                        <Badge variant="outline" className="bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 text-[10px] font-bold px-3 py-0.5 h-auto">
                            🎁  PAKET — PEMBAYARAN LUNAS
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold px-3 py-0.5 h-auto">
                            ✓  PEMBAYARAN LUNAS
                        </Badge>
                    )}
                    <p className="text-[11px] text-slate-400 mt-2">Terima kasih atas kunjungannya!</p>
                    <p className="text-[10px] text-slate-300 mt-1 font-mono">*** {receipt.no} ***</p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentIndex({ session }: { session: SessionData }) {
    const { auth, current_shift } = usePage<{ auth: Auth; current_shift: CurrentShift }>().props;
    const form = useForm({ payment_amount: session.total_amount, notes: '' });
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const hasActiveShift = current_shift !== null;

    const handleBack = () => {
        if (!form.processing) {
            router.get(posIndex().url);
        }
    };

    const change = Math.max(0, Number(form.data.payment_amount ?? 0) - session.total_amount);
    const totalAmount = session.total_amount;
    const paymentAmount = Number(form.data.payment_amount ?? 0);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!hasActiveShift || paymentAmount < totalAmount || form.processing) return;

        form.post(paymentClose(session.id).url, {
            only: [],
            preserveScroll: true,
            onSuccess: () => {
                const now = new Date();
                const receiptNo = `INV/${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}/${String(session.id).padStart(5, '0')}`;

                setReceiptData({
                    no: receiptNo,
                    transactionDate: now.toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }),
                    cashierName: auth.user.name,
                    shiftId: current_shift?.id ?? 0,
                    customer: session.customer_name,
                    tableName: session.billiard_table.name,
                    tableType: session.billiard_table.type,
                    rateName: session.rate?.name ?? 'Tarif Standar',
                    rateHourly: session.rate?.hourly_rate ?? 0,
                    isPackage: session.package !== null,
                    packageName: session.package?.name ?? '',
                    startedAt: session.started_at,
                    endedAt: session.ended_at,
                    durationMinutes: session.duration_minutes,
                    subtotal: totalAmount,
                    paymentAmount: paymentAmount,
                    change: change,
                });
                setShowReceipt(true);
                toast.success('Pembayaran berhasil!', { description: 'Sesi meja telah ditutup.' });
            },
        });
    };

    const handlePrint = () => {
        setIsPrinting(true);
        try {
            const printable = document.getElementById('receipt-printable');
            if (printable) {
                const printWindow = window.open('', '_blank', 'width=400,height=700');
                if (printWindow) {
                    printWindow.document.write(`
                        <!doctype html>
                        <html>
                        <head>
                            <title>Struk Pembayaran - ${receiptData.no}</title>
                            <style>
                                * { font-family: 'Courier New', Courier, monospace; }
                                body { margin: 20px; color: #000; }
                                #receipt-printable { max-width: 320px; margin: 0 auto; }
                                .border-dashed { border-style: dashed !important; }
                                @media print { @page { margin: 0; size: auto; } }
                            </style>
                        </head>
                        <body>${printable.outerHTML}</body>
                        </html>
                    `);
                    printWindow.document.close();
                    setTimeout(() => {
                        printWindow.focus();
                        printWindow.print();
                    }, 250);
                }
            }
        } finally {
            setTimeout(() => setIsPrinting(false), 500);
        }
    };

    const handleCopyReceipt = async () => {
        if (!receiptData) return;
        const isPkg = receiptData.isPackage;
        const lines = [
            '===== BILIAR POS =====',
            'Sistem Kasir Biliar',
            '',
            `No  : ${receiptData.no}`,
            `Tgl : ${receiptData.transactionDate}`,
            `Kasir: ${receiptData.cashierName}`,
            `Shift: #${String(receiptData.shiftId).padStart(4, '0')}`,
            '----------------------',
            `Customer: ${receiptData.customer}`,
            `Meja    : ${receiptData.tableName} (${receiptData.tableType})`,
            isPkg ? `Paket   : 🎁 ${receiptData.packageName}` : `Tarif   : ${receiptData.rateName}`,
            `Waktu   : ${new Date(receiptData.startedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} → ${new Date(receiptData.endedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
            `Durasi  : ${formatDuration(receiptData.durationMinutes)}`,
            '----------------------',
            `Tagihan : ${money(receiptData.subtotal)}`,
            `Tunai   : ${money(receiptData.paymentAmount)}`,
            `Kembali : ${receiptData.change > 0 ? money(receiptData.change) : '-'}`,
            '----------------------',
            isPkg ? '🎁 PAKET - LUNAS' : '✓ LUNAS',
            'Terima kasih!',
            `*** ${receiptData.no} ***`,
        ];
        try {
            await navigator.clipboard.writeText(lines.join('\n'));
            toast.success('Struk disalin ke clipboard!');
        } catch {
            toast.error('Gagal menyalin struk');
        }
    };

    const handleDone = () => {
        router.get(posIndex().url);
    };

    return (
        <>
            <Head title="Pembayaran" />
            <div className="flex min-h-full flex-1 flex-col bg-slate-50">
                <header className="border-b bg-white px-4 py-4 md:px-6 shadow-sm">
                    <div className="mx-auto max-w-5xl flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={handleBack} disabled={form.processing}>
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                                <CreditCard className="size-4" /> POS KASIR
                            </div>
                            <h1 className="mt-1 text-xl font-bold text-slate-900">Pembayaran Sesi</h1>
                        </div>
                        {hasActiveShift ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                                ● Shift Aktif
                            </Badge>
                        ) : (
                            <Badge variant="destructive">Shift Tidak Aktif</Badge>
                        )}
                    </div>
                </header>

                <main className="mx-auto w-full max-w-5xl grid flex-1 gap-4 p-4 md:p-6 lg:grid-cols-2 lg:gap-6">
                    <div className="space-y-4">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                        <Receipt className="size-4" />
                                    </div>
                                    Ringkasan Sesi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3.5 pt-1 text-sm">
                                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                                    <span className="text-slate-500 flex items-center gap-1.5">
                                        <CreditCard className="size-4" /> Meja
                                    </span>
                                    <span className="font-bold text-slate-800">
                                        {session.billiard_table.name}
                                        <span className="ml-1.5 font-normal text-slate-500 text-xs">({session.billiard_table.type})</span>
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                                    <span className="text-slate-500 flex items-center gap-1.5">
                                        <UserIcon className="size-4" /> Customer
                                    </span>
                                    <span className="font-semibold text-slate-800">{session.customer_name}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                                    <span className="text-slate-500 flex items-center gap-1.5">
                                        <Clock3 className="size-4" /> Waktu Mulai
                                    </span>
                                    <span className="font-medium tabular-nums text-slate-700">
                                        {new Date(session.started_at).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                                    <span className="text-slate-500 flex items-center gap-1.5">
                                        <Clock3 className="size-4" /> Waktu Selesai
                                    </span>
                                    <span className="font-medium tabular-nums text-slate-700">
                                        {new Date(session.ended_at).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-indigo-50 p-3 ring-1 ring-indigo-100">
                                    <span className="text-indigo-700 flex items-center gap-1.5 font-semibold">
                                        <Clock3 className="size-4" /> Durasi
                                    </span>
                                    <span className="font-black text-indigo-800 tabular-nums">
                                        {formatDuration(session.duration_minutes)}
                                    </span>
                                </div>
                                {session.rate && (
                                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                                        <span className="text-slate-500">Tarif</span>
                                        <span className="font-semibold text-slate-700">
                                            {session.rate.name}
                                            <span className="ml-1.5 text-xs text-slate-500">
                                                ({money(session.rate.hourly_rate)}/jam)
                                            </span>
                                        </span>
                                    </div>
                                )}
                                {session.package && (
                                    <div className="flex items-center justify-between rounded-lg bg-fuchsia-50 p-3 ring-1 ring-fuchsia-100">
                                        <span className="text-fuchsia-700 font-semibold flex items-center gap-1.5">
                                            <Gift className="size-4" /> Paket
                                        </span>
                                        <span className="font-bold text-fuchsia-700">
                                            {session.package.name}
                                            <span className="ml-1.5 text-xs text-fuchsia-500">
                                                ({money(session.package.price)})
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-indigo-500 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                            <CardContent className="flex items-center justify-between p-5">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-indigo-100 font-semibold">Total Tagihan</p>
                                    <p className="text-[11px] text-indigo-200 mt-0.5">Selesaikan pembayaran di sebelah kanan</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black tabular-nums tracking-tight drop-shadow-md">
                                        {money(totalAmount)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                        <Wallet className="size-4" />
                                    </div>
                                    Form Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-1">
                                <div className="space-y-2">
                                    <Label htmlFor="payment_amount" className="text-sm font-semibold">
                                        Jumlah Tunai Dibayar <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">Rp</span>
                                        <Input
                                            id="payment_amount"
                                            type="number"
                                            min={totalAmount}
                                            value={form.data.payment_amount}
                                            onChange={(e) => form.setData('payment_amount', Number(e.target.value))}
                                            className="h-14 pl-12 pr-4 text-2xl font-black tabular-nums"
                                            disabled={!hasActiveShift}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {[totalAmount, totalAmount + 5000, totalAmount + 10000, totalAmount + 50000].map((v, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => form.setData('payment_amount', v)}
                                                disabled={!hasActiveShift}
                                                className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-all disabled:opacity-50 ${
                                                    Number(form.data.payment_amount) === v
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700'
                                                }`}
                                            >
                                                {money(v)}
                                            </button>
                                        ))}
                                    </div>
                                    {form.errors.payment_amount && (
                                        <p className="text-sm text-red-500">{form.errors.payment_amount}</p>
                                    )}
                                </div>

                                {paymentAmount >= totalAmount && paymentAmount > 0 && (
                                    <div className={`rounded-xl p-4 ring-1 ${
                                        change > 0
                                            ? 'bg-emerald-50 ring-emerald-200 text-emerald-800'
                                            : 'bg-slate-50 ring-slate-200 text-slate-700'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 font-semibold text-sm">
                                                {change > 0 ? (
                                                    <CheckCircle2 className="size-5 text-emerald-600" />
                                                ) : (
                                                    <CheckCircle2 className="size-5 text-slate-500" />
                                                )}
                                                {change > 0 ? 'Kembalian' : 'Uang Pas'}
                                            </span>
                                            <span className={`text-2xl font-black tabular-nums ${
                                                change > 0 ? 'text-emerald-700' : 'text-slate-600'
                                            }`}>
                                                {change > 0 ? money(change) : 'Rp 0'}
                                            </span>
                                        </div>
                                        {change > 0 && (
                                            <p className="text-xs mt-1 text-emerald-600/80">
                                                Pastikan memberikan kembalian sesuai jumlah.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {paymentAmount < totalAmount && paymentAmount > 0 && (
                                    <div className="rounded-xl bg-red-50 p-4 text-red-800 ring-1 ring-red-200">
                                        <p className="font-semibold text-sm">Kurang Bayar</p>
                                        <p className="text-xs mt-0.5">
                                            Jumlah tunai kurang <strong>{money(totalAmount - paymentAmount)}</strong> dari total tagihan.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-sm font-semibold">
                                        Catatan (opsional)
                                    </Label>
                                    <Input
                                        id="notes"
                                        value={form.data.notes}
                                        onChange={(e) => form.setData('notes', e.target.value)}
                                        placeholder="Contoh: Pembayaran via QRIS, Transfer, dsb."
                                        disabled={!hasActiveShift}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-12 font-semibold"
                                onClick={handleBack}
                                disabled={form.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 h-12 font-bold text-base shadow-lg shadow-emerald-500/20 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                disabled={
                                    !hasActiveShift ||
                                    paymentAmount < totalAmount ||
                                    form.processing ||
                                    paymentAmount === 0
                                }
                            >
                                {form.processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Memproses...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="size-5" />
                                        Bayar & Selesai
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </main>
            </div>

            <Dialog open={showReceipt}>
                <DialogContent hideClose className="sm:max-w-md">
                    <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 className="size-8 text-white" />
                    </div>
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-xl font-black text-slate-900">Pembayaran Berhasil!</DialogTitle>
                        <p className="text-sm text-slate-500 mt-1">
                            Simpan struk di bawah ini sebagai bukti pembayaran.
                        </p>
                    </DialogHeader>
                    <div className="py-2">
                        {receiptData && <ReceiptView receipt={receiptData} />}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                            variant="outline"
                            onClick={handleCopyReceipt}
                            className="h-11 font-semibold gap-1.5"
                        >
                            <Copy className="size-4" />
                            Salin
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="h-11 font-semibold gap-1.5"
                        >
                            <Printer className="size-4" />
                            {isPrinting ? 'Mencetak...' : 'Cetak'}
                        </Button>
                    </div>
                    <DialogFooter className="pt-2">
                        <Button
                            onClick={handleDone}
                            className="h-12 w-full text-base font-bold shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-violet-600"
                        >
                            Selesai & Kembali ke POS
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
