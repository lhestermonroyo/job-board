import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { db } from '@/drizzle/db';
import {
  experienceLevels,
  JobListingTable,
  jobListingTypes,
  locationRequirements,
  OrganizationTable
} from '@/drizzle/schema';
import { convertSearchParamsToString } from '@/lib/convertSearchParamsToString';
import { cn } from '@/lib/utils';
import { and, desc, eq, ilike, or, SQL } from 'drizzle-orm';
import Link from 'next/link';
import { Suspense } from 'react';
import { differenceInDays } from 'date-fns';
import { connection } from 'next/server';
import { Badge } from '@/components/ui/badge';
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges';
import { z } from 'zod';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getJobListingGlobalTag } from '@/features/jobListings/db/cache/jobListings';
import { getOrganizationIdTag } from '@/features/organizations/db/cache/organization';

type Props = {
  searchParams: Promise<Record<string, string | string[]>>;
  params?: Promise<{ jobListingId: string }>;
};

const searchParamsSchema = z.object({
  title: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  state: z.string().optional().catch(undefined),
  experience: z.enum(experienceLevels).optional().catch(undefined),
  type: z.enum(jobListingTypes).optional().catch(undefined),
  locationRequirement: z.enum(locationRequirements).optional().catch(undefined),
  jobIds: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional()
    .catch([])
});

export default function JobListingItems(props: Props) {
  return (
    <Suspense>
      <SuspenseComponent {...props} />
    </Suspense>
  );
}

async function SuspenseComponent({ searchParams, params }: Props) {
  const jobListingId = params ? (await params).jobListingId : undefined;

  const { success, data } = searchParamsSchema.safeParse(await searchParams);
  const search = success ? data : {};

  const jobListings = await getJobListings(await searchParams, jobListingId);

  if (!jobListings.length) {
    return (
      <div className="text-muted-foreground p-4">No job listings found.</div>
    );
  }

  return (
    <div className="space-y-4">
      {jobListings.map((job) => (
        <Link
          className="block"
          href={`/job-listings/${job.id}?${convertSearchParamsToString(
            search
          )}`}
          key={job.id}
        >
          <JobListingListItem
            jobListing={job}
            organization={job.organization}
            isActive={job.id === jobListingId}
          />
        </Link>
      ))}
    </div>
  );
}

function JobListingListItem({
  jobListing,
  organization,
  isActive = false
}: {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | 'title'
    | 'wage'
    | 'wageInterval'
    | 'city'
    | 'stateAbbreviation'
    | 'type'
    | 'experienceLevel'
    | 'locationRequirement'
    | 'isFeatured'
    | 'postedAt'
  >;
  organization: Pick<
    typeof OrganizationTable.$inferSelect,
    'name' | 'imageUrl'
  >;
  isActive?: boolean;
}) {
  const orgInitials = organization.name
    .split(' ')
    .splice(0, 4)
    .map((word) => word[0])
    .join('');

  return (
    <Card
      className={cn(
        '@container',
        jobListing?.isFeatured && 'border-featured bg-featured/20',
        isActive && 'border-primary bg-primary/10'
      )}
    >
      <CardHeader>
        <div className="flex gap-4">
          <Avatar className="size-14 @max-sm:hidden">
            <AvatarImage
              alt={organization.name}
              src={organization.imageUrl ?? undefined}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {orgInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">{jobListing.title}</CardTitle>
            <CardDescription className="text-sm">
              {organization.name}
            </CardDescription>
            {jobListing.postedAt && (
              <div className="text-sm font-medium text-primary @min-md:hidden">
                <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                  <DaysSincePosted postedAt={jobListing.postedAt} />
                </Suspense>
              </div>
            )}
          </div>
          {jobListing.postedAt && (
            <div className="text-sm font-medium text-primary ml-auto @max-md:hidden">
              <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                <DaysSincePosted postedAt={jobListing.postedAt} />
              </Suspense>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <JobListingBadges
          jobListing={jobListing}
          className={jobListing.isFeatured ? 'border-primary/35' : undefined}
        />
      </CardContent>
    </Card>
  );
}

async function DaysSincePosted({ postedAt }: { postedAt: Date }) {
  await connection();
  const daysSincePosted = differenceInDays(postedAt, Date.now());

  if (daysSincePosted === 0) {
    return <Badge>New</Badge>;
  }

  return new Intl.RelativeTimeFormat(undefined, {
    style: 'narrow',
    numeric: 'always'
  }).format(daysSincePosted, 'days');
}

async function getJobListings(
  searchParams: z.infer<typeof searchParamsSchema>,
  jobListingId?: string | undefined
) {
  'use cache';
  cacheTag(getJobListingGlobalTag());

  const whereConditions: (SQL | undefined)[] = [];

  if (searchParams.title) {
    whereConditions.push(
      ilike(JobListingTable.title, `%${searchParams.title}%`)
    );
  }

  if (searchParams.locationRequirement) {
    whereConditions.push(
      eq(JobListingTable.locationRequirement, searchParams.locationRequirement)
    );
  }

  if (searchParams.city) {
    whereConditions.push(ilike(JobListingTable.city, `%${searchParams.city}%`));
  }

  if (searchParams.state) {
    whereConditions.push(
      eq(JobListingTable.stateAbbreviation, searchParams.state)
    );
  }

  if (searchParams.experience) {
    whereConditions.push(
      eq(JobListingTable.experienceLevel, searchParams.experience)
    );
  }

  if (searchParams.type) {
    whereConditions.push(eq(JobListingTable.type, searchParams.type));
  }

  if (searchParams.jobIds) {
    const jobIds = Array.isArray(searchParams.jobIds)
      ? searchParams.jobIds
      : [searchParams.jobIds];

    whereConditions.push(
      or(...jobIds.map((jobId) => eq(JobListingTable.id, jobId)))
    );
  }

  const jobListings = await db.query.JobListingTable.findMany({
    where: or(
      jobListingId
        ? and(
            eq(JobListingTable.status, 'published'),
            eq(JobListingTable.id, jobListingId)
          )
        : undefined,
      and(eq(JobListingTable.status, 'published'), ...whereConditions)
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true
        }
      }
    },
    orderBy: [desc(JobListingTable.isFeatured), desc(JobListingTable.postedAt)]
  });

  jobListings.forEach((job) => {
    cacheTag(getOrganizationIdTag(job.organization.id));
  });

  return jobListings;
}
