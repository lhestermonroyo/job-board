'use server';

import { z } from 'zod';
import { newApplicationSchema } from '../actions/schemas';
import {
  getCurrentOrganization,
  getCurrentUser
} from '@/services/clerk/lib/getCurrentAuth';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getJobListingIdTag } from '@/features/jobListings/db/cache/jobListings';
import { db } from '@/drizzle/db';
import { and, eq } from 'drizzle-orm';
import {
  ApplicationStage,
  applicationStages,
  JobListingTable,
  UserResumeTable
} from '@/drizzle/schema';
import { getUserResumeIdTag } from '@/features/users/db/cache/userResumes';
import {
  insertJobListingApplication,
  updateJobListingApplication
} from '../db/jobListingApplications';
import { inngest } from '@/services/inngest/client';
import { hasOrgUserPermission } from '@/services/clerk/lib/orgUserPermissions';

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

  await inngest.send({
    name: 'app/jobListingApplication.created',
    data: {
      jobListingId,
      userId
    }
  });

  return {
    error: false,
    message: 'Application submitted successfully!'
  };
}

export async function updateJobListingApplicationStage(
  {
    jobListingId,
    userId
  }: {
    jobListingId: string;
    userId: string;
  },
  unsafeData: ApplicationStage
) {
  const { success, data: stage } = z
    .enum(applicationStages)
    .safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: 'Invalid application stage.'
    };
  }

  const hasChangeStagePermission = await hasOrgUserPermission(
    'org:job_listing_applications:change_stage'
  );

  if (!hasChangeStagePermission) {
    return {
      error: true,
      message: "You don't have permission to change the application stage."
    };
  }

  const { orgId } = await getCurrentOrganization();
  const jobListing = await getJobListing(jobListingId);

  if (!orgId || !jobListing || orgId !== jobListing.organizationId) {
    return {
      error: true,
      message: 'You do not have permission to update this application.'
    };
  }

  await updateJobListingApplication(
    {
      jobListingId,
      userId
    },
    {
      stage
    }
  );
}

export async function updateJobListingApplicationRating(
  {
    jobListingId,
    userId
  }: {
    jobListingId: string;
    userId: string;
  },
  unsafeData: number | null
) {
  const { success, data: rating } = z
    .number()
    .min(1)
    .max(5)
    .nullish()
    .safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: 'Invalid application rating.'
    };
  }

  const hasChangeRatingPermission = await hasOrgUserPermission(
    'org:job_listing_applications:change_rating'
  );

  if (!hasChangeRatingPermission) {
    return {
      error: true,
      message: "You don't have permission to change the application rating."
    };
  }

  const { orgId } = await getCurrentOrganization();
  const jobListing = await getJobListing(jobListingId);

  if (!orgId || !jobListing || orgId !== jobListing.organizationId) {
    return {
      error: true,
      message: 'You do not have permission to update this application.'
    };
  }

  await updateJobListingApplication(
    {
      jobListingId,
      userId
    },
    {
      rating
    }
  );
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

async function getJobListing(jobListingId: string) {
  'use cache';
  cacheTag(getJobListingIdTag(jobListingId));

  return db.query.JobListingTable.findFirst({
    where: and(eq(JobListingTable.id, jobListingId)),
    columns: {
      organizationId: true
    }
  });
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
