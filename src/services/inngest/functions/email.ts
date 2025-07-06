import { db } from '@/drizzle/db';
import { inngest } from '../client';
import { and, eq, gte } from 'drizzle-orm';
import {
  JobListingTable,
  UserNotificationSettingsTable
} from '@/drizzle/schema';
import { subDays } from 'date-fns';
import { GetEvents } from 'inngest';
import { getMatchingJobListings } from '../ai/getMatchingJobListings';
import { resend } from '@/services/resend/client';
import DailyJobListingEmail from '@/services/resend/components/DailyJobListingEmail';
import { env } from '@/data/env/server';

export const prepareDailyUserJobListingNotifications = inngest.createFunction(
  {
    id: 'prepare-daily-user-job-listing-notifications',
    name: 'Prepare Daily User Job Listing Notifications'
  },
  {
    cron: 'TZ=America/New_York 0 9 * * *' // Every day at 9 AM New York time
  },
  async ({ event, step }) => {
    const getUsers = step.run('get-users', async () => {
      return await db.query.UserNotificationSettingsTable.findMany({
        where: eq(UserNotificationSettingsTable.newJobEmailNotifications, true),
        columns: {
          userId: true,
          newJobEmailNotifications: true,
          aiPrompt: true
        },
        with: {
          user: {
            columns: {
              email: true,
              name: true
            }
          }
        }
      });
    });

    const getJobListings = step.run('get-recent-job-listings', async () => {
      return await db.query.JobListingTable.findMany({
        where: and(
          gte(
            JobListingTable.postedAt,
            subDays(new Date(event.ts ?? Date.now()), 1)
          ),
          eq(JobListingTable.status, 'published')
        ),
        limit: 10, // Adjust as needed
        columns: {
          createdAt: false,
          postedAt: false,
          updatedAt: false,
          status: false,
          organizationId: false
        },
        with: {
          organization: {
            columns: {
              name: true
            }
          }
        }
      });
    });

    const [userNotifications, jobListings] = await Promise.all([
      getUsers,
      getJobListings
    ]);

    if (jobListings.length === 0 || userNotifications.length === 0) {
      return null;
    }

    const events = userNotifications.map((notification) => {
      return {
        name: 'app/email.daily-user-job-listings',
        user: {
          email: notification.user.email,
          name: notification.user.name
        },
        data: {
          aiPrompt: notification.aiPrompt ?? undefined,
          jobListings: jobListings.map((jobListing) => ({
            ...jobListing,
            organizationName: jobListing.organization.name
          }))
        }
      } as const satisfies GetEvents<
        typeof inngest
      >['app/email.daily-user-job-listings'];
    });

    await step.sendEvent('send-emails', events);
  }
);

export const sendDailyUserJobListingNotifications = inngest.createFunction(
  {
    id: 'send-daily-user-job-listing-email',
    name: 'Send Daily User Job Listing Email',
    throttle: {
      limit: 10,
      period: '1m'
    }
  },
  {
    event: 'app/email.daily-user-job-listings'
  },
  async ({ event, step }) => {
    const { jobListings, aiPrompt } = event.data;
    const user = event.user;

    if (jobListings.length === 0) {
      return;
    }

    let matchJobListings: typeof jobListings = [];

    if (!aiPrompt || aiPrompt.trim() === '') {
      matchJobListings = jobListings;
    } else {
      const matchingIds = await getMatchingJobListings(aiPrompt, jobListings);
      matchJobListings = jobListings.filter((job) =>
        matchingIds.includes(job.id)
      );
    }

    if (matchJobListings.length === 0) {
      return;
    }

    await step.run('send-email', async () => {
      await resend.emails.send({
        from: 'JobPilot <admin@jobpilot.dev>',
        to: user.email,
        subject: 'Your Daily Job Listings',
        react: DailyJobListingEmail({
          userName: user.name,
          jobListings: matchJobListings,
          serverUrl: env.SERVER_URL
        })
      });
    });
  }
);
