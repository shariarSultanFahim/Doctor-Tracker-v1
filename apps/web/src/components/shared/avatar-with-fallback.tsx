'use client';

import * as React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarWithFallbackProps {
  src?: string;
  name?: string;
  className?: string;
  fallbackClassName?: string;
  sizeClassName?: string;
}

export default function AvatarWithFallback({
  src,
  name = 'User',
  className,
  fallbackClassName,
}: AvatarWithFallbackProps) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <Avatar className={cn('shrink-0 border border-border bg-muted', className)}>
      {src ? <AvatarImage src={src} alt={name} className="object-cover" /> : null}
      <AvatarFallback className={cn('font-semibold text-muted-foreground bg-muted', fallbackClassName)}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
