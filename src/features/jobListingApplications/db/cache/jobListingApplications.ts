import { revalidateTag } from 'next/cache';
import { getGlobalTag, getIdTag, getJobListingTag } from '@/lib/dataCache';

export function getJobListingApplicationGlobalTag() {
  return getGlobalTag('jobListingApplications');
}

export function getJobListingApplicationJobListingTag(jobListingId: string) {
  return getJobListingTag('jobListingApplications', jobListingId);
}

export function getJobListingApplicationIdTag({
  userId,
  jobListingId
}: {
  userId: string;
  jobListingId: string;
}) {
  return getIdTag('jobListingApplications', `${jobListingId}-${userId}`);
}

export function revalidateJobListingApplicationCache(id: {
  userId: string;
  jobListingId: string;
}) {
  revalidateTag(getJobListingApplicationGlobalTag());
  revalidateTag(getJobListingApplicationJobListingTag(id.jobListingId));
  revalidateTag(getJobListingApplicationIdTag(id));
}
