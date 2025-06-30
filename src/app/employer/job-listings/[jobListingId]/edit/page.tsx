import { notFound } from 'next/navigation';
import { db } from '@/drizzle/db';
import { and, eq } from 'drizzle-orm';
import { JobListingTable } from '@/drizzle/schema';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getJobListingIdTag } from '@/features/jobListings/db/cache/jobListings';
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth';
import { Card, CardContent } from '@/components/ui/card';
import JobListingForm from '@/features/jobListings/components/JobListingForm';

type Props = {
  params: Promise<{ jobListingId: string }>;
};

export default function EditJobListingPage(props: Props) {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Edit Job Listing</h1>
      <p className="text-muted-foreground mb-6">
        This does not post the listing yet. It just saves a draft.
      </p>
      <Card>
        <CardContent>
          <SuspensePage {...props} />
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspensePage({ params }: Props) {
  const { jobListingId } = await params;

  const { orgId } = await getCurrentOrganization();

  if (!orgId) {
    return null; // Handle case where organization is not found
  }

  const jobListing = await getJobListing(jobListingId, orgId);

  if (!jobListing) {
    return notFound();
  }

  return <JobListingForm jobListing={jobListing} />;
}

async function getJobListing(id: string, orgId: string) {
  'use cache';
  cacheTag(getJobListingIdTag(id));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId)
    )
  });
}
