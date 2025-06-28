import { Fragment, ReactNode, Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ClipboardListIcon, PlusIcon } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/sidebar/AppSidebar';
import SidebarNavMenuGroup from '@/components/sidebar/SidebarNavMenuGroup';
import SidebarOrganizationButton from '@/features/organizations/components/SidebarOrganizationButton';
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth';

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <LayoutSuspense>{children}</LayoutSuspense>
    </Suspense>
  );
}
async function LayoutSuspense({ children }: { children: ReactNode }) {
  const { orgId } = await getCurrentOrganization({ allData: true });

  if (!orgId) {
    return redirect('/organizations/select');
  }

  const navItems = [
    {
      href: '/',
      icon: <ClipboardListIcon />,
      label: 'Job Board'
    }
  ];

  return (
    <AppSidebar
      content={
        <Fragment>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
            <SidebarGroupAction title="Add Job Listing" asChild>
              <Link href="/employer/job-listings/new">
                <PlusIcon />
                <span className="sr-only">Add Job Listing</span>
              </Link>
            </SidebarGroupAction>
          </SidebarGroup>
          <SidebarNavMenuGroup className="mt-auto" items={navItems} />
        </Fragment>
      }
      footerButton={<SidebarOrganizationButton />}
    >
      {children}
    </AppSidebar>
  );
}
