'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { db } from '@/drizzle/db';
import { and, eq } from 'drizzle-orm';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getJobListingIdTag } from '../../db/cache/jobListings';
import { JobListingTable } from '@/drizzle/schema';
import { jobListingSchema } from './schemas';
import {
  insertJobListing,
  updateJobListing as updateJobListingDb,
  deleteJobListing as deleteJobListingDb
} from '../../db/jobListings';
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth';
import { hasOrgUserPermission } from '@/services/clerk/lib/orgUserPermissions';
import { getNextJobListingStatus } from '../../lib/utils';
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings
} from '../../lib/planFeatureHelpers';

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

export async function deleteJobListing(id: string) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) {
    return {
      error: true,
      message: 'Organization not found.'
    };
  }

  const hasDeletePermission = await hasOrgUserPermission(
    'org:job_listings:delete'
  );

  if (!hasDeletePermission) {
    return {
      error: true,
      message:
        'You do not have permission to delete job listings. Please ensure you are part of an organization with the appropriate plan.'
    };
  }

  const jobListing = await getJobListing(id, orgId);

  if (!jobListing) {
    return {
      error: true,
      message: 'Job listing not found.'
    };
  }

  await deleteJobListingDb(id);

  redirect('/employer');
}

export async function toggleJobListingStatus(id: string) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) {
    return {
      error: true,
      message: 'Organization not found.'
    };
  }

  const jobListing = await getJobListing(id, orgId);

  if (!jobListing) {
    return {
      error: true,
      message: 'Job listing not found.'
    };
  }

  const newStatus = getNextJobListingStatus(jobListing.status);

  const requests = [
    hasOrgUserPermission('org:job_listings:change_status'),
    hasReachedMaxPublishedJobListings()
  ];
  const [hasChangeStatusPermission, reachedMaxPublishedJobListings] =
    await Promise.all(requests);

  if (
    !hasChangeStatusPermission ||
    (newStatus === 'published' && reachedMaxPublishedJobListings)
  ) {
    return {
      error: true,
      message:
        'You do not have permission to change the status of this job listing or you have reached the maximum number of featured job listings allowed by your plan.'
    };
  }

  await updateJobListingDb(id, {
    status: newStatus,
    isFeatured: newStatus === 'published' ? undefined : false,
    postedAt:
      newStatus === 'published' && !jobListing.postedAt ? new Date() : undefined
  });

  return {
    error: false,
    message: `Job listing status updated to ${newStatus}.`
  };
}

export async function toggleJobListingFeatured(id: string) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) {
    return {
      error: true,
      message: 'Organization not found.'
    };
  }

  const jobListing = await getJobListing(id, orgId);

  if (!jobListing) {
    return {
      error: true,
      message: 'Job listing not found.'
    };
  }

  const newFeaturedStatus = !jobListing.isFeatured;

  const requests = [
    hasOrgUserPermission('org:job_listings:change_status'),
    hasReachedMaxFeaturedJobListings()
  ];
  const [hasChangeStatusPermission, reachedMaxFeaturedJobListings] =
    await Promise.all(requests);

  if (
    !hasChangeStatusPermission ||
    (newFeaturedStatus && reachedMaxFeaturedJobListings)
  ) {
    return {
      error: true,
      message:
        'You do not have permission to change the featured status of this job listing or you have reached the maximum number of featured job listings allowed by your plan.'
    };
  }

  await updateJobListingDb(id, {
    isFeatured: newFeaturedStatus
  });

  return {
    error: false,
    message: `Job listing featured status updated to ${newFeaturedStatus}.`
  };
}
