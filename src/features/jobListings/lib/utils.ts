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
