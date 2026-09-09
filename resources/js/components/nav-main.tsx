import { Link } from '@inertiajs/react';
import {
    ChevronDown,
    type LucideIcon,
} from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/atoms/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/atoms/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export type NavSection = {
    title: string;
    icon?: LucideIcon;
    items: NavItem[];
    collapsible?: boolean;
};

export function NavMain({ sections }: { sections: NavSection[] }) {
    return (
        <>
            {sections.map((section) => (
                <NavSectionGroup key={section.title} section={section} />
            ))}
        </>
    );
}

function NavSectionGroup({ section }: { section: NavSection }) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const hasActiveItem = section.items.some((item) => isCurrentOrParentUrl(item.href));

    const menu = (
        <SidebarMenu>
            {section.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        isActive={isCurrentUrl(item.href)}
                        tooltip={{ children: item.title }}
                    >
                        <Link href={item.href} prefetch>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );

    if (!section.collapsible) {
        return (
            <SidebarGroup className="px-2 py-1">
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>{menu}</SidebarGroupContent>
            </SidebarGroup>
        );
    }

    return (
        <SidebarGroup className="px-2 py-1">
            <Collapsible defaultOpen={hasActiveItem} className="group/collapsible">
                <CollapsibleTrigger asChild>
                    <SidebarGroupLabel asChild>
                        <button
                            type="button"
                            className="w-full cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            {section.icon && <section.icon className="mr-2 size-4" />}
                            <span>{section.title}</span>
                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </button>
                    </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarGroupContent>{menu}</SidebarGroupContent>
                </CollapsibleContent>
            </Collapsible>
        </SidebarGroup>
    );
}
