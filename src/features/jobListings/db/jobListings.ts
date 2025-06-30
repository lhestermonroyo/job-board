import { db } from '@/drizzle/db';
import { JobListingTable } from '@/drizzle/schema';
import { revalidateJobListingCache } from './cache/jobListings';
import { eq } from 'drizzle-orm';

export async function insertJobListing(
  jobListing: typeof JobListingTable.$inferInsert
) {
  const [newJobListing] = await db
    .insert(JobListingTable)
    .values(jobListing)
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId
    });

  revalidateJobListingCache(newJobListing);

  return newJobListing;
}

export async function updateJobListing(
  id: string,
  jobListing: Partial<typeof JobListingTable.$inferInsert>
) {
  const [updatedListing] = await db
    .update(JobListingTable)
    .set(jobListing)
    .where(eq(JobListingTable.id, id))
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId
    });

  revalidateJobListingCache(updatedListing);

  return updatedListing;
}
