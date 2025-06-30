import { Fragment, Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { db } from '@/drizzle/db';
import { and, eq } from 'drizzle-orm';
import { JobListingStatus, JobListingTable } from '@/drizzle/schema';
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth';
import { getJobListingIdTag } from '@/features/jobListings/db/cache/jobListings';
import { formatJobListingStatus } from '@/features/jobListings/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges';
import { MarkdownPartial } from '@/components/markdown/MarkdownPartial';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import { hasOrgUserPermission } from '@/services/clerk/lib/orgUserPermissions';
import { AsyncIf } from '@/components/AsyncIf';
import { getNextJobListingStatus } from '@/features/jobListings/lib/utils';
import { hasPlanFeature } from '@/services/clerk/lib/planFeatures';
import { hasReachedMaxFeaturedJobListings } from '@/features/jobListings/lib/planFeatureHelpers';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

type Props = {
  params: Promise<{ jobListingId: string }>;
};

export default function JobListingPage(props: Props) {
  return (
    <Suspense>
      <SuspensePage {...props} />
    </Suspense>
  );
}

async function SuspensePage({ params }: Props) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) {
    return null;
  }

  const { jobListingId } = await params;
  const jobListing = await getJobListing(jobListingId, orgId);

  if (!jobListing) {
    return notFound(); // Handle case where job listing is not found
  }

  return (
    <div className="space-y-6 max-w-6xl max-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {jobListing.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
            <JobListingBadges jobListing={jobListing} />
          </div>
        </div>
        <div className="flex items-center gap-2 empty:-mt-4">
          <AsyncIf
            condition={() => hasOrgUserPermission('org:job_listings:update')}
          >
            <Button asChild variant="outline">
              <Link href={`/employer/job-listings/${jobListing.id}/edit`}>
                <EditIcon />
                Edit
              </Link>
            </Button>
          </AsyncIf>
          <StatusUpdateButton status={jobListing.status} />
        </div>
      </div>

      <MarkdownPartial
        dialogTitle="Description"
        dialogMarkdown={
          <MarkdownRenderer
            className="prose-sm"
            source={jobListing.description}
          />
        }
        mainMarkdown={
          <MarkdownRenderer
            className="prose-sm"
            source={jobListing.description}
          />
        }
      />
    </div>
  );
}

function StatusUpdateButton({ status }: { status: JobListingStatus }) {
  const button = <Button variant="outline">Toggle</Button>;

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission('org:job_listings:change_status')}
    >
      {getNextJobListingStatus(status) === 'published' ? (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxFeaturedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {statusToggleButtonText(status)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-2">
                You mush upgrade your plan to publish more job listings.
                <Button asChild>
                  <Link href="/employer/pricing">Upgrade Plan</Link>
                </Button>
              </PopoverContent>
            </Popover>
          }
        >
          {button}
        </AsyncIf>
      ) : (
        button
      )}
    </AsyncIf>
  );
}

function statusToggleButtonText(status: JobListingStatus) {
  switch (status) {
    case 'draft':
    case 'delisted':
      return (
        <Fragment>
          <EyeIcon /> Publish
        </Fragment>
      );
    case 'published':
      return (
        <Fragment>
          <EyeOffIcon /> Delist
        </Fragment>
      );
    default:
      throw new Error(`Invalid job listing status: ${status satisfies never}`);
  }
}

async function getJobListing(id: string, orgId: string) {
  'use cache';
  cacheTag(getJobListingIdTag(id));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId)
    )
  });
}
