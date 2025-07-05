'use client';

import { Sheet } from '@/components/ui/sheet';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReactNode, useState } from 'react';

export default function ClientSheet({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open) return;

        setIsOpen(false);
        router.push(`/?${searchParams.toString()}`);
      }}
      modal
    >
      {children}
    </Sheet>
  );
}
