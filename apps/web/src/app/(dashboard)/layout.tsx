'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-slate-800 capitalize">
              {pathname.split('/')[1] || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold flex items-center justify-center text-xs border border-slate-200">
              AD
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">Admin User</span>
          </div>
        </header>
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
