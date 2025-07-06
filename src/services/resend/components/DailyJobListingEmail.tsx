import { JobListingTable } from '@/drizzle/schema';
import { Tailwind } from '@react-email/tailwind';
import tailwindConfig from '../data/tailwindConfig';
import {
  Html,
  Head,
  Container,
  Heading,
  Text,
  Section,
  Button
} from '@react-email/components';
import {
  formatExperienceLevel,
  formatJobType,
  formatLocation,
  formatLocationRequirement,
  formatWage
} from '@/features/jobListings/lib/formatters';

type JobListing = Pick<
  typeof JobListingTable.$inferSelect,
  | 'id'
  | 'title'
  | 'city'
  | 'stateAbbreviation'
  | 'type'
  | 'experienceLevel'
  | 'wage'
  | 'wageInterval'
  | 'locationRequirement'
> & {
  organizationName: string;
};

export default function DailyJobListingEmail({
  userName,
  jobListings,
  serverUrl
}: {
  userName: string;
  jobListings: JobListing[];
  serverUrl: string;
}) {
  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Head />
        <Container className="font-sans">
          <Heading as="h1">New Job Listings!</Heading>
          <Text>
            Hi {userName}! Here are all the new job listings that meet your
            criteria:
          </Text>
          <Section>
            {jobListings.map((job) => (
              <div
                key={job.id}
                className="text-card-foreground rounded-lg bg-card border p-4 border-primary border-solid mb-6"
              >
                <Text className="leading-none font-semibold text-xl my-0">
                  {job.title}
                </Text>
                <Text className="text-muted-foreground text-sm mb-2 mt-0">
                  {job.organizationName}
                </Text>
                <div className="mb-5">
                  {getBadges(job).map((badge, index) => (
                    <div
                      key={index}
                      className="inline-block rounded-md border-solid border font-medium w-fit text-foreground text-sm px-3 py-1 mb-1 mr-1"
                    >
                      {badge}
                    </div>
                  ))}
                </div>
                <Button
                  href={`${serverUrl}/job-listings/${job.id}`}
                  className="rounded-md text-sm font-medium focus-visible:border-ring bg-primary text-primary-foreground px-4 py-2"
                >
                  View Job Details
                </Button>
              </div>
            ))}
          </Section>
        </Container>
      </Html>
    </Tailwind>
  );
}

function getBadges(jobListing: JobListing) {
  const badges = [
    formatLocationRequirement(jobListing.locationRequirement),
    formatJobType(jobListing.type),
    formatExperienceLevel(jobListing.experienceLevel)
  ];

  if (jobListing.city || jobListing.stateAbbreviation) {
    badges.unshift(
      formatLocation(jobListing.city, jobListing.stateAbbreviation)
    );
  }

  if (jobListing.wage && jobListing.wageInterval) {
    badges.unshift(formatWage(jobListing.wage, jobListing.wageInterval));
  }

  return badges;
}

DailyJobListingEmail.PreviewProps = {
  jobListings: [
    {
      id: '1',
      title: 'Software Engineer',
      city: 'San Francisco',
      stateAbbreviation: 'CA',
      type: 'full-time',
      experienceLevel: 'mid-level',
      wage: 120000,
      wageInterval: 'yearly',
      locationRequirement: 'onsite',
      organizationName: 'Tech Corp'
    },
    {
      id: '2',
      title: 'Product Manager',
      city: 'New York',
      stateAbbreviation: 'NY',
      type: 'contract',
      experienceLevel: 'senior',
      wage: 150000,
      wageInterval: 'yearly',
      locationRequirement: 'remote',
      organizationName: 'Business Solutions'
    }
  ],
  userName: 'John Doe',
  serverUrl: 'http://localhost:3000'
} satisfies Parameters<typeof DailyJobListingEmail>[0];
