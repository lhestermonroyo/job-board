import { Suspense } from 'react';
import { LogOutIcon } from 'lucide-react';
import SidebarUserButtonClient from './_SidebarUserButtonClient';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth';
import { SignOutButton } from '@/services/clerk/components/AuthButtons';

export default function SidebarUserButton() {
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
