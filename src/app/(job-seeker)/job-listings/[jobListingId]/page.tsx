import { Fragment, Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { differenceInDays } from 'date-fns';
import { and, eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getJobListingIdTag } from '@/features/jobListings/db/cache/jobListings';
import { getUserResumeIdTag } from '@/features/users/db/cache/userResumes';
import { getJobListingApplicationIdTag } from '@/features/jobListingApplications/db/cache/jobListingApplications';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import ClientSheet from './_ClientSheet';
import {
  JobListingApplicationTable,
  JobListingTable,
  UserResumeTable
} from '@/drizzle/schema';
import { getOrganizationIdTag } from '@/features/organizations/db/cache/organization';
import { convertSearchParamsToString } from '@/lib/convertSearchParamsToString';
import { XIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { SignUpButton } from '@/services/clerk/components/AuthButtons';
import { IsBreakpoint } from '@/components/IsBreakpoint';
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges';
import JobListingItems from '../../_shared/JobListingItems';
import LoadingSpinner from '@/components/LoadingSpinner';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import NewApplicationForm from '@/features/jobListingApplications/components/NewApplicationForm';

export default function JobListingPage({
  params,
  searchParams
}: {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  return (
    <Fragment>
      <ResizablePanelGroup autoSaveId="job-board-panel" direction="horizontal">
        <ResizablePanel id="left" order={1} defaultSize={60} minSize={30}>
          <div className="p-4 h-screen overflow-y-auto">
            <JobListingItems searchParams={searchParams} params={params} />
          </div>
        </ResizablePanel>
        <IsBreakpoint
          breakpoint="min-width: 1024px"
          otherwise={
            <ClientSheet>
              <SheetContent hideCloseButton className="p-4 overflow-y-auto">
                <SheetHeader className="sr-only">
                  <SheetTitle>Job Listing Details</SheetTitle>
                </SheetHeader>
                <Suspense fallback={<LoadingSpinner />}>
                  <JobListingDetails
                    params={params}
                    searchParams={searchParams}
                  />
                </Suspense>
              </SheetContent>
            </ClientSheet>
          }
        >
          <ResizableHandle withHandle className="mx-2" />
          <ResizablePanel id="right" order={2} defaultSize={40} minSize={30}>
            <div className="p-4 h-screen overflow-y-auto">
              <Suspense fallback={<LoadingSpinner />}>
                <JobListingDetails
                  params={params}
                  searchParams={searchParams}
                />
              </Suspense>
            </div>
          </ResizablePanel>
        </IsBreakpoint>
      </ResizablePanelGroup>
    </Fragment>
  );
}

async function JobListingDetails({
  params,
  searchParams
}: {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const { jobListingId } = await params;

  const jobListing = await getJobListing(jobListingId);

  if (!jobListing) {
    return notFound();
  }

  const orgInitials = jobListing.organization.name
    .split(' ')
    .splice(0, 4)
    .map((word) => word[0])
    .join('');

  return (
    <div className="space-y-6 @container">
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <Avatar className="size-14 @max-sm:hidden">
            <AvatarImage
              alt={jobListing.organization.name}
              src={jobListing.organization.imageUrl ?? undefined}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {orgInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {jobListing.title}
            </h1>
            <div className="text-sm text-muted-foreground">
              {jobListing.organization.name}
            </div>
            {jobListing.postedAt && (
              <div className="text-sm text-muted-foreground @min-lg:hidden">
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-4">
            {jobListing.postedAt && (
              <div className="text-sm text-muted-foreground @max-lg:hidden">
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
            <Button size="icon" variant="outline" asChild>
              <Link
                href={`/${convertSearchParamsToString(await searchParams)}`}
              >
                <span className="sr-only">Close</span>
                <XIcon />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <JobListingBadges jobListing={jobListing} />
        </div>
        <Suspense fallback={<Button disabled>Apply</Button>}>
          <ApplyButton jobListingId={jobListing.id} />
        </Suspense>
      </div>

      <MarkdownRenderer source={jobListing.description} />
    </div>
  );
}

async function ApplyButton({ jobListingId }: { jobListingId: string }) {
  const { userId } = await getCurrentUser();

  if (!userId) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply</Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          You need to create an account before applying to this job.
          <SignUpButton />
        </PopoverContent>
      </Popover>
    );
  }

  const application = await getJobListingApplication({
    jobListingId,
    userId
  });

  if (application) {
    const formatter = new Intl.RelativeTimeFormat(undefined, {
      style: 'short',
      numeric: 'always'
    });

    const difference = differenceInDays(application.createdAt, new Date());

    return (
      <div className="text-muted-foreground text-sm">
        You applied for this job{' '}
        {difference === 0 ? 'today' : formatter.format(difference, 'day')}.
      </div>
    );
  }

  const userResume = await getUserResume(userId);

  if (!userResume) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply</Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          You need to upload a resume before applying to this job.
          <Button asChild>
            <Link href="/user-settings/resume">Upload Resume</Link>
          </Button>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Apply</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-3xl max-h[calc(100%-3rem)] overflow-hidden flex flex-col">
        <DialogTitle>Application</DialogTitle>
        <DialogDescription>
          Applying for this job cannot be undone and is something you can only
          do once.
        </DialogDescription>
        <div className="flex-1 overflow-y-auto">
          <NewApplicationForm jobListingId={jobListingId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function getUserResume(userId: string) {
  'use cache';
  cacheTag(getUserResumeIdTag(userId));

  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId)
  });
}

async function getJobListingApplication({
  jobListingId,
  userId
}: {
  jobListingId: string;
  userId: string;
}) {
  'use cache';
  cacheTag(
    getJobListingApplicationIdTag({
      jobListingId,
      userId
    })
  );

  return await db.query.JobListingApplicationTable.findFirst({
    where: and(
      eq(JobListingApplicationTable.jobListingId, jobListingId),
      eq(JobListingApplicationTable.userId, userId)
    )
  });
}

async function getJobListing(id: string) {
  'use cache';
  cacheTag(getJobListingIdTag(id));

  const jobListing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, 'published')
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true
        }
      }
    }
  });

  if (jobListing) {
    cacheTag(getOrganizationIdTag(jobListing.organization.id));
  }

  return jobListing;
}
