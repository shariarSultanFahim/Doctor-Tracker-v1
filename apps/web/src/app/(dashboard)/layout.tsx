'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardBreadcrumb } from '@/components/dashboard-breadcrumb';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 text-slate-700" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <DashboardBreadcrumb />
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-y-hidden rounded-tl-xl bg-background p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
