import { Fragment } from 'react';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth';
import { AsyncIf } from '@/components/AsyncIf';
import LoadingSwap from '@/components/LoadingSwap';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { JobListingAISearchForm } from '@/features/jobListings/components/JobListingAISearchForm';

export default function AISearchPage() {
  return (
    <div className="p-4 flex items-center justify-center min-h-full">
      <Card className="max-w-4xl">
        <AsyncIf
          condition={async () => {
            const { userId } = await getCurrentUser();

            return !!userId;
          }}
          loadingFallback={
            <LoadingSwap isLoading>
              <AICard />
            </LoadingSwap>
          }
          otherwise={<NoPermissions />}
        >
          <AICard />
        </AsyncIf>
      </Card>
    </div>
  );
}

function AICard() {
  return (
    <Fragment>
      <CardHeader>
        <CardTitle>AI Search</CardTitle>
        <CardDescription>
          This can take a few minutes to process, please be patient.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <JobListingAISearchForm />
      </CardContent>
    </Fragment>
  );
}

function NoPermissions() {
  return (
    <CardContent className="text-center">
      <h2 className="text-xl font-bold mb-1">Permission Denied</h2>
      <p className="text-muted-foreground mb-4">
        You need to be logged in to use the AI Search feature.
      </p>
    </CardContent>
  );
}
