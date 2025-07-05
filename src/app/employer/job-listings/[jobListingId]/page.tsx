import { Fragment, ReactNode, Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { db } from '@/drizzle/db';
import { and, eq } from 'drizzle-orm';
import { JobListingStatus, JobListingTable } from '@/drizzle/schema';
import { hasOrgUserPermission } from '@/services/clerk/lib/orgUserPermissions';
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth';
import { getJobListingIdTag } from '@/features/jobListings/db/cache/jobListings';
import { formatJobListingStatus } from '@/features/jobListings/lib/formatters';
import { getNextJobListingStatus } from '@/features/jobListings/lib/utils';
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings
} from '@/features/jobListings/lib/planFeatureHelpers';
import {
  deleteJobListing,
  toggleJobListingFeatured,
  toggleJobListingStatus
} from '@/features/jobListings/actions/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  StarIcon,
  StarOffIcon,
  Trash2Icon
} from 'lucide-react';
import { MarkdownPartial } from '@/components/markdown/MarkdownPartial';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { AsyncIf } from '@/components/AsyncIf';
import { ActionButton } from '@/components/ActionButton';
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges';

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
    <div className="space-y-6 max-w-6xl items-center mx-auto p-4 @container">
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
          <StatusUpdateButton status={jobListing.status} id={jobListing.id} />
          {jobListing.status === 'published' && (
            <FeaturedToggleButton
              isFeatured={!!jobListing.isFeatured}
              id={jobListing.id}
            />
          )}
          <AsyncIf
            condition={() => hasOrgUserPermission('org:job_listings:delete')}
          >
            <ActionButton
              variant="destructive"
              action={deleteJobListing.bind(null, jobListing.id)}
              requiredConfirm
            >
              <Trash2Icon />
              Delete
            </ActionButton>
          </AsyncIf>
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

function StatusUpdateButton({
  status,
  id
}: {
  status: JobListingStatus;
  id: string;
}) {
  const button = (
    <ActionButton
      action={toggleJobListingStatus.bind(null, id)}
      variant="outline"
      requiredConfirm={getNextJobListingStatus(status) === 'published'}
      confirmDescription="This will immediately show this job listing to all users."
    >
      {statusToggleButtonText(status)}
    </ActionButton>
  );

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission('org:job_listings:change_status')}
    >
      {getNextJobListingStatus(status) === 'published' ? (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxPublishedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={statusToggleButtonText(status)}
              popoverText="You mush upgrade your plan to publish more job listings."
            />
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

function FeaturedToggleButton({
  isFeatured,
  id
}: {
  isFeatured: boolean;
  id: string;
}) {
  const button = (
    <ActionButton
      action={toggleJobListingFeatured.bind(null, id)}
      variant="outline"
      confirmDescription="This will immediately show this job listing to all users."
    >
      {featuredToggleButtonText(isFeatured)}
    </ActionButton>
  );

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission('org:job_listings:change_status')}
    >
      {isFeatured ? (
        button
      ) : (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxFeaturedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={featuredToggleButtonText(isFeatured)}
              popoverText="You mush upgrade your plan to feature more job listings."
            />
          }
        >
          {button}
        </AsyncIf>
      )}
    </AsyncIf>
  );
}

function UpgradePopover({
  buttonText,
  popoverText
}: {
  buttonText: ReactNode;
  popoverText: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{buttonText}</Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        {popoverText}
        <Button asChild>
          <Link href="/employer/pricing">Upgrade Plan</Link>
        </Button>
      </PopoverContent>
    </Popover>
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

function featuredToggleButtonText(isFeatured: Boolean) {
  if (isFeatured) {
    return (
      <Fragment>
        <StarOffIcon /> Unfeature
      </Fragment>
    );
  }

  return (
    <Fragment>
      <StarIcon /> Feature
    </Fragment>
  );
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
