'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const currentSegment = segments[0] || 'dashboard';

  const labels: Record<string, string> = {
    dashboard: 'Analytics Overview',
    doctors: 'Doctors Directory',
    patients: 'Patients Directory',
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 text-slate-700" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Doctor Tracker</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize font-semibold">
                  {labels[currentSegment] || currentSegment}
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
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-y-hidden rounded-tl-xl bg-background p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
