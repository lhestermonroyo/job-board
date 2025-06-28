'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { jobListingSchema } from './schemas';
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth';
import { insertJobListing } from '../../db/jobListings';

export async function createJobListing(
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) {
    return {
      error: true,
      message:
        'Organization not found. Please ensure you are part of an organization.'
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: 'Invalid job listing data'
    };
  }

  const jobListing = await insertJobListing({
    ...data,
    organizationId: orgId,
    status: 'draft'
  });

  redirect(`/employer/job-listings/${jobListing.id}`);
}
