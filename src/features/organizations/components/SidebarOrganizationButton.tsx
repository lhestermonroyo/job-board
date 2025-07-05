import { Suspense } from 'react';
import { LogOutIcon } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import {
  getCurrentOrganization,
  getCurrentUser
} from '@/services/clerk/lib/getCurrentAuth';
import SidebarOrganizationButtonClient from './_SidebarOrganizationButtonClient';
import { SignOutButton } from '@/services/clerk/components/AuthButtons';

export default function SidebarOrganizationButton() {
  return (
    <Suspense>
      <SidebarOrganizationSuspense />
    </Suspense>
  );
}

async function SidebarOrganizationSuspense() {
  const [{ user }, { organization }] = await Promise.all([
    getCurrentUser({
      allData: true
    }),
    getCurrentOrganization({ allData: true })
  ]);

  if (!user || !organization) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return (
    <SidebarOrganizationButtonClient user={user} organization={organization} />
  );
}
