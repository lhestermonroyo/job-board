import { Fragment, ReactNode, Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { count, desc, eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth';
import { getJobListingOrganizationTag } from '@/features/jobListings/db/cache/jobListings';
import { getJobListingApplicationJobListingTag } from '@/features/jobListingApplications/db/cache/jobListingApplications';
import { hasOrgUserPermission } from '@/services/clerk/lib/orgUserPermissions';
import { sortJobListingStatus } from '@/features/jobListings/lib/utils';
import { ClipboardListIcon, PlusIcon } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { AsyncIf } from '@/components/AsyncIf';
import SidebarOrganizationButton from '@/features/organizations/components/SidebarOrganizationButton';
import AppSidebar from '@/components/sidebar/AppSidebar';
import SidebarNavMenuGroup from '@/components/sidebar/SidebarNavMenuGroup';
import {
  JobListingApplicationTable,
  JobListingStatus,
  JobListingTable
} from '@/drizzle/schema';
import { JobListingMenuGroup } from './_JobListingMenuGroup';

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

  return (
    <AppSidebar
      content={
        <Fragment>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
            <AsyncIf
              condition={() => hasOrgUserPermission('org:job_listings:create')}
            >
              <SidebarGroupAction title="Add Job Listing" asChild>
                <Link href="/employer/job-listings/new">
                  <PlusIcon />
                  <span className="sr-only">Add Job Listing</span>
                </Link>
              </SidebarGroupAction>
            </AsyncIf>
            <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
              <Suspense>
                <JobListingMenu orgId={orgId} />
              </Suspense>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarNavMenuGroup
            className="mt-auto"
            items={[
              {
                href: '/',
                icon: <ClipboardListIcon />,
                label: 'Job Board'
              }
            ]}
          />
        </Fragment>
      }
      footerButton={<SidebarOrganizationButton />}
    >
      {children}
    </AppSidebar>
  );
}

async function JobListingMenu({ orgId }: { orgId: string }) {
  const jobListings = await getJobListings(orgId);
  const hasCreatePermission = await hasOrgUserPermission(
    'org:job_listings:create'
  );

  if (!jobListings.length && hasCreatePermission) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/employer/job-listings/new">
              <PlusIcon />
              <span className="ml-2">Create your first job listing</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return Object.entries(Object.groupBy(jobListings, (job) => job.status))
    .sort(([statusA], [statusB]) =>
      sortJobListingStatus(
        statusA as JobListingStatus,
        statusB as JobListingStatus
      )
    )
    .map(([status, jobListings]) => (
      <JobListingMenuGroup
        key={status as JobListingStatus}
        status={status as JobListingStatus}
        jobListings={jobListings}
      />
    ));
}

async function getJobListings(orgId: string) {
  'use cache';
  cacheTag(getJobListingOrganizationTag(orgId));

  const data = await db
    .select({
      id: JobListingTable.id,
      title: JobListingTable.title,
      status: JobListingTable.status,
      applicationCount: count(JobListingApplicationTable.userId)
    })
    .from(JobListingTable)
    .where(eq(JobListingTable.organizationId, orgId))
    .leftJoin(
      JobListingApplicationTable,
      eq(JobListingApplicationTable.jobListingId, JobListingTable.id)
    )
    .groupBy(JobListingApplicationTable.jobListingId, JobListingTable.id)
    .orderBy(desc(JobListingTable.createdAt));

  data.forEach((jobListing) => {
    cacheTag(getJobListingApplicationJobListingTag(jobListing.id));
  });

  return data;
}
