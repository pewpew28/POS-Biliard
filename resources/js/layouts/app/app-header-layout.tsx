import { AppContent } from '@/components/molecules/app-content';
import { AppHeader } from '@/components/molecules/app-header';
import { AppShell } from '@/components/molecules/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent variant="header">{children}</AppContent>
        </AppShell>
    );
}
