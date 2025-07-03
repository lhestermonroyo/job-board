'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { JobListingStatus, JobListingTable } from '@/drizzle/schema';
import { formatJobListingStatus } from '@/features/jobListings/lib/formatters';
import { ChevronRightIcon } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';

type JobListing = Pick<typeof JobListingTable.$inferSelect, 'id' | 'title'> & {
  applicationCount: number;
};

export function JobListingMenuGroup({
  status,
  jobListings
}: {
  status: JobListingStatus;
  jobListings: JobListing[];
}) {
  const { jobListingId } = useParams<{ jobListingId: string }>();

  return (
    <SidebarMenu>
      <Collapsible
        defaultOpen={
          status !== 'delisted' ||
          jobListings.find((job) => job.id === jobListingId) !== null
        }
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              {formatJobListingStatus(status)}
              <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {jobListings.map((job) => (
                <JobListingMenuItem key={job.id} {...job} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
}

function JobListingMenuItem({ id, title, applicationCount }: JobListing) {
  const { jobListingId } = useParams<{ jobListingId: string }>();

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton isActive={jobListingId === id} asChild>
        <Link href={`/employer/job-listings/${id}`}>
          <span className="truncate">{title}</span>
        </Link>
      </SidebarMenuSubButton>
      {applicationCount > 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {applicationCount}
        </div>
      )}
    </SidebarMenuSubItem>
  );
}
