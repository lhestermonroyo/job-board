import { eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { JobListingTable } from '@/drizzle/schema';
import { revalidateJobListingCache } from './cache/jobListings';

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

export async function deleteJobListing(id: string) {
  const [deletedListing] = await db
    .delete(JobListingTable)
    .where(eq(JobListingTable.id, id))
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId
    });

  revalidateJobListingCache(deletedListing);

  return deletedListing;
}
