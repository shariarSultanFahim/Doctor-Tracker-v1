'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import { useAuth } from '@/hooks/use-auth';
import { logout } from '@/lib/api/auth';
import {
  Activity,
  LayoutDashboard,
  LogOut,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

const data = {
  info: {
    title: 'Doctor Tracker',
    subtitle: 'Admin Medical Portal',
  },
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
    {
      title: 'Settings',
      items: [
        {
          title: 'Admin Profile',
          url: '/profile',
          icon: UserCheck,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const userName = user?.name || 'Admin User';
  const userEmail = user?.email || 'admin@doctortracker.com';
  const userAvatar = user?.avatar;

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                <Activity className="size-5" />
              </div>
              <div className="grid flex-1 text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-bold text-sidebar-foreground group-hover/menu-button:text-sidebar-accent-foreground">
                  {data.info.title}
                </span>
                <span className="truncate text-xs font-semibold text-sidebar-foreground/70 group-hover/menu-button:text-sidebar-accent-foreground/80">
                  {data.info.subtitle}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group) => (
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
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={isActive}
                        className="data-[active=true]:bg-primary/20 data-[active=true]:text-primary data-[active=true]:font-bold"
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="space-y-4">
            <Link href="/profile" className="flex items-center gap-3 p-1 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
              <Avatar className="h-9 w-9 border border-border">
                {userAvatar ? <AvatarImage src={userAvatar} alt={userName} className="object-cover" /> : null}
                <AvatarFallback className="font-semibold">{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden overflow-hidden text-left">
                <h2 className="font-bold text-xs truncate text-sidebar-foreground">{userName}</h2>
                <h3 className="text-[11px] text-sidebar-foreground/60 truncate">{userEmail}</h3>
              </div>
            </Link>

            <SidebarMenuButton
              render={
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full bg-transparent border-border group-data-[collapsible=icon]:p-0 hover:bg-destructive/10"
                />
              }
              className="group-data-[collapsible=icon]:w-full"
            >
              <LogOut className="size-4 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5 text-destructive" />
              <span className="group-data-[collapsible=icon]:hidden text-destructive font-medium">
                Sign Out
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
