import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { University, GraduationCap, Facebook, AtSign, LayoutGrid, Wallet, User } from 'lucide-react';
import AppLogo from './app-logo';
import { usePage } from '@inertiajs/react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [

    {
        title: 'Email',
        href: 'mailto:blessed.opol@gmail.com',
        icon: AtSign,
    },
    {
        title: 'Facebook',
        href: 'https://facebook.com/btaofopol',
        icon: Facebook,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const user = auth.user as { id: number, name: string, email: string, role: 'admin' | 'registrar' | 'billing' } | null;

    const mainNavItems: NavItem[] = user?.role === 'admin' ? [
        {
            title: 'Administrator',
            href: '/admin/school-year',
            icon: University,
        },
        {
            title: 'Enrollment',
            href: '/registrar/',
            icon: GraduationCap,
        },
        {
            title: 'Billing Management',
            href: '/billing/',
            icon: Wallet,
        }
    ] : user?.role === 'registrar' ? [
        {
            title: 'Registrar',
            href: '/registrar/students',
            icon: GraduationCap,
        },
    ] : user?.role === 'billing' ? [
        {
            title: 'Dashboard',
            href: '/billing/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Students',
            href: '/billing/students',
            icon: User,
        },
        {
            title: 'Expenses',
            href: '/billing/expenses',
            icon: Wallet,
        }
    ]
        : [];

    return (
        <Sidebar collapsible="offcanvas" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="#" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
