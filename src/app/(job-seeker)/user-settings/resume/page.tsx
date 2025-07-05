import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Suspense } from 'react';
import { DropzoneClient } from './_DropzoneClient';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getUserResumeIdTag } from '@/features/users/db/cache/userResumes';
import { db } from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import { UserResumeTable } from '@/drizzle/schema';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

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

async function ResumeDetails() {
  const { userId } = await getCurrentUser();

  if (!userId) {
    return notFound();
  }

  const userResume = await getUserResume(userId);

  if (!userResume) {
    return (
      <div className="text-center text-muted-foreground">
        No resume uploaded yet. Please upload your resume.
      </div>
    );
  }

  return (
    <CardFooter>
      <Button asChild>
        <Link
          href={userResume.resumeFileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Resume
        </Link>
      </Button>
    </CardFooter>
  );
}

async function AISummary() {
  const { userId } = await getCurrentUser();

  if (!userId) {
    return notFound();
  }

  const userResume = await getUserResume(userId);

  if (!userResume || !userResume.aiSummary) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>AI Summary</CardTitle>
        <CardDescription>
          This is the AI-generated summary of your resume. This is used by
          employers to quickly understand your qualifications and skills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MarkdownRenderer source={userResume.aiSummary} />
      </CardContent>
    </Card>
  );
}

async function getUserResume(userId: string) {
  'use cache';
  cacheTag(getUserResumeIdTag(userId));

  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId)
  });
}
