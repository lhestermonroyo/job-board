import { auth } from '@clerk/nextjs/server';
import { Suspense } from 'react';
import SidebarUserButtonClient from './_SidebarUserButtonClient';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth';
import { SignOutButton } from '@clerk/nextjs';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { LogOutIcon } from 'lucide-react';

export function SidebarUserButton() {
  return (
    <Suspense>
      <SidebarUserSuspense />
    </Suspense>
  );
}

async function SidebarUserSuspense() {
  const { user } = await getCurrentUser({
    allData: true
  });

  if (!user) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return <SidebarUserButtonClient user={user} />;
}
