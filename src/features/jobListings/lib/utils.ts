import { JobListingStatus } from '@/drizzle/schema';

export function getNextJobListingStatus(status: JobListingStatus) {
  switch (status) {
    case 'draft':
    case 'delisted':
      return 'published';
    case 'published':
      return 'delisted';
    default:
      throw new Error(`Invalid job listing status: ${status satisfies never}`);
  }
}

export function sortJobListingStatus(
  statusA: JobListingStatus,
  statusB: JobListingStatus
) {
  return JOB_LISTING_STATUS_ORDER[statusA] - JOB_LISTING_STATUS_ORDER[statusB];
}

const JOB_LISTING_STATUS_ORDER: Record<JobListingStatus, number> = {
  published: 0,
  draft: 1,
  delisted: 2
};
