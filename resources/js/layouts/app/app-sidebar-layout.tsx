import { AppContent } from '@/components/molecules/app-content';
import { AppShell } from '@/components/molecules/app-shell';
import { AppSidebar } from '@/components/molecules/app-sidebar';
import { AppSidebarHeader } from '@/components/molecules/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="min-w-0 overflow-x-clip">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
