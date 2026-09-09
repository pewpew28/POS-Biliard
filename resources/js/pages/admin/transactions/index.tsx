import { Head, usePage } from '@inertiajs/react';
import { Calendar, Clock3, Receipt, TrendingUp, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/atoms/ui/table';

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

type Summary = {
    total_revenue: number;
    total_transactions: number;
    total_minutes: number;
};

const money = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;
const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
};

export default function TransactionsIndex({
    transactions,
    summary,
}: {
    transactions: Transaction[];
    summary: Summary;
}) {
    return (
        <>
            <Head title="Riwayat Transaksi" />
            <div className="flex flex-1 flex-col">
                <header className="border-b bg-background px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Riwayat Transaksi</h1>
                            <p className="text-sm text-muted-foreground">Lihat semua transaksi billiard</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6">
                    {/* Summary Cards */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
                                <TrendingUp className="size-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{money(summary.total_revenue)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Transaksi</CardTitle>
                                <Receipt className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total_transactions}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Durasi</CardTitle>
                                <Clock3 className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatDuration(summary.total_minutes)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transactions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Transaksi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {transactions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Receipt className="mb-4 size-12 text-muted-foreground" />
                                    <p className="text-lg font-medium">Belum ada transaksi</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Tanggal & Waktu</TableHead>
                                            <TableHead>Meja</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Kasir</TableHead>
                                            <TableHead>Durasi</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((tx) => (
                                            <TableRow key={tx.id}>
                                                <TableCell className="font-medium">#{tx.id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="size-4 text-muted-foreground" />
                                                        <div>
                                                            <p>{new Date(tx.ended_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(tx.started_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(tx.ended_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="font-medium">{tx.billiard_table.name}</p>
                                                    <p className="text-xs text-muted-foreground">{tx.billiard_table.type}</p>
                                                </TableCell>
                                                <TableCell>{tx.customer_name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <User className="size-3 text-muted-foreground" />
                                                        {tx.cashier.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatDuration(tx.duration_minutes)}</TableCell>
                                                <TableCell className="text-right font-medium text-primary">{money(tx.total_amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
