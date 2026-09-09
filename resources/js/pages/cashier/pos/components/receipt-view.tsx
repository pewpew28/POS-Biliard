import { CheckCircle2, Receipt, Wallet } from 'lucide-react';
import { Badge } from '@/components/atoms/ui/badge';
import type { ReceiptData } from '../types';

const money = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;
const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h} jam ${m} menit` : `${m} menit`;
};

export function ReceiptView({ receipt }: { receipt: ReceiptData }) {
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
