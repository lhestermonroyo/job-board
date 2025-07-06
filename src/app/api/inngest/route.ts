import { serve } from 'inngest/next';
import { inngest } from '@/services/inngest/client';
import {
  clerkCreateOrganization,
  clerkCreateUser,
  clerkDeleteOrganization,
  clerkDeleteUser,
  clerkUpdateOrganization,
  clerkUpdateUser
} from '@/services/inngest/functions/clerk';
import { createAiSummaryOfUploadedResume } from '@/services/inngest/functions/resume';
import { rankApplication } from '@/services/inngest/functions/jobListingApplication';
import {
  prepareDailyUserJobListingNotifications,
  sendDailyUserJobListingNotifications
} from '@/services/inngest/functions/email';

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    clerkCreateUser,
    clerkUpdateUser,
    clerkDeleteUser,
    clerkCreateOrganization,
    clerkUpdateOrganization,
    clerkDeleteOrganization,
    createAiSummaryOfUploadedResume,
    rankApplication,
    prepareDailyUserJobListingNotifications,
    sendDailyUserJobListingNotifications
  ]
});
