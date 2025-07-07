import { JobListingApplicationTable } from '@/drizzle/schema';
import { Tailwind } from '@react-email/tailwind';
import tailwindConfig from '../data/tailwindConfig';
import {
  Html,
  Head,
  Container,
  Heading,
  Text,
  Section
} from '@react-email/components';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type Application = Pick<
  typeof JobListingApplicationTable.$inferSelect,
  'rating'
> & {
  userName: string;
  organizationId: string;
  organizationName: string;
  jobListingId: string;
  jobListingTitle: string;
};

export default function DailyApplicationEmail({
  userName,
  applications
}: {
  userName: string;
  applications: Application[];
}) {
  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Head />
        <Container className="font-sans">
          <Heading as="h1">New Applications!</Heading>
          <Text>
            Hi {userName}! Here are all the new applications for your job
            listings:
          </Text>
          {Object.entries(
            Object.groupBy(applications, (a) => a.organizationId)
          ).map(([orgId, orgApplications], index) => {
            if (!orgApplications || orgApplications.length === 0) {
              return null;
            }

            return (
              <OrganizationSection
                key={orgId}
                orgName={orgApplications[0].organizationName}
                applications={orgApplications}
                noMargin={index === 0}
              />
            );
          })}
        </Container>
      </Html>
    </Tailwind>
  );
}

function OrganizationSection({
  orgName,
  applications,
  noMargin = false
}: {
  orgName: string;
  applications: Application[];
  noMargin?: boolean;
}) {
  return (
    <Section className={noMargin ? undefined : 'mt-8'}>
      <Heading as="h2" className="leading-none font-semibold text-3xl my-4">
        {orgName}
      </Heading>
      {Object.entries(Object.groupBy(applications, (a) => a.jobListingId)).map(
        ([jobListingId, listingApplications], index) => {
          if (!listingApplications || listingApplications.length === 0) {
            return null;
          }

          return (
            <JobListingCard
              key={jobListingId}
              jobListingTitle={listingApplications[0].jobListingTitle}
              applications={listingApplications}
              noMargin={index === 0}
            />
          );
        }
      )}
    </Section>
  );
}

function JobListingCard({
  jobListingTitle,
  applications,
  noMargin = false
}: {
  jobListingTitle: string;
  applications: Application[];
  noMargin?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-lg border p-4 border-primary border-solid',
        !noMargin && 'mt-6'
      )}
    >
      <Heading as="h3" className="leading-none font-semibold text-xl mt-0 mb-3">
        {jobListingTitle}
      </Heading>
      {applications.map((application, i) => (
        <Text key={i} className="mt-2 mb-0">
          <span>{application.userName}: </span>
          <RatingIcons rating={application.rating} />
        </Text>
      ))}
    </div>
  );
}

function RatingIcons({ rating }: { rating: number | null }) {
  if (rating == null || rating < 1 || rating > 5) {
    return 'Unrated';
  }

  const stars: ReactNode[] = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className="w-3 -mb-[7px] mr-0.5">
        {rating >= i ? '★' : '☆'}
      </span>
    );
  }

  return stars;
}

DailyApplicationEmail.PreviewProps = {
  applications: [
    {
      rating: 4,
      userName: 'Jane Smith',
      organizationId: 'org_123',
      organizationName: 'Tech Corp',
      jobListingId: 'job_456',
      jobListingTitle: 'Software Engineer'
    },
    {
      rating: 5,
      userName: 'Alice Johnson',
      organizationId: 'org_123',
      organizationName: 'Tech Corp',
      jobListingId: 'job_456',
      jobListingTitle: 'Software Engineer'
    },
    {
      rating: 3,
      userName: 'Bob Brown',
      organizationId: 'org_789',
      organizationName: 'Design Studio',
      jobListingId: 'job_101',
      jobListingTitle: 'UI/UX Designer'
    }
  ],
  userName: 'John Doe'
} satisfies Parameters<typeof DailyApplicationEmail>[0];
