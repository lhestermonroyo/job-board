import { Card, CardContent } from '@/components/ui/card';
import { Suspense } from 'react';
import { DropzoneClient } from './_DropzoneClient';

export default function UserResumePage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold">Upload Your Resume</h1>
      <Card>
        <CardContent>
          <DropzoneClient />
        </CardContent>
        <Suspense>
          <ResumeDetails />
        </Suspense>
      </Card>
      <Suspense>
        <AISummary />
      </Suspense>
    </div>
  );
}

export function ResumeDetails() {
  return null;
}

export function AISummary() {
  return null;
}
