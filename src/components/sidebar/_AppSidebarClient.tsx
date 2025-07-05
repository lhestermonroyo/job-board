'use client';

import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function AppSidebarClient({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col w-full">
        <div className="p-2 border-b flex items-center gap-1">
          <SidebarTrigger />
          <span className="text-2xl text-wrap font-light tracking-wide">
            <span className="font-semibold text-featured">Job</span>
            Pilot
          </span>
        </div>
        <div className="flex-1 flex">{children}</div>
      </div>
    );
  }

  return children;
}
