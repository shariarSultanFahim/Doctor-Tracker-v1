'use client';

import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dynamic Breadcrumbs resolution
  const segments = pathname.split('/').filter(Boolean);
  const currentSegment = segments[0] || 'dashboard';

  const segmentLabels: Record<string, string> = {
    dashboard: 'Analytics Overview',
    doctors: 'Doctors Directory',
    patients: 'Patients Directory',
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white/80 backdrop-blur-sm px-4 sticky top-0 z-10 rounded-t-xl">
          <div className="flex w-full items-center gap-2 px-2">
            <SidebarTrigger className="-ml-1 text-slate-700" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard" className="font-semibold text-slate-900">Doctor Tracker</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize font-semibold text-slate-700">
                    {segmentLabels[currentSegment] || currentSegment}
                  </BreadcrumbPage>
                </BreadcrumbItem>
                {segments.length > 1 && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-xs text-muted-foreground font-normal">
                        Detail View ({segments[1]})
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6 w-full mx-auto bg-slate-50/50 rounded-b-xl">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
