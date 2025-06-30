import { Suspense } from 'react';
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { db } from '@/drizzle/db';
import { desc, eq } from 'drizzle-orm';
import { JobListingTable } from '@/drizzle/schema';
import { redirect } from 'next/navigation';
import { getJobListingOrganizationTag } from '@/features/jobListings/db/cache/jobListings';

export default function EmployerHomePage() {
  return (
    <Suspense>
      <SuspensePage />
    </Suspense>
  );
}

async function SuspensePage() {
  const { orgId } = await getCurrentOrganization({ allData: true });

  if (!orgId) {
    return null;
  }
  const jobListing = await getMostRecentJobListing(orgId);

  if (!jobListing) {
    redirect('/employer/job-listings/new');
  } else {
    redirect(`/employer/job-listings/${jobListing.id}`);
  }
}

async function getMostRecentJobListing(orgId: string) {
  'use cache';

  // TODO
  cacheTag(getJobListingOrganizationTag(orgId));

  return db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.organizationId, orgId),
    orderBy: desc(JobListingTable.createdAt),
    columns: {
      id: true
    }
  });
}
