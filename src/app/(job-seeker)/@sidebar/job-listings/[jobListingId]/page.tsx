import { JobBoardSidebar } from '../../../_shared/JobBoardSidebar';

export default function JobListingPage({
  params,
  searchParams
}: {
  params: { jobListingId: string };
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  return <JobBoardSidebar />;
}
