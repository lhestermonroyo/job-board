'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { db } from '@/drizzle/db';
import { and, eq } from 'drizzle-orm';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getJobListingIdTag } from '../../db/cache/jobListings';
import { JobListingTable } from '@/drizzle/schema';
import { jobListingSchema } from './schemas';
import { hasPlanFeature } from '@/services/clerk/lib/planFeatures';
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth';
import {
  insertJobListing,
  updateJobListing as updateJobListingDb
} from '../../db/jobListings';
import { hasOrgUserPermission } from '@/services/clerk/lib/orgUserPermissions';

export async function createJobListing(
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) {
    return {
      error: true,
      message: 'Organization not found.'
    };
  }

  const hasCreatePermission = await hasOrgUserPermission(
    'org:job_listings:create'
  );

  if (!hasCreatePermission) {
    return {
      error: true,
      message:
        'You do not have permission to create job listings. Please ensure you are part of an organization with the appropriate plan.'
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

export async function updateJobListing(
  id: string,
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) {
    return {
      error: true,
      message: 'Organization not found.'
    };
  }

  const hasUpdatePermission = await hasOrgUserPermission(
    'org:job_listings:update'
  );

  if (!hasUpdatePermission) {
    return {
      error: true,
      message:
        'You do not have permission to update job listings. Please ensure you are part of an organization with the appropriate plan.'
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: 'Invalid job listing data'
    };
  }

  const jobListing = await getJobListing(id, orgId);

  if (!jobListing) {
    return {
      error: true,
      message: 'Job listing not found.'
    };
  }

  const updatedJobListing = await updateJobListingDb(id, data);

  redirect(`/employer/job-listings/${updatedJobListing.id}`);
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
