'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: 'glass-card !bg-background/85 !backdrop-blur-md !border-border/80 !text-foreground !rounded-full !py-2 !px-4 !text-xs !shadow-xl flex items-center gap-2',
            title: 'text-xs font-semibold text-foreground',
            description: 'text-[11px] text-muted-foreground',
            actionButton: 'bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold',
            cancelButton: 'bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full font-semibold',
            success: 'text-emerald-600 dark:text-emerald-400',
            error: 'text-rose-600 dark:text-rose-400',
            info: 'text-sky-600 dark:text-sky-400',
            warning: 'text-amber-600 dark:text-amber-400',
          },
        }}
      />
    </QueryClientProvider>
  );
}
