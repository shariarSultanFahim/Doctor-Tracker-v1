'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function DashboardBreadcrumb() {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const currentSegment = segments[0] || 'dashboard';

  const labels: Record<string, string> = {
    dashboard: 'Analytics Overview',
    doctors: 'Doctors Directory',
    patients: 'Patients Directory',
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Doctor Tracker</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage className="capitalize font-semibold text-slate-900">
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
  );
}
