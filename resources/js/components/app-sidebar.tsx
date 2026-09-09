import { Link, usePage } from '@inertiajs/react';
import { BookOpen, CircleDot, Clock3, Database, FolderGit2, History, LayoutGrid, Package, Tags } from 'lucide-react';
import AppLogo from '@/components/molecules/app-logo';
import { NavFooter } from '@/components/molecules/nav-footer';
import { NavMain, type NavSection } from '@/components/molecules/nav-main';
import { NavUser } from '@/components/molecules/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/atoms/ui/sidebar';
import { index as billiardTables } from '@/actions/App/Http/Controllers/Admin/BilliardTableController';
import TypeController from '@/actions/App/Http/Controllers/Admin/BilliardTableTypeController';
import TableRateController from '@/actions/App/Http/Controllers/Admin/TableRateController';
import HourlyRateController from '@/actions/App/Http/Controllers/Admin/HourlyRateController';
import PackageController from '@/actions/App/Http/Controllers/Admin/TablePackageController';
import { index as auditLogs } from '@/actions/App/Http/Controllers/Admin/AuditLogController';
import { dashboard } from '@/routes';
import { index as billiardSessions } from '@/actions/App/Http/Controllers/Cashier/BilliardSessionController';
import { index as cashierPos } from '@/routes/cashier/pos';
import type { Auth, NavItem } from '@/types';

const dashboardNavItem: NavItem = {
    title: 'Dashboard',
    href: dashboard(),
    icon: LayoutGrid,
};

const billiardTablesNavItem: NavItem = {
    title: 'Meja Biliar',
    href: billiardTables().url,
    icon: CircleDot,
};
const auditLogsNavItem: NavItem = {
    title: 'Riwayat Aktivitas',
    href: auditLogs().url,
    icon: History,
};
const masterDataNavItems: NavItem[] = [
    { title: 'Type Meja', href: TypeController.index().url, icon: Tags },
    { title: 'Tarif per Type', href: TableRateController.index().url, icon: Tags },
    { title: 'Tarif Khusus Jam', href: HourlyRateController.index().url, icon: Clock3 },
    { title: 'Paket Tarif', href: PackageController.index().url, icon: Package },
];

const adminRoles = ['admin', 'super_admin'];

type PageProps = {
    auth: Auth;
};

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const canManageTables = adminRoles.includes(String(auth.user.role));
    const canOperateSessions = ['cashier', 'admin', 'super_admin'].includes(String(auth.user.role));
    const sessionsNavItem: NavItem = {
        title: 'Transaksi Meja',
        href: auth.user.role === 'cashier' ? cashierPos().url : billiardSessions().url,
        icon: CircleDot,
    };
    const sections: NavSection[] = [
        {
            title: 'Utama',
            items: [dashboardNavItem],
        },
        ...(canManageTables
            ? [
                  {
                      title: 'Operasional',
                      items: [billiardTablesNavItem],
                  },
                  {
                      title: 'Master Data',
                      icon: Database,
                      items: masterDataNavItems,
                      collapsible: true,
                  },
                  {
                      title: 'Pengawasan',
                      items: [auditLogsNavItem],
                  },
              ]
            : []),
        ...(canOperateSessions
            ? [
                  {
                      title: 'Kasir',
                      items: [sessionsNavItem],
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r-0">
            <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain sections={sections} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
