import { Head } from '@inertiajs/react';
import { History } from 'lucide-react';
import { Card, CardContent } from '@/components/atoms/ui/card';
import type { BreadcrumbItem } from '@/types';

type AuditLog = {
    id: number;
    action: string;
    subject_label: string | null;
    description: string;
    user: { name: string; email: string } | null;
    created_at: string;
};

type PaginatedLogs = {
    data: AuditLog[];
    current_page: number;
    last_page: number;
    total: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Riwayat Aktivitas', href: '/admin/audit-logs' },
];

const actionLabels: Record<string, string> = {
    created: 'Menambahkan',
    updated: 'Mengubah',
    deleted: 'Menghapus',
};

export default function AuditLogsIndex({ logs }: { logs: PaginatedLogs }) {
    return (
        <>
            <Head title="Riwayat Aktivitas" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Riwayat Aktivitas</h1>
                    <p className="text-muted-foreground text-sm">Catatan perubahan data yang dilakukan oleh pengguna.</p>
                </div>
                <Card>
                    <CardContent className="overflow-x-auto p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-4">Waktu</th>
                                    <th className="p-4">Pengguna</th>
                                    <th className="p-4">Aktivitas</th>
                                    <th className="p-4">Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.length === 0 ? (
                                    <tr><td colSpan={4} className="text-muted-foreground p-8 text-center">Belum ada riwayat aktivitas.</td></tr>
                                ) : logs.data.map((log) => (
                                    <tr className="border-b last:border-0" key={log.id}>
                                        <td className="whitespace-nowrap p-4">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                        <td className="p-4">{log.user?.name ?? 'Sistem'}</td>
                                        <td className="p-4">{actionLabels[log.action] ?? log.action}</td>
                                        <td className="p-4">{log.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
                <p className="text-muted-foreground flex items-center gap-2 text-xs"><History className="size-4" /> Total {logs.total} aktivitas</p>
            </div>
        </>
    );
}

AuditLogsIndex.layout = { breadcrumbs };
