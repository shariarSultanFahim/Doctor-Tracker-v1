'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { logout } from '@/lib/api/auth';
import {
  LayoutDashboard,
  LogOut,
  UserCheck,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

const sidebarData = {
  versions: ['1.0.1', '1.1.0-alpha', '2.0.0-beta1'],
  navMain: [
    {
      title: 'Core System',
      items: [
        {
          title: 'Dashboard Overview',
          url: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Medical Management',
      items: [
        {
          title: 'Doctors Directory',
          url: '/doctors',
          icon: UserCheck,
        },
        {
          title: 'Patients Directory',
          url: '/patients',
          icon: Users,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-base font-bold text-sky-600">Doctor Tracker</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.url ||
                    (item.url !== '/dashboard' && pathname.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.url}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              tooltip="Sign Out"
            >
              <LogOut className="h-4 w-4 text-red-600" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
