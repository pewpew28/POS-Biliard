import { LogOut, MonitorPlay } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes';
import type { Auth } from '@/types';

type Props = {
    children: ReactNode;
};

export default function PosLayout({ children }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <div className="flex min-h-screen flex-col bg-muted/20">
            <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 shadow-sm backdrop-blur md:px-8">
                <Link href="/cashier/pos" className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <MonitorPlay className="size-5" />
                    </span>
                    <span>
                        <span className="block text-xs font-semibold tracking-[0.2em] text-primary">BILIAR POS</span>
                        <span className="block text-sm font-medium text-muted-foreground">Layar Kasir</span>
                    </span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block">
                        <p className="text-sm font-semibold">{auth.user.name}</p>
                        <p className="text-xs text-muted-foreground">Kasir</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={logout().url} method="post" as="button">
                            <LogOut className="size-4" />
                            Keluar
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        </div>
    );
}
