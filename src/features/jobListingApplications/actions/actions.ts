'use server';

import { z } from 'zod';
import { newApplicationSchema } from '../actions/schemas';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getJobListingIdTag } from '@/features/jobListings/db/cache/jobListings';
import { db } from '@/drizzle/db';
import { and, eq } from 'drizzle-orm';
import { JobListingTable, UserResumeTable } from '@/drizzle/schema';
import { getUserResumeIdTag } from '@/features/users/db/cache/userResumes';
import { insertJobListingApplication } from '../db/jobListingApplications';
import { inngest } from '@/services/inngest/client';

export async function createJobListingApplication(
  jobListingId: string,
  unsafeData: z.infer<typeof newApplicationSchema>
) {
  const { userId } = await getCurrentUser();

  if (!userId) {
    return {
      error: true,
      message: "You don't have permission to submit an application."
    };
  }

  const [userResume, jobListing] = await Promise.all([
    getUserResume(userId),
    getPublicJobListing(jobListingId)
  ]);

  if (!userResume || !jobListing) {
    return {
      error: true,
      message: 'You must have a resume to apply for a job listing.'
    };
  }

  const { success, data } = newApplicationSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: 'Invalid application data.'
    };
  }

  await insertJobListingApplication({
    jobListingId,
    userId,
    coverLetter: data.coverLetter
  });

  // TODO: AI generation
  await inngest.send({
    name: 'app/jobListingApplication.created',
    data: {
      jobListingId,
      userId
    }
  });

  return {
    error: false,
    message: 'Application submitted successfully.'
  };
}

async function getUserResume(userId: string) {
  'use cache';
  cacheTag(getUserResumeIdTag(userId));

  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    columns: {
      userId: true
    }
  });
}

async function getPublicJobListing(jobListingId: string) {
  'use cache';
  cacheTag(getJobListingIdTag(jobListingId));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, jobListingId),
      eq(JobListingTable.status, 'published')
    ),
    columns: {
      id: true
    }
  });
}
